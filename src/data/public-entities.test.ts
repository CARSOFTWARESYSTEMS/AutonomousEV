import { describe, expect, it } from "vitest";
import {
  EV_ENGINEER,
  ITELEMATICS,
  EV_SOCIETY,
  SUDARSHANA_KARKALA,
  INTERNSHIP_PROGRAM,
  PUBLIC_CONTACT,
} from "./public-entities";

const ALL_ENTITIES = [EV_ENGINEER, ITELEMATICS, EV_SOCIETY, SUDARSHANA_KARKALA, INTERNSHIP_PROGRAM];

describe("public-entities registry", () => {
  it("gives every entity a distinct, absolute-https @id and canonical URL", () => {
    const ids = ALL_ENTITIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    ALL_ENTITIES.forEach((e) => {
      expect(e.id).toMatch(/^https:\/\//);
      expect(e.canonicalUrl).toMatch(/^https:\/\//);
    });
  });

  it("does not record any email address for Sudarshana Karkala personally", () => {
    expect(SUDARSHANA_KARKALA.publicEmail).toBeUndefined();
    expect(JSON.stringify(SUDARSHANA_KARKALA)).not.toMatch(/@/);
  });

  it("keeps EV.ENGINEER typed as a Brand, not a legal Organization", () => {
    expect(EV_ENGINEER.type).toBe("Brand");
  });

  it("keeps EV Society as a plain, unregistered community initiative — no Section 8 / CIN claims", () => {
    expect(EV_SOCIETY.type).toBe("Organization");
    const serialized = JSON.stringify(EV_SOCIETY);
    expect(serialized).not.toMatch(/Section\s*8/i);
    expect(serialized).not.toMatch(/\bCIN\b/i);
  });

  it("does not reference Thasmai Infotech anywhere in Sudarshana Karkala's profile", () => {
    expect(JSON.stringify(SUDARSHANA_KARKALA)).not.toMatch(/Thasmai/i);
  });

  it("Sudarshana Karkala's only verified telephone number matches the one reused elsewhere in the repo", () => {
    expect(SUDARSHANA_KARKALA.publicTelephone).toBe("+91 9845561518");
  });

  it("the public contact point matches the values printed on /contact, not an invented number", () => {
    expect(PUBLIC_CONTACT.email).toBe("info@iTelematics.com");
    expect(PUBLIC_CONTACT.telephone).toBe("+91 91082 06147");
    // Distinct from Sudarshana Karkala's personal number — /contact never
    // printed his number, so it must not appear here.
    expect(PUBLIC_CONTACT.telephone).not.toBe(SUDARSHANA_KARKALA.publicTelephone);
  });

  it("only lists sameAs profiles that are external, verifiable URLs (no internal pages)", () => {
    (SUDARSHANA_KARKALA.sameAs ?? []).forEach((url) => {
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toContain("autonomous.ev.engineer");
    });
  });
});
