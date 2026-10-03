"use client";
// The interactive console: seven modes over one engine. Every control calls a
// store action; the actions own the state changes and the analytics.
import type { KeyboardEvent, ReactNode } from "react";
import { ArrowRight, Play, Square } from "lucide-react";
import {
  AUDIENCE_MODES,
  CUTAWAYS,
  EXPLODED_LEVELS,
  FAULTS,
  FAULT_BY_ID,
  FLOWS,
  MODEL_CREDIBILITY,
  MODES,
  PRODUCT,
  SENSORS,
  SYSTEMS,
  SYSTEM_BY_ID,
  TEST_PHASES,
  TRACE_PATH,
  TWIN_SNAPSHOT,
} from "./data/engineReference";
import { ARCHITECTURE_LAYERS } from "./data/twinContent";
import { useTestClock } from "./state/clocks";
import { explodedLevel, useRocketTwinStore } from "./state/twinStore";
import type { ModeId } from "./types";
import styles from "./rocketTwin.module.css";

const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}`;

function BuildPanel() {
  const exploded = useRocketTwinStore((s) => explodedLevel(s.explodedAmount));
  const cutaway = useRocketTwinStore((s) => s.cutaway);
  const setExploded = useRocketTwinStore((s) => s.setExploded);
  const toggleCutaway = useRocketTwinStore((s) => s.toggleCutaway);
  const open = CUTAWAYS.find((c) => c.system === cutaway);
  return (
    <>
      <p className={styles.lead}>Take the engine apart, or open a part to see inside.</p>
      <div className={styles.group} role="group" aria-label="Exploded view">
        <p className={styles.groupLabel}>Assembly</p>
        <div className={styles.options}>
          {EXPLODED_LEVELS.map((level) => (
            <button key={level.id} type="button" className={styles.option} aria-pressed={exploded === level.id} aria-label={`Exploded view: ${level.label}`} onClick={() => setExploded(level.id)}>
              {level.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.group} role="group" aria-label="Cutaway views">
        <p className={styles.groupLabel}>Cutaway</p>
        <div className={styles.options}>
          {CUTAWAYS.map((c) => (
            <button key={c.system} type="button" className={styles.option} aria-pressed={cutaway === c.system} aria-label={c.ariaLabel} onClick={() => toggleCutaway(c.system)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      {open && <p className={styles.detail}>{open.text}</p>}
    </>
  );
}

function SystemsPanel() {
  const systemId = useRocketTwinStore((s) => s.system);
  const componentId = useRocketTwinStore((s) => s.component);
  const audience = useRocketTwinStore((s) => s.audience);
  const selectSystem = useRocketTwinStore((s) => s.selectSystem);
  const selectComponent = useRocketTwinStore((s) => s.selectComponent);
  const system = SYSTEM_BY_ID[systemId];
  const component = system.components.find((c) => c.id === componentId);
  return (
    <>
      <div className={styles.options} role="group" aria-label="Engine systems">
        {SYSTEMS.map((s) => (
          <button key={s.id} type="button" className={styles.option} aria-pressed={systemId === s.id} aria-label={`Explore ${s.label}`} onClick={() => selectSystem(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
      <div className={styles.group} role="group" aria-label={`${system.name} components`}>
        <p className={styles.groupLabel}>{system.name} · components</p>
        <div className={styles.options}>
          {system.components.map((c) => (
            <button key={c.id} type="button" className={styles.option} aria-pressed={componentId === c.id} onClick={() => selectComponent(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      {component ? (
        <div className={styles.detail}>
          <p className={styles.detailTitle}>{component.name}</p>
          <p>{audience === "engineer" ? component.engineer : component.learn}</p>
        </div>
      ) : (
        <p className={styles.hint}>Choose a component to read about it.</p>
      )}
    </>
  );
}

function FlowPanel() {
  const flowId = useRocketTwinStore((s) => s.flow);
  const selectFlow = useRocketTwinStore((s) => s.selectFlow);
  const flow = FLOWS.find((f) => f.id === flowId);
  return (
    <>
      <p className={styles.lead}>Follow what moves through the engine.</p>
      <div className={styles.options} role="group" aria-label="Flow paths">
        {FLOWS.map((f) => (
          <button key={f.id} type="button" className={styles.option} data-flow={f.id} aria-pressed={flowId === f.id} aria-label={f.ariaLabel} onClick={() => selectFlow(f.id)}>
            {f.name}
          </button>
        ))}
      </div>
      {flow ? (
        <div className={styles.detail}>
          <ol className={styles.steps}>
            {flow.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>{flow.note}</p>
        </div>
      ) : (
        <p className={styles.hint}>Choose a flow to see its path.</p>
      )}
    </>
  );
}

function ControlPanel() {
  const sensorId = useRocketTwinStore((s) => s.sensor);
  const traceSensor = useRocketTwinStore((s) => s.traceSensor);
  const sensor = SENSORS.find((s) => s.id === sensorId);
  return (
    <>
      <p className={styles.lead}>The engine controller reads these measurements. Trace one to see where it goes.</p>
      <ul className={styles.rows}>
        {SENSORS.map((s) => (
          <li key={s.id} className={styles.row}>
            <div>
              <p className={styles.rowTitle}>{s.name}</p>
              <p className={styles.rowText}>{s.use}</p>
            </div>
            <button type="button" className={styles.option} aria-pressed={sensorId === s.id} aria-label={`Trace the ${s.name.toLowerCase()} sensor`} onClick={() => traceSensor(s.id)}>
              Trace
            </button>
          </li>
        ))}
      </ul>
      {sensor && (
        <div className={styles.detail}>
          <p className={styles.detailTitle}>{sensor.name}: signal path</p>
          <ol className={styles.steps}>
            {TRACE_PATH.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}

function TestPanel() {
  const test = useRocketTwinStore((s) => s.test);
  const startTest = useRocketTwinStore((s) => s.startTest);
  const stopTest = useRocketTwinStore((s) => s.stopTest);
  const running = test.status === "running";
  const phase = TEST_PHASES[test.phase];
  const status =
    test.status === "running"
      ? `Phase ${test.phase + 1} of ${TEST_PHASES.length}: ${phase.name}`
      : test.status === "completed"
        ? "Test complete. Every phase ran."
        : test.status === "aborted"
          ? `Test stopped during ${phase.name.toLowerCase()}.`
          : "Ready to run.";
  return (
    <>
      <div className={styles.testBar}>
        {running ? (
          <button type="button" className={styles.option} onClick={stopTest}>
            <Square size={12} aria-hidden="true" /> Stop test
          </button>
        ) : (
          <button type="button" className={`${styles.option} ${styles.optionPrimary}`} onClick={startTest}>
            <Play size={12} aria-hidden="true" /> Run simulated engine test
          </button>
        )}
        <p className={styles.testStatus} role="status">
          {status}
        </p>
      </div>
      <ol className={styles.phases}>
        {TEST_PHASES.map((p, i) => {
          const state = test.status === "idle" ? "pending" : i < test.phase || test.status === "completed" ? "done" : i === test.phase ? (running ? "active" : "stopped") : "pending";
          return (
            <li key={p.id} className={styles.phase} data-state={state} aria-current={state === "active" ? "step" : undefined}>
              <span className={styles.phaseName}>{p.name}</span>
              <span className={styles.phaseText}>{p.text}</span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function HealthPanel() {
  const fault = useRocketTwinStore((s) => s.fault);
  const startFault = useRocketTwinStore((s) => s.startFault);
  const viewDiagnosis = useRocketTwinStore((s) => s.viewDiagnosis);
  const completeFault = useRocketTwinStore((s) => s.completeFault);
  const scenario = fault ? FAULT_BY_ID[fault.id] : null;
  return (
    <>
      <p className={styles.lead}>Start a fault scenario, then follow it from symptom to diagnosis to response.</p>
      <div className={styles.options} role="group" aria-label="Fault scenarios">
        {FAULTS.map((f) => (
          <button key={f.id} type="button" className={styles.option} aria-pressed={fault?.id === f.id} aria-label={`Start fault scenario: ${f.name}`} onClick={() => startFault(f.id)}>
            {f.name}
          </button>
        ))}
      </div>
      {scenario && fault ? (
        <div className={styles.detail}>
          <p className={styles.detailTitle}>
            {scenario.name} <span className={styles.tag}>SIMULATED</span>
          </p>
          <dl className={styles.findings}>
            <dt>Symptom</dt>
            <dd>{scenario.symptom}</dd>
            {fault.stage !== "symptom" && (
              <>
                <dt>Diagnosis</dt>
                <dd>{scenario.diagnosis}</dd>
              </>
            )}
            {fault.stage === "complete" && (
              <>
                <dt>Response</dt>
                <dd>{scenario.response}</dd>
              </>
            )}
          </dl>
          {fault.stage === "symptom" && (
            <button type="button" className={`${styles.option} ${styles.optionPrimary}`} aria-label={`View diagnosis: ${scenario.name}`} onClick={viewDiagnosis}>
              View diagnosis <ArrowRight size={13} aria-hidden="true" />
            </button>
          )}
          {fault.stage === "diagnosis" && (
            <button type="button" className={`${styles.option} ${styles.optionPrimary}`} aria-label={`Show response and complete scenario: ${scenario.name}`} onClick={completeFault}>
              Show response and complete <ArrowRight size={13} aria-hidden="true" />
            </button>
          )}
          {fault.stage === "complete" && <p className={styles.hint}>Scenario complete. Choose another to continue.</p>}
        </div>
      ) : (
        <p className={styles.hint}>No fault scenario is running. The engine is in its reference condition.</p>
      )}
    </>
  );
}

function TwinPanel() {
  const twinView = useRocketTwinStore((s) => s.twinView);
  const openCompare = useRocketTwinStore((s) => s.openCompare);
  const openPrediction = useRocketTwinStore((s) => s.openPrediction);
  const openModelCredibility = useRocketTwinStore((s) => s.openModelCredibility);
  return (
    <>
      <p className={styles.lead}>Set what the sensors report beside what the models expect.</p>
      <div className={styles.options}>
        <button type="button" className={styles.option} aria-pressed={twinView === "compare"} aria-label="Compare observed, estimated and expected states" onClick={openCompare}>
          Compare states
        </button>
        <button type="button" className={styles.option} aria-pressed={twinView === "prediction"} aria-label="Show predicted state" onClick={openPrediction}>
          Prediction
        </button>
        <a href={`#${MODEL_CREDIBILITY.id}`} className={styles.option} aria-label="Open Model Credibility" onClick={openModelCredibility}>
          Model Credibility <ArrowRight size={13} aria-hidden="true" />
        </a>
      </div>
      {twinView ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>
              {TWIN_SNAPSHOT.caption}
              <span className={styles.captionTags}>
                <span className={styles.tag}>SIMULATED</span>
                <span className={styles.tag}>NOT TEST-CORRELATED</span>
              </span>
            </caption>
            <thead>
              {twinView === "compare" ? (
                <tr>
                  <th scope="col">Parameter</th>
                  <th scope="col">Observed</th>
                  <th scope="col">Estimated</th>
                  <th scope="col">Expected</th>
                  <th scope="col">Observed − expected</th>
                </tr>
              ) : (
                <tr>
                  <th scope="col">Parameter</th>
                  <th scope="col">Observed</th>
                  <th scope="col">Predicted</th>
                  <th scope="col">Uncertainty</th>
                </tr>
              )}
            </thead>
            <tbody>
              {TWIN_SNAPSHOT.rows.map((row) =>
                twinView === "compare" ? (
                  <tr key={row.parameter}>
                    <th scope="row">{row.parameter}</th>
                    <td>{row.observed.toFixed(1)}</td>
                    <td>{row.estimated.toFixed(1)}</td>
                    <td>{row.expected.toFixed(1)}</td>
                    <td>{signed(row.observed - row.expected)}</td>
                  </tr>
                ) : (
                  <tr key={row.parameter}>
                    <th scope="row">{row.parameter}</th>
                    <td>{row.observed.toFixed(1)}</td>
                    <td>{row.predicted.toFixed(1)}</td>
                    <td>± {row.uncertainty.toFixed(1)}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {twinView === "prediction" && <p className={styles.hint}>{TWIN_SNAPSHOT.predictionNote}</p>}
        </div>
      ) : (
        <p className={styles.hint}>Choose a view. The four digital twin states are defined further down the page.</p>
      )}
    </>
  );
}

