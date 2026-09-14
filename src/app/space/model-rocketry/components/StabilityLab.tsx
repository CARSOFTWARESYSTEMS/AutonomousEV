"use client";
import { useState } from "react";
import KnowledgeCheck from "./KnowledgeCheck";
import { useLearningLevel } from "./LearningLevelProvider";
import styles from "../model-rocketry.module.css";

const BODY_DIAMETER = 25; // mm — illustrative reference diameter for this demo, not a universal value
const NOSE_X = 40;
const TAIL_X = 460;

export default function StabilityLab() {
  const [cg, setCg] = useState(220);
  const [cp, setCp] = useState(300);
  const { isAtLeast } = useLearningLevel();

  const staticMargin = (cp - cg) / BODY_DIAMETER;
  const status = staticMargin < 0 ? "unstable" : staticMargin < 1 ? "marginal" : staticMargin <= 2 ? "stable" : "overstable";
  const statusLabel =
    status === "unstable" ? "Unstable configuration" : status === "marginal" ? "Low stability margin" : status === "stable" ? "Stable" : "Overstable (excessively sensitive to wind)";

  return (
    <div className={styles.stabilityLab}>
      <div className={styles.stabilitySvgWrap}>
        <svg
          viewBox="0 0 500 160"
          role="img"
          aria-label={`Rocket outline with the centre of gravity at ${cg} millimetres and the centre of pressure at ${cp} millimetres from the nose. Static margin is ${staticMargin.toFixed(2)} calibers, currently ${statusLabel}.`}
        >
          <line x1={NOSE_X} y1="80" x2={TAIL_X} y2="80" stroke="var(--space-border)" strokeWidth="14" strokeLinecap="round" />
          <path d={`M${NOSE_X - 10} 80 L${NOSE_X + 20} 62 L${NOSE_X + 20} 98 Z`} fill="var(--space-surface)" stroke="var(--space-border)" strokeWidth="2" />
          <circle cx={cg} cy="80" r="9" fill="var(--space-cyan-text)" />
          <text x={cg} y="60" fill="var(--space-cyan-text)" fontSize="13" textAnchor="middle">CG</text>
          <circle cx={cp} cy="80" r="9" fill="var(--space-amber)" />
          <text x={cp} y="112" fill="var(--space-amber)" fontSize="13" textAnchor="middle">CP</text>
        </svg>
      </div>
      <div className={styles.stabilityControls}>
        <label htmlFor="cg-slider">Centre of gravity position ({cg}mm from nose)</label>
        <input
          id="cg-slider"
          type="range"
          min={NOSE_X + 20}
          max={TAIL_X - 20}
          value={cg}
          onChange={(e) => setCg(Number(e.target.value))}
          aria-valuetext={`${cg} millimetres from the nose`}
        />
        <label htmlFor="cp-slider">Centre of pressure position ({cp}mm from nose)</label>
        <input
          id="cp-slider"
          type="range"
          min={NOSE_X + 20}
          max={TAIL_X - 20}
          value={cp}
          onChange={(e) => setCp(Number(e.target.value))}
          aria-valuetext={`${cp} millimetres from the nose`}
        />
        <p className={styles.stabilityReadout} data-status={status} aria-live="polite">
          Static margin: <strong>{staticMargin.toFixed(2)} calibers</strong> — {statusLabel}
        </p>
        {isAtLeast("advanced") && (
          <p style={{ fontSize: 13, color: "var(--space-muted)", marginBottom: 12 }}>
            Static margin here is (CP − CG) ÷ body diameter, a simplified illustrative model. Real designs also
            consider dynamic stability, changing CG as propellant burns, and aerodynamic uncertainty from
            simulation-versus-flight differences — a single static-margin number is a starting estimate, not a
            complete verification.
          </p>
        )}
        <KnowledgeCheck
          question="If you move the centre of gravity toward the nose while the centre of pressure stays fixed, does static margin increase or decrease?"
          answer="It increases. Static margin is (CP − CG) ÷ body diameter, so moving CG forward increases the gap between CP and CG, increasing the margin and making the rocket more stable — up to a point, since too much margin makes it overly sensitive to wind (a behaviour called weathercocking)."
        />
      </div>
    </div>
  );
}
