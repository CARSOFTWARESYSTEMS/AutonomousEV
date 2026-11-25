// Magnetic coupler model (WPT-EM-001…004 in the model registry).
//
// Each pad is a planar winding of N concentric circular turns (a spiral
// approximated turn by turn), lying in a horizontal plane. Self- and mutual
// inductances come from circular-filament formulas: Maxwell's elliptic-
// integral expression for coaxial loops, and a single-integral form of the
// Neumann formula (the loop's vector potential integrated round the other
// loop) for laterally displaced loops. Ferrite backing is modelled with the
// method of images for infinite, linear, high-permeability planes behind each
// winding, scaled by an effective-coverage factor for finite ferrite tiles.
//
// Fidelity F1 (analytical). Neglected: finite ferrite extent beyond the
// coverage factor, ferrite saturation and loss, eddy currents in aluminium
// shields and the vehicle floor, conductor proximity redistribution, tilt.
// Circular pads are rotationally symmetric, so rotation about the vertical
// axis has no effect in this model.
import { MU0, ellipticKE } from "./math";

export interface PadGeometry {
  /** Centre-line radius of the innermost turn region's inner edge, m. */
  innerRadius: number;
  /** Outer edge of the winding, m. */
  outerRadius: number;
  turns: number;
  /** Litz bundle outer diameter, m. Must not exceed the turn pitch. */
  conductorDiameter: number;
  /** Diameter of one Litz strand, m. */
  strandDiameter: number;
  strands: number;
  /** Distance from the winding plane to the ferrite surface behind it, m. */
  ferriteGap: number;
  /** Relative permeability of the ferrite (MnZn power ferrite ~2000–3000). */
  ferritePermeability: number;
  /** 0–1. Scales the image strength for finite ferrite tiles; 0 = air core. Calibrate against FEM or measurement. */
  ferriteCoverage: number;
}

export interface CouplerConfig {
  tx: PadGeometry;
  rx: PadGeometry;
  /** Vertical distance between the transmitter and receiver winding planes, m. */
  airGap: number;
  /** Horizontal offsets of the receiver centre from the transmitter centre, m. */
  lateral: number;
  longitudinal: number;
}

export interface CouplerResult {
  L1: number;
  L2: number;
  M: number;
  k: number;
  /** Horizontal centre-to-centre offset, m. */
  offset: number;
  /** Air-core values, for comparison with the ferrite-backed result. */
  airCore: { L1: number; L2: number; M: number; k: number };
  /** Relative difference between M computed from TX→RX and RX→TX (truncated image series). */
  reciprocityError: number;
}

/** A representative 11 kW-class ground pad: 600 mm winding, 12 turns of 1600 × 0.1 mm Litz. */
export const DEFAULT_TX_PAD: PadGeometry = {
  innerRadius: 0.1,
  outerRadius: 0.3,
  turns: 12,
  conductorDiameter: 0.0062,
  strandDiameter: 0.0001,
  strands: 1600,
  ferriteGap: 0.006,
  ferritePermeability: 2300,
  ferriteCoverage: 0.6,
};

/** A representative vehicle pad: 460 mm winding, 11 turns. */
export const DEFAULT_RX_PAD: PadGeometry = {
  innerRadius: 0.07,
  outerRadius: 0.23,
  turns: 11,
  conductorDiameter: 0.0062,
  strandDiameter: 0.0001,
  strands: 1600,
  ferriteGap: 0.006,
  ferritePermeability: 2300,
  ferriteCoverage: 0.6,
};

/** Radius of each turn, m: turns evenly spread between the inner and outer edge. */
export function turnRadii(pad: PadGeometry): number[] {
  const n = Math.max(1, Math.round(pad.turns));
  const pitch = (pad.outerRadius - pad.innerRadius) / n;
  return Array.from({ length: n }, (_, i) => pad.innerRadius + (i + 0.5) * pitch);
}

/** Geometry problems that make the model invalid, in plain words. Empty when valid. */
export function validatePad(pad: PadGeometry): string[] {
  const issues: string[] = [];
  if (!(pad.outerRadius > pad.innerRadius)) issues.push("Outer radius must exceed inner radius.");
  if (pad.innerRadius <= pad.conductorDiameter) issues.push("Inner radius must exceed the conductor diameter.");
  if (pad.turns < 1) issues.push("At least one turn is needed.");
  const pitch = (pad.outerRadius - pad.innerRadius) / Math.max(1, pad.turns);
  if (pad.conductorDiameter > pitch * 1.0001) issues.push(`Turns overlap: conductor ${(pad.conductorDiameter * 1000).toFixed(1)} mm exceeds the ${(pitch * 1000).toFixed(1)} mm pitch.`);
  if (pad.ferriteCoverage < 0 || pad.ferriteCoverage > 1) issues.push("Ferrite coverage must be between 0 and 1.");
  return issues;
}

