import { describe, expect, it } from "vitest";
import { buildProfileGraph } from "./profileGraph";

const graph = buildProfileGraph({
  title: "Sudarshana Karkala | Profile, Projects and Contact | EV.ENGINEER™",
  description: "test description",
  dateModified: "2026-08-17",
});

function findByType(type: string) {
  return graph.find((n) => (n as Record<string, unknown>)["@type"] === type) as Record<string, unknown>;
}

describe("/about/sudarshana-karkala JSON-LD entity graph", () => {
  it("serializes to valid, parseable JSON", () => {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("every node has a distinct @id", () => {
    const ids = graph.map((n) => (n as Record<string, unknown>)["@id"]).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("identifies Person as the ProfilePage's mainEntity", () => {
    const person = findByType("Person");
    const profilePage = findByType("ProfilePage");
    expect(person).toBeDefined();
    expect(profilePage).toBeDefined();
    expect(profilePage.mainEntity).toEqual({ "@id": person["@id"] });
  });

  it("gives Person the full public name and a stable canonical URL", () => {
    const person = findByType("Person");
    expect(person.name).toBe("Sudarshana Karkala");
    expect(person.url).toBe("https://autonomous.ev.engineer/about/sudarshana-karkala");
  });

  it("does not put a private email address into the Person node", () => {
    const person = findByType("Person");
    expect(JSON.stringify(person)).not.toMatch(/"email"/);
    expect(JSON.stringify(person)).not.toMatch(/@\w+\.\w+/); // no email-shaped string anywhere
  });

  it("only includes the verified-public phone number, matching the value reused elsewhere in the repo", () => {
    const person = findByType("Person");
    const contactPoint = person.contactPoint as Record<string, unknown>;
    expect(contactPoint.telephone).toBe("+91 9845561518");
  });

  it("only cites the one verified LinkedIn and Topmate profile as sameAs — no unverified socials", () => {
    const person = findByType("Person");
    expect(person.sameAs).toEqual([
      "https://www.linkedin.com/in/sudarshanakarkala/",
      "https://topmate.io/sudarshana_karkala",
    ]);
  });

  it("worksFor points at Thasmai Infotech, not iTelematics or EV.ENGINEER directly", () => {
    const person = findByType("Person");
    const thasmai = graph.find(
      (n) => (n as Record<string, unknown>).name === "Thasmai Infotech Private Limited"
    ) as Record<string, unknown>;
    expect(person.worksFor).toEqual({ "@id": thasmai["@id"] });
  });

  it("keeps EV.ENGINEER as a Brand node, not a legal Organization, among the affiliations", () => {
    const brand = graph.find(
      (n) => (n as Record<string, unknown>).name === "EV.ENGINEER" && (n as Record<string, unknown>)["@type"] === "Brand"
    ) as Record<string, unknown>;
    expect(brand).toBeDefined();
    expect(brand["@type"]).toBe("Brand");
  });

  it("includes a three-item breadcrumb: Home, About, Sudarshana Karkala", () => {
    const profilePage = findByType("ProfilePage");
    const breadcrumb = profilePage.breadcrumb as Record<string, unknown>;
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(3);
    expect(items[2].name).toBe("Sudarshana Karkala");
    expect(items[2].item).toBe("https://autonomous.ev.engineer/about/sudarshana-karkala");
  });
});
