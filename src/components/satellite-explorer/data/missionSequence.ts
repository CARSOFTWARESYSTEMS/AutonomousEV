// Sequenced content: Build Mode steps, mission stages, the guided tour and the
// signal routes. Copy is deliberately short — the scene does the teaching.
import type { ComponentId, ExplorerMode, MissionStage, SignalView, SubsystemId } from "../types";
import type { ActiveMissionStage } from "../simulation/mission";
import type { CameraPresetId } from "../scene/cameraPresets";

// ── Build Mode ────────────────────────────────────────────────────────────
export interface BuildStep {
  /** 1-based step number; matches ComponentDefinition.buildStep. */
  step: number;
  label: string;
  title: string;
  /** One short sentence. */
  caption: string;
  /** The functional chain animated once the units are in place. */
  chain: readonly string[];
  /** Subsystem whose flow is shown, if any. */
  subsystem: SubsystemId | null;
}

export const BUILD_STEPS: readonly BuildStep[] = [
  {
    step: 1,
    label: "STRUCTURE",
    title: "Structure",
    caption: "Provides mechanical support and launch-load path.",
    chain: ["Rails", "Decks", "Deployer interface"],
    subsystem: "structure",
  },
  {
    step: 2,
    label: "POWER",
    title: "Power",
    caption: "Battery, PCDU and solar arrays give the spacecraft electricity.",
    chain: ["Sun", "Solar array", "PCDU", "Battery / Loads"],
    subsystem: "power",
  },
  {
    step: 3,
    label: "AVIONICS",
    title: "Avionics",
    caption: "The flight computer, storage and data bus form the spacecraft's nervous system.",
    chain: ["Sensors", "OBC", "Commands"],
    subsystem: "avionics",
  },
  {
    step: 4,
    label: "ADCS",
    title: "Attitude control",
    caption: "Sensors find the orientation; wheels and magnetorquers change it.",
    chain: ["Sense", "Estimate", "Control"],
    subsystem: "adcs",
  },
  {
    step: 5,
    label: "COMMUNICATIONS",
    title: "Communications",
    caption: "S-band carries commands and telemetry; X-band carries payload data.",
    chain: ["Ground", "Satellite"],
    subsystem: "communications",
  },
  {
    step: 6,
    label: "PAYLOAD",
    title: "Payload",
    caption: "The optical payload is the reason the mission exists.",
    chain: ["Earth", "Optical payload", "Data"],
    subsystem: "payload",
  },
  {
    step: 7,
    label: "THERMAL",
    title: "Thermal",
    caption: "Insulation, radiator, heaters and sensors hold every unit in range.",
    chain: ["MLI", "Radiator", "Heaters", "Sensors"],
    subsystem: "thermal",
  },
  {
    step: 8,
    label: "READY",
    title: "Spacecraft assembled",
    caption: "Every subsystem is integrated. The spacecraft is ready to fly its mission.",
    chain: [],
    subsystem: null,
  },
];

export const BUILD_STEP_COUNT = BUILD_STEPS.length;
/** Seconds each step is held during AUTO BUILD. */
export const AUTO_BUILD_STEP_S = 5.5;

// ── Mission ───────────────────────────────────────────────────────────────
export interface MissionStageInfo {
  stage: ActiveMissionStage;
  /** Timeline label. */
  label: string;
  title: string;
  /** One short sentence describing what the learner is watching. */
  caption: string;
  camera: CameraPresetId;
  /** See through the outer panels for this stage. */
  xray: boolean;
}

