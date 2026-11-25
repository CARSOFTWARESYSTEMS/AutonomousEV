"use client";
// The Digital Twin: the 3D stage with the four environments, visualisation
// modes, playback, and the panels for the active environment around it.
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import { Maximize2, Minimize2, Pause, Play, RotateCcw, StepForward, Video } from "lucide-react";
import { componentById } from "@/lib/wireless-charging/components";
import { ENVIRONMENTS, VIEW_MODES, type EnvironmentId, type ViewModeId } from "@/lib/wireless-charging/content";
import { DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { PHASES } from "@/lib/wireless-charging/stateMachine";
import type { QualitySettings } from "../../satellite-explorer/lib/capabilities";
import IntroOverlay from "../intro/Intro";
import { toggleFullscreen } from "../state/fullscreen";
import { resetEnvironment, runtime, singleStep, stationStep, useSampled } from "../state/runtime";
import { SPEEDS, useTwin } from "../state/store";
import { labelRef } from "../three/labels";
import { FLOW_COLORS } from "../three/overlays";
import { AtDepth, fmt, Segmented } from "../ui/controls";
import FieldMap2D from "../ui/FieldMap2D";
import Inspector from "../ui/Inspector";
import { AutonomousInputs, AutonomousResults, DynamicInputs, DynamicResults, InfrastructureInputs, InfrastructureResults } from "../env/OtherPanels";
import { StationFaults, StationInputs, StationResults, StationSequence } from "../env/StationPanels";
import ui from "../twin.module.css";

const Scene = dynamic(() => import("../three/Scene"), { ssr: false, loading: () => null });

const VIEWS_BY_ENV: Record<EnvironmentId, ViewModeId[]> = {
  station: ["cinematic", "engineering", "xray", "cutaway", "exploded", "field", "energy", "thermal", "iot"],
  dynamic: ["cinematic", "cutaway", "xray"],
  autonomous: ["cinematic", "xray"],
  infrastructure: ["cinematic"],
};

function Playback() {
  const playing = useTwin((s) => s.playing);
  const speed = useTwin((s) => s.speed);
  const env = useTwin((s) => s.environment);
  const mode = useTwin((s) => s.mode);
  const set = useTwin((s) => s.set);
  const read = useCallback(() => (env === "station" ? runtime.station.state.t : env === "dynamic" ? runtime.road.state.t : env === "autonomous" ? runtime.parking.state.t : useTwin.getState().gridHour * 3600), [env]);
  const t = useSampled(read, 5);
  return (
    <div className={ui.playback} role="group" aria-label="Simulation playback">
      <button type="button" onClick={() => set({ playing: !playing })} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
      </button>
      <button type="button" onClick={() => singleStep()} disabled={playing} aria-label="Single step">
        <StepForward size={16} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => resetEnvironment(env)} aria-label="Reset">
        <RotateCcw size={16} aria-hidden="true" />
      </button>
      <label className={ui.speed}>
        <span>Speed</span>
        <select value={speed} onChange={(e) => set({ speed: Number(e.target.value) })}>
          {SPEEDS.map((s) => (
            <option key={s} value={s}>{`${s}×`}</option>
          ))}
        </select>
      </label>
      <FullscreenIcon />
      <span className={ui.clock}>{env === "infrastructure" ? `${String(Math.floor(t / 3600)).padStart(2, "0")}:${String(Math.floor((t % 3600) / 60)).padStart(2, "0")}` : `t = ${fmt(t, 1)} s`}</span>
      <AtDepth mode={mode} min="research">
        <span className={ui.clock}>{env === "station" ? `Δt ${stationStep(speed) * 1000} ms` : env === "dynamic" ? "Δt 1 ms" : env === "autonomous" ? "Δt 20 ms" : "Δt 5 min"}</span>
      </AtDepth>
    </div>
  );
}

