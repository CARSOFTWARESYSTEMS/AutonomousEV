import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { SPACE_METADATA as metadata } from "./space-metadata";
import { GET as socialImage, dynamic as socialImageRendering } from "./og-image.png/route";
import { GET as robots } from "./robots.txt/route";
import { GET as sitemap } from "./sitemap.xml/route";
import { ROBOTS_TXT, SITEMAP_XML } from "./host-files";
import { STELLR_BRANDING } from "./branding";
import { STELLR_SPACE } from "@/data/space-host-brands";
import { buildIshavasyamSpaceGraph } from "@/lib/structured-data/ishavasyamSpaceGraph";
import {
  SITE_ORIGIN,
  ORG_NAME,
  ORG_DESCRIPTOR,
  SEO_TITLE,
  SEO_DESCRIPTION,
  SEO_CANONICAL,
  OG_ALT,
  OG_BRAND,
  OG_FOOTER,
  OG_IMAGE_URL,
  DATE_PUBLISHED,
  DATE_MODIFIED,
} from "./seo";

const graph = buildIshavasyamSpaceGraph({
  origin: SITE_ORIGIN,
  orgName: ORG_NAME,
  orgDescriptor: ORG_DESCRIPTOR,
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  ogImageUrl: OG_IMAGE_URL,
  diagramImageUrl: `${SITE_ORIGIN}/space/autonomous-spacecraft-health-management-loop.svg`,
  citationUrls: ["https://www.isro.gov.in/MOM.html"],
});

/** Everything this host publishes about itself, outside the page body. */
const everything = JSON.stringify([metadata, OG_ALT, OG_BRAND, OG_FOOTER, SEO_DESCRIPTION, graph, ROBOTS_TXT, SITEMAP_XML, STELLR_BRANDING]);

describe("aerospace.stellrspace.com /space SEO", () => {
  it("uses a STELLR SPACE title and description, at lengths search results show in full", () => {
    expect(metadata.title).toBe("Spacecraft Health Management Mission 2040 | STELLR SPACE");
    expect(SEO_TITLE.length).toBeLessThanOrEqual(60);
    expect(metadata.description).toMatch(/^Explore STELLR SPACE's Mission 2040/);
    expect(SEO_DESCRIPTION.length).toBeGreaterThanOrEqual(120);
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("is canonical on its own origin, and names STELLR SPACE as site, author and publisher", () => {
    expect(metadata.alternates?.canonical).toBe("https://aerospace.stellrspace.com/space");
    expect(String(metadata.metadataBase)).toBe("https://aerospace.stellrspace.com/");
    expect(metadata.openGraph).toMatchObject({ siteName: "STELLR SPACE", title: SEO_TITLE, url: SEO_CANONICAL });
    expect(metadata.twitter?.title).toBe(SEO_TITLE);
    expect(metadata.applicationName).toBe("STELLR SPACE");
    expect(metadata.creator).toBe("STELLR SPACE");
    expect(metadata.publisher).toBe("STELLR SPACE");
    expect(metadata.keywords).toContain("STELLR SPACE");
  });

  it("is indexable", () => {
    const robotsMeta = metadata.robots as { index: boolean; follow: boolean };
    expect(robotsMeta.index).toBe(true);
    expect(robotsMeta.follow).toBe(true);
  });

  it("never names ISHAVASYAM.ORG or EV Society, in metadata, the social card, JSON-LD, robots.txt, the sitemap or the page's branding", () => {
    expect(everything).not.toMatch(/ishavasyam/i);
    expect(everything).not.toMatch(/ev\s*society/i);
  });

  it("does not inherit the root layout's individual author or battery keywords", () => {
    expect(JSON.stringify(metadata)).not.toMatch(/sudarshana|battery/i);
  });
});

describe("aerospace.stellrspace.com /space social image", () => {
  type Image = { url: string; width: number; height: number; type: string; alt: string };
  const og = (metadata.openGraph as { images: Image[] }).images;
  const twitter = (metadata.twitter as { images: Image[] }).images;

  it("is one explicit 1200 x 630 PNG, shared by Open Graph and Twitter", () => {
    expect(og).toHaveLength(1);
    expect(twitter).toEqual(og);
    expect(og[0]).toEqual({ url: OG_IMAGE_URL, width: 1200, height: 630, type: "image/png", alt: OG_ALT });
  });

  it("has an absolute https URL on its own origin that ends in .png and carries no query string", () => {
    const url = new URL(og[0].url);
    expect(url.origin).toBe(SITE_ORIGIN);
    expect(url.pathname).toBe("/stellrspace-space/og-image.png");
    expect(url.search).toBe("");
  });

  it("is rendered once at build, and not also declared by the opengraph-image file convention", () => {
    expect(socialImageRendering).toBe("force-static");
    expect(typeof socialImage).toBe("function");
    for (const name of ["opengraph-image.tsx", "opengraph-image.png", "twitter-image.tsx"]) expect(existsSync(resolve(import.meta.dirname, name)), name).toBe(false);
  });

  it("leads with the STELLR SPACE brand and the host's address", () => {
    expect(OG_BRAND).toBe("STELLR SPACE");
    expect(OG_FOOTER).toBe("aerospace.stellrspace.com/space");
  });
});

describe("aerospace.stellrspace.com JSON-LD graph", () => {
  const nodes = graph as Record<string, unknown>[];

  it("has STELLR SPACE as the only organisation and publisher", () => {
    const orgs = nodes.filter((n) => n["@type"] === "Organization");
    expect(orgs).toHaveLength(1);
    expect(orgs[0].name).toBe("STELLR SPACE");
    expect(orgs[0].url).toBe("https://aerospace.stellrspace.com/");
    const page = nodes.find((n) => n["@type"] === "WebPage");
    expect(page?.publisher).toEqual({ "@id": orgs[0]["@id"] });
    expect(page?.url).toBe(SEO_CANONICAL);
  });

  it("only points at ids defined in the graph", () => {
    const defined = new Set(nodes.map((n) => n["@id"]));
    const refs = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(defined.has(ref)).toBe(true);
  });
});

describe("aerospace.stellrspace.com robots.txt and sitemap.xml", () => {
  it("allows crawling and names this host's sitemap", async () => {
    const res = robots();
    expect(res.headers.get("content-type")).toMatch(/^text\/plain/);
    const text = await res.text();
    expect(text).toMatch(/^User-Agent: \*\nAllow: \/\n/);
    expect(text).not.toMatch(/Disallow/);
    expect(text).toContain("Sitemap: https://aerospace.stellrspace.com/sitemap.xml");
  });

  it("lists the host's own Space pages, all on its own address", async () => {
    const res = sitemap();
    expect(res.headers.get("content-type")).toBe("application/xml");
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs[0]).toBe("https://aerospace.stellrspace.com/space");
    expect(locs).toHaveLength(STELLR_SPACE.paths.length);
    for (const loc of locs) expect(loc).toMatch(/^https:\/\/aerospace\.stellrspace\.com\/space(\/|$)/);
    expect(locs).not.toContain("https://aerospace.stellrspace.com/about/sudarshana-karkala");
    expect(xml).toContain(`<lastmod>${DATE_MODIFIED}</lastmod>`);
  });
});
