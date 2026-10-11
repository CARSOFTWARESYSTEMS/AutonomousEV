"use client";
// Prognostics, live: the health of each inferred parameter, the one that is
// driving the outlook, and the quantity it threatens projected against its
// limit, with a band that widens the further ahead it looks.
import { useEffect } from "react";
import { trackAdvancedTwinOnce } from "../analytics";
import { PROGNOSTICS_LIMIT } from "../data/course";
import { HEALTH_PARAMS } from "../simulation/symptoms";
import { useLabStore } from "../state/labStore";
import { useTwin } from "../state/useTwin";
import { ShareBar, TraceChart, fmt, signed } from "../ui/charts";
import { InjectFault } from "../widgets/actions";
import css from "../advancedTwin.module.css";

/** History of the quantity the outlook is about, rebuilt from the channels it is made of. */
function useHistory(quantity: string): number[] {
  const engine = useLabStore((s) => s.engine);
  useLabStore((s) => s.tick);
  if (!engine) return [];
  if (quantity === "Coolant temperature rise") return engine.series("estimated", "tCool");
  if (quantity === "Oxidiser pump suction margin") {
    const inlet = engine.series("estimated", "pInOx");
    const speed = engine.series("estimated", "speed");
    return inlet.map((p, i) => (p - 1.2) / (1.6 * Math.max(0.05, speed[i] / 100) ** 2));
  }
  return engine.chamberSeries().estimated;
}

const seconds = (value: number | null) => (value === null ? "beyond 60 s" : value <= 0 ? "now" : `${Math.round(value)} s`);

export default function Prognostics() {
  const { snapshot, engine } = useTwin();
  const history = useHistory(snapshot?.prognosis.quantity ?? "");
  useEffect(() => trackAdvancedTwinOnce("prediction_opened"), []);
  if (!snapshot || !engine) {
    return (
      <p className={css.loading} role="status">
        Calibrating the twin…
      </p>
    );
  }
  const p = snapshot.prognosis;
  const driver = HEALTH_PARAMS.find((h) => h.id === p.driver);
  const o = p.outlook;

  return (
    <div className={css.prognostics}>
      <div className={css.twoCol}>
        <TraceChart
          title={p.quantity}
          unit={p.unit}
          span={engine.historyLength * engine.historyStep}
          lines={[{ kind: "estimated", label: "Estimated", values: history }]}
          future={{ horizon: p.points.map((x) => x.horizon), mean: p.points.map((x) => x.mean), sigma: p.points.map((x) => x.sigma) }}
          limit={{ value: p.limit, label: p.below ? "lower limit" : "upper limit" }}
          minRange={Math.max(0.2, Math.abs(p.limit) * 0.12)}
        >
          <p className={css.readout}>Dotted: projection. Band: ±2σ, widening with the horizon. Limits are illustrative.</p>
        </TraceChart>
        <div>
          <ul className={css.tiles} aria-label="Outlook" data-compact="">
            <li className={css.tile}>
              <span className={css.tileLabel}>HEALTH INDEX</span>
              <span className={css.tileValue}>{Math.round(p.healthIndex)} / 100</span>
              <span className={css.tileDetail}>{snapshot.status.health}</span>
            </li>
            <li className={css.tile}>
              <span className={css.tileLabel}>REMAINING MARGIN</span>
              <span className={css.tileValue}>{Math.round(p.margin)} %</span>
              <span className={css.tileDetail}>of the healthy margin to the limit</span>
            </li>
            <li className={css.tile}>
              <span className={css.tileLabel}>PROBABILITY OF CROSSING</span>
              <span className={css.tileValue}>{Math.round(o.probability * 100)} %</span>
              <span className={css.tileDetail}>beyond the limit in 60 s</span>
            </li>
            <li className={css.tile}>
              <span className={css.tileLabel}>TIME TO LIMIT</span>
              <span className={css.tileValue}>{seconds(o.timeToLimit)}</span>
              <span className={css.tileDetail}>
                range {seconds(o.earliest)} to {seconds(o.latest)}
              </span>
            </li>
          </ul>
          <dl className={css.rows} role="status">
            <div>
              <dt>Degradation trend</dt>
              <dd>{driver ? `${driver.label}: ${signed(100 * p.rate, 2)} ± ${(100 * p.rateError).toFixed(2)} % per second` : "No inferred parameter is outside its healthy scatter."}</dd>
            </div>
            <div>
              <dt>Recommendation to consider</dt>
              <dd>{p.recommendation}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <p className={css.groupLabel}>Inferred health parameters · share of each action limit used</p>
        <div className={css.shares}>
          {snapshot.health.map((h) => {
            const def = HEALTH_PARAMS.find((x) => x.id === h.id)!;
            return <ShareBar key={h.id} label={def.label} value={h.used} detail={`${signed(100 * h.deviation, 1)} % from calibration · action at ${signed(100 * def.limit, 0)} %`} strong={h.id === p.driver} />;
          })}
        </div>
        <p className={css.note}>
          {fmt(p.now)} {p.unit} now, limit {fmt(p.limit)}. SIMULATED. {PROGNOSTICS_LIMIT}
        </p>
        <div className={css.options}>
          <InjectFault fault="feed_pressure_reduction">Watch a margin run out before anything fails</InjectFault>
          <InjectFault fault="pump_degradation">Watch chamber pressure approach its limit</InjectFault>
        </div>
      </div>
    </div>
  );
}
