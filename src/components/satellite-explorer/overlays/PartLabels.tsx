// Projected labels for the parts a view is about — never the whole
// spacecraft at once. Hover shows a name only; the full panel opens on click.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ComponentId, SubsystemId } from "../types";
import { COMPONENTS } from "../data/componentDefinitions";
import { LOAD_LABELS, type LoadId } from "../simulation/power";
import { useExplorerStore } from "../state/explorerStore";
import { isXrayActive } from "../state/selectors";
import { frame } from "../scene/frameState";
import { LAYOUT } from "../spacecraft/layout";
import { POWER_LOAD_LABELS } from "./flowSelection";
import SceneLabel from "./SceneLabel";
import ui from "../explorer.module.css";

/** At most this many labels are shown together. */
const MAX_LABELS = 5;

interface LabelSpec {
  id: ComponentId;
  /** Overrides the component's own label, e.g. to name a cluster once instead of four times. */
  text?: string;
}

const WHEELS: LabelSpec = { id: "reaction-wheel-x", text: "REACTION WHEELS" };
const just = (...ids: ComponentId[]): LabelSpec[] => ids.map((id) => ({ id }));

const SYSTEM_LABELS: Record<SubsystemId, readonly LabelSpec[]> = {
  power: just("solar-array-right", "pcdu", "battery"),
  adcs: [WHEELS, ...just("star-tracker", "magnetorquers", "sun-sensors")],
  payload: just("optical-payload", "payload-electronics", "payload-processor", "data-storage"),
  communications: just("sband-antenna", "sband-radio", "xband-antenna"),
  thermal: [],
  avionics: just("obc", "data-storage"),
  structure: just("primary-frame", "payload-deck", "avionics-deck", "deployer-interface"),
};

/** Labels for each Build Mode step: the units being installed, without crowding. */
const BUILD_LABELS: Record<number, readonly LabelSpec[]> = {
  1: just("primary-frame", "payload-deck", "avionics-deck", "deployer-interface"),
  2: just("solar-array-right", "battery", "pcdu"),
  3: just("obc", "data-storage"),
  4: [WHEELS, ...just("magnetorquers", "star-tracker", "magnetometer")],
  5: just("sband-radio", "sband-antenna", "xband-transmitter", "xband-antenna"),
  6: just("optical-payload", "payload-electronics", "payload-processor"),
  7: just("mli-blanket", "radiator", "heaters"),
  8: [],
};

const SIGNAL_LABELS = {
  command: [...just("sband-antenna", "sband-radio", "obc"), WHEELS],
  telemetry: just("star-tracker", "pcdu", "obc", "sband-radio", "sband-antenna"),
  "payload-data": just("optical-payload", "payload-processor", "data-storage", "xband-transmitter", "xband-antenna"),
} as const satisfies Record<string, readonly LabelSpec[]>;

/** Thermal view: zones are named in words, so the meaning never depends on colour alone. */
const THERMAL_LABELS: readonly { id: ComponentId; text: string }[] = [
  { id: "solar-array-right", text: "WARM · SUN-FACING" },
  { id: "radiator", text: "COOL · RADIATOR" },
  { id: "pcdu", text: "WARM · ELECTRONICS" },
  { id: "battery", text: "NOMINAL · HEATED IN ECLIPSE" },
];

const MISSION_LABELS: Partial<Record<string, readonly LabelSpec[]>> = {
  BOOT: just("battery", "pcdu", "obc"),
  STORE: just("payload-processor", "data-storage"),
};

/** Follows a part's anchor as the exploded view opens and closes. */
function Anchored({ id, children }: { id: ComponentId; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const { anchor, explode } = LAYOUT[id];
    const e = frame.exploded;
    group.current?.position.set(anchor[0] + explode[0] * e, anchor[1] + explode[1] * e, anchor[2] + explode[2] * e);
  });
  return <group ref={group}>{children}</group>;
}

/** Live draw of one load. Rendered in the label layer, so only this text updates with telemetry. */
function LoadWatts({ load }: { load: LoadId }) {
  const watts = useExplorerStore((s) => s.telemetry.loads[load]);
  return <span className={ui.partLabelDetail}>{watts.toFixed(1)} W</span>;
}

function LabelButton({ id, name, load }: { id: ComponentId; name: string; load?: LoadId }) {
  const select = useExplorerStore((s) => s.selectComponent);
  return (
    <button type="button" className={ui.partLabelButton} onClick={() => select(id)} aria-label={`${COMPONENTS[id].name}${load ? `, ${LOAD_LABELS[load]} load` : ""}. Show details`}>
      <span className={ui.partLabelDot} aria-hidden="true" />
      <span>{name}</span>
      {load && <LoadWatts load={load} />}
    </button>
  );
}

function Label({ id, text, load, interactive = true }: { id: ComponentId; text?: string; load?: LoadId; interactive?: boolean }) {
  const name = text ?? COMPONENTS[id].label;
  return (
    <Anchored id={id}>
      <SceneLabel className={ui.partLabel}>
        {interactive ? (
          <LabelButton id={id} name={name} load={load} />
        ) : (
          <span className={ui.partLabelButton}>
            <span className={ui.partLabelDot} aria-hidden="true" />
            <span>{name}</span>
          </span>
        )}
      </SceneLabel>
    </Anchored>
  );
}

export default function PartLabels() {
  const mode = useExplorerStore((s) => s.mode);
  const subsystem = useExplorerStore((s) => s.subsystem);
  const signalView = useExplorerStore((s) => s.signalView);
  const buildStep = useExplorerStore((s) => s.buildStep);
  const missionStage = useExplorerStore((s) => s.missionStage);
  const hovered = useExplorerStore((s) => s.hoveredComponent);
  const selected = useExplorerStore((s) => s.selectedComponent);
  const xray = useExplorerStore(isXrayActive);

  let specs: readonly LabelSpec[] = [];
  let powerLoads = false;
  if (mode === "build") specs = BUILD_LABELS[buildStep] ?? [];
  else if (mode === "systems") {
    specs = SYSTEM_LABELS[subsystem];
    powerLoads = subsystem === "power" && xray;
  } else if (mode === "signals") specs = SIGNAL_LABELS[signalView];
  else if (mode === "mission") specs = MISSION_LABELS[missionStage] ?? [];

  // With a part selected its panel names it; drop the other labels to keep the view clean.
  const context = selected ? [] : specs.slice(0, MAX_LABELS);
  const thermal = mode === "systems" && subsystem === "thermal" && !selected;

  return (
    <group name="PartLabels">
      {context.map(({ id, text }) => (
        <Label key={id} id={id} text={text} />
      ))}
      {powerLoads &&
        !selected &&
        POWER_LOAD_LABELS.map(({ component, load }) => <Label key={`load-${component}`} id={component} text={LOAD_LABELS[load].toUpperCase()} load={load} />)}
      {thermal && THERMAL_LABELS.map(({ id, text }) => <Label key={`thermal-${id}`} id={id} text={text} />)}
      {hovered && hovered !== selected && !context.some((spec) => spec.id === hovered) && <Label key={`hover-${hovered}`} id={hovered} interactive={false} />}
    </group>
  );
}
