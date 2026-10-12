"use client";
// State estimation, tried by hand on chamber pressure through a throttle step.
// The same simulated scenario is estimated with the chosen method; because it
// is a simulation, the true value is known and each signal's error can be
// stated.
import { useMemo, useState } from "react";
import { ESTIMATORS } from "../data/twin";
import { PRESSURE_UNIT } from "../data/pressure";
import { type EstimatorId, runEstimatorDemo } from "../simulation/estimators";
import { TraceChart } from "../ui/charts";
import css from "../advancedTwin.module.css";

const CHOICES = ESTIMATORS.filter((e): e is (typeof ESTIMATORS)[number] & { demo: EstimatorId } => e.demo !== null);
const NOISE = [0.5, 1.5, 3] as const;

export default function EstimatorLab() {
  const [estimator, setEstimator] = useState<EstimatorId>("ekf");
  const [noise, setNoise] = useState<number>(1.5);
  const [spikes, setSpikes] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const run = useMemo(() => runEstimatorDemo({ estimator, noise, spikes, mismatch }), [estimator, noise, spikes, mismatch]);
  // The EKF and the UKF are different computations. Where they give the same answer, the page says by how little they differ, and why.
  const twinGap = useMemo(() => {
    if (estimator !== "ekf" && estimator !== "ukf") return null;
    const other = runEstimatorDemo({ estimator: estimator === "ekf" ? "ukf" : "ekf", noise, spikes, mismatch });
    return Math.max(...run.estimate.map((value, i) => Math.abs(value - other.estimate[i])));
  }, [estimator, noise, spikes, mismatch, run]);
  const name = CHOICES.find((c) => c.demo === estimator)?.title ?? "";
  const rows = [
    { label: "Raw sensor", value: run.rmse.raw },
    { label: "Filtered pressure (moving average)", value: run.rmse.filtered },
    { label: "Physics prediction (model alone)", value: run.rmse.physics },
    { label: `Estimated true state (${name})`, value: run.rmse.estimate },
  ];
  const best = Math.min(...rows.map((r) => r.value));

  return (
    <div className={css.twoCol}>
      <TraceChart
        title="Chamber pressure through a throttle step"
        unit={PRESSURE_UNIT}
        span={20}
        minRange={10}
        band={run.sigma}
        lines={[
          { kind: "observed", label: "Raw sensor", values: run.raw },
          { kind: "filtered", label: "Filtered", values: run.filtered },
          { kind: "physics", label: "Physics prediction", values: run.physics },
          { kind: "truth", label: "True (simulation only)", values: run.truth },
          { kind: "estimated", label: "Estimated true state", values: run.estimate },
        ]}
      />
      <div>
        <div className={css.group}>
          <p className={css.groupLabel}>Estimator</p>
          <div className={css.options} role="group" aria-label="Estimator">
            {CHOICES.map((c) => (
              <button key={c.demo} type="button" className={css.option} aria-pressed={estimator === c.demo} onClick={() => setEstimator(c.demo)}>
                {c.title}
              </button>
            ))}
          </div>
        </div>
        <div className={css.group}>
          <p className={css.groupLabel}>Conditions</p>
          <div className={css.options}>
            <span className={css.segment} role="group" aria-label="Sensor noise">
              {NOISE.map((n) => (
                <button key={n} type="button" aria-pressed={noise === n} onClick={() => setNoise(n)}>
                  Noise {n} %
                </button>
              ))}
            </span>
            <button type="button" className={css.option} aria-pressed={spikes} onClick={() => setSpikes((v) => !v)}>
              Sensor spikes (non-Gaussian)
            </button>
            <button type="button" className={css.option} aria-pressed={mismatch} onClick={() => setMismatch((v) => !v)}>
              Model 3 % off
            </button>
          </div>
        </div>
        <table className={css.miniTable}>
          <caption>Error against the true value, root mean square, {PRESSURE_UNIT}</caption>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} data-best={row.value === best || undefined}>
                <th scope="row">{row.label}</th>
                <td>
                  {row.value.toFixed(2)}
                  {row.value === best ? " · lowest" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={css.hint}>
          {mismatch
            ? "With the model 3 % off, the physics prediction is wrong everywhere and cannot know it. The estimator is pulled back by the sensor."
            : spikes
              ? "Spikes break the Gaussian assumption. Try the particle filter, which is told that occasional large errors happen."
              : "The moving average lags the step; the estimators follow it, because their model already knows the step is coming."}
        </p>
        {twinGap !== null && (
          <p className={css.note} data-estimator-gap="">
            On this run the extended and the unscented Kalman filter differ by at most {twinGap < 0.0001 ? twinGap.toExponential(1) : twinGap.toFixed(4)} {PRESSURE_UNIT}. They are computed differently (one linearises the model, the other passes sigma points through it), but over the width of the estimate&apos;s uncertainty this chamber model is almost a straight line, so they agree. They separate when the model curves within that width.
          </p>
        )}
      </div>
    </div>
  );
}
