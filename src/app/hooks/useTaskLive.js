import { useCallback, useEffect, useId, useState } from "react";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";

const ACTIVE = new Set(["queued", "running"]);

/** Task state plus its progress events; listens on Supabase Realtime while the task is active. */
export default function useTaskLive(taskId, initialTask) {
  const [state, setState] = useState({ task: initialTask, events: [], deliverable: null });
  const active = ACTIVE.has(state.task?.status);
  // realtime-js reuses a channel still in the list for the same topic, and removeChannel()
  // is async (it stays "leaving" until the server acks) — so a plain `task-${taskId}` topic
  // can collide across a StrictMode double effect, a quick unmount/remount, or two cards for
  // the same task. Scope the topic per hook instance so each gets its own channel.
  const instanceId = useId().replace(/:/g, "");

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
    if (!active || !supabase) return;
    const channel = supabase
      .channel(`task-${taskId}-${instanceId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "task_events", filter: `task_id=eq.${taskId}` }, () => refresh())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${taskId}` }, () => refresh())
      .subscribe();
    // Safety net if Realtime is unavailable: poll slowly.
    const poll = setInterval(() => refresh().catch(() => {}), 8000);
    return () => { clearInterval(poll); supabase.removeChannel(channel); };
  }, [active, taskId, refresh, instanceId]);

  return { ...state, refresh, setTask: (task) => setState((s) => ({ ...s, task })) };
}
