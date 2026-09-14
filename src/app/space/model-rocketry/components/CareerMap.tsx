import { ROCKET_COMPONENTS, SYSTEM_LABELS, type RocketSystem } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function CareerMap() {
  const systems = Object.keys(SYSTEM_LABELS) as RocketSystem[];
  return (
    <div className={styles.careerGrid}>
      {systems.map((system) => {
        const careers = Array.from(new Set(ROCKET_COMPONENTS.filter((c) => c.system === system).flatMap((c) => c.careers)));
        return (
          <div key={system} className={styles.careerCard}>
            <h4>{SYSTEM_LABELS[system]}</h4>
            <div className={styles.careerChipList}>
              {careers.map((c) => (
                <span key={c} className={styles.careerChip}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
