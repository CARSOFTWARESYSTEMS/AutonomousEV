import { describe, expect, it } from "vitest";
import { buildSpaceEntityGraph } from "./spaceGraph";

const graph = buildSpaceEntityGraph({
  title: "Spacecraft Health Management Mission 2040 | EV Society",
  description: "test description",
  datePublished: "2026-08-14",
  dateModified: "2026-08-14",
  ogImageUrl: "https://autonomous.ev.engineer/space/opengraph-image",
  diagramImageUrl: "https://autonomous.ev.engineer/space/autonomous-spacecraft-health-management-loop.svg",
  citationUrls: ["https://www.isro.gov.in/MOM.html"],
});

/** Recursively collect every `{ "@id": "..." }` reference value in the graph. */
function collectIdReferences(node: unknown, refs: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((item) => collectIdReferences(item, refs));
  } else if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const keys = Object.keys(obj);
    // A reference object looks like exactly { "@id": "..." } (a pointer),
    // as opposed to a full node definition which also has "@type".
    if (keys.length === 1 && keys[0] === "@id" && typeof obj["@id"] === "string") {
      refs.push(obj["@id"] as string);
    } else {
      for (const key of keys) collectIdReferences(obj[key], refs);
    }
  }
  return refs;
}

describe("/space JSON-LD entity graph", () => {
  it("serializes to valid, parseable JSON", () => {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("gives every node a distinct @id and @type", () => {
    const ids = graph.map((node) => (node as Record<string, unknown>)["@id"]);
    const nonBreadcrumbIds = ids.filter(Boolean);
    expect(new Set(nonBreadcrumbIds).size).toBe(nonBreadcrumbIds.length);
    graph.forEach((node) => expect(node).toHaveProperty("@type"));
  });

  it("every @id and every {@id} reference is an absolute https URL", () => {
    const nodeIds = graph
      .map((node) => (node as Record<string, unknown>)["@id"] as string | undefined)
      .filter((id): id is string => Boolean(id));
    const refIds = collectIdReferences(graph);
    for (const id of [...nodeIds, ...refIds]) {
      expect(id).toMatch(/^https:\/\//);
    }
  });

  it("every {@id} reference resolves to a node that actually exists in the graph", () => {
    const nodeIds = new Set(
      graph
        .map((node) => (node as Record<string, unknown>)["@id"] as string | undefined)
        .filter(Boolean)
    );
    const refIds = collectIdReferences(graph);
    expect(refIds.length).toBeGreaterThan(0);
    for (const ref of refIds) {
      expect(nodeIds.has(ref)).toBe(true);
    }
  });

  it("never places the distinct entities in a shared sameAs list", () => {
    const strings = JSON.stringify(graph);
    expect(strings).not.toMatch(/"sameAs"/);
  });

  it("marks EV Society as a plain Organization, not NonprofitOrganization, with no CIN", () => {
    const evSociety = graph.find(
      (node) => (node as Record<string, unknown>).name === "EV Society"
    ) as Record<string, unknown>;
    expect(evSociety).toBeDefined();
    expect(evSociety["@type"]).toBe("Organization");
    const serialized = JSON.stringify(evSociety);
    expect(serialized).not.toMatch(/NonprofitOrganization/);
    expect(serialized).not.toMatch(/\bCIN\b/i);
    expect(serialized).not.toMatch(/Section\s*8/i);
  });

  it("gives iTelematics its full legal company name", () => {
    const itelematics = graph.find(
      (node) => (node as Record<string, unknown>)["@type"] === "Organization" &&
        (node as Record<string, unknown>).url === "https://itelematics.com/"
    ) as Record<string, unknown>;
    expect(itelematics.name).toBe("iTelematics Software Private Limited");
    expect(itelematics.legalName).toBe("iTelematics Software Private Limited");
  });

  it("includes the ResearchProject with a Planned/Proposed status, matching visible page wording", () => {
    const mission = graph.find((node) => (node as Record<string, unknown>)["@type"] === "ResearchProject") as Record<string, unknown>;
    expect(mission).toBeDefined();
    expect(["Planned", "Proposed"]).toContain(mission.creativeWorkStatus);
  });

  it("includes a two-item BreadcrumbList: Home then Space", () => {
    const breadcrumb = graph.find((node) => (node as Record<string, unknown>)["@type"] === "BreadcrumbList") as Record<string, unknown>;
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Home");
    expect(items[0].item).toBe("https://autonomous.ev.engineer/");
    expect(items[1].name).toBe("Space");
    expect(items[1].item).toBe("https://autonomous.ev.engineer/space");
  });

  it("cites ISRO reference URLs without creating an ISRO/government entity node (no implied affiliation)", () => {
    // The graph legitimately cites isro.gov.in URLs (citation field), but must
    // never model ISRO/IN-SPACe/NSIL as an Organization/Brand node — that
    // would imply a formal, unverified relationship.
    const orgAndBrandNames = graph
      .filter((node) => {
        const type = (node as Record<string, unknown>)["@type"];
        return type === "Organization" || type === "Brand";
      })
      .map((node) => (node as Record<string, unknown>).name);
    expect(orgAndBrandNames).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/ISRO|IN-SPACe|NSIL|Department of Space/i)])
    );
  });
});
