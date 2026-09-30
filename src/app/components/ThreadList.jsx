import React from "react";
import { Plus } from "lucide-react";

export default function ThreadList({ threads, activeId, onSelect, onNew }) {
  return (
    <nav aria-label="Conversations" className="flex flex-col gap-1">
      <button type="button" onClick={onNew} className="btn-secondary mb-2 min-h-11 justify-start text-sm"><Plus size={16} aria-hidden="true" /> New chat</button>
      {threads.map((t) => (
        <button key={t.id} type="button" onClick={() => onSelect(t.id)} aria-current={t.id === activeId ? "true" : undefined}
          className={`min-h-11 truncate rounded-xl px-3 text-left text-sm transition ${t.id === activeId ? "bg-white/10 text-white" : "text-muted hover:bg-white/5 hover:text-white"}`}>
          {t.title}
        </button>
      ))}
    </nav>
  );
}
