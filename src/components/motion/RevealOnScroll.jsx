import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/variants";

export default function RevealOnScroll({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
