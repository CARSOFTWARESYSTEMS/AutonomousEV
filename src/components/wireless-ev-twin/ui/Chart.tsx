"use client";
// A plain SVG line chart with labelled axes and units. Charts only ever plot
// values the engine computed; the caption says what they are.
import { useId } from "react";
import ui from "../twin.module.css";

export interface Series {
  name: string;
  color: string;
  values: readonly number[];
  dashed?: boolean;
}

interface ChartProps {
  x: readonly number[];
  series: readonly Series[];
  xLabel: string;
  yLabel: string;
  caption?: string;
  height?: number;
  /** A vertical cursor at this x. */
  cursor?: number;
  /** Horizontal reference lines. */
  guides?: readonly { y: number; label: string }[];
  yMin?: number;
  yMax?: number;
  /** Mark a point (e.g. the optimum). */
  marker?: { x: number; y: number; label: string };
  area?: boolean;
}

const W = 520;
const PAD = { l: 52, r: 12, t: 12, b: 34 };

function ticks(lo: number, hi: number, n = 5): number[] {
  const span = hi - lo || 1;
  const step0 = span / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? step0;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9 * span; v += step) out.push(Number(v.toPrecision(10)));
  return out;
}

const short = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1e4 || (a > 0 && a < 1e-2)) return v.toExponential(0);
  return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1).replace(/\.0$/, "") : v.toFixed(2).replace(/0$/, "").replace(/\.0$/, "");
};

export default function Chart({ x, series, xLabel, yLabel, caption, height = 200, cursor, guides, yMin, yMax, marker, area }: ChartProps) {
  const id = useId();
  const H = height;
  const finite = series.flatMap((s) => s.values.filter((v) => Number.isFinite(v)));
  let lo = yMin ?? Math.min(0, ...finite);
  let hi = yMax ?? Math.max(...finite, lo + 1e-9);
  if (guides) for (const g of guides) {
    lo = Math.min(lo, g.y);
    hi = Math.max(hi, g.y);
  }
  if (hi - lo < 1e-12) hi = lo + 1;
  const pad = (hi - lo) * 0.06;
  if (yMax === undefined) hi += pad;
  if (yMin === undefined && lo < 0) lo -= pad;
  const x0 = x[0] ?? 0;
  const x1 = x[x.length - 1] ?? 1;
  const sx = (v: number) => PAD.l + ((v - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => H - PAD.b - ((v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const path = (vals: readonly number[]) =>
    vals
      .map((v, i) => (Number.isFinite(v) ? `${i && Number.isFinite(vals[i - 1]) ? "L" : "M"}${sx(x[i]).toFixed(1)},${sy(v).toFixed(1)}` : ""))
      .join(" ");
  const xt = ticks(x0, x1);
  const yt = ticks(lo, hi);
  return (
    <figure className={ui.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-c`}>
        {yt.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} className={ui.chartGrid} />
            <text x={PAD.l - 6} y={sy(v) + 3.5} textAnchor="end" className={ui.chartTick}>
              {short(v)}
            </text>
          </g>
        ))}
        {xt.map((v) => (
          <text key={`x${v}`} x={sx(v)} y={H - PAD.b + 14} textAnchor="middle" className={ui.chartTick}>
            {short(v)}
          </text>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={sy(Math.max(lo, Math.min(hi, 0)))} y2={sy(Math.max(lo, Math.min(hi, 0)))} className={ui.chartAxis} />
        {guides?.map((g) => (
          <g key={g.label}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(g.y)} y2={sy(g.y)} className={ui.chartGuide} />
            <text x={W - PAD.r - 2} y={sy(g.y) - 4} textAnchor="end" className={ui.chartTick}>
              {g.label}
            </text>
          </g>
        ))}
        {series.map((s, k) => (
          <g key={s.name}>
            {area && k === 0 && <path d={`${path(s.values)} L${sx(x1)},${sy(Math.max(lo, 0))} L${sx(x0)},${sy(Math.max(lo, 0))} Z`} fill={s.color} opacity={0.12} />}
            <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth={1.8} strokeDasharray={s.dashed ? "5 4" : undefined} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        {cursor !== undefined && cursor >= x0 && cursor <= x1 && <line x1={sx(cursor)} x2={sx(cursor)} y1={PAD.t} y2={H - PAD.b} className={ui.chartCursor} />}
        {marker && Number.isFinite(marker.y) && (
          <g>
            <circle cx={sx(marker.x)} cy={sy(marker.y)} r={4} className={ui.chartMarker} />
            <text x={sx(marker.x) + 7} y={sy(marker.y) - 7} className={ui.chartTick}>
              {marker.label}
            </text>
          </g>
        )}
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" className={ui.chartLabel}>
          {xLabel}
        </text>
        <text x={12} y={(PAD.t + H - PAD.b) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(PAD.t + H - PAD.b) / 2})`} className={ui.chartLabel}>
          {yLabel}
        </text>
      </svg>
      <figcaption id={`${id}-c`}>
        {series.length > 1 && (
          <span className={ui.chartLegend}>
            {series.map((s) => (
              <span key={s.name}>
                <i style={{ background: s.color }} aria-hidden="true" />
                {s.name}
              </span>
            ))}
          </span>
        )}
        {caption ?? `${yLabel} against ${xLabel}`}
      </figcaption>
    </figure>
  );
}
