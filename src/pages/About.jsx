import React from "react";
import { motion } from "framer-motion";
import { Globe, HeartHandshake, Lock, Rocket } from "lucide-react";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import SectionHeading from "../components/ui/SectionHeading";
import CTASection from "../components/ui/CTASection";
import AutoVideo from "../components/ui/AutoVideo";
import { inViewStagger, itemStagger } from "../animations/variants";

const VALUES = [
  { icon: Rocket, title: "Speed over ceremony", body: "Hiring takes months. Onboarding an AI specialist takes minutes." },
  { icon: HeartHandshake, title: "Humans stay in charge", body: "Agents draft, you decide. Approvals are built into every workflow." },
  { icon: Lock, title: "Private by default", body: "Your data trains your agents only — never public models." },
  { icon: Globe, title: "Talent without borders", body: "World-class skills available to every business, in every time zone." },
];

export default function About() {
  return (
    <>
      <section className="container-page pb-20 pt-32 md:pt-40">
        <SectionHeading as="h1" eyebrow="Our story" title={<>We build the workforce <span className="text-brand-ink">of the future.</span></>}>
          res started with a simple frustration: small teams drowning in repetitive work they couldn't afford to hire for.
        </SectionHeading>
      </section>

      <section className="container-page grid items-center gap-12 pb-20 md:grid-cols-2 md:pb-28">
        <RevealOnScroll>
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-line bg-surface-2">
            <AutoVideo src="/blonde girl animation.mp4" label="Animated res AI agent" className="h-full w-full object-cover" />
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.15}>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Why we exist</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Traditional hiring is slow, expensive, and limited by geography. res gives you instant access to AI specialists that are trained,
              compliant, and ready to work from day one.
            </p>
            <p>
              We're not replacing your team — we're taking the repetitive work off their plate so they can do the thinking, the relationships,
              and the creative work only people can do.
            </p>
          </div>
        </RevealOnScroll>
      </section>

      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="What we believe" title="Principles we build by." />
          <motion.ul {...inViewStagger} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <motion.li key={title} variants={itemStagger} className="card p-7">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand-ink">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <CTASection title="Join the teams that never stop." />
    </>
  );
}
