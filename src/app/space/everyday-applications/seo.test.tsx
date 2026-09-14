import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { PERSON_ID, UFLIGHT_BRAND_ID } from "@/lib/structured-data/entities";
import { metadata, structuredData, CANONICAL, TITLE } from "./seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Everyday Applications metadata and discoverability", () => {
  it("uses the exact aerospace canonical and indexable metadata", () => {
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL });
  });

  it("includes UFlight in the SEO title", () => {
    expect(TITLE).toContain("UFlight");
  });

  it("includes the canonical URL in the sitemap", () => {
    expect(sitemap().find((e) => e.url === CANONICAL)).toBeDefined();
  });

  it("preserves search crawler access", () => {
    expect(robots().rules).toContainEqual({ userAgent: "OAI-SearchBot", allow: "/" });
  });

  it("serializes a valid JSON-LD graph referencing the canonical Person node rather than duplicating it, and includes UFlight", () => {
    const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
    const parsed = JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""));
    const types = parsed["@graph"].flatMap((n: { "@type": string | string[] }) =>
      Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]],
    );
    expect(types).toEqual(expect.arrayContaining(["WebPage", "LearningResource", "BreadcrumbList", "Organization", "Brand"]));
    // FAQPage is intentional here — it mirrors the visible Everyday Questions accordion content.
    expect(types).toContain("FAQPage");
    expect(types).not.toContain("Person");
    const webpageNode = parsed["@graph"].find((n: { "@id"?: string }) => n["@id"] === `${CANONICAL}#webpage`);
    expect(webpageNode.mentions).toEqual(expect.arrayContaining([{ "@id": PERSON_ID }, { "@id": UFLIGHT_BRAND_ID }]));
    expect(html).not.toMatch(/aggregateRating|sponsor|award/);
  });
});
