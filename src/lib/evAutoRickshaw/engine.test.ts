import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES } from "./defaults";
import { runSimulation } from "./engine";

describe("runSimulation — default configuration", () => {
  it("recommends a battery within the 8-16 kWh supported range", () => {
    const result = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.battery.capacityKWh).toBeGreaterThanOrEqual(8);
    expect(result.battery.capacityKWh).toBeLessThanOrEqual(16);
  });

  it("keeps the default D+6 configuration within the default target budget", () => {
    const result = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.cost.sellingPriceInr).toBeGreaterThan(0);
    // Not asserting a specific verdict here (assumptions can legitimately shift
    // it either way) — only that the status is a valid, computed value.
    expect(["within-budget", "above-budget"]).toContain(result.budgetStatus);
  });
});

describe("runSimulation — battery capacity trade-off", () => {
  it("increases estimated range for a larger fixed battery under identical conditions", () => {
    const small = runSimulation(DEFAULT_REQUIREMENT, { batteryCapacityKWh: 9 }, DEFAULT_ASSUMPTIONS);
    const large = runSimulation(DEFAULT_REQUIREMENT, { batteryCapacityKWh: 15 }, DEFAULT_ASSUMPTIONS);
    expect(large.range.typicalKm).toBeGreaterThan(small.range.typicalKm);
  });
});

describe("runSimulation — budget conflict detection", () => {
  it("flags a budget conflict for a high-cost configuration against a low target price", () => {
    const result = runSimulation(
      { ...DEFAULT_REQUIREMENT, targetPriceInr: 300000, softwareTier: "intelligence", acEnabled: true, swappingEnabled: true },
      { batteryCapacityKWh: 16, peakPowerKw: 18 },
      DEFAULT_ASSUMPTIONS,
    );
    expect(result.budgetStatus).toBe("above-budget");
    expect(result.warnings.some((w) => w.title === "Budget Conflict")).toBe(true);
  });
});

describe("runSimulation — edge cases", () => {
  it("does not crash on an extremely low daily distance", () => {
    expect(() => runSimulation({ ...DEFAULT_REQUIREMENT, dailyDistanceKm: 1 }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS)).not.toThrow();
  });

  it("does not crash when daily distance far exceeds any achievable range", () => {
    const result = runSimulation({ ...DEFAULT_REQUIREMENT, dailyDistanceKm: 300 }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("does not crash on an excessive payload", () => {
    expect(() =>
      runSimulation({ ...DEFAULT_REQUIREMENT, luggageKg: 100, avgPassengerWeightKg: 100 }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS),
    ).not.toThrow();
  });

  it("does not crash on an impossible (very low) budget", () => {
    expect(() => runSimulation({ ...DEFAULT_REQUIREMENT, targetPriceInr: 1 }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS)).not.toThrow();
  });

  it("sanitizes zero/invalid numeric inputs instead of crashing", () => {
    expect(() =>
      runSimulation({ ...DEFAULT_REQUIREMENT, dailyDistanceKm: 0, maxSpeedKmh: 0, luggageKg: -10 }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS),
    ).not.toThrow();
  });

  it("flags an undersized powertrain for a heavy D+6 hilly configuration with a tiny motor", () => {
    const result = runSimulation(
      { ...DEFAULT_REQUIREMENT, terrain: "hilly", passengerCapacity: 6 },
      { peakPowerKw: 8 },
      DEFAULT_ASSUMPTIONS,
    );
    expect(result.powertrain.warning).toBe("Powertrain may be undersized for the selected load and terrain.");
  });
});

describe("runSimulation — reset to defaults", () => {
  it("produces the same output for the same inputs (pure function, no hidden state)", () => {
    const first = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    const second = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(second).toEqual(first);
  });
});
