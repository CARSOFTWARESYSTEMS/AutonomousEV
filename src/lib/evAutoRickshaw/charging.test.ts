import { describe, expect, it } from "vitest";
import { computeAvailableChargingWindowHours, estimateChargingTime, recommendCharger } from "./charging";
import { DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES } from "./defaults";

describe("estimateChargingTime", () => {
  it("reduces charging time as charger power increases, all else equal", () => {
    const slow = estimateChargingTime(11, 10, 100, 3.3, DEFAULT_ASSUMPTIONS.chargerEfficiency);
    const fast = estimateChargingTime(11, 10, 100, 6.6, DEFAULT_ASSUMPTIONS.chargerEfficiency);
    expect(fast.hoursToTarget).toBeLessThan(slow.hoursToTarget);
  });

  it("handles a target SOC lower than the start SOC without going negative", () => {
    const result = estimateChargingTime(11, 80, 50, 3.3, DEFAULT_ASSUMPTIONS.chargerEfficiency);
    expect(result.energyRequiredWh).toBeGreaterThanOrEqual(0);
    expect(result.hoursToTarget).toBeGreaterThanOrEqual(0);
  });

  it("charges more energy for a larger capacity pack over the same SOC window", () => {
    const small = estimateChargingTime(9, 10, 90, 3.3, DEFAULT_ASSUMPTIONS.chargerEfficiency);
    const large = estimateChargingTime(15, 10, 90, 3.3, DEFAULT_ASSUMPTIONS.chargerEfficiency);
    expect(large.energyRequiredWh).toBeGreaterThan(small.energyRequiredWh);
  });
});

describe("computeAvailableChargingWindowHours", () => {
  it("defaults overnight-only to an 8-hour window", () => {
    expect(computeAvailableChargingWindowHours("overnight", 2, EMPTY_OVERRIDES)).toBe(8);
  });

  it("adds the configurable opportunity window on top of the 8-hour overnight window", () => {
    expect(computeAvailableChargingWindowHours("overnight-opportunity", 2, EMPTY_OVERRIDES)).toBe(10);
    expect(computeAvailableChargingWindowHours("overnight-opportunity", 3, EMPTY_OVERRIDES)).toBe(11);
  });

  it("lets an explicit engineering override replace the derived window entirely", () => {
    expect(computeAvailableChargingWindowHours("overnight", 2, { chargingWindowHours: 4 })).toBe(4);
  });
});

describe("recommendCharger — charging power sufficiency, independent of single-charge range", () => {
  it("recommends 3.3 kW for overnight-only when the 8-hour window comfortably covers the daily energy", () => {
    // ~10.4 kWh to replenish, well within an 8-hour 3.3 kW overnight window.
    const result = recommendCharger("overnight", 10400, 8, 0.9);
    expect(result.recommendedCharger).toBe("3.3kW");
    expect(result.recommendationNote).toMatch(/3\.3 kW is sufficient/);
  });

  it("does not force 6.6 kW just because daily distance approaches single-charge range, when the overnight window is generous", () => {
    // A large daily energy requirement that would fail a naive "distance vs range" heuristic,
    // but an overnight window is long enough that 3.3 kW still comfortably replenishes it.
    const result = recommendCharger("overnight", 3300 * 0.9 * 6, 8, 0.9); // ~6h worth of 3.3kW energy, within an 8h window
    expect(result.recommendedCharger).toBe("3.3kW");
  });

  it("recommends 6.6 kW only when 3.3 kW cannot replenish the required energy within the available window", () => {
    // 25 kWh in an 8-hour window: 3.3kW needs ~8.4h (exceeds the window), 6.6kW needs ~4.2h (fits).
    const result = recommendCharger("overnight", 25000, 8, 0.9);
    expect(result.recommendedCharger).toBe("6.6kW");
    expect(result.hoursNeededAt3_3kW).toBeGreaterThan(result.hoursNeededAt6_6kW);
  });

  it("flags insufficient charging infrastructure when even 6.6 kW cannot fit the window", () => {
    const result = recommendCharger("overnight", 50000, 4, 0.9);
    expect(result.recommendedCharger).toBe("6.6kW");
    expect(result.recommendationNote).toMatch(/opportunity charging|fleet-depot|swap/i);
  });

  it("treats battery swapping as its own charging strategy regardless of energy/window", () => {
    const result = recommendCharger("battery-swap", 50000, 0, 0.9);
    expect(result.recommendationNote).toMatch(/swap/i);
  });

  it("the same energy requirement can be met by 3.3 kW with a longer window but needs 6.6 kW with a shorter one", () => {
    // 25 kWh needs ~8.4h at 3.3kW: fits an 11h opportunity-extended window, not a bare 8h overnight window.
    const longWindow = recommendCharger("overnight-opportunity", 25000, 11, 0.9);
    const shortWindow = recommendCharger("overnight", 25000, 8, 0.9);
    expect(longWindow.recommendedCharger).toBe("3.3kW");
    expect(shortWindow.recommendedCharger).toBe("6.6kW");
  });
});
