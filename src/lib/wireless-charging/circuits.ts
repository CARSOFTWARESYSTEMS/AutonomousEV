// Resonant compensation networks (WPT-CIR-001…003).
//
// Two independent formulations, so each can check the other:
//   1. Closed-form series–series (SS) phasor solution, used by the running
//      simulation because it is fast: forward (given the inverter's
//      fundamental voltage) and inverse (given the power wanted at the load).
//   2. A small complex modified nodal analysis (MNA) solver — the same kind of
//      small-signal AC analysis a SPICE ".ac" run performs — with netlists for
//      SS, SP, PS, PP, LCC–S and LCC–LCC, used by the Circuit Laboratory.
// Both use the first-harmonic approximation (FHA): the inverter is its
// fundamental voltage, and the rectifier with its battery is an equivalent
// resistance R_L = (8/π²)·V_dc/I_dc. Switching transients, dead time and
// harmonics are not modelled. All phasors are RMS.
import { type Complex, cabs, cadd, carg, cdiv, cmul, cscale, csub, cx, realPower, solveComplex } from "./math";

export interface CoupledCoils {
  L1: number;
  L2: number;
  M: number;
  /** Total series resistance of each side: winding AC resistance, capacitor ESR and lumped core/shield loss, Ω. */
  R1: number;
  R2: number;
}

/** Full-bridge fundamental: V1 = (2√2/π)·Vdc·sin(α/2), α the phase-shift conduction angle. */
export const bridgeFundamental = (vdc: number, alpha: number) => ((2 * Math.SQRT2) / Math.PI) * vdc * Math.sin(alpha / 2);
/** The conduction angle that gives fundamental V1 from Vdc, or NaN if V1 exceeds what Vdc can give. */
export function bridgeAngle(vdc: number, v1: number): number {
  const s = (v1 * Math.PI) / (2 * Math.SQRT2 * Math.max(vdc, 1e-9));
  return s > 1 + 1e-12 ? Number.NaN : 2 * Math.asin(Math.min(1, s));
}
/** FHA equivalent AC resistance of a full-bridge diode rectifier feeding a DC voltage Vdc at current Idc. */
export const rectifierEquivalent = (vdc: number, idc: number) => (8 / (Math.PI * Math.PI)) * (vdc / Math.max(idc, 1e-12));
/** Series resonant capacitance for inductance L at frequency f. */
export const resonantCapacitance = (L: number, f: number) => 1 / ((2 * Math.PI * f) ** 2 * L);
export const resonantFrequency = (L: number, C: number) => 1 / (2 * Math.PI * Math.sqrt(L * C));
/** Quality factor of an inductor with series resistance R at frequency f. */
export const qualityFactor = (L: number, R: number, f: number) => (2 * Math.PI * f * L) / R;

export interface SSOperatingPoint {
  frequency: number;
  /** Inverter fundamental voltage phasor (reference for the forward solution), V. */
  v1: Complex;
  i1: Complex;
  i2: Complex;
  /** Voltage across the equivalent load, V. */
  v2: Complex;
  zIn: Complex;
  /** Phase of the input impedance, rad: positive is inductive (zero-voltage switching possible). */
  phaseIn: number;
  /** Impedance reflected into the primary by the secondary, Ω. */
  zReflected: Complex;
  pIn: number;
  pLoad: number;
  pR1: number;
  pR2: number;
  /** Coil-to-coil efficiency, pLoad / pIn. */
  efficiency: number;
  /** Capacitor voltage stress, V RMS. */
  vC1: number;
  vC2: number;
  /** Open-circuit voltage induced in the receiver, ωM|I1|, V RMS. */
  vOc: number;
}

function ssImpedances(coils: CoupledCoils, C1: number, C2: number, f: number) {
  const w = 2 * Math.PI * f;
  const z1 = cx(coils.R1, w * coils.L1 - 1 / (w * C1));
  const z2 = cx(coils.R2, w * coils.L2 - 1 / (w * C2));
  return { w, z1, z2, jwm: cx(0, w * coils.M) };
}

function ssPoint(coils: CoupledCoils, C1: number, C2: number, f: number, RL: number, v1: Complex, i1: Complex, i2: Complex): SSOperatingPoint {
  const { w, z1, z2, jwm } = ssImpedances(coils, C1, C2, f);
  const z2t = cadd(z2, cx(RL));
  const zIn = cabs(i1) > 1e-15 ? cdiv(v1, i1) : z1;
  const pLoad = cabs(i2) ** 2 * RL;
  const pR1 = cabs(i1) ** 2 * coils.R1;
  const pR2 = cabs(i2) ** 2 * coils.R2;
  const pIn = realPower(v1, i1);
  return {
    frequency: f,
    v1,
    i1,
    i2,
    v2: cscale(i2, RL),
    zIn,
    phaseIn: carg(zIn),
    zReflected: cdiv(cx(cabs(jwm) ** 2), z2t),
    pIn,
    pLoad,
    pR1,
    pR2,
    efficiency: pIn > 1e-12 ? pLoad / pIn : 0,
    vC1: cabs(i1) / (w * C1),
    vC2: cabs(i2) / (w * C2),
    vOc: w * coils.M * cabs(i1),
  };
}

