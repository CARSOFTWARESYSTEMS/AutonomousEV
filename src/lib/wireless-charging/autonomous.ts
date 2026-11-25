// Autonomous parking and charging-station selection (WPT-AV-001…003).
//
// Simulation only: nothing here drives a physical vehicle. The vehicle
// follows a planned forward-parking path with pure-pursuit steering on a
// kinematic bicycle model. It steers from an ESTIMATED pose, produced by an
// extended Kalman filter that fuses odometry (wheel speed and yaw rate, with
// noise and gyro bias) with UWB position fixes (noisy and possibly delayed),
// plus optional pad-relative precision positioning near the bay. The final
// receiver-to-pad offset — the alignment error — feeds the coupler model, so
// sensor noise and delay show up as lost coupling and charging power.
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "./coils";
import { clamp, createRng, type Rng } from "./math";
import { fnv1a } from "./network";

export const AV_MODEL_VERSION = "WPT-AV-001 v1.0.0";

export interface ParkingInputs {
  /** 1σ of each UWB position fix, m. */
  uwbNoise: number;
  /** UWB fix rate, Hz. */
  uwbRate: number;
  /** Measurement delay of a UWB fix, s. */
  measurementDelay: number;
  latencyCompensation: boolean;
  /** Relative 1σ error of wheel-speed odometry. */
  odometryNoise: number;
  /** Yaw-rate gyro bias, rad/s. */
  gyroBias: number;
  /** Pad-relative positioning (1 cm class) in the last 2.5 m. */
  precisionPositioning: boolean;
  /** Deliberate bias of the parking target, to study tolerance, m. */
  targetBiasLateral: number;
  targetBiasLongitudinal: number;
  /** Pure-pursuit look-ahead at standstill, m. */
  lookahead: number;
  seed: number;
}

export const DEFAULT_PARKING_INPUTS: ParkingInputs = {
  uwbNoise: 0.08,
  uwbRate: 10,
  measurementDelay: 0.05,
  latencyCompensation: true,
  odometryNoise: 0.01,
  gyroBias: 0.002,
  precisionPositioning: true,
  targetBiasLateral: 0,
  targetBiasLongitudinal: 0,
  lookahead: 1.4,
  seed: 11,
};

export const WHEELBASE = 2.9;
export const MAX_STEER = (35 * Math.PI) / 180;
/** Receiver pad ahead of the vehicle's reference point (rear axle), m. */
export const RX_FROM_REAR_AXLE = 2.05;

export interface Pose {
  x: number;
  y: number;
  heading: number;
}

/** The forward-parking path: down the aisle, a left quarter turn of radius R, then straight into the bay. Rear-axle points. */
export function parkingPath(goal: Pose, radius = 5.5, aisleX = -12.5, startY = 16, step = 0.05): Pose[] {
  const pts: Pose[] = [];
  const turnY = goal.y + radius;
  for (let y = startY; y > turnY; y -= step) pts.push({ x: aisleX, y, heading: -Math.PI / 2 });
  const cx = aisleX + radius;
  const n = Math.ceil((Math.PI / 2) * radius / step);
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (Math.PI / 2) * (i / n);
    pts.push({ x: cx + radius * Math.cos(a), y: turnY + radius * Math.sin(a), heading: -Math.PI / 2 + (Math.PI / 2) * (i / n) });
  }
  for (let x = cx + step; x <= goal.x + 1e-9; x += step) pts.push({ x, y: goal.y, heading: 0 });
  pts.push({ ...goal });
  return pts;
}

/** Points past the goal along its heading, so pure pursuit always has a look-ahead target while docking. */
const runOut = (goal: Pose, length = 4, step = 0.05): Pose[] => Array.from({ length: Math.round(length / step) }, (_, i) => ({ x: goal.x + (i + 1) * step * Math.cos(goal.heading), y: goal.y + (i + 1) * step * Math.sin(goal.heading), heading: goal.heading }));

