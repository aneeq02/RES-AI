import React from "react";
import PageWrapper from "../components/motion/PageWrapper";
import RevealOnScroll from "../components/motion/RevealOnScroll";

export default function Contact() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white bg-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <RevealOnScroll>
            <div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">
                Let's build <br /> your team.
              </h1>
              <p className="text-zinc-100 text-lg mb-8">
                Ready to automate? Fill out the form and our onboarding AI will reach out instantly.
              </p>
              <div className="space-y-4 text-zinc-100">
                <p>hello@res.ai</p>
                <p>+1 (555) 000-0000</p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <form className="glass-panel p-6 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"
                  />
                </div>

                <button className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition">
                  Send Message
                </button>
              </div>
            </form>
          </RevealOnScroll>
        </div>
      </div>
    </PageWrapper>
  );
}
