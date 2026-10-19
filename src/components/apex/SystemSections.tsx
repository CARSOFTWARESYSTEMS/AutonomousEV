import { REVIEW_GATES } from "@/data/apex/system";
import { EvidenceBadge } from "./EvidenceBadge";
import styles from "./apex.module.css";
import explorer from "./explorer.module.css";

/** Engineering governance gates, as process concepts. None is claimed complete. */
export function ReviewGates() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <ol className={explorer.gates}>
        {REVIEW_GATES.map((gate) => (
          <li key={gate.id} className={explorer.gate}>
            <span className={explorer.gateMarker}>
              <span className={explorer.gateDiamond} aria-hidden="true" />
              <span className={styles.specLabel}>Gate</span>
            </span>
            <abbr title={gate.name} className={explorer.gateAcronym} style={{ textDecoration: "none" }}>
              {gate.acronym}
            </abbr>
            <span className={styles.h4}>{gate.name}</span>
            <span className={styles.small}>{gate.question}</span>
          </li>
        ))}
      </ol>
      <div className={styles.chips} style={{ alignItems: "center" }}>
        <EvidenceBadge status="CONCEPT" label="Process concept" />
        <span className={styles.small}>No review is shown as completed. Gate records will be published only with APEX&rsquo;s confirmation.</span>
      </div>
    </div>
  );
}

/** A two-column list of questions and short answers. */
export function QuestionList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <dl className={explorer.qa}>
      {items.map((item) => (
        <div key={item.q} className={explorer.qaItem}>
          <dt className={explorer.qaQ}>{item.q}</dt>
          <dd className={explorer.qaA}>{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}
