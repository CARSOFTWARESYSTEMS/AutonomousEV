import { EV_AUTO_RICKSHAW_FAQ } from "../faq";
import styles from "../page.module.css";

export function FaqSection() {
  return (
    <div className={styles.accordionList}>
      {EV_AUTO_RICKSHAW_FAQ.map((entry) => (
        <details className={styles.accordionItem} key={entry.question}>
          <summary className={styles.faqSummary}>
            <span className={styles.accordionSummaryTitle}>{entry.question}</span>
            <span className={styles.accordionChevron}>▾</span>
          </summary>
          <div className={styles.faqBody}>{entry.answer}</div>
        </details>
      ))}
    </div>
  );
}

interface ReferenceEntry {
  title: string;
  org: string;
  url: string;
}

const REFERENCES: ReferenceEntry[] = [
  { title: "TVS King EV MAX — official specifications", org: "TVS Motor Company", url: "https://www.tvsmotor.com/three-wheelers/king-ev-max" },
  { title: "Bajaj RE E-TEC 9.0 — official brochure (PDF)", org: "Bajaj Auto", url: "https://www.bajajauto.com/-/media/assets/bajajauto/three-wheelers/ev/bajaj-re-etec-90.pdf" },
  { title: "Mahindra Treo Plus — official specifications", org: "Mahindra Last Mile Mobility", url: "https://mahindralastmilemobility.com/treo-plus" },
  { title: "Piaggio Ape E-City Ultra — official specifications", org: "Piaggio Vehicles", url: "https://piaggio-cv.co.in/electric/ape-e-city-ultra/" },
  { title: "AegisCAN — CAN & BMS Cybersecurity", org: "EV.ENGINEER™", url: "/internships/AegisCAN" },
  { title: "Battery Circular Economy", org: "EV.ENGINEER™", url: "/internships/battery-circular-economy" },
];

export function ReferencesSection() {
  return (
    <div className={styles.refList} style={{ maxWidth: 820, margin: "0 auto" }}>
      {REFERENCES.map((ref) => (
        <div className={styles.refItem} key={ref.url}>
          <a href={ref.url} target={ref.url.startsWith("http") ? "_blank" : undefined} rel={ref.url.startsWith("http") ? "noopener noreferrer" : undefined}>
            {ref.title}
          </a>{" "}
          — {ref.org}
        </div>
      ))}
    </div>
  );
}

export function VersionFooter() {
  return (
    <div className={styles.disclaimer} style={{ marginTop: "2rem" }}>
      <p className={styles.disclaimerText}>
        <strong>EV Auto Rickshaw R&amp;D Simulator · Concept Version 0.1 · Last Updated 2026-09-22.</strong>
        <br />
        Engineering targets, simulations and cost estimates are preliminary and intended for research, product
        planning and feasibility evaluation. Final vehicle specifications require detailed engineering, supplier
        selection, prototype validation, regulatory compliance and homologation.
      </p>
    </div>
  );
}
