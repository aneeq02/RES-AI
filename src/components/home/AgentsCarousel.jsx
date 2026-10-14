import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AgentAvatar from "../agents/AgentAvatar";
import SectionHeading from "../ui/SectionHeading";
import { members } from "../../data/members";

export default function AgentsCarousel({
  title = "Choose your specialists",
  subtitle = "Swipe through your AI employees. Each one is built for a specific role.",
}) {
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    const card = el?.querySelector("[data-card]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: "smooth" });
  };

  const arrow =
    "grid h-12 w-12 place-items-center rounded-full border border-line-strong bg-ink/5 text-ink transition hover:border-ink/30 hover:bg-ink/10 disabled:opacity-30 disabled:hover:bg-ink/5";

  return (
    <section className="py-20 md:py-28" aria-roledescription="carousel" aria-label="AI specialists">
      <div className="container-page mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading align="left" eyebrow="The team" title={title}>
          {subtitle}
        </SectionHeading>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => scrollByCards(-1)} disabled={edges.start} className={arrow} aria-label="Previous specialists">
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scrollByCards(1)} disabled={edges.end} className={arrow} aria-label="Next specialists">
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateEdges}
        className="hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 md:px-8 xl:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {members.map((m) => (
          <article
            key={m.id}
            data-card
            className="group flex w-[80%] shrink-0 snap-start flex-col overflow-hidden rounded-[2rem] border border-line bg-surface-2/70 transition duration-300 hover:border-brand/40 sm:w-[46%] md:w-[36%] lg:w-[27%] xl:w-[23%]"
          >
            <AgentAvatar
              member={m}
              className="aspect-[4/5]"
              imgClassName="pt-6 transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-2xl font-bold tracking-tight">{m.name}</h3>
              </div>
              <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">{m.role}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{m.description}</p>
              <Link
                to={`/agents#${m.id}`}
                className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold text-ink transition group-hover:text-brand-ink"
              >
                Meet {m.name} <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
