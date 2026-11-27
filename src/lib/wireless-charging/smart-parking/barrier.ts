// Entry and exit barrier controller (SP-CTRL-002).
//
// A boom driven by a geared motor with position feedback: the angle moves at
// a rate-limited speed toward the commanded position (0° closed, 90° open).
// A local controller owns safety: closing is refused, or reversed, while the
// presence or obstruction detector sees anything under the boom, whatever
// the command source (automation, cloud or operator). Closing also waits for
// the clear-zone beam after the barrier. If the gateway or cloud is lost the
// exit barrier falls back to opening on local presence (safe egress), so a
// network failure can never trap a vehicle. The physical POC uses a
// low-force miniature barrier.

export type BarrierCommand = "open" | "close" | "hold";

export interface BarrierState {
  id: string;
  /** Boom angle, degrees (0 closed, 90 open). */
  angle: number;
  target: number;
  /** Motor current, A (representative: rises while moving, more against gravity near closed). */
  current: number;
  obstructed: boolean;
  /** Clear zone after the boom is empty. */
  clear: boolean;
  /** Commands refused by the local interlock (count). */
  refused: number;
  /** Full open–close cycles (maintenance counter). */
  cycles: number;
  wasOpen: boolean;
  /** Local fail-safe egress active (exit only). */
  egress: boolean;
  lastCommand: { source: string; command: BarrierCommand; accepted: boolean; reason: string; t: number } | null;
}

export const BARRIER_SPEED = 45; // degrees per second (2 s full travel)

export const newBarrier = (id: string): BarrierState => ({ id, angle: 0, target: 0, current: 0, obstructed: false, clear: true, refused: 0, cycles: 0, wasOpen: false, egress: false, lastCommand: null });

export const isOpen = (b: BarrierState) => b.angle >= 85;
export const isClosed = (b: BarrierState) => b.angle <= 0.5;

/** A command from any source. Closing on an obstruction, or before the clear zone is empty, is refused by the interlock. */
export function commandBarrier(b: BarrierState, command: BarrierCommand, source: string, t: number): boolean {
  if (command === "close" && (b.obstructed || !b.clear)) {
    b.refused += 1;
    b.lastCommand = { source, command, accepted: false, reason: b.obstructed ? "Obstruction under the boom" : "Clear zone not empty", t };
    return false;
  }
  if (command === "close" && b.egress) {
    b.refused += 1;
    b.lastCommand = { source, command, accepted: false, reason: "Safe-egress mode holds the exit open", t };
    return false;
  }
  if (command === "open") b.target = 90;
  if (command === "close") b.target = 0;
  b.lastCommand = { source, command, accepted: true, reason: "Accepted by the local controller", t };
  return true;
}

/** Advances the boom; the interlock reverses a closing boom the moment an obstruction appears. */
export function stepBarrier(b: BarrierState, dt: number, sensors: { obstructed: boolean; clear: boolean; egress: boolean }) {
  b.obstructed = sensors.obstructed;
  b.clear = sensors.clear;
  b.egress = sensors.egress;
  if ((b.obstructed || b.egress) && b.target < b.angle) b.target = 90;
  const d = b.target - b.angle;
  const step = Math.sign(d) * Math.min(Math.abs(d), BARRIER_SPEED * dt);
  b.angle += step;
  const moving = Math.abs(step) > 1e-9;
  b.current = moving ? 0.6 + 0.9 * Math.cos((b.angle * Math.PI) / 180) : 0.05;
  if (isOpen(b)) b.wasOpen = true;
  if (b.wasOpen && isClosed(b)) {
    b.cycles += 1;
    b.wasOpen = false;
  }
}
