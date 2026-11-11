// An illustrative spacecraft power anomaly, for teaching the six-stage
// health-management loop on /space. Simulated: not data from any spacecraft,
// and not a validated or flight-ready autonomy system.
//
// Every number below follows from the stated assumptions, so the story is
// internally consistent (scenario.test.ts checks it):
//  - Orbit: 500 km circular, Sun in the orbit plane (worst-case eclipse).
//      a = 6,371 + 500 km; T = 2π√(a³/μ) ≈ 94.5 min; eclipse = T × asin(R/a)/π ≈ 35.7 min.
//  - Battery: two Li-ion cells in series (2S), 6.0 V pack cut-off, 8.4 V full.
//  - Loads: 4.2 W in normal operations, 1.5 W in safe mode (payload and
//    transmitter off, beacon on).
//  - After the fault, about 2.0 Wh is left above cut-off when eclipse begins.
//  - Pack voltage is taken to fall linearly with the energy left above
//    cut-off: a teaching simplification (real Li-ion curves are flatter in
//    the middle and steeper at the ends).

export const MU_KM3_S2 = 398_600.4418;
export const EARTH_RADIUS_KM = 6_371;
export const ALTITUDE_KM = 500;

const a = EARTH_RADIUS_KM + ALTITUDE_KM;
export const ORBIT_MIN = (2 * Math.PI * Math.sqrt(a ** 3 / MU_KM3_S2)) / 60;
export const ECLIPSE_MIN = (ORBIT_MIN * Math.asin(EARTH_RADIUS_KM / a)) / Math.PI;
export const SUNLIT_MIN = ORBIT_MIN - ECLIPSE_MIN;

export const BATTERY = { cells: 2, fullV: 8.4, cutoffV: 6.0 } as const;
export const LOAD_W = { normal: 4.2, safe: 1.5 } as const;
/** Energy above cut-off at the start of the eclipse after the fault, Wh. */
export const ENERGY_ABOVE_CUTOFF_WH = 2.0;
/** Pack voltage at the start of that eclipse. */
export const ECLIPSE_START_V = 7.0;

/** Expected sunlit pack voltage band at this state of charge, and the detection rule. */
export const DETECTION = { bandV: [7.6, 8.4] as const, persistenceSamples: 3, sampleMin: 1 };
/** Criteria fixed before flight, checked in the Verify stage. */
export const CRITERIA = { minBusV: 6.4, maxTempC: 30 };

/** Linear-in-energy pack voltage (see the simplification above). */
export const voltageAt = (energyAboveCutoffWh: number) => BATTERY.cutoffV + (ECLIPSE_START_V - BATTERY.cutoffV) * Math.max(0, energyAboveCutoffWh) / ENERGY_ABOVE_CUTOFF_WH;

/** Minutes into the eclipse at which the pack reaches cut-off under a load. */
export const minutesToCutoff = (loadW: number) => (ENERGY_ABOVE_CUTOFF_WH / loadW) * 60;

/** Energy used through a whole eclipse at a load, Wh. */
export const eclipseEnergyWh = (loadW: number) => loadW * (ECLIPSE_MIN / 60);

export const SAFE_REMAINING_WH = ENERGY_ABOVE_CUTOFF_WH - eclipseEnergyWh(LOAD_W.safe);
export const SAFE_MIN_V = voltageAt(SAFE_REMAINING_WH);

// ── Telemetry at each stage ──

export type StageId = "observe" | "detect" | "diagnose" | "predict" | "recover" | "verify";
export type PartId = "battery" | "eps" | "panels" | "obc" | "adcs" | "radio" | "antenna";

export interface Telemetry {
  /**
   * Battery pack voltage. In this design the pack is the unregulated battery
   * bus; the computer and radio run from regulated 3.3 V and 5 V rails, which
   * hold steady until the pack nears cut-off.
   */
  busV: number;
  cell1V: number;
  cell2V: number;
  batteryTempC: number;
  arrayA: number;
  loadW: number;
  obc: string;
  adcs: string;
  comms: string;
}

const NORMAL: Telemetry = { busV: 7.9, cell1V: 3.95, cell2V: 3.95, batteryTempC: 18, arrayA: 1.1, loadW: LOAD_W.normal, obc: "Nominal: health checks every minute", adcs: "Sun-pointing, body rates under 0.1°/s", comms: "Next ground-station pass in 18 min" };
const FAULTED: Telemetry = { ...NORMAL, busV: 6.9, cell1V: 3.98, cell2V: 2.92, batteryTempC: 27 };