export const MISSION_STAGE_INFO: Record<ActiveMissionStage, MissionStageInfo> = {
  BOOT: {
    stage: "BOOT",
    label: "BOOT",
    title: "Boot",
    caption: "Battery power reaches the flight computer through the PCDU.",
    camera: "missionBoot",
    xray: true,
  },
  POWER: {
    stage: "POWER",
    label: "POWER",
    title: "Power",
    caption: "The spacecraft leaves Earth's shadow and the solar arrays start charging the battery.",
    camera: "missionPower",
    xray: false,
  },
  ATTITUDE: {
    stage: "ATTITUDE",
    label: "ATTITUDE ACQUISITION",
    title: "Attitude acquisition",
    caption: "Sensors find the orientation; reaction wheels turn the spacecraft to face Earth.",
    camera: "missionAttitude",
    xray: false,
  },
  TARGET: {
    stage: "TARGET",
    label: "TARGET APPROACH",
    title: "Target approach",
    caption: "The ground track carries the spacecraft toward the observation target.",
    camera: "missionTarget",
    xray: false,
  },
  CAPTURE: {
    stage: "CAPTURE",
    label: "EARTH OBSERVATION",
    title: "Earth observation",
    caption: "The payload points at the target and captures an image.",
    camera: "missionCapture",
    xray: false,
  },
  STORE: {
    stage: "STORE",
    label: "STORE DATA",
    title: "Store data",
    caption: "The processed image waits in onboard storage for a ground pass.",
    camera: "missionStore",
    xray: true,
  },
  GROUND_PASS: {
    stage: "GROUND_PASS",
    label: "GROUND PASS",
    title: "Ground pass",
    caption: "The spacecraft rises above the ground station's horizon.",
    camera: "missionGroundPass",
    xray: false,
  },
  UPLINK: {
    stage: "UPLINK",
    label: "COMMAND UPLINK",
    title: "Command uplink",
    caption: "Mission control sends a command; the spacecraft receives, executes and verifies it.",
    camera: "missionUplink",
    xray: false,
  },
  TELEMETRY: {
    stage: "TELEMETRY",
    label: "TELEMETRY",
    title: "Telemetry",
    caption: "Health and status return to the ground over S-band.",
    camera: "missionTelemetry",
    xray: false,
  },
  PAYLOAD_DOWNLINK: {
    stage: "PAYLOAD_DOWNLINK",
    label: "PAYLOAD DOWNLINK",
    title: "Payload downlink",
    caption: "Stored imagery streams to the ground over X-band.",
    camera: "missionDownlink",
    xray: false,
  },
  COMPLETE: {
    stage: "COMPLETE",
    label: "PASS COMPLETE",
    title: "Pass complete",
    caption: "The spacecraft sets below the horizon and continues its orbit.",
    camera: "missionComplete",
    xray: false,
  },
};

/** Command sent to the spacecraft during the mission's uplink stage. */
export const MISSION_COMMAND = "DOWNLINK PAYLOAD DATA";
/** Command used by the Signals demonstration. */
export const DEMO_COMMAND = "POINT PAYLOAD TO TARGET";

export const missionStageLabel = (stage: MissionStage) => (stage === "IDLE" ? "READY" : MISSION_STAGE_INFO[stage].label);

// ── Signals ───────────────────────────────────────────────────────────────
export interface SignalRoute {
  id: SignalView;
  label: string;
  /** Direction of travel, in words (never colour alone). */
  direction: string;
  band: string;
  caption: string;
  /** Hops from source to destination. */
  hops: readonly string[];
  /** Components lit along the route inside the spacecraft. */
  components: readonly ComponentId[];
}

export const SIGNAL_ROUTES: Record<SignalView, SignalRoute> = {
  command: {
    id: "command",
    label: "COMMAND",
    direction: "Ground → Satellite",
    band: "S-band · TT&C",
    caption: "A command travels up to the spacecraft and is routed to the subsystem that must act.",
    hops: ["Mission control", "Ground station", "RF uplink", "Antenna", "Transceiver", "OBC", "Flight software", "Target subsystem"],
    components: ["sband-antenna", "rf-harness", "sband-radio", "obc", "data-bus", "reaction-wheel-x", "reaction-wheel-y", "reaction-wheel-z"],
  },
  telemetry: {
    id: "telemetry",
    label: "TELEMETRY",
    direction: "Satellite → Ground",
    band: "S-band · TT&C",
    caption: "Sensor readings are packetised by the flight computer and sent down as telemetry.",
    hops: ["Sensors", "OBC", "Packetisation", "Transceiver", "Antenna", "Ground station", "Mission control"],
    components: ["battery", "pcdu", "star-tracker", "obc", "data-bus", "sband-radio", "rf-harness", "sband-antenna"],
  },
  "payload-data": {
    id: "payload-data",
    label: "PAYLOAD DATA",
    direction: "Satellite → Ground",
    band: "X-band · Payload data",
    caption: "Imagery moves from the payload through storage to the high-rate X-band downlink.",
    hops: ["Payload", "Processor", "Storage", "X-band transmitter", "Antenna", "Ground station", "Processing"],
    components: ["optical-payload", "payload-electronics", "payload-processor", "data-storage", "xband-transmitter", "rf-harness", "xband-antenna"],
  },
};

