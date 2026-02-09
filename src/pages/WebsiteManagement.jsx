import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import { containerStagger, itemStagger } from "../animations/variants";

export default function WebsiteManagement() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white bg-black">
        <RevealOnScroll>
          <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-red-500">
              Digital Presence
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">
              Website Management & <span className="text-red-600">Growth.</span>
            </h1>
            <p className="text-zinc-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Your website is your most important employee. We ensure it's fast, secure, and constantly evolving with full-stack development and proactive maintenance.
            </p>
          </div>
        </RevealOnScroll>

        <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {[
            {
              num: "01",
              title: "24/7 Uptime & Security Monitoring",
              body: "We watch your site so you don't have to. Instant alerts for downtime and proactive defense against vulnerabilities.",
            },
            {
              num: "02",
              title: "Performance & Speed Optimization",
              body: "A slow site kills conversions. We optimize images, code, and server response times for fast loading worldwide.",
            },
            {
              num: "03",
              title: "Full-Stack Custom Development",
              body: "Need a new feature? We build everything from React UI to Node integrations and database management.",
            },
            {
              num: "04",
              title: "Content Updates & SEO",
              body: "We keep your site fresh and ensure technical SEO best practices are always met.",
            },
          ].map((f) => (
            <motion.div
              key={f.num}
              variants={itemStagger}
              className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group"
            >
              <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">
                {f.num}
              </div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">{f.title}</h3>
              <p className="text-zinc-100 relative z-10 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <RevealOnScroll>
          <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/10 bg-zinc-900 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600/10 blur-[100px] -z-10 pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6">
              Ensure your digital storefront never closes.
            </h2>
            <p className="text-zinc-100 text-lg mb-8 max-w-xl mx-auto">
              Let our team handle the technical headaches so you can focus on growing your business.
            </p>
            <Link to="/contact">
              <button className="bg-red-600 text-white px-10 py-5 rounded-full text-sm font-bold shadow-2xl shadow-red-500/20 uppercase tracking-widest hover:bg-red-700 transition hover:scale-105 active:scale-95">
                Contact Us
              </button>
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </PageWrapper>
  );
}
