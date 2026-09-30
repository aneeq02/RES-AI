/**
 * Returns a safe URL for use in href, or null if the URL is unsafe.
 * Only allows http:// and https:// schemes to prevent javascript:, data:, etc.
 * @param {string} url
 * @returns {string | null}
 */
export function safeHref(url) {
  if (!url || typeof url !== "string") return null;
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}
