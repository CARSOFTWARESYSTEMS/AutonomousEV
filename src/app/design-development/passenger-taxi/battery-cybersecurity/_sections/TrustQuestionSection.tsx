import { TRUST_QUESTIONS } from "@/lib/battery-cybersecurity/data/trustQuestions";
import { SectionHeader } from "../SectionHeader";
import { EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
        {label}
      </p>
      <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export function TrustQuestionSection() {
  return (
    <section className="section bg-surface" id="trust-questions" aria-labelledby="trust-questions-heading">
      <div className="container">
        <SectionHeader label="Five Core Trust Questions" title="Can the Aircraft Trust Its Own Energy System?" headingId="trust-questions-heading">
          <p>
            Battery safety alone is not sufficient. These five questions define what &ldquo;trustworthy&rdquo; means at
            each stage of the energy trust chain, and what it takes to verify it.
          </p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {TRUST_QUESTIONS.map((tq, i) => (
            <article
              key={tq.id}
              id={`trust-question-${tq.id}`}
              className={pageStyles.navyPanel}
              style={{ padding: "28px 28px", scrollMarginTop: "140px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, maxWidth: "680px" }}>
                  {i + 1}. {tq.question}
                </h3>
                <EvidenceStatusBadge status={tq.evidenceStatus} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "8px 32px" }}>
                <Field label="Why It Matters">{tq.whyItMatters}</Field>
                <Field label="Typical Attack Surface">{tq.attackSurface}</Field>
                <Field label="Example Threats">
                  <ul style={{ paddingLeft: "18px", listStyle: "disc" }}>
                    {tq.exampleThreats.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Field>
                <Field label="Detection Approaches">
                  <ul style={{ paddingLeft: "18px", listStyle: "disc" }}>
                    {tq.detectionApproaches.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Field>
                <Field label="Mitigations">
                  <ul style={{ paddingLeft: "18px", listStyle: "disc" }}>
                    {tq.mitigations.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Field>
                <Field label="Verification Method">{tq.verificationMethod}</Field>
                <Field label="Flight-Safety Impact">{tq.flightSafetyImpact}</Field>
                <Field label="Intern Learning Exercise">{tq.internExercise}</Field>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
