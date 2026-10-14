import React, { useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/layout/Footer";
import Seo from "../seo/Seo";
import { pageVariants, pageTransition } from "../animations/variants";

// Freezes the outlet for the lifetime of a keyed page so the exiting page
// keeps rendering its own content during the exit animation.
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

export default function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-canvas"
      >
        Skip to content
      </a>
      <Seo />
      <Navbar />

      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main
          id="main"
          key={location.pathname}
          className="flex-1"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <FrozenOutlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
