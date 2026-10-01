// Pure derivations from interface state: which environment and camera a view
// uses, what each part should look like, which overlays and flows are on, and
// which operating point the simulation runs. Free of three.js and React so
// the rules can be tested directly.
import type { ComponentId, EnvironmentId, FlightConfig, SensorCategory, SystemId, UnitNo } from "../types";
import { COMPONENTS, COMPONENT_IDS, assemblyOf, componentsOf, unitNumberOf } from "../data/componentDefinitions";
import { HUMS_LAYERS } from "../data/healthDefinitions";
import { SYSTEM_DEPENDENCIES, dependentsOf } from "../data/uflightReferenceAircraft";
import { STAGE_INFO } from "../data/missionDefinition";
import { getSensor, sensorsOfCategory } from "../data/sensorDefinitions";
import { FLOW_ROUTES, type FlowGroup, type FlowRoute } from "../aircraft/routes";
import { MODULE_NUMBERS, UNIT_NUMBERS } from "../aircraft/layout";
import { reached } from "../simulation/faultModels";
import { isActivePhase } from "../simulation/mission";
import { TWIN_SUBJECTS } from "../simulation/twin";
import type { CameraPresetId } from "../scene/cameraPresets";
import type { UFlightState } from "./uflightStore";

export type ViewState = Pick<
  UFlightState,
  | "started"
  | "mode"
  | "audienceMode"
  | "selectedSystem"
  | "selectedComponent"
  | "isolatedComponent"
  | "xrayEnabled"
  | "xrayFilter"
  | "explodedLevel"
  | "explodedAmount"
  | "viewPreset"
  | "flightConfig"
  | "showDependencies"
  | "healthView"
  | "sensorCategory"
  | "selectedSensor"
  | "humsLayer"
  | "trace"
  | "networkFilter"
  | "architectureView"
  | "fccBFailed"
  | "gnssUnavailable"
  | "missionStage"
  | "faultScenario"
  | "faultStage"
  | "twinSystem"
>;

const unitParts = (...parts: string[]): ComponentId[] => UNIT_NUMBERS.flatMap((no) => parts.map((p) => `pu${no}-${p}` as ComponentId)).filter((id) => id in COMPONENTS);
const MODULES: ComponentId[] = MODULE_NUMBERS.map((no) => `battery-module-${no}` as ComponentId);
const notShell = (ids: ComponentId[]) => ids.filter((id) => !COMPONENTS[id].shell);

/** Components kept at full strength for each system: its own parts and the units it works with. */
export const SYSTEM_FOCUS: Record<SystemId, readonly ComponentId[]> = {
  propulsion: notShell(componentsOf("propulsion")),
  energy: [...componentsOf("energy"), "battery-cooling", ...unitParts("inverter")],
  avionics: [...componentsOf("avionics"), "fcc-a", "fcc-b", "fcc-c", "nav-processor", "hums-computer", "edge-processor", "secure-gateway"],
  flightControl: [...componentsOf("flightControl"), ...unitParts("motor-controller", "tilt-actuator"), "nav-processor"],
  navigation: [...componentsOf("navigation"), "fcc-a", "fcc-b", "fcc-c"],
  structures: ["fuselage-frames", "floor-structure", "wing-structure-left", "wing-structure-right", "boom-left", "boom-right", "nose-gear", "main-gear-left", "main-gear-right", "battery-pack-left", "battery-pack-right"],
  thermal: [...componentsOf("thermal"), ...MODULES, "battery-pack-left", "battery-pack-right", ...unitParts("motor", "inverter", "cooling-interface", "bearing-front", "bearing-rear"), "avionics-rack", "hv-contactors"],
  communications: [...componentsOf("communications"), "maintenance-gateway", "network-switch-a"],
  hums: [...componentsOf("hums"), ...unitParts("sensors"), "maintenance-link"],
};

