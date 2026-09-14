import { ROADMAP } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function Roadmap() {
  return (
    <div className={styles.roadmapGrid}>
      {ROADMAP.map((s) => (
        <div key={s.id} className={styles.roadmapCard}>
          <span className={styles.roadmapStageLabel}>{s.stage}</span>
          <h4>{s.title}</h4>
          <ul>
            {s.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
