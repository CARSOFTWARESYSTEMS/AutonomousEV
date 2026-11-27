// Shared types of the Smart Parking & Wireless EV Charging environment (01).
// Pure data: no React, no three.js. SI units internally (m, s, W, J, °C);
// money in integer minor units (paise, cents, fen); timestamps as seconds of
// simulation time plus the site's UTC epoch, converted to local time only for
// display.

export type Region = "IN" | "US" | "CN";
export type Currency = "INR" | "USD" | "CNY";

export type BayType = "conventional" | "wireless" | "accessible";

/** What a bay is doing, as the operator sees it. Never inferred from colour alone in the interface. */
export type BayStatus = "available" | "reserved" | "occupied" | "charging" | "charging-complete" | "blocked" | "maintenance" | "unknown";

export type VehicleClass = "compact" | "sedan" | "suv" | "van";
export type Powertrain = "conventional" | "electric";

/** Where a value came from (the twin's data modes). Synthetic data is never LIVE. */
export type SourceMode = "SIMULATED" | "RECORDED" | "LIVE" | "ESTIMATED" | "STALE" | "INVALID";

/**
 * How the environment is connected. Only "simulation" and "recorded" run in
 * the public twin; the hardware modes are designed interfaces with no device
 * behind them (they are shown as blocked, never as live).
 */
export type OperatingMode =
  | "simulation" // every sensor, actuator and vehicle from the models (SIL of the control software)
  | "recorded" // replay of a captured session
  | "hil-sensors" // physical sensors observing simulated vehicles (planned)
  | "hil-controllers" // physical controllers driving simulated infrastructure (planned)
  | "poc" // the six-bay miniature facility, read-only remotely (planned)
  | "charging-telemetry"; // authorised wireless charging telemetry (planned)

export type AiDeployment = "edge" | "cloud" | "hybrid";

export interface Pose2 {
  x: number;
  y: number;
  heading: number;
}

/** A vehicle from the synthetic registry. No real identity is ever used. */
export interface VehicleProfile {
  id: string;
  cls: VehicleClass;
  length: number;
  width: number;
  height: number;
  powertrain: Powertrain;
  /** Fitted with a compatible wireless receiver (not every EV is). */
  wirelessCompatible: boolean;
  /** Battery capacity, kWh (electric only). */
  capacityKWh: number;
  /** State of charge on arrival, 0–1 (electric only). */
  soc: number;
  /** Target SOC the driver asks for, 0–1. */
  targetSoc: number;
  wantsCharging: boolean;
  /** Synthetic plate, in the region's format. */
  plate: string;
  /** Synthetic RFID tag, or null. */
  rfid: string | null;
  /** Synthetic QR token (reservation or member), or null. */
  qr: string | null;
  accessiblePermit: boolean;
  member: boolean;
  /** Plate partly hidden (dirt, tow bar, bike rack): recognition degrades. */
  plateObstructed: boolean;
  /** Not on any access list and no reservation: denied unless visitors may enter. */
  denied: boolean;
  /** Planned stay, s. */
  stay: number;
  paint: string;
  /** Script flags for demonstrations and fault scenarios. */
  ignoresGuidance?: boolean;
  tailgates?: boolean;
  /** Plate largely covered (mud and grime): any read is low-confidence. */
  plateCovered?: boolean;
}

export interface AuditEntry {
  t: number;
  actor: string;
  role: string;
  action: string;
  target: string;
  result: "accepted" | "rejected";
  reason: string;
}

export interface FacilityEvent {
  t: number;
  kind: string;
  text: string;
  /** Session, bay or device it concerns. */
  ref?: string;
  severity: "info" | "warning" | "alarm";
}
