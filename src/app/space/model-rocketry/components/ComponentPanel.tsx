import type { RocketComponent } from "../rocketData";
import ComponentDetailBody from "./ComponentDetailBody";
import styles from "../model-rocketry.module.css";

export default function ComponentPanel({ component }: { component: RocketComponent | null }) {
  return (
    <div className={styles.componentPanel} aria-live="polite">
      {component ? (
        <ComponentDetailBody component={component} />
      ) : (
        <p className={styles.componentPanelEmpty}>
          Select a highlighted point on the rocket to explore that component — what it is, why it&apos;s needed, how it can fail, and the careers behind it.
        </p>
      )}
    </div>
  );
}
