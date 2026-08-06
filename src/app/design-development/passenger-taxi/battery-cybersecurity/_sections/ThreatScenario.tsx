import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

const KILL_CHAIN = [
  {
    stage: "Initial Access",
    detail: "An attacker gains access through a compromised maintenance tool, charger, supplier update path, or network interface.",
    control: "Command authorization; secure boot & signed firmware",
  },
  {
    stage: "Telemetry Drift",
    detail: "Battery telemetry appears plausible but gradually diverges from physical reality.",
    control: "Physics-based plausibility checks; sensor cross-validation",
  },
  {
    stage: "Value Manipulation",
    detail: "SOC, temperature, current, or available-power values are manipulated.",
    control: "Message authentication; model-based anomaly detection",
  },
  {
    stage: "Command Interference",
    detail: "Power-limit commands are altered or delayed.",
    control: "Command authorization; configuration integrity verification",
  },
  {
    stage: "False Confidence",
    detail: "The aircraft believes adequate energy and power remain for the current flight phase.",
    control: "Independent energy-margin estimation; flight-phase-aware thresholds",
  },
  {
    stage: "Safety Margin Erosion",
    detail: "Actual trustworthy energy margin becomes unsafe, without any single signal in isolation making that obvious.",
    control: "Incident correlation across cyber, physical, and flight-phase signals",
  },
];

const RESPONSE_STEPS = [
  "Alerting — flag the divergence between reported and independently estimated energy margin.",
  "Cross-validation — check disagreement against multiple independent signals before acting.",
  "Power reallocation — adjust available power budget to the verified, conservative estimate.",
  "Degraded mode — enter a defined, bounded safe state rather than an undefined one.",
  "Safe landing logic — factor the verified energy margin into diversion or landing decisions.",
  "Evidence capture — log the event in a tamper-evident way to support investigation.",
  "Recovery — restore trust in the affected component once verified, and record the incident to prevent recurrence.",
];

export function ThreatScenario() {
  return (
    <section className="section" id="flagship-scenario" aria-labelledby="scenario-heading">
      <div className="container">
        <SectionHeader
          label="Flagship Threat Scenario"
          title="Coordinated Battery Telemetry and Power-Limit Manipulation During a High-Demand Flight Phase"
          headingId="scenario-heading"
        >
          <p>
            A single, deliberately challenging scenario, worked through end to end: how a cyber event that never
            physically damages the battery can still erode the energy margin a flight-safety decision depends on.
          </p>
        </SectionHeader>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Attack Progression
        </h3>
        <ol style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px", listStyle: "none" }}>
          {KILL_CHAIN.map((step, i) => (
            <li key={step.stage} className={pageStyles.navyPanel} style={{ padding: "18px 22px", display: "flex", gap: "18px", alignItems: "flex-start" }}>
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(34,211,238,0.1)",
                  border: "1px solid rgba(34,211,238,0.35)",
                  color: "var(--bcs-cyan)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                }}
              >
                {i + 1}
              </span>
              <div>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{step.stage}</p>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "6px" }}>{step.detail}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--bcs-amber)" }}>
                  <strong>Primary control:</strong> {step.control}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Detection Must Correlate, Not Rely on One Signal
        </h3>
        <p style={{ color: "var(--text-secondary)", maxWidth: "820px", marginBottom: "24px", lineHeight: 1.75, fontSize: "0.95rem" }}>
          No single reading proves this scenario is occurring. Detection depends on correlating cyber indicators,
          physical constraints, the current flight phase, historical pack behavior, and at least one independently
          derived signal. This is why the Detection and Assurance Strategy below is explicitly layered rather than
          relying on any one check.
        </p>

        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Response Sequence
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
          {RESPONSE_STEPS.map((step) => {
            const [title, ...rest] = step.split(" — ");
            return (
              <div key={title} className="glass-panel" style={{ padding: "18px" }}>
                <p style={{ fontWeight: 700, color: "var(--bcs-cyan)", fontSize: "0.9rem", marginBottom: "6px" }}>{title}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{rest.join(" — ")}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
