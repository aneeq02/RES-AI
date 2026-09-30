import React, { useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Lock, LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";
import AgentAvatar from "../components/agents/AgentAvatar";
import { plans, getPlan, formatPrice, PLAN_FEATURES, creditsLine } from "../data/plans";
import { getMember } from "../data/members";
import { useAuth } from "../context/AuthContext";
import { useMe } from "../context/MeContext";
import { hasActivePlan, subscriptionNeedsPayment } from "../lib/subscription";
import PaymentIssueNotice from "../components/billing/PaymentIssueNotice";
import { api } from "../lib/api";

function PlanPicker({ value, onChange }) {
  return (
    <fieldset>
      <legend className="field-label">Plan</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {plans
          .slice()
          .sort((a, b) => a.months - b.months)
          .map((p) => {
            const checked = value === p.id;
            return (
              <label
                key={p.id}
                className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-ink ${
                  checked ? "border-brand bg-brand/10" : "border-line bg-black/40 hover:border-line-strong"
                }`}
              >
                <input type="radio" name="plan" value={p.id} checked={checked} onChange={() => onChange(p.id)} className="sr-only" />
                <span className="flex items-center justify-between text-sm font-bold">
                  {p.months} {p.months === 1 ? "month" : "months"}
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border ${checked ? "border-brand bg-brand" : "border-line-strong"}`}
                    aria-hidden="true"
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                </span>
                <span className="mt-2 font-display text-2xl font-bold">
                  {formatPrice(p.price)}
                  <span className="font-sans text-sm font-normal text-subtle">/mo</span>
                </span>
                {p.popular && <span className="mt-1 text-xs font-bold text-brand-ink">Best value</span>}
              </label>
            );
          })}
      </div>
    </fieldset>
  );
}

function Summary({ plan, agent }) {
  const total = plan.price * plan.months;
  return (
    <aside className="card h-fit p-6 md:p-8 lg:sticky lg:top-28" aria-label="Order summary">
      <h2 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-subtle">Order summary</h2>

      {agent && (
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line bg-black/40 p-3">
          <AgentAvatar member={agent} className="h-16 w-14 shrink-0 rounded-xl" />
          <div className="text-sm">
            <p className="font-bold">Starting with {agent.name}</p>
            <p className="text-subtle">{agent.role} · plus each specialist as they launch</p>
          </div>
        </div>
      )}

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">{plan.name}</dt>
          <dd>
            {formatPrice(plan.price)} × {plan.months}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Regular price</dt>
          <dd className="text-subtle line-through">{formatPrice(plan.listPrice * plan.months)}</dd>
        </div>
        <div className="flex justify-between text-emerald-300">
          <dt>You save</dt>
          <dd>{formatPrice((plan.listPrice - plan.price) * plan.months)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-bold">Due today</dt>
          <dd className="font-display text-3xl font-bold">{formatPrice(total)}</dd>
        </div>
      </dl>

      <ul className="mt-6 space-y-2 border-t border-line pt-6">
        {[creditsLine(plan), ...PLAN_FEATURES].map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
            <Check size={15} className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" /> {f}
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-center gap-2 text-xs text-subtle">
        <ShieldCheck size={16} className="text-emerald-400" aria-hidden="true" /> 14-day money-back guarantee
      </p>
    </aside>
  );
}

export default function Checkout() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const initial = getPlan(params.get("plan")) ? params.get("plan") : getPlan(state?.plan) ? state.plan : "12-month";
  const [planId, setPlanId] = useState(initial);
  const plan = getPlan(planId);
  const agent = getMember(state?.agent);
  const { session, loading } = useAuth();
  const { me, error: meError, refresh } = useMe();
  const [retrying, setRetrying] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | redirecting
  const here = `/checkout?plan=${planId}`;

  if (!loading && !session) return <Navigate to={`/signup?next=${encodeURIComponent(here)}`} replace />;
  if (me && !me.profile.onboardedAt) return <Navigate to={`/app/onboarding?next=${encodeURIComponent(here)}`} replace />;

  const pay = async (e) => {
    e.preventDefault();
    if (!terms) { setError("Please accept the terms to continue."); return; }
    setStatus("redirecting");
    setError(null);
    try {
      const { url } = await api("/billing/checkout", { method: "POST", body: { planId } });
      window.location.assign(url);
    } catch (err) {
      setStatus("idle");
      if (err.status === 409) {
        setError("You already have a subscription. Manage it from your workspace settings.");
        refresh();
      } else setError("We couldn't start checkout. Please try again.");
    }
  };

  const retryMe = async () => {
    setRetrying(true);
    await refresh();
    setRetrying(false);
  };

  return (
    <section className="container-page pb-24 pt-32 md:pt-40">
      <Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition hover:text-white">
        <ArrowLeft size={16} aria-hidden="true" /> Back to pricing
      </Link>
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Complete your order</h1>
      {params.get("canceled") && <p role="status" className="mt-3 text-muted">Checkout was cancelled. You haven't been charged.</p>}

      {!me && meError ? (
        <div className="card mt-10 max-w-xl p-8">
          <p role="alert" className="font-bold">We couldn't load your account, so checkout can't start yet.</p>
          <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
          <button type="button" onClick={retryMe} disabled={retrying} className="btn-secondary mt-6">
            {retrying ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={18} aria-hidden="true" />} Retry
          </button>
        </div>
      ) : subscriptionNeedsPayment(me) ? (
        <PaymentIssueNotice className="mt-10 max-w-xl" />
      ) : hasActivePlan(me) ? (
        <div className="card mt-10 max-w-xl p-8">
          <p className="font-bold">You already have an active plan.</p>
          <Link to="/app" className="btn-primary mt-6">Go to your team <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={pay} noValidate className="card space-y-7 p-6 md:p-10">
            <PlanPicker value={planId} onChange={setPlanId} />
            <div className="rounded-2xl border border-line bg-black/40 p-5">
              <p className="flex items-center gap-2 text-sm font-bold"><Lock size={16} className="text-brand-ink" aria-hidden="true" /> Secure payment</p>
              <p className="mt-1 text-sm text-muted">You'll pay on Stripe's secure checkout page. We never see or store card details.</p>
            </div>
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
                <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); setError(null); }}
                  aria-invalid={error && !terms ? "true" : undefined} aria-describedby={error ? "checkout-error" : undefined}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand" />
                I agree to the terms of service and understand my plan renews automatically unless cancelled.
              </label>
              {error && <p id="checkout-error" className="field-error" role="alert">{error}</p>}
            </div>
            <button type="submit" disabled={status === "redirecting" || !me} className="btn-primary btn-lg w-full">
              {status === "redirecting" ? (<><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Opening secure checkout…</>) : (<>Continue to payment · {formatPrice(plan.price * plan.months)}</>)}
            </button>
          </form>
          <Summary plan={plan} agent={agent} />
        </div>
      )}
    </section>
  );
}
