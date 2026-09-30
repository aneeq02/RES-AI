// Static prerender (SSG): renders every route to real HTML so search engines and
// AI crawlers get full content, per-page meta tags and JSON-LD without running JS.
// Also writes sitemap.xml, robots.txt and llms.txt. Run via `npm run build`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render, ROUTES, INDEXABLE_PATHS, SITE_URL } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

// React 19 emits hoistable head tags (<title>, <meta>, <link>) at the start of the
// rendered string; move them into <head> and keep the rest as the app markup.
const HEAD_TAG = /^(?:<title>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>)/;
function splitHead(html) {
  let head = "";
  let m;
  while ((m = html.match(HEAD_TAG))) {
    head += m[0];
    html = html.slice(m[0].length);
  }
  return { head, body: html };
}

function writePage(url, outFile) {
  const { head, body } = splitHead(render(url));
  // data-ssr marks the static tags so the client can swap them for React's own on hydrate
  const marked = head.replace(/<(title|meta|link)(?=[\s>])/g, "<$1 data-ssr");
  const html = template.replace("<!--app-head-->", marked).replace("<!--app-html-->", body);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
  return { url, bytes: Buffer.byteLength(html), title: head.match(/<title>(.*?)<\/title>/)?.[1] };
}

const results = [];
for (const route of Object.keys(ROUTES)) {
  if (route === "/404") continue;
  // Flat files (pricing.html) so clean, slash-less URLs like /pricing resolve on
  // static hosts (Netlify, Cloudflare Pages, GitHub Pages, Vercel cleanUrls, vite preview).
  const out = route === "/" ? path.join(dist, "index.html") : path.join(dist, `${route.slice(1)}.html`);
  results.push(writePage(route, out));
}
// Real 404 page for unknown URLs (static hosts serve 404.html with a 404 status).
results.push(writePage("/__not-found__", path.join(dist, "404.html")));

// sitemap.xml — indexable routes only
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${INDEXABLE_PATHS.map(
  (p) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${ROUTES[p].changefreq}</changefreq>
    <priority>${ROUTES[p].priority.toFixed(1)}</priority>
  </url>`,
).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

// robots.txt — open to search engines and AI search/answer crawlers; checkout stays out of the index.
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `# res — ${SITE_URL}
User-agent: *
Allow: /
Disallow: /checkout

# AI search & answer engines are welcome (citations in ChatGPT, Claude, Perplexity, Gemini).
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
Allow: /
Disallow: /checkout

Sitemap: ${SITE_URL}/sitemap.xml
`,
);

// llms.txt — optional curated map for LLM tools (no ranking weight, cheap to provide).
fs.writeFileSync(
  path.join(dist, "llms.txt"),
  `# res

> res provides AI employees: 12 specialist AI agents (social media, customer support, data analysis, email marketing, copywriting, SEO, sales, recruiting, eCommerce, strategy, personal growth and virtual assistance) that work 24/7 inside tools like Gmail, Slack, Notion and HubSpot. Plans start at $15.60/month for the whole team. res also offers AI-powered CRM and website management services.

## Pages
${INDEXABLE_PATHS.map((p) => `- [${ROUTES[p].title}](${SITE_URL}${p}): ${ROUTES[p].description}`).join("\n")}

## Contact
- Email: hello@res.ai
`,
);

fs.rmSync(ssrDir, { recursive: true, force: true });

for (const r of results) console.log(`  ${r.url.padEnd(22)} ${(r.bytes / 1024).toFixed(1).padStart(6)} kB  ${r.title}`);
console.log(`  + sitemap.xml (${INDEXABLE_PATHS.length} urls), robots.txt, llms.txt  →  ${SITE_URL}`);
