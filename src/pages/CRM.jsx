import React from "react";
import { ChartColumn, Filter, Plug, Send } from "lucide-react";
import ServiceDetail from "../components/ui/ServiceDetail";

export default function CRM() {
  return (
    <ServiceDetail
      eyebrow="Intelligent pipelines"
      title={<>CRM solutions that <span className="text-brand-ink">close deals.</span></>}
      intro="Stop losing leads to slow responses. Our AI-powered CRM systems plug into your workflow so every opportunity is captured, nurtured, and converted automatically."
      outcomes={[
        { value: "< 1 min", label: "Lead response time" },
        { value: "24/7", label: "Automated follow-ups" },
        { value: "100%", label: "Leads tracked" },
      ]}
      features={[
        {
          icon: Send,
          title: "Automated outreach",
          body: "Forget manual follow-ups. Agents send personalized emails and texts the moment a lead enters your pipeline, keeping them engaged around the clock.",
        },
        {
          icon: Filter,
          title: "Smart lead scoring",
          body: "AI analyzes prospect behaviour to prioritize your hottest leads, so your human team spends its energy on people ready to buy now.",
        },
        {
          icon: Plug,
          title: "Seamless integration",
          body: "Works where you work. Connects with Slack, Gmail, Outlook, HubSpot, and Salesforce without disrupting your current operations.",
        },
        {
          icon: ChartColumn,
          title: "Visual pipeline & analytics",
          body: "A clear bird's-eye view of your funnel. Track performance, spot bottlenecks, and forecast revenue with real-time dashboards.",
        },
      ]}
      process={{
        title: "From first click to closed deal.",
        body: "We set up, migrate, and automate your pipeline — then keep improving it.",
        steps: [
          { title: "Audit & plan", body: "We map your current sales process and find where leads are slipping through.", points: ["Pipeline review", "Tool audit"] },
          { title: "Build & migrate", body: "Your CRM is configured, your data moved over, and automations switched on.", points: ["Data migration", "Custom stages"] },
          { title: "Automate & optimize", body: "AI agents take over follow-ups while we tune scoring and reporting monthly.", points: ["Monthly reports", "A/B testing"] },
        ],
      }}
      cta={{
        title: "Ready to upgrade your sales stack?",
        body: "Book a demo and see how an AI-powered CRM can lift your conversion rates.",
        primary: { to: "/contact", label: "Book a demo" },
        secondary: { to: "/pricing", label: "See pricing" },
      }}
    />
  );
}
