"use client";

// Reusable, accessible diagram components for the Model Rocketry learning
// guide. Every diagram carries a real text alternative: an aria-label on the
// SVG (or container), plus a visible caption underneath restating the same
// information in words, so nothing here depends on an image loading or on
// interpreting a picture alone.

import styles from "./page.module.css";

export function StepFlow({
  steps,
  ariaLabel,
}: {
  steps: string[];
  ariaLabel: string;
}) {
  return (
    <div className={styles.stepFlow} role="list" aria-label={ariaLabel}>
      {steps.map((step, i) => (
        <span key={step} className={styles.stepFlowItem}>
          <span className={styles.stepFlowChip} role="listitem">
            <span className={styles.stepFlowIndex}>{i + 1}</span>
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className={styles.stepFlowArrow} aria-hidden="true">
              →
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

const partLabels: { y: number; label: string }[] = [
  { y: 60, label: "Nose cone" },
  { y: 150, label: "Payload / experiment section" },
  { y: 230, label: "Recovery compartment (parachute bay)" },
  { y: 310, label: "Avionics bay" },
  { y: 390, label: "Couplers & bulkheads (section joints)" },
  { y: 470, label: "Fins" },
  { y: 520, label: "Motor & motor mount" },
  { y: 566, label: "Motor retention" },
];

export function RocketAnatomyDiagram() {
  return (
    <figure className={styles.diagramFigure}>
      <svg
        viewBox="0 0 820 620"
        role="img"
        aria-label="Labelled side view of a model rocket, showing the nose cone at the top, then the payload section, recovery compartment, avionics bay and couplers inside the airframe, with fins, the motor and motor mount, and motor retention at the base. Launch-rail buttons sit on the side of the airframe."
        className={styles.diagramSvg}
      >
        <title>Model rocket anatomy</title>
        {/* nose cone */}
        <path d="M240 20 L280 20 L300 140 L220 140 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />
        {/* body tube */}
        <rect x="220" y="140" width="80" height="340" fill="#0A2E1D" stroke="var(--accent-primary)" strokeWidth="2" />
        {/* section joints */}
        {[140, 220, 300, 380].map((y) => (
          <line key={y} x1="220" y1={y} x2="300" y2={y} stroke="rgba(76,169,48,0.6)" strokeWidth="2" strokeDasharray="4 3" />
        ))}
        {/* rail buttons */}
        <rect x="212" y="250" width="8" height="16" fill="var(--accent-primary)" />
        <rect x="212" y="440" width="8" height="16" fill="var(--accent-primary)" />
        {/* motor section */}
        <rect x="235" y="480" width="50" height="70" fill="#123420" stroke="var(--accent-primary)" strokeWidth="2" />
        {/* motor retention ring */}
        <rect x="230" y="550" width="60" height="10" fill="var(--accent-primary)" />
        {/* fins (two visible) */}
        <path d="M220 460 L170 560 L220 540 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />
        <path d="M300 460 L350 560 L300 540 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />

        {/* leader lines + labels */}
        {partLabels.map((p, i) => (
          <g key={p.label}>
            <line x1="300" y1={p.y} x2="400" y2={40 + i * 70} stroke="rgba(234,247,241,0.35)" strokeWidth="1.5" />
            <circle cx="300" cy={p.y} r="3" fill="var(--accent-primary)" />
            <text x="405" y={44 + i * 70} fill="var(--text-secondary)" fontSize="15">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className={styles.diagramCaption}>
        Top to bottom: nose cone, payload/experiment section, recovery compartment, avionics bay, couplers and
        bulkheads at each section joint, fins, motor and motor mount, and motor retention at the base. Small rail
        buttons on the side of the airframe engage the launch rail.
      </figcaption>
    </figure>
  );
}

export function FourForcesDiagram() {
  return (
    <figure className={styles.diagramFigure}>
      <svg
        viewBox="0 0 500 420"
        role="img"
        aria-label="A model rocket in flight with four labelled force arrows: thrust pushing up from the motor, weight pulling down from the centre of gravity, drag pushing down against the direction of travel, and a smaller aerodynamic side force near the fins that helps keep the rocket pointed straight."
        className={styles.diagramSvg}
      >
        <title>Four forces on a model rocket</title>
        {/* rocket body */}
        <path d="M235 60 L265 60 L275 140 L225 140 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />
        <rect x="225" y="140" width="50" height="180" fill="#0A2E1D" stroke="var(--accent-primary)" strokeWidth="2" />
        <path d="M225 300 L195 340 L225 328 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />
        <path d="M275 300 L305 340 L275 328 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />

        {/* thrust arrow (down at base, pointing up = force direction) */}
        <line x1="250" y1="380" x2="250" y2="330" stroke="#4CA930" strokeWidth="4" markerEnd="url(#arrowUp)" />
        <text x="255" y="400" fill="var(--accent-primary)" fontSize="16" fontWeight="700">Thrust ↑</text>

        {/* weight arrow (from CG, pointing down) */}
        <line x1="250" y1="200" x2="250" y2="250" stroke="#EAF7F1" strokeWidth="4" markerEnd="url(#arrowDown)" />
        <text x="255" y="240" fill="var(--text-primary)" fontSize="16" fontWeight="700">Weight ↓</text>

        {/* drag arrow (opposing motion, pointing down from nose) */}
        <line x1="120" y1="90" x2="120" y2="150" stroke="#FF9F45" strokeWidth="4" markerEnd="url(#arrowDown2)" />
        <text x="40" y="175" fill="#FF9F45" fontSize="16" fontWeight="700">Drag ↓</text>

        {/* side force near fins */}
        <line x1="380" y1="300" x2="330" y2="290" stroke="#3B82F6" strokeWidth="4" markerEnd="url(#arrowLeft)" />
        <text x="360" y="270" fill="#93C5FD" fontSize="14" fontWeight="700">Aerodynamic side force</text>

        <defs>
          <marker id="arrowUp" markerWidth="8" markerHeight="8" refX="4" refY="0" orient="auto">
            <path d="M0,8 L4,0 L8,8 Z" fill="#4CA930" />
          </marker>
          <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto">
            <path d="M0,0 L4,8 L8,0 Z" fill="#EAF7F1" />
          </marker>
          <marker id="arrowDown2" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto">
            <path d="M0,0 L4,8 L8,0 Z" fill="#FF9F45" />
          </marker>
          <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
            <path d="M8,0 L0,4 L8,8 Z" fill="#3B82F6" />
          </marker>
        </defs>
      </svg>
      <figcaption className={styles.diagramCaption}>
        Thrust pushes the rocket up from the motor; weight pulls it down through its centre of gravity; drag resists
        its motion through the air; and a smaller aerodynamic side force, mainly from the fins, keeps it pointed the
        right way.
      </figcaption>
    </figure>
  );
}

export function CgCpDiagram() {
  return (
    <figure className={styles.diagramFigure}>
      <svg
        viewBox="0 0 560 220"
        role="img"
        aria-label="A horizontal rocket outline with the centre of gravity marked ahead of the centre of pressure. The distance between the two, divided by the body diameter, is the static margin."
        className={styles.diagramSvg}
      >
        <title>Centre of gravity ahead of centre of pressure</title>
        <path d="M40 100 L100 80 L100 120 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />
        <rect x="100" y="80" width="340" height="40" fill="#0A2E1D" stroke="var(--accent-primary)" strokeWidth="2" />
        <path d="M440 80 L500 60 L500 140 L440 120 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />

        {/* CG marker */}
        <circle cx="220" cy="100" r="7" fill="#4CA930" />
        <line x1="220" y1="100" x2="220" y2="40" stroke="#4CA930" strokeWidth="2" />
        <text x="185" y="30" fill="var(--accent-primary)" fontSize="16" fontWeight="700">CG</text>

        {/* CP marker */}
        <circle cx="320" cy="100" r="7" fill="#FF9F45" />
        <line x1="320" y1="100" x2="320" y2="40" stroke="#FF9F45" strokeWidth="2" />
        <text x="300" y="30" fill="#FF9F45" fontSize="16" fontWeight="700">CP</text>

        {/* margin bracket */}
        <line x1="220" y1="160" x2="320" y2="160" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <line x1="220" y1="150" x2="220" y2="170" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <line x1="320" y1="150" x2="320" y2="170" stroke="var(--text-secondary)" strokeWidth="1.5" />
        <text x="225" y="190" fill="var(--text-secondary)" fontSize="14">
          Static margin = (CP − CG) ÷ body diameter
        </text>
      </svg>
      <figcaption className={styles.diagramCaption}>
        For a stable rocket, the centre of gravity (CG) generally sits ahead of the centre of pressure (CP). The
        exact acceptable margin always comes from the official rulebook or a validated analysis, never a rule of
        thumb.
      </figcaption>
    </figure>
  );
}

export function LaunchRailDiagram() {
  return (
    <figure className={styles.diagramFigure}>
      <svg
        viewBox="0 0 320 460"
        role="img"
        aria-label="A launch rail standing at an angle from a base plate, with a rocket's rail buttons sliding along the rail. The usable rail length is marked as shorter than the rail's total physical length."
        className={styles.diagramSvg}
      >
        <title>Launch rail and usable rail length</title>
        {/* base */}
        <rect x="60" y="420" width="200" height="16" fill="#123420" stroke="var(--accent-primary)" strokeWidth="2" />
        {/* rail */}
        <line x1="150" y1="420" x2="150" y2="40" stroke="var(--accent-primary)" strokeWidth="6" />
        {/* usable length bracket */}
        <line x1="120" y1="380" x2="120" y2="90" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="112" y1="380" x2="128" y2="380" stroke="#93C5FD" strokeWidth="2" />
        <line x1="112" y1="90" x2="128" y2="90" stroke="#93C5FD" strokeWidth="2" />
        <text x="30" y="230" fill="#93C5FD" fontSize="14" fontWeight="700" transform="rotate(-90 45 230)">
          Usable rail length
        </text>
        {/* rocket with rail buttons */}
        <rect x="132" y="150" width="36" height="180" fill="#0A2E1D" stroke="var(--accent-primary)" strokeWidth="2" />
        <path d="M132 150 L150 100 L168 150 Z" fill="#0E3A26" stroke="var(--accent-primary)" strokeWidth="2" />
        <rect x="146" y="200" width="8" height="14" fill="#4CA930" />
        <rect x="146" y="280" width="8" height="14" fill="#4CA930" />
        <text x="180" y="205" fill="var(--text-secondary)" fontSize="13">
          Rail button
        </text>
      </svg>
      <figcaption className={styles.diagramCaption}>
        The rail guides the rocket only until it has enough speed for its fins to keep it stable. Usable rail
        length is the travel the vehicle actually gets, not the rail&apos;s full physical length — the two are not
        the same number.
      </figcaption>
    </figure>
  );
}

export function AvionicsBlockDiagram() {
  const box = (label: string) => (
    <div className={styles.avionicsBox}>{label}</div>
  );
  return (
    <figure className={styles.diagramFigure}>
      <div
        className={styles.avionicsGrid}
        role="img"
        aria-label="Avionics block diagram: sensors feed the flight computer, which is powered by the power system. The flight computer sends data to storage and telemetry, and sends commands to deployment."
      >
        <div className={styles.avionicsRow}>
          {box("Sensors")}
          <span className={styles.avionicsArrow} aria-hidden="true">→</span>
          {box("Flight computer")}
          <span className={styles.avionicsArrow} aria-hidden="true">→</span>
          {box("Storage")}
          <span className={styles.avionicsArrow} aria-hidden="true">→</span>
          {box("Telemetry")}
        </div>
        <div className={styles.avionicsRow}>
          {box("Power")}
          <span className={styles.avionicsArrowUp} aria-hidden="true">↑</span>
          <span className={styles.avionicsSpacer} />
          <span className={styles.avionicsArrowDown} aria-hidden="true">↓</span>
          {box("Deployment")}
        </div>
      </div>
      <figcaption className={styles.diagramCaption}>
        Sensors feed the flight computer; the power system feeds the flight computer directly. The flight computer
        writes to storage, sends telemetry to the ground, and commands deployment events.
      </figcaption>
    </figure>
  );
}
