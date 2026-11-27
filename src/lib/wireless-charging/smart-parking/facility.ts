// Smart Parking facility simulation (SP-SIM-001).
//
// A deterministic, fixed-step (0.1 s) simulation of the whole facility:
// arrivals, the entry and exit gates with their barriers and interlocks,
// identification, authorisation, allocation and atomic reservation, vehicle
// motion along lane-following and parking paths with a lane-zone mutex,
// bay sensors with node debounce, MQTT telemetry through the simulated
// broker to the edge gateway, sensor fusion, the session state machine,
// charging through each wireless bay's own Station simulation, the shelter
// environment and its local safety controller, solar, storage and grid
// energy management, billing in two ledgers, reservations, anomalies and an
// audit log. Separate seeded generators per subsystem keep runs reproducible
// and independent of how many steps are taken per rendered frame.
import { createRng, type Rng } from "../math";
import { PHASES } from "../stateMachine";
import { allocate, type AllocationPolicy, type AllocationResult, type BayView, commitReservation, DEFAULT_WEIGHTS, type Weights } from "./allocation";
import { BARRIER_SPEED, type BarrierState, commandBarrier, isClosed, isOpen, newBarrier, stepBarrier } from "./barrier";
import { type ChargingBill, chargingBill, money, PAYMENT_PROVIDERS, type ParkingBill, parkingBill, type PaymentRecord, TARIFFS } from "./billing";
import { attach, type BayCharger, chargerView, detach, isFault, newCharger, requestStop, setAllowance, stepCharger, stoppedSafely } from "./charging";
import { type Eligibility, evaluateEligibility } from "./charging";
import { chargingBudget, DEFAULT_ENERGY, dispatch, type EnergyInputs, type EnergyLedger, type EnergyStep, newLedger, newStorage, pvPower, shareCharging, type Storage, storageSoc } from "./energy";
import { DEFAULT_ENV, type EnvInputs, type EnvState, envLoads, newEnv, stepEnv } from "./environment";
import { type Anomaly, type AnomalyKind, robustZ } from "./forecast";
import { type AccessDecision, type Credential, decideAccess, DEFAULT_RECOGNITION, type Recognition, type RecognitionParams, recognise } from "./identification";
import { buildLayout, type Bay, DEFAULT_LAYOUT, entryPath, exitPaths, type Footprint, indexAt, type Layout, type LayoutInputs, parkedRear, type Path, rejectPaths, sampleAt, SPEED } from "./layout";
import { isTerminal, type Lifecycle, move, newLifecycle, type SessionState } from "./lifecycle";
import { cameraSample, debounce, DEFAULT_FUSION, type FusionParams, type FusionResult, fuse, infraredSample, nodeDecision, type NodeState, type SensorFault, type SensorKind, type SensorVote, ultrasonicSample } from "./occupancy";
import { arrivals, type ArrivalProfile } from "./queueing";
import { ReservationBook } from "./reservations";
import { Broker, checkCommand, type Command, DEFAULT_LAN, ingest, type IngestState, type LinkModel, newIngest, percentile, SCHEMA, signCommand, topic, type Role, type CommandAction } from "./telemetry";
import type { AiDeployment, AuditEntry, BayStatus, FacilityEvent, OperatingMode, Pose2, Region, VehicleProfile } from "./types";
import type { RecordedSession } from "./adapters";
import { CLASSES, DEFAULT_MIX, footprintOf as fpOf, type Mix, receiverOffset, syntheticVehicle } from "./vehicles";

export const FACILITY_MODEL_VERSION = "SP-SIM-001 v1.0.0";
export const FACILITY_STEP = 0.1;

export interface FacilityInputs {
  siteId: string;
  region: Region;
  layout: LayoutInputs;
  policy: AllocationPolicy;
  weights: Weights;
  overflowToWireless: boolean;
  /** Background arrivals (Poisson, shaped by the profile), per hour. */
  arrivalsPerHour: number;
  profile: ArrivalProfile;
  importedProfile?: number[];
  mix: Mix;
  /** Vehicles that may wait on the entry road. */
  queueCapacity: number;
  /** Mean patience at the head of the queue, s. */
  patience: number;
  recognition: RecognitionParams;
  visitorEntry: boolean;
  fusion: FusionParams;
  lan: LinkModel;
  env: EnvInputs;
  energy: EnergyInputs;
  /** Local hour at t = 0. */
  startHour: number;
  /** UTC epoch of t = 0, ms (timestamps are stored in UTC and shown in the site's time zone). */
  epochMs: number;
  /** 1σ of the final parking position, m. */
  alignmentSigma: { lateral: number; longitudinal: number };
  chargingTolerance: { lateral: number; longitudinal: number };
  allowExitOnPaymentPending: boolean;
  aiDeployment: AiDeployment;
  operatingMode: OperatingMode;
  scenario: "tour" | "empty" | "busy";
  seed: number;
}

/** 10:30 site time on 27 Nov 2026 in India (05:00 UTC). */
const EPOCH = Date.UTC(2026, 10, 27, 5, 0, 0);

export const DEFAULT_FACILITY: FacilityInputs = {
  siteId: "EVE-IN-POC-01",
  region: "IN",
  layout: DEFAULT_LAYOUT,
  policy: "multi-objective",
  weights: DEFAULT_WEIGHTS,
  overflowToWireless: false,
  arrivalsPerHour: 8,
  profile: "constant",
  mix: DEFAULT_MIX,
  queueCapacity: 4,
  patience: 8 * 60,
  recognition: DEFAULT_RECOGNITION,
  visitorEntry: true,
  fusion: DEFAULT_FUSION,
  lan: DEFAULT_LAN,
  env: DEFAULT_ENV,
  energy: DEFAULT_ENERGY,
  startHour: 10.5,
  epochMs: EPOCH,
  alignmentSigma: { lateral: 0.03, longitudinal: 0.035 },
  chargingTolerance: { lateral: 0.1, longitudinal: 0.1 },
  allowExitOnPaymentPending: true,
  aiDeployment: "edge",
  operatingMode: "simulation",
  scenario: "tour",
  seed: 20261127,
};

export interface FacilityFaults {
  cameraFault: boolean;
  gatewayDown: boolean;
  cloudDown: boolean;
  paymentDown: boolean;
  sensor: { bayId: string; kind: "ultrasonic" | "infrared" | "camera"; mode: SensorFault } | null;
  smoke: boolean;
  gas: boolean;
  fanFailure: boolean;
  gridOutage: boolean;
  /** A simulated object under a barrier. */
  obstruction: "none" | "entry" | "exit";
  envSensorFailure: boolean;
  /** A charger's own fault (passed to that bay's Station simulation). */
  charger: { bayId: string; fault: "foreignObject" | "livingObject" | "controllerFailure" } | null;
}

export const NO_FACILITY_FAULTS: FacilityFaults = { cameraFault: false, gatewayDown: false, cloudDown: false, paymentDown: false, sensor: null, smoke: false, gas: false, fanFailure: false, gridOutage: false, obstruction: "none", envSensorFailure: false, charger: null };

export interface SimVehicle {
  profile: VehicleProfile;
  sessionId: string;
  fp: Footprint;
  path: Path | null;
  next: Path[];
  s: number;
  v: number;
  /** Rear-axle pose; the vehicle centre is half a wheelbase ahead. */
  pose: Pose2;
  steer: number;
  /** Wheel rotation from distance travelled, rad. */
  spin: number;
  zones: number[];
  /** Stop at this arc length until released (gate stop lines). */
  hold: number | null;
  arrived: boolean;
  spawned: boolean;
  gone: boolean;
  /** Final receiver offset from the pad (wireless bays) or bay reference, m. */
  alignment: { lateral: number; longitudinal: number };
  /** Bay it is driving to (allocated, or the driver's own choice). */
  goal: string | null;
}

export interface Session {
  id: string;
  vehicleId: string;
  lc: Lifecycle;
  bayId: string | null;
  reservationId: string | null;
  recognition: Recognition | null;
  access: AccessDecision | null;
  allocation: AllocationResult | null;
  credential: Credential | null;
  /** Time a timed step finishes, s. */
  until: number;
  detectedAt: number;
  entryAt: number | null;
  parkedAt: number | null;
  departAt: number;
  departureAt: number | null;
  billedAt: number | null;
  exitAt: number | null;
  queueSince: number | null;
  patience: number;
  eligibility: Eligibility | null;
  eligibilityDone: boolean;
  chargingId: string | null;
  parkingBill: ParkingBill | null;
  chargingBill: ChargingBill | null;
  payment: PaymentRecord | null;
  /** Detection event that opened the session (idempotent). */
  detection: string;
  tailgater: boolean;
  /** Bay the vehicle actually stopped in, when it is not the allocation. */
  wrongBay: string | null;
  needsOperator: string | null;
  /** SOC when the parking record last took it from the station (once). */
  socOut: number | null;
  /** When the vehicle came to rest at the entry or exit stop line, s. */
  stopAt: number | null;
  exitStopAt: number | null;
}

export interface BayRuntime {
  bay: Bay;
  status: BayStatus;
  version: number;
  session: string | null;
  blocked: boolean;
  maintenance: boolean;
  nodes: Record<"ultrasonic" | "infrared" | "camera", NodeState>;
  /** The gateway's latest state per sensor. */
  votes: Map<SensorKind, SensorVote>;
  fusion: FusionResult;
  fused: boolean | null;
  uncertainSince: number | null;
  /** Physically occupied by (truth, for verification only — the facility never reads it to decide). */
  truth: string | null;
  vacantSince: number | null;
  history: { t: number; status: BayStatus }[];
  lastRaw: { ultrasonic: number; infrared: number; camera: number };
  stuckCount: number;
}

export interface Gate {
  id: "entry" | "exit";
  barrier: BarrierState;
  /** Session being served at the stop line. */
  current: string | null;
  /** Vehicles that crossed the barrier line since it last opened, and authorisations given. */
  passes: number;
  authorised: number;
  /** Vehicles currently over the barrier line (for pass counting). */
  over: Set<string>;
}

export interface DeviceInfo {
  id: string;
  kind: string;
  label: string;
  ref: string | null;
  period: number;
  seq: number;
  next: number;
  lastSeen: number;
  online: boolean;
}

export interface Sample {
  t: number;
  hour: number;
  occupied: number;
  available: number;
  charging: number;
  queue: number;
  pv: number;
  grid: number;
  bess: number;
  bessSoc: number;
  load: number;
  chargingPower: number;
  temperature: number;
  co: number;
  smoke: number;
  gas: number;
  latencyP95: number;
}

export interface FacilitySim {
  inputs: FacilityInputs;
  faults: FacilityFaults;
  layout: Layout;
  t: number;
  steps: number;
  rng: { arrivals: Rng; vehicles: Rng; recognition: Rng; sensors: Rng; motion: Rng; misc: Rng };
  vehicles: SimVehicle[];
  sessions: Map<string, Session>;
  bays: BayRuntime[];
  gates: { entry: Gate; exit: Gate };
  /** Arrivals waiting to appear on the entry road (scheduled times, vehicle). */
  pending: { at: number; profile: VehicleProfile }[];
  zoneOwner: (string | null)[];
  /** Lane zones reserved ahead by a vehicle about to reverse out of a bay (it yields until its whole sweep is free). */
  zoneReserve: (string | null)[];
  chargers: Map<string, BayCharger>;
  reservations: ReservationBook;
  access: { plates: Set<string>; tags: Set<string>; tokens: Set<string> };
  env: EnvState;
  storage: Storage;
  energy: EnergyLedger;
  lastEnergy: EnergyStep | null;
  pvCell: number;
  broker: Broker;
  ingest: IngestState;
  gatewayUp: boolean;
  /** Messages buffered at the gateway for the cloud while the cloud is unreachable (store and forward). */
  cloudBuffer: number;
  devices: Map<string, DeviceInfo>;
  /** The last messages the gateway received (for the IoT view and the message log). */
  recent: { n: number; at: number; device: string; topic: string; verdict: string; mode: string }[];
  /** A telemetry recording in progress (the envelopes the gateway received), or null. */
  recording: RecordedSession | null;
  audit: AuditEntry[];
  events: FacilityEvent[];
  anomalies: Anomaly[];
  samples: Sample[];
  stats: { arrived: number; balked: number; rejected: number; abandoned: number; entered: number; exited: number; tailgating: number; refusedTransitions: number; doubleAllocation: number; waitSum: number; waitCount: number; searchSum: number; searchCount: number; stays: number[] };
  ledger: { parking: number; charging: number; payments: PaymentRecord[] };
  seenCommands: Set<string>;
  nextId: { session: number; vehicle: number; charging: number; event: number; payment: number };
  /** Station sub-step while charging, s (50 ms, or 250 ms at high time scales, as in the Station environment). */
  stationStep: number;
  focus: string | null;
}

