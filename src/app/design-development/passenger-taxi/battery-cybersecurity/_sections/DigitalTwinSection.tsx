import { DIGITAL_TWIN_LAYERS } from "@/lib/battery-cybersecurity/data/digitalTwin";
import { SectionHeader } from "../SectionHeader";
import { EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";

export function DigitalTwinSection() {
  return (
    <section className="section bg-surface" id="digital-twin" aria-labelledby="digital-twin-heading">
      <div className="container">
        <SectionHeader label="Battery Digital Twin" title="Physical Battery to Trust Twin" headingId="digital-twin-heading">
          <p>Four layers building from the physical battery to a synthesized trust view. Current capability is concentrated at the lower layers; the Trust Twin is a future direction.</p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {DIGITAL_TWIN_LAYERS.sort((a, b) => a.order - b.order).map((layer, i, arr) => (
            <div key={layer.id}>
              <div className={pageStyles.navyPanel} style={{ padding: "20px 24px", display: "flex", gap: "18px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.35)",
                    color: "var(--bcs-cyan)",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                  }}
                >
                  {layer.order}
                </span>
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{layer.name}</h3>
                    <EvidenceStatusBadge status={layer.evidenceStatus} />
                  </div>
                  <p style={{ fontSize: "0.87rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px" }}>{layer.description}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-secondary)" }}>Inputs: </strong>
                    {layer.inputs.join("; ")}
                  </p>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }} aria-hidden="true">
                  <span style={{ color: "var(--bcs-cyan)", opacity: 0.6 }}>&darr;</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
