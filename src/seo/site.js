// Single source of truth for everything search engines and AI crawlers read.
// Set VITE_SITE_URL in a .env file to the real production domain before deploying.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://res.ai").replace(/\/$/, "");
export const SITE_NAME = "res";
export const DEFAULT_OG_IMAGE = "/og-image.png"; // 1200x630
export const ORG_EMAIL = "hello@res.ai";
export const ORG_PHONE = "+1-555-000-0000";

export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "/" : path}`;

/**
 * Per-route metadata. Titles aim for 50–60 characters and descriptions for
 * 150–160, each unique and written for the page's search intent.
 * `index: false` keeps a page out of search results and the sitemap.
 */
export const ROUTES = {
  "/": {
    title: "res — AI Employees for Your Business That Never Sleep",
    description:
      "Hire AI employees for social media, customer support, sales, SEO and data. 12 specialists work 24/7 in your tools, from $15.60/month. Set up in 5 minutes.",
    changefreq: "weekly",
    priority: 1.0,
  },
  "/agents": {
    title: "AI Agents: 12 Specialists for Marketing, Sales & Ops | res",
    description:
      "Meet 12 AI agents for social media, email marketing, SEO, customer support, sales, recruiting and data analysis. See their skills and hire one in minutes.",
    breadcrumb: "AI Agents",
    changefreq: "monthly",
    priority: 0.9,
  },
  "/pricing": {
    title: "Pricing: AI Employees From $15.60/Month | res",
    description:
      "Simple pricing for the full team of 12 AI employees. Plans from $15.60/month with brand voice training, integrations and a 14-day money-back guarantee.",
    breadcrumb: "Pricing",
    changefreq: "monthly",
    priority: 0.9,
  },
  "/services": {
    title: "AI Automation Services: Agents, CRM & Web Management | res",
    description:
      "Explore res services: AI agents that work 24/7, AI-powered CRM pipelines that follow up automatically, and full website management with monitoring and SEO.",
    breadcrumb: "Services",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/crm": {
    title: "AI-Powered CRM: Automated Outreach & Lead Scoring | res",
    description:
      "Close more deals with an AI-powered CRM. Automated follow-ups in under a minute, smart lead scoring, and HubSpot, Salesforce, Gmail and Slack integration.",
    breadcrumb: "CRM",
    parent: "/services",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/website-management": {
    title: "Website Management, Maintenance & SEO Services | res",
    description:
      "Website management that keeps your site fast, secure and up to date: 24/7 uptime monitoring, speed optimization, custom development and ongoing SEO.",
    breadcrumb: "Website Management",
    parent: "/services",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/about": {
    title: "About res: Building the AI Workforce of the Future",
    description:
      "res gives small teams instant access to AI specialists that are trained, private by default and ready from day one. Learn why we exist and what we believe.",
    breadcrumb: "About",
    changefreq: "yearly",
    priority: 0.6,
  },
  "/faq": {
    title: "FAQ: How res AI Employees Work, Data Security & Billing",
    description:
      "Answers about res AI employees: tool integrations, setup without code, custom agent personalities, data security, which agents are included and cancelling.",
    breadcrumb: "FAQ",
    changefreq: "monthly",
    priority: 0.6,
  },
  "/contact": {
    title: "Contact res: Talk to Our Onboarding Team",
    description:
      "Questions about AI agents, CRM or website management? Contact the res onboarding team by email, phone or form. We reply within one business day.",
    breadcrumb: "Contact",
    changefreq: "yearly",
    priority: 0.5,
  },
  "/checkout": {
    title: "Checkout | res",
    description: "Complete your res order.",
    index: false,
  },
  "/404": {
    title: "Page Not Found | res",
    description: "The page you were looking for doesn't exist.",
    index: false,
  },
};

export const INDEXABLE_PATHS = Object.keys(ROUTES).filter((p) => ROUTES[p].index !== false);
export const getRouteMeta = (path) => ROUTES[path] || ROUTES["/404"];