// ── Construction ──────────────────────────────────────────────────────────

const ID = { session: (n: number) => `PS-${String(n).padStart(5, "0")}`, charging: (n: number) => `CS-${String(n).padStart(5, "0")}` };

function node(kind: SensorKind): NodeState {
  return { kind, state: null, pending: null, count: 0, last: null, changedAt: 0 };
}

const FUSION0: FusionResult = { p: 0.5, decision: "uncertain", disagreement: false, used: [], stale: [] };

export function createFacility(inputs: FacilityInputs = DEFAULT_FACILITY, faults: FacilityFaults = NO_FACILITY_FAULTS): FacilitySim {
  const layout = buildLayout(inputs.layout);
  const seed = inputs.seed;
  const sim: FacilitySim = {
    inputs,
    faults: { ...faults },
    layout,
    t: 0,
    steps: 0,
    rng: { arrivals: createRng(seed + 1), vehicles: createRng(seed + 2), recognition: createRng(seed + 3), sensors: createRng(seed + 4), motion: createRng(seed + 5), misc: createRng(seed + 6) },
    vehicles: [],
    sessions: new Map(),
    bays: layout.bays.map((bay) => ({ bay, status: "available", version: 0, session: null, blocked: false, maintenance: false, nodes: { ultrasonic: node("ultrasonic"), infrared: node("infrared"), camera: node("camera") }, votes: new Map(), fusion: FUSION0, fused: null, uncertainSince: null, truth: null, vacantSince: 0, history: [], lastRaw: { ultrasonic: 0, infrared: 0, camera: 0 }, stuckCount: 0 })),
    gates: { entry: { id: "entry", barrier: newBarrier("GATE-IN"), current: null, passes: 0, authorised: 0, over: new Set() }, exit: { id: "exit", barrier: newBarrier("GATE-OUT"), current: null, passes: 0, authorised: 0, over: new Set() } },
    pending: [],
    zoneOwner: layout.zones.map(() => null),
    zoneReserve: layout.zones.map(() => null),
    chargers: new Map(),
    reservations: new ReservationBook(),
    access: { plates: new Set(), tags: new Set(), tokens: new Set() },
    env: newEnv(inputs.env, inputs.startHour),
    storage: newStorage(inputs.energy),
    energy: newLedger(),
    lastEnergy: null,
    pvCell: 25,
    broker: new Broker(seed + 7, inputs.lan),
    ingest: newIngest(),
    gatewayUp: true,
    cloudBuffer: 0,
    devices: new Map(),
    recent: [],
    recording: null,
    audit: [],
    events: [],
    anomalies: [],
    samples: [],
    stats: { arrived: 0, balked: 0, rejected: 0, abandoned: 0, entered: 0, exited: 0, tailgating: 0, refusedTransitions: 0, doubleAllocation: 0, waitSum: 0, waitCount: 0, searchSum: 0, searchCount: 0, stays: [] },
    ledger: { parking: 0, charging: 0, payments: [] },
    seenCommands: new Set(),
    nextId: { session: 1, vehicle: 100, charging: 1, event: 1, payment: 1 },
    stationStep: 0.05,
    focus: null,
  };
  let chargerSeed = seed + 100;
  for (const b of layout.bays) if (b.type === "wireless") sim.chargers.set(b.id, newCharger(b.id, chargerSeed++));
  registerDevices(sim);
  // Background arrivals for the first 24 h (more are drawn as time runs on).
  scheduleArrivals(sim, 0, 24 * 3600);
  if (inputs.scenario !== "empty") populate(sim);
  for (const b of sim.bays) b.history.push({ t: 0, status: b.status });
  return sim;
}

function registerDevices(sim: FacilitySim) {
  const add = (id: string, kind: string, label: string, ref: string | null, period: number) => {
    sim.devices.set(id, { id, kind, label, ref, period, seq: 0, next: (sim.devices.size % 10) * 0.37, lastSeen: 0, online: true });
    const own = [topic("telemetry", sim.inputs.siteId, id), topic("status", sim.inputs.siteId, id), topic("ack", sim.inputs.siteId, id), `${topic("events", sim.inputs.siteId, id)}`];
    const bays = ref && kind !== "gate" ? [topic("occupancy", sim.inputs.siteId, ref)] : [];
    const camBays = kind === "camera" ? sim.layout.bays.filter((b) => b.row === ref).map((b) => topic("occupancy", sim.inputs.siteId, b.id)) : [];
    sim.broker.connect({ id, publish: [...own, ...bays, ...camBays], subscribe: [topic("commands", sim.inputs.siteId, id)], tls: true, lastWill: topic("status", sim.inputs.siteId, id) });
  };
  for (const b of sim.layout.bays) {
    add(`US-${b.id}`, "ultrasonic", `Ultrasonic node, bay ${b.id}`, b.id, 10);
    add(`IR-${b.id}`, "infrared", `Infrared node, bay ${b.id}`, b.id, 10);
  }
  add("CAM-N", "camera", "Row camera (north), occupancy analytics", "N", 10);
  add("CAM-S", "camera", "Row camera (south), occupancy analytics", "S", 10);
  add("ANPR-IN", "anpr", "Entry recognition camera", "entry", 15);
  add("ANPR-OUT", "anpr", "Exit recognition camera", "exit", 15);
  add("READER-IN", "reader", "Entry RFID/QR reader", "entry", 15);
  add("GATE-IN", "gate", "Entry barrier controller", "entry", 15);
  add("GATE-OUT", "gate", "Exit barrier controller", "exit", 15);
  add("ENV-N", "environment", "Environmental node (north canopy)", "N", 5);
  add("ENV-S", "environment", "Environmental node (south canopy)", "S", 5);
  add("FAN-CTL", "actuator", "Ventilation fan controller", null, 15);
  add("LIGHT-CTL", "actuator", "Lighting controller", null, 15);
  add("LED-ENTRY", "display", "Entry guidance display", "entry", 15);
  add("METER-MAIN", "meter", "Main energy meter", null, 5);
  add("PV-INV", "meter", "Solar inverter", null, 5);
  add("BESS-01", "meter", "Battery storage controller", null, 5);
  for (const id of sim.chargers.keys()) add(`WPT-${id}`, "charger", `Wireless charger, bay ${id}`, id, 5);
  add("EDGE-01", "gateway", "Edge gateway (Raspberry Pi-class)", null, 15);
}

function scheduleArrivals(sim: FacilitySim, t0: number, t1: number) {
  const i = sim.inputs;
  const times = arrivals(i.arrivalsPerHour / 3600, t0, t1, i.profile, i.startHour, sim.rng.arrivals, i.importedProfile);
  for (const at of times) {
    const p = syntheticVehicle(i.region, sim.rng.vehicles, i.mix, {}, sim.nextId.vehicle++);
    enrol(sim, p);
    sim.pending.push({ at, profile: p });
  }
  sim.pending.sort((a, b) => a.at - b.at);
}

/** Members and reservation holders are on the local access list (the synthetic registry). */
function enrol(sim: FacilitySim, p: VehicleProfile) {
  if (p.denied) return;
  if (p.member) {
    sim.access.plates.add(p.plate);
    if (p.rfid) sim.access.tags.add(p.rfid);
  }
  if (p.qr) {
    sim.access.tokens.add(p.qr);
    sim.access.plates.add(p.plate);
  }
}

/** The demonstration's starting state: half the bays already in use, one EV charging, one charged. */
function populate(sim: FacilitySim) {
  const r = sim.rng.vehicles;
  const busy = sim.inputs.scenario === "busy";
  const plan: { bay: string; over: Partial<VehicleProfile> }[] = [];
  const bays = sim.layout.bays;
  const conventional = bays.filter((b) => b.type === "conventional");
  const wireless = bays.filter((b) => b.type === "wireless");
  conventional.slice(0, busy ? conventional.length : Math.ceil(conventional.length / 2)).forEach((b, k) => plan.push({ bay: b.id, over: { powertrain: k % 3 === 2 ? "electric" : "conventional", wirelessCompatible: false, wantsCharging: false, cls: (["sedan", "suv", "compact", "van"] as const)[k % 4], member: true } }));
  if (wireless[0]) plan.push({ bay: wireless[0].id, over: { powertrain: "electric", wirelessCompatible: true, wantsCharging: true, cls: "sedan", soc: 0.46, member: true, paint: "#c9ced4" } });
  if (wireless.length > 2) plan.push({ bay: wireless[wireless.length - 1].id, over: { powertrain: "electric", wirelessCompatible: true, wantsCharging: true, cls: "suv", soc: 0.81, member: true, paint: "#17191d" } });
  for (const { bay, over } of plan) {
    const p = syntheticVehicle(sim.inputs.region, r, sim.inputs.mix, { plateObstructed: false, denied: false, ...over, stay: 2400 + r.next() * 9000 }, sim.nextId.vehicle++);
    enrol(sim, p);
    placeParked(sim, p, bay, -(600 + r.next() * 3000));
  }
}

/** Puts a vehicle directly into a bay (initial state), with its session already parked. */
function placeParked(sim: FacilitySim, p: VehicleProfile, bayId: string, entryAt: number) {
  const b = sim.bays.find((x) => x.bay.id === bayId)!;
  const s = newSession(sim, p, `init-${p.id}`);
  s.bayId = bayId;
  s.entryAt = entryAt;
  s.parkedAt = entryAt + 60;
  s.departAt = Math.max(300, entryAt + p.stay);
  s.credential = p.rfid ? "rfid" : "plate";
  for (const st of ["detected", "identifying", "identified", "authorizing", "authorized", "allocating", "reserved", "entry-permitted", "barrier-opening", "entering", "barrier-closing", "navigating", "parking", "confirming", "parked"] as SessionState[]) move(s.lc, st, entryAt, "Initial state of the demonstration");
  b.status = "occupied";
  b.session = s.id;
  b.version += 1;
  const v = vehicleFor(sim, p, s.id);
  const fp = v.fp;
  const al = { lateral: sim.rng.motion.normal() * sim.inputs.alignmentSigma.lateral * 0.6, longitudinal: sim.rng.motion.normal() * sim.inputs.alignmentSigma.longitudinal * 0.6 };
  v.alignment = al;
  const rearY = parkedRear(b.bay, fp, receiverOffset(p), al.longitudinal);
  v.pose = { x: b.bay.x + al.lateral * (b.bay.row === "N" ? 1 : -1), y: rearY, heading: b.bay.heading };
  v.spawned = true;
  v.arrived = true;
  v.goal = bayId;
  // Sensors start agreeing with the parked vehicle.
  for (const n of Object.values(b.nodes)) n.state = true;
  for (const k of ["ultrasonic", "infrared", "camera"] as SensorKind[]) b.votes.set(k, { kind: k, state: true, at: 0, mode: "SIMULATED" });
  b.fused = true;
  b.vacantSince = null;
  const ch = sim.chargers.get(bayId);
  if (ch && p.wantsCharging && p.wirelessCompatible) {
    s.eligibilityDone = true;
    move(s.lc, "eligibility", entryAt + 61, "Initial state");
    s.chargingId = ID.charging(sim.nextId.charging++);
    attach(ch, p, s.id, s.chargingId, alignmentToPad(b.bay, v), entryAt + 62);
    move(s.lc, "charging", entryAt + 62, "Initial state");
    b.status = "charging";
    // Run the station's own sequence to charging (or to completion for a full battery).
    for (let k = 0; k < 1200 && !(PHASES[ch.sim.state.phase].id === "charging" || ch.sim.state.phase === "completed"); k++) stepCharger(ch, 0.05, 0.05, {});
    if (ch.sim.state.phase === "completed") {
      move(s.lc, "charged", entryAt + 120, "Target already reached");
      b.status = "charging-complete";
    }
  }
}

