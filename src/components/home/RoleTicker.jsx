import React from "react";
import { members } from "../../data/members";

// Endless strip of the team's roles. Decorative, so hidden from assistive tech;
// the same roles are listed in full on the Agents page.
export default function RoleTicker() {
  const roles = members.map((m) => m.role);
  const row = [...roles, ...roles];
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/60 py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        {row.map((role, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {role}
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
        ))}
      </div>
    </div>
  );
}
