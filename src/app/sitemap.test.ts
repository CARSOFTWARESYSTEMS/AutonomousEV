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

  it("includes the renamed EV Auto Rickshaw route and not the old misspelled one", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://autonomous.ev.engineer/internships/evAutoRickshaw");
    expect(urls).not.toContain("https://autonomous.ev.engineer/internships/evAutoRiksha");
  });

  it("lists /space exactly once, with its canonical (non-trailing-slash) URL and a real lastModified date", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    const spaceEntries = entries.filter((e) => e.url === "https://autonomous.ev.engineer/space");
    expect(spaceEntries).toHaveLength(1);
    expect(urls).not.toContain("https://autonomous.ev.engineer/space/");
    expect(spaceEntries[0].lastModified).toBeInstanceOf(Date);
  });
});
