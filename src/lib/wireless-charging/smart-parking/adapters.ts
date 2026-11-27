// Hardware-independent adapter interfaces (SP-E12, SIL/HIL architecture).
//
// Every device class has one interface; the simulation provides an
// implementation of each, and a physical implementation (firmware plus a
// gateway driver) will provide the same contract. Simulated and physical
// sources therefore share one data contract and one data-mode label. No
// physical implementation exists yet: the hardware operating modes are
// listed as blocked, and nothing is ever labelled LIVE without a device.
import type { OperatingMode, SourceMode } from "./types";

export interface Reading<T> {
  deviceId: string;
  value: T;
  unit: string;
  /** Device timestamp, ms since the epoch (UTC). */
  ts: number;
  seq: number;
  mode: SourceMode;
  quality: "good" | "suspect" | "bad";
}

export interface OccupancySensorAdapter {
  readonly kind: "ultrasonic" | "infrared" | "camera" | "magnetic" | "radar" | "tof" | "loop";
  read(bayId: string): Reading<boolean> | null;
}
export interface VehicleRecognitionAdapter {
  recognise(gate: "entry" | "exit"): Reading<{ plate: string | null; confidence: number }> | null;
}
export interface AccessReaderAdapter {
  read(gate: "entry" | "exit"): Reading<{ rfid: string | null; qr: string | null }> | null;
}
export interface BarrierControllerAdapter {
  command(gate: "entry" | "exit", action: "open" | "close", commandId: string): { accepted: boolean; reason: string };
  position(gate: "entry" | "exit"): Reading<number>;
}
export interface EnvironmentalSensorAdapter {
  read(): Reading<{ temperature: number; humidity: number; co: number; smoke: number; gas: number }>;
}
export interface EnergyMeterAdapter {
  read(meter: "main" | "pv" | "storage" | string): Reading<number>;
}
export interface WirelessChargingAdapter {
  /** Read-only telemetry of an authorised charger; control stays with its local controller. */
  status(bayId: string): Reading<{ phase: string; power: number; soc: number }> | null;
}
export interface EdgeGatewayAdapter {
  health(): Reading<{ up: boolean; buffered: number }>;
}
export interface ParkingTelemetryAdapter {
  subscribe(topicFilter: string, handler: (topic: string, payload: unknown) => void): () => void;
}

export interface ModeInfo {
  id: OperatingMode;
  name: string;
  text: string;
  /** Available in the public twin now. */
  available: boolean;
  /** The data mode its values carry. */
  dataMode: SourceMode;
  interlocks: string;
}

/** The operating modes (SIL and HIL), each clearly identified. Only simulation and recorded replay run without hardware. */
export const OPERATING_MODES: readonly ModeInfo[] = [
  { id: "simulation", name: "Simulation (software-in-the-loop)", text: "Every sensor, actuator and vehicle from the deterministic models; the control software runs against them.", available: true, dataMode: "SIMULATED", interlocks: "Modelled interlocks (barrier, alarm, Station safety)." },
  { id: "recorded", name: "Recorded replay", text: "A captured telemetry log replayed through the same gateway ingestion and fusion.", available: true, dataMode: "RECORDED", interlocks: "None acts: replay never drives an actuator." },
  { id: "hil-sensors", name: "Physical sensors, simulated vehicles", text: "Real bay sensors on the bench observe targets moved to match simulated vehicles.", available: false, dataMode: "LIVE", interlocks: "Bench sensors only; no actuator connected." },
  { id: "hil-controllers", name: "Physical controllers, simulated infrastructure", text: "Real ESP32 and gateway firmware against simulated sensors and actuators.", available: false, dataMode: "LIVE", interlocks: "Controller interlocks run on the hardware; outputs go to simulated actuators." },
  { id: "poc", name: "Connected six-bay miniature (POC)", text: "Telemetry from the authorised physical prototype; read-only for remote users.", available: false, dataMode: "LIVE", interlocks: "Independent local interlocks on the prototype; no remote actuation." },
  { id: "charging-telemetry", name: "Authorised wireless charging telemetry", text: "Read-only telemetry from the low-voltage wireless link.", available: false, dataMode: "LIVE", interlocks: "The link's own local protection; never commanded from the twin." },
];

/** A recorded session: telemetry envelopes with their device timestamps, for replay. */
export interface RecordedSession {
  format: "evengineer.parking.recording/1";
  siteId: string;
  startedAt: number;
  messages: { topic: string; payload: unknown; at: number }[];
}
