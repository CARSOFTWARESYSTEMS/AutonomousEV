"use client";
import { ArrowRight, Play } from "lucide-react";
import { PRODUCT } from "./data/engineReference";
import { useRocketTwinStore } from "./state/twinStore";
import styles from "./rocketTwin.module.css";

/** The two calls to action in the hero. Both are links to the console, so they also work before the page is interactive. */
export default function HeroActions() {
  const enter = useRocketTwinStore((s) => s.enter);
  const runDemo = useRocketTwinStore((s) => s.runDemo);

  return (
    <div className={styles.actions}>
      <a href={`#${PRODUCT.consoleId}`} className={styles.primaryButton} onClick={enter}>
        {PRODUCT.enterLabel} <ArrowRight size={16} aria-hidden="true" />
      </a>
      <a href={`#${PRODUCT.consoleId}`} className={styles.ghostButton} onClick={runDemo}>
        <Play size={14} aria-hidden="true" /> {PRODUCT.demoLabel}
      </a>
    </div>
  );
}
