import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import sitemap from "@/app/sitemap";
import AerospacePage from "../page";
import { CANONICAL, DESCRIPTION, TITLE, metadata, structuredData } from "./seo";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-uflight-manrope" }),
  Inter: () => ({ variable: "--font-uflight-inter" }),
}));

const ROUTE = "/aerospace/uflight-3d";
const ROOT = path.resolve(import.meta.dirname, "../../../..");

type Node = { "@type": string | string[]; "@id"?: string; [k: string]: unknown };

function parseGraph(): Node[] {
  const html = renderToStaticMarkup(<JsonLd data={structuredData} />);
  return JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""))["@graph"];
}

describe("UFlight 3D route", () => {
  it("exists at /aerospace/uflight-3d with its page, loading scene and social image", () => {
    for (const file of ["page.tsx", "loading.tsx", "UFlight3DPage.tsx", "seo.ts", "opengraph-image.tsx"]) {
      expect(fs.existsSync(path.join(ROOT, "src/app/aerospace/uflight-3d", file)), file).toBe(true);
    }
  });

  it("loads the 3D application only on the client, as its own chunk", () => {
    const entry = fs.readFileSync(path.join(ROOT, "src/components/uflight-3d/UFlightExplorer.tsx"), "utf-8");
    expect(entry).toMatch(/dynamic\(\(\) => import\("\.\/DesktopUFlight"\), \{\s*ssr: false/);
    // Nothing on the server or mobile path reaches three.js.
    for (const file of ["UFlightExplorer.tsx", "MobileUFlight.tsx", "ui/LoadingScreen.tsx"]) {
      const source = fs.readFileSync(path.join(ROOT, "src/components/uflight-3d", file), "utf-8");
      expect(source, file).not.toMatch(/from "(three|@react-three\/[a-z]+)/);
    }
  });
});

describe("UFlight 3D metadata", () => {
  it("uses the title, description and canonical from the brief", () => {
    expect(TITLE).toBe("UFlight™ 3D | Advanced eVTOL Health Monitoring & Digital Twin");
    expect(DESCRIPTION).toBe(
      "Explore a next-generation 6-seat electric aircraft in interactive 3D. Visualize propulsion, batteries, avionics, flight controls, sensor networks, HUMS, diagnostics, prognostics and digital-twin health monitoring.",
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
    for (const theme of ["advanced health monitoring systems", "hums aerospace", "evtol digital twin", "electric aircraft health monitoring", "aircraft predictive maintenance", "battery health aerospace", "aerospace prognostics", "aircraft fault diagnosis", "condition based maintenance", "flight control architecture", "aerospace digital engineering"]) {
      expect(keywords, theme).toContain(theme);
    }
  });

  it("is listed in the sitemap", () => {
    expect(sitemap().find((entry) => entry.url === CANONICAL)).toMatchObject({ lastModified: "2026-10-01" });
  });

  it("ships the rendered aircraft images it references", () => {
    for (const file of ["poster.jpg", "og-background.jpg"]) {
      const full = path.join(ROOT, "public/aerospace/uflight-3d", file);
      expect(fs.existsSync(full), file).toBe(true);
      expect(fs.statSync(full).size, file).toBeGreaterThan(8000);
    }
  });
});

describe("UFlight 3D structured data", () => {
  it("describes a web application and a learning resource, with a breadcrumb back to Aerospace", () => {
    const graph = parseGraph();
    const types = graph.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
    expect(types).toEqual(expect.arrayContaining(["WebPage", "WebApplication", "LearningResource", "BreadcrumbList"]));
    const app = graph.find((n) => n["@type"] === "WebApplication") as Node;
    expect(app.name).toBe("UFlight™ 3D");
    expect(app.description).toMatch(/Digital engineering demonstrator/);
    expect(app.description).toMatch(/simulated health data; not flight hardware/);
    const crumbs = graph.find((n) => n["@type"] === "BreadcrumbList") as unknown as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Aerospace", "UFlight™ 3D"]);
    expect(crumbs.itemListElement[1].item).toBe(CANONICAL);
  });

  it("claims no certification, flight readiness, production hardware, rating or award", () => {
    const page = graph();
    expect(page).not.toMatch(/certif|flight[- ]proven|flight ready|production[- ]ready|airworth|aggregateRating|"review"|"award"|accredit/i);
    function graph() {
      // Only this page's own statements: the shared person and organisation nodes are checked on their own pages.
      return JSON.stringify(parseGraph().filter((n) => String(n["@id"]).startsWith(CANONICAL)));
    }
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

describe("UFlight 3D section on the Aerospace homepage", () => {
  it("presents the experience with the brief's copy and a rendered aircraft", () => {
    render(<AerospacePage />);
    const section = screen.getByRole("region", { name: "THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE." });
    expect(within(section).getByText("UFLIGHT™ · DIGITAL ENGINEERING")).toBeInTheDocument();
    expect(
      within(section).getByText(
        "Explore a next-generation 6-seat electric aircraft from the inside. Follow propulsion, energy, avionics, flight-control and structural systems in 3D, then see how advanced health monitoring detects degradation, diagnoses faults and predicts maintenance needs.",
      ),
    ).toBeInTheDocument();
    expect(within(section).getByText("Best experienced on Desktop / Laptop")).toBeInTheDocument();
    const image = within(section).getByRole("img", { name: /UFlight™ Reference eVTOL/ });
    expect(image.getAttribute("src")).toContain("uflight-3d%2Fposter.jpg");
  });

  it("links to the experience and reports the launch", () => {
    render(<AerospacePage />);
    const link = screen.getByRole("link", { name: /LAUNCH UFLIGHT™ 3D/ });
    expect(link).toHaveAttribute("href", ROUTE);
    expect(link).toHaveAttribute("data-track-event", "uflight_3d_launch");
  });

  it("keeps the page's single H1", () => {
    render(<AerospacePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
