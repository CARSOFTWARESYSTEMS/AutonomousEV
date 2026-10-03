// One line saying what the view is showing. Shared by the 3D application and
// the lightweight console, so it must stay free of anything from three.js.
import { CUTAWAYS, EXPLODED_LEVELS, FAULT_BY_ID, FLOWS, SENSORS, SYSTEM_BY_ID, TEST_PHASES } from "../data/engineReference";
import { BEARING_STAGES, COMPONENT_LABEL } from "../data/twinContent";
import { type TwinState, explodedLevel } from "./twinStore";

/** Also what a screen reader hears when the view changes. */
export function stageCaption(s: TwinState): string {
  switch (s.mode) {
    case "build": {
      const level = EXPLODED_LEVELS.find((l) => l.id === explodedLevel(s.explodedAmount))?.label ?? "";
      const cutaway = CUTAWAYS.find((c) => c.system === s.cutaway);
      return cutaway ? `Build · ${level} · ${cutaway.label} cutaway` : s.cutaway === "all" ? `Build · ${level} · Engine open` : `Build · ${level}`;
    }
    case "engine":
      return s.component ? `Engine · ${SYSTEM_BY_ID[s.system].name} · ${COMPONENT_LABEL[s.component]}` : `Engine · ${SYSTEM_BY_ID[s.system].name}`;
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
      if (s.bearing) return `Engine Health Monitoring · bearing region · ${BEARING_STAGES.find((b) => b.id === s.bearing)?.label ?? ""}`;
      return s.fault ? `Engine Health Monitoring · ${FAULT_BY_ID[s.fault.id].name}` : "Engine Health Monitoring · no fault scenario running";
    case "twin":
      return "Digital Twin · observed, estimated, expected and predicted";
    case "architecture":
      return "Architecture · from engine hardware to test evidence";
  }
}
