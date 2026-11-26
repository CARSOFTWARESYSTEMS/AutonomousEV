// Dynamic road magnetic field (WPT-EM-005).
//
// The flux density around a vehicle driving over the electrified road, from
// the same circular-filament model with ferrite images that gives the road's
// coupling table (WPT-EM-001) and the station's field section (WPT-EM-002),
// superposed over every energised segment and the receiver:
//
//   B(r) = Σ_j I_j · b_tx(r − r_j) + I_2 · b_rx(r − r_rx)      (RMS phasors)
//
// where b is the per-ampere field of a winding and its images. The currents
// come from the road simulation's own state (WPT-SIM-002), with two
// assumptions that the simulation already makes implicitly and that are
// stated here because the field depends on them:
//
//  A1  Every energised segment is driven from one phase reference at the
//      regulated RMS current I₁, scaled by its energisation level (soft start
//      and stop): I_j = I₁·level_j ∠0. The simulation's induced EMF
//      V = jω Σ M_j level_j I₁ is a coherent sum, which requires this.
//  A2  The receiver is tuned to resonance, so its loop impedance is resistive
//      and I₂ = −jω M_total I₁ / (R₂ + R_L): magnitude |I₂| from the
//      simulation, lagging I₁ by 90° (the convention of circuits.ts).
//
// Failed, blocked and switched-off segments carry no current (level 0) and
// contribute nothing. Quasi-static: one 85 kHz first-harmonic phasor field at
// each instant; eddy currents in the road, rebar or vehicle floor, ferrite
// edges and saturation are not modelled. Fidelity F1 (analytical), not FEM.
//
// Coordinates (road frame): x along the road (m), y lateral (receiver centre
// at y = lateral offset, pad centres at y = 0), z up, with the road windings
// at z = 0 and the receiver winding at z = air gap.
//
// Cost: the per-ampere field of each winding is tabulated once per geometry
// on a (ρ, z) grid (a cached field basis); every evaluation afterwards is a
// bilinear lookup per active source, so the scene can update it every frame.
import { couplerPlanes, imageSeries, loopField, type PadGeometry, turnRadii } from "./coils";
import type { Complex } from "./math";
import type { RoadSim } from "./dynamic";

export const ROAD_FIELD_MODEL_VERSION = "WPT-EM-005 v1.0.0";

export interface RoadFieldConfig {
  tx: PadGeometry;
  rx: PadGeometry;
  /** Winding-to-winding air gap, m. */
  airGap: number;
}

interface Loop {
  radius: number;
  z: number;
  weight: number;
}

/** Turns of a winding and their ferrite images, as loops (turns lumped into `lumped` groups when given). */
function loopsOf(pad: PadGeometry, zs: number, config: RoadFieldConfig, lumped?: number): Loop[] {
  const planes = couplerPlanes({ tx: config.tx, rx: config.rx, airGap: config.airGap, lateral: 0, longitudinal: 0 });
  let turns = turnRadii(pad).map((r) => ({ r, n: 1 }));
  if (lumped && lumped < turns.length) {
    const per = turns.length / lumped;
    turns = Array.from({ length: lumped }, (_, g) => {
      const group = turns.slice(Math.round(g * per), Math.round((g + 1) * per));
      return { r: group.reduce((s, l) => s + l.r, 0) / group.length, n: group.length };
    });
  }
  const out: Loop[] = [];
  for (const img of imageSeries(zs, planes.zA, planes.cA, planes.zB, planes.cB, 2)) for (const t of turns) out.push({ radius: t.r, z: img.z, weight: t.n * img.strength });
  return out;
}

/** Per-ampere radial and axial field of a set of coaxial loops at (ρ, z), T/A. */
function loopsField(loops: readonly Loop[], rho: number, z: number): { br: number; bz: number } {
  let br = 0;
  let bz = 0;
  for (const l of loops) {
    const f = loopField(l.radius, rho, z - l.z);
    br += f.br * l.weight;
    bz += f.bz * l.weight;
  }
  return { br, bz };
}

