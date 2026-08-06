import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

const CATEGORIES = [
  {
    title: "Aircraft & System Development Assurance",
    body: "Structured requirements, design, and verification processes for aircraft systems, informed by the intent of established aerospace development-assurance guidance (e.g. the ARP4754 family for systems, and DO-178C-family concepts for airborne software).",
  },
  {
    title: "Aircraft Information Security",
    body: "Airworthiness security concepts in the spirit of DO-326A/ED-202A and related guidance, covering how information-security risk is identified, assessed, and addressed alongside safety.",
  },
  {
    title: "Safety Assessment",
    body: "Functional hazard assessment and safety-assessment concepts consistent with ARP4761-family practice, used here to connect cyber threat consequences to flight-safety hazard categories.",
  },
  {
    title: "Battery Safety & Environmental Qualification",
    body: "Battery-level safety and environmental qualification remains governed by applicable battery and aerospace hardware standards; this page addresses the cybersecurity layer on top of, not in place of, that qualification.",
  },
  {
    title: "Secure Development Lifecycle & Supply-Chain Security",
    body: "Structured using the intent of automotive/cyber-physical-systems cybersecurity engineering practice (e.g. ISO/SAE 21434-style threat analysis and risk assessment) adapted to an aerospace energy-system context.",
  },
  {
    title: "Continuing Airworthiness & Incident Logging",
    body: "Tamper-evident logging and incident-correlation practices intended to support continuing-airworthiness reporting and investigation processes, not to replace them.",
  },
  {
    title: "Cryptographic Agility",
    body: "Architecting identity, authentication, and firmware-signing systems so cryptographic algorithms can be updated without hardware redesign — informed by NIST's post-quantum cryptography migration guidance (see References).",
  },
];

export function StandardsSection() {
  return (
    <section className="section bg-surface" id="standards" aria-labelledby="standards-heading">
      <div className="container">
        <SectionHeader label="Standards & Assurance Positioning" title="How This Work Relates to Aerospace Standards" headingId="standards-heading">
          <p>
            This section is educational, not a compliance claim. Project-specific applicability to any of these
            domains must be assessed by qualified aerospace safety, cybersecurity, and certification professionals
            for a given programme.
          </p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px", marginBottom: "24px" }}>
          {CATEGORIES.map((c) => (
            <div key={c.title} className={pageStyles.navyPanel} style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>{c.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{c.body}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ borderLeft: "3px solid var(--bcs-amber)", maxWidth: "820px" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>
            <strong style={{ color: "var(--bcs-amber)" }}>No certification is claimed. </strong>
            No formal certification, audited compliance, or completed control mapping is claimed by this page for any
            standard named above. These are methodology references informing how the discovery workshop and threat
            model are structured.
          </p>
        </div>
      </div>
    </section>
  );
}
