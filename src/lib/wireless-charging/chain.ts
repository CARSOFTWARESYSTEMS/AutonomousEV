// The end-to-end stationary power chain (WPT-SYS-001):
//
//   Grid → protection & transformer → AC–DC with PFC → DC link →
//   high-frequency inverter → primary compensation → transmitter coil ⇢
//   magnetic coupling ⇢ receiver coil → secondary compensation → rectifier →
//   vehicle DC–DC → battery terminals.
//
// A quasi-static averaged model: for a commanded battery power the chain is
// solved backwards stage by stage, so every stage's input, output and loss is
// known and the books balance exactly (grid power = battery power + Σ losses).
// The vehicle side sets the rectifier's DC voltage so the coil link runs near
// its maximum-efficiency load; the ground side sets the inverter's conduction
// angle to deliver the power. Limits (DC-link headroom, coil current,
// capacitor voltage, grid capacity) make a request infeasible; the largest
// feasible power is then found by bisection.
import { type CoupledCoils, type SSOperatingPoint, bridgeAngle, bridgeFundamental, optimalLoad, ssForLoadPower, ssForward } from "./circuits";
import { capacitorEsr, type ConverterLossModel, converterInput, converterLoss, DEFAULT_INVERTER, type InverterLoss, inverterLoss, type InverterParams, rectifierLoss, windingResistance, type WindingResistance } from "./losses";
import type { PadGeometry } from "./coils";
import { bisectMax, cabs, clamp } from "./math";

export interface ChainParams {
  /** Ground DC-link voltage, V. */
  vdcLink: number;
  /** Vehicle DC bus (rectifier output) operating range, V. */
  vdc2Min: number;
  vdc2Max: number;
  transformer: ConverterLossModel;
  pfc: ConverterLossModel;
  inverter: InverterParams;
  rectifier: { vf: number; rf: number };
  dcdc: ConverterLossModel;
  /** Litz AC-resistance factor of each winding (empirical). */
  acFactorTx: number;
  acFactorRx: number;
  /** Loss tangent of the resonant capacitors. */
  capTanDelta: number;
  /** Lumped ferrite and shield loss as a series resistance per side, Ω (empirical). */
  coreResistanceTx: number;
  coreResistanceRx: number;
  /** Ratings. */
  i1Max: number;
  i2Max: number;
  vCapMax: number;
}

export const DEFAULT_CHAIN: ChainParams = {
  vdcLink: 650,
  vdc2Min: 280,
  vdc2Max: 750,
  transformer: { p0: 18, a: 0.002, b: 2.5e-7 },
  pfc: { p0: 25, a: 0.014, b: 1.2e-7 },
  inverter: DEFAULT_INVERTER,
  rectifier: { vf: 1.35, rf: 0.02 },
  dcdc: { p0: 14, a: 0.007, b: 1.1e-7 },
  acFactorTx: 1.9,
  acFactorRx: 1.9,
  capTanDelta: 2e-4,
  coreResistanceTx: 0.09,
  coreResistanceRx: 0.08,
  i1Max: 60,
  i2Max: 60,
  vCapMax: 3500,
};

export interface ChainSetup {
  tx: PadGeometry;
  rx: PadGeometry;
  L1: number;
  L2: number;
  M: number;
  C1: number;
  C2: number;
  frequency: number;
  txTemperature: number;
  rxTemperature: number;
  inverterTemperature: number;
  /** Largest power the grid connection may supply, W. */
  gridLimit: number;
}

export type ChainLimit = "request" | "grid" | "inverter-voltage" | "coil-current" | "capacitor-voltage" | "no-coupling";

export interface ChainLosses {
  transformer: number;
  pfc: number;
  inverter: number;
  txCopper: number;
  txCapacitor: number;
  txCore: number;
  rxCopper: number;
  rxCapacitor: number;
  rxCore: number;
  rectifier: number;
  dcdc: number;
}

