// Labels anchored to the aircraft: health states on monitored assemblies, the
// flight-compute channels, the navigation sources, the cabin, and whatever the
// pointer is over. Drawn as ordinary DOM by the label layer, so they are real,
// focusable controls where they do something.
import SceneLabel from "../../satellite-explorer/overlays/SceneLabel";
import type { ComponentId, FlightConfig, HealthState, MonitoredSystemId, SystemId, Vec3 } from "../types";
import { COMPONENTS, unitNumberOf } from "../data/componentDefinitions";
import { FLIGHT_COMPUTE_CHANNELS, NAV_SOURCES } from "../data/healthDefinitions";
import { HEALTH_TABLE_LABEL, STATE_GLYPH, STATE_LABEL, SYSTEMS, SYSTEM_DEPENDENCIES, dependentsOf } from "../data/uflightReferenceAircraft";
import { BATTERY, CABIN, EQUIPMENT, FUSELAGE, OPENINGS, PLACEMENT, PROPULSION_PARTS, UNIT_MOUNTS, UNIT_STATIONS, WING, fuselagePoint, moduleCentre, unitMount, unitPartLocal, unitPoint, wingPoint } from "../aircraft/layout";
import { reached } from "../simulation/faultModels";
import { componentHealth } from "../simulation/hums";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

const at = (p: Vec3): [number, number, number] => [p[0], p[1], p[2]];
const tiltFor = (config: FlightConfig) => (config === "cruise" ? 0 : config === "transition" ? 42 : 90);

function StateMarker({ label, state, sub, onSelect, describe }: { label: string; state: HealthState; sub?: string; onSelect?: () => void; describe: string }) {
  const content = (
    <>
      <span aria-hidden="true">{STATE_GLYPH[state]}</span>
      {label}
      {state !== "NOMINAL" && <span className={ui.markerSub}>{sub ?? STATE_LABEL[state]}</span>}
    </>
  );
  if (!onSelect) {
    return (
      <span className={`${ui.marker} ${ui.markerPassive}`} data-state={state}>
        {content}
      </span>
    );
  }
  return (
    <button type="button" className={ui.marker} data-state={state} aria-label={`${describe}: ${STATE_LABEL[state]}`} onClick={onSelect}>
      {content}
    </button>
  );
}

const LABELLED_SYSTEMS = ["energy", "flightControl", "structures", "avionics", "thermal", "navigation"] as const satisfies readonly MonitoredSystemId[];

/** Where each system is labelled on the aircraft. Propulsion is labelled unit by unit instead. */
const SYSTEM_ANCHOR: Record<(typeof LABELLED_SYSTEMS)[number], Vec3> = {
  energy: [1.5, BATTERY.topY, 0],
  flightControl: EQUIPMENT["fcc-a"],
  structures: wingPoint(-1.4, WING.mainSparFraction),
  avionics: EQUIPMENT["network-switch-b"],
  thermal: EQUIPMENT["heat-exchanger"],
  navigation: EQUIPMENT.gnss,
};

/** HEALTH overview: the monitored assemblies, each with its state. */
function HealthLabels() {
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const flightConfig = useUFlightStore((s) => s.flightConfig);
  const selectComponent = useUFlightStore((s) => s.selectComponent);
  const selectSystem = useUFlightStore((s) => s.selectSystem);
  const tilt = tiltFor(flightConfig);
  return (
    <>
      {UNIT_MOUNTS.map((mount) => (
        <SceneLabel key={mount.id} position={at(unitPoint(mount, [UNIT_STATIONS[mount.kind].hub + 0.2, 0, 0], tilt))}>
          <StateMarker label={`PU ${mount.no}`} state={componentHealth(twin, mount.id).state} describe={`Propulsion unit ${mount.no}`} onSelect={() => selectComponent(mount.id)} />
        </SceneLabel>
      ))}
      {LABELLED_SYSTEMS.map((id) => (
        <SceneLabel key={id} position={at(SYSTEM_ANCHOR[id])}>
          <StateMarker label={HEALTH_TABLE_LABEL[id]} state={twin.systems[id].state} describe={HEALTH_TABLE_LABEL[id]} onSelect={() => selectSystem(id)} />
        </SceneLabel>
      ))}
    </>
  );
}

