import styles from "../satellite.module.css";
import { GATE_ORDER } from "../programData";

const subsystems: [string, string][] = [
  ["Payload", "Optical EO"],
  ["ADCS", "3-axis · RW + MTQ"],
  ["EPS", "Deployable solar + Li-ion"],
  ["TT&C", "S-band"],
  ["Downlink", "X-band"],
  ["OBC", "Flight computer + edge"],
  ["FDIR", "Safe mode"],
  ["End of life", "Disposal strategy"],
];

const gates = GATE_ORDER;

// Illustrative reference-architecture panel. The schematic is decorative
// (aria-hidden); every fact it hints at is carried by the HTML grid below it
// so nothing depends on SVG text that would shrink unreadably on phones.
export default function HeroVisual() {
  return (
    <figure className={styles.heroPanel} aria-labelledby="hero-panel-title">
      <div className={styles.heroPanelHead}>
        <div>
          <p className={styles.panelLabel}>Reference spacecraft</p>
          <p id="hero-panel-title" className={styles.heroPanelTitle}>
            6U Earth Observation Satellite
          </p>
        </div>
        <span className={styles.heroPanelTag}>SSO · 500–550 km</span>
      </div>

      <svg className={styles.heroSchematic} viewBox="0 0 440 200" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="se-earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E2A5A" />
            <stop offset="1" stopColor="#090B1D" />
          </linearGradient>
          <linearGradient id="se-fov" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#67E8F9" stopOpacity="0.28" />
            <stop offset="1" stopColor="#67E8F9" stopOpacity="0" />
          </linearGradient>
          <pattern id="se-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#7C3AED" strokeOpacity="0.12" strokeWidth="0.6" />
          </pattern>
        </defs>

        <rect width="440" height="200" fill="url(#se-grid)" />

        {/* Earth limb */}
        <circle cx="220" cy="430" r="262" fill="url(#se-earth)" stroke="#3B82F6" strokeOpacity="0.55" strokeWidth="1.2" />
        <circle cx="220" cy="430" r="270" fill="none" stroke="#3B82F6" strokeOpacity="0.14" strokeWidth="6" />

        {/* Orbit track */}
        <ellipse cx="220" cy="118" rx="196" ry="46" fill="none" stroke="#93C5FD" strokeOpacity="0.2" strokeWidth="1" transform="rotate(-7 220 118)" />
        <ellipse
          className={styles.orbitFlow}
          cx="220"
          cy="118"
          rx="196"
          ry="46"
          fill="none"
          stroke="#B39DDB"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeDasharray="2 10"
          transform="rotate(-7 220 118)"
        />

        {/* Payload field of view to nadir */}
        <path d="M318 104 L296 186 L342 186 Z" fill="url(#se-fov)" />

        {/* Downlink to ground station */}
        <path d="M312 100 L118 186" stroke="#67E8F9" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 5" />
        <path d="M112 190 L118 180 L124 190 Z" fill="none" stroke="#67E8F9" strokeOpacity="0.8" strokeWidth="1.2" />

        {/* Spacecraft: 6U bus with deployable arrays */}
        <g transform="translate(318 96)">
          <rect x="-40" y="-6" width="30" height="12" rx="1.5" fill="#1B2150" stroke="#93C5FD" strokeOpacity="0.8" strokeWidth="1" />
          <path d="M-30 -6V6M-20 -6V6M-40 0H-10" stroke="#93C5FD" strokeOpacity="0.35" strokeWidth="0.6" />
          <rect x="10" y="-6" width="30" height="12" rx="1.5" fill="#1B2150" stroke="#93C5FD" strokeOpacity="0.8" strokeWidth="1" />
          <path d="M20 -6V6M30 -6V6M10 0H40" stroke="#93C5FD" strokeOpacity="0.35" strokeWidth="0.6" />
          <rect x="-8" y="-12" width="16" height="24" rx="2" fill="#2A1F5E" stroke="#B39DDB" strokeWidth="1.2" />
          <path d="M-8 -4H8M-8 4H8M0 -12V12" stroke="#B39DDB" strokeOpacity="0.45" strokeWidth="0.6" />
          <circle cx="0" cy="12" r="2" fill="#67E8F9" />
        </g>

        {/* Body-frame triad */}
        <g transform="translate(360 56)" strokeWidth="1" fill="none">
          <path d="M0 0H16" stroke="#93C5FD" strokeOpacity="0.6" />
          <path d="M0 0V-16" stroke="#B39DDB" strokeOpacity="0.6" />
          <path d="M0 0L-10 9" stroke="#67E8F9" strokeOpacity="0.6" />
        </g>

        {/* Telemetry trace */}
        <path
          d="M18 40 L40 40 L48 30 L58 50 L66 36 L76 40 L98 40 L106 34 L114 44 L122 40 L142 40"
          fill="none"
          stroke="#67E8F9"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <path d="M18 56 H142" stroke="#FFFFFF" strokeOpacity="0.08" />
        <path d="M18 64 H112" stroke="#B39DDB" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 74 H86" stroke="#93C5FD" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <dl className={styles.subsystemGrid}>
        {subsystems.map(([name, value]) => (
          <div key={name} className={styles.subsystem}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.gateStrip}>
        <p className={styles.panelLabel}>Review gates</p>
        <ol className={styles.gateTrack}>
          {gates.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ol>
      </div>

      <figcaption className={styles.heroPanelCaption}>Illustrative reference architecture — an educational mission, not a flight design.</figcaption>
    </figure>
  );
}
