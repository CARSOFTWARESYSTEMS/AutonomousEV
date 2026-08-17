import { describe, expect, it } from "vitest";
import { buildInternshipsGraph } from "./internshipsGraph";

const graph = buildInternshipsGraph({
  title: "EV, Battery, Aerospace and Space Internships | EV.ENGINEER™",
  description: "test description",
  dateModified: "2026-08-17",
});

function findByType(type: string) {
  return graph.find((n) => (n as Record<string, unknown>)["@type"] === type) as Record<string, unknown>;
}

describe("/internships JSON-LD entity graph", () => {
  it("serializes to valid, parseable JSON", () => {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("uses CollectionPage for the hub, not EducationalOccupationalProgram or JobPosting", () => {
    expect(findByType("CollectionPage")).toBeDefined();
    expect(JSON.stringify(graph)).not.toMatch(/EducationalOccupationalProgram|JobPosting/);
  });

  it("nests a real ItemList of programme tracks, each with a name and an absolute URL", () => {
    const collection = findByType("CollectionPage");
    const list = collection.hasPart as Record<string, unknown>;
    expect(list["@type"]).toBe("ItemList");
    const items = list.itemListElement as Record<string, unknown>[];
    expect(items.length).toBeGreaterThan(5);
    items.forEach((item) => {
      expect(typeof item.name).toBe("string");
      expect(item.url).toMatch(/^https:\/\//);
    });
  });

  it("includes the model rocketry learning guide as one of the listed programme tracks", () => {
    const collection = findByType("CollectionPage");
    const list = collection.hasPart as Record<string, unknown>;
    const items = list.itemListElement as Record<string, unknown>[];
    expect(items.some((i) => i.url === "https://autonomous.ev.engineer/space/2026-INSPACe-ROCKETRY-059")).toBe(true);
  });

  it("does not include the unrelated 'Miscellaneous' external resource links (VTU, AICTE, CAR Software Systems) as programme tracks", () => {
    const collection = findByType("CollectionPage");
    const list = collection.hasPart as Record<string, unknown>;
    const items = list.itemListElement as Record<string, unknown>[];
    const names = items.map((i) => i.name);
    expect(names).not.toEqual(expect.arrayContaining([expect.stringMatching(/VTU|AICTE|CAR Software Systems/i)]));
  });

  it("gives the collection a two-item breadcrumb: Home then Internships", () => {
    const collection = findByType("CollectionPage");
    const breadcrumb = collection.breadcrumb as Record<string, unknown>;
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[1].item).toBe("https://autonomous.ev.engineer/internships");
  });

  it("every node has a distinct @id", () => {
    const ids = graph.map((n) => (n as Record<string, unknown>)["@id"]).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
