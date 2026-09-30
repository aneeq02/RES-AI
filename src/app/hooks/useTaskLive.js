import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getSupabase, supabaseConfigured } from "../../lib/supabase";

const ACTIVE = new Set(["queued", "running"]);

/** Task state plus its progress events; listens on Supabase Realtime while the task is active. */
export default function useTaskLive(taskId, initialTask) {
  const [state, setState] = useState({ task: initialTask, events: [], deliverable: null });
  const active = ACTIVE.has(state.task?.status);

  const refresh = useCallback(async () => {
    const data = await api(`/tasks/${taskId}`);
    setState(data);
    return data;
  }, [taskId]);

  useEffect(() => {
    if (initialTask?.status === "proposed") return;
    let cancelled = false;
    api(`/tasks/${taskId}`)
      .then((data) => { if (!cancelled) setState(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [taskId, initialTask?.status]);

  useEffect(() => {
    if (!active || !supabaseConfigured) return;
    // realtime-js reuses a channel still in its list for the same topic, and removeChannel()
    // is async (the channel stays "leaving" until the server acks). A topic stable across an
    // effect's cleanup + re-run — including useId(), which doesn't change within a mount — can
    // therefore collide with its own still-leaving predecessor under StrictMode's double-invoke,
    // a quick unmount/remount, or two cards for the same task. Generate a fresh random suffix on
    // every effect run so each subscribe always gets a brand-new topic.
    const topic = `task-${taskId}-${Math.random().toString(36).slice(2, 10)}`;
    // The client loads asynchronously; a run cleaned up before it arrives never subscribes.
    let cancelled = false;
    let supabase = null;
    let channel = null;
    getSupabase()
      .then((client) => {
        if (cancelled || !client) return;
        supabase = client;
        channel = client
          .channel(topic)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "task_events", filter: `task_id=eq.${taskId}` }, () => refresh().catch(() => {}))
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${taskId}` }, () => refresh().catch(() => {}))
          .subscribe();
      })
      .catch(() => {});
    // Safety net if Realtime is unavailable: poll slowly.
    const poll = setInterval(() => refresh().catch(() => {}), 8000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      if (channel) supabase.removeChannel(channel);
    };
  }, [active, taskId, refresh]);

  return { ...state, refresh, setTask: (task) => setState((s) => ({ ...s, task })) };
}