export interface FieldKernel {
  config: RoadFieldConfig;
  /** Range of the tables: ρ from 0 to rhoMax, z from z0 to z1 (between the ferrite planes). */
  rhoMax: number;
  z0: number;
  z1: number;
  nr: number;
  nz: number;
  /** Per-ampere tables, row-major in z: transmitter (segment) and receiver windings, T/A. */
  txBr: Float32Array;
  txBz: Float32Array;
  rxBr: Float32Array;
  rxBz: Float32Array;
  /** Winding-layer extents (for blanking cells where lumped loops are not valid). */
  txRadii: [number, number];
  rxRadii: [number, number];
  wireRadius: number;
}

const kernels = new Map<string, FieldKernel>();
const kernelKey = (c: RoadFieldConfig) => JSON.stringify([c.tx, c.rx, +c.airGap.toFixed(5)]);

interface KernelBuild {
  kernel: FieldKernel;
  tx: Loop[];
  rx: Loop[];
  /** Next z row to compute; the kernel is ready when it reaches nz. */
  row: number;
}
const builds = new Map<string, KernelBuild>();

function startKernel(config: RoadFieldConfig, opts: { nr?: number; nz?: number; rhoMax?: number }): KernelBuild {
  const planes = couplerPlanes({ tx: config.tx, rx: config.rx, airGap: config.airGap, lateral: 0, longitudinal: 0 });
  const z0 = planes.zA + 1e-4;
  const z1 = planes.zB - 1e-4;
  const rhoMax = opts.rhoMax ?? 1.6;
  const nr = opts.nr ?? 268;
  const nz = opts.nz ?? Math.max(48, Math.ceil((z1 - z0) / 0.003) + 1);
  const n = nr * nz;
  const txR = turnRadii(config.tx);
  const rxR = turnRadii(config.rx);
  return {
    kernel: { config, rhoMax, z0, z1, nr, nz, txBr: new Float32Array(n), txBz: new Float32Array(n), rxBr: new Float32Array(n), rxBz: new Float32Array(n), txRadii: [txR[0], txR.at(-1)!], rxRadii: [rxR[0], rxR.at(-1)!], wireRadius: Math.max(config.tx.conductorDiameter, config.rx.conductorDiameter) / 2 },
    // Every turn and its images: the tables are exact to the interpolation, also close to the windings.
    tx: loopsOf(config.tx, 0, config),
    rx: loopsOf(config.rx, config.airGap, config),
    row: 0,
  };
}

function buildRows(b: KernelBuild, rows: number) {
  const k = b.kernel;
  const end = Math.min(k.nz, b.row + rows);
  for (let iz = b.row; iz < end; iz++) {
    const z = k.z0 + ((k.z1 - k.z0) * iz) / (k.nz - 1);
    for (let ir = 0; ir < k.nr; ir++) {
      const rho = (k.rhoMax * ir) / (k.nr - 1);
      const t = loopsField(b.tx, rho, z);
      const r = loopsField(b.rx, rho, z);
      const o = iz * k.nr + ir;
      k.txBr[o] = t.br;
      k.txBz[o] = t.bz;
      k.rxBr[o] = r.br;
      k.rxBz[o] = r.bz;
    }
  }
  b.row = end;
}

function remember(key: string, k: FieldKernel) {
  if (kernels.size > 8) kernels.delete(kernels.keys().next().value!);
  kernels.set(key, k);
}

/**
 * The cached per-ampere field basis of a segment winding and the receiver
 * winding for this geometry (ρ step 6 mm, z step ≈ 3 mm), built at once.
 */
export function fieldKernel(config: RoadFieldConfig, opts: { nr?: number; nz?: number; rhoMax?: number } = {}): FieldKernel {
  const key = kernelKey(config) + JSON.stringify(opts);
  const hit = kernels.get(key);
  if (hit) return hit;
  const b = builds.get(key) ?? startKernel(config, opts);
  buildRows(b, b.kernel.nz);
  builds.delete(key);
  remember(key, b.kernel);
  return b.kernel;
}

/**
 * The same basis built a few rows per call, so a render loop can spread the
 * work over frames: returns the kernel once complete, null until then.
 */
