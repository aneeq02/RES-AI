import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";

export default function Checkout() {
  const location = useLocation();
  const selectedPlan = location.state?.plan || "Selected Plan";

  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto min-h-screen text-white bg-black">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4">Complete your order</h1>
            <p className="text-zinc-500">
              You are purchasing the <span className="text-white font-bold">{selectedPlan}</span>.
            </p>
          </div>
        </RevealOnScroll>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Work Email</label>
              <input
                type="email"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Company Name</label>
              <input
                type="text"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                placeholder="Acme Inc."
              />
            </div>

            <div className="pt-6 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Payment Details</label>

              <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-8 h-5 bg-zinc-700 rounded flex-shrink-0" />
                <input
                  type="text"
                  className="bg-transparent border-none w-full text-white focus:outline-none placeholder-zinc-600"
                  placeholder="Card number"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <input
                  type="text"
                  className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  placeholder="MM / YY"
                />
                <input
                  type="text"
                  className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  placeholder="CVC"
                />
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-red-600 text-white py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 transition transform active:scale-95 mt-6"
            >
              Pay & Start Hiring
            </button>

            <p className="text-center text-[10px] text-zinc-600 uppercase font-bold tracking-widest mt-4">
              Secure 256-bit SSL Encrypted Payment
            </p>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