/**
 * SS network driven by inverter fundamental v1 (real, V RMS) into equivalent
 * load RL. Mesh equations: v1 = Z1·I1 + jωM·I2, 0 = jωM·I1 + (Z2 + RL)·I2.
 */
export function ssForward(coils: CoupledCoils, C1: number, C2: number, f: number, RL: number, v1: number): SSOperatingPoint {
  const { z1, z2, jwm } = ssImpedances(coils, C1, C2, f);
  const z2t = cadd(z2, cx(RL));
  const det = csub(cmul(z1, z2t), cmul(jwm, jwm));
  const V = cx(v1);
  const i1 = cdiv(cmul(V, z2t), det);
  const i2 = cscale(cdiv(cmul(jwm, i1), z2t), -1);
  return ssPoint(coils, C1, C2, f, RL, V, i1, i2);
}

/**
 * The operating point that delivers pLoad (W) into RL, with I2 as the phase
 * reference. Returns null when there is no coupling (no power can be
 * delivered inductively, whatever the inverter does).
 */
export function ssForLoadPower(coils: CoupledCoils, C1: number, C2: number, f: number, RL: number, pLoad: number): SSOperatingPoint | null {
  if (coils.M <= 0 || pLoad < 0) return null;
  const { z1, z2, jwm } = ssImpedances(coils, C1, C2, f);
  const z2t = cadd(z2, cx(RL));
  const i2 = cx(Math.sqrt(pLoad / RL));
  // From the secondary mesh: I1 = −(Z2 + RL)·I2 / (jωM).
  const i1 = cscale(cdiv(cmul(z2t, i2), jwm), -1);
  const v1 = cadd(cmul(z1, i1), cmul(jwm, i2));
  return ssPoint(coils, C1, C2, f, RL, v1, i1, i2);
}

/** Load resistance that maximises SS coil-to-coil efficiency at resonance: √(R2² + (ωM)²·R2/R1). */
export const optimalLoad = (coils: CoupledCoils, f: number) => {
  const w = 2 * Math.PI * f;
  return Math.sqrt(coils.R2 * coils.R2 + (w * coils.M) ** 2 * (coils.R2 / coils.R1));
};

/** Closed-form SS efficiency at resonance: η = RL(ωM)² / [(R2+RL)((R2+RL)R1 + (ωM)²)]. */
export function ssEfficiencyAtResonance(coils: CoupledCoils, f: number, RL: number): number {
  const wm2 = (2 * Math.PI * f * coils.M) ** 2;
  return (RL * wm2) / ((coils.R2 + RL) * ((coils.R2 + RL) * coils.R1 + wm2));
}

// ── Modified nodal analysis ────────────────────────────────────────────────

export type Element =
  | { kind: "R"; id: string; a: number; b: number; value: number }
  | { kind: "C"; id: string; a: number; b: number; value: number }
  | { kind: "L"; id: string; a: number; b: number; value: number }
  | { kind: "K"; id: string; l1: string; l2: string; value: number }
  | { kind: "V"; id: string; a: number; b: number; value: number }
  | { kind: "I"; id: string; a: number; b: number; value: number };

export interface Netlist {
  /** Highest node number; node 0 is ground. */
  nodes: number;
  elements: Element[];
}

export interface AcSolution {
  frequency: number;
  voltages: Complex[];
  /** Branch current of every element by id, A RMS (from a to b). */
  currents: Record<string, Complex>;
  /** Real power dissipated in every resistor by id, W. */
  dissipation: Record<string, number>;
}

