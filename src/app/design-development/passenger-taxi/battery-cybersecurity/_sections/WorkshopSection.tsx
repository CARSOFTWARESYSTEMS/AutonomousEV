import { WORKSHOP_PHASES, WORKSHOP_DELIVERABLES } from "@/lib/battery-cybersecurity/data/workshop";
import { SectionHeader } from "../SectionHeader";
import { EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";

export function WorkshopSection() {
  return (
    <section className="section bg-surface" id="workshop" aria-labelledby="workshop-heading">
      <div className="container">
        <SectionHeader
          label="Workshop Offering"
          title="Electric Aircraft Battery Cybersecurity Discovery & Threat-Modelling Workshop"
          headingId="workshop-heading"
        >
          <p>
            A structured, three-phase engagement that takes an electric or hybrid-electric aircraft energy
            architecture from discovery through a prioritised, verifiable assurance strategy.
          </p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "48px" }}>
          {WORKSHOP_PHASES.map((phase) => (
            <div key={phase.id} className={pageStyles.navyPanel} style={{ padding: "24px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  color: "var(--bcs-cyan)",
                  background: "var(--bcs-cyan-dim)",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              >
                {phase.phase.toUpperCase()}
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "12px" }}>{phase.title}</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {phase.activities.map((activity) => (
                  <li key={activity} style={{ display: "flex", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--bcs-cyan)", flexShrink: 0 }}>&#9656;</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Deliverables</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px", marginBottom: "40px" }}>
          {WORKSHOP_DELIVERABLES.map((d) => (
            <div key={d.id} className="glass-panel" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.88rem" }}>{d.title}</p>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "8px" }}>{d.description}</p>
              <EvidenceStatusBadge status={d.evidenceStatus} />
            </div>
          ))}
        </div>

        <div className="flex-responsive" style={{ gap: "16px", justifyContent: "center" }}>
          <a href="/contact" className="btn btn-primary" data-track-event="bcs_cta_request_discovery_workshop">
            Request a Discovery Workshop
          </a>
          <a href="/consulting" className="btn btn-secondary" data-track-event="bcs_cta_discuss_poc">
            Discuss a Battery Cybersecurity POC
          </a>
        </div>
      </div>
    </section>
  );
}
