"use client";
// Accounts: who to work on, and why. Each account shows its fit, the reason
// it is on the list, what is known about its pain, the buyer, its status and
// the next action. A detailed fit score is there when wanted; this is not a
// CRM. Meeting preparation, with the question bank, sits below.
import { useState } from "react";
import { trackRevenue } from "../analytics";
import { MARKET_CATEGORIES } from "../data/market";
import { ACCOUNT_CRITERIA } from "../data/scoring";
import { SYNTHETIC_ACCOUNTS } from "../data/synthetic";
import { formatDate } from "../logic/format";
import { accountFit, totalWeight, withWeights } from "../logic/scoring";
import { ACCOUNT_STATUSES, type Account, type AccountStatus } from "../state/model";
import { useRevenue } from "../state/store";
import type { Rating } from "../types";
import AppShell from "../app/AppShell";
import { Badge, SyntheticBadge } from "../ui/badges";
import { Meter, Notice, NumberField, RatingField, SelectField, TextField, newId, today } from "../ui/controls";
import css from "../app.module.css";
import MeetingPrep from "./MeetingPrep";
import QuestionPicker from "./QuestionPicker";

const FIT = { A: "High", B: "Medium", C: "Low" } as const;
const FIT_TONE = { A: "green", B: "cyan", C: "neutral" } as const;

const blank = (): Account => ({
  id: newId("acct"),
  name: "",
  why: "",
  pain: "Unknown",
  buyer: "",
  status: "Researching",
  next: "",
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
  tier: "B",
});

