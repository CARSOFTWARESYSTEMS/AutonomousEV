import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { metadata, structuredData, CANONICAL } from "./seo";
import { FAQ } from "@/lib/cubetwin/content";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
describe("CubeTwin metadata and discoverability", () => {
  it("uses the exact aerospace canonical and indexable metadata", () => {
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.title).toBe(
      "CubeTwin | CubeSat Battery & Energy Digital Twin",
    );
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL });
  });
  it("includes the canonical URL and content review date in the sitemap", () => {
    expect(sitemap().find((e) => e.url === CANONICAL)).toMatchObject({
      lastModified: "2026-09-12",
    });
  });
  it("preserves search crawler access", () => {
    expect(robots().rules).toContainEqual({
      userAgent: "OAI-SearchBot",
      allow: "/",
    });
  });
  it("serializes valid JSON-LD and matches every visible FAQ", () => {
    const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
    const parsed = JSON.parse(
      html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""),
    );
    expect(
      parsed["@graph"].map((n: { "@type": string }) => n["@type"]),
    ).toEqual(
      expect.arrayContaining([
        "WebPage",
        "SoftwareApplication",
        "LearningResource",
        "BreadcrumbList",
        "FAQPage",
      ]),
    );
    expect(
      parsed["@graph"]
        .find((n: { "@type": string }) => n["@type"] === "FAQPage")
        .mainEntity.map(
          (q: { name: string; acceptedAnswer: { text: string } }) => ({
            q: q.name,
            a: q.acceptedAnswer.text,
          }),
        ),
    ).toEqual(FAQ);
    expect(html).not.toMatch(/aggregateRating|sponsor|award/);
  });
});