const CABIN_FOCUS: readonly ComponentId[] = ["cabin-seats", "cabin-interior", "floor-structure", "pilot-controls", "flight-displays", "fuselage-frames", "battery-pack-left", "battery-pack-right", ...MODULES];

const ARCHITECTURE_FOCUS: readonly ComponentId[] = [
  ...componentsOf("avionics"),
  ...componentsOf("hums"),
  ...componentsOf("communications"),
  ...componentsOf("navigation"),
  "fcc-a",
  "fcc-b",
  "fcc-c",
  "actuator-controllers",
  "pilot-controls",
  ...unitParts("motor-controller", "sensors"),
];

const REDUNDANCY_FOCUS: readonly ComponentId[] = ["fcc-a", "fcc-b", "fcc-c", "actuator-controllers", "nav-processor", "pilot-controls", "wing-actuators", "tail-actuators", ...unitParts("motor-controller")];
const NAVIGATION_FOCUS: readonly ComponentId[] = [...componentsOf("navigation"), "fcc-a", "fcc-b", "fcc-c"];

const BATTERY_FOCUS: readonly ComponentId[] = ["battery-pack-left", "battery-pack-right", ...MODULES, "bms-primary", "bms-secondary", "hv-contactors", "battery-cooling"];
const HEALTH_CHAIN: readonly ComponentId[] = ["acquisition-node-wing-right", "acquisition-node-fuselage", "sensor-gateway", "edge-processor", "hums-computer", "maintenance-gateway"];

const MISSION_EVENT_STAGES = new Set(["HEALTH_EVENT", "DIAGNOSIS", "PROGNOSIS"]);

// ── Environment and operating point ──

export function environmentFor(state: ViewState): EnvironmentId {
  switch (state.mode) {
    case "twin":
      return "twin";
    case "mission":
      return isActivePhase(state.missionStage) ? STAGE_INFO[state.missionStage].environment : "vertiport";
    case "fault-lab":
      if (!state.faultScenario) return "studio";
      return state.faultStage === "MAINTENANCE" ? "vertiport" : "flight";
    default:
      return "studio";
  }
}

export type OperatingPoint = { kind: "mission" } | { kind: "steady"; config: FlightConfig; /** Height the aircraft is drawn at, scene metres. */ height: number; atDestination: boolean };

/** What the simulation runs for the current view. */
export function operatingPoint(state: ViewState): OperatingPoint {
  if (state.mode === "mission" && state.missionStage !== "IDLE") return { kind: "mission" };
  if (state.mode === "mission") return { kind: "steady", config: "ground", height: 0, atDestination: false };
  if (state.mode === "fault-lab" && state.faultScenario) {
    if (state.faultStage === "MAINTENANCE") return { kind: "steady", config: "ground", height: 0, atDestination: true };
    return { kind: "steady", config: state.faultScenario === "bearing-degradation" ? "cruise" : "hover", height: 40, atDestination: false };
  }
  if (state.mode === "twin") return { kind: "steady", config: state.flightConfig, height: 1.4, atDestination: false };
  if (state.mode === "hero") return { kind: "steady", config: "ground", height: 0, atDestination: false };
  return { kind: "steady", config: state.flightConfig, height: 0, atDestination: false };
}

// ── Camera ──

const SYSTEM_CAMERA: Record<SystemId, CameraPresetId> = {
  propulsion: "propulsion-overview",
  energy: "battery-bay",
  avionics: "avionics",
  flightControl: "flight-controls",
  navigation: "navigation",
  structures: "structures",
  thermal: "thermal",
  communications: "communications",
  hums: "hums",
};

