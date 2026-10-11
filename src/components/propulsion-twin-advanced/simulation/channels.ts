// The measured quantities of the reference propulsion system, and the numeric
// helpers the simulation shares. Pure data and functions: no React.
//
// Every value is normalised. Pressures are a percentage of the reference
// chamber pressure ("% Pc,ref"); everything else is a percentage of its own
// reference value. Nothing here is a figure from a real engine.

export type ChannelKind = "pressure" | "flow" | "speed" | "position" | "temperature" | "vibration" | "force";
/** The data-acquisition node a channel is digitised and time-stamped by. */
export type DaqNode = "feed" | "turbo" | "chamber";

export interface ChannelDef {
  id: ChannelId;
  label: string;
  unit: string;
  kind: ChannelKind;
  node: DaqNode;
  /** Sensor noise, one standard deviation, in the channel's unit. */
  sigma: number;
}

export const CHANNEL_IDS = [
  "pTankFu",
  "pTankOx",
  "pInFu",
  "pInOx",
  "pOutFu",
  "pOutOx",
  "pCoolIn",
  "pCoolOut",
  "pInjFu",
  "pInjOx",
  "pcA",
  "pcB",
  "pPb",
  "pTi",
  "pTo",
  "mFu",
  "mOx",
  "speed",
  "valvePos",
  "tCool",
  "vib",
  "thrust",
] as const;

export type ChannelId = (typeof CHANNEL_IDS)[number];

/** Index of each channel in a values array. */
export const CH = Object.fromEntries(CHANNEL_IDS.map((id, i) => [id, i])) as Record<ChannelId, number>;
export const N_CH = CHANNEL_IDS.length;

const P = "% Pc,ref";
const R = "% ref";

export const CHANNELS: readonly ChannelDef[] = [
  { id: "pTankFu", label: "Fuel tank pressure", unit: P, kind: "pressure", node: "feed", sigma: 0.03 },
  { id: "pTankOx", label: "Oxidiser tank pressure", unit: P, kind: "pressure", node: "feed", sigma: 0.03 },
  { id: "pInFu", label: "Fuel pump inlet pressure", unit: P, kind: "pressure", node: "feed", sigma: 0.03 },
  { id: "pInOx", label: "Oxidiser pump inlet pressure", unit: P, kind: "pressure", node: "feed", sigma: 0.03 },
  { id: "pOutFu", label: "Fuel pump discharge pressure", unit: P, kind: "pressure", node: "turbo", sigma: 0.4 },
  { id: "pOutOx", label: "Oxidiser pump discharge pressure", unit: P, kind: "pressure", node: "turbo", sigma: 0.35 },
  { id: "pCoolIn", label: "Cooling circuit inlet pressure", unit: P, kind: "pressure", node: "chamber", sigma: 0.4 },
  { id: "pCoolOut", label: "Cooling circuit outlet pressure", unit: P, kind: "pressure", node: "chamber", sigma: 0.3 },
  { id: "pInjFu", label: "Injector fuel manifold pressure", unit: P, kind: "pressure", node: "chamber", sigma: 0.25 },
  { id: "pInjOx", label: "Injector oxidiser manifold pressure", unit: P, kind: "pressure", node: "chamber", sigma: 0.25 },
  { id: "pcA", label: "Chamber pressure, sensor A", unit: P, kind: "pressure", node: "chamber", sigma: 0.25 },
  { id: "pcB", label: "Chamber pressure, sensor B", unit: P, kind: "pressure", node: "chamber", sigma: 0.25 },
  { id: "pPb", label: "Preburner pressure", unit: P, kind: "pressure", node: "turbo", sigma: 0.35 },
  { id: "pTi", label: "Turbine inlet pressure", unit: P, kind: "pressure", node: "turbo", sigma: 0.35 },
  { id: "pTo", label: "Turbine outlet pressure", unit: P, kind: "pressure", node: "turbo", sigma: 0.25 },
  { id: "mFu", label: "Fuel flow", unit: R, kind: "flow", node: "feed", sigma: 0.25 },
  { id: "mOx", label: "Oxidiser flow", unit: R, kind: "flow", node: "feed", sigma: 0.25 },
  { id: "speed", label: "Turbopump shaft speed", unit: R, kind: "speed", node: "turbo", sigma: 0.12 },
  { id: "valvePos", label: "Main fuel valve position", unit: "% open", kind: "position", node: "chamber", sigma: 0.15 },
  { id: "tCool", label: "Coolant temperature rise", unit: R, kind: "temperature", node: "chamber", sigma: 0.6 },
  { id: "vib", label: "Turbopump vibration", unit: R, kind: "vibration", node: "turbo", sigma: 1.5 },
  { id: "thrust", label: "Thrust proxy (mount strain)", unit: R, kind: "force", node: "chamber", sigma: 0.4 },
];

export const CHANNEL_BY_ID = Object.fromEntries(CHANNELS.map((c) => [c.id, c])) as Record<ChannelId, ChannelDef>;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const clamp01 = (v: number) => clamp(v, 0, 1);

/** Standard normal cumulative distribution (Abramowitz–Stegun 7.1.26, |error| < 1.5e-7). */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Standard normal. */
  gauss(): number;
}

/** A small seeded generator (mulberry32), so every run of the simulation is repeatable. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  let spare: number | null = null;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = () => {
    if (spare !== null) {
      const g = spare;
      spare = null;
      return g;
    }
    let u = 0;
    while (u < 1e-12) u = next();
    const r = Math.sqrt(-2 * Math.log(u));
    const theta = 2 * Math.PI * next();
    spare = r * Math.sin(theta);
    return r * Math.cos(theta);
  };
  return { next, gauss };
}
