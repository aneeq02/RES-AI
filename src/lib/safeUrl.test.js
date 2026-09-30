import { describe, it, expect } from "vitest";
import { safeHref } from "./safeUrl";

describe("safeHref", () => {
  it("returns URL for http:// scheme", () => {
    expect(safeHref("http://example.com")).toBe("http://example.com");
  });

  it("returns URL for https:// scheme", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com");
  });

  it("returns null for javascript: scheme", () => {
    expect(safeHref("javascript:alert('xss')")).toBeNull();
  });

  it("returns null for data: scheme", () => {
    expect(safeHref("data:text/html,<script>alert('xss')</script>")).toBeNull();
  });

  it("returns null for relative URLs", () => {
    expect(safeHref("/path/to/page")).toBeNull();
    expect(safeHref("../relative")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(safeHref("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(safeHref(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(safeHref(undefined)).toBeNull();
  });

  it("is case-insensitive for scheme matching", () => {
    expect(safeHref("HTTP://example.com")).toBe("HTTP://example.com");
    expect(safeHref("HTTPS://example.com")).toBe("HTTPS://example.com");
    expect(safeHref("JAVASCRIPT:alert('xss')")).toBeNull();
  });
});
