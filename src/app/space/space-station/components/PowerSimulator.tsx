"use client";
import { useMemo, useState } from "react";
import { Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { simulatePowerOrbit, POWER_DEFAULTS, POWER_ASSUMPTIONS, type PowerInput, type PowerResult } from "@/lib/space-station/power";
import { SimFrame, Slider, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";

const W = 640, H = 240, PAD = { l: 44, r: 44, t: 14, b: 30 };

function PowerChart({ r, period }: { r: PowerResult; period: number }) {
  const maxKW = Math.max(10, ...r.samples.map((s) => Math.max(s.generationKW, s.loadKW))) * 1.1;
  const x = (t: number) => PAD.l + (t / period) * (W - PAD.l - PAD.r);
  const yK = (v: number) => H - PAD.b - (v / maxKW) * (H - PAD.t - PAD.b);
  const yS = (soc: number) => H - PAD.b - soc * (H - PAD.t - PAD.b);
  const line = (f: (s: PowerResult["samples"][number]) => number, y: (v: number) => number) =>
    r.samples.map((s, i) => `${i ? "L" : "M"}${x(s.tMin).toFixed(1)} ${y(f(s)).toFixed(1)}`).join("");
  const eclStart = x(period - r.eclipseMin);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <figure className={styles.chart} style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="pwr-t pwr-d">
        <title id="pwr-t">Power over one orbit</title>
        <desc id="pwr-d">
          Generation {fmt(r.sunlitGenerationKW)} kW in sunlight and zero in eclipse; load about {fmt(r.averageLoadKW)} kW; battery state of charge falls
          from its maximum to a minimum of {fmt(r.minSoc * 100)}% during the {fmt(r.eclipseMin)} minute eclipse.
        </desc>
        <rect x={eclStart} y={PAD.t} width={W - PAD.r - eclStart} height={H - PAD.t - PAD.b} fill="rgba(139,92,246,0.12)" />
        <text x={eclStart + 6} y={PAD.t + 14} fontSize="11" fill="#c4b5fd">Eclipse</text>
        <text x={PAD.l + 6} y={PAD.t + 14} fontSize="11" fill="#fcd34d">Sunlight</text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={yS(t)} y2={yS(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={PAD.l - 6} y={yS(t) + 4} fontSize="10" fill="#b5b8c9" textAnchor="end">{fmt(maxKW * t)}</text>
            <text x={W - PAD.r + 6} y={yS(t) + 4} fontSize="10" fill="#b5b8c9">{t * 100}%</text>
          </g>
        ))}
        <text x={8} y={PAD.t + 4} fontSize="10" fill="#b5b8c9">kW</text>
        <text x={W - 30} y={PAD.t + 4} fontSize="10" fill="#b5b8c9">SOC</text>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text key={f} x={x(period * f)} y={H - 10} fontSize="10" fill="#b5b8c9" textAnchor="middle">{fmt(period * f)} min</text>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={yS(POWER_ASSUMPTIONS.criticalSoc)} y2={yS(POWER_ASSUMPTIONS.criticalSoc)} stroke="#ef4444" strokeDasharray="4 4" />
        <path d={line((s) => s.generationKW, yK)} stroke="#fcd34d" strokeWidth="2" fill="none" />
        <path d={line((s) => s.loadKW, yK)} stroke="#f472b6" strokeWidth="2" fill="none" strokeDasharray="6 3" />
        <path d={line((s) => s.soc, yS)} stroke="#67e8f9" strokeWidth="2.5" fill="none" />
      </svg>
      <figcaption className={styles.legend}>
        <span><i style={{ background: "#fcd34d" }} />Generation (kW)</span>
        <span><i style={{ background: "#f472b6" }} />Consumption (kW, dashed)</span>
        <span><i style={{ background: "#67e8f9" }} />Battery SOC (%)</span>
        <span><i style={{ background: "#ef4444" }} />Critical SOC {POWER_ASSUMPTIONS.criticalSoc * 100}%</span>
      </figcaption>
    </figure>
  );
}

