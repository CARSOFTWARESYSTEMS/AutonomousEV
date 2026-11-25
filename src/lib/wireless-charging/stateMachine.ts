// The stationary charging state machine (WPT-CTRL-001).
//
// Nineteen normal phases and thirteen abnormal operating states. Safety is
// evaluated first on every step, in a fixed precedence; only when no safety
// condition holds may a normal transition happen. A safety trip removes power
// in the same step (the inverter is gated off) — it is never ramped.

export type PhaseId =
  | "available"
  | "approaching"
  | "detected"
  | "identification"
  | "communication"
  | "authorization"
  | "alignment"
  | "battery-check"
  | "safety-checks"
  | "low-power-init"
  | "resonance-check"
  | "ramp-up"
  | "charging"
  | "optimizing"
  | "target-reached"
  | "ramp-down"
  | "completed"
  | "departure"
  | "misalignment"
  | "unauthorized"
  | "comm-timeout"
  | "foreign-object"
  | "living-object"
  | "over-temperature"
  | "overcurrent"
  | "isolation-fault"
  | "battery-limit"
  | "grid-limited"
  | "emergency-stop"
  | "controller-failure"
  | "station-unavailable";

export type PhaseKind = "normal" | "degraded" | "fault";

export interface PhaseInfo {
  id: PhaseId;
  label: string;
  /** Position in the normal sequence (1–19), or 0 for abnormal states. */
  step: number;
  kind: PhaseKind;
  /** True while the transmitter may be energised. */
  energised: boolean;
  text: string;
  /** For abnormal states: what must be true to leave, and where to. */
  recovery?: string;
}

export const PHASES: Record<PhaseId, PhaseInfo> = {
  available: { id: "available", label: "Station available", step: 1, kind: "normal", energised: false, text: "Idle, self-tested, waiting for a vehicle. The pad is de-energised." },
  approaching: { id: "approaching", label: "Vehicle approaching", step: 2, kind: "normal", energised: false, text: "A vehicle enters the bay and slows to park." },
  detected: { id: "detected", label: "Vehicle detected", step: 3, kind: "normal", energised: false, text: "Presence sensors confirm a parked vehicle over the pad." },
  identification: { id: "identification", label: "Vehicle identification", step: 4, kind: "normal", energised: false, text: "The vehicle presents its identity and wireless-charging capability." },
  communication: { id: "communication", label: "Communication established", step: 5, kind: "normal", energised: false, text: "Vehicle and station pair and start exchanging BMS heartbeats." },
  authorization: { id: "authorization", label: "Charging authorisation", step: 6, kind: "normal", energised: false, text: "The station asks the backend to authorise the session (or uses its offline list)." },
  alignment: { id: "alignment", label: "Alignment verification", step: 7, kind: "normal", energised: false, text: "Positioning measures the receiver's offset from the pad against the tolerance." },
  "battery-check": { id: "battery-check", label: "Battery status verification", step: 8, kind: "normal", energised: false, text: "The BMS reports SOC, temperature and the power it accepts." },
  "safety-checks": { id: "safety-checks", label: "Safety checks", step: 9, kind: "normal", energised: false, text: "Foreign- and living-object detection, insulation and temperatures are checked." },
  "low-power-init": { id: "low-power-init", label: "Low-power initialisation", step: 10, kind: "normal", energised: true, text: "The pad is energised at low power and the coupling is measured." },
  "resonance-check": { id: "resonance-check", label: "Resonance verification", step: 11, kind: "normal", energised: true, text: "The input phase is checked for inductive (ZVS-capable) operation; frequency is tuned if adaptive resonance is on." },
  "ramp-up": { id: "ramp-up", label: "Controlled power ramp-up", step: 12, kind: "normal", energised: true, text: "Power rises at the configured ramp rate." },
  charging: { id: "charging", label: "Active charging", step: 13, kind: "normal", energised: true, text: "Power follows the smallest of station rating, grid availability and battery acceptance." },
  optimizing: { id: "optimizing", label: "Charging power optimisation", step: 14, kind: "normal", energised: true, text: "The binding limit changed (CC→CV, grid, temperature): set-point, load and frequency are re-optimised." },
  "target-reached": { id: "target-reached", label: "Target SOC reached", step: 15, kind: "normal", energised: true, text: "The battery has reached the target state of charge." },
  "ramp-down": { id: "ramp-down", label: "Controlled power ramp-down", step: 16, kind: "normal", energised: true, text: "Power falls to zero at the ramp rate before the pad is de-energised." },
  completed: { id: "completed", label: "Charging completed", step: 17, kind: "normal", energised: false, text: "The session is recorded: energy, cost, duration and efficiency." },
  departure: { id: "departure", label: "Vehicle departure", step: 18, kind: "normal", energised: false, text: "The vehicle leaves; the station returns to available (step 19)." },
  misalignment: { id: "misalignment", label: "Misalignment", step: 0, kind: "fault", energised: false, text: "The receiver is outside the alignment tolerance, or coupling is too low.", recovery: "Re-park within tolerance → alignment verification." },
  unauthorized: { id: "unauthorized", label: "Unauthorised vehicle", step: 0, kind: "fault", energised: false, text: "The vehicle's identity or authorisation was rejected.", recovery: "Clear the cause and reset → authorisation, or the vehicle departs." },
  "comm-timeout": { id: "comm-timeout", label: "Communication timeout", step: 0, kind: "fault", energised: false, text: "No valid BMS heartbeat within the timeout. Power was removed locally.", recovery: "Link restored → communication established." },
  "foreign-object": { id: "foreign-object", label: "Foreign object detected", step: 0, kind: "fault", energised: false, text: "A metallic object on the pad would heat in the field.", recovery: "Object removed for 2 s → safety checks." },
  "living-object": { id: "living-object", label: "Living object detected", step: 0, kind: "fault", energised: false, text: "A person or animal is in the protected zone.", recovery: "Zone clear for 3 s → safety checks." },
  "over-temperature": { id: "over-temperature", label: "Excessive temperature", step: 0, kind: "fault", energised: false, text: "A winding, the inverter or the battery exceeded its limit.", recovery: "All temperatures below limit minus hysteresis → safety checks." },
  overcurrent: { id: "overcurrent", label: "Overcurrent", step: 0, kind: "fault", energised: false, text: "A coil current exceeded the trip level. Latching.", recovery: "Operator reset → safety checks." },
  "isolation-fault": { id: "isolation-fault", label: "Isolation fault", step: 0, kind: "fault", energised: false, text: "Insulation resistance below the threshold. Latching.", recovery: "Fault cleared and operator reset → safety checks." },
  "battery-limit": { id: "battery-limit", label: "Battery charging limit", step: 0, kind: "degraded", energised: false, text: "The BMS accepts no charge now (temperature or voltage limit).", recovery: "Acceptance returns → safety checks." },
  "grid-limited": { id: "grid-limited", label: "Grid power limitation", step: 0, kind: "degraded", energised: true, text: "Charging continues at the power the grid connection allows.", recovery: "Grid availability rises → active charging." },
  "emergency-stop": { id: "emergency-stop", label: "Emergency stop", step: 0, kind: "fault", energised: false, text: "Emergency stop pressed. Latching.", recovery: "Released and operator reset → safety checks." },
  "controller-failure": { id: "controller-failure", label: "Controller failure", step: 0, kind: "fault", energised: false, text: "The station controller's watchdog tripped. Latching.", recovery: "Operator reset (controller restart) → safety checks." },
  "station-unavailable": { id: "station-unavailable", label: "Station unavailable", step: 0, kind: "fault", energised: false, text: "Out of service (maintenance or self-test failure).", recovery: "Returned to service → available." },
};

