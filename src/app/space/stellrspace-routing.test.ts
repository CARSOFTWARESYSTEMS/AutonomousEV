import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";
import { STELLR_SPACE, fromHostVariant } from "@/data/space-host-brands";
import { TRACKS } from "./academy/data/curriculum";
import { MISSIONS } from "./academy/data/missions";
import { routeConfigFor } from "@/config/premiumAuthRoutes";
import { isSelfContainedPath } from "@/components/ChromeGate";

type Rule = { source: string; has?: { type: string; value?: string }[]; destination: string; permanent?: boolean };

const HOST = "aerospace.stellrspace.com";
const OTHER_HOSTS = ["autonomous.ev.engineer", "aerospace.ev.engineer", "aerospace.ishavasyam.org", "aerospace.gamyaa.in", "stellrspace.com", "aerospacexstellrspace.com"];
const matchesHost = (rule: Rule, host: string) =>
  rule.has?.some((h) => h.type === "host" && new RegExp(`^${h.value}$`).test(host)) ?? false;
const beforeFiles = async () => ((await nextConfig.rewrites!()) as { beforeFiles: Rule[] }).beforeFiles;

describe("aerospace.stellrspace.com routing", () => {
  it("redirects the host's root to /space, permanently", async () => {
    const redirects = (await nextConfig.redirects!()) as Rule[];
    const rule = redirects.find((r) => r.source === "/" && matchesHost(r, HOST));
    expect(rule).toMatchObject({ destination: "/space", permanent: true });
    for (const other of OTHER_HOSTS) expect(matchesHost(rule!, other), other).toBe(false);
  });

  it("serves each of its own pages from its STELLR SPACE copy, and matches no other host", async () => {
    const rules = await beforeFiles();
    for (const path of [...STELLR_SPACE.paths, "/robots.txt", "/sitemap.xml"]) {
      const rule = rules.find((r) => r.source === path && matchesHost(r, HOST));
      expect(rule?.destination, path).toBe(`/stellrspace-space${path}`);
      for (const other of OTHER_HOSTS) expect(matchesHost(rule!, other), `${path} on ${other}`).toBe(false);
    }
  });

  it("covers /space, every Academy track and mission, the Space pages that name ISHAVASYAM.ORG, and the profile", () => {
    expect(STELLR_SPACE.paths).toEqual(expect.arrayContaining(["/space", "/space/academy", "/space/cubesat", "/space/space-station", "/about/sudarshana-karkala"]));
    for (const track of TRACKS) expect(STELLR_SPACE.paths).toContain(`/space/academy/${track.slug}`);
    for (const mission of MISSIONS) expect(STELLR_SPACE.paths).toContain(`/space/academy/missions/${mission.slug}`);
    // The APEX pages and the 2026 rocketry guide name no ISHAVASYAM.ORG, so the host serves them as they are.
    expect(STELLR_SPACE.paths.some((path) => path.startsWith("/space/partners") || path.includes("ROCKETRY"))).toBe(false);
  });

  it("gates and frames a copy as the page it stands for", () => {
    expect(fromHostVariant("/stellrspace-space/space/cubesat")).toBe("/space/cubesat");
    expect(fromHostVariant("/space/cubesat")).toBe("/space/cubesat");
    expect(fromHostVariant(null)).toBeNull();
    for (const path of ["/space/cubesat", "/space/space-station", "/space/satellite-engineering", "/space/model-rocketry"]) {
      expect(routeConfigFor(`/stellrspace-space${path}`), path).toEqual(routeConfigFor(path));
      expect(routeConfigFor(path), path).not.toBeNull();
    }
    expect(isSelfContainedPath("/stellrspace-space/space/academy")).toBe(true);
    expect(isSelfContainedPath("/stellrspace-space/about/sudarshana-karkala")).toBe(true);
  });
});
