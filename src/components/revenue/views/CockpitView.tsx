"use client";
// The Revenue Cockpit: market, buyers, engagement, validation, commercial,
// pipeline, outcomes and learning — from the user's own records, with the
// synthetic demonstration records added only when the user chooses.
import { PAINS } from "../data/library";
import { SYNTHETIC_ACCOUNTS, SYNTHETIC_NOTE, SYNTHETIC_OPPORTUNITIES } from "../data/synthetic";
import { cockpitMetrics } from "../logic/cockpit";
import { formatCount, formatDate, formatINR, formatINRShort, formatPercent } from "../logic/format";
import { useRevenue } from "../state/store";
import { SyntheticBadge } from "../ui/badges";
import { Notice, Panel, Stat, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export default function CockpitView() {
  const state = useRevenue();
  const accounts = state.showSynthetic ? [...state.accounts, ...SYNTHETIC_ACCOUNTS] : state.accounts;
  const opportunities = state.showSynthetic ? [...state.opportunities, ...SYNTHETIC_OPPORTUNITIES] : state.opportunities;
  const m = cockpitMetrics({
    accounts,
    opportunities,
    meetings: state.meetings,
    pains: state.pains,
    painTotal: PAINS.length,
    feedback: state.feedback,
    decisions: state.decisions.length,
    weights: state.weights,
  });

  const responseRate = m.engagement.outreach ? (m.engagement.replies / m.engagement.outreach) * 100 : NaN;

  // The revenue system lights up stage by stage, only as evidence exists for each.
  const system = [
    { label: "Problem", on: m.validation.validated > 0 },
    { label: "Customer", on: m.market.accounts > 0 },
    { label: "Evidence", on: m.market.evidence > 0 },
    { label: "Value", on: m.commercial.demos > 0 },
    { label: "Opportunity", on: m.commercial.qualified > 0 },
    { label: "Pilot", on: m.commercial.pilots > 0 },
    { label: "Revenue", on: m.outcomes.won > 0 },
    { label: "Expansion", on: false },
  ];

  const funnel = [
    { label: "Accounts", value: m.market.accounts },
    { label: "Contacts", value: m.engagement.outreach },
    { label: "Meetings", value: Math.max(m.engagement.meetings, m.engagement.replies) },
    { label: "Qualified", value: m.commercial.qualified },
    { label: "Pilots", value: m.commercial.pilots },
    { label: "Proposals", value: m.commercial.proposals },
    { label: "Wins", value: m.outcomes.won },
  ];
  const top = Math.max(1, ...funnel.map((step) => step.value));

  return (
    <div>
      <ViewHeader eyebrow="Execute" title="Revenue Cockpit" lede="Is evidence becoming commercial traction? Raw leads never count as pipeline: only opportunities meeting all seven qualification criteria do." />

      <div className={css.toggleRow}>
        <label className={css.switchLabel}>
          <input type="checkbox" checked={state.showSynthetic} autoComplete="off" onChange={(event) => state.setShowSynthetic(event.target.checked)} />
          Include synthetic demonstration data
        </label>
        {state.showSynthetic ? <SyntheticBadge /> : null}
      </div>
      {state.showSynthetic ? <Notice tone="synthetic">{SYNTHETIC_NOTE} Turn it off to see only your own records.</Notice> : null}

      <section className={css.northStar} aria-labelledby="rv-north">
        <p className={css.kicker}>North Star</p>
        <h3 id="rv-north" className={css.panelTitle}>
          Qualified Revenue Pipeline Created
        </h3>
        <p className={css.northValue}>{formatINR(m.pipeline.qualifiedValue)}</p>
        <p className={css.railMeta}>
          {m.commercial.qualified} qualified {m.commercial.qualified === 1 ? "opportunity" : "opportunities"}: relevant account, validated problem, business impact, relevant stakeholder, technical fit, commercial fit and an agreed next action.
        </p>
      </section>

      <section aria-labelledby="rv-system" className={css.systemWrap}>
        <h3 id="rv-system" className={css.blockTitle}>
          Revenue system
        </h3>
        <ol className={css.systemLine}>
          {system.map((stage) => (
            <li key={stage.label} data-on={stage.on ? "" : undefined}>
              <span>{stage.label}</span>
              <span className={css.srOnly}>{stage.on ? " — evidence recorded" : " — not yet"}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className={css.cockpitGrid}>
        <Panel title="Market" kicker="Who">
          <dl className={css.stats}>
            <Stat label="Accounts researched" value={formatCount(m.market.accounts)} />
            <Stat label="ICP-fit accounts (score ≥ 70)" value={formatCount(m.market.icpFit)} />
            <Stat label="Market segments" value={formatCount(m.market.segments)} />
            <Stat label="Evidence items" value={formatCount(m.market.evidence)} />
          </dl>
        </Panel>
        <Panel title="Buyers" kicker="Who decides">
          <dl className={css.stats}>
            <Stat label="Stakeholder roles identified" value={formatCount(m.buyers.stakeholders)} />
            <Stat label="Opportunities with a relevant stakeholder" value={formatCount(m.buyers.champions)} />
          </dl>
        </Panel>
        <Panel title="Engagement" kicker="Conversations">
          <dl className={css.stats}>
            <Stat label="Accounts contacted" value={formatCount(m.engagement.outreach)} />
            <Stat label="Reached discovery" value={formatCount(m.engagement.replies)} />
            <Stat label="Meetings recorded" value={formatCount(m.engagement.meetings)} />
            <Stat label="Response rate" value={formatPercent(responseRate)} />
          </dl>
        </Panel>
        <Panel title="Validation" kicker="Evidence">
          <dl className={css.stats}>
            <Stat label="Pain hypotheses" value={formatCount(m.validation.hypotheses)} />
            <Stat label="Customer-validated or better" value={formatCount(m.validation.validated)} />
            <Stat label="Invalidated" value={formatCount(m.validation.invalidated)} />
          </dl>
        </Panel>
        <Panel title="Commercial" kicker="Progress">
          <dl className={css.stats}>
            <Stat label="Qualified opportunities" value={formatCount(m.commercial.qualified)} />
            <Stat label="Demos" value={formatCount(m.commercial.demos)} />
            <Stat label="Evaluations" value={formatCount(m.commercial.evaluations)} />
            <Stat label="Pilots" value={formatCount(m.commercial.pilots)} />
            <Stat label="Proposals" value={formatCount(m.commercial.proposals)} />
            <Stat label="Negotiations" value={formatCount(m.commercial.negotiations)} />
          </dl>
        </Panel>
        <Panel title="Pipeline" kicker="₹">
          <dl className={css.stats}>
            <Stat label="Gross pipeline" value={formatINRShort(m.pipeline.gross)} />
            <Stat label="Weighted pipeline" value={formatINRShort(m.pipeline.weighted)} note="Stage probabilities are planning assumptions." />
            <Stat label="Latest expected step" value={m.pipeline.expectedClose ? formatDate(m.pipeline.expectedClose) : "—"} />
            <Stat label="Average opportunity value" value={formatINRShort(m.pipeline.average)} />
          </dl>
        </Panel>
        <Panel title="Outcomes" kicker="Result">
          <dl className={css.stats}>
            <Stat label="Won" value={formatCount(m.outcomes.won)} />
            <Stat label="Lost" value={formatCount(m.outcomes.lost)} />
            <Stat label="Revenue (contracted)" value={formatINRShort(m.outcomes.revenue)} />
          </dl>
        </Panel>
        <Panel title="Learning" kicker="What changed">
          <dl className={css.stats}>
            <Stat label="Product insights" value={formatCount(m.learning.insights)} />
            <Stat label="Meetings with objections" value={formatCount(m.learning.objections)} />
            <Stat label="Distinct loss reasons" value={formatCount(m.learning.lossReasons)} />
            <Stat label="Decisions logged" value={formatCount(m.learning.decisions)} />
          </dl>
        </Panel>
      </div>

      <Panel title="Funnel" kicker="Accounts → Wins">
        <ol className={css.funnel}>
          {funnel.map((step) => (
            <li key={step.label}>
              <span className={css.funnelLabel}>{step.label}</span>
              <span className={css.funnelBar} aria-hidden="true">
                <span style={{ width: `${(step.value / top) * 100}%` }} />
              </span>
              <span className={css.tabular}>{formatCount(step.value)}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
