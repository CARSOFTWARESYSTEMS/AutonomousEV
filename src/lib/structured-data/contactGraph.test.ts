import { describe, expect, it } from "vitest";
import { buildContactGraph } from "./contactGraph";

const graph = buildContactGraph({
  title: "Contact | EV.ENGINEER™",
  description: "test description",
});

function findByType(type: string) {
  return graph.find((n) => (n as Record<string, unknown>)["@type"] === type) as Record<string, unknown>;
}

describe("/contact JSON-LD entity graph", () => {
  it("serializes to valid, parseable JSON", () => {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("uses ContactPage with a ContactPoint mainEntity", () => {
    const contactPage = findByType("ContactPage");
    expect(contactPage).toBeDefined();
    const contactPoint = contactPage.mainEntity as Record<string, unknown>;
    expect(contactPoint["@type"]).toBe("ContactPoint");
  });

  it("matches exactly the email and phone visibly printed on /contact — no invented values", () => {
    const contactPage = findByType("ContactPage");
    const contactPoint = contactPage.mainEntity as Record<string, unknown>;
    expect(contactPoint.email).toBe("info@iTelematics.com");
    expect(contactPoint.telephone).toBe("+91 91082 06147");
  });

  it("never uses Sudarshana Karkala's personal phone number as the site-wide business ContactPoint", () => {
    expect(JSON.stringify(graph)).not.toMatch(/9845561518/);
  });

  it("does not use a placeholder value for the contact fields", () => {
    const serialized = JSON.stringify(graph);
    expect(serialized).not.toMatch(/PUBLIC_VERIFIED_EMAIL|example\.com|xxx|TODO|TBD/i);
  });
});