/** Self-inductance of one circular loop of wire radius rw with uniform current, H. */
export function loopSelfInductance(a: number, rw: number): number {
  return MU0 * a * (Math.log((8 * a) / rw) - 1.75);
}

/** Mutual inductance of two coaxial circular filaments of radii a and b, axial separation d (Maxwell), H. */
export function coaxialLoopM(a: number, b: number, d: number): number {
  const m = (4 * a * b) / ((a + b) * (a + b) + d * d);
  const k = Math.sqrt(m);
  const { K, E } = ellipticKE(m);
  return MU0 * Math.sqrt(a * b) * ((2 / k - k) * K - (2 / k) * E);
}

/** Azimuthal vector potential per ampere of a loop of radius a, at radius rho and height z from its plane, T·m/A. */
export function loopVectorPotential(a: number, rho: number, z: number): number {
  if (rho < 1e-12) return 0;
  const m = (4 * a * rho) / ((a + rho) * (a + rho) + z * z);
  const k = Math.sqrt(m);
  const { K, E } = ellipticKE(m);
  return (MU0 / (Math.PI * k)) * Math.sqrt(a / rho) * ((1 - m / 2) * K - E);
}

/**
 * Mutual inductance of two parallel circular filaments: loop a at the origin,
 * loop b at height h and horizontal offset rho, H. Integrates loop a's vector
 * potential round loop b with the periodic trapezoid rule (spectrally accurate
 * for loops that do not touch). Exact Maxwell result when rho = 0.
 */
export function offsetLoopM(a: number, b: number, h: number, rho: number, samples = 48): number {
  if (rho < 1e-9) return coaxialLoopM(a, b, h);
  let sum = 0;
  for (let i = 0; i <= samples; i++) {
    const phi = (Math.PI * i) / samples;
    const c = Math.cos(phi);
    const r2 = Math.sqrt(rho * rho + b * b + 2 * rho * b * c);
    const w = i === 0 || i === samples ? 0.5 : 1;
    if (r2 < 1e-12) continue;
    sum += w * loopVectorPotential(a, r2, h) * ((b * (b + rho * c)) / r2);
  }
  return 2 * sum * (Math.PI / samples);
}

/**
 * Neumann double integral for the same configuration, by brute force. Slow; an
 * independent check on offsetLoopM in the verification suite.
 */
export function neumannLoopM(a: number, b: number, h: number, rho: number, samples = 360): number {
  let sum = 0;
  const d = (2 * Math.PI) / samples;
  for (let i = 0; i < samples; i++) {
    const p1 = i * d;
    const x1 = a * Math.cos(p1);
    const y1 = a * Math.sin(p1);
    for (let j = 0; j < samples; j++) {
      const p2 = (j + 0.5) * d;
      const dx = x1 - (rho + b * Math.cos(p2));
      const dy = y1 - b * Math.sin(p2);
      sum += Math.cos(p1 - p2) / Math.sqrt(dx * dx + dy * dy + h * h);
    }
  }
  return ((MU0 * a * b) / (4 * Math.PI)) * sum * d * d;
}

/** Magnetic flux density per ampere of a loop of radius a at (rho, z) in its own cylindrical frame, T/A. */
export function loopField(a: number, rho: number, z: number): { br: number; bz: number } {
  if (rho < 1e-9 * a) {
    const d = a * a + z * z;
    return { br: 0, bz: (MU0 * a * a) / (2 * d * Math.sqrt(d)) };
  }
  const r2 = rho * rho + z * z;
  const alpha2 = a * a + r2 - 2 * a * rho;
  const beta2 = a * a + r2 + 2 * a * rho;
  const beta = Math.sqrt(beta2);
  const { K, E } = ellipticKE(1 - alpha2 / beta2);
  const C = MU0 / Math.PI;
  return {
    bz: (C / (2 * alpha2 * beta)) * ((a * a - r2) * E + alpha2 * K),
    br: ((C * z) / (2 * alpha2 * beta * rho)) * ((a * a + r2) * E - alpha2 * K),
  };
}

