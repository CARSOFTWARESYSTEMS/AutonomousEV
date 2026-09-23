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

  it("worksFor points at the EV.ENGINEER brand, and never mentions Thasmai Infotech", () => {
    const person = findByType("Person");
    const brand = graph.find(
      (n) => (n as Record<string, unknown>).name === "EV.ENGINEER" && (n as Record<string, unknown>)["@type"] === "Brand"
    ) as Record<string, unknown>;
    expect(person.worksFor).toEqual({ "@id": brand["@id"] });
    expect(JSON.stringify(graph)).not.toMatch(/Thasmai/i);
  });

  it("keeps EV.ENGINEER as a Brand node, not a legal Organization, among the affiliations", () => {
    const brand = graph.find(
      (n) => (n as Record<string, unknown>).name === "EV.ENGINEER" && (n as Record<string, unknown>)["@type"] === "Brand"
    ) as Record<string, unknown>;
    expect(brand).toBeDefined();
    expect(brand["@type"]).toBe("Brand");
  });

  it("sets alumniOf to NITK Surathkal, not IN-SPACe, ISRO or IIT Madras", () => {
    const person = findByType("Person");
    expect(person.alumniOf).toEqual({
      "@type": "CollegeOrUniversity",
      name: "National Institute of Technology Karnataka, Surathkal",
    });
    expect(JSON.stringify(graph)).not.toMatch(/"alumniOf":\{[^}]*IN-SPACe/);
    expect(JSON.stringify(graph)).not.toMatch(/"alumniOf":\{[^}]*ISRO/);
    expect(JSON.stringify(graph)).not.toMatch(/"alumniOf":\{[^}]*IIT Madras/);
  });

  it("includes Space Research and CanSat Model Rocketry in knowsAbout", () => {
    const person = findByType("Person");
    expect(person.knowsAbout).toContain("Space Research");
    expect(person.knowsAbout).toContain("CanSat Model Rocketry");
  });

  it("includes the 2026 Space Systems, Avionics and Aerospace Cybersecurity focus areas in knowsAbout", () => {
    const person = findByType("Person");
    expect(person.knowsAbout).toContain("Space Systems & Applications");
    expect(person.knowsAbout).toContain("Avionics & Telemetry");
    expect(person.knowsAbout).toContain("Digital Twins");
    expect(person.knowsAbout).toContain("Aerospace Cybersecurity");
  });

  it("sets jobTitle to the 2026 Director of Engineering positioning without claiming 20+ years of aerospace experience", () => {
    const person = findByType("Person");
    expect(person.jobTitle).toBe("Director of Engineering | Technology & R&D Consultant");
    expect(JSON.stringify(person)).not.toMatch(/20\+? years?[^"]*aerospace/i);
    expect(JSON.stringify(person)).not.toMatch(/two decades[^"]*aerospace/i);
  });

  it("never sets worksFor to IN-SPACe or ISRO", () => {
    const person = findByType("Person");
    expect(JSON.stringify(person.worksFor)).not.toMatch(/IN-SPACe|ISRO/i);
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
