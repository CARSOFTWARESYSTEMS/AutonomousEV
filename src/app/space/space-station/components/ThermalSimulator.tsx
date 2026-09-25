"use client";
import { useMemo, useState } from "react";
import { Thermometer, AlertTriangle } from "lucide-react";
import { sizeRadiator, THERMAL_DEFAULTS, type ThermalInput } from "@/lib/space-station/thermal";
import { SimFrame, Slider, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";

function Arrow({ x, y, w, label, color, dir }: { x: number; y: number; w: number; label: string; color: string; dir: "in" | "out" }) {
  const width = Math.max(2, Math.min(22, w));
  const x2 = dir === "in" ? x + 90 : x - 90;
  return (
    <g>
      <line x1={x} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={width} strokeLinecap="round" opacity="0.8" />
      <text x={dir === "in" ? x : x2} y={y - width / 2 - 6} fontSize="11" fill={color}>{label}</text>
    </g>
  );
}

export default function ThermalSimulator() {
  const [t, setT] = useState<ThermalInput>(THERMAL_DEFAULTS);
  const set = (k: keyof ThermalInput) => (v: number) => setT((s) => ({ ...s, [k]: v }));
  const r = useMemo(() => sizeRadiator(t), [t]);
  const base = useMemo(() => sizeRadiator({ ...t, payloadKW: 0 }), [t]);
  const kw = (w: number) => w / 1000;
  const scale = (w: number) => (kw(w) / Math.max(kw(r.totalHeatW), 1)) * 22;
  return (
    <SimFrame
      title="Thermal Simulator"
      icon={Thermometer}
      transparency={{
        assumptions: [
          "Steady state, orbit-average environment; one radiator temperature for the whole radiator.",
          "All electrical power used on board becomes heat that must be rejected.",
          `Radiators are kept near edge-on to the Sun (sun view factor ${THERMAL_DEFAULTS.sunViewFactor}); Earth view factor ${THERMAL_DEFAULTS.earthViewFactor}.`,
          "Earth IR 240 W/m² and albedo 0.3 are global averages.",
        ],
        equations: [
          { expr: "Q = P_equipment + N · q_metabolic + P_payload" },
          { expr: "q_emit = ε σ T⁴" },
          { expr: "q_abs = α S F_sun + α S a F_earth f_day + ε q_IR F_earth" },
          { expr: "A_radiator = Q / (q_emit − q_abs)" },
        ],
        limitations: [
          "No fin efficiency, fluid-loop temperature drops, or transient eclipse cooling.",
          "Real radiators need margin for degradation of coatings and micrometeoroid damage.",
        ],
        sources: ["ntrs", "nasa-iss"],
      }}
    >
      {(view) => (
        <div className={styles.simBody}>
          <div className={styles.simControls}>
            <Slider label="Research payload heat" value={t.payloadKW} min={0} max={80} step={1} unit="kW" onChange={set("payloadKW")} help="Raise this to see how research demand drives radiator size." />
            <Slider label="Internal equipment" value={t.equipmentKW} min={5} max={150} step={1} unit="kW" onChange={set("equipmentKW")} />
            <Slider label="Crew" value={t.crew} min={0} max={12} step={1} onChange={set("crew")} />
            <Slider label="Radiator temperature" value={t.radiatorTempK} min={240} max={340} step={1} unit="K" onChange={set("radiatorTempK")} />
            {view === "engineering" && (
              <>
                <Slider label="Emissivity ε" value={t.emissivity} min={0.6} max={0.95} step={0.01} onChange={set("emissivity")} />
                <Slider label="Solar absorptivity α" value={t.solarAbsorptivity} min={0.1} max={0.9} step={0.01} onChange={set("solarAbsorptivity")} />
                <Slider label="Sun view factor" value={t.sunViewFactor} min={0} max={1} step={0.01} onChange={set("sunViewFactor")} />
              </>
            )}
          </div>
          <div className={styles.simOutput}>
            <p className={styles.notice} style={{ marginTop: 0 }}>
              <AlertTriangle size={16} aria-hidden="true" />
              <span>
                <strong>Getting rid of heat in vacuum is a major spacecraft engineering problem.</strong> There is no air to carry heat away — only
                radiation, which is weak at room temperature.
              </span>
            </p>
            {!r.feasible && (
              <p className={styles.alert}>
                <AlertTriangle size={16} aria-hidden="true" /> The radiator absorbs more than it emits at this temperature — it cannot reject any heat.
              </p>
            )}
            <div className={styles.metrics} aria-live="polite">
              <Metric label="Total heat load" value={fmt(kw(r.totalHeatW), 1)} unit="kW" />
              <Metric label="Net rejection" value={fmt(r.netRejectionWm2)} unit="W/m²" />
              <Metric label="Radiator area" value={fmt(r.radiatorAreaM2)} unit="m²" tone={r.feasible ? undefined : "bad"} />
              <Metric label="Added by payload" value={r.feasible ? `+${fmt(r.radiatorAreaM2 - base.radiatorAreaM2)}` : "—"} unit="m²" />
            </div>
            <svg viewBox="0 0 640 230" role="img" aria-label={`Heat flows: equipment ${fmt(kw(r.equipmentW))} kW, crew ${fmt(kw(r.crewW), 1)} kW, payload ${fmt(kw(r.payloadW))} kW into the station; radiators reject ${fmt(kw(r.totalHeatW), 1)} kW to space while absorbing sunlight, albedo and Earth infrared.`} style={{ width: "100%", height: "auto", background: "#0b1733", borderRadius: 10 }}>
              <rect x={230} y={70} width={150} height={80} rx={14} fill="#cbd5e1" />
              <text x={305} y={114} fontSize="12" textAnchor="middle" fill="#0f172a" fontWeight="700">Station</text>
              <Arrow x={110} y={80} w={scale(r.equipmentW)} label={`Equipment ${fmt(kw(r.equipmentW))} kW`} color="#f472b6" dir="in" />
              <Arrow x={110} y={112} w={scale(r.crewW)} label={`Crew ${fmt(kw(r.crewW), 1)} kW`} color="#fcd34d" dir="in" />
              <Arrow x={110} y={144} w={scale(r.payloadW)} label={`Payload ${fmt(kw(r.payloadW))} kW`} color="#a78bfa" dir="in" />
              <rect x={420} y={40} width={30} height={140} fill="#e2e8f0" />
              <text x={435} y={200} fontSize="11" textAnchor="middle" fill="#e2e8f0">Radiator</text>
              <line x1={380} y1={110} x2={420} y2={110} stroke="#22d3ee" strokeWidth={3} strokeDasharray="5 4" />
              <Arrow x={560} y={80} w={10} label={`Emits ${fmt(r.emittedWm2)} W/m²`} color="#67e8f9" dir="out" />
              <text x={470} y={130} fontSize="11" fill="#fcd34d">Absorbs: Sun {fmt(r.absorbedSolarWm2)}</text>
              <text x={470} y={146} fontSize="11" fill="#fcd34d">albedo {fmt(r.absorbedAlbedoWm2)}, Earth IR {fmt(r.absorbedEarthIrWm2)} W/m²</text>
              <text x={20} y={220} fontSize="10" fill="#b5b8c9">Arrow widths proportional to heat flow · schematic</text>
            </svg>
            {view === "engineering" && (
              <p style={{ fontSize: 14, marginTop: 10 }}>
                At {t.radiatorTempK} K each square metre emits {fmt(r.emittedWm2)} W but absorbs {fmt(r.absorbedSolarWm2 + r.absorbedAlbedoWm2 + r.absorbedEarthIrWm2)} W from the environment.
                Emission scales with T⁴, so a hotter radiator is much smaller — but the radiator cannot be hotter than the coolant, and the coolant must stay
                cooler than the equipment and cabin air it cools. Those limits cap the radiator temperature (heat pumps can lift it, at a power cost).
              </p>
            )}
          </div>
        </div>
      )}
    </SimFrame>
  );
}
