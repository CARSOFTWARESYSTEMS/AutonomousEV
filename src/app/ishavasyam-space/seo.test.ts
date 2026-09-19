import { describe, expect, it } from "vitest";
import { metadata } from "./layout";
import { alt } from "./opengraph-image";
import { buildIshavasyamSpaceGraph } from "@/lib/structured-data/ishavasyamSpaceGraph";
import {
  SITE_ORIGIN,
  ORG_NAME,
  ORG_DESCRIPTOR,
  SEO_TITLE,
  SEO_DESCRIPTION,
  SEO_CANONICAL,
  OG_FOOTER,
} from "./seo";

const graph = buildIshavasyamSpaceGraph({
  origin: SITE_ORIGIN,
  orgName: ORG_NAME,
  orgDescriptor: ORG_DESCRIPTOR,
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  datePublished: "2026-08-14",
  dateModified: "2026-09-19",
  ogImageUrl: `${SITE_ORIGIN}/ishavasyam-space/opengraph-image`,
  diagramImageUrl: `${SITE_ORIGIN}/space/autonomous-spacecraft-health-management-loop.svg`,
  citationUrls: ["https://www.isro.gov.in/MOM.html"],
});

describe("aerospace.ishavasyam.org /space SEO", () => {
  it("uses the ISHAVASYAM.ORG title and its own canonical origin", () => {
    expect(metadata.title).toBe("ISHAVASYAM.ORG · Space Research Organisation");
    expect(metadata.alternates?.canonical).toBe("https://aerospace.ishavasyam.org/space");
    expect(String(metadata.metadataBase)).toBe("https://aerospace.ishavasyam.org/");
    expect(metadata.openGraph?.siteName).toBe("ISHAVASYAM.ORG");
    expect(metadata.openGraph?.title).toBe(SEO_TITLE);
    expect(metadata.twitter?.title).toBe(SEO_TITLE);
  });

  it("is indexable", () => {
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("never mentions EV Society in metadata, image copy or JSON-LD", () => {
    const everything = JSON.stringify([metadata, alt, OG_FOOTER, SEO_DESCRIPTION, graph]);
    expect(everything).not.toMatch(/ev\s*society/i);
  });

  it("does not inherit the root layout's individual author or battery keywords", () => {
    expect(metadata.creator).toBe("ISHAVASYAM.ORG");
    expect(metadata.publisher).toBe("ISHAVASYAM.ORG");
    expect(JSON.stringify(metadata)).not.toMatch(/sudarshana|battery/i);
  });
});

describe("ishavasyam JSON-LD graph", () => {
  const nodes = graph as Record<string, unknown>[];

  it("has ISHAVASYAM.ORG as the only organisation and publisher", () => {
    const orgs = nodes.filter((n) => n["@type"] === "Organization");
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toBe("ISHAVASYAM.ORG");
    const page = nodes.find((n) => n["@type"] === "WebPage");
    expect(page?.publisher).toEqual({ "@id": orgs[0]["@id"] });
  });

  it("only points at ids defined in the graph", () => {
    const defined = new Set(nodes.map((n) => n["@id"]));
    const refs = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(defined.has(ref)).toBe(true);
  });

  it("keeps every self-URL on the ishavasyam origin", () => {
    const page = nodes.find((n) => n["@type"] === "WebPage");
    expect(page?.url).toBe(SEO_CANONICAL);
  });
});
