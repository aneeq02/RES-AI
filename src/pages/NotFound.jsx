import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AgentAvatar from "../components/agents/AgentAvatar";
import { getMember } from "../data/members";

export default function NotFound() {
  return (
    <>
      <section className="container-page grid min-h-[80vh] items-center gap-10 pb-20 pt-32 md:grid-cols-2">
        <div>
          <p className="font-display text-8xl font-bold tracking-tight text-brand-ink md:text-9xl">404</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Even our agents couldn't find this page.</h1>
          <p className="mt-4 max-w-md text-lg text-muted">It may have moved, or the link might be mistyped. Let's get you back on track.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="btn-primary">
              <ArrowLeft size={18} aria-hidden="true" /> Back home
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact support
            </Link>
          </div>
        </div>
        <AgentAvatar member={getMember("vizzy")} className="mx-auto aspect-square w-full max-w-sm rounded-[2.5rem] border border-line" />
      </section>
    </>
  );
}
