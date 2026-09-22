import { BATTERY_CAPACITY_MAX_KWH, BATTERY_CAPACITY_MIN_KWH } from "./defaults";
import type { EngineeringOverrides, SimulatorAssumptions, VoltageClass } from "./types";

const CAPACITY_STEP_KWH = 0.5;

/**
 * Concept-Level Energy Model: recommend the next sensible battery size for a
 * given daily-distance energy requirement, after allowing for the usable SOC
 * window, a fixed operational reserve, and a degradation margin over life.
 *
 *   requiredUsableEnergy = dailyDistance x estimatedWh/km
 *   nameplateEnergy = requiredUsableEnergy x (1 + reserve) / (usableSocWindow x (1 - degradationAllowance))
 */
export function recommendBatteryCapacityKWh(
  requiredDailyEnergyWh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const usableSocWindow = overrides.usableSocWindow ?? assumptions.usableSocWindow;
  const reserve = overrides.reserveFraction ?? assumptions.reserveFraction;
  const degradation = overrides.degradationAllowance ?? assumptions.degradationAllowance;

  const nameplateWh = (requiredDailyEnergyWh * (1 + reserve)) / (usableSocWindow * (1 - degradation));
  const nameplateKWh = nameplateWh / 1000;

  const stepped = Math.ceil(nameplateKWh / CAPACITY_STEP_KWH) * CAPACITY_STEP_KWH;
  return clampCapacity(stepped);
}

export function clampCapacity(capacityKWh: number): number {
  return Math.min(BATTERY_CAPACITY_MAX_KWH, Math.max(BATTERY_CAPACITY_MIN_KWH, capacityKWh));
}

/**
 * Estimated Pack Weight — derived from a configurable pack-level specific
 * energy (Wh/kg) that already folds in cells, enclosure, cooling, busbars,
 * BMS and contactors at a concept level. Final mass depends on cell
 * supplier, enclosure design and structural protection choices.
 */
export function estimateBatteryMassKg(
  capacityKWh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const specificEnergy = overrides.packSpecificEnergyWhPerKg ?? assumptions.packSpecificEnergyWhPerKg;
  return (capacityKWh * 1000) / specificEnergy;
}

export function usableEnergyWh(
  capacityKWh: number,
  assumptions: SimulatorAssumptions,
  overrides: EngineeringOverrides,
): number {
  const usableSocWindow = overrides.usableSocWindow ?? assumptions.usableSocWindow;
  const degradation = overrides.degradationAllowance ?? assumptions.degradationAllowance;
  return capacityKWh * 1000 * usableSocWindow * (1 - degradation);
}

/**
 * LFP is the default chemistry recommendation for this duty cycle because of
 * its thermal stability, longer cycle life under high daily utilization and
 * generally lower cost per kWh at pack level — not because it is superior in
 * every application (e.g. NMC can offer higher pack-level specific energy).
 */
export const CHEMISTRY_RATIONALE: Record<"LFP" | "NMC", string> = {
  LFP: "Thermal stability, long cycle life and commercial-vehicle-grade safety margins at a lower cost per kWh — the default for high daily-utilization duty cycles.",
  NMC: "Higher pack-level specific energy (lighter pack for the same kWh) at a higher cost per kWh and generally lower thermal margin — worth evaluating where mass is the binding constraint.",
};

export function recommendVoltageClass(capacityKWh: number, requestedFleet: boolean): VoltageClass {
  if (requestedFleet) return "96V";
  if (capacityKWh <= 9) return "72V";
  return "76.8V";
}
