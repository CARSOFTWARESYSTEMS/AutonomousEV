"use client";
// The Revenue Cockpit: what can become revenue. Eight figures, the North
// Star and its definition, then the opportunities, the pilot charter, the
// decision log and the revenue model. Synthetic examples appear only here
// and on Accounts, always labelled, and only while the toggle is on.
import { isUnlocked, unlockDay } from "../data/framework";
import { EXPANSION_OPTIONS, EXPANSION_PATH, PAINS, PRICING_MODELS } from "../data/library";
import { QUALIFICATION } from "../data/scoring";
import { SYNTHETIC_ACCOUNTS, SYNTHETIC_NOTE, SYNTHETIC_OPPORTUNITIES } from "../data/synthetic";
import { cockpitMetrics } from "../logic/cockpit";
import { formatCount, formatINR, formatINRShort } from "../logic/format";
import { useRevenue } from "../state/store";
import AppShell from "../app/AppShell";
import { Badge, SyntheticBadge } from "../ui/badges";
import { Notice } from "../ui/controls";
import css from "../app.module.css";
import { RevenueMath, UnitEconomics } from "./Calculators";
import DecisionLog from "./DecisionLog";
import Opportunities from "./Opportunities";
import PilotCharter from "./PilotCharter";

export default function PipelinePage() {
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

  const figures = [
    { label: "Accounts", value: formatCount(m.market.accounts) },
    { label: "Meetings", value: formatCount(m.engagement.meetings) },
    { label: "Validated pains", value: formatCount(m.validation.validated) },
    { label: "Qualified opportunities", value: formatCount(m.commercial.qualified) },
    { label: "Pilots", value: formatCount(m.commercial.pilots) },
    { label: "Proposals", value: formatCount(m.commercial.proposals) },
    { label: "Pipeline ₹", value: formatINRShort(m.pipeline.gross), note: `Weighted ${formatINRShort(m.pipeline.weighted)}` },
    { label: "Revenue ₹", value: formatINRShort(m.outcomes.revenue), note: "Contracted only" },
  ];

  return (
    <AppShell page="pipeline">
      <div className={css.page}>
        <header className={css.pageHead}>
          <p className={css.eyebrow}>Revenue Cockpit</p>
          <h1 className={css.pageTitle}>Know what can become revenue</h1>
          <p className={css.pageLede}>Market evidence and qualified pipeline in one place. Raw leads never count as pipeline.</p>
          <div className={css.buttonRow}>
            <label className={css.switchLabel}>
              <input type="checkbox" checked={state.showSynthetic} autoComplete="off" onChange={(event) => state.setShowSynthetic(event.target.checked)} />
              Include synthetic examples
            </label>
            {state.showSynthetic ? <SyntheticBadge /> : null}
          </div>
        </header>

        {!isUnlocked("pipeline", state.day) ? (
          <Notice tone="info">
            Pipeline work begins on Day {unlockDay("pipeline")}. You are on Day {state.day} — explore it now; nothing here is required yet.
          </Notice>
        ) : null}
        {state.showSynthetic ? <Notice tone="synthetic">{SYNTHETIC_NOTE}</Notice> : null}

        <section className={css.northStar} aria-labelledby="rv-north">
          <p className={css.eyebrow}>North Star</p>
          <h2 id="rv-north" className={css.northTitle}>
            Qualified Revenue Pipeline Created
          </h2>
          <p className={css.northValue}>{formatINR(m.pipeline.qualifiedValue)}</p>
          <p className={css.blockNote}>An opportunity counts only with all six:</p>
          <ul className={css.qualifyList}>
            {QUALIFICATION.map((criterion) => (
              <li key={criterion.id}>{criterion.label}</li>
            ))}
          </ul>
        </section>

        <dl className={css.metricGrid} aria-label="Cockpit">
          {figures.map((figure) => (
            <div key={figure.label} className={css.metric}>
              <dt>{figure.label}</dt>
              <dd>{figure.value}</dd>
              {figure.note ? <dd className={css.metricNote}>{figure.note}</dd> : null}
            </div>
          ))}
        </dl>

        <section id="opportunities" className={css.pageSection} aria-labelledby="rv-opps-title">
          <h2 id="rv-opps-title" className={css.sectionTitle}>
            Opportunities
          </h2>
          <p className={css.pageLede}>Stages move on customer commitment, not on your activity. Every opportunity needs a next action and a date.</p>
          <Opportunities />
        </section>

        <section id="pilot" className={css.pageSection} aria-labelledby="rv-pilot-title">
          <h2 id="rv-pilot-title" className={css.sectionTitle}>
            Pilot charter {!isUnlocked("pilot", state.day) ? <Badge>From Day {unlockDay("pilot")}</Badge> : null}
          </h2>
          <p className={css.pageLede}>Define success before the pilot starts. A pilot that cannot fail cannot prove anything.</p>
          <details className={css.disclosure} open={isUnlocked("pilot", state.day)}>
            <summary>Open the pilot charter</summary>
            <PilotCharter />
          </details>
        </section>

        <section id="decisions" className={css.pageSection} aria-labelledby="rv-decisions-title">
          <h2 id="rv-decisions-title" className={css.sectionTitle}>
            Decision log
          </h2>
          <p className={css.pageLede}>Every decision names its evidence and what would make it wrong — so it can be revisited, not defended.</p>
          <details className={css.disclosure}>
            <summary>Log or review decisions ({state.decisions.length})</summary>
            <DecisionLog />
          </details>
        </section>

        <section id="revenue-model" className={css.pageSection} aria-labelledby="rv-model-title">
          <h2 id="rv-model-title" className={css.sectionTitle}>
            Revenue model
          </h2>
          <p className={css.pageLede}>Revenue is a system, not a wish. Work backwards from the target; check that winning a customer pays.</p>
          <details className={css.disclosure}>
            <summary>Revenue math — from target to outreach</summary>
            <RevenueMath />
          </details>
          <details className={css.disclosure}>
            <summary>Unit economics sandbox</summary>
            <UnitEconomics />
          </details>
          <details className={css.disclosure}>
            <summary>Pricing models {!isUnlocked("proposal", state.day) ? `(from Day ${unlockDay("proposal")})` : ""}</summary>
            <ul className={css.cardList}>
              {PRICING_MODELS.map((model) => (
                <li key={model.name} className={css.miniCard}>
                  <h3 className={css.miniTitle}>{model.name}</h3>
                  <p>{model.text}</p>
                </li>
              ))}
            </ul>
            <p className={css.blockNote}>Interns propose pricing hypotheses; they never quote. Commercials come from approved policy after scope is understood.</p>
          </details>
          <details className={css.disclosure}>
            <summary>After the sale: {EXPANSION_PATH.join(" → ")}</summary>
            <div className={css.chipRow}>
              {EXPANSION_OPTIONS.map((option) => (
                <Badge key={option}>{option}</Badge>
              ))}
            </div>
            <p className={css.blockNote}>Adoption and success metrics come first; expansion is not always appropriate.</p>
          </details>
        </section>
      </div>
    </AppShell>
  );
}
