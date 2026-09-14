import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { PERSON_ID } from "@/lib/structured-data/entities";
import { metadata, structuredData, CANONICAL } from "./seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Model Rocketry metadata and discoverability", () => {
  it("uses the exact aerospace canonical and indexable metadata", () => {
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL });
  });

  it("includes the canonical URL in the sitemap", () => {
    expect(sitemap().find((e) => e.url === CANONICAL)).toBeDefined();
  });

  it("preserves search crawler access", () => {
    expect(robots().rules).toContainEqual({ userAgent: "OAI-SearchBot", allow: "/" });
  });

  it("serializes a valid JSON-LD graph referencing the canonical Person node rather than duplicating it", () => {
    const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
    const parsed = JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
    const types = parsed["@graph"].flatMap((n: { "@type": string | string[] }) =>
      Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]],
    );
    expect(types).toEqual(expect.arrayContaining(["WebPage", "LearningResource", "BreadcrumbList", "Organization"]));
    // No FAQPage — this phase ships no genuine, visible FAQ content.
    expect(types).not.toContain("FAQPage");
    // No duplicate Person node — the page must reference the canonical profile's id instead.
    expect(types).not.toContain("Person");
    const webpageNode = parsed["@graph"].find((n: { "@id"?: string }) => n["@id"] === `${CANONICAL}#webpage`);
    expect(webpageNode.mentions).toEqual(expect.arrayContaining([{ "@id": PERSON_ID }]));
    expect(html).not.toMatch(/aggregateRating|sponsor|award/);
  });
});
