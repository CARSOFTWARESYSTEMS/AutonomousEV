"use client";
// The pipeline: stages from Research to Won / Lost, the Opportunity Score with
// its reasons, the seven-point qualification that decides what counts as
// pipeline, the Stop / Continue check, and lost-opportunity learning.
import { useState } from "react";
import { trackRevenue } from "../analytics";
import { LOSS_REASONS, STOP_REASONS } from "../data/library";
import { OPPORTUNITY_CRITERIA, QUALIFICATION, STAGES, STAGE_LABEL, isQualifiedStage } from "../data/scoring";
import { SYNTHETIC_ACCOUNTS, SYNTHETIC_OPPORTUNITIES } from "../data/synthetic";
import { formatDate, formatINR } from "../logic/format";
import { isFullyQualified, missingQualification, opportunityScore } from "../logic/scoring";
import type { Opportunity } from "../state/model";
import { useRevenue } from "../state/store";
import type { PipelineStage, Rating } from "../types";
import { Badge, SyntheticBadge } from "../ui/badges";
import { CheckItem, Meter, Notice, NumberField, Panel, RatingField, SelectField, TextArea, TextField, newId } from "../ui/controls";
import css from "../app.module.css";

const blank = (accountId: string): Opportunity => ({
  id: newId("opp"),
  accountId,
  name: "",
  stage: "research",
  value: 0,
  nextAction: "",
  nextDate: "",
  ratings: Object.fromEntries(OPPORTUNITY_CRITERIA.map((criterion) => [criterion.id, 0 as Rating])),
  qualified: {},
  stop: [],
});

const BAND_TONE = { high: "green", develop: "cyan", nurture: "amber", hold: "neutral" } as const;

