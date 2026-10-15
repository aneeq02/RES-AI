import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import Logo from "../navbar/Logo";
import { CONTACT, NAV_LINKS, SERVICE_LINKS } from "../../data/nav";

function Column({ title, links }) {
  return (
    <div>
      <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-subtle">{title}</h2>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="inline-flex min-h-9 items-center text-sm text-ink-soft transition hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo className="text-4xl" />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            AI employees that never sleep. Hire specialists that handle the repetitive work so your team can focus on growth.
          </p>
        </div>

        <Column title="Services" links={[...SERVICE_LINKS, { to: "/services", label: "All services" }]} />
        <Column title="Company" links={[{ to: "/", label: "Home" }, ...NAV_LINKS]} />

        <div>
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-subtle">Get in touch</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-9 items-center gap-2 text-ink-soft transition hover:text-ink">
                <Mail size={16} aria-hidden="true" className="text-brand-ink" /> {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-9 items-center gap-2 text-ink-soft transition hover:text-ink">
                <Phone size={16} aria-hidden="true" className="text-brand-ink" /> {CONTACT.phone}
              </a>
            </li>
          </ul>
          <Link to="/pricing" className="btn-primary mt-6 min-h-11 px-6 py-2.5 text-sm">
            See plans
          </Link>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the footer edge */}
      <p
        className="pointer-events-none -mb-[0.22em] select-none text-center font-display text-[clamp(8rem,34vw,32rem)] font-extrabold leading-[0.8] tracking-[-0.07em] text-ink/[0.05]"
        aria-hidden="true"
      >
        res.
      </p>

      <div className="relative border-t border-line bg-canvas/40">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} res. All rights reserved.</p>
          <p>Built for teams that never stop.</p>
        </div>
      </div>
    </footer>
  );
}
