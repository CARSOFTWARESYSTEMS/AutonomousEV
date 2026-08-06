import { GLOSSARY_TERMS } from "@/lib/battery-cybersecurity/data/glossary";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function GlossarySection() {
  return (
    <section className="section bg-surface" id="glossary" aria-labelledby="glossary-heading">
      <div className="container">
        <SectionHeader label="Glossary" title="Electric Aircraft Battery Cybersecurity Glossary" headingId="glossary-heading">
          <p>Each term follows the same pattern: definition, why it matters, a practical example, and how to verify it.</p>
        </SectionHeader>

        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {GLOSSARY_TERMS.map((term) => (
            <div key={term.id} className={pageStyles.navyPanel} style={{ padding: "20px 22px" }}>
              <dt style={{ fontWeight: 700, color: "var(--bcs-cyan)", fontSize: "0.95rem", marginBottom: "8px" }}>{term.term}</dt>
              <dd style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "8px" }}>{term.definition}</dd>
              <dd style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "6px" }}>
                <strong style={{ color: "var(--text-secondary)" }}>Why it matters: </strong>
                {term.whyItMatters}
              </dd>
              <dd style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "6px" }}>
                <strong style={{ color: "var(--text-secondary)" }}>Example: </strong>
                {term.example}
              </dd>
              <dd style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--text-secondary)" }}>Verification: </strong>
                {term.verificationApproach}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
