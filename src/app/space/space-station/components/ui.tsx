// Server-safe presentational helpers shared by every section.
import { ExternalLink, ShieldAlert } from "lucide-react";
import { source, LAST_REVIEWED, LAST_REVIEWED_LABEL, type SourceId } from "../data/sources";
import styles from "../station.module.css";

export function SectionHead({ eyebrow, title, id, children }: { eyebrow: string; title: string; id?: string; children?: React.ReactNode }) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h2 id={id}>{title}</h2>
      {children}
    </div>
  );
}

const TONE: Record<string, string> = {
  Operational: "ok",
  Demonstrated: "ok",
  "Demonstrated (2025)": "ok",
  Planned: "plan",
  "Planned (2028 target)": "plan",
  "Planned (2035 target)": "plan",
  "Under Development": "dev",
  "Under development": "dev",
  Development: "dev",
  Emerging: "dev",
  "Under construction": "build",
  Concept: "concept",
  Proposed: "concept",
  "Government vision (2040)": "concept",
  Retired: "retired",
  Historical: "retired",
  Paused: "warn",
};

/** Status label: always text (never colour alone), with a tone for emphasis. */
export function Badge({ label }: { label: string }) {
  return (
    <span className={styles.badge} data-tone={TONE[label] ?? "dev"}>
      {label}
    </span>
  );
}

export function SourceList({ ids, title = "Sources & Further Research" }: { ids: SourceId[]; title?: string }) {
  const unique = [...new Set(ids)];
  return (
    <aside className={styles.sources} aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {unique.map((id) => {
          const s = source(id);
          return (
            <li key={id}>
              {s.org} —{" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
                <ExternalLink size={12} aria-hidden="true" />
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className={styles.reviewed}>
        Last reviewed: <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>
      </p>
    </aside>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className={styles.notice}>
      <ShieldAlert size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export const EDU_LABEL = "Educational model — not mission design data.";
