import { ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import { DECISION_TREES } from "@/lib/battery-cybersecurity/data/decisionTrees";
import type { DecisionTreeStep } from "@/lib/battery-cybersecurity/types";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

function BranchRow({
  branch,
  Icon,
  color,
}: {
  branch: DecisionTreeStep["yes"];
  Icon: typeof CheckCircle2;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(148,163,184,0.05)" }}>
      <Icon size={16} style={{ color, flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
      <div>
        <span style={{ fontWeight: 700, color, fontSize: "0.82rem" }}>{branch.label}: </span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {branch.outcome ?? "Continue to the next question."}
        </span>
      </div>
    </div>
  );
}

export function DecisionTreeSection() {
  return (
    <section className="section" id="decision-trees" aria-labelledby="decision-trees-heading">
      <div className="container">
        <SectionHeader label="Engineering Decision Trees" title="From Question to Bounded Action" headingId="decision-trees-heading">
          <p>Two decision flows converting the narrative trust-question and threat-scenario sections above into an explicit, step-by-step engineering flow.</p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {DECISION_TREES.map((tree) => (
            <div key={tree.id}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{tree.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "20px", maxWidth: "760px" }}>{tree.description}</p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
                {tree.steps.map((step, i) => (
                  <div key={step.id} style={{ width: "100%", maxWidth: "620px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className={pageStyles.navyPanel} style={{ padding: "18px 22px", width: "100%" }}>
                      <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.92rem", marginBottom: "12px" }}>{step.question}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <BranchRow branch={step.yes} Icon={CheckCircle2} color="var(--bcs-cyan)" />
                        <BranchRow branch={step.no} Icon={XCircle} color="var(--bcs-red)" />
                      </div>
                    </div>
                    {i < tree.steps.length - 1 && (
                      <ArrowDown size={18} style={{ color: "var(--bcs-cyan)", opacity: 0.6, margin: "8px 0" }} aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
