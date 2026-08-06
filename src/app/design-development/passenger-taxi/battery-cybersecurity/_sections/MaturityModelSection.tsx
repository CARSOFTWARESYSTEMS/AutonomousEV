import { MATURITY_LEVELS } from "@/lib/battery-cybersecurity/data/maturityModel";
import { SectionHeader } from "../SectionHeader";
import { EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";

function Field({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
        {label}
      </p>
      <ul style={{ paddingLeft: "18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: "3px" }}>
        {items.map((item) => (
          <li key={item} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MaturityModelSection() {
  return (
    <section className="section bg-surface" id="maturity-model" aria-labelledby="maturity-heading">
      <div className="container">
        <SectionHeader label="Battery Cybersecurity Maturity Model" title="Seven Levels, From Visibility to Autonomous Cyber Resilience" headingId="maturity-heading">
          <p>A self-assessment scale for where a programme&rsquo;s battery and energy cybersecurity posture stands today, and what the next step looks like.</p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {MATURITY_LEVELS.map((lvl) => (
            <article
              key={lvl.id}
              id={`maturity-level-${lvl.id}`}
              className={pageStyles.navyPanel}
              style={{ padding: "24px 28px", scrollMarginTop: "140px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(34,211,238,0.1)",
                      border: "1px solid rgba(34,211,238,0.35)",
                      color: "var(--bcs-cyan)",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    {lvl.level}
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Level {lvl.level}: {lvl.title}
                  </h3>
                </div>
                <EvidenceStatusBadge status={lvl.evidenceStatus} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px 28px", marginBottom: "16px" }}>
                <Field label="Characteristics" items={lvl.characteristics} />
                <Field label="Engineering Controls" items={lvl.engineeringControls} />
                <Field label="Expected Outputs" items={lvl.expectedOutputs} />
                <Field label="Gaps" items={lvl.gaps} />
              </div>

              <div style={{ borderTop: "1px solid var(--bcs-panel-border)", paddingTop: "14px" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--bcs-amber)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Next-Step Guidance
                </p>
                <p style={{ fontSize: "0.87rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{lvl.nextStepGuidance}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
