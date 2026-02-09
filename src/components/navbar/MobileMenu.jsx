import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MobileMenu({ isOpen, onClose, onOpenGetStarted }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "100vh" }}
          exit={{ opacity: 0, height: 0 }}
          className="fixed inset-0 z-9998 bg-black/95 backdrop-blur-xl flex flex-col pt-32 px-8 overflow-y-auto"
        >
          <div className="flex flex-col space-y-8 text-2xl font-bold uppercase tracking-widest text-white pb-10">
            <Link to="/" onClick={onClose} className="hover:text-red-600 transition">Home</Link>

            <div className="flex flex-col space-y-4 pl-4 border-l border-white/10">
              <Link to="/crm" onClick={onClose} className="text-sm text-zinc-400 hover:text-red-500">CRM</Link>
              <Link to="/website-management" onClick={onClose} className="text-sm text-zinc-400 hover:text-red-500">Website Mgmt</Link>
              <Link to="/agents" onClick={onClose} className="text-sm text-zinc-400 hover:text-red-500">AI Agents</Link>
            </div>

            <Link to="/agents" onClick={onClose} className="hover:text-red-600 transition">Agents Team</Link>
            <Link to="/pricing" onClick={onClose} className="hover:text-red-600 transition">Pricing</Link>
            <Link to="/about" onClick={onClose} className="hover:text-red-600 transition">About</Link>
            <Link to="/contact" onClick={onClose} className="hover:text-red-600 transition">Contact</Link>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenGetStarted();
            }}
            className="mb-10 w-full bg-red-600 text-white py-5 rounded-full font-black uppercase tracking-widest text-sm shrink-0"
          >
            Get Started
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
