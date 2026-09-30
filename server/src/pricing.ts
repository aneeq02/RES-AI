// USD per million tokens (Anthropic first-party rates). Update here when pricing changes.
const RATES: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  "claude-opus-5": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  "claude-sonnet-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
};
const WEB_SEARCH_USD = 0.01; // $10 per 1,000 searches; web fetch has no fee beyond tokens

export interface UsageLike {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null; web_fetch_requests?: number | null } | null;
}

export function costUsd(model: string, u: UsageLike): number {
  const r = RATES[model] ?? RATES["claude-opus-5"];
  const tokens =
    u.input_tokens * r.input +
    u.output_tokens * r.output +
    (u.cache_creation_input_tokens ?? 0) * r.cacheWrite +
    (u.cache_read_input_tokens ?? 0) * r.cacheRead;
  return tokens / 1_000_000 + (u.server_tool_use?.web_search_requests ?? 0) * WEB_SEARCH_USD;
}
