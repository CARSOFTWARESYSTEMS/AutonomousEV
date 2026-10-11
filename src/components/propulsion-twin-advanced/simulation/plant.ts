// The physics model: a reduced-order, lumped pressure network of a generic
// pump-fed liquid propulsion system. Two propellant branches run from tank to
// chamber; each element is a quadratic flow resistance, each pump a head curve
// in shaft speed and flow, and the chamber a first-order volume.
//
// The same equations serve twice: once with the "as-built" parameters as the
// physical system being monitored, and once with identified parameters as the
// Digital Twin's model of it. REFERENCE MODEL: an educational network, not a
// solved transient and not correlated with any engine.
import { CH, N_CH, clamp, clamp01 } from "./channels";

export interface PlantParams {
  pTankFu: number;
  pTankOx: number;
  /** Feed-line resistance, tank to pump inlet. */
  kFeedFu: number;
  kFeedOx: number;
  /** Pump head curve: rise = head · (a·N² − b·ṁ²). */
  aFu: number;
  bFu: number;
  aOx: number;
  bOx: number;
  /** Pump head multipliers: 1 as built, lower as the pump degrades. */
  headFu: number;
  headOx: number;
  kValveFu: number;
  kValveOx: number;
  /** Main fuel valve opening actually reached, as a fraction of the commanded opening. */
  valveFu: number;
  kCool: number;
  kLineFu: number;
  kInjFu: number;
  kInjOx: number;
  /** Combustion efficiency multiplier on characteristic velocity. */
  etaC: number;
  /** Time constants, seconds: chamber fill, shaft, coolant temperature. */
  tauC: number;
  tauN: number;
  tauT: number;
}

/** Design values. Chosen so that the reference point is exactly 100 % chamber pressure at unit speed and unit flows. */
export const DESIGN: PlantParams = {
  pTankFu: 4,
  pTankOx: 5,
  kFeedFu: 0.6,
  kFeedOx: 0.8,
  aFu: 266.6,
  bFu: 40,
  aOx: 224.8,
  bOx: 34,
  headFu: 1,
  headOx: 1,
  kValveFu: 14,
  kValveOx: 73,
  valveFu: 1,
  kCool: 84,
  kLineFu: 12,
  kInjFu: 20,
  kInjOx: 22,
  etaC: 1,
  tauC: 0.08,
  tauN: 0.55,
  tauT: 1.2,
};

/** Propellant mass fractions at the reference mixture ratio. */
export const W_OX = 0.78;
export const W_FU = 0.22;
/** Vapour pressure and required suction head of the pumps, in pressure units. */
const P_VAPOUR = 1.2;
const NPSH_REQUIRED = 1.6;
/** Ambient pressure and the cold-flow pressure of an unlit chamber. */
const P_AMBIENT = 1;
/** Nozzle exit pressure as a fraction of chamber pressure, for the reference expansion ratio. */
export const EXIT_PRESSURE_RATIO = 0.012;
/** Static pressure at the throat as a fraction of chamber pressure (choked flow, γ ≈ 1.2). */
export const THROAT_PRESSURE_RATIO = 0.564;

export interface PlantState {
  speed: number;
  pc: number;
  tCool: number;
}

export interface Flows {
  mFu: number;
  mOx: number;
  /** Cavitation of each pump, 0 none – 1 full breakdown. */
  cavFu: number;
  cavOx: number;
}

export const coldState = (): PlantState => ({ speed: 0, pc: P_AMBIENT, tCool: 0 });

/** How much characteristic velocity is lost as the mixture ratio leaves its reference value (`mr` is relative: 1 at reference). */
export const cStarFactor = (mr: number) => clamp(1 - 0.6 * (mr - 1) * (mr - 1), 0.55, 1);

/** Fraction of pump head lost to cavitation when the suction head available falls below the head required. */
function cavitation(pIn: number, speed: number): number {
  if (speed < 0.05) return 0;
  const required = NPSH_REQUIRED * speed * speed;
  return clamp01((required - (pIn - P_VAPOUR)) / required);
}

