import { DEFAULT_REQUIREMENT, EMPTY_OVERRIDES } from "@/lib/evAutoRickshaw/defaults";
import { describe, expect, it } from "vitest";
import { buildShareQuery, parseQueryOverrides, parseQueryRequirement } from "./useSimulator";

describe("URL configuration serialization", () => {
  it("round-trips the default requirement through the share query", () => {
    const query = buildShareQuery(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES);
    const params = new URLSearchParams(query);
    const parsed = parseQueryRequirement(params);

    expect(parsed.passengerCapacity).toBe(DEFAULT_REQUIREMENT.passengerCapacity);
    expect(parsed.dailyDistanceKm).toBe(DEFAULT_REQUIREMENT.dailyDistanceKm);
    expect(parsed.terrain).toBe(DEFAULT_REQUIREMENT.terrain);
    expect(parsed.traffic).toBe(DEFAULT_REQUIREMENT.traffic);
    expect(parsed.maxSpeedKmh).toBe(DEFAULT_REQUIREMENT.maxSpeedKmh);
    expect(parsed.acEnabled).toBe(DEFAULT_REQUIREMENT.acEnabled);
    expect(parsed.targetPriceInr).toBe(DEFAULT_REQUIREMENT.targetPriceInr);
    expect(parsed.softwareTier).toBe(DEFAULT_REQUIREMENT.softwareTier);
    expect(parsed.chargingAvailability).toBe(DEFAULT_REQUIREMENT.chargingAvailability);
    expect(parsed.optimizationPriority).toBe(DEFAULT_REQUIREMENT.optimizationPriority);
  });

  it("round-trips a non-default optimization priority", () => {
    const requirement = { ...DEFAULT_REQUIREMENT, optimizationPriority: "max-uptime" as const };
    const query = buildShareQuery(requirement, EMPTY_OVERRIDES);
    const parsed = parseQueryRequirement(new URLSearchParams(query));
    expect(parsed.optimizationPriority).toBe("max-uptime");
  });

  it("includes opportunity charging hours only when overnight-opportunity is selected", () => {
    const withOpportunity = {
      ...DEFAULT_REQUIREMENT,
      chargingAvailability: "overnight-opportunity" as const,
      opportunityChargingHours: 3,
    };
    const query = buildShareQuery(withOpportunity, EMPTY_OVERRIDES);
    expect(query).toMatch(/oppHours=3/);

    const withoutOpportunity = buildShareQuery(DEFAULT_REQUIREMENT, EMPTY_OVERRIDES);
    expect(withoutOpportunity).not.toMatch(/oppHours/);
  });

  it("round-trips engineering overrides for battery capacity and peak power", () => {
    const overrides = { batteryCapacityKWh: 12.5, peakPowerKw: 15 };
    const query = buildShareQuery(DEFAULT_REQUIREMENT, overrides);
    const parsed = parseQueryOverrides(new URLSearchParams(query));
    expect(parsed.batteryCapacityKWh).toBe(12.5);
    expect(parsed.peakPowerKw).toBe(15);
  });

  it("ignores unrecognized or malformed query values instead of crashing", () => {
    const params = new URLSearchParams("terrain=lunar&passengers=abc&ac=maybe");
    expect(() => parseQueryRequirement(params)).not.toThrow();
    const parsed = parseQueryRequirement(params);
    expect(parsed.terrain).toBeUndefined();
    expect(parsed.acEnabled).toBeUndefined();
  });
});