/** AC analysis at one frequency. Inductors and voltage sources carry branch-current unknowns; K couples two inductors with mutual inductance M. */
export function solveAc(net: Netlist, f: number): AcSolution {
  const w = 2 * Math.PI * f;
  const branches = net.elements.filter((e) => e.kind === "L" || e.kind === "V");
  const n = net.nodes + branches.length;
  const A: Complex[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => cx(0)));
  const rhs: Complex[] = Array.from({ length: n }, () => cx(0));
  const idx = (node: number) => node - 1;
  const add = (r: number, c: number, v: Complex) => {
    if (r < 0 || c < 0) return;
    A[r][c] = cadd(A[r][c], v);
  };
  const stampY = (a: number, b: number, y: Complex) => {
    add(idx(a), idx(a), y);
    add(idx(b), idx(b), y);
    add(idx(a), idx(b), cscale(y, -1));
    add(idx(b), idx(a), cscale(y, -1));
  };
  const branchRow = new Map<string, number>();
  branches.forEach((e, i) => branchRow.set(e.id, net.nodes + i));
  for (const e of net.elements) {
    if (e.kind === "R") stampY(e.a, e.b, cx(1 / e.value));
    else if (e.kind === "C") stampY(e.a, e.b, cx(0, w * e.value));
    else if (e.kind === "I") {
      if (e.a > 0) rhs[idx(e.a)] = csub(rhs[idx(e.a)], cx(e.value));
      if (e.b > 0) rhs[idx(e.b)] = cadd(rhs[idx(e.b)], cx(e.value));
    } else if (e.kind === "L" || e.kind === "V") {
      const k = branchRow.get(e.id)!;
      add(idx(e.a), k, cx(1));
      add(idx(e.b), k, cx(-1));
      add(k, idx(e.a), cx(1));
      add(k, idx(e.b), cx(-1));
      if (e.kind === "L") add(k, k, cx(0, -w * e.value));
      else rhs[k] = cx(e.value);
    }
  }
  for (const e of net.elements) {
    if (e.kind !== "K") continue;
    const k1 = branchRow.get(e.l1);
    const k2 = branchRow.get(e.l2);
    if (k1 === undefined || k2 === undefined) throw new Error(`Coupling ${e.id} names an unknown inductor.`);
    add(k1, k2, cx(0, -w * e.value));
    add(k2, k1, cx(0, -w * e.value));
  }
  const x = solveComplex(A, rhs);
  const voltages = [cx(0), ...x.slice(0, net.nodes)];
  const currents: Record<string, Complex> = {};
  const dissipation: Record<string, number> = {};
  for (const e of net.elements) {
    if (e.kind === "K") continue;
    if (e.kind === "L" || e.kind === "V") {
      // MNA branch current flows from a, through the element, to b; for a source that is into its + terminal, so flip it.
      const i = x[branchRow.get(e.id)!];
      currents[e.id] = e.kind === "V" ? cscale(i, -1) : i;
      continue;
    }
    if (e.kind === "I") {
      currents[e.id] = cx(e.value);
      continue;
    }
    const v = csub(voltages[e.a], voltages[e.b]);
    const y = e.kind === "R" ? cx(1 / e.value) : cx(0, w * e.value);
    currents[e.id] = cmul(v, y);
    if (e.kind === "R") dissipation[e.id] = cabs(v) ** 2 / e.value;
  }
  return { frequency: f, voltages, currents, dissipation };
}

// ── Compensation topologies ────────────────────────────────────────────────

export type Topology = "SS" | "SP" | "PS" | "PP" | "LCC-S" | "LCC-LCC";

export const TOPOLOGIES: readonly { id: Topology; name: string; source: "voltage" | "current"; note: string }[] = [
  { id: "SS", name: "Series–Series", source: "voltage", note: "Primary capacitance independent of coupling and load; behaves as a voltage-to-current converter at resonance. Primary current rises sharply if the receiver is removed." },
  { id: "SP", name: "Series–Parallel", source: "voltage", note: "Parallel secondary gives a current-source-like output; the primary capacitance depends on coupling (L1 − M²/L2)." },
  { id: "PS", name: "Parallel–Series", source: "current", note: "Parallel primary needs a current-fed inverter; primary capacitance depends on coupling and load." },
  { id: "PP", name: "Parallel–Parallel", source: "current", note: "Both sides parallel; current-fed inverter; primary tuning depends on coupling and load." },
  { id: "LCC-S", name: "LCC–Series", source: "voltage", note: "The LCC network makes the transmitter current independent of the load, set by the input voltage and Lf." },
  { id: "LCC-LCC", name: "LCC–LCC", source: "voltage", note: "Double-sided LCC: load-independent coil currents and ZVS-friendly tuning; more components." },
];

export interface CompensationDesign {
  topology: Topology;
  C1: number;
  C2: number;
  /** LCC series inductors and parallel capacitors, where used. */
  Lf1?: number;
  Cf1?: number;
  Lf2?: number;
  Cf2?: number;
}

/**
 * Compensation values tuned at f0. Secondary first (series or parallel to
 * resonate L2, or LCC), then the primary capacitance that makes the network
 * resistive at nominal load RL — closed form for each side, so coupling- and
 * load-dependent topologies are handled the same way.
 */