/** ARCHITECTURE / REDUNDANCY: the three channels and the voter. */
function RedundancyLabels() {
  const voting = useUFlightStore((s) => s.telemetry.snapshot.voting);
  return (
    <>
      {FLIGHT_COMPUTE_CHANNELS.map((channel) => (
        <SceneLabel key={channel.id} position={at(EQUIPMENT[channel.id])}>
          <StateMarker label={channel.label} state={voting.channels[channel.id] === "AVAILABLE" ? "NOMINAL" : "UNAVAILABLE"} sub={voting.channels[channel.id]} describe={channel.label} />
        </SceneLabel>
      ))}
      <SceneLabel position={at(EQUIPMENT["actuator-controllers"])}>
        <span className={`${ui.marker} ${ui.markerPassive}`}>
          VOTING / AGREEMENT <span className={ui.markerSub}>{voting.voting}</span>
        </span>
      </SceneLabel>
    </>
  );
}

/** ARCHITECTURE / NAVIGATION: the seven sources and the processor that fuses them. */
function NavigationLabels() {
  const navigation = useUFlightStore((s) => s.telemetry.snapshot.navigation);
  return (
    <>
      {NAV_SOURCES.map((source) => (
        <SceneLabel key={source.id} position={at(EQUIPMENT[source.id])}>
          <StateMarker label={source.label.toUpperCase().replace(" / PERCEPTION SENSORS", "")} state={navigation.sources[source.id] === "AVAILABLE" ? "NOMINAL" : "UNAVAILABLE"} sub={navigation.sources[source.id]} describe={source.label} />
        </SceneLabel>
      ))}
      <SceneLabel position={at(EQUIPMENT["nav-processor"])}>
        <span className={`${ui.marker} ${ui.markerPassive}`}>
          POSITION SOLUTION <span className={ui.markerSub}>{navigation.positionSolution}</span>
        </span>
      </SceneLabel>
    </>
  );
}

/** ARCHITECTURE / DATA: the stages of the data architecture, named where they sit. Kept few: the bay is dense. */
const ARCHITECTURE_LABELS: readonly { text: string; position: Vec3 }[] = [
  { text: "FLIGHT COMPUTE A", position: EQUIPMENT["fcc-a"] },
  { text: "FLIGHT COMPUTE B · C", position: EQUIPMENT["fcc-b"] },
  { text: "HEALTH COMPUTE · EDGE ANALYTICS", position: [EQUIPMENT["edge-processor"][0], EQUIPMENT["edge-processor"][1] + 0.5, EQUIPMENT["edge-processor"][2] + 0.3] },
  { text: "SECURE COMMUNICATION", position: [-2.5, 1.7, 0] },
  { text: "REMOTE I/O", position: EQUIPMENT["acquisition-node-wing-right"] },
  { text: "REMOTE I/O", position: EQUIPMENT["acquisition-node-wing-left"] },
  { text: "REMOTE I/O", position: EQUIPMENT["acquisition-node-tail"] },
  { text: "GROUND HEALTH PLATFORM", position: [-0.6, 6.2, 0] },
];
const HUMS_LABELS: readonly ComponentId[] = ["acquisition-node-wing-left", "acquisition-node-wing-right", "acquisition-node-fuselage", "acquisition-node-tail", "sensor-gateway", "edge-processor", "hums-computer", "maintenance-gateway"];

const shortName = (id: ComponentId) =>
  COMPONENTS[id].name
    .toUpperCase()
    .replace("FLIGHT COMPUTER ", "FCC-")
    .replace("ACQUISITION NODE, ", "ACQ · ")
    .replace("NETWORK SWITCH A", "DATA NETWORK A/B");

function UnitLabels({ ids }: { ids: readonly ComponentId[] }) {
  return (
    <>
      {ids.map((id) => (
        <SceneLabel key={id} position={at(PLACEMENT[id].anchor)}>
          <span className={`${ui.marker} ${ui.markerPassive}`}>{shortName(id)}</span>
        </SceneLabel>
      ))}
    </>
  );
}

