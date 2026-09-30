// C0 control characters and DEL: browsers strip tabs/newlines from URLs, so "/\t/evil" becomes "//evil".
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;

/**
 * Returns `next` if it's a same-origin path safe to navigate to after sign-in, else `fallback`.
 * Rejects anything not starting with a single "/", protocol-relative ("//", "/\"), any backslash
 * (browsers treat it as "/"), and control characters.
 */
export function safeNext(next, fallback = null) {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.includes("\\") || CONTROL.test(next)) return fallback;
  return next;
}
