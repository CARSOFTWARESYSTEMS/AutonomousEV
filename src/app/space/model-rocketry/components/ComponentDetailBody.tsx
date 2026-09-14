import { useLearningLevel } from "./LearningLevelProvider";
import { SYSTEM_LABELS, type RocketComponent } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function ComponentDetailBody({ component }: { component: RocketComponent }) {
  const { level } = useLearningLevel();
  const explanation =
    level === "advanced" ? component.advanced : level === "intermediate" ? component.intermediate : component.beginner;

  return (
    <div>
      <span className={styles.componentTag}>{SYSTEM_LABELS[component.system]}</span>
      <h3>{component.name}</h3>
      <p style={{ marginTop: 6 }}>{component.purpose}</p>

      <div className={styles.componentField}>
        <h4>Explanation</h4>
        <p>{explanation}</p>
      </div>

      <div className={styles.componentField}>
        <h4>Interfaces with</h4>
        <ul>
          {component.interfaces.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>

      <div className={styles.componentField}>
        <h4>Common failure modes</h4>
        <ul>
          {component.failures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className={styles.componentField}>
        <h4>Practical checks</h4>
        <ul>
          {component.checks.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className={styles.componentField}>
        <h4>Related careers</h4>
        <div className={styles.componentChips}>
          {component.careers.map((c) => (
            <span key={c} className={styles.componentChip}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
