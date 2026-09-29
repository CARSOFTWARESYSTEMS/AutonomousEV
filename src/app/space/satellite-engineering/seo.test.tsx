import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { EV_SOCIETY_ID, PERSON_ID } from "@/lib/structured-data/entities";
import sitemap from "@/app/sitemap";
import { metadata, structuredData, CANONICAL, DESCRIPTION, TITLE } from "./seo";
import { COURSE_NAME } from "./programData";

type Node = { "@type": string | string[]; "@id"?: string; [k: string]: unknown };

function parseGraph(): Node[] {
  const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
  const parsed = JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
  return parsed["@graph"];
}

describe("Satellite Engineering metadata and structured data", () => {
  it("uses the exact aerospace canonical and indexable metadata", () => {
    expect(CANONICAL).toBe("https://aerospace.ev.engineer/space/satellite-engineering");
    expect(metadata.title).toBe(TITLE);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL, title: TITLE, description: DESCRIPTION });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("keeps the meta description within the ~150–160 character snippet range", () => {
    expect(DESCRIPTION.length).toBeGreaterThanOrEqual(140);
    expect(DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("lists the canonical URL in the sitemap", () => {
    expect(sitemap().find((e) => e.url === CANONICAL)).toBeDefined();
  });

  it("serialises a valid graph with WebPage, Course, BreadcrumbList and Person nodes", () => {
    const graph = parseGraph();
    const types = graph.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
    expect(types).toEqual(expect.arrayContaining(["WebPage", "Course", "BreadcrumbList", "Person"]));
    // No FAQ schema without a visible FAQ, and no fabricated ratings or awards.
    expect(types).not.toContain("FAQPage");
    expect(JSON.stringify(graph)).not.toMatch(/aggregateRating|review"|award"|accreditedBy/);
  });

  it("describes the Course with a real provider, the Person as author and all twelve weeks", () => {
    const graph = parseGraph();
    const course = graph.find((n) => n["@type"] === "Course") as Node;
    expect(course.name).toBe(COURSE_NAME);
    expect(course.provider).toEqual({ "@id": EV_SOCIETY_ID });
    expect(course.author).toEqual({ "@id": PERSON_ID });
    expect(course.timeRequired).toBe("P12W");
    expect(course.syllabusSections).toHaveLength(12);
    const person = graph.find((n) => n["@type"] === "Person") as Node;
    expect(person["@id"]).toBe(PERSON_ID);
    expect(person.url).toMatch(/\/about\/sudarshana-karkala$/);
  });

  it("resolves every @id reference to a node in the same graph", () => {
    const graph = parseGraph();
    const ids = new Set(graph.map((n) => n["@id"]).filter(Boolean));
    const refs: string[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        if (Object.keys(o).length === 1 && typeof o["@id"] === "string") refs.push(o["@id"]);
        Object.values(o).forEach(walk);
      }
    };
    graph.forEach((n) => Object.entries(n).forEach(([k, v]) => k !== "@id" && walk(v)));
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((r) => expect(ids.has(r)).toBe(true));
  });

  it("breadcrumbs lead Space → Satellite Engineering", () => {
    const crumbs = parseGraph().find((n) => n["@type"] === "BreadcrumbList") as unknown as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Space", "Satellite Engineering"]);
    expect(crumbs.itemListElement[1].item).toBe(CANONICAL);
  });
});
