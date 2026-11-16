import type { SolarInputs } from "@/lib/satellite-energy-academy/solar";
import { solarPower } from "@/lib/satellite-energy-academy/solar";
import styles from "../academy.module.css";

/** Edge-on section: the normal, panel and angle all use the model's angle. */
export default function SolarDiagram({ input }: { input: SolarInputs }) {
  const r = input.angleDeg * Math.PI / 180;
  const c = Math.cos(r), s = Math.sin(r);
  const model = solarPower(input);
  const half = Number((60 + 25 * Math.sqrt(input.areaM2)).toFixed(3));
  return (
    <svg viewBox="0 0 480 300" className={styles.diagram} role="img" aria-label={`Panel edge view: sunlight travels from left to right. The front normal is ${input.angleDeg} degrees from the direction to the Sun. Generated power is ${model.electricalW.toFixed(1)} watts. Schematic, not to scale.`}>
      <circle cx="52" cy="145" r="27" fill="var(--space-amber)" opacity={input.irradianceWm2 === 0 ? 0.15 : 0.9} />
      <circle cx="52" cy="145" r="38" fill="var(--space-amber)" opacity="0.1" />
      <text x="24" y="214">Sun</text>
      <g stroke="var(--space-amber)" strokeWidth="2" opacity={input.irradianceWm2 / 1400}>
        {[100, 145, 190].map(y => <g key={y}><path d={`M 98 ${y} H 202`} /><path d={`M 194 ${y - 5} L 202 ${y} L 194 ${y + 5}`} fill="none" /></g>)}
      </g>
      <text x="108" y="72">Incoming sunlight</text>
      <path d="M 300 145 H 224" stroke="var(--space-muted)" strokeDasharray="4 4" />
      <path d={`M 255 145 A 45 45 0 0 1 ${(300 - 45 * c).toFixed(3)} ${(145 - 45 * s).toFixed(3)}`} stroke="var(--space-amber)" fill="none" strokeWidth="2" />
      <text x="215" y="124">{input.angleDeg}°</text>
      <g transform={`translate(300 145) rotate(${input.angleDeg})`}>
        <path d={`M 0 ${-half} V ${half}`} stroke="var(--space-blue)" strokeWidth="10" />
        <path d={`M -6 ${-half} V ${half}`} stroke="var(--space-cyan-text)" strokeWidth="2" />
        <path d="M 0 0 H -90 M -82 -5 L -90 0 L -82 5" fill="none" stroke="var(--space-cyan-text)" strokeWidth="2" />
      </g>
      <circle cx="300" cy="145" r="4" fill="var(--space-text)" />
      <text x="322" y="244">Panel edge</text>
      <text x="24" y="278" fill="var(--space-cyan-text)">Cyan arrow: front normal (perpendicular to panel)</text>
    </svg>
  );
}
