// The parking session state machine (SP-CTRL-001).
//
// Twenty-four states in the normal lifecycle from approach to release, and
// exceptional states for every condition the brief lists. Transitions are
// only those in TRANSITIONS; the facility asks for a transition with a reason
// and a guard result, and an invalid one is refused and logged rather than
// applied. Timers are part of the model (processing times, timeouts, driver
// reaction), never a visual stand-in for a state change.

export type SessionState =
  // Normal lifecycle
  | "approaching"
  | "detected"
  | "identifying"
  | "identified"
  | "authorizing"
  | "authorized"
  | "allocating"
  | "reserved"
  | "entry-permitted"
  | "barrier-opening"
  | "entering"
  | "barrier-closing"
  | "navigating"
  | "parking"
  | "confirming"
  | "parked"
  | "eligibility"
  | "charging"
  | "charged"
  | "departure-requested"
  | "charging-stopping"
  | "billing"
  | "exit-authorized"
  | "exiting"
  | "released"
  // Exceptional
  | "unknown-vehicle"
  | "unauthorized"
  | "id-uncertain"
  | "manual-verification"
  | "camera-fault"
  | "no-bay"
  | "no-charging-bay"
  | "reservation-conflict"
  | "queued"
  | "barrier-obstructed"
  | "tailgating"
  | "wrong-bay"
  | "sensor-fault"
  | "occupancy-disagreement"
  | "comm-timeout"
  | "environmental-alarm"
  | "charging-fault"
  | "payment-pending"
  | "operator-intervention"
  | "gateway-unavailable"
  | "rejected"
  | "abandoned";

export interface StateInfo {
  label: string;
  /** Position in the normal lifecycle (1–25), or 0 for exceptional states. */
  step: number;
  kind: "normal" | "exception";
  text: string;
  recovery?: string;
}

const N = (step: number, label: string, text: string): StateInfo => ({ step, label, kind: "normal", text });
const X = (label: string, text: string, recovery: string): StateInfo => ({ step: 0, label, kind: "exception", text, recovery });

