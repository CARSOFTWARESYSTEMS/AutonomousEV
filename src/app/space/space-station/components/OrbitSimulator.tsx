"use client";
import { useMemo, useState } from "react";
import { Orbit } from "lucide-react";
import { circularOrbit, eclipseFraction, dragDecay, groundTrack, nodeShiftPerOrbitDeg, ORBIT_PRESETS, type SolarActivity } from "@/lib/space-station/orbit";
import { SimFrame, Slider, Select, Metric, fmt } from "./SimFrame";
import styles from "../station.module.css";

const GW = 640, GH = 320;

function GroundTrack({ inc, alt }: { inc: number; alt: number }) {
  const pts = useMemo(() => groundTrack(inc, alt, 3, 120), [inc, alt]);
  const x = (lon: number) => ((lon + 180) / 360) * GW;
  const y = (lat: number) => ((90 - lat) / 180) * GH;
  let d = "";
  pts.forEach((p, i) => (d += `${i === 0 || p.wrap ? "M" : "L"}${x(p.lonDeg).toFixed(1)} ${y(p.latDeg).toFixed(1)}`));
  return (
    <figure className={styles.chart} style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-labelledby="gt-t gt-d" style={{ background: "#0b1733", borderRadius: 10 }}>
        <title id="gt-t">Ground track for three orbits</title>
        <desc id="gt-d">
          The track oscillates between {fmt(inc, 1)}° north and south latitude and shifts about {fmt(nodeShiftPerOrbitDeg(alt), 1)}° west each orbit as Earth rotates beneath the station.
        </desc>
        {[-60, -30, 0, 30, 60].map((lat) => (
          <g key={lat}>
            <line x1={0} x2={GW} y1={y(lat)} y2={y(lat)} stroke={lat === 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"} />
            <text x={4} y={y(lat) - 3} fontSize="10" fill="#b5b8c9" stroke="#0b1733" strokeWidth={3} paintOrder="stroke">{lat}°</text>
          </g>
        ))}
        {[-120, -60, 0, 60, 120].map((lon) => (
          <line key={lon} y1={0} y2={GH} x1={x(lon)} x2={x(lon)} stroke="rgba(255,255,255,0.08)" />
        ))}
        <rect x={0} y={y(inc)} width={GW} height={y(-inc) - y(inc)} fill="rgba(59,130,246,0.07)" />
        <path d={d} fill="none" stroke="#67e8f9" strokeWidth="2" />
        <circle cx={x(pts[0].lonDeg)} cy={y(pts[0].latDeg)} r="4" fill="#fcd34d" />
      </svg>
      <figcaption className={styles.legend}>
        <span><i style={{ background: "#67e8f9" }} />Ground track (3 orbits, no J2 precession)</span>
        <span><i style={{ background: "rgba(59,130,246,0.5)" }} />Latitudes overflown (±inclination)</span>
      </figcaption>
    </figure>
  );
}

export default function OrbitSimulator() {
  const [alt, setAlt] = useState(415);
  const [inc, setInc] = useState(51.6);
  const [mass, setMass] = useState(420_000);
  const [area, setArea] = useState(1500);
  const [cd, setCd] = useState(2.2);
  const [beta, setBeta] = useState(0);
  const [activity, setActivity] = useState<SolarActivity>("moderate");
  const o = circularOrbit(alt);
  const f = eclipseFraction(alt, beta);
  const drag = dragDecay({ altitudeKm: alt, massKg: mass, dragAreaM2: area, dragCoefficient: cd, activity });
  const periodMin = o.periodS / 60;
  const preset = (id: string) => {
    const p = ORBIT_PRESETS.find((q) => q.id === id)!;
    setAlt(p.altitudeKm);
    setInc(p.inclinationDeg);
    setMass(p.massKg);
    setArea(p.dragAreaM2);
  };
  return (
    <SimFrame
      title="Orbit Simulator"
      icon={Orbit}
      transparency={{
        assumptions: [
          "Circular two-body orbit around a spherical Earth (μ = 3.986 × 10¹⁴ m³/s², R⊕ = 6378.137 km).",
          "Cylindrical Earth shadow; β is the angle between the orbit plane and the Sun direction.",
          "Exponential atmosphere (textbook table from Vallado, Fundamentals of Astrodynamics and Applications) scaled by an illustrative solar-activity factor of 0.5 / 1 / 3.",
          "Presets are rounded educational examples, not operational datasets.",
        ],
        equations: [
          { expr: "T = 2π √(a³ / μ),  v = √(μ / a),  a = R⊕ + h" },
          { expr: "f_ecl = (1/π) · acos( √(h² + 2R⊕h) / ((R⊕ + h) · cos β) )" },
          { expr: "a_D = ½ ρ v² · C_D A / m" },
          { expr: "da/dt = −√(μa) · ρ · C_D A / m,  Δv_year ≈ a_D · 3.156×10⁷ s" },
        ],
        limitations: [
          "Real atmospheric density can vary by an order of magnitude with solar and geomagnetic activity.",
          "Ignores J2 nodal precession, attitude-dependent drag area and orbit eccentricity.",
        ],
        sources: ["nasa-iss-facts", "nasa-odpo", "esa-debris"],
      }}
    >
      {(view) => (
        <div className={styles.simBody}>
          <div className={styles.simControls}>
            <div className={styles.presetRow} role="group" aria-label="Educational presets">
              {ORBIT_PRESETS.map((p) => (
                <button key={p.id} type="button" className={styles.chip} onClick={() => preset(p.id)} title={p.note}>
                  {p.label}
                </button>
              ))}
            </div>
            <Slider label="Altitude" value={alt} min={200} max={1000} step={5} unit="km" onChange={setAlt} />
            <Slider label="Inclination" value={inc} min={0} max={98} step={0.1} unit="°" onChange={setInc} />
            <Slider label="Station mass" value={mass} min={10_000} max={600_000} step={5_000} onChange={setMass} format={(v) => `${fmt(v / 1000)} t`} />
            <Slider label="Drag area (assumption)" value={area} min={50} max={3000} step={10} unit="m²" onChange={setArea} />
            <Select
              label="Solar activity (drag assumption)"
              value={activity}
              options={[{ value: "low", label: "Low (×0.5)" }, { value: "moderate", label: "Moderate (×1)" }, { value: "high", label: "High (×3)" }]}
              onChange={setActivity}
            />
            {view === "engineering" && (
              <>
                <Slider label="Drag coefficient C_D" value={cd} min={1.8} max={2.6} step={0.05} onChange={setCd} />
                <Slider label="β angle" value={beta} min={0} max={75} step={1} unit="°" onChange={setBeta} />
              </>
            )}
          </div>
          <div className={styles.simOutput}>
            <div className={styles.metrics} aria-live="polite">
              <Metric label="Orbital period" value={fmt(periodMin, 1)} unit="min" />
              <Metric label="Velocity" value={fmt(o.velocityMs / 1000, 2)} unit="km/s" />
              <Metric label="Orbits per day" value={fmt(o.orbitsPerDay, 2)} />
              <Metric label={`Eclipse per orbit (β=${beta}°)`} value={fmt(f * periodMin, 1)} unit="min" />
              <Metric label="Altitude loss (drag)" value={fmt(drag.altitudeLossKmPerDay * 1000)} unit="m/day" tone={drag.altitudeLossKmPerDay > 0.5 ? "warn" : undefined} />
              <Metric label="Reboost Δv needed" value={fmt(drag.reboostDeltaVMsPerYear, 1)} unit="m/s per year" />
            </div>
            <h4>Day / night cycle — one orbit</h4>
            <div className={styles.dayBar} role="img" aria-label={`Sunlight ${fmt((1 - f) * periodMin, 1)} minutes, eclipse ${fmt(f * periodMin, 1)} minutes`} style={{ height: 28, margin: "8px 0 4px" }}>
              <span style={{ flex: 1 - f, background: "#f59e0b", display: "grid", placeItems: "center", color: "#0f172a", fontSize: 12, fontWeight: 700 }}>☀ {fmt((1 - f) * periodMin)} min</span>
              {f > 0 && <span style={{ flex: f, background: "#4c1d95", display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>◐ {fmt(f * periodMin)} min</span>}
            </div>
            <p style={{ fontSize: 13 }}>
              About {fmt(o.orbitsPerDay)} sunrises and sunsets every day. {beta > 0 ? "Higher β shortens the eclipse — at high enough β there is none." : "Increase β in Engineering view to see eclipses shorten."}
            </p>
            <h4 style={{ marginTop: 12 }}>Ground track</h4>
            <div className={styles.scrollX}>
              <GroundTrack inc={inc} alt={alt} />
            </div>
            {view === "engineering" && (
              <p style={{ fontSize: 14, marginTop: 10 }}>
                Density ρ ≈ {drag.densityKgM3.toExponential(2)} kg/m³ · ballistic coefficient m/(C_D A) = {fmt(drag.ballisticCoefficient)} kg/m² · drag
                acceleration {drag.dragAccelerationMs2.toExponential(2)} m/s².
              </p>
            )}
          </div>
        </div>
      )}
    </SimFrame>
  );
}
