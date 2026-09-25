"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, Orbit, SunMoon, Link2, Zap, Radio, FlaskConical } from "lucide-react";
import { circularOrbit, eclipseFraction } from "@/lib/space-station/orbit";
import { simulatePowerOrbit, POWER_DEFAULTS } from "@/lib/space-station/power";
import styles from "../station.module.css";
import hero from "./hero.module.css";

// Schematic geometry (screen units). Physics — period, eclipse fraction,
// power and SOC — comes from the engineering models, not from the drawing.
const ALT_KM = 415;
const CX = 250, CY = 214, R = 104, ORBIT_R = 182, K = 0.34, TILT = (-10 * Math.PI) / 180;
const SECONDS_PER_ORBIT = 24; // animation time for one real orbit
const DIRECT_WINDOW: [number, number] = [-0.7, 0.9]; // rad, station near the ground station
const DOCK_S = 14;

const orbit = circularOrbit(ALT_KM);
const ECLIPSE_F = eclipseFraction(ALT_KM, 0);
const ECL_HALF = Math.PI * ECLIPSE_F;

function project(theta: number) {
  const sx = ORBIT_R * Math.cos(theta);
  const z = ORBIT_R * Math.sin(theta);
  const sy = z * K;
  return {
    x: CX + sx * Math.cos(TILT) - sy * Math.sin(TILT),
    y: CY + sx * Math.sin(TILT) + sy * Math.cos(TILT),
    z,
  };
}

