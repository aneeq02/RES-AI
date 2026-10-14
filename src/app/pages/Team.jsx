import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CircleCheck, Clock, Sparkles } from "lucide-react";
import AgentAvatar from "../../components/agents/AgentAvatar";
import { members } from "../../data/members";
import { useMe } from "../../context/MeContext";
import { api } from "../../lib/api";
import { hasActivePlan, subscriptionNeedsPayment } from "../../lib/subscription";
import PaymentIssueNotice from "../../components/billing/PaymentIssueNotice";

// Rollout order is alphabetical by agent name.
const ROLLOUT = [...members].sort((a, b) => a.name.localeCompare(b.name));

export default function Team() {
  const { me, refresh } = useMe();
  const [params, setParams] = useSearchParams();
  const [notice, setNotice] = useState(null);
  const synced = useRef(false);
  // Guards for the async sync below: don't touch state or the URL once this page is gone
  // or the URL has moved on. A mount-scoped ref (not a per-run flag) so StrictMode's effect
  // re-run, which the `synced` guard skips, doesn't cancel the one sync in flight.
  const mounted = useRef(false);
  const latestParams = useRef(params);
  const live = new Set((me?.agents ?? []).map((a) => a.id));
  const planActive = hasActivePlan(me);
  const needsPayment = subscriptionNeedsPayment(me);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => { latestParams.current = params; }, [params]);

  // Returning from Stripe Checkout: confirm the session so access doesn't wait on the webhook.
  useEffect(() => {
    const sessionId = params.get("session_id");
    if (params.get("checkout") !== "success" || !sessionId || synced.current) return;
    synced.current = true;
    (async () => {
      let ready = false;
      try {
        const res = await api("/billing/sync", { method: "POST", body: { sessionId } });
        if (res?.ok === true) ready = hasActivePlan(await refresh());
      } catch {
        // Fall through to the neutral message: the webhook will still activate the plan.
      }
      if (!mounted.current) return;
      setNotice(ready
        ? { tone: "success", text: "You're all set. Your team is ready to work." }
        : { tone: "pending", text: "Payment received, activating… This can take a minute; refresh shortly." });
      if (latestParams.current.get("session_id") === sessionId) setParams({}, { replace: true });
    })();
  }, [params, setParams, refresh]);

  return (
    <div>
      {notice?.tone === "success" && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-ok/10 px-4 py-3 text-sm text-ok">
          <CircleCheck size={18} aria-hidden="true" /> {notice.text}
        </p>
      )}
      {notice?.tone === "pending" && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
          <Clock size={18} aria-hidden="true" /> {notice.text}
        </p>
      )}
      {needsPayment && <PaymentIssueNotice className="mb-8" />}
      {!planActive && !needsPayment && (
        <div className="card mb-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold">Choose a plan to put your team to work</p>
            <p className="mt-1 text-sm text-muted">Every plan includes each specialist as they launch, monthly task credits and unlimited chat.</p>
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
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isLive ? "bg-ok/15 text-ok" : "bg-ink/5 text-subtle"}`}>
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
