import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NAV_LINKS, SERVICE_LINKS, CONTACT } from "../../data/nav";
import useDialog from "../../hooks/useDialog";

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

const bigLink = ({ isActive }) =>
  `block py-2 font-display text-3xl font-bold tracking-tight transition-colors ${isActive ? "text-brand-ink" : "text-white hover:text-brand-ink"}`;

export default function MobileMenu({ isOpen, onClose, onOpenGetStarted }) {
  const ref = useDialog(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-menu"
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 top-18 z-[9998] flex flex-col overflow-y-auto bg-black/95 px-6 pb-8 pt-6 backdrop-blur-xl md:top-20 lg:hidden"
        >
          <motion.ul
            className="flex flex-col gap-1"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.04 }}
          >
            <motion.li variants={item}>
              <NavLink to="/" end className={bigLink}>
                Home
              </NavLink>
            </motion.li>
            <motion.li variants={item} className="my-2 border-l border-line pl-4">
              <NavLink to="/services" className="block py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-subtle">
                Services
              </NavLink>
              {SERVICE_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center text-lg font-semibold transition-colors ${isActive ? "text-brand-ink" : "text-zinc-200 hover:text-white"}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </motion.li>
            {NAV_LINKS.map((l) => (
              <motion.li key={l.to} variants={item}>
                <NavLink to={l.to} className={bigLink}>
                  {l.label}
                </NavLink>
              </motion.li>
            ))}
            <motion.li variants={item}>
              <NavLink to="/login" className={bigLink}>
                Sign in
              </NavLink>
            </motion.li>
          </motion.ul>

          <div className="mt-auto pt-10">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGetStarted();
              }}
              className="btn-primary btn-lg w-full"
            >
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a href={`mailto:${CONTACT.email}`} className="mt-5 block text-center text-sm text-muted hover:text-white">
              {CONTACT.email}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
