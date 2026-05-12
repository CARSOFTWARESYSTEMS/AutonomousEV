import Link from "next/link";

export const metadata = {
  title: "Strategic Consulting | EV.ENGINEER™",
  description: "Strategic engineering consulting for EV architecture, AI-driven SI-EMS, battery intelligence, and autonomous mobility platforms.",
};

export default function ConsultingPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Strategic Consulting</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          Empower your engineering roadmap with production-validated insights.
        </p>
      </header>

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
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)", lineHeight: 1.4 }}>AI-Driven Super-Intelligent Energy Management Systems for Autonomous EVs</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>Leveraging deep learning, Agentic AI, and continuous thermal intelligence to dynamically optimize energy distribution, extend battery lifecycle, and maximize operational uptime for autonomous fleets.</p>
          <a href="https://autonomous.ev.engineer/si-ems" data-track-event="cta_click" data-track-label="Explore SI-EMS Architecture" style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "auto" }}>
            Explore SI-EMS Architecture <span style={{ transition: "transform 0.2s ease" }}>→</span>
          </a>
        </div>
        
        <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "var(--color-text-primary)" }}>Roadmap & Advisory</h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Helping leadership navigate the complex intersection of hardware procurement, open-source stack integration, testing regulations (including Singapore/CETRAN frameworks), and ODD sizing.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', maxWidth: '900px', margin: '0 auto 64px', width: '100%' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Strategic
        </div>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Startup Engineering Buildout</h3>
        <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
          1–3 Years
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px', flexGrow: 1 }}>
          Long-term engineering collaboration model focused on building EV engineering culture, technical leadership, architecture direction, engineering teams, diagnostics systems, and startup execution capability.
        </p>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', padding: '12px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
          Hire me as:<br/>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}>Co-Founder | Director | Technical Advisor</span><br/>
          <a href="https://autonomous.ev.engineer/about/sudarshana-karkala" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', marginTop: '6px', display: 'inline-block' }}>About Sudarshana Karkala</a>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Suitable For:</div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8, paddingLeft: '16px', listStyleType: 'disc' }}>
            <li>EV Startups</li>
            <li>Product Companies</li>
            <li>Deep-Tech Ventures</li>
            <li>Mobility Innovation Teams</li>
            <li>Engineering-Driven Founders</li>
          </ul>
        </div>
      </div>

      <section style={{ textAlign: "center", padding: "40px 0", borderTop: "1px solid var(--color-glass-border)" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>Partner with iTelematics</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
          Our corporate engagement model is highly flexible—from rapid architecture sprints to long-term advisory retainers.
        </p>
        <Link href="/contact" className="btn btn-primary" data-track-event="cta_click" data-track-label="Schedule Consulting Consultation">Schedule a Consultation</Link>
      </section>

    </div>
  );
}
