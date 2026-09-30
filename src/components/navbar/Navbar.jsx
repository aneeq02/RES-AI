import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS, SERVICE_LINKS } from "../../data/nav";
import { useGetStarted } from "../../context/GetStartedContext";

const linkClass = ({ isActive }) =>
  `relative py-2 transition-colors duration-200 hover:text-white ${isActive ? "text-white" : "text-muted"}`;

function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const wrapRef = useRef(null);
  const closeTimer = useRef();
  const isActive = pathname === "/services" || SERVICE_LINKS.some((l) => l.to === pathname);

  // Close when the route changes (adjusting state during render, not in an effect)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hover opens on pointer devices; click/keyboard toggles for everyone else.
  const onEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const onLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="services-menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 py-2 uppercase tracking-[0.14em] transition-colors hover:text-white ${isActive ? "text-white" : "text-muted"}`}
      >
        Services
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="services-menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3"
          >
            <div className="rounded-3xl border border-line bg-surface-2/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
              {SERVICE_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block rounded-2xl px-4 py-3 normal-case tracking-normal transition hover:bg-white/5 focus-visible:bg-white/5"
                >
                  <span className="block text-sm font-bold text-white">{l.label}</span>
                  <span className="block text-sm font-normal text-muted">{l.desc}</span>
                </Link>
              ))}
              <Link
                to="/services"
                className="mt-1 block rounded-2xl border-t border-line px-4 py-3 text-xs text-brand-ink transition hover:bg-white/5"
              >
                View all services →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open: openGetStarted } = useGetStarted();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsMobileOpen(false);
  }

  const solid = scrolled || isMobileOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[9999] transition-[background-color,border-color,backdrop-filter] duration-300 ${
          solid ? "border-b border-line bg-black/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav aria-label="Main" className="container-page flex h-18 items-center justify-between md:h-20">
          <Link to="/" className="rounded-lg" aria-label="res home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.14em] lg:flex">
            <ServicesMenu />
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Static link, no auth state: renders the same on the server and the client. */}
            <NavLink to="/login" className={(s) => `${linkClass(s)} mr-3 hidden text-xs font-bold uppercase tracking-[0.14em] lg:inline-flex`}>
              Sign in
            </NavLink>
            <button type="button" onClick={openGetStarted} className="btn-primary hidden min-h-11 px-6 py-2.5 text-xs lg:inline-flex">
              Get Started
            </button>
            <button
              type="button"
              onClick={() => setIsMobileOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              {isMobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} onOpenGetStarted={openGetStarted} />
    </>
  );
}
