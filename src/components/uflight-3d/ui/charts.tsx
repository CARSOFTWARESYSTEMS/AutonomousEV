// Charts, drawn directly as SVG: the vibration signal in its three domains,
// the health trajectory with its uncertainty band, and proportion bars.
// One series each, thin marks, recessive grid, values readable without hover.
import { useId, useMemo, useState } from "react";
import type { SignalDomain } from "../types";
import { PROVENANCE } from "../data/uflightReferenceAircraft";
import { HORIZON_CYCLES, MAINTENANCE_THRESHOLD, healthTrajectory } from "../simulation/prognostics";
import { type VibrationSignal, amplitudeNear } from "../simulation/signals";
import theme from "../theme.module.css";
import ui from "../uflight.module.css";

const W = 316;
const H = 140;
const PAD = { left: 30, right: 8, top: 14, bottom: 22 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

interface DomainSpec {
  title: string;
  xLabel: string;
  yLabel: string;
  /** Fixed vertical scale, so growth is seen as growth rather than rescaled away. */
  yMin: number;
  yMax: number;
  ticks: readonly number[];
  format: (x: number) => string;
}

const DOMAINS: Record<SignalDomain, DomainSpec> = {
  time: { title: "Waveform", xLabel: "time, s", yLabel: "acceleration", yMin: -5, yMax: 5, ticks: [0, 0.1, 0.2, 0.3], format: (x) => `${x.toFixed(3)} s` },
  frequency: { title: "FFT spectrum", xLabel: "frequency, Hz", yLabel: "amplitude", yMin: 0, yMax: 2.2, ticks: [0, 50, 100, 150, 200, 250], format: (x) => `${x.toFixed(0)} Hz` },
  order: { title: "Order spectrum", xLabel: "shaft order", yLabel: "amplitude", yMin: 0, yMax: 2.2, ticks: [0, 2, 4, 6, 8, 10, 12], format: (x) => `${x.toFixed(2)}×` },
};

export const SIGNAL_DOMAINS: readonly { id: SignalDomain; label: string }[] = [
  { id: "time", label: "TIME" },
  { id: "frequency", label: "FREQUENCY" },
  { id: "order", label: "ORDER" },
];

export function SignalChart({ signal, domain, subject }: { signal: VibrationSignal; domain: SignalDomain; subject: string }) {
  const spec = DOMAINS[domain];
  const series = signal[domain];
  const markers = domain === "frequency" ? signal.frequencyMarkers : domain === "order" ? signal.orderMarkers : [];
  const [cursor, setCursor] = useState<number | null>(null);
  const xMax = spec.ticks[spec.ticks.length - 1];
  const sx = (x: number) => PAD.left + (Math.min(x, xMax) / xMax) * PLOT_W;
  const sy = (y: number) => PAD.top + (1 - (Math.min(spec.yMax, Math.max(spec.yMin, y)) - spec.yMin) / (spec.yMax - spec.yMin)) * PLOT_H;

  let path = "";
  for (let i = 0; i < series.x.length; i++) {
    if (series.x[i] > xMax) break;
    path += `${i === 0 ? "M" : "L"}${sx(series.x[i]).toFixed(1)} ${sy(series.y[i]).toFixed(1)}`;
  }

  const fault = markers.find((m) => m.fault);
  const faultAmplitude = fault ? amplitudeNear(series, fault.x) : 0;
  const summary =
    domain === "time"
      ? `${PROVENANCE.signal}. Vibration waveform of ${subject}. RMS level ${signal.rms.toFixed(2)} simulated units.`
      : `${PROVENANCE.signal}. ${spec.title} of ${subject}. Bearing feature at ${fault ? spec.format(fault.x) : "—"}: amplitude ${faultAmplitude.toFixed(2)}.`;

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (((event.clientX - box.left) / box.width) * W - PAD.left) / PLOT_W;
    if (x < 0 || x > 1) return setCursor(null);
    const target = x * xMax;
    let nearest = 0;
    for (let i = 1; i < series.x.length; i++) if (Math.abs(series.x[i] - target) < Math.abs(series.x[nearest] - target)) nearest = i;
    setCursor(nearest);
  };

  return (
    <figure className={ui.chart} data-testid="signal-chart" data-domain={domain}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} onPointerMove={onMove} onPointerLeave={() => setCursor(null)}>
        {/* Grid: hairlines at the tick positions and the zero line. */}
        {spec.ticks.map((tick) => (
          <line key={tick} className={ui.chartGrid} x1={sx(tick)} x2={sx(tick)} y1={PAD.top} y2={PAD.top + PLOT_H} />
        ))}
        <line className={ui.chartAxis} x1={PAD.left} x2={PAD.left + PLOT_W} y1={sy(0)} y2={sy(0)} />
        {markers.map((marker) => (
          <g key={marker.label}>
            <line className={ui.chartMarker} data-fault={marker.fault} x1={sx(marker.x)} x2={sx(marker.x)} y1={PAD.top} y2={PAD.top + PLOT_H} />
            <text className={`${ui.chartText} ${marker.fault ? ui.chartTextStrong : ""}`} x={sx(marker.x) + 3} y={PAD.top + (marker.fault ? 8 : 18)}>
              {marker.label}
            </text>
          </g>
        ))}
        <path className={ui.chartLine} d={path} />
        {spec.ticks.map((tick) => (
          <text key={tick} className={ui.chartText} x={sx(tick)} y={H - 8} textAnchor="middle">
            {tick}
          </text>
        ))}
        <text className={ui.chartText} x={PAD.left - 5} y={sy(spec.yMax) + 3} textAnchor="end">
          {spec.yMax}
        </text>
        <text className={ui.chartText} x={PAD.left - 5} y={sy(0) + 3} textAnchor="end">
          0
        </text>
        {cursor !== null && (
          <>
            <line className={ui.chartCursor} x1={sx(series.x[cursor])} x2={sx(series.x[cursor])} y1={PAD.top} y2={PAD.top + PLOT_H} />
            <circle className={ui.chartDot} cx={sx(series.x[cursor])} cy={sy(series.y[cursor])} r={4} />
          </>
        )}
      </svg>
      {cursor !== null && (
        <span className={ui.chartTip}>
          {spec.format(series.x[cursor])} · {series.y[cursor].toFixed(2)}
        </span>
      )}
      <figcaption className={ui.chartCaption}>
        <span>{spec.xLabel}</span>
        <span>{PROVENANCE.signal}</span>
      </figcaption>
    </figure>
  );
}

