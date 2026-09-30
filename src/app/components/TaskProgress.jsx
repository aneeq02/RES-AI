import React from "react";
import { Globe, ListChecks, LoaderCircle, Search } from "lucide-react";

const ICON = { search: Search, fetch: Globe, step: ListChecks, note: ListChecks };

export default function TaskProgress({ task, events }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-bold" role="status">
        <LoaderCircle size={16} className="animate-spin text-brand-ink" aria-hidden="true" />
        {task.status === "queued" ? "Queued. Starting shortly…" : "Working…"}
      </p>
      <ol className="mt-3 max-h-56 space-y-1.5 overflow-y-auto text-sm text-muted" aria-live="polite">
        {events.map((e) => {
          const Icon = ICON[e.type] ?? ListChecks;
          return (
            <li key={e.id} className="flex items-start gap-2">
              <Icon size={14} className="mt-1 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">{e.text}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
