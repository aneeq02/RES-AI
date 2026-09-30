/**
 * Drops the prerendered head tags (marked data-ssr by scripts/prerender.mjs). <Seo> re-creates the
 * right ones for the current URL, and /app sets its own; leaving them would duplicate or contradict
 * (e.g. a host serving a marketing page's HTML for an /app URL keeps its indexable meta).
 */
export function removeSsrHead(head = document.head) {
  head.querySelectorAll("[data-ssr]").forEach((n) => n.remove());
}
