"use client";
// The learned models at work beside the physics: an anomaly detector that was
// given no physics, a classifier that was given physics-derived features, the
// evidence each was validated on, and the explanation of the current verdict.
import { DIAGNOSIS_BY_ID, PHYSICAL_DIAGNOSES } from "../simulation/isolation";
import { useTwin } from "../state/useTwin";
import { ScoreBar, ShareBar } from "../ui/charts";
import { InjectFault } from "../widgets/actions";
import { Diagnosis, TwinPending } from "./shared";
import css from "../advancedTwin.module.css";

const SHORT = ["Nominal", "Pump", "Valve", "Cooling", "Feed", "Injector", "Combustion", "Sensor"] as const;
/** Column heads short enough for eight columns to fit a phone. The row heads beside them spell each one out. */
const ABBREVIATED = ["Nom", "Pmp", "Vlv", "Clg", "Fed", "Inj", "Cmb", "Sns"] as const;

export default function AiLive() {
  const { snapshot, engine } = useTwin();
  if (!snapshot || !engine) {
    return (
      <TwinPending>Training the anomaly detector and the fault classifier on simulated data…</TwinPending>
    );
  }
  const { classifier, anomaly } = engine.evidence;
  const ml = snapshot.detectors.find((d) => d.id === "ml")!;
  const physics = snapshot.detectors.find((d) => d.id === "multivariate")!;
  const physical = snapshot.ranking.filter((r) => r.physics !== null);

  return (
    <div className={css.aiLive}>
      <section className={css.labCol} aria-label="Anomaly detection: learned and physics-based">
        <h4 className={css.h4}>Anomaly detection, two ways</h4>
        <ScoreBar label="Learned detector · PCA on raw telemetry, no physics" score={ml.score} active={ml.active} note={ml.note} />
        <ScoreBar label="Physics-informed · residuals against the model" score={physics.score} active={physics.active} note={physics.note} />
        <p className={css.hint} role="status">
          {snapshot.anomalyScore.outOfDistribution
            ? "The engine is in a transient or outside the trained throttle range. The learned detector has never seen this and reports itself out of distribution; its score is not counted."
            : ml.latency !== null && physics.latency !== null
              ? `After the last injection the physics-informed detector alarmed in ${physics.latency.toFixed(1)} s and the learned detector in ${ml.latency.toFixed(1)} s.`
              : physics.latency !== null
                ? `The physics-informed detector alarmed ${physics.latency.toFixed(1)} s after injection. The learned detector has not alarmed.`
                : "Both are quiet. A score of 1.00× is each detector's alarm threshold."}
        </p>
        <p className={css.note}>
          Trained on {anomaly.trainingSamples} simulated healthy points; {anomaly.components} components explain {Math.round(anomaly.explained * 100)} % of their variance. Threshold set on a separate healthy run.
        </p>
        <div className={css.options}>
          <InjectFault fault="pump_degradation">Try pump degradation</InjectFault>
          <InjectFault fault="combustion_loss">Try combustion loss</InjectFault>
        </div>
      </section>

      <section className={css.labCol} aria-label="Fault classification">
        <h4 className={css.h4}>Fault classifier · physics features + ML</h4>
        <div className={css.shares}>
          {physical.slice(0, 4).map((r) => (
            <ShareBar key={r.id} label={DIAGNOSIS_BY_ID[r.id].name} value={r.ml ?? 0} detail={`physics-based ${Math.round((r.physics ?? 0) * 100)} % · fused ${Math.round(r.p * 100)} %`} strong={r.id === physical[0].id} />
          ))}
        </div>
        <p className={css.hint}>Each bar is the learned classifier alone. Beside it, what physics-based pattern matching says, and the fused result.</p>
      </section>

      <section className={css.labCol} aria-label="Validation evidence">
        <h4 className={css.h4}>ML validation evidence · SIMULATED</h4>
        <dl className={css.rows}>
          <div>
            <dt>Training set</dt>
            <dd>
              {classifier.trainingSamples} conditions · accuracy {(100 * classifier.trainingAccuracy).toFixed(1)} %
            </dd>
          </div>
          <div>
            <dt>Validation set</dt>
            <dd>
              {classifier.validationSamples} separate conditions · accuracy {(100 * classifier.validationAccuracy).toFixed(1)} %
            </dd>
          </div>
          <div>
            <dt>Calibration</dt>
            <dd>
              Expected calibration error {classifier.calibration.ece.toFixed(3)} · Brier score {classifier.calibration.brier.toFixed(3)}, on the same validation set. {classifier.calibration.bins.filter((b) => b.count > 0).map((b) => `Stated ${Math.round(b.confidence * 100)} %: right ${Math.round(b.accuracy * 100)} % of ${b.count}`).join(" · ")}.
            </dd>
          </div>
          <div>
            <dt>Classes</dt>
            <dd>Eight: nominal and seven modelled faults. There is no class for &ldquo;something else&rdquo;.</dd>
          </div>
        </dl>
        <div className={css.tableWrap} role="region" aria-label="Confusion matrix on the validation set" tabIndex={0}>
          <table className={css.confusion}>
            <caption>Confusion matrix, validation set. Rows: true condition. Columns: predicted.</caption>
            <thead>
              <tr>
                <td />
                {SHORT.map((name, i) => (
                  <th key={name} scope="col">
                    <abbr title={name}>{ABBREVIATED[i]}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classifier.confusion.map((row, i) => (
                <tr key={PHYSICAL_DIAGNOSES[i]}>
                  <th scope="row">{SHORT[i]}</th>
                  {row.map((count, j) => (
                    <td key={j} data-diagonal={i === j || undefined} data-miss={i !== j && count > 0 ? "" : undefined}>
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={css.note}>
          SYNTHETIC DATA ONLY. Both sets come from this page&apos;s simulator. High accuracy on a simulator&apos;s own faults is evidence that the method works, not that it would work on an engine, and the calibration figures say nothing about real hardware. Given a fault outside its eight classes, the classifier still answers with one of them, sometimes confidently: the consistency check beside the verdict is what says &ldquo;none of these&rdquo;.
        </p>
      </section>

      <section className={css.labCol} aria-label="Explanation of the current verdict">
        <h4 className={css.h4}>Explainable verdict</h4>
        <Diagnosis snapshot={snapshot} />
      </section>
    </div>
  );
}
