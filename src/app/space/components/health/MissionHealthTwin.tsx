"use client";
// The Mission Health Digital Twin on /space: the six-stage loop as a
// connected set of tabs, driving a 3D CubeSat (the subsystems each stage
// involves glow, with simulated telemetry on them) and a voltage chart,
// through one illustrative power anomaly. Every stage's text is in the
// server-rendered HTML; inactive stages are hidden, not absent.
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { Spin } from "../showcase/spin";
import { usePresence, useReducedMotion, useStageQuality } from "../showcase/useStage";
import { CubeSatPoster } from "../showcase/posters";
import HealthChart from "./HealthChart";
import {
  BATTERY, CRITERIA, DETECTION, ECLIPSE_MIN, ENERGY_ABOVE_CUTOFF_WH, LOAD_W, ORBIT_MIN, SAFE_MIN_V, SAFE_REMAINING_WH, STAGES, TELEMETRY,
  eclipseEnergyWh, minutesToCutoff, type PartId, type StageId, type Telemetry,
} from "./scenario";
import styles from "./health.module.css";

const HealthTwinCanvas = dynamic(() => import("./HealthTwinCanvas"), { ssr: false });

const f1 = (v: number) => v.toFixed(1);
const f2 = (v: number) => v.toFixed(2);

/** Subsystems a visitor can inspect at any stage. */
const SUBSYSTEMS: { id: string; label: string; parts: PartId[]; chip: (t: Telemetry) => { part: PartId; text: string }; rows: (t: Telemetry) => [string, string][]; note?: string }[] = [
  {
    id: "eps",
    label: "Power (EPS)",
    parts: ["eps", "battery", "panels"],
    chip: (t) => ({ part: "eps", text: `Pack ${f2(t.busV)} V · load ${f1(t.loadW)} W` }),
    rows: (t) => [["Battery pack (unregulated bus)", `${f2(t.busV)} V`], ["Cells 1 / 2", `${f2(t.cell1V)} / ${f2(t.cell2V)} V`], ["Regulated rails", "3.3 V and 5 V, steady"], ["Solar array", `${f1(t.arrayA)} A`], ["Load", `${f1(t.loadW)} W`]],
  },
  { id: "obc", label: "Computer (OBC)", parts: ["obc"], chip: (t) => ({ part: "obc", text: t.obc }), rows: (t) => [["Status", t.obc]] },
  {
    id: "thermal",
    label: "Thermal",
    parts: ["battery"],
    chip: (t) => ({ part: "battery", text: `Battery ${t.batteryTempC} °C` }),
    rows: (t) => [["Battery temperature", `${t.batteryTempC} °C`], ["Limit", `${CRITERIA.maxTempC} °C`]],
    note: "A 1U CubeSat's thermal control is mostly passive (surface finishes), with temperature sensors and a heater on the battery.",
  },
  { id: "adcs", label: "Attitude (ADCS)", parts: ["adcs"], chip: (t) => ({ part: "adcs", text: t.adcs }), rows: (t) => [["Status", t.adcs]] },
  { id: "comms", label: "Comms", parts: ["radio", "antenna"], chip: (t) => ({ part: "radio", text: t.comms }), rows: (t) => [["Status", t.comms]] },
];

