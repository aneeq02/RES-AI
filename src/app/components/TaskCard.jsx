import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert, FileText, Pencil, Play, RotateCcw } from "lucide-react";
import useTaskLive from "../hooks/useTaskLive";
import TaskProgress from "./TaskProgress";
import { formatDate } from "./CreditsMeter";
import { api } from "../../lib/api";
import { useMe } from "../../context/MeContext";
import { taskStartErrorMessage } from "../taskStartError";

export default function TaskCard({ initialTask, canStart, onRetried }) {
  const { me, refresh: refreshMe } = useMe();
  const { task, events, deliverable, refresh, setTask } = useTaskLive(initialTask.id, initialTask);
  const [editing, setEditing] = useState(false);
  const [brief, setBrief] = useState(initialTask.brief);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const balance = me?.credits?.balance ?? 0;
  const short = balance < task.credits;

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const { task: started } = await api(`/tasks/${task.id}/start`, { method: "POST", body: editing ? { brief } : {} });
      setTask(started);
      setEditing(false);
      refreshMe();
      refresh();
    } catch (e) {
      setError(taskStartErrorMessage(e));
      refreshMe();
      refresh().catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const retry = async () => {
    const { task: fresh } = await api(`/tasks/${task.id}/retry`, { method: "POST" });
    onRetried?.(fresh);
  };

  return (
    <div className="mt-3 rounded-2xl border border-line bg-black/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-bold">{task.label}</p>
        <p className="text-xs text-subtle">
          {task.credits} credit{task.credits === 1 ? "" : "s"}
          {task.etaMinutes ? ` · ~${task.etaMinutes[0]}–${task.etaMinutes[1]} min` : ""}
        </p>
      </div>

      {task.status === "proposed" && editing ? (
        <div className="mt-3 space-y-3">
          <label className="field-label" htmlFor={`sum-${task.id}`}>What to research</label>
          <input id={`sum-${task.id}`} className="field" value={brief.summary} onChange={(e) => setBrief((b) => ({ ...b, summary: e.target.value }))} />
          <label className="field-label" htmlFor={`det-${task.id}`}>Details</label>
          <textarea id={`det-${task.id}`} className="field" rows={3} value={brief.details} onChange={(e) => setBrief((b) => ({ ...b, details: e.target.value }))} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-300">{(editing ? brief : task.brief).summary}</p>
      )}

      {task.status === "proposed" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={start} disabled={busy || !canStart || short || !brief.summary.trim()} className="btn-primary min-h-11 px-5 py-2 text-sm">
            <Play size={16} aria-hidden="true" /> {short && me?.credits ? `Out of credits · resets ${formatDate(me.credits.resetsAt)}` : "Start"}
          </button>
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary min-h-11 px-5 py-2 text-sm">
              <Pencil size={16} aria-hidden="true" /> Edit brief
            </button>
          )}
        </div>
      )}

      {(task.status === "queued" || task.status === "running") && <div className="mt-4"><TaskProgress task={task} events={events} /></div>}

      {task.status === "done" && deliverable && (
        <Link to={`/app/deliverables/${deliverable.id}`} className="mt-4 flex items-center gap-3 rounded-xl border border-line p-3 text-sm transition hover:border-brand/50">
          <FileText size={18} className="text-brand-ink" aria-hidden="true" />
          <span className="font-bold">{deliverable.title}</span>
          {deliverable.partial && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">Partial</span>}
        </Link>
      )}

      {task.status === "failed" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <p className="flex items-center gap-2 text-red-300" role="alert"><CircleAlert size={16} aria-hidden="true" /> {task.error}</p>
          <button type="button" onClick={retry} className="btn-secondary min-h-11 px-4 py-2 text-sm"><RotateCcw size={16} aria-hidden="true" /> Retry</button>
        </div>
      )}

      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
