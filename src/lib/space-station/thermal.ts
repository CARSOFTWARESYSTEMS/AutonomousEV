// Steady-state radiator sizing for a generic station.
// Educational model — not mission design data.
import { SOLAR_CONSTANT, STEFAN_BOLTZMANN, EARTH_IR, EARTH_ALBEDO } from "./constants";

export const THERMAL_DEFAULTS = {
  equipmentKW: 60,
  crew: 4,
  /** Average metabolic heat per crew member (educational round figure). */
  metabolicWPerCrew: 125,
  payloadKW: 15,
  radiatorTempK: 280,
  emissivity: 0.85,
  solarAbsorptivity: 0.2,
  /** Orbit-average fraction of full-Sun flux reaching the radiator surface (radiators are kept near edge-on). */
  sunViewFactor: 0.1,
  /** Orbit-average view factor from radiator to Earth. */
  earthViewFactor: 0.3,
  /** Orbit-average fraction of time the Earth below is sunlit (for albedo). */
  albedoDayFraction: 0.5,
};

export type ThermalInput = typeof THERMAL_DEFAULTS;

export interface ThermalResult {
  equipmentW: number;
  crewW: number;
  payloadW: number;
  totalHeatW: number;
  emittedWm2: number;
  absorbedSolarWm2: number;
  absorbedAlbedoWm2: number;
  absorbedEarthIrWm2: number;
  netRejectionWm2: number;
  radiatorAreaM2: number;
  feasible: boolean;
}

/**
 * Almost all electrical power used on board ends up as heat.
 * q_emit = ε·σ·T⁴
 * q_abs  = α·S·F_sun + α·S·a·F_earth·f_day + ε·q_IR·F_earth
 * A_rad  = Q_total / (q_emit − q_abs)
 */
export function sizeRadiator(input: ThermalInput): ThermalResult {
  const equipmentW = input.equipmentKW * 1000;
  const crewW = input.crew * input.metabolicWPerCrew;
  const payloadW = input.payloadKW * 1000;
  const totalHeatW = equipmentW + crewW + payloadW;
  const emittedWm2 = input.emissivity * STEFAN_BOLTZMANN * input.radiatorTempK ** 4;
  const absorbedSolarWm2 = input.solarAbsorptivity * SOLAR_CONSTANT * input.sunViewFactor;
  const absorbedAlbedoWm2 = input.solarAbsorptivity * SOLAR_CONSTANT * EARTH_ALBEDO * input.earthViewFactor * input.albedoDayFraction;
  const absorbedEarthIrWm2 = input.emissivity * EARTH_IR * input.earthViewFactor;
  const netRejectionWm2 = emittedWm2 - absorbedSolarWm2 - absorbedAlbedoWm2 - absorbedEarthIrWm2;
  const feasible = netRejectionWm2 > 0;
  return {
    equipmentW,
    crewW,
    payloadW,
    totalHeatW,
    emittedWm2,
    absorbedSolarWm2,
    absorbedAlbedoWm2,
    absorbedEarthIrWm2,
    netRejectionWm2,
    radiatorAreaM2: feasible ? totalHeatW / netRejectionWm2 : Infinity,
    feasible,
  };
}