const HEAD_LOSS_AT_BREAKDOWN = 0.3;

function branchFlow(pTank: number, kFeed: number, a: number, b: number, head: number, kRest: number, speed: number, pc: number): [flow: number, cav: number] {
  let cav = 0;
  let flow = 0;
  // The inlet pressure depends on the flow and the flow on the inlet pressure: a few passes settle it.
  // The cavitation returned is the one the returned flow was solved with, so the two are always consistent.
  for (let i = 0; i < 8; i++) {
    const h = head * (1 - HEAD_LOSS_AT_BREAKDOWN * cav);
    flow = Math.sqrt(Math.max(0, pTank + h * a * speed * speed - pc) / (kFeed + h * b + kRest));
    if (i < 7) cav = cavitation(pTank - kFeed * flow * flow, speed);
  }
  return [flow, cav];
}

/** Flow in each branch for a shaft speed and a chamber pressure. */
export function solveFlows(p: PlantParams, speed: number, pc: number): Flows {
  const valve = clamp(p.valveFu, 0.05, 1);
  const [mFu, cavFu] = branchFlow(p.pTankFu, p.kFeedFu, p.aFu, p.bFu, p.headFu, p.kValveFu / (valve * valve) + p.kCool + p.kLineFu + p.kInjFu, speed, pc);
  const [mOx, cavOx] = branchFlow(p.pTankOx, p.kFeedOx, p.aOx, p.bOx, p.headOx, p.kValveOx + p.kInjOx, speed, pc);
  return { mFu, mOx, cavFu, cavOx };
}

/** The chamber pressure these flows would settle at. */
export function chamberTarget(p: PlantParams, flows: Flows, ignited: boolean): number {
  const total = W_OX * flows.mOx + W_FU * flows.mFu;
  if (!ignited) return P_AMBIENT + 4 * total;
  const mr = flows.mFu > 1e-3 ? flows.mOx / flows.mFu : 1;
  return Math.max(P_AMBIENT, 100 * p.etaC * cStarFactor(mr) * total);
}

/** The coolant temperature rise these conditions would settle at: heat load grows with chamber pressure, and is shared by the fuel flow. */
const coolantTarget = (pc: number, mFu: number, ignited: boolean) => (ignited ? clamp((100 * Math.pow(Math.max(pc, 0) / 100, 0.8)) / Math.max(mFu, 0.08), 0, 400) : 0);

/** Advances the state by `dt` seconds toward the commanded shaft speed, and returns the flows of the new state. */
export function stepPlant(p: PlantParams, s: PlantState, speedCommand: number, ignited: boolean, dt: number): Flows {
  s.speed += ((speedCommand - s.speed) * dt) / p.tauN;
  const flows = solveFlows(p, s.speed, s.pc);
  s.pc += ((chamberTarget(p, flows, ignited) - s.pc) * Math.min(1, dt / p.tauC));
  s.tCool += ((coolantTarget(s.pc, flows.mFu, ignited) - s.tCool) * dt) / p.tauT;
  return solveFlows(p, s.speed, s.pc);
}

