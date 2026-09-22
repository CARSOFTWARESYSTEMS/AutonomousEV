import { describe, expect, it } from "vitest";
import { computeCostBreakdown } from "./cost";
import { DEFAULT_ASSUMPTIONS, DEFAULT_REQUIREMENT, EMPTY_OVERRIDES } from "./defaults";

describe("computeCostBreakdown", () => {
  it("increases BOM and selling price as battery capacity increases", () => {
    const small = computeCostBreakdown(DEFAULT_REQUIREMENT, 9, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const large = computeCostBreakdown(DEFAULT_REQUIREMENT, 15, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(large.subtotalComponentsInr).toBeGreaterThan(small.subtotalComponentsInr);
    expect(large.sellingPriceInr).toBeGreaterThan(small.sellingPriceInr);
  });

  it("increases cost when AC is enabled", () => {
    const withoutAc = computeCostBreakdown(DEFAULT_REQUIREMENT, 11, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const withAc = computeCostBreakdown({ ...DEFAULT_REQUIREMENT, acEnabled: true }, 11, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(withAc.sellingPriceInr).toBeGreaterThan(withoutAc.sellingPriceInr);
  });

  it("keeps cost-share breakdown summing close to 100%", () => {
    const result = computeCostBreakdown(DEFAULT_REQUIREMENT, 11, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const total = Object.values(result.shareByGroup).reduce((sum, v) => sum + v, 0);
    expect(total).toBeGreaterThan(0.98);
    expect(total).toBeLessThan(1.02);
  });

  it("never lets swap-readiness silently disappear from the total when enabled", () => {
    const withoutSwap = computeCostBreakdown(DEFAULT_REQUIREMENT, 11, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    const withSwap = computeCostBreakdown({ ...DEFAULT_REQUIREMENT, swappingEnabled: true }, 11, 12, "3.3kW", DEFAULT_ASSUMPTIONS, EMPTY_OVERRIDES);
    expect(withSwap.swapReadyInr).toBeGreaterThan(0);
    expect(withSwap.sellingPriceInr).toBeGreaterThan(withoutSwap.sellingPriceInr);
  });
});