export const NORMAL_SEQUENCE: readonly PhaseId[] = (Object.values(PHASES) as PhaseInfo[]).filter((p) => p.step > 0).sort((a, b) => a.step - b.step).map((p) => p.id);

/** What the safety layer sees each step. */
export interface SafetyInputs {
  emergencyStop: boolean;
  controllerFailure: boolean;
  stationUnavailable: boolean;
  livingObjectDetected: boolean;
  isolationFault: boolean;
  overcurrent: boolean;
  foreignObjectDetected: boolean;
  overTemperature: boolean;
  /** A valid BMS heartbeat has arrived within the timeout. */
  vehicleLinkAlive: boolean;
  /** The vehicle is parked over the pad (object detection matters from then on). */
  vehicleParked: boolean;
}

/** Safety conditions in precedence order. The first that holds wins. */
export const SAFETY_PRECEDENCE: readonly { id: PhaseId; test: (s: SafetyInputs, energised: boolean) => boolean }[] = [
  { id: "emergency-stop", test: (s) => s.emergencyStop },
  { id: "controller-failure", test: (s) => s.controllerFailure },
  { id: "living-object", test: (s) => s.vehicleParked && s.livingObjectDetected },
  { id: "isolation-fault", test: (s, e) => e && s.isolationFault },
  { id: "overcurrent", test: (s, e) => e && s.overcurrent },
  { id: "foreign-object", test: (s) => s.vehicleParked && s.foreignObjectDetected },
  { id: "over-temperature", test: (s, e) => e && s.overTemperature },
  { id: "comm-timeout", test: (s, e) => e && !s.vehicleLinkAlive },
  { id: "station-unavailable", test: (s) => s.stationUnavailable },
];

/**
 * The safety state to enter from `phase`, or null. Already being in a fault
 * of equal or higher precedence keeps it; a higher-precedence condition always
 * pre-empts a lower one.
 */
export function safetyTransition(phase: PhaseId, s: SafetyInputs): PhaseId | null {
  const energised = PHASES[phase].energised;
  const current = SAFETY_PRECEDENCE.findIndex((c) => c.id === phase);
  for (let i = 0; i < SAFETY_PRECEDENCE.length; i++) {
    const c = SAFETY_PRECEDENCE[i];
    // Pre-charge phases only check what can hurt before energising: e-stop, controller, living/foreign objects, availability.
    const applies = c.test(s, energised) || (phase === "safety-checks" && c.test(s, true) && c.id !== "comm-timeout");
    if (!applies) continue;
    if (current >= 0 && current <= i) return null;
    return c.id;
  }
  return null;
}