export function fieldKernelStep(config: RoadFieldConfig, rows = 6, opts: { nr?: number; nz?: number; rhoMax?: number } = {}): FieldKernel | null {
  const key = kernelKey(config) + JSON.stringify(opts);
  const hit = kernels.get(key);
  if (hit) return hit;
  let b = builds.get(key);
  if (!b) {
    b = startKernel(config, opts);
    builds.set(key, b);
  }
  buildRows(b, rows);
  if (b.row < b.kernel.nz) return null;
  builds.delete(key);
  remember(key, b.kernel);
  return b.kernel;
}

/** Bilinear lookup of a per-ampere table; zero beyond ρmax (the field there is below the scale). */
function lookup(k: FieldKernel, br: Float32Array, bz: Float32Array, rho: number, z: number, out: { br: number; bz: number }) {
  if (rho >= k.rhoMax || z < k.z0 || z > k.z1) {
    out.br = 0;
    out.bz = 0;
    return out;
  }
  const fr = (rho / k.rhoMax) * (k.nr - 1);
  const fz = ((z - k.z0) / (k.z1 - k.z0)) * (k.nz - 1);
  const ir = Math.min(k.nr - 2, Math.floor(fr));
  const iz = Math.min(k.nz - 2, Math.floor(fz));
  const u = fr - ir;
  const v = fz - iz;
  const a = iz * k.nr + ir;
  const b = a + k.nr;
  out.br = (br[a] * (1 - u) + br[a + 1] * u) * (1 - v) + (br[b] * (1 - u) + br[b + 1] * u) * v;
  out.bz = (bz[a] * (1 - u) + bz[a + 1] * u) * (1 - v) + (bz[b] * (1 - u) + bz[b + 1] * u) * v;
  return out;
}

export interface FieldSource {
  coil: "tx" | "rx";
  /** Winding centre in the road frame, m. */
  x: number;
  y: number;
  /** RMS current phasor, A. */
  current: Complex;
  /** Segment index (transmitters) or −1 (receiver). */
  segment: number;
}

export interface FieldExcitation {
  sources: FieldSource[];
  /** Receiver centre in the road frame. */
  receiver: { x: number; y: number };
  /** Simulation time and position the excitation was read at. */
  t: number;
  x: number;
  /** True when no transmitter is energised (the field is then zero apart from nothing). */
  idle: boolean;
}

/**
 * The currents that make the field now, read from the road simulation's
 * state (assumptions A1 and A2). Segments farther than `reach` metres from
 * the receiver are left out: their field at the receiver is below 10⁻⁴ of the
 * peak and outside the tables.
 */
export function roadExcitation(sim: RoadSim, reach = 6): FieldExcitation {
  const s = sim.state;
  const xRx = s.x + sim.vehicle.receiverOffset;
  const y = sim.inputs.lateral;
  const sources: FieldSource[] = [];
  for (const seg of s.segments) {
    if (seg.level <= 0 || seg.state === "failed") continue;
    if (Math.abs(seg.x - xRx) > reach) continue;
    sources.push({ coil: "tx", x: seg.x, y: 0, current: { re: sim.inputs.primaryCurrent * seg.level, im: 0 }, segment: seg.index });
  }
  if (s.i2 > 0) sources.push({ coil: "rx", x: xRx, y, current: { re: 0, im: -s.i2 }, segment: -1 });
  return { sources, receiver: { x: xRx, y }, t: s.t, x: s.x, idle: sources.every((q) => q.coil !== "tx") };
}

export interface FieldPhasor {
  /** Real and imaginary parts of (Bx, By, Bz), T (RMS phasor). */
  re: [number, number, number];
  im: [number, number, number];
}

const tmp = { br: 0, bz: 0 };

