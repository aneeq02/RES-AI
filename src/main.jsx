import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { removeSsrHead } from "./seo/ssrHead";

const container = document.getElementById("root");
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Production pages are prerendered to static HTML (scripts/prerender.mjs), so hydrate
// them; the dev server serves an empty root, and /app is client-only, so render from scratch there.
const clientOnly = window.location.pathname.startsWith("/app");
// Drop the prerendered head tags on every path: <Seo> re-creates the right ones for marketing
// URLs, and /app (often served a marketing page's HTML by SPA fallbacks) sets its own.
removeSsrHead();

// Cursor spotlight: feed the pointer position to whichever .spot element it is over.
document.addEventListener(
  "pointermove",
  (e) => {
    const el = e.target instanceof Element ? e.target.closest(".spot") : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  },
  { passive: true },
);
if (container.firstElementChild && !clientOnly) {
  ReactDOM.hydrateRoot(container, app);
} else {
  container.replaceChildren();
  ReactDOM.createRoot(container).render(app);
}
