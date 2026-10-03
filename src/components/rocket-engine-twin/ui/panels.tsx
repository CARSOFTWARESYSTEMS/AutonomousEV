// The small pieces every mode's interface is built from, and the two panels
// that follow a selection: a component's, and a sensor's.
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { COMPONENT_SYSTEM, SENSORS, SYSTEM_BY_ID } from "../data/engineReference";
import { COMPONENT_LABEL, COMPONENT_LINE, ENERGY_STEPS, FEATURE_BY_SENSOR, HEALTH_LABEL, PUMP_STEPS, SCALE_NOTES, SYSTEM_ROWS, TRACE_STEPS } from "../data/twinContent";
import { frame } from "../scene/frameState";
import { healthState } from "../simulation/bearingFault";
import { useSampled } from "../state/clocks";
import { useRocketTwinStore } from "../state/twinStore";
import type { CutawaySystem, FlowId, SystemId } from "../types";
import ui from "../twin3d.module.css";

export function Panel({ title, tag, onClose, children, label }: { title: string; tag?: string; onClose?: () => void; children: ReactNode; label?: string }) {
  return (
    <section className={ui.panel} aria-label={label ?? title}>
      <header className={ui.panelHead}>
        <p className={ui.panelTitle}>{title}</p>
        {tag && <span className={ui.tag}>{tag}</span>}
        {onClose && (
          <button type="button" className={ui.close} aria-label={`Close ${title.toLowerCase()} panel`} onClick={onClose}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

export function Rows({ rows }: { rows: readonly { label: string; value: string; state?: string }[] }) {
  return (
    <dl className={ui.rows}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd data-state={row.state}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Action({ children, onClick, pressed, primary, label, disabled }: { children: ReactNode; onClick: () => void; pressed?: boolean; primary?: boolean; label?: string; disabled?: boolean }) {
  return (
    <button type="button" className={ui.action} data-primary={primary || undefined} aria-pressed={pressed} aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

/** A sequence shown as a row of steps, with one of them current. */
export function Steps({ steps, current, label }: { steps: readonly string[]; current?: number; label: string }) {
  return (
    <ol className={ui.steps} aria-label={label}>
      {steps.map((step, i) => (
        <li key={step} data-current={current === i || undefined}>
          {step}
        </li>
      ))}
    </ol>
  );
}

const CUT_FOR: Partial<Record<SystemId, CutawaySystem>> = { turbomachinery: "turbomachinery", combustion: "combustion", regenerative_cooling: "regenerative_cooling", nozzle: "nozzle" };
const FLOW_FOR: Partial<Record<SystemId, FlowId>> = { propellant_feed: "propellant", turbomachinery: "propellant", combustion: "hot_gas", regenerative_cooling: "cooling", nozzle: "hot_gas", instrumentation: "data", engine_control: "data" };
const readSeverity = () => frame.severity;
const readEnergyStep = () => frame.energyStep;

/** What opens beside the engine when a component is selected: a name, one line, and one or two things to do. */
export function ComponentPanel() {
  const component = useRocketTwinStore((s) => s.component);
  const audience = useRocketTwinStore((s) => s.audience);
  const cutaway = useRocketTwinStore((s) => s.cutaway);
  const focused = useRocketTwinStore((s) => s.focused);
  const bearing = useRocketTwinStore((s) => s.bearing);
  const mode = useRocketTwinStore((s) => s.mode);
  const energyFlow = useRocketTwinStore((s) => s.energyFlow);
  const severity = useSampled(readSeverity, 4);
  const energyStep = useSampled(readEnergyStep, 6);
  const store = useRocketTwinStore.getState();
  if (!component) return null;

  const system = COMPONENT_SYSTEM[component];
  const cut = CUT_FOR[system];
  const flow = FLOW_FOR[system];
  const faulted = bearing !== null && system === "turbomachinery" && component !== "oxidiser_turbopump" && component !== "preburner";
  const state = faulted ? healthState(severity) : "nominal";
  const rows = SYSTEM_ROWS[system].map((row) => ({ label: row.label, value: row.kind === "simulated" ? "SIMULATED" : row.label === "VIBRATION" || row.label === "STATE" ? HEALTH_LABEL[state] : "NOMINAL", state: row.kind === "state" ? state : undefined }));

  return (
    <Panel title={COMPONENT_LABEL[component]} tag={SYSTEM_BY_ID[system].name.toUpperCase()} onClose={() => store.selectComponent(null)} label={`${COMPONENT_LABEL[component]} details`}>
      {audience === "learn" ? <p className={ui.line}>{COMPONENT_LINE[component]}</p> : <Rows rows={rows} />}
      <div className={ui.actions}>
        {cut && (
          <Action pressed={cutaway === cut} primary onClick={() => store.toggleCutaway(cut)}>
            VIEW INTERNALS
          </Action>
        )}
        {system === "turbomachinery" && (
          <Action pressed={energyFlow} label="Energy flow: from hot gas to propellant pressure" onClick={store.toggleEnergyFlow}>
            ENERGY FLOW
          </Action>
        )}
        {flow && mode !== "flow" && (
          <Action
            onClick={() => {
              store.setMode("flow");
              store.selectFlow(flow);
            }}
          >
            FOLLOW FLOW
          </Action>
        )}
        {audience === "engineer" && system === "turbomachinery" && <Action onClick={store.viewInTwin}>VIEW TWIN</Action>}
      </div>
      {energyFlow && system === "turbomachinery" && (
        <>
          <Steps steps={ENERGY_STEPS} current={energyStep} label="Energy transfer through the turbopump" />
          <p className={ui.small}>{PUMP_STEPS.join(" → ")}</p>
          {audience === "engineer" && <p className={ui.note}>{SCALE_NOTES.rotation}</p>}
        </>
      )}
      <div className={ui.actions}>
        {focused ? <Action onClick={store.backToSystem}>BACK TO SYSTEM</Action> : <Action onClick={() => store.focusComponent(component)}>FOCUS</Action>}
        <Action onClick={store.backToEngine}>BACK TO ENGINE</Action>
      </div>
    </Panel>
  );
}

const readNow = () => Math.floor(frame.now * 2.2);

/** A selected sensor: what it measures, what it contributes, and its path from the engine to a decision. */
export function SensorPanel() {
  const sensorId = useRocketTwinStore((s) => s.sensor);
  const tracing = useRocketTwinStore((s) => s.tracing);
  const tick = useSampled(readNow, 6);
  const store = useRocketTwinStore.getState();
  const sensor = SENSORS.find((s) => s.id === sensorId);
  if (!sensor) return null;
  return (
    <Panel title={sensor.name.toUpperCase()} tag={`${sensor.type.toUpperCase()} SENSOR`} onClose={() => store.selectSensor(null)} label={`${sensor.name} sensor details`}>
      <p className={ui.line}>{sensor.use}</p>
      <Rows
        rows={[
          { label: "SYSTEM", value: SYSTEM_BY_ID[sensor.system].name.toUpperCase() },
          { label: "HEALTH FEATURE", value: FEATURE_BY_SENSOR[sensor.type] },
          { label: "SIGNAL", value: "SIMULATED" },
        ]}
      />
      <div className={ui.actions}>
        <Action primary pressed={tracing} label={`Trace the ${sensor.name.toLowerCase()} sensor`} onClick={() => store.traceSensor(sensor.id)}>
          TRACE
        </Action>
      </div>
      {tracing && <Steps steps={TRACE_STEPS} current={tick % TRACE_STEPS.length} label="Path of the signal from the sensor to a decision" />}
    </Panel>
  );
}
