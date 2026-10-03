// Model credibility for one model. Credibility differs between models, so it
// is always shown for the model in question and never for "the twin".
import { MODEL_CARDS, MODEL_LEVELS } from "../data/twinContent";
import { Rows } from "./panels";
import ui from "../twin3d.module.css";

export function CredibilityCard({ id }: { id: keyof typeof MODEL_CARDS }) {
  const card = MODEL_CARDS[id];
  const level = MODEL_LEVELS.find((l) => l.level === card.level);
  return (
    <div className={ui.card} role="group" aria-label={`Model credibility: ${card.model}`}>
      <p className={ui.groupLabel}>MODEL CREDIBILITY</p>
      <Rows
        rows={[
          { label: "MODEL", value: card.model },
          { label: "FIDELITY", value: `${card.fidelity} · ${card.level}` },
          { label: "DATA", value: card.data },
          { label: "CORRELATION", value: card.correlation },
          { label: "UNCERTAINTY", value: card.uncertainty },
          { label: "STATUS", value: card.status },
        ]}
      />
      <details className={ui.details}>
        <summary>VIEW ASSUMPTIONS</summary>
        <ul>
          {card.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
          {level && (
            <li>
              {level.level}: {level.text}.
            </li>
          )}
        </ul>
      </details>
    </div>
  );
}
