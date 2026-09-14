import { ExternalLink } from "lucide-react";
import { SPACE_SYSTEMS, VERIFIED_ON } from "../applicationsData";
import styles from "../everyday-applications.module.css";

export default function SpaceSystemsSources() {
  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        Each system below is explained through the question it helps answer, with a link to its official source and
        when it was last checked. Programme names, capabilities and services can change — always confirm directly
        with the official source before relying on any detail here.
      </p>
      <p className={styles.formNote} style={{ marginBottom: 24 }}>
        Last verified: <time dateTime={VERIFIED_ON}>{VERIFIED_ON}</time>
      </p>

      <div className={styles.systemsGrid}>
        {SPACE_SYSTEMS.map((s) => (
          <article key={s.id} className={styles.systemGroup}>
            <h4 style={{ margin: "0 0 8px" }}>{s.question}</h4>
            <p className={styles.componentTag}>{s.name}</p>
            <p style={{ fontSize: 14 }}>{s.explanation}</p>
            <a
              href={s.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--space-blue-text)", fontSize: 13, marginTop: 8, minHeight: 44 }}
            >
              {s.officialSourceLabel} <ExternalLink size={13} />
            </a>
            <p style={{ fontSize: 12, color: "var(--space-muted)", margin: "8px 0 0" }}>
              Verified on: <time dateTime={s.verifiedOn}>{s.verifiedOn}</time>
            </p>
          </article>
        ))}
      </div>

      <div className={styles.card} style={{ padding: 20, marginTop: 28, borderLeft: "3px solid var(--space-amber)" }}>
        <p style={{ margin: 0 }}>
          Information about ISRO, IN-SPACe, MOSDAC, Bhuvan, INCOIS, NDMA and related systems above is presented for
          educational reference. EV Society / EV.ENGINEER does not claim affiliation, endorsement or partnership with
          ISRO, IN-SPACe, the Department of Space, or any other agency named above, unless explicitly documented.
          Official communications and documentation from each agency always take precedence over this page.
        </p>
      </div>
    </div>
  );
}
