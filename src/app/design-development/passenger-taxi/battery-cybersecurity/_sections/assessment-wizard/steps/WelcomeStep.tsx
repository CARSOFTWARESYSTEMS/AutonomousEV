"use client";

export function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto" }}>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
        Battery Cybersecurity Assessment Wizard
      </h3>
      <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "10px" }}>
        A structured, engineering-grade self-assessment of your electric aircraft battery ecosystem&rsquo;s cybersecurity
        maturity — covering architecture, communication, firmware, charging, maintenance, threat detection, and
        verification.
      </p>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "28px" }}>
        Everything runs locally in your browser. Nothing is uploaded, stored, or tracked. Scoring and recommendations
        are fully deterministic — generated from fixed decision tables, not AI.
      </p>
      <button type="button" className="btn btn-primary" onClick={onStart} data-track-event="bcs_wizard_start">
        Start Assessment
      </button>
    </div>
  );
}
