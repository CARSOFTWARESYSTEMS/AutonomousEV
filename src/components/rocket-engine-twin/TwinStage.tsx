"use client";
// The picture of the engine. It follows the console: what is selected there
// decides what the schematic highlights, opens or animates.
//
// A WebGL viewer, if one is added, belongs in this slot: load it with
// next/dynamic and `ssr: false`, and keep this schematic as its poster and as
// the fallback when WebGL is unavailable.
import { useShallow } from "zustand/react/shallow";
import EngineSchematic from "./EngineSchematic";
import { CUTAWAYS, EXPLODED_LEVELS, FAULT_BY_ID, FLOWS, SENSORS, SYSTEM_BY_ID, TEST_PHASES } from "./data/engineReference";
import { type TwinState, stageView, useRocketTwinStore } from "./state/twinStore";
import styles from "./rocketTwin.module.css";

/** One line saying what the schematic is showing; also what a screen reader hears when it changes. */
export function stageCaption(s: TwinState): string {
  switch (s.mode) {
    case "build": {
      const level = EXPLODED_LEVELS.find((l) => l.id === s.exploded)?.label ?? "";
      const cutaway = CUTAWAYS.find((c) => c.system === s.cutaway);
      return cutaway ? `Build · ${level} · ${cutaway.label} cutaway` : `Build · ${level}`;
    }
    case "systems":
      return `Systems · ${SYSTEM_BY_ID[s.system].name}`;
    case "flow": {
      const flow = FLOWS.find((f) => f.id === s.flow);
      return flow ? `Flow · ${flow.name}` : "Flow · choose a flow";
    }
    case "control": {
      const sensor = SENSORS.find((x) => x.id === s.sensor);
      return sensor ? `Control · ${sensor.name}` : "Control · sensors";
    }
    case "test":
      if (s.test.status === "running") return `Simulated Engine Test · ${TEST_PHASES[s.test.phase].name}`;
      if (s.test.status === "completed") return "Simulated Engine Test · complete";
      if (s.test.status === "aborted") return "Simulated Engine Test · stopped";
      return "Simulated Engine Test · ready";
    case "health":
      return s.fault ? `Engine Health Monitoring · ${FAULT_BY_ID[s.fault.id].name}` : "Engine Health Monitoring · no fault scenario running";
    case "twin":
      return "Digital Twin · observed, estimated, expected and predicted";
  }
}

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
