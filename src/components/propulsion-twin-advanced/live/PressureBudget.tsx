"use client";
// The physics model, operated by hand: change the throttle or the condition of
// a component and see the pressure at every point of both propellant paths
// re-solve. Steady state of the design model, no noise, nothing estimated.
import { useMemo, useState } from "react";
import { PRESSURE_UNIT } from "../data/pressure";
import { CH } from "../simulation/channels";
import { applyPhysicalFaults } from "../simulation/faults";
import { DESIGN, scheduleSpeed, steadyState } from "../simulation/plant";
import { npshRatio } from "../simulation/symptoms";
import { fmt, signed } from "../ui/charts";
import css from "../advancedTwin.module.css";

const OX = [
  ["Tank", "pTankOx"],
  ["Pump inlet", "pInOx"],
  ["Pump discharge", "pOutOx"],
  ["Injector manifold", "pInjOx"],
  ["Chamber", "pcA"],
] as const;
const FUEL = [
  ["Tank", "pTankFu"],
  ["Pump inlet", "pInFu"],
  ["Pump discharge", "pOutFu"],
  ["Cooling inlet", "pCoolIn"],
  ["Cooling outlet", "pCoolOut"],
  ["Injector manifold", "pInjFu"],
  ["Chamber", "pcA"],
] as const;

const SLIDERS = [
  { id: "throttle", label: "Throttle command", min: 60, max: 100, unit: "%" },
  { id: "pump", label: "Oxidiser pump head", min: 80, max: 100, unit: "% of healthy" },
  { id: "cooling", label: "Cooling-channel restriction", min: 0, max: 100, unit: "% of full scenario" },
  { id: "tank", label: "Oxidiser tank pressure loss", min: 0, max: 100, unit: "% of full scenario" },
] as const;
type SliderId = (typeof SLIDERS)[number]["id"];
const START: Record<SliderId, number> = { throttle: 100, pump: 100, cooling: 0, tank: 0 };

export default function PressureBudget() {
  const [v, setV] = useState(START);
  const { point, base } = useMemo(() => {
    const speed = scheduleSpeed(v.throttle / 100);
    const params = applyPhysicalFaults({ ...DESIGN, headOx: v.pump / 100 }, { cooling_restriction: v.cooling / 100, feed_pressure_reduction: v.tank / 100 });
    return { point: steadyState(params, speed), base: steadyState(DESIGN, speed) };
  }, [v]);
  const max = 240;
  const row = (label: string, id: keyof typeof CH, key: string) => {
    const value = point.values[CH[id]];
    const change = value - base.values[CH[id]];
    return (
      <li key={key}>
        <span className={css.ladderLabel}>{label}</span>
        <span className={css.ladderBar} aria-hidden="true">
          <span style={{ width: `${Math.min(100, (value / max) * 100)}%` }} data-kind="node" />
        </span>
        <span className={css.ladderValue}>
          {fmt(value)}
          {Math.abs(change) > 0.05 && <em> {signed(change, 1)}</em>}
        </span>
      </li>
    );
  };
  const suction = npshRatio(point.values);
  return (
    <div className={css.twoCol}>
      <div>
        {SLIDERS.map((slider) => (
          <label key={slider.id} className={css.field}>
            <span className={css.groupLabel}>
              {slider.label} · {v[slider.id]} {slider.unit}
            </span>
            <input type="range" className={css.range} min={slider.min} max={slider.max} step={slider.id === "pump" ? 1 : 5} value={v[slider.id]} onChange={(e) => setV((s) => ({ ...s, [slider.id]: Number(e.target.value) }))} />
          </label>
        ))}
        <button type="button" className={css.ghost} onClick={() => setV(START)}>
          Restore the healthy design point
        </button>
        <dl className={css.rows} role="status" aria-label="Solved operating point">
          <div>
            <dt>Chamber pressure</dt>
            <dd>
              {fmt(point.state.pc)} {PRESSURE_UNIT} ({signed(point.state.pc - base.state.pc, 1)} from healthy)
            </dd>
          </div>
          <div>
            <dt>Mixture ratio</dt>
            <dd>{signed(100 * (point.flows.mOx / point.flows.mFu - 1), 1)} % from reference</dd>
          </div>
          <div>
            <dt>Coolant temperature rise</dt>
            <dd>{fmt(point.state.tCool)} % ref</dd>
          </div>
          <div>
            <dt>Oxidiser pump suction margin</dt>
            <dd>
              {suction.toFixed(2)} × required{point.flows.cavOx > 0 ? ` · CAVITATING, ${Math.round(point.flows.cavOx * 30)} % of head lost` : ""}
            </dd>
          </div>
        </dl>
      </div>
      <div>
        <p className={css.groupLabel}>Oxidiser path</p>
        <ol className={css.ladder}>{OX.map(([label, id]) => row(label, id, `ox-${id}`))}</ol>
        <p className={css.groupLabel}>Fuel path</p>
        <ol className={css.ladder}>{FUEL.map(([label, id]) => row(label, id, `fu-${id}`))}</ol>
        <p className={css.note}>
          {PRESSURE_UNIT} · REFERENCE MODEL, steady state. The small figure is the change from the healthy point at this throttle.
        </p>
      </div>
    </div>
  );
}
