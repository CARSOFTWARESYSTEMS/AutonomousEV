import Link from "next/link";

export const metadata = {
  title: "AV Design & Development | EV.ENGINEER™",
  description: "End-to-end AV product engineering lifecycle for passenger taxis and airport cargo EVs.",
};

export default function DesignDevelopmentLanding() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>AV Design & Development</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          Understanding the end-to-end engineering lifecycle of autonomous electric platforms.
        </p>
      </header>

      <section className="glass-panel" style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Product Engineering Lifecycle</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "var(--color-text-secondary)" }}>
          {["Product Definition", "→", "Planning", "→", "Feasibility Study", "→", "System Analysis", "→", "Challenges", "→", "Architectural Design", "→", "Development", "→", "Testing", "→", "Deployment"].map((item, i) => (
            <span key={i} style={{ color: item === "→" ? "var(--color-accent)" : "inherit" }}>{item}</span>
          ))}
        </div>
      </section>

      <div className="grid-2">
        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Autonomous Passenger Taxi</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            Urban ride service design. Navigating dense traffic, passenger safety protocols, ITS integration, and urban cybersecurity risks.
          </p>
          <Link href="/design-development/passenger-taxi" className="btn btn-secondary">View Architecture</Link>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-accent)" }}>Autonomous Airport Cargo EV</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            Logistics automation in closed-loop environments. Cargo workflow mapping, geofencing, duty-cycle analysis, and aviation compliance.
          </p>
          <Link href="/design-development/airport-cargo" className="btn btn-secondary">View Architecture</Link>
        </div>
      </div>
    </div>
  );
}
