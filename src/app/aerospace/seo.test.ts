import { describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { metadata } from "./layout";
import { metadata as gamyaaMetadata } from "../gamyaa-aerospace/page";
import { GET as socialImage, dynamic as socialImageRendering } from "./og-image.jpg/route";
import { CANONICAL, DESCRIPTION, GAMYAA_CANONICAL, OG_ALT, OG_IMAGE, ORIGIN, TITLE } from "./seo";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-uflight-manrope" }),
  Inter: () => ({ variable: "--font-uflight-inter" }),
}));

type Image = { url: string; width: number; height: number; type: string; alt: string };

describe("/aerospace social preview", () => {
  it("is titled Aerospace Cybersecurity, with a description about aircraft, satellites and mission-critical systems", () => {
    expect(TITLE).toBe("Aerospace Cybersecurity");
    expect(metadata.title).toBe(TITLE);
    expect(metadata.description).toBe(DESCRIPTION);
    expect(DESCRIPTION).toMatch(/aircraft/);
    expect(DESCRIPTION).toMatch(/satellites/);
    expect(DESCRIPTION).toMatch(/mission-critical/);
    expect(DESCRIPTION.length).toBeLessThanOrEqual(170);
    expect(metadata.keywords).toContain("aerospace cybersecurity");
  });

  it("has one canonical address and resolves every relative URL against it", () => {
    expect(metadata.metadataBase?.toString()).toBe(`${ORIGIN}/`);
    expect(metadata.alternates?.canonical).toBe("https://aerospace.ev.engineer/aerospace");
    expect((metadata.openGraph as { url: string }).url).toBe(CANONICAL);
  });

  it("declares one image, shared by Open Graph and Twitter, at an absolute https .jpg URL with no query string", () => {
    const og = (metadata.openGraph as { images: Image[] }).images;
    const twitter = (metadata.twitter as { images: Image[]; card: string }).images;
    expect(og).toHaveLength(1);
    expect(twitter).toEqual(og);
    expect((metadata.twitter as { card: string }).card).toBe("summary_large_image");
    expect(og[0]).toEqual({ url: OG_IMAGE, width: 1200, height: 630, type: "image/jpeg", alt: OG_ALT });
    const url = new URL(og[0].url);
    expect(url.protocol).toBe("https:");
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/aerospace/og-image.jpg");
    expect(url.search).toBe("");
  });

  it("serves the image from a static route, and no file convention overrides it", () => {
    expect(socialImageRendering).toBe("force-static");
    expect(typeof socialImage).toBe("function");
    const here = import.meta.dirname;
    for (const name of ["opengraph-image.tsx", "opengraph-image.png", "opengraph-image.jpg", "twitter-image.tsx"]) expect(existsSync(resolve(here, name)), name).toBe(false);
    expect(existsSync(resolve(here, "og-image.jpg", "route.tsx"))).toBe(true);
  });

  it("gives the Gamyaa.in variant the same preview at its own address", () => {
    expect(gamyaaMetadata.title).toBe(TITLE);
    expect(gamyaaMetadata.alternates?.canonical).toBe(GAMYAA_CANONICAL);
    expect((gamyaaMetadata.openGraph as { url: string; images: Image[] }).url).toBe(GAMYAA_CANONICAL);
    expect((gamyaaMetadata.openGraph as { images: Image[] }).images[0].url).toBe(OG_IMAGE);
  });

  it("keeps the page out of search indexes, as before", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
