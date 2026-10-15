import React from "react";
import { Code, Gauge, ShieldCheck, TrendingUp } from "lucide-react";
import ServiceDetail from "../components/ui/ServiceDetail";

export default function WebsiteManagement() {
  return (
    <ServiceDetail
      eyebrow="Digital presence"
      title={<>Website management & <span className="hl">growth.</span></>}
      intro="Your website is your most important employee. We keep it fast, secure, and constantly evolving with full-stack development and proactive maintenance."
      outcomes={[
        { value: "99.9%", label: "Uptime target" },
        { value: "< 2s", label: "Page-load goal" },
        { value: "24/7", label: "Security monitoring" },
      ]}
      features={[
        {
          icon: ShieldCheck,
          title: "24/7 uptime & security monitoring",
          body: "We watch your site so you don't have to, instant alerts for downtime and proactive defence against threats and vulnerabilities.",
        },
        {
          icon: Gauge,
          title: "Performance & speed optimization",
          body: "A slow site kills conversions. We continuously optimize images, code, and server response times for lightning-fast loads worldwide.",
        },
        {
          icon: Code,
          title: "Full-stack custom development",
          body: "Need a new feature? We handle everything from React front-ends to Node.js back-ends, integrations, and database management.",
        },
        {
          icon: TrendingUp,
          title: "Content updates & SEO",
          body: "Keep your site fresh without lifting a finger. We handle routine updates and make sure technical SEO best practices are always met.",
        },
      ]}
      process={{
        title: "A website that looks after itself.",
        body: "Hand over the technical headaches, we run your site like it's our own.",
        steps: [
          { title: "Health check", body: "A full audit of speed, security, SEO, and accessibility with a prioritized fix list.", points: ["Lighthouse audit", "Security scan"] },
          { title: "Fix & improve", body: "We clear the backlog, harden security, and ship quick performance wins.", points: ["Core Web Vitals", "Backups"] },
          { title: "Ongoing care", body: "Monthly updates, monitoring, and new features on request, with clear reporting.", points: ["Monthly report", "Priority support"] },
        ],
      }}
      cta={{
        title: "Make sure your digital storefront never closes.",
        body: "Let our team handle the technical side so you can focus on growing your business.",
        primary: { to: "/contact", label: "Contact us" },
        secondary: { to: "/services", label: "All services" },
      }}
    />
  );
}
