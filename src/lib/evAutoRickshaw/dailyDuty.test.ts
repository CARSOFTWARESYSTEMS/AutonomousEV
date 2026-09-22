import { describe, expect, it } from "vitest";
import { classifyRangeMargin, computeDailyDutyScenarios } from "./dailyDuty";

describe("computeDailyDutyScenarios", () => {
  it("orders end-of-day SOC: Favourable > Typical > Severe", () => {
    const [favourable, typical, severe] = computeDailyDutyScenarios(120, 13, 60, 86, 96);
    expect(favourable.endOfDaySocPct).toBeGreaterThan(typical.endOfDaySocPct);
    expect(typical.endOfDaySocPct).toBeGreaterThan(severe.endOfDaySocPct);
  });

  it("applies extra derating to the Severe scenario beyond the full-load Wh/km input", () => {
    const [, , severe] = computeDailyDutyScenarios(120, 13, 60, 86, 96);
    expect(severe.whPerKm).toBeGreaterThan(96);
  });

  it("computes consumed SOC% from daily distance, Wh/km and nameplate capacity", () => {
    const [, typical] = computeDailyDutyScenarios(100, 10, 60, 80, 96);
    // 100 km x 80 Wh/km = 8000 Wh consumed out of a 10,000 Wh nameplate pack = 80%.
    expect(typical.consumedSocPct).toBeCloseTo(80, 6);
  });

  it("computes end-of-day SOC as start SOC minus consumed SOC", () => {
    const [, typical] = computeDailyDutyScenarios(100, 10, 60, 80, 96, 100, 10);
    expect(typical.endOfDaySocPct).toBeCloseTo(20, 6);
  });

  it("reports zero remaining range once end-of-day SOC reaches the operating floor", () => {
    const [, , severe] = computeDailyDutyScenarios(200, 10, 60, 80, 90, 100, 10);
    expect(severe.remainingRangeKm).toBe(0);
  });

  it("computes a negative range margin when the daily distance cannot be completed in a scenario", () => {
    const [, , severe] = computeDailyDutyScenarios(300, 10, 60, 80, 90, 100, 10);
    expect(severe.rangeMarginKm).toBeLessThan(0);
  });

  it("computes a positive range margin comfortably within reach", () => {
    const [favourable] = computeDailyDutyScenarios(50, 13, 60, 86, 96, 100, 10);
    expect(favourable.rangeMarginKm).toBeGreaterThan(0);
  });
});

describe("classifyRangeMargin", () => {
  it("classifies a negative margin as shortfall", () => {
    expect(classifyRangeMargin(-5)).toBe("shortfall");
  });

  it("classifies a small positive margin as tight", () => {
    expect(classifyRangeMargin(7, 15)).toBe("tight");
  });

  it("classifies a generous margin as comfortable", () => {
    expect(classifyRangeMargin(40, 15)).toBe("comfortable");
  });
});