export interface ChainPoint {
  pBattery: number;
  pDcdcIn: number;
  pRectifierIn: number;
  pCoilIn: number;
  pInverterIn: number;
  pPfcIn: number;
  pGrid: number;
  losses: ChainLosses;
  totalLoss: number;
  /** Battery power / grid power. */
  efficiency: number;
  /** Coil-to-coil efficiency (rectifier input / inverter output). */
  linkEfficiency: number;
  ss: SSOperatingPoint | null;
  inverterLoss: InverterLoss | null;
  /** Inverter conduction angle, rad. */
  alpha: number;
  /** Equivalent AC load and rectifier output voltage. */
  rl: number;
  vdc2: number;
  coils: CoupledCoils;
  windings: { tx: WindingResistance; rx: WindingResistance };
  limits: { vdc: boolean; i1: boolean; i2: boolean; vCap: boolean; grid: boolean };
  feasible: boolean;
}

const ZERO_LOSSES: ChainLosses = { transformer: 0, pfc: 0, inverter: 0, txCopper: 0, txCapacitor: 0, txCore: 0, rxCopper: 0, rxCapacitor: 0, rxCore: 0, rectifier: 0, dcdc: 0 };

/** Series resistances of each side at the operating temperature and frequency. */
export function sideResistances(params: ChainParams, setup: ChainSetup) {
  const tx = windingResistance(setup.tx, setup.frequency, setup.txTemperature, params.acFactorTx);
  const rx = windingResistance(setup.rx, setup.frequency, setup.rxTemperature, params.acFactorRx);
  const esr1 = capacitorEsr(params.capTanDelta, setup.C1, setup.frequency);
  const esr2 = capacitorEsr(params.capTanDelta, setup.C2, setup.frequency);
  const coils: CoupledCoils = {
    L1: setup.L1,
    L2: setup.L2,
    M: setup.M,
    R1: tx.rac + esr1 + params.coreResistanceTx,
    R2: rx.rac + esr2 + params.coreResistanceRx,
  };
  return { tx, rx, esr1, esr2, coils };
}

