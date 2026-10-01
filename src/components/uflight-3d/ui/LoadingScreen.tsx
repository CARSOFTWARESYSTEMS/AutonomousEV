import { PRODUCT } from "../data/uflightReferenceAircraft";
import styles from "./loading.module.css";

export const LOADING_STEPS = ["Aircraft geometry", "Systems architecture", "Health models", "Digital twin", "Mission environment"] as const;

/**
 * Loading scene for the desktop application. With no `progress` it shows an
 * indeterminate bar (the application is still downloading); with a 0–1 value
 * it ticks through the steps. `hidden` fades it out without unmounting.
 */
export default function LoadingScreen({ progress, hidden = false }: { progress?: number; hidden?: boolean }) {
  const determinate = typeof progress === "number";
  const value = determinate ? Math.min(1, Math.max(0, progress)) : 0;
  // Each step occupies an equal share of the bar; the one in progress is "active".
  const reached = value * LOADING_STEPS.length;
  return (
    <div className={styles.loading} data-hidden={hidden} aria-hidden={hidden || undefined} data-testid="uflight-loading">
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.name}>{PRODUCT.wordmark}</p>
        <p className={styles.status} role="status">
          INITIALIZING DIGITAL AIRCRAFT
        </p>
        <ol className={styles.steps} aria-label="Loading steps">
          {LOADING_STEPS.map((step, i) => (
            <li key={step} className={styles.step} data-state={!determinate ? "pending" : reached >= i + 1 ? "done" : reached > i ? "active" : "pending"}>
              {step}
            </li>
          ))}
        </ol>
        <div
          className={styles.track}
          data-indeterminate={!determinate}
          role="progressbar"
          aria-label={`Loading ${PRODUCT.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={determinate ? Math.round(value * 100) : undefined}
        >
          <div className={styles.bar} style={{ "--progress": value } as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
}
