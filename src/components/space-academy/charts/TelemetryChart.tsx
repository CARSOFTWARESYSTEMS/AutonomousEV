"use client";
// Simulated telemetry over time: one y-axis, thin 2px lines, shaded bands for
// Earth's shadow and safe mode, labelled threshold lines, a crosshair tooltip
// and keyboard stepping. Every value it shows is also in the mission's data
// table, so the tooltip enhances and never gates.
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./chart.module.css";

export interface ChartSeries {
  id: string;
  label: string;
  /** Validated against the navy surface (dataviz palette, dark steps). */
  color: string;
  values: number[];
  format: (v: number) => string;
}

export interface ChartBand {
  start: number;
  end: number;
  kind: "shadow" | "safe";
}

interface Props {
  title: string;
  /** Minutes. */
  x: number[];
  series: ChartSeries[];
  yMin: number;
  yMax: number;
  yTicks: number[];
  yFormat: (v: number) => string;
  thresholds?: { value: number; label: string }[];
  bands?: ChartBand[];
  /** 0–1: how much of the run has played. 1 shows it all. */
  progress?: number;
  height?: number;
  /** Plain-language summary for screen readers. */
  summary: string;
}

const PAD = { top: 14, right: 64, bottom: 30, left: 44 };

export function bandsFrom(x: number[], flags: boolean[], kind: ChartBand["kind"]): ChartBand[] {
  const out: ChartBand[] = [];
  let start: number | null = null;
  flags.forEach((on, i) => {
    if (on && start === null) start = x[i];
    if (!on && start !== null) {
      out.push({ start, end: x[i], kind });
      start = null;
    }
  });
  if (start !== null) out.push({ start, end: x[x.length - 1], kind });
  return out;
}

export default function TelemetryChart({ title, x, series, yMin, yMax, yTicks, yFormat, thresholds = [], bands = [], progress = 1, height = 220, summary }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const right = series.length > 1 ? PAD.right : 16;
  const innerW = width - PAD.left - right;
  const innerH = height - PAD.top - PAD.bottom;
  const xMax = x[x.length - 1] || 1;
  const sx = (v: number) => PAD.left + (v / xMax) * innerW;
  const sy = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  const shown = Math.max(1, Math.round(progress * (x.length - 1)));

  const paths = useMemo(
    () =>
      series.map((s) => {
        let d = "";
        for (let i = 0; i <= shown && i < x.length; i++) d += `${i === 0 ? "M" : "L"}${sx(x[i]).toFixed(1)},${sy(s.values[i]).toFixed(1)}`;
        return d;
      }),
    // sx/sy derive from width, height and the domain, all listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, shown, x, width, height, yMin, yMax],
  );

  const xTicks: number[] = [];
  const stepMin = xMax > 240 ? 60 : 30;
  for (let t = 0; t <= xMax + 0.01; t += stepMin) xTicks.push(t);

  const idx = hover ?? (progress < 1 ? shown : null);
  const tooltipLeft = idx !== null ? Math.min(Math.max(sx(x[idx]) + 10, 0), width - 170) : 0;
  const activeBands = idx !== null ? bands.filter((b) => x[idx] >= b.start && x[idx] < b.end).map((b) => b.kind) : [];

  const nearest = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const t = ((clientX - rect.left - PAD.left) / innerW) * xMax;
    const i = Math.round((Math.min(Math.max(t, 0), xMax) / xMax) * (x.length - 1));
    return Math.min(i, shown);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = Math.max(1, Math.round(x.length / 60));
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setHover((h) => {
        const cur = h ?? 0;
        return Math.min(shown, Math.max(0, cur + (e.key === "ArrowRight" ? step : -step)));
      });
    } else if (e.key === "Escape") setHover(null);
  };

  const hatchId = `hatch-${title.replace(/\W+/g, "")}`;

  return (
    <div className={styles.chart}>
      <div className={styles.head}>
        <h4 className={styles.title}>{title}</h4>
        <ul className={styles.legend} aria-label="Key">
          {series.length > 1 &&
            series.map((s) => (
              <li key={s.id}>
                <span className={styles.swatchLine} style={{ background: s.color }} aria-hidden />
                {s.label}
              </li>
            ))}
          {bands.some((b) => b.kind === "shadow") && (
            <li>
              <span className={styles.swatchShadow} aria-hidden />
              Earth&apos;s shadow
            </li>
          )}
          {bands.some((b) => b.kind === "safe") && (
            <li>
              <span className={styles.swatchSafe} aria-hidden />
              Safe mode
            </li>
          )}
        </ul>
      </div>
      <div
        ref={wrapRef}
        className={styles.plot}
        tabIndex={0}
        role="img"
        aria-label={`${title}. ${summary} Use the left and right arrow keys to read values.`}
        onPointerMove={(e) => setHover(nearest(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={height} aria-hidden="true">
          <defs>
            <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(252,211,77,0.45)" strokeWidth="2" />
            </pattern>
          </defs>
          {bands.map((b, i) => (
            <rect
              key={i}
              x={sx(b.start)}
              y={b.kind === "shadow" ? PAD.top : PAD.top + innerH - 8}
              width={Math.max(0, sx(b.end) - sx(b.start))}
              height={b.kind === "shadow" ? innerH : 8}
              fill={b.kind === "shadow" ? "rgba(148,163,184,0.13)" : `url(#${hatchId})`}
            />
          ))}
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={PAD.left + innerW} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.07)" />
              <text x={PAD.left - 8} y={sy(t)} dy="0.32em" textAnchor="end" className={styles.axisText}>
                {yFormat(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={sx(t)} y={height - 8} textAnchor="middle" className={styles.axisText}>
              {Math.round(t)}
            </text>
          ))}
          <text x={PAD.left + innerW} y={height - 8} textAnchor="end" className={styles.axisText} dx={right > 20 ? 40 : 0}>
            min
          </text>
          {thresholds.map((th) => (
            <g key={th.label}>
              <line x1={PAD.left} x2={PAD.left + innerW} y1={sy(th.value)} y2={sy(th.value)} stroke="#f87171" strokeWidth="1.5" strokeDasharray="5 4" />
              <text x={PAD.left + 6} y={sy(th.value) - 6} className={styles.thresholdText}>
                {th.label}
              </text>
            </g>
          ))}
          {paths.map((d, i) => (
            <path key={series[i].id} d={d} fill="none" stroke={series[i].color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {series.length > 1 &&
            series.map((s) => {
              const i = Math.min(shown, x.length - 1);
              return (
                <text key={s.id} x={sx(x[i]) + 6} y={sy(s.values[i])} dy="0.32em" className={styles.directLabel}>
                  {s.label}
                </text>
              );
            })}
          {idx !== null && (
            <g>
              <line x1={sx(x[idx])} x2={sx(x[idx])} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
              {series.map((s) => (
                <circle key={s.id} cx={sx(x[idx])} cy={sy(s.values[idx])} r="4.5" fill={s.color} stroke="#0b0e22" strokeWidth="2" />
              ))}
            </g>
          )}
        </svg>
        {idx !== null && (
          <div className={styles.tooltip} style={{ left: tooltipLeft }} aria-hidden="true">
            <div className={styles.tipTime}>t = {x[idx].toFixed(0)} min{activeBands.includes("shadow") ? " · in shadow" : " · in sunlight"}{activeBands.includes("safe") ? " · safe mode" : ""}</div>
            {series.map((s) => (
              <div key={s.id} className={styles.tipRow}>
                <span className={styles.swatchLine} style={{ background: s.color }} />
                <strong>{s.format(s.values[idx])}</strong> <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