export function cameraPresetFor(state: ViewState): CameraPresetId {
  switch (state.mode) {
    case "hero":
      return "hero";
    case "aircraft":
      if (state.explodedAmount > 0.35) return "exploded";
      if (state.viewPreset === "cabin") return "cabin";
      if (state.viewPreset === "structure") return "structures";
      return "aircraft-overview";
    case "systems":
      return state.explodedAmount > 0.35 ? "exploded" : SYSTEM_CAMERA[state.selectedSystem ?? "propulsion"];
    case "health":
      if (state.healthView === "hums") return "hums";
      return state.selectedSystem ? SYSTEM_CAMERA[state.selectedSystem] : "health";
    case "mission":
      switch (state.missionStage) {
        case "IDLE":
        case "PREFLIGHT":
          return "mission-preflight";
        case "TAKEOFF":
          return "mission-takeoff";
        case "TRANSITION":
          return "mission-transition";
        case "CRUISE":
          return "mission-cruise";
        case "HEALTH_EVENT":
        case "DIAGNOSIS":
        case "PROGNOSIS":
          return "mission-event";
        case "APPROACH":
          return "mission-approach";
        case "LANDING":
          return "mission-landing";
        case "POSTFLIGHT":
        case "COMPLETE":
          return "mission-postflight";
      }
      return "mission-preflight";
    case "fault-lab":
      if (state.faultScenario === "bearing-degradation") return state.faultStage === "MAINTENANCE" ? "mission-postflight" : "fault";
      if (state.faultScenario === "battery-imbalance") return "battery-bay";
      return "fault-overview";
    case "twin":
      return "digital-twin";
    case "architecture":
      return state.architectureView === "redundancy" ? "redundancy" : state.architectureView === "navigation" ? "navigation" : "architecture";
  }
}

// ── Part presentation ──

export const OPACITY = {
  solid: 1,
  /** Outer skin in X-ray. */
  xray: 0.14,
  /** Outer skin in the twin: partially translucent, still the aircraft. */
  twinSkin: 0.3,
  /** Parts outside the system or route a view is explaining. */
  faded: 0.16,
  /** Everything else while one part is selected. */
  context: 0.5,
  /** Everything else while one part is isolated. */
  isolatedOthers: 0.04,
  /** Below this a part cannot be picked. */
  selectableAbove: 0.3,
} as const;

/** True when the outer skin should be see-through. */
export function isXrayActive(state: ViewState): boolean {
  switch (state.mode) {
    case "hero":
      return false;
    case "aircraft":
      return state.xrayEnabled || state.viewPreset !== "overview";
    case "systems":
    case "health":
    case "twin":
    case "architecture":
      return true;
    case "fault-lab":
      return state.faultScenario === "battery-imbalance" || state.xrayEnabled;
    case "mission":
      return state.xrayEnabled;
  }
}

/** The parts a view keeps at full strength, or null when nothing is faded. */
export function focusSet(state: ViewState): readonly ComponentId[] | null {
  switch (state.mode) {
    case "hero":
      return null;
    case "aircraft":
      if (state.viewPreset === "cabin") return CABIN_FOCUS;
      if (state.viewPreset === "structure") return SYSTEM_FOCUS.structures;
      if (!state.xrayEnabled || state.xrayFilter === "all") return null;
      if (state.xrayFilter === "structure") return SYSTEM_FOCUS.structures;
      return COMPONENT_IDS.filter((id) => !COMPONENTS[id].shell && COMPONENTS[id].xray.includes(state.xrayFilter));
    case "systems": {
      const system = state.selectedSystem ?? "propulsion";
      if (!state.showDependencies) return SYSTEM_FOCUS[system];
      // Dependencies: the system together with every system it takes from or gives to.
      const related = [...SYSTEM_DEPENDENCIES[system].map((d) => d.on), ...dependentsOf(system).map((d) => d.system)];
      return [...new Set([system, ...related].flatMap((id) => SYSTEM_FOCUS[id]))];
    }
    case "health":
      if (state.healthView === "hums") {
        const layer = HUMS_LAYERS.find((l) => l.layer === state.humsLayer);
        return layer ? [...SYSTEM_FOCUS.hums, ...layer.components] : SYSTEM_FOCUS.hums;
      }
      // A sensor on the skin is shown by its marker; keeping that one panel solid would hide what is behind it.
      if (state.healthView === "sensors") return notShell([...new Set(sensorsOfCategory(state.sensorCategory).map((s) => s.component))]);
      return state.selectedSystem ? SYSTEM_FOCUS[state.selectedSystem] : null;
    case "twin": {
      const subject = TWIN_SUBJECTS[state.twinSystem].component;
      const assembly = assemblyOf(subject);
      return [...notShell(COMPONENT_IDS.filter((id) => id === subject || COMPONENTS[id].parent === assembly || id === assembly)), ...HEALTH_CHAIN, ...SYSTEM_FOCUS[state.twinSystem]];
    }
    case "architecture":
      if (state.architectureView === "redundancy") return REDUNDANCY_FOCUS;
      if (state.architectureView === "navigation") return NAVIGATION_FOCUS;
      return ARCHITECTURE_FOCUS;
    case "fault-lab":
      if (state.faultScenario === "battery-imbalance") return BATTERY_FOCUS;
      return null;
    case "mission":
      return null;
  }
}

