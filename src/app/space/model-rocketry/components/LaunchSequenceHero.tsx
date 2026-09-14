"use client";
import { useState } from "react";
import { useMediaQuery } from "./useMediaQuery";
import styles from "../model-rocketry.module.css";

interface FlightPhase {
  id: string;
  label: string;
  description: string;
  systems: string[];
}

const PHASES: FlightPhase[] = [
  { id: "ignition", label: "Ignition", description: "The motor lights and begins building thrust before the rocket starts moving.", systems: ["Propulsion", "Motor retention", "Ground system", "Launch controller"] },
  { id: "liftoff", label: "Lift-off", description: "Thrust exceeds weight and the rocket begins to accelerate upward off the pad.", systems: ["Propulsion", "Structures", "Launch rail"] },
  { id: "rail-exit", label: "Rail exit", description: "The rocket leaves the guide rail — aerodynamic surfaces now take over keeping it stable.", systems: ["Aerodynamics", "Structures", "Launch lug"] },
  { id: "powered-ascent", label: "Powered ascent", description: "The motor continues burning, accelerating the rocket while aerodynamic forces act on it.", systems: ["Propulsion", "Aerodynamics", "Structures", "Avionics", "Sensors"] },
  { id: "burnout", label: "Motor burnout", description: "The motor finishes burning propellant; thrust drops to zero and the rocket coasts on momentum.", systems: ["Propulsion (spent)", "Aerodynamics", "Avionics"] },
  { id: "coast", label: "Coast", description: "The rocket continues upward on momentum alone, decelerating under gravity and drag.", systems: ["Aerodynamics", "Avionics", "Sensors"] },
  { id: "apogee", label: "Apogee", description: "The rocket reaches its highest point — vertical velocity is momentarily zero.", systems: ["Flight computer", "Barometer / IMU", "Deployment logic"] },
  { id: "deployment", label: "Recovery deployment", description: "The flight computer triggers separation and the parachute deploys.", systems: ["Flight computer", "Deployment logic", "Recovery system"] },
  { id: "descent", label: "Descent", description: "The parachute slows the rocket for a safe landing while data continues to be recorded.", systems: ["Parachute", "Recovery", "Avionics", "Telemetry"] },
  { id: "landing", label: "Landing", description: "The rocket touches down at a safe descent rate, ready for recovery and inspection.", systems: ["Recovery", "Structures"] },
  { id: "telemetry-review", label: "Telemetry review", description: "The team reviews recorded data against the pre-flight simulation to learn from the flight.", systems: ["Flight-data analysis", "Telemetry", "Engineering review", "Verification"] },
];

export default function LaunchSequenceHero() {
  const [countdownDone, setCountdownDone] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const active = PHASES[activeIndex];

  if (reducedMotion) {
    return (
      <div className={styles.launchSequence}>
        <p style={{ marginBottom: 14 }}>
          A complete mission, phase by phase — from ignition to post-flight telemetry review.
        </p>
        <ol className={styles.reducedMotionList} aria-label="Model rocket flight phases">
          {PHASES.map((p) => (
            <li key={p.id} className={styles.reducedMotionItem}>
              <b>{p.label}</b>
              {p.description}
              <div className={styles.activeSystems} aria-label={`Active systems during ${p.label}`}>
                {p.systems.map((s) => (
                  <span key={s} className={styles.activeSystemPill}>
                    {s}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className={styles.launchSequence}>
      {!countdownDone ? (
        <div>
          <div className={styles.countdownRow} role="group" aria-label="Launch countdown">
            {["3", "2", "1", "IGNITION"].map((n) => (
              <div key={n} className={styles.countdownDigit} data-active={n === "IGNITION"} style={n === "IGNITION" ? { width: "auto", padding: "0 18px", fontSize: 16 } : undefined}>
                {n}
              </div>
            ))}
          </div>
          <button type="button" className={styles.primaryButton} onClick={() => setCountdownDone(true)}>
            Start the mission sequence
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.phaseRail} role="tablist" aria-label="Flight phases">
            {PHASES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                className={styles.phaseChip}
                onClick={() => setActiveIndex(i)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.phasePanel} role="tabpanel" aria-live="polite">
            <h3>{active.label}</h3>
            <p>{active.description}</p>
            <div className={styles.activeSystems} aria-label={`Active systems during ${active.label}`}>
              {active.systems.map((s) => (
                <span key={s} className={styles.activeSystemPill}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
              >
                ← Previous phase
              </button>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => setActiveIndex((i) => Math.min(PHASES.length - 1, i + 1))}
                disabled={activeIndex === PHASES.length - 1}
              >
                Next phase →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
