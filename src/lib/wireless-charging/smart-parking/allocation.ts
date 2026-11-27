// Parking slot allocation (SP-MATH-004).
//
// Mandatory conditions are hard constraints, never weighted preferences: a
// bay must be available and fault-free, the vehicle must fit, a bay held by a
// reservation is offered only to that reservation, accessible bays only to
// permit holders, and wireless charging bays only to compatible EVs that ask
// to charge (unless an overflow policy is configured). Among the eligible
// bays a policy chooses; the multi-objective policy minimises
//   J = w1·travel + w2·walk + w3·charging delay + w4·congestion + w5·energy cost
// with each term normalised to [0, 1] over the eligible set. Ties break on the
// bay index, so the same state always gives the same bay. The reservation
// that follows is atomic: it succeeds only if the bay's version is unchanged.
import type { Bay } from "./layout";
import type { BayStatus, VehicleProfile } from "./types";

export type AllocationPolicy = "first-available" | "nearest" | "reservation-priority" | "charging-aware" | "multi-objective";

export const POLICY_INFO: Record<AllocationPolicy, { name: string; text: string }> = {
  "first-available": { name: "First available", text: "The lowest-numbered eligible bay." },
  nearest: { name: "Nearest available", text: "The eligible bay with the shortest driving distance from the entry." },
  "reservation-priority": { name: "Reservation priority", text: "Reserved vehicles get their bay; others are kept off bays reserved in the next 30 minutes." },
  "charging-aware": { name: "Charging-aware", text: "EVs that ask to charge go to wireless bays; every other vehicle is kept off them." },
  "multi-objective": { name: "Multi-objective optimised", text: "Minimises a normalised weighted cost of travel, walking, charging delay, congestion and energy cost." },
};

export interface Weights {
  travel: number;
  walk: number;
  chargingDelay: number;
  congestion: number;
  energy: number;
}

export const DEFAULT_WEIGHTS: Weights = { travel: 0.25, walk: 0.2, chargingDelay: 0.35, congestion: 0.1, energy: 0.1 };

export interface BayView {
  bay: Bay;
  status: BayStatus;
  /** Version counter, bumped on every change (atomic reservation). */
  version: number;
  /** Reservation that holds this bay now or soon, by reservation id. */
  heldFor: string | null;
  /** Wireless transmitter is in service (wireless bays). */
  chargerOk: boolean;
  /** Charging power the site could give this bay now, W. */
  chargerPower: number;
  /** Vehicles moving in the aisle columns around the bay (congestion). */
  congestion: number;
  /** Energy price at this bay's charger, minor units per kWh (0 if none). */
  energyPrice: number;
}

export interface AllocationRequest {
  vehicle: VehicleProfile;
  /** Reservation the vehicle holds, if any (id and its bay, if a specific bay was reserved). */
  reservation: { id: string; bayId: string | null; type: "wireless" | "conventional" | "accessible" } | null;
  /** Facility conditions that block allocation altogether (environmental alarm, gateway lost). */
  facilityBlocked: string | null;
  overflowToWireless: boolean;
  /** Bays reserved by others in the near future (reservation-priority). */
  upcoming: Set<string>;
}

export interface Candidate {
  bayId: string;
  eligible: boolean;
  reason: string;
  terms?: Weights;
  cost?: number;
}

export interface AllocationResult {
  bayId: string | null;
  policy: AllocationPolicy;
  candidates: Candidate[];
  reason: string;
  /** No wireless bay could be offered to an EV that asked to charge. */
  chargingUnavailable: boolean;
}

const fits = (v: VehicleProfile, b: Bay) => v.length <= b.depth - 0.25 && v.width <= b.width - 0.45;

/** Hard constraints: why a bay may not be offered, or null if it may. */
export function ineligible(view: BayView, req: AllocationRequest, wirelessFree: number): string | null {
  const { bay } = view;
  const v = req.vehicle;
  if (req.facilityBlocked) return req.facilityBlocked;
  if (view.status !== "available" && !(view.status === "reserved" && req.reservation && view.heldFor === req.reservation.id)) return `Bay is ${view.status}`;
  if (view.heldFor && view.heldFor !== req.reservation?.id) return "Held for another reservation";
  if (!fits(v, bay)) return "Vehicle does not fit";
  if (bay.type === "accessible" && !v.accessiblePermit) return "Accessible bay: permit required";
  if (bay.type === "wireless") {
    const wantsWireless = v.wirelessCompatible && v.wantsCharging;
    if (!view.chargerOk && wantsWireless) return "Wireless transmitter out of service";
    if (!wantsWireless && !(req.overflowToWireless && wirelessFree > 1)) return v.powertrain === "electric" && !v.wirelessCompatible ? "No compatible wireless receiver" : "Reserved for EVs that charge";
  }
  return null;
}