export function designCompensation(topology: Topology, coils: CoupledCoils, f0: number, RL: number, lccRatio = 0.25): CompensationDesign {
  const w = 2 * Math.PI * f0;
  const design: CompensationDesign = { topology, C1: 0, C2: resonantCapacitance(coils.L2, f0) };
  // Impedance of the secondary as seen by its coil's induced EMF.
  let z2: Complex;
  if (topology === "LCC-LCC") {
    design.Lf2 = lccRatio * coils.L2;
    design.Cf2 = resonantCapacitance(design.Lf2, f0);
    design.C2 = resonantCapacitance(coils.L2 - design.Lf2, f0);
    const zLoadBranch = cx(RL, w * design.Lf2);
    const zCf = cx(0, -1 / (w * design.Cf2));
    const parallel = cdiv(cmul(zLoadBranch, zCf), cadd(zLoadBranch, zCf));
    z2 = cadd(cx(coils.R2, w * coils.L2 - 1 / (w * design.C2)), parallel);
  } else if (topology === "SP" || topology === "PP") {
    const zC = cx(0, -1 / (w * design.C2));
    const zR = cx(RL);
    z2 = cadd(cx(coils.R2, w * coils.L2), cdiv(cmul(zC, zR), cadd(zC, zR)));
  } else {
    z2 = cx(coils.R2 + RL, w * coils.L2 - 1 / (w * design.C2));
  }
  const zr = cdiv(cx((w * coils.M) ** 2), z2);
  const zBranch = cadd(cx(coils.R1, w * coils.L1), zr);
  if (topology === "SS" || topology === "SP") {
    design.C1 = 1 / (w * zBranch.im);
  } else if (topology === "PS" || topology === "PP") {
    const y = cdiv(cx(1), zBranch);
    design.C1 = -y.im / w;
  } else {
    design.Lf1 = lccRatio * coils.L1;
    design.Cf1 = resonantCapacitance(design.Lf1, f0);
    // Series C1 cancels the rest of the coil branch reactance, leaving it resonant with Cf1 through Lf1.
    design.C1 = 1 / (w * (zBranch.im - w * design.Lf1));
  }
  return design;
}

/** Netlist of a compensated coupler. Source on node 1; the load resistor is "RL". */
export function compensationNetlist(design: CompensationDesign, coils: CoupledCoils, RL: number, source: number): Netlist {
  const els: Element[] = [];
  const topo = design.topology;
  const current = topo === "PS" || topo === "PP";
  // Primary.
  if (current) els.push({ kind: "I", id: "SRC", a: 0, b: 1, value: source });
  else els.push({ kind: "V", id: "SRC", a: 1, b: 0, value: source });
  if (topo === "SS" || topo === "SP") {
    els.push({ kind: "C", id: "C1", a: 1, b: 2, value: design.C1 }, { kind: "R", id: "R1", a: 2, b: 3, value: coils.R1 }, { kind: "L", id: "L1", a: 3, b: 0, value: coils.L1 });
  } else if (current) {
    els.push({ kind: "C", id: "C1", a: 1, b: 0, value: design.C1 }, { kind: "R", id: "R1", a: 1, b: 3, value: coils.R1 }, { kind: "L", id: "L1", a: 3, b: 0, value: coils.L1 });
  } else {
    els.push(
      { kind: "L", id: "Lf1", a: 1, b: 2, value: design.Lf1! },
      { kind: "C", id: "Cf1", a: 2, b: 0, value: design.Cf1! },
      { kind: "C", id: "C1", a: 2, b: 9, value: design.C1 },
      { kind: "R", id: "R1", a: 9, b: 3, value: coils.R1 },
      { kind: "L", id: "L1", a: 3, b: 0, value: coils.L1 },
    );
  }
  // Secondary.
  els.push({ kind: "L", id: "L2", a: 4, b: 0, value: coils.L2 }, { kind: "R", id: "R2", a: 4, b: 5, value: coils.R2 });
  if (topo === "SS" || topo === "PS" || topo === "LCC-S") {
    els.push({ kind: "C", id: "C2", a: 5, b: 6, value: design.C2 }, { kind: "R", id: "RL", a: 6, b: 0, value: RL });
  } else if (topo === "SP" || topo === "PP") {
    els.push({ kind: "C", id: "C2", a: 5, b: 0, value: design.C2 }, { kind: "R", id: "RL", a: 5, b: 0, value: RL });
  } else {
    els.push(
      { kind: "C", id: "C2", a: 5, b: 6, value: design.C2 },
      { kind: "C", id: "Cf2", a: 6, b: 0, value: design.Cf2! },
      { kind: "L", id: "Lf2", a: 6, b: 7, value: design.Lf2! },
      { kind: "R", id: "RL", a: 7, b: 0, value: RL },
    );
  }
  els.push({ kind: "K", id: "K12", l1: "L1", l2: "L2", value: coils.M });
  return { nodes: 9, elements: els };
}

