import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it.each([
    ["/app", "/app"],
    ["/app/agents/buddy?thread=1#x", "/app/agents/buddy?thread=1#x"],
    ["/checkout?plan=12-month", "/checkout?plan=12-month"],
  ])("keeps the same-origin path %s", (next, expected) => {
    expect(safeNext(next, "/fallback")).toBe(expected);
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["absolute URL", "https://evil.test"],
    ["protocol-relative", "//evil.test"],
    ["backslash host", "/\\evil.test"],
    ["backslash later on", "/app\\..\\evil"],
    ["javascript:", "javascript:alert(1)"],
    ["no leading slash", "app"],
    ["tab (browsers strip it: /\t/evil → //evil)", "/\t/evil.test"],
    ["newline", "/\n/evil.test"],
    ["NUL", "/app\u0000"],
    ["DEL", "/app\u007f"],
    ["non-string", 42],
  ])("falls back for %s", (_name, next) => {
    expect(safeNext(next, "/fallback")).toBe("/fallback");
  });

  it("defaults the fallback to null", () => {
    expect(safeNext("//evil.test")).toBeNull();
  });
});
