import { supabase } from "./supabase";
import { createSseParser } from "./sse";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8787").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

async function headers() {
  const { data } = (await supabase?.auth.getSession()) ?? { data: {} };
  const token = data?.session?.access_token;
  return { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) };
}

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, { method, headers: await headers(), body: body === undefined ? undefined : JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json);
  return json;
}

/** POSTs a chat message and calls onEvent(event, data) for each SSE event until the stream ends. */
export async function streamChat(threadId, text, onEvent, signal) {
  const res = await fetch(`${API}/threads/${threadId}/messages`, { method: "POST", headers: await headers(), body: JSON.stringify({ text }), signal });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const parser = createSseParser(onEvent);
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true }));
  }
}
