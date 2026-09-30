import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, MessageSquare } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import CTASection from "../components/ui/CTASection";
import AgentAvatar from "../components/agents/AgentAvatar";
import { members } from "../data/members";
import useHashScroll from "../hooks/useHashScroll";

const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "growth", label: "Marketing & Growth", match: (m) => ["soshie", "emmie", "penn", "seomi", "commet"].includes(m.id) },
  { id: "sales", label: "Sales & Support", match: (m) => ["cassie", "milli", "scouty"].includes(m.id) },
  { id: "ops", label: "Strategy & Ops", match: (m) => ["dexter", "buddy", "vizzy", "gigi"].includes(m.id) },
];

function AgentCard({ m }) {
  return (
    <motion.article
      layout
      id={m.id}
      tabIndex={-1}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.35 }}
      className="group grid scroll-mt-28 overflow-hidden rounded-[2rem] border border-line bg-surface-2/70 outline-none transition-colors duration-300 hover:border-brand/40 focus-visible:border-brand-ink sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <AgentAvatar
        member={m}
        className="aspect-[4/3] sm:aspect-auto sm:min-h-[340px]"
        imgClassName="pt-6 transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="flex flex-col p-6 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight">{m.name}</h2>
        <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-brand-ink">{m.role}</p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300">{m.description}</p>

        <ul className="mt-5 space-y-2">
          {m.skills.map((s) => (
            <li key={s} className="flex items-center gap-2 text-sm text-zinc-200">
              <Check size={16} className="shrink-0 text-brand-ink" aria-hidden="true" /> {s}
            </li>
          ))}
        </ul>

        <p className="mt-5 flex items-start gap-2 rounded-2xl border border-line bg-black/40 px-4 py-3 text-sm italic text-muted">
          <MessageSquare size={16} className="mt-0.5 shrink-0 not-italic" aria-hidden="true" />
          "{m.prompt}"
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="text-sm text-subtle">
            from <span className="font-display text-2xl font-bold text-white">${m.price}</span>/mo
          </p>
          <Link to="/checkout" state={{ agent: m.id }} className="btn-light min-h-11 px-6 py-2.5 text-xs group-hover:bg-brand group-hover:text-white">
            Hire {m.name} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function Agents() {
  useHashScroll();
  const [filter, setFilter] = useState("all");
  const visible = useMemo(() => members.filter(FILTERS.find((f) => f.id === filter).match), [filter]);

  return (
    <>
      <section className="container-page pb-10 pt-32 md:pt-40">
        <SectionHeading as="h1" eyebrow="Your future team" title={<>Meet the <span className="text-brand-ink">specialists</span></>}>
          Each specialist is built for one job: faster execution, consistent quality, zero downtime. Every plan includes the whole team.
        </SectionHeading>

        <div role="group" aria-label="Filter specialists" className="hide-scrollbar mt-12 flex gap-2 overflow-x-auto pb-2 md:justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-bold transition ${
                filter === f.id ? "border-brand bg-brand text-white" : "border-line bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="container-page pb-8">
        <p className="sr-only" aria-live="polite">
          Showing {visible.length} specialists
        </p>
        <motion.div layout className="grid gap-6 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((m) => (
              <AgentCard key={m.id} m={m} />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <CTASection
        title="Want the whole team?"
        body="Every plan unlocks all 12 specialists. Pick a plan and put them to work today."
        primary={{ to: "/pricing", label: "Compare plans" }}
      />
    </>
  );
}
