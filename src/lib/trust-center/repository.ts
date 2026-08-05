import type { TrustContentItem, TrustContentRepository, TrustSearchQuery, TrustSearchResult } from "./types";
import { validateTrustContentItems } from "./validate";
import { searchTrustContent } from "./search";

import googleRaw from "@/data/trust-center/google.json";
import topmateRaw from "@/data/trust-center/topmate.json";
import linkedinRaw from "@/data/trust-center/linkedin.json";
import glassdoorRaw from "@/data/trust-center/glassdoor.json";
import evSocietyRaw from "@/data/trust-center/ev-society.json";
import youtubeRaw from "@/data/trust-center/youtube.json";
import testimonialsRaw from "@/data/trust-center/testimonials.json";
import successStoriesRaw from "@/data/trust-center/success-stories.json";
import awardsRaw from "@/data/trust-center/awards.json";
import partnersRaw from "@/data/trust-center/partners.json";
import faqsRaw from "@/data/trust-center/faqs.json";

let cachedItems: TrustContentItem[] | null = null;

/** Loads, validates and merges every Trust Center source file once per process. */
export function getAllTrustContentItems(): TrustContentItem[] {
  if (cachedItems) return cachedItems;

  cachedItems = [
    ...validateTrustContentItems(googleRaw, "google.json"),
    ...validateTrustContentItems(topmateRaw, "topmate.json"),
    ...validateTrustContentItems(linkedinRaw, "linkedin.json"),
    ...validateTrustContentItems(glassdoorRaw, "glassdoor.json"),
    ...validateTrustContentItems(evSocietyRaw, "ev-society.json"),
    ...validateTrustContentItems(youtubeRaw, "youtube.json"),
    ...validateTrustContentItems(testimonialsRaw, "testimonials.json"),
    ...validateTrustContentItems(successStoriesRaw, "success-stories.json"),
    ...validateTrustContentItems(awardsRaw, "awards.json"),
    ...validateTrustContentItems(partnersRaw, "partners.json"),
    ...validateTrustContentItems(faqsRaw, "faqs.json"),
  ];

  return cachedItems;
}

export class StaticTrustContentRepository implements TrustContentRepository {
  async getAll(): Promise<TrustContentItem[]> {
    return getAllTrustContentItems();
  }

  async getById(id: string): Promise<TrustContentItem | null> {
    return getAllTrustContentItems().find((item) => item.id === id) ?? null;
  }

  async search(query: TrustSearchQuery): Promise<TrustSearchResult[]> {
    return searchTrustContent(getAllTrustContentItems(), query);
  }
}

export const trustContentRepository = new StaticTrustContentRepository();
