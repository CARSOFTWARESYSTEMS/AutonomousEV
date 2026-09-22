import type { ChargingAvailability, EngineeringOverrides } from "./types";

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
  chargerEfficiency: number,
): { energyRequiredWh: number; hoursTo80: number; hoursToTarget: number } {
  const effectivePowerW = chargerPowerKw * 1000 * chargerEfficiency;
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

const DEFAULT_WINDOW_HOURS: Record<ChargingAvailability, number> = {
  overnight: 8,
  "overnight-opportunity": 8, // + opportunityChargingHours, added by the caller
  "fleet-depot": 6,
  "battery-swap": 0,
};

/**
 * Available Charging Time — Simple mode derives this from the charging
 * availability selection (overnight = 8h; overnight + opportunity = 8h plus
 * a configurable 1-3h opportunity window); Engineering mode can override it
 * directly.
 */
export function computeAvailableChargingWindowHours(
  chargingAvailability: ChargingAvailability,
  opportunityChargingHours: number,
  overrides: EngineeringOverrides,
): number {
  if (overrides.chargingWindowHours !== undefined) return overrides.chargingWindowHours;
  if (chargingAvailability === "overnight-opportunity") {
    return DEFAULT_WINDOW_HOURS[chargingAvailability] + opportunityChargingHours;
  }
  return DEFAULT_WINDOW_HOURS[chargingAvailability];
}

export interface ChargerRecommendation {
  recommendedCharger: "3.3kW" | "6.6kW";
  recommendationNote: string;
  hoursNeededAt3_3kW: number;
  hoursNeededAt6_6kW: number;
}

/** Leave headroom rather than assuming the full window is usable (BMS taper, real-world variance). */
const WINDOW_SAFETY_FACTOR = 0.9;

/**
 * Charging Power Sufficiency — evaluated independently of single-charge
 * range. A vehicle does not need a bigger charger just because its daily
 * distance approaches its practical range; it needs a bigger charger only
 * if the *actual daily energy consumed* cannot be replenished within the
 * *available charging window*. (Whether the battery can physically cover
 * the distance between charges — Energy Capacity Sufficiency — is a
 * separate question, handled by validation.ts's range-vs-distance check.)
 */
export function recommendCharger(
  chargingAvailability: ChargingAvailability,
  requiredDailyEnergyWh: number,
  availableWindowHours: number,
  chargerEfficiency: number,
): ChargerRecommendation {
  const energyKWh = requiredDailyEnergyWh / 1000;
  const hoursNeededAt3_3kW = requiredDailyEnergyWh / (3300 * chargerEfficiency);
  const hoursNeededAt6_6kW = requiredDailyEnergyWh / (6600 * chargerEfficiency);

  if (chargingAvailability === "battery-swap") {
    return {
      recommendedCharger: "3.3kW",
      recommendationNote:
        "Battery swapping selected as the charging strategy — evaluate swap-station economics separately from fixed-charger costs.",
      hoursNeededAt3_3kW,
      hoursNeededAt6_6kW,
    };
  }

  const usableWindowHours = availableWindowHours * WINDOW_SAFETY_FACTOR;

  if (hoursNeededAt3_3kW <= usableWindowHours) {
    return {
      recommendedCharger: "3.3kW",
      recommendationNote: `3.3 kW is sufficient because approximately ${energyKWh.toFixed(1)} kWh must be replenished and a ${availableWindowHours}-hour charging window provides adequate time (~${hoursNeededAt3_3kW.toFixed(1)} h required).`,
      hoursNeededAt3_3kW,
      hoursNeededAt6_6kW,
    };
  }

  if (hoursNeededAt6_6kW <= usableWindowHours) {
    return {
      recommendedCharger: "6.6kW",
      recommendationNote: `6.6 kW is recommended because 3.3 kW would need approximately ${hoursNeededAt3_3kW.toFixed(1)} h to replenish ${energyKWh.toFixed(1)} kWh, exceeding the ${availableWindowHours}-hour window — 6.6 kW does it in ~${hoursNeededAt6_6kW.toFixed(1)} h.`,
      hoursNeededAt3_3kW,
      hoursNeededAt6_6kW,
    };
  }

  return {
    recommendedCharger: "6.6kW",
    recommendationNote: `Even a 6.6 kW charger needs approximately ${hoursNeededAt6_6kW.toFixed(1)} h to replenish ${energyKWh.toFixed(1)} kWh, which does not comfortably fit the ${availableWindowHours}-hour window — consider opportunity charging, fleet-depot charging or battery swapping.`,
    hoursNeededAt3_3kW,
    hoursNeededAt6_6kW,
  };
}