function newSession(sim: FacilitySim, p: VehicleProfile, detection: string): Session {
  const s: Session = {
    id: ID.session(sim.nextId.session++),
    vehicleId: p.id,
    lc: newLifecycle(sim.t),
    bayId: null,
    reservationId: null,
    recognition: null,
    access: null,
    allocation: null,
    credential: null,
    until: 0,
    detectedAt: sim.t,
    entryAt: null,
    parkedAt: null,
    departAt: sim.t + p.stay,
    departureAt: null,
    billedAt: null,
    exitAt: null,
    queueSince: null,
    patience: -Math.log(1 - sim.rng.misc.next()) * sim.inputs.patience,
    eligibility: null,
    eligibilityDone: false,
    chargingId: null,
    parkingBill: null,
    chargingBill: null,
    payment: null,
    detection,
    tailgater: false,
    wrongBay: null,
    needsOperator: null,
    socOut: null,
    stopAt: null,
    exitStopAt: null,
  };
  sim.sessions.set(s.id, s);
  return s;
}

function vehicleFor(sim: FacilitySim, p: VehicleProfile, sessionId: string): SimVehicle {
  const v: SimVehicle = { profile: p, sessionId, fp: fpOf(p), path: null, next: [], s: 0, v: 0, pose: { x: sim.layout.entry.spawnX, y: 0, heading: 0 }, steer: 0, spin: 0, zones: [], hold: null, arrived: false, spawned: false, gone: false, alignment: { lateral: 0, longitudinal: 0 }, goal: null };
  sim.vehicles.push(v);
  return v;
}

// ── Commands (visitor, driver, operator, guided stages) ────────────────────

/** A vehicle arrives now (or at `at`): the same entry every background arrival uses. Returns its id. */
export function arrive(sim: FacilitySim, over: Partial<VehicleProfile> = {}, at = sim.t): string {
  const p = syntheticVehicle(sim.inputs.region, sim.rng.vehicles, sim.inputs.mix, over, sim.nextId.vehicle++);
  enrol(sim, p);
  sim.pending.push({ at, profile: p });
  sim.pending.sort((a, b) => a.at - b.at);
  return p.id;
}

export function requestDeparture(sim: FacilitySim, sessionId: string, actor = "driver"): boolean {
  const s = sim.sessions.get(sessionId);
  if (!s) return false;
  s.departAt = Math.min(s.departAt, sim.t);
  audit(sim, actor, actor === "driver" ? "driver" : "operator", "session.depart", sessionId, "accepted", "Departure requested");
  return true;
}

export function sessionOf(sim: FacilitySim, vehicleId: string): Session | null {
  for (const s of sim.sessions.values()) if (s.vehicleId === vehicleId && !isTerminal(s.lc.state)) return s;
  for (const s of [...sim.sessions.values()].reverse()) if (s.vehicleId === vehicleId) return s;
  return null;
}

export const vehicleById = (sim: FacilitySim, id: string) => sim.vehicles.find((v) => v.profile.id === id) ?? null;
export const bayById = (sim: FacilitySim, id: string) => sim.bays.find((b) => b.bay.id === id) ?? null;

/** A driver books a bay class (or a bay) for a window; returns the reservation or the reason it was refused. */
export function book(sim: FacilitySim, req: { vehicleId: string; type: "wireless" | "conventional" | "accessible"; bayId?: string | null; start: number; end: number }) {
  const capacity = { wireless: 0, conventional: 0, accessible: 0 };
  for (const b of sim.bays) if (!b.blocked && !b.maintenance) capacity[b.bay.type] += 1;
  const token = `QR-${(sim.rng.misc.next() * 0xffffffff).toString(16).toUpperCase().padStart(8, "0")}`;
  const r = sim.reservations.book({ ...req, token }, capacity, sim.t);
  if (r.ok) sim.access.tokens.add(token);
  audit(sim, req.vehicleId, "driver", "reservation.book", req.bayId ?? req.type, r.ok ? "accepted" : "rejected", r.reason);
  return r;
}

/** An operator (or supervisor, or automation) command through the same validation a device controller applies. */
export function operatorCommand(sim: FacilitySim, action: CommandAction, target: string, role: Role, params: Record<string, number | string | boolean> = {}, opts: { expiresIn?: number; tamper?: boolean; id?: string } = {}): { ok: boolean; reason: string } {
  const cmd: Command = signCommand({ commandId: opts.id ?? `CMD-${sim.nextId.event++}`, action, target, params, issuedBy: role === "automation" ? "automation" : `${role}-console`, role, issuedAt: sim.t, expiresAt: sim.t + (opts.expiresIn ?? 30) });
  if (opts.tamper) cmd.params = { ...cmd.params, tampered: true };
  const mode = sim.inputs.operatingMode === "poc" || sim.inputs.operatingMode === "charging-telemetry" ? "connected-read-only" : "simulation";
  const check = checkCommand(cmd, sim.t, sim.seenCommands, mode);
  if (!check.ok) {
    audit(sim, cmd.issuedBy, role, action, target, "rejected", check.reason);
    return check;
  }
  sim.seenCommands.add(cmd.commandId);
  const res = execute(sim, cmd);
  audit(sim, cmd.issuedBy, role, action, target, res.ok ? "accepted" : "rejected", res.reason);
  return res;
}

function execute(sim: FacilitySim, c: Command): { ok: boolean; reason: string } {
  const bay = bayById(sim, c.target);
  const session = sim.sessions.get(c.target);
  switch (c.action) {
    case "barrier.open":
    case "barrier.close": {
      const g = c.target === "exit" ? sim.gates.exit : sim.gates.entry;
      const ok = commandBarrier(g.barrier, c.action === "barrier.open" ? "open" : "close", c.issuedBy, sim.t);
      return { ok, reason: g.barrier.lastCommand?.reason ?? "" };
    }
    case "bay.block":
    case "bay.unblock":
      if (!bay) return { ok: false, reason: "Unknown bay" };
      if (c.action === "bay.block" && bay.session) return { ok: false, reason: "Bay is in use" };
      bay.maintenance = c.action === "bay.block";
      bay.version += 1;
      return { ok: true, reason: c.action === "bay.block" ? "Bay set to maintenance" : "Bay returned to service" };
    case "bay.release":
      if (!bay) return { ok: false, reason: "Unknown bay" };
      if (bay.fused !== false) return { ok: false, reason: "Sensors do not confirm the bay is empty" };
      bay.session = null;
      bay.version += 1;
      return { ok: true, reason: "Released after verified vacancy" };
    case "session.approve":
    case "session.refuse": {
      if (!session || !session.needsOperator) return { ok: false, reason: "No decision pending for this session" };
      operatorDecision(sim, session, c.action === "session.approve");
      return { ok: true, reason: c.action === "session.approve" ? "Approved" : "Refused" };
    }
    case "charging.stop": {
      const ch = sim.chargers.get(c.target);
      if (!ch || !ch.session) return { ok: false, reason: "No charging session on this bay" };
      requestStop(ch);
      return { ok: true, reason: "Safe stop requested from the station" };
    }
    case "alarm.acknowledge":
      if (sim.env.alarm === "none") return { ok: false, reason: "No active alarm" };
      if (sim.faults.smoke || sim.faults.gas) return { ok: false, reason: "Alarm condition still present" };
      sim.env.acknowledged = true;
      return { ok: true, reason: "Alarm acknowledged" };
    case "lighting.set":
    case "fan.set":
      return { ok: true, reason: "Set-point accepted (bounded by the local controller)" };
  }
}

function operatorDecision(sim: FacilitySim, s: Session, approve: boolean) {
  const v = vehicleById(sim, s.vehicleId)!;
  const was = s.needsOperator;
  s.needsOperator = null;
  if (s.lc.state === "manual-verification") {
    if (approve) {
      s.access = { identified: true, credential: "operator", identity: s.recognition?.read ?? v.profile.id, authorised: true, role: "visitor", reason: "Verified by an operator" };
      s.credential = "operator";
      transition(sim, s, "identified", "Operator verified the vehicle");
    } else reject(sim, s, v, "Operator refused entry");
    return;
  }
  if (s.lc.state === "operator-intervention") {
    if (approve) {
      const b = bayById(sim, s.bayId ?? "");
      if (b) {
        b.status = "occupied";
        b.session = s.id;
        b.version += 1;
      }
      if (s.parkedAt === null) s.parkedAt = sim.t;
      transition(sim, s, "parked", was === "tailgating" ? "Operator accepted the tailgating vehicle as a visitor" : "Operator confirmed the bay");
    } else {
      s.departAt = sim.t;
      transition(sim, s, "departure-requested", "Operator asked the vehicle to leave");
    }
  }
}

// ── Stepping ──────────────────────────────────────────────────────────────

export function stepFacility(sim: FacilitySim, dt = FACILITY_STEP) {
  sim.t += dt;
  sim.steps += 1;
  const hour = sim.inputs.startHour + sim.t / 3600;
  sim.gatewayUp = !sim.faults.gatewayDown;
  if (sim.steps % Math.round(3600 / dt) === 0) scheduleArrivals(sim, sim.t + 23 * 3600, sim.t + 24 * 3600);
  spawn(sim);
  barriers(sim, dt);
  for (const v of sim.vehicles) if (v.spawned && !v.gone) moveVehicle(sim, v, dt);
  detect(sim);
  cleanup(sim);
  sense(sim, dt);
  gateway(sim);
  for (const s of sim.sessions.values()) if (!isTerminal(s.lc.state)) advanceSession(sim, s);
  serveGates(sim);
  chargers(sim, dt, hour);
  sim.reservations.update(sim.t);
  if (sim.steps % 50 === 0) anomalies(sim);
  if (sim.steps % 300 === 0) sample(sim, hour);
  // Forget finished vehicles after a while (their sessions stay in the record).
  if (sim.steps % 600 === 0) sim.vehicles = sim.vehicles.filter((v) => !v.gone || sim.t - (sim.sessions.get(v.sessionId)?.exitAt ?? sim.t) < 120);
}

/** Advances by `seconds` in fixed steps. */
export function runFacility(sim: FacilitySim, seconds: number, dt = FACILITY_STEP) {
  const n = Math.round(seconds / dt);
  for (let i = 0; i < n; i++) stepFacility(sim, dt);
  return sim;
}

function event(sim: FacilitySim, kind: string, text: string, ref?: string, severity: FacilityEvent["severity"] = "info") {
  sim.events.push({ t: sim.t, kind, text, ref, severity });
  if (sim.events.length > 400) sim.events.splice(0, sim.events.length - 400);
}

function audit(sim: FacilitySim, actor: string, role: string, action: string, target: string, result: AuditEntry["result"], reason: string) {
  sim.audit.push({ t: sim.t, actor, role, action, target, result, reason });
  if (sim.audit.length > 300) sim.audit.splice(0, sim.audit.length - 300);
}

function transition(sim: FacilitySim, s: Session, to: SessionState, reason: string): boolean {
  const ok = move(s.lc, to, sim.t, reason);
  if (!ok && s.lc.state !== to) sim.stats.refusedTransitions += 1;
  return ok;
}

// ── Arrivals ──

