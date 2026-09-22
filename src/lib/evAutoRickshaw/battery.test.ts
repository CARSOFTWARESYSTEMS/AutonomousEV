import { describe, expect, it } from "vitest";
import { BATTERY_CAPACITY_MAX_KWH, BATTERY_CAPACITY_MIN_KWH, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES } from "./defaults";
import { clampCapacity, estimateBatteryMassKg, recommendBatteryCapacityKWh, usableEnergyWh } from "./battery";

describe("recommendBatteryCapacityKWh", () => {
  it("recommends a larger battery for a longer daily distance", () => {
    const small = recommendBatteryCapacityKWh(80 * 90, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const large = recommendBatteryCapacityKWh(200 * 90, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(large).toBeGreaterThan(small);
  });

  it("clamps recommendations within the supported 8-16 kWh range", () => {
    const tiny = recommendBatteryCapacityKWh(1000, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const huge = recommendBatteryCapacityKWh(500 * 1000, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(tiny).toBeGreaterThanOrEqual(BATTERY_CAPACITY_MIN_KWH);
    expect(huge).toBeLessThanOrEqual(BATTERY_CAPACITY_MAX_KWH);
  });
});

describe("clampCapacity", () => {
  it("clamps out-of-range values", () => {
    expect(clampCapacity(1)).toBe(BATTERY_CAPACITY_MIN_KWH);
    expect(clampCapacity(100)).toBe(BATTERY_CAPACITY_MAX_KWH);
  });
});

describe("estimateBatteryMassKg", () => {
  it("increases with capacity", () => {
    const small = estimateBatteryMassKg(9, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const large = estimateBatteryMassKg(15, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(large).toBeGreaterThan(small);
  });
});

describe("usableEnergyWh", () => {
  it("increases range potential as capacity increases", () => {
    const small = usableEnergyWh(9, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const large = usableEnergyWh(15, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(large).toBeGreaterThan(small);
  });
});
