import React from "react";
import { Coins } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function CreditsMeter({ credits }) {
  if (!credits) return null;
  const pct = Math.min(100, Math.round((credits.balance / Math.max(1, credits.allowance)) * 100));
  return (
    <div className="flex items-center gap-3 text-sm" aria-label={`${credits.balance} of ${credits.allowance} task credits left, resets ${formatDate(credits.resetsAt)}`}>
      <Coins size={16} className="text-brand-ink" aria-hidden="true" />
      <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:block" aria-hidden="true">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span><span className="font-bold text-white">{credits.balance}</span><span className="text-subtle"> / {credits.allowance} credits</span></span>
    </div>
  );
}
