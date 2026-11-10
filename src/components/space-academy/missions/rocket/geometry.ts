// Shapes shared by the 3D model and the 2D side view, in millimetres from the
// nose tip. Nose profiles use the standard definitions: conical, tangent
// ogive, and the parabolic series with K = 1.
import { DIAMETER_MM, type NoseShape, type RocketDesign } from "./model";

/** [x from the tip, radius] pairs from tip to base. */
export function noseProfile(shape: NoseShape, lengthMm: number, steps = 24): [number, number][] {
  const R = DIAMETER_MM / 2;
  const L = lengthMm;
  const rho = (R * R + L * L) / (2 * R);
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * L;
    let r: number;
    if (shape === "cone") r = (R * x) / L;
    else if (shape === "ogive") r = Math.sqrt(Math.max(0, rho * rho - (L - x) * (L - x))) + R - rho;
    else r = R * (2 * (x / L) - (x / L) * (x / L));
    pts.push([x, Math.max(0, Math.min(R, r))]);
  }
  return pts;
}

/** The fin's outline in its own plane: x along the body from the root leading edge, y outward from the body. */
export function finOutline(d: RocketDesign): [number, number][] {
  return [
    [0, 0],
    [d.rootChordMm, 0],
    [d.sweepMm + d.tipChordMm, d.spanMm],
    [d.sweepMm, d.spanMm],
  ];
}
