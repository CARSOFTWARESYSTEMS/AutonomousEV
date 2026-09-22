import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES } from "./defaults";
import {
  hillStartGradeabilityPct,
  sustainedGradeabilityPct,
  terrainGradeTargetPct,
} from "./powertrain";

describe("sustainedGradeabilityPct", () => {
  it("decreases as loaded mass increases, all else equal", () => {
    const light = sustainedGradeabilityPct(12, 900, 25, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const heavy = sustainedGradeabilityPct(12, 1400, 25, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(heavy).toBeLessThan(light);
  });

  it("increases with more peak power, all else equal", () => {
    const small = sustainedGradeabilityPct(9, 1200, 25, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const large = sustainedGradeabilityPct(16, 1200, 25, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(large).toBeGreaterThan(small);
  });

  it("is unaffected by final-drive ratio or wheel radius (power-limited, not torque-limited)", () => {
    const base = sustainedGradeabilityPct(12, 1200, 25, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const withDriveline = sustainedGradeabilityPct(12, 1200, 25, DEFAULT_ASSUMPTIONS, {
      finalDriveRatio: 12,
      wheelRadiusM: 0.3,
    });
    expect(withDriveline).toBeCloseTo(base, 6);
  });

  it("never returns a negative grade", () => {
    const result = sustainedGradeabilityPct(1, 5000, 60, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe("hillStartGradeabilityPct — torque-limited hill-start capability", () => {
  it("increases with a higher final-drive ratio, all else equal", () => {
    const lowRatio = hillStartGradeabilityPct(45, 6, 0.25, 1200, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const highRatio = hillStartGradeabilityPct(45, 12, 0.25, 1200, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(highRatio).toBeGreaterThan(lowRatio);
  });

  it("decreases with a larger wheel radius, all else equal", () => {
    const smallWheel = hillStartGradeabilityPct(45, 9, 0.22, 1200, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const largeWheel = hillStartGradeabilityPct(45, 9, 0.32, 1200, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(largeWheel).toBeLessThan(smallWheel);
  });

  it("decreases as loaded mass increases, all else equal", () => {
    const light = hillStartGradeabilityPct(45, 9, 0.25, 900, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const heavy = hillStartGradeabilityPct(45, 9, 0.25, 1400, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(heavy).toBeLessThan(light);
  });

  it("increases with more motor peak torque, all else equal", () => {
    const low = hillStartGradeabilityPct(30, 9, 0.25, 1200, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const high = hillStartGradeabilityPct(60, 9, 0.25, 1200, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(high).toBeGreaterThan(low);
  });
});

describe("terrainGradeTargetPct", () => {
  it("orders targets flat < mixed < hilly", () => {
    expect(terrainGradeTargetPct("flat")).toBeLessThan(terrainGradeTargetPct("mixed"));
    expect(terrainGradeTargetPct("mixed")).toBeLessThan(terrainGradeTargetPct("hilly"));
  });
});
