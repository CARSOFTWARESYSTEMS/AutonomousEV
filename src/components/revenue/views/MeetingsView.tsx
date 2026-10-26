"use client";
// The Customer Meeting Workspace: prepare before, record after, and end with
// "What changed my mind?". Notes stay in this browser.
import { useState } from "react";
import { trackRevenue } from "../analytics";
import { DONTS, QUESTIONS } from "../data/library";
import { formatDate } from "../logic/format";
import type { Meeting } from "../state/model";
import { useRevenue } from "../state/store";
import type { Rating } from "../types";
import { List, Notice, Panel, RatingField, TextArea, TextField, ViewHeader, newId, today } from "../ui/controls";
import { ViewLink } from "../workspace/nav";
import css from "../workspace.module.css";

const blank = (): Meeting => ({
  id: newId("mtg"),
  account: "",
  date: today(),
  participants: "",
  objective: "",
  known: "",
  unknown: "",
  hypotheses: "",
  desiredNext: "",
  caution: "Do not request drawings, controlled or defence-sensitive information. Use a fictitious drawing for any demonstration.",
  said: "",
  evidence: "",
  painScore: 0,
  objections: "",
  buyerChanges: "",
  productFeedback: "",
  nextAction: "",
  nextDate: "",
  changedMind: "",
});

export default function MeetingsView() {
  const meetings = useRevenue((state) => state.meetings);
  const questionSet = useRevenue((state) => state.questionSet);
  const saveMeeting = useRevenue((state) => state.saveMeeting);
  const removeMeeting = useRevenue((state) => state.removeMeeting);
  const [draft, setDraft] = useState<Meeting | null>(null);

  const patch = (change: Partial<Meeting>) => setDraft((current) => (current ? { ...current, ...change } : current));
  const questions = questionSet.map((id) => QUESTIONS.find((question) => question.id === id)?.text).filter((text): text is string => Boolean(text));
  const isAfter = Boolean(draft && (draft.said.trim() || draft.nextAction.trim()));

  const save = () => {
    if (!draft || !draft.account.trim()) return;
    const existing = meetings.find((meeting) => meeting.id === draft.id);
    if (!existing) trackRevenue("meeting_prepare");
    if (isAfter && !(existing && (existing.said.trim() || existing.nextAction.trim()))) trackRevenue("meeting_complete");
    saveMeeting(draft);
    setDraft(null);
  };

  return (
    <div>
      <ViewHeader eyebrow="Sell" title="Customer Meeting Workspace" lede="Prepare before every meeting; record what the customer said — separately from what you inferred — straight after.">
        <button type="button" className={css.primaryButton} onClick={() => setDraft(blank())}>
          Prepare a meeting
        </button>
      </ViewHeader>

      <Notice tone="info">Saved in this browser only. Use an account code or role names if the meeting is confidential. Never share one customer&apos;s details with another.</Notice>

      {draft ? (
        <Panel title={draft.account || "New meeting"} kicker="Meeting" tone="accent">
          <h4 className={css.subTitle}>Before the meeting</h4>
          <div className={css.formGrid}>
            <TextField label="Account" required value={draft.account} onChange={(account) => patch({ account })} />
            <TextField label="Date" type="date" value={draft.date} onChange={(date) => patch({ date })} />
            <TextField label="Participants (roles)" value={draft.participants} onChange={(participants) => patch({ participants })} />
            <TextArea label="Objective" value={draft.objective} onChange={(objective) => patch({ objective })} />
            <TextArea label="What we know (sourced)" value={draft.known} onChange={(known) => patch({ known })} />
            <TextArea label="What we do not know" value={draft.unknown} onChange={(unknown) => patch({ unknown })} />
            <TextArea label="Pain hypotheses to test" value={draft.hypotheses} onChange={(hypotheses) => patch({ hypotheses })} />
            <TextArea label="Desired next step" value={draft.desiredNext} onChange={(desiredNext) => patch({ desiredNext })} />
            <TextArea label="Security / confidentiality caution" value={draft.caution} onChange={(caution) => patch({ caution })} />
          </div>
          <div className={css.twoCol}>
            <div className={css.block}>
              <h5 className={css.blockTitle}>Questions</h5>
              {questions.length ? <List items={questions} ordered /> : <p className={css.blockNote}>No question set yet.</p>}
              <ViewLink view="questions" className={css.inlineLink}>
                Build the question set →
              </ViewLink>
            </div>
            <div className={css.block} data-tone="warn">
              <h5 className={css.blockTitle}>Don&apos;t say</h5>
              <List items={DONTS.slice(0, 7)} />
            </div>
          </div>

          <h4 className={css.subTitle}>After the meeting</h4>
          <div className={css.formGrid}>
            <TextArea label="What the customer said (their words)" value={draft.said} onChange={(said) => patch({ said })} />
            <TextArea label="Evidence captured" value={draft.evidence} onChange={(evidence) => patch({ evidence })} />
            <RatingField label="Pain score" value={draft.painScore} onChange={(painScore: Rating) => patch({ painScore })} />
            <TextArea label="Objections" value={draft.objections} onChange={(objections) => patch({ objections })} />
            <TextArea label="Buyer map changes" value={draft.buyerChanges} onChange={(buyerChanges) => patch({ buyerChanges })} />
            <TextArea label="Product feedback" value={draft.productFeedback} onChange={(productFeedback) => patch({ productFeedback })} hint="Record it; never promise a feature." />
            <TextField label="Next action" value={draft.nextAction} onChange={(nextAction) => patch({ nextAction })} />
            <TextField label="Next action date" type="date" value={draft.nextDate} onChange={(nextDate) => patch({ nextDate })} />
            <TextArea label="What changed my mind?" value={draft.changedMind} onChange={(changedMind) => patch({ changedMind })} />
          </div>
          <p className={css.blockNote}>
            Score the opportunity in the <ViewLink view="pipeline">Pipeline</ViewLink> and log product insights in <ViewLink view="feedback">Product Feedback</ViewLink>.
          </p>
          {!draft.account.trim() ? <p className={css.warnText}>Name the account (or its code) to save.</p> : null}
          <div className={css.buttonRow}>
            <button type="button" className={css.primaryButton} aria-disabled={!draft.account.trim()} onClick={save}>
              Save meeting
            </button>
            <button type="button" className={css.ghostButton} onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </Panel>
      ) : null}

      {meetings.length === 0 && !draft ? <p className={css.empty}>No meetings yet. Discovery starts after Gate C (Day 10).</p> : null}
      <ul className={css.cardList}>
        {meetings.map((meeting) => (
          <li key={meeting.id} className={css.miniCard}>
            <div className={css.miniHead}>
              <h3 className={css.miniTitle}>{meeting.account}</h3>
              <span className={css.blockNote}>{formatDate(meeting.date)}</span>
            </div>
            <p>{meeting.objective || "No objective recorded."}</p>
            <p className={css.blockNote}>{meeting.said.trim() ? `Next: ${meeting.nextAction || "—"}${meeting.nextDate ? ` by ${formatDate(meeting.nextDate)}` : ""}` : "Prepared — not yet recorded"}</p>
            <div className={css.buttonRow}>
              <button type="button" className={css.ghostButton} onClick={() => setDraft(meeting)}>
                Open
              </button>
              <button type="button" className={css.ghostButton} onClick={() => removeMeeting(meeting.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
