import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES } from "./defaults";
import { computeMassBreakdown, estimateEnergyConsumption } from "./vehicle";

describe("computeMassBreakdown", () => {
  it("computes 6 x 80 kg passenger mass correctly", () => {
    const mass = computeMassBreakdown(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, 100);
    expect(mass.passengerMassKg).toBe(480);
  });

  it("sums kerb + driver + passengers + luggage into loaded mass", () => {
    const batteryMassKg = 110;
    const mass = computeMassBreakdown(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, batteryMassKg);
    expect(mass.kerbMassKg).toBe(mass.gliderMassKg + batteryMassKg);
    expect(mass.loadedMassKg).toBe(mass.kerbMassKg + mass.driverMassKg + mass.passengerMassKg + mass.luggageMassKg);
  });
});

describe("estimateEnergyConsumption", () => {
  const massKg = 900;

  it("does not let hilly terrain consume less energy than flat terrain, all else equal", () => {
    const flat = estimateEnergyConsumption(massKg, 50, "flat", "medium", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const hilly = estimateEnergyConsumption(massKg, 50, "hilly", "medium", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(hilly.whPerKm).toBeGreaterThan(flat.whPerKm);
  });

  it("increases consumption when AC is enabled", () => {
    const acOff = estimateEnergyConsumption(massKg, 50, "mixed", "medium", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const acOn = estimateEnergyConsumption(massKg, 50, "mixed", "medium", true, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(acOn.whPerKm).toBeGreaterThan(acOff.whPerKm);
  });

  it("increases consumption as payload/mass increases", () => {
    const light = estimateEnergyConsumption(700, 50, "mixed", "medium", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const heavy = estimateEnergyConsumption(1100, 50, "mixed", "medium", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(heavy.whPerKm).toBeGreaterThan(light.whPerKm);
  });

  it("increases consumption with heavier traffic", () => {
    const light = estimateEnergyConsumption(massKg, 50, "mixed", "light", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const heavy = estimateEnergyConsumption(massKg, 50, "mixed", "heavy", false, DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(heavy.whPerKm).toBeGreaterThan(light.whPerKm);
  });
});
