// Build Your First CubeSat: the reference 1U model and its budget physics.
// All masses and powers are illustrative teaching values for a generic 1U
// CubeSat, chosen to sit in a realistic range; they describe no real product.
import type { Level } from "@/app/space/academy/data/curriculum";

export type PartId = "frame" | "payload" | "battery" | "eps" | "obc" | "radio" | "adcs" | "panels" | "antenna";

export interface CubeSatPart {
  id: PartId;
  name: string;
  /** Short subsystem tag. */
  tag: string;
  /** What it does, in one sentence for each level. */
  job: Record<Level, string>;
  /** Illustrative mass in grams (the payload's comes from the payload choice). */
  massG: number;
  /** Inside the frame: installed before the side panels close it. */
  internal: boolean;
}

export const PARTS: Record<PartId, CubeSatPart> = {
  frame: {
    id: "frame",
    name: "Frame and rails",
    tag: "Structure",
    job: {
      foundation: "The 10 cm aluminium skeleton that holds everything and slides into the launch dispenser on its rails.",
      advanced: "Primary structure: carries launch loads, provides the rail interface to the deployer and the mounting points for every board.",
    },
    massG: 150,
    internal: false,
  },
  payload: {
    id: "payload",
    name: "Camera payload",
    tag: "Payload",
    job: {
      foundation: "The reason for the mission: a small camera that looks down at Earth through an opening in the bottom plate.",
      advanced: "Mission payload. Its mass, power and data rate drive the rest of the design, so it is chosen first and budgeted carefully.",
    },
    massG: 0,
    internal: true,
  },
  battery: {
    id: "battery",
    name: "Battery pack",
    tag: "Power",
    job: {
      foundation: "Stores energy from the solar panels so the satellite keeps working in Earth's shadow.",
      advanced: "Energy storage sized for the eclipse load and depth-of-discharge limits; it also buffers peak loads such as transmitting.",
    },
    massG: 180,
    internal: true,
  },
  eps: {
    id: "eps",
    name: "Power board (EPS)",
    tag: "Power",
    job: {
      foundation: "Takes power from the panels, charges the battery and sends the right voltage to every other board.",
      advanced: "Electrical power system: maximum-power-point tracking, battery charge control, regulated buses and switchable, protected outputs.",
    },
    massG: 60,
    internal: true,
  },
  obc: {
    id: "obc",
    name: "Flight computer (OBC)",
    tag: "Command & data",
    job: {
      foundation: "The satellite's brain: it runs the software, decides what happens next and stores data until it can be sent home.",
      advanced: "On-board computer: command handling, scheduling, data storage, health monitoring and the mode logic, including safe mode.",
    },
    massG: 50,
    internal: true,
  },
  radio: {
    id: "radio",
    name: "Radio (COMMS)",
    tag: "Communications",
    job: {
      foundation: "Sends data and health reports to ground stations and receives their commands.",
      advanced: "Transceiver: downlinks telemetry and payload data, receives telecommands; transmitting is one of the largest power loads.",
    },
    massG: 70,
    internal: true,
  },
  adcs: {
    id: "adcs",
    name: "Attitude control (ADCS)",
    tag: "Attitude",
    job: {
      foundation: "Senses which way the satellite points and turns it, using magnetic coils that push against Earth's magnetic field.",
      advanced: "Attitude determination and control: sensors estimate orientation; magnetorquers create torque against Earth's field to detumble and point.",
    },
    massG: 90,
    internal: true,
  },
  panels: {
    id: "panels",
    name: "Solar panels",
    tag: "Power",
    job: {
      foundation: "Turn sunlight into electricity. They also close the sides of the frame, so they go on after the parts inside.",
      advanced: "Body-mounted photovoltaic panels on four faces; output follows P = S·A·η·cos θ and drops to zero in eclipse.",
    },
    massG: 200,
    internal: false,
  },
  antenna: {
    id: "antenna",
    name: "Deployable antenna",
    tag: "Communications",
    job: {
      foundation: "Thin tape antennas that stay folded for launch and spring open once the satellite is in orbit. Shown open here.",
      advanced: "Stowed under a burn-wire release for launch and deployed after a safe delay in orbit; mounted last because it sits outside the structure.",
    },
    massG: 30,
    internal: false,
  },
};

