"use client";
import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { generateQuestion, DISCIPLINES, SUBSYSTEMS, ENVIRONMENTS, TRLS, LEVELS, type QuestionInput } from "@/lib/space-station/questions";
import { Select } from "./SimFrame";
import styles from "../station.module.css";

export default function ResearchQuestionGenerator() {
  const [q, setQ] = useState<QuestionInput>({ discipline: "Autonomy & AI", subsystem: "ECLSS", environment: "Lunar orbit", trl: TRLS[1], level: "PhD" });
  const set = <K extends keyof QuestionInput>(k: K) => (v: QuestionInput[K]) => setQ((s) => ({ ...s, [k]: v }));
  const g = useMemo(() => generateQuestion(q), [q]);
  return (
    <div className={styles.sim}>
      <div className={styles.simHead}>
        <div>
          <h3>
            <Lightbulb size={18} aria-hidden="true" /> Generate a Research Question
          </h3>
          <span className={styles.simLabel}>A structured starting point — no citations are generated; follow the search links to real literature.</span>
        </div>
      </div>
      <div className={styles.simBody}>
        <div className={styles.simControls}>
          <Select label="Discipline" value={q.discipline} options={DISCIPLINES} onChange={set("discipline")} />
          <Select label="Station subsystem" value={q.subsystem} options={SUBSYSTEMS} onChange={set("subsystem")} />
          <Select label="Environment" value={q.environment} options={ENVIRONMENTS} onChange={set("environment")} />
          <Select label="Technology readiness" value={q.trl} options={TRLS} onChange={set("trl")} />
          <Select label="Academic level" value={q.level} options={LEVELS} onChange={set("level")} />
        </div>
        <div className={styles.simOutput} aria-live="polite">
          <dl className={styles.kv}>
            <div><dt>Research problem</dt><dd>{g.problem}</dd></div>
            <div><dt>Hypothesis</dt><dd>{g.hypothesis}</dd></div>
            <div><dt>Variables</dt><dd>Independent: {g.variables.independent}. Dependent: {g.variables.dependent}. Controlled: {g.variables.controlled}.</dd></div>
            <div><dt>Simulation</dt><dd>{g.simulation}</dd></div>
            <div><dt>Experiment</dt><dd>{g.experiment}</dd></div>
            <div><dt>Required data</dt><dd>{g.data}</dd></div>
            <div><dt>Validation</dt><dd>{g.validation}</dd></div>
            <div><dt>Expected contribution</dt><dd>{g.contribution}</dd></div>
            <div>
              <dt>Authoritative starting resources</dt>
              <dd>
                <ul style={{ paddingLeft: 18 }}>
                  {g.resources.map((r) => (
                    <li key={r.href}>
                      <a className={styles.inlineLink} href={r.href} target="_blank" rel="noopener noreferrer">{r.label}</a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
