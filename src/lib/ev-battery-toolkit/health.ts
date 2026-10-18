// Battery health as a qualitative status, never a made-up percentage score.
// Each factor is compared with a stated reference threshold and the overall
// status is the worst factor, so "Why this status?" is the list of factors.
//
// The thresholds are the toolkit's own illustrative references for teaching
// and triage. They are not OEM limits: the interface says so beside them.
import { formatNumber } from "./provenance";
import type { BmsSnapshot, LinkState, SafetyLevel } from "./types";

export type HealthStatus = "Healthy" | "Attention" | "Service Recommended" | "Critical";

const RANK: Record<HealthStatus, number> = { Healthy: 0, Attention: 1, "Service Recommended": 2, Critical: 3 };

export interface HealthFactor {
  id: string;
  label: string;
  value: string;
  status: HealthStatus;
  rule: string;
}

export interface HealthAssessment {
  status: HealthStatus;
  factors: HealthFactor[];
  /** Factors that set the overall status. */
  drivers: HealthFactor[];
  faultCount: number;
  safety: SafetyLevel;
}

export const REFERENCE_NOTE = "Reference thresholds are illustrative toolkit values for triage, not manufacturer limits. Confirm against the BMS and OEM specification.";

function band(value: number, bands: [number, HealthStatus][], otherwise: HealthStatus): HealthStatus {
  for (const [limit, status] of bands) if (value < limit) return status;
  return otherwise;
}

export function worst(statuses: HealthStatus[]): HealthStatus {
  return statuses.reduce<HealthStatus>((a, b) => (RANK[b] > RANK[a] ? b : a), "Healthy");
}

export function assessHealth(snapshot: BmsSnapshot, safety: SafetyLevel = "none", limits?: { min: number; max: number }): HealthAssessment {
  const factors: HealthFactor[] = [];
  const num = (v: number | null) => (typeof v === "number" && Number.isFinite(v) ? v : null);

  if (snapshot.bmsState.value === "OFFLINE") {
    factors.push({ id: "bms", label: "BMS status", value: "Offline", status: "Service Recommended", rule: "No BMS data: health cannot be assessed until communication is restored." });
  } else {
    const delta = num(snapshot.cellDeltaMv.value);
    if (delta !== null) {
      factors.push({ id: "delta", label: "Cell delta", value: formatNumber(delta, "mV"), status: band(delta, [[30, "Healthy"], [80, "Attention"]], "Service Recommended"), rule: "Healthy < 30 mV · Attention 30–80 mV · Service ≥ 80 mV (at rest)" });
    }
    const minV = num(snapshot.minCellV.value);
    const maxV = num(snapshot.maxCellV.value);
    if (limits && minV !== null && maxV !== null) {
      const outside = minV < limits.min || maxV > limits.max;
      factors.push({
        id: "limits",
        label: "Cell-group voltage window",
        value: `${formatNumber(minV, "V", 3)} – ${formatNumber(maxV, "V", 3)}`,
        status: outside ? "Critical" : "Healthy",
        rule: `Every group within ${limits.min.toFixed(2)}–${limits.max.toFixed(2)} V for this chemistry`,
      });
    }
    const tMax = num(snapshot.maxTemp.value);
    if (tMax !== null && snapshot.failedSensors.length === 0) {
      factors.push({ id: "tmax", label: "Maximum temperature", value: formatNumber(tMax, "°C", 1), status: band(tMax, [[45, "Healthy"], [55, "Attention"], [60, "Service Recommended"]], "Critical"), rule: "Healthy < 45 °C · Attention 45–55 °C · Service 55–60 °C · Critical ≥ 60 °C" });
    }
    const spread = num(snapshot.tempSpread.value);
    if (spread !== null && snapshot.failedSensors.length === 0) {
      factors.push({ id: "spread", label: "Temperature spread", value: formatNumber(spread, "°C", 1), status: band(spread, [[5, "Healthy"], [8, "Attention"]], "Service Recommended"), rule: "Healthy < 5 °C · Attention 5–8 °C · Service ≥ 8 °C" });
    }
    if (snapshot.failedSensors.length > 0) {
      factors.push({ id: "sensor", label: "Temperature sensing", value: `${snapshot.failedSensors.length} channel implausible`, status: "Service Recommended", rule: "Every temperature channel must read a plausible value" });
    }
    const soh = num(snapshot.soh.value);
    if (soh !== null) {
      factors.push({ id: "soh", label: "SOH", value: formatNumber(soh, "%"), status: band(soh, [[70, "Service Recommended"], [80, "Attention"]], "Healthy"), rule: "Healthy ≥ 80 % · Attention 70–80 % · Service < 70 %" });
    }
    const state = snapshot.bmsState.value;
    if (state) {
      factors.push({ id: "bms", label: "BMS status", value: state, status: state === "NORMAL" ? "Healthy" : state === "WARNING" ? "Attention" : "Service Recommended", rule: "NORMAL expected; WARNING needs attention; PROTECTION needs service" });
    }
    if (snapshot.chargeEnabled.value === false || snapshot.dischargeEnabled.value === false) {
      const blocked = [snapshot.chargeEnabled.value === false && "charge", snapshot.dischargeEnabled.value === false && "discharge"].filter(Boolean).join(" and ");
      factors.push({ id: "paths", label: "Charge / discharge paths", value: `${blocked} blocked`, status: "Service Recommended", rule: "Both paths enabled when no protection condition is present" });
    }
  }

  const links = Object.entries(snapshot.comms) as [string, LinkState][];
  const commStatus: HealthStatus = links.some(([name, s]) => name === "CAN" && s === "OFFLINE") ? "Service Recommended" : links.some(([, s]) => s !== "ONLINE") ? "Attention" : "Healthy";
  factors.push({ id: "comms", label: "Communication", value: links.map(([n, s]) => `${n} ${s}`).join(" · "), status: commStatus, rule: "All interfaces ONLINE; a lost CAN link needs service" });

  if (safety !== "none") {
    factors.push({ id: "safety", label: "Safety", value: safety === "stop" ? "STOP condition" : "Early warning", status: safety === "stop" ? "Critical" : "Service Recommended", rule: "Any stop condition makes the battery Critical regardless of other values" });
  }

  const status = worst(factors.map((f) => f.status));
  const faultCount = snapshot.faultCodes.value?.length ?? 0;
  return { status, factors, drivers: factors.filter((f) => f.status === status && status !== "Healthy"), faultCount, safety };
}
