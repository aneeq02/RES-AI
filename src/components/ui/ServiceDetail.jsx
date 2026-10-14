import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SectionHeading from "./SectionHeading";
import CTASection from "./CTASection";
import RevealOnScroll from "../motion/RevealOnScroll";
import { inViewStagger, itemStagger } from "../../animations/variants";

/** Shared layout for service pages (CRM, Website Management). */
export default function ServiceDetail({ eyebrow, title, intro, features, process, outcomes, cta }) {
  return (
    <>
      <section className="container-page pb-16 pt-32 md:pt-40">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title}>
          {intro}
        </SectionHeading>

        {outcomes && (
          <RevealOnScroll delay={0.1}>
            <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-3">
              {outcomes.map((o) => (
                <div key={o.label} className="flex flex-col bg-surface px-6 py-7 text-center">
                  <dt className="order-2 mt-1 text-sm text-subtle">{o.label}</dt>
                  <dd className="font-display text-4xl font-bold tracking-tight text-brand-ink">{o.value}</dd>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
        )}
      </section>

      <section className="container-page pb-20">
        <motion.ul {...inViewStagger} className="grid gap-6 md:grid-cols-2">
          {features.map(({ icon: Icon, title: fTitle, body }, i) => (
            <motion.li key={fTitle} variants={itemStagger} className="card card-hover relative overflow-hidden p-8 md:p-10">
              <span className="absolute -right-3 -top-8 select-none font-display text-[140px] font-bold leading-none text-ink/[0.04]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand-ink">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight">{fTitle}</h2>
              <p className="mt-3 leading-relaxed text-muted">{body}</p>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {process && (
        <section className="border-y border-line bg-surface py-20 md:py-28">
          <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHeading align="left" eyebrow="How it works" title={process.title}>
              {process.body}
            </SectionHeading>
            <motion.ol {...inViewStagger} className="relative space-y-4 border-l border-line pl-8">
              {process.steps.map((s, i) => (
                <motion.li key={s.title} variants={itemStagger} className="relative">
                  <span className="absolute -left-[3.05rem] top-5 grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-on-brand">
                    {i + 1}
                  </span>
                  <div className="card p-6">
                    <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-muted">{s.body}</p>
                    {s.points && (
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        {s.points.map((p) => (
                          <li key={p} className="flex items-center gap-1.5 text-sm text-ink-soft">
                            <Check size={14} className="text-brand-ink" aria-hidden="true" /> {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>
      )}

      <CTASection {...cta} />
    </>
  );
}
