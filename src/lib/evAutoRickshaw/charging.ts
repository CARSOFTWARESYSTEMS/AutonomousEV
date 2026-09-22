import type { ChargingAvailability, ChargingResult, SimulatorAssumptions } from "./types";

/** Extra time multiplier applied to the portion of charging above 80% SOC (CC-CV taper allowance). */
const TAPER_MULTIPLIER = 1.6;
const TAPER_THRESHOLD_PCT = 80;

/**
 * Estimated Charging Time = energyRequired / effectiveChargingPower, with an
 * allowance for CC-CV taper above 80% SOC. Actual time depends on battery
 * temperature, BMS current limits, charger behaviour, SOC and cell chemistry.
 */
export function estimateChargingTime(
  capacityKWh: number,
  startSocPct: number,
  targetSocPct: number,
  chargerPowerKw: number,
  assumptions: SimulatorAssumptions,
  chargerEfficiencyOverride?: number,
): { energyRequiredWh: number; hoursTo80: number; hoursToTarget: number } {
  const efficiency = chargerEfficiencyOverride ?? assumptions.chargerEfficiency;
  const effectivePowerW = chargerPowerKw * 1000 * efficiency;
  const clampedStart = Math.max(0, Math.min(100, startSocPct));
  const clampedTarget = Math.max(clampedStart, Math.min(100, targetSocPct));

  const energyRequiredWh = (capacityKWh * 1000 * (clampedTarget - clampedStart)) / 100;

  const socTo80 = Math.max(0, Math.min(clampedTarget, TAPER_THRESHOLD_PCT) - clampedStart);
  const socAbove80 = Math.max(0, clampedTarget - Math.max(clampedStart, TAPER_THRESHOLD_PCT));

  const energyTo80Wh = (capacityKWh * 1000 * socTo80) / 100;
  const energyAbove80Wh = (capacityKWh * 1000 * socAbove80) / 100;

  const hoursTo80 = energyTo80Wh / effectivePowerW;
  const hoursAbove80 = (energyAbove80Wh / effectivePowerW) * TAPER_MULTIPLIER;

  return {
    energyRequiredWh,
    hoursTo80,
    hoursToTarget: hoursTo80 + hoursAbove80,
  };
}

export function recommendCharger(
  chargingAvailability: ChargingAvailability,
  dailyDistanceKm: number,
  rangeTypicalKm: number,
): ChargingResult {
  const utilizationRatio = rangeTypicalKm > 0 ? dailyDistanceKm / rangeTypicalKm : Infinity;

  let recommendedCharger: "3.3kW" | "6.6kW" = "3.3kW";
  let recommendationNote =
    "Overnight 3.3 kW home/depot charging comfortably covers this daily distance within the practical range margin.";

  if (chargingAvailability === "battery-swap") {
    recommendationNote =
      "Battery swapping selected as the charging strategy — evaluate swap-station economics separately from fixed-charger costs.";
  } else if (utilizationRatio > 0.85 || chargingAvailability === "fleet-depot") {
    recommendedCharger = "6.6kW";
    recommendationNote =
      "Daily distance is close to the practical range margin — a 6.6 kW charger or opportunity charging window is recommended.";
  } else if (utilizationRatio > 1.1) {
    recommendationNote =
      "Selected duty cycle exceeds comfortable single-charge coverage — evaluate opportunity charging, swapping or a larger battery.";
  }

  return {
    energyRequiredWh: 0,
    hoursTo80: 0,
    hoursToTarget: 0,
    recommendedCharger,
    recommendationNote,
  };
}
