"use client";
// Seven ways to detect a fault, run side by side on the same telemetry. Each
// shows its statistic against its own threshold and, after an injection, how
// long it took to raise an alarm.
import { DETECTION_METHODS } from "../data/fdir";
import { useTwin } from "../state/useTwin";
import { ScoreBar } from "../ui/charts";
import { InjectFault } from "../widgets/actions";
import css from "../advancedTwin.module.css";

export default function Detectors() {
  const { snapshot } = useTwin();
  if (!snapshot) {
    return (
      <p className={css.loading} role="status">
        Calibrating detectors on a healthy run…
      </p>
    );
  }
  return (
    <div className={css.twoCol}>
      <div role="group" aria-label="Detector statistics">
        {DETECTION_METHODS.map((method) => {
          const d = snapshot.detectors.find((x) => x.id === method.detector)!;
          return <ScoreBar key={method.id} label={`${method.name}${d.latency !== null ? ` · first alarm ${d.latency.toFixed(1)} s after injection` : ""}`} score={d.score} active={d.active} note={d.note} />;
        })}
      </div>
      <div>
        <p className={css.verdict} role="status">
          {snapshot.anomaly ? "Anomaly declared" : snapshot.monitoring ? "No anomaly declared" : "Detection held"}
        </p>
        <p className={css.hint}>
          {snapshot.monitoring
            ? "The bar reaches its mark at 1.00×, the detector's own threshold. An anomaly needs two independent detectors, or one redline. Inject a fault and compare when each one fires."
            : "The engine is not in mainstage. Limits and residual thresholds are mode-dependent, so health detection is held."}
        </p>
        <div className={css.options}>
          <InjectFault fault="cooling_restriction">A slow fault</InjectFault>
          <InjectFault fault="valve_restriction">A faster fault</InjectFault>
          <InjectFault fault="pc_sensor_drift">A sensor fault</InjectFault>
        </div>
      </div>
    </div>
  );
}
