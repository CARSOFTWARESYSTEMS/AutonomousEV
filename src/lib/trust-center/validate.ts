import type { TrustContentItem } from "./types";
import { isAllowedEmbedUrl, isAllowedExternalUrl } from "./iframe-safety";

const VALID_SOURCES = new Set([
  "google",
  "topmate",
  "linkedin",
  "glassdoor",
  "ev-society",
  "youtube",
  "manual",
  "case-study",
  "award",
  "partner",
]);

const VALID_VERIFICATION = new Set([
  "verified",
  "externally-published",
  "manually-curated",
  "pending-verification",
  "placeholder",
]);

const VALID_TYPES = new Set([
  "review",
  "social-post",
  "video",
  "candidate-profile",
  "case-study",
  "testimonial",
  "award",
  "partner",
  "faq",
]);

function devWarn(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[trust-center] ${message}`);
  }
}

const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

/** Strips control characters from user/config-supplied text. Text is always
 * rendered as plain React children, never as HTML. */
export function stripUnsafe(text: string): string {
  return text.replace(CONTROL_CHARS, "").trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateTrustContentItem(
  raw: unknown,
  context: string
): TrustContentItem | null {
  if (typeof raw !== "object" || raw === null) {
    devWarn(`${context}: item is not an object, skipping.`);
    return null;
  }
  const item = raw as Record<string, unknown>;

  if (!isNonEmptyString(item.id)) {
    devWarn(`${context}: missing/invalid "id", skipping item.`);
    return null;
  }
  if (!isNonEmptyString(item.title)) {
    devWarn(`${context} (${item.id}): missing/invalid "title", skipping item.`);
    return null;
  }
  if (typeof item.type !== "string" || !VALID_TYPES.has(item.type)) {
    devWarn(`${context} (${item.id}): invalid "type", skipping item.`);
    return null;
  }
  if (typeof item.source !== "string" || !VALID_SOURCES.has(item.source)) {
    devWarn(`${context} (${item.id}): invalid "source", skipping item.`);
    return null;
  }
  if (!isNonEmptyString(item.sourceLabel)) {
    devWarn(`${context} (${item.id}): missing/invalid "sourceLabel", skipping item.`);
    return null;
  }
  if (
    typeof item.verificationStatus !== "string" ||
    !VALID_VERIFICATION.has(item.verificationStatus)
  ) {
    devWarn(`${context} (${item.id}): invalid "verificationStatus", skipping item.`);
    return null;
  }
  if (typeof item.enabled !== "boolean") {
    devWarn(`${context} (${item.id}): missing/invalid "enabled", skipping item.`);
    return null;
  }

  if (item.rating !== undefined) {
    const rating = item.rating;
    const scale = typeof item.ratingScale === "number" ? item.ratingScale : 5;
    if (typeof rating !== "number" || rating < 0 || rating > scale) {
      devWarn(`${context} (${item.id}): rating out of range, dropping rating field.`);
      delete item.rating;
    }
  }

  if (item.sourceUrl !== undefined) {
    if (!isNonEmptyString(item.sourceUrl) || !isAllowedExternalUrl(item.sourceUrl as string)) {
      devWarn(`${context} (${item.id}): unsupported "sourceUrl" protocol, dropping field.`);
      delete item.sourceUrl;
    }
  }

  if (item.embedUrl !== undefined) {
    if (!isNonEmptyString(item.embedUrl) || !isAllowedEmbedUrl(item.embedUrl as string)) {
      devWarn(
        `${context} (${item.id}): embedUrl host is not in the allowlist (or is unsafe), dropping embed.`
      );
      delete item.embedUrl;
    }
  }

  const author = item.author as Record<string, unknown> | undefined;
  if (author?.isAnonymous === true) {
    delete author.name;
    delete author.role;
    delete author.organisation;
    delete author.image;
  }

  for (const field of ["title", "summary", "body", "approvedExcerpt", "sourceLabel"]) {
    const value = item[field];
    if (typeof value === "string") {
      item[field] = stripUnsafe(value);
    }
  }

  item.tags = Array.isArray(item.tags) ? item.tags.filter(isNonEmptyString) : [];
  item.audiences = Array.isArray(item.audiences) ? item.audiences.filter(isNonEmptyString) : [];
  item.products = Array.isArray(item.products) ? item.products.filter(isNonEmptyString) : [];
  item.domains = Array.isArray(item.domains) ? item.domains.filter(isNonEmptyString) : [];

  return item as unknown as TrustContentItem;
}

export function validateTrustContentItems(
  raw: unknown,
  context: string
): TrustContentItem[] {
  if (!Array.isArray(raw)) {
    devWarn(`${context}: expected an array, got ${typeof raw}. Returning empty list.`);
    return [];
  }
  return raw
    .map((entry) => validateTrustContentItem(entry, context))
    .filter((entry): entry is TrustContentItem => entry !== null);
}
