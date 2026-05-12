import Link from "next/link";
import EngagementModels from "@/components/EngagementModels";

export const metadata = {
  title: "Consulting Services | EV.ENGINEER™",
  description: "Architecture reviews, simulation strategy, cybersecurity, and EV battery consulting for autonomous platforms.",
};

export default function ConsultingPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px", lineHeight: 1.2 }}>Engineering Strategy for EV, Battery & Connected Mobility Systems</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "900px", margin: "0 auto 24px", lineHeight: 1.6 }}>
          Collaborate with EV.ENGINEER™ to accelerate EV product engineering, workforce capability, diagnostics systems, telematics platforms, battery intelligence, and technical leadership initiatives.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          {['EV Systems', 'Battery Intelligence', 'Diagnostics', 'Telematics', 'Engineering Leadership', 'Product Engineering'].map(tag => (
            <span key={tag} style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', background: 'rgba(76, 169, 48, 0.05)', padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(76, 169, 48, 0.15)', boxShadow: '0 0 10px rgba(76, 169, 48, 0.05)' }}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <EngagementModels />

      <div className="grid" style={{ gap: "24px", maxWidth: "900px", margin: "0 auto 64px" }}>
        <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)" }}>Architecture Reviews</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>System-level validation focusing on real-time constraints, sensor redundancy, and fail-operational design. We analyze your proposed hardware-software integration before expensive commitments.</p>
        </div>

        <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)" }}>Simulation Strategy Consulting</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Transitioning from ad-hoc manual testing to Coverage-Driven Verification. We design automated regression platforms linking your native stack to high-fidelity environments like CARLA or specialized CI/CD testbeds.</p>
        </div>

        <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)" }}>Cybersecurity Consulting</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Threat modeling and penetration path analysis for V2X interfaces, OTA architecture, and deep embedded systems operating within the vehicle network in compliance with ISO/SAE 21434.</p>
        </div>

        <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)" }}>Continuous Diagnostics & Thermal Intelligence</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Developing bespoke algorithms to monitor and predict battery behavior under continuous AV compute loads, prioritizing fleet availability and predicting imminent thermal degradation.</p>
        </div>
        
        <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)" }}>Roadmap & Advisory</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Helping leadership navigate the complex intersection of hardware procurement, open-source stack integration, testing regulations (including Singapore/CETRAN frameworks), and ODD sizing.</p>
        </div>
      </div>

      <div style={{ 
        background: 'linear-gradient(to bottom, rgba(4, 20, 14, 0.4), rgba(0,0,0,0.6))', 
        padding: '64px 32px', 
        borderRadius: '24px', 
        marginTop: '80px', 
        marginBottom: '64px',
        border: '1px solid rgba(76, 169, 48, 0.15)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Strategic Engineering Collaboration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
            A premium engagement ecosystem designed to build your EV engineering capabilities and accelerate your roadmap.
          </p>
        </div>
        <EngagementModels />
      </div>

      <section style={{ textAlign: "center", padding: "40px 0", borderTop: "1px solid var(--color-glass-border)" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>Partner with iTelematics</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
          Our corporate engagement model is highly flexible—from rapid architecture sprints to long-term advisory retainers.
        </p>
        <Link href="/contact" className="btn btn-primary">Schedule a Consultation</Link>
      </section>

    </div>
  );
}
