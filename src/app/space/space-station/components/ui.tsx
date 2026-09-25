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
  "Development · Paused": "warn",
};

/** Status label: always text (never colour alone), with a tone for emphasis. */
export function Badge({ label }: { label: string }) {
  return (
    <span className={styles.badge} data-tone={TONE[label] ?? "dev"}>
      {label}
    </span>
  );
}

/**
 * Section sources as a disclosure: collapsed by default so long citation lists
 * don't interrupt reading, but always present in the server HTML.
 */
export function SourceList({ ids, title = "Sources & Further Research", open = false }: { ids: SourceId[]; title?: string; open?: boolean }) {
  const unique = [...new Set(ids)];
  return (
    <details className={styles.sources} aria-label={title} open={open || undefined}>
      <summary>
        <span className={styles.sourcesTitle}>{title}</span>
        <span className={styles.sourcesCount}>{unique.length} authoritative sources</span>
      </summary>
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
    </details>
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

/** Divider that opens one of the page's four parts (Knowledge, Systems, Laboratory, Research). */
export function PartDivider({ id, number, title, description, links }: { id: string; number: string; title: string; description: string; links: [string, string][] }) {
  return (
    <div id={id} className={styles.part} data-part={id.replace("part-", "")} role="group" aria-label={`Part ${number}: ${title}`}>
      <div className={styles.partHead}>
        <p className={styles.partNumber}>Part {number}</p>
        <p className={styles.partTitle}>{title}</p>
        <p className={styles.partDesc}>{description}</p>
      </div>
      <nav aria-label={`${title} sections`} className={styles.partLinks}>
        {links.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
