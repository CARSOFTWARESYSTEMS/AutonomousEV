import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

const STEPS = [
  { title: "Answer structured questions", body: "Work through 7 engineering areas — battery architecture, communication, firmware, charging, maintenance, threat detection, and verification." },
  { title: "Get a deterministic score", body: "Each answer contributes to one or more of 9 trust dimensions using a fixed, documented weighting — never a generated or estimated score." },
  { title: "Review traceable recommendations", body: "Every recommendation comes from a fixed decision table matched to your specific answers — no AI, no hallucinated advice." },
  { title: "Export or print your report", body: "Download the report as Markdown, JSON, or CSV, or print it directly. Nothing is uploaded or stored anywhere." },
];

export function HowAssessmentWorksSection() {
  return (
    <section className="section" id="how-assessment-works" aria-labelledby="how-assessment-works-heading">
      <div className="container">
        <SectionHeader label="How It Works" title="How the Battery Cybersecurity Assessment Wizard Works" headingId="how-assessment-works-heading">
          <p>
            The wizard is a deterministic engineering tool, not a marketing quiz — every score and recommendation is
            traceable to a specific answer through a fixed rule set.
          </p>
        </SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {STEPS.map((step, i) => (
            <div key={step.title} className={pageStyles.navyPanel} style={{ padding: "18px" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--bcs-cyan)", marginBottom: "8px" }}>{String(i + 1).padStart(2, "0")}</p>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.92rem", marginBottom: "8px" }}>{step.title}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
