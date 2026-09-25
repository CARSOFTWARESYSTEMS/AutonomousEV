"use client";
import { useId, useState } from "react";
import { FRONTIERS } from "../data/research";
import { source } from "../data/sources";
import { useMode } from "./ModeProvider";
import styles from "../station.module.css";

export default function ResearchFrontier() {
  const [id, setId] = useState(FRONTIERS[0].id);
  const { mode, setMode } = useMode();
  const selectId = useId();
  const f = FRONTIERS.find((x) => x.id === id)!;
  const q = encodeURIComponent(f.search);
  const full = mode === "research";
  return (
    <div>
      <div className={`${styles.field} ${styles.mobileOnly}`}>
        <span>
          <label htmlFor={selectId}>Research theme ({FRONTIERS.length})</label>
        </span>
        <select id={selectId} value={id} onChange={(e) => setId(e.target.value)}>
          {FRONTIERS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <ul className={`${styles.chips} ${styles.desktopOnly}`} style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }} aria-label="Research themes">
        {FRONTIERS.map((x) => (
          <li key={x.id} style={{ margin: 0 }}>
            <button type="button" className={styles.chip} aria-pressed={x.id === id} onClick={() => setId(x.id)}>
              {x.name}
            </button>
          </li>
        ))}
      </ul>
      <article className={styles.card} aria-live="polite">
        <h3>{f.name}</h3>
        <div className={styles.grid2} style={{ marginTop: 12 }}>
          <div>
            <h4>Problem</h4>
            <p>{f.problem}</p>
            <h4>Why it matters</h4>
            <p>{f.why}</p>
            <h4>Current state</h4>
            <p>{f.current}</p>
            <h4>Research gap</h4>
            <p>{f.gap}</p>
          </div>
          {full ? (
            <div>
              <h4>Candidate hypothesis</h4>
              <p>{f.hypothesis}</p>
              <h4>Experimental approach</h4>
              <p>{f.experiment}</p>
              <h4>Simulation approach</h4>
              <p>{f.simulation}</p>
              <h4>Measurements</h4>
              <p>{f.measurements}</p>
            </div>
          ) : (
            <div className={styles.callout} style={{ alignSelf: "start" }}>
              <p style={{ color: "var(--space-text)" }}>Hypotheses, methods, validation, facilities, literature and PhD/postdoc questions are shown in Research mode.</p>
              <button type="button" className={styles.primaryButton} onClick={() => setMode("research")}>
                Switch to Research mode
              </button>
            </div>
          )}
        </div>
        {full && (
          <div className={styles.grid2}>
            <div>
              <h4>Validation</h4>
              <p>{f.validation}</p>
              <h4>Relevant facilities</h4>
              <p>{f.facilities}</p>
            </div>
            <div>
              <h4>Key authoritative literature</h4>
              <ul>
                {f.sources.map((sid) => (
                  <li key={sid}>
                    <a className={styles.inlineLink} href={source(sid).url} target="_blank" rel="noopener noreferrer">
                      {source(sid).org}: {source(sid).title}
                    </a>
                  </li>
                ))}
                <li>
                  <a className={styles.inlineLink} href={`https://ntrs.nasa.gov/search?q=${q}`} target="_blank" rel="noopener noreferrer">
                    NTRS search: “{f.search}”
                  </a>
                </li>
                <li>
                  <a className={styles.inlineLink} href={`https://scholar.google.com/scholar?q=${q}`} target="_blank" rel="noopener noreferrer">
                    Google Scholar search: “{f.search}”
                  </a>
                </li>
              </ul>
              <h4>Potential PhD / postdoc research questions</h4>
              <ul>
                {f.questions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
