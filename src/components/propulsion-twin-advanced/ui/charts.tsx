// Charts for the twin: thin-lined, labelled, and readable without colour. Each
// twin state has its own line style everywhere it is drawn: observed thin and
// solid, estimated heavy and solid, expected dashed, predicted dotted with a
// band. Every chart carries a text read-out of what it shows.
import type { ReactNode } from "react";
import css from "../advancedTwin.module.css";

export type LineKind = "observed" | "estimated" | "expected" | "predicted" | "truth" | "filtered" | "physics";

export interface Line {
  kind: LineKind;
  label: string;
  values: readonly number[];
}

export interface Future {
  /** Seconds ahead of now for each point. */
  horizon: readonly number[];
  mean: readonly number[];
  sigma: readonly number[];
}

export const LINE_LABEL: Record<LineKind, string> = { observed: "Observed", estimated: "Estimated", expected: "Expected", predicted: "Predicted", truth: "True (simulation only)", filtered: "Filtered", physics: "Physics prediction" };

const W = 320;
const H = 132;
const PAD = { left: 34, right: 8, top: 8, bottom: 18 };

/** Formats a value with as many decimals as its size warrants. */
export function fmt(value: number, digits?: number): string {
  if (!Number.isFinite(value)) return "–";
  const d = digits ?? (Math.abs(value) >= 100 ? 1 : Math.abs(value) >= 10 ? 2 : 2);
  return value.toFixed(d).replace("-", "−");
}