function OpportunityEditor({ opportunity, onChange, readOnly }: { opportunity: Opportunity; onChange: (next: Opportunity) => void; readOnly?: boolean }) {
  const score = opportunityScore(opportunity.ratings);
  const missing = missingQualification(opportunity.qualified);
  const set = (change: Partial<Opportunity>) => onChange({ ...opportunity, ...change });

  return (
    <div className={css.oppEditor}>
      <h4 className={css.subTitle}>Opportunity score</h4>
      <div className={css.ratingGrid}>
        {OPPORTUNITY_CRITERIA.map((criterion) => (
          <RatingField
            key={criterion.id}
            label={criterion.label}
            weight={criterion.weight}
            readOnly={readOnly}
            value={(opportunity.ratings[criterion.id] ?? 0) as Rating}
            onChange={(value) => set({ ratings: { ...opportunity.ratings, [criterion.id]: value } })}
          />
        ))}
      </div>
      <div className={css.scoreSummary} role="status">
        <Meter value={score.score} label="Opportunity score" />
        <p className={css.scoreLine}>
          {score.score} / 100 · {score.band.label}
        </p>
        <p className={css.blockNote}>
          {score.band.action}
          {score.strongest.length ? ` Strongest: ${score.strongest.join(", ")}.` : ""}
          {score.weakest.length ? ` Weakest: ${score.weakest.join(", ")}.` : ""}
        </p>
      </div>

      <h4 className={css.subTitle}>Qualification — counts as pipeline only when all six hold</h4>
      <ul className={css.checkList}>
        {QUALIFICATION.map((criterion) => (
          <CheckItem key={criterion.id} disabled={readOnly} checked={Boolean(opportunity.qualified[criterion.id])} onChange={(checked) => set({ qualified: { ...opportunity.qualified, [criterion.id]: checked } })}>
            {criterion.label}
          </CheckItem>
        ))}
      </ul>
      {isQualifiedStage(opportunity.stage) && missing.length ? (
        <p className={css.warnText}>
          At the {STAGE_LABEL[opportunity.stage]} stage but not counted in qualified pipeline. Missing: {missing.join(", ")}.
        </p>
      ) : null}

      <h4 className={css.subTitle}>Should we continue?</h4>
      <ul className={css.checkGrid}>
        {STOP_REASONS.map((reason) => (
          <CheckItem
            key={reason}
            disabled={readOnly}
            checked={opportunity.stop.includes(reason)}
            onChange={(checked) => set({ stop: checked ? [...opportunity.stop, reason] : opportunity.stop.filter((r) => r !== reason) })}
          >
            {reason}
          </CheckItem>
        ))}
      </ul>
      {opportunity.stop.length ? (
        <Notice tone="warn">
          <strong>Pause or stop.</strong> {opportunity.stop.join(", ")}. A disciplined process knows when not to sell: record the learning and step back.
        </Notice>
      ) : (
        <p className={css.blockNote}>No stop reason recorded — continue, if the next action is agreed.</p>
      )}

      {opportunity.stage === "lost" ? (
        <>
          <h4 className={css.subTitle}>Lost opportunity analysis</h4>
          <p className={css.blockNote}>Lost is not failure if the learning is captured.</p>
          <div className={css.formGrid}>
            <SelectField
              label="Loss reason"
              value={opportunity.lossReason ?? ""}
              onChange={(lossReason) => set({ lossReason })}
              options={[{ value: "", label: "Choose a reason" }, ...LOSS_REASONS.map((reason) => ({ value: reason, label: reason }))]}
            />
            <TextArea label="What did we learn?" required value={opportunity.lossLearning ?? ""} onChange={(lossLearning) => set({ lossLearning })} />
            <TextArea label="What should change?" required value={opportunity.lossChange ?? ""} onChange={(lossChange) => set({ lossChange })} />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function Opportunities() {
  const opportunities = useRevenue((state) => state.opportunities);
  const accounts = useRevenue((state) => state.accounts);
  const showSynthetic = useRevenue((state) => state.showSynthetic);
  const saveOpportunity = useRevenue((state) => state.saveOpportunity);
  const removeOpportunity = useRevenue((state) => state.removeOpportunity);
  const [draft, setDraft] = useState<Opportunity | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [moved, setMoved] = useState<string | null>(null);

  const allAccounts = [...accounts, ...SYNTHETIC_ACCOUNTS];
  const accountName = (id: string) => allAccounts.find((account) => account.id === id)?.name ?? "Unlinked account";
  const list = [...opportunities, ...(showSynthetic ? SYNTHETIC_OPPORTUNITIES : [])];

  const lossIncomplete = (opportunity: Opportunity) => opportunity.stage === "lost" && !(opportunity.lossReason && opportunity.lossLearning?.trim() && opportunity.lossChange?.trim());

  const changeStage = (opportunity: Opportunity, stage: PipelineStage) => {
    saveOpportunity({ ...opportunity, stage });
    setMoved(opportunity.id);
    trackRevenue("pipeline_stage_change", { stage });
    if (stage === "proposal") trackRevenue("proposal_stage_entered");
    if (stage === "won") trackRevenue("opportunity_won");
    if (stage === "lost") {
      trackRevenue("opportunity_lost");
      setOpen(opportunity.id);
    }
  };

  const saveDraft = () => {
    if (!draft?.name.trim()) return;
    saveOpportunity(draft);
    setDraft(null);
  };

  return (
    <div>
      <div className={css.buttonRow}>
        <button type="button" className={css.primaryButton} onClick={() => setDraft(blank(accounts[0]?.id ?? ""))}>
          Add opportunity
        </button>
      </div>

      <ol className={css.stageStrip} aria-label="Opportunities by stage">
        {STAGES.map((stage) => {
          const count = list.filter((opportunity) => opportunity.stage === stage.id).length;
          return (
            <li key={stage.id} data-filled={count ? "" : undefined}>
              <span>{stage.label}</span>
              <span className={css.tabular}>{count}</span>
            </li>
          );
        })}
      </ol>

      {draft ? (
        <Panel title="New opportunity" kicker="Pipeline" tone="accent">
          <div className={css.formGrid}>
            <TextField label="Opportunity name" required value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
            <SelectField
              label="Account"
              value={draft.accountId}
              onChange={(accountId) => setDraft({ ...draft, accountId })}
              options={[{ value: "", label: accounts.length ? "Choose an account" : "Add accounts first, or leave unlinked" }, ...accounts.map((account) => ({ value: account.id, label: account.name }))]}
            />
            <NumberField label="Estimated annual value" prefix="₹" value={draft.value} step={1000} onChange={(value) => setDraft({ ...draft, value })} hint={draft.value ? formatINR(draft.value) : "An estimate for planning, not a quote."} />
            <SelectField label="Stage" value={draft.stage} onChange={(stage) => setDraft({ ...draft, stage })} options={STAGES.filter((stage) => stage.id !== "won" && stage.id !== "lost").map((stage) => ({ value: stage.id, label: stage.label }))} />
            <TextField label="Next action" value={draft.nextAction} onChange={(nextAction) => setDraft({ ...draft, nextAction })} />
            <TextField label="Next action date" type="date" value={draft.nextDate} onChange={(nextDate) => setDraft({ ...draft, nextDate })} />
          </div>
          {!draft.name.trim() ? <p className={css.warnText}>Name the opportunity to save it.</p> : null}
          <div className={css.buttonRow}>
            <button type="button" className={css.primaryButton} aria-disabled={!draft.name.trim()} onClick={saveDraft}>
              Save opportunity
            </button>
            <button type="button" className={css.ghostButton} onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </Panel>
      ) : null}

      {list.length === 0 ? <p className={css.empty}>No opportunities yet. They begin after discovery (Week 6 onward).</p> : null}

      <ul className={css.oppList}>
        {list.map((opportunity) => {
          const score = opportunityScore(opportunity.ratings);
          const isQualified = isQualifiedStage(opportunity.stage) && isFullyQualified(opportunity.qualified);
          const qualifiedCount = QUALIFICATION.filter((criterion) => opportunity.qualified[criterion.id]).length;
          const expanded = open === opportunity.id;
          return (
            <li key={opportunity.id} className={css.oppCard} data-moved={moved === opportunity.id ? "" : undefined} data-stage={opportunity.stage}>
              <div className={css.miniHead}>
                <div>
                  <h3 className={css.miniTitle}>{opportunity.name}</h3>
                  <p className={css.blockNote}>{accountName(opportunity.accountId)}</p>
                </div>
                <p className={css.oppValue}>{formatINR(opportunity.value)}</p>
              </div>
              <div className={css.chipRow}>
                {opportunity.synthetic ? <SyntheticBadge /> : null}
                <Badge tone={BAND_TONE[score.band.id as keyof typeof BAND_TONE]}>
                  {score.score} · {score.band.label}
                </Badge>
                <Badge tone={isQualified ? "green" : "neutral"}>{isQualified ? "Qualified pipeline" : `Qualification ${qualifiedCount}/6`}</Badge>
                {opportunity.stop.length ? <Badge tone="amber">Stop / Continue flagged</Badge> : null}
                {lossIncomplete(opportunity) ? <Badge tone="red">Learning required</Badge> : null}
              </div>
              <div className={css.oppRow}>
                <SelectField
                  label="Stage"
                  value={opportunity.stage}
                  onChange={(stage) => (opportunity.synthetic ? undefined : changeStage(opportunity, stage))}
                  options={STAGES.map((stage) => ({ value: stage.id, label: stage.label, disabled: opportunity.synthetic && stage.id !== opportunity.stage }))}
                />
                <p className={css.blockNote}>
                  {opportunity.nextAction ? (
                    <>
                      <strong>Next:</strong> {opportunity.nextAction}
                      {opportunity.nextDate ? ` · ${formatDate(opportunity.nextDate)}` : ""}
                    </>
                  ) : opportunity.stage === "won" || opportunity.stage === "lost" ? (
                    "Closed."
                  ) : (
                    <span className={css.warnText}>No next action — not real pipeline until one is agreed.</span>
                  )}
                </p>
              </div>
              <div className={css.buttonRow}>
                <button type="button" className={css.ghostButton} aria-expanded={expanded} onClick={() => setOpen(expanded ? null : opportunity.id)}>
                  {expanded ? "Hide details" : opportunity.synthetic ? "View score and qualification" : "Score, qualify and review"}
                </button>
                {!opportunity.synthetic ? (
                  <button type="button" className={css.ghostButton} onClick={() => removeOpportunity(opportunity.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
              {expanded ? <OpportunityEditor opportunity={opportunity} readOnly={opportunity.synthetic} onChange={(next) => saveOpportunity(next)} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
