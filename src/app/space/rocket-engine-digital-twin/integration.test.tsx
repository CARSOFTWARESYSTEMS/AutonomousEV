import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { PERSON_ID } from "@/lib/structured-data/entities";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as spaceMetadata } from "../layout";
import { metadata as satelliteExplorerMetadata } from "../satellite-engineering/interactive-3d/seo";
import { metadata as uflightMetadata } from "../../aerospace/uflight-3d/seo";
import Page, { metadata as pageMetadata, viewport } from "./page";
import { CANONICAL, DESCRIPTION, OG_DESCRIPTION, OG_TITLE, SUBJECTS, TITLE, metadata, structuredData } from "./seo";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

const ROUTE = "/space/rocket-engine-digital-twin";
const ROOT = path.resolve(import.meta.dirname, "../../../..");

type Node = { "@type": string | string[]; "@id"?: string; [k: string]: unknown };

function parseGraph(): Node[] {
  const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
  return JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""))["@graph"];
}

const find = (type: string) => parseGraph().find((n) => n["@type"] === type) as Node;

describe("Rocket Engine Digital Twin route", () => {
  it("exists at /space/rocket-engine-digital-twin with its page, metadata and social image", () => {
    for (const file of ["page.tsx", "seo.ts", "opengraph-image.tsx"]) {
      expect(fs.existsSync(path.join(ROOT, "src/app/space/rocket-engine-digital-twin", file)), file).toBe(true);
    }
  });

  it("exports its metadata from the page, so it is rendered on the server", () => {
    expect(pageMetadata).toBe(metadata);
    expect(viewport.themeColor).toBe("#05070b");
  });

  it("renders the page with one H1 and one JSON-LD block", () => {
    const { container } = render(<Page />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Next-Generation Rocket Engine Digital Twin");
    const blocks = container.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks).toHaveLength(1);
    expect(() => JSON.parse(blocks[0].textContent ?? "")).not.toThrow();
  });

  it("loads no 3D runtime: nothing on the route reaches three.js", () => {
    const dir = path.join(ROOT, "src/components/rocket-engine-twin");
    const sources = fs.readdirSync(dir, { recursive: true }) as string[];
    for (const file of sources.filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f))) {
      expect(fs.readFileSync(path.join(dir, file), "utf-8"), file).not.toMatch(/from "(three|@react-three\/[a-z]+)/);
    }
  });
});

describe("Rocket Engine Digital Twin metadata", () => {
  it("uses the title, description and canonical from the brief", () => {
    expect(TITLE).toBe("Next-Generation Rocket Engine Digital Twin | Interactive Propulsion Engineering | EV.ENGINEER");
    expect(DESCRIPTION).toBe(
      "Explore a next-generation reusable liquid rocket engine through an interactive 3D digital twin covering propulsion architecture, turbomachinery, combustion, regenerative cooling, control, instrumentation, simulated testing and engine health monitoring.",
    );
    expect(CANONICAL).toBe(`https://aerospace.ev.engineer${ROUTE}`);
    expect(metadata.title).toBe(TITLE);
    expect(metadata.description).toBe(DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
  });

  it("names EV.ENGINEER once in the title", () => {
    expect(TITLE.match(/EV\.ENGINEER/g)).toHaveLength(1);
  });

  it("has a title and description no other page uses", () => {
    for (const other of [spaceMetadata, satelliteExplorerMetadata, uflightMetadata]) {
      expect(other.title).not.toBe(TITLE);
      expect(other.description).not.toBe(DESCRIPTION);
    }
  });

  it("is indexable", () => {
    expect(metadata.robots).toMatchObject({ index: true, follow: true, googleBot: { index: true, follow: true } });
    expect(JSON.stringify(metadata)).not.toMatch(/noindex|nofollow/i);
    const rules = robots().rules;
    for (const rule of Array.isArray(rules) ? rules : [rules]) expect(rule.disallow).toBeUndefined();
  });

  it("sets Open Graph and Twitter metadata of its own", () => {
    expect(OG_TITLE).toBe("Next-Generation Rocket Engine Digital Twin");
    expect(OG_DESCRIPTION).toBe("Explore rocket propulsion architecture, turbomachinery, combustion, cooling, instrumentation, control, simulated testing and engine health through an interactive 3D digital twin.");
    expect(metadata.openGraph).toMatchObject({ title: OG_TITLE, description: OG_DESCRIPTION, url: CANONICAL, type: "website", siteName: "EV.ENGINEER" });
    const [image] = (metadata.openGraph as { images: { url: string; width: number; height: number; alt: string }[] }).images;
    expect(image).toMatchObject({ url: `${CANONICAL}/opengraph-image`, width: 1200, height: 630 });
    expect(image.alt).toMatch(/^Next-Generation Rocket Engine Digital Twin/);
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: OG_TITLE, description: OG_DESCRIPTION });
  });

  it("does not stuff keywords or make ranking claims", () => {
    const keywords = metadata.keywords as string[];
    expect(keywords.length).toBeLessThanOrEqual(15);
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(`${TITLE} ${DESCRIPTION} ${OG_DESCRIPTION} ${keywords.join(" ")}`).not.toMatch(/world's first|#1|rank|best |guarantee/i);
    expect((`${DESCRIPTION}`.match(/digital twin/gi) ?? []).length).toBe(1);
  });

  it("is listed in the sitemap, once, with its review date", () => {
    const entries = sitemap().filter((entry) => entry.url === CANONICAL);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ lastModified: "2026-10-03" });
  });

  it("is described in llms.txt without overstating what it is", () => {
    const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf-8");
    const line = llms.split("\n").find((l) => l.includes(CANONICAL));
    expect(line).toBeDefined();
    expect(line).toMatch(/Reference and simulated values; not a real, production or flight engine/);
  });
});