export interface NetworkResponse {
  frequency: number;
  zIn: Complex;
  phaseIn: number;
  i1: number;
  i2: number;
  pIn: number;
  pLoad: number;
  efficiency: number;
}

/** Input impedance, coil currents, powers and efficiency of a compensated coupler at one frequency, for a 1 V (or 1 A) source scaled to `source`. */
export function networkResponse(design: CompensationDesign, coils: CoupledCoils, RL: number, f: number, source = 1): NetworkResponse {
  const net = compensationNetlist(design, coils, RL, source);
  // Netlists share one node numbering; tie nodes a topology does not use to ground so the matrix is not singular.
  for (let node = 1; node <= net.nodes; node++) {
    const used = net.elements.some((e) => e.kind !== "K" && (e.a === node || e.b === node));
    if (!used) net.elements.push({ kind: "R", id: `TIE${node}`, a: node, b: 0, value: 1 });
  }
  const sol = solveAc(net, f);
  const current = design.topology === "PS" || design.topology === "PP";
  const vSrc = sol.voltages[1];
  const iSrc = current ? cx(source) : sol.currents.SRC;
  const pIn = realPower(vSrc, iSrc);
  const pLoad = sol.dissipation.RL ?? 0;
  const zIn = cdiv(vSrc, iSrc);
  return {
    frequency: f,
    zIn,
    phaseIn: carg(zIn),
    i1: cabs(sol.currents.L1),
    i2: cabs(sol.currents.L2),
    pIn,
    pLoad,
    efficiency: pIn > 0 ? pLoad / pIn : 0,
  };
}

/** Frequency response over [f0·(1−span), f0·(1+span)]. */
export function frequencySweep(design: CompensationDesign, coils: CoupledCoils, RL: number, f0: number, span = 0.2, points = 161, source = 1): NetworkResponse[] {
  if (points < 2 || span === 0) return [networkResponse(design, coils, RL, f0, source)];
  return Array.from({ length: points }, (_, i) => networkResponse(design, coils, RL, f0 * (1 - span + (2 * span * i) / (points - 1)), source));
}

/**
 * Critical coupling above which an SS link's input power splits into two
 * peaks either side of f0 (frequency splitting), from the bifurcation
 * condition for identical resonators: k_c ≈ 1/Q2 · √(1 − 1/(4Q2²)) with
 * Q2 = ω0·L2 / (R2 + RL), the loaded secondary quality factor.
 */
export function splittingCoupling(coils: CoupledCoils, f0: number, RL: number): number {
  const q2 = (2 * Math.PI * f0 * coils.L2) / (coils.R2 + RL);
  return (1 / q2) * Math.sqrt(Math.max(0, 1 - 1 / (4 * q2 * q2)));
}

/**
 * One electrical period of FHA waveforms for display. A phasor X = |X|∠φ
 * (RMS) is the signal √2|X|·cos(ωt + φ). The inverter output is the
 * quasi-square wave (±Vdc for α of each half cycle) whose fundamental is v1;
 * the rectifier input is a square wave of ±Vdc2 in phase with i2.
 */
export function fhaWaveforms(op: SSOperatingPoint, vdc1: number, alpha: number, vdc2: number, samples = 200) {
  const t: number[] = [];
  const v1: number[] = [];
  const i1: number[] = [];
  const i2: number[] = [];
  const v2: number[] = [];
  const pv = carg(op.v1);
  const p1 = carg(op.i1);
  const p2 = carg(op.i2);
  const a1 = Math.SQRT2 * cabs(op.i1);
  const a2 = Math.SQRT2 * cabs(op.i2);
  const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
  for (let s = 0; s < samples; s++) {
    const th = (2 * Math.PI * s) / samples;
    t.push(s / samples / op.frequency);
    const u = wrap(th + pv);
    v1.push(Math.abs(u) < alpha / 2 ? vdc1 : Math.abs(wrap(u - Math.PI)) < alpha / 2 ? -vdc1 : 0);
    i1.push(a1 * Math.cos(th + p1));
    i2.push(a2 * Math.cos(th + p2));
    v2.push(Math.cos(th + p2) >= 0 ? vdc2 : -vdc2);
  }
  return { t, v1, i1, i2, v2 };
}
