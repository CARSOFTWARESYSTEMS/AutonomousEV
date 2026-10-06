import { describe, expect, it } from "vitest";
import { decide } from "./decision";
import { ROI_DEFAULTS, computeRoi } from "./roi";
import { SCORE_DIMENSIONS, scorePilotFit, type Answer, type Answers } from "./scorecard";

const all = (answer: Answer): Answers => Object.fromEntries(SCORE_DIMENSIONS.map((dimension) => [dimension.id, answer]));

describe("ROI arithmetic", () => {
  it("works the illustrative assumptions through to a payback period", () => {
    const result = computeRoi(ROI_DEFAULTS);
    expect(result.annualFais).toBe(96);
    expect(result.annualCharacteristics).toBe(14400);
    expect(result.annualHours).toBe(1536);
    expect(result.annualCost).toBe(1382400);
    expect(result.hoursSaved).toBeCloseTo(614.4);
    // 614.4 hours at 900 an hour, plus 40% of 300,000 of rework.
    expect(result.costSaved).toBeCloseTo(672960);
    expect(result.paybackMonths).toBeCloseTo(8.92, 1);
  });

  it("never recovers the cost when nothing is saved", () => {
    expect(computeRoi({ ...ROI_DEFAULTS, timeReductionPct: 0 }).paybackMonths).toBeNull();
    expect(computeRoi({ ...ROI_DEFAULTS, faisPerMonth: 0, reworkCostPerYear: 0 }).paybackMonths).toBeNull();
  });

  it("treats blank, negative and out-of-range input as zero or the limit", () => {
    const result = computeRoi({ ...ROI_DEFAULTS, faisPerMonth: Number.NaN, hoursPerFai: -5, timeReductionPct: 250 });
    expect(result.annualHours).toBe(0);
    expect(result.hoursSaved).toBe(0);
    // The reduction is capped at 100%, so all of the rework cost counts as saved.
    expect(result.costSaved).toBe(ROI_DEFAULTS.reworkCostPerYear);
  });
});

describe("pilot-fit scoring", () => {
  it("gives no band until every dimension is answered", () => {
    const partial = scorePilotFit({ "fai-frequency": 3 });
    expect(partial).toMatchObject({ answered: 1, total: 11, band: null });
  });

  it("maps the weighted score to LOW, MEDIUM, HIGH and VERY HIGH", () => {
    expect(scorePilotFit(all(0))).toMatchObject({ percent: 0, band: "LOW" });
    expect(scorePilotFit(all(1))).toMatchObject({ percent: 33, band: "LOW" });
    expect(scorePilotFit(all(2))).toMatchObject({ percent: 67, band: "HIGH" });
    expect(scorePilotFit(all(3))).toMatchObject({ percent: 100, band: "VERY HIGH" });
    expect(scorePilotFit({ ...all(1), "fai-frequency": 3, "manual-effort": 3, "pilot-readiness": 2 }).band).toBe("MEDIUM");
  });

  it("holds a strong score at MEDIUM when there is no interest in a pilot", () => {
    const result = scorePilotFit({ ...all(3), "pilot-readiness": 0 });
    expect(result.percent).toBeGreaterThanOrEqual(80);
    expect(result).toMatchObject({ band: "MEDIUM", capped: true });
  });
});

describe("decision framework", () => {
  it("builds on four or more, investigates on two or three, defers otherwise", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(decide)).toEqual(["DEFER", "DEFER", "INVESTIGATE", "INVESTIGATE", "BUILD", "BUILD", "BUILD"]);
  });
});
