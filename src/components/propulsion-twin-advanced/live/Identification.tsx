"use client";
// Parameter identification and the evidence behind the twin's models, as
// produced when the twin was built in this browser a moment ago.
import { useTwin } from "../state/useTwin";
import { PRESSURE_UNIT } from "../data/pressure";
import { VV_RULE } from "../data/twin";
import { ShareBar } from "../ui/charts";
import css from "../advancedTwin.module.css";

export default function Identification() {
  const { engine } = useTwin();
  if (!engine) {
    return (
      <p className={css.loading} role="status">
        Identifying parameters…
      </p>
    );
  }
  const { evidence } = engine;
  const worst = Math.max(evidence.errorBefore, evidence.errorAfter);
  return (
    <div className={css.twoCol}>
      <div>
        <p className={css.groupLabel}>Model error across the pressure channels, {PRESSURE_UNIT}</p>
        <ShareBar label="Design values" value={evidence.errorBefore / worst} detail={`${evidence.errorBefore.toFixed(2)} RMS`} />
        <ShareBar label="Identified parameters" value={evidence.errorAfter / worst} detail={`${evidence.errorAfter.toFixed(2)} RMS`} strong />
        <p className={css.hint}>
          Fitted to {evidence.identificationSamples} simulated steady test points at five throttle settings. What remains after identification is sensor noise and the scatter the model does not represent: it is the floor, and it is why residuals are judged against a healthy baseline and not against zero.
        </p>
      </div>
      <div>
        <p className={css.groupLabel}>{VV_RULE}</p>
        <dl className={css.rows}>
          <div>
            <dt>Identification data</dt>
            <dd>{evidence.identificationSamples} simulated points · used to fit parameters</dd>
          </div>
          <div>
            <dt>Healthy baseline run</dt>
            <dd>A separate simulated run with throttle steps · used to set baselines and thresholds</dd>
          </div>
          <div>
            <dt>Classifier training</dt>
            <dd>{evidence.classifier.trainingSamples} simulated conditions</dd>
          </div>
          <div>
            <dt>Classifier validation</dt>
            <dd>{evidence.classifier.validationSamples} simulated conditions from a different generator, never trained on</dd>
          </div>
        </dl>
        <p className={css.note}>All of it SIMULATED. Independent of the fit, not independent of the simulator: none of this is validation against hardware.</p>
      </div>
    </div>
  );
}