export const STATES: Record<SessionState, StateInfo> = {
  approaching: N(1, "Vehicle approaching", "On the entry road, decelerating toward the stop line."),
  detected: N(2, "Detected", "The presence detector at the stop line confirmed a vehicle; a session is opened (once per detection event)."),
  identifying: N(3, "Identification pending", "The camera pipeline is reading the plate on the edge computer."),
  identified: N(4, "Identified", "An identity is established: a confident plate read, an RFID tag, a QR code, a visitor ticket or an operator."),
  authorizing: N(5, "Authorisation pending", "The identity is checked against the local access list and reservations."),
  authorized: N(6, "Authorised", "The vehicle may enter."),
  allocating: N(7, "Slot allocation", "The allocation engine evaluates every bay against the hard constraints and the policy."),
  reserved: N(8, "Slot reserved", "The chosen bay is reserved atomically for this session."),
  "entry-permitted": N(9, "Entry permitted", "Local safety checks passed; the guidance display shows the bay."),
  "barrier-opening": N(10, "Barrier opening", "The entry barrier is opening; the vehicle waits for it."),
  entering: N(11, "Entering", "The vehicle drives through the gate."),
  "barrier-closing": N(12, "Barrier closing", "The clear zone is verified empty; the barrier closes behind the vehicle."),
  navigating: N(13, "Navigating", "Driving along the aisle following the guidance to the bay."),
  parking: N(14, "Parking", "Turning into the bay and stopping."),
  confirming: N(15, "Occupancy confirmation", "Waiting for the fused bay sensors to confirm the vehicle."),
  parked: N(16, "Parked", "The bay's sensors confirm the vehicle; parking time runs."),
  eligibility: N(17, "Charging eligibility", "Occupancy, compatibility, transmitter, authorisation, alignment, battery and safety are verified."),
  charging: N(18, "Charging", "A charging session is attached and handed to the Station charging state machine."),
  charged: N(19, "Charging complete", "The Station reached the target or stopped; the vehicle stays parked."),
  "departure-requested": N(20, "Departure requested", "The driver asked to leave (or the planned departure time came)."),
  "charging-stopping": N(21, "Charging stopping safely", "The Station ramps power down and de-energises the pad before the vehicle may move."),
  billing: N(22, "Billing finalised", "Parking and charging are settled in separate ledgers."),
  "exit-authorized": N(23, "Exit authorised", "Payment settled (or deferred by policy); the vehicle may leave."),
  exiting: N(24, "Exiting", "Leaving the bay and driving to the exit gate."),
  released: N(25, "Released", "The vehicle has left; the bay was released after verified departure."),
  "unknown-vehicle": X("Unknown vehicle", "No identity could be established.", "Visitor ticket, operator verification, or turned away."),
  unauthorized: X("Unauthorised vehicle", "The identity is not allowed to enter.", "Turned away through the turnaround."),
  "id-uncertain": X("Identification uncertain", "The plate was read with low confidence: never authorised automatically.", "RFID or QR at the reader, or operator verification."),
  "manual-verification": X("Manual verification", "Waiting for an operator to verify the vehicle.", "Operator approves or refuses; timeout turns the vehicle away."),
  "camera-fault": X("Camera failure", "The recognition camera is not responding.", "RFID or QR at the reader; operator."),
  "no-bay": X("No available bay", "No bay satisfies the hard constraints.", "Queue until a bay is released."),
  "no-charging-bay": X("No compatible charging bay", "The EV asked to charge but no wireless bay can be offered.", "Offered a conventional bay without charging."),
  "reservation-conflict": X("Reservation conflict", "The reserved bay is not available (occupied or out of service).", "Reallocated within the reserved class, else queued."),
  queued: X("Queue waiting", "Waiting at the stop line for a bay.", "A bay is released → allocation; patience exceeded → abandons."),
  "barrier-obstructed": X("Barrier obstruction", "Something is under the barrier: it will not close.", "Clear zone empty → close."),
  tailgating: X("Tailgating detected", "A second vehicle followed through on one authorisation.", "Operator review."),
  "wrong-bay": X("Wrong parking bay", "The vehicle stopped in a bay other than its allocation.", "Reassigned if that bay is eligible, else operator."),
  "sensor-fault": X("Sensor failure", "A bay sensor is not reporting.", "Fused from the remaining sensors; maintenance."),
  "occupancy-disagreement": X("Occupancy disagreement", "The bay's sensors disagree: the bay is uncertain, not assigned.", "Sensors agree again, or an operator confirms."),
  "comm-timeout": X("Communication timeout", "A node's messages stopped arriving.", "Messages resume; data marked STALE meanwhile."),
  "environmental-alarm": X("Environmental alarm", "Smoke or gas alarm: entry suspended, charging stopped, exits open.", "Alarm cleared and acknowledged."),
  "charging-fault": X("Charging safety fault", "The Station entered an abnormal state.", "The Station's own recovery; parking continues."),
  "payment-pending": X("Payment pending", "The payment service did not confirm.", "Retried; exit allowed on a deferred-payment record by policy."),
  "operator-intervention": X("Operator intervention", "Waiting for an authorised operator decision.", "Operator approves or refuses."),
  "gateway-unavailable": X("Gateway unavailable", "The edge gateway is down: new entries wait; exits open on local control.", "Gateway restored."),
  rejected: X("Turned away", "Entry refused; the vehicle leaves through the turnaround.", "—"),
  abandoned: X("Abandoned the queue", "Waited longer than the driver's patience and left.", "—"),
};

