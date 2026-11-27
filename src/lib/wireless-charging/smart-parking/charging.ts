// Parking ↔ wireless charging session adapter (SP-E05).
//
// Smart Parking does not have its own wireless power transfer model. Each
// wireless bay owns one instance of the existing Station simulation
// (WPT-SIM-001: coupler, compensation, power chain, battery, thermal,
// charging state machine and safety interlocks). The adapter verifies the
// parking-side conditions, hands the vehicle over to that station
// ("arrive-parked"), lets the station run its own identification,
// authorisation, alignment, battery and safety checks, reads progress, and
// asks it to stop safely before departure. Battery state is integrated only
// by the station while attached; the parking record takes the final SOC once,
// at hand-back, so energy is never counted twice. Every bay's station is
// isolated: no two chargers share a battery or a ledger.
import { PHASES } from "../stateMachine";
import { createStation, DEFAULT_STATION_INPUTS, NO_FAULTS, setStationInputs, stationCommand, type StationFaults, type StationInputs, type StationSim, stepStation } from "../station";
import type { VehicleProfile } from "./types";

export interface EligibilityCheck {
  id: "occupancy" | "compatibility" | "transmitter" | "authorisation" | "alignment" | "battery" | "safety";
  label: string;
  passed: boolean;
  detail: string;
}

export interface Eligibility {
  eligible: boolean;
  checks: EligibilityCheck[];
}

export interface EligibilityContext {
  occupancyConfirmed: boolean;
  bayIsWireless: boolean;
  transmitterAvailable: boolean;
  chargingAuthorised: boolean;
  alignment: { lateral: number; longitudinal: number };
  tolerance: { lateral: number; longitudinal: number };
  facilitySafe: boolean;
  safetyDetail: string;
}

/** The seven parking-side checks before a charging session may be created. The station then repeats its own. */
export function evaluateEligibility(v: VehicleProfile, c: EligibilityContext): Eligibility {
  const al = c.alignment;
  const aligned = Math.abs(al.lateral) <= c.tolerance.lateral && Math.abs(al.longitudinal) <= c.tolerance.longitudinal;
  const checks: EligibilityCheck[] = [
    { id: "occupancy", label: "Parking occupancy verified", passed: c.occupancyConfirmed, detail: c.occupancyConfirmed ? "Fused bay sensors confirm the vehicle" : "Occupancy not confirmed" },
    { id: "compatibility", label: "Vehicle compatibility", passed: v.powertrain === "electric" && v.wirelessCompatible && c.bayIsWireless, detail: v.powertrain !== "electric" ? "Conventional vehicle" : !v.wirelessCompatible ? "EV without a compatible wireless receiver" : !c.bayIsWireless ? "Bay has no transmitter" : "Compatible receiver in a wireless bay" },
    { id: "transmitter", label: "Transmitter available", passed: c.transmitterAvailable, detail: c.transmitterAvailable ? "Ground pad and power cabinet in service" : "Transmitter out of service or busy" },
    { id: "authorisation", label: "Charging authorisation", passed: c.chargingAuthorised && v.wantsCharging, detail: !v.wantsCharging ? "Driver did not request charging" : c.chargingAuthorised ? "Charging authorised for this session" : "Not authorised to charge" },
    { id: "alignment", label: "Alignment", passed: aligned, detail: `Receiver offset ${(al.lateral * 1000).toFixed(0)} mm lateral, ${(al.longitudinal * 1000).toFixed(0)} mm longitudinal (tolerance ±${(c.tolerance.lateral * 1000).toFixed(0)} / ±${(c.tolerance.longitudinal * 1000).toFixed(0)} mm)` },
    { id: "battery", label: "Battery charging limits", passed: v.soc < v.targetSoc - 0.01, detail: `SOC ${(v.soc * 100).toFixed(0)} % against a target of ${(v.targetSoc * 100).toFixed(0)} %` },
    { id: "safety", label: "Local safety conditions", passed: c.facilitySafe, detail: c.safetyDetail },
  ];
  return { eligible: checks.every((x) => x.passed), checks };
}

export interface ChargingSession {
  id: string;
  bayId: string;
  vehicleId: string;
  parkingSessionId: string;
  startedAt: number;
  endedAt: number | null;
  socStart: number;
  /** From the station's session record when it ended. */
  gridJ: number;
  vehicleJ: number;
  socEnd: number | null;
  outcome: string;
}

export interface BayCharger {
  bayId: string;
  sim: StationSim;
  /** Charging session attached now, or null. */
  session: ChargingSession | null;
  faults: StationFaults;
  inService: boolean;
  /** Grid power the site allows this charger now, W (quantised). */
  allowance: number;
  history: ChargingSession[];
  /** Time not yet integrated by the station (it runs at its own step), s. */
  acc: number;
}