export interface ParkingState {
  t: number;
  truth: Pose & { v: number; steer: number };
  estimate: Pose;
  /** EKF covariance (3×3, row-major). */
  P: number[];
  path: Pose[];
  /** Index of the goal in `path` (points after it are the run-out). */
  goalIndex: number;
  goal: Pose;
  phase: "approach" | "docking" | "parked";
  /** Index of the closest path point. */
  progress: number;
  /** Receiver offset from the pad centre once parked, m. */
  finalError: { lateral: number; longitudinal: number } | null;
  /** Coupling at the final position. */
  finalK: number | null;
  trace: { t: number; x: number; y: number; ex: number; ey: number; v: number }[];
  pendingFixes: { at: number; x: number; y: number; heading: number | null; pose: Pose }[];
  nextFix: number;
}

export interface ParkingSim {
  inputs: ParkingInputs;
  state: ParkingState;
  rng: Rng;
  airGap: number;
}

export function createParking(inputs: ParkingInputs = DEFAULT_PARKING_INPUTS, airGap = 0.15): ParkingSim {
  // Pad centre at the origin; the rear axle stops RX_FROM_REAR_AXLE behind it (plus any bias).
  const goal: Pose = { x: -RX_FROM_REAR_AXLE + inputs.targetBiasLongitudinal, y: inputs.targetBiasLateral, heading: 0 };
  const planned = parkingPath(goal);
  const path = [...planned, ...runOut(goal)];
  const start = path[0];
  return {
    inputs: { ...inputs },
    rng: createRng(inputs.seed),
    airGap,
    state: {
      t: 0,
      truth: { ...start, v: 0, steer: 0 },
      estimate: { ...start },
      P: [0.04, 0, 0, 0, 0.04, 0, 0, 0, 0.002],
      path,
      goalIndex: planned.length - 1,
      goal,
      phase: "approach",
      progress: 0,
      finalError: null,
      finalK: null,
      trace: [],
      pendingFixes: [],
      nextFix: 0,
    },
  };
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Pure-pursuit steering toward the path point one look-ahead ahead of the closest point, from pose p. */
function purePursuit(path: readonly Pose[], p: Pose, from: number, lookahead: number): { steer: number; closest: number } {
  let closest = from;
  let best = Infinity;
  for (let i = from; i < Math.min(path.length, from + 400); i++) {
    const d = Math.hypot(path[i].x - p.x, path[i].y - p.y);
    if (d < best) {
      best = d;
      closest = i;
    }
  }
  let target = closest;
  while (target < path.length - 1 && Math.hypot(path[target].x - p.x, path[target].y - p.y) < lookahead) target++;
  const tx = path[target].x - p.x;
  const ty = path[target].y - p.y;
  const alpha = wrap(Math.atan2(ty, tx) - p.heading);
  const ld = Math.max(0.3, Math.hypot(tx, ty));
  const steer = clamp(Math.atan((2 * WHEELBASE * Math.sin(alpha)) / ld), -MAX_STEER, MAX_STEER);
  return { steer, closest };
}

/** Advances the parking simulation by dt (default 20 ms). */
export function stepParking(sim: ParkingSim, dt = 0.02): void {
  const s = sim.state;
  const inp = sim.inputs;
  if (s.phase === "parked") return;
  s.t += dt;
  const rng = sim.rng;

  // ── Guidance and control, from the estimate ──
  const pp = purePursuit(s.path, s.estimate, s.progress, inp.lookahead + 0.4 * s.truth.v);
  s.progress = pp.closest;
  // Path points are 5 cm apart; on the final straight (heading 0) the distance left is measured directly.
  s.phase = pp.closest > s.goalIndex - 60 ? "docking" : "approach";
  const remaining = s.phase === "docking" ? s.goal.x - s.estimate.x : (s.goalIndex - pp.closest) * 0.05;
  // Docking creeps at ≥ 4 cm/s until 1 cm from the goal, then stops.
  const vRef = s.phase === "docking" ? (remaining > 0.01 ? clamp(0.9 * remaining, 0.04, 0.6) : 0) : clamp(Math.sqrt(2 * 0.45 * remaining), 0.6, 2.4);
  const accel = clamp((s.phase === "docking" ? 5 : 2.2) * (vRef - s.truth.v), -1.6, 1.2);
  // Steering actuator: first-order lag, 0.15 s.
  s.truth.steer += (pp.steer - s.truth.steer) * (1 - Math.exp(-dt / 0.15));

  // ── True motion: kinematic bicycle (rear-axle reference) ──
  const v = Math.max(0, s.truth.v + accel * dt);
  s.truth.v = v;
  const yawRate = (v * Math.tan(s.truth.steer)) / WHEELBASE;
  s.truth.x += v * Math.cos(s.truth.heading) * dt;
  s.truth.y += v * Math.sin(s.truth.heading) * dt;
  s.truth.heading = wrap(s.truth.heading + yawRate * dt);

  // ── EKF prediction from odometry ──
  const vm = v * (1 + inp.odometryNoise * rng.normal());
  const wm = yawRate + inp.gyroBias + 0.002 * rng.normal();
  const e = s.estimate;
  const c = Math.cos(e.heading);
  const sn = Math.sin(e.heading);
  e.x += vm * c * dt;
  e.y += vm * sn * dt;
  e.heading = wrap(e.heading + wm * dt);
  // P = F P Fᵀ + Q, F = [[1,0,−v s dt],[0,1,v c dt],[0,0,1]].
  const F = [1, 0, -vm * sn * dt, 0, 1, vm * c * dt, 0, 0, 1];
  const q = [(inp.odometryNoise * vm * dt) ** 2 + 1e-6, 0, 0, 0, (inp.odometryNoise * vm * dt) ** 2 + 1e-6, 0, 0, 0, (0.004 * dt) ** 2 + (inp.gyroBias * dt) ** 2];
  s.P = add3(mul3(mul3(F, s.P), transpose3(F)), q);

  // ── Position fixes ──
  if (s.t >= s.nextFix) {
    s.nextFix = s.t + 1 / inp.uwbRate;
    const nearPad = Math.hypot(s.truth.x - s.goal.x, s.truth.y - s.goal.y) < 2.5;
    const precise = inp.precisionPositioning && nearPad;
    const sigma = precise ? 0.01 : inp.uwbNoise;
    // A fix measures where the vehicle WAS; it arrives after the delay (pad-relative positioning is fast: 10 ms).
    const delay = precise ? 0.01 : inp.measurementDelay;
    // Pad-relative positioning (two field sensors) also measures heading, to about 0.3°.
    const heading = precise ? s.truth.heading + 0.005 * rng.normal() : null;
    s.pendingFixes.push({ at: s.t + delay, x: s.truth.x + sigma * rng.normal(), y: s.truth.y + sigma * rng.normal(), heading, pose: { ...s.estimate } });
    pendingSigma.set(sim, sigma);
  }
  while (s.pendingFixes.length && s.pendingFixes[0].at <= s.t) {
    const fix = s.pendingFixes.shift()!;
    let zx = fix.x;
    let zy = fix.y;
    if (inp.latencyCompensation) {
      // Shift the delayed fix by the odometry displacement since it was taken.
      zx += e.x - fix.pose.x;
      zy += e.y - fix.pose.y;
    }
    const sigma = pendingSigma.get(sim) ?? inp.uwbNoise;
    ekfPositionUpdate(s, zx, zy, sigma * sigma);
    if (fix.heading !== null) ekfHeadingUpdate(s, fix.heading + (inp.latencyCompensation ? e.heading - fix.pose.heading : 0), 0.005 ** 2);
  }

  // ── Stop and evaluate ──
  const done = s.phase === "docking" && remaining < 0.012 && s.truth.v < 0.005;
  if (s.trace.length === 0 || s.t - s.trace[s.trace.length - 1].t >= 0.1) s.trace.push({ t: s.t, x: s.truth.x, y: s.truth.y, ex: e.x, ey: e.y, v });
  if (done || s.t > 90) {
    s.phase = "parked";
    s.truth.v = 0;
    // Receiver position: RX_FROM_REAR_AXLE ahead of the rear axle along the heading.
    const rxX = s.truth.x + RX_FROM_REAR_AXLE * Math.cos(s.truth.heading);
    const rxY = s.truth.y + RX_FROM_REAR_AXLE * Math.sin(s.truth.heading);
    s.finalError = { longitudinal: rxX, lateral: rxY };
    s.finalK = computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: sim.airGap, lateral: rxY, longitudinal: rxX }).k;
  }
}
const pendingSigma = new WeakMap<ParkingSim, number>();

