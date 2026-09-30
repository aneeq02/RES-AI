import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

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
if (container.firstElementChild && !clientOnly) {
  // Drop the prerendered head tags; <Seo> re-creates the right ones for the current URL
  // (avoids duplicates if a host ever serves one page's HTML for another URL).
  document.head.querySelectorAll("[data-ssr]").forEach((n) => n.remove());
  ReactDOM.hydrateRoot(container, app);
} else {
  container.replaceChildren();
  ReactDOM.createRoot(container).render(app);
}
