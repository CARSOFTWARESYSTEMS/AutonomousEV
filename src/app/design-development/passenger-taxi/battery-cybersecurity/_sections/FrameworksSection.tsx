import { FRAMEWORKS } from "@/lib/battery-cybersecurity/data/frameworks";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function FrameworksSection() {
  return (
    <section className="section" id="frameworks" aria-labelledby="frameworks-heading">
      <div className="container">
        <SectionHeader label="EV.ENGINEER™ Frameworks" title="Reusable Engineering Frameworks" headingId="frameworks-heading">
          <p>Three frameworks used throughout this page and the discovery workshop to reason about battery and energy trust consistently.</p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {FRAMEWORKS.map((fw) => (
            <article key={fw.id} className={pageStyles.navyPanel} style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>{fw.name}</h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }} aria-hidden="true">
                {fw.stages.map((stage, i) => (
                  <span key={stage} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(34,211,238,0.07)",
                        border: "1px solid rgba(34,211,238,0.22)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stage}
                    </span>
                    {i < fw.stages.length - 1 && <span style={{ color: "var(--bcs-cyan)", opacity: 0.6 }}>&rarr;</span>}
                  </span>
                ))}
              </div>
              <p style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Stages: {fw.stages.join(", ")}.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px 28px" }}>
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Executive Summary
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{fw.executiveSummary}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Engineering Explanation
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{fw.engineeringExplanation}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Practical Example
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{fw.practicalExample}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                    Verification Method
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{fw.verificationMethod}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