function ekfPositionUpdate(s: ParkingState, zx: number, zy: number, r: number) {
  // H = [[1,0,0],[0,1,0]]; S = H P Hᵀ + R; K = P Hᵀ S⁻¹.
  const P = s.P;
  const s00 = P[0] + r;
  const s01 = P[1];
  const s10 = P[3];
  const s11 = P[4] + r;
  const det = s00 * s11 - s01 * s10;
  const i00 = s11 / det;
  const i01 = -s01 / det;
  const i10 = -s10 / det;
  const i11 = s00 / det;
  const K = [0, 0, 0, 0, 0, 0];
  for (let row = 0; row < 3; row++) {
    const p0 = P[row * 3 + 0];
    const p1 = P[row * 3 + 1];
    K[row * 2 + 0] = p0 * i00 + p1 * i10;
    K[row * 2 + 1] = p0 * i01 + p1 * i11;
  }
  const yx = zx - s.estimate.x;
  const yy = zy - s.estimate.y;
  s.estimate.x += K[0] * yx + K[1] * yy;
  s.estimate.y += K[2] * yx + K[3] * yy;
  s.estimate.heading = wrap(s.estimate.heading + K[4] * yx + K[5] * yy);
  // P = (I − K H) P.
  const IKH = [1 - K[0], -K[1], 0, -K[2], 1 - K[3], 0, -K[4], -K[5], 1];
  s.P = mul3(IKH, P);
}