/** Vehicles turned away leave the scene at the end of the return road. */
function cleanup(sim: FacilitySim) {
  for (const v of sim.vehicles) {
    if (!v.spawned || v.gone || !v.arrived) continue;
    const s = sim.sessions.get(v.sessionId);
    if (s && (s.lc.state === "rejected" || s.lc.state === "abandoned")) {
      v.gone = true;
      claim(sim, v, []);
      s.exitAt = sim.t;
    }
  }
}

function spawn(sim: FacilitySim) {
  while (sim.pending.length && sim.pending[0].at <= sim.t) {
    const { profile, at } = sim.pending[0];
    // Vehicles on the entry road that have not yet passed the gate (the queue, including the one at the stop line).
    const waiting = sim.vehicles.filter((v) => v.spawned && !v.gone && preEntry(sim, v)).length;
    if (waiting >= sim.inputs.queueCapacity + 1 || sim.t - at > 60) {
      // The entry road is full: this arrival drives past (balks).
      sim.pending.shift();
      sim.stats.arrived += 1;
      sim.stats.balked += 1;
      event(sim, "balk", `Entry road full: ${profile.id} drove past`, profile.id, "warning");
      continue;
    }
    const fp = fpOf(profile);
    // A provisional path toward the first bay column; replaced once a bay is allocated (identical up to the gate).
    const path = entryPath(sim.layout, sim.layout.bays[0], fp, { rearY: 4.3, lateral: 0 });
    if (blocked(sim, profile.id, path.samples[0].zones)) break;
    sim.pending.shift();
    sim.stats.arrived += 1;
    const v = vehicleFor(sim, profile, "");
    v.path = path;
    v.hold = path.stops.entry;
    v.spawned = true;
    v.v = SPEED.road * 0.9;
    v.pose = { x: path.samples[0].x, y: path.samples[0].y, heading: 0 };
    claim(sim, v, path.samples[0].zones);
    event(sim, "arrival", `${profile.id} approaching the entry`, profile.id);
  }
}

function preEntry(sim: FacilitySim, v: SimVehicle): boolean {
  const s = v.sessionId ? sim.sessions.get(v.sessionId) : null;
  if (!s) return true;
  return s.entryAt === null && !isTerminal(s.lc.state) && !s.tailgater;
}

// ── Motion: lane following with a lane-zone mutex ──

function claim(sim: FacilitySim, v: SimVehicle, zones: number[]) {
  for (const z of v.zones) if (!zones.includes(z) && sim.zoneOwner[z] === v.profile.id) sim.zoneOwner[z] = null;
  // A zone another vehicle holds is never taken over (only a tailgater can be in one, in its leader's shadow).
  for (const z of zones) if (sim.zoneOwner[z] === null) sim.zoneOwner[z] = v.profile.id;
  v.zones = zones.filter((z) => sim.zoneOwner[z] === v.profile.id);
}

const blocked = (sim: FacilitySim, id: string, zones: number[], shadow: string | null = null) =>
  zones.some((z) => {
    const owner = sim.zoneOwner[z];
    // A tailgating driver (a fault scenario) rides in the zones of the vehicle it follows; its gap is kept geometrically instead.
    if (owner !== null && owner !== id) return owner !== shadow;
    return sim.zoneReserve[z] !== null && sim.zoneReserve[z] !== id;
  });

/** The vehicle a tailgater follows at the entry gate, and the bumper-to-bumper gap to it, m. */
function leaderOf(sim: FacilitySim, v: SimVehicle): { id: string; gap: number } | null {
  if (!v.profile.tailgates || Math.abs(v.pose.y) > 1 || v.pose.x > sim.layout.aisle.xWest + 2 || v.pose.x < sim.layout.entry.barrierX - 16) return null;
  const front = v.pose.x + v.fp.wheelbase + (v.fp.length - v.fp.wheelbase) / 2;
  let best: { id: string; gap: number } | null = null;
  for (const o of sim.vehicles) {
    if (o === v || !o.spawned || o.gone || Math.abs(o.pose.y) > 1.2 || o.pose.x <= v.pose.x) continue;
    const gap = o.pose.x - (o.fp.length - o.fp.wheelbase) / 2 - front;
    if (!best || gap < best.gap) best = { id: o.profile.id, gap };
  }
  return best;
}

function releaseReserve(sim: FacilitySim, id: string) {
  for (let z = 0; z < sim.zoneReserve.length; z++) if (sim.zoneReserve[z] === id) sim.zoneReserve[z] = null;
}

function moveVehicle(sim: FacilitySim, v: SimVehicle, dt: number) {
  if (!v.path) return;
  const path = v.path;
  const id = v.profile.id;
  // A vehicle at rest in its bay holds no lane zone.
  if (v.arrived) {
    if (v.zones.length) claim(sim, v, []);
    return;
  }
  // Before reversing out, reserve every lane zone of the reverse sweep at once, or wait (yield to traffic).
  if (v.s === 0 && path.samples[0].dir === -1 && !sim.zoneReserve.includes(id)) {
    const sweep = new Set<number>();
    for (const p of path.samples) for (const z of p.zones) sweep.add(z);
    for (const p of v.next[0]?.samples.slice(0, 40) ?? []) for (const z of p.zones) sweep.add(z);
    if ([...sweep].some((z) => (sim.zoneOwner[z] !== null && sim.zoneOwner[z] !== id) || (sim.zoneReserve[z] !== null && sim.zoneReserve[z] !== id))) {
      v.v = 0;
      return;
    }
    for (const z of sweep) sim.zoneReserve[z] = id;
  }
  // A tailgater drives on while the boom is up; nobody drives through a lowered boom.
  const hold = v.profile.tailgates && v.hold !== null && sim.gates.entry.barrier.angle >= 70 ? null : v.hold;
  const limit = Math.min(path.length, hold ?? Number.POSITIVE_INFINITY);
  // Look ahead for slower segments, the hold point and lane zones held by others.
  const look = Math.max(4, (v.v * v.v) / (2 * 1.6) + 3);
  let vT = Number.POSITIVE_INFINITY;
  const i0 = indexAt(path, v.s);
  let stopAt = limit;
  const lead = leaderOf(sim, v);
  if (lead) stopAt = Math.min(stopAt, v.s + lead.gap - 1.0);
  const shadow = lead?.id ?? null;
  for (let j = i0; j < path.samples.length; j++) {
    const p = path.samples[j];
    if (p.s - v.s > look) break;
    vT = Math.min(vT, Math.sqrt(p.vmax * p.vmax + 2 * 1.6 * Math.max(0, p.s - v.s)));
    if (j > i0 && blocked(sim, id, p.zones, shadow)) {
      stopAt = Math.min(stopAt, p.s - 0.35);
      break;
    }
  }
  const dStop = stopAt - v.s;
  // The last centimetres to the end of a path are crept at walking pace (a stop line or a wheel stop).
  vT = Math.min(vT, Math.max(stopAt === path.length ? 0.12 : 0, Math.sqrt(2 * 1.6 * Math.max(0, dStop - 0.02))));
  if (dStop <= (stopAt === path.length ? 0 : 0.02)) vT = 0;
  v.v = v.v < vT ? Math.min(vT, v.v + 1.1 * dt) : Math.max(vT, v.v - 3.5 * dt);
  let s1 = Math.min(stopAt, v.s + v.v * dt);
  if (s1 < v.s) s1 = v.s;
  const next = sampleAt(path, s1);
  if (blocked(sim, id, next.zones, shadow)) {
    v.v = 0;
    return;
  }
  const ds = s1 - v.s;
  v.s = s1;
  v.pose = { x: next.x, y: next.y, heading: next.heading };
  v.steer += (next.steer - v.steer) * Math.min(1, dt * 4);
  v.spin += (ds * next.dir) / (0.355 * CLASSES[v.profile.cls].scale);
  claim(sim, v, next.zones);
  if (v.s >= path.length - 1e-6) {
    v.v = 0;
    // The reverse sweep is done: its reservation lapses (the footprint holds what it still covers).
    if (path.samples[0].dir === -1) releaseReserve(sim, id);
    if (v.next.length) {
      v.path = v.next.shift()!;
      v.s = 0;
      const st = sim.sessions.get(v.sessionId);
      if (st?.lc.state === "exiting") v.hold = v.path.stops.exit ?? null;
    } else v.arrived = true;
  }
}

// ── Barriers and gates ──

function footprintCovers(v: SimVehicle, x: number, y: number, pad = 0): boolean {
  const cx = v.pose.x + Math.cos(v.pose.heading) * (v.fp.wheelbase / 2);
  const cy = v.pose.y + Math.sin(v.pose.heading) * (v.fp.wheelbase / 2);
  const dx = x - cx;
  const dy = y - cy;
  const u = dx * Math.cos(v.pose.heading) + dy * Math.sin(v.pose.heading);
  const w = -dx * Math.sin(v.pose.heading) + dy * Math.cos(v.pose.heading);
  return Math.abs(u) <= v.fp.length / 2 + pad && Math.abs(w) <= v.fp.width / 2 + pad;
}

const overLine = (v: SimVehicle, x: number) => {
  for (const y of [-0.6, 0, 0.6]) for (const dx of [-0.25, 0, 0.25]) if (footprintCovers(v, x + dx, y)) return true;
  return false;
};

function barriers(sim: FacilitySim, dt: number) {
  for (const g of [sim.gates.entry, sim.gates.exit]) {
    const geom = g.id === "entry" ? sim.layout.entry : sim.layout.exit;
    const live = sim.vehicles.filter((v) => v.spawned && !v.gone && Math.abs(v.pose.x - geom.barrierX) < 9 && Math.abs(v.pose.y) < 4);
    const under = live.filter((v) => overLine(v, geom.barrierX));
    const obstructed = under.length > 0 || sim.faults.obstruction === g.id;
    const clear = !live.some((v) => { for (let x = geom.barrierX; x <= geom.beamX + 0.6; x += 0.4) if (overLine(v, x)) return true; return false; });
    // Count each vehicle once as it crosses the barrier line.
    for (const v of under) if (!g.over.has(v.profile.id)) {
      g.over.add(v.profile.id);
      if (isOpen(g.barrier) || g.barrier.angle > 30) g.passes += 1;
    }
    for (const id of [...g.over]) if (!under.some((v) => v.profile.id === id)) g.over.delete(id);
    const egress = g.id === "exit" && (!sim.gatewayUp || sim.env.alarm !== "none");
    const closing = g.barrier.target < g.barrier.angle;
    stepBarrier(g.barrier, dt, { obstructed, clear, egress });
    if (closing && obstructed) event(sim, "interlock", `${g.barrier.id}: obstruction under a closing boom — reversed by the local interlock`, g.barrier.id, "warning");
  }
}

function serveGates(sim: FacilitySim) {
  // Entry: the session at the stop line is the one being served; a barrier left open with nobody passing closes once clear.
  const e = sim.gates.entry;
  if (e.barrier.target === 90 && !e.current && e.barrier.clear && !e.barrier.obstructed && isOpen(e.barrier)) commandBarrier(e.barrier, "close", "entry controller", sim.t);
  const x = sim.gates.exit;
  if (x.barrier.target === 90 && !x.current && x.barrier.clear && !x.barrier.obstructed && isOpen(x.barrier) && !x.barrier.egress) commandBarrier(x.barrier, "close", "exit controller", sim.t);
}

// ── Sensing ──

