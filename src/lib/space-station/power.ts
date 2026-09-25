// One-orbit electrical power balance for a generic station.
// Educational model — not mission design data.
import { SOLAR_CONSTANT, clamp } from "./constants";

/** Named assumptions shown in the UI next to the simulator. */
export const POWER_ASSUMPTIONS = {
  /** Orbit-average cosine and shadowing loss for Sun-tracking arrays. */
  pointingFactor: 0.9,
  /** Fraction of battery input energy stored while charging. */
  chargeEfficiency: 0.95,
  /** Fraction of stored energy delivered while discharging. */
  dischargeEfficiency: 0.95,
  /** Below this SOC, research loads are shed to protect essential loads. */
  loadShedSoc: 0.3,
  /** Below this SOC, the critical-load warning is raised. */
  criticalSoc: 0.2,
  /** Time steps per orbit. */
  steps: 184,
} as const;

export interface PowerInput {
  arrayAreaM2: number;
  cellEfficiency: number; // 0–1
  sunlightFraction: number; // 0–1
  baseLoadKW: number;
  researchLoadKW: number;
  crewLoadKW: number;
  batteryCapacityKWh: number;
  initialSoc: number; // 0–1
  degradation: number; // 0–1 fraction of array output lost
  periodMin: number;
}

export interface PowerSample {
  tMin: number;
  sunlit: boolean;
  generationKW: number;
  loadKW: number;
  batteryKW: number; // + charging, − discharging (at the bus)
  soc: number;
  researchShed: boolean;
}

export interface PowerResult {
  samples: PowerSample[];
  sunlitGenerationKW: number;
  averageGenerationKW: number;
  averageLoadKW: number;
  energyGeneratedKWh: number;
  energyConsumedKWh: number;
  /** Energy generated minus energy consumed over one orbit (before battery losses). */
  energyMarginKWh: number;
  eclipseMin: number;
  minSoc: number;
  endSoc: number;
  shedMinutes: number;
  unservedKWh: number;
  criticalWarning: boolean;
  /** Array area that would exactly balance the full load over one orbit. */
  requiredArrayAreaM2: number;
  sustainable: boolean;
}

/** P_sun = S · A · η · (1 − d) · k_point */
export function sunlitGenerationKW(input: Pick<PowerInput, "arrayAreaM2" | "cellEfficiency" | "degradation">): number {
  return (
    (SOLAR_CONSTANT * input.arrayAreaM2 * input.cellEfficiency * (1 - clamp(input.degradation, 0, 1)) * POWER_ASSUMPTIONS.pointingFactor) /
    1000
  );
}

/**
 * Area needed so that sunlit generation covers the load in sunlight and
 * recharges the battery for the eclipse:
 * A = L·(t_sun + t_ecl/(η_c·η_d)) / (t_sun · S · η · (1 − d) · k_point)
 */
export function requiredArrayArea(input: PowerInput): number {
  const load = input.baseLoadKW + input.researchLoadKW + input.crewLoadKW;
  const tSun = input.sunlightFraction * input.periodMin;
  const tEcl = input.periodMin - tSun;
  const perM2 = sunlitGenerationKW({ arrayAreaM2: 1, cellEfficiency: input.cellEfficiency, degradation: input.degradation });
  if (tSun <= 0 || perM2 <= 0) return Infinity;
  const roundTrip = POWER_ASSUMPTIONS.chargeEfficiency * POWER_ASSUMPTIONS.dischargeEfficiency;
  return (load * (tSun + tEcl / roundTrip)) / (tSun * perM2);
}

export function simulatePowerOrbit(input: PowerInput): PowerResult {
  const { steps, chargeEfficiency, dischargeEfficiency, loadShedSoc, criticalSoc } = POWER_ASSUMPTIONS;
  const capacity = Math.max(input.batteryCapacityKWh, 0.001);
  const dtH = input.periodMin / steps / 60;
  const pSun = sunlitGenerationKW(input);
  const sunlitSteps = Math.round(clamp(input.sunlightFraction, 0, 1) * steps);
  let soc = clamp(input.initialSoc, 0, 1);
  let minSoc = soc;
  let shedSteps = 0;
  let unserved = 0;
  let generated = 0;
  let consumed = 0;
  const samples: PowerSample[] = [];

  for (let k = 0; k < steps; k++) {
    const sunlit = k < sunlitSteps;
    const gen = sunlit ? pSun : 0;
    const essential = input.baseLoadKW + input.crewLoadKW;
    let research = input.researchLoadKW;
    let net = gen - essential - research;
    // Shed research first when the battery would be driven below the shed threshold.
    const researchShed = net < 0 && soc - (-net / dischargeEfficiency) * dtH / capacity < loadShedSoc && research > 0;
    if (researchShed) {
      research = 0;
      net = gen - essential;
      shedSteps++;
    }
    let batteryKW = 0;
    if (net >= 0) {
      const room = (1 - soc) * capacity;
      const stored = Math.min(net * chargeEfficiency * dtH, room);
      soc += stored / capacity;
      batteryKW = stored / chargeEfficiency / dtH;
    } else {
      const need = (-net / dischargeEfficiency) * dtH;
      const available = soc * capacity;
      const drawn = Math.min(need, available);
      soc -= drawn / capacity;
      unserved += ((need - drawn) * dischargeEfficiency);
      batteryKW = -(drawn * dischargeEfficiency) / dtH;
    }
    soc = clamp(soc, 0, 1);
    minSoc = Math.min(minSoc, soc);
    const load = essential + research;
    generated += gen * dtH;
    consumed += load * dtH;
    samples.push({ tMin: (k + 1) * (input.periodMin / steps), sunlit, generationKW: gen, loadKW: load, batteryKW, soc, researchShed });
  }

  const eclipseMin = input.periodMin * (1 - sunlitSteps / steps);
  const requiredArrayAreaM2 = requiredArrayArea(input);
  return {
    samples,
    sunlitGenerationKW: pSun,
    averageGenerationKW: generated / (input.periodMin / 60),
    averageLoadKW: consumed / (input.periodMin / 60),
    energyGeneratedKWh: generated,
    energyConsumedKWh: consumed,
    energyMarginKWh: generated - consumed,
    eclipseMin,
    minSoc,
    endSoc: soc,
    shedMinutes: shedSteps * (input.periodMin / steps),
    unservedKWh: unserved,
    criticalWarning: minSoc < criticalSoc || unserved > 0,
    requiredArrayAreaM2,
    // Judged on the orbit energy balance rather than end-of-orbit SOC, which
    // is lower than the start whenever the battery fills and clips in sunlight.
    sustainable: input.arrayAreaM2 >= requiredArrayAreaM2 && shedSteps === 0 && unserved === 0,
  };
}

export const POWER_DEFAULTS: PowerInput = {
  arrayAreaM2: 600,
  cellEfficiency: 0.2,
  sunlightFraction: 0.62,
  baseLoadKW: 40,
  researchLoadKW: 25,
  crewLoadKW: 10,
  batteryCapacityKWh: 150,
  initialSoc: 0.8,
  degradation: 0.05,
  periodMin: 92.6,
};