function ekfHeadingUpdate(s: ParkingState, z: number, r: number) {
  // H = [0, 0, 1].
  const P = s.P;
  const S = P[8] + r;
  const K = [P[2] / S, P[5] / S, P[8] / S];
  const y = wrap(z - s.estimate.heading);
  s.estimate.x += K[0] * y;
  s.estimate.y += K[1] * y;
  s.estimate.heading = wrap(s.estimate.heading + K[2] * y);
  const IKH = [1, 0, -K[0], 0, 1, -K[1], 0, 0, 1 - K[2]];
  s.P = mul3(IKH, P);
}

const mul3 = (a: number[], b: number[]) => {
  const o = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) o[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
  return o;
};
const transpose3 = (a: number[]) => [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]];
const add3 = (a: number[], b: number[]) => a.map((v, i) => v + b[i]);

/** Runs a parking manoeuvre to the end. */
export function runParking(inputs: ParkingInputs = DEFAULT_PARKING_INPUTS, airGap = 0.15): ParkingSim {
  const sim = createParking(inputs, airGap);
  for (let i = 0; i < 6000 && sim.state.phase !== "parked"; i++) stepParking(sim, 0.02);
  return sim;
}

// ── Station selection, reservation and mission continuation ────────────────

export interface CandidateStation {
  id: string;
  name: string;
  /** Driving distance from the vehicle, km. */
  distanceKm: number;
  /** Free wireless bays now. */
  freeBays: number;
  /** Expected wait if none is free, min. */
  queueMinutes: number;
  /** Power at the battery, kW. */
  powerKW: number;
  /** Price per kWh. */
  price: number;
  compatible: boolean;
  /** Extra distance back to the mission route, km. */
  detourKm: number;
}

