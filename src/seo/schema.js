// JSON-LD builders. Only markup types Google still supports are used:
// no FAQPage/HowTo (rich results retired) and no self-serving Review markup.
import { SITE_URL, SITE_NAME, ORG_EMAIL, ORG_PHONE, ROUTES, absoluteUrl } from "./site";
import { members } from "../data/members";
import { plans } from "../data/plans";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: { "@type": "ImageObject", url: absoluteUrl("/logo.jpeg"), width: 1024, height: 1024 },
  description: "res provides AI employees — 12 specialist AI agents — plus AI-powered CRM and website management services.",
  email: ORG_EMAIL,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: ORG_EMAIL,
    telephone: ORG_PHONE,
    availableLanguage: ["English"],
  },
};

const website = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: absoluteUrl("/"),
  name: SITE_NAME,
  publisher: { "@id": ORG_ID },
  inLanguage: "en",
};

function breadcrumb(path) {
  const meta = ROUTES[path];
  if (!meta?.breadcrumb) return null;
  const trail = [{ name: "Home", path: "/" }];
  if (meta.parent) trail.push({ name: ROUTES[meta.parent].breadcrumb, path: meta.parent });
  trail.push({ name: meta.breadcrumb, path });
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absoluteUrl(t.path) })),
  };
}

const webPage = (path, type = "WebPage") => ({
  "@type": type,
  "@id": `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: ROUTES[path].title,
  description: ROUTES[path].description,
  isPartOf: { "@id": SITE_ID },
  about: { "@id": ORG_ID },
  inLanguage: "en",
});

const service = (path, name, serviceType, description, extra = {}) => ({
  "@type": "Service",
  "@id": `${absoluteUrl(path)}#service`,
  name,
  serviceType,
  description,
  provider: { "@id": ORG_ID },
  areaServed: "Worldwide",
  url: absoluteUrl(path),
  ...extra,
});

const offers = () =>
  plans.map((p) => ({
    "@type": "Offer",
    name: p.name,
    price: (p.price * p.months).toFixed(2),
    priceCurrency: "USD",
    url: absoluteUrl("/pricing"),
    availability: "https://schema.org/InStock",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: p.price.toFixed(2),
      priceCurrency: "USD",
      unitCode: "MON",
      billingDuration: p.months,
    },
  }));

const agentCatalog = () => ({
  "@type": "OfferCatalog",
  name: "AI Agents",
  itemListElement: members.map((m) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: `${m.name} — AI ${m.role}`,
      description: m.description,
      serviceType: m.role,
      ...(m.img ? { image: absoluteUrl(m.img.replace(/\.png$/, ".webp")) } : {}),
    },
  })),
});

const PAGE_SCHEMA = {
  "/": () => [organization, website, webPage("/"), service("/agents", "res AI Employees", "AI agents", ROUTES["/agents"].description, { hasOfferCatalog: agentCatalog() })],
  "/agents": () => [
    webPage("/agents", "CollectionPage"),
    service("/agents", "res AI Employees", "AI agents", ROUTES["/agents"].description, { hasOfferCatalog: agentCatalog() }),
  ],
  "/pricing": () => [
    webPage("/pricing"),
    service("/pricing", "res AI Employees subscription", "AI agents", "Subscription to the full team of 12 res AI employees.", { offers: offers() }),
  ],
  "/services": () => [webPage("/services", "CollectionPage")],
  "/crm": () => [webPage("/crm"), service("/crm", "AI-Powered CRM", "CRM implementation and automation", ROUTES["/crm"].description)],
  "/website-management": () => [
    webPage("/website-management"),
    service("/website-management", "Website Management", "Website maintenance, development and SEO", ROUTES["/website-management"].description),
  ],
  "/about": () => [webPage("/about", "AboutPage"), organization],
  "/faq": () => [webPage("/faq")],
  "/contact": () => [webPage("/contact", "ContactPage"), organization],
};

/** Full JSON-LD graph for a route, or null for non-indexable pages. */
export function schemaFor(path) {
  const build = PAGE_SCHEMA[path];
  if (!build) return null;
  const graph = [...build(), breadcrumb(path)].filter(Boolean);
  return { "@context": "https://schema.org", "@graph": graph };
}
