import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { EV_ENGINEER_BRAND_ID, EV_SOCIETY_ID, ISHAVASYAM_ID, ITELEMATICS_ID, PERSON_ID, WEBSITE_ID } from "@/lib/structured-data/entities";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import { FAQ } from "@/components/propulsion-twin-advanced/data/faq";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as spaceMetadata } from "../layout";
import { metadata as fundamentalsMetadata } from "../rocket-engine-digital-twin/seo";
import Page, { metadata as pageMetadata, viewport } from "./page";
import { CANONICAL, DESCRIPTION, OG_DESCRIPTION, OG_TITLE, SUBJECTS, TITLE, metadata, structuredData } from "./seo";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

const ROUTE = "/space/rocket-engine-digital-twin-advanced";
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const COMPONENTS = path.join(ROOT, "src/components/propulsion-twin-advanced");

type Node = { "@type": string | string[]; "@id"?: string; [k: string]: unknown };

function parseGraph(): Node[] {
  const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
  return JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""))["@graph"];
}

const find = (type: string) => parseGraph().find((n) => n["@type"] === type) as Node;

/** Every module reached from `entry` through static imports. Dynamic imports are the doors it does not go through. */
function staticGraph(entry: string): string[] {
  const seen = new Set<string>();
  const resolve = (from: string, spec: string) => {
    const base = path.resolve(path.dirname(from), spec);
    return [base + ".ts", base + ".tsx", path.join(base, "index.ts")].find((f) => fs.existsSync(f));
  };
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = fs.readFileSync(file, "utf-8");
    expect(source, path.relative(ROOT, file)).not.toMatch(/from "(three|three\/[^"]+|@react-three\/[^"]+)"/);
    for (const match of source.matchAll(/^import (?!type )[^;]*? from "(\.{1,2}\/[^"]+)";/gm)) {
      const next = resolve(file, match[1]);
      if (next) walk(next);
    }
  };
  walk(entry);
  return [...seen].map((f) => path.relative(COMPONENTS, f));
}

