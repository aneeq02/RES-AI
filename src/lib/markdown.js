import { marked } from "marked";
import DOMPurify from "dompurify";

// Only what markdown needs to render text. No media (zero-click beacons), no forms (phishing),
// no style/class (CSS takeover and utility-class overlays), no id/data-* (DOM clobbering).
const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "code", "pre", "blockquote", "strong", "em", "del", "hr", "br",
];
const ALLOWED_ATTR = ["href", "title", "align", "start"];
const CONFIG = { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false };

// A dedicated DOMPurify instance, so the link hook below never touches other DOMPurify users.
let purifier = null;
function getPurifier() {
  if (!purifier) {
    purifier = DOMPurify(window);
    purifier.addHook("afterSanitizeAttributes", (node) => {
      if (node.nodeName !== "A") return;
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow");
    });
  }
  return purifier;
}

/** Markdown → sanitized HTML. Deliverables quote the web, so everything is treated as hostile. */
export function renderMarkdown(text) {
  const html = marked.parse(text ?? "", { async: false, gfm: true });
  return getPurifier().sanitize(html, CONFIG);
}
