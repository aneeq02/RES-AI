import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { members } from "../../data/members";

/**
 * Tries common public paths.
 * Recommended:
 *  /public/agents/{id}.png  OR  /public/{id}.png
 */
const getCandidateSources = (m) => {
  const id = String(m.id || "").toLowerCase();
  const name = String(m.name || "").toLowerCase().replace(/\s+/g, "_");

  return [
    `/agents/${id}.png`,
    `/${id}.png`,
    `/agents/${id}.webp`,
    `/${id}.webp`,
    `/agents/${name}.png`,
    `/${name}.png`,
    `/agents/${name}.webp`,
    `/${name}.webp`,
  ];
};

function AgentImage({ member }) {
  const sources = useMemo(() => getCandidateSources(member), [member]);
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const currentSrc = sources[srcIndex];

  const handleError = () => {
    const next = srcIndex + 1;
    if (next < sources.length) setSrcIndex(next);
    else setFailed(true);
  };

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${member.color} opacity-25`} />
        <div className="absolute text-5xl font-black italic text-white/80 select-none">
          {member.name?.[0]}
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={member.name}
      className="w-full h-full object-contain"
      onError={handleError}
      loading="lazy"
      draggable={false}
    />
  );
}

export default function AgentsCarousel({
  title = "Choose your agents",
  subtitle = "Swipe through specialists built for specific roles.",
  ctaText = "Hire an agent",
  onHireClick,
}) {
  const scrollerRef = useRef(null);
  const items = useMemo(() => members, []);

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const card = el.querySelector("[data-card]");
    const cardWidth = card ? card.getBoundingClientRect().width : 320;
    const gap = 20;
    el.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <section className="py-14 md:py-18">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Title */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter">{title}</h2>
          <p className="text-zinc-400 mt-3 max-w-2xl">{subtitle}</p>
        </div>

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Side fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-14 sm:w-16 md:w-24 z-20 bg-gradient-to-r from-black via-black/90 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-14 sm:w-16 md:w-24 z-20 bg-gradient-to-l from-black via-black/90 to-transparent" />

          {/* Mid arrows (desktop + mobile) */}
          <button
            onClick={() => scrollByCards(-1)}
            className="
              absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30
              w-11 h-11 rounded-full
              border border-white/10 bg-black/60 hover:bg-black/80
              text-white grid place-items-center transition
            "
            aria-label="Scroll left"
            type="button"
          >
            ←
          </button>

          <button
            onClick={() => scrollByCards(1)}
            className="
              absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30
              w-11 h-11 rounded-full
              border border-white/10 bg-black/60 hover:bg-black/80
              text-white grid place-items-center transition
            "
            aria-label="Scroll right"
            type="button"
          >
            →
          </button>

          {/* Scroller */}
          <div
            ref={scrollerRef}
            className="
              overflow-x-auto scroll-smooth snap-x snap-mandatory
              [scrollbar-width:none] [-ms-overflow-style:none]
              hide-scrollbar
              pb-4
            "
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="flex gap-5">
              {items.map((m, idx) => (
                <motion.article
                  key={m.id}
                  data-card
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.35, delay: idx * 0.02 }}
                  className="
                    snap-center shrink-0
                    w-[82%] xs:w-[78%] sm:w-[56%] md:w-[40%] lg:w-[28%] xl:w-[24%]
                    rounded-[2.25rem]
                    border border-white/10
                    bg-zinc-900/35 hover:bg-zinc-900/55
                    transition
                    overflow-hidden
                  "
                  style={{
                    // Make cards around "viewport height" on desktop but not too big on mobile
                    height: "clamp(460px, 70vh, 760px)",
                  }}
                >
                  {/* Image area (dominant) */}
                  <div className="relative h-[70%] bg-black/30">
                    <AgentImage member={m} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Text area */}
                  <div className="h-[30%] p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight">{m.name}</h3>
                      <p className="text-zinc-400 text-sm mt-1">{m.role}</p>
                      <p className="text-zinc-200 text-sm leading-relaxed mt-3 line-clamp-3">
                        {m.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>

        {/* Single CTA button (global) */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onHireClick}
            className="
              bg-red-600 text-white px-10 py-4 rounded-full
              text-xs md:text-sm font-black uppercase tracking-widest
              hover:bg-red-700 transition
              shadow-lg shadow-red-600/20
              active:scale-95
            "
            type="button"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}
