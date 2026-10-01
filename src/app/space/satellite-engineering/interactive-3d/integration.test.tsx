import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import sitemap from "@/app/sitemap";
import SatelliteEngineeringPage from "../page";
import { CANONICAL, DESCRIPTION, TITLE, metadata, structuredData } from "./seo";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/satellite-engineering" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

const ROUTE = "/space/satellite-engineering/interactive-3d";
const ROOT = path.resolve(import.meta.dirname, "../../../../..");

type Node = { "@type": string | string[]; "@id"?: string; [k: string]: unknown };

function parseGraph(): Node[] {
  const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
  return JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""))["@graph"];
}

describe("Satellite Explorer 3D metadata", () => {
  it("uses the title, description and canonical from the brief", () => {
    expect(TITLE).toBe("Satellite Explorer 3D | Interactive Satellite Engineering | EV.ENGINEER");
    expect(DESCRIPTION).toBe(
      "Explore a 6U Earth observation satellite in interactive 3D. Learn spacecraft structure, power, ADCS, avionics, payload, communications, orbit and ground-station operations through visual engineering demonstrations.",
    );
    expect(CANONICAL).toBe(`https://aerospace.ev.engineer${ROUTE}`);
    expect(metadata.title).toBe(TITLE);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: CANONICAL, title: TITLE, description: DESCRIPTION });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("covers the keyword themes of the brief", () => {
    const keywords = (metadata.keywords as string[]).join(" | ").toLowerCase();
    for (const theme of ["satellite engineering", "cubesat", "3d satellite", "spacecraft systems", "satellite communication", "ground station", "satellite power system", "adcs", "satellite avionics", "satellite payload", "space engineering education"]) {
      expect(keywords, theme).toContain(theme);
    }
  });

  it("is listed in the sitemap", () => {
    expect(sitemap().find((entry) => entry.url === CANONICAL)).toMatchObject({ lastModified: "2026-10-01" });
  });

  it("is described in llms.txt without overstating what it is", () => {
    const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf-8");
    const line = llms.split("\n").find((l) => l.includes(CANONICAL));
    expect(line).toBeDefined();
    expect(line).toMatch(/Reference and simulated values; not flight hardware or a real mission/);
  });

  it("ships the social image background and the poster it references", () => {
    for (const file of ["og-background.jpg", "poster.jpg", "earth-day-2k.jpg", "earth-day-4k.jpg", "earth-night-2k.jpg", "earth-clouds-2k.jpg"]) {
      expect(fs.existsSync(path.join(ROOT, "public/space/satellite-explorer", file)), file).toBe(true);
    }
  });
});

describe("Satellite Explorer 3D structured data", () => {
  it("describes a web application and a learning resource, with a breadcrumb back to Satellite Engineering", () => {
    const graph = parseGraph();
    const types = graph.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
    expect(types).toEqual(expect.arrayContaining(["WebPage", "WebApplication", "LearningResource", "BreadcrumbList"]));
    const app = graph.find((n) => n["@type"] === "WebApplication") as Node;
    expect(app.applicationCategory).toBe("EducationalApplication");
    const crumbs = graph.find((n) => n["@type"] === "BreadcrumbList") as unknown as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Space", "Satellite Engineering", "Satellite Explorer 3D"]);
    expect(crumbs.itemListElement[2].item).toBe(CANONICAL);
  });

  it("claims no accreditation, rating or award", () => {
    expect(JSON.stringify(parseGraph())).not.toMatch(/accredit|aggregateRating|"review"|"award"|certif/i);
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

describe("CTA on the Satellite Engineering page", () => {
  it("links to the explorer from the reference-mission section, with the brief's copy", () => {
    const { container } = render(<SatelliteEngineeringPage />);
    const section = container.querySelector("#reference-mission") as HTMLElement;
    const cta = within(section).getByRole("complementary", { name: "Explore the 6U satellite in 3D" });
    expect(within(cta).getByText("See the spacecraft come alive")).toBeInTheDocument();
    expect(within(cta).getByText(/Build it\. Open it\. Follow power, data and RF signals\./)).toBeInTheDocument();
    expect(within(cta).getByText("Best experienced on Laptop/Desktop")).toBeInTheDocument();

    const link = within(cta).getByRole("link", { name: /Launch Satellite Explorer 3D/ });
    expect(link).toHaveAttribute("href", ROUTE);
    expect(link).toHaveAttribute("data-track-event", "satellite_3d_launch");
  });

  it("keeps the page's heading structure intact", () => {
    render(<SatelliteEngineeringPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 3, name: "Explore the 6U satellite in 3D" })).toBeInTheDocument();
  });
});

describe("cross-link on the CubeTwin page", () => {
  // The CubeTwin page starts a simulation worker when rendered, so its markup is checked at source level.
  const source = fs.readFileSync(path.join(ROOT, "src/app/space/cubesat/page.tsx"), "utf-8");

  it("adds a separate cross-link to the explorer with the brief's copy", () => {
    expect(source).toContain("FROM SIMULATION TO SPACECRAFT");
    expect(source).toContain("See where the battery, EPS, avionics, payload, ADCS and communications systems live inside a satellite.");
    expect(source).toContain("Explore Satellite in 3D");
    expect(source).toContain("Interactive desktop experience");
    expect(source).toContain(`href="${ROUTE}"`);
  });

  it("does not replace the energy-simulation call to action", () => {
    expect(source).toContain("Launch Energy Simulation");
    expect(source).toContain('href="#simulator"');
  });
});
