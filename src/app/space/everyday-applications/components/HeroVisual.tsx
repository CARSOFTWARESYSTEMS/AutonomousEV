import styles from "../everyday-applications.module.css";

const ORBIT_PATH = "M30,170 A130,55 0 1,0 290,170 A130,55 0 1,0 30,170";

const SERVICES = [
  { label: "Weather", x: 40, y: 60 },
  { label: "Navigation", x: 280, y: 70 },
  { label: "Data", x: 160, y: 20 },
];

export default function HeroVisual() {
  return (
    <div className={styles.heroVisualWrap} aria-hidden="true">
      <svg viewBox="0 0 320 320" className={styles.heroVisualSvg}>
        <defs>
          <radialGradient id="eaEarthGradient" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        {SERVICES.map((s) => (
          <line
            key={s.label}
            x1="160"
            y1="170"
            x2={s.x}
            y2={s.y}
            stroke="var(--space-border)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        <path d={ORBIT_PATH} fill="none" stroke="var(--space-border)" strokeWidth="1.5" strokeDasharray="4 5" />

        <circle cx="160" cy="170" r="72" fill="url(#eaEarthGradient)" stroke="var(--space-control-border)" strokeWidth="1.5" />
        <circle className={styles.heroVisualPulse} cx="195" cy="150" r="4" fill="var(--space-amber)" />

        {SERVICES.map((s) => (
          <g key={s.label}>
            <circle cx={s.x} cy={s.y} r="4" fill="var(--space-blue)" />
            <text x={s.x} y={s.y - 10} textAnchor="middle" fontSize="10" fill="var(--space-muted)">
              {s.label}
            </text>
          </g>
        ))}

        <g className={styles.heroVisualSatellite} style={{ offsetPath: `path('${ORBIT_PATH}')` }}>
          <rect x="-7" y="-4" width="14" height="8" rx="2" fill="var(--space-cyan-text)" />
          <line x1="-11" y1="0" x2="-16" y2="0" stroke="var(--space-cyan-text)" strokeWidth="1.5" />
          <line x1="11" y1="0" x2="16" y2="0" stroke="var(--space-cyan-text)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