export const TELEMETRY: Record<StageId, Telemetry> = {
  observe: NORMAL,
  detect: { ...FAULTED, obc: "Anomaly flag: pack voltage below band for 3 samples" },
  diagnose: { ...FAULTED, obc: "Isolating: comparing candidate causes" },
  // By the end of the sunlit pass the weak charge has lifted the pack to 7.0 V: cell 1 4.03 V + cell 2 2.97 V.
  predict: { ...FAULTED, busV: ECLIPSE_START_V, cell1V: 4.03, cell2V: 2.97, obc: "Predicting the next eclipse" },
  recover: { ...FAULTED, busV: ECLIPSE_START_V, cell1V: 4.03, cell2V: 2.97, batteryTempC: 24, loadW: LOAD_W.safe, obc: "Safe mode (operator-approved)", comms: "Transmitter off; beacon on" },
  verify: { ...FAULTED, busV: Math.round(SAFE_MIN_V * 100) / 100, cell1V: 3.6, cell2V: 2.95, batteryTempC: 22, loadW: LOAD_W.safe, obc: "Safe mode held; criteria met", comms: "Beacon on; status sent at next pass" },
};

export interface Stage {
  id: StageId;
  title: string;
  /** One or two sentences, always visible for the selected stage. */
  short: string;
  /** Subsystems the 3D model highlights. */
  parts: PartId[];
  /** Telemetry chips over the model. */
  chips: { part: PartId; text: string }[];
  /** Where on the telemetry chart this stage sits, minutes. */
  at: number;
}

const f1 = (x: number) => x.toFixed(1);
const f2 = (x: number) => x.toFixed(2);

/** Minutes on the chart: orbit 1 normal; the fault starts in orbit 2's sunlight. */
export const T = {
  onset: ORBIT_MIN + 15,
  detect: ORBIT_MIN + 19,
  diagnose: ORBIT_MIN + 23,
  predict: ORBIT_MIN + 26,
  recover: ORBIT_MIN + 32,
  eclipse2: ORBIT_MIN + SUNLIT_MIN,
  end: 2 * ORBIT_MIN,
};

export const STAGES: Stage[] = [
  {
    id: "observe",
    title: "Observe telemetry",
    short: `Every minute the spacecraft samples its own health: voltages, currents and temperatures. In sunlight the battery charges normally: ${f1(NORMAL.busV)} V and ${NORMAL.batteryTempC} °C.`,
    parts: ["battery", "eps", "panels"],
    chips: [
      { part: "battery", text: `Battery ${f1(NORMAL.busV)} V · ${NORMAL.batteryTempC} °C` },
      { part: "panels", text: `Solar array ${f1(NORMAL.arrayA)} A` },
    ],
    at: 30,
  },
  {
    id: "detect",
    title: "Detect anomaly",
    short: `Still in sunlight, the pack falls to ${f1(FAULTED.busV)} V, below its expected ${DETECTION.bandV[0]}–${DETECTION.bandV[1]} V, while the array still delivers ${f1(FAULTED.arrayA)} A. After ${DETECTION.persistenceSamples} low samples in a row, the flight computer raises an anomaly flag.`,
    parts: ["obc", "battery"],
    chips: [
      { part: "battery", text: `Battery ${f1(FAULTED.busV)} V ▼ below band` },
      { part: "obc", text: "Anomaly flag raised" },
    ],
    at: T.detect,
  },
  {
    id: "diagnose",
    title: "Diagnose fault",
    short: `The array current is normal, so the panels are not the cause. Per-cell telemetry shows cell 2 at ${f2(FAULTED.cell2V)} V against ${f2(FAULTED.cell1V)} V, and the pack is ${FAULTED.batteryTempC - NORMAL.batteryTempC} °C warmer: a degrading battery cell.`,
    parts: ["battery"],
    chips: [
      { part: "battery", text: `Cell 1 ${f2(FAULTED.cell1V)} V · Cell 2 ${f2(FAULTED.cell2V)} V` },
      { part: "eps", text: "Charge regulator: normal" },
    ],
    at: T.diagnose,
  },
  {
    id: "predict",
    title: "Predict impact",
    short: `About ${f1(ENERGY_ABOVE_CUTOFF_WH)} Wh is left above the ${f1(BATTERY.cutoffV)} V cut-off. At the normal ${f1(LOAD_W.normal)} W load the pack would reach cut-off about ${Math.round(minutesToCutoff(LOAD_W.normal))} minutes into the next ${Math.round(ECLIPSE_MIN)}-minute eclipse, and the computer would brown out.`,
    parts: ["obc", "battery"],
    chips: [
      { part: "battery", text: `${f1(ENERGY_ABOVE_CUTOFF_WH)} Wh above cut-off` },
      { part: "obc", text: `Cut-off in ${Math.round(minutesToCutoff(LOAD_W.normal))} min of a ${Math.round(ECLIPSE_MIN)} min eclipse` },
    ],
    at: T.predict,
  },
  {
    id: "recover",
    title: "Recover safely",
    short: `The system recommends safe mode: payload and transmitter off, beacon only, charging slowed. At the Supervised level an operator approves it before it runs. The load falls from ${f1(LOAD_W.normal)} W to ${f1(LOAD_W.safe)} W.`,
    parts: ["eps", "radio", "antenna"],
    chips: [
      { part: "eps", text: `Load ${f1(LOAD_W.normal)} → ${f1(LOAD_W.safe)} W` },
      { part: "radio", text: "Transmitter off · beacon on" },
    ],
    at: T.recover,
  },
  {
    id: "verify",
    title: "Verify recovery",
    short: `Through the next eclipse the battery pack stays at or above ${f2(SAFE_MIN_V)} V (criterion: at least ${f1(CRITERIA.minBusV)} V), the battery cools to ${TELEMETRY.verify.batteryTempC} °C (at most ${CRITERIA.maxTempC} °C) and the beacon stays on. It stays in safe mode until people decide what comes next.`,
    parts: ["battery", "radio"],
    chips: [
      { part: "battery", text: `Lowest ${f2(SAFE_MIN_V)} V ≥ ${f1(CRITERIA.minBusV)} V ✓` },
      { part: "radio", text: "Beacon on ✓" },
    ],
    at: T.end - 2,
  },
];

