// The five evidence levels, as a ladder: Assumption at the bottom rung,
// Commercial Proof at the top. With counts, it shows how many claims sit on each.
import { EVIDENCE_LABEL, EVIDENCE_MEANING, EVIDENCE_ORDER, type EvidenceLevel } from "../types";
import css from "../app.module.css";

export default function EvidenceLadder({ counts }: { counts?: Partial<Record<EvidenceLevel, number>> }) {
  return (
    <ol className={css.ladder}>
      {EVIDENCE_ORDER.map((level, i) => (
        <li key={level} style={{ ["--rung" as string]: i }}>
          <span className={css.ladderName}>{EVIDENCE_LABEL[level]}</span>
          <span className={css.ladderMeaning}>{EVIDENCE_MEANING[level]}</span>
          {counts ? <span className={css.ladderCount}>{counts[level] ?? 0}</span> : null}
        </li>
      ))}
    </ol>
  );
}

