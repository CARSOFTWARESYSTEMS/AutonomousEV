"use client";
// Charts for the twin: thin-lined, labelled, and readable without colour. Each
// twin state has its own line style everywhere it is drawn: observed thin and
// solid, estimated heavy and solid, expected dashed, predicted dotted with a
// band. Every chart carries a text read-out of what it shows.
//
// A chart is drawn at the size it is shown: one drawing unit is one CSS pixel,
// so its lettering is the same size in a phone's column and across a desktop.
import { type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
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

/** Width a chart is drawn at until it has been measured, and its height, in CSS pixels. */
const DEFAULT_WIDTH = 320;
const HEIGHT = 168;
const PAD = { left: 46, right: 10, top: 10, bottom: 26 };

/** Formats a value with as many decimals as its size warrants. */
export function fmt(value: number, digits?: number): string {
  if (!Number.isFinite(value)) return "–";
  const d = digits ?? (Math.abs(value) >= 100 ? 1 : Math.abs(value) >= 10 ? 2 : 2);
  return value.toFixed(d).replace("-", "−");
}

export const signed = (value: number, digits = 2) => (Number.isFinite(value) ? `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}` : "–");

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
  const plot = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(DEFAULT_WIDTH);
  /** The sample being inspected, by pointer or by keyboard; null when the chart is simply being watched. */
  const [cursor, setCursor] = useState<number | null>(null);
  const hintId = useId();
  useEffect(() => {
    const element = plot.current;
    if (!element) return;
    const measure = () => setW(Math.max(220, Math.round(element.clientWidth) || DEFAULT_WIDTH));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const H = HEIGHT;
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
  // A sample that is not a number (a gap in the telemetry) breaks the line instead of being drawn somewhere.
  const path = (values: readonly number[], px: (i: number) => number) => {
    let d = "";
    let pen = false;
    values.forEach((v, i) => {
      if (!Number.isFinite(v)) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${px(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const area = (upper: readonly number[], lower: readonly number[], px: (i: number) => number) => `${path(upper, px)}${[...lower].map((v, i) => `L${px(lower.length - 1 - i).toFixed(1)},${y(lower[lower.length - 1 - i]).toFixed(1)}`).join("")}Z`;
  const ticks = [lo + range * 0.1, middle, hi - range * 0.1];
  const digits = range < 4 ? 1 : 0;
  const summary = `${title}, ${unit}. ${lines.map((l) => `${l.label} ${fmt(l.values.at(-1) ?? NaN)}`).join(", ")}${limit ? `. ${limit.label} ${fmt(limit.value)}` : ""}${future ? `. Predicted ${fmt(future.mean.at(-1) ?? NaN)} plus or minus ${fmt(2 * (future.sigma.at(-1) ?? 0))} in ${future.horizon.at(-1)} seconds` : ""}.`;

  const at = cursor === null ? null : Math.min(n - 1, Math.max(0, cursor));
  const secondsAgo = at === null ? 0 : ((n - 1 - at) / (n - 1)) * span;
  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - box.left - PAD.left) / Math.max(1, nowX - PAD.left);
    setCursor(Math.round(Math.min(1, Math.max(0, fraction)) * (n - 1)));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const stride = Math.max(1, Math.round(n / 30));
    const from = at ?? n - 1;
    const next = event.key === "ArrowLeft" ? from - stride : event.key === "ArrowRight" ? from + stride : event.key === "Home" ? 0 : event.key === "End" ? n - 1 : event.key === "Escape" ? null : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setCursor(next === null ? null : Math.min(n - 1, Math.max(0, next)));
  };

  return (
    <figure className={css.chart}>
      <figcaption className={css.chartHead}>
        <span className={css.chartTitle}>{title}</span>
        <span className={css.chartUnit}>
          {unit} · {tag}
        </span>
      </figcaption>
      {/* Pointing at the plot, or focusing it and using the arrow keys, reads out every line at that moment. */}
      <div ref={plot} className={css.chartPlot} role="group" tabIndex={0} aria-label={`${title}: chart. Arrow keys read values back through time; Escape returns to now.`} aria-describedby={hintId} onPointerMove={onPointer} onPointerDown={onPointer} onPointerLeave={() => setCursor(null)} onBlur={() => setCursor(null)} onKeyDown={onKeyDown}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={summary} className={css.chartSvg}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={css.chartGrid} />
              <text x={PAD.left - 6} y={y(t) + 4} className={css.chartTick} textAnchor="end">
                {fmt(t, digits)}
              </text>
            </g>
          ))}
          <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} className={css.chartAxis} />
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} className={css.chartAxis} />
          {limit && (
            <>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(limit.value)} y2={y(limit.value)} className={css.chartLimit} />
              <text x={W - PAD.right - 2} y={y(limit.value) - 4} className={css.chartLimitLabel} textAnchor="end">
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
              <text x={W - PAD.right} y={H - 8} className={css.chartTick} textAnchor="end">
                +{future.horizon.at(-1)} s
              </text>
            </>
          )}
          {lines.map((l) => (
            <path key={l.kind} d={path(l.values, x)} className={css.line} data-kind={l.kind} />
          ))}
          <text x={PAD.left} y={H - 8} className={css.chartTick}>
            −{span} s
          </text>
          <text x={nowX} y={H - 8} className={css.chartTick} textAnchor={future ? "middle" : "end"}>
            now
          </text>
          {at !== null && (
            <g data-cursor="">
              <line x1={x(at)} x2={x(at)} y1={PAD.top} y2={H - PAD.bottom} className={css.chartCursor} />
              {lines.map((l) => (Number.isFinite(l.values[at]) ? <circle key={l.kind} cx={x(at)} cy={y(l.values[at])} r={3} className={css.chartDot} /> : null))}
            </g>
          )}
        </svg>
      </div>
      <p id={hintId} className={css.chartInspect} data-inspecting={at !== null || undefined}>
        {at === null ? `Time in seconds across, ${unit} up. Point at the plot, or focus it and press ←/→, to read values.` : `${secondsAgo < span / (n - 1) / 2 ? "Now" : `${secondsAgo.toFixed(1)} s ago`}: ${lines.map((l) => `${l.label} ${fmt(l.values[at] ?? NaN)}`).join(" · ")}`}
      </p>
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
