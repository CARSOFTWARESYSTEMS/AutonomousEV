// Top view of the orbit for the 2D fallback: Earth, its shadow, the orbit and
// the satellite's current position, drawn to the same scale as the 3D scene.
import type { Scene2DState } from "../../viewer/controller";
import { EARTH_RADIUS_KM } from "./model";
import { orbitAngle } from "./geometry";

interface Props extends Scene2DState {
  altitudeKm: number;
  phase: number;
  sunlit: boolean;
  safe: boolean;
}

const K = 100 / EARTH_RADIUS_KM;

export default function Orbit2D({ altitudeKm, phase, sunlit, safe, labels }: Props) {
  const r = (EARTH_RADIUS_KM + altitudeKm) * K;
  const a = orbitAngle(phase, altitudeKm);
  // SVG y grows downward; the scene's +z maps to +y here.
  const x = r * Math.cos(a);
  const y = r * Math.sin(a);
  const state = safe ? "safe mode" : sunlit ? "in sunlight" : "in Earth's shadow";
  return (
    <svg viewBox="-260 -175 520 350" role="img" aria-label={`Top view: the CubeSat orbits ${altitudeKm} km above Earth and is ${state}. The Sun is to the right; Earth's shadow extends to the left.`}>
      <rect x={-260} y={-100} width={260} height={200} fill="rgba(0,0,0,0.45)" />
      <circle r={100} fill="#1d4ed8" />
      <path d="M 0 -100 A 100 100 0 0 0 0 100 Z" fill="#020617" opacity={0.6} />
      <circle r={r} fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="5 4" />
      <circle cx={232} cy={0} r={16} fill="#fcd34d" />
      {[-60, 0, 60].map((dy) => (
        <line key={dy} x1={205} x2={160} y1={dy} y2={dy} stroke="#fcd34d" strokeWidth={2} markerEnd="url(#arrow)" />
      ))}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fcd34d" />
        </marker>
      </defs>
      <rect x={x - 8} y={y - 8} width={16} height={16} rx={2} fill={safe ? "#f59e0b" : sunlit ? "#e5e7eb" : "#64748b"} stroke="#0b0e22" strokeWidth={2} />
      {labels && (
        <g fontSize={14} fontWeight={700} fill="#e6e8f5" paintOrder="stroke" stroke="#070917" strokeWidth={3}>
          <text x={0} y={5} textAnchor="middle">
            Earth
          </text>
          <text x={-250} y={-108}>Earth&apos;s shadow</text>
          <text x={232} y={34} textAnchor="middle">
            Sun
          </text>
          <text x={x} y={y - 16} textAnchor="middle" fill="#fcd34d">
            CubeSat · {state}
          </text>
        </g>
      )}
    </svg>
  );
}
