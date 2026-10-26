"use client";
// Paste a draft message; restricted claims are flagged, with what to say instead.
// The draft is checked in the browser and never saved or sent.
import { useId, useState } from "react";
import { checkClaims } from "../logic/claims";
import { Notice } from "../ui/controls";
import css from "../app.module.css";

export default function ClaimChecker() {
  const draftId = useId();
  const [draft, setDraft] = useState("");
  const findings = checkClaims(draft);

  return (
    <div className={css.checker}>
      <label htmlFor={draftId} className={css.label}>
        Check a draft message before you send it
      </label>
      <textarea
        id={draftId}
        className={css.textarea}
        rows={4}
        value={draft}
        autoComplete="off"
        placeholder="Hi — I'm researching how Bengaluru aerospace suppliers prepare first-article packages…"
        aria-describedby={`${draftId}-result`}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div id={`${draftId}-result`} aria-live="polite">
        {draft.trim() === "" ? (
          <p className={css.blockNote}>Checked here, in your browser. Not saved or sent anywhere.</p>
        ) : findings.length === 0 ? (
          <p className={css.success}>No restricted claims found. A mentor still approves every outreach message (Gate D).</p>
        ) : (
          <Notice tone="danger">
            <p>
              <strong>
                {findings.length} restricted {findings.length === 1 ? "claim" : "claims"} — do not send this message.
              </strong>
            </p>
            <ul className={css.findingList}>
              {findings.map(({ rule, match }) => (
                <li key={rule.id}>
                  <p>
                    <q>{match}</q> — {rule.problem}
                  </p>
                  <p className={css.instead}>Instead: {rule.instead}</p>
                </li>
              ))}
            </ul>
          </Notice>
        )}
      </div>
    </div>
  );
}