export function newCharger(bayId: string, seed: number): BayCharger {
  const inputs: StationInputs = { ...DEFAULT_STATION_INPUTS, holdAfterComplete: true };
  const sim = createStation(inputs, seed);
  // A new Station queues its own demonstration arrival; a parking bay's charger waits for the parking hand-over instead.
  sim.commands.splice(0);
  return { bayId, sim, session: null, faults: { ...NO_FAULTS }, inService: true, allowance: inputs.gridLimit, history: [], acc: 0 };
}

/** Station inputs for a parked vehicle: its battery and target, the measured receiver offset, and the site's allowance. */
export function stationInputsFor(v: VehicleProfile, alignment: { lateral: number; longitudinal: number }, allowance: number, base: StationInputs = DEFAULT_STATION_INPUTS): StationInputs {
  return {
    ...base,
    holdAfterComplete: true,
    capacityKWh: v.capacityKWh,
    initialSoc: v.soc,
    targetSoc: v.targetSoc,
    lateral: Math.round(alignment.lateral * 1000) / 1000,
    longitudinal: Math.round(alignment.longitudinal * 1000) / 1000,
    gridLimit: allowance,
  };
}

/** Attaches a charging session and hands the vehicle to the station. */
export function attach(ch: BayCharger, v: VehicleProfile, parkingSessionId: string, chargingId: string, alignment: { lateral: number; longitudinal: number }, t: number): ChargingSession {
  setStationInputs(ch.sim, stationInputsFor(v, alignment, ch.allowance, ch.sim.inputs));
  stationCommand(ch.sim, "arrive-parked");
  ch.session = { id: chargingId, bayId: ch.bayId, vehicleId: v.id, parkingSessionId, startedAt: t, endedAt: null, socStart: v.soc, gridJ: 0, vehicleJ: 0, socEnd: null, outcome: "in progress" };
  return ch.session;
}

/** Sets the site's power allowance (quantised to 500 W so the station's operating point is not re-solved every step). */
export function setAllowance(ch: BayCharger, watts: number) {
  const q = Math.max(0, Math.floor(watts / 500) * 500);
  if (q === ch.allowance) return;
  ch.allowance = q;
  setStationInputs(ch.sim, { ...ch.sim.inputs, gridLimit: Math.max(q, 1) });
}

export const stationPhase = (ch: BayCharger) => ch.sim.state.phase;
export const isEnergised = (ch: BayCharger) => PHASES[ch.sim.state.phase].energised;
export const isFault = (ch: BayCharger) => PHASES[ch.sim.state.phase].kind === "fault";
/** The pad is de-energised and the session record is closed. */
export const stoppedSafely = (ch: BayCharger) => !isEnergised(ch) && (ch.sim.state.phase === "completed" || ch.sim.state.phase === "available" || ch.sim.state.phase === "departure" || isFault(ch));

export function requestStop(ch: BayCharger) {
  stationCommand(ch.sim, "stop");
}

/**
 * Closes the parking-side record from the station's own session record and
 * releases the station for the next vehicle. Returns the final SOC, which the
 * parking record takes once.
 */
export function detach(ch: BayCharger, t: number): ChargingSession | null {
  const s = ch.session;
  if (!s) return null;
  const st = ch.sim.state;
  const rec = st.sessions.at(-1) ?? st.session;
  s.gridJ = rec ? rec.gridEnergy : 0;
  s.vehicleJ = rec ? rec.energyToBattery : 0;
  s.socEnd = st.battery.soc;
  s.endedAt = t;
  s.outcome = rec?.outcome ?? "ended";
  ch.history.push({ ...s });
  ch.session = null;
  stationCommand(ch.sim, "depart");
  return s;
}

/** Steps the bay's station by dt with sub-steps of h. */
export function stepCharger(ch: BayCharger, dt: number, h: number, extraFaults: Partial<StationFaults>) {
  const faults = { ...ch.faults, ...extraFaults };
  let left = dt;
  while (left > 1e-9) {
    const step = Math.min(h, left);
    stepStation(ch.sim, faults, step);
    left -= step;
  }
}

/** Live view of an attached session (for the interface and the energy model). */
export function chargerView(ch: BayCharger) {
  const st = ch.sim.state;
  return {
    phase: st.phase,
    label: PHASES[st.phase].label,
    energised: PHASES[st.phase].energised,
    fault: PHASES[st.phase].kind === "fault",
    soc: st.battery.soc,
    pGrid: st.point.pGrid,
    pBattery: st.point.pBattery,
    efficiency: st.point.efficiency,
    k: st.coupler.k,
    gridJ: st.session?.gridEnergy ?? 0,
    vehicleJ: st.session?.energyToBattery ?? 0,
    lossW: Math.max(0, st.point.pGrid - st.point.pBattery),
  };
}
