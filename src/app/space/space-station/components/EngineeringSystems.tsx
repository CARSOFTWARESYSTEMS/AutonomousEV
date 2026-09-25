"use client";
import { useState } from "react";
import { SYSTEMS } from "../data/systems";
import { useMode, atLeast } from "./ModeProvider";
import styles from "../station.module.css";

export default function EngineeringSystems() {
  const [id, setId] = useState(SYSTEMS[0].id);
  const { mode } = useMode();
  const s = SYSTEMS.find((x) => x.id === id)!;
  return (
    <div>
      <div className={styles.chips} role="tablist" aria-label="Station systems">
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
              const i = SYSTEMS.findIndex((q) => q.id === id);
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const next = SYSTEMS[(i + d + SYSTEMS.length) % SYSTEMS.length].id;
              setId(next);
              document.getElementById(`sys-tab-${next}`)?.focus();
            }}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div id="sys-panel" role="tabpanel" aria-labelledby={`sys-tab-${s.id}`} className={styles.card} style={{ marginTop: 14 }}>
        <h3>{s.name}</h3>
        <ul className={styles.chips} style={{ listStyle: "none", padding: 0, margin: "10px 0" }} aria-label="Topics">
          {s.topics.map((t) => (
            <li key={t} className={styles.tag} style={{ margin: 0 }}>
              {t}
            </li>
          ))}
        </ul>
        <h4>Concept</h4>
        <p>{s.learn}</p>
        {atLeast(mode, "engineering") ? (
          <>
            <h4>Engineering</h4>
            <p>{s.engineering}</p>
          </>
        ) : (
          <p style={{ fontSize: 13 }}>Switch to Engineering mode for equations, architecture and trade-offs.</p>
        )}
        {atLeast(mode, "research") && (
          <>
            <h4>Research directions</h4>
            <p>{s.research}</p>
          </>
        )}
      </div>
    </div>
  );
}
