"use client";
// Account research and the configurable 100-point Account Fit Score, always
// shown as score + confidence + evidence count. Records are kept in this
// browser; synthetic accounts are read-only and labelled.
import { useState } from "react";
import { trackRevenue } from "../analytics";
import { ACCOUNT_FIELDS, MARKET_CATEGORIES } from "../data/market";
import { ACCOUNT_CRITERIA } from "../data/scoring";
import { SYNTHETIC_ACCOUNTS } from "../data/synthetic";
import { formatDate } from "../logic/format";
import { accountFit, totalWeight, withWeights } from "../logic/scoring";
import type { Account } from "../state/model";
import { useRevenue } from "../state/store";
import type { Rating } from "../types";
import { Badge, SyntheticBadge } from "../ui/badges";
import { Meter, Notice, NumberField, Panel, RatingField, SelectField, TextArea, TextField, ViewHeader, newId, today } from "../ui/controls";
import css from "../workspace.module.css";

const blank = (): Account => ({
  id: newId("acct"),
  name: "",
  location: "Bengaluru",
  website: "",
  category: "machining",
  capabilities: "",
  relevance: "",
  certifications: "",
  customers: "",
  source: "",
  researched: today(),
  buyerRoles: 0,
  ratings: Object.fromEntries(ACCOUNT_CRITERIA.map((criterion) => [criterion.id, 0 as Rating])),
  evidence: 0,
  tier: "C",
});

const categoryName = (id: string) => MARKET_CATEGORIES.find((category) => category.id === id)?.name ?? id;

