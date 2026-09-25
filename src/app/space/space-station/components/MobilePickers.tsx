"use client";
// Phone-only "one item at a time" presentations for comparison and
// cybersecurity content. The same data is server-rendered for desktop.
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { ENV_COMPARISON, type EnvKey } from "../data/stations";
import { CYBER_TOPICS } from "../data/operations";
import styles from "../station.module.css";

const ENV_LABEL: Record<EnvKey, string> = { leo: "Low Earth orbit station", lunarOrbit: "Lunar-orbit station", lunarSurface: "Lunar-surface habitat" };

export function FactorCompare() {
  const [v, setV] = useState(ENV_COMPARISON[0].variable);
  const row = ENV_COMPARISON.find((r) => r.variable === v)!;
  return (
    <div>
      <div className={styles.chips} role="group" aria-label="Compare one factor">
        {ENV_COMPARISON.map((r) => (
          <button key={r.variable} type="button" className={styles.chip} aria-pressed={r.variable === v} onClick={() => setV(r.variable)}>
            {r.variable}
          </button>
        ))}
      </div>
      <ol className={styles.compareStack} aria-live="polite" aria-label={`${v}: low Earth orbit to lunar surface`}>
        {(Object.keys(ENV_LABEL) as EnvKey[]).map((k, i) => (
          <li key={k}>
            {i > 0 && <ArrowDown size={16} aria-hidden="true" className={styles.compareArrow} />}
            <span>{ENV_LABEL[k]}</span>
            <b>{row.values[k]}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CyberAreas() {
  const [n, setN] = useState(CYBER_TOPICS[0].name);
  const t = CYBER_TOPICS.find((c) => c.name === n)!;
  return (
    <div>
      <div className={styles.chips} role="group" aria-label="Defensive areas">
        {CYBER_TOPICS.map((c) => (
          <button key={c.name} type="button" className={styles.chip} aria-pressed={c.name === n} onClick={() => setN(c.name)}>
            {c.name}
          </button>
        ))}
      </div>
      <div className={styles.pickDetail} aria-live="polite">
        <h4>{t.name}</h4>
        <p>{t.text}</p>
      </div>
    </div>
  );
}
