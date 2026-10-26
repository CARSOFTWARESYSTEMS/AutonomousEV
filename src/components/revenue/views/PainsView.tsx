"use client";
// The pain library and the evidence ladder. Every pain starts as an
// assumption; the user moves it with their own evidence, or invalidates it.
import { trackRevenue } from "../analytics";
import { PAIN_GROUPS, PAINS } from "../data/library";
import { useRevenue } from "../state/store";
import { EVIDENCE_LABEL, EVIDENCE_MEANING, EVIDENCE_ORDER, type EvidenceLevel } from "../types";
import { Badge, EvidenceBadge } from "../ui/badges";
import { NumberField, Panel, SelectField, ViewHeader } from "../ui/controls";
import css from "../workspace.module.css";

export function EvidenceLadder({ counts }: { counts?: Partial<Record<EvidenceLevel, number>> }) {
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

export default function PainsView() {
  const pains = useRevenue((state) => state.pains);
  const setPain = useRevenue((state) => state.setPain);

  const counts: Partial<Record<EvidenceLevel, number>> = {};
  for (const pain of PAINS) {
    const state = pains[pain.id];
    if (state?.invalidated) continue;
    const level = state?.level ?? "assumption";
    counts[level] = (counts[level] ?? 0) + 1;
  }

  const changeLevel = (id: string, level: EvidenceLevel) => {
    setPain(id, { level });
    if (level === "customer" || level === "pilot" || level === "commercial") trackRevenue("pain_validated", { pain: id });
  };

  const toggleInvalidated = (id: string, invalidated: boolean) => {
    setPain(id, { invalidated });
    if (invalidated) trackRevenue("pain_invalidated", { pain: id });
  };

  return (
    <div>
      <ViewHeader
        eyebrow="Market"
        title="Customer Pain Library"
        lede="Every pain is a hypothesis until customers validate it. These are inspired by the AQIP operating manual — not proven by it, and not true for every supplier."
      />

      <Panel title="Evidence ladder" kicker="Evidence over assumption">
        <EvidenceLadder counts={counts} />
      </Panel>

      {PAIN_GROUPS.map((group) => (
        <Panel key={group.id} title={group.name} kicker="Hypotheses">
          <ul className={css.painList}>
            {PAINS.filter((pain) => pain.group === group.name).map((pain) => {
              const state = pains[pain.id];
              const level = state?.level ?? "assumption";
              const count = state?.count ?? 0;
              return (
                <li key={pain.id} className={css.painItem} data-invalidated={state?.invalidated ? "" : undefined}>
                  <div className={css.painHead}>
                    <p className={css.painText}>{pain.text}</p>
                    {state?.invalidated ? <Badge tone="red">Invalidated</Badge> : <EvidenceBadge level={level} count={count} />}
                  </div>
                  <div className={css.painControls}>
                    <SelectField
                      label="Evidence level"
                      value={level}
                      onChange={(value) => changeLevel(pain.id, value)}
                      options={EVIDENCE_ORDER.map((value) => ({ value, label: EVIDENCE_LABEL[value] }))}
                    />
                    <NumberField label="Customer conversations" value={count} min={0} max={99} onChange={(value) => setPain(pain.id, { count: Math.max(0, Math.round(value)) })} />
                    <label className={css.switchLabel}>
                      <input type="checkbox" checked={Boolean(state?.invalidated)} autoComplete="off" onChange={(event) => toggleInvalidated(pain.id, event.target.checked)} />
                      Invalidated by evidence
                    </label>
                  </div>
                  {level === "customer" && count === 0 && !state?.invalidated ? (
                    <p className={css.warnText} role="status">
                      Customer Validated needs at least one real customer conversation. Record how many.
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
