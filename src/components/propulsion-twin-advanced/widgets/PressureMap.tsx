"use client";
// The pressure map: the complete pressure network on the schematic, one
// educational path traced from tank to environment, and for any pressure
// sensor the whole story of its measurement, from the transducer to a
// statement about health.
//
// Before the simulation has loaded the map shows REFERENCE VALUES from the
// model's design point. Once it is running the same places show SIMULATED
// live values from the twin.
import { useState } from "react";
import { ArrowDown, ArrowUp, Minus, X } from "lucide-react";
import { trackAdvancedTwin, trackAdvancedTwinOnce } from "../analytics";
import { PRESSURE_PATH, PRESSURE_SENSORS, PRESSURE_UNIT, SENSOR_BY_ID, SENSOR_CLASSES, SIGNAL_CHAIN, type PathStep, type PressureSensor, type RangeClass } from "../data/pressure";
import type { ChannelId } from "../simulation/channels";
import { DIAGNOSIS_BY_ID } from "../simulation/isolation";
import { fitTrend } from "../simulation/prognostics";
import type { TwinEngineApi, TwinSnapshot } from "../simulation/twinTypes";
import { useLabStore } from "../state/labStore";
import { useLiveTwin } from "../state/useTwin";
import PropulsionSchematic from "../ui/PropulsionSchematic";
import { fmt, signed } from "../ui/charts";
import { Rows, Tag } from "../ui/primitives";
import { InjectInLab } from "./actions";
import css from "../advancedTwin.module.css";

/** Full scale of each range class, in % of reference chamber pressure. Illustrative: it only sets the raw-signal example. */
const FULL_SCALE: Record<RangeClass, number> = { LOW: 10, MEDIUM: 60, HIGH: 160, "VERY HIGH": 300 };
const ALERT_Z = 4;
const WATCH_Z = 3;
const AHEAD = 30;

const reference = (id: ChannelId) => SENSOR_BY_ID[id]?.reference ?? 0;

/** The value shown at a step of the path: read from a sensor, or computed from its neighbours. */
function stepValue(step: PathStep, read: (id: ChannelId) => number): { value: number; delta: boolean } {
  if (step.sensor) return { value: read(step.sensor), delta: false };
  const pc = read("pcA");
  switch (step.id) {
    case "pump":
      return { value: read("pOutOx") - read("pInOx"), delta: true };
    case "valve_line":
      return { value: read("pInjOx") - read("pOutOx"), delta: true };
    case "injector_dp":
      return { value: pc - read("pInjOx"), delta: true };
    case "throat":
      return { value: 0.564 * pc, delta: false };
    case "exit":
      return { value: 0.012 * pc, delta: false };
    default:
      return { value: step.reference ?? 0, delta: false };
  }
}

