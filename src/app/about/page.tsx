export const metadata = {
  title: "About | EV.ENGINEER™",
  description: "Learn about iTelematics® and EV.ENGINEER™, building engineering-grade telematics and EV intelligence platforms for fleets, OEMs, and battery-centric mobility systems.",
};

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>About Us</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          iTelematics® builds engineering-grade telematics and EV intelligence platforms for fleets, OEMs, and battery-centric mobility systems.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "80px" }}>
        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>What we build</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-text-secondary)" }}>
            <li>• Telematics engineering for EV fleets</li>
            <li>• Battery analytics + diagnostic workflows</li>
            <li>• Secure-by-design connected systems</li>
            <li>• AI-driven EV battery diagnostics & predictive maintenance</li>
          </ul>
        </div>
        
        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Where we operate</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-text-secondary)" }}>
            <li>• Bangalore, India (HQ)</li>
            <li>• Remote delivery for global customers</li>
            <li>• On-site deployment support in Singapore & globally</li>
          </ul>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>How we work</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-text-secondary)" }}>
            <li>• Architecture-first delivery</li>
            <li>• Production-grade engineering</li>
            <li>• Security + reliability focus</li>
            <li>• Engineering-first delivery approach</li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "32px" }}>Core Capabilities</h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
          {["Cloud Native", "Edge AI", "BMS Protocols", "Cybersecurity", "Full Stack", "Data Science", "Mobile & iOS Engineering", "Simulation Integration"].map((skill) => (
            <span key={skill} style={{ padding: "8px 24px", border: "1px solid var(--color-glass-border)", borderRadius: "var(--radius-pill)", color: "var(--color-text-secondary)", background: "var(--color-glass)" }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
