import { METHODOLOGY_STEPS } from "@/lib/battery-cybersecurity/data/methodology";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function MethodologySection() {
  return (
    <section className="section" id="methodology" aria-labelledby="methodology-heading">
      <div className="container">
        <SectionHeader label="EV.ENGINEER™ Methodology" title="Discover -> Model -> Assess -> Design -> Verify -> Demonstrate -> Deploy -> Improve" headingId="methodology-heading">
          <p>The eight-step methodology behind this page&rsquo;s content and the discovery workshop, closing the loop back into itself via the Cyber Energy Loop.</p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          {METHODOLOGY_STEPS.sort((a, b) => a.order - b.order).map((step) => (
            <div key={step.id} className={pageStyles.navyPanel} style={{ padding: "18px" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--bcs-cyan)", marginBottom: "8px" }}>
                {String(step.order).padStart(2, "0")}
              </p>
              <h3 style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "8px" }}>{step.name}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "10px" }}>{step.description}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--bcs-amber)" }}>Typical outputs: </strong>
                {step.typicalOutputs.join("; ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
