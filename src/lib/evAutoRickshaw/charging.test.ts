import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS } from "./defaults";
import { estimateChargingTime, recommendCharger } from "./charging";

describe("estimateChargingTime", () => {
  it("reduces charging time as charger power increases, all else equal", () => {
    const slow = estimateChargingTime(11, 10, 100, 3.3, DEFAULT_ASSUMPTIONS);
    const fast = estimateChargingTime(11, 10, 100, 6.6, DEFAULT_ASSUMPTIONS);
    expect(fast.hoursToTarget).toBeLessThan(slow.hoursToTarget);
  });

  it("handles a target SOC lower than the start SOC without going negative", () => {
    const result = estimateChargingTime(11, 80, 50, 3.3, DEFAULT_ASSUMPTIONS);
    expect(result.energyRequiredWh).toBeGreaterThanOrEqual(0);
    expect(result.hoursToTarget).toBeGreaterThanOrEqual(0);
  });

  it("charges more energy for a larger capacity pack over the same SOC window", () => {
    const small = estimateChargingTime(9, 10, 90, 3.3, DEFAULT_ASSUMPTIONS);
    const large = estimateChargingTime(15, 10, 90, 3.3, DEFAULT_ASSUMPTIONS);
    expect(large.energyRequiredWh).toBeGreaterThan(small.energyRequiredWh);
  });
});

describe("recommendCharger", () => {
  it("recommends a higher-power charger when daily distance approaches the practical range", () => {
    const comfortable = recommendCharger("overnight", 60, 130);
    const stretched = recommendCharger("overnight", 120, 130);
    expect(comfortable.recommendedCharger).toBe("3.3kW");
    expect(stretched.recommendedCharger).toBe("6.6kW");
  });
});