/** The chain at a battery-terminal power pBattery (W), whether or not it is within limits. */
export function solveChain(params: ChainParams, setup: ChainSetup, pBattery: number): ChainPoint {
  const { tx, rx, esr1, esr2, coils } = sideResistances(params, setup);
  const windings = { tx, rx };
  const idle: ChainPoint = {
    pBattery: 0,
    pDcdcIn: 0,
    pRectifierIn: 0,
    pCoilIn: 0,
    pInverterIn: 0,
    pPfcIn: 0,
    pGrid: 0,
    losses: { ...ZERO_LOSSES },
    totalLoss: 0,
    efficiency: 0,
    linkEfficiency: 0,
    ss: null,
    inverterLoss: null,
    alpha: 0,
    rl: 0,
    vdc2: 0,
    coils,
    windings,
    limits: { vdc: true, i1: true, i2: true, vCap: true, grid: true },
    feasible: true,
  };
  if (pBattery <= 0) return idle;
  if (coils.M <= 0) return { ...idle, feasible: false };

  const pDcdcIn = converterInput(params.dcdc, pBattery);
  const rlOpt = optimalLoad(coils, setup.frequency);
  const vdc2 = clamp(Math.sqrt((Math.PI * Math.PI * rlOpt * pDcdcIn) / 8), params.vdc2Min, params.vdc2Max);
  const idc2 = pDcdcIn / vdc2;
  const i2rms = (Math.PI * idc2) / (2 * Math.SQRT2);
  const pRect = rectifierLoss(params.rectifier.vf, params.rectifier.rf, idc2, i2rms);
  const pRectifierIn = pDcdcIn + pRect;
  const rl = pRectifierIn / (i2rms * i2rms);
  const ss = ssForLoadPower(coils, setup.C1, setup.C2, setup.frequency, rl, pRectifierIn);
  if (!ss) return { ...idle, feasible: false };

  const v1 = cabs(ss.v1);
  const alpha = bridgeAngle(params.vdcLink, v1);
  const inv = inverterLoss(params.inverter, params.vdcLink, cabs(ss.i1), ss.phaseIn, setup.frequency, setup.inverterTemperature + 15);
  const pInverterIn = ss.pIn + inv.total;
  const pPfcIn = converterInput(params.pfc, pInverterIn);
  const pGrid = converterInput(params.transformer, pPfcIn);
  const i1 = cabs(ss.i1);
  const i2 = cabs(ss.i2);
  const losses: ChainLosses = {
    transformer: converterLoss(params.transformer, pPfcIn),
    pfc: converterLoss(params.pfc, pInverterIn),
    inverter: inv.total,
    txCopper: i1 * i1 * tx.rac,
    txCapacitor: i1 * i1 * esr1,
    txCore: i1 * i1 * params.coreResistanceTx,
    rxCopper: i2 * i2 * rx.rac,
    rxCapacitor: i2 * i2 * esr2,
    rxCore: i2 * i2 * params.coreResistanceRx,
    rectifier: pRect,
    dcdc: pDcdcIn - pBattery,
  };
  const totalLoss = Object.values(losses).reduce((s, v) => s + v, 0);
  const limits = {
    vdc: Number.isFinite(alpha),
    i1: i1 <= params.i1Max,
    i2: i2 <= params.i2Max,
    vCap: ss.vC1 <= params.vCapMax && ss.vC2 <= params.vCapMax,
    grid: pGrid <= setup.gridLimit,
  };
  return {
    pBattery,
    pDcdcIn,
    pRectifierIn,
    pCoilIn: ss.pIn,
    pInverterIn,
    pPfcIn,
    pGrid,
    losses,
    totalLoss,
    efficiency: pBattery / pGrid,
    linkEfficiency: pRectifierIn / ss.pIn,
    ss,
    inverterLoss: inv,
    alpha: Number.isFinite(alpha) ? alpha : Math.PI,
    rl,
    vdc2,
    coils,
    windings,
    limits,
    feasible: limits.vdc && limits.i1 && limits.i2 && limits.vCap && limits.grid,
  };
}

/** The binding limit of an infeasible point, in priority order. */
export function bindingLimit(point: ChainPoint): ChainLimit {
  if (point.coils.M <= 0) return "no-coupling";
  if (!point.limits.grid) return "grid";
  if (!point.limits.vdc) return "inverter-voltage";
  if (!point.limits.i1 || !point.limits.i2) return "coil-current";
  if (!point.limits.vCap) return "capacitor-voltage";
  return "request";
}

/** The largest feasible battery power up to `request`, and what limits it. */
export function maxFeasible(params: ChainParams, setup: ChainSetup, request: number): { power: number; limitedBy: ChainLimit } {
  if (request <= 0) return { power: 0, limitedBy: "request" };
  if (setup.M <= 0) return { power: 0, limitedBy: "no-coupling" };
  const atRequest = solveChain(params, setup, request);
  if (atRequest.feasible) return { power: request, limitedBy: "request" };
  const power = bisectMax(0, request, (p) => solveChain(params, setup, p).feasible, 36);
  return { power, limitedBy: bindingLimit(atRequest) };
}

/**
 * Coil currents just after a sudden change of coupling, before the ground
 * controller has moved the inverter's conduction angle (it is still `alpha`).
 * The receiver's load resistance is the vehicle's last value. Used by the
 * protection check: in a series–series link a fall in coupling raises the
 * receiver current at fixed inverter voltage.
 */
export function transientCurrents(params: ChainParams, setup: ChainSetup, alpha: number, rl: number): { i1: number; i2: number } {
  if (alpha <= 0 || rl <= 0) return { i1: 0, i2: 0 };
  const { coils } = sideResistances(params, setup);
  const op = ssForward(coils, setup.C1, setup.C2, setup.frequency, rl, bridgeFundamental(params.vdcLink, alpha));
  return { i1: cabs(op.i1), i2: cabs(op.i2) };
}
