import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import { backgroundGradient, containerStagger, itemStagger } from "../animations/variants";

// ✅ NEW: Carousel
import AgentsCarousel from "../components/home/AgentsCarousel";

const USE_CASES = [
  {
    title: "Soshie, plan my next 14 days of content",
    desc: "Generate ideas, write captions, and ship a full calendar that matches your tone.",
    icon: "✦",
  },
  {
    title: "Cassie, reply to today’s comments",
    desc: "Turn messy inbox threads into clean, brand-safe replies in seconds.",
    icon: "☰",
  },
  {
    title: "Dexter, summarize my KPIs and tell me what changed",
    desc: "Spot trends, surface anomalies, and turn data into a clear action list.",
    icon: "∿",
  },
  {
    title: "Vizzy, build my schedule for tomorrow",
    desc: "Organize your day, draft follow-ups, and keep everything moving.",
    icon: "✓",
  },
];

const INTEGRATIONS = [
  { name: "Gmail", note: "Email & threads" },
  { name: "Google Calendar", note: "Schedules" },
  { name: "Slack", note: "Team updates" },
  { name: "Notion", note: "Docs & SOPs" },
  { name: "HubSpot", note: "Leads & CRM" },
  { name: "Sheets", note: "Reporting" },
  { name: "Zapier", note: "Automation" },
  { name: "Webhook", note: "Custom flows" },
];

const TESTIMONIALS = [
  {
    quote:
      "The biggest win is speed. I used to batch work on weekends—now tasks ship daily without feeling heavy.",
    name: "Founder, eCom brand",
    meta: "Karachi • 3 weeks in",
  },
  {
    quote:
      "Support replies are consistent and calm. Our response time dropped and we stopped missing messages.",
    name: "Ops Lead",
    meta: "Dubai • Team of 6",
  },
  {
    quote:
      "We finally have clarity. Weekly metrics are readable, and priorities don’t get lost anymore.",
    name: "Growth Manager",
    meta: "London • B2B SaaS",
  },
];

