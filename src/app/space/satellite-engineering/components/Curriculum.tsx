import { ArrowRight } from "lucide-react";
import styles from "../satellite.module.css";
import { phases, type Week } from "../programData";
import { CurriculumProvider, ExpandAllButton, WeekDisclosure } from "./CurriculumDisclosure";

const weekId = (n: number) => `week-${n}`;
const allWeekIds = phases.flatMap((p) => p.weeks.map((w) => weekId(w.number)));

function WeekHeader({ week }: { week: Week }) {
  return (
    <>
      <span className={styles.weekNumber}>
        <span className={styles.weekNumberLabel}>Week</span>
        {String(week.number).padStart(2, "0")}
      </span>
      <span className={styles.weekTitleBlock}>
        <span className={styles.weekTitle}>{week.title}</span>
        <span className={styles.weekFocus}>{week.focus}</span>
      </span>
      {week.milestones && (
        <span className={styles.milestoneBadge}>
          <span className={styles.srOnly}>Review gates: </span>
          {week.milestones.map((m) => m.code).join(" · ")}
        </span>
      )}
    </>
  );
}

function WeekBody({ week }: { week: Week }) {
  return (
    <div className={styles.weekBody}>
      <div className={styles.weekTopics}>
        <h5 className={styles.weekLabel}>Core topics</h5>
        {week.topics.map((group, i) => (
          <div key={group.label ?? i} className={styles.topicGroup}>
            {group.label && <p className={styles.topicGroupLabel}>{group.label}</p>}
            <ul className={styles.topicList}>
              {group.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}

        {week.feature && (
          <div className={styles.weekFeature}>
            <h5 className={styles.weekLabel}>{week.feature.title}</h5>
            {week.feature.items.length > 0 && (
              <ul className={styles.featureList}>
                {week.feature.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            {week.feature.flow && (
              <ol className={styles.flowInline} aria-label={`${week.feature.title} sequence`}>
                {week.feature.flow.map((step, i, arr) => (
                  <li key={step}>
                    {step}
                    {i < arr.length - 1 && <ArrowRight size={13} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      <div className={styles.weekSide}>
        {week.decisions && (
          <div>
            <h5 className={styles.weekLabel}>{week.decisionsLabel ?? "Architecture decisions"}</h5>
            <ul className={styles.decisionList}>
              {week.decisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h5 className={styles.weekLabel}>Labs / studio</h5>
          <ul className={styles.plainList}>
            {week.studio.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className={styles.weekLabel}>Deliverables</h5>
          <ul className={styles.deliverableList}>
            {week.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        {week.milestones && (
          <div className={styles.milestoneStack}>
            {week.milestones.map((m) => (
              <p key={m.code} className={styles.milestoneNote}>
                <strong>{m.code}</strong> · {m.name}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Curriculum() {
  return (
    <CurriculumProvider ids={allWeekIds} defaultOpen={[weekId(1)]}>
      <div className={styles.curriculumToolbar}>
        <p className={styles.curriculumHint}>4 phases · 12 weeks · select a week to see topics, decisions, studio work and deliverables.</p>
        <ExpandAllButton total={allWeekIds.length} />
      </div>
      <div className={styles.phaseList}>
        {phases.map((phase) => {
          const first = phase.weeks[0].number;
          const last = phase.weeks[phase.weeks.length - 1].number;
          const milestones = phase.weeks.flatMap((w) => w.milestones ?? []).map((m) => m.code);
          return (
            <section key={phase.numeral} className={styles.phase} aria-labelledby={`phase-${phase.numeral}`}>
              <header className={styles.phaseHead}>
                <p className={styles.phaseKicker}>
                  Phase {phase.numeral} · Weeks {first}–{last}
                </p>
                <h3 id={`phase-${phase.numeral}`} className={styles.phaseTitle}>
                  {phase.title}
                </h3>
                <p className={styles.phaseSummary}>{phase.summary}</p>
                {milestones.length > 0 && (
                  <p className={styles.phaseGates}>
                    Review gates: <span>{milestones.join(" · ")}</span>
                  </p>
                )}
              </header>
              <div className={styles.weekList}>
                {phase.weeks.map((week) => (
                  <WeekDisclosure key={week.number} id={weekId(week.number)} header={<WeekHeader week={week} />}>
                    <WeekBody week={week} />
                  </WeekDisclosure>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </CurriculumProvider>
  );
}
