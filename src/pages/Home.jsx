import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Database,
  FileText,
  Hash,
  Mail,
  MessageSquare,
  Plug,
  ShieldCheck,
  Sparkles,
  Table,
  Users,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react";

import RevealOnScroll from "../components/motion/RevealOnScroll";
import SectionHeading from "../components/ui/SectionHeading";
import CTASection from "../components/ui/CTASection";
import AutoVideo from "../components/ui/AutoVideo";
import AgentsCarousel from "../components/home/AgentsCarousel";
import ChatDemo from "../components/home/ChatDemo";
import RoleTicker from "../components/home/RoleTicker";
import { inViewStagger, itemStagger } from "../animations/variants";

const STATS = [
  { value: "24/7", label: "Always on" },
  { value: "12", label: "Specialists" },
  { value: "<5 min", label: "Setup time" },
  { value: "14-day", label: "Money-back" },
];

const STEPS = [
  { icon: Users, title: "Create a workspace", body: "Set your business profile: goals, tone, offers, and your main audience." },
  { icon: Plug, title: "Connect your tools", body: "Bring in the apps you already use so tasks flow without copy and paste." },
  { icon: Workflow, title: "Assign repeatable work", body: "Turn recurring tasks into simple prompts and let your helpers run." },
];

const INTEGRATIONS = [
  { name: "Gmail", note: "Email & threads", icon: Mail },
  { name: "Google Calendar", note: "Schedules", icon: CalendarDays },
  { name: "Slack", note: "Team updates", icon: Hash },
  { name: "Notion", note: "Docs & SOPs", icon: FileText },
  { name: "HubSpot", note: "Leads & CRM", icon: Database },
  { name: "Sheets", note: "Reporting", icon: Table },
  { name: "Zapier", note: "Automation", icon: Zap },
  { name: "Webhooks", note: "Custom flows", icon: Webhook },
];

const BENEFITS = [
  { icon: Clock, title: "Never off the clock", body: "Nights, weekends, holidays: work keeps moving." },
  { icon: ShieldCheck, title: "Human in the loop", body: "Approve anything before it goes out." },
  { icon: Sparkles, title: "Sounds like you", body: "Trained on your brand voice and examples." },
];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 md:pt-32">
      <div className="container-page grid items-center gap-12 pb-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24">
        {/* No entrance fade: the headline is the LCP element and must paint immediately from the prerendered HTML */}
        <div>
          <span className="eyebrow mb-6">
            Always-on AI teammates
          </span>
          <h1 className="text-[clamp(2.9rem,7.4vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
            AI employees that <span className="hl">never sleep.</span>
          </h1>
          <p className="mt-6 max-w-lg animate-rise text-lg leading-relaxed text-ink-soft [animation-delay:120ms] md:text-xl">
            Build, grow, and scale with specialists that handle the repetitive work, so your human team stays focused on what matters.
          </p>

          <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:220ms] sm:flex-row">
            <Link to="/agents" className="btn-primary btn-lg">
              Meet the team <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/pricing" className="btn-secondary btn-lg">
              See pricing
            </Link>
          </div>

        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-line-strong shadow-2xl shadow-black/30 lg:aspect-square">
            <AutoVideo
              src="/animation homepage.mp4"
              label="Animated preview of res AI employees at work"
              className="h-full w-full object-cover"
              style={{ objectPosition: "75% center" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Stats strip */}
      <div className="container-page pb-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-line bg-line md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col bg-surface px-6 py-6 text-center">
              <dt className="order-2 mt-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-subtle">{s.label}</dt>
              <dd className="font-display text-4xl font-extrabold tracking-[-0.03em] text-brand-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <RoleTicker />

      <AgentsCarousel />

      {/* Live demo */}
      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading align="left" eyebrow="See it work" title={<>Tell them what to do.<br /><span className="hl">They do it.</span></>}>
              Simple prompts, structured output. Refine, approve, and ship. No back-and-forth.
            </SectionHeading>
            <RevealOnScroll delay={0.1}>
              <ul className="mt-8 space-y-4">
                {BENEFITS.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand-ink">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="text-sm text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
          <RevealOnScroll delay={0.15}>
            <ChatDemo />
          </RevealOnScroll>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading eyebrow="Setup in minutes" title={<>Train your helpers to <span className="hl">sound like you.</span></>}>
          Add instructions, brand notes, and examples. The more context you provide, the more consistent the output.
        </SectionHeading>

        <motion.ol {...inViewStagger} className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <motion.li key={title} variants={itemStagger} className="card relative overflow-hidden p-8">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-on-brand">
                <Icon size={22} aria-hidden="true" />
              </div>
              <p className="mt-6 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-subtle">Step {i + 1}</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* Services teaser */}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { to: "/crm", eyebrow: "Service", title: "CRM that closes deals", body: "Automated outreach, lead scoring, and a pipeline that never forgets a follow-up.", icon: MessageSquare },
            { to: "/website-management", eyebrow: "Service", title: "Websites that never sleep", body: "Monitoring, speed, security, and new features, handled by our team.", icon: ShieldCheck },
          ].map(({ to, eyebrow, title, body, icon: Icon }) => (
            <RevealOnScroll key={to}>
              <Link to={to} className="card card-hover group flex h-full flex-col p-8 md:p-10">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-ink/5 text-brand-ink">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <ArrowRight size={22} className="text-subtle transition group-hover:translate-x-1 group-hover:text-ink" aria-hidden="true" />
                </div>
                <p className="mt-8 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-subtle">{eyebrow}</p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight">{title}</h3>
                <p className="mt-3 text-muted">{body}</p>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading align="left" eyebrow="Integrations" title={<>Works with <span className="hl">your stack.</span></>}>
              Don't change how you work. Plug helpers into the tools your team already trusts.
            </SectionHeading>
            <Link to="/contact" className="btn-secondary shrink-0">
              Request an integration
            </Link>
          </div>

          <motion.ul {...inViewStagger} className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {INTEGRATIONS.map(({ name, note, icon: Icon }) => (
              <motion.li key={name} variants={itemStagger} className="card card-hover flex items-center gap-4 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink-soft">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{name}</p>
                  <p className="truncate text-sm text-subtle">{note}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <CTASection />
    </>
  );
}
