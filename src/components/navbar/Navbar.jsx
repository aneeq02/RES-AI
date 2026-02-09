import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

export default function Navbar({ onOpenGetStarted }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-9999 px-6 md:px-8 py-5 flex justify-between items-center transition-all duration-500 ${
          scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <Link to="/"><Logo /></Link>

        <div className="hidden lg:flex space-x-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500 items-center">
          <div className="relative group py-2">
            <Link to="/services" className="hover:text-white transition flex items-center gap-1 cursor-pointer">
              Services <span className="text-[8px] opacity-40 group-hover:rotate-180 transition-transform duration-300">▼</span>
            </Link>

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
              <div className="glass-panel bg-black/95 rounded-4xl p-6 w-50 border border-white/10 text-white flex flex-col gap-4 shadow-2xl">
                <Link to="/crm" className="hover:text-red-500 transition">CRM</Link>
                <Link to="/website-management" className="hover:text-red-500 transition">Website Management</Link>
                <Link to="/agents" className="text-red-500 hover:text-white transition">AI Agents</Link>
              </div>
            </div>
          </div>

          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link to="/faq" className="hover:text-white transition">FAQ</Link>
          <Link to="/contact" className="hover:text-white transition">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileOpen((v) => !v)} className="lg:hidden text-white z-10000">
            {isMobileOpen ? "✕" : "☰"}
          </button>

          <button
            onClick={onOpenGetStarted}
            className="hidden lg:block bg-red-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase hover:bg-red-700 transition hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        onOpenGetStarted={onOpenGetStarted}
      />
    </>
  );
}
