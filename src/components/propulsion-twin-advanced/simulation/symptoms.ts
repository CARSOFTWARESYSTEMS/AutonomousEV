// From estimated measurements to evidence. Some evidence is a plain residual
// (estimate minus expectation). The rest are hidden parameters the twin infers
// by inverting its own model: how much head the pump is really producing, how
// much resistance the cooling circuit really has. Those are the states no
// sensor measures, and the ones that say which component has changed.
import { CH, clamp } from "./channels";
import { SYMPTOM_IDS, type SymptomId } from "./isolation";
import { type PlantParams, W_FU, W_OX, cStarFactor } from "./plant";

type Values = ArrayLike<number>;

const ratio = (measured: number, modelled: number) => (Math.abs(modelled) > 1e-6 ? measured / modelled - 1 : 0);

/** Vapour pressure and required suction head, as in the physics model. */
const P_VAPOUR = 1.2;
const NPSH_REQUIRED = 1.6;

export const HEALTH_PARAM_IDS = ["head_ox", "head_fu", "k_valve", "k_cool", "k_inj_ox", "k_inj_fu", "eta_c", "npsh_ox"] as const;
export type HealthParamId = (typeof HEALTH_PARAM_IDS)[number];

export interface HealthParamDef {
  id: HealthParamId;
  label: string;
  component: string;
  /** Change from the calibrated value at which engineering action is expected, as a fraction; its sign is the unhealthy direction. */
  limit: number;
  meaning: string;
}

export const HEALTH_PARAMS: readonly HealthParamDef[] = [
  { id: "head_ox", label: "Oxidiser pump head coefficient", component: "Oxidiser pump", limit: -0.1, meaning: "Pressure rise delivered, relative to what the calibrated pump curve gives at the measured speed and flow." },
  { id: "head_fu", label: "Fuel pump head coefficient", component: "Fuel pump", limit: -0.1, meaning: "Pressure rise delivered, relative to the calibrated pump curve." },
  { id: "k_valve", label: "Main fuel valve loss coefficient", component: "Main fuel valve", limit: 0.6, meaning: "Pressure drop per unit of flow squared across the valve, relative to its calibrated value." },
  { id: "k_cool", label: "Cooling circuit loss coefficient", component: "Regenerative cooling circuit", limit: 0.35, meaning: "Pressure drop per unit of flow squared through the cooling channels, relative to calibration." },
  { id: "k_inj_ox", label: "Oxidiser injector loss coefficient", component: "Injector, oxidiser side", limit: 0.7, meaning: "Injector pressure drop per unit of flow squared, relative to its cold-flow calibration." },
  { id: "k_inj_fu", label: "Fuel injector loss coefficient", component: "Injector, fuel side", limit: 0.7, meaning: "Injector pressure drop per unit of flow squared, relative to calibration." },
  { id: "eta_c", label: "Combustion efficiency", component: "Combustion chamber", limit: -0.05, meaning: "Chamber pressure produced, relative to what the measured flows and mixture ratio should produce." },
  { id: "npsh_ox", label: "Oxidiser pump suction margin", component: "Oxidiser feed system", limit: -0.4, meaning: "Suction head available at the pump inlet over the head the pump requires. Cavitation begins when the margin is used up." },
];

/**
 * Hidden parameters inferred from estimated measurements, each as a fractional departure from its calibrated value.
 * `expectedNpsh` is the suction margin the model expects at this operating point: the margin grows as the engine throttles down.
 */
export function healthDeviations(est: Values, pc: number, model: PlantParams, expectedNpsh: number): Record<HealthParamId, number> {
  const n = est[CH.speed] / 100;
  const fu = est[CH.mFu] / 100;
  const ox = est[CH.mOx] / 100;
  const fu2 = fu * fu;
  const ox2 = ox * ox;
  const mr = fu > 1e-3 ? ox / fu : 1;
  const required = NPSH_REQUIRED * n * n;
  const npsh = required > 1e-6 ? (est[CH.pInOx] - P_VAPOUR) / required : expectedNpsh;
  return {
    head_ox: ratio(est[CH.pOutOx] - est[CH.pInOx], model.aOx * n * n - model.bOx * ox2),
    head_fu: ratio(est[CH.pOutFu] - est[CH.pInFu], model.aFu * n * n - model.bFu * fu2),
    k_valve: ratio(est[CH.pOutFu] - est[CH.pCoolIn], model.kValveFu * fu2),
    k_cool: ratio(est[CH.pCoolIn] - est[CH.pCoolOut], model.kCool * fu2),
    k_inj_ox: ratio(est[CH.pInjOx] - pc, model.kInjOx * ox2),
    k_inj_fu: ratio(est[CH.pInjFu] - pc, model.kInjFu * fu2),
    eta_c: ratio(pc, 100 * model.etaC * cStarFactor(mr) * (W_OX * ox + W_FU * fu)),
    npsh_ox: Number.isFinite(expectedNpsh) && expectedNpsh > 1e-6 ? clamp(npsh / expectedNpsh - 1, -1.5, 1.5) : 0,
  };
}

/** Suction margin of the oxidiser pump at an operating point: available over required. */
export function npshRatio(values: Values): number {
  const n = values[CH.speed] / 100;
  return n > 0.05 ? (values[CH.pInOx] - P_VAPOUR) / (NPSH_REQUIRED * n * n) : Number.POSITIVE_INFINITY;
}

/**
 * The raw deviation behind each symptom, in its own unit: percent for
 * residuals, fraction for inferred parameters. `est` are estimated
 * measurements, `exp` what the model expects, `pc` the fused chamber pressure.
 */
export function symptomDeviations(est: Values, exp: Values, pc: number, health: Record<HealthParamId, number>): Record<SymptomId, number> {
  const residual = (i: number) => est[i] - exp[i];
  return {
    pc: pc - exp[CH.pcA],
    pc_ab: est[CH.pcA] - est[CH.pcB],
    thrust: residual(CH.thrust),
    head_ox: health.head_ox,
    p_tank_ox: residual(CH.pTankOx),
    p_in_ox: residual(CH.pInOx),
    p_out_ox: residual(CH.pOutOx),
    k_valve: health.k_valve,
    valve_pos: residual(CH.valvePos),
    p_out_fu: residual(CH.pOutFu),
    k_cool: health.k_cool,
    t_cool: residual(CH.tCool),
    k_inj_ox: health.k_inj_ox,
    m_ox: residual(CH.mOx),
    m_fu: residual(CH.mFu),
    speed: residual(CH.speed),
    vib: residual(CH.vib),
    eta_c: health.eta_c,
  };
}

/**
 * Chamber pressure from three routes that do not use a chamber pressure
 * sensor: back from each injector manifold through its calibrated pressure
 * drop, and from the thrust proxy. The middle value is robust to one route
 * being wrong, which is what makes it usable as a referee between sensors.
 */
export function virtualChamberPressure(est: Values, model: PlantParams): number {
  const ox = est[CH.mOx] / 100;
  const fu = est[CH.mFu] / 100;
  const routes = [est[CH.pInjOx] - model.kInjOx * ox * ox, est[CH.pInjFu] - model.kInjFu * fu * fu, est[CH.thrust] * 0.99 + 1].sort((a, b) => a - b);
  return routes[1];
}

export const symptomArray = (record: Record<SymptomId, number>) => SYMPTOM_IDS.map((id) => record[id]);
