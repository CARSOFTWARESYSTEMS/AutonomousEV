"use client";
// The reverse-planning revenue calculator and the unit-economics sandbox.
// Inputs are examples to replace with the user's own measured numbers.
import { useRef, useState } from "react";
import { trackRevenue } from "../analytics";
import { formatCount, formatINR, formatINRShort } from "../logic/format";
import { EXAMPLE_REVENUE_INPUTS, calculateRevenueMath, type RevenueMathInputs } from "../logic/revenueMath";
import { EXAMPLE_UNIT_INPUTS, calculateUnitEconomics, type UnitInputs } from "../logic/unitEconomics";
import { Notice, NumberField, Panel } from "../ui/controls";
import css from "../app.module.css";

const count = (value: number) => (Number.isFinite(value) ? formatCount(value) : "—");

export function RevenueMath() {
  const [input, setInput] = useState<RevenueMathInputs>(EXAMPLE_REVENUE_INPUTS);
  const reported = useRef(false);
  const result = calculateRevenueMath(input);
  const set = (change: Partial<RevenueMathInputs>) => {
    setInput((current) => ({ ...current, ...change }));
    if (!reported.current) {
      reported.current = true;
      trackRevenue("revenue_math_calculated");
    }
  };

  const steps = [
    { label: "Outreach", value: result.outreach },
    { label: "Meetings", value: result.meetings },
    { label: "Qualified opportunities", value: result.qualified },
    { label: "Proposals", value: result.proposals },
    { label: "Customers", value: result.customers },
  ];

  return (
    <Panel title="Revenue Math Engine" kicker="Revenue is a system, not a wish" tone="accent">
      <p className={css.panelLede}>Work backwards from the target. Example rates are placeholders — replace them with your own measured conversion rates.</p>
      <div className={css.formGrid}>
        <NumberField label="Target annual revenue" prefix="₹" step={100000} value={input.target} onChange={(target) => set({ target })} hint={formatINRShort(input.target)} />
        <NumberField label="Average contract value" prefix="₹" step={10000} value={input.acv} onChange={(acv) => set({ acv })} hint={formatINR(input.acv)} />
        <NumberField label="Win rate (qualified → won)" suffix="%" max={100} value={input.winRate} onChange={(winRate) => set({ winRate })} />
        <NumberField label="Proposal-to-win rate" suffix="%" max={100} value={input.proposalWinRate} onChange={(proposalWinRate) => set({ proposalWinRate })} />
        <NumberField label="Meeting-to-qualified rate" suffix="%" max={100} value={input.meetingToQualified} onChange={(meetingToQualified) => set({ meetingToQualified })} />
        <NumberField label="Outreach-to-meeting rate" suffix="%" max={100} value={input.outreachToMeeting} onChange={(outreachToMeeting) => set({ outreachToMeeting })} />
      </div>
      {result.warnings.length ? (
        <Notice tone="warn">
          {result.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </Notice>
      ) : null}
      <ol className={css.reverseFunnel} aria-label="What the target requires">
        {steps.map((step) => (
          <li key={step.label}>
            <span className={css.tabular}>{count(step.value)}</span>
            <span>{step.label} required</span>
          </li>
        ))}
      </ol>
      <dl className={css.summaryRow}>
        <div>
          <dt>Required qualified pipeline</dt>
          <dd>{Number.isFinite(result.requiredPipeline) ? formatINRShort(result.requiredPipeline) : "—"}</dd>
        </div>
        <div>
          <dt>Pipeline coverage</dt>
          <dd>{Number.isFinite(result.coverage) ? `${result.coverage.toFixed(1)}× target` : "—"}</dd>
        </div>
      </dl>
      <p className={css.formula}>Required Pipeline = Revenue Target ÷ Expected Win Rate</p>
    </Panel>
  );
}

export function UnitEconomics() {
  const [input, setInput] = useState<UnitInputs>(EXAMPLE_UNIT_INPUTS);
  const result = calculateUnitEconomics(input);
  const set = (change: Partial<UnitInputs>) => setInput((current) => ({ ...current, ...change }));

  return (
    <Panel title="Unit Economics Sandbox" kicker="Is the model scalable?">
      <p className={css.panelLede}>
        If winning a customer costs more than the gross profit expected from that customer, is the sales model scalable? Use your own measured inputs — no benchmark values are built in.
      </p>
      <div className={css.formGrid}>
        <NumberField label="Customer acquisition cost (CAC)" prefix="₹" step={5000} value={input.cac} onChange={(cac) => set({ cac })} hint="Everything spent to win one customer, including people's time." />
        <NumberField label="Average contract value per year (ACV)" prefix="₹" step={10000} value={input.acv} onChange={(acv) => set({ acv })} />
        <NumberField label="Gross margin" suffix="%" max={100} value={input.grossMargin} onChange={(grossMargin) => set({ grossMargin })} />
        <NumberField label="Annual renewal" suffix="%" max={100} value={input.renewal} onChange={(renewal) => set({ renewal })} />
        <NumberField label="Annual expansion" suffix="%" max={100} value={input.expansion} onChange={(expansion) => set({ expansion })} />
        <NumberField label="Sales cycle" suffix="months" max={60} value={input.salesCycle} onChange={(salesCycle) => set({ salesCycle })} />
      </div>
      <dl className={css.stats}>
        <div className={css.stat}>
          <dt className={css.statLabel}>Gross profit per customer per year</dt>
          <dd className={css.statValue}>{formatINRShort(result.grossProfitPerYear)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.statLabel}>CAC payback</dt>
          <dd className={css.statValue}>{Number.isFinite(result.paybackMonths) ? `${result.paybackMonths.toFixed(1)} months` : "—"}</dd>
          <dd className={css.statNote}>Plus a {input.salesCycle}-month sales cycle before the first payment.</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.statLabel}>Lifetime gross profit (10-year cap)</dt>
          <dd className={css.statValue}>{formatINRShort(result.lifetimeValue)}</dd>
          <dd className={css.statNote}>Expected customer life {result.expectedYears.toFixed(1)} years.</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.statLabel}>Lifetime value ÷ CAC</dt>
          <dd className={css.statValue}>{Number.isFinite(result.ratio) ? `${result.ratio.toFixed(1)}×` : "—"}</dd>
        </div>
      </dl>
      <p className={css.verdict} role="status" data-verdict={result.verdict}>
        {result.verdict === "loses"
          ? "Each customer costs more to win than the gross profit they bring: the model loses money as it grows."
          : result.verdict === "covers"
            ? "Lifetime gross profit covers the cost of winning the customer. Check the payback period against your cash runway."
            : "Enter a contract value and margin to see the result."}
      </p>
    </Panel>
  );
}
