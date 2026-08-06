import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import type { DetectionLayerId } from "@/lib/battery-cybersecurity/types";
import { SectionHeader } from "../SectionHeader";
import { EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";

const LAYER_ORDER: DetectionLayerId[] = [
  "identity",
  "telemetry-integrity",
  "behavioral-anomaly",
  "firmware-assurance",
  "network",
  "operational-process",
];

const LAYER_LABEL: Record<DetectionLayerId, string> = {
  identity: "Identity & Boot Assurance",
  "telemetry-integrity": "Telemetry Integrity",
  "behavioral-anomaly": "Behavioral & Statistical Anomaly Detection",
  "firmware-assurance": "Firmware & Configuration Assurance",
  network: "Network & Command Authorization",
  "operational-process": "Operational Process & Evidence",
};

export function DetectionLayers() {
  return (
    <section className="section" id="detection-strategy" aria-labelledby="detection-heading">
      <div className="container">
        <SectionHeader label="Detection & Assurance Strategy" title="A Layered Approach to Energy Trust" headingId="detection-heading">
          <p>
            No single control catches every threat in the catalogue above. Detection is layered across six
            complementary categories, from cryptographic identity through operational evidence.
          </p>
        </SectionHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginBottom: "36px" }}>
          {LAYER_ORDER.map((layerId) => {
            const controls = DETECTION_CONTROLS.filter((c) => c.layer === layerId);
            return (
              <div key={layerId}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--bcs-cyan)", marginBottom: "14px" }}>
                  {LAYER_LABEL[layerId]}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                  {controls.map((control) => (
                    <div key={control.id} className={pageStyles.navyPanel} style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{control.name}</p>
                        <EvidenceStatusBadge status={control.evidenceStatus} />
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{control.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="glass-panel"
          style={{ borderLeft: "3px solid var(--bcs-amber)", maxWidth: "820px" }}
        >
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>
            <strong style={{ color: "var(--bcs-amber)" }}>On AI-assisted analysis: </strong>
            model-based and statistical anomaly detection are useful supplements, but AI must not replace deterministic
            safety and cybersecurity controls. Every layer above that gates a safety- or security-relevant decision is
            deterministic and independently verifiable; AI-assisted analysis is a future direction for triage and
            correlation, not a substitute for these controls.
          </p>
        </div>
      </div>
    </section>
  );
}
