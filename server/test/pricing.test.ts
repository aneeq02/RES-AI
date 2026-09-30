import { describe, expect, it } from "vitest";
import { costUsd } from "../src/pricing.js";

describe("costUsd", () => {
  it("prices tokens, cache and web searches", () => {
    const usd = costUsd("claude-opus-5", {
      input_tokens: 1_000_000,
      output_tokens: 100_000,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 1_000_000,
      server_tool_use: { web_search_requests: 10, web_fetch_requests: 4 },
    });
    // 5.00 input + 2.50 output + 0.50 cache read + 0.10 searches (fetches carry no fee beyond tokens)
    expect(usd).toBeCloseTo(8.1, 6);
  });

  it("falls back to Opus 5 rates for unknown models so costs are never under-counted", () => {
    expect(costUsd("claude-future", { input_tokens: 1_000_000, output_tokens: 0 })).toBeCloseTo(5, 6);
  });

  it("prices Sonnet 5 chat", () => {
    expect(costUsd("claude-sonnet-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 })).toBeCloseTo(12, 6);
  });
});
