import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes the new battery cybersecurity route", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://autonomous.ev.engineer/design-development/passenger-taxi/battery-cybersecurity");
  });

  it("still includes the existing passenger taxi route", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://autonomous.ev.engineer/design-development/passenger-taxi");
  });
});
