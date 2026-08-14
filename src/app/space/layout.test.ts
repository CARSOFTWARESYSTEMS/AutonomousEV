import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

const BATTERY_TERMS = [
  "battery",
  "lithium",
  "bms",
  "second-life",
  "ev battery",
  "sudarshana karkala",
];

describe("/space metadata", () => {
  it("has the specified title, description and canonical URL", () => {
    expect(metadata.title).toBe("Spacecraft Health Management Mission 2040 | EV Society");
    expect(metadata.description).toBe(
      "Explore EV Society's Mission 2040 for autonomous spacecraft health management, telemetry, digital twins, FDIR, prognostics and verified safe recovery."
    );
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/space");
  });

  it("is indexable, unlike /aerospace", () => {
    const robots = metadata.robots as {
      index: boolean;
      follow: boolean;
      googleBot: {
        index: boolean;
        follow: boolean;
        "max-image-preview": string;
        "max-snippet": number;
        "max-video-preview": number;
      };
    };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
    expect(robots.googleBot.index).toBe(true);
    expect(robots.googleBot.follow).toBe(true);
    expect(robots.googleBot["max-image-preview"]).toBe("large");
    expect(robots.googleBot["max-snippet"]).toBe(-1);
    expect(robots.googleBot["max-video-preview"]).toBe(-1);
  });

  it("does not inherit EV-battery keywords from the root layout", () => {
    const keywords = (metadata.keywords as string[]).map((k) => k.toLowerCase());
    for (const term of BATTERY_TERMS) {
      expect(keywords.some((k) => k.includes(term))).toBe(false);
    }
    expect(keywords).toContain("autonomous spacecraft health management");
    expect(keywords).toContain("spacecraft fdir");
  });

  it("attributes the page to EV Society rather than inheriting the root layout's individual author", () => {
    const authors = metadata.authors as { name: string }[];
    expect(authors.some((a) => a.name === "EV Society")).toBe(true);
    expect(authors.some((a) => a.name === "Sudarshana Karkala")).toBe(false);
    expect(metadata.creator).toBe("EV Society");
    expect(metadata.publisher).toBe("EV Society");
  });

  it("sets Open Graph type, site name, url and Twitter card", () => {
    const openGraph = metadata.openGraph as Record<string, unknown>;
    const twitter = metadata.twitter as Record<string, unknown>;
    expect(openGraph.type).toBe("website");
    expect(openGraph.siteName).toBe("EV.ENGINEER");
    expect(openGraph.url).toBe("https://autonomous.ev.engineer/space");
    expect(twitter.card).toBe("summary_large_image");
  });
});
