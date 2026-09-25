"use client";
import { useId, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SOURCES, LAST_REVIEWED, LAST_REVIEWED_LABEL, type Region } from "../data/sources";
import styles from "../station.module.css";
import rw from "./research.module.css";

// Filters use the agency names researchers search by; each maps to registry regions.
const FILTERS: { label: string; regions: Region[] }[] = [
  { label: "All", regions: [] },
  { label: "India", regions: ["India"] },
  { label: "NASA & US", regions: ["United States"] },
  { label: "ESA", regions: ["Europe"] },
  { label: "JAXA", regions: ["Japan"] },
  { label: "CSA", regions: ["Canada"] },
  { label: "China", regions: ["China"] },
  { label: "Russia", regions: ["Russia"] },
  { label: "Commercial", regions: ["Commercial"] },
  { label: "Academic & standards", regions: ["Academic", "Standards"] },
];

const PAGE = 16;

export default function ResearchLibrary() {
  const [filter, setFilter] = useState(FILTERS[0]);
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const searchId = useId();
  const needle = q.trim().toLowerCase();
  const items = SOURCES.filter(
    (s) => (filter.regions.length === 0 || filter.regions.includes(s.region)) && (!needle || `${s.org} ${s.title} ${s.domain} ${s.note}`.toLowerCase().includes(needle)),
  );
  const shown = showAll || needle || filter.regions.length ? items : items.slice(0, PAGE);
  return (
    <div>
      <div className={rw.toolbar}>
        <label htmlFor={searchId} className={styles.srOnly}>
          Search the library
        </label>
        <input id={searchId} type="search" className={styles.search} placeholder="Search organisations, topics or titles" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className={rw.filters} role="group" aria-label="Filter by organisation">
          {FILTERS.map((f) => (
            <button key={f.label} type="button" className={rw.filter} aria-pressed={filter.label === f.label} onClick={() => setFilter(f)}>
              {f.label}
            </button>
          ))}
        </div>
        <span className={rw.count} aria-live="polite">
          {items.length} of {SOURCES.length} resources · verified <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>
        </span>
      </div>
      <ul className={rw.rows}>
        {shown.map((s) => (
          <li key={s.id} className={rw.row}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={rw.rowTitle}>
              {s.title}
              <ExternalLink size={13} aria-hidden="true" />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
            <span className={rw.rowMeta}>
              <b>{s.org}</b> · {s.domain} · {s.region}
            </span>
            <span className={rw.rowNote}>
              {s.note}
              {"accessNote" in s && s.accessNote ? ` (${s.accessNote})` : ""}
            </span>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>No resources match. Try another search term or filter.</p>}
      {shown.length < items.length && (
        <button type="button" className={styles.button} style={{ marginTop: 14 }} onClick={() => setShowAll(true)}>
          Show all {items.length} resources
        </button>
      )}
    </div>
  );
}
