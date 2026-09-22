import styles from "../page.module.css";
import { Badge } from "./Badge";

const REGULATORY_ITEMS = [
  "Vehicle category confirmation (electric passenger three-wheeler)",
  "CMVR compliance",
  "Applicable AIS requirements (traction battery, braking, EMC/EMI, lighting, tyres, dimensions)",
  "Electrical safety",
  "Range / energy consumption test procedure",
  "Charger / EVSE compliance",
  "State permit requirements",
];

const ROADMAP_PHASES = [
  { period: "0–6 weeks", title: "Voice of Customer + Requirements" },
  { period: "6–12 weeks", title: "Architecture + Simulation" },
  { period: "3–5 months", title: "Detailed Engineering" },
  { period: "5–7 months", title: "Alpha Prototypes" },
  { period: "7–10 months", title: "Validation" },
  { period: "9–12 months", title: "Beta Fleet" },
  { period: "10–15 months", title: "Homologation / Production Engineering" },
  { period: "12–18 months", title: "Pilot / SOP Preparation" },
];

const RESEARCH_QUESTIONS = [
  "Is D+6 economically better than D+3 for target routes?",
  "What is actual km/day across representative Tier-2/3 duty cycles?",
  "What range do drivers genuinely need before range anxiety changes behaviour?",
  "How much additional purchase price will drivers accept for a larger battery or motor?",
  "Is 10–11.5 kWh sufficient across the target duty-cycle distribution?",
  "Is 12 kW peak enough for full-load hill operation in Kerala/Karnataka ghat routes?",
  "Fixed battery or swapping — which wins on total cost for a given utilization?",
  "What warranty is financially sustainable given real-world degradation?",
  "What service interval minimizes downtime without over-servicing?",
  "Which body architecture minimizes mass without compromising safety?",
  "Can the target selling price be achieved at scale after supplier RFQs?",
  "What is the real ₹/passenger-km advantage once fare-sharing behaviour is measured?",
];

export function RoadmapSection() {
  return (
    <>
      <div className={styles.gateCard} style={{ marginBottom: "2rem" }}>
        <div className={styles.gateStatus}>Homologation Required Before Commercial Production</div>
        <p className={styles.cardBody}>
          Applicable standards and their current revisions must be confirmed with an authorized test agency before
          design freeze. Nothing on this page implies the vehicle is homologated, type-approved or certified.
        </p>
      </div>

      <div className={styles.cardGrid2} style={{ marginBottom: "3rem" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Regulatory Scope</div>
          <ul className={styles.cardList}>
            {REGULATORY_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.card}>
          <div className={styles.tagRow}>
            <Badge kind="validate" />
          </div>
          <div className={styles.cardTitle}>Unresolved Research Questions</div>
          <ul className={styles.cardList}>
            {RESEARCH_QUESTIONS.slice(0, 6).map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left" }}>
        Development Roadmap — Planning Targets
      </h3>
      <div className={styles.flowWrap}>
        {ROADMAP_PHASES.map((phase, i, arr) => (
          <div className={styles.flowWrapPair} key={phase.period}>
            <div className={styles.roadmapStep}>
              <div className={styles.roadmapStepTitle}>{phase.title}</div>
              <div className={styles.roadmapStepDesc}>{phase.period}</div>
            </div>
            {i < arr.length - 1 ? <span className={styles.flowWrapArrow}>→</span> : null}
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "3rem" }}>
        More Open Research Questions
      </h3>
      <ul className={styles.cardList} style={{ maxWidth: 820 }}>
        {RESEARCH_QUESTIONS.slice(6).map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <p className={styles.fieldHint} style={{ marginTop: "1rem" }}>
        This reinforces that the project is engineering research and product planning, not completed production
        engineering.
      </p>
    </>
  );
}
