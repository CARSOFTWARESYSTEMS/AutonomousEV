import type { ReactNode } from "react";
import styles from "./showcase.module.css";

/** A showcase visual that is a still drawing rather than a 3D scene: the same frame, caption and text alternative. */
export default function StillVisual({ label, caption, children }: { label: string; caption: ReactNode; children: ReactNode }) {
  return (
    <figure className={styles.visual}>
      <div className={`${styles.frame} ${styles.stillFrame}`} role="img" aria-label={label}>
        <div className={styles.poster} aria-hidden="true">
          {children}
        </div>
      </div>
      <div className={styles.visualBar}>
        <figcaption className={styles.caption}>{caption}</figcaption>
      </div>
    </figure>
  );
}
