"use client";
// The Battery Health Dashboard: a qualitative status (Healthy / Attention /
// Service Recommended / Critical) and the factors behind it, never an invented
// numeric score. Every value is SIMULATED.
import { useState } from "react";
import { assessHealth, REFERENCE_NOTE } from "@/lib/ev-battery-toolkit/health";
import { formatNumber, formatSourced, round } from "@/lib/ev-battery-toolkit/provenance";
import type { Provenance } from "@/lib/ev-battery-toolkit/types";
import { useSimulation } from "../state/store";
import { ContextBanner, HealthPill, Pill, ProvenanceBadge, SafetyBanner } from "../ui/Badges";
import css from "../toolkit.module.css";

function Tile({ label, value, provenance, wide }: { label: string; value: React.ReactNode; provenance: Provenance; wide?: boolean }) {
  return (
    <div className={css.tile} data-wide={wide ? "" : undefined}>
      <dt>{label}</dt>
      <dd>
        <span className={css.tileValue}>{value}</span>
        <ProvenanceBadge provenance={provenance} />
      </dd>
    </div>
  );
}

export default function HealthDashboard() {
  const { pack, fault, result } = useSimulation();
  const s = result.snapshot;
  const health = assessHealth(s, fault?.safety ?? "none", result.limits);
  const [why, setWhy] = useState(false);
  const usable = s.soh.value !== null ? round((pack.capacityAh * s.soh.value) / 100, 1) : null;
  const perf = (enabled: boolean | null, current: number | null, charging: boolean) => {
    if (enabled === null) return "Not available.";
    if (!enabled) return "Blocked by BMS";
    if (current === null) return "Available";
    return charging ? (current < -0.5 ? "Charging" : "Available") : current > 0.5 ? "Delivering" : "Available";
  };

  return (
    <div className={css.dashboard}>
      <ContextBanner context="simulation" detail={fault ? "Values follow the fault injected in the explorer." : "Normal simulated pack."} />
      {fault?.safety === "stop" ? <SafetyBanner level="stop" /> : fault?.safety === "early-warning" ? <SafetyBanner level="early-warning" /> : null}
      <div className={css.dashHead}>
        <div>
          <p className={css.panelLabel}>Overall battery health</p>
          <p className={css.dashStatus}>
            <HealthPill status={health.status} />
          </p>
        </div>
        <button type="button" className={css.secondary} aria-expanded={why} aria-controls="why-health" onClick={() => setWhy(!why)}>
          WHY THIS STATUS?
        </button>
      </div>
      {why ? (
        <div id="why-health" className={css.why}>
          <table className={css.factorTable}>
            <caption>Contributing factors — the overall status is the worst of these.</caption>
            <thead>
              <tr>
                <th scope="col">Factor</th>
                <th scope="col">Value</th>
                <th scope="col">Status</th>
                <th scope="col">Reference</th>
              </tr>
            </thead>
            <tbody>
              {health.factors.map((f) => (
                <tr key={f.id} data-driver={health.drivers.includes(f) ? "" : undefined}>
                  <th scope="row">{f.label}</th>
                  <td>{f.value}</td>
                  <td>
                    <HealthPill status={f.status} />
                  </td>
                  <td>{f.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={css.fine}>{REFERENCE_NOTE} No numeric health score is shown because no validated scoring algorithm is used.</p>
        </div>
      ) : null}
      <dl className={css.tiles}>
        <Tile label="SOC" value={formatSourced(s.soc)} provenance={s.soc.provenance} />
        <Tile label="SOH" value={formatSourced(s.soh)} provenance={s.soh.provenance} />
        <Tile label="Usable capacity" value={formatNumber(usable, "Ah", 1)} provenance={usable === null ? "NOT_AVAILABLE" : "ESTIMATED"} />
        <Tile label="Pack voltage" value={formatSourced(s.packVoltage, 1)} provenance={s.packVoltage.provenance} />
        <Tile label="Cell delta" value={formatSourced(s.cellDeltaMv)} provenance={s.cellDeltaMv.provenance} />
        <Tile label="Maximum temperature" value={formatSourced(s.maxTemp, 1)} provenance={s.maxTemp.provenance} />
        <Tile label="Temperature spread" value={formatSourced(s.tempSpread, 1)} provenance={s.tempSpread.provenance} />
        <Tile label="Charge performance" value={perf(s.chargeEnabled.value, s.packCurrent.value, true)} provenance={s.chargeEnabled.provenance} />
        <Tile label="Discharge performance" value={perf(s.dischargeEnabled.value, s.packCurrent.value, false)} provenance={s.dischargeEnabled.provenance} />
        <Tile label="BMS status" value={formatSourced(s.bmsState)} provenance={s.bmsState.provenance} />
        <Tile label="Communication" value={Object.entries(s.comms).map(([k, v]) => `${k} ${v}`).join(" · ")} provenance="SIMULATED" wide />
        <Tile label="Safety status" value={fault?.safety === "stop" ? "STOP" : fault?.safety === "early-warning" ? "Early warning" : "No safety condition"} provenance="SIMULATED" />
        <Tile label="Fault count" value={<Pill family={health.faultCount ? "service" : "ok"}>{health.faultCount}</Pill>} provenance={s.faultCodes.provenance} />
      </dl>
    </div>
  );
}
