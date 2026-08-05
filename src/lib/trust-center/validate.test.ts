import { describe, expect, it, vi } from "vitest";
import { validateTrustContentItem, validateTrustContentItems, stripUnsafe } from "./validate";

function baseItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "item-1",
    type: "review",
    title: "Great mentorship",
    source: "google",
    sourceLabel: "Google",
    verificationStatus: "verified",
    enabled: true,
    tags: ["mentorship"],
    audiences: [],
    products: [],
    domains: [],
    ...overrides,
  };
}

describe("validateTrustContentItem", () => {
  it("accepts a well-formed item", () => {
    const result = validateTrustContentItem(baseItem(), "test");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("item-1");
  });

  it("drops items missing required fields", () => {
    expect(validateTrustContentItem({}, "test")).toBeNull();
    expect(validateTrustContentItem(baseItem({ id: "" }), "test")).toBeNull();
    expect(validateTrustContentItem(baseItem({ title: undefined }), "test")).toBeNull();
  });

  it("drops items with an invalid source, type or verificationStatus", () => {
    expect(validateTrustContentItem(baseItem({ source: "facebook" }), "test")).toBeNull();
    expect(validateTrustContentItem(baseItem({ type: "tweet" }), "test")).toBeNull();
    expect(validateTrustContentItem(baseItem({ verificationStatus: "trust-me" }), "test")).toBeNull();
  });

  it("drops an out-of-range rating but keeps the rest of the item", () => {
    const result = validateTrustContentItem(baseItem({ rating: 9, ratingScale: 5 }), "test");
    expect(result).not.toBeNull();
    expect(result?.rating).toBeUndefined();
  });

  it("rejects an embedUrl on a host outside the allowlist", () => {
    const result = validateTrustContentItem(
      baseItem({ embedUrl: "https://evil.example.com/embed" }),
      "test"
    );
    expect(result?.embedUrl).toBeUndefined();
  });

  it("rejects a javascript: embedUrl", () => {
    const result = validateTrustContentItem(baseItem({ embedUrl: "javascript:alert(1)" }), "test");
    expect(result?.embedUrl).toBeUndefined();
  });

  it("keeps an allowed LinkedIn embedUrl", () => {
    const embedUrl = "https://www.linkedin.com/embed/feed/update/urn:li:share:1?collapsed=1";
    const result = validateTrustContentItem(baseItem({ embedUrl }), "test");
    expect(result?.embedUrl).toBe(embedUrl);
  });

  it("strips author details when isAnonymous is true", () => {
    const result = validateTrustContentItem(
      baseItem({ author: { name: "Jane Doe", role: "Engineer", isAnonymous: true } }),
      "test"
    );
    expect(result?.author?.name).toBeUndefined();
    expect(result?.author?.role).toBeUndefined();
  });

  it("does not throw or crash on a garbage entry", () => {
    expect(() => validateTrustContentItem("not-an-object", "test")).not.toThrow();
    expect(() => validateTrustContentItem(null, "test")).not.toThrow();
  });
});

describe("validateTrustContentItems", () => {
  it("returns an empty list and warns when input is not an array, without throwing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(validateTrustContentItems({ not: "an array" }, "test.json")).toEqual([]);
    warnSpy.mockRestore();
  });

  it("skips only the invalid item, keeping valid ones", () => {
    const items = [baseItem({ id: "good-1" }), { id: "bad" }, baseItem({ id: "good-2" })];
    const result = validateTrustContentItems(items, "test.json");
    expect(result.map((i) => i.id)).toEqual(["good-1", "good-2"]);
  });
});

describe("stripUnsafe", () => {
  it("removes a trailing control character and trims surrounding whitespace", () => {
    const controlChar = String.fromCharCode(10);
    const input = " hello world " + controlChar;
    expect(stripUnsafe(input)).toBe("hello world");
  });

  it("leaves normal single spacing between words intact", () => {
    expect(stripUnsafe("safe text")).toBe("safe text");
  });
});
