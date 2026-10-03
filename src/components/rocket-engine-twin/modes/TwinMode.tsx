// TWIN: the model set against the state. One engine, solid, is what is
// observed; the pale outline over it is what the reference model expects.
// The panel names the four states and the difference between two of them.
import { RESIDUAL_TEXT, TWIN_SUBJECT, TWIN_TIMELINE } from "../data/twinContent";
import { frame } from "../scene/frameState";
import { type TwinReading, twinReading, uncertaintyLabel } from "../simulation/bearingFault";
import { useSampled } from "../state/clocks";
import { useRocketTwinStore } from "../state/twinStore";
import { HealthTrendChart } from "../ui/charts";
import { CredibilityCard } from "../ui/Credibility";
import { Action, Panel, Rows } from "../ui/panels";
import ui from "../twin3d.module.css";

const readSeverity = () => Math.round(frame.severity * 100) / 100;
const signed = (v: number) => `${v > 0.005 ? "+" : v < -0.005 ? "−" : ""}${Math.abs(v).toFixed(1)}`;

/** The four states and their difference, in words. With `numbers`, the normalised values are added. */
export function twinRows(reading: TwinReading, severity: number, tau: number, numbers: boolean): { label: string; value: string; state?: string }[] {
  const future = reading.observed === null;
  const residual = reading.residual ?? 0;
  const health = reading.estimated ?? 1;
  const n = (text: string, value: string) => (numbers ? `${text} · ${value}` : text);
  return [
    { label: "OBSERVED", value: future ? "Not yet observed" : n(residual > 0.25 ? "Vibration above baseline" : residual > 0.05 ? "Vibration slightly above baseline" : "Vibration within baseline", `${reading.observed!.toFixed(1)} × baseline`) },
    { label: "ESTIMATED", value: future ? "No estimate ahead of the data" : n(health >= 0.86 ? "Bearing healthy" : health >= 0.4 ? "Bearing health degrading" : "Bearing degraded", `health ${health.toFixed(1)}`) },
    { label: "EXPECTED", value: n("Nominal vibration envelope", "1.0 × baseline") },
    { label: "RESIDUAL", value: future ? "Projected to grow" : n(residual > 0.05 ? "Positive deviation" : "None", signed(residual)), state: residual > 0.25 ? "degraded" : residual > 0.05 ? "monitor" : undefined },
    { label: "PREDICTED", value: severity <= 0.01 ? "No change expected" : `Maintenance action likely within a future operating window · uncertainty ${uncertaintyLabel(Math.max(tau, 0.5), severity)}` },
  ];
}

export function TwinRight() {
  const tau = useRocketTwinStore((s) => s.twinTime);
  const audience = useRocketTwinStore((s) => s.audience);
  const residual = useRocketTwinStore((s) => s.residual);
  const credibility = useRocketTwinStore((s) => s.credibility);
  const fault = useRocketTwinStore((s) => s.bearing !== null);
  const store = useRocketTwinStore.getState();
  const severity = useSampled(readSeverity, 4);
  const engineer = audience === "engineer";
  const reading = twinReading(tau, severity);

  return (
    <Panel title="DIGITAL TWIN" tag="SIMULATED · REFERENCE" label="Digital twin comparison">
      <p className={ui.groupLabel}>{TWIN_SUBJECT}</p>
      <Rows rows={twinRows(reading, severity, tau, engineer)} />
      {residual && (
        <div className={ui.card}>
          <p className={ui.formula}>{RESIDUAL_TEXT.formula}</p>
          <p className={ui.small}>{RESIDUAL_TEXT.learn}</p>
        </div>
      )}
      {(engineer || tau > 0.02) && fault && <HealthTrendChart severity={severity} tau={tau} />}
      <div className={ui.actions}>
        <Action primary pressed={residual} label="Show residual: observed minus expected" onClick={store.toggleResidual}>
          SHOW RESIDUAL
        </Action>
        <Action pressed={credibility} onClick={store.toggleCredibility}>
          MODEL CREDIBILITY
        </Action>
        {!fault && (
          <Action label="Introduce bearing degradation: a simulated fault scenario" onClick={store.introduceBearingFault}>
            INTRODUCE BEARING DEGRADATION
          </Action>
        )}
      </div>
      {credibility && <CredibilityCard id={tau > 0.02 ? "prognosis" : "health"} />}
    </Panel>
  );
}

export function TwinDock() {
  const tau = useRocketTwinStore((s) => s.twinTime);
  const setTwinTime = useRocketTwinStore((s) => s.setTwinTime);
  return (
    <div className={ui.controls}>
      <label className={ui.slider} data-wide="true">
        <span>{TWIN_TIMELINE[0]}</span>
        <input type="range" min={-100} max={100} step={1} value={Math.round(tau * 100)} aria-label="Twin timeline: past, now, future" aria-valuetext={tau < -0.02 ? "Past" : tau > 0.02 ? "Future, predicted" : "Now"} onChange={(event) => setTwinTime(Number(event.target.value) / 100)} />
        <span>{TWIN_TIMELINE[2]}</span>
      </label>
      <Action pressed={Math.abs(tau) < 0.02} onClick={() => setTwinTime(0)}>
        {TWIN_TIMELINE[1]}
      </Action>
    </div>
  );
}
