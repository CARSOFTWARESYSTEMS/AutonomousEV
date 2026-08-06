import { ROADMAP_ITEMS } from "@/lib/battery-cybersecurity/data/roadmap";
import { SectionHeader } from "../SectionHeader";
import { EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";

const PHASE_LABEL: Record<string, string> = { now: "Current", next: "Next", future: "Future" };

export function RoadmapSection() {
  const phases: Array<"now" | "next" | "future"> = ["now", "next", "future"];

  return (
    <section className="section" id="roadmap" aria-labelledby="roadmap-heading">
      <div className="container">
        <SectionHeader label="Current-to-Future Roadmap" title="From Current Capability to Mission-Critical Energy Trust" headingId="roadmap-heading">
          <p>
            Post-quantum cryptography is one future-roadmap item among many here, not the centre of the strategy — it
            is a migration-readiness direction for long-lived aerospace systems, not a current production requirement.
          </p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {phases.map((phase) => (
            <div key={phase}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--bcs-cyan)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {PHASE_LABEL[phase]}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ROADMAP_ITEMS.filter((r) => r.phase === phase).map((item) => (
                  <div key={item.id} className={pageStyles.navyPanel} style={{ padding: "16px 18px" }}>
                    <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.88rem", marginBottom: "6px" }}>{item.title}</p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "8px" }}>{item.description}</p>
                    <EvidenceStatusBadge status={item.status} />
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
