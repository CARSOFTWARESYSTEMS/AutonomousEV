import { useId } from "react";
import { ArrowUpRight } from "lucide-react";
import { BHAVYA_KSHATRI } from "@/data/public-entities";
import styles from "./DesignInspirationCredit.module.css";

const ORIGINAL_WORK_URL = "https://bhavyacyber.github.io/";
/** The profile link the entity registry records for her. */
const LINKEDIN_URL = "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri";

interface DesignInspirationCreditProps {
  /** The page's own sentence: what her early design work helped inspire here. */
  context: string;
}

/**
 * The "Inspiration & Acknowledgement" card that follows "Prepared by". It
 * credits early design exploration as the inspiration for the interactive 3D
 * and Digital Twin experiences; who prepares them is "Prepared by", above it.
 */
export default function DesignInspirationCredit({ context }: DesignInspirationCreditProps) {
  const titleId = useId();
  const { name } = BHAVYA_KSHATRI;
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.text}>
        <h3 id={titleId} className={styles.title}>
          Inspiration &amp; Acknowledgement
        </h3>
        <p className={styles.eyebrow}>Original Design / Inspiration</p>
        <p className={styles.name}>{name}</p>
        <p className={styles.body}>
          Special thanks to {name} for inspiring our early approach to interactive engineering visualisation and Digital Twin experiences.
          Her original design exploration helped influence the evolution of our Satellite Engineering, Model Rocketry, Aerospace and 3D Digital Twin learning experiences.
        </p>
        <p className={styles.body}>{context}</p>
      </div>
      <div className={styles.actions}>
        <a href={ORIGINAL_WORK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
          View Original Work <span className={styles.srOnly}>by {name} (opens in a new tab)</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
          LinkedIn <span className={styles.srOnly}>profile of {name} (opens in a new tab)</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
