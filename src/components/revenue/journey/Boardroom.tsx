"use client";
// Day 60's management review: twenty-three agenda items, each rated by the
// quality of its evidence — not by presentation style.
import { EVALUATION } from "../data/framework";
import { BOARDROOM_AGENDA } from "../data/library";
import { useRevenue } from "../state/store";
import { EVIDENCE_LABEL, EVIDENCE_ORDER, type EvidenceLevel } from "../types";
import { EvidenceBadge } from "../ui/badges";
import Link from "next/link";
import { ROUTES } from "../data/framework";
import { Meter, Panel } from "../ui/controls";
import css from "../app.module.css";

/** 0–100: the average rung of the rated items, where Commercial Proof is 100. Unrated items count as zero. */
export function evidenceQuality(levels: Record<number, EvidenceLevel>, total: number): number {
  if (total <= 0) return 0;
  const sum = Object.values(levels).reduce((acc, level) => acc + EVIDENCE_ORDER.indexOf(level) / (EVIDENCE_ORDER.length - 1), 0);
  return Math.round((sum / total) * 100);
}

export default function Boardroom() {
  const boardroom = useRevenue((state) => state.boardroom);
  const setBoardroom = useRevenue((state) => state.setBoardroom);
  const quality = evidenceQuality(boardroom, BOARDROOM_AGENDA.length);
  const rated = Object.keys(boardroom).length;

  return (
    <div>

      <Panel title="Evidence quality" kicker={`${rated} of ${BOARDROOM_AGENDA.length} items rated`} tone="accent">
        <Meter value={quality} label="Evidence quality score" />
        <p className={css.blockNote}>Unrated items count as no evidence. A strong pitch with weak evidence scores low here — on purpose.</p>
      </Panel>

      <Panel title="15-minute agenda" kicker="Day 59 – 60">
        <ol className={css.agenda}>
          {BOARDROOM_AGENDA.map((item, i) => {
            const level = boardroom[i];
            const id = `rv-board-${i}`;
            return (
              <li key={item} className={css.agendaItem}>
                <span className={css.agendaName}>
                  {i + 1}. {item}
                </span>
                {level ? <EvidenceBadge level={level} /> : <span className={css.blockNote}>Not rated</span>}
                <label htmlFor={id} className={css.srOnly}>
                  Evidence for {item}
                </label>
                <select id={id} className={css.select} value={level ?? ""} autoComplete="off" onChange={(event) => setBoardroom(i, (event.target.value || null) as EvidenceLevel | null)}>
                  <option value="">Not rated</option>
                  {EVIDENCE_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {EVIDENCE_LABEL[value]}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ol>
      </Panel>

      <Panel title="How the internship is evaluated" kicker="Revenue is an outcome, not the only grade">
        <ul className={css.weightList}>
          {EVALUATION.map((row) => (
            <li key={row.area}>
              <span>{row.area}</span>
              <span className={css.weightBar} aria-hidden="true">
                <span style={{ width: `${row.weight * 4}%` }} />
              </span>
              <span className={css.tabular}>{row.weight}%</span>
            </li>
          ))}
        </ul>
        <p className={css.blockNote}>
          Critical assignments and the ethics / compliance gates must be complete. <Link href={`${ROUTES.today}#gates`}>See the gates</Link>.
        </p>
      </Panel>
    </div>
  );
}