/** The deeper engineering behind each stage, revealed on request. */
const DETAIL: Record<StageId, ReactNode> = {
  observe: (
    <>
      <p>Telemetry is judged against what the orbit predicts. In sunlight, at this state of charge, the pack should read {DETECTION.bandV[0]}–{DETECTION.bandV[1]} V. Data is stored on board and sent down at ground-station passes, which can be hours apart, so the spacecraft has to judge its own health between them.</p>
      <p>Orbit: 500 km, one revolution every {f1(ORBIT_MIN)} minutes, up to {f1(ECLIPSE_MIN)} minutes of each in Earth&rsquo;s shadow. The battery pack (two lithium-ion cells in series) is the unregulated battery bus; the computer and radio run from regulated 3.3 V and 5 V rails, which hold steady until the pack nears its {f1(BATTERY.cutoffV)} V cut-off.</p>
    </>
  ),
  detect: (
    <>
      <p>Rule: pack voltage in sunlight below {DETECTION.bandV[0]} V for {DETECTION.persistenceSamples} consecutive one-minute samples. The persistence filter stops a single noisy reading from raising a false alarm.</p>
      <p>Detection runs as fixed, testable rules on the flight computer (thresholds and rates of change), so it can be verified before flight.</p>
    </>
  ),
  diagnose: (
    <>
      <p>This is the isolation step of fault detection, isolation and recovery: each candidate cause is checked against the evidence.</p>
      <ul>
        <li>
          <strong>Solar array degraded:</strong> ruled out: the array still delivers {f1(TELEMETRY.diagnose.arrayA)} A.
        </li>
        <li>
          <strong>Charge regulator fault:</strong> unlikely: cell 1 charges normally ({f2(TELEMETRY.diagnose.cell1V)} V).
        </li>
        <li>
          <strong>Battery cell 2 degrading:</strong> most likely: {f2(TELEMETRY.diagnose.cell1V - TELEMETRY.diagnose.cell2V)} V below cell 1 (healthy cells in series stay within a few hundredths of a volt) and the pack is {TELEMETRY.diagnose.batteryTempC} °C.
        </li>
      </ul>
    </>
  ),
  predict: (
    <>
      <p>
        Time to cut-off = energy left ÷ load = {f1(ENERGY_ABOVE_CUTOFF_WH)} Wh ÷ {f1(LOAD_W.normal)} W = {Math.round(minutesToCutoff(LOAD_W.normal))} min, shorter than the {f1(ECLIPSE_MIN)}-minute eclipse. Below {f1(BATTERY.cutoffV)} V the power board disconnects the loads: the computer resets, the payload stops, and the weak cell is pushed deeper into discharge.
      </p>
      <p>Simplification: voltage is taken to fall in proportion to the energy left; real lithium-ion curves are flatter in the middle and steeper at the ends.</p>
    </>
  ),
  recover: (
    <>
      <p>
        Safe mode is a pre-approved action, not an improvised one: payload and transmitter off, beacon on, charging slowed to spare the weak cell. Through the eclipse it uses {f1(LOAD_W.safe)} W × {f1(ECLIPSE_MIN)} min ≈ {f2(eclipseEnergyWh(LOAD_W.safe))} Wh, leaving {f2(SAFE_REMAINING_WH)} Wh above cut-off.
      </p>
      <p>At the Supervised level the recommendation, its evidence and the predicted outcome go to an operator, who approves it before it runs. It can be reversed.</p>
    </>
  ),
  verify: (
    <>
      <p>Criteria fixed before flight, checked through the next eclipse:</p>
      <ul>
        <li>
          Lowest battery pack voltage {f2(SAFE_MIN_V)} V, at least {f1(CRITERIA.minBusV)} V required: met.
        </li>
        <li>
          Battery {TELEMETRY.verify.batteryTempC} °C, at most {CRITERIA.maxTempC} °C allowed: met.
        </li>
        <li>Computer and beacon powered throughout: met.</li>
      </ul>
      <p>Returning to normal operations, for example with a shallower depth of discharge, is a decision for people on the ground.</p>
    </>
  ),
};

