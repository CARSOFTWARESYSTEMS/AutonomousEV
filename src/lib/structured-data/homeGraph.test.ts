import { describe, expect, it } from "vitest";
import { buildHomeGraph } from "./homeGraph";

const graph = buildHomeGraph({ title: "EV.ENGINEER™ | Home", description: "test description" });

describe("/ (home) JSON-LD entity graph", () => {
  it("serializes to valid, parseable JSON", () => {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("includes a WebPage node for the home page itself with an absolute canonical URL", () => {
    const webpage = graph.find((n) => (n as Record<string, unknown>)["@type"] === "WebPage") as Record<
      string,
      unknown
    >;
    expect(webpage).toBeDefined();
    expect(webpage.url).toBe("https://autonomous.ev.engineer/");
  });

  it("includes the WebSite and Brand nodes so the home page anchors the site graph", () => {
    expect(graph.some((n) => (n as Record<string, unknown>)["@type"] === "WebSite")).toBe(true);
    expect(graph.some((n) => (n as Record<string, unknown>)["@type"] === "Brand")).toBe(true);
  });

  it("every node has a distinct @id", () => {
    const ids = graph.map((n) => (n as Record<string, unknown>)["@id"]).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
