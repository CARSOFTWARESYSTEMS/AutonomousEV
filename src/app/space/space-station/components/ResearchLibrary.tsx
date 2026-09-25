"use client";
import { useId, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SOURCES, REGIONS, LAST_REVIEWED, LAST_REVIEWED_LABEL, type Region } from "../data/sources";
import styles from "../station.module.css";

export default function ResearchLibrary() {
  const [region, setRegion] = useState<Region | "All">("All");
  const [q, setQ] = useState("");
  const searchId = useId();
  const needle = q.trim().toLowerCase();
  const items = SOURCES.filter(
    (s) => (region === "All" || s.region === region) && (!needle || `${s.org} ${s.title} ${s.domain} ${s.note}`.toLowerCase().includes(needle)),
  );
  return (
    <div>
      <div className={styles.libTools}>
        <div>
          <label htmlFor={searchId} className={styles.srOnly}>
            Search the library
          </label>
          <input id={searchId} type="search" className={styles.search} placeholder="Search organisations, topics or titles" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span style={{ fontSize: 14, color: "var(--space-muted)" }} aria-live="polite">
          {items.length} of {SOURCES.length} resources
        </span>
      </div>
      <div className={styles.chips} role="group" aria-label="Filter by region or type" style={{ marginBottom: 14 }}>
        {(["All", ...REGIONS] as const).map((r) => (
          <button key={r} type="button" className={styles.chip} aria-pressed={region === r} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
      </div>
      <ul className={styles.libList}>
        {items.map((s) => (
          <li key={s.id} className={styles.libItem}>
            <div className={styles.libMeta}>
              <span className={styles.tag}>{s.region}</span>
              <span>{s.org}</span>
              <span>· {s.domain}</span>
            </div>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
              <ExternalLink size={14} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
            <p>{s.note}</p>
            <small style={{ color: "var(--space-muted)", fontSize: 12 }}>
              Last verified <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>
              {"accessNote" in s && s.accessNote ? ` · ${s.accessNote}` : ""}
            </small>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>No resources match. Try another search term or region.</p>}
    </div>
  );
}
