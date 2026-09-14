"use client";
import { useMemo, useState } from "react";
import { APPLICATIONS, CATEGORIES, type Application, type ApplicationCategory, type Persona } from "../applicationsData";
import { useViewMode } from "./ViewProvider";
import { useMediaQuery } from "./useMediaQuery";
import styles from "../everyday-applications.module.css";

const MOBILE_PREVIEW_COUNT = 6;

const BENEFIT_LABEL: Record<Application["benefitType"], string> = {
  direct: "Direct benefit",
  indirect: "Indirect benefit",
  both: "Direct & indirect",
};

export default function ApplicationExplorer({ persona }: { persona: Persona | null }) {
  const { view } = useViewMode();
  const [category, setCategory] = useState<ApplicationCategory | null>(null);
  const [expanded, setExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const ordered = useMemo(() => {
    const filtered = category ? APPLICATIONS.filter((a) => a.category === category) : APPLICATIONS;
    if (!persona) return filtered;
    return [...filtered].sort((a, b) => {
      const aMatch = a.relevantPersonas.includes(persona) ? 0 : 1;
      const bMatch = b.relevantPersonas.includes(persona) ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [category, persona]);

  const showExpandControl = !isDesktop && !expanded && ordered.length > MOBILE_PREVIEW_COUNT;
  const visible = showExpandControl ? ordered.slice(0, MOBILE_PREVIEW_COUNT) : ordered;

  return (
    <div>
      <div className={styles.phaseRail} role="group" aria-label="Filter by category" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={styles.phaseChip}
          aria-pressed={category === null}
          onClick={() => setCategory(null)}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.phaseChip}
            aria-pressed={category === c.id}
            onClick={() => setCategory(category === c.id ? null : c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.systemsGrid}>
        {visible.map((app) => (
          <ApplicationCard key={app.id} app={app} view={view} />
        ))}
      </div>

      {showExpandControl && (
        <button type="button" className={styles.expandButton} onClick={() => setExpanded(true)}>
          Explore all applications ({ordered.length})
        </button>
      )}
    </div>
  );
}

function ApplicationCard({ app, view }: { app: Application; view: "simple" | "engineering" | "business" }) {
  return (
    <article className={styles.systemGroup}>
      <span className={styles.componentTag}>{app.name}</span>
      <p style={{ marginTop: 6 }}>{app.problem}</p>

      <div className={styles.componentField}>
        <h4>What you receive</h4>
        <p>{app.citizenReceives}</p>
      </div>

      <div className={styles.componentField}>
        <h4>Who benefits · {BENEFIT_LABEL[app.benefitType]}</h4>
        <p>{app.whoBenefits}</p>
      </div>

      <details className={styles.componentDisclosure}>
        <summary>How space helps</summary>
        <p>{app.spaceCapability}</p>
        <p>{app.behindTheScenes}</p>
      </details>

      <details className={styles.componentDisclosure}>
        <summary>India example &amp; what&apos;s next</summary>
        <p>{app.indiaExample}</p>
        <p>{app.futureOpportunity}</p>
      </details>

      {view === "engineering" && (
        <details className={styles.componentDisclosure} open>
          <summary>Engineering view</summary>
          <ul>
            {app.engineering.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>{app.engineering.dataProcessing}</p>
          <p>{app.engineering.groundSegment}</p>
        </details>
      )}

      {view === "business" && (
        <details className={styles.componentDisclosure} open>
          <summary>Business view</summary>
          <p>
            <strong>Potential customers:</strong> {app.business.customers}
          </p>
          <p>
            <strong>Value-added layer:</strong> {app.business.valueAddedLayer}
          </p>
          <div className={styles.componentChips}>
            {app.business.businessModels.map((b) => (
              <span key={b} className={styles.componentChip}>
                {b}
              </span>
            ))}
          </div>
          <p style={{ marginTop: 10 }}>
            <strong>Validation needed:</strong> {app.business.validationNeeded}
          </p>
        </details>
      )}
    </article>
  );
}
