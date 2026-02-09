import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import { containerStagger, itemStagger } from "../animations/variants";

export default function Pricing() {
  const navigate = useNavigate();

  const goToCheckout = (plan) => {
    navigate("/checkout", { state: { plan } });
  };

  const AgentGroup = () => (
    <div className="flex items-end justify-center mb-4 relative h-32 w-full">
      <div className="absolute left-1/2 -translate-x-[120%] bottom-0 w-24 h-28 z-0 opacity-80">
        <img src="/lady_agent_2-removebg-preview.png" className="w-full h-full object-contain object-bottom drop-shadow-lg" alt="Agent 2" />
      </div>
      <div className="absolute left-1/2 -translate-x-[-20%] bottom-0 w-24 h-28 z-0 opacity-80">
        <img src="/lady_agent_3-removebg-preview.png" className="w-full h-full object-contain object-bottom drop-shadow-lg" alt="Agent 3" />
      </div>
      <div className="relative z-10 w-32 h-36 -mb-2">
        <img src="/Lady_agent_1-removebg-preview.png" className="w-full h-full object-contain object-bottom drop-shadow-2xl" alt="Main Agent" />
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white text-center bg-black">
        <RevealOnScroll>
          <h1 className="text-5xl md:text-6xl font-black mb-6 italic tracking-tighter">
            Choose <span className="text-red-600">res</span> at a price that fits you
          </h1>
          <p className="text-zinc-500 mb-20 text-lg">The sale you've been waiting for.</p>
        </RevealOnScroll>

        <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
          {/* 1-month */}
          <motion.div variants={itemStagger} className="glass-panel bg-black rounded-[2rem] border border-white/10 overflow-hidden relative group p-8 transition-all duration-300 hover:border-red-600 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:scale-105 hover:z-20 hover:bg-zinc-900">
            <AgentGroup />
            <div className="text-left mt-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">1-month plan</h3>
                <span className="bg-zinc-800 text-xs py-1 px-2 rounded-lg text-zinc-400 group-hover:bg-red-600/20 group-hover:text-red-400 transition-colors">
                  Save 50%
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-zinc-600 text-xl line-through decoration-red-500 decoration-2 font-bold">$97</span>
                <span className="text-4xl font-black text-white">
                  $48.50<span className="text-sm text-zinc-500 font-normal">/mo</span>
                </span>
              </div>

              <button
                onClick={() => goToCheckout("1-Month")}
                className="w-full py-4 rounded-full border border-white/20 transition-all duration-300 font-bold text-sm uppercase tracking-widest mb-6 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white group-hover:shadow-lg"
              >
                Get Res
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                <span>✓</span> 14-day money-back guarantee
              </div>
            </div>
          </motion.div>

          {/* 12-month (popular) */}
          <motion.div variants={itemStagger} className="bg-zinc-900 rounded-[2rem] border-2 border-red-600 overflow-hidden relative group p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] transform scale-105 z-10">
            <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center text-xs font-bold uppercase tracking-widest py-2">
              Most Popular
            </div>

            <div className="mt-8">
              <AgentGroup />
            </div>

            <div className="text-left mt-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">12-month plan</h3>
                <span className="bg-red-600/20 text-red-400 text-xs py-1 px-2 rounded-lg font-bold">Save 70%</span>
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-zinc-500 text-xl line-through decoration-red-500 decoration-2 font-bold">$52</span>
                <span className="text-5xl font-black text-white">
                  $15.60<span className="text-sm text-zinc-500 font-normal">/mo</span>
                </span>
              </div>

              <button
                onClick={() => goToCheckout("12-Month")}
                className="w-full py-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition font-bold text-sm uppercase tracking-widest mb-6 shadow-lg shadow-red-600/30"
              >
                Get Res
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                <span>✓</span> 14-day money-back guarantee
              </div>
            </div>
          </motion.div>

          {/* 3-month */}
          <motion.div variants={itemStagger} className="glass-panel bg-black rounded-[2rem] border border-white/10 overflow-hidden relative group p-8 transition-all duration-300 hover:border-red-600 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:scale-105 hover:z-20 hover:bg-zinc-900">
            <AgentGroup />
            <div className="text-left mt-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">3-month plan</h3>
                <span className="bg-zinc-800 text-xs py-1 px-2 rounded-lg text-zinc-400 group-hover:bg-red-600/20 group-hover:text-red-400 transition-colors">
                  Save 60%
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-zinc-600 text-xl line-through decoration-red-500 decoration-2 font-bold">$59</span>
                <span className="text-4xl font-black text-white">
                  $23.60<span className="text-sm text-zinc-500 font-normal">/mo</span>
                </span>
              </div>

              <button
                onClick={() => goToCheckout("3-Month")}
                className="w-full py-4 rounded-full border border-white/20 transition-all duration-300 font-bold text-sm uppercase tracking-widest mb-6 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white group-hover:shadow-lg"
              >
                Get Res
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                <span>✓</span> 14-day money-back guarantee
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
