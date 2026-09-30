import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Lock, LoaderCircle, ShieldCheck } from "lucide-react";
import Field from "../components/forms/Field";
import AgentAvatar from "../components/agents/AgentAvatar";
import { plans, getPlan, formatPrice, PLAN_FEATURES } from "../data/plans";
import { getMember } from "../data/members";
import { validate, required, email as emailRule } from "../utils/validation";

const RULES = {
  firstName: required("First name"),
  lastName: required("Last name"),
  email: emailRule,
  company: required("Company name"),
  terms: (v) => (v ? undefined : "Please accept the terms to continue."),
};

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
            <p className="text-subtle">{agent.role} · plus the full team</p>
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
        {PLAN_FEATURES.map((f) => (
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

function Success({ values, plan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mx-auto max-w-xl p-8 text-center md:p-12"
      role="status"
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
        <CircleCheck size={32} aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">You're in, {values.firstName}!</h1>
      <p className="mt-4 text-muted">
        We've reserved the <span className="font-bold text-white">{plan.name}</span> for {values.company}. A secure payment link and your workspace
        invite are on their way to <span className="font-bold text-white">{values.email}</span>.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/agents" className="btn-primary">
          Meet your team <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link to="/" className="btn-secondary">
          Back home
        </Link>
      </div>
    </motion.div>
  );
}

export default function Checkout() {
  const { state } = useLocation();
  const [planId, setPlanId] = useState(getPlan(state?.plan) ? state.plan : "12-month");
  const agent = getMember(state?.agent);
  const plan = getPlan(planId);

  const [values, setValues] = useState({ firstName: "", lastName: "", email: state?.email || "", company: "", terms: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done

  const set = (field) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values, RULES);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    // TODO: replace with a real checkout session (e.g. Stripe) once the backend exists.
    setTimeout(() => setStatus("done"), 900);
  };

  return (
    <>
      <section className="container-page pb-24 pt-32 md:pt-40">
        <AnimatePresence mode="wait">
          {status === "done" ? (
            <Success key="done" values={values} plan={plan} />
          ) : (
            <motion.div key="form" exit={{ opacity: 0 }}>
              <Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition hover:text-white">
                <ArrowLeft size={16} aria-hidden="true" /> Back to pricing
              </Link>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Complete your order</h1>
              <p className="mt-3 text-muted">Takes about a minute. You won't be charged until you confirm payment.</p>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
                <form onSubmit={onSubmit} noValidate className="card space-y-7 p-6 md:p-10">
                  <PlanPicker value={planId} onChange={setPlanId} />

                  <div className="grid gap-6 border-t border-line pt-7 sm:grid-cols-2">
                    <Field label="First name" name="firstName" autoComplete="given-name" value={values.firstName} onChange={set("firstName")} error={errors.firstName} />
                    <Field label="Last name" name="lastName" autoComplete="family-name" value={values.lastName} onChange={set("lastName")} error={errors.lastName} />
                  </div>
                  <Field
                    label="Work email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={values.email}
                    onChange={set("email")}
                    error={errors.email}
                  />
                  <Field
                    label="Company name"
                    name="company"
                    autoComplete="organization"
                    value={values.company}
                    onChange={set("company")}
                    error={errors.company}
                  />

                  <div className="rounded-2xl border border-line bg-black/40 p-5">
                    <p className="flex items-center gap-2 text-sm font-bold">
                      <Lock size={16} className="text-brand-ink" aria-hidden="true" /> Secure payment
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      After you confirm, we email a secure payment link from our payment provider. We never store card details on this site.
                    </p>
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={values.terms}
                        onChange={set("terms")}
                        aria-invalid={errors.terms ? "true" : undefined}
                        aria-describedby={errors.terms ? "terms-error" : undefined}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand"
                      />
                      I agree to the terms of service and understand my plan renews automatically unless cancelled.
                    </label>
                    {errors.terms && (
                      <p id="terms-error" className="field-error" role="alert">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={status === "submitting"} className="btn-primary btn-lg w-full">
                    {status === "submitting" ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Confirming…
                      </>
                    ) : (
                      <>
                        Confirm order · {formatPrice(plan.price * plan.months)}
                      </>
                    )}
                  </button>
                </form>

                <Summary plan={plan} agent={agent} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
