"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Download,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sun,
  Moon,
  Upload,
} from "lucide-react";
import {
  cloneScenario,
  PRESETS,
  presetScenario,
  parseScenario,
  validateScenario,
  ScenarioError,
  type Scenario,
} from "@/lib/cubetwin/scenario";
import type { SimulationResult } from "@/lib/cubetwin/engine";
import { download } from "@/lib/cubetwin/download";
import { orbitalPeriodSeconds } from "@/lib/cubetwin/engine";
import { exportCsv, exportJson } from "@/lib/cubetwin/export";
import { useSimulation } from "./SimulationProvider";
import styles from "../cubetwin.module.css";
export function timeLabel(seconds: number) {
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60),
    s = Math.floor(seconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
function Field({
  label,
  unit,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  help,
  error,
  path,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  error?: string;
  path: string;
}) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        <small>{unit}</small>
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
        min={min}
        max={max}
        step={step}
        aria-invalid={!!error}
        aria-describedby={`${path}-help`}
      />
      <small id={`${path}-help`}>
        {error || (
          <>
            {help} Range: {min}–{max} {unit}.
          </>
        )}
      </small>
    </label>
  );
}
export function TelemetryChart() {
  const { result, baseline, cursor } = useSimulation();
  const [kind, setKind] = useState("soc");
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const [inspected, setInspected] = useState<number | null>(null);
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(270, entries[0].contentRect.width)),
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);
  const height = 270,
    left = 44,
    right = 18,
    top = 32,
    bottom = 48,
    innerH = height - top - bottom;
  const eclipseWindows: { start: number; end: number }[] = [];
  for (let i = 0; i < result.samples.length - 1; i++) {
    const s = result.samples[i];
    if (!s.sunlight) {
      const last = eclipseWindows.at(-1);
      if (last && last.end === s.timeSeconds)
        last.end = result.samples[i + 1].timeSeconds;
      else
        eclipseWindows.push({
          start: s.timeSeconds,
          end: result.samples[i + 1].timeSeconds,
        });
    }
  }
  const samples = result.samples,
    stride = Math.max(1, Math.floor(samples.length / 420));
  const data = samples.filter(
    (_, i) => i % stride === 0 || i === samples.length - 1,
  );
  const x = (t: number) =>
    left + (t / result.scenario.durationSeconds) * (width - left - right);
  const max =
    kind === "soc"
      ? 100
      : Math.max(20, ...data.map((s) => Math.max(s.solarW, s.loadW))) * 1.1;
  const y = (value: number) => top + (1 - value / max) * innerH;
  const path = (
    values: typeof samples,
    key: "socPercent" | "solarW" | "loadW" | "observedSocPercent",
  ) => {
    let pen = false;
    return values
      .map((s) => {
        const v = s[key];
        if (v === null) {
          pen = false;
          return "";
        }
        const command = pen ? "L" : "M";
        pen = true;
        return `${command}${x(s.timeSeconds).toFixed(1)},${y(v).toFixed(1)}`;
      })
      .join(" ");
  };
  const selected = samples[Math.min(inspected ?? cursor, samples.length - 1)];
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>
          <Activity size={14} />{" "}
          {kind === "soc"
            ? "Battery state of charge"
            : "Spacecraft power balance"}
        </h3>
        <label>
          <span className={styles.srOnly}>Chart measurement</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={styles.select}
            style={{
              fontSize: 14,
              minHeight: 44,
              padding: "6px 10px",
              width: 100,
            }}
          >
            <option value="soc">SOC (%)</option>
            <option value="power">Power (W)</option>
          </select>
        </label>
      </div>
      <div className={styles.chart} ref={chartRef}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse") return;
            const rect = event.currentTarget.getBoundingClientRect();
            const target =
              Math.min(
                1,
                Math.max(
                  0,
                  (((event.clientX - rect.left) * width) / rect.width - left) /
                    (width - left - right),
                ),
              ) * result.scenario.durationSeconds;
            let lo = 0,
              hi = samples.length - 1;
            while (lo < hi) {
              const mid = (lo + hi) >> 1;
              if (samples[mid].timeSeconds < target) lo = mid + 1;
              else hi = mid;
            }
            setInspected(lo);
          }}
          onPointerLeave={() => setInspected(null)}
          role="img"
          aria-label={
            kind === "soc"
              ? `Battery SOC across the entire ${result.scenario.durationSeconds / 3600}-hour mission: minimum ${result.metrics.minSocPercent.toFixed(1)}%, final ${result.metrics.finalSocPercent.toFixed(1)}%. Shaded regions indicate eclipse. Full sample data is available in CSV.`
              : "Delivered solar power and requested load power over mission time. Full sample data is available in CSV."
          }
        >
          <text x={left} y={15} fill="var(--space-muted)" fontSize="12">
            {kind === "soc" ? "State of Charge (%)" : "Power (W)"}
          </text>
          <text
            x={(left + width - right) / 2}
            y={height - 4}
            fill="var(--space-muted)"
            fontSize="12"
            textAnchor="middle"
          >
            Mission time (h)
          </text>
          {eclipseWindows.map((window, i) => (
            <rect
              key={i}
              x={x(window.start)}
              y={top}
              width={x(window.end) - x(window.start)}
              height={innerH}
              fill="var(--space-blue)"
              opacity=".35"
            />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <path
                d={`M${left},${y(v * max)}H${width - right}`}
                stroke="var(--space-border)"
                strokeWidth=".6"
              />
              <text
                x={left - 9}
                y={y(v * max) + 3}
                textAnchor="end"
                fill="var(--space-muted)"
                fontSize="12"
                fontFamily="var(--font-space-inter)"
              >
                {Math.round(v * max)}
                {kind === "soc" ? "%" : ""}
              </text>
            </g>
          ))}
          {kind === "soc" && (
            <>
              <path
                d={`M${left} ${y(result.scenario.battery.minimumReserveSocPercent)}H${width - right}`}
                stroke="var(--space-amber)"
                strokeDasharray="4 5"
                strokeWidth=".8"
              />
              <path
                d={path(
                  baseline.samples.filter(
                    (_, i) =>
                      i % stride === 0 || i === baseline.samples.length - 1,
                  ),
                  "socPercent",
                )}
                fill="none"
                stroke="var(--space-muted)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <path
                d={`${path(data, "socPercent")}L${x(result.scenario.durationSeconds)},${y(0)}L${left},${y(0)}Z`}
                fill="var(--space-cyan-text)"
                opacity=".06"
              />
            </>
          )}
          <path
            d={path(data, kind === "soc" ? "socPercent" : "solarW")}
            fill="none"
            stroke={
              kind === "soc" ? "var(--space-cyan-text)" : "var(--space-amber)"
            }
            strokeWidth="1.9"
          />
          <path
            d={path(data, kind === "soc" ? "observedSocPercent" : "loadW")}
            fill="none"
            stroke={
              kind === "soc" ? "var(--space-blue)" : "var(--space-cyan-text)"
            }
            strokeWidth="1.2"
            strokeDasharray={kind === "soc" ? "3 5" : undefined}
          />
          {result.scenario.faults.map((f) => (
            <path
              key={f.id}
              d={`M${x(f.startSecond)} ${top}V${height - bottom}`}
              stroke="var(--space-amber)"
              opacity=".4"
              strokeDasharray="2 4"
            />
          ))}
          <path
            d={`M${x(selected.timeSeconds)} ${top}V${height - bottom}`}
            stroke="var(--space-text)"
            opacity=".65"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text
              key={v}
              x={x(v * result.scenario.durationSeconds)}
              y={height - 25}
              fill="var(--space-muted)"
              fontSize="12"
              fontFamily="var(--font-space-inter)"
              textAnchor={v === 0 ? "start" : v === 1 ? "end" : "middle"}
            >
              {((v * result.scenario.durationSeconds) / 3600).toFixed(0)} h
            </text>
          ))}
        </svg>
      </div>
      <div className={styles.chartLegend}>
        {(kind === "soc"
          ? [
              ["var(--space-cyan-text)", "True SOC"],
              ["var(--space-blue)", "Observed SOC"],
              ["var(--space-muted)", "Baseline"],
              [
                "var(--space-amber)",
                `Reserve ${result.scenario.battery.minimumReserveSocPercent}%`,
              ],
            ]
          : [
              ["var(--space-amber)", "Delivered solar"],
              ["var(--space-cyan-text)", "Requested load"],
            ]
        ).map(([color, label]) => (
          <span key={label}>
            <i style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
      <div className={styles.chartReadout} aria-label="Selected chart sample">
        <span>
          <b>{timeLabel(selected.timeSeconds)}</b> ·{" "}
          {selected.sunlight ? "Sunlight" : "Eclipse"}
        </span>
        <span>
          True SOC <b>{selected.socPercent.toFixed(2)}%</b>
        </span>
        <span>
          Observed{" "}
          <b>
            {selected.observedSocPercent === null
              ? "Missing"
              : `${selected.observedSocPercent.toFixed(2)}%`}
          </b>
        </span>
        <span>
          Solar <b>{selected.solarW.toFixed(2)} W</b> · Load{" "}
          <b>{selected.loadW.toFixed(2)} W</b>
        </span>
      </div>
      <p className={styles.formNote} style={{ padding: "0 20px" }}>
        Shaded regions show eclipse; unshaded regions show sunlight. Inspect
        with the timeline or point at the chart. The full data table is below.
      </p>
      <Playback />
    </div>
  );
}
function Playback() {
  const { cursor, setCursor, playing, setPlaying, result } = useSimulation();
  return (
    <div className={styles.playback}>
      <button
        aria-label={playing ? "Pause playback" : "Play recorded simulation"}
        onClick={() => {
          if (cursor === result.samples.length - 1) setCursor(0);
          setPlaying(!playing);
        }}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <label>
        Mission playback · drag to inspect
        <input
          type="range"
          min={0}
          max={result.samples.length - 1}
          value={cursor}
          onChange={(e) => {
            setPlaying(false);
            setCursor(Number(e.target.value));
          }}
          aria-label="Mission time"
          aria-valuetext={timeLabel(result.samples[cursor].timeSeconds)}
        />
      </label>
      <time>{timeLabel(result.samples[cursor].timeSeconds)}</time>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}
export default function Simulator() {
  const { result, cursor, run, busy, error, setError } = useSimulation();
  const [draftState, setDraftState] = useState<{
      source: SimulationResult | null;
      value: Scenario;
    }>({ source: null, value: cloneScenario() }),
    [tab, setTab] = useState("Mission"),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [preset, setPreset] = useState("Baseline");
  const draft =
    draftState.source === result ? draftState.value : result.scenario;
  const setDraft = (value: Scenario | ((previous: Scenario) => Scenario)) =>
    setDraftState({
      source: result,
      value: typeof value === "function" ? value(draft) : value,
    });
  const current = result.samples[cursor],
    m = result.metrics,
    dirty = JSON.stringify(draft) !== JSON.stringify(result.scenario);
  const edit = (
    group: "orbit" | "solar" | "battery" | "thermal",
    key: string,
    value: number | boolean | string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));
    setErrors({});
  };
  const num = (
    group: "orbit" | "solar" | "battery" | "thermal",
    key: string,
    label: string,
    unit: string,
    min: number,
    max: number,
    step: number,
    help: string,
  ) => {
    const path = `${group}.${key}`;
    return (
      <Field
        key={path}
        path={path}
        label={label}
        unit={unit}
        min={min}
        max={max}
        step={step}
        value={(draft[group] as unknown as Record<string, number>)[key]}
        onChange={(n) => edit(group, key, n)}
        help={help}
        error={errors[path]}
      />
    );
  };
  const submit = (s: Scenario = draft) => {
    try {
      const valid = validateScenario(s);
      setErrors({});
      setDraft(valid);
      run(valid);
    } catch (e) {
      if (e instanceof ScenarioError) setErrors(e.errors);
      setError(e instanceof Error ? e.message : "Invalid inputs.");
    }
  };
  const loadPreset = (name: string) => {
    const s = presetScenario(name);
    setPreset(name);
    setDraft(s);
    setErrors({});
    submit(s);
  };
  const recent = result.events
    .filter((e) => e.timeSeconds <= current.timeSeconds)
    .slice(-5)
    .reverse();
  return (
    <>
      <div className={styles.presetRow} aria-label="Mission presets">
        {PRESETS.map((name) => (
          <button
            key={name}
            disabled={busy}
            aria-pressed={
              preset === name &&
              JSON.stringify(presetScenario(name)) ===
                JSON.stringify(result.scenario)
            }
            onClick={() => loadPreset(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.labGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>
              <Settings2 size={14} /> Mission configuration
            </h3>
            <small>ILLUSTRATIVE</small>
          </div>
          <form
            className={styles.controls}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            noValidate
          >
            <div
              className={styles.controlTabs}
              role="tablist"
              aria-label="Configuration category"
            >
              {["Mission", "Power", "Battery", "Schedule"].map((name, i) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === name}
                  aria-controls={`config-${name}`}
                  id={`tab-${name}`}
                  tabIndex={tab === name ? 0 : -1}
                  key={name}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const names = ["Mission", "Power", "Battery", "Schedule"];
                      const next =
                        names[(i + (e.key === "ArrowRight" ? 1 : 3)) % 4];
                      setTab(next);
                      document.getElementById(`tab-${next}`)?.focus();
                    }
                  }}
                  onClick={() => setTab(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div
              className={styles.controlsFields}
              role="tabpanel"
              id={`config-${tab}`}
              aria-labelledby={`tab-${tab}`}
            >
              {tab === "Mission" && (
                <>
                  {num(
                    "orbit",
                    "altitudeKm",
                    "Orbit altitude",
                    "km",
                    160,
                    2000,
                    10,
                    "Height above mean Earth radius.",
                  )}
                  {num(
                    "orbit",
                    "inclinationDeg",
                    "Inclination",
                    "°",
                    0,
                    180,
                    0.1,
                    "Descriptive; no effect on duration-mode power.",
                  )}
                  {num(
                    "orbit",
                    "eclipseDurationMinutes",
                    "Eclipse duration",
                    "min",
                    0,
                    100,
                    1,
                    "Shadow time per orbit; must be shorter than the period.",
                  )}
                  <Field
                    path="durationSeconds"
                    label="Mission duration"
                    unit="h"
                    min={1}
                    max={48}
                    value={draft.durationSeconds / 3600}
                    onChange={(n) =>
                      setDraft({ ...draft, durationSeconds: n * 3600 })
                    }
                    error={errors.durationSeconds}
                    help="Activities and faults must fit this window."
                  />
                  <Field
                    path="timeStepSeconds"
                    label="Time step"
                    unit="s"
                    min={1}
                    max={60}
                    value={draft.timeStepSeconds}
                    onChange={(n) => setDraft({ ...draft, timeStepSeconds: n })}
                    error={errors.timeStepSeconds}
                    help="Maximum 20,000 steps per run."
                  />
                  <p className={styles.formNote}>
                    Orbital period:{" "}
                    {Number.isFinite(draft.orbit.altitudeKm) &&
                    draft.orbit.altitudeKm >= 0
                      ? (
                          orbitalPeriodSeconds(draft.orbit.altitudeKm) / 60
                        ).toFixed(1)
                      : "—"}{" "}
                    min. Sunlight:{" "}
                    {Number.isFinite(draft.orbit.altitudeKm) &&
                    draft.orbit.altitudeKm >= 0 &&
                    Number.isFinite(draft.orbit.eclipseDurationMinutes)
                      ? Math.max(
                          0,
                          orbitalPeriodSeconds(draft.orbit.altitudeKm) / 60 -
                            draft.orbit.eclipseDurationMinutes,
                        ).toFixed(1)
                      : "—"}{" "}
                    min per orbit. Circular Low Earth Orbit (LEO); Earth mean
                    radius 6,371 km. Event boundaries split time steps.
                  </p>
                </>
              )}
              {tab === "Power" && (
                <>
                  <label className={styles.field}>
                    <span>Solar model</span>
                    <select
                      value={draft.solar.mode}
                      onChange={(e) => edit("solar", "mode", e.target.value)}
                    >
                      <option value="peak-power">Beginner · peak power</option>
                      <option value="engineering">
                        Engineering · area / angle
                      </option>
                    </select>
                  </label>
                  {draft.solar.mode === "peak-power" ? (
                    num(
                      "solar",
                      "peakPowerW",
                      "Peak solar power",
                      "W",
                      0,
                      200,
                      1,
                      "Before PMAD conversion losses.",
                    )
                  ) : (
                    <>
                      {num(
                        "solar",
                        "areaM2",
                        "Solar cell area",
                        "m²",
                        0.001,
                        0.5,
                        0.001,
                        "Illuminated cell area.",
                      )}
                      {num(
                        "solar",
                        "cellEfficiency",
                        "Cell efficiency",
                        "fraction",
                        0.01,
                        0.5,
                        0.01,
                        "0.28 means 28% conversion efficiency.",
                      )}
                      {num(
                        "solar",
                        "incidenceDeg",
                        "Incidence angle",
                        "°",
                        0,
                        180,
                        1,
                        "Angle between panel normal and sunlight.",
                      )}
                      {num(
                        "solar",
                        "irradianceWm2",
                        "Solar irradiance",
                        "W/m²",
                        1000,
                        1500,
                        1,
                        "Illustrative environment input.",
                      )}
                    </>
                  )}
                  {num(
                    "solar",
                    "pmadEfficiency",
                    "Power conversion efficiency",
                    "fraction",
                    0.01,
                    1,
                    0.01,
                    "Power Management and Distribution (PMAD): 0.90 delivers 90% of generated power.",
                  )}
                  {num(
                    "solar",
                    "degradationFactor",
                    "Array derating",
                    "fraction",
                    0,
                    1,
                    0.01,
                    "1 = full output; 0.8 = 80% output.",
                  )}
                  {draft.loads.map((l, i) => (
                    <Field
                      key={l.id}
                      path={`loads.${i}.powerW`}
                      label={l.label}
                      unit="W"
                      min={0}
                      max={100}
                      value={l.powerW}
                      onChange={(n) =>
                        setDraft({
                          ...draft,
                          loads: draft.loads.map((x, j) =>
                            j === i ? { ...x, powerW: n } : x,
                          ),
                        })
                      }
                      error={errors[`loads.${i}.powerW`]}
                      help={
                        l.id === "essential"
                          ? "Essential-only / safe-mode load."
                          : l.alwaysOn
                            ? "Part of the nominal bus load."
                            : "Additional load when the activity runs."
                      }
                    />
                  ))}
                </>
              )}
              {tab === "Battery" && (
                <>
                  {num(
                    "battery",
                    "nominalEnergyWh",
                    "Battery energy",
                    "Wh",
                    1,
                    500,
                    1,
                    "Nominal usable energy before fault derating.",
                  )}
                  {num(
                    "battery",
                    "initialSocPercent",
                    "Initial State of Charge",
                    "%",
                    0,
                    100,
                    1,
                    "Energy level at mission start.",
                  )}
                  {num(
                    "battery",
                    "minimumReserveSocPercent",
                    "Reserve SOC",
                    "%",
                    0,
                    100,
                    1,
                    "Below this, defer noncritical activities.",
                  )}
                  {num(
                    "battery",
                    "safeModeSocPercent",
                    "Safe-mode entry",
                    "%",
                    0,
                    100,
                    1,
                    "Enter essential-only mode below this SOC.",
                  )}
                  {num(
                    "battery",
                    "recoverySocPercent",
                    "Recovery SOC",
                    "%",
                    0,
                    100,
                    1,
                    "Higher exit threshold provides hysteresis.",
                  )}
                  {num(
                    "battery",
                    "maximumSocPercent",
                    "Maximum SOC",
                    "%",
                    1,
                    100,
                    1,
                    "Charging above this limit is rejected.",
                  )}
                  <details className={styles.details}>
                    <summary>Efficiency, voltage & thermal</summary>
                    <div>
                      {num(
                        "battery",
                        "chargeEfficiency",
                        "Charge efficiency",
                        "fraction",
                        0.1,
                        1,
                        0.01,
                        "Fraction of charging energy stored.",
                      )}
                      {num(
                        "battery",
                        "dischargeEfficiency",
                        "Discharge efficiency",
                        "fraction",
                        0.1,
                        1,
                        0.01,
                        "Fraction of withdrawn energy delivered.",
                      )}
                      {num(
                        "battery",
                        "internalResistanceOhm",
                        "Internal resistance",
                        "Ω",
                        0,
                        1,
                        0.01,
                        "Diagnostic voltage sag and heat input.",
                      )}
                      {num(
                        "battery",
                        "recoveryDwellSeconds",
                        "Recovery dwell",
                        "s",
                        0,
                        3600,
                        10,
                        "Time continuously above recovery threshold.",
                      )}
                      {num(
                        "battery",
                        "undervoltageV",
                        "Undervoltage threshold",
                        "V",
                        0,
                        12,
                        0.1,
                        "Illustrative brownout indicator.",
                      )}
                      {draft.battery.ocvCurve.map((point, i) => (
                        <Field
                          key={i}
                          path={`ocv.${i}.voltage`}
                          label={`OCV at ${point.socPercent}% SOC`}
                          unit="V"
                          value={point.voltageV}
                          min={3}
                          max={12}
                          step={0.1}
                          onChange={(n) =>
                            setDraft({
                              ...draft,
                              battery: {
                                ...draft.battery,
                                ocvCurve: draft.battery.ocvCurve.map((p, j) =>
                                  j === i ? { ...p, voltageV: n } : p,
                                ),
                              },
                            })
                          }
                          error={
                            errors["battery.ocvCurve"] ||
                            errors[`ocv.${i}.voltage`]
                          }
                          help="Illustrative pack curve; monotonically increasing."
                        />
                      ))}
                      <label className={styles.field}>
                        <span>
                          <input
                            type="checkbox"
                            checked={draft.thermal.enabled}
                            onChange={(e) =>
                              edit("thermal", "enabled", e.target.checked)
                            }
                          />{" "}
                          Enable lumped temperature model
                        </span>
                      </label>
                      {draft.thermal.enabled && (
                        <>
                          {num(
                            "thermal",
                            "initialC",
                            "Initial temperature",
                            "°C",
                            -20,
                            60,
                            1,
                            "Initial battery temperature.",
                          )}
                          {num(
                            "thermal",
                            "busC",
                            "Bus temperature",
                            "°C",
                            -20,
                            60,
                            1,
                            "Fixed surrounding bus temperature.",
                          )}
                          {num(
                            "thermal",
                            "capacitanceJPerK",
                            "Thermal capacitance",
                            "J/K",
                            100,
                            5000,
                            100,
                            "Lumped thermal inertia.",
                          )}
                          {num(
                            "thermal",
                            "resistanceKPerW",
                            "Thermal resistance",
                            "K/W",
                            1,
                            50,
                            1,
                            "Battery-to-bus thermal resistance.",
                          )}
                          {num(
                            "thermal",
                            "externalHeatW",
                            "External heat",
                            "W",
                            0,
                            5,
                            0.1,
                            "Assumed constant heat input.",
                          )}
                        </>
                      )}
                    </div>
                  </details>
                </>
              )}
              {tab === "Schedule" && (
                <>
                  {draft.activities.map((a, i) => (
                    <details className={styles.details} key={a.id} open>
                      <summary>
                        {a.id} · {a.mode}
                      </summary>
                      <div>
                        <label className={styles.field}>
                          <span>Activity mode</span>
                          <select
                            value={a.mode}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                activities: draft.activities.map((x, j) =>
                                  j === i
                                    ? {
                                        ...x,
                                        mode: e.target.value as typeof a.mode,
                                      }
                                    : x,
                                ),
                              })
                            }
                          >
                            {[
                              "off",
                              "boot",
                              "detumble",
                              "nominal",
                              "payload",
                              "downlink",
                              "recovery",
                              "safe",
                            ].map((mode) => (
                              <option key={mode}>{mode}</option>
                            ))}
                          </select>
                        </label>
                        <Field
                          path={`activities.${i}.startSecond`}
                          label="Start time"
                          unit="h"
                          min={0}
                          max={48}
                          step={0.01}
                          value={a.startSecond / 3600}
                          onChange={(n) =>
                            setDraft({
                              ...draft,
                              activities: draft.activities.map((x, j) =>
                                j === i ? { ...x, startSecond: n * 3600 } : x,
                              ),
                            })
                          }
                          error={errors[`activities.${i}.startSecond`]}
                          help="No overlapping activities."
                        />
                        <Field
                          path={`activities.${i}.durationSeconds`}
                          label="Duration"
                          unit="min"
                          min={0.1}
                          max={2880}
                          step={0.1}
                          value={a.durationSeconds / 60}
                          onChange={(n) =>
                            setDraft({
                              ...draft,
                              activities: draft.activities.map((x, j) =>
                                j === i ? { ...x, durationSeconds: n * 60 } : x,
                              ),
                            })
                          }
                          error={errors[`activities.${i}`]}
                          help="Activity must end inside the mission."
                        />
                        <label className={styles.field}>
                          <span>
                            <input
                              type="checkbox"
                              checked={a.critical}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  activities: draft.activities.map((x, j) =>
                                    j === i
                                      ? { ...x, critical: e.target.checked }
                                      : x,
                                  ),
                                })
                              }
                            />{" "}
                            Critical activity
                          </span>
                        </label>
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              activities: draft.activities.filter(
                                (_, j) => j !== i,
                              ),
                            })
                          }
                        >
                          Remove activity
                        </button>
                      </div>
                    </details>
                  ))}
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        activities: [
                          ...draft.activities,
                          {
                            id: `activity-${Date.now()}`,
                            mode: "payload",
                            startSecond: 21600,
                            durationSeconds: 600,
                            critical: false,
                          },
                        ],
                      })
                    }
                  >
                    Add activity
                  </button>
                  <p className={styles.formNote}>
                    Off, boot, detumble, nominal, payload, downlink, recovery
                    and safe modes are supported. Safe-mode protection overrides
                    scheduled activities.
                  </p>
                </>
              )}
            </div>
            <div className={styles.controlsFooter}>
              {dirty && (
                <p className={styles.draftNotice}>
                  Inputs changed. Run to update results.
                </p>
              )}
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={busy}
              >
                <Play size={13} />
                {busy ? "Calculating…" : "Run simulation"}
              </button>
              <button
                type="button"
                className={styles.textButton}
                disabled={busy}
                onClick={() => loadPreset("Baseline")}
              >
                <RotateCcw size={12} /> Restore defaults
              </button>
            </div>
          </form>
        </div>
        <div className={styles.console}>
          <div className={styles.missionStrip}>
            <span>
              <i className={styles.statusDot} /> RECORDED SIMULATION
            </span>
            <span>
              ORBIT <b>{String(current.orbitNumber).padStart(2, "0")}</b>
            </span>
            <span>
              {current.sunlight ? <Sun size={13} /> : <Moon size={13} />}{" "}
              {current.sunlight ? "SUNLIGHT" : "ECLIPSE"}
            </span>
            <span>
              MODE <b>{current.mode.toUpperCase()}</b>
            </span>
          </div>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span>Battery state of charge</span>
              <strong>
                {current.socPercent.toFixed(1)}
                <small>%</small>
              </strong>
              <div className={styles.socTrack}>
                <span style={{ width: `${current.socPercent}%` }} />
              </div>
              <small>At selected mission time</small>
            </div>
            <div className={styles.metric}>
              <span>Solar generation</span>
              <strong>
                {current.solarW.toFixed(1)}
                <small>W</small>
              </strong>
              <small>Delivered after PMAD losses</small>
            </div>
            <div className={styles.metric}>
              <span>Spacecraft load</span>
              <strong>
                {current.loadW.toFixed(1)}
                <small>W</small>
              </strong>
              <small>{current.mode} operation</small>
            </div>
            <div className={styles.metric}>
              <span>Whole-run minimum SOC</span>
              <strong>
                {m.minSocPercent.toFixed(1)}
                <small>%</small>
              </strong>
              <small>
                {m.minSocPercent >=
                result.scenario.battery.minimumReserveSocPercent
                  ? "Above configured reserve"
                  : "Reserve threshold crossed"}
              </small>
            </div>
          </div>
          <TelemetryChart />
          <div className={styles.consoleBottom}>
            <Panel title="Power flow at selected time">
              <div className={styles.powerFlow}>
                <div>
                  Solar<b>{current.solarW.toFixed(1)} W</b>
                </div>
                <ArrowRight size={15} />
                <div>
                  Loads<b>{current.loadW.toFixed(1)} W</b>
                </div>
                <ArrowRight size={15} />
                <div>
                  {current.batteryW <= 0
                    ? "Charging surplus"
                    : "Discharge demand"}
                  <b>{Math.abs(current.batteryW).toFixed(1)} W</b>
                </div>
              </div>
              <p
                className={styles.formNote}
                style={{ padding: "0 20px 12px", margin: 0 }}
              >
                Estimated bus {current.voltageV.toFixed(2)} V ·{" "}
                {current.temperatureC === null
                  ? "Thermal model off"
                  : `${current.temperatureC.toFixed(1)} °C`}{" "}
                · DoD {current.dodPercent.toFixed(1)}%
              </p>
            </Panel>
            <Panel title="Mission event log">
              <ol
                className={styles.eventList}
                tabIndex={0}
                aria-label="Recent mission events"
              >
                {recent.map((event, i) => (
                  <li key={i}>
                    <time>{timeLabel(event.timeSeconds)}</time>
                    <span>{event.message}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
          <div className={styles.exportRow}>
            <button
              className={styles.button}
              onClick={() =>
                download(
                  "cubetwin-telemetry.csv",
                  exportCsv(result),
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              className={styles.button}
              onClick={() =>
                download("cubetwin-results.json", exportJson(result))
              }
            >
              <Download size={13} /> Run JSON
            </button>
            <label className={styles.button} style={{ cursor: "pointer" }}>
              <Upload size={13} /> Import scenario
              <input
                className={styles.srOnly}
                type="file"
                accept=".json,application/json"
                aria-label="Import scenario JSON"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 100000)
                      throw new Error(
                        "Scenario files must be smaller than 100 KB.",
                      );
                    const s = parseScenario(await file.text());
                    setDraft(s);
                    setPreset("Imported");
                    submit(s);
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Import failed.",
                    );
                  }
                  e.target.value = "";
                }}
              />
            </label>
            <span>
              <BatteryCharging size={11} style={{ verticalAlign: "middle" }} />{" "}
              Computed locally in your browser
            </span>
          </div>
        </div>
      </div>
      <details className={styles.details}>
        <summary>
          Complete run metrics, activity outcomes & telemetry table
        </summary>
        <div>
          <p className={styles.formNote}>
            Whole-run metrics below. Energy is delivered after PMAD. Consumption
            is requested load; unmet demand is recorded separately. Reserve time
            uses the state at each interval’s start. Brownout counts are
            contiguous undervoltage or unmet-demand intervals.
          </p>
          <div className={styles.summaryGrid}>
            {[
              ["Final SOC", `${m.finalSocPercent.toFixed(2)} %`],
              [
                "Minimum / maximum SOC",
                `${m.minSocPercent.toFixed(1)} / ${m.maxSocPercent.toFixed(1)} %`,
              ],
              ["Maximum DoD", `${m.maxDodPercent.toFixed(2)} %`],
              [
                "Generated / consumed",
                `${m.generatedWh.toFixed(2)} / ${m.consumedWh.toFixed(2)} Wh`,
              ],
              ["Final stored energy", `${m.batteryFinalWh.toFixed(2)} Wh`],
              [
                "Rejected / unmet energy",
                `${m.rejectedWh.toFixed(3)} / ${m.unmetWh.toFixed(3)} Wh`,
              ],
              [
                "Charge / discharge losses",
                `${m.conversionLossWh.toFixed(3)} Wh`,
              ],
              [
                "Capacity-fault removed energy",
                `${m.capacityRemovedWh.toFixed(3)} Wh`,
              ],
              [
                "Energy accounting residual",
                `${m.energyResidualWh.toExponential(2)} Wh`,
              ],
              [
                "Time below reserve",
                `${(m.belowReserveSeconds / 60).toFixed(1)} min`,
              ],
              [
                "Brownout intervals / duration",
                `${m.brownoutEvents} / ${(m.brownoutSeconds / 60).toFixed(1)} min`,
              ],
              ["Minimum terminal voltage", `${m.minVoltageV.toFixed(2)} V`],
              [
                "Temperature min / max",
                m.minTemperatureC === null
                  ? "Model disabled"
                  : `${m.minTemperatureC.toFixed(1)} / ${m.maxTemperatureC!.toFixed(1)} °C`,
              ],
              [
                "Safe-mode entries / exits",
                `${m.safeEntries} / ${m.safeExits}`,
              ],
              [
                "Energy throughput / full cycles",
                `${m.throughputWh.toFixed(2)} Wh / ${m.equivalentFullCycles.toFixed(3)}`,
              ],
              ["Net energy margin", `${m.energyMarginWh.toFixed(2)} Wh`],
              [
                "Mission completion",
                m.missionCompleted ? "Completed" : "Constrained / incomplete",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                {label}
                <b>{value}</b>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: 15, margin: "20px 0 12px" }}>
            Scheduled activity outcomes
          </h3>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Scrollable simulation data table"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Mode</th>
                  <th>Outcome</th>
                  <th>Served / requested (s)</th>
                </tr>
              </thead>
              <tbody>
                {result.activities.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.mode}</td>
                    <td>{a.status}</td>
                    <td>
                      {a.servedSeconds.toFixed(0)} / {a.requestedSeconds}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 style={{ fontSize: 15, margin: "20px 0 12px" }}>
            Per-orbit energy margin
          </h3>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Scrollable simulation data table"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Orbit</th>
                  <th>Modelled duration (min)</th>
                  <th>Generated − requested (Wh)</th>
                </tr>
              </thead>
              <tbody>
                {m.perOrbit.map((o) => (
                  <tr key={o.orbit}>
                    <td>{o.orbit}</td>
                    <td>{(o.durationSeconds / 60).toFixed(2)}</td>
                    <td>{o.marginWh.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 style={{ fontSize: 15, margin: "20px 0 12px" }}>
            Telemetry around selected time
          </h3>
          <p className={styles.formNote}>
            11 nearby samples shown. CSV contains all{" "}
            {result.samples.length.toLocaleString("en-US")} samples and units.
            Power is sampled at the timestamp; integration advances to the next
            timestamp.
          </p>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Scrollable simulation data table"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  {[
                    "Time (s)",
                    "State",
                    "Truth SOC (%)",
                    "Observed SOC (%)",
                    "Solar (W)",
                    "Load (W)",
                    "Voltage (V)",
                    "Temperature (°C)",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.samples
                  .slice(Math.max(0, cursor - 5), cursor + 6)
                  .map((s) => (
                    <tr key={s.timeSeconds}>
                      <td>{s.timeSeconds.toFixed(1)}</td>
                      <td>{s.sunlight ? "Sunlight" : "Eclipse"}</td>
                      <td>{s.socPercent.toFixed(2)}</td>
                      <td>{s.observedSocPercent?.toFixed(2) ?? "Missing"}</td>
                      <td>{s.solarW.toFixed(2)}</td>
                      <td>{s.loadW.toFixed(2)}</td>
                      <td>{s.voltageV.toFixed(2)}</td>
                      <td>{s.temperatureC?.toFixed(2) ?? "Disabled"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <h3 style={{ fontSize: 15, margin: "20px 0 12px" }}>
            Complete event history
          </h3>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Scrollable simulation data table"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Trigger / outcome</th>
                </tr>
              </thead>
              <tbody>
                {result.events.map((e, i) => (
                  <tr key={i}>
                    <td>{timeLabel(e.timeSeconds)}</td>
                    <td>{e.kind}</td>
                    <td>{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </>
  );
}
