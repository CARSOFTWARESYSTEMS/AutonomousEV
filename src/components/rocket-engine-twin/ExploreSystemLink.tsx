"use client";
import { ArrowRight } from "lucide-react";
import { PRODUCT, SYSTEM_BY_ID } from "./data/engineReference";
import { useRocketTwinStore } from "./state/twinStore";
import type { SystemId } from "./types";
import styles from "./rocketTwin.module.css";

/** Opens one system in the console from its summary further down the page. */
export default function ExploreSystemLink({ system }: { system: SystemId }) {
  const exploreSystem = useRocketTwinStore((s) => s.exploreSystem);
  return (
    <a href={`#${PRODUCT.consoleId}`} className={styles.textLink} onClick={() => exploreSystem(system)}>
      Explore {SYSTEM_BY_ID[system].label} <ArrowRight size={14} aria-hidden="true" />
    </a>
  );
}
