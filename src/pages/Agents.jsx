import React from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/motion/PageWrapper";
import { containerStagger, itemStagger } from "../animations/variants";
import { members } from "../data/members";

export default function Agents() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen bg-black text-white relative">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block py-1 px-3 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-red-500"
          >
            Your Future Team
          </motion.span>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-7xl font-black mb-6 italic tracking-tighter"
          >
            Meet the <span className="text-red-600">Specialists</span>
          </motion.h1>

          <p className="text-zinc-400 max-w-2xl mx-auto">
            Pick a specialist built for one job: faster execution, consistent quality, zero downtime.
          </p>
        </div>

        <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {members.map((m) => (
            <motion.div
              key={m.id}
              variants={itemStagger}
              className="group glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-zinc-900/40 hover:bg-zinc-900 hover:border-red-500/30 transition-all duration-500 flex flex-col sm:flex-row gap-6 md:gap-8 items-center"
            >
              <div className="w-full sm:w-1/3 aspect-[3/4] rounded-[2rem] overflow-hidden relative shadow-2xl bg-zinc-800/50 flex items-center justify-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-20`} />
                <div className="relative z-10 text-4xl font-black italic opacity-80 select-none">
                  {m.name?.[0]}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-black italic tracking-tighter mb-1">{m.name}</h2>
                <p className="text-red-500 font-bold uppercase text-xs tracking-widest mb-3">{m.role}</p>
                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-[10px] text-zinc-400 border border-white/10 mb-4">
                  <span className="text-zinc-500">from</span>
                  <span className="text-white font-bold">${m.price}</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">{m.description}</p>

                <button className="w-full bg-white text-black py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition shadow-lg transform active:scale-95">
                  Hire {m.name}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
