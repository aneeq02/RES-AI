import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CircleCheck, Sparkles } from "lucide-react";
import AgentAvatar from "../../components/agents/AgentAvatar";
import { members } from "../../data/members";
import { hasActivePlan, useMe } from "../../context/MeContext";
import { api } from "../../lib/api";

// Rollout order is alphabetical by agent name.
const ROLLOUT = [...members].sort((a, b) => a.name.localeCompare(b.name));

export default function Team() {
  const { me, refresh } = useMe();
  const [params, setParams] = useSearchParams();
  const [notice, setNotice] = useState(null);
  const synced = useRef(false);
  const live = new Set((me?.agents ?? []).map((a) => a.id));
  const planActive = hasActivePlan(me);

  // Returning from Stripe Checkout: confirm the session so access doesn't wait on the webhook.
  useEffect(() => {
    const sessionId = params.get("session_id");
    if (params.get("checkout") !== "success" || !sessionId || synced.current) return;
    synced.current = true;
    api("/billing/sync", { method: "POST", body: { sessionId } })
      .then(() => refresh())
      .then(() => setNotice("You're all set. Your team is ready to work."))
      .catch(() => setNotice("Payment received. It can take a minute to activate; refresh shortly."))
      .finally(() => setParams({}, { replace: true }));
  }, [params, setParams, refresh]);

  return (
    <div>
      {notice && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          <CircleCheck size={18} aria-hidden="true" /> {notice}
        </p>
      )}
      {!planActive && (
        <div className="card mb-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold">Choose a plan to put your team to work</p>
            <p className="mt-1 text-sm text-muted">Every plan includes the full team, monthly task credits and unlimited chat.</p>
          </div>
          <Link to="/checkout" className="btn-primary shrink-0">Choose a plan <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      )}
      <p className="eyebrow">Your team</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Who should we put to work?</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ROLLOUT.map((m, i) => {
          const isLive = live.has(m.id);
          return (
            <li key={m.id} className={`card flex flex-col overflow-hidden ${isLive ? "" : "opacity-60"}`}>
              <AgentAvatar member={m} className="aspect-[4/3]" imgClassName="pt-4" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold">{m.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isLive ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-subtle"}`}>
                    {isLive ? "Available" : `Coming soon · #${i + 1}`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-brand-ink">{m.role}</p>
                {isLive ? (
                  <Link to={`/app/agents/${m.id}`} className="btn-light mt-auto min-h-11 pt-0 text-xs">
                    <Sparkles size={16} aria-hidden="true" /> Work with {m.name}
                  </Link>
                ) : (
                  <p className="mt-auto pt-4 text-xs text-subtle">Launching in order. {m.name} is next after the agents above.</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