const doorLabel = (sign: number): Vec3 => fuselagePoint((OPENINGS.door.x[0] + OPENINGS.door.x[1]) / 2, (sign * 70 * Math.PI) / 180);

/** AIRCRAFT / CABIN: what the cabin view is there to show. */
const CABIN_LABELS: readonly { text: string; sub?: string; position: Vec3 }[] = [
  { text: "PILOT", position: [CABIN.rowX[0] - 0.15, 1.72, -CABIN.seatZ] },
  { text: "5 PASSENGERS", position: [CABIN.rowX[1] - 0.15, 1.72, CABIN.seatZ] },
  { text: "SEAT ATTACHMENT", sub: "floor rails", position: [CABIN.rowX[2] + 0.3, FUSELAGE.floorY + 0.03, CABIN.seatZ + 0.17] },
  { text: "STRUCTURAL FLOOR", sub: "battery separation", position: [1.9, FUSELAGE.floorY, 0] },
  { text: "BATTERY BAY", sub: "under floor", position: [0.3, BATTERY.bottomY + 0.08, -BATTERY.packZ - 0.2] },
  { text: "EMERGENCY ACCESS", sub: "door", position: doorLabel(1) },
  { text: "EMERGENCY ACCESS", sub: "door", position: doorLabel(-1) },
];

function CabinLabels() {
  return (
    <>
      {CABIN_LABELS.map((label, i) => (
        <SceneLabel key={i} position={at(label.position)}>
          <span className={`${ui.marker} ${ui.markerPassive}`}>
            {label.text}
            {label.sub && <span className={ui.markerSub}>{label.sub}</span>}
          </span>
        </SceneLabel>
      ))}
    </>
  );
}

/** Where a system is named in the dependency view. */
const DEPENDENCY_ANCHOR: Record<SystemId, Vec3> = {
  propulsion: unitPoint(unitMount("03"), [0.5, 0, 0]),
  energy: [0.9, BATTERY.topY, BATTERY.packZ],
  avionics: EQUIPMENT["network-switch-b"],
  flightControl: EQUIPMENT["fcc-a"],
  navigation: EQUIPMENT.gnss,
  structures: wingPoint(-3.2, WING.mainSparFraction),
  thermal: EQUIPMENT["heat-exchanger"],
  communications: EQUIPMENT.antennas,
  hums: EQUIPMENT["acquisition-node-wing-left"],
};

/** SYSTEMS / DEPENDENCIES: the selected system and every system it gives to or takes from. */
function DependencyLabels({ system }: { system: SystemId }) {
  const needs = SYSTEM_DEPENDENCIES[system];
  const provides = dependentsOf(system);
  return (
    <>
      <SceneLabel position={at(DEPENDENCY_ANCHOR[system])}>
        <span className={`${ui.marker} ${ui.markerPassive}`}>{SYSTEMS[system].name}</span>
      </SceneLabel>
      {needs.map((d) => (
        <SceneLabel key={`needs-${d.on}`} position={at(DEPENDENCY_ANCHOR[d.on])}>
          <span className={`${ui.marker} ${ui.markerPassive}`}>
            {SYSTEMS[d.on].name} <span className={ui.markerSub}>gives {d.provides.toLowerCase()}</span>
          </span>
        </SceneLabel>
      ))}
      {provides
        .filter((d) => !needs.some((n) => n.on === d.system))
        .map((d) => (
          <SceneLabel key={`gives-${d.system}`} position={at(DEPENDENCY_ANCHOR[d.system])}>
            <span className={`${ui.marker} ${ui.markerPassive}`}>
              {SYSTEMS[d.system].name} <span className={ui.markerSub}>takes {d.provides.toLowerCase()}</span>
            </span>
          </SceneLabel>
        ))}
    </>
  );
}

