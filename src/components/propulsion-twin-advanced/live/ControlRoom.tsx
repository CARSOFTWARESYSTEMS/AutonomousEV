"use client";
// The Digital Twin control room: the simulated engine and its twin, running.
// Status across the top, the monitored quantities in their four twin states,
// and below them the fault lab: inject a fault and follow it from its physical
// effect to a recommended engineering investigation.
import { GitCompare, Pause, Play, Power, RotateCcw, SkipForward } from "lucide-react";
import { VALUE_NOTE } from "../data/product";
import { useLabStore } from "../state/labStore";
import { useTwin } from "../state/useTwin";
import { ChamberChart, ChannelChart, DeltaChart, Diagnosis, FaultPicker } from "./shared";
import css from "../advancedTwin.module.css";

const THROTTLES = [100, 80, 60] as const;

export default function ControlRoom() {
  const { snapshot } = useTwin();
  const running = useLabStore((s) => s.running);
  const speed = useLabStore((s) => s.speed);
  const compare = useLabStore((s) => s.compare);
  const exercise = useLabStore((s) => s.engine?.exercise ?? false);
  const { setRunning, setSpeed, toggleCompare, step, resetSimulation, setThrottle, setExercise, startEngine, shutdownEngine } = useLabStore.getState();

  if (!snapshot) {
    return (
      <p className={css.loading} role="status">
        Calibrating the twin: identifying parameters and training its models on simulated data…
      </p>
    );
  }

  const { status } = snapshot;
  const stopped = snapshot.mode === "ready";
  const tiles = [
    { label: "ENGINE STATE", value: status.engine, detail: `Throttle ${Math.round(snapshot.throttle * 100)} %` },
    { label: "TWIN STATE", value: status.twin, detail: snapshot.transientFactor > 1.5 ? `Uncertainty ×${snapshot.transientFactor.toFixed(1)}` : `t = ${snapshot.t.toFixed(0)} s` },
    { label: "DATA QUALITY", value: status.dataQuality, detail: `${Math.round(snapshot.quality.nodes[0]?.latencyMs ?? 0)} ms latency`, level: status.dataQuality === "GOOD" ? "ok" : status.dataQuality === "BAD" ? "bad" : "warn" },
    { label: "MODEL CONFIDENCE", value: status.modelConfidence, detail: snapshot.monitoring ? "Inside calibrated envelope" : "Health checks held", level: status.modelConfidence === "HIGH" ? "ok" : status.modelConfidence === "LOW" ? "bad" : "warn" },
    { label: "HEALTH", value: status.health, detail: `Index ${Math.round(snapshot.prognosis.healthIndex)}`, level: status.health === "NOMINAL" ? "ok" : status.health === "ACTION" ? "bad" : "warn" },
    { label: "ANOMALIES", value: String(status.anomalies), detail: snapshot.anomaly ? "Anomaly declared" : "None declared", level: snapshot.anomaly ? "bad" : status.anomalies ? "warn" : "ok" },
  ];
  const mark = { ok: "●", warn: "▲", bad: "◆" } as const;
  const chooseThrottle = (level: number) => {
    setExercise(false);
    setThrottle(level / 100);
  };

  return (
    <div className={css.controlRoom}>
      <ul className={css.tiles} aria-label="Status">
        {tiles.map((tile) => (
          <li key={tile.label} className={css.tile} data-level={tile.level}>
            <span className={css.tileLabel}>{tile.label}</span>
            <span className={css.tileValue}>
              {tile.level && <span aria-hidden="true">{mark[tile.level as keyof typeof mark]} </span>}
              {tile.value}
            </span>
            <span className={css.tileDetail}>{tile.detail}</span>
          </li>
        ))}
      </ul>

      <div className={css.toolbar} role="toolbar" aria-label="Simulation controls">
        <button type="button" className={running ? css.ghost : css.primary} onClick={() => setRunning(!running)} aria-pressed={running}>
          {running ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />} {running ? "Pause" : "Live simulation"}
        </button>
        {!running && (
          <button type="button" className={css.ghost} onClick={step}>
            <SkipForward size={14} aria-hidden="true" /> Step 0.5 s
          </button>
        )}
        <button type="button" className={css.ghost} onClick={resetSimulation}>
          <RotateCcw size={14} aria-hidden="true" /> Reset
        </button>
        <button type="button" className={css.ghost} aria-pressed={compare} onClick={toggleCompare}>
          <GitCompare size={14} aria-hidden="true" /> Compare
        </button>
        <span className={css.segment} role="group" aria-label="Throttle">
          {THROTTLES.map((level) => (
            <button key={level} type="button" aria-pressed={Math.abs(snapshot.throttle * 100 - level) < 1 && !exercise} disabled={stopped} onClick={() => chooseThrottle(level)}>
              {level} %
            </button>
          ))}
          <button type="button" aria-pressed={exercise} disabled={stopped} onClick={() => setExercise(!exercise)}>
            Step throttle
          </button>
        </span>
        <span className={css.segment} role="group" aria-label="Simulation speed">
          {([1, 4] as const).map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>
              {s}×
            </button>
          ))}
        </span>
        <button type="button" className={css.ghost} onClick={stopped ? startEngine : shutdownEngine} disabled={snapshot.mode === "start" || snapshot.mode === "shutdown"}>
          <Power size={14} aria-hidden="true" /> {stopped ? "Start engine" : "Shut down"}
        </button>
      </div>
      <p className={css.note}>
        {compare ? "Compare: observed, estimated and expected on every chart." : "Observed against expected. Compare adds the estimated state."} {VALUE_NOTE}
      </p>

      <div className={css.charts} role="group" aria-label="Monitored quantities" tabIndex={0}>
        <ChamberChart all />
        <ChannelChart channel="pOutOx" title="Pump Discharge Pressure" all={compare} />
        <ChannelChart channel="pInOx" title="Pump Inlet Pressure" all={compare} minRange={0.6} />
        <DeltaChart high="pInjOx" low="pcA" title="Injector ΔP" all={compare} />
        <DeltaChart high="pCoolIn" low="pCoolOut" title="Cooling ΔP" all={compare} />
        <ChannelChart channel="speed" title="Shaft Speed" all={compare} />
        <ChannelChart channel="tCool" title="Temperature · coolant rise" all={compare} />
        <ChannelChart channel="vib" title="Vibration" all={compare} minRange={20} />
      </div>

      <div className={css.lab}>
        <section className={css.labCol} aria-label="Fault injection">
          <h3 className={css.h3}>Fault Injection Lab</h3>
          <FaultPicker />
        </section>

        <section className={css.labCol} aria-label="Fault propagation">
          <h3 className={css.h3}>From physical effect to investigation</h3>
          <ol className={css.causal}>
            {snapshot.chain.map((stage) => (
              <li key={stage.id} data-reached={stage.reached}>
                <span className={css.causalLabel}>
                  <span aria-hidden="true">{stage.reached ? "■" : "□"}</span> {stage.label}
                  <span className={css.srOnly}>{stage.reached ? " (reached)" : " (not reached)"}</span>
                </span>
                <span className={css.causalText}>{stage.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={css.labCol} aria-label="Diagnosis">
          <h3 className={css.h3}>Diagnosis</h3>
          <Diagnosis snapshot={snapshot} />
        </section>

        <section className={css.labCol} aria-label="Fault history">
          <h3 className={css.h3}>Fault history</h3>
          {snapshot.events.length ? (
            <ol className={css.events} reversed>
              {[...snapshot.events].reverse().map((event, i) => (
                <li key={`${event.t}-${i}`} data-kind={event.kind}>
                  <time>{event.t.toFixed(1)} s</time>
                  <span className={css.tag}>{event.kind.toUpperCase()}</span>
                  {event.text}
                </li>
              ))}
            </ol>
          ) : (
            <p className={css.hint}>Nothing has happened yet. Injections, detections, isolations and sensor votes are recorded here in order.</p>
          )}
        </section>
      </div>
    </div>
  );
}
