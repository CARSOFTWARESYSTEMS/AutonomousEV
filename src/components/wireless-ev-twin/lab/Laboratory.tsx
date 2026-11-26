"use client";
// The immersive laboratory: the 3D scene fills it. A compact environment rail
// on the left, the stage card and instruments over the scene, a drawer with
// the environment's inputs (Engineer and Research), the inspector on the
// right only when it is wanted, and the cinematic timeline at the bottom.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BatteryCharging, Building2, Drone, Navigation, PlaneTakeoff, Route, SlidersHorizontal, SquareParking, X, Zap } from "lucide-react";
import { componentById } from "@/lib/wireless-charging/components";
import { ENVIRONMENTS, PLANNED_ENVIRONMENTS, PROPOSED_ENVIRONMENTS, type EnvironmentId, VIEW_MODES } from "@/lib/wireless-charging/content";
import { DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { energyWindow, segmentM } from "@/lib/wireless-charging/dynamic";
import type { QualitySettings } from "../../satellite-explorer/lib/capabilities";
import { runtime, useSampled } from "../state/runtime";
import { type QualityChoice, useTwin } from "../state/store";
import { enterStage, openEnvironment } from "../story/guide";
import { chapterOf, DEMO_CHAPTERS, stagesFor } from "../story/stages";
import type { RenderSettings } from "../three/Scene";
import { labelRef } from "../three/labels";
import { FLOW_COLORS } from "../three/flowColors";
import { LAYERS } from "../three/road/layout";
import { LOOK_COLORS, type SegmentLook } from "../three/road/segmentLook";
import { AtDepth, fmt, Tag } from "../ui/controls";
import FieldMap2D from "../ui/FieldMap2D";
import InspectorPanel from "./Inspector";
import { FieldLegend } from "./FieldLegend";
import { ChargingHud } from "./ChargingHud";
import { RoadAnatomy } from "./RoadAnatomy";
import { IotInspector } from "./IotInspector";
import { METRICS, type MetricId } from "./metrics";
import Timeline from "./Timeline";
import ui from "../twin.module.css";
import lab from "./lab.module.css";

const Scene = dynamic(() => import("../three/Scene"), { ssr: false, loading: () => null });

const ICONS: Record<string, typeof Zap> = { parking: SquareParking, station: Zap, dynamic: Route, autonomous: Navigation, infrastructure: Building2, drone: Drone, airtaxi: PlaneTakeoff, bess: BatteryCharging };
/** Instruments shown when no guided stage is selecting them. */
const DEFAULT_METRICS: Record<EnvironmentId, MetricId[]> = {
  station: ["phase", "pBattery", "airGap", "k", "soc"],
  dynamic: ["roadSpeed", "pReceived", "pTraction", "roadNetPower", "roadRegime"],
  autonomous: ["parkPhase", "parkError", "parkSigma"],
  infrastructure: ["hour", "gridImport", "pvUsed", "bessPower"],
};

/** Render settings from the chosen quality and the device's measured capability. */
export function renderSettings(choice: QualityChoice, device: QualitySettings): RenderSettings {
  const dpr = typeof window === "undefined" ? 1 : Math.max(1, window.devicePixelRatio || 1);
  const tier = choice === "auto" ? (device.tier === "high" ? "high" : device.tier === "medium" ? "balanced" : "performance") : choice;
  if (tier === "high") return { dpr: Math.min(dpr, 1.75), shadows: true, shadowMapSize: 2048, postprocessing: true, adaptive: choice === "auto" };
  if (tier === "balanced") return { dpr: Math.min(dpr, 1.35), shadows: true, shadowMapSize: 1024, postprocessing: true, adaptive: choice === "auto" };
  return { dpr: 1, shadows: false, shadowMapSize: 512, postprocessing: false, adaptive: false };
}

function Rail() {
  const env = useTwin((s) => s.environment);
  const mode = useTwin((s) => s.mode);
  const panel = useTwin((s) => s.panel);
  const preview = useTwin((s) => s.preview);
  return (
    <nav className={lab.rail} aria-label="Research environments">
      <ul>
        {PLANNED_ENVIRONMENTS.map((e) => {
          const Icon = ICONS[e.id];
          return (
            <li key={e.id}>
              <button type="button" disabled aria-describedby={`planned-${e.id}`} title={`${e.number} ${e.name} — ${e.status}`}>
                <Icon size={18} aria-hidden="true" />
                <span className={lab.railNum}>{e.number}</span>
                <span className={lab.railLabel}>{e.short}</span>
                <span id={`planned-${e.id}`} className={lab.railBadge}>
                  Planned
                </span>
              </button>
            </li>
          );
        })}
        {ENVIRONMENTS.map((e) => {
          const Icon = ICONS[e.id];
          return (
            <li key={e.id}>
              <button type="button" aria-current={env === e.id ? "true" : undefined} onClick={() => env !== e.id && openEnvironment(e.id)} title={`${e.number} ${e.name}`}>
                <Icon size={18} aria-hidden="true" />
                <span className={lab.railNum}>{e.number}</span>
                <span className={lab.railLabel}>{e.short}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className={lab.railGroup}>Proposed</p>
      <ul>
        {PROPOSED_ENVIRONMENTS.map((e) => {
          const Icon = ICONS[e.id];
          return (
            <li key={e.id}>
              <button type="button" data-proposed aria-pressed={preview === e.id} onClick={() => useTwin.setState({ preview: preview === e.id ? null : e.id })} title={`${e.number} ${e.name} — ${e.status}`}>
                <Icon size={18} aria-hidden="true" />
                <span className={lab.railNum}>{e.number}</span>
                <span className={lab.railLabel}>{e.short}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {mode !== "explore" && (
        <button type="button" className={lab.railTool} aria-pressed={panel === "inputs"} onClick={() => useTwin.setState({ panel: panel === "inputs" ? "none" : "inputs" })} title="Inputs and fault injection">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span className={lab.railLabel}>Inputs</span>
        </button>
      )}
    </nav>
  );
}

/** What a proposed environment would model; BESS opens where it is simulated today. */
function ProposedPreview() {
  const id = useTwin((s) => s.preview);
  const e = PROPOSED_ENVIRONMENTS.find((x) => x.id === id);
  if (!e) return null;
  return (
    <section className={lab.preview} aria-label={`${e.name}, proposed`}>
      <button type="button" className={lab.iconBtn} aria-label="Close" onClick={() => useTwin.setState({ preview: null })}>
        <X size={15} aria-hidden="true" />
      </button>
      <p className={lab.eyebrow}>{`${e.number} · ${e.status}`}</p>
      <h2 className={lab.stageTitle}>{e.name}</h2>
      <p className={lab.objective}>{e.text}</p>
      <p className={lab.previewHead}>What it would model</p>
      <ul className={lab.previewList}>
        {e.scope.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <p className={lab.previewHead}>Built on</p>
      <p className={lab.objective}>{e.reuses}</p>
      {e.id === "bess" ? (
        <button
          type="button"
          className={lab.previewAction}
          onClick={() => {
            useTwin.setState({ preview: null });
            openEnvironment("infrastructure");
          }}
        >
          Open storage in Smart Charging Infrastructure (05)
        </button>
      ) : (
        <p className={lab.small}>Not simulated: nothing in this preview is a result. It starts after the team accepts Phase 3.5 and the Smart Parking Shelter (Phase 4).</p>
      )}
    </section>
  );
}

function StageCard() {
  const g = useTwin((s) => s.guide);
  const env = useTwin((s) => s.environment);
  const view = useTwin((s) => s.view);
  const mode = useTwin((s) => s.mode);
  const demo = useTwin((s) => s.demo.active);
  const panel = useTwin((s) => s.panel);
  const meta = ENVIRONMENTS.find((e) => e.id === env)!;
  const stages = stagesFor(g.playlist);
  const stage = stages[g.index];
  if (!g.active || !stage || !g.stageId)
    return (
      <div className={lab.stageCard}>
        <p className={lab.eyebrow}>{`${meta.number} · ${meta.short}`}</p>
        <h2 className={lab.stageTitle}>{meta.name}</h2>
        <p className={lab.objective}>{`${VIEW_MODES.find((v) => v.id === view)?.label ?? ""} view${g.stageId ? " · guided sequence paused" : ""}`}</p>
      </div>
    );
  const chapter = demo ? chapterOf(g.index) : -1;
  return (
    <div className={lab.stageCard} data-demo={demo || undefined}>
      <p className={lab.eyebrow}>{demo ? `Chapter ${chapter + 1} of ${DEMO_CHAPTERS.length} · ${DEMO_CHAPTERS[chapter].title}` : `${meta.number} · ${meta.short} · Stage ${g.index + 1} of ${stages.length}`}</p>
      <h2 className={lab.stageTitle}>{stage.title}</h2>
      <p className={lab.objective}>{stage.objective}</p>
      {OUTCOME_STAGES.has(stage.id) && <WindowStatus />}
      {panel === "none" && (
        <AtDepth mode={mode} min="learn">
          <p className={lab.explanation}>{stage.explanation}</p>
        </AtDepth>
      )}
    </div>
  );
}

const OUTCOME_STAGES = new Set(["gain", "neutral", "lose"]);

/** The outcome is classified only over a complete, time-weighted 200 m window; until then the card says so. */
function WindowStatus() {
  const read = useCallback(() => {
    const w = energyWindow(runtime.road.state.samples);
    return { complete: w.complete, travelled: Math.round(Math.min(200, w.travelled)), mean: w.mean };
  }, []);
  const w = useSampled(read, 4);
  return (
    <p className={lab.windowStatus} data-complete={w.complete || undefined} role="status">
      {w.complete ? `Classified over the last 200 m (time-weighted mean, ±500 W neutral band).` : `Collecting a complete 200 m measurement window. ${w.travelled} m of 200 m.`}
    </p>
  );
}

function Instruments() {
  const env = useTwin((s) => s.environment);
  const g = useTwin((s) => s.guide);
  const mode = useTwin((s) => s.mode);
  const stage = g.active && g.stageId ? stagesFor(g.playlist)[g.index] : null;
  const panel = useTwin((s) => s.panel);
  const ids = useMemo(() => {
    const list = stage && stage.env === env ? stage.metrics : DEFAULT_METRICS[env];
    // Four readings beside an open panel (or in Explore); the rest are in the Data tab.
    return mode === "explore" || panel !== "none" ? list.slice(0, 4) : list;
  }, [stage, env, mode, panel]);
  const read = useCallback(
    () =>
      ids.map((id) => {
        const r: { value: string; unit?: string } = METRICS[id].read();
        return { id, value: r.value, unit: r.unit };
      }),
    [ids],
  );
  const values = useSampled(read, 4);
  return (
    <dl className={lab.instruments} aria-label="Instruments" aria-live="off">
      {values.map((v) => {
        const m = METRICS[v.id];
        return (
          <div key={v.id}>
            <dt>{m.label}</dt>
            <dd>
              {v.value}
              {v.unit && <span>{` ${v.unit}`}</span>}
            </dd>
            <dd className={lab.source}>
              <Tag kind={m.kind === "INPUT" ? "input" : m.kind === "CALCULATED" ? "calculated" : "SIMULATED"} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Caption() {
  const captions = useTwin((s) => s.captions);
  const g = useTwin((s) => s.guide);
  const stage = g.active && g.stageId ? stagesFor(g.playlist)[g.index] : null;
  if (!captions || !stage) return null;
  return (
    <p className={lab.caption} aria-live="polite">
      {stage.narration}
    </p>
  );
}

function Legends() {
  const view = useTwin((s) => s.view);
  const env = useTwin((s) => s.environment);
  const read = useCallback(() => ({ b: runtime.station.state.fieldCentre, on: Boolean(runtime.station.state.point.ss), phase: runtime.station.state.phase, p: runtime.station.state.point }), []);
  const s = useSampled(read, 4);
  if (env === "dynamic") return view === "field" ? <FieldLegend env="dynamic" /> : view === "cinematic" || view === "energy" ? <ChargingHud /> : view === "cutaway" ? <RoadAnatomy /> : <RoadLegend view={view} />;
  if (env !== "station") return null;
  if (view === "field") return <FieldLegend env="station" />;
  if (view === "thermal")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Temperature (lumped thermal nodes)</p>
        <span className={ui.thermalScale} aria-hidden="true" />
        <p className={ui.legendScale}>
          <span>ambient</span>
          <span>limit</span>
        </p>
        <p className={ui.small}>One uniform colour per component: the model has no spatial hot spots.</p>
      </div>
    );
  if (view === "energy")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Energy flow · speed and brightness follow the calculated power</p>
        <ul className={ui.flowKey}>
          <li><i style={{ background: FLOW_COLORS.ac }} />{`Grid AC ${fmt(s.p.pGrid / 1000, 2)} kW`}</li>
          <li><i style={{ background: FLOW_COLORS.hf }} />{`85 kHz drive ${fmt(s.p.pCoilIn / 1000, 2)} kW`}</li>
          <li><i style={{ background: FLOW_COLORS.magnetic }} />{`Across the gap ${fmt(s.p.pRectifierIn / 1000, 2)} kW`}</li>
          <li><i style={{ background: FLOW_COLORS.dc }} />{`To the battery ${fmt(s.p.pBattery / 1000, 2)} kW`}</li>
        </ul>
      </div>
    );
  if (view === "iot") return <IotInspector />;
  return null;
}

/** Legend for the road views that colour the pads: their state from the segment controller. (The coupling chart labels itself.) */
function RoadLegend({ view }: { view: string }) {
  if (view === "segments" || view === "cutaway" || view === "receiver")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Road pads · state from the segment controller</p>
        <ul className={ui.flowKey}>
          {(Object.keys(LOOK_COLORS) as SegmentLook[]).map((k) => (
            <li key={k}>
              <i style={{ background: LOOK_COLORS[k] }} />
              {LOOK_TEXT[k]}
            </li>
          ))}
        </ul>
        {view === "segments" && <p className={ui.small}>Green band: pads under the body, where the interlock allows energising. Brackets: the request window around the receiver.</p>}
      </div>
    );
  return null;
}

const LOOK_TEXT: Record<SegmentLook, string> = {
  off: "Off",
  energising: "Energising (soft start)",
  active: "Active",
  "de-energising": "De-energising",
  blocked: "Requested, blocked by the interlock",
  failed: "Failed controller",
};

function SceneLabels() {
  const view = useTwin((s) => s.view);
  const env = useTwin((s) => s.environment);
  const read = useCallback(() => {
    const st = runtime.station.state;
    const p = st.point;
    const step = runtime.grid.steps[Math.min(runtime.grid.steps.length - 1, Math.floor((useTwin.getState().gridHour / 24) * runtime.grid.steps.length))];
    const inp = useTwin.getState().station;
    const r = useTwin.getState().road;
    return { p: { pGrid: p.pGrid, pCoilIn: p.pCoilIn, pRectifierIn: p.pRectifierIn, pBattery: p.pBattery }, vc1: p.ss?.vC1 ?? 0, step, k: st.coupler.k, M: st.coupler.M, inp: { lat: inp.lateral, long: inp.longitudinal, gap: inp.airGap }, road: { mPeak: segmentM(runtime.road, Math.abs(r.lateral)), rating: Math.max(5000, r.receiverRating) } };
  }, []);
  const s = useSampled(read, 4);
  if (env === "station" && view === "energy")
    return (
      <>
        {([
          ["flow-grid", "Grid", s.p.pGrid],
          ["flow-hf", "Inverter → pad", s.p.pCoilIn],
          ["flow-gap", "Magnetic link", s.p.pRectifierIn],
          ["flow-dc", "Battery", s.p.pBattery],
        ] as const).map(([id, name, p]) => (
          <span key={id} ref={labelRef(id)} className={ui.sceneLabel}>
            {`${name} · ${fmt(p / 1000, 2)} kW`}
          </span>
        ))}
      </>
    );
  if (env === "station" && view === "engineering")
    return (
      <>
        <span ref={labelRef("align-long")} className={ui.sceneLabel}>{`Longitudinal ${fmt(s.inp.long * 1000, 0)} mm`}</span>
        <span ref={labelRef("align-lat")} className={ui.sceneLabel}>{`Lateral ${fmt(s.inp.lat * 1000, 0)} mm`}</span>
        <span ref={labelRef("align-gap")} className={ui.sceneLabel}>{`Air gap ${fmt(s.inp.gap * 1000, 0)} mm`}</span>
        <span ref={labelRef("align-k")} className={ui.sceneLabel}>{`k = ${fmt(s.k, 3)} · M = ${fmt(s.M * 1e6, 2)} µH`}</span>
      </>
    );
  if (env === "station" && view === "power")
    return (
      <>
        <span ref={labelRef("cab-prot")} className={ui.sceneLabel}>AC protection</span>
        <span ref={labelRef("cab-pfc")} className={ui.sceneLabel}>{`PFC stage · ${fmt(s.p.pGrid / 1000, 2)} kW in`}</span>
        <span ref={labelRef("cab-dc")} className={ui.sceneLabel}>DC link and busbar</span>
        <span ref={labelRef("cab-inv")} className={ui.sceneLabel}>{`SiC inverter · ${fmt(s.p.pCoilIn / 1000, 2)} kW out`}</span>
        <span ref={labelRef("cab-c1")} className={ui.sceneLabel}>{`C₁ bank · ${fmt(s.vc1, 0)} V`}</span>
        <span ref={labelRef("cab-ctrl")} className={ui.sceneLabel}>Controllers and gateway</span>
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
  if (env === "dynamic" && (view === "cutaway" || view === "receiver"))
    return (
      <>
        {LAYERS.map((l) => (
          <span key={l.id} ref={labelRef(`cut-${l.id}`)} className={ui.sceneLabel}>
            {l.name}
          </span>
        ))}
        <span ref={labelRef("cut-ducts")} className={ui.sceneLabel}>Duct bank: power and communication</span>
        <span ref={labelRef("cut-module")} className={ui.sceneLabel}>Pad module: winding over ferrite under a resin cover</span>
      </>
    );
  if (env === "dynamic" && view === "segments")
    return (
      <>
        <span ref={labelRef("seg-band")} className={ui.sceneLabel}>Interlock zone (under the body)</span>
        <span ref={labelRef("seg-window")} className={ui.sceneLabel}>Request window</span>
      </>
    );
  if (env === "dynamic" && view === "coupling")
    return (
      <>
        <span ref={labelRef("chart-m")} className={ui.sceneLabel}>
          <i className={lab.swatch} style={{ background: "#7fe7ff" }} />
          {`Mutual inductance the receiver saw, 0 – ${fmt(s.road.mPeak * 1e6, 1)} µH`}
        </span>
        <span ref={labelRef("chart-p")} className={ui.sceneLabel}>
          <i className={lab.swatch} style={{ background: "#f5b041" }} />
          {`Power it received, 0 – ${fmt(s.road.rating / 1000, 0)} kW`}
        </span>
        <span ref={labelRef("chart-ahead")} className={ui.sceneLabel}>
          <i className={lab.swatch} style={{ background: "rgba(90,209,255,0.5)" }} />
          Coupling the road offers ahead, if each pad energises on time
        </span>
        <span ref={labelRef("chart-rx")} className={ui.sceneLabel}>Receiver</span>
      </>
    );
  if (env === "infrastructure" && s.step)
    return (
      <>
        {([
          ["d-grid", "Grid import", s.step.gridImport],
          ["d-pv", "Solar", s.step.pvUsed],
          ["d-bess", s.step.bessDischarge >= s.step.bessCharge ? "Storage discharging" : "Storage charging", Math.abs(s.step.bessDischarge - s.step.bessCharge)],
          ["d-road", "Electrified road", s.step.roadServed],
          ["d-city", "Buildings", s.step.baseLoad],
        ] as const).map(([id, name, p]) => (
          <span key={id} ref={labelRef(id)} className={ui.sceneLabel}>
            {`${name} · ${fmt(p, 0)} kW`}
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
  return <p className={lab.hover}>{`${c.name} · select to inspect`}</p>;
}

/** Shown without WebGL (or after a lost context): the field section from the same model. */
function Fallback({ lost }: { lost: boolean }) {
  const st = useTwin((s) => s.station);
  const read = useCallback(() => {
    const ss = runtime.station.state.point.ss;
    return ss ? { i1: { ...ss.i1 }, i2: { ...ss.i2 } } : null;
  }, []);
  const currents = useSampled(read, 1);
  const config = useMemo(() => ({ tx: { ...DEFAULT_TX_PAD, turns: st.txTurns }, rx: { ...DEFAULT_RX_PAD, turns: st.rxTurns }, airGap: st.airGap, lateral: st.lateral, longitudinal: st.longitudinal }), [st.txTurns, st.rxTurns, st.airGap, st.lateral, st.longitudinal]);
  return (
    <div className={`${ui.fallback} ${lab.fallback}`}>
      <p className={ui.eyebrow}>{lost ? "The 3D view stopped on this device" : "3D view unavailable on this device"}</p>
      <p>{lost ? "The graphics context was lost and did not recover. The simulation keeps running; reload the page to try the 3D view again." : "This browser did not provide WebGL. The simulation, panels and laboratories work fully."} This is the field between the pads from the same model.</p>
      <FieldMap2D config={config} currents={currents} label="RMS flux density between the transmitter and receiver pads" />
    </div>
  );
}

export interface Capabilities {
  webgl: boolean;
  quality: QualitySettings | null;
}

export default function Laboratory({ caps }: { caps: Capabilities | null }) {
  const env = useTwin((s) => s.environment);
  const panel = useTwin((s) => s.panel);
  const demo = useTwin((s) => s.demo.active);
  const ready = useTwin((s) => s.sceneReady);
  const lost = useTwin((s) => s.contextLost);
  const choice = useTwin((s) => s.quality);
  const mode = useTwin((s) => s.mode);
  const shell = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const meta = ENVIRONMENTS.find((e) => e.id === env)!;
  const settings = useMemo(() => (caps?.quality ? renderSettings(choice, caps.quality) : null), [caps, choice]);

  // Render only while the laboratory is on screen; the first time it is, start the guided sequence.
  useEffect(() => {
    const el = shell.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        const s = useTwin.getState();
        if (entry.intersectionRatio > 0.3 && !s.guide.stageId && !s.demo.active) enterStage(s.environment, 0, { auto: s.mode === "explore" });
      },
      { threshold: [0, 0.3] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const three = Boolean(caps?.webgl && settings && !lost);
  return (
    <div ref={shell} className={lab.shell} data-panel={panel !== "none" || undefined} data-demo={demo || undefined} data-mode={mode}>
      {!demo && <Rail />}
      <div className={lab.viewport} data-ready={ready || !three || undefined}>
        {caps === null ? (
          <div className={lab.preparing} role="status">
            <p>Preparing the 3D laboratory</p>
            <i />
          </div>
        ) : three && settings ? (
          <Scene settings={settings} active={visible} label={`Interactive 3D digital twin: ${meta.name}. ${meta.text}`} />
        ) : (
          <Fallback lost={lost} />
        )}
        {three && (
          <div className={ui.labels} aria-hidden="true">
            <SceneLabels />
          </div>
        )}
        {three && !ready && (
          <div className={lab.preparing} role="status">
            <p>Initialising the digital twin</p>
            <i />
          </div>
        )}
        <StageCard />
        <Instruments />
        <ProposedPreview />
        {three && <Legends />}
        {three && <HoverLabel />}
        <Caption />
        <Timeline />
      </div>
      {!demo && <InspectorPanel />}
    </div>
  );
}
