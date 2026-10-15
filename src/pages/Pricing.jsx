import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import FaqList from "../components/ui/FaqList";
import { inViewStagger, itemStagger } from "../animations/variants";
import { PLAN_FEATURES, plans, formatPrice, creditsLine } from "../data/plans";
import { FAQ_GROUPS } from "../data/faqs";

const AGENT_TRIO = ["/agents/cassie.webp", "/agents/soshie.webp", "/agents/dexter.webp"];

function AgentGroup() {
  return (
    <div className="relative mx-auto flex h-32 w-48 items-end justify-center" aria-hidden="true">
      <img src={AGENT_TRIO[0]} alt="" width={408} height={612} loading="lazy" className="absolute bottom-0 left-0 h-28 w-20 object-contain object-bottom opacity-70" />
      <img src={AGENT_TRIO[2]} alt="" width={408} height={612} loading="lazy" className="absolute bottom-0 right-0 h-28 w-20 object-contain object-bottom opacity-70" />
      <img src={AGENT_TRIO[1]} alt="" width={408} height={612} loading="lazy" className="relative z-10 h-32 w-24 object-contain object-bottom drop-shadow-2xl" />
    </div>
  );
}

function PlanCard({ plan }) {
  const total = plan.price * plan.months;
  const popular = plan.popular;

  return (
    <motion.li
      variants={itemStagger}
      className={`relative flex flex-col rounded-[2rem] border p-7 md:p-8 ${
        popular
          ? "order-first border-2 border-brand bg-surface-3 shadow-[0_0_60px_rgba(220,38,38,0.2)] md:order-none lg:-my-4 lg:py-12"
          : "border-line bg-surface-2 transition duration-300 hover:border-brand/40"
      }`}
    >
      {popular && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-4 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-on-brand">
          Most popular
        </span>
      )}

      <AgentGroup />

      <div className="mt-6 border-t border-line pt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans text-lg font-bold">{plan.name}</h2>
          <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${popular ? "bg-brand/20 text-brand-ink" : "bg-ink/5 text-ink-soft"}`}>
            Save {plan.save}%
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-xl font-bold text-subtle line-through decoration-brand-ink decoration-2">
            <span className="sr-only">Was </span>${plan.listPrice}
          </span>
          <span className="font-display text-5xl font-bold tracking-tight">
            <span className="sr-only">Now </span>
            {formatPrice(plan.price)}
          </span>
          <span className="text-sm text-subtle">/mo</span>
        </div>
        <p className="mt-2 text-sm text-subtle">
          {plan.months === 1 ? "Billed monthly" : `${formatPrice(total)} billed every ${plan.months} months`}
        </p>

        <Link
          to={`/checkout?plan=${plan.id}`}
          className={`${popular ? "btn-primary" : "btn-secondary"} mt-7 w-full`}
          aria-label={`Get res, ${plan.name}`}
        >
          Get res <ArrowRight size={18} aria-hidden="true" />
        </Link>

        <ul className="mt-7 space-y-3">
          {[creditsLine(plan), ...PLAN_FEATURES, ...(plan.extras || [])].map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <Check size={16} className="mt-0.5 shrink-0 text-brand-ink" aria-hidden="true" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

export default function Pricing() {
  return (
    <>
      <section className="container-page pb-20 pt-32 md:pt-40">
        <SectionHeading as="h1" eyebrow="Limited-time pricing" title={<>Choose <span className="hl">res</span> at a price that fits you</>}>
          One subscription, every specialist as they launch. Commit longer, pay less.
        </SectionHeading>

        <motion.ul {...inViewStagger} className="mx-auto mt-20 grid max-w-6xl items-stretch gap-8 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </motion.ul>

        <p className="mt-12 flex items-center justify-center gap-2 text-center text-sm text-muted">
          <ShieldCheck size={18} className="text-ok" aria-hidden="true" />
          14-day money-back guarantee on every plan. Cancel anytime.
        </p>
      </section>

      <section className="border-t border-line bg-surface py-20 md:py-28">
        <div className="container-page max-w-3xl">
          <SectionHeading title="Billing questions">Everything you need to know before you subscribe.</SectionHeading>
          <FaqList items={FAQ_GROUPS.find((g) => g.title === "Plans & billing").items} className="mt-12" />
          <p className="mt-10 text-center text-muted">
            Still unsure?{" "}
            <Link to="/contact" className="font-bold text-ink underline decoration-brand-ink underline-offset-4 hover:text-brand-ink">
              Talk to our team
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
