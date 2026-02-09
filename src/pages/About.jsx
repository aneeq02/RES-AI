import React from "react";
import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";

export default function About() {
  return (
    <PageWrapper>
      <div className="bg-black text-white min-h-screen">
        <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-8 pt-20">
          <RevealOnScroll>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-8xl font-black mb-8 italic tracking-tighter">
                We build the <br /> workforce of the future.
              </h1>
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-red-400">
                Our Story
              </span>
            </div>
          </RevealOnScroll>
        </div>

        <div className="px-6 md:px-8 pb-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <RevealOnScroll delay={0.2}>
              <div className="rounded-[3rem] overflow-hidden border border-white/10 h-[400px] md:h-[500px]">
                <img
                  src="/lady_agent_2-removebg-preview.png"
                  alt="Vision"
                  className="w-full h-full object-cover object-top bg-zinc-900/50"
                />
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.4}>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Why we exist</h3>
                <p className="text-zinc-100 text-lg mb-6 leading-relaxed">
                  Traditional hiring is slow, expensive, and limited by geography. Res provides instant access to top-tier AI talent that is trained, compliant, and ready to work from day one.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