export default function PowerSimulator() {
  const [p, setP] = useState<PowerInput>(POWER_DEFAULTS);
  const set = (k: keyof PowerInput) => (v: number) => setP((s) => ({ ...s, [k]: v }));
  const r = useMemo(() => simulatePowerOrbit(p), [p]);
  const minBattery = Math.min(...r.samples.map((s) => s.batteryKW));
  const maxBattery = Math.max(...r.samples.map((s) => s.batteryKW));
  return (
    <SimFrame
      title="Power Simulator"
      icon={Zap}
      transparency={{
        assumptions: [
          `Solar irradiance S = 1361 W/m²; orbit-average pointing factor k = ${POWER_ASSUMPTIONS.pointingFactor}.`,
          `Battery charge efficiency ${POWER_ASSUMPTIONS.chargeEfficiency}, discharge efficiency ${POWER_ASSUMPTIONS.dischargeEfficiency}.`,
          `Research loads are shed if the battery would fall below ${POWER_ASSUMPTIONS.loadShedSoc * 100}% SOC; critical warning below ${POWER_ASSUMPTIONS.criticalSoc * 100}%.`,
          "Orbit starts at sunrise; one continuous sunlit period and one eclipse per orbit; constant loads.",
        ],
        equations: [
          { expr: "P_sun = S · A · η · (1 − d) · k", note: "Array output in sunlight (W)." },
          { expr: "SOC(t+Δt) = SOC(t) + η_c · (P_gen − P_load) · Δt / C", note: "Charging, when generation exceeds load." },
          { expr: "SOC(t+Δt) = SOC(t) − (P_load − P_gen) · Δt / (η_d · C)", note: "Discharging." },
          { expr: "A_req = L · (t_sun + t_ecl / (η_c η_d)) / (t_sun · S · η · (1 − d) · k)", note: "Array area that balances one orbit." },
        ],
        limitations: [
          "No battery voltage, temperature or ageing model; no power-distribution losses beyond the pointing factor.",
          "Real stations schedule loads dynamically and have many independent power channels.",
          "Not flight-level accuracy.",
        ],
        sources: ["nasa-iss-facts", "ntrs"],
      }}
    >
      {(view) => (
        <div className={styles.simBody}>
          <div className={styles.simControls}>
            <Slider label="Solar-array area" value={p.arrayAreaM2} min={100} max={2500} step={10} unit="m²" onChange={set("arrayAreaM2")} />
            <Slider label="Solar-cell efficiency" value={p.cellEfficiency} min={0.1} max={0.35} step={0.01} onChange={set("cellEfficiency")} format={(v) => `${Math.round(v * 100)}%`} />
            <Slider label="Sunlight fraction of orbit" value={p.sunlightFraction} min={0.5} max={1} step={0.01} onChange={set("sunlightFraction")} format={(v) => `${Math.round(v * 100)}%`} help="About 60–65% in LEO at low β angle; up to 100% at high β." />
            <Slider label="Base (housekeeping) load" value={p.baseLoadKW} min={5} max={120} step={1} unit="kW" onChange={set("baseLoadKW")} />
            <Slider label="Research load" value={p.researchLoadKW} min={0} max={100} step={1} unit="kW" onChange={set("researchLoadKW")} />
            <Slider label="Crew load" value={p.crewLoadKW} min={0} max={40} step={1} unit="kW" onChange={set("crewLoadKW")} />
            <Slider label="Battery capacity" value={p.batteryCapacityKWh} min={20} max={500} step={5} unit="kWh" onChange={set("batteryCapacityKWh")} />
            <Slider label="Initial battery SOC" value={p.initialSoc} min={0.2} max={1} step={0.01} onChange={set("initialSoc")} format={(v) => `${Math.round(v * 100)}%`} />
            <Slider label="Array degradation" value={p.degradation} min={0} max={0.7} step={0.01} onChange={set("degradation")} format={(v) => `${Math.round(v * 100)}%`} />
            <button type="button" className={styles.textButton} onClick={() => setP(POWER_DEFAULTS)}>Reset to defaults</button>
          </div>
          <div className={styles.simOutput}>
            <div aria-live="polite">
              {r.criticalWarning ? (
                <p className={styles.alert}><AlertTriangle size={16} aria-hidden="true" /> Critical-load warning: battery falls below {POWER_ASSUMPTIONS.criticalSoc * 100}% SOC{r.unservedKWh > 0 ? " and some load cannot be served" : ""}.</p>
              ) : r.shedMinutes > 0 ? (
                <p className={styles.alert} data-tone="warn"><AlertTriangle size={16} aria-hidden="true" /> Research loads shed for {fmt(r.shedMinutes)} min to protect essential systems.</p>
              ) : (
                <p className={styles.alert} data-tone="ok"><CheckCircle2 size={16} aria-hidden="true" /> {r.sustainable ? "Energy-positive orbit: arrays recharge the battery for the next eclipse." : "No shedding this orbit, but the array cannot sustain this load indefinitely."}</p>
              )}
            </div>
            <div className={styles.metrics}>
              <Metric label="Generation (sunlit)" value={fmt(r.sunlitGenerationKW)} unit="kW" />
              <Metric label="Consumption (avg)" value={fmt(r.averageLoadKW)} unit="kW" />
              <Metric label="Orbit energy margin" value={fmt(r.energyMarginKWh)} unit="kWh" tone={r.energyMarginKWh < 0 ? "bad" : "ok"} />
              <Metric label="Minimum SOC" value={fmt(r.minSoc * 100)} unit="%" tone={r.minSoc < POWER_ASSUMPTIONS.criticalSoc ? "bad" : r.minSoc < POWER_ASSUMPTIONS.loadShedSoc ? "warn" : undefined} />
              <Metric label="Eclipse" value={fmt(r.eclipseMin)} unit="min" />
              <Metric label="Battery charge / discharge" value={`+${fmt(maxBattery)} / ${fmt(minBattery)}`} unit="kW" />
            </div>
            <PowerChart r={r} period={p.periodMin} />
            {view === "engineering" && (
              <p style={{ fontSize: 14, marginTop: 10 }}>
                Array area needed to balance this orbit: <b style={{ color: "var(--space-text)" }}>{fmt(r.requiredArrayAreaM2)} m²</b> (you have {fmt(p.arrayAreaM2)} m²).
                Energy generated {fmt(r.energyGeneratedKWh, 1)} kWh vs consumed {fmt(r.energyConsumedKWh, 1)} kWh per {fmt(p.periodMin, 1)}-minute orbit; end SOC {fmt(r.endSoc * 100)}%.
              </p>
            )}
          </div>
        </div>
      )}
    </SimFrame>
  );
}