/** Installed by the learner, in the tray's order. The frame is already in place. */
export const INSTALLABLE: PartId[] = ["payload", "battery", "eps", "obc", "radio", "adcs", "panels", "antenna"];
/** The tray shows parts shuffled, so the order is the learner's decision. */
export const TRAY_ORDER: PartId[] = ["antenna", "radio", "panels", "battery", "obc", "payload", "adcs", "eps"];

export const INTERNAL: PartId[] = INSTALLABLE.filter((id) => PARTS[id].internal);

/** Can this part go in now? Internal parts any time; panels after every internal part; the antenna last. */
export function canInstall(installed: readonly PartId[], next: PartId): { ok: boolean; reason: string } {
  if (installed.includes(next)) return { ok: false, reason: `${PARTS[next].name} is already installed.` };
  if (PARTS[next].internal) return { ok: true, reason: "" };
  const missingInside = INTERNAL.filter((id) => !installed.includes(id));
  if (next === "panels" && missingInside.length > 0) {
    return { ok: false, reason: `The solar panels close the sides of the frame. Install the parts that go inside first: ${missingInside.map((id) => PARTS[id].name).join(", ")}.` };
  }
  if (next === "antenna" && !installed.includes("panels")) {
    return { ok: false, reason: "The antenna mounts on the outside of the closed satellite. Finish the inside and the solar panels first." };
  }
  return { ok: true, reason: "" };
}

// ── Identification quiz ──

export interface IdQuestion {
  id: string;
  prompt: string;
  answer: PartId;
}

export function idQuestions(level: Level): IdQuestion[] {
  const common: IdQuestion[] = [
    { id: "store", prompt: "Which part stores energy so the satellite keeps working in Earth's shadow?", answer: "battery" },
    { id: "brain", prompt: "Which part decides what the satellite does next and stores data until it can be sent home?", answer: "obc" },
  ];
  return level === "advanced"
    ? [...common, { id: "torque", prompt: "Which part can turn the satellite by pushing against Earth's magnetic field?", answer: "adcs" }]
    : [...common, { id: "sun", prompt: "Which part turns sunlight into electricity?", answer: "panels" }];
}

// ── Budgets ──

export type PayloadId = "basic" | "hd" | "spectrometer";
export type SolarId = "body" | "wings";

export const PAYLOADS: Record<PayloadId, { name: string; massG: number; powerW: number; downlinkDuty: number; note: string }> = {
  basic: { name: "Basic camera", massG: 80, powerW: 1.0, downlinkDuty: 0.1, note: "Wide view, modest detail" },
  hd: { name: "High-resolution camera", massG: 160, powerW: 2.5, downlinkDuty: 0.2, note: "Sharper images, much more data" },
  spectrometer: { name: "Spectrometer", massG: 260, powerW: 3.0, downlinkDuty: 0.15, note: "Measures colours of light in detail" },
};

export const SOLAR: Record<SolarId, { name: string; extraMassG: number; sunFacingAreaM2: number; note: string }> = {
  body: { name: "Body-mounted panels", extraMassG: 0, sunFacingAreaM2: 0.006, note: "No moving parts; one face toward the Sun" },
  wings: { name: "Body panels + two deployable wings", extraMassG: 150, sunFacingAreaM2: 0.018, note: "Three panels face the Sun; adds hinges and mass" },
};

/** Solar constant near Earth, W/m². */
export const SOLAR_CONSTANT = 1361;
/** Illustrative cell efficiency for this lesson. */
export const CELL_EFFICIENCY = 0.28;
/** Illustrative fraction of each orbit spent in sunlight for this lesson. */
export const SUNLIT_FRACTION = 0.62;
/** Always-on loads, W: computer 0.4, power board 0.1, attitude control 0.3, radio receiver 0.2. */
export const BASE_LOAD_W = 1.0;
export const TX_POWER_W = 2.0;
/** Share of the orbit the payload is switched on. */
export const PAYLOAD_DUTY = 0.25;
/** This lesson's illustrative mass limit, g. */
export const MASS_LIMIT_G = 1200;

export interface Design {
  payload: PayloadId;
  solar: SolarId;
  /** Share of the orbit spent transmitting, 0–1. */
  txDuty: number;
}

export const DEFAULT_DESIGN: Design = { payload: "hd", solar: "body", txDuty: 0.1 };

/** Sun angle each level's check uses: square-on for Foundation, 45° off the normal for Advanced. */
export const CHECK_SUN_ANGLE: Record<Level, number> = { foundation: 0, advanced: 45 };
/** Minimum margins each level asks for, as fractions. */
export const REQUIRED_MARGIN: Record<Level, { mass: number; power: number }> = {
  foundation: { mass: 0, power: 0 },
  advanced: { mass: 0.1, power: 0.1 },
};

