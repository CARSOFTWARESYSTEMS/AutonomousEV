// Small charts for the Engineer, fault and twin views: dark, thin-lined,
// labelled, and never large enough to hide the engine. Every one draws a
// SIMULATED signal from the reference models.
import { MAINTENANCE_THRESHOLD, healthTrend, spectrum, trend, waveform } from "../simulation/bearingFault";
import type { SignalView } from "../types";
import ui from "../twin3d.module.css";

const W = 300;
const H = 92;
const PAD = 6;

const path = (values: readonly number[], min: number, max: number) =>
  values
    .map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

const CAPTION: Record<SignalView, string> = {
  time: "TIME · four shaft revolutions",
  frequency: "FREQUENCY · multiples of shaft speed",
  trend: "TREND · vibration level over simulated runs",
};

/** The bearing vibration signal, in the view asked for. `phase` scrolls the time view. */
export function SignalChart({ view, severity, phase = 0 }: { view: SignalView; severity: number; phase?: number }) {
  return (
    <figure className={ui.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Simulated bearing vibration signal: ${CAPTION[view]}`}>
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} className={ui.chartAxis} />
        {view === "time" && <path d={path(waveform(severity, 180, phase), -1.6, 1.6)} className={ui.chartLine} />}
        {view === "frequency" &&
          spectrum(severity).map((line) => {
            const x = PAD + (line.order / 8) * (W - PAD * 2);
            const top = H - PAD - Math.min(1, line.amplitude) * (H - PAD * 2);
            return <line key={line.order} x1={x} y1={H - PAD} x2={x} y2={top} className={line.defect ? ui.chartAlert : ui.chartLine} />;
          })}
        {view === "trend" && (
          <>
            <line x1={PAD} y1={H - PAD - (0.5 / 1.9) * (H - PAD * 2)} x2={W - PAD} y2={H - PAD - (0.5 / 1.9) * (H - PAD * 2)} className={ui.chartGuide} />
            <path d={path(trend(severity), 0.9, 2.8)} className={severity > 0.45 ? ui.chartAlert : ui.chartLine} />
          </>
        )}
      </svg>
      <figcaption>{CAPTION[view]}</figcaption>
    </figure>
  );
}

/** Health of the bearing across the twin's timeline: measured up to now, projected after it with a band that widens. */
export function HealthTrendChart({ severity, tau }: { severity: number; tau: number }) {
  const points = healthTrend(severity);
  const x = (t: number) => PAD + ((t + 1) / 2) * (W - PAD * 2);
  const y = (h: number) => H - PAD - h * (H - PAD * 2);
  const past = points.filter((p) => p.tau <= 0);
  const future = points.filter((p) => p.tau >= 0);
  const line = (list: typeof points) => list.map((p, i) => `${i ? "L" : "M"}${x(p.tau).toFixed(1)},${y(p.health).toFixed(1)}`).join(" ");
  const band = `${future.map((p, i) => `${i ? "L" : "M"}${x(p.tau).toFixed(1)},${y(p.high).toFixed(1)}`).join(" ")} ${[...future].reverse().map((p) => `L${x(p.tau).toFixed(1)},${y(p.low).toFixed(1)}`).join(" ")} Z`;
  return (
    <figure className={ui.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Health trend: measured up to now, predicted after it with an uncertainty band that widens, against the maintenance threshold">
        <line x1={PAD} y1={y(MAINTENANCE_THRESHOLD)} x2={W - PAD} y2={y(MAINTENANCE_THRESHOLD)} className={ui.chartGuide} />
        <path d={band} className={ui.chartBand} />
        <path d={line(past)} className={ui.chartLine} />
        <path d={line(future)} className={ui.chartDashed} />
        <line x1={x(0)} y1={PAD} x2={x(0)} y2={H - PAD} className={ui.chartAxis} />
        <line x1={x(tau)} y1={PAD} x2={x(tau)} y2={H - PAD} className={ui.chartCursor} />
      </svg>
      <figcaption>HEALTH TREND · dashed line predicted · band is uncertainty · rule is the maintenance threshold</figcaption>
    </figure>
  );
}
