// Small building blocks shared by the panels: health-state badges, value
// rows, chains of nodes and the timers the interface runs on.
import { useEffect, useState } from "react";
import type { HealthState, VehicleState } from "../types";
import { STATE_GLYPH, STATE_LABEL, VEHICLE_LABEL, VEHICLE_SEVERITY } from "../data/uflightReferenceAircraft";
import { nowS } from "../state/simClock";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

/** A health state as a glyph and a word; colour is the third channel, never the only one. */
export function StateBadge({ state, quiet = false, label }: { state: HealthState; quiet?: boolean; label?: string }) {
  return (
    <span className={ui.state} data-state={state} data-quiet={quiet || undefined}>
      <span className={ui.stateGlyph} aria-hidden="true">
        {STATE_GLYPH[state]}
      </span>
      {label ?? STATE_LABEL[state]}
    </span>
  );
}

export function VehicleBadge({ state }: { state: VehicleState }) {
  return <StateBadge state={VEHICLE_SEVERITY[state]} label={VEHICLE_LABEL[state]} />;
}

export interface ValueRow {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Marks a figure produced by the simulation. */
  simulated?: boolean;
}

export function Values({ rows }: { rows: readonly ValueRow[] }) {
  return (
    <dl className={ui.values}>
      {rows.map((row) => (
        <div key={row.label} className={ui.valueRow}>
          <dt>{row.label}</dt>
          <dd>
            {row.value}
            {row.unit && <small>{row.unit}</small>}
            {row.simulated && (
              <span className={ui.simulated} title="Simulated value">
                SIM
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Chain({ nodes, accent, label }: { nodes: readonly string[]; accent?: string; label: string }) {
  return (
    <ol className={ui.chain} aria-label={label} style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}>
      {nodes.map((node, i) => (
        <li key={`${node}-${i}`}>{node}</li>
      ))}
    </ol>
  );
}

/** A counter that advances on an interval; stands still when motion is reduced or `active` is false. */
export function useTick(intervalMs: number, active = true): number {
  const [tick, setTick] = useState(0);
  const reduced = useUFlightStore((s) => s.reducedMotion);
  useEffect(() => {
    if (!active || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, active, reduced]);
  return tick;
}

/** Seconds since a moment on the simulation clock, refreshed a few times a second; 0 when there is no start. */
export function useElapsed(startedAt: number | null, intervalMs = 150): number {
  // The reading is kept with the start it belongs to, so a new start never shows the old one's time.
  const [reading, setReading] = useState({ startedAt, elapsed: 0 });
  useEffect(() => {
    if (startedAt === null) return;
    const id = window.setInterval(() => setReading({ startedAt, elapsed: Math.max(0, nowS() - startedAt) }), intervalMs);
    return () => window.clearInterval(id);
  }, [startedAt, intervalMs]);
  return startedAt !== null && reading.startedAt === startedAt ? reading.elapsed : 0;
}

export const fixed = (value: number, places = 0) => value.toFixed(places);
