import { angleCurve, solarPower, type SolarInputs } from "@/lib/satellite-energy-academy/solar";
import styles from "../academy.module.css";

export default function PowerGraph({ input }: { input: SolarInputs }) {
  const model = solarPower(input);
  const ceiling = Math.max(1, model.faceOnW);
  // SVG pixel precision avoids server/browser libm differences during hydration.
  // Numerical model outputs and challenge checks retain their full precision.
  const y = (power: number) => Number((185 - power / ceiling * 145).toFixed(3));
  const points = angleCurve(input).map(p => `${(50 + p.angleDeg / 90 * 350).toFixed(3)},${y(p.powerW)}`).join(" ");
  return <figure className={styles.graph}>
    <svg viewBox="0 0 450 235" role="img" aria-label={`Calculated power versus angle with current sunlight, area and efficiency. At 0 degrees: ${model.faceOnW.toFixed(1)} watts; at 60 degrees: ${(model.faceOnW / 2).toFixed(1)} watts; at 90 degrees: zero. Current point: ${input.angleDeg} degrees, ${model.electricalW.toFixed(1)} watts.`}>
      {[0, 0.5, 1].map(t => <g key={t}><path d={`M 50 ${y(t * ceiling)} H 400`} stroke="var(--space-border)" /><text x="43" y={y(t * ceiling) + 4} textAnchor="end">{(t * ceiling).toFixed(0)}</text></g>)}
      <path d="M 50 30 V 185 H 405" fill="none" stroke="var(--space-muted)" />
      <text x="50" y="20">Power (W)</text>
      {[0, 30, 60, 90].map(a => <text key={a} x={50 + a / 90 * 350} y="205" textAnchor="middle">{a}°</text>)}
      <text x="225" y="230" textAnchor="middle">Angle from panel normal</text>
      <polyline points={points} fill="none" stroke="var(--space-cyan-text)" strokeWidth="3" />
      <path d={`M ${50 + input.angleDeg / 90 * 350} 185 V ${y(model.electricalW)}`} stroke="var(--space-amber)" strokeDasharray="4 4" />
      <circle cx={50 + input.angleDeg / 90 * 350} cy={y(model.electricalW)} r="6" fill="var(--space-amber)" />
    </svg>
    <figcaption>Calculated curve · gold dot = your panel. The vertical scale adapts to the face-on power.</figcaption>
  </figure>;
}