const PW = 316;
const PH = 156;
const PPAD = { left: 30, right: 10, top: 16, bottom: 24 };

/**
 * Health index against flight cycles: recorded history as a solid line, the
 * projection dashed inside its uncertainty band, and the maintenance threshold.
 * `cursor` marks the point selected on the twin's time control.
 */
export function PrognosisChart({ severity, window, cursor, subject }: { severity: number; window: { fromCycles: number; toCycles: number } | null; cursor?: number; subject: string }) {
  const clip = useId();
  const points = useMemo(() => healthTrajectory(severity, 5), [severity]);
  const plotW = PW - PPAD.left - PPAD.right;
  const plotH = PH - PPAD.top - PPAD.bottom;
  const sx = (cycles: number) => PPAD.left + ((cycles + HORIZON_CYCLES) / (2 * HORIZON_CYCLES)) * plotW;
  const sy = (health: number) => PPAD.top + (1 - health) * plotH;
  const line = (list: typeof points) => list.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.cycles).toFixed(1)} ${sy(p.mean).toFixed(1)}`).join("");
  const past = points.filter((p) => p.cycles <= 0);
  const future = points.filter((p) => p.cycles >= 0);
  const band = `${future.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.cycles).toFixed(1)} ${sy(p.high).toFixed(1)}`).join("")}${[...future]
    .reverse()
    .map((p) => `L${sx(p.cycles).toFixed(1)} ${sy(p.low).toFixed(1)}`)
    .join("")}Z`;
  const now = points.find((p) => p.cycles === 0)!;
  const at = cursor !== undefined && cursor !== 0 ? points.reduce((best, p) => (Math.abs(p.cycles - cursor) < Math.abs(best.cycles - cursor) ? p : best)) : null;
  const summary = `Simulated health trajectory of ${subject}. Health index now ${now.mean.toFixed(2)}; maintenance threshold ${MAINTENANCE_THRESHOLD}. ${
    window ? `Suggested maintenance window: within the next ${window.fromCycles} to ${window.toCycles} flight cycles.` : "No maintenance window: no trend established."
  }`;

  return (
    <figure className={ui.chart} data-testid="prognosis-chart">
      <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={summary}>
        <defs>
          <clipPath id={clip}>
            <rect x={PPAD.left} y={PPAD.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>
        {[0, 0.5, 1].map((v) => (
          <line key={v} className={ui.chartGrid} x1={PPAD.left} x2={PPAD.left + plotW} y1={sy(v)} y2={sy(v)} />
        ))}
        {/* The suggested maintenance window, where the band meets the threshold. */}
        {window && <rect className={ui.chartRange} x={sx(window.fromCycles)} width={Math.max(2, sx(Math.min(window.toCycles, HORIZON_CYCLES)) - sx(window.fromCycles))} y={PPAD.top} height={plotH} />}
        <g clipPath={`url(#${clip})`}>
          <path className={ui.chartBand} d={band} />
          <path className={`${ui.chartLine} ${ui.chartLineStrong}`} d={line(past)} />
          <path className={`${ui.chartLine} ${ui.chartLineStrong} ${ui.chartProjection}`} d={line(future)} />
        </g>
        <line className={ui.chartThreshold} x1={PPAD.left} x2={PPAD.left + plotW} y1={sy(MAINTENANCE_THRESHOLD)} y2={sy(MAINTENANCE_THRESHOLD)} />
        <text className={ui.chartText} x={PPAD.left + 4} y={sy(MAINTENANCE_THRESHOLD) + 11}>
          MAINTENANCE THRESHOLD
        </text>
        <line className={ui.chartAxis} x1={sx(0)} x2={sx(0)} y1={PPAD.top} y2={PPAD.top + plotH} />
        <circle className={ui.chartDot} cx={sx(0)} cy={sy(now.mean)} r={4} />
        {at && (
          <>
            <line className={ui.chartCursor} x1={sx(at.cycles)} x2={sx(at.cycles)} y1={PPAD.top} y2={PPAD.top + plotH} />
            <circle className={ui.chartDot} cx={sx(at.cycles)} cy={sy(at.mean)} r={4} />
          </>
        )}
        <text className={ui.chartText} x={PPAD.left - 5} y={sy(1) + 3} textAnchor="end">
          1.0
        </text>
        <text className={ui.chartText} x={PPAD.left - 5} y={sy(0) + 3} textAnchor="end">
          0
        </text>
        <text className={ui.chartText} x={sx(-HORIZON_CYCLES)} y={PH - 8}>
          −{HORIZON_CYCLES}
        </text>
        <text className={`${ui.chartText} ${ui.chartTextStrong}`} x={sx(0)} y={PH - 8} textAnchor="middle">
          NOW
        </text>
        <text className={ui.chartText} x={sx(HORIZON_CYCLES)} y={PH - 8} textAnchor="end">
          +{HORIZON_CYCLES}
        </text>
        <text className={ui.chartText} x={sx(-HORIZON_CYCLES / 2)} y={PPAD.top - 5} textAnchor="middle">
          RECORDED
        </text>
        <text className={ui.chartText} x={sx(HORIZON_CYCLES / 2)} y={PPAD.top - 5} textAnchor="middle">
          PREDICTED · UNCERTAINTY BAND
        </text>
      </svg>
      <figcaption className={ui.chartCaption}>
        <span>health index · flight cycles</span>
        <span>SIMULATED</span>
      </figcaption>
      <p className={theme.srOnly}>{summary}</p>
    </figure>
  );
}

/** Proportion bars: each row is a label, a filled track and a percentage. */
export function Bars({ rows, label, labelWidth }: { rows: readonly { label: string; value: number; color?: string }[]; label: string; labelWidth?: number }) {
  const columns = labelWidth ? { gridTemplateColumns: `${labelWidth}px minmax(0, 1fr) 38px` } : undefined;
  return (
    <dl className={ui.bars} aria-label={label}>
      {rows.map((row) => {
        const percent = Math.round(Math.min(1, Math.max(0, row.value)) * 100);
        return (
          <div key={row.label} className={ui.bar} style={columns}>
            <dt>{row.label}</dt>
            <dd>
              <div className={ui.barTrack}>
                <div className={ui.barFill} style={{ width: `${percent}%`, "--bar-color": row.color } as React.CSSProperties} />
              </div>
            </dd>
            <dd className={ui.barValue}>{percent}%</dd>
          </div>
        );
      })}
    </dl>
  );
}