function sense(sim: FacilitySim, dt: number) {
  const r = sim.rng.sensors;
  const lux = sim.env.daylightLux + 150 * sim.env.lighting;
  const t = sim.t;
  const sampleNow = Math.round(t / dt) % 5 === 0; // 2 Hz sampling of the bay sensors
  for (const b of sim.bays) {
    if (!sampleNow) continue;
    // Truth: which vehicle covers the bay's sensing points (drives the sensor models only).
    const centre = { x: b.bay.x, y: b.bay.y };
    const sign = b.bay.row === "N" ? 1 : -1;
    // The infrared sensor faces the bay from its head wall, 1.6 m in from the end (where every class of vehicle reaches).
    const stop = { x: b.bay.x, y: b.bay.y + sign * (b.bay.depth / 2 - 1.6) };
    let truthId: string | null = null;
    let roof = 0;
    let irHit = false;
    for (const v of sim.vehicles) {
      if (!v.spawned || v.gone) continue;
      if (footprintCovers(v, centre.x, centre.y)) {
        truthId = v.profile.id;
        roof = v.profile.height;
      }
      if (footprintCovers(v, stop.x, stop.y, 0.2)) irHit = true;
    }
    b.truth = truthId;
    const f = (k: "ultrasonic" | "infrared" | "camera"): SensorFault => (sim.faults.sensor && sim.faults.sensor.bayId === b.bay.id && sim.faults.sensor.kind === k ? sim.faults.sensor.mode : "none");
    const us = ultrasonicSample(truthId !== null, roof, 2.9, r, f("ultrasonic"));
    const ir = infraredSample(irHit, sim.env.irradiance, r, f("infrared"));
    const cam = cameraSample(truthId !== null, lux, r, f("camera"));
    b.stuckCount = Math.abs(us.raw - b.lastRaw.ultrasonic) < 1e-9 ? b.stuckCount + 1 : 0;
    b.lastRaw = { ultrasonic: us.raw, infrared: ir.raw, camera: cam.raw };
    for (const [kind, raw, dev] of [["ultrasonic", us, `US-${b.bay.id}`], ["infrared", ir, `IR-${b.bay.id}`], ["camera", cam, `CAM-${b.bay.row}`]] as const) {
      const n = b.nodes[kind];
      n.last = raw;
      const changed = debounce(n, nodeDecision(kind, raw, n.state), t);
      const device = sim.devices.get(dev);
      if (!device) continue;
      const disconnected = f(kind) === "disconnected";
      if (disconnected) {
        if (device.online) {
          device.online = false;
          sim.broker.drop(dev, t);
          event(sim, "device", `${device.label}: connection lost (last will published)`, dev, "warning");
        }
        continue;
      }
      if (!device.online) {
        device.online = true;
        sim.broker.reconnect(dev);
      }
      if (changed && n.state !== null) publish(sim, dev, "occupancy", b.bay.id, kind, n.state, raw.raw, raw.unit);
    }
  }
  // Periodic telemetry and heartbeats.
  for (const d of sim.devices.values()) {
    if (t < d.next || !d.online) continue;
    d.next = t + d.period;
    if (d.kind === "ultrasonic" || d.kind === "infrared") {
      const b = bayById(sim, d.ref!)!;
      const n = b.nodes[d.kind as "ultrasonic" | "infrared"];
      if (n.state !== null) publish(sim, d.id, "occupancy", b.bay.id, d.kind, n.state, n.last?.raw ?? null, n.last?.unit ?? "");
    } else if (d.kind === "camera") {
      for (const b of sim.bays.filter((x) => x.bay.row === d.ref)) if (b.nodes.camera.state !== null) publish(sim, d.id, "occupancy", b.bay.id, "camera", b.nodes.camera.state, b.nodes.camera.last?.raw ?? null, "1");
    } else if (d.kind === "environment") {
      if (sim.faults.envSensorFailure && d.id === "ENV-N") continue;
      publish(sim, d.id, "telemetry", "temperature", "temperature", +sim.env.temperature.toFixed(2), sim.env.temperature, "°C");
      publish(sim, d.id, "telemetry", "co", "co", +sim.env.co.toFixed(1), sim.env.co, "ppm");
      publish(sim, d.id, "telemetry", "smoke", "smoke", +sim.env.smoke.toFixed(2), sim.env.smoke, "%/m");
      publish(sim, d.id, "telemetry", "gas", "gas", +sim.env.gas.toFixed(2), sim.env.gas, "%LEL");
    } else if (d.kind === "meter" && sim.lastEnergy) {
      const e = sim.lastEnergy;
      const value = d.id === "PV-INV" ? e.pvUsed : d.id === "BESS-01" ? e.bessDischarge - e.bessCharge : e.grid;
      publish(sim, d.id, "telemetry", "power", "power", Math.round(value), value, "W");
    } else if (d.kind === "charger") {
      const ch = sim.chargers.get(d.ref!);
      if (ch) publish(sim, d.id, "telemetry", "power", "power", Math.round(ch.sim.state.point.pGrid), ch.sim.state.point.pGrid, "W");
    }
    // Heartbeat (retained status).
    sim.broker.publish(d.id, topic("status", sim.inputs.siteId, d.id), { online: true, at: t }, t, true);
  }
}

function publish(sim: FacilitySim, deviceId: string, kind: "telemetry" | "occupancy", ref: string, sensor: string, value: number | boolean | string | null, raw: number | null, unit: string) {
  const d = sim.devices.get(deviceId)!;
  d.seq += 1;
  const msg = { schema: SCHEMA, eventId: `${deviceId}-${d.seq}`, siteId: sim.inputs.siteId, deviceId, sensorId: sensor, ts: sim.inputs.epochMs + Math.round(sim.t * 1000), seq: d.seq, measurement: { raw: raw !== null && Number.isFinite(raw) ? +raw.toFixed(4) : null, value }, unit, quality: "good" as const, mode: "SIMULATED" as const };
  sim.broker.publish(deviceId, kind === "occupancy" ? topic("occupancy", sim.inputs.siteId, ref) : topic("telemetry", sim.inputs.siteId, deviceId), msg, sim.t);
}

/** Exposed for tests: re-deliver a message as a duplicate (the broker's QoS 1 duplicate path). */
export function injectDuplicate(sim: FacilitySim, deviceId: string) {
  const d = sim.devices.get(deviceId);
  if (!d) return;
  const b = bayById(sim, d.ref ?? "");
  if (!b) return;
  d.seq += 1;
  const msg = { schema: SCHEMA, eventId: `${deviceId}-${d.seq}`, siteId: sim.inputs.siteId, deviceId, sensorId: d.kind, ts: sim.inputs.epochMs + Math.round(sim.t * 1000), seq: d.seq, measurement: { raw: null, value: true }, unit: "", quality: "good" as const, mode: "SIMULATED" as const };
  const t = topic("occupancy", sim.inputs.siteId, b.bay.id);
  sim.broker.publish(deviceId, t, msg, sim.t);
  sim.broker.publish(deviceId, t, msg, sim.t);
}

function gateway(sim: FacilitySim) {
  const delivered = sim.broker.deliver(sim.t);
  if (!sim.gatewayUp) return;
  const nowMs = sim.inputs.epochMs + sim.t * 1000;
  for (const env of delivered) {
    if (env.topic.endsWith("/status")) {
      const dev = sim.devices.get(env.client);
      if (dev && (env.payload as { online?: boolean }).online) dev.lastSeen = sim.t;
      continue;
    }
    const res = ingest(sim.ingest, env, nowMs, sim.inputs.fusion.freshness * 1000);
    sim.recent.push({ n: (sim.recent.at(-1)?.n ?? 0) + 1, at: sim.t, device: env.client, topic: env.topic, verdict: res.verdict, mode: res.mode });
    if (sim.recording && sim.recording.messages.length < 20000) sim.recording.messages.push({ topic: env.topic, payload: env.payload, at: sim.t });
    if (sim.recent.length > 80) sim.recent.splice(0, sim.recent.length - 80);
    const m = res.message;
    const dev = m ? sim.devices.get(m.deviceId) : sim.devices.get(env.client);
    if (dev) dev.lastSeen = sim.t;
    if (sim.faults.cloudDown) sim.cloudBuffer += 1;
    else sim.cloudBuffer = Math.max(0, sim.cloudBuffer - 50);
    if (!m || res.verdict === "duplicate" || res.verdict === "out-of-order" || res.verdict === "invalid" || res.verdict === "bad-tag" || res.verdict === "rate-limited") continue;
    const parsed = env.topic.split("/");
    if (parsed[4] === "bays" && typeof m.measurement.value === "boolean") {
      const b = bayById(sim, parsed[5]);
      const kind = m.sensorId as SensorKind;
      if (b) b.votes.set(kind, { kind, state: m.measurement.value, at: sim.t - (nowMs - m.ts) / 1000, mode: res.mode });
    }
  }
  // Fusion twice a second.
  if (sim.steps % 5 !== 0) return;
  for (const b of sim.bays) {
    const prev = b.fused;
    b.fusion = fuse([...b.votes.values()], sim.t, prev, sim.inputs.fusion);
    const d = b.fusion.decision;
    if (d === "uncertain") {
      if (b.uncertainSince === null) b.uncertainSince = sim.t;
    } else {
      b.uncertainSince = null;
      b.fused = d === "occupied";
    }
    if (b.fused === false) {
      if (b.vacantSince === null) b.vacantSince = sim.t;
    } else b.vacantSince = null;
    updateBayStatus(sim, b);
  }
}

function updateBayStatus(sim: FacilitySim, b: BayRuntime) {
  const prev = b.status;
  const s = b.session ? sim.sessions.get(b.session) : null;
  const ch = sim.chargers.get(b.bay.id);
  let status: BayStatus;
  const unknown = b.uncertainSince !== null && sim.t - b.uncertainSince >= sim.inputs.fusion.uncertainAfter;
  if (b.maintenance) status = "maintenance";
  else if (unknown) status = "unknown";
  else if (ch && ch.session && s && (s.lc.state === "charging" || s.lc.state === "charging-fault") && !stoppedSafely(ch)) status = "charging";
  else if (ch && ch.session && s && (s.lc.state === "charged" || ch.sim.state.phase === "completed")) status = "charging-complete";
  else if (b.fused === true && (s || !b.session)) status = s && (s.lc.state === "navigating" || s.lc.state === "parking") ? "reserved" : "occupied";
  else if (s) status = "reserved";
  else if (b.blocked) status = "blocked";
  else status = "available";
  // A bay sensed occupied with no session is never offered (ghost occupancy).
  if (status === "available" && b.fused === true) status = "occupied";
  if (status !== prev) {
    b.status = status;
    b.version += 1;
    b.history.push({ t: sim.t, status });
    if (b.history.length > 60) b.history.splice(0, b.history.length - 60);
  }
}

// ── Sessions ──

function conditions(sim: FacilitySim) {
  return { lux: sim.env.daylightLux + 120 * sim.env.lighting + 20, rain: sim.inputs.env.rain, cameraFault: sim.faults.cameraFault };
}

const atStop = (sim: FacilitySim, v: SimVehicle) => v.path !== null && v.hold !== null && v.s >= v.hold - 0.05 && v.v < 0.05;

function facilityBlock(sim: FacilitySim): string | null {
  if (sim.env.alarm !== "none") return `Entry suspended: ${sim.env.alarm} alarm`;
  if (!sim.gatewayUp) return "Entry suspended: edge gateway unavailable";
  return null;
}

