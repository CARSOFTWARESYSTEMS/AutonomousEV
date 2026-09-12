"use client";
import { useState } from "react";
import { FlaskConical, Play, RotateCcw } from "lucide-react";
import {
  FAULT_INFO,
  FAULT_TYPES,
  type FaultType,
  cloneScenario,
} from "@/lib/cubetwin/scenario";
import { useSimulation } from "./SimulationProvider";
import styles from "../cubetwin.module.css";
export default function FaultLab() {
  const {
    result,
    baseline,
    cursor,
    run,
    busy,
    monteCarlo,
    runMonteCarlo,
    setCursor,
    error,
  } = useSimulation();
  const [type, setType] = useState<FaultType>("solar-degradation"),
    [start, setStart] = useState(4),
    [duration, setDuration] = useState(8),
    [severity, setSeverity] = useState(0.35),
    [trials, setTrials] = useState(50),
    [uncertainty, setUncertainty] = useState(10),
    [seed, setSeed] = useState(20260930);
  const info = FAULT_INFO[type],
    current = result.samples[cursor],
    m = result.metrics,
    b = baseline.metrics;
  const apply = () => {
    const s = cloneScenario(result.scenario);
    s.faults = [
      {
        id: "lab-fault",
        type,
        startSecond: start * 3600,
        durationSeconds: duration * 3600,
        severity,
      },
    ];
    run(s);
  };
  const format = (n: number, unit: string) => `${n.toFixed(2)} ${unit}`;
  return (
    <>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.faultGrid}>
        <div className={`${styles.panel} ${styles.faultControls}`}>
          <label className={styles.field}>
            <span>Choose an experiment</span>
            <select
              value={type}
              onChange={(e) => {
                const next = e.target.value as FaultType;
                setType(next);
                setSeverity(FAULT_INFO[next].defaultSeverity);
              }}
            >
              {FAULT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {FAULT_INFO[t].name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.faultDescription}>
            <h3>{info.name}</h3>
            <p>{info.description}</p>
            <p style={{ color: "#c0d9d6", marginTop: 9 }}>{info.effect}</p>
          </div>
          <div className={styles.inlineFields} style={{ marginTop: 20 }}>
            <label className={styles.field}>
              <span>
                Start time <small>h</small>
              </span>
              <input
                type="number"
                min={0}
                max={48}
                step={0.1}
                value={Number.isFinite(start) ? start : ""}
                onChange={(e) =>
                  setStart(e.target.value === "" ? NaN : +e.target.value)
                }
              />
            </label>
            <label className={styles.field}>
              <span>
                Duration <small>h</small>
              </span>
              <input
                type="number"
                min={0.01}
                max={48}
                step={0.1}
                value={Number.isFinite(duration) ? duration : ""}
                onChange={(e) =>
                  setDuration(e.target.value === "" ? NaN : +e.target.value)
                }
              />
            </label>
          </div>
          <label className={styles.field}>
            <span>
              Severity <small>{info.unit}</small>
            </span>
            <input
              type="number"
              min={type === "soc-bias" ? -50 : 0}
              max={info.max}
              step={info.max <= 1 ? 0.05 : 1}
              value={Number.isFinite(severity) ? severity : ""}
              onChange={(e) =>
                setSeverity(e.target.value === "" ? NaN : +e.target.value)
              }
            />
            <small>
              Exact effect: {info.unit}. The entire fault window must fit the
              mission.
            </small>
          </label>
          <button
            className={styles.primaryButton}
            disabled={busy}
            onClick={apply}
          >
            <FlaskConical size={14} />
            {busy ? "Calculating…" : "Run fault experiment"}
          </button>
          <button
            className={styles.textButton}
            disabled={busy}
            onClick={() => run({ ...result.scenario, faults: [] })}
          >
            <RotateCcw size={12} /> Clear all injected faults
          </button>
          <p className={styles.formNote}>
            This experiment replaces existing faults. Import a scenario JSON to
            combine fault windows.
          </p>
        </div>
        <div className={`${styles.panel} ${styles.faultComparison}`}>
          <div className={styles.cardTag}>BASELINE VS. EXPERIMENT</div>
          <h3>Change one thing. See the consequence.</h3>
          <p>
            The baseline uses the current mission configuration with all faults
            removed. Both runs use identical models and schedules.
          </p>
          <div className={styles.activeFaults}>
            {result.scenario.faults.length ? (
              result.scenario.faults.map((f) => (
                <span key={f.id}>
                  {FAULT_INFO[f.type].name} ·{" "}
                  {(f.startSecond / 3600).toFixed(1)}–
                  {((f.startSecond + f.durationSeconds) / 3600).toFixed(1)} h
                </span>
              ))
            ) : (
              <span>No faults injected · baseline active</span>
            )}
          </div>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Scrollable simulation data table"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Whole-run metric</th>
                  <th>Baseline</th>
                  <th>Experiment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Minimum SOC",
                    format(b.minSocPercent, "%"),
                    format(m.minSocPercent, "%"),
                  ],
                  [
                    "Final SOC",
                    format(b.finalSocPercent, "%"),
                    format(m.finalSocPercent, "%"),
                  ],
                  [
                    "Energy margin",
                    format(b.energyMarginWh, "Wh"),
                    format(m.energyMarginWh, "Wh"),
                  ],
                  [
                    "Below reserve",
                    format(b.belowReserveSeconds / 60, "min"),
                    format(m.belowReserveSeconds / 60, "min"),
                  ],
                  [
                    "Minimum voltage",
                    format(b.minVoltageV, "V"),
                    format(m.minVoltageV, "V"),
                  ],
                  ["Safe-mode entries", b.safeEntries, m.safeEntries],
                  [
                    "Unmet energy",
                    format(b.unmetWh, "Wh"),
                    format(m.unmetWh, "Wh"),
                  ],
                ].map(([label, a, c]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{a}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.truthGrid}>
            <div>
              PHYSICAL TRUTH<strong>{current.socPercent.toFixed(1)}%</strong>
              <small>Authoritative simulated SOC</small>
            </div>
            <div>
              OBSERVED TELEMETRY
              <strong>
                {current.observedSocPercent === null
                  ? "Missing"
                  : `${current.observedSocPercent.toFixed(1)}%`}
              </strong>
              <small>Reading at selected time</small>
            </div>
            <div>
              DETECTOR STATUS
              <strong style={{ fontSize: 12 }}>{current.detector}</strong>
              <small>Threshold-based teaching detector</small>
            </div>
          </div>
          <p className={styles.formNote}>
            Fault injection is not proof of detection. The SOC discrepancy
            detector uses simulated truth; real detection requires independent
            measurements.
          </p>
          <label className={styles.field} style={{ marginTop: 15 }}>
            <span>
              Inspect experiment time{" "}
              <small>{(current.timeSeconds / 3600).toFixed(2)} h</small>
            </span>
            <input
              type="range"
              min={0}
              max={result.samples.length - 1}
              value={cursor}
              onChange={(e) => setCursor(+e.target.value)}
              aria-label="Fault inspection time"
            />
          </label>
        </div>
      </div>
      <div className={styles.monte}>
        <div>
          <div className={styles.cardTag}>GO BEYOND A SINGLE RUN</div>
          <h3>How sensitive is your mission?</h3>
          <p>
            Sample battery capacity, solar output, total subsystem load and
            resistance independently from uniform ± ranges. Seeded trials run in
            a worker. Bounds are clipped to the scenario limits; temperature and
            faults stay fixed.
          </p>
          <p className={styles.formNote}>
            A trial succeeds when all activities complete with no unmet load or
            undervoltage. This is a simulated probability under stated
            assumptions.
          </p>
        </div>
        <div className={styles.monteInputs}>
          <label className={styles.field}>
            <span>
              Trials <small>1–100</small>
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={Number.isFinite(trials) ? trials : ""}
              onChange={(e) =>
                setTrials(e.target.value === "" ? NaN : +e.target.value)
              }
            />
          </label>
          <label className={styles.field}>
            <span>
              Uncertainty <small>± %</small>
            </span>
            <input
              type="number"
              min={0}
              max={30}
              value={Number.isFinite(uncertainty) ? uncertainty : ""}
              onChange={(e) =>
                setUncertainty(e.target.value === "" ? NaN : +e.target.value)
              }
            />
          </label>
          <label className={styles.field}>
            <span>Random seed</span>
            <input
              type="number"
              min={0}
              max={4294967295}
              value={Number.isFinite(seed) ? seed : ""}
              onChange={(e) =>
                setSeed(e.target.value === "" ? NaN : +e.target.value)
              }
            />
          </label>
          {seed !== result.scenario.seed ? (
            <button
              className={styles.button}
              disabled={busy}
              onClick={() => run({ ...result.scenario, seed })}
            >
              Apply seed {seed} to mission
            </button>
          ) : (
            <button
              className={styles.button}
              disabled={busy}
              onClick={() => runMonteCarlo(trials, uncertainty)}
            >
              <Play size={13} />
              {busy ? "Running trials…" : "Run Monte Carlo"}
            </button>
          )}
        </div>
        {monteCarlo && (
          <div className={styles.monteResult} role="status">
            <div>
              Simulated completion probability
              <strong>
                {(monteCarlo.completionProbability * 100).toFixed(1)}%
              </strong>
              {monteCarlo.trials} trials · seed {monteCarlo.seed}
            </div>
            <div>
              95% Wilson sampling interval
              <strong>
                {monteCarlo.completionInterval95
                  .map((n) => (n * 100).toFixed(1))
                  .join("–")}
                %
              </strong>
              Does not include model uncertainty
            </div>
            <div>
              Probability below reserve
              <strong>
                {(monteCarlo.belowReserveProbability * 100).toFixed(1)}%
              </strong>
              Minimum SOC range:{" "}
              {Math.min(...monteCarlo.minimumSocDistribution).toFixed(1)}–
              {Math.max(...monteCarlo.minimumSocDistribution).toFixed(1)}%
            </div>
            <details className={styles.details} style={{ gridColumn: "1/-1" }}>
              <summary>Trial distribution: minimum SOC (%)</summary>
              <div
                className={styles.tableWrap}
                tabIndex={0}
                role="region"
                aria-label="Scrollable simulation data table"
              >
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Trial</th>
                      <th>Minimum SOC (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monteCarlo.minimumSocDistribution.map((value, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{value.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </div>
    </>
  );
}