/** Skins made see-through on their own, so one unit can be looked into while the aircraft stays solid. */
export function seeThroughShells(state: ViewState): readonly ComponentId[] {
  if (state.mode === "fault-lab" && state.faultScenario === "bearing-degradation") return ["pu04-nacelle"];
  if (state.mode === "mission" && MISSION_EVENT_STAGES.has(state.missionStage)) return ["pu04-nacelle"];
  return [];
}

export interface PartPresentation {
  opacity: number;
  selectable: boolean;
  /** Part belongs to the system or route the view is explaining. */
  focused: boolean;
}

const present = (opacity: number, focused: boolean): PartPresentation => ({ opacity, selectable: opacity >= OPACITY.selectableAbove, focused });

/** Target appearance of every part for the current view. */
export function presentationMap(state: ViewState): Map<ComponentId, PartPresentation> {
  const map = new Map<ComponentId, PartPresentation>();
  const xray = isXrayActive(state);
  const focusList = focusSet(state);
  const focus = focusList ? new Set(focusList) : null;
  const seeThrough = new Set(seeThroughShells(state));
  const skin = state.mode === "twin" ? OPACITY.twinSkin : OPACITY.xray;
  const isolated = state.isolatedComponent;
  const selected = state.selectedComponent;
  const selectedAssembly = selected ? assemblyOf(selected) : null;
  const selectedIsShell = selected ? COMPONENTS[selected].shell : false;

  for (const id of COMPONENT_IDS) {
    const definition = COMPONENTS[id];
    const assembly = assemblyOf(id);

    if (isolated) {
      const self = id === isolated || definition.parent === isolated;
      // Looking into an isolated assembly needs its own skin out of the way once X-ray is on.
      const opacity = !self ? OPACITY.isolatedOthers : definition.shell && definition.parent && xray ? skin : OPACITY.solid;
      map.set(id, present(opacity, self));
      continue;
    }

    const focused = focus ? focus.has(id) : false;
    let opacity: number = OPACITY.solid;
    if (focus && !focused) opacity = definition.shell ? skin : OPACITY.faded;
    else if (xray && definition.shell && !focused) opacity = skin;
    if (seeThrough.has(id)) opacity = Math.min(opacity, skin);

    if (selected && id !== selected) {
      const child = definition.parent === selected;
      const sibling = assembly === selectedAssembly;
      if (child) {
        // Children of a selected assembly keep what the view gave them.
      } else if (sibling) {
        // A selected part must be seen through the skin of its own assembly.
        opacity = definition.shell ? Math.min(opacity, skin) : Math.min(opacity, OPACITY.context);
      } else if (definition.shell && !selectedIsShell) {
        opacity = Math.min(opacity, skin);
      } else {
        opacity = Math.min(opacity, OPACITY.context);
      }
    }
    if (selected === id) opacity = OPACITY.solid;

    map.set(id, present(opacity, focused));
  }
  return map;
}

export const partPresentation = (state: ViewState, id: ComponentId): PartPresentation => presentationMap(state).get(id)!;

