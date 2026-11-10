// Design a Stable Model Rocket: centre of gravity from component masses and
// centre of pressure by the Barrowman method (subsonic flight, small angles
// of attack, thin flat fins, no transitions). Positions are millimetres from
// the nose tip. Masses and motor figures are illustrative teaching values,
// not data for any commercial motor or kit.
import type { Level } from "@/app/space/academy/data/curriculum";

export type NoseShape = "cone" | "ogive" | "parabolic";
export type MotorClass = "A" | "B" | "C";
export type RocketFault = "heavyMotor" | "lostBallast" | "finDamage";

export interface RocketDesign {
  noseShape: NoseShape;
  noseLengthMm: number;
  bodyLengthMm: number;
  finCount: 3 | 4;
  rootChordMm: number;
  tipChordMm: number;
  spanMm: number;
  /** Distance from the root chord's leading edge back to the tip chord's leading edge. */
  sweepMm: number;
  /** Clay in the nose cone. */
  ballastG: number;
  motor: MotorClass;
}

/** Body tube outer diameter; the reference length for calibres. */
export const DIAMETER_MM = 40;
export const MOTOR_LENGTH_MM = 70;

export const DEFAULT_ROCKET: RocketDesign = {
  noseShape: "ogive",
  noseLengthMm: 100,
  bodyLengthMm: 400,
  finCount: 3,
  rootChordMm: 50,
  tipChordMm: 30,
  spanMm: 30,
  sweepMm: 30,
  ballastG: 0,
  motor: "B",
};

export const LIMITS = {
  noseLengthMm: [60, 180, 5],
  bodyLengthMm: [250, 600, 10],
  rootChordMm: [30, 120, 5],
  tipChordMm: [0, 100, 5],
  spanMm: [20, 100, 5],
  sweepMm: [0, 80, 5],
  ballastG: [0, 40, 1],
} as const satisfies Record<string, readonly [number, number, number]>;

/** Barrowman nose-cone CP position as a fraction of nose length. */
export const NOSE_CP_FACTOR: Record<NoseShape, number> = { cone: 0.666, ogive: 0.466, parabolic: 0.5 };
export const NOSE_NAMES: Record<NoseShape, string> = { cone: "Conical", ogive: "Ogive", parabolic: "Parabolic" };

export const MOTORS: Record<MotorClass, { name: string; massG: number; averageThrustN: number; totalImpulseNs: number }> = {
  A: { name: "A-class (illustrative)", massG: 16, averageThrustN: 5, totalImpulseNs: 2.5 },
  B: { name: "B-class (illustrative)", massG: 20, averageThrustN: 6, totalImpulseNs: 5 },
  C: { name: "C-class (illustrative)", massG: 25, averageThrustN: 7, totalImpulseNs: 10 },
};

export const FAULTS: Record<RocketFault, { name: string; effect: string }> = {
  heavyMotor: { name: "Heavier motor", effect: "The motor is swapped for one 12 g heavier, at the tail." },
  lostBallast: { name: "Ballast falls out", effect: "The nose clay comes loose before launch." },
  finDamage: { name: "Damaged fins", effect: "Every fin loses 30% of its span, as if snapped in transport." },
};

// Illustrative material properties.
const NOSE_G_PER_MM = 0.15;
const BODY_G_PER_MM = 0.08;
/** 3 mm balsa at about 160 kg/m³: grams per mm² of fin area. */
const FIN_G_PER_MM2 = 0.00048;
const RECOVERY_G = 15;
const MOUNT_G = 6;
const G = 9.81;

export interface MassItem {
  id: "nose" | "ballast" | "body" | "recovery" | "fins" | "mount" | "motor";
  label: string;
  massG: number;
  xMm: number;
}

/** Apply a fault to a design for evaluation. */
export function withFault(design: RocketDesign, fault: RocketFault | null): { design: RocketDesign; extraMotorG: number } {
  if (fault === "lostBallast") return { design: { ...design, ballastG: 0 }, extraMotorG: 0 };
  if (fault === "finDamage") return { design: { ...design, spanMm: design.spanMm * 0.7 }, extraMotorG: 0 };
  if (fault === "heavyMotor") return { design, extraMotorG: 12 };
  return { design, extraMotorG: 0 };
}

export function totalLengthMm(d: RocketDesign) {
  return d.noseLengthMm + d.bodyLengthMm;
}

/** Fin leading-edge root position, from the nose tip: fins sit flush with the tail. */
export function finRootLeadingEdgeMm(d: RocketDesign) {
  return totalLengthMm(d) - d.rootChordMm;
}

export function massItems(d: RocketDesign, extraMotorG = 0): MassItem[] {
  const L = totalLengthMm(d);
  const finArea = ((d.rootChordMm + d.tipChordMm) / 2) * d.spanMm;
  const cr = d.rootChordMm;
  const ct = d.tipChordMm;
  // Centroid of a trapezoidal fin along the body axis, from its root leading edge.
  const finCentroid = (d.sweepMm * (cr + 2 * ct) + (cr * cr + cr * ct + ct * ct)) / (3 * (cr + ct || 1));
  return [
    { id: "nose", label: "Nose cone", massG: NOSE_G_PER_MM * d.noseLengthMm, xMm: (2 / 3) * d.noseLengthMm },
    { id: "ballast", label: "Nose ballast", massG: d.ballastG, xMm: 0.6 * d.noseLengthMm },
    { id: "body", label: "Body tube", massG: BODY_G_PER_MM * d.bodyLengthMm, xMm: d.noseLengthMm + d.bodyLengthMm / 2 },
    { id: "recovery", label: "Parachute and shock cord", massG: RECOVERY_G, xMm: d.noseLengthMm + 0.3 * d.bodyLengthMm },
    { id: "fins", label: `${d.finCount} fins`, massG: d.finCount * finArea * FIN_G_PER_MM2, xMm: finRootLeadingEdgeMm(d) + finCentroid },
    { id: "mount", label: "Motor mount", massG: MOUNT_G, xMm: L - MOTOR_LENGTH_MM / 2 },
    { id: "motor", label: MOTORS[d.motor].name, massG: MOTORS[d.motor].massG + extraMotorG, xMm: L - MOTOR_LENGTH_MM / 2 },
  ];
}

