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
// them; the dev server serves an empty root, so render from scratch there.
if (container.firstElementChild) {
  // Drop the prerendered head tags; <Seo> re-creates the right ones for the current URL
  // (avoids duplicates if a host ever serves one page's HTML for another URL).
  document.head.querySelectorAll("[data-ssr]").forEach((n) => n.remove());
  ReactDOM.hydrateRoot(container, app);
}
else ReactDOM.createRoot(container).render(app);
