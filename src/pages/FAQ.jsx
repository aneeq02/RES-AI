import React from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/motion/PageWrapper";
import { containerStagger, itemStagger } from "../animations/variants";
import { FAQS } from "../data/faqs";

export default function FAQ() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto min-h-screen text-white bg-black">
        <h1 className="text-5xl md:text-6xl font-black mb-16 italic tracking-tighter text-center">
          Questions?
        </h1>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {FAQS.map((item, i) => (
            <motion.div
              key={i}
              variants={itemStagger}
              className="group bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 md:p-8 hover:border-red-600/30 transition duration-300"
            >
              <h3 className="text-lg md:text-xl font-bold mb-3 group-hover:text-red-500 transition">
                {item.q}
              </h3>
              <p className="text-zinc-100 text-sm md:text-base leading-relaxed">
                {item.a}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
