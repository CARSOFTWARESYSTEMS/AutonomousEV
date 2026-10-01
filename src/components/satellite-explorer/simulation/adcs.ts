// Attitude determination and control model. Attitudes are ideal pointing laws;
// reaction-wheel speeds follow from momentum exchange with the body. Body
// axes: +Y is the zenith face, −Y is the payload / X-band boresight, +Z is the
// solar-cell normal.
import type { AttitudeMode, Quat, Vec3 } from "../types";
import { DEG, cross, dot, easeInOutCubic, length, normalize, quatConjugate, quatFromBasis, quatMultiply, quatRotate, reject, scale, sub } from "../lib/math";

export const ADCS_REFERENCE = {
  /** Wheel speed change per unit body rate: ratio of body to wheel inertia. */
  rpmPerDegPerS: 1000,
  /** Momentum bias each wheel runs at so it never dwells at zero speed. */
  biasRpm: [1200, -900, 1500, 0] as const,
  maxRpm: 6000,
  pointingAccuracyDeg: 0.05,
} as const;

export const WHEEL_AXES = ["X", "Y", "Z", "R"] as const;
export type WheelAxis = (typeof WHEEL_AXES)[number];

/** Spin axis of the skewed redundant wheel, in body coordinates. */
export const REDUNDANT_WHEEL_AXIS: Vec3 = normalize([1, 1, 1]);

export interface AttitudeContext {
  position: Vec3;
  velocityDir: Vec3;
  sunDir: Vec3;
  /** Inertial point the boresight should track (target or ground station). */
  aimPoint?: Vec3;
}

function basisToQuat(yAxis: Vec3, zHint: Vec3, fallback: Vec3): Quat {
  let z = reject(zHint, yAxis);
  if (length(z) < 1e-4) z = reject(fallback, yAxis);
  z = normalize(z);
  return quatFromBasis(cross(yAxis, z), yAxis, z);
}

/** Ideal body-to-inertial attitude for a pointing mode. */
export function attitudeFor(mode: AttitudeMode, ctx: AttitudeContext): Quat {
  const zenith = normalize(ctx.position);
  switch (mode) {
    case "SUN_POINTING": {
      // Solar-cell normal straight at the Sun; long axis as close to zenith as it can be.
      const z = normalize(ctx.sunDir);
      let y = reject(zenith, z);
      if (length(y) < 1e-4) y = reject(ctx.velocityDir, z);
      y = normalize(y);
      return quatFromBasis(cross(y, z), y, z);
    }
    case "TARGET_TRACK":
    case "STATION_TRACK": {
      if (!ctx.aimPoint) return attitudeFor("NADIR", ctx);
      const boresight = normalize(sub(ctx.aimPoint, ctx.position));
      return basisToQuat(scale(boresight, -1), ctx.sunDir, ctx.velocityDir);
    }
    case "NADIR":
    default:
      // Boresight to Earth's centre, yawed so the arrays see as much Sun as possible.
      return basisToQuat(zenith, ctx.sunDir, ctx.velocityDir);
  }
}

/** Cosine of the Sun's incidence angle on the solar cells for an attitude. */
export const sunIncidenceCos = (attitude: Quat, sunDir: Vec3) => dot(quatRotate(attitude, [0, 0, 1]), sunDir);

/** Body-frame angular rate (rad/s) that takes attitude `a` to `b` in dtS seconds. */
export function bodyRate(a: Quat, b: Quat, dtS: number): Vec3 {
  let d = quatMultiply(quatConjugate(a), b);
  if (d[3] < 0) d = [-d[0], -d[1], -d[2], -d[3]];
  const sinHalf = Math.hypot(d[0], d[1], d[2]);
  if (sinHalf < 1e-9 || dtS <= 0) return [0, 0, 0];
  const angle = 2 * Math.atan2(sinHalf, d[3]);
  return scale([d[0] / sinHalf, d[1] / sinHalf, d[2] / sinHalf], angle / dtS);
}

/**
 * Wheel speeds for a body rate. Angular momentum is conserved: for the body
 * to turn one way about an axis, that axis' wheel must spin the other way.
 * The redundant wheel idles unless called on.
 */
export function wheelSpeedsRpm(rateRadS: Vec3): [number, number, number, number] {
  const bias = ADCS_REFERENCE.biasRpm;
  const limit = (v: number) => Math.max(-ADCS_REFERENCE.maxRpm, Math.min(ADCS_REFERENCE.maxRpm, v));
  const delta = (i: 0 | 1 | 2) => -(rateRadS[i] / DEG) * ADCS_REFERENCE.rpmPerDegPerS;
  return [limit(bias[0] + delta(0)), limit(bias[1] + delta(1)), limit(bias[2] + delta(2)), bias[3]];
}

// ── Interactive slew demonstration ────────────────────────────────────────
export const SLEW_DEMO = {
  angleDeg: 40,
  durationS: 4.5,
  /** Demo wheel response, amplified so the counter-rotation is easy to read. */
  rpmPerDegPerS: 170,
} as const;

export interface SlewDemoSample {
  /** Body rotation about the chosen axis, degrees. */
  angleDeg: number;
  /** Body rate about that axis, degrees per second. */
  rateDegS: number;
  /** Speed change of the wheel on that axis, rpm (opposite sign to the body rate). */
  wheelDeltaRpm: number;
  done: boolean;
}

/** Eased out-and-hold rotation used by the ADCS demonstration. */
export function slewDemoAt(elapsedS: number, direction: 1 | -1 = 1): SlewDemoSample {
  const { angleDeg, durationS, rpmPerDegPerS } = SLEW_DEMO;
  const s = Math.min(1, Math.max(0, elapsedS / durationS));
  const eps = 1e-3;
  const rate = ((easeInOutCubic(Math.min(1, s + eps)) - easeInOutCubic(Math.max(0, s - eps))) / (2 * eps)) * (angleDeg / durationS);
  const moving = s > 0 && s < 1;
  const rateDegS = moving ? rate * direction : 0;
  return {
    angleDeg: angleDeg * easeInOutCubic(s) * direction,
    rateDegS,
    wheelDeltaRpm: -rateDegS * rpmPerDegPerS,
    done: s >= 1,
  };
}