/** Allowed transitions. Anything else is refused. */
export const TRANSITIONS: Record<SessionState, readonly SessionState[]> = {
  approaching: ["detected", "abandoned"],
  detected: ["identifying", "camera-fault", "gateway-unavailable", "tailgating"],
  identifying: ["identified", "id-uncertain", "unknown-vehicle", "camera-fault"],
  identified: ["authorizing"],
  authorizing: ["authorized", "unauthorized"],
  authorized: ["allocating"],
  allocating: ["reserved", "no-bay", "no-charging-bay", "reservation-conflict", "environmental-alarm"],
  reserved: ["entry-permitted", "environmental-alarm"],
  "entry-permitted": ["barrier-opening", "environmental-alarm"],
  "barrier-opening": ["entering", "environmental-alarm"],
  entering: ["barrier-closing", "barrier-obstructed"],
  "barrier-closing": ["navigating", "barrier-obstructed", "tailgating"],
  navigating: ["parking", "wrong-bay"],
  parking: ["confirming", "wrong-bay"],
  confirming: ["parked", "occupancy-disagreement", "wrong-bay"],
  parked: ["eligibility", "departure-requested", "occupancy-disagreement"],
  eligibility: ["charging", "parked"],
  charging: ["charged", "charging-fault", "departure-requested", "charging-stopping"],
  charged: ["departure-requested"],
  "departure-requested": ["charging-stopping", "billing"],
  "charging-stopping": ["billing"],
  billing: ["exit-authorized", "payment-pending"],
  "exit-authorized": ["exiting"],
  exiting: ["released"],
  released: [],
  "unknown-vehicle": ["identified", "manual-verification", "rejected"],
  unauthorized: ["rejected"],
  "id-uncertain": ["identified", "manual-verification", "unknown-vehicle"],
  "manual-verification": ["identified", "rejected"],
  "camera-fault": ["identified", "manual-verification", "unknown-vehicle"],
  "no-bay": ["queued", "rejected"],
  "no-charging-bay": ["allocating"],
  "reservation-conflict": ["allocating"],
  queued: ["allocating", "abandoned", "environmental-alarm"],
  "barrier-obstructed": ["barrier-closing", "navigating"],
  tailgating: ["operator-intervention"],
  "wrong-bay": ["confirming", "operator-intervention"],
  "sensor-fault": ["parked", "confirming"],
  "occupancy-disagreement": ["parked", "confirming", "operator-intervention"],
  "comm-timeout": ["parked", "confirming"],
  "environmental-alarm": ["queued", "allocating", "rejected", "abandoned"],
  "charging-fault": ["charging", "charged", "departure-requested"],
  "payment-pending": ["exit-authorized"],
  "operator-intervention": ["parked", "confirming", "departure-requested", "exiting", "rejected"],
  "gateway-unavailable": ["identifying", "rejected", "abandoned"],
  rejected: [],
  abandoned: [],
};

export const NORMAL_LIFECYCLE = (Object.keys(STATES) as SessionState[]).filter((s) => STATES[s].kind === "normal").sort((a, b) => STATES[a].step - STATES[b].step);

export interface Transition {
  t: number;
  from: SessionState;
  to: SessionState;
  reason: string;
}

export interface Lifecycle {
  state: SessionState;
  since: number;
  history: Transition[];
  /** Transitions asked for that the table refused (should stay empty). */
  refused: Transition[];
}

export const newLifecycle = (t: number): Lifecycle => ({ state: "approaching", since: t, history: [], refused: [] });

/** Applies a transition if the table allows it. */
export function move(lc: Lifecycle, to: SessionState, t: number, reason: string): boolean {
  if (lc.state === to) return false;
  const entry = { t, from: lc.state, to, reason };
  if (!TRANSITIONS[lc.state].includes(to)) {
    lc.refused.push(entry);
    return false;
  }
  lc.history.push(entry);
  if (lc.history.length > 80) lc.history.splice(0, lc.history.length - 80);
  lc.state = to;
  lc.since = t;
  return true;
}

/** True once the lifecycle has passed through `state` (or is in it). */
export const reachedState = (lc: Lifecycle, state: SessionState) => lc.state === state || lc.history.some((h) => h.to === state);

export const isTerminal = (s: SessionState) => s === "released" || s === "rejected" || s === "abandoned";
