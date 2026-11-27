// Reservations: advance booking of a bay class (or a specific bay), with a
// hold window before the start, a grace period after it, no-show handling,
// cancellation and conflict detection. Capacity of a class is never
// over-committed: the number of overlapping bookings of a class may not
// exceed its bays (minus bays out of service).
import type { BayType } from "./types";

export type ReservationStatus = "booked" | "arrived" | "completed" | "expired" | "no-show" | "cancelled";

export interface Reservation {
  id: string;
  vehicleId: string;
  type: BayType;
  bayId: string | null;
  /** Booked window, s of simulation time. */
  start: number;
  end: number;
  status: ReservationStatus;
  /** QR token issued to the driver (synthetic). */
  token: string;
  createdAt: number;
}

export interface ReservationPolicy {
  /** A specific bay is held this long before the start, s. */
  holdBefore: number;
  /** The booking lapses (no-show) this long after the start, s. */
  grace: number;
}

export const DEFAULT_RESERVATION_POLICY: ReservationPolicy = { holdBefore: 15 * 60, grace: 15 * 60 };

export interface BookingResult {
  ok: boolean;
  reservation?: Reservation;
  reason: string;
}

const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }) => a.start < b.end && b.start < a.end;
const live = (r: Reservation) => r.status === "booked" || r.status === "arrived";

export class ReservationBook {
  readonly items: Reservation[] = [];
  private next = 1;
  constructor(readonly policy: ReservationPolicy = DEFAULT_RESERVATION_POLICY) {}

  /** Books a class (or a specific bay). Rejects conflicts: the same bay twice, or more bookings of a class than it has bays. */
  book(req: { vehicleId: string; type: BayType; bayId?: string | null; start: number; end: number; token: string }, capacity: Record<BayType, number>, now: number): BookingResult {
    if (req.end <= req.start) return { ok: false, reason: "The window must end after it starts" };
    if (req.start < now - 60) return { ok: false, reason: "The window has already started" };
    const active = this.items.filter(live);
    if (active.some((r) => r.vehicleId === req.vehicleId && overlaps(r, req))) return { ok: false, reason: "This vehicle already holds an overlapping reservation" };
    if (req.bayId && active.some((r) => r.bayId === req.bayId && overlaps(r, req))) return { ok: false, reason: `Bay ${req.bayId} is already reserved in that window` };
    // Peak concurrent bookings of the class across the requested window.
    const same = active.filter((r) => r.type === req.type && overlaps(r, req));
    const edges = [req.start, ...same.map((r) => r.start)].filter((t) => t >= req.start && t < req.end);
    const peak = Math.max(0, ...edges.map((t) => same.filter((r) => r.start <= t && r.end > t).length));
    if (peak + 1 > capacity[req.type]) return { ok: false, reason: `All ${req.type} bays are already reserved in that window` };
    const reservation: Reservation = { id: `R-${String(this.next++).padStart(4, "0")}`, vehicleId: req.vehicleId, type: req.type, bayId: req.bayId ?? null, start: req.start, end: req.end, status: "booked", token: req.token, createdAt: now };
    this.items.push(reservation);
    return { ok: true, reservation, reason: "Booked" };
  }

  cancel(id: string): boolean {
    const r = this.items.find((x) => x.id === id);
    if (!r || r.status !== "booked") return false;
    r.status = "cancelled";
    return true;
  }

  /** The live reservation a vehicle (or its token) holds at time t. */
  forVehicle(vehicleId: string, t: number, token?: string | null): Reservation | null {
    return this.items.find((r) => live(r) && (r.vehicleId === vehicleId || (token && r.token === token)) && t >= r.start - this.policy.holdBefore && t <= r.end) ?? null;
  }

  /** Bays held for a reservation at time t (their hold window has opened). */
  held(t: number): Map<string, string> {
    const out = new Map<string, string>();
    for (const r of this.items) if (r.status === "booked" && r.bayId && t >= r.start - this.policy.holdBefore && t <= r.start + this.policy.grace) out.set(r.bayId, r.id);
    return out;
  }

  /** Bays reserved by anyone in the next `horizon` seconds. */
  upcoming(t: number, horizon: number): Set<string> {
    return new Set(this.items.filter((r) => r.status === "booked" && r.bayId && r.start <= t + horizon && r.end >= t).map((r) => r.bayId!));
  }

  /** Marks no-shows and expiries; returns the reservations that changed. */
  update(t: number): Reservation[] {
    const changed: Reservation[] = [];
    for (const r of this.items) {
      if (r.status === "booked" && t > r.start + this.policy.grace) {
        r.status = "no-show";
        changed.push(r);
      } else if (r.status === "arrived" && t > r.end + 4 * 3600) {
        r.status = "expired";
        changed.push(r);
      }
    }
    return changed;
  }

  arrive(id: string) {
    const r = this.items.find((x) => x.id === id);
    if (r && r.status === "booked") r.status = "arrived";
  }

  complete(id: string) {
    const r = this.items.find((x) => x.id === id);
    if (r && (r.status === "arrived" || r.status === "booked")) r.status = "completed";
  }
}
