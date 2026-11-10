// Side view of the rocket for the 2D fallback: outline, fins, motor, and the
// CG and CP markers with the static margin between them.
import type { Scene2DState } from "../../viewer/controller";
import { DIAMETER_MM, MOTOR_LENGTH_MM, finRootLeadingEdgeMm, totalLengthMm, type RocketDesign } from "./model";
import { finOutline, noseProfile } from "./geometry";

interface Props extends Scene2DState {
  design: RocketDesign;
  cgMm: number;
  cpMm: number;
  selected: "cg" | "cp" | null;
}

export default function Rocket2D({ design: d, cgMm, cpMm, exploded, labels }: Props) {
  const L = totalLengthMm(d);
  const R = DIAMETER_MM / 2;
  const ex = exploded ? 1 : 0;
  const noseDx = -50 * ex;
  const motorDx = 90 * ex;
  const nose = noseProfile(d.noseShape, d.noseLengthMm);
  const top = nose.map(([x, r]) => `${x + noseDx},${-r}`).join(" ");
  const bottom = [...nose].reverse().map(([x, r]) => `${x + noseDx},${r}`).join(" ");
  const xb = finRootLeadingEdgeMm(d);
  const fin = finOutline(d);
  const finTop = fin.map(([x, y]) => `${xb + x},${-(R + y + 10 * ex)}`).join(" ");
  const finBottom = fin.map(([x, y]) => `${xb + x},${R + y + 10 * ex}`).join(" ");
  const margin = (cpMm - cgMm) / DIAMETER_MM;
  const pad = 70;
  const minX = -pad + noseDx;
  const width = L + 2 * pad + motorDx - noseDx;
  const height = 2 * (R + d.spanMm + 10 * ex) + 120;
  return (
    <svg viewBox={`${minX} ${-height / 2} ${width} ${height}`} role="img" aria-label={`Side view of the rocket, ${L} mm long. Centre of gravity ${cgMm.toFixed(0)} mm and centre of pressure ${cpMm.toFixed(0)} mm from the nose: static margin ${margin.toFixed(2)} calibres.`}>
      <polygon points={`${top} ${bottom}`} fill="#e5e7eb" />
      <rect x={d.noseLengthMm} y={-R} width={d.bodyLengthMm} height={2 * R} fill="#3b5bdb" />
      <polygon points={finTop} fill="#f59e0b" />
      <polygon points={finBottom} fill="#f59e0b" />
      <rect x={L - MOTOR_LENGTH_MM + motorDx} y={-9} width={MOTOR_LENGTH_MM} height={18} fill="#78716c" stroke={ex ? "none" : "#0b0e22"} strokeDasharray={ex ? undefined : "4 3"} opacity={ex ? 1 : 0.55} />
      {/* CG marked above the body, CP below, so the two never collide when they are close. */}
      {[
        { x: cgMm, color: "#67e8f9", label: "CG", side: -1 },
        { x: cpMm, color: "#fcd34d", label: "CP", side: 1 },
      ].map((m) => (
        <g key={m.label}>
          <line x1={m.x} x2={m.x} y1={-R - 8} y2={R + 8} stroke={m.color} strokeWidth={4} />
          <circle cx={m.x} cy={m.side * (R + 16)} r={7} fill={m.color} />
          {labels && (
            <text x={m.x + 12} y={m.side * (R + 16)} dy="0.35em" fontSize={20} fontWeight={800} fill={m.color} paintOrder="stroke" stroke="#070917" strokeWidth={4}>
              {m.label}
            </text>
          )}
        </g>
      ))}
      {labels && (
        <g>
          <line x1={Math.min(cgMm, cpMm)} x2={Math.max(cgMm, cpMm)} y1={R + d.spanMm + 10 * ex + 30} y2={R + d.spanMm + 10 * ex + 30} stroke="#e6e8f5" strokeWidth={2} />
          <text x={(cgMm + cpMm) / 2} y={R + d.spanMm + 10 * ex + 54} textAnchor="middle" fontSize={20} fontWeight={700} fill="#e6e8f5">
            Static margin {margin.toFixed(2)} cal
          </text>
        </g>
      )}
    </svg>
  );
}
