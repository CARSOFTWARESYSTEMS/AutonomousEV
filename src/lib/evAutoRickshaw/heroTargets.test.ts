import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES } from "./defaults";
import { runSimulation } from "./engine";
import { computeHeroTargets } from "./heroTargets";

describe("computeHeroTargets — single source of truth", () => {
  it("brackets the actual engine output for the default configuration", () => {
    const result = runSimulation(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES, DEFAULT_ASSUMPTIONS);
    const targets = computeHeroTargets();

    expect(result.battery.capacityKWh).toBeGreaterThanOrEqual(targets.batteryKWhLow);
    expect(result.battery.capacityKWh).toBeLessThanOrEqual(targets.batteryKWhHigh);
    expect(result.range.typicalKm).toBeGreaterThanOrEqual(targets.rangeKmLow);
    expect(result.range.typicalKm).toBeLessThanOrEqual(targets.rangeKmHigh);
    expect(result.cost.sellingPriceInr).toBeGreaterThanOrEqual(targets.priceInrLow);
    expect(result.cost.sellingPriceInr).toBeLessThanOrEqual(targets.priceInrHigh);
  });

  it("moves if the underlying sizing model changes, instead of staying frozen at a hardcoded value", () => {
    // Regression guard for the exact bug this module fixes: a hardcoded hero
    // chip ("10-11.5 kWh") silently drifted out of sync when V0.2 tuned the
    // reserve/degradation defaults, because it was never wired to the engine.
    // A much larger daily distance requires a meaningfully larger battery —
    // proving the band is a live function of runSimulation(), not a frozen
    // constant that would stay put regardless of what the engine computes.
    const before = computeHeroTargets();
    const alteredResult = runSimulation(
      { ...DEFAULT_REQUIREMENT, dailyDistanceKm: DEFAULT_REQUIREMENT.dailyDistanceKm * 2 },
      EMPTY_OVERRIDES,
      DEFAULT_ASSUMPTIONS,
    );
    expect(alteredResult.battery.capacityKWh).toBeGreaterThan(before.batteryKWhHigh);
  });
});
