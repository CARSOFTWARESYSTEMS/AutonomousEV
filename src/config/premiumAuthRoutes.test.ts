import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROUTE_ACCESS,
  normalizeRoutePath,
  premiumAuthRoutes,
  routeAccessFor,
  routeConfigFor,
} from "./premiumAuthRoutes";

const REQUIRED = [
  "/aerospace/uflight-3d",
  "/space/satellite-engineering",
  "/space/satellite-engineering/interactive-3d",
  "/space/everyday-applications",
  "/space/model-rocketry",
  "/space/cubesat",
  "/space/space-station",
  "/space/rocket-engine-digital-twin",
  "/space/rocket-engine-digital-twin-advanced",
  "/internships",
  "/workshop",
];

describe("premium route table", () => {
  it("requires login on exactly the specified pages", () => {
    expect(premiumAuthRoutes.filter((r) => r.access === "required-login").map((r) => r.path).sort()).toEqual([...REQUIRED].sort());
  });

  it("lists each path once, with a label and a category", () => {
    const paths = premiumAuthRoutes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const r of premiumAuthRoutes) {
      expect(r.label.trim().length, r.path).toBeGreaterThan(0);
      expect(["aerospace", "space", "internships"]).toContain(r.category);
      expect(r.path, "normalised").toBe(normalizeRoutePath(r.path));
    }
  });

  it("names pages that exist (a page file, or a rewrite to one)", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    for (const { path } of premiumAuthRoutes) {
      const page = join(process.cwd(), "src/app", path, "page.tsx");
      expect(existsSync(page) || config.includes(`source: '${path}'`), path).toBe(true);
    }
  });
});

describe("matching", () => {
  it("matches exact paths, ignoring a trailing slash", () => {
    expect(routeAccessFor("/space/cubesat")).toBe("required-login");
    expect(routeAccessFor("/space/cubesat/")).toBe("required-login");
    expect(routeConfigFor("/space/cubesat")?.label).toBe("CubeSat / CubeTwin");
  });

  it("does not cover sub-pages, neighbours, other cases or prefixes", () => {
    for (const path of [
      "/space/cubesat/extra",
      "/space/cubesatx",
      "/Space/CubeSat",
      "/space",
      "/aerospace",
      "/internships/aerospace-quality-intelligence-platform",
      "/internships/ev-battery-health-diagnostics-toolkit",
      "/space/satellite-engineering/interactive-3d/x",
    ]) {
      expect(routeConfigFor(path), path).toBeNull();
    }
  });

  it("leaves every other page to the default: the optional five-minute prompt", () => {
    expect(DEFAULT_ROUTE_ACCESS).toBe("optional-login");
    expect(routeAccessFor("/")).toBe("optional-login");
    expect(routeAccessFor("/space")).toBe("optional-login");
    expect(routeAccessFor(null)).toBe("optional-login");
  });
});