function advanceSession(sim: FacilitySim, s: Session) {
  const v = vehicleById(sim, s.vehicleId);
  if (!v) return;
  const t = sim.t;
  const lx = sim.layout;
  const e = sim.gates.entry;
  switch (s.lc.state) {
    case "approaching":
      break;
    case "detected":
      if (!sim.gatewayUp) {
        transition(sim, s, "gateway-unavailable", "Edge gateway not responding: identification unavailable");
        break;
      }
      s.recognition = recognise(v.profile, sim.inputs.region, conditions(sim), sim.rng.recognition, { ...sim.inputs.recognition, deployment: sim.inputs.aiDeployment === "cloud" ? "cloud" : "edge" });
      s.until = t + s.recognition.latency;
      transition(sim, s, s.recognition.outcome === "camera-fault" ? "camera-fault" : "identifying", s.recognition.outcome === "camera-fault" ? "Recognition camera not responding" : "Camera triggered by the presence detector");
      break;
    case "identifying": {
      if (t < s.until) break;
      const rec = s.recognition!;
      const plateOk = rec.outcome === "recognised" && rec.read !== null;
      if (plateOk) {
        s.credential = "plate";
        s.access = decideAccess(v.profile, rec, { rfid: false, qr: false, visitorTicket: false, operatorApproved: false }, sim.access);
        transition(sim, s, "identified", `Plate ${rec.read} read with confidence ${rec.confidence.toFixed(2)}`);
      } else transition(sim, s, rec.outcome === "low-confidence" ? "id-uncertain" : "unknown-vehicle", rec.outcome === "low-confidence" ? `Low confidence ${rec.confidence.toFixed(2)}: not authorised automatically` : "Plate not recognised");
      s.until = t;
      break;
    }
    case "id-uncertain":
    case "camera-fault":
    case "unknown-vehicle": {
      // Fallback credentials at the reader: the driver taps a card or shows a QR code once stopped.
      if (!atStop(sim, v)) break;
      s.stopAt ??= t;
      const waited = t - s.stopAt;
      const rec = s.recognition ?? recognise(v.profile, sim.inputs.region, { ...conditions(sim), cameraFault: true }, sim.rng.recognition);
      if (v.profile.rfid && sim.access.tags.has(v.profile.rfid) && waited > 2) {
        s.credential = "rfid";
        s.access = decideAccess(v.profile, rec, { rfid: true, qr: false, visitorTicket: false, operatorApproved: false }, sim.access);
        if (s.lc.state === "unknown-vehicle") transition(sim, s, "identified", "RFID tag verified");
        else transition(sim, s, "identified", "RFID tag verified at the reader");
      } else if (v.profile.qr && sim.access.tokens.has(v.profile.qr) && waited > 4) {
        s.credential = "qr";
        s.access = decideAccess(v.profile, rec, { rfid: false, qr: true, visitorTicket: false, operatorApproved: false }, sim.access);
        transition(sim, s, "identified", "QR code verified at the reader");
      } else if (sim.inputs.visitorEntry && !v.profile.rfid && !v.profile.qr && waited > 5) {
        s.credential = "visitor-ticket";
        s.access = decideAccess(v.profile, rec, { rfid: false, qr: false, visitorTicket: true, operatorApproved: false }, sim.access);
        transition(sim, s, "identified", "Visitor ticket issued at the reader");
      } else if (waited > 8) {
        s.needsOperator = "verification";
        transition(sim, s, "manual-verification", "No credential: operator verification requested");
        s.until = t;
      }
      break;
    }
    case "manual-verification":
      if (t - s.until > 90) reject(sim, s, v, "No operator decision within 90 s");
      break;
    case "gateway-unavailable":
      if (sim.gatewayUp) {
        transition(sim, s, "identifying", "Gateway restored");
        s.recognition = recognise(v.profile, sim.inputs.region, conditions(sim), sim.rng.recognition);
        s.until = t + s.recognition.latency;
      } else if (t - s.detectedAt > s.patience && atStop(sim, v)) abandon(sim, s, v);
      break;
    case "identified":
      transition(sim, s, "authorizing", "Checking the local access list");
      s.until = t + 0.06;
      break;
    case "authorizing": {
      if (t < s.until) break;
      let a = s.access;
      if (a && !a.authorised && a.credential === "plate" && sim.inputs.visitorEntry && !v.profile.denied) a = s.access = { ...a, authorised: true, role: "visitor", reason: "Plate read; not on the access list: admitted as a visitor" };
      if (!a || !a.authorised) {
        transition(sim, s, "unauthorized", a?.reason ?? "Not authorised");
        break;
      }
      const res = sim.reservations.forVehicle(v.profile.id, t, v.profile.qr);
      if (res) {
        s.reservationId = res.id;
        sim.reservations.arrive(res.id);
      }
      transition(sim, s, "authorized", a.reason);
      break;
    }
    case "unauthorized":
      reject(sim, s, v, "Unauthorised vehicle");
      break;
    case "authorized":
      transition(sim, s, "allocating", "Requesting a bay");
      s.until = t + 0.05;
      break;
    case "queued":
    case "environmental-alarm": {
      const block = facilityBlock(sim);
      if (s.lc.state === "queued" && block && sim.env.alarm !== "none") {
        transition(sim, s, "environmental-alarm", block);
        break;
      }
      if (!block && sim.steps % 10 === 0 && wouldAllocate(sim, s, v)) transition(sim, s, "allocating", "A bay is free: allocating");
      if (s.queueSince !== null && t - s.queueSince > s.patience && atStop(sim, v)) abandon(sim, s, v);
      break;
    }
    case "allocating": {
      if (t < s.until) break;
      const block = facilityBlock(sim);
      if (block && sim.env.alarm !== "none") {
        s.queueSince ??= t;
        transition(sim, s, "environmental-alarm", block);
        break;
      }
      const res = s.reservationId ? sim.reservations.items.find((r) => r.id === s.reservationId) ?? null : null;
      const views = bayViews(sim);
      const result = allocate(views, { vehicle: v.profile, reservation: res ? { id: res.id, bayId: res.bayId, type: res.type } : null, facilityBlocked: block, overflowToWireless: sim.inputs.overflowToWireless, upcoming: sim.reservations.upcoming(t, 1800) }, sim.inputs.policy, sim.inputs.weights);
      s.allocation = result;
      if (!result.bayId) {
        s.queueSince ??= t;
        if (transition(sim, s, "no-bay", result.reason)) transition(sim, s, "queued", "Waiting for a bay");
        break;
      }
      if (res?.bayId && result.bayId !== res.bayId) {
        transition(sim, s, "reservation-conflict", `Reserved bay ${res.bayId} unavailable`);
        transition(sim, s, "allocating", "Reallocated within the reservation");
      }
      const b = bayById(sim, result.bayId)!;
      const version = b.version;
      const ok = commitReservation(b, version, s.id);
      if (!ok) {
        sim.stats.doubleAllocation += 1;
        break;
      }
      b.history.push({ t, status: "reserved" });
      s.bayId = b.bay.id;
      if (result.chargingUnavailable) event(sim, "allocation", `${v.profile.id}: no compatible wireless bay free — conventional bay ${b.bay.id} offered`, s.id, "warning");
      if (s.queueSince !== null) {
        sim.stats.waitSum += t - s.queueSince;
        sim.stats.waitCount += 1;
        s.queueSince = null;
      }
      transition(sim, s, "reserved", `${result.reason}: bay ${b.bay.id}`);
      planEntry(sim, v, b.bay);
      break;
    }
    case "no-bay":
      transition(sim, s, "queued", "Waiting for a bay");
      break;
    case "reservation-conflict":
    case "no-charging-bay":
      transition(sim, s, "allocating", "Retrying");
      break;
    case "reserved":
      if (facilityBlock(sim)) break;
      // Local safety checks: nothing else is under the barrier or in the gate zone.
      if (!e.barrier.obstructed && (e.current === null || e.current === s.id)) {
        e.current = s.id;
        transition(sim, s, "entry-permitted", "Safety checks passed; guidance display shows the bay");
        s.until = t + 0.3;
      }
      break;
    case "entry-permitted":
      if (t < s.until) break;
      if (commandBarrier(e.barrier, "open", "entry controller", t)) {
        e.authorised += 1;
        transition(sim, s, "barrier-opening", "Barrier commanded open");
      }
      break;
    case "barrier-opening":
      if (isOpen(e.barrier)) {
        // Driver reaction before moving off.
        if (s.until < t - 5) s.until = t + 1.0;
        if (t >= s.until) {
          v.hold = null;
          transition(sim, s, "entering", "Barrier open");
        }
      }
      break;
    case "entering": {
      const rear = v.pose.x - (v.fp.length - v.fp.wheelbase) / 2;
      if (rear > lx.entry.beamX + 0.4) {
        s.entryAt = t;
        sim.stats.entered += 1;
        if (e.current === s.id) e.current = null;
        const accepted = commandBarrier(e.barrier, "close", "entry controller", t);
        transition(sim, s, accepted ? "barrier-closing" : "barrier-closing", accepted ? "Clear zone verified; closing" : "Close refused by the interlock (something under the boom)");
        // More vehicles crossed than were authorised: tailgating.
        if (e.passes > e.authorised) {
          sim.stats.tailgating += 1;
          event(sim, "tailgating", `Tailgating: ${e.passes} vehicles passed on ${e.authorised} authorisation${e.authorised > 1 ? "s" : ""}`, s.id, "alarm");
          e.passes = e.authorised;
        }
      }
      break;
    }
    case "barrier-closing":
      if (isClosed(e.barrier) || v.pose.x > lx.aisle.xWest + 4) {
        transition(sim, s, "navigating", "Following the guidance to the bay");
        s.until = t;
      } else if (e.barrier.obstructed) transition(sim, s, "barrier-obstructed", "Barrier cannot close: obstruction");
      break;
    case "barrier-obstructed":
      if (!e.barrier.obstructed) {
        commandBarrier(e.barrier, "close", "entry controller", t);
        transition(sim, s, "navigating", "Obstruction cleared; barrier closing");
      }
      break;
    case "tailgating":
      if (v.arrived) {
        s.needsOperator = "tailgating";
        transition(sim, s, "operator-intervention", "Tailgating vehicle stopped in a bay: operator review");
      }
      break;
    case "navigating": {
      const goal = bayById(sim, v.goal ?? "");
      if (goal && Math.abs(v.pose.heading) > 0.15) transition(sim, s, "parking", `Turning into bay ${goal.bay.id}`);
      break;
    }
    case "parking":
      if (v.arrived) {
        s.until = t;
        sim.stats.searchSum += t - (s.entryAt ?? t);
        sim.stats.searchCount += 1;
        if (v.goal !== s.bayId) {
          s.wrongBay = v.goal;
          transition(sim, s, "wrong-bay", `Stopped in bay ${v.goal}, allocated ${s.bayId}`);
        } else transition(sim, s, "confirming", "Stopped; waiting for the bay sensors");
      }
      break;
    case "wrong-bay": {
      const actual = bayById(sim, s.wrongBay ?? "");
      const allocated = bayById(sim, s.bayId ?? "");
      if (actual && allocated && (actual.session === null || actual.session === `pending-${s.id}`) && actual.bay.type !== "wireless" && (actual.bay.type !== "accessible" || v.profile.accessiblePermit)) {
        // Reassign: release the allocated bay, reserve the one it stopped in.
        allocated.session = null;
        allocated.version += 1;
        actual.session = s.id;
        actual.version += 1;
        audit(sim, "allocation engine", "automation", "bay.reassign", s.id, "accepted", `Reassigned from ${allocated.bay.id} to ${actual.bay.id}`);
        s.bayId = actual.bay.id;
        s.wrongBay = null;
        transition(sim, s, "confirming", "Reassigned to the bay it stopped in");
      } else {
        s.needsOperator = "wrong-bay";
        transition(sim, s, "operator-intervention", "Stopped in a bay it may not use: operator review");
      }
      break;
    }
    case "confirming": {
      const b = bayById(sim, s.bayId ?? "")!;
      if (b.fused === true && b.uncertainSince === null && b.fusion.decision === "occupied") {
        s.parkedAt = t;
        transition(sim, s, "parked", `Bay ${b.bay.id}: occupancy confirmed (p = ${b.fusion.p.toFixed(3)})`);
        if (s.reservationId) sim.reservations.complete(s.reservationId);
      } else if (b.uncertainSince !== null && t - b.uncertainSince > sim.inputs.fusion.uncertainAfter) {
        transition(sim, s, "occupancy-disagreement", `Bay ${b.bay.id}: sensors disagree (p = ${b.fusion.p.toFixed(2)})`);
        event(sim, "occupancy", `Bay ${b.bay.id}: occupancy uncertain — not assigned automatically`, b.bay.id, "warning");
      } else if (!sim.gatewayUp && t - s.until > 30) {
        s.parkedAt ??= t;
      }
      break;
    }
    case "occupancy-disagreement": {
      const b = bayById(sim, s.bayId ?? "")!;
      if (b.fused === true && b.uncertainSince === null) {
        s.parkedAt ??= t;
        transition(sim, s, "parked", "Sensors agree again");
      }
      if (t >= s.departAt) {
        s.needsOperator = "occupancy";
        transition(sim, s, "operator-intervention", "Departure with unconfirmed occupancy: operator");
      }
      break;
    }
    case "parked":
      if (!s.eligibilityDone) {
        s.eligibilityDone = true;
        transition(sim, s, "eligibility", "Evaluating charging eligibility");
        s.until = t + 1.0;
      } else if (t >= s.departAt) requestLeave(sim, s);
      break;
    case "eligibility": {
      if (t < s.until) break;
      const b = bayById(sim, s.bayId ?? "")!;
      const ch = sim.chargers.get(b.bay.id);
      s.eligibility = evaluateEligibility(v.profile, {
        occupancyConfirmed: b.fused === true && b.fusion.decision === "occupied",
        bayIsWireless: b.bay.type === "wireless",
        transmitterAvailable: !!ch && ch.inService && !ch.session && ch.sim.state.phase === "available",
        chargingAuthorised: s.access?.authorised === true,
        alignment: alignmentToPad(b.bay, v),
        tolerance: sim.inputs.chargingTolerance,
        facilitySafe: sim.env.alarm === "none",
        safetyDetail: sim.env.alarm === "none" ? "No environmental alarm; shelter safety controller normal" : `Active ${sim.env.alarm} alarm`,
      });
      if (s.eligibility.eligible && ch) {
        s.chargingId = ID.charging(sim.nextId.charging++);
        attach(ch, v.profile, s.id, s.chargingId, alignmentToPad(b.bay, v), t);
        transition(sim, s, "charging", `Charging session ${s.chargingId} handed to the Station state machine`);
        event(sim, "charging", `${v.profile.id}: charging session ${s.chargingId} on bay ${b.bay.id}`, s.id);
      } else transition(sim, s, "parked", v.profile.powertrain === "electric" ? `Not charging: ${s.eligibility.checks.find((c) => !c.passed)?.detail ?? ""}` : "Conventional vehicle: parked without charging");
      break;
    }
    case "charging":
    case "charging-fault": {
      const ch = sim.chargers.get(s.bayId ?? "");
      if (!ch) break;
      if (isFault(ch) && s.lc.state === "charging") transition(sim, s, "charging-fault", `Station: ${PHASES[ch.sim.state.phase].label}`);
      else if (!isFault(ch) && s.lc.state === "charging-fault" && ch.sim.state.phase !== "completed") transition(sim, s, "charging", "Station recovered");
      if (ch.sim.state.phase === "completed") transition(sim, s, s.lc.state === "charging-fault" ? "charged" : "charged", "Station completed the session");
      if (t >= s.departAt) requestLeave(sim, s);
      break;
    }
    case "charged":
      if (t >= s.departAt) requestLeave(sim, s);
      break;
    case "departure-requested": {
      const ch = sim.chargers.get(s.bayId ?? "");
      if (ch && ch.session && ch.session.parkingSessionId === s.id && !stoppedSafely(ch)) {
        requestStop(ch);
        transition(sim, s, "charging-stopping", "Asking the Station to ramp down and de-energise");
      } else transition(sim, s, "billing", "Finalising the bill");
      break;
    }
    case "charging-stopping": {
      const ch = sim.chargers.get(s.bayId ?? "")!;
      if (stoppedSafely(ch)) transition(sim, s, "billing", "Pad de-energised; finalising the bill");
      break;
    }
    case "billing":
      if (!s.parkingBill) settle(sim, s, v);
      if (t >= s.until) {
        if (s.payment?.status === "captured") transition(sim, s, "exit-authorized", "Payment captured");
        else transition(sim, s, "payment-pending", "Payment service unavailable: payment pending");
      }
      break;
    case "payment-pending":
      if (!sim.faults.paymentDown && !sim.faults.cloudDown && s.payment) {
        s.payment.status = "captured";
        transition(sim, s, "exit-authorized", "Payment captured on retry");
      } else if (sim.inputs.allowExitOnPaymentPending && t - s.until > 3) transition(sim, s, "exit-authorized", "Exit allowed on a deferred-payment record");
      break;
    case "exit-authorized":
      startExit(sim, s, v);
      transition(sim, s, "exiting", "Leaving the bay");
      break;
    case "exiting":
      exitFlow(sim, s, v);
      break;
    case "operator-intervention":
      break;
    default:
      break;
  }
  // Presence at the entry stop line opens a session once per detection event.
  void e;
}