// ── The voltage trace for the chart ──

export interface TracePoint {
  t: number;
  v: number;
}

const lerp = (x0: number, y0: number, x1: number, y1: number, x: number) => y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);

/** Pack voltage over two orbits, as flown (with safe mode), sampled each minute. */
export function actualTrace(): TracePoint[] {
  const pts: TracePoint[] = [];
  for (let t = 0; t < T.end; t += 1) pts.push({ t, v: Math.round(voltageAtTime(t) * 1000) / 1000 });
  pts.push({ t: T.end, v: Math.round(voltageAtTime(T.end) * 1000) / 1000 });
  return pts;
}

function voltageAtTime(t: number): number {
  // Orbit 1: normal. Charge 7.7 → 8.1 V in sunlight, discharge to 7.5 V in eclipse.
  if (t <= SUNLIT_MIN) return lerp(0, 7.7, SUNLIT_MIN, 8.1, t);
  if (t <= ORBIT_MIN) return lerp(SUNLIT_MIN, 8.1, ORBIT_MIN, 7.5, t);
  // Orbit 2: normal charging until the fault, a fall to 6.9 V, then a weak charge to 7.0 V by eclipse.
  if (t <= T.onset) return lerp(ORBIT_MIN, 7.5, T.onset, 7.9, t);
  if (t <= T.onset + 4) return lerp(T.onset, 7.9, T.onset + 4, FAULTED.busV, t);
  if (t <= T.eclipse2) return lerp(T.onset + 4, FAULTED.busV, T.eclipse2, ECLIPSE_START_V, t);
  // Eclipse under safe mode: energy falls at 1.5 W.
  const used = LOAD_W.safe * ((t - T.eclipse2) / 60);
  return voltageAt(ENERGY_ABOVE_CUTOFF_WH - used);
}

/** The prediction without action: the eclipse at the normal load, to cut-off. */
export function withoutActionTrace(): TracePoint[] {
  const pts: TracePoint[] = [];
  const cutoffAt = T.eclipse2 + minutesToCutoff(LOAD_W.normal);
  for (let t = Math.ceil(T.eclipse2); t <= T.end; t += 1) {
    const used = LOAD_W.normal * ((t - T.eclipse2) / 60);
    pts.push({ t, v: Math.round(Math.max(BATTERY.cutoffV, voltageAt(ENERGY_ABOVE_CUTOFF_WH - used)) * 1000) / 1000 });
    if (t >= cutoffAt) break;
  }
  return pts;
}

/** Eclipse intervals over the two orbits, minutes. */
export const ECLIPSES: [number, number][] = [
  [SUNLIT_MIN, ORBIT_MIN],
  [ORBIT_MIN + SUNLIT_MIN, 2 * ORBIT_MIN],
];
