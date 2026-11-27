// Smart Parking instruments: each reads the running facility simulation (never
// an animation value) and states its kind. Shared helpers for the panels.
import { STATES } from "@/lib/wireless-charging/smart-parking/lifecycle";
import { chargerView } from "@/lib/wireless-charging/smart-parking/charging";
import { storageSoc } from "@/lib/wireless-charging/smart-parking/energy";
import { money, parkingBill, chargingBill, TARIFFS, LOCALES } from "@/lib/wireless-charging/smart-parking/billing";
import { queueLength, sessionOf, vehicleById, type FacilitySim, type Session } from "@/lib/wireless-charging/smart-parking/facility";
import { percentile } from "@/lib/wireless-charging/smart-parking/telemetry";
import { facilityIfBuilt } from "../state/runtime";
import { fmt } from "../ui/controls";
import type { Metric } from "./metrics";

const F = () => facilityIfBuilt();

/** A probability for display: never in exponent form. */
export const prob = (p: number) => (p >= 0.9995 ? ">0.999" : p <= 0.0005 ? "<0.001" : p.toFixed(3));
/** Power in kW for display: tiny residues read as 0. */
export const kw = (w: number, d = 1) => (Math.abs(w) < 5 ? (0).toFixed(d) : (w / 1000).toFixed(d));
const none = { value: "—" };

export function focusSession(sim: FacilitySim | null = F()): Session | null {
  if (!sim || !sim.focus) return null;
  return sessionOf(sim, sim.focus);
}

