"use client";
// The decision log: what was decided, on what evidence, and what would
// invalidate it.
import { useState } from "react";
import { formatDate } from "../logic/format";
import type { Decision } from "../state/model";
import { useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import { Panel, SelectField, TextArea, TextField, newId, today } from "../ui/controls";
import css from "../app.module.css";

const EXAMPLES = [
  "Focus on precision-machining suppliers",
  "Approach the Quality Head before procurement",
  "Use a sample-drawing evaluation",
  "Change the pricing hypothesis",
  "Stop pursuing low-volume accounts",
];

const blank = (): Decision => ({ id: newId("dec"), decision: "", date: today(), owner: "", evidence: "", confidence: "Medium", why: "", invalidate: "", review: "" });

export default function DecisionLog() {
  const decisions = useRevenue((state) => state.decisions);
  const addDecision = useRevenue((state) => state.addDecision);
  const removeDecision = useRevenue((state) => state.removeDecision);
  const [draft, setDraft] = useState<Decision>(blank);
  const patch = (change: Partial<Decision>) => setDraft((current) => ({ ...current, ...change }));
  const canSave = Boolean(draft.decision.trim() && draft.evidence.trim() && draft.invalidate.trim());

  const save = () => {
    if (!canSave) return;
    addDecision(draft);
    setDraft(blank());
  };

  return (
    <div>

      <Panel title="Log a decision" kicker="New" tone="accent">
        <div className={css.formGrid}>
          <TextField label="Decision" required value={draft.decision} onChange={(decision) => patch({ decision })} placeholder={EXAMPLES[0]} />
          <TextField label="Date" type="date" value={draft.date} onChange={(date) => patch({ date })} />
          <TextField label="Owner" value={draft.owner} onChange={(owner) => patch({ owner })} />
          <SelectField label="Confidence" value={draft.confidence} onChange={(confidence) => patch({ confidence })} options={["Low", "Medium", "High"].map((value) => ({ value: value as Decision["confidence"], label: value }))} />
          <TextArea label="Evidence" required value={draft.evidence} onChange={(evidence) => patch({ evidence })} />
          <TextArea label="Why" value={draft.why} onChange={(why) => patch({ why })} />
          <TextArea label="What would invalidate it?" required value={draft.invalidate} onChange={(invalidate) => patch({ invalidate })} />
          <TextField label="Review date" type="date" value={draft.review} onChange={(review) => patch({ review })} />
        </div>
        {!canSave ? <p className={css.warnText}>A decision needs its evidence and what would invalidate it.</p> : null}
        <button type="button" className={css.primaryButton} aria-disabled={!canSave} onClick={save}>
          Log decision
        </button>
        <p className={css.blockNote}>Examples: {EXAMPLES.join(" · ")}</p>
      </Panel>

      {decisions.length === 0 ? <p className={css.empty}>No decisions logged yet.</p> : null}
      <ul className={css.cardList}>
        {decisions.map((decision) => (
          <li key={decision.id} className={css.miniCard}>
            <div className={css.miniHead}>
              <h3 className={css.miniTitle}>{decision.decision}</h3>
              <Badge tone={decision.confidence === "High" ? "green" : decision.confidence === "Medium" ? "cyan" : "amber"}>{decision.confidence} confidence</Badge>
            </div>
            <p className={css.blockNote}>
              {formatDate(decision.date)}
              {decision.owner ? ` · ${decision.owner}` : ""}
              {decision.review ? ` · review ${formatDate(decision.review)}` : ""}
            </p>
            <p>
              <strong>Evidence:</strong> {decision.evidence}
            </p>
            {decision.why ? (
              <p>
                <strong>Why:</strong> {decision.why}
              </p>
            ) : null}
            <p>
              <strong>Invalidated if:</strong> {decision.invalidate}
            </p>
            <button type="button" className={css.linkButton} onClick={() => removeDecision(decision.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