export default function AccountsPage() {
  const accounts = useRevenue((state) => state.accounts);
  const weights = useRevenue((state) => state.weights);
  const showSynthetic = useRevenue((state) => state.showSynthetic);
  const saveAccount = useRevenue((state) => state.saveAccount);
  const removeAccount = useRevenue((state) => state.removeAccount);
  const setWeight = useRevenue((state) => state.setWeight);
  const resetWeights = useRevenue((state) => state.resetWeights);
  const setShowSynthetic = useRevenue((state) => state.setShowSynthetic);
  const [draft, setDraft] = useState<Account | null>(null);
  const [meetingFor, setMeetingFor] = useState<string | undefined>(undefined);

  const criteria = withWeights(ACCOUNT_CRITERIA, weights);
  const list = [...accounts, ...(showSynthetic ? SYNTHETIC_ACCOUNTS : [])];
  const patch = (change: Partial<Account>) => setDraft((current) => (current ? { ...current, ...change } : current));
  const isNew = draft ? !accounts.some((account) => account.id === draft.id) : false;
  const canSave = Boolean(draft?.name.trim() && draft?.why.trim() && draft?.source.trim());
  const draftFit = draft ? accountFit(draft.ratings, draft.evidence, weights) : null;

  const save = () => {
    if (!draft || !canSave) return;
    saveAccount(draft);
    if (isNew) trackRevenue("account_created");
    trackRevenue("account_scored", { tier: draft.tier.toLowerCase() });
    setDraft(null);
  };

  const prepare = (name: string) => {
    setMeetingFor(name);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("meetings")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <AppShell active="accounts">
      <div className={css.page}>
        <header className={css.pageHead}>
          <p className={css.eyebrow}>Accounts</p>
          <h1 className={css.pageTitle}>Know who to work on</h1>
          <p className={css.pageLede}>A short, sourced list. Public information only. Fit is a prioritisation aid, not objective truth.</p>
          <div className={css.buttonRow}>
            <button type="button" className={css.primaryButton} onClick={() => setDraft(blank())}>
              Add account
            </button>
            <label className={css.switchLabel}>
              <input type="checkbox" checked={showSynthetic} autoComplete="off" onChange={(event) => setShowSynthetic(event.target.checked)} />
              Show synthetic examples
            </label>
          </div>
        </header>

        <Notice tone="info">Saved in this browser only. Never fabricate employee numbers, revenue, certifications or customers, and never record confidential or controlled information.</Notice>

        {draft ? (
          <section className={css.formPanel} aria-label={isNew ? "New account" : `Edit ${draft.name}`}>
            <div className={css.formGrid}>
              <TextField label="Company" required value={draft.name} onChange={(name) => patch({ name })} />
              <TextField label="Why this account" required value={draft.why} onChange={(why) => patch({ why })} hint="The sourced reason, e.g. precision manufacturing + drawing-driven inspection." />
              <SelectField
                label="Fit"
                value={draft.tier}
                onChange={(tier) => patch({ tier })}
                options={[
                  { value: "A", label: "High (Tier A)" },
                  { value: "B", label: "Medium (Tier B)" },
                  { value: "C", label: "Low (Tier C)" },
                ]}
              />
              <TextField label="Pain (what is known)" value={draft.pain} onChange={(pain) => patch({ pain })} hint="Leave as Unknown until a conversation says otherwise." />
              <TextField label="Buyer to reach first" value={draft.buyer} onChange={(buyer) => patch({ buyer })} placeholder="Quality Manager" />
              <SelectField label="Status" value={draft.status} onChange={(status: AccountStatus) => patch({ status })} options={ACCOUNT_STATUSES.map((status) => ({ value: status, label: status }))} />
              <TextField label="Next action" value={draft.next} onChange={(next) => patch({ next })} placeholder="Research current FAI workflow" />
              <TextField label="Evidence source" required value={draft.source} onChange={(source) => patch({ source })} hint="Where the facts came from: a public page, a directory, an event listing." />
              <NumberField label="Evidence items" value={draft.evidence} max={99} onChange={(evidence) => patch({ evidence: Math.round(evidence) })} />
              <SelectField label="Category" value={draft.category} onChange={(category) => patch({ category })} options={MARKET_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))} />
            </div>
            <details className={css.disclosure}>
              <summary>Score fit in detail</summary>
              <div className={css.ratingGrid}>
                {criteria.map((criterion) => (
                  <RatingField key={criterion.id} label={criterion.label} weight={criterion.weight} value={(draft.ratings[criterion.id] ?? 0) as Rating} onChange={(value) => patch({ ratings: { ...draft.ratings, [criterion.id]: value } })} />
                ))}
              </div>
              {draftFit ? (
                <div className={css.scoreSummary} role="status">
                  <Meter value={draftFit.score} label="Account fit score" />
                  <p className={css.scoreLine}>{draftFit.summary}</p>
                  <p className={css.blockNote}>Suggests {FIT[draftFit.suggestedTier]} fit. You decide.</p>
                </div>
              ) : null}
              <details className={css.disclosure}>
                <summary>Weights (total {totalWeight(criteria)})</summary>
                <div className={css.formGrid}>
                  {criteria.map((criterion) => (
                    <NumberField key={criterion.id} label={criterion.label} value={criterion.weight} max={100} onChange={(value) => setWeight(criterion.id, value)} />
                  ))}
                </div>
                <button type="button" className={css.ghostButton} onClick={resetWeights}>
                  Reset to suggested weights
                </button>
              </details>
            </details>
            {!canSave ? <p className={css.warnText}>Company, why this account and an evidence source are required.</p> : null}
            <div className={css.buttonRow}>
              <button type="button" className={css.primaryButton} aria-disabled={!canSave} onClick={save}>
                Save account
              </button>
              <button type="button" className={css.ghostButton} onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
          </section>
        ) : null}

        {list.length === 0 ? <p className={css.empty}>No accounts yet. Accounts start on Day 9, from your market map.</p> : null}
        <ul className={css.accountList}>
          {list.map((account) => {
            const fit = accountFit(account.ratings, account.evidence, weights);
            return (
              <li key={account.id} className={css.accountCard}>
                <div className={css.miniHead}>
                  <h2 className={css.accountName}>{account.name}</h2>
                  <Badge tone={FIT_TONE[account.tier]}>Fit: {FIT[account.tier]}</Badge>
                </div>
                {account.synthetic ? <SyntheticBadge /> : null}
                <dl className={css.accountFacts}>
                  <div>
                    <dt>Why</dt>
                    <dd>{account.why || "—"}</dd>
                  </div>
                  <div>
                    <dt>Pain</dt>
                    <dd>{account.pain || "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Buyer</dt>
                    <dd>{account.buyer || "—"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{account.status}</dd>
                  </div>
                  <div>
                    <dt>Next</dt>
                    <dd>{account.next || "—"}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>
                      {account.evidence} {account.evidence === 1 ? "item" : "items"} · {fit.confidence} confidence · {account.source || "no source"}
                    </dd>
                  </div>
                </dl>
                <p className={css.blockNote}>Researched {formatDate(account.researched)}</p>
                <div className={css.buttonRow}>
                  <button type="button" className={css.ghostButton} aria-label={`Prepare meeting with ${account.name}`} onClick={() => prepare(account.name)}>
                    Prepare meeting
                  </button>
                  {!account.synthetic ? (
                    <>
                      <button type="button" className={css.ghostButton} aria-label={`Edit ${account.name}`} onClick={() => setDraft(account)}>
                        Edit
                      </button>
                      <button type="button" className={css.ghostButton} aria-label={`Delete ${account.name}`} onClick={() => removeAccount(account.id)}>
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <section id="meetings" className={css.pageSection} aria-labelledby="rv-meetings-title">
          <h2 id="rv-meetings-title" className={css.sectionTitle}>
            Meeting prep
          </h2>
          <p className={css.pageLede}>Prepare before every meeting; record what the customer said — apart from what you inferred — straight after.</p>
          <details className={css.disclosure} open>
            <summary>Questions for this meeting</summary>
            <QuestionPicker />
          </details>
          <MeetingPrep key={meetingFor ?? "none"} account={meetingFor} />
        </section>
      </div>
    </AppShell>
  );
}
