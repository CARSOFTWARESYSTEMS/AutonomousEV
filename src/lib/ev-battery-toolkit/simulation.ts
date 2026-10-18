// The simulated pack: series-group voltages and temperatures, and the BMS
// snapshot a simulated BMS would report, for a pack, a load state and an
// optional injected fault. Deterministic (no Math.random, values rounded) so
// the server and the browser render the same numbers. Every value it returns
// is labelled SIMULATED and must never be shown as measured.
import { simulated, notAvailable, round } from "./provenance";
import type { BatteryChemistry, BatteryPack, BmsSnapshot, BmsState, CommInterface, FaultDefinition, LinkState, Sourced } from "./types";

export type LoadState = "rest" | "load" | "charge";

/** Illustrative open-circuit voltage curves (SOC %, V). Not a cell datasheet. */
const OCV: Record<BatteryChemistry, [number, number][]> = {
  NMC: [[0, 3.0], [10, 3.45], [20, 3.56], [40, 3.68], [60, 3.82], [80, 3.98], [100, 4.18]],
  LFP: [[0, 2.8], [10, 3.18], [20, 3.24], [40, 3.28], [60, 3.3], [80, 3.33], [100, 3.45]],
};

/** Cell-group limits used to flag over- and under-voltage in the simulation. */
export const GROUP_LIMITS: Record<BatteryChemistry, { min: number; max: number }> = {
  NMC: { min: 2.8, max: 4.25 },
  LFP: { min: 2.5, max: 3.65 },
};

export function ocv(chemistry: BatteryChemistry, soc: number): number {
  const curve = OCV[chemistry];
  const s = Math.min(100, Math.max(0, soc));
  for (let i = 1; i < curve.length; i++) {
    const [s1, v1] = curve[i];
    const [s0, v0] = curve[i - 1];
    if (s <= s1) return v0 + ((v1 - v0) * (s - s0)) / (s1 - s0);
  }
  return curve[curve.length - 1][1];
}

/** A repeatable 0–1 value per index: the same on every engine. */
export function jitter(i: number, salt = 0): number {
  return (((i + 1) * 2654435761 + salt * 40503) >>> 0) % 1000 / 1000;
}

/** Where a fault shows up in the pack: fixed positions, so "why" can point at them. */
export const affectedGroup = (series: number) => Math.min(series - 1, Math.floor(series * 0.6));
export const highGroup = (series: number) => Math.min(series - 1, Math.floor(series * 0.25));

/** BMS temperature channels sit at the ends and the thirds of the pack, like a sparse real layout. */
export function sensorGroups(series: number): number[] {
  const last = series - 1;
  return Array.from(new Set([0, Math.round(last / 3), Math.round((2 * last) / 3), last]));
}

const BASE_SOC = 60;
const BASE_SOH = 92;
const AMBIENT = 30;
const LOAD_CURRENT = 45;
const CHARGE_CURRENT = -12;

export interface SimulationInput {
  pack: BatteryPack;
  fault: FaultDefinition | null;
  load: LoadState;
}

export interface SimulationResult {
  snapshot: BmsSnapshot;
  /** True temperatures per group, which a thermal camera would see even between BMS sensors. */
  trueTemps: number[];
  sensorGroups: number[];
  sensorTemps: number[];
  limits: { min: number; max: number };
}