function ArchitecturePanel() {
  return (
    <>
      <p className={styles.lead}>How hardware, sensors, software, models and test evidence form one system.</p>
      <ol className={styles.steps}>
        {ARCHITECTURE_LAYERS.map((layer) => (
          <li key={layer.id}>
            <span>
              <strong>{layer.name}</strong>
              <br />
              {layer.text}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

const PANELS: Record<ModeId, () => ReactNode> = {
  engine: SystemsPanel,
  build: BuildPanel,
  flow: FlowPanel,
  control: ControlPanel,
  test: TestPanel,
  health: HealthPanel,
  twin: TwinPanel,
  architecture: ArchitecturePanel,
};

export default function TwinConsole() {
  const mode = useRocketTwinStore((s) => s.mode);
  const audience = useRocketTwinStore((s) => s.audience);
  const setMode = useRocketTwinStore((s) => s.setMode);
  const setAudience = useRocketTwinStore((s) => s.setAudience);
  useTestClock();

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = MODES.findIndex((m) => m.id === mode);
    const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? MODES.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const target = MODES[(next + MODES.length) % MODES.length];
    setMode(target.id);
    document.getElementById(`twin-tab-${target.id}`)?.focus();
  };

  return (
    <section id={PRODUCT.consoleId} className={styles.console} aria-label="Interactive digital twin" tabIndex={-1}>
      <div className={styles.consoleBar}>
        <div className={styles.tabs} role="tablist" aria-label="Digital twin modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              id={`twin-tab-${m.id}`}
              type="button"
              role="tab"
              className={styles.tab}
              aria-selected={mode === m.id}
              aria-controls={`twin-panel-${m.id}`}
              aria-label={m.ariaLabel}
              tabIndex={mode === m.id ? 0 : -1}
              onClick={() => setMode(m.id)}
              onKeyDown={onTabKey}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className={styles.audience} role="group" aria-label="Level of detail">
          {AUDIENCE_MODES.map((a) => (
            <button key={a.id} type="button" className={styles.audienceOption} aria-pressed={audience === a.id} aria-label={a.ariaLabel} onClick={() => setAudience(a.id)}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      {MODES.map((m) => {
        const Panel = PANELS[m.id];
        return (
          <div key={m.id} id={`twin-panel-${m.id}`} className={styles.panel} role="tabpanel" aria-labelledby={`twin-tab-${m.id}`} hidden={mode !== m.id}>
            <Panel />
          </div>
        );
      })}
    </section>
  );
}
