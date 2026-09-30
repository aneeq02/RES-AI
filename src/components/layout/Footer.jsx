import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import Logo from "../navbar/Logo";
import { CONTACT, NAV_LINKS, SERVICE_LINKS } from "../../data/nav";

function Column({ title, links }) {
  return (
    <div>
      <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.16em] text-subtle">{title}</h2>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="inline-flex min-h-9 items-center text-sm text-zinc-300 transition hover:text-white">
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
    <footer className="border-t border-line bg-surface">
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
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.16em] text-subtle">Get in touch</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-9 items-center gap-2 text-zinc-300 transition hover:text-white">
                <Mail size={16} aria-hidden="true" className="text-brand-ink" /> {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-9 items-center gap-2 text-zinc-300 transition hover:text-white">
                <Phone size={16} aria-hidden="true" className="text-brand-ink" /> {CONTACT.phone}
              </a>
            </li>
          </ul>
          <Link to="/pricing" className="btn-primary mt-6 min-h-11 px-6 py-2.5 text-xs">
            See plans
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} res. All rights reserved.</p>
          <p>Built for teams that never stop.</p>
        </div>
      </div>
    </footer>
  );
}
