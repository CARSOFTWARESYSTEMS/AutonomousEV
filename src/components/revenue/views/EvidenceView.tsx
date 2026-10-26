"use client";
// Evidence vs assumption, the Approved Claims Registry, a message checker
// that warns on restricted claims before anything is sent, and the DON'T list.
import { useId, useState } from "react";
import { DONTS } from "../data/library";
import { CLAIMS } from "../data/product";
import { checkClaims } from "../logic/claims";
import { CLAIM_LABEL, type ClaimStatus } from "../types";
import { ClaimBadge } from "../ui/badges";
import { List, Notice, Panel, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";
import { EvidenceLadder } from "./PainsView";

const ORDER: readonly ClaimStatus[] = ["verified", "customer", "hypothesis", "restricted"];

export default function EvidenceView() {
  const draftId = useId();
  const [draft, setDraft] = useState("");
  const findings = checkClaims(draft);

  return (
    <div>
      <ViewHeader eyebrow="Case Study" title="Evidence & Claims" lede="Every market, customer or commercial claim is classified. Synthetic and demonstration content is always labelled; your own evidence is what moves a claim up the ladder." />

      <Panel title="Evidence over assumption" kicker="Five levels">
        <EvidenceLadder />
        <p className={css.blockNote}>
          Example: “Manual ballooning is time-consuming” starts as an Assumption, becomes Customer Validated — 4 interviews only after four real conversations, and Pilot Validated only after a measured pilot. Never fabricate validation.
        </p>
      </Panel>

      <Panel title="Message checker" kicker="Before you send anything" tone="accent">
        <label htmlFor={draftId} className={css.label}>
          Paste or write a draft message
        </label>
        <textarea
          id={draftId}
          className={css.textarea}
          rows={5}
          value={draft}
          autoComplete="off"
          placeholder="Hi — I'm researching how Bengaluru aerospace suppliers prepare first-article packages…"
          aria-describedby={`${draftId}-result`}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div id={`${draftId}-result`} aria-live="polite">
          {draft.trim() === "" ? (
            <p className={css.blockNote}>The draft is checked here, in your browser. It is not saved or sent anywhere.</p>
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
      </Panel>

      <Panel title="Approved Claims Registry" kicker="What may be said">
        {ORDER.map((status) => {
          const claims = CLAIMS.filter((claim) => claim.status === status);
          if (!claims.length) return null;
          return (
            <section key={status} className={css.claimGroup} aria-label={CLAIM_LABEL[status]}>
              <ul className={css.claimList}>
                {claims.map((claim) => (
                  <li key={claim.id} className={css.claimItem} data-status={claim.status}>
                    <div className={css.miniHead}>
                      <p className={css.claimText}>{claim.text}</p>
                      <ClaimBadge status={claim.status} />
                    </div>
                    <p className={css.blockNote}>{claim.basis}</p>
                    {claim.instead ? <p className={css.instead}>Say instead: {claim.instead}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </Panel>

      <Panel title="What not to do" kicker="DON'T library" tone="warn">
        <List items={DONTS} />
      </Panel>
    </div>
  );
}
