"use client";
// Internship mode: the mentor / approval gates as progression states, the
// Professional Behaviour module that must precede customer contact, and how
// the internship is evaluated. Gate G unlocks only after A–F and the module.
import { LINK_EVENTS, trackRevenue } from "../analytics";
import { EVALUATION, GATES, INTERNSHIP, PROFESSIONAL_BEHAVIOUR } from "../data/framework";
import { gateUnlocked, useRevenue } from "../state/store";
import { Badge } from "../ui/badges";
import { CheckItem, Panel, ViewHeader } from "../ui/controls";
import { ViewLink } from "../workspace/nav";
import css from "../workspace.module.css";

export default function InternshipView() {
  const gates = useRevenue((state) => state.gates);
  const professional = useRevenue((state) => state.professional);
  const checks = useRevenue((state) => state.checks);
  const setGate = useRevenue((state) => state.setGate);
  const setProfessional = useRevenue((state) => state.setProfessional);
  const toggleCheck = useRevenue((state) => state.toggleCheck);

  const behaviourDone = PROFESSIONAL_BEHAVIOUR.every((_, i) => checks[`pro:${i}`]);

  const toggleBehaviour = (i: number) => {
    toggleCheck(`pro:${i}`);
    const after = PROFESSIONAL_BEHAVIOUR.every((_, j) => (j === i ? !checks[`pro:${i}`] : checks[`pro:${j}`]));
    setProfessional(after);
  };

  return (
    <div>
      <ViewHeader eyebrow="Internship" title="Internship Gates & Progression" lede="Gates are progression states a mentor confirms. Customer-facing work unlocks only after the gates it depends on." />

      <Panel title="Mentor / approval gates" kicker="A → G">
        <ol className={css.gateList}>
          {GATES.map((gate) => {
            const unlocked = gateUnlocked({ gates, professional }, gate.id);
            const done = Boolean(gates[gate.id]);
            return (
              <li key={gate.id} className={css.gateItem} data-done={done ? "" : undefined} data-locked={!unlocked ? "" : undefined}>
                <span className={css.gateId} aria-hidden="true">
                  {gate.id}
                </span>
                <div>
                  <h3 className={css.miniTitle}>
                    Gate {gate.id} — {gate.name}
                  </h3>
                  <p>{gate.criterion}</p>
                  <p className={css.blockNote}>
                    Reviewed around <ViewLink view="today" day={gate.day}>Day {gate.day}</ViewLink>
                    {!unlocked ? " · Locked until Gates A–F and the Professional Behaviour module are complete." : ""}
                  </p>
                </div>
                <label className={css.switchLabel}>
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={!unlocked}
                    autoComplete="off"
                    onChange={(event) => {
                      setGate(gate.id, event.target.checked);
                      if (event.target.checked) trackRevenue("mentor_gate_complete", { gate: gate.id.toLowerCase() });
                    }}
                  />
                  Mentor confirmed
                </label>
              </li>
            );
          })}
        </ol>
      </Panel>

      <Panel title="Professional Behaviour module" kicker="Mandatory before customer-facing activity" actions={behaviourDone && professional ? <Badge tone="green">Complete</Badge> : <Badge tone="amber">Required</Badge>}>
        <ul className={css.checkGrid}>
          {PROFESSIONAL_BEHAVIOUR.map((item, i) => (
            <CheckItem key={item} checked={Boolean(checks[`pro:${i}`])} onChange={() => toggleBehaviour(i)}>
              {item}
            </CheckItem>
          ))}
        </ul>
      </Panel>

      <Panel title="Evaluation" kicker="Do not grade mainly on revenue">
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
      </Panel>

      <Panel title={INTERNSHIP.title} kicker={`${INTERNSHIP.cohort} · ${INTERNSHIP.mode} · ${INTERNSHIP.selection}`} tone="accent">
        <p>{INTERNSHIP.details}</p>
        <a href={INTERNSHIP.apply.url} target="_blank" rel="noopener noreferrer" className={css.primaryButton} data-track-event={LINK_EVENTS.apply} data-track-source="workspace">
          {INTERNSHIP.apply.label}
          <span className={css.srOnly}> (opens in a new tab)</span> ↗
        </a>
        <p className={css.blockNote}>{INTERNSHIP.apply.note}</p>
      </Panel>
    </div>
  );
}