/** Site-local time of day for a simulation time. */
export function siteClock(sim: FacilitySim, t = sim.t, seconds = false): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: LOCALES[sim.inputs.region].timeZone, hour: "2-digit", minute: "2-digit", ...(seconds ? { second: "2-digit" } : {}) }).format(new Date(sim.inputs.epochMs + t * 1000));
  } catch {
    const h = sim.inputs.startHour + t / 3600;
    return `${String(Math.floor(h % 24)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;
  }
}

export const countBays = (sim: FacilitySim) => {
  const c = { available: 0, occupied: 0, charging: 0, reserved: 0, other: 0, wirelessFree: 0 };
  for (const b of sim.bays) {
    if (b.status === "available") c.available += 1;
    else if (b.status === "occupied" || b.status === "charging-complete") c.occupied += 1;
    else if (b.status === "charging") c.charging += 1;
    else if (b.status === "reserved") c.reserved += 1;
    else c.other += 1;
    if (b.status === "available" && b.bay.type === "wireless") c.wirelessFree += 1;
  }
  return c;
};

/** Running estimate of a session's two bills (for the driver and the billing stage). */
export function runningBills(sim: FacilitySim, s: Session) {
  const t = TARIFFS[sim.inputs.region];
  const v = vehicleById(sim, s.vehicleId);
  const parking = s.parkingBill ?? parkingBill(t, Math.max(0, sim.t - (s.entryAt ?? sim.t)), { reservation: !!s.reservationId, member: !!v?.profile.member, accessible: !!v?.profile.accessiblePermit });
  const ch = s.bayId ? sim.chargers.get(s.bayId) : undefined;
  const live = ch && ch.session?.parkingSessionId === s.id ? chargerView(ch) : null;
  const charging = s.chargingBill ?? (live ? chargingBill(t, live.gridJ, live.vehicleJ) : null);
  return { parking, charging, final: !!s.parkingBill };
}

export const PARKING_METRICS = {
  spAvailable: { label: "Available bays", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: String(countBays(s).available), unit: `of ${s.bays.length}` } : none; } },
  spOccupied: { label: "Occupied bays", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: String(countBays(s).occupied + countBays(s).charging) } : none; } },
  spCharging: { label: "Charging sessions", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: String([...s.chargers.values()].filter((c) => c.session && chargerView(c).energised).length), unit: `of ${s.chargers.size} bays` } : none; } },
  spWaiting: { label: "Waiting vehicles", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: String(queueLength(s)) } : none; } },
  spFocusState: { label: "Session state", kind: "SIMULATED", read: () => { const f = focusSession(); return f ? { value: STATES[f.lc.state].label } : none; } },
  spFocusBay: { label: "Allocated bay", kind: "CALCULATED", read: () => { const f = focusSession(); return f?.bayId ? { value: f.bayId } : { value: "pending" }; } },
  spRecognition: {
    label: "Plate confidence",
    kind: "SIMULATED",
    read: () => {
      const r = focusSession()?.recognition;
      return r ? { value: r.outcome === "camera-fault" ? "camera fault" : fmt(r.confidence, 2), unit: r.outcome === "recognised" ? "accepted" : r.outcome === "camera-fault" ? undefined : "below 0.90" } : { value: "—" };
    },
  },
  spCredential: { label: "Identified by", kind: "SIMULATED", read: () => { const f = focusSession(); return { value: f?.credential ? ({ plate: "plate (ANPR)", rfid: "RFID tag", qr: "QR code", "visitor-ticket": "visitor ticket", operator: "operator" } as const)[f.credential] : "pending" }; } },
  spBarrier: { label: "Entry barrier", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: fmt(s.gates.entry.barrier.angle, 0), unit: s.gates.entry.barrier.angle >= 85 ? "° open" : s.gates.entry.barrier.angle < 1 ? "° closed" : "° moving" } : none; } },
  spPolicy: { label: "Allocation policy", kind: "INPUT", read: () => { const s = F(); return s ? { value: s.inputs.policy.replace(/-/g, " ") } : none; } },
  spFusion: {
    label: "Bay posterior",
    kind: "CALCULATED",
    read: () => {
      const s = F();
      const f = focusSession(s);
      const b = s && f?.bayId ? s.bays.find((x) => x.bay.id === f.bayId) : null;
      return b ? { value: prob(b.fusion.p), unit: b.fusion.decision } : none;
    },
  },
  spEligibility: {
    label: "Charging eligibility",
    kind: "CALCULATED",
    read: () => {
      const e = focusSession()?.eligibility;
      return e ? { value: e.eligible ? "eligible" : "not eligible", unit: `${e.checks.filter((c) => c.passed).length}/7 checks` } : { value: "pending" };
    },
  },
  spStation: {
    label: "Station state",
    kind: "SIMULATED",
    read: () => {
      const s = F();
      const f = focusSession(s);
      const ch = s && f?.bayId ? s.chargers.get(f.bayId) : undefined;
      return ch && ch.session ? { value: chargerView(ch).label } : none;
    },
  },
  spFocusSoc: {
    label: "Battery SOC",
    kind: "SIMULATED",
    read: () => {
      const s = F();
      const f = focusSession(s);
      const ch = s && f?.bayId ? s.chargers.get(f.bayId) : undefined;
      if (ch && ch.session?.parkingSessionId === f?.id) return { value: fmt(chargerView(ch).soc * 100, 1), unit: "%" };
      const v = s && f ? vehicleById(s, f.vehicleId) : null;
      return v && v.profile.powertrain === "electric" ? { value: fmt(v.profile.soc * 100, 1), unit: "%" } : none;
    },
  },
  spChargePower: {
    label: "Charging power",
    kind: "SIMULATED",
    read: () => {
      const s = F();
      const f = focusSession(s);
      const ch = s && f?.bayId ? s.chargers.get(f.bayId) : undefined;
      return ch && ch.session ? { value: fmt(chargerView(ch).pBattery / 1000, 2), unit: "kW to battery" } : none;
    },
  },
  spPv: { label: "Solar", kind: "CALCULATED", read: () => { const e = F()?.lastEnergy; return e ? { value: kw(e.pvUsed), unit: "kW" } : none; } },
  spGrid: { label: "Grid import", kind: "CALCULATED", read: () => { const e = F()?.lastEnergy; return e ? { value: kw(e.grid), unit: "kW" } : none; } },
  spBess: { label: "Storage", kind: "CALCULATED", read: () => { const s = F(); return s ? { value: fmt(storageSoc(s.storage) * 100, 0), unit: s.lastEnergy && s.lastEnergy.bessDischarge > 1 ? "% · discharging" : s.lastEnergy && s.lastEnergy.bessCharge > 1 ? "% · charging" : "%" } : none; } },
  spLoad: { label: "Chargers draw", kind: "CALCULATED", read: () => { const e = F()?.lastEnergy; return e ? { value: kw(e.served.charging), unit: "kW" } : none; } },
  spTemp: { label: "Shelter air", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: fmt(s.env.temperature, 1), unit: "°C" } : none; } },
  spSmoke: { label: "Smoke (simulated)", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: fmt(s.env.smoke, 1), unit: "%/m" } : none; } },
  spFan: { label: "Ventilation", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: fmt(s.env.fanDuty * 100, 0), unit: s.env.fanFailed ? "% · fan failed" : "%" } : none; } },
  spAlarm: { label: "Alarm", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: s.env.alarm === "none" ? "normal" : `${s.env.alarm} alarm` } : none; } },
  spMessages: { label: "Messages accepted", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: String(s.ingest.counts.accepted), unit: `${s.ingest.counts.duplicate} dup.` } : none; } },
  spLatency: { label: "LAN latency p95", kind: "CALCULATED", read: () => { const s = F(); return s ? { value: fmt(percentile(s.broker.stats.latencies.slice(-300), 0.95) * 1000, 0), unit: "ms" } : none; } },
  spForecast: { label: "Forecast next hour", kind: "CALCULATED", read: () => { const s = F(); return s ? { value: forecastNow(s), unit: "occupied" } : none; } },
  spParkingFee: { label: "Parking so far", kind: "CALCULATED", read: () => { const s = F(); const f = focusSession(s); return s && f && f.entryAt !== null ? { value: money(s.inputs.region, runningBills(s, f).parking.total) } : none; } },
  spChargingFee: { label: "Charging so far", kind: "CALCULATED", read: () => { const s = F(); const f = focusSession(s); const c = s && f ? runningBills(s, f).charging : null; return s && c ? { value: money(s.inputs.region, c.total), unit: `${fmt(c.meteredWh / 1000, 2)} kWh` } : none; } },
  spClock: { label: "Site time", kind: "SIMULATED", read: () => { const s = F(); return s ? { value: siteClock(s) } : none; } },
} satisfies Record<string, Metric>;

import { forecastDay, syntheticHistory } from "@/lib/wireless-charging/smart-parking/forecast";
let cachedHistory: { key: string; h: ReturnType<typeof syntheticHistory> } | null = null;
/** Moving-average forecast of occupied bays for the next hour, from a synthetic 28-day history of this facility. */
export function forecastNow(sim: FacilitySim): string {
  const key = `${sim.bays.length}|${sim.inputs.seed}`;
  if (!cachedHistory || cachedHistory.key !== key) cachedHistory = { key, h: syntheticHistory(sim.bays.length, 28, sim.inputs.seed) };
  const f = forecastDay(cachedHistory.h, 27, "moving-average");
  const hour = Math.floor((sim.inputs.startHour + sim.t / 3600 + 1) % 24);
  return fmt(f[hour], 1);
}
