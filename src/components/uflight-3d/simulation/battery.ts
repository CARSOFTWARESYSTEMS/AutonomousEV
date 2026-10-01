// Battery digital twin: pack and module state for a flight condition, with the
// effect of a cell-group imbalance in module 03. Representative modules only —
// individual cells are not modelled. Simulated values.
import type { ModuleNo } from "../types";
import { MODULE_NUMBERS } from "../aircraft/layout";
import { clamp01, lerp } from "../lib/math";
import { batteryImbalance, type BatteryFaultOutputs } from "./faultModels";
import type { FlightState } from "./mission";

export const BATTERY_REFERENCE = {
  /** Usable energy when new, kWh. */
  energyKwh: 150,
  /** Maximum continuous power when healthy, kW. */
  powerKw: 640,
  nominalVoltage: 720,
  moduleResistanceMohm: 14,
  chargeCycles: 312,
  stateOfHealth: 0.97,
  /** Module carrying the imbalance scenario. */
  faultModule: "03" as ModuleNo,
} as const;

export interface ModuleState {
  no: ModuleNo;
  tempC: number;
  /** Spread between the module's cell groups, mV. */
  voltageSpreadMv: number;
  resistanceMohm: number;
  /** Six representative cell groups: deviation of each from the module mean, mV. */
  cellGroupsMv: number[];
}

export interface BatteryState {
  socPercent: number;
  sohPercent: number;
  packVoltage: number;
  packCurrentA: number;
  /** Current as a fraction of maximum, 0–1. */
  load: number;
  modules: ModuleState[];
  tempMaxC: number;
  tempSpreadC: number;
  voltageSpreadMv: number;
  /** Highest module resistance estimate, mΩ. */
  resistanceMohm: number;
  insulationKohm: number;
  availableEnergyKwh: number;
  availablePowerKw: number;
  chargeCycles: number;
  /** Coolant temperature rise across the cold plates, °C. */
  coolingDeltaC: number;
  /** Heat rejected against heat generated, 0–1; 1 = keeping up. */
  coolingPerformance: number;
  thermalState: "COOL" | "NOMINAL" | "WARM" | "LIMITED";
  fault: BatteryFaultOutputs;
}

/** Position along the pack: inner modules run a little warmer than the ends. */
const MODULE_BIAS: readonly number[] = [0.2, 0.9, 1.1, 0.4, 0.3, 1.0, 0.8, 0.1];
/** Healthy pattern of cell-group deviation, as fractions of the module's spread. */
const GROUP_PATTERN: readonly number[] = [0.32, -0.18, 0.08, -0.4, 0.22, -0.04];

export function batteryState(flight: FlightState, faultSeverity: number): BatteryState {
  const soc = flight.socPercent;
  const power = flight.batteryPowerKw;
  // Open-circuit voltage falls with state of charge; the pack sags under load.
  const openCircuit = BATTERY_REFERENCE.nominalVoltage * lerp(0.9, 1.05, soc / 100);
  const packResistance = 0.085;
  const currentGuess = (power * 1000) / openCircuit;
  const packVoltage = openCircuit - currentGuess * packResistance;
  const packCurrentA = (power * 1000) / packVoltage;
  const load = clamp01(power / BATTERY_REFERENCE.powerKw);
  const fault = batteryImbalance({ load, faultSeverity });

  const baseTemp = 27 + 13 * load;
  const modules: ModuleState[] = MODULE_NUMBERS.map((no, index) => {
    const faulted = no === BATTERY_REFERENCE.faultModule;
    const healthySpread = 9 + 4 * (0.35 + 0.65 * load) + index * 0.35;
    const spread = faulted ? fault.voltageSpreadMv : healthySpread;
    const cellGroupsMv = GROUP_PATTERN.map((f, group) => {
      // The drifting group sits low under load; the others keep their healthy pattern.
      if (faulted && group === 3) return -(spread - healthySpread * 0.4);
      return f * healthySpread;
    });
    return {
      no,
      tempC: baseTemp + MODULE_BIAS[index] * (0.8 + 1.4 * load) + (faulted ? fault.temperatureSpreadC - 1.6 : 0),
      voltageSpreadMv: spread,
      resistanceMohm: BATTERY_REFERENCE.moduleResistanceMohm * (1 + index * 0.004) * (faulted ? fault.resistanceRatio : 1),
      cellGroupsMv,
    };
  });

  const temps = modules.map((m) => m.tempC);
  const tempMaxC = Math.max(...temps);
  const tempSpreadC = tempMaxC - Math.min(...temps);
  const soh = BATTERY_REFERENCE.stateOfHealth;
  const coolingPerformance = clamp01(1 - 0.12 * load);

  return {
    socPercent: soc,
    sohPercent: soh * 100,
    packVoltage,
    packCurrentA,
    load,
    modules,
    tempMaxC,
    tempSpreadC,
    voltageSpreadMv: Math.max(...modules.map((m) => m.voltageSpreadMv)),
    resistanceMohm: Math.max(...modules.map((m) => m.resistanceMohm)),
    insulationKohm: 2400,
    availableEnergyKwh: (BATTERY_REFERENCE.energyKwh * soh * soc) / 100,
    availablePowerKw: BATTERY_REFERENCE.powerKw * fault.powerFactor,
    chargeCycles: BATTERY_REFERENCE.chargeCycles,
    coolingDeltaC: 1.5 + 5.5 * load,
    coolingPerformance,
    thermalState: tempMaxC < 28 ? "COOL" : tempMaxC < 40 ? "NOMINAL" : tempMaxC < 48 ? "WARM" : "LIMITED",
    fault,
  };
}

export const moduleState = (battery: BatteryState, no: ModuleNo): ModuleState => battery.modules[Number(no) - 1];