export default function Home() {
  return (
    <PageWrapper>
      <main className="bg-black text-white overflow-x-hidden min-h-screen relative">
        {/* Background blob */}
        <motion.div
          variants={backgroundGradient}
          animate="animate"
          className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none"
        />

        {/* =========================
            1) HERO
           ========================= */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-8 py-20">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 mb-5 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                Always-on AI teammates for real work
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-[85px] font-black leading-[0.95] tracking-tighter mb-6 md:mb-8 break-words">
                AI Employees: <br />
                Your Helpers That <span className="text-red-600">Never Sleep.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-100 max-w-md mb-8 md:mb-10 leading-relaxed">
                Build, grow, and scale with specialists that handle repetitive work—so your human team stays focused.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/agents" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-red-600 text-white px-10 py-5 rounded-full text-lg font-bold shadow-2xl shadow-red-500/20 uppercase tracking-widest"
                  >
                    View Team
                  </motion.button>
                </Link>

                <Link to="/pricing" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto bg-zinc-900 border border-white/10 text-white px-10 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-zinc-800 transition"
                  >
                    See Pricing
                  </motion.button>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                <span className="px-3 py-2 rounded-full border border-white/10 bg-white/5">No busywork</span>
                <span className="px-3 py-2 rounded-full border border-white/10 bg-white/5">Fast output</span>
                <span className="px-3 py-2 rounded-full border border-white/10 bg-white/5">Brand-safe tone</span>
              </div>
            </motion.div>

            {/* Hero media */}
            <div className="relative flex justify-center items-center mt-10 lg:mt-0">
              <div className="w-full max-w-lg aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative z-10">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "75% center" }}
                >
                  <source src="/animation homepage.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
              <div className="absolute inset-0 bg-red-600/20 blur-[100px] -z-10 rounded-full" />
            </div>
          </div>
        </section>

        {/* =========================
            2) TRUST STRIP
           ========================= */}
        <section className="px-6 md:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-between">
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-black italic tracking-tighter">Ship more. Stress less.</div>
                <p className="text-zinc-300 mt-2 text-sm md:text-base">
                  Your team gets time back—without losing quality or control.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
                <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                  <div className="text-2xl font-black">24/7</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Availability</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                  <div className="text-2xl font-black">Fast</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Turnaround</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                  <div className="text-2xl font-black">Clean</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Output</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            3) ✅ REPLACED: Top members grid
               WITH: Agents Carousel (like screenshot)
           ========================= */}
        <AgentsCarousel
          title="Choose your specialists"
          subtitle="Swipe through your AI employees. Each one is built for a specific role."
        />

        {/* =========================
            4) USE-CASE PROMPTS
           ========================= */}
        <section className="py-20 md:py-28 px-6 md:px-8 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
            <RevealOnScroll>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">
                Tell them what to do.
                <br />
                They do it.
              </h2>
              <p className="text-zinc-300 mt-6 max-w-xl">
                Simple prompts → structured output. You can refine, approve, and ship—without the back-and-forth.
              </p>

              <div className="mt-8 flex gap-4">
                <Link to="/crm">
                  <button className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition">
                    CRM
                  </button>
                </Link>
                <Link to="/website-management">
                  <button className="border border-white/15 bg-white/5 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10 transition">
                    Website Mgmt
                  </button>
                </Link>
              </div>
            </RevealOnScroll>

            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="space-y-5"
            >
              {USE_CASES.map((u, idx) => (
                <motion.div
                  key={idx}
                  variants={itemStagger}
                  className="rounded-[2rem] border border-white/10 bg-black/40 p-6 md:p-7 hover:border-red-500/30 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-red-400 font-black">
                      {u.icon}
                    </div>
                    <div>
                      <div className="text-white font-black tracking-tight">{u.title}</div>
                      <div className="text-zinc-300 text-sm leading-relaxed mt-2">{u.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =========================
            5) HOW IT WORKS
           ========================= */}
        <section className="py-20 md:py-28 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <span className="inline-block py-1 px-3 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest text-red-500 mb-6">
                  Setup in minutes
                </span>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                  Train your helpers to sound like you.
                </h2>
                <p className="text-zinc-300 mt-5">
                  Add instructions, brand notes, and examples. The more context you provide, the more consistent the output.
                </p>
              </div>
            </RevealOnScroll>

            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { num: "01", title: "Create a workspace", body: "Set your business profile: goals, tone, offers, and your main audience." },
                { num: "02", title: "Connect your tools", body: "Bring in the apps you already use so tasks flow without copy/paste." },
                { num: "03", title: "Assign repeatable work", body: "Turn recurring tasks into simple prompts and let the helper run." },
              ].map((s) => (
                <motion.div
                  key={s.num}
                  variants={itemStagger}
                  className="rounded-[2.5rem] border border-white/10 bg-zinc-900/40 p-8 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 text-[140px] font-black italic text-red-600/10 select-none">
                    {s.num}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight">{s.title}</h3>
                    <p className="text-zinc-300 mt-4 leading-relaxed">{s.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =========================
            6) INTEGRATIONS GRID
           ========================= */}
        <section className="py-20 md:py-28 px-6 md:px-8 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                    Works with your stack.
                  </h2>
                  <p className="text-zinc-300 mt-5 max-w-2xl">
                    Don’t change how you work. Plug helpers into the tools your team already trusts.
                  </p>
                </div>
                <Link to="/contact" className="shrink-0">
                  <button className="border border-white/15 bg-white/5 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10 transition">
                    Request Integration
                  </button>
                </Link>
              </div>
            </RevealOnScroll>

            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5"
            >
              {INTEGRATIONS.map((x) => (
                <motion.div
                  key={x.name}
                  variants={itemStagger}
                  className="rounded-[2rem] border border-white/10 bg-black/40 p-6 hover:border-red-500/30 transition"
                >
                  <div className="text-white font-black">{x.name}</div>
                  <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-2">{x.note}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =========================
            7) TESTIMONIALS
           ========================= */}
        <section className="py-20 md:py-28 px-6 md:px-8 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                  Real teams. Real output.
                </h2>
                <p className="text-zinc-300 mt-5">
                  The goal isn’t “more AI”. The goal is less friction and more progress.
                </p>
              </div>
            </RevealOnScroll>

            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {TESTIMONIALS.map((t, idx) => (
                <motion.div
                  key={idx}
                  variants={itemStagger}
                  className="rounded-[2.5rem] border border-white/10 bg-black/40 p-8"
                >
                  <div className="text-zinc-100 leading-relaxed">“{t.quote}”</div>
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="font-black">{t.name}</div>
                    <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-2">{t.meta}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* =========================
            8) FINAL CTA
           ========================= */}
        <section className="py-20 md:py-28 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll>
              <div className="rounded-[3rem] border border-white/10 bg-zinc-900/40 p-10 md:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-red-600/10 blur-[120px] -z-10 pointer-events-none" />
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6">
                  Ready to build your AI team?
                </h2>
                <p className="text-zinc-200 text-lg max-w-2xl mx-auto mb-10">
                  Start with one helper, prove ROI, then scale. Keep your workflow. Remove the repetitive work.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/pricing">
                    <button className="bg-red-600 text-white px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-red-700 transition hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20">
                      Get Started
                    </button>
                  </Link>
                  <Link to="/contact">
                    <button className="border border-white/15 bg-white/5 text-white px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-white/10 transition">
                      Talk to Us
                    </button>
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}
