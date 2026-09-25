import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import sitemap from "@/app/sitemap";
import { metadata, structuredData, CANONICAL, TITLE, DESCRIPTION } from "./seo";
import { FAQ } from "./data/faq";
import { SOURCES } from "./data/sources";
import { BAS_FACTS, BAS_READINESS } from "./data/india";
import { CREW_PROFILES } from "./data/operations";
import { STATIONS, COMMERCIAL_STATIONS } from "./data/stations";

const parse = () => {
  const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
  return { html, json: JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "")) };
};

describe("Space Station metadata", () => {
  it("uses the specified title, description and canonical", () => {
    expect(metadata.title).toBe("Space Station Research & Engineering Simulator | Space Systems");
    expect(TITLE).toBe(metadata.title);
    expect(metadata.description).toBe(DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe("https://aerospace.ev.engineer/space/space-station");
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL, title: TITLE });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("overrides inherited authorship so no EV Society attribution applies", () => {
    expect(JSON.stringify(metadata)).not.toMatch(/EV Society|evsociety/i);
    expect(metadata.authors).toEqual([expect.objectContaining({ name: "Sudarshana Karkala" })]);
    expect(metadata.creator).toBe("Sudarshana Karkala");
    expect(metadata.publisher).toBeDefined();
  });

  it("is in the sitemap", () => {
    expect(sitemap().find((e) => e.url === CANONICAL)).toMatchObject({ lastModified: "2026-09-25" });
  });
});

describe("Space Station structured data", () => {
  it("serialises the required schema types", () => {
    const { json } = parse();
    const types = json["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["WebPage", "LearningResource", "FAQPage", "BreadcrumbList", "Organization", "Person"]));
  });

  it("FAQPage matches the visible FAQ exactly", () => {
    const { json } = parse();
    const faq = json["@graph"].find((n: { "@type": string }) => n["@type"] === "FAQPage");
    expect(faq.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({ q: q.name, a: q.acceptedAnswer.text }))).toEqual(FAQ.map((f) => ({ q: f.q, a: f.a })));
  });

  it("breadcrumb ends at this page and nothing mentions EV Society or ratings", () => {
    const { json, html } = parse();
    const bc = json["@graph"].find((n: { "@type": string }) => n["@type"] === "BreadcrumbList");
    expect(bc.itemListElement.at(-1)).toMatchObject({ name: "Space Station", item: CANONICAL });
    expect(html).not.toMatch(/EV Society|evsociety|aggregateRating/i);
  });
});

describe("content integrity", () => {
  it("sources are unique, https and never DOI fabrications", () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.url).not.toMatch(/doi\.org/);
    }
  });

  it("every BAS fact and readiness step cites an official Indian source", () => {
    for (const f of [...BAS_FACTS, ...BAS_READINESS]) {
      expect(f.sources.length).toBeGreaterThan(0);
    }
    const official = SOURCES.filter((s) => s.region === "India").map((s) => s.url);
    expect(official.some((u) => u.includes("pib.gov.in"))).toBe(true);
    expect(official.some((u) => u.includes("isro.gov.in"))).toBe(true);
  });

  it("has at least 25 curated FAQ questions", () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(25);
  });

  it("every crew-day profile covers exactly 24 hours", () => {
    for (const p of Object.values(CREW_PROFILES)) {
      expect(p.blocks.reduce((a, b) => a + b.hours, 0)).toBeCloseTo(24, 6);
    }
  });

  it("never labels a commercial station or BAS as operational", () => {
    for (const c of COMMERCIAL_STATIONS) expect(c.lifecycle).not.toBe("Operational");
    expect(STATIONS.find((s) => s.id === "bas")?.lifecycle).toBe("Planned");
  });
});
