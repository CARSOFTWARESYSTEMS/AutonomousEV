import type { RocketComponent } from "../rocketData";
import { SYSTEM_COLORS } from "../rocketData";
import styles from "../model-rocketry.module.css";

const VIEW_W = 400;
const VIEW_H = 800;

export default function RocketDiagram({
  components,
  selectedId,
  onSelect,
}: {
  components: RocketComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="Interactive cutaway diagram of a model rocket. Select a highlighted point to learn about that component."
      className={styles.rocketDiagramSvg}
    >
      <title>Model rocket cutaway explorer</title>
      {/* nose cone */}
      <path d="M180 20 L220 20 L235 110 L165 110 Z" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
      {/* body tube */}
      <rect x="165" y="110" width="70" height="560" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
      {/* section joints */}
      {[220, 340, 460, 580].map((y) => (
        <line key={y} x1="165" y1={y} x2="235" y2={y} stroke="var(--space-border)" strokeWidth="2" strokeDasharray="4 3" />
      ))}
      {/* fins */}
      <path d="M165 640 L110 760 L165 730 Z" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
      <path d="M235 640 L290 760 L235 730 Z" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
      {/* motor */}
      <rect x="180" y="670" width="40" height="90" fill="var(--space-surface-soft)" stroke="var(--space-border)" strokeWidth="2" />
      {/* launch lug */}
      <rect x="240" y="380" width="8" height="30" fill="var(--space-border)" />

      {components.map((c) => {
        const cx = c.location.x * VIEW_W;
        const cy = c.location.y * VIEW_H;
        const selected = c.id === selectedId;
        const color = SYSTEM_COLORS[c.system];
        return (
          <g
            key={c.id}
            role="button"
            tabIndex={0}
            aria-label={c.name}
            aria-pressed={selected}
            className={styles.hitTarget}
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          >
            <circle cx={cx} cy={cy} r={selected ? 10 : 8} fill={color} fillOpacity={selected ? 1 : 0.85} stroke="var(--space-background)" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}
