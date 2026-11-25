// Battery pack model (WPT-BAT-001…003): a first-order Thevenin equivalent
// circuit with an SOC-dependent open-circuit voltage, Arrhenius-scaled
// resistance, CC–CV charging limits, temperature derating and a lumped
// thermal node. An educational model: the OCV curve and derating table are
// representative of NMC cells, not a specific cell's datasheet, and there is
// no ageing model here (see `degradationIndicator` for a labelled heuristic).
import { clamp, interp1 } from "./math";
import { type ThermalNode, stepThermal } from "./losses";

/** Representative NMC cell open-circuit voltage against SOC (illustrative). */
export const OCV_SOC = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] as const;
export const OCV_CELL = [3.0, 3.3, 3.45, 3.55, 3.62, 3.67, 3.73, 3.8, 3.89, 3.98, 4.07, 4.18] as const;

/** Charge-current derating against cell temperature, as a fraction of the maximum C-rate (illustrative). */
const DERATE_T = [-20, -10, 0, 10, 15, 40, 45, 50, 55] as const;
const DERATE_F = [0, 0, 0.1, 0.5, 1, 1, 0.6, 0.25, 0] as const;

export interface BatteryParams {
  /** Usable energy at nominal voltage, kWh. */
  capacityKWh: number;
  seriesCells: number;
  nominalCellVoltage: number;
  /** Pack ohmic resistance at 25 °C, Ω. */
  r0At25: number;
  /** RC branch resistance and time constant. */
  r1: number;
  tau1: number;
  /** Arrhenius activation temperature Ea/R, K: R(T) = R25·exp(θ(1/T − 1/298.15)). */
  arrheniusTheta: number;
  maxCellVoltage: number;
  /** Maximum continuous charge rate at the best temperature, 1/h. */
  maxChargeCRate: number;
  coulombicEfficiency: number;
  thermal: ThermalNode;
}

export const DEFAULT_BATTERY: BatteryParams = {
  capacityKWh: 60,
  seriesCells: 96,
  nominalCellVoltage: 3.7,
  r0At25: 0.09,
  r1: 0.035,
  tau1: 45,
  arrheniusTheta: 2600,
  maxCellVoltage: 4.18,
  maxChargeCRate: 1,
  coulombicEfficiency: 0.998,
  thermal: { capacitance: 3.6e5, resistance: 0.06 },
};

export interface BatteryState {
  soc: number;
  /** RC branch voltage, V. */
  v1: number;
  temperature: number;
}

export const packCapacityAh = (p: BatteryParams) => (p.capacityKWh * 1000) / (p.seriesCells * p.nominalCellVoltage);
export const packOcv = (p: BatteryParams, soc: number) => p.seriesCells * interp1(OCV_SOC, OCV_CELL, clamp(soc, 0, 1));
export const packR0 = (p: BatteryParams, T: number) => p.r0At25 * Math.exp(p.arrheniusTheta * (1 / (T + 273.15) - 1 / 298.15));
export const packMaxVoltage = (p: BatteryParams) => p.seriesCells * p.maxCellVoltage;
export const temperatureDerating = (T: number) => interp1(DERATE_T, DERATE_F, T);

export type ChargeLimit = "current" | "voltage" | "temperature" | "soc" | "none";

export interface Acceptance {
  /** Largest charging current the pack accepts now, A. */
  current: number;
  /** Power at the pack terminals at that current, W. */
  power: number;
  limitedBy: ChargeLimit;
  terminalVoltage: number;
}

/**
 * The charge the pack accepts for the next step dt: the smallest of the
 * temperature-derated C-rate limit and the current that would just reach the
 * cell voltage limit at the end of the step (the CV phase). Zero at or above
 * the target SOC.
 */
export function chargeAcceptance(p: BatteryParams, s: BatteryState, targetSoc: number, dt: number): Acceptance {
  const ocv = packOcv(p, s.soc);
  const r0 = packR0(p, s.temperature);
  const r1 = p.r1 * (r0 / p.r0At25);
  const decay = Math.exp(-dt / p.tau1);
  if (s.soc >= targetSoc) return { current: 0, power: 0, limitedBy: "soc", terminalVoltage: ocv + s.v1 * decay };
  const derate = temperatureDerating(s.temperature);
  const iRate = p.maxChargeCRate * packCapacityAh(p) * derate;
  const iVolt = Math.max(0, (packMaxVoltage(p) - ocv - s.v1 * decay) / (r0 + r1 * (1 - decay)));
  let current = iRate;
  let limitedBy: ChargeLimit = derate < 0.999 ? "temperature" : "current";
  if (iVolt < current) {
    current = iVolt;
    limitedBy = "voltage";
  }
  if (current <= 1e-9) current = 0;
  const v = ocv + current * r0 + s.v1 * decay + current * r1 * (1 - decay);
  return { current, power: current * v, limitedBy: current === 0 && derate === 0 ? "temperature" : limitedBy, terminalVoltage: v };
}

export interface BatteryStep {
  terminalVoltage: number;
  ocv: number;
  /** Heat generated in the pack this step, W (I²R0 + V1²/R1). */
  heat: number;
  /** Electrochemically stored energy change rate, W (OCV × I × η when charging). */
  storedPower: number;
}

/**
 * The terminal current needed to draw `power` (W, positive = charging) from
 * the pack terminals: solves P = I·(OCV + V1 + I·R0) for I.
 */
export function currentForPower(p: BatteryParams, s: BatteryState, power: number): number {
  const e = packOcv(p, s.soc) + s.v1;
  const r = packR0(p, s.temperature);
  if (Math.abs(power) < 1e-12) return 0;
  const disc = e * e + 4 * r * power;
  if (disc < 0) return -e / (2 * r);
  return (-e + Math.sqrt(disc)) / (2 * r);
}

/** Advances the pack by dt with terminal current I (A, positive = charging). Mutates s. */
export function stepBattery(p: BatteryParams, s: BatteryState, I: number, ambient: number, dt: number): BatteryStep {
  const ocv = packOcv(p, s.soc);
  const r0 = packR0(p, s.temperature);
  const r1 = p.r1 * (r0 / p.r0At25);
  const decay = Math.exp(-dt / p.tau1);
  // Terminal voltage at the start of the step, the same definition currentForPower inverts.
  const terminalVoltage = ocv + I * r0 + s.v1;
  const heat = I * I * r0 + (s.v1 * s.v1) / r1;
  const eta = I > 0 ? p.coulombicEfficiency : 1;
  s.soc = clamp(s.soc + (eta * I * dt) / (3600 * packCapacityAh(p)), 0, 1);
  // Exact update of the RC branch for constant current over the step.
  s.v1 = s.v1 * decay + I * r1 * (1 - decay);
  s.temperature = stepThermal(p.thermal, s.temperature, heat, ambient, dt);
  return { terminalVoltage, ocv, heat, storedPower: ocv * I * eta };
}

/**
 * A relative stress indicator for comparing charging strategies, NOT a
 * lifetime prediction: throughput weighted by an Arrhenius temperature factor
 * and time at high SOC. Calibrated ageing models need cell test data.
 */
export function degradationIndicator(ampHours: number, meanTemperature: number, hoursAboveEightyPercent: number): number {
  const thermal = Math.exp(4000 * (1 / 298.15 - 1 / (meanTemperature + 273.15)));
  return ampHours * thermal * (1 + 0.02 * hoursAboveEightyPercent);
}