// ── Ferrite images ─────────────────────────────────────────────────────────

export interface Image {
  /** Height of the image winding plane, m. */
  z: number;
  /** Image current relative to the source. */
  strength: number;
}

/** Image coefficient of an infinite linear magnetic half-space: (μr − 1)/(μr + 1), scaled by coverage. */
export const imageCoefficient = (pad: PadGeometry) => pad.ferriteCoverage * ((pad.ferritePermeability - 1) / (pad.ferritePermeability + 1));

/**
 * The source winding at zs and its images in two parallel ferrite planes, at
 * zA (below, coefficient cA) and zB (above, coefficient cB), up to `order`
 * reflections. Exact for infinite planes as order → ∞.
 */
export function imageSeries(zs: number, zA: number, cA: number, zB: number, cB: number, order = 3): Image[] {
  const out: Image[] = [{ z: zs, strength: 1 }];
  let frontier: { z: number; strength: number; last: "A" | "B" | null }[] = [{ z: zs, strength: 1, last: null }];
  for (let n = 0; n < order; n++) {
    const next: typeof frontier = [];
    for (const img of frontier) {
      if (img.last !== "A" && cA !== 0) next.push({ z: 2 * zA - img.z, strength: img.strength * cA, last: "A" });
      if (img.last !== "B" && cB !== 0) next.push({ z: 2 * zB - img.z, strength: img.strength * cB, last: "B" });
    }
    for (const img of next) out.push({ z: img.z, strength: img.strength });
    frontier = next;
  }
  return out;
}

/** Inductance of a planar winding in free space: every turn's self-inductance plus every pair's mutual, H. */
export function windingSelfInductance(pad: PadGeometry): number {
  const radii = turnRadii(pad);
  const rw = pad.conductorDiameter / 2;
  let L = 0;
  for (let i = 0; i < radii.length; i++) {
    L += loopSelfInductance(radii[i], rw);
    for (let j = i + 1; j < radii.length; j++) L += 2 * coaxialLoopM(radii[i], radii[j], 0);
  }
  return L;
}

/** Sum of mutual inductances between every turn of two windings, separated vertically by dz and horizontally by rho, H. */
export function windingMutual(radiiA: readonly number[], radiiB: readonly number[], dz: number, rho: number, samples = 40): number {
  let M = 0;
  for (const a of radiiA) for (const b of radiiB) M += rho < 1e-9 ? coaxialLoopM(a, b, dz) : offsetLoopM(a, b, dz, rho, samples);
  return M;
}

/** Self-inductance of a winding between the two ferrite planes, including its images, H. */
function backedSelf(pad: PadGeometry, images: readonly Image[], zs: number): number {
  const radii = turnRadii(pad);
  let L = windingSelfInductance(pad);
  for (const img of images.slice(1)) L += img.strength * windingMutual(radii, radii, Math.abs(img.z - zs), 0);
  return L;
}

/** Ferrite-plane geometry for a coupler: TX winding at z = 0, RX winding at z = airGap. */
export function couplerPlanes(config: CouplerConfig) {
  return {
    zA: -config.tx.ferriteGap,
    cA: imageCoefficient(config.tx),
    zB: config.airGap + config.rx.ferriteGap,
    cB: imageCoefficient(config.rx),
  };
}

/** Self- and mutual inductance and coupling coefficient of the coupler. */
export function computeCoupler(config: CouplerConfig, order = 3): CouplerResult {
  const h = config.airGap;
  const offset = Math.hypot(config.lateral, config.longitudinal);
  const { zA, cA, zB, cB } = couplerPlanes(config);
  const txR = turnRadii(config.tx);
  const rxR = turnRadii(config.rx);

  const txImages = imageSeries(0, zA, cA, zB, cB, order);
  const rxImages = imageSeries(h, zA, cA, zB, cB, order);

  const L1 = backedSelf(config.tx, txImages, 0);
  const L2 = backedSelf(config.rx, rxImages, h);
  let mForward = 0;
  for (const img of txImages) mForward += img.strength * windingMutual(txR, rxR, Math.abs(h - img.z), offset);
  let mReverse = 0;
  for (const img of rxImages) mReverse += img.strength * windingMutual(rxR, txR, Math.abs(img.z), offset);
  const M = 0.5 * (mForward + mReverse);

  const L1a = windingSelfInductance(config.tx);
  const L2a = windingSelfInductance(config.rx);
  const Ma = windingMutual(txR, rxR, h, offset);
  return {
    L1,
    L2,
    M,
    k: M / Math.sqrt(L1 * L2),
    offset,
    airCore: { L1: L1a, L2: L2a, M: Ma, k: Ma / Math.sqrt(L1a * L2a) },
    reciprocityError: Math.abs(mForward - mReverse) / Math.max(1e-30, Math.abs(M)),
  };
}