/** The field phasor at a point (road frame), from the cached kernel. */
export function fieldAt(k: FieldKernel, sources: readonly FieldSource[], x: number, y: number, z: number, out: FieldPhasor = { re: [0, 0, 0], im: [0, 0, 0] }): FieldPhasor {
  out.re[0] = out.re[1] = out.re[2] = 0;
  out.im[0] = out.im[1] = out.im[2] = 0;
  for (const s of sources) {
    const dx = x - s.x;
    const dy = y - s.y;
    const rho = Math.hypot(dx, dy);
    if (s.coil === "tx") lookup(k, k.txBr, k.txBz, rho, z, tmp);
    else lookup(k, k.rxBr, k.rxBz, rho, z, tmp);
    const cx = rho > 1e-9 ? dx / rho : 0;
    const cy = rho > 1e-9 ? dy / rho : 0;
    const bx = tmp.br * cx;
    const by = tmp.br * cy;
    const bz = tmp.bz;
    out.re[0] += bx * s.current.re;
    out.re[1] += by * s.current.re;
    out.re[2] += bz * s.current.re;
    out.im[0] += bx * s.current.im;
    out.im[1] += by * s.current.im;
    out.im[2] += bz * s.current.im;
  }
  return out;
}

/** The same field by direct summation over every turn and image (no tables): the reference for tests. */
export function fieldAtDirect(config: RoadFieldConfig, sources: readonly FieldSource[], x: number, y: number, z: number): FieldPhasor {
  const tx = loopsOf(config.tx, 0, config);
  const rx = loopsOf(config.rx, config.airGap, config);
  const out: FieldPhasor = { re: [0, 0, 0], im: [0, 0, 0] };
  for (const s of sources) {
    const dx = x - s.x;
    const dy = y - s.y;
    const rho = Math.hypot(dx, dy);
    const f = loopsField(s.coil === "tx" ? tx : rx, rho, z);
    const comps = [rho > 1e-9 ? (f.br * dx) / rho : 0, rho > 1e-9 ? (f.br * dy) / rho : 0, f.bz];
    for (let c = 0; c < 3; c++) {
      out.re[c] += comps[c] * s.current.re;
      out.im[c] += comps[c] * s.current.im;
    }
  }
  return out;
}

export const rmsOf = (b: FieldPhasor) => Math.sqrt(b.re[0] ** 2 + b.re[1] ** 2 + b.re[2] ** 2 + b.im[0] ** 2 + b.im[1] ** 2 + b.im[2] ** 2);

/** Instantaneous field at electrical phase θ (θ = 0 is the positive peak of I₁): √2·Re(B e^{jθ}), T. */
export function instantaneous(b: FieldPhasor, theta: number): [number, number, number] {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [0, 1, 2].map((k) => Math.SQRT2 * (b.re[k] * c - b.im[k] * s)) as [number, number, number];
}

export interface SectionSpec {
  /** Section along x from x0 to x1 (road frame), in the vertical plane y = const. */
  x0: number;
  x1: number;
  y: number;
  nx: number;
  nz: number;
}

export interface RoadFieldSection {
  spec: SectionSpec;
  z0: number;
  z1: number;
  /** RMS |B| per cell (row-major, z rows from the bottom), T; NaN inside the winding layers. */
  brms: Float32Array;
  /** In-plane instantaneous components at the requested phase (Bx, Bz), T. */
  bx: Float32Array;
  bz: Float32Array;
  /** Peak RMS value in the section and at the receiver centre (mid-gap below it), T. */
  max: number;
  atReceiver: number;
}

function inWinding(k: FieldKernel, sources: readonly FieldSource[], x: number, y: number, z: number): boolean {
  const rw = k.wireRadius * 2;
  for (const s of sources) {
    const rho = Math.hypot(x - s.x, y - s.y);
    const [r0, r1] = s.coil === "tx" ? k.txRadii : k.rxRadii;
    const zc = s.coil === "tx" ? 0 : k.config.airGap;
    if (Math.abs(z - zc) < rw && rho >= r0 - rw && rho <= r1 + rw) return true;
  }
  return false;
}

