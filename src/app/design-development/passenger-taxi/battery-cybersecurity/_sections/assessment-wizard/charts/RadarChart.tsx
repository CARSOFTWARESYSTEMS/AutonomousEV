import type { TrustDimension } from "@/lib/battery-cybersecurity/types";
import { ALL_TRUST_DIMENSIONS } from "@/lib/battery-cybersecurity/wizardScoring";

export const DIMENSION_LABELS: Record<TrustDimension, string> = {
  identity: "Identity",
  integrity: "Integrity",
  authenticity: "Authenticity",
  availability: "Availability",
  safety: "Safety",
  evidence: "Evidence",
  resilience: "Resilience",
  detection: "Detection",
  verification: "Verification",
};

const CX = 150;
const CY = 150;
const R = 105;
const AXIS_COUNT = ALL_TRUST_DIMENSIONS.length;
const RINGS = [0.25, 0.5, 0.75, 1];

function pointOnAxis(index: number, fraction: number) {
  const angle = (index / AXIS_COUNT) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + R * fraction * Math.cos(angle), y: CY + R * fraction * Math.sin(angle) };
}

// Decorative — the same dimension scores are always rendered as accessible
// text/ProgressBars alongside this chart (see BatteryTrustScoreSection), so
// this SVG is marked aria-hidden rather than duplicating an aria-label.
export function RadarChart({ dimensionScores }: { dimensionScores: Record<TrustDimension, number> }) {
  const dataPoints = ALL_TRUST_DIMENSIONS.map((d, i) => pointOnAxis(i, Math.max(0, Math.min(100, dimensionScores[d])) / 100));
  const polygonPath = dataPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <svg width={300} height={300} viewBox="0 0 300 300" aria-hidden="true">
      {RINGS.map((ring) => {
        const ringPoints = Array.from({ length: AXIS_COUNT }, (_, i) => pointOnAxis(i, ring));
        return (
          <polygon
            key={ring}
            points={ringPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth={1}
          />
        );
      })}

      {ALL_TRUST_DIMENSIONS.map((d, i) => {
        const outer = pointOnAxis(i, 1);
        return <line key={d} x1={CX} y1={CY} x2={outer.x} y2={outer.y} stroke="rgba(148,163,184,0.18)" strokeWidth={1} />;
      })}

      <polygon points={polygonPath} fill="rgba(34,211,238,0.18)" stroke="#22d3ee" strokeWidth={2} />

      {dataPoints.map((p, i) => (
        <circle key={ALL_TRUST_DIMENSIONS[i]} cx={p.x} cy={p.y} r={3} fill="#22d3ee" />
      ))}

      {ALL_TRUST_DIMENSIONS.map((d, i) => {
        const labelPoint = pointOnAxis(i, 1.22);
        return (
          <text
            key={d}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="rgba(234,247,241,0.7)"
          >
            {DIMENSION_LABELS[d]}
          </text>
        );
      })}
    </svg>
  );
}
