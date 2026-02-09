import React from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "../../animations/variants";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
