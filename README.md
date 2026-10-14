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

## Running the app (agents, accounts, billing)

The marketing site runs on its own. To run the signed-in app (`/app`) you also need the API in `server/`, a Supabase project and a Stripe test account. Both are free.

1. Create a free Supabase project. Under Authentication → URL configuration, add `http://localhost:5173/auth/callback` to the redirect URLs. Optionally enable the Google provider.
2. Copy `server/.env.example` → `server/.env` and fill it in: the **session pooler** connection string (port 5432), the service-role key, a Stripe **test** secret key (`sk_test_…`) and an Anthropic API key. Never commit these files.
3. Copy `.env.example` → `.env` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_API_URL`.
4. `npm install && npm --prefix server install`, then `npm --prefix server run migrate` and `npm --prefix server run stripe:setup`.
5. Run `npm run dev:api` and `npm run dev` in two terminals.
6. Pay with Stripe's test card `4242 4242 4242 4242`, any future date, any CVC. The success page confirms the subscription through `/billing/sync`. For webhooks, run `stripe listen --forward-to localhost:8787/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.
7. Tests: `npm test` (frontend) and `npm --prefix server test` (server, no network). `npm --prefix server run test:live` spends real API credits and needs `ANTHROPIC_API_KEY` exported.
8. Deploying: `/app/*` must fall back to `index.html` (SPA rewrite). The API needs a long-running Node host (Railway, Render or Fly), not serverless functions.

### Running without an Anthropic key (`FAKE_AI`)

Set `FAKE_AI=true` in `server/.env` (leave `ANTHROPIC_API_KEY` empty) to run the whole product with scripted replies and no spend: sign-in, onboarding, "fill from my website", Stripe checkout, streaming chat, task approval with live progress, saved deliverables and credit accounting all work. Ask Buddy to *research*, *analyze* or *compare* something to get a task proposal. Put `[fail]` in a request to see the failure and refund path.

Replies are scripted, so this says nothing about the real model's answers, web search or token costs. The server logs a warning when it is on and refuses to start with `FAKE_AI=true` and `NODE_ENV=production`.

## Project structure

```
server/                     Node API (Hono + pg-boss + Stripe + Anthropic); see src/ for http, chat, runner, billing, fake
supabase/migrations/         database schema, applied by `npm --prefix server run migrate`
src/
  app/                       signed-in workspace (/app): team, chat, task cards, deliverables, settings, onboarding
  lib/                       api client, SSE parser, safe URLs, markdown sanitizer, subscription helpers
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

Tokens live in `src/index.css`: raw palette variables per theme (`:root` for **Midnight**, `[data-theme="light"]` for **Paper**) mapped to Tailwind utilities in `@theme inline` (`canvas`, `surface`, `ink`, `muted`, `line`, `brand`, `cta`). Acid-lime is the signal colour. Headings use **Bricolage Grotesque**, body text **Instrument Sans**, labels **JetBrains Mono**. Reusable utilities: `btn-primary`, `btn-secondary`, `btn-light`, `card`, `card-hover`, `spot` (cursor spotlight), `hl` (highlighted headline words), `kicker`, `field`, `eyebrow`, `container-page`. A theme toggle in the navbar and app header stores the choice in `localStorage` (`res-theme`), applied before first paint by an inline script in `index.html`.

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
