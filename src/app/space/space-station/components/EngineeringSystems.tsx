"use client";
import { useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SYSTEMS } from "../data/systems";
import { useMode, atLeast } from "./ModeProvider";
import styles from "../station.module.css";

export default function EngineeringSystems() {
  const [id, setId] = useState(SYSTEMS[0].id);
  const { mode } = useMode();
  const selectId = useId();
  const i = SYSTEMS.findIndex((x) => x.id === id);
  const s = SYSTEMS[i];
  const prev = SYSTEMS[(i - 1 + SYSTEMS.length) % SYSTEMS.length];
  const next = SYSTEMS[(i + 1) % SYSTEMS.length];
  return (
    <div>
      {/* Desktop: tabs. */}
      <div className={`${styles.chips} ${styles.desktopOnly}`} role="tablist" aria-label="Station systems">
        {SYSTEMS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`sys-tab-${x.id}`}
            aria-selected={x.id === id}
            aria-controls="sys-panel"
            tabIndex={x.id === id ? 0 : -1}
            className={styles.chip}
            onClick={() => setId(x.id)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const n = SYSTEMS[(i + d + SYSTEMS.length) % SYSTEMS.length].id;
              setId(n);
              document.getElementById(`sys-tab-${n}`)?.focus();
            }}
          >
            {x.name}
          </button>
        ))}
      </div>
      {/* Phones: one picker instead of a wall of chips. */}
      <div className={`${styles.field} ${styles.mobileOnly}`}>
        <span>
          <label htmlFor={selectId}>
            System {i + 1} of {SYSTEMS.length}
          </label>
        </span>
        <select id={selectId} value={id} onChange={(e) => setId(e.target.value)}>
          {SYSTEMS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </div>

      <div id="sys-panel" role="tabpanel" aria-labelledby={`sys-tab-${s.id}`} className={styles.systemPanel}>
        <h3>{s.name}</h3>
        <p className={styles.systemLede}>{s.learn}</p>
        <ul className={styles.tagList} aria-label="Topics">
          {s.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {atLeast(mode, "engineering") ? (
          <details className={styles.row} open>
            <summary>How it works — engineering</summary>
            <p>{s.engineering}</p>
          </details>
        ) : (
          <p style={{ fontSize: 14 }}>Switch to Engineering mode for equations, architecture and trade-offs.</p>
        )}
        {atLeast(mode, "research") && (
          <details className={styles.row} open>
            <summary>Research directions</summary>
            <p>{s.research}</p>
          </details>
        )}
        <div className={`${styles.pager} ${styles.mobileOnly}`}>
          <button type="button" className={styles.button} onClick={() => setId(prev.id)}>
            <ChevronLeft size={16} aria-hidden="true" /> {prev.name}
          </button>
          <button type="button" className={styles.button} onClick={() => setId(next.id)}>
            {next.name} <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
