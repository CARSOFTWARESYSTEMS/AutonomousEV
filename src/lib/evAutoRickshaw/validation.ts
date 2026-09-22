import type { ConfigurationWarning, CustomerRequirement, RangeBand } from "./types";

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Defensive clamps so malformed/extreme inputs never crash the simulator. */
export function sanitizeRequirement(requirement: CustomerRequirement): CustomerRequirement {
  return {
    ...requirement,
    avgPassengerWeightKg: clamp(requirement.avgPassengerWeightKg, 50, 100),
    driverWeightKg: clamp(requirement.driverWeightKg, 45, 110),
    dailyDistanceKm: clamp(requirement.dailyDistanceKm, 10, 300),
    maxSpeedKmh: clamp(requirement.maxSpeedKmh, 30, 65),
    luggageKg: clamp(requirement.luggageKg, 0, 100),
    targetPriceInr: clamp(requirement.targetPriceInr, 250000, 700000),
  };
}

export function buildConfigurationWarnings(
  requirement: CustomerRequirement,
  range: RangeBand,
  sellingPriceInr: number,
  powertrainWarning: string | null,
): ConfigurationWarning[] {
  const warnings: ConfigurationWarning[] = [];

  const safetyMargin = 1.15;
  if (requirement.dailyDistanceKm * safetyMargin > range.typicalKm) {
    if (requirement.chargingAvailability === "overnight") {
      warnings.push({
        severity: "caution",
        title: "Opportunity Charge Recommended",
        message:
          "Daily distance exceeds a comfortable overnight-only range margin. Consider opportunity charging, a larger battery, or fleet-depot charging.",
      });
    }
    if (requirement.dailyDistanceKm > range.typicalKm) {
      warnings.push({
        severity: "caution",
        title: "Larger Battery Recommended",
        message: "Selected duty cycle exceeds the current usable-energy target for the recommended pack size.",
      });
    }
  }

  if (powertrainWarning) {
    warnings.push({
      severity: powertrainWarning.startsWith("Cost optimization") ? "info" : "caution",
      title: powertrainWarning.startsWith("Cost optimization") ? "Cost Optimization Opportunity" : "Powertrain Review Required",
      message: powertrainWarning,
    });
  }

  if (sellingPriceInr > requirement.targetPriceInr * 1.02) {
    warnings.push({
      severity: "caution",
      title: "Budget Conflict",
      message: "Selected features exceed the target purchase price. Review battery size, motor size, software tier, AC and charger before removing any safety-critical system.",
    });
  }

  if (requirement.swappingEnabled && requirement.chargingAvailability !== "battery-swap" && requirement.chargingAvailability !== "fleet-depot") {
    warnings.push({
      severity: "info",
      title: "Swap Infrastructure Not Selected",
      message: "Battery swapping is enabled but no swap-station or fleet-depot charging availability is selected — infrastructure cost will not be modelled until it is.",
    });
  }

  return warnings;
}

export function budgetStatus(sellingPriceInr: number, targetPriceInr: number): "within-budget" | "above-budget" {
  return sellingPriceInr <= targetPriceInr * 1.02 ? "within-budget" : "above-budget";
}
