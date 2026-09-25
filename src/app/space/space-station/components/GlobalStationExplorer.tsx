"use client";
import { useState } from "react";
import { STATIONS, COMMERCIAL_STATIONS, CLD_CONTEXT, type Lifecycle } from "../data/stations";
import { source } from "../data/sources";
import { Badge } from "./ui";
import styles from "../station.module.css";

const FILTERS: { id: "all" | Lifecycle; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Operational", label: "Operational" },
  { id: "Under construction", label: "Under construction" },
  { id: "Development", label: "Development" },
  { id: "Planned", label: "Planned" },
];

export default function GlobalStationExplorer() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const show = (l: Lifecycle) => filter === "all" || filter === l;
  const stations = STATIONS.filter((s) => show(s.lifecycle));
  const commercial = COMMERCIAL_STATIONS.filter((s) => show(s.lifecycle));
  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter by lifecycle status" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={styles.chip} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <p className={styles.srOnly} aria-live="polite">
        Showing {stations.length + commercial.length} stations
      </p>
      <div className={styles.grid2}>
        {stations.map((s) => (
          <article key={s.id} className={styles.card} id={`station-${s.id}`}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <Badge label={s.lifecycle} />
              {s.id === "gateway" && <Badge label="Paused" />}
              <span style={{ fontSize: 13, color: "var(--space-muted)" }}>{s.operator}</span>
            </div>
            <h3>{s.name}</h3>
            <p style={{ fontSize: 14, marginTop: 6 }}>
              <b style={{ color: "var(--space-text)" }}>Status: </b>
              {s.statusNote}
            </p>
            <p style={{ fontSize: 15 }}>{s.summary}</p>
            <details className={styles.details} style={{ marginTop: 8 }}>
              <summary>Engineering highlights ({s.highlights.length})</summary>
              <div>
                <dl className={styles.kv}>
                  {s.highlights.map((h) => (
                    <div key={h.title}>
                      <dt>{h.title}</dt>
                      <dd>{h.text}</dd>
                    </div>
                  ))}
                </dl>
                <p style={{ fontSize: 13, marginTop: 10 }}>
                  Sources:{" "}
                  {s.sources.map((id, i) => (
                    <span key={id}>
                      {i > 0 && " · "}
                      <a className={styles.inlineLink} href={source(id).url} target="_blank" rel="noopener noreferrer">
                        {source(id).title}
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            </details>
          </article>
        ))}
      </div>

      {commercial.length > 0 && (
        <>
          <h3 className={styles.subhead}>Commercial LEO stations — a separate category</h3>
          <p>{CLD_CONTEXT}</p>
          <p style={{ fontSize: 14 }}>None of the commercial stations below is operational. Status reflects the cited operator or NASA statements.</p>
          <div className={styles.scrollX}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Commercial LEO stations and their lifecycle status</caption>
              <thead>
                <tr>
                  <th scope="col">Station</th>
                  <th scope="col">Developer</th>
                  <th scope="col">Lifecycle</th>
                  <th scope="col">Status (cited)</th>
                </tr>
              </thead>
              <tbody>
                {commercial.map((c) => (
                  <tr key={c.name}>
                    <th scope="row">{c.name}</th>
                    <td>{c.developer}</td>
                    <td>
                      <Badge label={c.lifecycle} />
                    </td>
                    <td>
                      {c.status}{" "}
                      {c.sources.map((id, i) => (
                        <span key={id}>
                          {i > 0 && " · "}
                          <a className={styles.inlineLink} href={source(id).url} target="_blank" rel="noopener noreferrer">
                            {source(id).org}
                          </a>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {stations.length + commercial.length === 0 && <p>No stations match this status.</p>}
    </>
  );
}