/** A string that changes exactly when the presentation or the overlays could change. */
export function viewKey(state: ViewState): string {
  return [
    state.started,
    state.mode,
    state.selectedSystem,
    state.selectedComponent,
    state.isolatedComponent,
    state.xrayEnabled,
    state.xrayFilter,
    state.explodedLevel,
    state.viewPreset,
    state.flightConfig,
    state.showDependencies,
    state.healthView,
    state.sensorCategory,
    state.selectedSensor,
    state.humsLayer,
    state.trace?.sensorId,
    state.networkFilter,
    state.architectureView,
    state.fccBFailed,
    state.gnssUnavailable,
    state.missionStage,
    state.faultScenario,
    state.faultStage,
    state.twinSystem,
    state.audienceMode,
  ].join("|");
}

// ── Exploded view ──

/** Whether a part's sub-assembly displacement (level 2) applies in this view. */
export function subAssemblyOpen(state: ViewState, id: ComponentId): boolean {
  if (state.explodedLevel < 2) return false;
  const focus = state.isolatedComponent ?? state.selectedComponent;
  if (focus) return assemblyOf(focus) === assemblyOf(id);
  if (state.mode === "systems" && state.selectedSystem) return COMPONENTS[id].system === state.selectedSystem;
  return true;
}

/** Whether a part's internals separate (level 3): only for the part being inspected, or its assembly. */
export function componentOpen(state: ViewState, id: ComponentId): boolean {
  if (state.explodedLevel < 3) return false;
  const focus = state.isolatedComponent ?? state.selectedComponent;
  return focus ? focus === id || assemblyOf(id) === focus : false;
}

// ── Overlays ──

export interface ViewFlags {
  /** Heat tint on heat sources. */
  thermal: boolean;
  /** Load-path indicators on the structure. */
  loads: boolean;
  /** Health-state tint on components that are not nominal. */
  healthTint: boolean;
  /** Labels on monitored assemblies. */
  healthLabels: boolean;
  /** The twin's healthy reference overlay. */
  ghost: boolean;
  /** Vibration made visible at motor 04. */
  vibration: boolean;
  /** Labels on the flight-compute channels and the voter. */
  redundancy: boolean;
  /** Labels on the navigation sources. */
  navigation: boolean;
  /** Lines between a selected system and the systems that depend on it. */
  dependencies: boolean;
}

export function viewFlags(state: ViewState): ViewFlags {
  const { mode } = state;
  const missionEvent = mode === "mission" && (MISSION_EVENT_STAGES.has(state.missionStage) || state.missionStage === "APPROACH" || state.missionStage === "LANDING" || state.missionStage === "POSTFLIGHT" || state.missionStage === "COMPLETE");
  return {
    thermal:
      (mode === "systems" && state.selectedSystem === "thermal") ||
      (mode === "aircraft" && state.xrayEnabled && state.xrayFilter === "thermal") ||
      (mode === "health" && state.healthView === "sensors" && state.sensorCategory === "thermal") ||
      (mode === "health" && state.healthView === "overview" && state.selectedSystem === "thermal"),
    loads:
      (mode === "systems" && state.selectedSystem === "structures") ||
      (mode === "aircraft" && state.viewPreset === "structure") ||
      (mode === "health" && state.healthView === "overview" && state.selectedSystem === "structures") ||
      (mode === "health" && state.healthView === "sensors" && state.sensorCategory === "structural"),
    healthTint: mode === "health" || mode === "mission" || mode === "fault-lab" || mode === "twin",
    healthLabels: mode === "health" && state.healthView === "overview" && !state.selectedComponent,
    ghost: mode === "twin",
    vibration: (mode === "fault-lab" && state.faultScenario === "bearing-degradation") || missionEvent || (mode === "twin" && state.twinSystem === "propulsion"),
    redundancy: mode === "architecture" && state.architectureView === "redundancy",
    navigation: mode === "architecture" && state.architectureView === "navigation",
    dependencies: mode === "systems" && state.showDependencies,
  };
}

