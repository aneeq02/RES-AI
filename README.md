# res — AI employees that never sleep

Marketing site for **res**: a team of 12 AI specialists (social, support, data, email, SEO, sales…) plus CRM and website-management services.

Built with React 19, Vite 7, Tailwind CSS v4, Framer Motion, React Router 7 and lucide-react icons.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Project structure

```
src/
  animations/variants.js     shared Framer Motion variants
  components/
    agents/AgentAvatar.jsx   agent artwork, falls back to a role icon
    forms/Field.jsx          labelled input with inline accessible errors
    home/                    AgentsCarousel, ChatDemo (streaming chat demo)
    layout/Footer.jsx
    modals/GetStartedModal.jsx
    navbar/                  Navbar (accessible Services menu), MobileMenu, Logo
    ui/                      SectionHeading, CTASection, FaqList, ServiceDetail, AutoVideo
  context/GetStartedContext.jsx   open the "Get started" modal from anywhere
  data/                      members, plans, faqs, nav — edit content here
  hooks/                     useDialog (focus trap / Esc / scroll lock), useHashScroll
  layout/RootLayout.jsx      persistent navbar/footer + page transitions
  pages/                     one file per route (+ NotFound)
  utils/validation.js
```

## Design system

Tokens live in `src/index.css` (`@theme`): black surfaces, brand red `#dc2626` for fills (white text 4.8:1) and `#ff4d4d` for red text on dark (6.4:1). Headings use **Space Grotesk**, body text **DM Sans**. Reusable utilities: `btn-primary`, `btn-secondary`, `btn-light`, `card`, `field`, `eyebrow`, `container-page`.

Accessibility: visible focus rings, skip link, keyboard-operable menus/modals with focus trap, 44px touch targets, `prefers-reduced-motion` respected (animations, auto-playing video and the chat demo).

## SEO

Audited against the [claude-seo](https://github.com/AgriciDaniel/claude-seo) checklists (technical, schema, on-page, images, GEO).

- **Prerendered HTML (SSG):** `npm run build` renders every route to static HTML (`scripts/prerender.mjs` + `src/entry-server.jsx`), so crawlers and AI engines get full content without running JavaScript. The browser then hydrates it.
- **Per-page metadata:** titles, descriptions, canonical URLs, Open Graph/Twitter tags and robots rules live in `src/seo/site.js`; `src/seo/Seo.jsx` renders them.
- **Structured data (JSON-LD):** Organization, WebSite, WebPage, Service, Offer and BreadcrumbList, built in `src/seo/schema.js`. FAQPage/HowTo and self-written reviews are deliberately not marked up (Google retired or disallows those).
- **Generated at build:** `sitemap.xml`, `robots.txt` (search and AI search crawlers allowed, `/checkout` blocked), `llms.txt`, and a real `404.html` with `noindex`.
- **Images:** agents served as WebP (~85% smaller) with width/height set; 1200×630 share image at `public/og-image.png`.

**Before deploying:** set the real domain in a `.env` file (`VITE_SITE_URL=https://your-domain.com`); it defaults to `https://res.ai`. Deploy the `dist/` folder to a static host. Pages are written as flat files (`pricing.html`), which Netlify, Cloudflare Pages, GitHub Pages and vite preview serve at `/pricing`; on Vercel, enable `"cleanUrls": true`. After launch, submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Adding agent artwork

All 12 agents have artwork in `public/agents/` (408×612 transparent PNGs). To add a new agent's image, put it in `public/agents/<id>.png` and set `img: "/agents/<id>.png"` in `src/data/members.js`; agents without an image fall back to a role icon.

`scripts/generate_agents.py` helps make matching artwork: `--process` removes the white background from images saved in `scripts/agent-drafts/` and sizes them to match. Without flags it generates via the Gemini API (needs `GEMINI_API_KEY` with billing enabled).

## Not wired up yet (TODO)

- **Checkout** confirms the order in the UI only — connect a payment provider (e.g. Stripe Checkout) in `src/pages/Checkout.jsx`. Card details are intentionally never collected on this site.
- **Contact form** shows a success state only — POST it to a form service or API in `src/pages/Contact.jsx`.