/**
 * Mutual inductance against horizontal offset, as a table for fast lookup
 * (dynamic charging). The self-inductances do not depend on offset, so only M
 * is tabulated.
 */
export function mutualTable(config: CouplerConfig, maxOffset: number, points = 61, order = 2): { offsets: number[]; M: number[]; L1: number; L2: number } {
  const { zA, cA, zB, cB } = couplerPlanes(config);
  const h = config.airGap;
  const txR = turnRadii(config.tx);
  const rxR = turnRadii(config.rx);
  const txImages = imageSeries(0, zA, cA, zB, cB, order);
  const offsets = Array.from({ length: points }, (_, i) => (maxOffset * i) / (points - 1));
  const M = offsets.map((rho) => {
    let m = 0;
    for (const img of txImages) m += img.strength * windingMutual(txR, rxR, Math.abs(h - img.z), rho, 32);
    return m;
  });
  const rxImages = imageSeries(h, zA, cA, zB, cB, order);
  return { offsets, M, L1: backedSelf(config.tx, txImages, 0), L2: backedSelf(config.rx, rxImages, h) };
}

// ── Field in the vertical section through both pad centres ─────────────────

export interface Currents {
  /** RMS phasors, A. */
  i1: { re: number; im: number };
  i2: { re: number; im: number };
}

interface Source {
  radius: number;
  /** Horizontal position of the loop axis along the section, m. */
  x: number;
  z: number;
  /** Turns × image strength. */
  weight: number;
  coil: 1 | 2;
}

/**
 * Loops that make up the field: each turn (or turn group, `lumped`) of both
 * windings and their images. With `lumped`, turns are merged into that many
 * loops per pad, which is much faster and adequate away from the conductors.
 */
function fieldSources(config: CouplerConfig, lumped?: number): Source[] {
  const { zA, cA, zB, cB } = couplerPlanes(config);
  const offset = Math.hypot(config.lateral, config.longitudinal);
  const out: Source[] = [];
  const add = (pad: PadGeometry, coil: 1 | 2, x: number, zs: number) => {
    let loops = turnRadii(pad).map((r) => ({ r, n: 1 }));
    if (lumped && lumped < loops.length) {
      const per = loops.length / lumped;
      loops = Array.from({ length: lumped }, (_, g) => {
        const group = loops.slice(Math.round(g * per), Math.round((g + 1) * per));
        return { r: group.reduce((s, l) => s + l.r, 0) / group.length, n: group.length };
      });
    }
    for (const img of imageSeries(zs, zA, cA, zB, cB, 2)) for (const loop of loops) out.push({ radius: loop.r, x, z: img.z, weight: loop.n * img.strength, coil });
  };
  add(config.tx, 1, 0, 0);
  add(config.rx, 2, offset, config.airGap);
  return out;
}

/** Field per ampere of each coil at (x, z) in the section plane: components along x and z, T/A. */
function sectionFieldPerAmp(sources: readonly Source[], x: number, z: number) {
  let b1x = 0;
  let b1z = 0;
  let b2x = 0;
  let b2z = 0;
  for (const s of sources) {
    const dx = x - s.x;
    const rho = Math.abs(dx);
    const f = loopField(s.radius, rho, z - s.z);
    const bx = (dx < 0 ? -f.br : f.br) * s.weight;
    const bz = f.bz * s.weight;
    if (s.coil === 1) {
      b1x += bx;
      b1z += bz;
    } else {
      b2x += bx;
      b2z += bz;
    }
  }
  return { b1x, b1z, b2x, b2z };
}

export interface FieldSection {
  nx: number;
  nz: number;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  /** RMS |B| at each grid point (row-major, z rows from bottom), T. NaN where the model is not valid. */
  brms: Float32Array;
  max: number;
  /** RMS |B| at the centre of the air gap, T. */
  centre: number;
}

/**
 * RMS flux density over the vertical section through both pad centres, in the
 * air region between the two ferrite planes (the image solution is not valid
 * inside or behind the ferrite, so those cells are NaN).
 */