function arcPath(from: number, to: number, n = 48) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const p = project(from + ((to - from) * i) / n);
    d += `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d;
}

const norm = (a: number) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
const inEclipse = (theta: number) => Math.abs(norm(theta) - Math.PI) < ECL_HALF;
const hidden = (theta: number) => {
  const p = project(theta);
  return p.z < 0 && Math.hypot(p.x - CX, p.y - CY) < R;
};
const directLink = (theta: number) => {
  const t = norm(theta + Math.PI) - Math.PI;
  return t > DIRECT_WINDOW[0] && t < DIRECT_WINDOW[1];
};

const DOCK_STAGES = [
  { until: 0.3, label: "Approach" },
  { until: 0.45, label: "Hold point" },
  { until: 0.8, label: "Final approach" },
  { until: 0.88, label: "Soft capture" },
  { until: 0.94, label: "Hard capture" },
  { until: 1, label: "Leak check → hatch opening" },
];

type Layer = "orbit" | "daynight" | "power" | "comms" | "research";

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia?.(REDUCED);
  mq?.addEventListener?.("change", cb);
  return () => mq?.removeEventListener?.("change", cb);
}
const getReduced = () => window.matchMedia?.(REDUCED).matches ?? false;

export default function SpaceStationHero() {
  const power = useMemo(() => simulatePowerOrbit({ ...POWER_DEFAULTS, sunlightFraction: 1 - ECLIPSE_F, periodMin: orbit.periodS / 60 }), []);
  // Reduced motion: start paused; the user can still press Play explicitly.
  const reducedMotion = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  const [userRunning, setUserRunning] = useState<boolean | null>(null);
  const running = userRunning ?? !reducedMotion;
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ orbit: true, daynight: true, power: false, comms: true, research: false });
  const [docking, setDocking] = useState(false);
  const [tele, setTele] = useState({ theta: 0.6, dock: -1 });
  const theta = useRef(0.6);
  const dockT = useRef(-1);
  const scene = useRef<HTMLDivElement>(null);
  const station = useRef<SVGGElement>(null);
  const visitor = useRef<SVGGElement>(null);
  const linkDirect = useRef<SVGLineElement>(null);
  const linkRelay = useRef<SVGLineElement>(null);
  const arrays = useRef<SVGGElement>(null);
  const closeVisitor = useRef<SVGGElement>(null);
  const visible = useRef(true);
  const runningRef = useRef(running);
  const layersRef = useRef(layers);
  const dirty = useRef(true);

  useEffect(() => {
    runningRef.current = running;
    layersRef.current = layers;
    dirty.current = true;
  }, [running, layers]);

  useEffect(() => {
    // Pause only when the whole scene (orbit view, close-up and controls) is off-screen.
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (scene.current) io.observe(scene.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastTele = 0;
    const draw = () => {
      const th = theta.current;
      const p = project(th);
      const ecl = inEclipse(th);
      const hid = hidden(th);
      if (station.current) {
        station.current.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        station.current.style.opacity = hid ? "0" : ecl ? "0.55" : "1";
      }
      const L = layersRef.current;
      if (linkDirect.current) {
        const on = L.comms && !hid && directLink(th);
        linkDirect.current.setAttribute("x2", p.x.toFixed(1));
        linkDirect.current.setAttribute("y2", p.y.toFixed(1));
        linkDirect.current.style.opacity = on ? "1" : "0";
      }
      if (linkRelay.current) {
        linkRelay.current.setAttribute("x2", p.x.toFixed(1));
        linkRelay.current.setAttribute("y2", p.y.toFixed(1));
        linkRelay.current.style.opacity = L.comms && !hid ? "0.8" : "0";
      }
      // Arrays rotate once per orbit to track the Sun: apparent width ∝ |cos α|.
      if (arrays.current) arrays.current.setAttribute("transform", `translate(0 110) scale(1 ${Math.max(0.08, Math.abs(Math.cos(th))).toFixed(3)}) translate(0 -110)`);
      const d = dockT.current;
      if (visitor.current) {
        if (d >= 0) {
          const q = project(th - 0.5 * (1 - Math.min(d / 0.8, 1)));
          visitor.current.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
          visitor.current.style.opacity = hidden(th - 0.5 * (1 - Math.min(d / 0.8, 1))) ? "0" : "1";
        } else visitor.current.style.opacity = "0";
      }
      if (closeVisitor.current) {
        // Close-up: hold at 340, final approach to the port at x = 300.
        const x = d < 0 ? 400 : d < 0.3 ? 400 - (60 * d) / 0.3 : d < 0.45 ? 340 : d < 0.8 ? 340 - (40 * (d - 0.45)) / 0.35 : 300;
        closeVisitor.current.setAttribute("transform", `translate(${x.toFixed(1)} 0)`);
        closeVisitor.current.style.opacity = d < 0 ? "0" : "1";
      }
    };
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const active = runningRef.current && visible.current && !document.hidden;
      if (active) {
        theta.current = norm(theta.current + (2 * Math.PI * dt) / SECONDS_PER_ORBIT);
        if (dockT.current >= 0) dockT.current = Math.min(1, dockT.current + dt / DOCK_S);
      }
      if (active || dirty.current) {
        dirty.current = false;
        draw();
        if (now - lastTele > 250) {
          lastTele = now;
          setTele({ theta: theta.current, dock: dockT.current });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    draw();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Orbit time since sunrise (eclipse exit), used to index the power model.
  const sunrise = Math.PI + ECL_HALF;
  const tFrac = norm(tele.theta - sunrise) / (2 * Math.PI);
  const sample = power.samples[Math.min(power.samples.length - 1, Math.floor(tFrac * power.samples.length))];
  const ecl = inEclipse(tele.theta);
  const link = !layers.comms ? "—" : hidden(tele.theta) ? "Blocked by Earth" : directLink(tele.theta) ? "Relay + direct" : "Relay";
  const dockStage = tele.dock < 0 ? null : (DOCK_STAGES.find((s) => tele.dock <= s.until)?.label ?? "Docked");
  const toggle = (k: Layer) => setLayers((l) => ({ ...l, [k]: !l[k] }));
  const minutes = tFrac * (orbit.periodS / 60);

  return (
    <div className={styles.scene} ref={scene}>
      <figure className={styles.sceneFrame} style={{ margin: 0 }}>
        <svg viewBox="0 0 640 420" role="img" aria-labelledby="hero-scene-title hero-scene-desc">
          <title id="hero-scene-title">Generic Modular Research Station orbiting Earth</title>
          <desc id="hero-scene-desc">
            Schematic, not to scale. A generic station circles Earth once every {(orbit.periodS / 60).toFixed(1)} minutes at {ALT_KM} km. Sunlight
            comes from the right; about {Math.round(ECLIPSE_F * 100)}% of each orbit is in Earth&apos;s shadow, when batteries power the
            station. A relay satellite and a ground station provide communication links.
          </desc>
          <defs>
            <radialGradient id="earthDay" cx="72%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#1f6fa8" />
              <stop offset="55%" stopColor="#0d3b66" />
              <stop offset="100%" stopColor="#061a33" />
            </radialGradient>
            <linearGradient id="terminator" x1="0" x2="1">
              <stop offset="0%" stopColor="#020412" stopOpacity="0.85" />
              <stop offset="48%" stopColor="#020412" stopOpacity="0.55" />
              <stop offset="56%" stopColor="#020412" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g aria-hidden="true" fill="#b5b8c9" opacity="0.35">
            {[[40, 60], [120, 30], [560, 50], [600, 150], [480, 380], [90, 360], [320, 28], [610, 300], [20, 220]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />
            ))}
          </g>
          {/* Sunlight direction */}
          <g aria-hidden="true" className={hero.sun}>
            {[150, 214, 278].map((y) => (
              <path key={y} d={`M630 ${y} H585 m8 -5 l-8 5 l8 5`} stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            ))}
            <text x="632" y="128" textAnchor="end" fill="#fcd34d" fontSize="12">Sunlight</text>
          </g>
          {layers.orbit && <path d={arcPath(Math.PI, 2 * Math.PI)} stroke="#3b82f6" strokeOpacity="0.45" strokeWidth="1.5" fill="none" strokeDasharray="4 5" />}
          <circle cx={CX} cy={CY} r={R} fill="url(#earthDay)" />
          {layers.daynight && <circle cx={CX} cy={CY} r={R} fill="url(#terminator)" />}
          <circle cx={CX} cy={CY} r={R + 3} fill="none" stroke="#67e8f9" strokeOpacity="0.25" strokeWidth="3" />
          {layers.orbit && <path d={arcPath(0, Math.PI)} stroke="#3b82f6" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />}
          {layers.daynight && (
            <g>
              <path d={arcPath(Math.PI - ECL_HALF, Math.PI + ECL_HALF)} stroke="#8b5cf6" strokeWidth="5" strokeOpacity="0.55" fill="none" strokeLinecap="round" />
              <text x="30" y="200" fill="#c4b5fd" fontSize="12">Eclipse arc</text>
              <text x="30" y="215" fill="#b5b8c9" fontSize="11">{Math.round(ECLIPSE_F * 100)}% of orbit</text>
            </g>
          )}
          {/* Ground station and relay satellite */}
          <g aria-hidden="true">
            <circle cx={CX + R * 0.8} cy={CY - R * 0.55} r="4" fill="#10b981" />
            <text x={CX + R * 0.8 + 8} y={CY - R * 0.55 - 6} fill="#6ee7b7" fontSize="11">Ground station</text>
            {layers.comms && (
              <g>
                <rect x="72" y="34" width="14" height="8" fill="#93c5fd" />
                <rect x="58" y="36" width="12" height="4" fill="#3b82f6" />
                <rect x="88" y="36" width="12" height="4" fill="#3b82f6" />
                <text x="104" y="42" fill="#93c5fd" fontSize="11">Relay satellite</text>
              </g>
            )}
          </g>
          <line ref={linkRelay} x1="79" y1="42" x2={CX} y2={CY} stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 4" style={{ opacity: 0 }} />
          <line ref={linkDirect} x1={CX + R * 0.8} y1={CY - R * 0.55} x2={CX} y2={CY} stroke="#10b981" strokeWidth="1.5" style={{ opacity: 0 }} />
          {/* Visiting vehicle (docking demo) */}
          <g ref={visitor} style={{ opacity: 0 }} aria-hidden="true">
            <path d="M-5 -4 L5 0 L-5 4 Z" fill="#fcd34d" />
          </g>
          {/* Station glyph */}
          <g ref={station} aria-hidden="true">
            <rect x="-7" y="-3" width="14" height="6" rx="2" fill="#e2e8f0" />
            <rect x="-16" y="-9" width="6" height="18" fill="#3b82f6" />
            <rect x="10" y="-9" width="6" height="18" fill="#3b82f6" />
          </g>
          {layers.research && (
            <g fontSize="11" fill="#b5b8c9">
              <text x="14" y="388">Altitude {ALT_KM} km · period {(orbit.periodS / 60).toFixed(1)} min · {orbit.orbitsPerDay.toFixed(1)} orbits/day · v ≈ {(orbit.velocityMs / 1000).toFixed(2)} km/s</text>
            </g>
          )}
          <text x="14" y="405" fill="#b5b8c9" fontSize="11">Schematic · not to scale</text>
        </svg>
        <div className={styles.telemetry} aria-live="off">
          <div>Orbit time<b>{Math.floor(minutes)}:{String(Math.floor((minutes % 1) * 60)).padStart(2, "0")} / {(orbit.periodS / 60).toFixed(1)} min</b></div>
          <div>Environment<b>{ecl ? "◐ Eclipse" : "☀ Sunlight"}</b></div>
          <div>Arrays / load<b>{sample.generationKW.toFixed(0)} / {sample.loadKW.toFixed(0)} kW</b></div>
          <div>Battery SOC<b>{Math.round(sample.soc * 100)}% {sample.batteryKW >= 0 ? "▲" : "▼"}</b></div>
        </div>
        <figcaption className={styles.sceneCaption}>
          <span>
            <b>Generic Modular Research Station</b> — not a model of ISS, BAS or any real station.
          </span>
          <span>Link: {link}</span>
        </figcaption>
      </figure>

      <svg viewBox="0 0 400 220" role="img" aria-labelledby="closeup-title closeup-desc" className={hero.closeup}>
        <title id="closeup-title">Close-up of the generic station</title>
        <desc id="closeup-desc">
          Truss with solar array wings that rotate to track the Sun, a radiator, and a row of pressurised modules: habitation, node,
          core with batteries, and laboratory with a docking port.{dockStage ? ` Docking demo stage: ${dockStage}.` : ""}
        </desc>
        <line x1="40" y1="110" x2="320" y2="110" stroke="#94a3b8" strokeWidth="4" />
        <g ref={arrays}>
          {[50, 76, 270, 296].map((x) => (
            <g key={x}>
              <rect x={x} y="48" width="22" height="58" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
              <rect x={x} y="114" width="22" height="58" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
            </g>
          ))}
        </g>
        <rect x="172" y="60" width="26" height="46" fill="#e2e8f0" opacity="0.85" />
        <line x1="185" y1="110" x2="185" y2="140" stroke="#94a3b8" strokeWidth="3" />
        {[
          { x: 110, w: 48, label: "Hab" },
          { x: 158, w: 20, label: "" },
          { x: 178, w: 50, label: "Core" },
          { x: 228, w: 60, label: "Lab" },
        ].map((m) => (
          <g key={m.x}>
            <rect x={m.x} y="140" width={m.w} height="26" rx="8" fill="#cbd5e1" stroke="#64748b" />
            {m.label && (
              <text x={m.x + m.w / 2} y="157" textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">
                {m.label}
              </text>
            )}
          </g>
        ))}
        <rect x="288" y="146" width="10" height="14" fill="#fcd34d" />
        <g ref={closeVisitor} style={{ opacity: 0 }}>
          <path d="M2 145 h22 l8 8 l-8 8 h-22 z" fill="#fcd34d" stroke="#92400e" />
        </g>
        {layers.power && (
          <g className={hero.flow} fill="none" strokeWidth="2">
            <path d="M85 110 H185 V150" stroke="#fcd34d" strokeDasharray="5 5" opacity={sample.generationKW > 0 ? 1 : 0.15} />
            <text x="185" y="130" fontSize="9" fill="#fcd34d" textAnchor="middle">{sample.generationKW > 0 ? "Arrays → batteries & loads" : "Eclipse: batteries → loads"}</text>
            <path d="M203 150 H258" stroke="#67e8f9" strokeDasharray="5 5" />
          </g>
        )}
        {layers.research && (
          <g fontSize="10" fill="#e2e8f0">
            <text x="228" y="186">{sample.researchShed ? "Lab: experiments paused" : "Lab: experiments running"}</text>
            <text x="200" y="56">Radiator</text>
            <text x="40" y="40">Arrays track the Sun (α rotates once per orbit)</text>
          </g>
        )}
        <text x="10" y="210" fontSize="11" fill="#b5b8c9">
          {dockStage ? `Docking demo: ${dockStage}` : "Close-up · Generic Modular Research Station"}
        </text>
      </svg>

      <div className={styles.sceneControls} role="toolbar" aria-label="Scene controls">
        <button type="button" className={styles.button} onClick={() => setUserRunning(!running)}>
          {running ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />} {running ? "Pause" : "Play"}
        </button>
        {(
          [
            ["orbit", "Orbit", Orbit],
            ["daynight", "Day/Night", SunMoon],
            ["power", "Power Flow", Zap],
            ["comms", "Communications", Radio],
            ["research", "Research Mode", FlaskConical],
          ] as const
        ).map(([k, label, Icon]) => (
          <button key={k} type="button" className={styles.button} aria-pressed={layers[k]} onClick={() => toggle(k)}>
            <Icon size={15} aria-hidden="true" /> {label}
          </button>
        ))}
        <button
          type="button"
          className={styles.button}
          aria-pressed={docking}
          onClick={() => {
            const next = !docking;
            setDocking(next);
            dockT.current = next ? 0 : -1;
            dirty.current = true;
            if (next) setUserRunning(true);
          }}
        >
          <Link2 size={15} aria-hidden="true" /> Docking Demo
        </button>
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {dockStage ? `Docking stage: ${dockStage}` : ""}
      </p>
    </div>
  );
}