describe("Advanced Rocket Propulsion Digital Twin route", () => {
  it("exists at /space/rocket-engine-digital-twin-advanced with its page, metadata and social image", () => {
    for (const file of ["page.tsx", "seo.ts", "opengraph-image.tsx"]) {
      expect(fs.existsSync(path.join(ROOT, "src/app/space/rocket-engine-digital-twin-advanced", file)), file).toBe(true);
    }
  });

  it("exports its metadata from the page, so it is rendered on the server", () => {
    expect(pageMetadata).toBe(metadata);
    expect(viewport.themeColor).toBe("#05070b");
  });

  it("renders the page with one H1 and one JSON-LD block", () => {
    const { container } = render(<Page />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Advanced Rocket Propulsion System Digital Twin");
    const blocks = container.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks).toHaveLength(1);
    expect(() => JSON.parse(blocks[0].textContent ?? "")).not.toThrow();
  });

  it("keeps the simulation, the live instruments and three.js out of what the page loads first", () => {
    const reached = staticGraph(path.join(COMPONENTS, "AdvancedTwinPage.tsx"));
    expect(reached).toEqual(expect.arrayContaining([path.join("ui", "ModuleNav.tsx"), path.join("ui", "LiveSlot.tsx"), path.join("widgets", "PressureMap.tsx"), path.join("state", "labStore.ts"), path.join("simulation", "isolation.ts")]));
    // The twin engine, its models and calibration are fetched by the store when a module first needs them.
    for (const heavy of ["twinEngine.ts", "twinCore.ts", "calibration.ts", "ml.ts", "estimators.ts", "plant.ts"]) expect(reached, heavy).not.toContain(path.join("simulation", heavy));
    expect(reached.some((f) => f.startsWith("live") || f.startsWith("three"))).toBe(false);
    expect(reached.some((f) => f.includes("rocket-engine-twin") && !f.endsWith(".css"))).toBe(false);
  });

  it("loads each live instrument, the simulation and the 3D view on demand, on the client only", () => {
    const slot = fs.readFileSync(path.join(COMPONENTS, "ui/LiveSlot.tsx"), "utf-8");
    const instruments = fs.readdirSync(path.join(COMPONENTS, "live")).filter((f) => f !== "shared.tsx" && f.endsWith(".tsx"));
    expect(instruments.length).toBeGreaterThanOrEqual(11);
    for (const file of instruments) expect(slot, file).toContain(`dynamic(() => import("../live/${file.replace(".tsx", "")}"), { ssr: false, loading: Loading })`);
    expect(fs.readFileSync(path.join(COMPONENTS, "state/labStore.ts"), "utf-8")).toMatch(/await import\("\.\.\/simulation\/twinEngine"\)/);
    expect(fs.readFileSync(path.join(COMPONENTS, "widgets/SystemExplorer.tsx"), "utf-8")).toMatch(/dynamic\(\(\) => import\("\.\.\/three\/Engine3D"\), \{\s*ssr: false/);
  });

  it("reuses the fundamentals page's engine for its 3D view instead of building a second one", () => {
    const view = fs.readFileSync(path.join(COMPONENTS, "three/Engine3D.tsx"), "utf-8");
    expect(view).toMatch(/from "\.\.\/\.\.\/rocket-engine-twin\/engine\/EngineModel"/);
    expect(view).toMatch(/from "\.\.\/\.\.\/rocket-engine-twin\/scene\/Stage"/);
    // It drives that scene's state directly, so none of the fundamentals page's events are reported from here.
    expect(view).not.toMatch(/trackRocketTwin|rocket_twin_/);
  });

  it("builds the tutorial from separate data, simulation, state, section and instrument modules", () => {
    for (const dir of ["data", "simulation", "state", "sections", "ui", "widgets", "live", "three"]) expect(fs.statSync(path.join(COMPONENTS, dir)).isDirectory(), dir).toBe(true);
    const sources = (fs.readdirSync(COMPONENTS, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f));
    // No single file carries the tutorial.
    for (const file of sources) expect(fs.readFileSync(path.join(COMPONENTS, file), "utf-8").split("\n").length, file).toBeLessThan(700);
  });
});

describe("Advanced Rocket Propulsion Digital Twin metadata", () => {
  it("uses the SEO title, description and canonical from the brief", () => {
    expect(TITLE).toBe("Advanced Rocket Propulsion Digital Twin | Physics, AI/ML & Pressure Monitoring | EV.ENGINEER");
    expect(DESCRIPTION).toBe("Learn how to design an advanced rocket propulsion Digital Twin for pressure monitoring using physics-based models, telemetry, state estimation, AI/ML, fault detection, prognostics and Digital Twin validation.");
    expect(CANONICAL).toBe(`https://aerospace.ev.engineer${ROUTE}`);
    expect(metadata.title).toBe(TITLE);
    expect(metadata.description).toBe(DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
  });

  it("names EV.ENGINEER once in the title, and shares neither title nor description with a neighbouring page", () => {
    expect(TITLE.match(/EV\.ENGINEER/g)).toHaveLength(1);
    for (const other of [spaceMetadata, fundamentalsMetadata]) {
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
    expect(OG_TITLE).toBe("Advanced Rocket Propulsion System Digital Twin");
    expect(metadata.openGraph).toMatchObject({ title: OG_TITLE, description: OG_DESCRIPTION, url: CANONICAL, type: "website", siteName: "EV.ENGINEER" });
    const [image] = (metadata.openGraph as { images: { url: string; width: number; height: number; alt: string }[] }).images;
    expect(image).toMatchObject({ url: `${CANONICAL}/opengraph-image`, width: 1200, height: 630 });
    expect(image.alt).toMatch(/^Advanced Rocket Propulsion System Digital Twin/);
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: OG_TITLE, description: OG_DESCRIPTION });
  });

  it("uses natural keywords: no stuffing and no ranking claims", () => {
    const keywords = metadata.keywords as string[];
    expect(keywords.length).toBeLessThanOrEqual(15);
    expect(new Set(keywords).size).toBe(keywords.length);
    expect(keywords).toEqual(expect.arrayContaining(["rocket propulsion digital twin", "propulsion pressure monitoring", "rocket engine prognostics"]));
    expect(`${TITLE} ${DESCRIPTION} ${OG_DESCRIPTION} ${keywords.join(" ")}`).not.toMatch(/world's first|#1|rank|best |guarantee/i);
  });

  it("is listed in the sitemap, once, with its review date", () => {
    const entries = sitemap().filter((entry) => entry.url === CANONICAL);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ lastModified: "2026-10-12" });
  });

  it("is described in llms.txt without overstating what it is", () => {
    const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf-8");
    const line = llms.split("\n").find((l) => l.includes(`(${CANONICAL})`));
    expect(line).toBeDefined();
    expect(line).toMatch(/Generic reference architecture and simulated telemetry; not a proprietary, production or flight engine/);
    expect(line).toMatch(/not a flight-certification or flight-safety authority/);
  });
});

describe("Advanced Rocket Propulsion Digital Twin structured data", () => {
  it("is one graph: a web page, a learning resource, a course, the page's questions, a breadcrumb and its author", () => {
    const graph = parseGraph();
    const types = graph.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
    expect(types).toEqual(expect.arrayContaining(["WebPage", "LearningResource", "Course", "FAQPage", "BreadcrumbList", "Person"]));
    for (const type of ["WebPage", "LearningResource", "Course", "FAQPage", "BreadcrumbList"]) expect(types.filter((t) => t === type), type).toHaveLength(1);
    const ids = graph.map((n) => n["@id"]).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("breadcrumbs from Space through the fundamentals page to this one", () => {
    const crumbs = find("BreadcrumbList") as unknown as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Space", "Rocket Engine Digital Twin", "Advanced Rocket Propulsion Digital Twin"]);
    expect(crumbs.itemListElement.map((i) => i.item)).toEqual(["https://aerospace.ev.engineer/space", "https://aerospace.ev.engineer/space/rocket-engine-digital-twin", CANONICAL]);
  });

  it("describes the learning resource truthfully: simulated, generic, and built on the fundamentals page", () => {
    const learning = find("LearningResource");
    expect(learning).toMatchObject({ name: "Advanced Rocket Propulsion System Digital Twin", url: CANONICAL, educationalLevel: "Advanced", educationalUse: "Self-study", inLanguage: "en", isAccessibleForFree: true, creator: { "@id": PERSON_ID }, isBasedOn: "https://aerospace.ev.engineer/space/rocket-engine-digital-twin" });
    expect(learning.description).toMatch(/generic reference architecture and simulated telemetry/);
    expect(learning.description).toMatch(/does not represent any flight engine and is not correlated with test data/);
    expect((learning.about as { name: string }[]).map((t) => t.name)).toEqual([...SUBJECTS]);
    expect((learning.teaches as string[]).length).toBe(24);
  });

  it("marks up the questions exactly as they are answered on the page", () => {
    const faq = find("FAQPage") as unknown as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(faq.mainEntity.map((q) => q.name)).toEqual(FAQ.map((f) => f.q));
    expect(faq.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(FAQ.map((f) => f.a));
    const html = renderToStaticMarkup(<Page />);
    for (const item of FAQ) expect(html, item.q).toContain(item.q.replace(/'/g, "&#x27;"));
  });

  it("presents the 12 weeks as a self-paced syllabus, without inventing enrolment, an instructor or a credential", () => {
    const course = find("Course");
    expect(course).toMatchObject({ name: "12-Week Digital Twin Assignment", url: `${CANONICAL}#weeks`, isAccessibleForFree: true });
    expect((course.syllabusSections as { name: string }[]).map((s) => s.name)).toEqual(["Phase I — Understand & Architect", "Phase II — Model the Physics", "Phase III — Synchronise & Learn", "Phase IV — Diagnose & Validate"]);
    for (const key of ["hasCourseInstance", "offers", "educationalCredentialAwarded", "instructor", "aggregateRating"]) expect(course).not.toHaveProperty(key);
  });

  it("attributes the page to Sudarshana Karkala using only the site's verified profile facts", () => {
    const page = find("WebPage");
    expect(page.author).toEqual({ "@id": PERSON_ID });
    expect(page.dateModified).toBe("2026-10-12");
    const person = find("Person");
    expect(person).toMatchObject({ "@id": PERSON_ID, name: SUDARSHANA_KARKALA.name, url: SUDARSHANA_KARKALA.canonicalUrl });
    for (const key of ["jobTitle", "honorificPrefix", "hasCredential"]) expect(person).not.toHaveProperty(key);
  });

  it("names three organisations in three roles, and lets none stand in for another", () => {
    const graph = parseGraph();
    const byId = (id: string) => graph.find((n) => n["@id"] === id)!;
    // ISHAVASYAM.ORG: the organisation whose Space initiative the tutorial belongs to.
    expect(byId(ISHAVASYAM_ID)).toMatchObject({ "@type": "Organization", name: "ISHAVASYAM.ORG", url: "https://ishavasyam.org/" });
    expect(find("LearningResource").sourceOrganization).toEqual({ "@id": ISHAVASYAM_ID });
    // EV.ENGINEER: the platform, and the provider of the course. Unchanged.
    expect(byId(EV_ENGINEER_BRAND_ID)).toMatchObject({ "@type": "Brand", name: "EV.ENGINEER" });
    expect(find("Course").provider).toEqual({ "@id": EV_ENGINEER_BRAND_ID });
    expect(byId(WEBSITE_ID).brand).toEqual({ "@id": EV_ENGINEER_BRAND_ID });
    // iTelematics Software Private Limited: the operator of the site, and the publisher of the page. Unchanged.
    expect(byId(ITELEMATICS_ID)).toMatchObject({ "@type": "Organization", legalName: "iTelematics Software Private Limited" });
    expect(find("WebPage").publisher).toEqual({ "@id": ITELEMATICS_ID });
    expect(byId(WEBSITE_ID).publisher).toEqual({ "@id": ITELEMATICS_ID });
    expect(find("WebPage").mentions).toEqual([{ "@id": EV_ENGINEER_BRAND_ID }, { "@id": ISHAVASYAM_ID }]);
    // ISHAVASYAM.ORG is not made the publisher, the provider, the author or the creator of anything here.
    for (const node of graph) for (const role of ["publisher", "provider", "author", "creator"]) expect(node[role], `${String(node["@type"])}.${role}`).not.toEqual({ "@id": ISHAVASYAM_ID });
    // The page's metadata says the same as its graph.
    expect(pageMetadata.publisher).toBe("iTelematics Software Private Limited");
    expect(pageMetadata.creator).toBe("EV.ENGINEER");
    // EV Society has no part in it.
    expect(JSON.stringify(graph)).not.toContain(EV_SOCIETY_ID);
    expect(JSON.stringify(graph)).not.toMatch(/EV Society/);
    // Every reference in the graph is to a node that is in the graph.
    const ids = new Set(graph.map((n) => n["@id"]).filter(Boolean));
    const refs = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    expect(refs.filter((ref) => !ids.has(ref))).toEqual([]);
  });

  it("keeps one canonical address whichever host serves the page: the initiative's name does not move it", () => {
    // The same build answers on aerospace.ev.engineer, autonomous.ev.engineer and aerospace.ishavasyam.org.
    expect(CANONICAL).toBe("https://aerospace.ev.engineer/space/rocket-engine-digital-twin-advanced");
    expect(pageMetadata.alternates?.canonical).toBe(CANONICAL);
    expect(pageMetadata.openGraph?.url).toBe(CANONICAL);
    expect(String(pageMetadata.metadataBase)).toBe("https://aerospace.ev.engineer/");
    const graph = parseGraph();
    for (const type of ["WebPage", "LearningResource", "FAQPage"]) expect(find(type).url, type).toBe(CANONICAL);
    expect(find("WebPage")["@id"]).toBe(`${CANONICAL}#webpage`);
    // Nothing of this page's own is addressed on the ISHAVASYAM.ORG host; that name appears only as the organisation's own site.
    const own = graph.filter((n) => typeof n["@id"] === "string" && (n["@id"] as string).includes("rocket-engine-digital-twin-advanced"));
    expect(own.length).toBeGreaterThanOrEqual(5);
    expect(JSON.stringify(own)).not.toMatch(/aerospace\.ishavasyam\.org/);
    expect(sitemap().filter((entry) => entry.url.includes("rocket-engine-digital-twin-advanced")).map((entry) => entry.url)).toEqual([CANONICAL]);
  });

  it("claims no accreditation, certification, approval, rating or award, and no affiliation with an agency", () => {
    // Only this page's own statements; answers on the page that explain validation and certification as ideas are not claims.
    const own = parseGraph().filter((n) => String(n["@id"]).startsWith(CANONICAL) && n["@type"] !== "FAQPage");
    expect(JSON.stringify(own)).not.toMatch(/accredit|certif|approved|endors|flight software|flight[- ]proven|aggregateRating|"review"|"award"|NASA|ISRO|SpaceX/i);
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
