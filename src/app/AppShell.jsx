import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FileText, LogOut, Settings as SettingsIcon, Users } from "lucide-react";
import Logo from "../components/navbar/Logo";
import CreditsMeter from "./components/CreditsMeter";
import { useMe } from "../context/MeContext";
import ThemeToggle from "../components/navbar/ThemeToggle";
import { getSupabase } from "../lib/supabase";

const NAV = [
  { to: "/app", label: "Team", icon: Users, end: true },
  { to: "/app/deliverables", label: "Deliverables", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

const signOut = async () => (await getSupabase())?.auth.signOut();

export default function AppShell() {
  const { me } = useMe();
  return (
    <div className="min-h-screen text-ink">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-canvas">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 md:px-6">
          <NavLink to="/app" aria-label="res workspace home" className="mr-auto sm:mr-0"><Logo className="text-3xl" /></NavLink>
          <nav aria-label="Workspace" className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${isActive ? "bg-brand/15 text-brand-ink ring-1 ring-brand/30" : "text-muted hover:bg-ink/5 hover:text-ink"}`}>
                <Icon size={16} aria-hidden="true" /> <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <CreditsMeter credits={me?.credits} />
          <ThemeToggle />
          <button type="button" onClick={signOut} className="grid h-11 w-11 place-items-center rounded-full border border-transparent text-muted transition hover:border-line-strong hover:bg-ink/5 hover:text-ink" aria-label="Sign out">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main id="app-main" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
