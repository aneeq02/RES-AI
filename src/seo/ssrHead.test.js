import { describe, expect, it } from "vitest";
import { removeSsrHead } from "./ssrHead";

describe("removeSsrHead", () => {
  it("removes only the prerendered head tags", () => {
    const head = document.createElement("head");
    head.innerHTML = '<title data-ssr>Old</title><meta data-ssr name="description" content="x"><link rel="icon" href="/f.svg"><meta charset="utf-8">';
    removeSsrHead(head);
    expect(head.querySelectorAll("[data-ssr]").length).toBe(0);
    expect(head.querySelector('link[rel="icon"]')).not.toBeNull();
    expect(head.querySelector("meta[charset]")).not.toBeNull();
  });
});
