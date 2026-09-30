import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import Logo from "../navbar/Logo";
import Field from "../forms/Field";
import useDialog from "../../hooks/useDialog";
import { email as emailRule } from "../../utils/validation";

const PERKS = ["All 12 specialists included", "Setup in under 5 minutes", "14-day money-back guarantee"];

export default function GetStartedModal({ isOpen, onClose }) {
  const ref = useDialog(isOpen, onClose);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState();

  const submit = (e) => {
    e.preventDefault();
    const msg = emailRule(email);
    setError(msg);
    if (msg) return;
    onClose();
    navigate("/checkout", { state: { email: email.trim() } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="get-started-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-[2rem] border border-line bg-surface-2 p-8 shadow-2xl sm:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <Logo className="text-4xl" />
            <h2 id="get-started-title" className="mt-4 text-2xl font-bold tracking-tight">
              Start building your AI team
            </h2>
            <p className="mt-2 text-sm text-muted">Tell us where to send your workspace invite.</p>

            <ul className="mt-6 space-y-2">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-zinc-200">
                  <Check size={16} className="text-brand-ink" aria-hidden="true" /> {p}
                </li>
              ))}
            </ul>

            <form onSubmit={submit} noValidate className="mt-8 space-y-4">
              <Field
                label="Work email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(undefined);
                }}
                error={error}
                data-autofocus
              />
              <button type="submit" className="btn-primary w-full">
                Continue <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
