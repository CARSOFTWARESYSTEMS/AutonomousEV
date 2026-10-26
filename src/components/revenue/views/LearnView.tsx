"use client";
// The Learn views: Marketing, Sales and Revenue concepts, each linked to the
// day that teaches it, with the libraries and calculators that belong there.
import { useEffect } from "react";
import { trackRevenue } from "../analytics";
import { PROFESSIONAL_BEHAVIOUR } from "../data/framework";
import { ALTERNATIVES, EXPANSION_OPTIONS, EXPANSION_PATH, LEARN, LOSS_REASONS, OBJECTIONS, PRICING_MODELS, STOP_REASONS, type Concept } from "../data/library";
import { Badge } from "../ui/badges";
import { List, Panel, ViewHeader } from "../ui/controls";
import { ViewLink } from "../workspace/nav";
import css from "../workspace.module.css";
import { RevenueMath, UnitEconomics } from "./Calculators";

function Concepts({ concepts }: { concepts: readonly Concept[] }) {
  return (
    <ul className={css.conceptGrid}>
      {concepts.map((concept) => (
        <li key={concept.id} className={css.miniCard}>
          <h3 className={css.miniTitle}>{concept.title}</h3>
          <p>{concept.summary}</p>
          <ul className={css.dotList}>
            {concept.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className={css.dayLinks}>
            Taught on{" "}
            {concept.days.map((day, i) => (
              <span key={day}>
                {i ? ", " : ""}
                <ViewLink view="today" day={day}>
                  Day {day}
                </ViewLink>
              </span>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

function useLearnOpen(topic: string) {
  useEffect(() => trackRevenue("learn_open", { topic }), [topic]);
}

export function LearnMarketing() {
  useLearnOpen("marketing");
  const { title, intro, concepts } = LEARN.marketing;
  return (
    <div>
      <ViewHeader eyebrow="Learn" title={title} lede={intro} />
      <Concepts concepts={concepts} />
      <Panel title="Alternatives — including doing nothing" kicker="Day 13">
        <ul className={css.cardList}>
          {ALTERNATIVES.map((alternative) => (
            <li key={alternative.name} className={css.miniCard}>
              <h4 className={css.miniTitle}>{alternative.name}</h4>
              <p>
                <strong>Strength:</strong> {alternative.strength}
              </p>
              <p>
                <strong>Limit:</strong> {alternative.limit}
              </p>
            </li>
          ))}
        </ul>
        <p className={css.blockNote}>Describe every alternative so that a happy user of it would agree. Never criticise competitors.</p>
      </Panel>
    </div>
  );
}

export function LearnSales() {
  useLearnOpen("sales");
  const { title, intro, concepts } = LEARN.sales;
  return (
    <div>
      <ViewHeader eyebrow="Learn" title={title} lede={intro} />
      <Concepts concepts={concepts} />
      <Panel title="Objection library" kicker="Day 36">
        <ul className={css.cardList}>
          {OBJECTIONS.map((objection) => (
            <li key={objection.id} className={css.miniCard}>
              <div className={css.miniHead}>
                <h4 className={css.miniTitle}>{objection.name}</h4>
                {objection.review ? <Badge tone="amber">{objection.review}</Badge> : null}
              </div>
              <p className={css.blockNote}>{objection.meaning}</p>
              <p>{objection.response}</p>
            </li>
          ))}
        </ul>
      </Panel>
      <div className={css.twoCol}>
        <Panel title="Should we continue?" kicker="Stop reasons">
          <List items={STOP_REASONS} />
          <p className={css.blockNote}>A high-quality sales process teaches when not to sell.</p>
        </Panel>
        <Panel title="Loss reasons" kicker="Lost opportunity analysis">
          <List items={LOSS_REASONS} />
          <p className={css.blockNote}>For every loss: what did we learn, and what should change?</p>
        </Panel>
      </div>
      <Panel title="Professional behaviour" kicker="Mandatory before customer contact">
        <List items={PROFESSIONAL_BEHAVIOUR} />
        <ViewLink view="internship" className={css.inlineLink}>
          Complete the module →
        </ViewLink>
      </Panel>
    </div>
  );
}

export function LearnRevenue() {
  useLearnOpen("revenue");
  const { title, intro, concepts } = LEARN.revenue;
  return (
    <div>
      <ViewHeader eyebrow="Learn" title={title} lede={intro} />
      <Concepts concepts={concepts} />
      <RevenueMath />
      <UnitEconomics />
      <Panel title="Pricing architecture" kicker="Day 34 · policy, not improvisation">
        <ul className={css.cardList}>
          {PRICING_MODELS.map((model) => (
            <li key={model.name} className={css.miniCard}>
              <h4 className={css.miniTitle}>{model.name}</h4>
              <p>{model.text}</p>
            </li>
          ))}
        </ul>
        <p className={css.blockNote}>Interns propose pricing hypotheses; they never quote. Commercials come from approved policy after scope is understood.</p>
      </Panel>
      <Panel title="Customer success & expansion" kicker="The journey does not end at purchase">
        <ol className={css.buyerChain} aria-label="Customer lifecycle">
          {EXPANSION_PATH.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className={css.panelLede}>Possible expansion, only when adoption and success metrics support it:</p>
        <div className={css.chipRow}>
          {EXPANSION_OPTIONS.map((option) => (
            <Badge key={option}>{option}</Badge>
          ))}
        </div>
        <p className={css.blockNote}>Teach adoption, success metrics, quarterly business reviews with customer evidence, renewal — and do not assume expansion is always appropriate.</p>
      </Panel>
    </div>
  );
}
