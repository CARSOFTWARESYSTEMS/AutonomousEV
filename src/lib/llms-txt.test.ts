import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sitemap from "@/app/sitemap";

const LLMS_TXT_PATH = path.resolve(import.meta.dirname, "../../public/llms.txt");

function extractUrls(text: string): string[] {
  // Matches URLs inside markdown links: [label](https://...)
  const matches = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)];
  return matches.map((m) => m[1]);
}

describe("public/llms.txt", () => {
  it("exists and is non-empty", () => {
    expect(fs.existsSync(LLMS_TXT_PATH)).toBe(true);
    const content = fs.readFileSync(LLMS_TXT_PATH, "utf-8");
    expect(content.length).toBeGreaterThan(0);
  });

  it("every autonomous.ev.engineer URL it references resolves to a canonical page listed in the sitemap", () => {
    const content = fs.readFileSync(LLMS_TXT_PATH, "utf-8");
    const urls = extractUrls(content).filter((u) => u.includes("autonomous.ev.engineer"));
    expect(urls.length).toBeGreaterThan(0);

    const sitemapUrls = new Set(sitemap().map((e) => e.url));
    // The home page itself ("/") plus every other referenced route must be
    // in the sitemap (sitemap.ts always includes "/").
    urls.forEach((url) => {
      expect(sitemapUrls.has(url)).toBe(true);
    });
  });

  it("does not reference any private, admin or noindex-only route", () => {
    const content = fs.readFileSync(LLMS_TXT_PATH, "utf-8");
    // Inspect URL paths: aerospace.ev.engineer is a public hostname, not /aerospace.
    for (const url of extractUrls(content)) {
      const pathname = new URL(url).pathname;
      expect(pathname).not.toMatch(/^\/aerospace(?:\/|$)/);
      expect(pathname).not.toMatch(/^\/(?:admin|api)(?:\/|$)/i);
    }
  });

  it("does not contain a full private telephone or email", () => {
    const content = fs.readFileSync(LLMS_TXT_PATH, "utf-8");
    expect(content).not.toMatch(/9845561518/);
    expect(content).not.toMatch(/@/);
  });
});
