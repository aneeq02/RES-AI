import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FileText, LogOut, Settings as SettingsIcon, Users } from "lucide-react";
import Logo from "../components/navbar/Logo";
import CreditsMeter from "./components/CreditsMeter";
import { useMe } from "../context/MeContext";
import { supabase } from "../lib/supabase";

const NAV = [
  { to: "/app", label: "Team", icon: Users, end: true },
  { to: "/app/deliverables", label: "Deliverables", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppShell() {
  const { me } = useMe();
  return (
    <div className="min-h-screen bg-black text-white">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-black">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <NavLink to="/app" aria-label="res workspace home"><Logo className="text-3xl" /></NavLink>
          <nav aria-label="Workspace" className="flex flex-1 gap-1 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${isActive ? "bg-white/10 text-white" : "text-muted hover:text-white"}`}>
                <Icon size={16} aria-hidden="true" /> <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
          <CreditsMeter credits={me?.credits} />
          <button type="button" onClick={() => supabase?.auth.signOut()} className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-white" aria-label="Sign out">
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
