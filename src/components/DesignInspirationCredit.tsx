import { useId } from "react";
import { ArrowUpRight } from "lucide-react";
import styles from "./DesignInspirationCredit.module.css";

const ORIGINAL_WORK_URL = "https://bhavyacyber.github.io/";

/**
 * The "Inspiration & Acknowledgement" card that follows "Designed by". It
 * credits early design exploration as the inspiration for the interactive 3D
 * and Digital Twin experiences; who designs them is "Designed by", above it.
 * The wording is the same on every page that shows it.
 */
export default function DesignInspirationCredit() {
  const titleId = useId();
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.text}>
        <h3 id={titleId} className={styles.title}>
          Inspiration &amp; Acknowledgement
        </h3>
        <p className={styles.body}>
          Special thanks to <strong>Bhavya</strong> for inspiring our early approach to <strong>interactive engineering visualisation and Digital Twin experiences</strong> across Satellite Engineering, Model Rocketry and Aerospace.
        </p>
      </div>
      <a href={ORIGINAL_WORK_URL} target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="View Original Work by Bhavya (opens in a new tab)">
        View Original Work
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
