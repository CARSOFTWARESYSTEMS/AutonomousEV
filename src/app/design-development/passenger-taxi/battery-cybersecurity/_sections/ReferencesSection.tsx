import { ExternalLink } from "lucide-react";
import { REFERENCES } from "@/lib/battery-cybersecurity/data/references";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function ReferencesSection() {
  return (
    <section className="section" id="references" aria-labelledby="references-heading">
      <div className="container">
        <SectionHeader label="Evidence & References" title="References" headingId="references-heading">
          <p>Only independently verified, authoritative sources are listed. Deep-linked pages that could not be independently confirmed reachable are referenced by name only in the Standards section above, not linked here.</p>
        </SectionHeader>

        <ul style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "760px" }}>
          {REFERENCES.map((ref) => (
            <li key={ref.id} className={pageStyles.navyPanel} style={{ padding: "16px 20px" }}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--bcs-cyan)", fontWeight: 700, fontSize: "0.92rem" }}
              >
                <ExternalLink size={15} style={{ marginTop: "3px", flexShrink: 0 }} aria-hidden="true" />
                {ref.title}
              </a>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{ref.publisher}</p>
              {ref.note && (
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>{ref.note}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
