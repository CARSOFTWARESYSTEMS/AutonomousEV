// Thermal model: how warm each monitored component is relative to its limits,
// and the state of the liquid loop. The overlay draws these levels; it does
// not compute them. Simulated values.
import type { ComponentId } from "../types";
import { clamp01 } from "../lib/math";
import type { BatteryState } from "./battery";
import type { UnitState } from "./propulsion";

export type ThermalClass = "COOL" | "NOMINAL" | "WARM" | "LIMITED";

export const THERMAL_LEGEND: readonly { id: ThermalClass; label: string; color: string; upTo: number }[] = [
  { id: "COOL", label: "COOL", color: "#4d8fe0", upTo: 0.25 },
  { id: "NOMINAL", label: "NOMINAL", color: "#c9b46a", upTo: 0.62 },
  { id: "WARM", label: "WARM", color: "#f08a3c", upTo: 0.86 },
  { id: "LIMITED", label: "LIMITED", color: "#e5484d", upTo: 1 },
];

/** 0 = at ambient, 1 = at the component's limit. */
export const thermalClass = (level: number): ThermalClass => THERMAL_LEGEND.find((c) => level <= c.upTo)?.id ?? "LIMITED";

const AMBIENT = 25;
/** Temperature at which each kind of component reaches its limit, °C. */
const LIMIT = { winding: 120, inverter: 95, bearing: 110, battery: 55, avionics: 70, coolant: 60 } as const;

const level = (tempC: number, limit: number) => clamp01((tempC - AMBIENT) / (limit - AMBIENT));

export interface ThermalState {
  /** Heat level per component, 0–1. Components not listed are not heat sources. */
  levels: Partial<Record<ComponentId, number>>;
  coolantInC: number;
  coolantOutC: number;
  coolantPressureKpa: number;
  avionicsTempC: number;
  /** Heat carried by the liquid loop, kW. */
  heatRejectedKw: number;
  /** Loop activity, 0–1, for the flow overlay. */
  flow: number;
}

export function thermalState(units: readonly UnitState[], battery: BatteryState, bearingTempUnit04?: number): ThermalState {
  const levels: Partial<Record<ComponentId, number>> = {};
  for (const unit of units) {
    const bearingTemp = unit.no === "04" && bearingTempUnit04 !== undefined ? bearingTempUnit04 : unit.bearingTempC;
    levels[`pu${unit.no}-motor`] = level(unit.windingTempC, LIMIT.winding);
    levels[`pu${unit.no}-inverter`] = level(unit.inverterTempC, LIMIT.inverter);
    levels[`pu${unit.no}-bearing-front`] = level(bearingTemp, LIMIT.bearing);
    levels[`pu${unit.no}-bearing-rear`] = level(unit.bearingTempC - 3, LIMIT.bearing);
    levels[`pu${unit.no}-cooling-interface`] = level(unit.windingTempC * 0.62 + 12, LIMIT.coolant + 20);
  }
  for (const pack of battery.modules) levels[`battery-module-${pack.no}`] = level(pack.tempC, LIMIT.battery);

  const avionicsTempC = 34 + 6 * battery.load;
  const coolantOutC = 24 + 2 * battery.load;
  const coolantInC = coolantOutC + battery.coolingDeltaC;
  levels["battery-cooling"] = level(coolantInC, LIMIT.coolant);
  levels["cooling-manifold"] = level(coolantInC, LIMIT.coolant);
  levels["coolant-pumps"] = level(coolantOutC + 4, LIMIT.coolant);
  levels["heat-exchanger"] = level((coolantInC + coolantOutC) / 2 + 4, LIMIT.coolant);
  levels["avionics-cooling"] = level(avionicsTempC, LIMIT.avionics);
  for (const id of ["fcc-a", "fcc-b", "fcc-c", "hums-computer", "edge-processor", "nav-processor", "dcdc-converter"] as const) levels[id] = level(avionicsTempC + 6, LIMIT.avionics);
  levels["hv-contactors"] = level(30 + 22 * battery.load, 90);

  return {
    levels,
    coolantInC,
    coolantOutC,
    coolantPressureKpa: 168 + 40 * battery.load,
    avionicsTempC,
    heatRejectedKw: 2.4 + 14 * battery.load,
    flow: 0.35 + 0.65 * battery.load,
  };
}