/** Writes the value of every channel for a state into `out`. */
export function writeOutputs(p: PlantParams, s: PlantState, f: Flows, out: Float64Array | number[]): void {
  const n2 = s.speed * s.speed;
  const fu2 = f.mFu * f.mFu;
  const ox2 = f.mOx * f.mOx;
  const valve = clamp(p.valveFu, 0.05, 1);
  const pInFu = p.pTankFu - p.kFeedFu * fu2;
  const pInOx = p.pTankOx - p.kFeedOx * ox2;
  const pOutFu = pInFu + p.headFu * (1 - HEAD_LOSS_AT_BREAKDOWN * f.cavFu) * (p.aFu * n2 - p.bFu * fu2);
  const pOutOx = pInOx + p.headOx * (1 - HEAD_LOSS_AT_BREAKDOWN * f.cavOx) * (p.aOx * n2 - p.bOx * ox2);
  const pCoolIn = pOutFu - (p.kValveFu / (valve * valve)) * fu2;
  const pCoolOut = pCoolIn - p.kCool * fu2;
  // The hot-gas circuit sits between pump discharge and the chamber: the turbine drops what the pumps need.
  const pTo = s.pc + 10 * n2;
  const pTi = pTo * (1 + 0.5 * n2);
  out[CH.pTankFu] = p.pTankFu;
  out[CH.pTankOx] = p.pTankOx;
  out[CH.pInFu] = pInFu;
  out[CH.pInOx] = pInOx;
  out[CH.pOutFu] = pOutFu;
  out[CH.pOutOx] = pOutOx;
  out[CH.pCoolIn] = pCoolIn;
  out[CH.pCoolOut] = pCoolOut;
  out[CH.pInjFu] = pCoolOut - p.kLineFu * fu2;
  out[CH.pInjOx] = pOutOx - p.kValveOx * ox2;
  out[CH.pcA] = s.pc;
  out[CH.pcB] = s.pc;
  out[CH.pPb] = pTi + 3 * n2;
  out[CH.pTi] = pTi;
  out[CH.pTo] = pTo;
  out[CH.mFu] = 100 * f.mFu;
  out[CH.mOx] = 100 * f.mOx;
  out[CH.speed] = 100 * s.speed;
  out[CH.valvePos] = 100 * valve;
  out[CH.tCool] = s.tCool;
  out[CH.vib] = 100 * n2 * (1 + 2.2 * Math.max(f.cavFu, f.cavOx));
  out[CH.thrust] = Math.max(0, s.pc - P_AMBIENT) * (100 / (100 - P_AMBIENT));
}

export interface SteadyPoint {
  state: PlantState;
  flows: Flows;
  values: number[];
}

/** The operating point the system settles at for a shaft speed. */
export function steadyState(p: PlantParams, speed: number, ignited = true): SteadyPoint {
  const s: PlantState = { speed, pc: 100 * speed, tCool: 0 };
  let flows = solveFlows(p, speed, s.pc);
  for (let i = 0; i < 80; i++) {
    const next = s.pc + 0.6 * (chamberTarget(p, flows, ignited) - s.pc);
    const moved = Math.abs(next - s.pc);
    s.pc = next;
    flows = solveFlows(p, speed, s.pc);
    if (moved < 1e-7) break;
  }
  s.tCool = coolantTarget(s.pc, flows.mFu, ignited);
  const values = new Array<number>(N_CH).fill(0);
  writeOutputs(p, s, flows, values);
  return { state: s, flows, values };
}

// ── Controller schedule ─────────────────────────────────────────────────────
// The reference controller is open loop: it schedules shaft speed from the
// throttle command using the design model, and does not trim on chamber
// pressure. A fault therefore stays visible in pressure instead of being
// absorbed into actuator effort.

const SCHEDULE_STEPS = 44;
let schedule: number[] | null = null;

function buildSchedule(): number[] {
  const table: number[] = [];
  for (let i = 0; i <= SCHEDULE_STEPS; i++) {
    const target = (100 * 1.1 * i) / SCHEDULE_STEPS;
    let lo = 0;
    let hi = 1.4;
    for (let k = 0; k < 36; k++) {
      const mid = (lo + hi) / 2;
      if (steadyState(DESIGN, mid).state.pc < target) lo = mid;
      else hi = mid;
    }
    table.push(target <= P_AMBIENT ? 0 : (lo + hi) / 2);
  }
  return table;
}

/** Shaft speed the controller commands for a throttle setting (1 = reference chamber pressure). */
export function scheduleSpeed(throttle: number): number {
  schedule ??= buildSchedule();
  const x = (clamp(throttle, 0, 1.1) / 1.1) * SCHEDULE_STEPS;
  const i = Math.min(SCHEDULE_STEPS - 1, Math.floor(x));
  return schedule[i] + (schedule[i + 1] - schedule[i]) * (x - i);
}
