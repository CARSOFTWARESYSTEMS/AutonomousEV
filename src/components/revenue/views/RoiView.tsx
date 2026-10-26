"use client";
// The ROI calculator: customer-supplied inputs, three editable scenarios,
// ranges rather than false precision, and the disclaimer in plain sight.
import { useRef, useState } from "react";
import { trackRevenue } from "../analytics";
import { formatCount, formatINR, formatINRShort } from "../logic/format";
import { DEFAULT_SCENARIOS, EXAMPLE_INPUTS, ROI_DISCLAIMER, calculateRoi, type RoiInputs, type Scenario } from "../logic/roi";
import { Notice, NumberField, Panel, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

const months = (value: number) => (Number.isFinite(value) ? `${value.toFixed(1)} months` : "No payback");
const percent = (value: number | null) => (value === null ? "—" : `${Math.round(value)}%`);

export default function RoiView() {
  const [input, setInput] = useState<RoiInputs>(EXAMPLE_INPUTS);
  const [scenarios, setScenarios] = useState<Scenario[]>([...DEFAULT_SCENARIOS]);
  const reported = useRef(false);
  const result = calculateRoi(input, scenarios);

  const touched = () => {
    if (reported.current) return;
    reported.current = true;
    trackRevenue("roi_calculated");
  };
  const set = (change: Partial<RoiInputs>) => {
    setInput((current) => ({ ...current, ...change }));
    touched();
  };
  const setScenario = (id: Scenario["id"], change: Partial<Scenario>) => {
    setScenarios((current) => current.map((scenario) => (scenario.id === id ? { ...scenario, ...change } : scenario)));
    touched();
  };

  const expected = result.scenarios.find((s) => s.scenario.id === "expected") ?? result.scenarios[0];
  const low = Math.min(...result.scenarios.map((s) => s.annualValue));
  const high = Math.max(...result.scenarios.map((s) => s.annualValue));
  const afterHours = result.currentHours - expected.hoursSaved;
  const widest = Math.max(1, result.currentHours);

  return (
    <div>
      <ViewHeader eyebrow="Case Study" title="ROI Calculator" lede="Build value from the customer's own numbers, show a range, and measure it in a pilot." />

      <Notice tone="warn">
        <strong>{ROI_DISCLAIMER}</strong> Estimate based on supplied assumptions. Not guaranteed.
      </Notice>

      <Panel title="Customer-provided inputs" kicker="Example values — replace them">
        <div className={css.formGrid}>
          <NumberField label="FAIs per month" value={input.faisPerMonth} onChange={(faisPerMonth) => set({ faisPerMonth })} />
          <NumberField label="Drawings per FAI" value={input.drawingsPerFai} onChange={(drawingsPerFai) => set({ drawingsPerFai })} />
          <NumberField label="Preparation hours per drawing" step={0.5} value={input.prepHours} onChange={(prepHours) => set({ prepHours })} hint="Ballooning, characteristic table and Form 3." />
          <NumberField label="Review hours per FAI" step={0.5} value={input.reviewHours} onChange={(reviewHours) => set({ reviewHours })} />
          <NumberField label="Rework hours per FAI" step={0.5} value={input.reworkHours} onChange={(reworkHours) => set({ reworkHours })} />
          <NumberField label="Loaded engineering cost per hour" prefix="₹" step={50} value={input.hourlyCost} onChange={(hourlyCost) => set({ hourlyCost })} />
          <NumberField label="Product annual cost" prefix="₹" step={1000} value={input.annualCost} onChange={(annualCost) => set({ annualCost })} hint="Example only — not a price. Use approved commercial pricing." />
          <NumberField label="Optional pilot cost" prefix="₹" step={1000} value={input.pilotCost} onChange={(pilotCost) => set({ pilotCost })} />
        </div>
      </Panel>

      <Panel title="Scenarios" kicker="Placeholder assumptions — replace with measured pilot values">
        <div className={css.scenarioGrid}>
          {scenarios.map((scenario) => (
            <fieldset key={scenario.id} className={css.scenario}>
              <legend>{scenario.label}</legend>
              <NumberField label="Preparation time saved" suffix="%" max={100} value={scenario.prepReduction} onChange={(prepReduction) => setScenario(scenario.id, { prepReduction })} />
              <NumberField label="Rework avoided" suffix="%" max={100} value={scenario.reworkReduction} onChange={(reworkReduction) => setScenario(scenario.id, { reworkReduction })} />
            </fieldset>
          ))}
        </div>
        <p className={css.blockNote}>Review time is never reduced here: a qualified person still reviews every record.</p>
      </Panel>

      <Panel title="Estimate" kicker="Ranges, not promises" tone="accent">
        <dl className={css.stats}>
          <div className={css.stat}>
            <dt className={css.statLabel}>Current annual labour estimate</dt>
            <dd className={css.statValue}>{formatINRShort(result.currentCost)}</dd>
            <dd className={css.statNote}>
              {formatCount(result.currentHours)} hours across {formatCount(result.annualFais)} FAIs a year
            </dd>
          </div>
          <div className={css.stat} data-emphasis="">
            <dt className={css.statLabel}>Possible annual value</dt>
            <dd className={css.statValue}>
              {formatINRShort(low)} – {formatINRShort(high)}
            </dd>
            <dd className={css.statNote}>Expected: {formatINRShort(expected.annualValue)}</dd>
          </div>
        </dl>

        <div className={css.tableWrap}>
          <table className={css.table}>
            <caption className={css.srOnly}>ROI by scenario</caption>
            <thead>
              <tr>
                <th scope="col">Scenario</th>
                <th scope="col">Hours saved / year</th>
                <th scope="col">Annual value</th>
                <th scope="col">Net, first year</th>
                <th scope="col">Payback</th>
                <th scope="col">ROI</th>
              </tr>
            </thead>
            <tbody>
              {result.scenarios.map((row) => (
                <tr key={row.scenario.id}>
                  <th scope="row">{row.scenario.label}</th>
                  <td>{formatCount(row.hoursSaved)}</td>
                  <td>{formatINR(row.annualValue)}</td>
                  <td>{formatINR(row.netFirstYear)}</td>
                  <td>{months(row.paybackMonths)}</td>
                  <td>{percent(row.roiPercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className={css.subTitle}>Before vs after (expected scenario)</h4>
        <ul className={css.compareBars}>
          <li>
            <span>Current hours / year</span>
            <span className={css.compareTrack} aria-hidden="true">
              <span style={{ width: "100%" }} />
            </span>
            <span className={css.tabular}>{formatCount(result.currentHours)}</span>
          </li>
          <li data-after="">
            <span>Estimated hours / year</span>
            <span className={css.compareTrack} aria-hidden="true">
              <span style={{ width: `${(afterHours / widest) * 100}%` }} />
            </span>
            <span className={css.tabular}>{formatCount(afterHours)}</span>
          </li>
        </ul>

        <h4 className={css.subTitle}>Sensitivity — expected scenario</h4>
        <ul className={css.dotList}>
          {result.sensitivity.map((row) => (
            <li key={row.label}>
              {row.label}: {formatINRShort(row.annualValue)} a year
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
