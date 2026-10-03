"use client";
import { ArrowRight, Play } from "lucide-react";
import { PRODUCT } from "./data/engineReference";
import { useRocketTwinStore } from "./state/twinStore";
import styles from "./rocketTwin.module.css";

/**
 * The calls to action in the hero. Enter is a link to the experience, so it
 * also works before the page is interactive. The second action depends on the
 * experience: the guided tour in 3D, the engine demo in the lightweight console.
 * Both are rendered and the stylesheet shows the one that applies.
 */
export default function HeroActions({ immersive }: { immersive: boolean }) {
  const entered = useRocketTwinStore((s) => s.entered);
  const enter = useRocketTwinStore((s) => s.enter);
  const runDemo = useRocketTwinStore((s) => s.runDemo);
  const startTour = useRocketTwinStore((s) => s.startTour);

  return (
    <div className={styles.actions} inert={immersive && entered}>
      <a href={`#${PRODUCT.consoleId}`} className={styles.primaryButton} onClick={enter}>
        {PRODUCT.enterLabel} <ArrowRight size={16} aria-hidden="true" />
      </a>
      <button type="button" className={`${styles.ghostButton} ${styles.tourCta}`} onClick={startTour}>
        <Play size={14} aria-hidden="true" /> {PRODUCT.tourLabel}
      </button>
      <a href={`#${PRODUCT.consoleId}`} className={`${styles.ghostButton} ${styles.demoCta}`} onClick={runDemo}>
        <Play size={14} aria-hidden="true" /> {PRODUCT.demoLabel}
      </a>
    </div>
  );
}
