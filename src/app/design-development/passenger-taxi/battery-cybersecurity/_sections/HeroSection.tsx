import styles from "../page.module.css";

const TRUST_CHAIN = [
  "Battery Pack",
  "BMS",
  "Energy Management",
  "Power Distribution",
  "Propulsion",
  "Flight Safety",
];

export function HeroSection() {
  return (
    <section
      style={{ paddingTop: "140px", paddingBottom: "72px", position: "relative", overflow: "hidden" }}
      aria-labelledby="bcs-hero-heading"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1000px",
          height: "520px",
          background:
            "radial-gradient(ellipse, rgba(34,211,238,0.09) 0%, rgba(251,191,36,0.04) 50%, transparent 72%)",
          pointerEvents: "none",
        }}
      />
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "920px", margin: "0 auto" }}>
          <span className={styles.sectionLabel}>Electric Aircraft Energy Cybersecurity</span>

          <h1
            id="bcs-hero-heading"
            style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "22px", lineHeight: 1.12, fontWeight: 800 }}
          >
            Secure the Energy That Keeps{" "}
            <span style={{ color: "var(--bcs-cyan)" }}>Electric Aircraft in Flight</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "760px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            Cyber-resilient battery intelligence, trusted BMS communication, and energy assurance for eVTOL, eSTOL,
            unmanned, defense, and mission-critical electric aircraft.
          </p>

          <div className="flex-responsive" style={{ gap: "16px", justifyContent: "center", marginBottom: "36px" }}>
            <a href="#threat-modelling-studio" className="btn btn-primary" data-track-event="bcs_cta_assess_attack_surface">
              Assess Your Energy Attack Surface
            </a>
            <a href="#energy-trust-chain" className="btn btn-secondary" data-track-event="bcs_cta_explore_threat_model">
              Explore the Threat Model
            </a>
          </div>

          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--bcs-cyan)",
              letterSpacing: "0.02em",
              marginBottom: "40px",
            }}
          >
            Battery identity. Telemetry integrity. Command trust. Energy availability. Safe recovery.
          </p>

          <div
            className={styles.navyPanel}
            style={{ padding: "20px 16px", maxWidth: "820px", margin: "0 auto" }}
            role="img"
            aria-label="Energy trust chain: Battery Pack, feeding the Battery Management System, feeding Energy Management, feeding Power Distribution, feeding Propulsion, which determines Flight Safety."
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.82rem",
              }}
              aria-hidden="true"
            >
              {TRUST_CHAIN.map((step, i) => (
                <span key={step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      padding: "7px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(34,211,238,0.07)",
                      border: "1px solid rgba(34,211,238,0.22)",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step}
                  </span>
                  {i < TRUST_CHAIN.length - 1 && (
                    <span style={{ color: "var(--bcs-cyan)", opacity: 0.6 }}>&rarr;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
