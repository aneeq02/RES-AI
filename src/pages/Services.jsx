import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import { containerStagger, itemStagger } from "../animations/variants";

export default function Services() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
        <RevealOnScroll>
          <div className="text-center mb-16 md:mb-24">
            <h1 className="text-5xl md:text-7xl font-black mb-4 italic tracking-tighter">Our Services</h1>
            <p className="text-zinc-100 text-lg max-w-2xl mx-auto">
              Comprehensive solutions to automate your workflow.
            </p>
          </div>
        </RevealOnScroll>

        <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <Link to="/crm">
            <motion.div variants={itemStagger} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 h-full group">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-500 transition">CRM</h3>
                <span className="text-2xl transform group-hover:translate-x-2 transition">→</span>
              </div>
              <p className="text-zinc-100 mb-6">Connect your entire sales pipeline with automated follow-ups.</p>
            </motion.div>
          </Link>

          <Link to="/website-management">
            <motion.div variants={itemStagger} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 h-full group">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-500 transition">
                  Website Management
                </h3>
                <span className="text-2xl transform group-hover:translate-x-2 transition">→</span>
              </div>
              <p className="text-zinc-100 mb-6">Full stack development and maintenance for your digital presence.</p>
            </motion.div>
          </Link>

          <Link to="/agents">
            <motion.div variants={itemStagger} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 h-full group">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-500 transition">AI Agents</h3>
                <span className="text-2xl transform group-hover:translate-x-2 transition">→</span>
              </div>
              <p className="text-zinc-100">Meet our specialized team of AI employees ready to work for you.</p>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