function FullscreenIcon() {
  const on = useTwin((s) => s.fullscreen !== "off");
  return (
    <button type="button" onClick={() => void toggleFullscreen()} aria-label={on ? "Exit full screen" : "Full screen"} aria-pressed={on} title={on ? "Exit full screen (F or Esc)" : "Full screen (F)"}>
      {on ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
    </button>
  );
}

function Legends() {
  const view = useTwin((s) => s.view);
  const env = useTwin((s) => s.environment);
  const read = useCallback(() => ({ b: runtime.station.state.fieldCentre, on: Boolean(runtime.station.state.point.ss), phase: runtime.station.state.phase, p: runtime.station.state.point }), []);
  const s = useSampled(read, 4);
  if (env !== "station") return null;
  if (view === "field")
    return (
      <div className={ui.legend}>
        <p className={ui.legendTitle}>RMS flux density · section through both pads</p>
        <span className={ui.fieldScale} aria-hidden="true" />
        <p className={ui.legendScale}>
          <span>1 µT</span>
          <span>100 µT</span>
          <span>10 mT</span>
        </p>
        <p className={ui.small}>{s.on ? `Gap centre ${fmt(s.b * 1e6, 0)} µT. Field lines at ωt = 0 (animation slowed ~10⁵×). Analytical filament model (F1), not FEM; blank cells lie outside the model's validity.` : `Pad de-energised (${PHASES[s.phase].label}): no field.`}</p>
      </div>
    );
  if (view === "thermal")
    return (
      <div className={ui.legend}>
        <p className={ui.legendTitle}>Temperature (lumped thermal nodes)</p>
        <span className={ui.thermalScale} aria-hidden="true" />
        <p className={ui.legendScale}>
          <span>ambient</span>
          <span>limit</span>
        </p>
        <p className={ui.small}>Pads 25–110 °C, inverter 25–90 °C, battery 15–55 °C. One node per component: no hot spots.</p>
      </div>
    );
  if (view === "energy")
    return (
      <div className={ui.legend}>
        <p className={ui.legendTitle}>Energy flow · dash speed and brightness follow power</p>
        <ul className={ui.flowKey}>
          <li><i style={{ background: FLOW_COLORS.ac }} />{`Grid AC ${fmt(s.p.pGrid / 1000, 2)} kW`}</li>
          <li><i style={{ background: FLOW_COLORS.hf }} />{`85 kHz drive ${fmt(s.p.pCoilIn / 1000, 2)} kW`}</li>
          <li><i style={{ background: FLOW_COLORS.magnetic }} />{`Across the gap ${fmt(s.p.pRectifierIn / 1000, 2)} kW`}</li>
          <li><i style={{ background: FLOW_COLORS.dc }} />{`To the battery ${fmt(s.p.pBattery / 1000, 2)} kW`}</li>
        </ul>
      </div>
    );
  if (view === "iot")
    return (
      <div className={ui.legend}>
        <p className={ui.legendTitle}>IoT communication</p>
        <ul className={ui.flowKey}>
          <li><i style={{ background: "#ffd166" }} />CAN (BMS → VCU)</li>
          <li><i style={{ background: "#5ee7ff" }} />Vehicle ↔ station</li>
          <li><i style={{ background: "#b388ff" }} />Station ↔ backend</li>
          <li><i style={{ background: "#4ca930" }} />Gateway → cloud</li>
        </ul>
        <p className={ui.small}>One pulse per delivered message; the IoT &amp; Data lab shows each one. Safety never depends on these links.</p>
      </div>
    );
  return null;
}

function SceneLabels() {
  const view = useTwin((s) => s.view);
  const env = useTwin((s) => s.environment);
  const read = useCallback(() => {
    const p = runtime.station.state.point;
    const step = runtime.grid.steps[Math.min(runtime.grid.steps.length - 1, Math.floor((useTwin.getState().gridHour / 24) * runtime.grid.steps.length))];
    return { p: { pGrid: p.pGrid, pCoilIn: p.pCoilIn, pRectifierIn: p.pRectifierIn, pBattery: p.pBattery }, step };
  }, []);
  const s = useSampled(read, 4);
  if (env === "station" && view === "energy")
    return (
      <>
        {[
          ["flow-grid", "Grid", s.p.pGrid],
          ["flow-hf", "Inverter → pad", s.p.pCoilIn],
          ["flow-gap", "Magnetic link", s.p.pRectifierIn],
          ["flow-dc", "Battery", s.p.pBattery],
        ].map(([id, name, p]) => (
          <span key={id as string} ref={labelRef(id as string)} className={ui.sceneLabel}>
            {`${name} · ${fmt((p as number) / 1000, 2)} kW`}
          </span>
        ))}
      </>
    );
  if (env === "station" && view === "iot")
    return (
      <>
        {["BMS", "VCU", "Station", "Gateway", "Backend", "Cloud"].map((n) => (
          <span key={n} ref={labelRef(`node-${n}`)} className={ui.sceneLabel}>
            {n === "Station" ? "Station controller" : n === "Gateway" ? "IoT gateway" : n}
          </span>
        ))}
      </>
    );
  if (env === "infrastructure" && s.step)
    return (
      <>
        {[
          ["d-grid", "Grid import", s.step.gridImport],
          ["d-pv", "Solar", s.step.pvUsed],
          ["d-bess", s.step.bessDischarge >= s.step.bessCharge ? "Storage discharging" : "Storage charging", Math.abs(s.step.bessDischarge - s.step.bessCharge)],
          ["d-road", "Electrified road", s.step.roadServed],
          ["d-city", "Buildings", s.step.baseLoad],
        ].map(([id, name, p]) => (
          <span key={id as string} ref={labelRef(id as string)} className={ui.sceneLabel}>
            {`${name} · ${fmt(p as number, 0)} kW`}
          </span>
        ))}
      </>
    );
  return null;
}

function HoverLabel() {
  const hovered = useTwin((s) => s.hovered);
  const c = hovered ? componentById(hovered) : undefined;
  if (!c) return null;
  return <p className={ui.hoverLabel}>{`${c.name} · click to inspect`}</p>;
}

/** The 2D picture for devices without WebGL: the field section from the same model. */
function Fallback() {
  const st = useTwin((s) => s.station);
  const read = useCallback(() => {
    const ss = runtime.station.state.point.ss;
    return ss ? { i1: { ...ss.i1 }, i2: { ...ss.i2 } } : null;
  }, []);
  const currents = useSampled(read, 1);
  const config = useMemo(() => ({ tx: { ...DEFAULT_TX_PAD, turns: st.txTurns }, rx: { ...DEFAULT_RX_PAD, turns: st.rxTurns }, airGap: st.airGap, lateral: st.lateral, longitudinal: st.longitudinal }), [st.txTurns, st.rxTurns, st.airGap, st.lateral, st.longitudinal]);
  return (
    <div className={ui.fallback}>
      <p className={ui.eyebrow}>3D view unavailable on this device</p>
      <p>The simulation, panels and laboratories work fully. This is the field between the pads from the same model.</p>
      <FieldMap2D config={config} currents={currents} label="RMS flux density between the transmitter and receiver pads" />
    </div>
  );
}

export default function TwinSection({ webgl, quality }: { webgl: boolean; quality: QualitySettings | null }) {
  const env = useTwin((s) => s.environment);
  const view = useTwin((s) => s.view);
  const mode = useTwin((s) => s.mode);
  const set = useTwin((s) => s.set);
  const introActive = useTwin((s) => s.intro.active);
  const selected = useTwin((s) => s.selected);
  const ready = useTwin((s) => s.sceneReady);
  const views = VIEWS_BY_ENV[env];
  const meta = ENVIRONMENTS.find((e) => e.id === env)!;
  const Inputs = env === "station" ? StationInputs : env === "dynamic" ? DynamicInputs : env === "autonomous" ? AutonomousInputs : InfrastructureInputs;
  const Results = env === "station" ? StationResults : env === "dynamic" ? DynamicResults : env === "autonomous" ? AutonomousResults : InfrastructureResults;
  return (
    <div className={ui.twin} data-intro={introActive || undefined} data-mode={mode}>
      <div className={ui.stage} data-ready={ready || !webgl || undefined}>
        {webgl && quality ? <Scene quality={quality} label={`Interactive 3D digital twin: ${meta.name}. ${meta.text}`} /> : <Fallback />}
        {webgl && (
          <div className={ui.labels} aria-hidden="true">
            <SceneLabels />
          </div>
        )}
        {webgl && !ready && (
          <div className={ui.loading} role="status">
            <p>Initialising digital twin</p>
            <i />
          </div>
        )}
        <IntroOverlay />
        {!introActive && (
          <>
            <div className={ui.stageTop}>
              <Segmented
                label="Environment"
                value={env}
                options={ENVIRONMENTS.map((e) => ({ id: e.id, label: `${e.number} ${e.short}` }))}
                onChange={(v) => {
                  set({ environment: v, view: VIEWS_BY_ENV[v].includes(view) ? view : "cinematic", selected: null });
                  if (v === "autonomous" && runtime.parking.state.phase === "parked") resetEnvironment("autonomous");
                }}
              />
            </div>
            <div className={ui.stageCaption}>
              <p className={ui.eyebrow}>{`${meta.number} · Digital Twin`}</p>
              <h2>{meta.name}</h2>
              <AtDepth mode={mode} min="learn">
                <p>{meta.text}</p>
              </AtDepth>
            </div>
            {webgl && <Legends />}
            {webgl && <HoverLabel />}
            {webgl && views.length > 1 && (
              <div className={ui.views}>
                <Video size={14} aria-hidden="true" />
                <Segmented small label="Visualisation" value={view} options={VIEW_MODES.filter((v) => views.includes(v.id)).map((v) => ({ id: v.id, label: v.label }))} onChange={(v) => set({ view: v })} />
              </div>
            )}
            <Playback />
          </>
        )}
      </div>
      {!introActive && (
        <div className={ui.panels}>
          <div className={ui.panelCol}>
            <Inputs />
            {env === "station" && (
              <AtDepth mode={mode} min="engineer">
                <StationFaults />
              </AtDepth>
            )}
          </div>
          <div className={ui.panelCol}>
            {selected && <Inspector />}
            {env === "station" && <StationSequence />}
            <Results />
          </div>
        </div>
      )}
    </div>
  );
}