export default function AccountsView() {
  const accounts = useRevenue((state) => state.accounts);
  const weights = useRevenue((state) => state.weights);
  const showSynthetic = useRevenue((state) => state.showSynthetic);
  const saveAccount = useRevenue((state) => state.saveAccount);
  const removeAccount = useRevenue((state) => state.removeAccount);
  const setWeight = useRevenue((state) => state.setWeight);
  const resetWeights = useRevenue((state) => state.resetWeights);
  const setShowSynthetic = useRevenue((state) => state.setShowSynthetic);
  const [draft, setDraft] = useState<Account | null>(null);

  const criteria = withWeights(ACCOUNT_CRITERIA, weights);
  const weightSum = totalWeight(criteria);
  const list = [...accounts, ...(showSynthetic ? SYNTHETIC_ACCOUNTS : [])].map((account) => ({ account, fit: accountFit(account.ratings, account.evidence, weights) })).sort((a, b) => b.fit.score - a.fit.score);

  const patch = (change: Partial<Account>) => setDraft((current) => (current ? { ...current, ...change } : current));
  const draftFit = draft ? accountFit(draft.ratings, draft.evidence, weights) : null;
  const isNew = draft ? !accounts.some((account) => account.id === draft.id) : false;
  const canSave = Boolean(draft?.name.trim() && draft?.source.trim());

  const save = () => {
    if (!draft || !canSave) return;
    saveAccount(draft);
    if (isNew) trackRevenue("account_created");
    trackRevenue("account_scored", { tier: draft.tier.toLowerCase() });
    setDraft(null);
  };

  return (
    <div>
      <ViewHeader eyebrow="Market" title="Accounts" lede="Research real Bengaluru accounts from public data. The fit score is a prioritisation aid, not objective truth.">
        <div className={css.buttonRow}>
          <button type="button" className={css.primaryButton} onClick={() => setDraft(blank())}>
            Add account
          </button>
          <label className={css.switchLabel}>
            <input type="checkbox" checked={showSynthetic} autoComplete="off" onChange={(event) => setShowSynthetic(event.target.checked)} />
            Show synthetic examples
          </label>
        </div>
      </ViewHeader>

      <Notice tone="info">Saved in this browser only. Record public, sourced facts; never fabricate employee numbers, revenue, certifications or customers; never record confidential or controlled information.</Notice>

      {draft && draftFit ? (
        <Panel title={isNew ? "New account" : `Edit ${draft.name || "account"}`} kicker="Account research" tone="accent">
          <div className={css.formGrid}>
            <TextField label="Company name" required value={draft.name} onChange={(name) => patch({ name })} />
            <TextField label="Location" value={draft.location} onChange={(location) => patch({ location })} />
            <TextField label="Website" type="url" value={draft.website} onChange={(website) => patch({ website })} />
            <SelectField label="Manufacturing type / category" value={draft.category} onChange={(category) => patch({ category })} options={MARKET_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))} />
            <TextArea label="Publicly stated capabilities" value={draft.capabilities} onChange={(capabilities) => patch({ capabilities })} />
            <TextArea label="Aerospace / defence relevance and likely quality-workflow relevance" value={draft.relevance} onChange={(relevance) => patch({ relevance })} />
            <TextField label="Public certifications (only if verified)" value={draft.certifications} onChange={(certifications) => patch({ certifications })} />
            <TextField label="Public customer / sector information (only if verified)" value={draft.customers} onChange={(customers) => patch({ customers })} />
            <TextField label="Evidence source" required value={draft.source} onChange={(source) => patch({ source })} hint="Where each fact came from: a public page, a directory, an event listing." />
            <TextField label="Last researched" type="date" value={draft.researched} onChange={(researched) => patch({ researched })} />
            <NumberField label="Likely buyer roles identified" value={draft.buyerRoles} max={10} onChange={(buyerRoles) => patch({ buyerRoles: Math.round(buyerRoles) })} />
            <NumberField label="Evidence items behind the ratings" value={draft.evidence} max={99} onChange={(evidence) => patch({ evidence: Math.round(evidence) })} />
          </div>

          <h4 className={css.subTitle}>Fit ratings (0 = none, 5 = very strong)</h4>
          <div className={css.ratingGrid}>
            {criteria.map((criterion) => (
              <RatingField key={criterion.id} label={criterion.label} weight={criterion.weight} value={(draft.ratings[criterion.id] ?? 0) as Rating} onChange={(value) => patch({ ratings: { ...draft.ratings, [criterion.id]: value } })} />
            ))}
          </div>

          <div className={css.scoreSummary} role="status">
            <Meter value={draftFit.score} label="Account fit score" />
            <p className={css.scoreLine}>{draftFit.summary}</p>
            <p className={css.blockNote}>Suggested tier from the score: Tier {draftFit.suggestedTier}. You decide the tier.</p>
          </div>
          <SelectField
            label="Tier"
            value={draft.tier}
            onChange={(tier) => patch({ tier })}
            options={[
              { value: "A", label: "Tier A — High Fit" },
              { value: "B", label: "Tier B — Medium Fit" },
              { value: "C", label: "Tier C — Research / Nurture" },
            ]}
          />
          {!canSave ? <p className={css.warnText}>A company name and an evidence source are required.</p> : null}
          <div className={css.buttonRow}>
            <button type="button" className={css.primaryButton} aria-disabled={!canSave} onClick={save}>
              Save account
            </button>
            <button type="button" className={css.ghostButton} onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </Panel>
      ) : null}

      {list.length === 0 ? (
        <p className={css.empty}>No accounts yet. Add your first from the Market Map research (Day 9).</p>
      ) : (
        <ul className={css.accountList}>
          {list.map(({ account, fit }) => (
            <li key={account.id} className={css.accountCard}>
              <div className={css.miniHead}>
                <h3 className={css.miniTitle}>{account.name}</h3>
                <Badge tone={account.tier === "A" ? "green" : account.tier === "B" ? "cyan" : "neutral"}>Tier {account.tier}</Badge>
              </div>
              {account.synthetic ? <SyntheticBadge /> : null}
              <p className={css.blockNote}>
                {categoryName(account.category)} · {account.location} · researched {formatDate(account.researched)}
              </p>
              <Meter value={fit.score} label={`${account.name} fit score`} />
              <p className={css.scoreLine}>{fit.summary}</p>
              {account.capabilities ? <p>{account.capabilities}</p> : null}
              <p className={css.blockNote}>Source: {account.source || "—"}</p>
              {!account.synthetic ? (
                <div className={css.buttonRow}>
                  <button type="button" className={css.ghostButton} onClick={() => setDraft(account)}>
                    Edit
                  </button>
                  <button type="button" className={css.ghostButton} onClick={() => removeAccount(account.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <details className={css.disclosure}>
        <summary>Configure fit-score weights</summary>
        <p className={css.blockNote}>
          Weights total {weightSum}. {weightSum === 100 ? "" : "Scores are scaled so they stay out of 100."}
        </p>
        <div className={css.formGrid}>
          {criteria.map((criterion) => (
            <NumberField key={criterion.id} label={criterion.label} value={criterion.weight} max={100} onChange={(value) => setWeight(criterion.id, value)} />
          ))}
        </div>
        <button type="button" className={css.ghostButton} onClick={resetWeights}>
          Reset to suggested weights
        </button>
      </details>

      <details className={css.disclosure}>
        <summary>Research fields to complete for every account</summary>
        <ul className={css.list}>
          {ACCOUNT_FIELDS.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
