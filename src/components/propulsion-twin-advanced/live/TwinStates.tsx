"use client";
// The core Digital Twin states, live, for one quantity: chamber pressure.
// Observed, estimated, expected and predicted on one chart, with the residual
// and the health interpretation beside them.
import { TWIN_STATES } from "../data/twin";
import { PRESSURE_UNIT } from "../data/pressure";
import { useTwin } from "../state/useTwin";
import { fmt, signed } from "../ui/charts";
import { InjectFault } from "../widgets/actions";
import { ChamberChart } from "./shared";
import css from "../advancedTwin.module.css";

export default function TwinStates() {
  const { snapshot } = useTwin();
  if (!snapshot) {
    return (
      <p className={css.loading} role="status">
        Calibrating the twin…
      </p>
    );
  }
  const { chamber, prognosis } = snapshot;
  const last = prognosis.chamber.at(-1)!;
  const residual = chamber.estimated - chamber.expected;
  const value: Record<(typeof TWIN_STATES)[number]["id"], string> = {
    observed: `A ${fmt(snapshot.channels.pcA.observed)} · B ${fmt(snapshot.channels.pcB.observed)}`,
    estimated: `${fmt(chamber.estimated)} ± ${fmt(2 * chamber.sigma)}`,
    expected: fmt(chamber.expected),
    predicted: `${fmt(last.mean)} ± ${fmt(2 * last.sigma)} in ${last.horizon} s`,
    residual: `${signed(residual)} (${signed(snapshot.symptomZ.pc, 1)} σ)`,
    health: `${snapshot.status.health} · ${snapshot.ranking[0].id === "nominal" ? "no fault indicated" : `${Math.round(snapshot.ranking[0].p * 100)} % ${snapshot.ranking[0].id.replace(/_/g, " ")}`}`,
  };
  return (
    <div className={css.twoCol}>
      <ChamberChart all />
      <div>
        <dl className={css.stateList}>
          {TWIN_STATES.map((state) => (
            <div key={state.id}>
              <dt>{state.label}</dt>
              <dd>
                <b>{value[state.id]}</b>
                <span>{state.line}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className={css.note}>Chamber pressure, {PRESSURE_UNIT} · SIMULATED. The virtual sensor reads {fmt(chamber.virtual)}.</p>
        <div className={css.options}>
          <InjectFault fault="pc_sensor_drift">Make the observed leave the estimated</InjectFault>
          <InjectFault fault="pump_degradation">Make the estimated leave the expected</InjectFault>
        </div>
      </div>
    </div>
  );
}
