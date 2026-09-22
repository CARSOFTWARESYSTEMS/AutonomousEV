import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES } from "./defaults";
import {
  computeBaseSpeedKmh,
  computeSustainedClimbCheck,
  computeTractiveForceN,
  computeWheelTorqueNm,
  gradeabilityAtSpeedKmh,
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

describe("computeWheelTorqueNm", () => {
  it("computes wheelTorque = motorTorque x finalDriveRatio x drivetrainEfficiency", () => {
    expect(computeWheelTorqueNm(40, 9, 0.9)).toBeCloseTo(40 * 9 * 0.9, 6);
  });

  it("increases with final-drive ratio", () => {
    expect(computeWheelTorqueNm(40, 12, 0.9)).toBeGreaterThan(computeWheelTorqueNm(40, 9, 0.9));
  });
});

describe("computeTractiveForceN", () => {
  it("computes tractiveForce = wheelTorque / wheelRadius", () => {
    expect(computeTractiveForceN(324, 0.25)).toBeCloseTo(324 / 0.25, 6);
  });

  it("decreases with a larger wheel radius", () => {
    expect(computeTractiveForceN(324, 0.32)).toBeLessThan(computeTractiveForceN(324, 0.22));
  });
});

describe("computeBaseSpeedKmh", () => {
  it("increases with a higher base RPM", () => {
    expect(computeBaseSpeedKmh(4000, 9, 0.25)).toBeGreaterThan(computeBaseSpeedKmh(2000, 9, 0.25));
  });

  it("decreases with a higher final-drive ratio (more reduction, lower top speed at the same RPM)", () => {
    expect(computeBaseSpeedKmh(3000, 12, 0.25)).toBeLessThan(computeBaseSpeedKmh(3000, 6, 0.25));
  });

  it("increases with a larger wheel radius", () => {
    expect(computeBaseSpeedKmh(3000, 9, 0.3)).toBeGreaterThan(computeBaseSpeedKmh(3000, 9, 0.22));
  });
});

describe("gradeabilityAtSpeedKmh — torque-limited vs power-limited region", () => {
  const fullLoadMassKg = 1300;
  const selectedPeakKw = 14;

  it("falls back to power-limited with no note when no torque assumption is supplied", () => {
    const result = gradeabilityAtSpeedKmh(20, selectedPeakKw, fullLoadMassKg, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(result.region).toBe("power-limited");
    expect(result.note).toBeNull();
    expect(result.pct).toBeCloseTo(sustainedGradeabilityPct(selectedPeakKw, fullLoadMassKg, 20, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES), 6);
  });

  it("reports torque-limited below base speed and power-limited above it, when base RPM is known", () => {
    const overrides = { motorPeakTorqueNm: 45, finalDriveRatio: 9, wheelRadiusM: 0.25, baseMotorRpm: 3000 };
    const baseSpeedKmh = computeBaseSpeedKmh(3000, 9, 0.25);

    const below = gradeabilityAtSpeedKmh(Math.max(1, baseSpeedKmh - 5), selectedPeakKw, fullLoadMassKg, DEFAULT_ASSUMPTIONS, overrides);
    const above = gradeabilityAtSpeedKmh(baseSpeedKmh + 10, selectedPeakKw, fullLoadMassKg, DEFAULT_ASSUMPTIONS, overrides);

    expect(below.region).toBe("torque-limited");
    expect(below.note).toBeNull();
    expect(above.region).toBe("power-limited");
    expect(above.note).toBeNull();
  });

  it("reports the more conservative estimate with a caveat note when base RPM is unknown", () => {
    const overrides = { motorPeakTorqueNm: 45, finalDriveRatio: 9, wheelRadiusM: 0.25 };
    const result = gradeabilityAtSpeedKmh(20, selectedPeakKw, fullLoadMassKg, DEFAULT_ASSUMPTIONS, overrides);
    expect(result.note).not.toBeNull();
    const powerLimited = sustainedGradeabilityPct(selectedPeakKw, fullLoadMassKg, 20, DEFAULT_ASSUMPTIONS, overrides);
    expect(result.pct).toBeLessThanOrEqual(Math.max(result.pct, powerLimited));
  });
});

describe("computeSustainedClimbCheck — motor thermal duty", () => {
  it("always flags that detailed thermal validation is still required", () => {
    const result = computeSustainedClimbCheck(12, 25, 1300, 6, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(result.thermalValidationRequired).toBe(true);
  });

  it("computes a negative continuous-rating margin when the continuous rating is insufficient", () => {
    const result = computeSustainedClimbCheck(18, 25, 1300, 3, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(result.continuousRatingMarginKw).toBeLessThan(0);
  });

  it("computes a positive continuous-rating margin when the continuous rating comfortably covers the climb", () => {
    const result = computeSustainedClimbCheck(4, 15, 900, 10, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(result.continuousRatingMarginKw).toBeGreaterThan(0);
  });

  it("derives wheel power from motor power via drivetrain efficiency", () => {
    const result = computeSustainedClimbCheck(12, 25, 1300, 6, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(result.requiredWheelPowerKw).toBeCloseTo(result.requiredMotorPowerKw * DEFAULT_ASSUMPTIONS.drivetrainEfficiency, 6);
  });
});
