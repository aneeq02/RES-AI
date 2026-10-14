import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RevealOnScroll from "../motion/RevealOnScroll";

export default function CTASection({
  title = "Ready to build your AI team?",
  body = "Start with one helper, prove the ROI, then scale. Keep your workflow — lose the repetitive work.",
  primary = { to: "/pricing", label: "Get Started" },
  secondary = { to: "/contact", label: "Talk to us" },
}) {
  return (
    <section className="container-page py-20 md:py-28">
      <RevealOnScroll>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-line-strong bg-surface-2 px-6 py-16 text-center md:px-16 md:py-24">
          <div
            className="absolute -top-1/2 left-1/2 -z-10 h-[140%] w-[80%] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_80%_at_50%_30%,#000,transparent)]"
            style={{
              backgroundImage: "linear-gradient(var(--c-line) 1px, transparent 1px), linear-gradient(90deg, var(--c-line) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
            aria-hidden="true"
          />
          <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-6xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">{body}</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={primary.to} className="btn-primary btn-lg">
              {primary.label} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {secondary && (
              <Link to={secondary.to} className="btn-secondary btn-lg">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
