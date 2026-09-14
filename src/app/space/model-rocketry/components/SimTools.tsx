import { SIM_TOOLS } from "../rocketData";
import styles from "../model-rocketry.module.css";

export default function SimTools() {
  return (
    <div className={styles.simToolsGrid}>
      {SIM_TOOLS.map((tool) => (
        <div key={tool.name} className={styles.simToolCard}>
          <h4>{tool.name}</h4>
          <h5>Learn first</h5>
          <ul>
            {tool.learnFirst.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h5>Use when complexity requires it</h5>
          <ul>
            {tool.whenComplexityRequires.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
