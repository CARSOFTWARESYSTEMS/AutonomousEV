// How the Smart Parking stages bring the facility to the state they need. As
// at the station, a stage never fakes a state: it issues the commands a
// visitor, a driver or an operator could (an arrival, a departure, a fault,
// an acknowledgement), and when the focus vehicle has already passed the event
// a stage needs, a new arrival is sent and the same deterministic facility is
// fast-forwarded until it reaches the moment before the event.
import { arrive, book, FACILITY_STEP, operatorCommand, requestDeparture, sessionOf, stepFacility, type Session } from "@/lib/wireless-charging/smart-parking/facility";
import { reachedState, type SessionState } from "@/lib/wireless-charging/smart-parking/lifecycle";
import type { VehicleProfile } from "@/lib/wireless-charging/smart-parking/types";
import { facility } from "../state/runtime";
import { useTwin } from "../state/store";

/**
 * The tour's focus vehicle: a compatible EV that asks to charge and has
 * reserved a wireless bay. Mud covers most of its front plate, so the
 * recognition stage shows an uncertain read that is not trusted, and the
 * driver verifies with the reservation's QR code at the reader.
 */
export const FOCUS_EV: Partial<VehicleProfile> = { powertrain: "electric", wirelessCompatible: true, wantsCharging: true, cls: "sedan", soc: 0.34, targetSoc: 0.8, member: false, rfid: null, plateObstructed: false, plateCovered: true, denied: false, accessiblePermit: false, stay: 3 * 3600, paint: "#1f3550", ignoresGuidance: false, tailgates: false };

export function focus(): Session | null {
  const sim = facility();
  return sim.focus ? sessionOf(sim, sim.focus) : null;
}

export const focusReached = (state: SessionState) => {
  const f = focus();
  return !!f && reachedState(f.lc, state);
};

/** A new focus arrival now; returns its vehicle id. */
export function newFocus(over: Partial<VehicleProfile> = {}): string {
  const sim = facility();
  const id = arrive(sim, { ...FOCUS_EV, ...over });
  // The driver booked a wireless bay for the next three hours: the QR code is that booking's.
  const pending = sim.pending.find((p) => p.profile.id === id);
  const booked = book(sim, { vehicleId: id, type: "wireless", start: sim.t, end: sim.t + 3 * 3600 });
  if (pending && booked.ok && booked.reservation) pending.profile = { ...pending.profile, qr: booked.reservation.token };
  sim.focus = id;
  return id;
}

/** True when the focus vehicle exists and its session is still alive. */
const focusAlive = () => {
  const sim = facility();
  if (!sim.focus) return false;
  const v = sim.vehicles.find((x) => x.profile.id === sim.focus);
  const s = focus();
  if (!s) return sim.pending.some((p) => p.profile.id === sim.focus);
  return !!v && !v.gone && !["released", "rejected", "abandoned"].includes(s.lc.state);
};

/** The focus vehicle has not yet passed `before`; otherwise a new one is sent and fast-forwarded to `to` (or left to arrive). */
export function ensureFocus(before: SessionState, to?: SessionState, maxSeconds = 90) {
  const sim = facility();
  if (focusAlive() && !focusReached(before)) return;
  newFocus();
  if (!to) return;
  const n = Math.round(maxSeconds / FACILITY_STEP);
  for (let i = 0; i < n && !focusReached(to); i++) stepFacility(sim, FACILITY_STEP);
}

/** The focus vehicle is parked (charging if it can), fast-forwarding a new one if needed. */
export function ensureFocusParked() {
  const sim = facility();
  if (focusAlive() && focusReached("parked")) return;
  if (!focusAlive()) newFocus();
  const n = Math.round(150 / FACILITY_STEP);
  for (let i = 0; i < n && !focusReached("eligibility"); i++) stepFacility(sim, FACILITY_STEP);
}

/**
 * The focus vehicle is charging. If it could not get a wireless bay (they were
 * taken), the stage follows a vehicle that is charging instead; if none is,
 * the focus is brought to its bay.
 */
export function ensureFocusCharging() {
  const sim = facility();
  const f = focus();
  const mine = f?.bayId ? sim.chargers.get(f.bayId) : undefined;
  if (mine && mine.session?.parkingSessionId === f?.id) return;
  const other = [...sim.chargers.values()].find((c) => c.session);
  if (other?.session) {
    sim.focus = other.session.vehicleId;
    return;
  }
  ensureFocusParked();
}

/** Sets facility faults for a stage (shown in the inputs, not counted as the visitor's own interaction). */
export function setParkingFault(patch: Partial<ReturnType<typeof useTwin.getState>["facilityFaults"]>) {
  useTwin.setState((s) => ({ facilityFaults: { ...s.facilityFaults, ...patch } }));
  facility().faults = { ...useTwin.getState().facilityFaults };
}

/** The tour acts as a duty operator to acknowledge a cleared alarm (audited like any operator command). */
export function acknowledgeIfClear() {
  const sim = facility();
  if (sim.env.alarm !== "none" && !sim.faults.smoke && !sim.faults.gas && sim.env.smoke < sim.inputs.env.smokeAlarm * 0.5 && sim.env.gas < sim.inputs.env.gasAlarm * 0.5) operatorCommand(sim, "alarm.acknowledge", "shelter", "operator");
}

export function departFocus() {
  const f = focus();
  if (f && !reachedState(f.lc, "departure-requested")) requestDeparture(facility(), f.id, "driver");
}
