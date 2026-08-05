/**
 * Iframe embed allowlist. Required CSP frame-src entries mirror this list
 * exactly — see docs/trust-center.md "Content Security Policy" section.
 */
export const ALLOWED_EMBED_HOSTS = [
  "www.linkedin.com",
  "www.youtube.com",
  "www.youtube-nocookie.com",
] as const;

export function isAllowedEmbedUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return (ALLOWED_EMBED_HOSTS as readonly string[]).includes(parsed.hostname);
}

export function isAllowedExternalUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" || parsed.protocol === "http:";
}
