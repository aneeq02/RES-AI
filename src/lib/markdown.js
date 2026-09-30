import { marked } from "marked";
import DOMPurify from "dompurify";

/** Markdown → sanitized HTML. Deliverables quote the web, so everything is treated as hostile. */
export function renderMarkdown(text) {
  const html = marked.parse(text ?? "", { async: false, gfm: true });
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
