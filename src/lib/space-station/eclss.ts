// Crew consumables and life-support mass balance.
// Educational approximations — not mission design data.
import { MOLAR_MASS } from "./constants";

export type EclssArchitecture = "open" | "partial" | "closed";

export const ECLSS_ARCHITECTURES: Record<EclssArchitecture, { label: string; summary: string }> = {
  open: {
    label: "Open loop",
    summary: "All oxygen, water and food are launched. CO₂ is removed and discarded. Simple, but resupply mass grows linearly with crew-days.",
  },
  partial: {
    label: "Partially closed",
    summary: "Water is recovered from humidity condensate and urine; oxygen is made by electrolysing water. CO₂ is removed and vented.",
  },
  closed: {
    label: "More closed (CO₂ reduction)",
    summary: "Adds a Sabatier-type reactor that combines removed CO₂ with electrolysis hydrogen to recover water. Food is still launched.",
  },
};

/**
 * Default per-crew-day values are rounded educational figures of the order
 * reported in NASA's Life Support Baseline Values and Assumptions Document
 * (BVAD). They vary with crew size, activity and mission.
 */
export const ECLSS_DEFAULTS = {
  crew: 4,
  durationDays: 180,
  o2KgPerCrewDay: 0.84,
  co2KgPerCrewDay: 1.04,
  waterUseKgPerCrewDay: 4.0,
  waterRecoveryPct: 90,
  foodKgPerCrewDay: 1.8,
  architecture: "partial" as EclssArchitecture,
};

export type EclssInput = typeof ECLSS_DEFAULTS;

/** kg of water electrolysed per kg of O₂ produced: 2H₂O → 2H₂ + O₂ */
export const WATER_PER_O2 = (2 * MOLAR_MASS.H2O) / MOLAR_MASS.O2;
/** kg of H₂ produced per kg of O₂ by electrolysis */
export const H2_PER_O2 = (2 * MOLAR_MASS.H2) / MOLAR_MASS.O2;
/** Sabatier: CO₂ + 4H₂ → CH₄ + 2H₂O. kg H₂ consumed per kg CO₂ */
export const H2_PER_CO2 = (4 * MOLAR_MASS.H2) / MOLAR_MASS.CO2;
/** kg H₂O produced per kg CO₂ reduced */
export const WATER_PER_CO2 = (2 * MOLAR_MASS.H2O) / MOLAR_MASS.CO2;

export interface EclssResult {
  crewDays: number;
  oxygenKg: number;
  co2Kg: number;
  waterUseKg: number;
  recoveredWaterKg: number;
  electrolysisWaterKg: number;
  sabatierWaterKg: number;
  co2ReducedKg: number;
  makeupWaterKg: number;
  launchedOxygenKg: number;
  foodKg: number;
  /** Launched consumables: stored O₂ + make-up water + food (excludes tanks, packaging, spares). */
  resupplyMassKg: number;
  co2RemovalKgPerDay: number;
}

export function estimateEclss(input: EclssInput): EclssResult {
  const crewDays = Math.max(0, input.crew) * Math.max(0, input.durationDays);
  const oxygenKg = crewDays * input.o2KgPerCrewDay;
  const co2Kg = crewDays * input.co2KgPerCrewDay;
  const waterUseKg = crewDays * input.waterUseKgPerCrewDay;
  const recovery = input.architecture === "open" ? 0 : Math.min(Math.max(input.waterRecoveryPct, 0), 100) / 100;
  const recoveredWaterKg = waterUseKg * recovery;

  const makesOxygen = input.architecture !== "open";
  const electrolysisWaterKg = makesOxygen ? oxygenKg * WATER_PER_O2 : 0;
  const launchedOxygenKg = makesOxygen ? 0 : oxygenKg;

  let co2ReducedKg = 0;
  let sabatierWaterKg = 0;
  if (input.architecture === "closed") {
    const h2Available = oxygenKg * H2_PER_O2;
    co2ReducedKg = Math.min(co2Kg, h2Available / H2_PER_CO2);
    sabatierWaterKg = co2ReducedKg * WATER_PER_CO2;
  }

  const makeupWaterKg = Math.max(0, waterUseKg - recoveredWaterKg + electrolysisWaterKg - sabatierWaterKg);
  const foodKg = crewDays * input.foodKgPerCrewDay;
  return {
    crewDays,
    oxygenKg,
    co2Kg,
    waterUseKg,
    recoveredWaterKg,
    electrolysisWaterKg,
    sabatierWaterKg,
    co2ReducedKg,
    makeupWaterKg,
    launchedOxygenKg,
    foodKg,
    resupplyMassKg: launchedOxygenKg + makeupWaterKg + foodKg,
    co2RemovalKgPerDay: Math.max(0, input.crew) * input.co2KgPerCrewDay,
  };
}
