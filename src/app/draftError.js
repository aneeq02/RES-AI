const FALLBACK = "Couldn't read that website.";

/**
 * Maps a failed POST /profile/draft-from-website into the message shown under the button.
 * `err` is the ApiError thrown by `api()`: { status, body }.
 */
export function draftErrorMessage(err) {
  if (err?.status === 429) return "You've used website fill a few times. Try again in an hour or fill it in by hand.";
  const msg = err?.body?.error;
  // Server sentences ("Buddy couldn't read that website…") are shown as-is; codes like "invalid" are not.
  return typeof msg === "string" && /\s/.test(msg.trim()) ? msg : FALLBACK;
}
