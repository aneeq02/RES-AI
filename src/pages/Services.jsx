import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Globe, Users } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import CTASection from "../components/ui/CTASection";
import { inViewStagger, itemStagger } from "../animations/variants";

const SERVICES = [
  {
    to: "/agents",
    icon: Bot,
    title: "AI Agents",
    body: "Meet our team of 12 AI employees — social, support, sales, SEO, data and more — ready to work for you 24/7.",
    points: ["12 specialists", "Brand-voice trained", "From $15.60/mo"],
    featured: true,
  },
  {
    to: "/crm",
    icon: Users,
    title: "CRM",
    body: "Connect your entire sales pipeline with automated follow-ups, lead scoring, and clear reporting.",
    points: ["Automated outreach", "Lead scoring", "Pipeline analytics"],
  },
  {
    to: "/website-management",
    icon: Globe,
    title: "Website Management",
    body: "Full-stack development and maintenance so your digital storefront is fast, secure, and always up to date.",
    points: ["24/7 monitoring", "Speed & SEO", "Custom features"],
  },
];

export default function Services() {
  return (
    <>
      <section className="container-page pb-10 pt-32 md:pt-40">
        <SectionHeading as="h1" eyebrow="What we do" title="Our services">
          Everything you need to automate your workflow — from AI employees to the systems they run on.
        </SectionHeading>

        <motion.ul {...inViewStagger} className="mt-16 grid gap-6 lg:grid-cols-3">
          {SERVICES.map(({ to, icon: Icon, title, body, points, featured }) => (
            <motion.li key={to} variants={itemStagger}>
              <Link
                to={to}
                className={`group flex h-full flex-col rounded-[2rem] border p-8 transition duration-300 md:p-10 ${
                  featured ? "border-brand/50 bg-gradient-to-b from-brand/15 to-surface-2" : "border-line bg-surface-2/70 hover:border-brand/40 hover:bg-surface-3"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl ${featured ? "bg-brand text-on-brand" : "border border-line bg-ink/5 text-brand-ink"}`}>
                    <Icon size={26} aria-hidden="true" />
                  </div>
                  <ArrowRight size={24} className="text-subtle transition group-hover:translate-x-1 group-hover:text-ink" aria-hidden="true" />
                </div>
                <h2 className="mt-8 text-3xl font-bold tracking-tight">{title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{body}</p>
                <ul className="mt-auto flex flex-wrap gap-2 pt-8">
                  {points.map((p) => (
                    <li key={p} className="rounded-full border border-line bg-canvas/30 px-3 py-1.5 text-xs font-medium text-ink-soft">
                      {p}
                    </li>
                  ))}
                </ul>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <CTASection title="Not sure where to start?" body="Tell us what's slowing your team down and we'll recommend the right mix." primary={{ to: "/contact", label: "Get a recommendation" }} secondary={{ to: "/pricing", label: "See pricing" }} />
    </>
  );
}
