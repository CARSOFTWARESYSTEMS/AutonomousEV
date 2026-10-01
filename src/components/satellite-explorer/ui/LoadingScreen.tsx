import { PRODUCT } from "../data/satelliteReference";
import styles from "./loading.module.css";

/**
 * Loading scene for the desktop application. With no `progress` it shows an
 * indeterminate bar (module still downloading); with a 0–1 value it shows how
 * far the scene has got. `hidden` fades it out without unmounting.
 */
export default function LoadingScreen({ progress, hidden = false }: { progress?: number; hidden?: boolean }) {
  const determinate = typeof progress === "number";
  const percent = determinate ? Math.round(Math.min(1, Math.max(0, progress)) * 100) : undefined;
  return (
    <div className={styles.loading} data-hidden={hidden} aria-hidden={hidden || undefined} data-testid="explorer-loading">
      <div className={styles.horizon} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.name}>{PRODUCT.name}</p>
        <p className={styles.status} role="status">
          Preparing spacecraft…
        </p>
        <div
          className={styles.track}
          data-indeterminate={!determinate}
          role="progressbar"
          aria-label="Loading Satellite Explorer 3D"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className={styles.bar} style={{ "--progress": determinate ? percent! / 100 : 0 } as React.CSSProperties} />
        </div>
        {determinate && <p className={styles.percent}>{percent}%</p>}
      </div>
    </div>
  );
}