/** Receiver offset from the pad centre in the bay frame (lateral: across the bay, longitudinal: into it). */
function alignmentToPad(bay: Bay, v: SimVehicle): { lateral: number; longitudinal: number } {
  if (!bay.pad) return { lateral: 0, longitudinal: 0 };
  const sign = bay.row === "N" ? 1 : -1;
  const off = receiverOffset(v.profile) + v.fp.wheelbase / 2;
  const rx = { x: v.pose.x + Math.cos(v.pose.heading) * off, y: v.pose.y + Math.sin(v.pose.heading) * off };
  return { lateral: Math.round((rx.x - bay.pad.x) * sign * 1000) / 1000, longitudinal: Math.round((rx.y - bay.pad.y) * sign * 1000) / 1000 };
}

function planEntry(sim: FacilitySim, v: SimVehicle, bay: Bay) {
  const p = v.profile;
  let target = bay;
  // A driver who ignores guidance takes the first free conventional bay they see instead.
  if (p.ignoresGuidance) {
    const other = sim.bays.find((b) => b.bay.id !== bay.id && b.session === null && b.status === "available" && b.bay.type === "conventional");
    if (other) {
      target = other.bay;
      other.session = `pending-${sim.sessions.get(v.sessionId)!.id}`;
      other.version += 1;
    }
  }
  const al = { lateral: Math.max(-0.12, Math.min(0.12, sim.rng.motion.normal() * sim.inputs.alignmentSigma.lateral)), longitudinal: Math.max(-0.12, Math.min(0.12, sim.rng.motion.normal() * sim.inputs.alignmentSigma.longitudinal)) };
  v.alignment = al;
  const rearY = parkedRear(target, v.fp, receiverOffset(p), al.longitudinal);
  const s = v.s;
  const path = entryPath(sim.layout, target, v.fp, { rearY, lateral: al.lateral * (target.row === "N" ? 1 : -1) });
  // Same geometry up to the gate: keep the vehicle where it is on the new path.
  v.path = path;
  v.s = Math.min(s, path.length);
  v.hold = path.stops.entry;
  v.goal = target.id;
}

function startExit(sim: FacilitySim, s: Session, v: SimVehicle) {
  const b = bayById(sim, v.goal ?? s.bayId ?? "")!;
  const [back, fwd] = exitPaths(sim.layout, b.bay, v.fp, v.pose);
  v.path = back;
  v.next = [fwd];
  v.s = 0;
  v.hold = null;
  v.arrived = false;
  s.until = sim.t;
}

function exitFlow(sim: FacilitySim, s: Session, v: SimVehicle) {
  const x = sim.gates.exit;
  const t = sim.t;
  // Bay release after verified departure: the vehicle has left and the fused sensors read vacant.
  const b = bayById(sim, s.bayId ?? "");
  if (b && b.session === s.id && v.s > 0 && b.fused === false && b.vacantSince !== null && t - b.vacantSince >= 1) {
    b.session = null;
    b.version += 1;
    updateBayStatus(sim, b);
    event(sim, "release", `Bay ${b.bay.id} released after verified departure`, b.bay.id);
  }
  // The wrong-bay placeholder (driver's own choice) is cleared the same way.
  const atExitStop = v.path && v.hold !== null && v.s >= v.hold - 0.05 && v.v < 0.05;
  if (atExitStop) {
    if (x.current === null || x.current === s.id) {
      x.current = s.id;
      s.exitStopAt ??= t;
      // Exit recognition confirms the session (or local safe egress opens the gate).
      if (t - s.exitStopAt > 0.6 || x.barrier.egress) {
        if (!isOpen(x.barrier)) commandBarrier(x.barrier, "open", sim.gatewayUp ? "exit controller" : "local safe egress", t);
        else v.hold = null;
      }
    }
  } else if (v.hold === null && x.current === s.id && v.pose.x > sim.layout.exit.beamX + 0.4 + (v.fp.length - v.fp.wheelbase) / 2) {
    x.current = null;
    commandBarrier(x.barrier, "close", "exit controller", t);
  }
  if (v.arrived && !v.gone) {
    v.gone = true;
    claim(sim, v, []);
    releaseReserve(sim, v.profile.id);
    s.exitAt = t;
    sim.stats.exited += 1;
    if (s.entryAt !== null) sim.stats.stays.push(t - s.entryAt);
    if (sim.stats.stays.length > 400) sim.stats.stays.splice(0, 200);
    if (b && b.session === s.id) {
      b.session = null;
      b.version += 1;
    }
    transition(sim, s, "released", "Vehicle left the facility");
  }
}

function requestLeave(sim: FacilitySim, s: Session) {
  if (s.departureAt === null) s.departureAt = sim.t;
  transition(sim, s, "departure-requested", "Planned departure time");
}

function settle(sim: FacilitySim, s: Session, v: SimVehicle) {
  const tariff = TARIFFS[sim.inputs.region];
  const duration = sim.t - (s.entryAt ?? s.parkedAt ?? sim.t);
  s.parkingBill = parkingBill(tariff, duration, { reservation: !!s.reservationId, member: v.profile.member, accessible: v.profile.accessiblePermit });
  const ch = sim.chargers.get(s.bayId ?? "");
  if (ch && ch.session && ch.session.parkingSessionId === s.id) {
    const cs = detach(ch, sim.t)!;
    // The parking record takes the station's final SOC once, here.
    s.socOut = cs.socEnd;
    v.profile = { ...v.profile, soc: cs.socEnd ?? v.profile.soc };
    s.chargingBill = chargingBill(tariff, cs.gridJ, cs.vehicleJ);
  }
  sim.ledger.parking += s.parkingBill.total;
  if (s.chargingBill) sim.ledger.charging += s.chargingBill.total;
  const amount = s.parkingBill.total + (s.chargingBill?.total ?? 0);
  const down = sim.faults.paymentDown || sim.faults.cloudDown;
  s.payment = { id: `PAY-${String(sim.nextId.payment++).padStart(5, "0")}`, provider: PAYMENT_PROVIDERS[sim.inputs.region], amount, currency: tariff.currency, status: down ? "pending" : "captured", at: sim.t, simulated: true };
  sim.ledger.payments.push(s.payment);
  if (sim.ledger.payments.length > 300) sim.ledger.payments.splice(0, 150);
  s.billedAt = sim.t;
  s.until = sim.t + 1.5;
  event(sim, "billing", `${v.profile.id}: parking ${money(sim.inputs.region, s.parkingBill.total)}${s.chargingBill ? `, charging ${money(sim.inputs.region, s.chargingBill.total)}` : ""}`, s.id);
}

function reject(sim: FacilitySim, s: Session, v: SimVehicle, reason: string) {
  transition(sim, s, "rejected", reason);
  sim.stats.rejected += 1;
  turnAway(sim, v);
  event(sim, "rejected", `${v.profile.id}: ${reason}`, s.id, "warning");
}

function abandon(sim: FacilitySim, s: Session, v: SimVehicle) {
  if (s.bayId) {
    const b = bayById(sim, s.bayId);
    if (b && b.session === s.id) {
      b.session = null;
      b.version += 1;
    }
  }
  transition(sim, s, "abandoned", "Waited longer than the driver's patience");
  sim.stats.abandoned += 1;
  turnAway(sim, v);
}

function turnAway(sim: FacilitySim, v: SimVehicle) {
  const e = sim.gates.entry;
  if (e.current === v.sessionId) e.current = null;
  const [back, turn] = rejectPaths(sim.layout, v.fp, v.pose);
  v.path = back;
  v.next = [turn];
  v.s = 0;
  v.hold = null;
  v.arrived = false;
  const s = sim.sessions.get(v.sessionId);
  if (s) s.until = sim.t;
}