export interface SensorVisibility {
  /** Category drawn across the whole aircraft, if any. */
  category: SensorCategory | null;
  /** Individual sensors drawn regardless of category. */
  ids: readonly string[];
}

const UNIT_04_VIBRATION = ["VIB-M04-A", "VIB-M04-B"];

export function sensorVisibility(state: ViewState): SensorVisibility {
  const ids = new Set<string>();
  if (state.selectedSensor) ids.add(state.selectedSensor);
  if (state.trace) ids.add(state.trace.sensorId);
  if (state.mode === "fault-lab" && state.faultScenario === "bearing-degradation") UNIT_04_VIBRATION.forEach((id) => ids.add(id));
  if (state.mode === "twin" && state.twinSystem === "propulsion") ids.add(UNIT_04_VIBRATION[0]);
  const category = state.mode === "health" && state.healthView === "sensors" ? state.sensorCategory : null;
  return { category, ids: [...ids] };
}

// ── Flows ──

const on = (groups: Partial<Record<FlowGroup, number>>, route: FlowRoute) => groups[route.group] ?? 0;

const SYSTEM_FLOWS: Record<SystemId, Partial<Record<FlowGroup, number>>> = {
  propulsion: { "hv-pack": 0.8, "hv-unit": 1, "motor-command": 0.45 },
  energy: { "hv-pack": 1, "hv-unit": 0.5, lv: 1, "battery-sense": 0.5 },
  avionics: { network: 1, "nav-fcc": 0.6, lv: 0.4 },
  flightControl: { "nav-fcc": 0.8, inceptor: 1, command: 1, surface: 1, "motor-command": 0.8 },
  navigation: { nav: 1, "nav-fcc": 0.8 },
  structures: {},
  thermal: { coolant: 1 },
  communications: { "ground-link": 1, maintenance: 0.7, network: 0.4 },
  hums: { acquisition: 1, "node-uplink": 1, "battery-sense": 0.8, "hums-core": 1, maintenance: 1, "ground-link": 0.6 },
};

const XRAY_FLOWS: Record<string, Partial<Record<FlowGroup, number>>> = {
  power: { "hv-pack": 1, "hv-unit": 1, lv: 1 },
  propulsion: { "hv-unit": 1, "motor-command": 0.5 },
  avionics: { network: 1 },
  flightControl: SYSTEM_FLOWS.flightControl,
  thermal: { coolant: 1 },
  data: { network: 1, nav: 0.7, "nav-fcc": 0.7, command: 0.7, acquisition: 0.7, "node-uplink": 0.7, "hums-core": 0.7, maintenance: 0.7, "ground-link": 0.7 },
  health: SYSTEM_FLOWS.hums,
};

const HEALTH_PATH: Partial<Record<FlowGroup, number>> = { "node-uplink": 1, "hums-core": 1, maintenance: 1 };

