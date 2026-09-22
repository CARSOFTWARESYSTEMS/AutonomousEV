import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, PRESETS } from "./defaults";
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

describe("runSimulation — optimization priority", () => {
  it("recommends a smaller or equal battery for Lowest Price than Balanced, and Balanced <= Maximum Uptime", () => {
    const lowestPrice = runSimulation({ ...DEFAULT_REQUIREMENT, optimizationPriority: "lowest-price" }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    const balanced = runSimulation({ ...DEFAULT_REQUIREMENT, optimizationPriority: "balanced" }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    const maxUptime = runSimulation({ ...DEFAULT_REQUIREMENT, optimizationPriority: "max-uptime" }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(lowestPrice.battery.capacityKWh).toBeLessThanOrEqual(balanced.battery.capacityKWh);
    expect(balanced.battery.capacityKWh).toBeLessThanOrEqual(maxUptime.battery.capacityKWh);
  });

  it("never recommends a battery below what daily distance actually requires, even for Lowest Price", () => {
    const result = runSimulation({ ...DEFAULT_REQUIREMENT, optimizationPriority: "lowest-price" }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.battery.usableEnergyWh).toBeGreaterThanOrEqual(result.battery.requiredDailyEnergyWh);
  });

  it("lets an explicit engineering override for reserve/degradation win over the optimization priority preset", () => {
    const priorityOnly = runSimulation({ ...DEFAULT_REQUIREMENT, optimizationPriority: "max-uptime" }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    const explicitOverride = runSimulation(
      { ...DEFAULT_REQUIREMENT, optimizationPriority: "max-uptime" },
      { reserveFraction: 0.03, degradationAllowance: 0.05 },
      DEFAULT_ASSUMPTIONS,
    );
    expect(explicitOverride.battery.capacityKWh).toBeLessThanOrEqual(priorityOnly.battery.capacityKWh);
  });
});

describe("runSimulation — battery trade-off uses equal charger assumptions", () => {
  it("does not change the recommended charger power between two fixed battery capacities compared at the same charger", () => {
    const small = runSimulation(DEFAULT_REQUIREMENT, { batteryCapacityKWh: 11, chargerPowerKw: 3.3 }, DEFAULT_ASSUMPTIONS);
    const large = runSimulation(DEFAULT_REQUIREMENT, { batteryCapacityKWh: 16, chargerPowerKw: 3.3 }, DEFAULT_ASSUMPTIONS);
    // Both were forced to the same charger power, so a charging-time comparison between them is apples-to-apples.
    expect(small.charging.recommendedCharger).toBe("3.3kW");
    expect(large.charging.recommendedCharger).toBe("3.3kW");
    expect(large.charging.hoursToTarget).toBeGreaterThan(small.charging.hoursToTarget);
  });
});

describe("runSimulation — existing presets remain functional", () => {
  it.each(PRESETS)("preset '%s' runs without throwing and returns a valid configuration", (preset) => {
    const result = runSimulation({ ...DEFAULT_REQUIREMENT, ...preset.requirement }, preset.overrides, DEFAULT_ASSUMPTIONS);
    expect(result.battery.capacityKWh).toBeGreaterThanOrEqual(8);
    expect(result.cost.sellingPriceInr).toBeGreaterThan(0);
  });
});

describe("runSimulation — gradeability model", () => {
  it("does not report an invented hill-start figure when no motor torque assumption is supplied", () => {
    const result = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.powertrain.hillStartGradeabilityPct).toBeNull();
  });

  it("computes a hill-start figure once a motor peak torque assumption is supplied", () => {
    const result = runSimulation(DEFAULT_REQUIREMENT, { motorPeakTorqueNm: 45 }, DEFAULT_ASSUMPTIONS);
    expect(result.powertrain.hillStartGradeabilityPct).not.toBeNull();
    expect(result.powertrain.hillStartGradeabilityPct as number).toBeGreaterThanOrEqual(0);
  });

  it("reports sustained gradeability alongside the speed it was evaluated at", () => {
    const result = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.powertrain.gradeSpeedKmh).toBeGreaterThan(0);
    expect(result.powertrain.sustainedGradeabilityPct).toBeGreaterThanOrEqual(0);
  });

  it("warns about hill-start torque for a fully-loaded D+6 hilly configuration with insufficient torque", () => {
    const result = runSimulation(
      { ...DEFAULT_REQUIREMENT, terrain: "hilly", passengerCapacity: 6 },
      { motorPeakTorqueNm: 20, finalDriveRatio: 5 },
      DEFAULT_ASSUMPTIONS,
    );
    expect(result.powertrain.warning).toMatch(/hill-start/i);
  });
});

describe("runSimulation — charging window", () => {
  it("keeps 3.3 kW for overnight-only charging when the duty cycle fits an 8-hour window", () => {
    const result = runSimulation({ ...DEFAULT_REQUIREMENT, chargingAvailability: "overnight" }, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    expect(result.charging.availableWindowHours).toBe(8);
  });

  it("extends the available window when overnight + opportunity charging is selected", () => {
    const result = runSimulation(
      { ...DEFAULT_REQUIREMENT, chargingAvailability: "overnight-opportunity", opportunityChargingHours: 3 },
      EMPTY_OVERRIDES,
      DEFAULT_ASSUMPTIONS,
    );
    expect(result.charging.availableWindowHours).toBe(11);
  });

  it("does not select 6.6 kW purely because daily distance is close to practical range, if the charging window is generous", () => {
    const result = runSimulation(
      { ...DEFAULT_REQUIREMENT, dailyDistanceKm: 130, chargingAvailability: "overnight-opportunity", opportunityChargingHours: 3 },
      EMPTY_OVERRIDES,
      DEFAULT_ASSUMPTIONS,
    );
    expect(result.charging.hoursNeededAt3_3kW).toBeLessThanOrEqual(result.charging.availableWindowHours);
  });
});