/** Ranks and chooses a bay. Never mutates the bays. */
export function allocate(views: BayView[], req: AllocationRequest, policy: AllocationPolicy, weights: Weights = DEFAULT_WEIGHTS): AllocationResult {
  const v = req.vehicle;
  const wirelessFree = views.filter((x) => x.bay.type === "wireless" && x.status === "available" && !x.heldFor).length;
  const candidates: Candidate[] = views.map((x) => {
    const r = ineligible(x, req, wirelessFree);
    return { bayId: x.bay.id, eligible: r === null, reason: r ?? "Eligible" };
  });
  let pool = views.filter((_, i) => candidates[i].eligible);
  const wantsWireless = v.wirelessCompatible && v.wantsCharging;
  // A reservation for a specific bay takes it whatever the policy (it was promised).
  if (req.reservation?.bayId) {
    const mine = pool.find((x) => x.bay.id === req.reservation!.bayId);
    if (mine) return done(mine.bay.id, "Reserved bay");
  }
  if (req.reservation && !req.reservation.bayId) {
    const typed = pool.filter((x) => x.bay.type === req.reservation!.type);
    if (typed.length) pool = typed;
  }
  if (policy === "reservation-priority") {
    const free = pool.filter((x) => !req.upcoming.has(x.bay.id));
    if (free.length) pool = free;
  }
  if (policy === "charging-aware" || policy === "multi-objective") {
    if (wantsWireless) {
      const w = pool.filter((x) => x.bay.type === "wireless");
      if (w.length) pool = w;
    } else {
      const c = pool.filter((x) => x.bay.type !== "wireless");
      if (c.length) pool = c;
    }
  }
  if (!pool.length) return { bayId: null, policy, candidates, reason: req.facilityBlocked ?? "No eligible bay", chargingUnavailable: wantsWireless };
  const chargingUnavailable = wantsWireless && !pool.some((x) => x.bay.type === "wireless");
  const byIndex = (a: BayView, b: BayView) => a.bay.index - b.bay.index;
  let chosen: BayView;
  if (policy === "first-available" || policy === "reservation-priority" || policy === "charging-aware") {
    chosen = policy === "first-available" ? [...pool].sort(byIndex)[0] : [...pool].sort((a, b) => a.bay.drive - b.bay.drive || byIndex(a, b))[0];
  } else if (policy === "nearest") {
    chosen = [...pool].sort((a, b) => a.bay.drive - b.bay.drive || byIndex(a, b))[0];
  } else {
    const raw = pool.map((x) => ({
      x,
      travel: x.bay.drive,
      walk: x.bay.walk,
      // Hours of charging lost: a charging EV in a bay without a charger loses all of it; in a wireless bay, by how far its power falls short of the rated power.
      chargingDelay: wantsWireless ? (x.bay.type === "wireless" ? Math.max(0, 11000 - x.chargerPower) / 11000 : 1) : 0,
      congestion: x.congestion,
      energy: wantsWireless && x.bay.type === "wireless" ? x.energyPrice : 0,
    }));
    const norm = (k: keyof Weights) => {
      const vals = raw.map((r) => r[k]);
      const lo = Math.min(...vals);
      const hi = Math.max(...vals);
      return (val: number) => (hi - lo > 1e-12 ? (val - lo) / (hi - lo) : 0);
    };
    const n = { travel: norm("travel"), walk: norm("walk"), chargingDelay: norm("chargingDelay"), congestion: norm("congestion"), energy: norm("energy") };
    let best: { x: BayView; cost: number } | null = null;
    for (const r of raw) {
      const terms: Weights = { travel: n.travel(r.travel), walk: n.walk(r.walk), chargingDelay: n.chargingDelay(r.chargingDelay), congestion: n.congestion(r.congestion), energy: n.energy(r.energy) };
      const cost = weights.travel * terms.travel + weights.walk * terms.walk + weights.chargingDelay * terms.chargingDelay + weights.congestion * terms.congestion + weights.energy * terms.energy;
      const c = candidates.find((k) => k.bayId === r.x.bay.id)!;
      c.terms = terms;
      c.cost = cost;
      if (!best || cost < best.cost - 1e-12 || (Math.abs(cost - best.cost) <= 1e-12 && r.x.bay.index < best.x.bay.index)) best = { x: r.x, cost };
    }
    chosen = best!.x;
  }
  return { ...done(chosen.bay.id, POLICY_INFO[policy].name), chargingUnavailable };

  function done(bayId: string, reason: string): AllocationResult {
    return { bayId, policy, candidates, reason, chargingUnavailable: false };
  }
}

/** Atomic reservation: compare-and-set on the bay's version. Returns false if the bay changed since it was read. */
export function commitReservation(view: { status: BayStatus; version: number; session: string | null }, expectedVersion: number, sessionId: string): boolean {
  if (view.version !== expectedVersion || (view.status !== "available" && view.status !== "reserved") || (view.session !== null && view.session !== sessionId)) return false;
  view.status = "reserved";
  view.session = sessionId;
  view.version += 1;
  return true;
}
