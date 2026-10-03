"use client";
// The lightweight picture of the engine, for phones and for desktops without
// WebGL. It follows the console: what is selected there decides what the
// schematic highlights, opens or animates.
import { useShallow } from "zustand/react/shallow";
import EngineSchematic from "./EngineSchematic";
import { stageCaption } from "./state/caption";
import { stageView, useRocketTwinStore } from "./state/twinStore";
import styles from "./rocketTwin.module.css";

export default function TwinStage() {
  const view = useRocketTwinStore(useShallow(stageView));
  const caption = useRocketTwinStore(stageCaption);

  return (
    <div className={styles.stage}>
      <ul className={styles.stageTags} aria-label="Model status">
        <li>REFERENCE MODEL</li>
        <li>SIMULATED</li>
      </ul>
      <EngineSchematic view={view} className={styles.schematic} flowClassName={styles.flowing} />
      <p className={styles.stageCaption} role="status">
        {caption}
      </p>
    </div>
  );
}
