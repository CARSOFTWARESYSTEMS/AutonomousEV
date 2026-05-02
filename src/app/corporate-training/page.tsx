import Link from "next/link";

export const metadata = {
  title: "Corporate Training | EV.ENGINEER™",
  description: "Delivery of engineering-grade AV/EV training for corporations, specifically focused on Singapore deployment models.",
};

export default function CorporateTrainingPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Corporate Training</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto 32px" }}>
          Upskill your leadership and engineering teams with production-grade curriculum delivered by active architectures.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="https://labs.ev.engineer/"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            data-track-event="cta_click"
            data-track-label="Ongoing vs Completed"
          >
            Ongoing vs Completed
          </a>
          <a
            href="https://carsoftwaresystems.com/#testimonial"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            data-track-event="cta_click"
            data-track-label="More Info & Gallery"
          >
            More Info & Gallery
          </a>
        </div>
      </header>

      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "32px", textAlign: "center" }}>Our Delivery Tracks</h2>
        <div className="grid-2" style={{ marginBottom: '32px' }}>
          
          <div className="glass-panel">
            <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Executive Workshop Track</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px" }}>Half-day or full-day sessions focused strictly on capability assessment, ROI of automation, and deployment strategies without deep technical jargon.</p>
            <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, paddingLeft: "16px" }}>
              <li>• Feasibility Assessment Models</li>
              <li>• Regulatory Landscape (LTA / CETRAN)</li>
              <li>• Vendor ecosystem overview</li>
            </ul>
          </div>

          <div className="glass-panel">
            <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Non-Technical Track</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px" }}>Empower the management, policy, and risk-assessment layers of your organization to accurately forecast deployment liabilities.</p>
            <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, paddingLeft: "16px" }}>
              <li>• Navigating Insurance and Liability</li>
              <li>• Public trust and acceptance strategies</li>
              <li>• Operational safety governance</li>
            </ul>
          </div>

          <div className="glass-panel">
            <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Technical Engineering Track</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px" }}>Rigorous classroom and hands-on modules bridging the gap between ADAS concepts and full L4 autonomy architectures.</p>
            <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, paddingLeft: "16px" }}>
              <li>• Sensor Fusion & Filtering</li>
              <li>• Deep Learning in Perception</li>
              <li>• Vehicle Control Algorithms</li>
            </ul>
          </div>

          <div className="glass-panel">
            <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Simulation & Architecture Deep-Dive</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px" }}>Advanced hands-on labs aimed at software integration, validation pipelines, and timing analyses.</p>
            <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, paddingLeft: "16px" }}>
              <li>• Hands-on CARLA / Unreal Engine scenarios</li>
              <li>• Autoware / ROS 2 bridging</li>
              <li>• RTOS configurations for isolation</li>
            </ul>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="https://labs.ev.engineer/"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            data-track-event="cta_click"
            data-track-label="Ongoing vs Completed"
          >
            Ongoing vs Completed
          </a>
          <a
            href="https://carsoftwaresystems.com/#testimonial"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            data-track-event="cta_click"
            data-track-label="More Info & Gallery"
          >
            More Info & Gallery
          </a>
        </div>
      </section>

      <section className="glass-panel" style={{ background: "rgba(10, 23, 18, 0.8)", marginBottom: "64px" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Delivery Models</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h4 style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>Global Remote</h4>
            <p>Interactive virtual labs allowing global engineering teams to standardize their baseline capabilities synchronously.</p>
          </div>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h4 style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>On-Site Immersions</h4>
            <p>Conducted globally or centralized in Singapore, utilizing advanced physical infrastructure over intensive 3 to 5-day sprints.</p>
          </div>
        </div>
      </section>

      <section style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>Ready to upgrade your team?</h2>
        <Link href="/contact" className="btn btn-primary">Inquire About Training Options</Link>
      </section>

    </div>
  );
}