/** The fault scenario's subject, named once the model has detected the anomaly. */
function EventLabel() {
  const mode = useUFlightStore((s) => s.mode);
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const faults = useUFlightStore((s) => s.telemetry.inputs.faults);
  const tilt = useUFlightStore((s) => s.telemetry.flight.tiltDeg);
  if (mode !== "mission" && mode !== "fault-lab" && mode !== "twin") return null;
  if (faults.scenario === "bearing-degradation") {
    const health = twin.components["propulsion-unit-04"];
    if (!health || health.state === "NOMINAL") return null;
    const position = unitPoint(unitMount("04"), [UNIT_STATIONS.tilt.bearingFront, 0.28, 0], Math.round(tilt / 15) * 15);
    return (
      <SceneLabel position={at(position)}>
        <StateMarker label="MOTOR 04" state={health.state} sub={reached(faults.stage, "DIAGNOSED") ? STATE_LABEL[health.state] : "ANOMALY DETECTED"} describe="Motor 04" />
      </SceneLabel>
    );
  }
  if (faults.scenario === "battery-imbalance") {
    const health = twin.components["battery-module-03"];
    if (!health || health.state === "NOMINAL") return null;
    const centre = moduleCentre("03");
    return (
      <SceneLabel position={[centre[0], centre[1] + 0.14, centre[2]]}>
        <StateMarker label="MODULE 03" state={health.state} describe="Battery module 03" />
      </SceneLabel>
    );
  }
  return null;
}

/** The name of the component under the pointer. */
function HoverLabel() {
  const id = useUFlightStore((s) => (s.hoveredComponent && s.hoveredComponent !== s.selectedComponent ? s.hoveredComponent : null));
  const flightConfig = useUFlightStore((s) => s.flightConfig);
  const exploded = useUFlightStore((s) => s.explodedAmount > 0.02);
  // Exploded parts are away from their anchors; the outline alone marks them then.
  if (!id || exploded) return null;
  const unit = unitNumberOf(id);
  let position = PLACEMENT[id].anchor;
  if (unit) {
    const mount = unitMount(unit);
    const part = PROPULSION_PARTS.find((p) => id === `pu${unit}-${p}`);
    position = unitPoint(mount, part ? unitPartLocal(mount.kind, part) : [UNIT_STATIONS[mount.kind].hub * 0.55, 0, 0], tiltFor(flightConfig));
  }
  return (
    <SceneLabel position={at(position)}>
      <span className={`${ui.marker} ${ui.markerPassive}`}>{COMPONENTS[id].name.toUpperCase()}</span>
    </SceneLabel>
  );
}

export default function ViewLabels() {
  const started = useUFlightStore((s) => s.started);
  const mode = useUFlightStore((s) => s.mode);
  const healthView = useUFlightStore((s) => s.healthView);
  const architectureView = useUFlightStore((s) => s.architectureView);
  const viewPreset = useUFlightStore((s) => s.viewPreset);
  const selectedSystem = useUFlightStore((s) => s.selectedSystem);
  const showDependencies = useUFlightStore((s) => s.showDependencies);
  const focused = useUFlightStore((s) => Boolean(s.selectedComponent || s.selectedSensor));
  if (!started) return null;
  return (
    <group name="Labels">
      {mode === "health" && healthView === "overview" && !selectedSystem && !focused && <HealthLabels />}
      {mode === "health" && healthView === "hums" && !focused && <UnitLabels ids={HUMS_LABELS} />}
      {mode === "architecture" && architectureView === "redundancy" && <RedundancyLabels />}
      {mode === "architecture" && architectureView === "navigation" && <NavigationLabels />}
      {mode === "architecture" &&
        architectureView === "data" &&
        !focused &&
        ARCHITECTURE_LABELS.map((label, i) => (
          <SceneLabel key={i} position={at(label.position)}>
            <span className={`${ui.marker} ${ui.markerPassive}`}>{label.text}</span>
          </SceneLabel>
        ))}
      {mode === "aircraft" && viewPreset === "cabin" && !focused && <CabinLabels />}
      {mode === "systems" && showDependencies && !focused && <DependencyLabels system={selectedSystem ?? "propulsion"} />}
      <EventLabel />
      <HoverLabel />
    </group>
  );
}
