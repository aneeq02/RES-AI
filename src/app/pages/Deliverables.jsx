import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { api } from "../../lib/api";
import { getMember } from "../../data/members";
import { formatDate } from "../components/CreditsMeter";

export default function Deliverables() {
  const [items, setItems] = useState(null);
  const [agent, setAgent] = useState("all");
  useEffect(() => { api("/deliverables").then((r) => setItems(r.deliverables)).catch(() => setItems([])); }, []);
  const agents = useMemo(() => [...new Set((items ?? []).map((d) => d.agentId))], [items]);
  const visible = (items ?? []).filter((d) => agent === "all" || d.agentId === agent);

  return (
    <div>
      <p className="eyebrow">Library</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Deliverables</h1>
      {agents.length > 1 && (
        <div role="group" aria-label="Filter by agent" className="mt-6 flex flex-wrap gap-2">
          {["all", ...agents].map((a) => (
            <button key={a} type="button" aria-pressed={agent === a} onClick={() => setAgent(a)}
              className={`min-h-11 rounded-full border px-4 text-sm ${agent === a ? "border-brand bg-brand/10 text-ink" : "border-line text-muted"}`}>
              {a === "all" ? "All" : getMember(a)?.name ?? a}
            </button>
          ))}
        </div>
      )}
      {items === null ? (
        <p className="mt-8 text-muted" role="status">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="card mt-8 p-8 text-center text-muted">
          No reports yet. <Link to="/app/agents/buddy" className="font-bold text-ink underline">Ask Buddy for one</Link>.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line">
          {visible.map((d) => (
            <li key={d.id}>
              <Link to={`/app/deliverables/${d.id}`} className="flex min-h-14 items-center gap-4 px-4 py-3 transition hover:bg-ink/5">
                <FileText size={18} className="shrink-0 text-brand-ink" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-bold">{d.title}</span>
                {d.partial && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">Partial</span>}
                <span className="hidden text-sm text-subtle sm:inline">{getMember(d.agentId)?.name}</span>
                <span className="text-sm text-subtle">{formatDate(d.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
