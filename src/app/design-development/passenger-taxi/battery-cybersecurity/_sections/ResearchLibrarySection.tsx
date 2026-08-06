import { ExternalLink } from "lucide-react";
import { RESEARCH_LIBRARY_ENTRIES, RESEARCH_LIBRARY_CATEGORIES } from "@/lib/battery-cybersecurity/data/researchLibrary";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function ResearchLibrarySection() {
  return (
    <section className="section bg-surface" id="research-library" aria-labelledby="research-library-heading">
      <div className="container">
        <SectionHeader label="Research Library" title="Whitepapers, Papers, Patents, Talks & Videos" headingId="research-library-heading">
          <p>
            Only independently verified sources are listed. Categories with nothing verified yet are shown honestly as empty,
            not hidden — the same evidence-status discipline used throughout this page.
          </p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {RESEARCH_LIBRARY_CATEGORIES.map((cat) => {
            const entries = RESEARCH_LIBRARY_ENTRIES.filter((e) => e.category === cat.id);
            return (
              <div key={cat.id} className={pageStyles.navyPanel} style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>{cat.label}</h3>
                {entries.length === 0 ? (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>No verified entries yet.</p>
                ) : (
                  <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "var(--bcs-cyan)", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          <ExternalLink size={13} style={{ marginTop: "3px", flexShrink: 0 }} aria-hidden="true" />
                          {entry.title}
                        </a>
                        <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "3px" }}>{entry.publisher}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
