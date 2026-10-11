import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { metadata } from "./layout";
import { GET as socialImage, dynamic as socialImageRendering } from "./og-image.png/route";
import { buildIshavasyamSpaceGraph } from "@/lib/structured-data/ishavasyamSpaceGraph";
import {
  SITE_ORIGIN,
  ORG_NAME,
  ORG_DESCRIPTOR,
  SEO_TITLE,
  SEO_DESCRIPTION,
  SEO_CANONICAL,
  OG_ALT,
  OG_FOOTER,
  OG_IMAGE_URL,
} from "./seo";

const graph = buildIshavasyamSpaceGraph({
  origin: SITE_ORIGIN,
  orgName: ORG_NAME,
  orgDescriptor: ORG_DESCRIPTOR,
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  datePublished: "2026-08-14",
  dateModified: "2026-09-19",
  ogImageUrl: OG_IMAGE_URL,
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
    const everything = JSON.stringify([metadata, OG_ALT, OG_FOOTER, SEO_DESCRIPTION, graph]);
    expect(everything).not.toMatch(/ev\s*society/i);
  });

  it("does not inherit the root layout's individual author or battery keywords", () => {
    expect(metadata.creator).toBe("ISHAVASYAM.ORG");
    expect(metadata.publisher).toBe("ISHAVASYAM.ORG");
    expect(JSON.stringify(metadata)).not.toMatch(/sudarshana|battery/i);
  });
});

describe("aerospace.ishavasyam.org /space social image", () => {
  type Image = { url: string; width: number; height: number; type: string; alt: string };
  const og = (metadata.openGraph as { images: Image[] }).images;
  const twitter = (metadata.twitter as { images: Image[] }).images;

  it("is one explicit image, shared by Open Graph and Twitter", () => {
    expect(og).toHaveLength(1);
    expect(twitter).toEqual(og);
    expect(og[0]).toEqual({ url: OG_IMAGE_URL, width: 1200, height: 630, type: "image/png", alt: OG_ALT });
  });

  // LinkedIn's crawler is stricter than WhatsApp's: the image is given an ordinary image-file URL.
  it("has an absolute https URL on its own origin that ends in .png and carries no query string", () => {
    const url = new URL(og[0].url);
    expect(url.protocol).toBe("https:");
    expect(url.origin).toBe(SITE_ORIGIN);
    expect(url.pathname).toMatch(/\.png$/);
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
  });

  it("meets the size LinkedIn asks for a large preview: at least 1200 x 627", () => {
    expect(og[0].width).toBeGreaterThanOrEqual(1200);
    expect(og[0].height).toBeGreaterThanOrEqual(627);
  });

  it("is rendered once at build and served as a static file", () => {
    expect(socialImageRendering).toBe("force-static");
    expect(typeof socialImage).toBe("function");
  });

  it("is not also declared by the opengraph-image file convention, which would override the URL above", () => {
    const here = import.meta.dirname;
    for (const name of ["opengraph-image.tsx", "opengraph-image.png", "twitter-image.tsx"]) expect(existsSync(resolve(here, name)), name).toBe(false);
    expect(existsSync(resolve(here, new URL(OG_IMAGE_URL).pathname.replace("/ishavasyam-space/", ""), "route.tsx"))).toBe(true);
  });

  it("is the image the JSON-LD graph points at", () => {
    expect(JSON.stringify(graph)).toContain(OG_IMAGE_URL);
    expect(JSON.stringify(graph)).not.toContain("opengraph-image");
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