export const DEFAULT_CANDIDATES: readonly CandidateStation[] = [
  { id: "S1", name: "Office park, Level B1", distanceKm: 1.8, freeBays: 0, queueMinutes: 25, powerKW: 11, price: 9.2, compatible: true, detourKm: 0.6 },
  { id: "S2", name: "Retail parking, Bay 14–20", distanceKm: 3.4, freeBays: 3, queueMinutes: 0, powerKW: 11, price: 10.5, compatible: true, detourKm: 1.2 },
  { id: "S3", name: "Fleet depot (reserved)", distanceKm: 6.1, freeBays: 5, queueMinutes: 0, powerKW: 22, price: 7.8, compatible: true, detourKm: 4.5 },
  { id: "S4", name: "Public car park, East", distanceKm: 2.6, freeBays: 2, queueMinutes: 0, powerKW: 7.4, price: 8.6, compatible: false, detourKm: 0.9 },
];

export interface SelectionInputs {
  soc: number;
  capacityKWh: number;
  /** Energy use, kWh/km. */
  consumption: number;
  /** Energy the rest of the mission needs, kWh. */
  missionEnergy: number;
  /** Reserve kept at all times, fraction of capacity. */
  reserve: number;
  /** Value of time, currency per minute (for the trade-off). */
  timeValue: number;
  averageSpeedKmh: number;
}

export interface StationScore {
  station: CandidateStation;
  feasible: boolean;
  reason: string;
  /** Energy to charge so the mission finishes with the reserve, kWh. */
  chargeKWh: number;
  minutes: { drive: number; wait: number; charge: number; total: number };
  cost: number;
  /** Generalised cost: money plus time value. Lower is better. */
  score: number;
}

/** Ranks candidate stations: deterministic, explainable, and every infeasible option says why. */
export function rankStations(inp: SelectionInputs, candidates: readonly CandidateStation[] = DEFAULT_CANDIDATES): StationScore[] {
  const energyNow = inp.soc * inp.capacityKWh;
  const reserve = inp.reserve * inp.capacityKWh;
  return candidates
    .map((st) => {
      const toStation = st.distanceKm * inp.consumption;
      const detour = st.detourKm * inp.consumption;
      const arrive = energyNow - toStation;
      const need = Math.max(0, inp.missionEnergy + detour + reserve - arrive);
      const chargeKWh = Math.min(need, inp.capacityKWh * 0.95 - arrive);
      const drive = (st.distanceKm / inp.averageSpeedKmh) * 60;
      const wait = st.freeBays > 0 ? 0 : st.queueMinutes;
      const charge = (chargeKWh / Math.max(0.1, st.powerKW)) * 60;
      const total = drive + wait + charge;
      const cost = chargeKWh * st.price;
      let feasible = true;
      let reason = "Reachable, compatible and able to finish the mission.";
      if (!st.compatible) {
        feasible = false;
        reason = "Pad not compatible with this vehicle's receiver.";
      } else if (arrive < reserve) {
        feasible = false;
        reason = "Arrival would breach the energy reserve.";
      } else if (chargeKWh < need - 1e-6) {
        feasible = false;
        reason = "Cannot store enough energy to finish the mission.";
      }
      return { station: st, feasible, reason, chargeKWh, minutes: { drive, wait, charge, total }, cost, score: cost + inp.timeValue * total };
    })
    .sort((a, b) => Number(b.feasible) - Number(a.feasible) || a.score - b.score);
}

/** A simulated challenge–response reservation exchange (FNV tags: illustrative, not cryptography). */
export function reservationExchange(vehicleId: string, stationId: string, nonce: number, key = "fleet-sim-key") {
  const challenge = fnv1a(`${stationId}|${nonce}`);
  const response = fnv1a(`${key}|${vehicleId}|${challenge}`);
  const expected = fnv1a(`fleet-sim-key|${vehicleId}|${challenge}`);
  return [
    { from: "Vehicle", to: "Fleet backend", type: "ReserveRequest", body: `vehicle=${vehicleId} station=${stationId}` },
    { from: "Station", to: "Vehicle", type: "Challenge", body: `nonce=${nonce} challenge=${challenge}` },
    { from: "Vehicle", to: "Station", type: "Response", body: `response=${response}` },
    { from: "Station", to: "Vehicle", type: response === expected ? "ReservationConfirmed" : "ReservationRejected", body: response === expected ? "bay assigned, hold 15 min" : "identity check failed" },
  ];
}