export function simulate({ pack, fault, load }: SimulationInput): SimulationResult {
  const e = fault?.effects ?? {};
  const { series } = pack;
  const chem = pack.config.chemistry;
  const weak = affectedGroup(series);
  const high = highGroup(series);
  const soc = e.socOverride ?? BASE_SOC;
  const soh = e.sohOverride ?? BASE_SOH;
  const base = ocv(chem, soc);
  const loadSag = load === "load" ? 0.06 : load === "charge" ? -0.05 : 0;

  const groupVoltages = Array.from({ length: series }, (_, g) => {
    let v = base + (jitter(g) - 0.5) * 0.008 - loadSag;
    if (e.allGroupsMv) v += e.allGroupsMv / 1000;
    if (e.imbalanceSpreadMv) {
      const spread = e.imbalanceSpreadMv / 1000;
      v += (jitter(g, 7) - 0.5) * spread * 0.25;
      if (g === weak) v -= spread * 0.6;
      if (g === high) v += spread * 0.4;
    }
    if (g === weak && e.weakGroupMv) v += e.weakGroupMv / 1000;
    if (g === weak && e.loadSagMv && load === "load") v += e.loadSagMv / 1000;
    if (g === high && e.highGroupMv) v += e.highGroupMv / 1000;
    return round(Math.max(0, v), 3);
  });

  const trueTemps = Array.from({ length: series }, (_, g) => {
    let t = AMBIENT + 1 + jitter(g, 3) * 1.6 + (load === "load" ? 4 : load === "charge" ? 2 : 0);
    if (e.packTempC) t += e.packTempC;
    if (e.gradientC) t += (e.gradientC * g) / Math.max(1, series - 1);
    if (e.hotGroupC) {
      const d = Math.abs(g - weak);
      t += e.hotGroupC * (d === 0 ? 1 : d === 1 ? 0.45 : d === 2 ? 0.15 : 0);
    }
    return round(t, 1);
  });

  const channels = sensorGroups(series);
  const failedSensors = e.failedTempSensor ? [1] : [];
  const sensorTemps = channels.map((g, ch) => (failedSensors.includes(ch) ? -40 : trueTemps[g]));

  const bmsState: BmsState = e.bmsOffline ? "OFFLINE" : (e.bmsState ?? ((e.codes?.length ?? 0) > 0 ? "WARNING" : "NORMAL"));
  const comms: Record<CommInterface, LinkState> = { CAN: "ONLINE", UART: "ONLINE", BLE: "ONLINE", ...e.comms };
  const current = e.packCurrentA ?? (load === "load" ? LOAD_CURRENT : load === "charge" ? CHARGE_CURRENT : 0.2);

  const max = Math.max(...groupVoltages);
  const min = Math.min(...groupVoltages);
  const sum = groupVoltages.reduce((a, b) => a + b, 0);
  const tMax = Math.max(...sensorTemps);
  const tMin = Math.min(...sensorTemps);

  const off = <T,>(item: Sourced<T>, unit?: string): Sourced<T> => (e.bmsOffline ? notAvailable<T>(unit) : item);
  const packVoltage: Sourced<number> = e.packVoltageReadsZero
    ? { value: 0, provenance: "SIMULATED", unit: "V", note: "At the output terminals: the main current path is open." }
    : simulated(round(sum, 1), "V");

  const snapshot: BmsSnapshot = {
    packVoltage: off(packVoltage, "V"),
    packCurrent: off(simulated(round(current, 1), "A"), "A"),
    soc: off(simulated(round(soc, 0), "%"), "%"),
    soh: off(simulated(round(soh, 0), "%"), "%"),
    maxCellV: off(simulated(round(max, 3), "V"), "V"),
    minCellV: off(simulated(round(min, 3), "V"), "V"),
    cellDeltaMv: off(simulated(round((max - min) * 1000, 0), "mV"), "mV"),
    avgCellV: off(simulated(round(sum / series, 3), "V"), "V"),
    maxTemp: off(simulated(round(tMax, 1), "°C"), "°C"),
    minTemp: off(simulated(round(tMin, 1), "°C"), "°C"),
    tempSpread: off(simulated(round(tMax - tMin, 1), "°C"), "°C"),
    chargeEnabled: off(simulated(!e.chargeDisabled)),
    dischargeEnabled: off(simulated(!e.dischargeDisabled)),
    bmsState: e.bmsOffline ? { value: "OFFLINE", provenance: "SIMULATED" } : simulated(bmsState),
    faultCodes: off(simulated(e.codes ?? [])),
    comms,
    groupVoltages,
    groupTemps: trueTemps,
    hotGroup: e.hotGroupC || e.gradientC || e.packTempC ? (e.gradientC && !e.hotGroupC ? series - 1 : weak) : null,
    weakGroup: e.weakGroupMv || e.loadSagMv || e.imbalanceSpreadMv || e.allGroupsMv ? weak : e.highGroupMv ? high : null,
    failedSensors,
  };

  return { snapshot, trueTemps, sensorGroups: channels, sensorTemps, limits: GROUP_LIMITS[chem] };
}
