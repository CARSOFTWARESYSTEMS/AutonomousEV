import type { ReviewProvider, ReviewQuery, ReviewSummary, TrustContentItem, TrustSource } from "../types";
import { validateTrustContentItems } from "../validate";

/**
 * Static, JSON-backed ReviewProvider. This is the Phase 1 implementation for
 * every review source (Google, Topmate). No network calls, no API keys.
 */
export class StaticJsonReviewProvider implements ReviewProvider {
  constructor(
    private readonly source: TrustSource,
    private readonly reviewsRaw: unknown,
    private readonly summary: ReviewSummary | null
  ) {}

  async getSummary(): Promise<ReviewSummary | null> {
    return this.summary;
  }

  async getReviews(options?: ReviewQuery): Promise<TrustContentItem[]> {
    const items = validateTrustContentItems(this.reviewsRaw, `${this.source} reviews`);
    return options?.limit ? items.slice(0, options.limit) : items;
  }
}

/**
 * Phase 2 placeholder. Not implemented in this release — Phase 1 requires no
 * live Google credentials. Wiring this up later means: obtain a Google
 * Business Profile API OAuth client, implement getSummary()/getReviews()
 * against the Business Profile API, and swap the provider passed into the
 * Google source section — no component changes needed since both providers
 * satisfy the same `ReviewProvider` interface.
 */
export class GoogleBusinessProfileReviewProvider implements ReviewProvider {
  async getSummary(): Promise<ReviewSummary | null> {
    throw new Error(
      "GoogleBusinessProfileReviewProvider is not implemented in Phase 1. Use StaticJsonReviewProvider."
    );
  }

  async getReviews(): Promise<TrustContentItem[]> {
    throw new Error(
      "GoogleBusinessProfileReviewProvider is not implemented in Phase 1. Use StaticJsonReviewProvider."
    );
  }
}
