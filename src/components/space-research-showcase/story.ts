// The Space Research showcase's story: an 18.5-second loop in four stages
// (reveal, exploration, mission health, safe recovery), the camera path that
// carries it, and the simulated telemetry it shows. Pure data and functions,
// shared by the scene (inside the canvas) and the overlays (outside it), and
// unit-tested. Everything here is an educational illustration: the numbers
// are simulated, not from a spacecraft.

export const STAGES = [
  { id: "reveal", label: "Reveal", title: "Spacecraft reveal", start: 0, seconds: 4 },
  { id: "explore", label: "Explore", title: "Spacecraft exploration", start: 4, seconds: 4.5 },
  { id: "health", label: "Health", title: "Mission health", start: 8.5, seconds: 4.5 },
  { id: "recovery", label: "Recovery", title: "Safe recovery", start: 13, seconds: 5.5 },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export const LOOP_SECONDS = 18.5;

/** Finer steps inside the stages; only a change of phase reaches React. */
export const PHASES = [
  { id: "reveal", stage: 0, start: 0 },
  { id: "explore-arrays", stage: 1, start: 4 },
  { id: "explore-computer", stage: 1, start: 5.5 },
  { id: "explore-comms", stage: 1, start: 7 },
  { id: "health", stage: 2, start: 8.5 },
  { id: "anomaly", stage: 3, start: 13 },
  { id: "safe-mode", stage: 3, start: 14.5 },
  { id: "recovered", stage: 3, start: 16.5 },
] as const;

export type PhaseId = (typeof PHASES)[number]["id"];

const wrap = (t: number) => ((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;

export function phaseIndexAt(t: number): number {
  const x = wrap(t);
  let i = 0;
  for (let k = 0; k < PHASES.length; k++) if (x >= PHASES[k].start) i = k;
  return i;
}

/** The loop's clock, shared by the controls (outside the canvas) and the scene (which advances it). */
export class StoryClock {
  private t = 0;
  private listener: (phase: number) => void = () => {};
  private requestFrame: () => void = () => {};

  get time() {
    return this.t;
  }

  get phase() {
    return phaseIndexAt(this.t);
  }

  onPhase(fn: (phase: number) => void) {
    this.listener = fn;
  }

  setFrameRequester(fn: () => void) {
    this.requestFrame = fn;
  }

  advance(seconds: number) {
    const before = this.phase;
    this.t = wrap(this.t + seconds);
    if (this.phase !== before) this.listener(this.phase);
  }

  jumpToStage(index: number) {
    this.t = STAGES[index].start + 0.001;
    this.listener(this.phase);
    this.requestFrame();
  }
}

// ── Subsystems ──────────────────────────────────────────────────────────────

export type SubsystemId = "arrays" | "power" | "computer" | "attitude" | "thermal" | "comms";

export const SUBSYSTEMS: { id: SubsystemId; name: string; short: string; line: string; internal: boolean }[] = [
  { id: "arrays", name: "Solar arrays", short: "Solar arrays", line: "Two deployed wings of solar cells turn sunlight into electrical power.", internal: false },
  {
    id: "power",
    name: "Battery & EPS",
    short: "Power",
    line: "The electrical power system routes array power to every subsystem and charges the battery for eclipse.",
    internal: true,
  },
  {
    id: "computer",
    name: "Onboard computer",
    short: "Computer",
    line: "Runs the flight software, gathers telemetry from every subsystem and decides when to enter safe mode.",
    internal: true,
  },
  {
    id: "attitude",
    name: "Attitude control",
    short: "Attitude",
    line: "A star tracker and sun sensors measure where the spacecraft points; reaction wheels and magnetorquers turn it.",
    internal: true,
  },
  {
    id: "thermal",
    name: "Thermal control",
    short: "Thermal",
    line: "Gold multi-layer insulation keeps heat in; a mirrored radiator panel sheds excess heat to space.",
    internal: false,
  },
  {
    id: "comms",
    name: "Communications",
    short: "Comms",
    line: "S-band patch antennas and UHF antennas send telemetry to the ground and receive commands.",
    internal: true,
  },
];

export const subsystem = (id: SubsystemId) => SUBSYSTEMS.find((s) => s.id === id)!;

export type Tone = "info" | "alert";

/** Which subsystems glow in each phase: cyan for "look here", amber for the anomaly. */
export function tonesFor(phase: PhaseId): Partial<Record<SubsystemId, Tone>> {
  switch (phase) {
    case "explore-arrays":
      return { arrays: "info" };
    case "explore-computer":
      return { computer: "info" };
    case "explore-comms":
      return { comms: "info" };
    case "health":
      return { power: "info" };
    case "anomaly":
      return { power: "alert" };
    case "safe-mode":
      return { power: "alert", attitude: "info" };
    case "recovered":
      return { power: "info" };
    default:
      return {};
  }
}

// ── Sunlight, attitude and simulated telemetry ──────────────────────────────

/** Direction of the Sun in the scene (from the spacecraft). */
export const SUN: [number, number, number] = [-70, 45, 85];
const SUN_LENGTH = Math.hypot(...SUN);
export const SUN_UNIT: [number, number, number] = [SUN[0] / SUN_LENGTH, SUN[1] / SUN_LENGTH, SUN[2] / SUN_LENGTH];

/** Illustrative array output square to the Sun. Array power goes as cos θ. */
export const ARRAY_PEAK_W = 36;
/** In the nominal attitude the arrays face +z, so cos θ is the Sun's z component. */
export const NOMINAL_ARRAY_W = Math.round(ARRAY_PEAK_W * SUN_UNIT[2] * 10) / 10;
/** Safe mode turns the arrays square to the Sun. */
export const SAFE_ARRAY_W = ARRAY_PEAK_W;

export interface Telemetry {
  arrayW: number;
  battery: number;
  batteryNote: string;
  mode: string;
  note: string | null;
  alert: boolean;
  health: { id: SubsystemId; name: string; ok: boolean }[];
}

const HEALTH_IDS: SubsystemId[] = ["power", "computer", "attitude", "comms", "thermal"];

/** Simulated telemetry for the health and recovery stages; null elsewhere. */
export function telemetryFor(phase: PhaseId): Telemetry | null {
  const health = (powerOk: boolean) => HEALTH_IDS.map((id) => ({ id, name: subsystem(id).short, ok: id === "power" ? powerOk : true }));
  switch (phase) {
    case "health":
      return { arrayW: NOMINAL_ARRAY_W, battery: 74, batteryNote: "as predicted", mode: "Nominal", note: null, alert: false, health: health(true) };
    case "anomaly":
      return { arrayW: NOMINAL_ARRAY_W, battery: 71, batteryNote: "falling fast", mode: "Alert", note: "Battery discharging faster than predicted", alert: true, health: health(false) };
    case "safe-mode":
      return { arrayW: SAFE_ARRAY_W, battery: 71, batteryNote: "charging", mode: "Safe mode", note: "Payload off · arrays turned to the Sun", alert: true, health: health(false) };
    case "recovered":
      return { arrayW: SAFE_ARRAY_W, battery: 73, batteryNote: "charging", mode: "Recovered", note: "Charge rising · recovery verified", alert: false, health: health(true) };
    default:
      return null;
  }
}

/** The three recovery steps, for a static summary (reduced motion). */
export const RECOVERY_STEPS = ["Anomaly: battery discharging faster than predicted", "Safe mode: payload off, arrays turned to the Sun", "Recovered: charge rising, recovery verified"];

/** Short labels pinned to the model in each phase. */
export function chipsFor(phase: PhaseId, compact: boolean): { id: SubsystemId; text: string; alert?: boolean }[] {
  switch (phase) {
    case "explore-arrays":
      return [{ id: "arrays", text: "Solar arrays" }];
    case "explore-computer":
      return [{ id: "computer", text: "Onboard computer" }];
    case "explore-comms":
      return [{ id: "comms", text: "Communications" }];
    case "health":
      return compact ? [{ id: "power", text: "Battery 74%" }] : [
        { id: "arrays", text: `Arrays ${NOMINAL_ARRAY_W} W` },
        { id: "power", text: "Battery 74%" },
      ];
    case "anomaly":
      return [{ id: "power", text: "Anomaly (simulated)", alert: true }];
    case "safe-mode":
      return [{ id: "arrays", text: "Arrays to the Sun" }];
    case "recovered":
      return [{ id: "power", text: "Charging · verified" }];
    default:
      return [];
  }
}

/** Energy flows from the arrays to the power system while the battery charges. */
export const flowIn = (phase: PhaseId) => phase === "health" || phase === "safe-mode" || phase === "recovered";

// ── Motion ──────────────────────────────────────────────────────────────────

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** 0 = nominal attitude, 1 = arrays square to the Sun (safe mode); back to nominal before the loop ends. */
export function slewAt(t: number) {
  const x = wrap(t);
  return smooth((x - 14.5) / 1.5) - smooth((x - 17) / 1.5);
}

/** 0 = body closed, 1 = the gold front panel see-through, showing the modules inside. */
export function cutawayAt(t: number) {
  const x = wrap(t);
  return smooth((x - 4) / 0.8) - smooth((x - 17.4) / 0.9);
}

/** A camera view: azimuth and elevation in degrees, distance as a multiple of the fitted distance, and the point looked at. */
export interface View {
  az: number;
  el: number;
  dist: number;
  target: [number, number, number];
}

const CENTRE: [number, number, number] = [0, -8, 0];

/** Keyframes at the stage boundaries (and one in the recovery stage), looping. */
const KEYS: { t: number; v: View }[] = [
  { t: 0, v: { az: 34, el: 17, dist: 1.42, target: CENTRE } },
  { t: 4, v: { az: 16, el: 9, dist: 1.0, target: CENTRE } },
  { t: 8.5, v: { az: -26, el: 15, dist: 0.97, target: CENTRE } },
  { t: 13, v: { az: -8, el: 7, dist: 1.0, target: CENTRE } },
  { t: 16.5, v: { az: 6, el: 10, dist: 1.06, target: CENTRE } },
];

/** The resting view (reset, reduced motion): the end of the reveal. */
export const HOME: View = KEYS[1].v;

/** A close look at each subsystem when it is picked. */
export const FOCUS: Record<SubsystemId, View> = {
  arrays: { az: 26, el: 12, dist: 0.9, target: [14, 0, 4] },
  power: { az: 14, el: 6, dist: 0.5, target: [5.65, 4.5, 0] },
  computer: { az: 16, el: 16, dist: 0.5, target: [5.65, 10, 0] },
  attitude: { az: 22, el: 38, dist: 0.6, target: [3, 14, 0] },
  thermal: { az: 50, el: 12, dist: 0.68, target: [4, 0, 2] },
  comms: { az: 20, el: -32, dist: 0.68, target: [2, -16, 0] },
};

/** Periodic cubic Hermite (Catmull-Rom tangents) through the keyframes: smooth, and continuous across the loop. */
function hermite(t: number, pick: (v: View) => number) {
  const n = KEYS.length;
  const x = wrap(t);
  let i = 0;
  for (let k = 0; k < n; k++) if (x >= KEYS[k].t) i = k;
  const at = (k: number) => {
    const j = ((k % n) + n) % n;
    const loops = Math.floor(k / n);
    return { t: KEYS[j].t + loops * LOOP_SECONDS, v: pick(KEYS[j].v) };
  };
  const p0 = at(i - 1);
  const p1 = at(i);
  const p2 = at(i + 1);
  const p3 = at(i + 2);
  const h = p2.t - p1.t;
  const m1 = ((p2.v - p0.v) / (p2.t - p0.t)) * h;
  const m2 = ((p3.v - p1.v) / (p3.t - p1.t)) * h;
  const s = (x - p1.t) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p1.v + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * p2.v + (s3 - s2) * m2;
}

export function cameraAt(t: number): View {
  return { az: hermite(t, (v) => v.az), el: hermite(t, (v) => v.el), dist: hermite(t, (v) => v.dist), target: CENTRE };
}

/** The distance that fits the 105 cm span in a frame of this aspect (34° vertical field of view). */
export function fitDistance(aspect: number) {
  return 168 * Math.min(1.7, Math.max(1, 1.3 / aspect));
}
