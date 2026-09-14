"use client";
import { useState } from "react";
import styles from "../model-rocketry.module.css";

interface CostTier {
  id: string;
  name: string;
  summary: string;
  categories: string[];
}

const TIERS: CostTier[] = [
  {
    id: "fundamentals",
    name: "Tier 1 — Fundamentals / Starter Learning",
    summary: "Learning physics, OpenRocket, simple educational kits and basic experiments.",
    categories: ["Airframe/structures (basic kit)", "Propulsion (small commercial motors)", "Simulation/software (free tools)"],
  },
  {
    id: "instrumented",
    name: "Tier 2 — Instrumented Learning Rocket",
    summary: "Adds sensors, data logging, a flight computer and structured testing.",
    categories: ["Airframe/structures", "Propulsion", "Avionics (flight computer)", "Sensors", "Recovery", "Simulation/software", "Testing (ground checks)"],
  },
  {
    id: "competition",
    name: "Tier 3 — Student Competition System",
    summary: "Adds engineering reviews, custom structures, more capable avionics, telemetry, ground systems, test articles and competition logistics.",
    categories: [
      "Airframe/structures (custom)",
      "Propulsion",
      "Avionics",
      "Sensors",
      "Recovery (redundant/tested)",
      "Telemetry",
      "Ground station",
      "Manufacturing",
      "Testing (multiple articles)",
      "Consumables",
      "Simulation/software",
      "Launch operations",
      "Travel/competition logistics",
    ],
  },
  {
    id: "research",
    name: "Tier 4 — Advanced Research Prototype",
    summary: "Adds advanced sensors, redundant systems, custom electronics, HIL, advanced simulation, research payloads and extensive validation.",
    categories: [
      "Airframe/structures (research-grade)",
      "Propulsion",
      "Avionics (custom electronics)",
      "Sensors (advanced/redundant)",
      "Recovery (redundant)",
      "Telemetry",
      "Ground station",
      "Manufacturing",
      "Testing (HIL, extensive validation)",
      "Consumables",
      "Simulation/software (advanced)",
      "Launch operations",
      "Research payload integration",
    ],
  },
];

const ALL_CATEGORIES = [
  "Airframe / structures",
  "Propulsion",
  "Avionics",
  "Sensors",
  "Recovery",
  "Telemetry",
  "Ground station",
  "Manufacturing",
  "Testing",
  "Consumables",
  "Simulation / software",
  "Launch operations",
  "Travel / competition",
];

export default function CostAnatomy() {
  const [activeTier, setActiveTier] = useState(TIERS[0].id);
  const tier = TIERS.find((t) => t.id === activeTier)!;

  return (
    <div>
      <p style={{ marginBottom: 20 }}>
        Model rocketry cost depends on mission objective, size, motor class, avionics, sensors, telemetry, recovery
        complexity, ground equipment, number of test articles, reusable equipment and manufacturing approach —
        there is no single meaningful headline figure. The tiers below describe what gets <em>added</em> at each
        stage, not fixed prices.
      </p>
      <div className={styles.workflowRail} role="tablist" aria-label="Cost tiers">
        {TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === activeTier}
            className={styles.workflowStep}
            onClick={() => setActiveTier(t.id)}
          >
            {t.name.split(" — ")[0]}
          </button>
        ))}
      </div>
      <div className={styles.workflowDetail} aria-live="polite">
        <h4 style={{ marginBottom: 6 }}>{tier.name}</h4>
        <p style={{ marginBottom: 14 }}>{tier.summary}</p>
        <dl style={{ margin: 0 }}>
          <dt>Cost categories at this tier</dt>
          <dd>
            <ul>
              {tier.categories.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </dd>
        </dl>
      </div>
      <h4 style={{ margin: "28px 0 12px" }}>Full cost anatomy (all categories)</h4>
      <div className={styles.careerGrid}>
        {ALL_CATEGORIES.map((cat) => (
          <div key={cat} className={styles.careerCard}>
            <h4 style={{ marginBottom: 0 }}>{cat}</h4>
          </div>
        ))}
      </div>
      <p className={styles.formNote} style={{ marginTop: 16 }}>
        No specific rupee figures are shown here because indicative prices vary significantly by supplier, region
        and configuration, and have not been independently re-verified for this page. Reusable ground/test equipment
        (e.g. a launch controller) should be budgeted separately from per-flight consumables (e.g. motors, igniters,
        recovery wadding), and travel/competition logistics are typically excluded from a rocket&apos;s own build
        cost.
      </p>
    </div>
  );
}