/** RMS and phase-sampled field over a vertical section along the road. */
export function roadFieldSection(k: FieldKernel, ex: FieldExcitation, spec: SectionSpec, theta = 0, out?: RoadFieldSection): RoadFieldSection {
  const n = spec.nx * spec.nz;
  const sec: RoadFieldSection = out && out.brms.length === n ? out : { spec, z0: k.z0, z1: k.z1, brms: new Float32Array(n), bx: new Float32Array(n), bz: new Float32Array(n), max: 0, atReceiver: 0 };
  sec.spec = spec;
  sec.z0 = k.z0;
  sec.z1 = k.z1;
  let max = 0;
  const b: FieldPhasor = { re: [0, 0, 0], im: [0, 0, 0] };
  for (let iz = 0; iz < spec.nz; iz++) {
    const z = k.z0 + ((k.z1 - k.z0) * iz) / (spec.nz - 1);
    for (let ix = 0; ix < spec.nx; ix++) {
      const x = spec.x0 + ((spec.x1 - spec.x0) * ix) / (spec.nx - 1);
      const o = iz * spec.nx + ix;
      if (inWinding(k, ex.sources, x, spec.y, z)) {
        sec.brms[o] = Number.NaN;
        sec.bx[o] = sec.bz[o] = 0;
        continue;
      }
      fieldAt(k, ex.sources, x, spec.y, z, b);
      const v = rmsOf(b);
      sec.brms[o] = v;
      const inst = instantaneous(b, theta);
      sec.bx[o] = inst[0];
      sec.bz[o] = inst[2];
      if (v > max) max = v;
    }
  }
  sec.max = max;
  sec.atReceiver = rmsOf(fieldAt(k, ex.sources, ex.receiver.x, ex.receiver.y, k.config.airGap / 2, b));
  return sec;
}

/**
 * Field lines of the in-plane instantaneous field (Bx, Bz) in the section, at
 * phase θ, traced with RK4 from seeds across mid-gap. When the receiver is
 * offset laterally the field also has a component across the section, which
 * these projected lines do not show. Line density is not flux density.
 */
export function roadFieldLines(k: FieldKernel, ex: FieldExcitation, spec: SectionSpec, theta: number, seeds = 18): number[][] {
  if (ex.idle) return [];
  const ds = 0.006;
  const b: FieldPhasor = { re: [0, 0, 0], im: [0, 0, 0] };
  const dir = (x: number, z: number): [number, number] => {
    fieldAt(k, ex.sources, x, spec.y, z, b);
    const f = instantaneous(b, theta);
    const m = Math.hypot(f[0], f[2]) || 1;
    return [f[0] / m, f[2] / m];
  };
  const inside = (x: number, z: number) => z > k.z0 && z < k.z1 && x > spec.x0 && x < spec.x1;
  const lines: number[][] = [];
  for (let s = 0; s < seeds; s++) {
    const sx = spec.x0 + ((spec.x1 - spec.x0) * (s + 0.5)) / seeds;
    const halves: number[][] = [];
    for (const sign of [1, -1]) {
      const pts: number[] = [];
      let x = sx;
      let z = k.config.airGap / 2;
      for (let i = 0; i < 300 && inside(x, z); i++) {
        pts.push(x, z);
        const [k1x, k1z] = dir(x, z);
        const [k2x, k2z] = dir(x + 0.5 * ds * sign * k1x, z + 0.5 * ds * sign * k1z);
        const [k3x, k3z] = dir(x + 0.5 * ds * sign * k2x, z + 0.5 * ds * sign * k2z);
        const [k4x, k4z] = dir(x + ds * sign * k3x, z + ds * sign * k3z);
        x += (ds * sign * (k1x + 2 * k2x + 2 * k3x + k4x)) / 6;
        z += (ds * sign * (k1z + 2 * k2z + 2 * k3z + k4z)) / 6;
      }
      halves.push(pts);
    }
    const back = halves[1];
    const joined: number[] = [];
    for (let i = back.length - 2; i >= 2; i -= 2) joined.push(back[i], back[i + 1]);
    joined.push(...halves[0]);
    if (joined.length >= 8) lines.push(joined);
  }
  return lines;
}

/** The road field geometry of a road simulation (segment pad, receiver pad, air gap). */
export const roadFieldConfig = (sim: RoadSim): RoadFieldConfig => ({ tx: sim.tx, rx: sim.rx, airGap: sim.inputs.airGap });
