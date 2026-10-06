"use client";

import { useId, useState } from "react";
import { trackAqip } from "../analytics";
import { HITL_CARDS, HITL_NOTE, type HitlCard } from "../data/ai";
import css from "../pillars.module.css";

const NO_DECISION = "No decision yet. Until a person decides, this proposal cannot enter a controlled record.";

function Card({ card }: { card: HitlCard }) {
  const uid = useId();
  const [chosen, setChosen] = useState<string | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const action = card.actions.find((item) => item.id === chosen);

  return (
    <div className={css.hitlCard} role="group" aria-labelledby={`${uid}-title`}>
      <p className={css.hitlKind}>{card.kind}</p>
      <h4 id={`${uid}-title`} className={css.hitlTitle}>
        {card.title}
      </h4>
      <dl className={css.hitlFields}>
        {card.fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
        <div className={css.hitlStatus} data-kind={action?.kind ?? "open"} aria-live="polite">
          <dt>Status</dt>
          <dd>{action?.status ?? card.initial}</dd>
        </div>
      </dl>
      <div className={css.hitlActions} role="group" aria-label={`Decide on the ${card.title.toLowerCase()}`}>
        {card.actions.map((item) => (
          <button
            key={item.id}
            type="button"
            className={css.hitlButton}
            data-kind={item.kind}
            aria-pressed={chosen === item.id}
            onClick={() => {
              setChosen(chosen === item.id ? null : item.id);
              if (chosen !== item.id) trackAqip("aqip_hitl_action", { card: card.id, action: item.id });
            }}
          >
            {item.label}
          </button>
        ))}
        {card.source ? (
          <button type="button" className={css.hitlButton} aria-expanded={sourceOpen} aria-controls={`${uid}-source`} onClick={() => setSourceOpen(!sourceOpen)}>
            View source
          </button>
        ) : null}
      </div>
      {card.source ? (
        <p id={`${uid}-source`} className={css.hitlSource} hidden={!sourceOpen}>
          <strong>Source:</strong> {card.source}
        </p>
      ) : null}
      <p className={css.hitlLog}>
        <strong>What the record keeps:</strong> {action ? action.log : NO_DECISION}
      </p>
    </div>
  );
}

/**
 * The human-in-the-loop control panel, as a concept: an AI result and a
 * geometry candidate, each waiting for a person. Choosing an action shows the
 * status it would take and what would be recorded. Nothing is stored or sent.
 */
export default function HitlPanel() {
  return (
    <div className={css.hitl}>
      <div className={css.hitlCards}>
        {HITL_CARDS.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <p className={css.hitlNote}>{HITL_NOTE}</p>
    </div>
  );
}
