import { describe, expect, it } from "vitest";
import { COMPETITORS } from "./competitors";

describe("competitor weight data integrity", () => {
  it("never lists Bajaj RE E-TEC 9.0's GVW (708 kg) as its kerb weight", () => {
    const bajaj = COMPETITORS.find((c) => c.id === "bajaj-re-etec-9-0");
    expect(bajaj).toBeDefined();
    // Regression guard: a secondary source (91trucks.com) mislabeled Bajaj's
    // 708 kg GVW/dry-weight figure as kerb weight. Verified against two
    // independent sources that the actual kerb weight is 362 kg.
    expect(bajaj?.kerbWeightKg).toBe(362);
    expect(bajaj?.gvwKg).toBe(708);
  });

  it("keeps kerb weight within a physically plausible range for this vehicle class (never a GVW-scale figure)", () => {
    for (const c of COMPETITORS) {
      if (c.kerbWeightKg !== null) {
        expect(c.kerbWeightKg).toBeGreaterThan(200);
        expect(c.kerbWeightKg).toBeLessThan(600);
      }
    }
  });

  it("keeps kerb weight strictly less than GVW whenever both are known", () => {
    for (const c of COMPETITORS) {
      if (c.kerbWeightKg !== null && c.gvwKg !== null) {
        expect(c.kerbWeightKg).toBeLessThan(c.gvwKg);
      }
    }
  });
});
