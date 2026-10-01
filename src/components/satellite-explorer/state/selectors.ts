// Pure derivations from explorer state: what each part should look like and
// which overlays a view shows. Kept free of three.js so they can be tested.
import type { ComponentId, SubsystemId } from "../types";
import { COMPONENTS, OUTER_SHELL, componentsOf } from "../data/componentDefinitions";
import { MISSION_STAGE_INFO, SIGNAL_ROUTES } from "../data/missionSequence";
import { isActiveStage } from "../simulation/mission";
import type { ExplorerState } from "./explorerStore";

type ViewState = Pick<
  ExplorerState,
  "mode" | "subsystem" | "signalView" | "selectedComponent" | "isolatedComponent" | "xrayEnabled" | "missionStage" | "buildStep"
>;

/** Components kept solid for each Systems tab (the subsystem's own parts plus the units it works with). */
export const SYSTEM_FOCUS: Record<SubsystemId, readonly ComponentId[]> = {
  power: componentsOf("power"),
  adcs: [...componentsOf("adcs"), "obc"],
  payload: [...componentsOf("payload"), "data-storage", "payload-deck"],
  communications: componentsOf("communications"),
  // Thermal tints the whole spacecraft, so nothing is faded.
  thermal: Object.keys(COMPONENTS) as ComponentId[],
  avionics: [...componentsOf("avionics"), "star-tracker", "sun-sensors", "magnetometer", "gnss-receiver"],
  structure: componentsOf("structure").filter((id) => id !== "side-panels"),
};

/** Loads fed by the power bus, shown when Power is viewed in X-ray. */
export const POWER_LOAD_COMPONENTS: readonly ComponentId[] = ["obc", "reaction-wheel-y", "optical-payload", "sband-radio", "heaters"];

const MISSION_FOCUS: Partial<Record<string, readonly ComponentId[]>> = {
  BOOT: ["battery", "pcdu", "obc", "power-harness", "primary-frame", "avionics-deck"],
  STORE: ["data-storage", "payload-processor", "payload-electronics", "optical-payload", "data-bus", "primary-frame", "avionics-deck", "payload-deck"],
};

/** True when the outer shell should be see-through. */
export function isXrayActive(state: ViewState): boolean {
  if (state.mode === "build") return false;
  if (state.xrayEnabled) return true;
  return state.mode === "mission" && isActiveStage(state.missionStage) && MISSION_STAGE_INFO[state.missionStage].xray;
}

/** The parts a view keeps at full strength, or null when nothing is faded. */
export function focusSet(state: ViewState): readonly ComponentId[] | null {
  if (state.mode === "systems") {
    if (state.subsystem === "thermal") return null;
    if (state.subsystem === "power" && isXrayActive(state)) return [...SYSTEM_FOCUS.power, ...POWER_LOAD_COMPONENTS];
    return SYSTEM_FOCUS[state.subsystem];
  }
  if (state.mode === "signals") return SIGNAL_ROUTES[state.signalView].components;
  if (state.mode === "mission") return MISSION_FOCUS[state.missionStage] ?? null;
  return null;
}

export const OPACITY = {
  solid: 1,
  /** Outer shell in X-ray. */
  xray: 0.14,
  /** Parts outside the current system. */
  faded: 0.16,
  /** Outer shell outside the current system: fainter, so the units inside read clearly. */
  fadedShell: 0.07,
  /** Everything else while one part is selected. */
  context: 0.5,
  /** Everything else while one part is isolated. */
  isolatedOthers: 0.05,
  /** Below this a part cannot be picked. */
  selectableAbove: 0.3,
} as const;

export interface PartPresentation {
  opacity: number;
  selectable: boolean;
  /** Part belongs to the system or route the view is explaining. */
  focused: boolean;
}

/** Target appearance of one part for the current view (Build Mode installation is handled separately). */
export function partPresentation(state: ViewState, id: ComponentId): PartPresentation {
  if (state.isolatedComponent) {
    const self = state.isolatedComponent === id;
    return { opacity: self ? OPACITY.solid : OPACITY.isolatedOthers, selectable: self, focused: self };
  }

  const focus = focusSet(state);
  const focused = focus ? focus.includes(id) : false;
  let opacity: number = OPACITY.solid;

  if (focus && !focused) opacity = OUTER_SHELL.includes(id) ? OPACITY.fadedShell : OPACITY.faded;
  if (isXrayActive(state) && OUTER_SHELL.includes(id)) opacity = Math.min(opacity, OPACITY.xray);
  if (state.selectedComponent && state.selectedComponent !== id) {
    // A selected unit inside the bus must be seen through the shell around it.
    const throughShell = OUTER_SHELL.includes(id) && !OUTER_SHELL.includes(state.selectedComponent);
    opacity = Math.min(opacity, throughShell ? OPACITY.xray : OPACITY.context);
  }
  if (state.selectedComponent === id) opacity = OPACITY.solid;

  return { opacity, selectable: opacity >= OPACITY.selectableAbove, focused };
}

export interface ViewFlags {
  /** Clean assembly lighting with Earth hidden (Build Mode only). */
  studio: boolean;
  thermal: boolean;
  bodyAxes: boolean;
  /** Field-of-view cone and ground footprint. */
  footprint: boolean;
  orbitPath: boolean;
  groundTrack: boolean;
  /** Station marker, visibility cone and RF link. */
  groundSegment: boolean;
  /** The spacecraft is drawn enlarged so it stays visible against Earth. */
  notToScale: boolean;
}

const GROUND_STAGES = new Set(["TARGET", "CAPTURE", "GROUND_PASS", "UPLINK", "TELEMETRY", "PAYLOAD_DOWNLINK", "COMPLETE"]);

export function viewFlags(state: ViewState): ViewFlags {
  const { mode, subsystem, missionStage } = state;
  const systems = mode === "systems";
  const mission = mode === "mission" && isActiveStage(missionStage);
  return {
    studio: mode === "build",
    thermal: (systems && subsystem === "thermal") || (mode === "build" && state.buildStep === 7),
    bodyAxes: (systems && subsystem === "adcs") || (mission && missionStage === "ATTITUDE"),
    footprint: (systems && subsystem === "payload") || (mission && (missionStage === "CAPTURE" || missionStage === "TARGET")),
    orbitPath: mode === "orbit" || (mission && (missionStage === "TARGET" || missionStage === "GROUND_PASS" || missionStage === "COMPLETE")),
    groundTrack: mode === "orbit" || (mission && GROUND_STAGES.has(missionStage)) || (systems && subsystem === "payload"),
    groundSegment: mode === "orbit" || mode === "signals" || (systems && subsystem === "communications") || (mission && GROUND_STAGES.has(missionStage)),
    notToScale: mode === "orbit" || (mission && (missionStage === "TARGET" || missionStage === "GROUND_PASS" || missionStage === "COMPLETE")),
  };
}
