import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots.ts", () => {
  it("references the sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://autonomous.ev.engineer/sitemap.xml");
  });

  it("explicitly allows Googlebot, Bingbot, OAI-SearchBot and PerplexityBot", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const byAgent = Object.fromEntries(list.map((r) => [r.userAgent, r]));

    for (const agent of ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"]) {
      expect(byAgent[agent]).toBeDefined();
      expect(byAgent[agent]?.allow).toBe("/");
      expect(byAgent[agent]?.disallow).toBeUndefined();
    }
  });

  it("preserves the wildcard rule that already governed GPTBot, unchanged", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const wildcard = list.find((r) => r.userAgent === "*");
    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toBe("/");
    // No explicit GPTBot rule was added — its crawl policy stays exactly
    // what the pre-existing wildcard already granted.
    expect(list.some((r) => String(r.userAgent).toLowerCase() === "gptbot")).toBe(false);
  });
});
