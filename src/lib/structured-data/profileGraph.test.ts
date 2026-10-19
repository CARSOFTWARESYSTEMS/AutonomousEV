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

  it("names EV.ENGINEER as the brand he maintains: not an employer, not a founder title, and no employer is claimed at all", () => {
    const person = findByType("Person");
    const brand = graph.find(
      (n) => (n as Record<string, unknown>).name === "EV.ENGINEER" && (n as Record<string, unknown>)["@type"] === "Brand"
    ) as Record<string, unknown>;
    expect(person.brand).toEqual({ "@id": brand["@id"] });
    expect(person.worksFor).toBeUndefined();
    expect(brand.founder).toBeUndefined();
    expect(JSON.stringify(graph)).not.toMatch(/founder of (the )?EV\.ENGINEER|founded (the )?EV\.ENGINEER|EV\.ENGINEER founder/i);
  });

  it("says he is the Founder of ISHAVASYAM.ORG, on the organisation and on the person", () => {
    const person = findByType("Person");
    const ishavasyam = graph.find((n) => (n as Record<string, unknown>).name === "ISHAVASYAM.ORG") as Record<string, unknown>;
    expect(ishavasyam["@type"]).toBe("Organization");
    expect(ishavasyam["@id"]).toBe("https://ishavasyam.org/#organization");
    expect(ishavasyam.founder).toEqual({ "@id": person["@id"] });
    expect(person.jobTitle).toBe("Founder, ISHAVASYAM.ORG");
    expect(person.affiliation).toEqual({ "@id": ishavasyam["@id"] });
  });

  it("keeps iTelematics as the website's publisher only: no job title, affiliation or employment of his there", () => {
    const person = findByType("Person");
    const itelematics = graph.find((n) => (n as Record<string, unknown>).name === "iTelematics Software Private Limited") as Record<string, unknown>;
    expect(itelematics["@type"]).toBe("Organization");
    expect(findByType("WebSite").publisher).toEqual({ "@id": itelematics["@id"] });
    expect(itelematics.founder).toBeUndefined();
    expect(itelematics.employee).toBeUndefined();
    // A consulting engagement is not a position: the person node does not point at it or name it.
    expect(JSON.stringify(person)).not.toContain(itelematics["@id"] as string);
    expect(JSON.stringify(person)).not.toMatch(/iTelematics|Consultant at|Consultant,/);
  });

  it("names CAR SOFTWARE SYSTEMS as something the page mentions, and gives it no relationship the page does not state", () => {
    const person = findByType("Person");
    const car = graph.find((n) => (n as Record<string, unknown>).name === "CAR SOFTWARE SYSTEMS") as Record<string, unknown>;
    expect(car).toMatchObject({ "@type": "Organization", url: "https://carsoftwaresystems.com/" });
    expect(Object.keys(car).sort()).toEqual(["@id", "@type", "description", "name", "url"]);
    expect(findByType("ProfilePage").mentions).toEqual([{ "@id": car["@id"] }]);
    expect(JSON.stringify(person)).not.toContain(car["@id"] as string);
  });

  it("never mentions Thasmai or Gamyaa: they are rows of the visible career and are not modelled", () => {
    expect(JSON.stringify(graph)).not.toMatch(/Thasmai|Gamyaa/i);
  });

  it("has one Person, and no reference to a node that is not in the graph", () => {
    expect(graph.filter((n) => (n as Record<string, unknown>)["@type"] === "Person")).toHaveLength(1);
    const ids = new Set(graph.map((n) => (n as Record<string, unknown>)["@id"]));
    const references = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    expect(references.length).toBeGreaterThanOrEqual(5);
    for (const reference of references) expect(ids, reference).toContain(reference);
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

  it("lists the subjects of the profile in knowsAbout: the established ones, then the newer research, then consulting and education", () => {
    const person = findByType("Person");
    expect(person.knowsAbout).toEqual([
      "Engineering Leadership",
      "Systems Architecture",
      "Software Engineering",
      "Cybersecurity",
      "Aerospace Cybersecurity",
      "Embedded Systems",
      "IoT",
      "GenAI for Engineering",
      "EV Battery Intelligence",
      "Digital Twins",
      "Space Systems Engineering",
      "Satellite Engineering",
      "Rocket & Propulsion Systems",
      "Spacecraft Health Management",
      "Aerospace Engineering Research",
      "Engineering Consulting",
      "Engineering Education",
      "Student Mentorship",
    ]);
  });

  it("lists subjects, not credentials: nothing in knowsAbout claims expertise, flight, operations, validation or certification", () => {
    const person = findByType("Person");
    const subjects = (person.knowsAbout as string[]).join(" | ");
    expect(subjects).not.toMatch(/expert|specialist|flight|operational|validated|certif|qualif/i);
    expect(new Set(person.knowsAbout as string[]).size).toBe((person.knowsAbout as string[]).length);
  });

  it("describes him as the page does: what he works on, the initiative he founded, EV.ENGINEER as an identity, and his background", () => {
    const person = findByType("Person");
    expect(person.description).toBe(
      "Sudarshana Karkala is a technology leader and systems architect working across Space, Aerospace, Digital Twins, Cybersecurity, Electric Vehicles and intelligent energy systems. He is the Founder of ISHAVASYAM.ORG; EV.ENGINEER is the engineering identity of his team and the projects they build together. His background spans engineering leadership, software architecture, cybersecurity, connected systems and engineering consulting, and he mentors engineering students.",
    );
    // The standalone consulting statement is gone.
    expect(person.description).not.toMatch(/Consultant at|iTelematics/);
  });

  it("claims no length of space or aerospace experience, and no flight, operational or certified experience", () => {
    const person = findByType("Person");
    expect(JSON.stringify(person)).not.toMatch(/20\+? years?|two decades/i);
    expect(person.description).not.toMatch(/propulsion expert|flight[- ]qualified|flight heritage|operational spacecraft|validated|certified/i);
  });

  it("never ties him to IN-SPACe or ISRO as an employer, an affiliation or a school", () => {
    expect(JSON.stringify(graph)).not.toMatch(/IN-SPACe|ISRO/i);
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
