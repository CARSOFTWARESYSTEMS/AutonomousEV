// Numerical building blocks shared by every model: SI constants, complex
// arithmetic for phasor circuits, complete elliptic integrals for
// circular-filament magnetics, a seeded random generator for reproducible
// noise, a small complex linear solver and interpolation. Pure functions, no
// dependencies, no rendering.

/** Vacuum permeability, H/m (CODATA 2018). */
export const MU0 = 1.25663706212e-6;
/** Standard gravity, m/s². */
export const G0 = 9.80665;
/** Resistivity of annealed copper at 20 °C (100 % IACS), Ω·m. */
export const RHO_CU_20 = 1.724e-8;
/** Temperature coefficient of copper resistivity near 20 °C, 1/K. */
export const ALPHA_CU = 0.00393;
/** Density of dry air at 20 °C and 101.325 kPa, kg/m³. */
export const AIR_DENSITY = 1.204;

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── Complex numbers ─────────────────────────────────────────────────────────

export interface Complex {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Complex => ({ re, im });
export const cadd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const csub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
export const cmul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
export const cscale = (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s });
export const cconj = (a: Complex): Complex => ({ re: a.re, im: -a.im });
export const cabs = (a: Complex) => Math.hypot(a.re, a.im);
export const carg = (a: Complex) => Math.atan2(a.im, a.re);
export const cpolar = (r: number, theta: number): Complex => ({ re: r * Math.cos(theta), im: r * Math.sin(theta) });
export function cdiv(a: Complex, b: Complex): Complex {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
/** Re(a·conj(b)): the real power of a voltage phasor a and a current phasor b (both RMS). */
export const realPower = (v: Complex, i: Complex) => v.re * i.re + v.im * i.im;

/**
 * Solves A·x = b for complex A (n×n) by Gaussian elimination with partial
 * pivoting. Throws on a singular matrix. A and b are not modified.
 */
export function solveComplex(A: readonly (readonly Complex[])[], b: readonly Complex[]): Complex[] {
  const n = b.length;
  const m = A.map((row, i) => [...row.map((v) => ({ ...v })), { ...b[i] }]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    let best = cabs(m[col][col]);
    for (let r = col + 1; r < n; r++) {
      const mag = cabs(m[r][col]);
      if (mag > best) {
        best = mag;
        pivot = r;
      }
    }
    if (best < 1e-300) throw new Error("Singular circuit matrix: check for floating nodes or an open loop.");
    if (pivot !== col) [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let r = col + 1; r < n; r++) {
      const f = cdiv(m[r][col], m[col][col]);
      if (f.re === 0 && f.im === 0) continue;
      for (let k = col; k <= n; k++) m[r][k] = csub(m[r][k], cmul(f, m[col][k]));
    }
  }
  const x: Complex[] = new Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = m[r][n];
    for (let k = r + 1; k < n; k++) s = csub(s, cmul(m[r][k], x[k]));
    x[r] = cdiv(s, m[r][r]);
  }
  return x;
}

// ── Complete elliptic integrals ────────────────────────────────────────────

/**
 * Complete elliptic integrals of the first and second kind, K(m) and E(m), for
 * parameter m = k² in [0, 1), by the arithmetic–geometric mean. Converges
 * quadratically; accurate to ~1e-15 relative.
 */
export function ellipticKE(m: number): { K: number; E: number } {
  const mm = clamp(m, 0, 1 - 1e-15);
  let a = 1;
  let b = Math.sqrt(1 - mm);
  let c = Math.sqrt(mm);
  let sum = 0.5 * c * c;
  let weight = 0.5;
  for (let i = 0; i < 40 && Math.abs(c) > 1e-17; i++) {
    const an = 0.5 * (a + b);
    const bn = Math.sqrt(a * b);
    c = 0.5 * (a - b);
    weight *= 2;
    sum += weight * c * c;
    a = an;
    b = bn;
  }
  const K = Math.PI / (2 * a);
  return { K, E: K * (1 - sum) };
}

// ── Seeded random numbers ──────────────────────────────────────────────────

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Standard normal (Box–Muller). */
  normal(): number;
  /** The state, so a run can be resumed or reproduced. */
  readonly state: number;
}

/** mulberry32: small, fast and fully deterministic for a given 32-bit seed. */
export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  let spare: number | null = null;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    normal() {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return v;
      }
      let u = 0;
      while (u <= 1e-12) u = next();
      const v = next();
      const r = Math.sqrt(-2 * Math.log(u));
      spare = r * Math.sin(2 * Math.PI * v);
      return r * Math.cos(2 * Math.PI * v);
    },
    get state() {
      return s;
    },
  };
}

// ── Interpolation and search ───────────────────────────────────────────────

/** Linear interpolation in a table with ascending xs, clamped at the ends. */
export function interp1(xs: readonly number[], ys: readonly number[], x: number): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const t = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + (ys[hi] - ys[lo]) * t;
}

/** Largest x in [lo, hi] with feasible(x) true, assuming feasibility is monotone (true below some threshold). */
export function bisectMax(lo: number, hi: number, feasible: (x: number) => boolean, iterations = 40): number {
  if (feasible(hi)) return hi;
  if (!feasible(lo)) return lo;
  let a = lo;
  let b = hi;
  for (let i = 0; i < iterations; i++) {
    const mid = 0.5 * (a + b);
    if (feasible(mid)) a = mid;
    else b = mid;
  }
  return a;
}

/** Golden-section search for the minimum of a unimodal f on [a, b]. */
export function goldenMin(f: (x: number) => number, a: number, b: number, tolerance = 1e-6): number {
  const r = (Math.sqrt(5) - 1) / 2;
  let x1 = b - r * (b - a);
  let x2 = a + r * (b - a);
  let f1 = f(x1);
  let f2 = f(x2);
  for (let i = 0; i < 200 && Math.abs(b - a) > tolerance; i++) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = b - r * (b - a);
      f1 = f(x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = a + r * (b - a);
      f2 = f(x2);
    }
  }
  return 0.5 * (a + b);
}

/** Evenly spaced values from a to b inclusive. */
export function linspace(a: number, b: number, n: number): number[] {
  if (n < 2) return [a];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}
