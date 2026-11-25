// Loss and thermal models (WPT-LOSS-001…004, WPT-TH-001).
//
// Representative parameters, not a specific product's datasheet. Every
// coefficient is an input, so a calibrated value can replace it.
import { ALPHA_CU, MU0, RHO_CU_20 } from "./math";
import { type PadGeometry, turnRadii } from "./coils";

/** Skin depth δ = √(ρ / (π f μ0 μr)), m. */
export const skinDepth = (f: number, rho = RHO_CU_20, mur = 1) => Math.sqrt(rho / (Math.PI * f * MU0 * mur));

/** Copper resistivity at temperature T (°C), linear about 20 °C, Ω·m. */
export const copperResistivity = (T: number) => RHO_CU_20 * (1 + ALPHA_CU * (T - 20));

export interface WindingResistance {
  /** Conductor length, m. */
  length: number;
  /** Copper cross-section of the Litz bundle, m². */
  area: number;
  rdc: number;
  rac: number;
  skinDepth: number;
  /** Strand diameter over skin depth: well below 1 means the strands themselves see little skin effect. */
  strandRatio: number;
}

/**
 * Winding resistance. R_dc from copper length, area and temperature; R_ac =
 * R_dc × F_R, where F_R (≥ 1) lumps strand skin and bundle proximity effects.
 * F_R is an empirical input: compute it with a Litz model (e.g. Sullivan's)
 * or measure it, rather than trusting the default.
 */
export function windingResistance(pad: PadGeometry, f: number, T: number, acFactor: number): WindingResistance {
  const length = turnRadii(pad).reduce((s, r) => s + 2 * Math.PI * r, 0);
  const area = pad.strands * Math.PI * (pad.strandDiameter / 2) ** 2;
  const rdc = (copperResistivity(T) * length) / area;
  const delta = skinDepth(f, copperResistivity(T));
  return { length, area, rdc, rac: rdc * Math.max(1, acFactor), skinDepth: delta, strandRatio: pad.strandDiameter / delta };
}

/** Equivalent series resistance of a capacitor with loss tangent tanδ at angular frequency ω: tanδ/(ωC). */
export const capacitorEsr = (tanDelta: number, C: number, f: number) => tanDelta / (2 * Math.PI * f * C);

/** Converter loss P_loss = p0 + a·P + b·P² while running (P = output power, W). */
export interface ConverterLossModel {
  p0: number;
  a: number;
  b: number;
}
export const converterLoss = (m: ConverterLossModel, P: number) => (P <= 0 ? 0 : m.p0 + m.a * P + m.b * P * P);
export const converterEfficiency = (m: ConverterLossModel, P: number) => (P <= 0 ? 0 : P / (P + converterLoss(m, P)));
/** Input power needed for output P. */
export const converterInput = (m: ConverterLossModel, P: number) => P + converterLoss(m, P);

export interface InverterParams {
  /** Per-device on-resistance at 25 °C, Ω (SiC MOSFET class). */
  rdsOn25: number;
  /** Fractional increase of on-resistance per kelvin. */
  rdsTempCoeff: number;
  /** Current fall time at turn-off, s. */
  tOff: number;
  /** Current rise time at hard turn-on, s. */
  tOn: number;
  /** Output capacitance per device, F. */
  coss: number;
  /** Gate-drive and control power, W. */
  auxiliary: number;
}

export const DEFAULT_INVERTER: InverterParams = { rdsOn25: 0.04, rdsTempCoeff: 0.004, tOff: 25e-9, tOn: 30e-9, coss: 250e-12, auxiliary: 25 };

export interface InverterLoss {
  conduction: number;
  switching: number;
  total: number;
  /** First-harmonic estimate: the load is inductive, so turn-on is at zero voltage. */
  zvs: boolean;
  /** Current at the switching instant, A. */
  switchedCurrent: number;
}

/**
 * Full-bridge inverter losses under the first-harmonic approximation. Two
 * devices conduct at any time: P_cond = 2·R_ds(Tj)·I1². Each of the four
 * devices turns off once a period at i = √2·I1·|sin θ| (θ = input phase), with
 * the hard-switching overlap estimate ½·V·I·t. Without ZVS (capacitive load)
 * turn-on is hard too, and the output capacitance is discharged each time.
 */
export function inverterLoss(p: InverterParams, vdc: number, i1rms: number, phaseIn: number, f: number, tj: number): InverterLoss {
  if (i1rms <= 0 || vdc <= 0) return { conduction: 0, switching: 0, total: 0, zvs: true, switchedCurrent: 0 };
  const rds = p.rdsOn25 * (1 + p.rdsTempCoeff * (tj - 25));
  const conduction = 2 * rds * i1rms * i1rms;
  const switchedCurrent = Math.SQRT2 * i1rms * Math.abs(Math.sin(phaseIn));
  const zvs = phaseIn > 0;
  const offLoss = 4 * f * 0.5 * vdc * switchedCurrent * p.tOff;
  const onLoss = zvs ? 0 : 4 * f * (0.5 * vdc * switchedCurrent * p.tOn + 0.5 * p.coss * vdc * vdc);
  const switching = offLoss + onLoss;
  return { conduction, switching, total: conduction + switching + p.auxiliary, zvs, switchedCurrent };
}

/** Full-bridge diode rectifier: two diodes conduct, P = 2·V_F·I_dc + R_F·I2². */
export const rectifierLoss = (vf: number, rf: number, idc: number, i2rms: number) => (idc <= 0 ? 0 : 2 * vf * idc + rf * i2rms * i2rms);

// ── Lumped thermal model ───────────────────────────────────────────────────

export interface ThermalNode {
  /** Heat capacity, J/K. */
  capacitance: number;
  /** Thermal resistance to ambient, K/W. */
  resistance: number;
}

/**
 * One step of C·dT/dt = P − (T − T_amb)/R with P constant over the step,
 * integrated exactly: T(t+dt) = T∞ + (T − T∞)·e^(−dt/RC), T∞ = T_amb + P·R.
 * Unconditionally stable for any dt.
 */
export function stepThermal(node: ThermalNode, T: number, P: number, ambient: number, dt: number): number {
  const tInf = ambient + P * node.resistance;
  return tInf + (T - tInf) * Math.exp(-dt / (node.resistance * node.capacitance));
}
