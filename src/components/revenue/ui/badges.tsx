// Small status labels. Each carries its meaning in words, so status never
// depends on colour alone. Safe to render on the server.
import type { ReactNode } from "react";
import { ANSWER_LABEL, CLAIM_LABEL, EVIDENCE_LABEL, EVIDENCE_ORDER, MATURITY_LABEL, type AnswerClass, type ClaimStatus, type EvidenceLevel, type Maturity } from "../types";
import css from "../app.module.css";

type Tone = "neutral" | "cyan" | "green" | "strong" | "amber" | "red" | "synthetic";

export function Badge({ tone = "neutral", children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return (
    <span className={css.badge} data-tone={tone} title={title}>
      {children}
    </span>
  );
}

const EVIDENCE_TONE: Record<EvidenceLevel, Tone> = { assumption: "neutral", research: "cyan", customer: "green", pilot: "strong", commercial: "amber" };

/** "CUSTOMER VALIDATED — 4 interviews", with a five-step ladder mark. */
export function EvidenceBadge({ level, count }: { level: EvidenceLevel; count?: number }) {
  const rung = EVIDENCE_ORDER.indexOf(level);
  return (
    <span className={css.badge} data-tone={EVIDENCE_TONE[level]}>
      <span className={css.ladderMark} aria-hidden="true">
        {EVIDENCE_ORDER.map((step, i) => (
          <i key={step} data-on={i <= rung ? "" : undefined} />
        ))}
      </span>
      {EVIDENCE_LABEL[level]}
      {level === "customer" && count ? ` — ${count} ${count === 1 ? "interview" : "interviews"}` : null}
    </span>
  );
}

const MATURITY_TONE: Record<Maturity, Tone> = { prototype: "green", beta: "cyan", development: "cyan", planned: "neutral", research: "amber", vision: "neutral" };

export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  return (
    <Badge tone={MATURITY_TONE[maturity]}>
      {MATURITY_LABEL[maturity]}
    </Badge>
  );
}

const CLAIM_TONE: Record<ClaimStatus, Tone> = { verified: "green", customer: "strong", hypothesis: "amber", restricted: "red" };

export function ClaimBadge({ status }: { status: ClaimStatus }) {
  return <Badge tone={CLAIM_TONE[status]}>{CLAIM_LABEL[status]}</Badge>;
}

const ANSWER_TONE: Record<AnswerClass, Tone> = { approved: "green", technical: "cyan", commercial: "amber", security: "red", legal: "amber" };

export function AnswerBadge({ status }: { status: AnswerClass }) {
  return <Badge tone={ANSWER_TONE[status]}>{ANSWER_LABEL[status]}</Badge>;
}

export function SyntheticBadge() {
  return (
    <Badge tone="synthetic" title="Fictional record for demonstration. Not a real customer or opportunity.">
      Synthetic Demonstration Data
    </Badge>
  );
}