export function computeFieldSection(config: CouplerConfig, currents: Currents, opts: { nx?: number; nz?: number; halfWidth?: number } = {}): FieldSection {
  const nx = opts.nx ?? 72;
  const nz = opts.nz ?? 36;
  const { zA, zB } = couplerPlanes(config);
  const offset = Math.hypot(config.lateral, config.longitudinal);
  const half = opts.halfWidth ?? Math.max(config.tx.outerRadius, offset + config.rx.outerRadius) * 1.6;
  const x0 = Math.min(-half, offset - half);
  const x1 = Math.max(half, offset + half);
  const z0 = zA + 1e-4;
  const z1 = zB - 1e-4;
  const sources = fieldSources(config);
  const rw = Math.max(config.tx.conductorDiameter, config.rx.conductorDiameter) / 2;
  const brms = new Float32Array(nx * nz);
  let max = 0;
  const { i1, i2 } = currents;
  for (let iz = 0; iz < nz; iz++) {
    const z = z0 + ((z1 - z0) * iz) / (nz - 1);
    for (let ix = 0; ix < nx; ix++) {
      const x = x0 + ((x1 - x0) * ix) / (nx - 1);
      const near = sources.some((s) => s.weight > 0.99 && Math.abs(s.z - z) < rw * 1.5 && Math.abs(Math.abs(x - s.x) - s.radius) < rw * 1.5);
      if (near) {
        brms[iz * nx + ix] = Number.NaN;
        continue;
      }
      const f = sectionFieldPerAmp(sources, x, z);
      const bxRe = f.b1x * i1.re + f.b2x * i2.re;
      const bxIm = f.b1x * i1.im + f.b2x * i2.im;
      const bzRe = f.b1z * i1.re + f.b2z * i2.re;
      const bzIm = f.b1z * i1.im + f.b2z * i2.im;
      const b = Math.sqrt(bxRe * bxRe + bxIm * bxIm + bzRe * bzRe + bzIm * bzIm);
      brms[iz * nx + ix] = b;
      if (b > max) max = b;
    }
  }
  const c = sectionFieldPerAmp(sources, offset / 2, config.airGap / 2);
  const centre = Math.hypot(c.b1x * i1.re + c.b2x * i2.re, c.b1x * i1.im + c.b2x * i2.im, c.b1z * i1.re + c.b2z * i2.re, c.b1z * i1.im + c.b2z * i2.im);
  return { nx, nz, x0, x1, z0, z1, brms, max, centre };
}

/**
 * Instantaneous field lines in the section at electrical phase theta (radians;
 * theta = 0 is the transmitter current's positive peak). Lines are traced in
 * both directions from seeds across mid-gap with RK4 on the unit field
 * direction. Line density is not proportional to flux density.
 */
