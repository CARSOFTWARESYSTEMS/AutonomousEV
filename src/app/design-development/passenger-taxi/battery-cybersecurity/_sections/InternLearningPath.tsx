import { INTERN_EXERCISES } from "@/lib/battery-cybersecurity/data/exercises";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";
import { Quiz } from "./Quiz";

const STAGES = [
  { name: "Learn", detail: "Study the trust chain, trust questions, and threat catalogue on this page." },
  { name: "Observe", detail: "Identify trust boundaries and entry points in a real or example architecture." },
  { name: "Simulate", detail: "Use the Threat-Modelling Studio to walk a threat through the trust chain." },
  { name: "Detect", detail: "Write a deterministic rule that would catch the simulated threat." },
  { name: "Mitigate", detail: "Propose the control (or combination of controls) that would prevent or contain it." },
  { name: "Verify", detail: "Define a concrete test that proves the detection or mitigation works." },
  { name: "Report", detail: "Write up findings in the structure a real investigation or review would expect." },
];

export function InternLearningPath() {
  return (
    <section className="section" id="learning-path" aria-labelledby="learning-path-heading">
      <div className="container">
        <SectionHeader label="Intern Learning Path" title="Learn -> Observe -> Simulate -> Detect -> Mitigate -> Verify -> Report" headingId="learning-path-heading">
          <p>A practical, hands-on sequence for building battery cybersecurity engineering skill on real system concepts.</p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "44px" }}>
          {STAGES.map((stage, i) => (
            <div key={stage.name} className={pageStyles.navyPanel} style={{ padding: "16px" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--bcs-cyan)", marginBottom: "6px" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "6px" }}>{stage.name}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{stage.detail}</p>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Intern Exercises</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "48px" }}>
          {INTERN_EXERCISES.map((exercise, i) => (
            <details key={exercise.id} className={pageStyles.navyPanel} style={{ padding: "0" }}>
              <summary style={{ listStyle: "none", cursor: "pointer", padding: "18px 22px", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.92rem" }}>
                {i + 1}. {exercise.title}
              </summary>
              <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                <p><strong style={{ color: "var(--bcs-cyan)" }}>Objective: </strong>{exercise.objective}</p>
                <p><strong style={{ color: "var(--bcs-cyan)" }}>Input: </strong>{exercise.input}</p>
                <p><strong style={{ color: "var(--bcs-cyan)" }}>Task: </strong>{exercise.task}</p>
                <p><strong style={{ color: "var(--bcs-cyan)" }}>Expected Output: </strong>{exercise.expectedOutput}</p>
                <div>
                  <strong style={{ color: "var(--bcs-cyan)" }}>Acceptance Criteria:</strong>
                  <ul style={{ paddingLeft: "18px", listStyle: "disc", marginTop: "4px" }}>
                    {exercise.acceptanceCriteria.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "var(--bcs-amber)" }}>Common Mistakes:</strong>
                  <ul style={{ paddingLeft: "18px", listStyle: "disc", marginTop: "4px" }}>
                    {exercise.commonMistakes.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
                <p><strong style={{ color: "var(--bcs-cyan)" }}>Stretch Goal: </strong>{exercise.stretchGoal}</p>
              </div>
            </details>
          ))}
        </div>

        <Quiz />
      </div>
    </section>
  );
}