/** Whether an allocation would find a bay now (queued vehicles retry only then). */
function wouldAllocate(sim: FacilitySim, s: Session, v: SimVehicle): boolean {
  const res = s.reservationId ? sim.reservations.items.find((r) => r.id === s.reservationId) ?? null : null;
  const r = allocate(bayViews(sim), { vehicle: v.profile, reservation: res ? { id: res.id, bayId: res.bayId, type: res.type } : null, facilityBlocked: facilityBlock(sim), overflowToWireless: sim.inputs.overflowToWireless, upcoming: sim.reservations.upcoming(sim.t, 1800) }, sim.inputs.policy, sim.inputs.weights);
  return r.bayId !== null;
}

/** The allocation engine's view of the bays now. */
export function bayViews(sim: FacilitySim): BayView[] {
  const held = sim.reservations.held(sim.t);
  const price = energyPrice(sim);
  const moving = sim.vehicles.filter((v) => v.spawned && !v.gone && v.v > 0.1);
  return sim.bays.map((b) => {
    const ch = sim.chargers.get(b.bay.id);
    const near = moving.filter((v) => Math.abs(v.pose.x - b.bay.x) < 6 && Math.abs(v.pose.y) < 4).length;
    const status: BayStatus = b.session ? (b.status === "available" ? "reserved" : b.status) : b.status;
    return {
      bay: b.bay,
      status,
      version: b.version,
      heldFor: held.get(b.bay.id) ?? null,
      chargerOk: !!ch && ch.inService && !isFault(ch),
      chargerPower: ch ? Math.min(sim.inputs.energy.chargerPower, ch.allowance) : 0,
      congestion: near,
      energyPrice: price,
    };
  });
}

function energyPrice(sim: FacilitySim): number {
  const h = (((sim.inputs.startHour + sim.t / 3600) % 24) + 24) % 24;
  const p = sim.inputs.energy.price;
  return h >= 18 && h < 22 ? p.peak : h >= 22 || h < 6 ? p.offPeak : p.standard;
}

// ── Charging, environment and energy ──

function chargers(sim: FacilitySim, dt: number, hour: number) {
  const f = sim.faults;
  // Essential and comfort loads requested this step.
  const moving = [sim.gates.entry.barrier, sim.gates.exit.barrier].filter((b) => Math.abs(b.target - b.angle) > 0.01).length;
  const loads = envLoads(sim.env);
  const essential = 60 + 25 + sim.layout.bays.length * 2 * 0.8 + 4 * 6 + moving * 150 + (sim.layout.bays.length + 1) * 5 + loads.alarm;
  const comfort = loads.lighting + loads.fans;
  const pv = pvPower(sim.inputs.energy, sim.env.irradiance, sim.env.ambient);
  sim.pvCell = pv.cellTemperature;
  const gridUp = !f.gridOutage;
  const budget = chargingBudget(sim.inputs.energy, sim.storage, { essential, comfort }, pv.power, gridUp, dt);
  // Allocate the budget between active chargers before they step.
  // Chargers from their safety checks to ramp-down (and while grid-limited) get a share before they energise: no charger draws what the site cannot supply.
  const rated = sim.inputs.energy.chargerPower * 1.12;
  const active = [...sim.chargers.values()].filter((c) => {
    const ph = PHASES[c.sim.state.phase];
    return c.session && ((ph.step >= 9 && ph.step <= 16) || c.sim.state.phase === "grid-limited");
  });
  const demands = active.map((c) => ({ key: c.bayId, rated, departAt: sim.sessions.get(c.session!.parkingSessionId)?.departAt ?? 0 }));
  const shares = shareCharging(budget, demands, sim.inputs.energy.chargingPolicy);
  const alarm = sim.env.alarm !== "none";
  let drawn = 0;
  let losses = 0;
  for (const ch of sim.chargers.values()) {
    setAllowance(ch, shares.has(ch.bayId) ? (shares.get(ch.bayId) ?? 0) : rated);
    const extra: Record<string, boolean> = alarm ? { emergencyStop: true } : {};
    if (f.charger && f.charger.bayId === ch.bayId) extra[f.charger.fault] = true;
    const wasLatched = ch.sim.state.latched;
    // An idle station (no vehicle, available) has nothing to integrate: it is not stepped. Otherwise it runs at its own fixed step.
    const idle = !ch.session && ch.sim.state.phase === "available" && !ch.sim.commands.length;
    ch.acc = idle ? 0 : ch.acc + dt;
    while (ch.acc >= sim.stationStep - 1e-9) {
      stepCharger(ch, sim.stationStep, sim.stationStep, extra);
      ch.acc -= sim.stationStep;
    }
    if (!alarm && wasLatched && sim.env.acknowledged && ch.sim.state.phase === "emergency-stop") ch.sim.commands.push("reset");
    const view = chargerView(ch);
    drawn += view.pGrid;
    losses += view.lossW;
  }
  sim.lastEnergy = dispatch(sim.inputs.energy, sim.storage, { essential, comfort }, drawn, pv.power, gridUp, energyPrice(sim), dt, sim.energy);
  // The shelter environment: heat from equipment, charger losses and lighting; CO from combustion vehicles moving inside.
  const combustion = sim.vehicles.filter((v) => v.spawned && !v.gone && v.v > 0.1 && v.profile.powertrain === "conventional" && Math.abs(v.pose.x) < sim.layout.aisle.xEast).length;
  const activity = sim.vehicles.some((v) => v.spawned && !v.gone && v.v > 0.1 && Math.abs(v.pose.x) < sim.layout.aisle.xEast + 2);
  stepEnv(sim.env, sim.inputs.env, { equipment: essential * 0.9 + losses * 0.6 + loads.lighting * 0.9 + 150 * sim.bays.filter((b) => b.fused).length * 0.1, movingCombustion: combustion, smokeSource: f.smoke, gasSource: f.gas, fanFailure: f.fanFailure, activity, sensorFailure: f.envSensorFailure }, hour, dt, sim.rng.misc);
  if (sim.env.alarm !== "none" && sim.env.alarmSince === sim.env.t) event(sim, "alarm", `${sim.env.alarm === "smoke" ? "Smoke" : "Gas"} alarm (simulated): fans to full, entry suspended, charging stopped, exits open`, "shelter", "alarm");
}

// ── Anomalies and history ──

function anomalies(sim: FacilitySim) {
  const t = sim.t;
  const add = (kind: AnomalyKind, ref: string, text: string, score: number, method: Anomaly["method"] = "rule") => {
    const id = `${kind}|${ref}`;
    const existing = sim.anomalies.find((a) => a.id === id);
    if (existing) {
      existing.t = t;
      existing.score = score;
      existing.text = text;
    } else sim.anomalies.push({ id, kind, ref, t, text, score, method });
  };
  // Keep only anomalies seen in the last 20 s (resolved ones drop out).
  sim.anomalies = sim.anomalies.filter((a) => t - a.t < 20);
  for (const b of sim.bays) {
    if (b.fusion.disagreement) add("sensor-disagreement", b.bay.id, `Bay ${b.bay.id}: ${b.fusion.used.join(", ")} disagree`, 1);
    if (b.fused === true && !b.session && t > 20) add("unexpected-occupancy", b.bay.id, `Bay ${b.bay.id} reads occupied with no session`, 1);
    const s = b.session ? sim.sessions.get(b.session) : null;
    if (s && (s.lc.state === "parked" || s.lc.state === "charged") && b.fused === false) add("missing-occupancy", b.bay.id, `Bay ${b.bay.id}: session ${s.id} parked but the bay reads vacant`, 1);
    if (b.stuckCount > 20) add("device-malfunction", `US-${b.bay.id}`, `Ultrasonic node of bay ${b.bay.id} reports a constant value`, b.stuckCount);
    if (s && s.parkedAt !== null && sim.stats.stays.length >= 8) {
      const z = robustZ(t - s.parkedAt, sim.stats.stays);
      if (z > 3.5) add("unusual-duration", s.id, `Session ${s.id}: stay ${(((t - s.parkedAt) / 3600)).toFixed(1)} h (robust z = ${z.toFixed(1)})`, z, "robust-statistics");
    }
  }
  for (const d of sim.devices.values()) {
    if (t > 3 * d.period + 5 && t - d.lastSeen > 3 * d.period) add(d.online ? "stale-data" : "message-pattern", d.id, `${d.label}: no message for ${(t - d.lastSeen).toFixed(0)} s`, (t - d.lastSeen) / d.period);
  }
}

function sample(sim: FacilitySim, hour: number) {
  const e = sim.lastEnergy;
  const lat = sim.broker.stats.latencies;
  sim.samples.push({
    t: sim.t,
    hour,
    occupied: sim.bays.filter((b) => b.status === "occupied" || b.status === "charging" || b.status === "charging-complete").length,
    available: sim.bays.filter((b) => b.status === "available").length,
    charging: sim.bays.filter((b) => b.status === "charging").length,
    queue: queueLength(sim),
    pv: e?.pvUsed ?? 0,
    grid: e?.grid ?? 0,
    bess: e ? e.bessDischarge - e.bessCharge : 0,
    bessSoc: storageSoc(sim.storage),
    load: e ? e.served.essential + e.served.comfort + e.served.charging : 0,
    chargingPower: e?.served.charging ?? 0,
    temperature: sim.env.temperature,
    co: sim.env.co,
    smoke: sim.env.smoke,
    gas: sim.env.gas,
    latencyP95: percentile(lat.slice(-300), 0.95),
  });
  if (sim.samples.length > 2880) sim.samples.splice(0, 1440);
}

export function queueLength(sim: FacilitySim): number {
  let n = 0;
  for (const s of sim.sessions.values()) if (["approaching", "detected", "identifying", "id-uncertain", "unknown-vehicle", "camera-fault", "manual-verification", "identified", "authorizing", "authorized", "allocating", "queued", "no-bay", "environmental-alarm", "gateway-unavailable"].includes(s.lc.state) && vehicleById(sim, s.vehicleId)?.spawned) n += 1;
  return n;
}

// ── Presence detection at the entry (opens sessions) ──

/** Called by the motion step's caller: opens a session when a vehicle's front crosses the presence loop. Idempotent per vehicle. */
export function detect(sim: FacilitySim) {
  const loop = sim.layout.entry.loopX;
  for (const v of sim.vehicles) {
    if (!v.spawned || v.gone || v.sessionId) continue;
    const front = v.pose.x + v.fp.wheelbase / 2 + v.fp.length / 2;
    if (front < loop) continue;
    const detection = `loop-${v.profile.id}`;
    // Idempotent: one detection event, one session — whatever the sensor repeats.
    const existing = [...sim.sessions.values()].find((s) => s.detection === detection);
    if (existing) {
      v.sessionId = existing.id;
      continue;
    }
    const s = newSession(sim, v.profile, detection);
    v.sessionId = s.id;
    s.detectedAt = sim.t;
    const e = sim.gates.entry;
    if (v.profile.tailgates && (e.barrier.target === 90 || e.barrier.angle > 30) && e.current !== null) {
      s.tailgater = true;
      transition(sim, s, "detected", "Presence detector");
      transition(sim, s, "tailgating", "Followed through an open barrier without authorisation");
      v.hold = null;
      const free = sim.bays.find((b) => b.session === null && b.status === "available" && b.bay.type === "conventional");
      if (free) {
        free.session = s.id;
        free.version += 1;
        s.bayId = free.bay.id;
        const rearY = parkedRear(free.bay, v.fp, receiverOffset(v.profile), 0);
        const keep = v.s;
        v.path = entryPath(sim.layout, free.bay, v.fp, { rearY, lateral: 0 });
        v.s = Math.min(keep, v.path.length);
        v.hold = null;
        v.goal = free.bay.id;
      }
    } else transition(sim, s, "detected", "Presence detector at the stop line");
  }
}

export { BARRIER_SPEED };