export function traceFieldLines(config: CouplerConfig, currents: Currents, theta: number, opts: { seeds?: number; step?: number; maxSteps?: number } = {}): number[][] {
  const seeds = opts.seeds ?? 14;
  const ds = opts.step ?? 0.006;
  const maxSteps = opts.maxSteps ?? 260;
  const { zA, zB } = couplerPlanes(config);
  const offset = Math.hypot(config.lateral, config.longitudinal);
  const sources = fieldSources(config, 3);
  const a1 = Math.SQRT2 * Math.hypot(currents.i1.re, currents.i1.im);
  const a2 = Math.SQRT2 * Math.hypot(currents.i2.re, currents.i2.im);
  const p1 = Math.atan2(currents.i1.im, currents.i1.re);
  const p2 = Math.atan2(currents.i2.im, currents.i2.re);
  const w1 = a1 * Math.cos(theta + p1);
  const w2 = a2 * Math.cos(theta + p2);
  const xMin = Math.min(-config.tx.outerRadius, offset - config.rx.outerRadius) * 1.9;
  const xMax = Math.max(config.tx.outerRadius, offset + config.rx.outerRadius) * 1.9;
  const dir = (x: number, z: number): [number, number] => {
    const f = sectionFieldPerAmp(sources, x, z);
    const bx = f.b1x * w1 + f.b2x * w2;
    const bz = f.b1z * w1 + f.b2z * w2;
    const m = Math.hypot(bx, bz) || 1;
    return [bx / m, bz / m];
  };
  const inside = (x: number, z: number) => z > zA && z < zB && x > xMin && x < xMax;
  const lines: number[][] = [];
  const span = config.tx.outerRadius + config.rx.outerRadius;
  const left = Math.min(-config.tx.outerRadius, offset - config.rx.outerRadius) * 1.15;
  for (let s = 0; s < seeds; s++) {
    const sx = left + ((span * 1.15 + Math.abs(offset)) * (s + 0.5)) / seeds;
    const sz = config.airGap / 2;
    const halves: number[][] = [];
    for (const sign of [1, -1]) {
      const pts: number[] = [];
      let x = sx;
      let z = sz;
      for (let i = 0; i < maxSteps && inside(x, z); i++) {
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
    // Join: the backward half reversed, then the forward half.
    const back = halves[1];
    const joined: number[] = [];
    for (let i = back.length - 2; i >= 2; i -= 2) joined.push(back[i], back[i + 1]);
    joined.push(...halves[0]);
    if (joined.length >= 8) lines.push(joined);
  }
  return lines;
}

export interface FieldBasis {
  nx: number;
  nz: number;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  /** Per-ampere field components of each coil at each cell (row-major, z rows from bottom), T/A. NaN where invalid. */
  b1x: Float32Array;
  b1z: Float32Array;
  b2x: Float32Array;
  b2z: Float32Array;
}

/**
 * The section's field per ampere of each coil. Fields are linear in current,
 * so any operating point's map is b1·I1 + b2·I2: the expensive part is
 * computed once per geometry, the map per frame.
 */
export function fieldBasis(config: CouplerConfig, opts: { nx?: number; nz?: number; halfWidth?: number } = {}): FieldBasis {
  const nx = opts.nx ?? 64;
  const nz = opts.nz ?? 32;
  const { zA, zB } = couplerPlanes(config);
  const offset = Math.hypot(config.lateral, config.longitudinal);
  const half = opts.halfWidth ?? Math.max(config.tx.outerRadius, config.rx.outerRadius) * 1.8;
  const x0 = Math.min(-half, offset - half);
  const x1 = Math.max(half, offset + half);
  const z0 = zA + 1e-4;
  const z1 = zB - 1e-4;
  const sources = fieldSources(config, 4);
  const rw = Math.max(config.tx.conductorDiameter, config.rx.conductorDiameter) / 2;
  const n = nx * nz;
  const b1x = new Float32Array(n);
  const b1z = new Float32Array(n);
  const b2x = new Float32Array(n);
  const b2z = new Float32Array(n);
  const txR = turnRadii(config.tx);
  const rxR = turnRadii(config.rx);
  for (let iz = 0; iz < nz; iz++) {
    const z = z0 + ((z1 - z0) * iz) / (nz - 1);
    for (let ix = 0; ix < nx; ix++) {
      const x = x0 + ((x1 - x0) * ix) / (nx - 1);
      const k = iz * nx + ix;
      // Inside a winding's own layer the lumped loops are not valid: blank it.
      const inTx = Math.abs(z) < rw * 2 && Math.abs(x) >= txR[0] - rw && Math.abs(x) <= txR[txR.length - 1] + rw;
      const inRx = Math.abs(z - config.airGap) < rw * 2 && Math.abs(x - offset) >= rxR[0] - rw && Math.abs(x - offset) <= rxR[rxR.length - 1] + rw;
      if (inTx || inRx) {
        b1x[k] = b1z[k] = b2x[k] = b2z[k] = Number.NaN;
        continue;
      }
      const f = sectionFieldPerAmp(sources, x, z);
      b1x[k] = f.b1x;
      b1z[k] = f.b1z;
      b2x[k] = f.b2x;
      b2z[k] = f.b2z;
    }
  }
  return { nx, nz, x0, x1, z0, z1, b1x, b1z, b2x, b2z };
}

/** RMS |B| of a basis at an operating point (RMS phasor currents), T, into `out`. Returns the maximum. */
export function fieldFromBasis(basis: FieldBasis, currents: Currents, out: Float32Array): number {
  const { i1, i2 } = currents;
  let max = 0;
  for (let k = 0; k < out.length; k++) {
    const bxRe = basis.b1x[k] * i1.re + basis.b2x[k] * i2.re;
    const bxIm = basis.b1x[k] * i1.im + basis.b2x[k] * i2.im;
    const bzRe = basis.b1z[k] * i1.re + basis.b2z[k] * i2.re;
    const bzIm = basis.b1z[k] * i1.im + basis.b2z[k] * i2.im;
    const b = Math.sqrt(bxRe * bxRe + bxIm * bxIm + bzRe * bzRe + bzIm * bzIm);
    out[k] = b;
    if (b > max) max = b;
  }
  return max;
}