export function sunlitPowerW(solar: SolarId, sunAngleDeg: number): number {
  const cos = Math.max(0, Math.cos((sunAngleDeg * Math.PI) / 180));
  return SOLAR_CONSTANT * SOLAR[solar].sunFacingAreaM2 * CELL_EFFICIENCY * cos;
}

export function massG(design: Design): number {
  const fixed = INSTALLABLE.concat("frame").reduce((sum, id) => sum + PARTS[id].massG, 0);
  return fixed + PAYLOADS[design.payload].massG + SOLAR[design.solar].extraMassG;
}

export interface BudgetResult {
  massG: number;
  massLimitG: number;
  /** (limit − mass) ÷ mass. */
  massMargin: number;
  sunAngleDeg: number;
  sunlitW: number;
  averageGenerationW: number;
  averageLoadW: number;
  /** (generation − load) ÷ load. */
  powerMargin: number;
  requiredTxDuty: number;
  checks: { id: "mass" | "power" | "downlink"; pass: boolean; message: string }[];
  pass: boolean;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

export function evaluateBudget(design: Design, level: Level, sunAngleDeg = CHECK_SUN_ANGLE[level]): BudgetResult {
  const mass = massG(design);
  const massMargin = (MASS_LIMIT_G - mass) / mass;
  const sunlitW = sunlitPowerW(design.solar, sunAngleDeg);
  const averageGenerationW = sunlitW * SUNLIT_FRACTION;
  const payload = PAYLOADS[design.payload];
  const averageLoadW = BASE_LOAD_W + TX_POWER_W * design.txDuty + payload.powerW * PAYLOAD_DUTY;
  const powerMargin = (averageGenerationW - averageLoadW) / averageLoadW;
  const need = REQUIRED_MARGIN[level];
  // Compare in whole tenths of a percent so a value shown as "10%" never fails a 10% rule by rounding.
  const atLeast = (value: number, min: number) => Math.round(value * 1000) >= Math.round(min * 1000);
  const checks: BudgetResult["checks"] = [
    {
      id: "downlink",
      pass: atLeast(design.txDuty, payload.downlinkDuty),
      message: atLeast(design.txDuty, payload.downlinkDuty)
        ? `The radio transmits ${pct(design.txDuty)} of each orbit, enough to send home what the ${payload.name.toLowerCase()} records (${pct(payload.downlinkDuty)} needed).`
        : `The ${payload.name.toLowerCase()} needs the radio to transmit at least ${pct(payload.downlinkDuty)} of each orbit to send its data home.`,
    },
    {
      id: "mass",
      pass: atLeast(massMargin, need.mass),
      message: atLeast(massMargin, need.mass)
        ? `Mass ${mass} g against a ${MASS_LIMIT_G} g limit: margin ${pct(massMargin)}${need.mass > 0 ? ` (at least ${pct(need.mass)} needed)` : ""}.`
        : `Mass ${mass} g ${mass > MASS_LIMIT_G ? `is over the ${MASS_LIMIT_G} g limit` : `leaves a ${pct(massMargin)} margin; at least ${pct(need.mass)} is needed`}. Choose lighter options.`,
    },
    {
      id: "power",
      pass: atLeast(powerMargin, need.power),
      message: atLeast(powerMargin, need.power)
        ? `Average generation ${averageGenerationW.toFixed(2)} W covers the ${averageLoadW.toFixed(2)} W average load: margin ${pct(powerMargin)}${sunAngleDeg ? ` with the Sun ${sunAngleDeg}° off the panels` : ""}.`
        : `Average generation ${averageGenerationW.toFixed(2)} W does not cover the ${averageLoadW.toFixed(2)} W average load${need.power > 0 ? ` with a ${pct(need.power)} margin` : ""}${sunAngleDeg ? ` with the Sun ${sunAngleDeg}° off the panels` : ""}.`,
    },
  ];
  return {
    massG: mass,
    massLimitG: MASS_LIMIT_G,
    massMargin,
    sunAngleDeg,
    sunlitW,
    averageGenerationW,
    averageLoadW,
    powerMargin,
    requiredTxDuty: payload.downlinkDuty,
    checks,
    pass: checks.every((c) => c.pass),
  };
}