export const signed = (value: number, digits = 2) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`;

interface TraceChartProps {
  title: string;
  unit: string;
  lines: readonly Line[];
  /** One standard deviation about the estimated line, drawn as a ±2σ band. */
  band?: readonly number[];
  future?: Future;
  limit?: { value: number; label: string };
  /** Seconds covered by the history. */
  span: number;
  /** Smallest vertical range shown, so that noise is not blown up to fill the chart. */
  minRange?: number;
  children?: ReactNode;
  tag?: string;
}

/** A history of one quantity in up to four states, with an optional projection into the future. */
export function TraceChart({ title, unit, lines, band, future, limit, span, minRange = 2, children, tag = "SIMULATED" }: TraceChartProps) {
  const n = Math.max(2, ...lines.map((l) => l.values.length));
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  const include = (v: number) => {
    if (!Number.isFinite(v)) return;
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  };
  lines.forEach((l) => l.values.forEach(include));
  const estimated = lines.find((l) => l.kind === "estimated");
  if (band && estimated) estimated.values.forEach((v, i) => (include(v + 2 * band[i]), include(v - 2 * band[i])));
  future?.mean.forEach((m, i) => (include(m + 2 * future.sigma[i]), include(m - 2 * future.sigma[i])));
  if (limit) include(limit.value);
  if (!Number.isFinite(lo)) [lo, hi] = [0, 1];
  const middle = (lo + hi) / 2;
  const range = Math.max(hi - lo, minRange) * 1.12;
  lo = middle - range / 2;
  hi = middle + range / 2;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  // History takes the left of the plot; a projection, where there is one, the right third.
  const nowX = PAD.left + plotW * (future ? 0.66 : 1);
  const x = (i: number) => PAD.left + (i / (n - 1)) * (nowX - PAD.left);
  const xf = (h: number) => nowX + (h / (future?.horizon.at(-1) || 1)) * (W - PAD.right - nowX);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * plotH;
  const path = (values: readonly number[], px: (i: number) => number) => values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = (upper: readonly number[], lower: readonly number[], px: (i: number) => number) => `${path(upper, px)}${[...lower].map((v, i) => `L${px(lower.length - 1 - i).toFixed(1)},${y(lower[lower.length - 1 - i]).toFixed(1)}`).join("")}Z`;
  const ticks = [lo + range * 0.1, middle, hi - range * 0.1];
  const summary = `${title}, ${unit}. ${lines.map((l) => `${l.label} ${fmt(l.values.at(-1) ?? NaN)}`).join(", ")}${limit ? `. ${limit.label} ${fmt(limit.value)}` : ""}${future ? `. Predicted ${fmt(future.mean.at(-1) ?? NaN)} plus or minus ${fmt(2 * (future.sigma.at(-1) ?? 0))} in ${future.horizon.at(-1)} seconds` : ""}.`;

  return (
    <figure className={css.chart}>
      <figcaption className={css.chartHead}>
        <span className={css.chartTitle}>{title}</span>
        <span className={css.chartUnit}>
          {unit} · {tag}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className={css.chartSvg}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={css.chartGrid} />
            <text x={PAD.left - 5} y={y(t) + 3} className={css.chartTick} textAnchor="end">
              {fmt(t, range < 4 ? 1 : 0)}
            </text>
          </g>
        ))}
        {limit && (
          <>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(limit.value)} y2={y(limit.value)} className={css.chartLimit} />
            <text x={W - PAD.right - 2} y={y(limit.value) - 3} className={css.chartLimitLabel} textAnchor="end">
              {limit.label}
            </text>
          </>
        )}
        {band && estimated && <path d={area(estimated.values.map((v, i) => v + 2 * band[i]), estimated.values.map((v, i) => v - 2 * band[i]), x)} className={css.chartBand} />}
        {future && (
          <>
            <path d={area(future.mean.map((m, i) => m + 2 * future.sigma[i]), future.mean.map((m, i) => m - 2 * future.sigma[i]), (i) => xf(future.horizon[i]))} className={css.chartBandFuture} />
            <path d={path(future.mean, (i) => xf(future.horizon[i]))} className={css.line} data-kind="predicted" />
            <line x1={nowX} x2={nowX} y1={PAD.top} y2={H - PAD.bottom} className={css.chartNow} />
            <text x={nowX} y={H - 5} className={css.chartTick} textAnchor="middle">
              now
            </text>
            <text x={W - PAD.right} y={H - 5} className={css.chartTick} textAnchor="end">
              +{future.horizon.at(-1)} s
            </text>
          </>
        )}
        {lines.map((l) => (
          <path key={l.kind} d={path(l.values, x)} className={css.line} data-kind={l.kind} />
        ))}
        <text x={PAD.left} y={H - 5} className={css.chartTick}>
          −{span} s
        </text>
      </svg>
      <ul className={css.legend}>
        {lines.map((l) => (
          <li key={l.kind}>
            <svg viewBox="0 0 22 6" aria-hidden="true" className={css.legendSwatch}>
              <path d="M0,3L22,3" className={css.line} data-kind={l.kind} />
            </svg>
            {l.label} <b>{fmt(l.values.at(-1) ?? NaN)}</b>
          </li>
        ))}
        {future && (
          <li>
            <svg viewBox="0 0 22 6" aria-hidden="true" className={css.legendSwatch}>
              <path d="M0,3L22,3" className={css.line} data-kind="predicted" />
            </svg>
            Predicted{" "}
            <b>
              {fmt(future.mean.at(-1) ?? NaN)} ± {fmt(2 * (future.sigma.at(-1) ?? 0))}
            </b>
          </li>
        )}
      </ul>
      {children}
    </figure>
  );
}

/** A horizontal bar for a score against a threshold at 1: the bar, the number and a word, so that state never rests on colour. */
export function ScoreBar({ label, score, active, note }: { label: string; score: number; active: boolean; note?: string }) {
  const shown = Math.min(score, 2);
  return (
    <div className={css.score} data-active={active}>
      <span className={css.scoreLabel}>{label}</span>
      <span className={css.scoreTrack} aria-hidden="true">
        <span className={css.scoreFill} style={{ width: `${(shown / 2) * 100}%` }} />
        <span className={css.scoreMark} />
      </span>
      <span className={css.scoreValue}>
        {score >= 10 ? "≥10" : score.toFixed(2)}× · {active ? "ALARM" : note ? "HELD" : "quiet"}
      </span>
    </div>
  );
}

/** A labelled share, 0–1, as a bar with its percentage. */
export function ShareBar({ label, value, detail, strong }: { label: ReactNode; value: number; detail?: ReactNode; strong?: boolean }) {
  return (
    <div className={css.share} data-strong={strong || undefined}>
      <span className={css.shareLabel}>{label}</span>
      <span className={css.shareTrack} aria-hidden="true">
        <span className={css.shareFill} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
      </span>
      <span className={css.shareValue}>{Math.round(value * 100)} %</span>
      {detail && <span className={css.shareDetail}>{detail}</span>}
    </div>
  );
}
