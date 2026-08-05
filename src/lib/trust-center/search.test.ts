import { describe, expect, it } from "vitest";
import { searchTrustContent, isSearchIndexable } from "./search";
import { DeterministicTrustAnswerEngine } from "./answerEngine";
import type { TrustContentItem } from "./types";

function makeItem(overrides: Partial<TrustContentItem> = {}): TrustContentItem {
  return {
    id: "id-1",
    type: "review",
    title: "Mentorship helped me land an internship",
    source: "topmate",
    sourceLabel: "Topmate",
    tags: ["mentorship", "internships"],
    audiences: ["students"],
    products: [],
    domains: ["Career Guidance"],
    verificationStatus: "manually-curated",
    enabled: true,
    search: { indexable: true },
    ...overrides,
  };
}

describe("isSearchIndexable", () => {
  it("excludes disabled items", () => {
    expect(isSearchIndexable(makeItem({ enabled: false }))).toBe(false);
  });

  it("excludes placeholder-verification items", () => {
    expect(isSearchIndexable(makeItem({ verificationStatus: "placeholder" }))).toBe(false);
  });

  it("excludes items explicitly marked non-indexable", () => {
    expect(isSearchIndexable(makeItem({ search: { indexable: false } }))).toBe(false);
  });

  it("includes a normal enabled, non-placeholder item", () => {
    expect(isSearchIndexable(makeItem())).toBe(true);
  });
});

describe("searchTrustContent", () => {
  const items = [
    makeItem({ id: "mentorship-1", title: "Mentorship helped me land an internship" }),
    makeItem({
      id: "linkedin-1",
      source: "linkedin",
      sourceLabel: "LinkedIn",
      title: "Battery cybersecurity project recognition",
      tags: ["battery", "cybersecurity"],
      domains: ["Battery Safety", "Cybersecurity"],
    }),
    makeItem({ id: "placeholder-1", verificationStatus: "placeholder", title: "Mentorship placeholder" }),
  ];

  it("never returns placeholder items even when the query matches their text", () => {
    const results = searchTrustContent(items, { query: "mentorship placeholder" });
    expect(results.some((r) => r.item.id === "placeholder-1")).toBe(false);
  });

  it("matches on title and tags", () => {
    const results = searchTrustContent(items, { query: "mentorship" });
    expect(results.map((r) => r.item.id)).toContain("mentorship-1");
  });

  it("filters by source", () => {
    const results = searchTrustContent(items, { query: "battery", source: "linkedin" });
    expect(results.every((r) => r.item.source === "linkedin")).toBe(true);
    expect(results.map((r) => r.item.id)).toContain("linkedin-1");
  });

  it("returns no results for an unrelated query", () => {
    const results = searchTrustContent(items, { query: "quantum kitchen appliances" });
    expect(results).toEqual([]);
  });
});

describe("DeterministicTrustAnswerEngine", () => {
  const engine = new DeterministicTrustAnswerEngine();

  it("returns the insufficient-evidence message when there is no strong match", async () => {
    const result = await engine.answer("does EV.ENGINEER build kitchen appliances?", []);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.answer).toMatch(/does not currently contain enough verified information/i);
    expect(result.citations).toEqual([]);
  });

  it("returns a grounded answer with citations when there is strong evidence", async () => {
    const evidence = searchTrustContent(
      [makeItem({ id: "mentorship-1", title: "Mentorship helped me land an internship" })],
      { query: "mentorship internship" }
    );
    const result = await engine.answer("what do people say about mentorship?", evidence);
    expect(result.insufficientEvidence).toBe(false);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations[0].contentId).toBe("mentorship-1");
  });
});