/** Activation, 0–1, of every flow route for the current view. */
export function flowActivation(state: ViewState): Record<string, number> {
  const out: Record<string, number> = {};
  const set = (route: FlowRoute, value: number) => {
    out[route.id] = Math.max(out[route.id] ?? 0, value);
  };
  for (const route of FLOW_ROUTES) out[route.id] = 0;
  if (!state.started) return out;

  const traceSensor = state.trace ? getSensor(state.trace.sensorId) : undefined;

  for (const route of FLOW_ROUTES) {
    switch (state.mode) {
      case "aircraft":
        if (state.xrayEnabled) set(route, on(XRAY_FLOWS[state.xrayFilter] ?? {}, route));
        break;
      case "systems":
        set(route, on(SYSTEM_FLOWS[state.selectedSystem ?? "propulsion"], route));
        break;
      case "health":
        if (state.healthView === "hums") set(route, on(SYSTEM_FLOWS.hums, route));
        else if (state.healthView === "overview" && state.selectedSystem) set(route, on(SYSTEM_FLOWS[state.selectedSystem], route) * 0.8);
        break;
      case "architecture": {
        if (state.architectureView === "redundancy") {
          if (route.group === "nav-fcc" || route.group === "command") set(route, route.channel === "fcc-b" && state.fccBFailed ? 0 : 1);
          if (route.group === "surface" || route.group === "motor-command" || route.group === "inceptor") set(route, 0.7);
        } else if (state.architectureView === "navigation") {
          if (route.group === "nav") set(route, route.source === "gnss" && state.gnssUnavailable ? 0 : 1);
          if (route.group === "nav-fcc") set(route, 0.8);
        } else if (state.networkFilter === "all") {
          if (route.kind !== "power" && route.kind !== "thermal") set(route, route.group === "network" ? 0.7 : 0.85);
        } else if (route.network === state.networkFilter) {
          set(route, 1);
        }
        break;
      }
      case "twin":
        if (state.twinSystem === "propulsion" && (route.id === "acquisition-04" || route.id === "uplink-wing-right")) set(route, 1);
        if (state.twinSystem === "energy" && route.group === "battery-sense") set(route, 1);
        set(route, on({ "hums-core": 0.8 }, route));
        break;
      case "fault-lab":
        if (state.faultScenario === "bearing-degradation") {
          if (route.id === "acquisition-04" || route.id === "uplink-wing-right") set(route, 1);
          if (reached(state.faultStage, "ANOMALOUS")) set(route, on({ "hums-core": 1 }, route));
          if (reached(state.faultStage, "ACTION_REQUIRED")) set(route, on({ maintenance: 1, "ground-link": route.id === "link-maintenance" ? 1 : 0 }, route));
        } else if (state.faultScenario === "battery-imbalance") {
          set(route, on({ "battery-sense": 1, "hv-pack": 0.7 }, route));
          if (route.id === "uplink-fuselage") set(route, 1);
          if (reached(state.faultStage, "ANOMALOUS")) set(route, on({ "hums-core": 1 }, route));
        }
        break;
      case "mission":
        if (state.missionStage === "TAKEOFF") set(route, on({ "hv-pack": 0.7, "hv-unit": 0.7 }, route));
        if (MISSION_EVENT_STAGES.has(state.missionStage)) {
          if (route.id === "acquisition-04" || route.id === "uplink-wing-right") set(route, 1);
          set(route, on({ "hums-core": 1 }, route));
        }
        break;
      case "hero":
        break;
    }

    // A sensor being traced lights its own path through the health network.
    if (traceSensor) {
      const unit = traceSensor.unit?.no;
      if (unit && route.group === "acquisition" && route.unit === unit) set(route, 1);
      if (route.group === "node-uplink" && route.id === `uplink-${traceSensor.node.replace("acquisition-node-", "")}`) set(route, 1);
      set(route, on(HEALTH_PATH, route) * (route.group === "node-uplink" ? 0 : 1));
    }
  }
  return out;
}

// ── Layout hints ──

/**
 * How far the scene is shifted sideways, as a fraction of the viewport, so the
 * aircraft stays clear of the panels: left when only the right-hand panel is
 * open, right when only the left-hand one is, centred when both or neither are.
 */
export function sceneShift(state: ViewState): number {
  if (!state.started) return 0;
  const detail = Boolean(state.selectedComponent || state.selectedSensor);
  switch (state.mode) {
    case "aircraft":
      return detail ? -0.1 : 0;
    case "systems":
      return -0.1;
    case "fault-lab":
      return state.faultScenario ? 0 : 0.09;
    default:
      return 0;
  }
}

/** Unit whose internals the view is concerned with, for per-unit effects. */
export function focusUnit(state: ViewState): UnitNo | null {
  const focus = state.isolatedComponent ?? state.selectedComponent;
  if (focus) return unitNumberOf(focus);
  if (seeThroughShells(state).length) return "04";
  return null;
}