export const SIGNAL_ORDER: readonly SignalView[] = ["command", "telemetry", "payload-data"];

// ── Guided tour ───────────────────────────────────────────────────────────
export interface TourStep {
  id: string;
  title: string;
  /** One or two short sentences, shown as a caption — never a modal. */
  caption: string;
  mode: ExplorerMode;
  subsystem?: SubsystemId;
  signal?: SignalView;
  camera?: CameraPresetId;
  exploded?: number;
  xray?: boolean;
  /** Start the mission run when the step begins. */
  runMission?: boolean;
  /** Seconds before the tour advances on its own. */
  durationS: number;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: "meet",
    title: "Meet the satellite",
    caption: "A 6U Earth-observation spacecraft: a bus the size of a shoebox, with solar arrays and a telescope facing Earth.",
    mode: "explore",
    camera: "overview",
    exploded: 0,
    xray: false,
    durationS: 18,
  },
  {
    id: "open",
    title: "Open the spacecraft",
    caption: "Inside, every unit has a place: payload on one side, the avionics stack on the other.",
    mode: "explore",
    camera: "exploded",
    exploded: 1,
    xray: false,
    durationS: 22,
  },
  {
    id: "power",
    title: "Power system",
    caption: "Sunlight becomes electricity in the arrays; the PCDU charges the battery and feeds the loads.",
    mode: "systems",
    subsystem: "power",
    exploded: 0,
    durationS: 26,
  },
  {
    id: "computer",
    title: "Flight computer",
    caption: "The onboard computer reads every sensor and commands every subsystem over the data bus.",
    mode: "systems",
    subsystem: "avionics",
    durationS: 22,
  },
  {
    id: "adcs",
    title: "Attitude control",
    caption: "Spin a wheel one way and the spacecraft turns the other. That is how it points.",
    mode: "systems",
    subsystem: "adcs",
    durationS: 26,
  },
  {
    id: "payload",
    title: "Payload",
    caption: "The telescope looks straight down. Its field of view sweeps a strip of the Earth.",
    mode: "systems",
    subsystem: "payload",
    durationS: 24,
  },
  {
    id: "communication",
    title: "Communication",
    caption: "Two links: S-band for commands and telemetry, X-band for imagery.",
    mode: "systems",
    subsystem: "communications",
    durationS: 24,
  },
  {
    id: "ground",
    title: "Ground station",
    caption: "A command leaves mission control, climbs to the spacecraft and reaches the unit that must act.",
    mode: "signals",
    signal: "command",
    durationS: 26,
  },
  {
    id: "mission",
    title: "Complete mission",
    caption: "Now watch it all work together, from boot to downlink.",
    mode: "mission",
    runMission: true,
    durationS: 126,
  },
];

// ── Mobile overview ───────────────────────────────────────────────────────
export interface OverviewCard {
  id: SubsystemId;
  title: string;
  flow: string;
}

export const OVERVIEW_CARDS: readonly OverviewCard[] = [
  { id: "power", title: "POWER", flow: "Sunlight → Electricity → Battery" },
  { id: "avionics", title: "AVIONICS", flow: "Sensors → OBC → Commands" },
  { id: "adcs", title: "ADCS", flow: "Sense → Estimate → Point" },
  { id: "payload", title: "PAYLOAD", flow: "Observe → Capture → Store" },
  { id: "communications", title: "COMMUNICATIONS", flow: "Ground ↔ Satellite" },
  { id: "thermal", title: "THERMAL", flow: "Control spacecraft temperature" },
];

export const MISSION_FLOW: readonly string[] = ["GROUND", "UPLINK", "SATELLITE", "PAYLOAD", "DOWNLINK", "GROUND"];

export const DESKTOP_RECOMMENDATION = {
  badge: "DESKTOP EXPERIENCE RECOMMENDED",
  headline: "Interactive 3D experience is designed for Laptop/Desktop",
  body: "For the complete interactive 3D experience — including satellite assembly, exploded views, subsystem animations, power flow, signal flow and mission simulation — open this page on a laptop or desktop computer.",
} as const;
