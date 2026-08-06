import { describe, expect, it } from "vitest";
import { buildRiskMatrix, deriveLikelihood, priorityFor } from "./wizardRiskMatrix";
import type { BucketedRecommendation } from "./types";

function makeRec(overrides: Partial<BucketedRecommendation> = {}): BucketedRecommendation {
  return {
    id: "rec-x",
    questionId: "secure-boot",
    title: "Test",
    rationale: "r",
    verification: "v",
    expectedBenefit: "b",
    priority: "high",
    bucket: "immediate",
    ...overrides,
  };
}

describe("deriveLikelihood", () => {
  it("is 'likely' for an explicit No answer", () => {
    expect(deriveLikelihood({ x: false }, "x")).toBe("likely");
  });
  it("is 'possible' for an unanswered question", () => {
    expect(deriveLikelihood({}, "x")).toBe("possible");
  });
});

describe("priorityFor", () => {
  it("critical impact + likely gap always resolves to critical priority", () => {
    expect(priorityFor("likely", "critical")).toBe("critical");
  });
  it("low impact + rare likelihood resolves to low priority", () => {
    expect(priorityFor("rare", "low")).toBe("low");
  });
});

describe("buildRiskMatrix", () => {
  it("groups recommendations into the correct cell", () => {
    const cells = buildRiskMatrix([makeRec({ questionId: "secure-boot", priority: "critical" })], { "secure-boot": false });
    expect(cells).toHaveLength(1);
    expect(cells[0].likelihood).toBe("likely");
    expect(cells[0].impact).toBe("critical");
    expect(cells[0].priority).toBe("critical");
    expect(cells[0].recommendations).toHaveLength(1);
  });

  it("every recommendation passed in appears in exactly one cell", () => {
    const recs = [
      makeRec({ id: "a", questionId: "secure-boot", priority: "critical" }),
      makeRec({ id: "b", questionId: "unanswered-q", priority: "medium" }),
    ];
    const cells = buildRiskMatrix(recs, { "secure-boot": false });
    const total = cells.reduce((n, c) => n + c.recommendations.length, 0);
    expect(total).toBe(recs.length);
  });
});
