// Electrical power model: solar generation, subsystem loads and a simple
// energy-bucket battery. Every figure is a REFERENCE value for an educational
// 6U spacecraft, not a flight specification.
import type { PowerState } from "../types";
import { clamp01 } from "../lib/math";

export const POWER_REFERENCE = {
  /** Four deployable 1U × 3U panels at normal incidence. */
  arrayPeakW: 34,
  batteryCapacityWh: 40,
  chargeEfficiency: 0.94,
  dischargeEfficiency: 0.96,
  busVoltageAtEmptyV: 7.0,
  busVoltageAtFullV: 8.4,
} as const;

export type LoadId = "obc" | "adcs" | "payload" | "comms" | "heaters" | "distribution";

export const LOAD_ORDER: readonly LoadId[] = ["obc", "adcs", "payload", "comms", "heaters", "distribution"];

export const LOAD_LABELS: Record<LoadId, string> = {
  obc: "OBC",
  adcs: "ADCS",
  payload: "Payload",
  comms: "Comms",
  heaters: "Heaters",
  distribution: "Distribution losses",
};

/** Nominal sunlit loads; they sum to 12.1 W. */
export const NOMINAL_LOADS_W: Record<LoadId, number> = {
  obc: 1.8,
  adcs: 3.4,
  payload: 3.1,
  comms: 1.6,
  heaters: 1.2,
  distribution: 1.0,
};

export interface LoadContext {
  sunlit: boolean;
  /** Only the essential bus is powered while the flight computer starts. */
  booting?: boolean;
  imaging?: boolean;
  processing?: boolean;
  slewing?: boolean;
  sbandTransmit?: boolean;
  xbandTransmit?: boolean;
}

export function loadsW(ctx: LoadContext): Record<LoadId, number> {
  if (ctx.booting) {
    return { obc: 1.8, adcs: 0.8, payload: 0, comms: 1.1, heaters: ctx.sunlit ? 1.2 : 2.3, distribution: 0.6 };
  }
  const loads = { ...NOMINAL_LOADS_W };
  if (!ctx.sunlit) loads.heaters = 2.3;
  if (ctx.imaging) loads.payload = 8.6;
  else if (ctx.processing) loads.payload = 5.4;
  if (ctx.slewing) loads.adcs += 1.6;
  if (ctx.sbandTransmit) loads.comms += 3.8;
  if (ctx.xbandTransmit) loads.comms += 8.4;
  return loads;
}

export const totalLoadW = (loads: Record<LoadId, number>) => LOAD_ORDER.reduce((sum, id) => sum + loads[id], 0);

/** Array output for a sunlit fraction (0–1) and the cosine of the Sun's incidence on the panels. */
export function generationW(sunFraction: number, cosIncidence: number): number {
  return POWER_REFERENCE.arrayPeakW * clamp01(sunFraction) * Math.max(0, cosIncidence);
}

export const busVoltageV = (socFraction: number) =>
  POWER_REFERENCE.busVoltageAtEmptyV +
  (POWER_REFERENCE.busVoltageAtFullV - POWER_REFERENCE.busVoltageAtEmptyV) * clamp01(socFraction);

export interface BatteryStep {
  socFraction: number;
  /** Power into (+) or out of (−) the battery at its terminals, W. */
  batteryW: number;
  state: PowerState;
}

/** Advance the battery by dtS seconds given generation and load. */
export function stepBattery(socFraction: number, generatedW: number, loadW: number, dtS: number): BatteryStep {
  const netW = generatedW - loadW;
  const soc = clamp01(socFraction);
  let batteryW = netW;
  if (netW > 0 && soc >= 1) batteryW = 0; // full: surplus array power is not drawn
  const efficiency = batteryW >= 0 ? POWER_REFERENCE.chargeEfficiency : 1 / POWER_REFERENCE.dischargeEfficiency;
  const next = clamp01(soc + (batteryW * efficiency * dtS) / 3600 / POWER_REFERENCE.batteryCapacityWh);
  const state: PowerState = batteryW > 0.15 ? "CHARGING" : batteryW < -0.15 ? "DISCHARGING" : "BALANCED";
  return { socFraction: next, batteryW, state };
}

export const batteryCurrentA = (batteryW: number, socFraction: number) => batteryW / busVoltageV(socFraction);
