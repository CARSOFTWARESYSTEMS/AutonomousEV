"use client";
// The product feedback loop: one request is recorded, a repeated pattern is
// investigated, an evidence-backed pattern goes to product review. Sales never
// promises features.
import { useState } from "react";
import { FEEDBACK_CATEGORIES, FEEDBACK_RULE } from "../data/library";
import { formatDate } from "../logic/format";
import { useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import { Notice, NumberField, Panel, SelectField, TextArea, ViewHeader, newId, today } from "../ui/controls";
import css from "../workspace.module.css";

/** Where a category stands: by how many independent accounts raised it. */
export function feedbackStage(accounts: number): (typeof FEEDBACK_RULE)[number] {
  if (accounts >= 3) return FEEDBACK_RULE[2];
  if (accounts >= 2) return FEEDBACK_RULE[1];
  return FEEDBACK_RULE[0];
}

export default function FeedbackView() {
  const feedback = useRevenue((state) => state.feedback);
  const addFeedback = useRevenue((state) => state.addFeedback);
  const removeFeedback = useRevenue((state) => state.removeFeedback);
  const [category, setCategory] = useState<string>(FEEDBACK_CATEGORIES[0]);
  const [text, setText] = useState("");
  const [accounts, setAccounts] = useState(1);

  const byCategory = FEEDBACK_CATEGORIES.map((name) => {
    const items = feedback.filter((item) => item.category === name);
    return { name, items, accounts: items.reduce((sum, item) => sum + item.accounts, 0) };
  }).filter((group) => group.items.length);

  const add = () => {
    if (!text.trim()) return;
    addFeedback({ id: newId("fb"), category, text: text.trim(), accounts: Math.max(1, Math.round(accounts)), date: today() });
    setText("");
    setAccounts(1);
  };

  return (
    <div>
      <ViewHeader eyebrow="Case Study" title="Product Feedback Loop" lede="What customers teach us. Record it, look for patterns, and send evidence-backed patterns to product review." />

      <div className={css.chipRow}>
        {FEEDBACK_RULE.map((rule) => (
          <Badge key={rule.count} tone="cyan">
            {rule.count} → {rule.action}
          </Badge>
        ))}
      </div>
      <Notice tone="warn">Do not let sales promise features. Describe what you heard without customer names or confidential details.</Notice>

      <Panel title="Record feedback" kicker="New" tone="accent">
        <div className={css.formGrid}>
          <SelectField label="Category" value={category} onChange={setCategory} options={FEEDBACK_CATEGORIES.map((name) => ({ value: name, label: name }))} />
          <NumberField label="Independent accounts that raised it" min={1} max={99} value={accounts} onChange={setAccounts} />
          <TextArea label="What was said or observed" value={text} onChange={setText} />
        </div>
        <button type="button" className={css.primaryButton} aria-disabled={!text.trim()} onClick={add}>
          Record
        </button>
      </Panel>

      {byCategory.length === 0 ? <p className={css.empty}>No feedback recorded yet.</p> : null}
      {byCategory.map((group) => {
        const stage = feedbackStage(group.accounts);
        return (
          <Panel key={group.name} title={group.name} kicker={`${group.accounts} account mentions`} actions={<Badge tone={stage.action === "Product review" ? "green" : stage.action === "Investigate" ? "amber" : "neutral"}>{stage.action}</Badge>}>
            <ul className={css.feedbackList}>
              {group.items.map((item) => (
                <li key={item.id}>
                  <p>{item.text}</p>
                  <p className={css.blockNote}>
                    {item.accounts} {item.accounts === 1 ? "account" : "accounts"} · {formatDate(item.date)}{" "}
                    <button type="button" className={css.linkButton} onClick={() => removeFeedback(item.id)}>
                      Delete
                    </button>
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}