export function centreOfGravity(d: RocketDesign, extraMotorG = 0) {
  const items = massItems(d, extraMotorG);
  const massG = items.reduce((s, i) => s + i.massG, 0);
  const moment = items.reduce((s, i) => s + i.massG * i.xMm, 0);
  return { massG, xMm: moment / massG, items };
}

export interface CpResult {
  noseCn: number;
  noseXMm: number;
  finCn: number;
  finXMm: number;
  xMm: number;
  /** Fin mid-chord line length, mm. */
  midChordMm: number;
}

export function centreOfPressure(d: RocketDesign): CpResult {
  const D = DIAMETER_MM;
  const R = D / 2;
  const S = d.spanMm;
  const cr = d.rootChordMm;
  const ct = d.tipChordMm;
  const N = d.finCount;
  const noseCn = 2;
  const noseXMm = NOSE_CP_FACTOR[d.noseShape] * d.noseLengthMm;
  const midChordMm = Math.sqrt(S * S + (d.sweepMm + ct / 2 - cr / 2) ** 2);
  const interference = 1 + R / (S + R);
  const finCn = (interference * 4 * N * (S / D) ** 2) / (1 + Math.sqrt(1 + ((2 * midChordMm) / (cr + ct)) ** 2));
  const xb = finRootLeadingEdgeMm(d);
  const finXMm = xb + (d.sweepMm / 3) * ((cr + 2 * ct) / (cr + ct)) + (1 / 6) * (cr + ct - (cr * ct) / (cr + ct));
  const xMm = (noseCn * noseXMm + finCn * finXMm) / (noseCn + finCn);
  return { noseCn, noseXMm, finCn, finXMm, xMm, midChordMm };
}

export type StabilityStatus = "unstable" | "marginal" | "stable" | "overstable";

export function stabilityStatus(margin: number): StabilityStatus {
  // Rounded to the hundredth shown on screen, so the label always matches the number.
  const m = Math.round(margin * 100) / 100;
  if (m < 0) return "unstable";
  if (m < 1) return "marginal";
  if (m <= 2) return "stable";
  return "overstable";
}

export const STATUS_TEXT: Record<StabilityStatus, { label: string; flight: string }> = {
  unstable: { label: "Unstable", flight: "The CP is ahead of the CG. A gust tips the rocket and it tumbles or loops instead of flying straight." },
  marginal: { label: "Marginally stable", flight: "It may fly, but small errors in the CG, or a gust, could make it wobble or tumble. Aim for at least one calibre." },
  stable: { label: "Stable", flight: "The fins pull the tail back into line after a disturbance. The rocket flies straight." },
  overstable: { label: "Overstable", flight: "Very stable, but it turns sharply into any crosswind (weathercocking), which costs height and can carry it downrange." },
};

export interface RocketEvaluation {
  cg: ReturnType<typeof centreOfGravity>;
  cp: CpResult;
  margin: number;
  status: StabilityStatus;
  weightN: number;
  thrustToWeight: number;
}

export function evaluateRocket(design: RocketDesign, fault: RocketFault | null = null): RocketEvaluation {
  const { design: d, extraMotorG } = withFault(design, fault);
  const cg = centreOfGravity(d, extraMotorG);
  const cp = centreOfPressure(d);
  const margin = (cp.xMm - cg.xMm) / DIAMETER_MM;
  const weightN = (cg.massG / 1000) * G;
  return { cg, cp, margin, status: stabilityStatus(margin), weightN, thrustToWeight: MOTORS[d.motor].averageThrustN / weightN };
}

export const TW_GUIDELINE = 5;

export function checkRocket(design: RocketDesign, level: Level): { pass: boolean; messages: { pass: boolean; text: string }[] } {
  const base = evaluateRocket(design);
  const m = Math.round(base.margin * 100) / 100;
  const messages: { pass: boolean; text: string }[] = [
    {
      pass: m >= 1 && m <= 2,
      text: m >= 1 && m <= 2
        ? `Static margin ${m.toFixed(2)} calibres: inside the 1.0–2.0 target.`
        : `Static margin ${m.toFixed(2)} calibres: ${m < 1 ? "below" : "above"} the 1.0–2.0 target.`,
    },
  ];
  if (level === "advanced") {
    const heavy = evaluateRocket(design, "heavyMotor");
    const h = Math.round(heavy.margin * 100) / 100;
    messages.push({
      pass: h >= 1,
      text: h >= 1 ? `With the heavier motor the margin is ${h.toFixed(2)} calibres: still stable.` : `With the heavier motor the margin drops to ${h.toFixed(2)} calibres. It must stay at 1.0 or more.`,
    });
    const tw = Math.round(base.thrustToWeight * 10) / 10;
    messages.push({
      pass: tw >= TW_GUIDELINE,
      text: tw >= TW_GUIDELINE
        ? `Thrust-to-weight ${tw.toFixed(1)}: meets this lesson's guideline of ${TW_GUIDELINE}.`
        : `Thrust-to-weight ${tw.toFixed(1)} is below this lesson's guideline of ${TW_GUIDELINE}. Lighten the rocket or choose a stronger motor.`,
    });
  }
  return { pass: messages.every((x) => x.pass), messages };
}
