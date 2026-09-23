import { describe, expect, it } from "vitest";
import { CONCEPT_TARGET_DIMENSIONS, computeVehicleDimensions, validateDimensions } from "./dimensions";
import { EMPTY_OVERRIDES } from "./defaults";
import { DEFAULT_WHEEL_RADIUS_M } from "./powertrain";

describe("computeVehicleDimensions", () => {
  it("returns the concept target envelope with no overrides", () => {
    const result = computeVehicleDimensions(EMPTY_OVERRIDES);
    expect(result.overallLengthMm).toBe(CONCEPT_TARGET_DIMENSIONS.overallLengthMm);
    expect(result.wheelbaseMm).toBe(CONCEPT_TARGET_DIMENSIONS.wheelbaseMm);
  });

  it("lets an explicit override win over the concept target", () => {
    const result = computeVehicleDimensions({ overallLengthMm: 3400 });
    expect(result.overallLengthMm).toBe(3400);
    expect(result.wheelbaseMm).toBe(CONCEPT_TARGET_DIMENSIONS.wheelbaseMm);
  });

  it("derives wheel diameter from wheelRadiusM — the same value the powertrain model uses — rather than an independent constant", () => {
    const defaultResult = computeVehicleDimensions(EMPTY_OVERRIDES);
    expect(defaultResult.wheelDiameterMm).toBeCloseTo(DEFAULT_WHEEL_RADIUS_M * 2 * 1000, 6);

    const overridden = computeVehicleDimensions({ wheelRadiusM: 0.3 });
    expect(overridden.wheelDiameterMm).toBeCloseTo(0.3 * 2 * 1000, 6);
  });
});

describe("validateDimensions", () => {
  it("flags a wheelbase too short for D+6 packaging", () => {
    const dims = computeVehicleDimensions({ wheelbaseMm: 1900 });
    const warnings = validateDimensions(dims, { passengerCapacity: 6 });
    expect(warnings.some((w) => w.title === "Wheelbase Too Short")).toBe(true);
  });

  it("does not flag a short wheelbase for a smaller D+3 configuration", () => {
    const dims = computeVehicleDimensions({ wheelbaseMm: 1900 });
    const warnings = validateDimensions(dims, { passengerCapacity: 3 });
    expect(warnings.some((w) => w.title === "Wheelbase Too Short")).toBe(false);
  });

  it("flags a width review for a narrow cabin with 5+ passengers", () => {
    const dims = computeVehicleDimensions({ overallWidthMm: 1300 });
    const warnings = validateDimensions(dims, { passengerCapacity: 5 });
    expect(warnings.some((w) => w.title === "Width Review Required")).toBe(true);
  });

  it("flags a ground-clearance review for a low value", () => {
    const dims = computeVehicleDimensions({ groundClearanceMm: 120 });
    const warnings = validateDimensions(dims, { passengerCapacity: 6 });
    expect(warnings.some((w) => w.title === "Ground Clearance Review")).toBe(true);
  });

  it("flags a stability review when height is tall relative to track width", () => {
    const dims = computeVehicleDimensions({ overallHeightMm: 2400, frontTrackMm: 1000, rearTrackMm: 1000 });
    const warnings = validateDimensions(dims, { passengerCapacity: 6 });
    expect(warnings.some((w) => w.title === "Stability Review Required")).toBe(true);
  });

  it("returns no warnings for the default concept-target envelope at D+6", () => {
    const dims = computeVehicleDimensions(EMPTY_OVERRIDES);
    const warnings = validateDimensions(dims, { passengerCapacity: 6 });
    expect(warnings).toHaveLength(0);
  });
});