export default function MissionHealthTwin() {
  const [stage, setStage] = useState(0);
  const [inspect, setInspect] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [spin] = useState(() => new Spin());
  const frameRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);
  const reducedMotion = useReducedMotion();
  const quality = useStageQuality();
  const { near, onScreen } = usePresence(frameRef);

  const current = STAGES[stage];
  const telemetry = TELEMETRY[current.id];
  const sub = SUBSYSTEMS.find((s) => s.id === inspect) ?? null;
  const highlighted = sub ? sub.parts : current.parts;
  const chips = sub ? [sub.chip(telemetry)] : current.chips;
  const playing = onScreen && !paused && !reducedMotion;

  const go = (i: number, focus = false) => {
    const next = (i + STAGES.length) % STAGES.length;
    setStage(next);
    setInspect(null);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") go(stage + 1, true);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(stage - 1, true);
    else if (e.key === "Home") go(0, true);
    else if (e.key === "End") go(STAGES.length - 1, true);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (ready) drag.current = { x: e.clientX, y: e.clientY, horizontal: e.pointerType === "mouse" ? true : null };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.horizontal === null && Math.hypot(dx, dy) > 8) d.horizontal = Math.abs(dx) > Math.abs(dy);
    if (!d.horizontal) return;
    spin.add(dx * 0.008);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const endDrag = () => {
    drag.current = null;
  };

  const partNames: Record<PartId, string> = { battery: "battery", eps: "power board", panels: "solar arrays", obc: "flight computer", adcs: "attitude control", radio: "radio", antenna: "antenna" };

  return (
    <div className={styles.card}>
      <figure className={styles.viewport}>
        <div
          ref={frameRef}
          className={styles.frame}
          data-ready={ready || undefined}
          role="img"
          aria-label={`A 1U CubeSat, opened up, with its solar wings deployed. Highlighted: ${highlighted.map((p) => partNames[p]).join(", ")}. ${chips.map((c) => c.text).join(". ")}.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          <div className={styles.poster} aria-hidden="true">
            <CubeSatPoster />
          </div>
          {near && quality !== null && (
            <div className={styles.canvas} aria-hidden="true">
              <HealthTwinCanvas highlighted={highlighted} chips={chips} playing={playing} reducedMotion={reducedMotion} quality={quality} spin={spin} onReady={() => setReady(true)} />
            </div>
          )}
          <p className={styles.simTag}>Simulated telemetry · illustrative scenario</p>
        </div>
        <div className={styles.viewBar}>
          <div className={styles.subsystems} role="group" aria-label="Inspect a subsystem">
            {SUBSYSTEMS.map((s) => (
              <button key={s.id} type="button" className={styles.subBtn} aria-pressed={inspect === s.id} onClick={() => setInspect((v) => (v === s.id ? null : s.id))}>
                {s.label}
              </button>
            ))}
          </div>
          {(
            <div className={styles.tools} style={{ visibility: ready ? "visible" : "hidden" }} aria-hidden={!ready || undefined}>
              <button type="button" className={styles.tool} onClick={() => spin.reset()} aria-label="Reset the view">
                <RotateCcw size={16} aria-hidden />
              </button>
              {!reducedMotion && (
                <button type="button" className={styles.tool} aria-pressed={paused} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play the rotation" : "Pause the rotation"}>
                  {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
                </button>
              )}
            </div>
          )}
        </div>
        {sub && (
          <figcaption className={styles.inspector} aria-live="polite">
            <strong>{sub.label}</strong> at stage {stage + 1}:{" "}
            {sub.rows(telemetry)
              .map(([k, v]) => `${k} ${v}`)
              .join(" · ")}
            {sub.note && <span className={styles.inspectorNote}> {sub.note}</span>}
          </figcaption>
        )}
      </figure>

      <ol className={styles.loop} role="tablist" aria-label="The six-stage health-management loop" onKeyDown={onTabKey}>
        {STAGES.map((s, i) => (
          <li key={s.id} role="presentation">
            <button
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`health-tab-${s.id}`}
              aria-selected={stage === i}
              aria-controls={`health-panel-${s.id}`}
              tabIndex={stage === i ? 0 : -1}
              className={styles.stageBtn}
              data-done={i < stage || undefined}
              onClick={() => go(i)}
              data-track-event="space_health_stage"
              data-track-stage={s.id}
            >
              <span className={styles.stageNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.stageName}>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.panel}>
        {STAGES.map((s, i) => {
          const t = TELEMETRY[s.id];
          return (
            <div key={s.id} id={`health-panel-${s.id}`} role="tabpanel" aria-labelledby={`health-tab-${s.id}`} hidden={stage !== i} className={styles.stagePanel}>
              <p className={styles.kicker}>
                Stage {i + 1} of {STAGES.length}
              </p>
              <h3 className={styles.stageTitle}>{s.title}</h3>
              <p className={styles.short}>{s.short}</p>
              <dl className={styles.readout} aria-label="Simulated telemetry at this stage">
                <div>
                  <dt>Pack</dt>
                  <dd>{f2(t.busV)} V</dd>
                </div>
                <div>
                  <dt>Cells</dt>
                  <dd>
                    {f2(t.cell1V)} / {f2(t.cell2V)} V
                  </dd>
                </div>
                <div>
                  <dt>Battery</dt>
                  <dd>{t.batteryTempC} °C</dd>
                </div>
                <div>
                  <dt>Load</dt>
                  <dd>{f1(t.loadW)} W</dd>
                </div>
              </dl>
              {stage === i && <HealthChart stage={s.id} />}
              <details className={styles.detail}>
                <summary data-track-event="space_panel_toggle" data-track-panel={`health_${s.id}`}>
                  Engineering detail
                </summary>
                <div className={styles.detailBody}>{DETAIL[s.id]}</div>
              </details>
              <div className={styles.stepNav}>
                <button type="button" className={styles.navBtn} onClick={() => go(i - 1)} disabled={i === 0}>
                  <ArrowLeft size={16} aria-hidden /> Previous
                </button>
                <button type="button" className={styles.navBtn} onClick={() => go(i + 1)}>
                  {i === STAGES.length - 1 ? "Back to Observe" : "Next stage"} <ArrowRight size={16} aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
        <p className={styles.srOnly} aria-live="polite">
          Stage {stage + 1} of {STAGES.length}: {current.title}.
        </p>
        <p className={styles.disclaimer}>Illustrative scenario with simulated telemetry, built from stated teaching assumptions. Not data from any spacecraft, and not a validated or flight-ready autonomy system.</p>
      </div>
    </div>
  );
}
