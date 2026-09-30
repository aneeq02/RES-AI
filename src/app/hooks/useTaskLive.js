import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";

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
    if (!active || !supabase) return;
    const channel = supabase
      .channel(`task-${taskId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "task_events", filter: `task_id=eq.${taskId}` }, () => refresh())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${taskId}` }, () => refresh())
      .subscribe();
    // Safety net if Realtime is unavailable: poll slowly.
    const poll = setInterval(() => refresh().catch(() => {}), 8000);
    return () => { clearInterval(poll); supabase.removeChannel(channel); };
  }, [active, taskId, refresh]);

  return { ...state, refresh, setTask: (task) => setState((s) => ({ ...s, task })) };
}