describe("Rocket Engine Digital Twin structured data", () => {
  it("is one graph: a web page, a web application, a learning resource and a breadcrumb", () => {
    const graph = parseGraph();
    const types = graph.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
    expect(types).toEqual(expect.arrayContaining(["WebPage", "WebApplication", "LearningResource", "BreadcrumbList", "Person"]));
    expect(types.filter((t) => t === "WebPage")).toHaveLength(1);
    // The questions on the page are for readers; the page is not marked up as an FAQ page.
    expect(types).not.toContain("FAQPage");
    const ids = graph.map((n) => n["@id"]).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("breadcrumbs from Space to the page", () => {
    const crumbs = find("BreadcrumbList") as unknown as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Space", "Next-Generation Rocket Engine Digital Twin"]);
    expect(crumbs.itemListElement.map((i) => i.item)).toEqual(["https://aerospace.ev.engineer/space", CANONICAL]);
  });

  it("describes the learning resource truthfully", () => {
    const learning = find("LearningResource");
    expect(learning).toMatchObject({
      name: "Next-Generation Rocket Engine Digital Twin",
      url: CANONICAL,
      learningResourceType: "Interactive simulation",
      educationalUse: "Self-study",
      inLanguage: "en",
      isAccessibleForFree: true,
      creator: { "@id": PERSON_ID },
    });
    expect((learning.about as { name: string }[]).map((t) => t.name)).toEqual([...SUBJECTS]);
    expect(SUBJECTS).toEqual(expect.arrayContaining(["Rocket propulsion", "Reusable liquid rocket engine", "Turbomachinery", "Combustion chamber", "Regenerative cooling", "Engine health monitoring", "Fault diagnosis", "Digital twin"]));
  });

  it("says the application is a demonstrator, not a real engine", () => {
    const app = find("WebApplication");
    expect(app.name).toBe("Next-Generation Rocket Engine Digital Twin");
    expect(app.applicationCategory).toBe("EducationalApplication");
    expect(app.description).toMatch(/Educational digital-engineering demonstrator/);
    expect(app.description).toMatch(/Not a real engine and not correlated with test data/);
    expect(app.browserRequirements).not.toMatch(/WebGL/);
  });

  it("attributes the page to Sudarshana Karkala using only the site's verified profile facts", () => {
    const page = find("WebPage");
    expect(page.author).toEqual({ "@id": PERSON_ID });
    expect(page.dateModified).toBe("2026-10-03");
    const person = find("Person");
    expect(person).toMatchObject({ "@id": PERSON_ID, name: SUDARSHANA_KARKALA.name, url: SUDARSHANA_KARKALA.canonicalUrl, description: SUDARSHANA_KARKALA.description });
    expect(person).not.toHaveProperty("jobTitle");
    expect(person).not.toHaveProperty("honorificPrefix");
    expect(person).not.toHaveProperty("hasCredential");
  });

  it("claims no accreditation, certification, approval, validation, rating or award", () => {
    // Only this page's own statements: the shared person and organisation nodes are checked on their own pages.
    const own = JSON.stringify(parseGraph().filter((n) => String(n["@id"]).startsWith(CANONICAL)));
    expect(own).not.toMatch(/accredit|certif|approved|endors|flight software|flight[- ]proven|validated|aggregateRating|"review"|"award"/i);
  });

  it("resolves every @id reference inside the graph", () => {
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
    refs.forEach((ref) => expect(ids.has(ref), ref).toBe(true));
  });
});
