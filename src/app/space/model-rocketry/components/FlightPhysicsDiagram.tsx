import styles from "../model-rocketry.module.css";

export default function FlightPhysicsDiagram() {
  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox="0 0 500 420"
        role="img"
        aria-label="A model rocket in flight with four labelled force arrows: thrust pushing up from the motor, weight pulling down from the centre of gravity, drag pushing down against the direction of travel, and a smaller aerodynamic side force near the fins that helps keep the rocket pointed straight."
        className={styles.diagramSvg}
      >
        <title>Four forces on a model rocket</title>
        <path d="M235 60 L265 60 L275 140 L225 140 Z" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
        <rect x="225" y="140" width="50" height="180" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
        <path d="M225 300 L195 340 L225 328 Z" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
        <path d="M275 300 L305 340 L275 328 Z" fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />

        <line x1="250" y1="380" x2="250" y2="330" stroke="var(--space-cyan-text)" strokeWidth="4" />
        <text x="255" y="400" fill="var(--space-cyan-text)" fontSize="16" fontWeight="700">Thrust ↑</text>

        <line x1="250" y1="200" x2="250" y2="250" stroke="var(--space-text)" strokeWidth="4" />
        <text x="255" y="240" fill="var(--space-text)" fontSize="16" fontWeight="700">Weight ↓</text>

        <line x1="250" y1="50" x2="250" y2="10" stroke="var(--space-amber)" strokeWidth="4" />
        <text x="255" y="30" fill="var(--space-amber)" fontSize="16" fontWeight="700">Drag ↓</text>

        <line x1="305" y1="315" x2="330" y2="300" stroke="var(--space-blue-text)" strokeWidth="3" />
        <text x="335" y="300" fill="var(--space-blue-text)" fontSize="13">Side force</text>
      </svg>
      <figcaption style={{ fontSize: 13, color: "var(--space-muted)", marginTop: 8 }}>
        Thrust pushes the rocket up from the motor. Weight (gravity) pulls it down through the centre of gravity.
        Drag opposes the direction of travel. A small aerodynamic side force near the fins keeps the rocket pointed
        into the wind, contributing to stability.
      </figcaption>
    </figure>
  );
}
