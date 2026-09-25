"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { LAB_TOPICS } from "../data/research";
import { source } from "../data/sources";
import { useMode, atLeast } from "./ModeProvider";
import styles from "../station.module.css";

// Shown first on phones; the remaining domains are one tap away.
const FEATURED = ["physiology", "biology", "fluids", "materials", "combustion", "manufacturing"];

export default function ResearchLab() {
  const [id, setId] = useState(LAB_TOPICS[0].id);
  const [showAll, setShowAll] = useState(false);
  const { mode } = useMode();
  const t = LAB_TOPICS.find((x) => x.id === id)!;
  const q = encodeURIComponent(t.search);
  const rows: [string, string, "learn" | "engineering" | "research"][] = [
    ["Research question", t.question, "learn"],
    ["Why microgravity?", t.whyMicrogravity, "learn"],
    ["Potential application", t.application, "learn"],
    ["Experimental variables", t.variables, "engineering"],
    ["Measurements", t.measurements, "engineering"],
    ["Controls", t.controls, "engineering"],
    ["Possible instrumentation", t.instrumentation, "engineering"],
    ["Safety", t.safety, "engineering"],
  ];
  return (
    <div className={styles.split}>
      <div className={styles.stack} role="tablist" aria-label="Research domains" aria-orientation="vertical" style={{ gap: 8 }}>
        {LAB_TOPICS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`lab-tab-${x.id}`}
            aria-selected={x.id === id}
            aria-controls="lab-panel"
            tabIndex={x.id === id ? 0 : -1}
            className={`${styles.treeNode} ${!showAll && !FEATURED.includes(x.id) && x.id !== id ? styles.mobileCollapsed : ""}`}
            style={{ width: "100%", flexWrap: "wrap" }}
            onClick={() => setId(x.id)}
            onKeyDown={(e) => {
              const i = LAB_TOPICS.findIndex((z) => z.id === id);
              const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const next = LAB_TOPICS[(i + d + LAB_TOPICS.length) % LAB_TOPICS.length].id;
              setId(next);
              document.getElementById(`lab-tab-${next}`)?.focus();
            }}
          >
            {x.name}
            <small>· {x.subtopics.join(", ")}</small>
          </button>
        ))}
        {!showAll && (
          <button type="button" className={`${styles.button} ${styles.mobileOnly}`} onClick={() => setShowAll(true)}>
            Explore all {LAB_TOPICS.length} research domains
          </button>
        )}
      </div>
      <article id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${t.id}`} className={styles.card}>
        <h3>{t.name}</h3>
        <ul className={styles.chips} style={{ listStyle: "none", padding: 0, margin: "10px 0" }} aria-label="Sub-topics">
          {t.subtopics.map((s) => (
            <li key={s} className={styles.tag} style={{ margin: 0 }}>{s}</li>
          ))}
        </ul>
        <dl className={styles.kv}>
          {rows.filter(([, , m]) => atLeast(mode, m)).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div>
            <dt>Key papers / resources</dt>
            <dd>
              <ul style={{ paddingLeft: 18 }}>
                {t.sources.map((sid) => (
                  <li key={sid}>
                    <a className={styles.inlineLink} href={source(sid).url} target="_blank" rel="noopener noreferrer">
                      {source(sid).org}: {source(sid).title}
                    </a>
                  </li>
                ))}
                {atLeast(mode, "research") && (
                  <>
                    <li>
                      <a className={styles.inlineLink} href={`https://ntrs.nasa.gov/search?q=${q}`} target="_blank" rel="noopener noreferrer">
                        NTRS search: “{t.search}” <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    </li>
                    <li>
                      <a className={styles.inlineLink} href={`https://scholar.google.com/scholar?q=${q}`} target="_blank" rel="noopener noreferrer">
                        Google Scholar search: “{t.search}” <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    </li>
                  </>
                )}
              </ul>
              <small style={{ color: "var(--space-muted)" }}>Search links are entry points; verify each paper at its publisher before citing.</small>
            </dd>
          </div>
        </dl>
        {!atLeast(mode, "engineering") && <p style={{ fontSize: 13, marginTop: 10 }}>Engineering mode adds variables, measurements, controls, instrumentation and safety. Research mode adds literature search entry points.</p>}
      </article>
    </div>
  );
}
