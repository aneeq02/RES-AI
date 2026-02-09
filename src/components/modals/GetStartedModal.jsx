import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../navbar/Logo";

export default function GetStartedModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-panel bg-zinc-900 w-full max-w-md p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition">
              ✕
            </button>

            <div className="mb-2">
              <Logo />
            </div>
            <p className="text-zinc-500 mb-8 text-sm lowercase tracking-tight">
              Start your journey with autonomous AI helpers.
            </p>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Work email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-red-600 transition"
              />
              <Link to="/checkout" onClick={onClose}>
                <button className="w-full mt-4 bg-red-600 text-white py-4 rounded-full font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition uppercase text-xs tracking-widest">
                  Create Account
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
