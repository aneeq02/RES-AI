import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders tables and links", () => {
    const html = renderMarkdown("| a | b |\n|---|---|\n| 1 | [x](https://x.test) |");
    expect(html).toContain("<table>");
    expect(html).toContain('href="https://x.test"');
  });

  it("strips script and event handlers copied from scraped pages", () => {
    const html = renderMarkdown('Hi <script>alert(1)</script><img src=x onerror="alert(2)"> [bad](javascript:alert(3))');
    expect(html).not.toMatch(/<script|onerror|javascript:/i);
  });
});
