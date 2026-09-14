import styles from "../everyday-applications.module.css";

const DIRECT = ["Navigation", "Weather forecasts", "Broadcasting", "Connectivity", "Disaster warnings", "Location services"];
const INDIRECT = [
  "Agricultural planning",
  "Food security",
  "Water planning",
  "Infrastructure planning",
  "Logistics efficiency",
  "Insurance assessment",
  "Urban planning",
  "Disaster-loss reduction",
  "Environment monitoring",
];

export default function BenefitsSplit() {
  return (
    <div className={styles.systemsGrid}>
      <div className={styles.systemGroup}>
        <div className={styles.systemGroupHead}>
          <span className={styles.systemDot} style={{ background: "#34d399" }} />
          <h4 style={{ margin: 0 }}>Direct — you see it</h4>
        </div>
        <p>You use these services yourself, every day, without thinking about where the underlying data came from.</p>
        <div className={styles.componentChips}>
          {DIRECT.map((b) => (
            <span key={b} className={styles.componentChip}>
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.systemGroup}>
        <div className={styles.systemGroupHead}>
          <span className={styles.systemDot} style={{ background: "#93c5fd" }} />
          <h4 style={{ margin: 0 }}>Indirect — it works quietly</h4>
        </div>
        <p>You benefit from decisions others make using this information — a planner, an insurer, a government agency.</p>
        <div className={styles.componentChips}>
          {INDIRECT.map((b) => (
            <span key={b} className={styles.componentChip}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
