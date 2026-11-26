// Coil windings for the pads and road segments. Original geometry (see
// docs/wireless-ev-charging-digital-twin/ASSET_LICENSES.md); the winding
// follows the simulated turn count and radii, so the picture is the model's
// geometry, not decoration.
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";

/** Planar Archimedean spiral of `turns` between rIn and rOut, as a tube of conductor diameter d, lying in the XZ plane at height y. */
export function spiralCoil(rIn: number, rOut: number, turns: number, d: number, y = 0): TubeGeometry {
  const n = Math.max(1, Math.round(turns));
  const pitch = (rOut - rIn) / n;
  const pts: Vector3[] = [];
  const perTurn = 72;
  const total = n * perTurn;
  for (let i = 0; i <= total; i++) {
    const a = (i / perTurn) * Math.PI * 2;
    const r = rIn + pitch * 0.5 + (pitch * i) / perTurn;
    pts.push(new Vector3(r * Math.cos(a), y, r * Math.sin(a)));
  }
  // Lead-out to the edge.
  const last = pts[pts.length - 1];
  pts.push(new Vector3(last.x + 0.03, y, last.z), new Vector3(rOut + 0.04, y, last.z));
  return new TubeGeometry(new CatmullRomCurve3(pts, false, "catmullrom", 0.2), total + 8, d / 2, 8, false);
}
