import { ExternalLink } from "lucide-react";
import { COMPETITIONS, VERIFIED_ON, type CompetitionStatus } from "../competitionsData";
import styles from "../model-rocketry.module.css";

const STATUS_COLOR: Record<CompetitionStatus, string> = {
  Open: "#34d399",
  Upcoming: "#67e8f9",
  Announced: "#93c5fd",
  Completed: "#b5b8c9",
  "Next edition not yet verified": "#f59e0b",
};

export default function CompetitionExplorer() {
  const india = COMPETITIONS.filter((c) => c.region === "India");
  const international = COMPETITIONS.filter((c) => c.region === "International");

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        Every entry below links to its official source and shows when it was last checked. Dates and statuses
        change — always confirm directly with the organiser before relying on any date shown here.
      </p>
      <p className={styles.formNote} style={{ marginBottom: 24 }}>
        Last verified: <time dateTime={VERIFIED_ON}>{VERIFIED_ON}</time>
      </p>

      <h4 style={{ marginBottom: 14 }}>India</h4>
      <div className={styles.systemsGrid} style={{ marginBottom: 32 }}>
        {india.map((c) => (
          <CompetitionCard key={c.id} competition={c} />
        ))}
      </div>

      <h4 style={{ marginBottom: 14 }}>International</h4>
      <div className={styles.systemsGrid}>
        {international.map((c) => (
          <CompetitionCard key={c.id} competition={c} />
        ))}
      </div>

      <div className={styles.card} style={{ padding: 20, marginTop: 28, borderLeft: "3px solid var(--space-amber)" }}>
        <p style={{ margin: 0 }}>
          IN-SPACe and international competition information above is presented for educational reference. EV
          Society / EV.ENGINEER does not claim affiliation, endorsement or partnership with IN-SPACe, ISRO, DLR,
          KAIST, the Portuguese Space Agency, ESRA/AIAA, the American Astronautical Society, NASA or any other
          competition organiser, unless explicitly documented. Official competition rules, requirements, dates and
          communications from each organiser always take precedence over this page.
        </p>
      </div>
    </div>
  );
}

function CompetitionCard({ competition }: { competition: (typeof COMPETITIONS)[number] }) {
  return (
    <article className={styles.systemGroup}>
      <div className={styles.systemGroupHead}>
        <span className={styles.systemDot} style={{ background: STATUS_COLOR[competition.status] }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[competition.status] }}>{competition.status}</span>
      </div>
      <h4 style={{ margin: "4px 0 8px" }}>{competition.name}</h4>
      <dl style={{ margin: 0, fontSize: 13 }}>
        <dt style={{ color: "var(--space-blue-text)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Audience</dt>
        <dd style={{ margin: "2px 0 8px", color: "var(--space-muted)" }}>{competition.audience}</dd>
        <dt style={{ color: "var(--space-blue-text)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Focus / Level</dt>
        <dd style={{ margin: "2px 0 8px", color: "var(--space-muted)" }}>
          {competition.focus} · {competition.level}
        </dd>
        <dt style={{ color: "var(--space-blue-text)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current edition</dt>
        <dd style={{ margin: "2px 0 8px", color: "var(--space-muted)" }}>{competition.currentEdition}</dd>
      </dl>
      <a
        href={competition.officialSourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--space-blue-text)", fontSize: 13, marginTop: 4, minHeight: 44 }}
      >
        {competition.officialSourceLabel} <ExternalLink size={13} />
      </a>
      <p style={{ fontSize: 12, color: "var(--space-muted)", margin: "8px 0 0" }}>
        Verified on: <time dateTime={competition.verifiedOn}>{competition.verifiedOn}</time>
      </p>
    </article>
  );
}
