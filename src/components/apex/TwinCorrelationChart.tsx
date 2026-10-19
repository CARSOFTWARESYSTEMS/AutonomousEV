"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./apex.module.css";
import loop from "./loop.module.css";

/**
 * Predicted vs measured — an illustration of correlation, not APEX data.
 * Both curves are generated from fixed formulas, in normalised units, and
 * rounded so server and browser render identical markup.
 */
/** Validated for both themes (dataviz palette check); the values live in apex.module.css. */
const PREDICTED = "var(--apex-chart-predicted)";
const MEASURED = "var(--apex-chart-measured)";
const RING = "var(--apex-surface)";
const TOLERANCE = 0.06;
const N = 60;

const round = (value: number) => Math.round(value * 1000) / 1000;

const DATA = Array.from({ length: N + 1 }, (_, i) => {
  const t = i / N;
  const predicted = 1 - Math.exp(-t / 0.14);
  // The "measured" response lags slightly and overshoots after t ≈ 0.4 — the kind of deviation a review investigates.
  const lag = 1 - Math.exp(-Math.max(0, t - 0.01) / 0.15);
  const overshoot = 0.11 * Math.exp(-((t - 0.52) ** 2) / 0.006);
  const ripple = 0.012 * Math.sin(i * 1.7);
  return { t: round(t), predicted: round(predicted), measured: round(lag + overshoot + ripple) };
});

const W = 640;
const H = 300;
const M = { left: 44, right: 104, top: 18, bottom: 36 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;
const Y_MAX = 1.2;

const x = (t: number) => M.left + t * PW;
const y = (v: number) => M.top + PH - (v / Y_MAX) * PH;

function path(key: "predicted" | "measured"): string {
  return DATA.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.t).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
}

function bandPath(): string {
  const upper = DATA.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.t).toFixed(1)},${y(Math.min(Y_MAX, d.predicted + TOLERANCE)).toFixed(1)}`).join(" ");
  const lower = [...DATA].reverse().map((d) => `L${x(d.t).toFixed(1)},${y(Math.max(0, d.predicted - TOLERANCE)).toFixed(1)}`).join(" ");
  return `${upper} ${lower} Z`;
}

export function TwinCorrelationChart({ compact = false }: { compact?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const paths = useMemo(() => ({ predicted: path("predicted"), measured: path("measured"), band: bandPath() }), []);
  const deviation = DATA.reduce((worst, d, i) => (Math.abs(d.measured - d.predicted) > Math.abs(DATA[worst].measured - DATA[worst].predicted) ? i : worst), 0);
  const devPoint = DATA[deviation];
  const last = DATA[DATA.length - 1];

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * W;
    const t = Math.min(1, Math.max(0, (px - M.left) / PW));
    setHover(Math.round(t * N));
  };

  const h = hover === null ? null : DATA[hover];
  const tipX = h ? Math.min(x(h.t) + 10, W - M.right - 118) : 0;

  return (
    <figure className={loop.chart} style={{ margin: 0 }}>
      <div className={loop.chartHead}>
        <figcaption className={styles.h4}>Predicted vs measured</figcaption>
        <span className={styles.badge} data-status="CONCEPT">
          <span className={styles.badgeMark} aria-hidden="true" />
          Illustrative — not APEX test data
        </span>
      </div>
      <div className={loop.chartLegend}>
        <span>
          <span className={loop.keyLine} style={{ borderColor: PREDICTED, borderTopStyle: "dashed" }} aria-hidden="true" /> Predicted (model)
        </span>
        <span>
          <span className={loop.keyLine} style={{ borderColor: MEASURED }} aria-hidden="true" /> Measured (test)
        </span>
        <span>
          <span aria-hidden="true" style={{ width: 22, height: 10, background: "color-mix(in srgb, var(--apex-chart-predicted) 18%, transparent)" }} /> Agreement band
        </span>
      </div>
      <svg
        ref={svgRef}
        className={loop.chartSvg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Illustrative chart: a predicted response and a measured response rise together; the measured curve leaves the agreement band briefly in the middle, which is the deviation an engineering review investigates."
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <g className={loop.grid}>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <line key={v} x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} />
          ))}
        </g>
        {[0, 0.5, 1].map((v) => (
          <text key={v} className={loop.axisText} x={M.left - 8} y={y(v) + 3} textAnchor="end">
            {v.toFixed(1)}
          </text>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} className={loop.axisText} x={x(t)} y={H - M.bottom + 16} textAnchor="middle">
            {t.toFixed(2)}
          </text>
        ))}
        <text className={loop.axisText} x={M.left} y={H - 4}>
          NORMALISED TIME
        </text>

        <path className={loop.band} d={paths.band} />
        <path d={paths.predicted} fill="none" style={{ stroke: PREDICTED }} strokeWidth={2} strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={paths.measured} fill="none" style={{ stroke: MEASURED }} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* The deviation the review looks at. */}
        <circle cx={x(devPoint.t)} cy={y(devPoint.measured)} r={5} style={{ fill: MEASURED, stroke: RING }} strokeWidth={2} />
        {!compact && (
          <text className={loop.directLabel} x={x(devPoint.t) + 10} y={y(devPoint.measured) - 10}>
            Deviation → engineering review
          </text>
        )}

        {/* Direct labels at the line ends. */}
        <text className={loop.directLabel} x={W - M.right + 10} y={y(last.predicted) - 6}>
          Predicted
        </text>
        <text className={loop.directLabel} x={W - M.right + 10} y={y(last.measured) + 14}>
          Measured
        </text>

        {h && (
          <g className={loop.tooltip}>
            <line x1={x(h.t)} x2={x(h.t)} y1={M.top} y2={H - M.bottom} style={{ stroke: "var(--apex-line-strong)" }} strokeWidth={1} />
            <circle cx={x(h.t)} cy={y(h.predicted)} r={4} style={{ fill: PREDICTED, stroke: RING }} strokeWidth={2} />
            <circle cx={x(h.t)} cy={y(h.measured)} r={4} style={{ fill: MEASURED, stroke: RING }} strokeWidth={2} />
            <rect x={tipX} y={M.top + 4} width={116} height={50} rx={2} />
            <text x={tipX + 8} y={M.top + 20}>t {h.t.toFixed(2)}</text>
            <text x={tipX + 8} y={M.top + 33}>pred {h.predicted.toFixed(2)}</text>
            <text x={tipX + 8} y={M.top + 46}>meas {h.measured.toFixed(2)}</text>
          </g>
        )}
      </svg>
      <details className={loop.chartTable}>
        <summary>Show values as a table</summary>
        <table>
          <caption className={styles.srOnly}>Illustrative predicted and measured values, normalised</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Predicted</th>
              <th scope="col">Measured</th>
            </tr>
          </thead>
          <tbody>
            {DATA.filter((_, i) => i % 6 === 0).map((d) => (
              <tr key={d.t}>
                <td>{d.t.toFixed(2)}</td>
                <td>{d.predicted.toFixed(2)}</td>
                <td>{d.measured.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
