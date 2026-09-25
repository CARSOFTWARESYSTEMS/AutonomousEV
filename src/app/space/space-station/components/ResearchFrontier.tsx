"use client";
import { useId, useState } from "react";
import { FRONTIERS } from "../data/research";
import { source } from "../data/sources";
import { useMode } from "./ModeProvider";
import styles from "../station.module.css";
import rw from "./research.module.css";

// Featured on phones before the full list of themes.
const FEATURED = ["regen-eclss", "autonomy", "digital-twin", "medicine", "robotics", "radiation"];

export default function ResearchFrontier() {
  const [id, setId] = useState(FRONTIERS[0].id);
  const [showAll, setShowAll] = useState(false);
  const [q, setQ] = useState("");
  const { mode, setMode } = useMode();
  const searchId = useId();
  const needle = q.trim().toLowerCase();
  const list = FRONTIERS.filter((x) => !needle || `${x.name} ${x.problem} ${x.gap}`.toLowerCase().includes(needle));
  const f = FRONTIERS.find((x) => x.id === id)!;
  const search = encodeURIComponent(f.search);
  const full = mode === "research";
  const sections: [string, React.ReactNode][] = [
    ["Problem", f.problem],
    ["Why it matters", f.why],
    ["Current state", f.current],
    ["Research gap", f.gap],
  ];
  const deep: [string, React.ReactNode][] = [
    ["Candidate hypothesis", f.hypothesis],
    ["Experimental approach", f.experiment],
    ["Simulation approach", f.simulation],
    ["Measurements", f.measurements],
    ["Validation", f.validation],
    ["Relevant facilities", f.facilities],
  ];

  return (
    <div className={rw.workspace}>
      <nav className={rw.sidebar} aria-label="Research themes">
        <label htmlFor={searchId} className={styles.srOnly}>
          Filter research themes
        </label>
        <input id={searchId} type="search" className={styles.search} placeholder={`Filter ${FRONTIERS.length} themes`} value={q} onChange={(e) => setQ(e.target.value)} />
        <ol className={rw.topicList}>
          {list.map((x) => (
            <li key={x.id} className={!showAll && !needle && !FEATURED.includes(x.id) && x.id !== id ? styles.mobileCollapsed : undefined}>
              <button
                type="button"
                aria-current={x.id === id ? "true" : undefined}
                onClick={() => {
                  setId(x.id);
                  if (window.matchMedia?.("(max-width: 1024px)").matches) document.getElementById("frontier-topic")?.scrollIntoView?.({ block: "start" });
                }}
              >
                <span className={rw.topicNum}>{String(FRONTIERS.indexOf(x) + 1).padStart(2, "0")}</span>
                {x.name}
              </button>
            </li>
          ))}
          {list.length === 0 && <li className={rw.empty}>No themes match.</li>}
        </ol>
        {!showAll && !needle && (
          <button type="button" className={`${styles.button} ${styles.mobileOnly}`} onClick={() => setShowAll(true)}>
            Explore all {FRONTIERS.length} research themes
          </button>
        )}
      </nav>

      <article className={rw.pane} aria-live="polite" aria-labelledby="frontier-topic">
        <div className={styles.eyebrow}>
          Theme {FRONTIERS.indexOf(f) + 1} of {FRONTIERS.length}
        </div>
        <h3 id="frontier-topic" className={rw.paneTitle}>
          {f.name}
        </h3>
        <dl className={rw.fields}>
          {sections.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {full ? (
          <>
            <h4>Hypothesis, method &amp; validation</h4>
            <dl className={rw.fields}>
              {deep.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className={rw.twoCol}>
              <div>
                <h4>Key authoritative literature</h4>
                <ul className={rw.refs}>
                  {f.sources.map((sid) => (
                    <li key={sid}>
                      <a className={styles.inlineLink} href={source(sid).url} target="_blank" rel="noopener noreferrer">
                        {source(sid).org}: {source(sid).title}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a className={styles.inlineLink} href={`https://ntrs.nasa.gov/search?q=${search}`} target="_blank" rel="noopener noreferrer">
                      NTRS search: “{f.search}”
                    </a>
                  </li>
                  <li>
                    <a className={styles.inlineLink} href={`https://scholar.google.com/scholar?q=${search}`} target="_blank" rel="noopener noreferrer">
                      Google Scholar search: “{f.search}”
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Potential PhD / postdoc research questions</h4>
                <ul className={rw.refs}>
                  {f.questions.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className={rw.gate}>
            <p>Hypotheses, experimental and simulation approaches, measurements, validation, facilities, literature and PhD/postdoc questions are shown in Research mode.</p>
            <button type="button" className={styles.primaryButton} onClick={() => setMode("research")}>
              Switch to Research mode
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
