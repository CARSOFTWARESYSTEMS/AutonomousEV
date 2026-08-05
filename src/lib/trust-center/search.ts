import type { TrustContentItem, TrustSearchQuery, TrustSearchResult } from "./types";

/** Field weights for the deterministic local keyword search. */
const FIELD_WEIGHTS: { field: keyof TrustContentItem | "sourceLabel"; weight: number }[] = [
  { field: "title", weight: 5 },
  { field: "tags", weight: 4 },
  { field: "audiences", weight: 3 },
  { field: "products", weight: 3 },
  { field: "domains", weight: 3 },
  { field: "summary", weight: 2 },
  { field: "approvedExcerpt", weight: 2 },
  { field: "sourceLabel", weight: 1 },
  { field: "body", weight: 1 },
];

export function isSearchIndexable(item: TrustContentItem): boolean {
  if (!item.enabled) return false;
  if (item.verificationStatus === "placeholder") return false;
  if (item.search && item.search.indexable === false) return false;
  return true;
}

function fieldText(item: TrustContentItem, field: string): string {
  const value = (item as unknown as Record<string, unknown>)[field];
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "string") return value;
  return "";
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function searchTrustContent(
  items: TrustContentItem[],
  query: TrustSearchQuery
): TrustSearchResult[] {
  const indexable = items.filter(isSearchIndexable);

  const filtered = indexable.filter((item) => {
    if (query.source && item.source !== query.source) return false;
    if (query.type && item.type !== query.type) return false;
    if (query.audience && !item.audiences.includes(query.audience)) return false;
    if (query.topic && !item.tags.includes(query.topic) && !item.domains.includes(query.topic))
      return false;
    if (query.product && !item.products.includes(query.product)) return false;
    return true;
  });

  const terms = tokenize(query.query || "");
  if (terms.length === 0) {
    return filtered
      .slice(0, query.limit ?? 20)
      .map((item) => ({ item, score: 0, matchedFields: [] }));
  }

  const results: TrustSearchResult[] = [];
  for (const item of filtered) {
    let score = 0;
    const matchedFields = new Set<string>();
    for (const { field, weight } of FIELD_WEIGHTS) {
      const text = fieldText(item, field).toLowerCase();
      if (!text) continue;
      for (const term of terms) {
        if (text.includes(term)) {
          score += weight;
          matchedFields.add(field);
        }
      }
    }
    if (item.featured) score += 0.5;
    if (score > 0) {
      results.push({ item, score, matchedFields: Array.from(matchedFields) });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, query.limit ?? 20);
}
