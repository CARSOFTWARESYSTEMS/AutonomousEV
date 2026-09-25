"use client";
import { useState } from "react";
import { HISTORY } from "../data/stations";
import { source } from "../data/sources";
import { Badge } from "./ui";
import styles from "../station.module.css";

export default function HistoryTimeline() {
  const [i, setI] = useState(0);
  const h = HISTORY[i];
  return (
    <>
      {/* Phones: vertical timeline led by each generation's engineering lesson. */}
      <ol className={`${styles.roadmap} ${styles.mobileOnly}`} aria-label="Station generations and their engineering lessons">
        {HISTORY.map((e) => (
          <li key={e.era}>
            <h5>
              {e.era} <Badge label={e.status} />
            </h5>
            <p style={{ fontSize: 13 }}>{e.years}</p>
            <p style={{ color: "var(--space-text)" }}>{e.lesson}</p>
            <details className={styles.row} style={{ marginTop: 6 }}>
              <summary>What happened</summary>
              <p>{e.detail}</p>
              <p style={{ fontSize: 13 }}>
                Source:{" "}
                {e.sources.map((id, k) => (
                  <span key={id}>
                    {k > 0 && " · "}
                    <a className={styles.inlineLink} href={source(id).url} target="_blank" rel="noopener noreferrer">
                      {source(id).title}
                    </a>
                  </span>
                ))}
              </p>
            </details>
          </li>
        ))}
      </ol>
    <div className={`${styles.split} ${styles.desktopOnly}`}>
      <ol className={styles.stack} style={{ listStyle: "none", padding: 0, gap: 8 }} aria-label="Station generations">
        {HISTORY.map((e, k) => (
          <li key={e.era} style={{ margin: 0 }}>
            <button
              type="button"
              className={styles.treeNode}
              aria-pressed={k === i}
              onClick={() => setI(k)}
              style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <span>
                {e.era} <small>· {e.years}</small>
              </span>
              <Badge label={e.status} />
            </button>
          </li>
        ))}
      </ol>
      <article className={styles.card} aria-live="polite">
        <div className={styles.eyebrow}>
          {h.years} · <Badge label={h.status} />
        </div>
        <h3>{h.era}</h3>
        <p className={styles.callout} style={{ margin: "12px 0" }}>
          Engineering lesson: {h.lesson}
        </p>
        <p>{h.detail}</p>
        <p style={{ fontSize: 13 }}>
          Source:{" "}
          {h.sources.map((id, k) => (
            <span key={id}>
              {k > 0 && " · "}
              <a className={styles.inlineLink} href={source(id).url} target="_blank" rel="noopener noreferrer">
                {source(id).title}
              </a>
            </span>
          ))}
        </p>
        <div className={styles.presetRow}>
          <button type="button" className={styles.button} disabled={i === 0} onClick={() => setI(i - 1)}>
            Earlier
          </button>
          <button type="button" className={styles.button} disabled={i === HISTORY.length - 1} onClick={() => setI(i + 1)}>
            Later
          </button>
        </div>
      </article>
    </div>
    </>
  );
}
