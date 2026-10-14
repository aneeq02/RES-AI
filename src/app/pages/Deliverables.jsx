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
      <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.035em] md:text-6xl"><span className="hl">Deliverables</span></h1>
      {agents.length > 1 && (
        <div role="group" aria-label="Filter by agent" className="mt-6 flex flex-wrap gap-2">
          {["all", ...agents].map((a) => (
            <button key={a} type="button" aria-pressed={agent === a} onClick={() => setAgent(a)}
              className={`min-h-11 rounded-full border px-4 text-sm ${agent === a ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong text-muted hover:text-ink"}`}>
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
        <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3">
          {visible.map((d) => (
            <li key={d.id}>
              <Link to={`/app/deliverables/${d.id}`} className="card card-hover flex min-h-16 items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-ink"><FileText size={18} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1 truncate font-display text-lg font-bold tracking-tight">{d.title}</span>
                {d.partial && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">Partial</span>}
                <span className="hidden font-mono text-xs text-subtle sm:inline">{getMember(d.agentId)?.name}</span>
                <span className="font-mono text-xs text-subtle">{formatDate(d.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
