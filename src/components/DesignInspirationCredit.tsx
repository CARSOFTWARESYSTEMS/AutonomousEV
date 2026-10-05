import { useId } from "react";
import { ArrowUpRight } from "lucide-react";
import { BHAVYA_KSHATRI } from "@/data/public-entities";
import styles from "./DesignInspirationCredit.module.css";

const ORIGINAL_WORK_URL = "https://bhavyacyber.github.io/";
/** The profile link the entity registry records for her. */
const LINKEDIN_URL = "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri";

/**
 * The "Inspiration & Acknowledgement" card that follows "Prepared by". It
 * credits early design exploration as the inspiration for the interactive 3D
 * and Digital Twin experiences; who prepares them is "Prepared by", above it.
 * The wording is the same on every page that shows it.
 */
export default function DesignInspirationCredit() {
  const titleId = useId();
  const { name } = BHAVYA_KSHATRI;
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.text}>
        <h3 id={titleId} className={styles.title}>
          Inspiration &amp; Acknowledgement
        </h3>
        <p className={styles.name}>{name}</p>
        <p className={styles.body}>
          Special thanks to Bhavya for inspiring our early approach to <strong>interactive engineering visualisation and Digital Twin experiences</strong> across Satellite Engineering, Model Rocketry and Aerospace.
        </p>
      </div>
      {/* The full name is in each link's accessible name only: on screen the labels stay short. */}
      <div className={styles.actions}>
        <a href={ORIGINAL_WORK_URL} target="_blank" rel="noopener noreferrer" className={styles.link} aria-label={`View Original Work by ${name} (opens in a new tab)`}>
          View Original Work
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={styles.link} aria-label={`LinkedIn profile of ${name} (opens in a new tab)`}>
          LinkedIn
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