export function SensorDetail({ sensor, snapshot, engine, onClose }: { sensor: PressureSensor; snapshot: TwinSnapshot | null; engine: TwinEngineApi | null; onClose: () => void }) {
  const reading = snapshot?.channels[sensor.id];
  const cls = SENSOR_CLASSES[sensor.cls];
  const fullScale = FULL_SCALE[sensor.rangeClass];
  const observed = reading?.observed ?? sensor.reference;
  const milliamps = 4 + (16 * Math.max(0, Math.min(fullScale, observed))) / fullScale;
  const counts = Math.round(((milliamps - 4) / 16) * 65535);

  // Where the estimate has been heading over the last ten seconds, extended thirty seconds ahead.
  let predicted: { mean: number; sigma: number; slope: number } | null = null;
  if (engine && reading) {
    const history = engine.series("estimated", sensor.id).slice(-100);
    const trend = fitTrend(history.map((_, i) => i * engine.historyStep), history);
    predicted = { mean: reading.estimated + trend.slope * AHEAD, sigma: Math.sqrt((2 * reading.sigma) ** 2 + trend.scatter ** 2 + (trend.slopeError * AHEAD) ** 2), slope: Math.abs(trend.slope) > 3 * trend.slopeError && Math.abs(trend.slope) > 0.002 * Math.max(1, Math.abs(reading.estimated)) ? trend.slope : 0 };
  }
  const z = reading?.z ?? 0;
  const status = Math.abs(z) >= ALERT_Z ? "OUTSIDE EXPECTATION" : Math.abs(z) >= WATCH_Z ? "WATCH" : "WITHIN EXPECTATION";
  const TrendIcon = !predicted || predicted.slope === 0 ? Minus : predicted.slope > 0 ? ArrowUp : ArrowDown;
  const interpretation = !reading
    ? "Start the simulation to see this measurement interpreted against the model."
    : Math.abs(z) < WATCH_Z
      ? "The estimate agrees with what the model expects for the present command. Nothing here points to a fault."
      : `The estimate is ${z > 0 ? "above" : "below"} expectation by ${Math.abs(z).toFixed(1)} standard deviations. ${z > 0 ? "" : ""}Typical meaning at this location: ${sensor.failureSignature}`;

  const chain: Record<(typeof SIGNAL_CHAIN)[number]["id"], string> = {
    sensor: `${sensor.tag} · ${sensor.location}`,
    raw: `${milliamps.toFixed(2)} mA on a 4–20 mA loop`,
    conditioned: `${counts.toLocaleString("en-US")} counts (16-bit), time-stamped`,
    engineering: `${fmt(observed)} ${PRESSURE_UNIT}`,
    twin: reading ? `Estimated ${fmt(reading.estimated)} · expected ${fmt(reading.expected)}` : `Reference ${fmt(sensor.reference)}`,
    residual: reading ? `${signed(reading.residual)} ${PRESSURE_UNIT} (${signed(z, 1)} σ)` : "Not available until the twin is running",
    health: status,
  };

  return (
    <aside className={css.sheet} aria-label={`${sensor.name}: measurement detail`}>
      <div className={css.sheetHead}>
        <div>
          <p className={css.kicker}>
            {sensor.tag} · {sensor.rangeClass} PRESSURE CLASS
          </p>
          <p className={css.sheetTitle}>{sensor.name}</p>
        </div>
        <button type="button" className={css.iconButton} onClick={onClose} aria-label="Close measurement detail">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <p>{sensor.meaning}</p>

      <div className={css.states} role="group" aria-label="Digital Twin states at this measurement point">
        <div className={css.stateCell}>
          <span>OBSERVED</span>
          <b>{fmt(observed)}</b>
        </div>
        <div className={css.stateCell}>
          <span>ESTIMATED</span>
          <b>{reading ? `${fmt(reading.estimated)} ± ${fmt(2 * reading.sigma)}` : "–"}</b>
        </div>
        <div className={css.stateCell}>
          <span>EXPECTED</span>
          <b>{fmt(reading?.expected ?? sensor.reference)}</b>
        </div>
        <div className={css.stateCell}>
          <span>PREDICTED +{AHEAD} s</span>
          <b>{predicted ? `${fmt(predicted.mean)} ± ${fmt(2 * predicted.sigma)}` : "–"}</b>
        </div>
        <div className={css.stateCell}>
          <span>RESIDUAL</span>
          <b>{reading ? `${signed(reading.residual)} (${signed(z, 1)} σ)` : "–"}</b>
        </div>
        <div className={css.stateCell} data-status={status}>
          <span>STATUS</span>
          <b>
            <TrendIcon size={12} aria-hidden="true" /> {status}
          </b>
        </div>
      </div>
      <p className={css.note}>
        {PRESSURE_UNIT} · <Tag>{reading ? "SIMULATED" : "REFERENCE VALUE"}</Tag> Uncertainty is ±2σ. Trend: {!predicted || predicted.slope === 0 ? "steady" : predicted.slope > 0 ? "rising" : "falling"}.
      </p>

      <ol className={css.signal} aria-label="From the sensor to a statement about health">
        {SIGNAL_CHAIN.map((stage) => (
          <li key={stage.id}>
            <span className={css.signalLabel}>{stage.label}</span>
            <span className={css.signalValue}>{chain[stage.id]}</span>
            <span className={css.signalText}>{stage.id === "health" ? interpretation : stage.text}</span>
          </li>
        ))}
      </ol>

      <Rows
        rows={[
          { label: "Purpose", value: sensor.purpose },
          { label: "Nominal trend", value: sensor.trend },
          { label: "Expected physics", value: sensor.physics },
          { label: "Failure signature", value: sensor.failureSignature },
          { label: "Digital Twin usage", value: sensor.twinUse },
          { label: "Sampling", value: cls.sampling },
          { label: "Redundancy", value: cls.redundancy },
        ]}
      />

      <div className={css.group}>
        <p className={css.groupLabel}>Probable failure relationships</p>
        {sensor.faults.length ? (
          <ul className={css.faultLinks}>
            {sensor.faults.map((fault) => (
              <li key={fault}>
                <span>{DIAGNOSIS_BY_ID[fault].name}</span>
                <InjectInLab fault={fault} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={css.hint}>No injectable scenario moves this measurement. Its related faults are listed in the fault library.</p>
        )}
      </div>
    </aside>
  );
}

export default function PressureMap() {
  const snapshot = useLiveTwin("pressure");
  const engine = useLabStore((s) => s.engine);
  const selected = useLabStore((s) => s.sensor);
  const selectSensor = useLabStore((s) => s.selectSensor);
  const [step, setStep] = useState<number | null>(null);

  const read = (id: ChannelId) => snapshot?.channels[id].estimated ?? reference(id);
  const alerts = snapshot ? PRESSURE_SENSORS.filter((s) => Math.abs(snapshot.channels[s.id].z) >= ALERT_Z).map((s) => s.id) : [];
  const sensor = selected ? SENSOR_BY_ID[selected] : undefined;
  const tracing = step !== null;
  const current = tracing ? PRESSURE_PATH[step] : null;

  const go = (index: number) => {
    setStep(index);
    const next = PRESSURE_PATH[index];
    if (next.sensor) selectSensor(next.sensor);
    if (index === PRESSURE_PATH.length - 1) trackAdvancedTwinOnce("pressure_path_completed");
  };
  const start = () => {
    trackAdvancedTwin("pressure_path_started");
    go(0);
  };

  return (
    <div className={css.pressureMap}>
      <div className={css.stage} data-desktop-only="">
        <ul className={css.stageTags} aria-label="Value status">
          <li>{snapshot ? "SIMULATED" : "REFERENCE VALUE"}</li>
          <li>{PRESSURE_UNIT}</li>
        </ul>
        <PropulsionSchematic className={css.schematic} selected={selected ?? current?.sensor ?? null} alerts={alerts} onSelectSensor={selectSensor} flowClassName={snapshot ? css.flowing : undefined} />
        <p className={css.stageCaption} role="status">
          {alerts.length ? `${alerts.length} pressure ${alerts.length === 1 ? "sensor is" : "sensors are"} outside expectation, drawn as diamonds.` : "Select any pressure sensor. A diamond marks a sensor whose reading has left its expectation."}
        </p>
      </div>

      <div className={css.ladderWrap}>
        <div className={css.ladderHead}>
          <p className={css.groupLabel}>One pressure path · oxidiser side</p>
          {tracing ? (
            <div className={css.walk}>
              <button type="button" className={css.ghost} disabled={step === 0} onClick={() => go(step - 1)}>
                <span aria-hidden="true">←</span> Back
              </button>
              <span className={css.walkCount} role="status">
                {step + 1} of {PRESSURE_PATH.length}
                {step === PRESSURE_PATH.length - 1 ? " · path complete" : ""}
              </span>
              {step < PRESSURE_PATH.length - 1 ? (
                <button type="button" className={css.primary} onClick={() => go(step + 1)}>
                  Next <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button type="button" className={css.ghost} onClick={() => setStep(null)}>
                  Finish
                </button>
              )}
            </div>
          ) : (
            <button type="button" className={css.primary} onClick={start}>
              Trace the pressure path
            </button>
          )}
        </div>
        <ol className={css.ladder}>
          {PRESSURE_PATH.map((item, i) => {
            const { value, delta } = stepValue(item, read);
            const isCurrent = step === i;
            const body = (
              <>
                <span className={css.ladderLabel}>
                  {item.label}
                  {item.sensor && <span className={css.ladderTag}>{SENSOR_BY_ID[item.sensor]?.tag}</span>}
                </span>
                <span className={css.ladderBar} aria-hidden="true">
                  <span style={{ width: `${Math.min(100, (Math.abs(value) / 200) * 100)}%` }} data-kind={item.kind} />
                </span>
                <span className={css.ladderValue}>{delta ? `${value >= 0 ? "▲" : "▼"} ${fmt(Math.abs(value))}` : fmt(value)}</span>
              </>
            );
            return (
              <li key={item.id} className={css.ladderStep} data-kind={item.kind} data-current={isCurrent || undefined} aria-current={isCurrent ? "step" : undefined}>
                {item.sensor ? (
                  <button type="button" className={css.ladderRow} aria-pressed={selected === item.sensor} onClick={() => selectSensor(item.sensor ?? null)}>
                    {body}
                  </button>
                ) : (
                  <div className={css.ladderRow}>{body}</div>
                )}
                {/* Every step's explanation is in the document; the one being traced is the one showing. */}
                <p className={css.ladderText} hidden={!isCurrent}>
                  {item.text}
                </p>
              </li>
            );
          })}
        </ol>
        <p className={css.note}>
          ▲ a rise, ▼ a loss, in {PRESSURE_UNIT}. <Tag>{snapshot ? "SIMULATED" : "REFERENCE VALUE"}</Tag>
        </p>

        <div className={css.group}>
          <p className={css.groupLabel}>All pressure sensors</p>
          <div className={css.options} role="group" aria-label="Pressure sensors">
            {PRESSURE_SENSORS.map((s) => (
              <button key={s.id} type="button" className={css.option} aria-pressed={selected === s.id} data-alert={alerts.includes(s.id) || undefined} onClick={() => selectSensor(s.id)}>
                {alerts.includes(s.id) && <span aria-hidden="true">◆ </span>}
                {s.name.replace(" pressure", "")}
                <span className={css.optionValue}>{fmt(read(s.id))}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {sensor && <SensorDetail sensor={sensor} snapshot={snapshot} engine={engine} onClose={() => selectSensor(null)} />}
    </div>
  );
}
