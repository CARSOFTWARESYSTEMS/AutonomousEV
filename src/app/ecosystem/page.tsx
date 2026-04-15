import Link from "next/link";

export const metadata = {
  title: "AV Ecosystem | EV.ENGINEER™",
  description: "Global Autonomous Vehicle ecosystem landscapes across Singapore, India, Europe, and USA.",
};

export default function EcosystemLanding() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Global AV Ecosystems</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          Understanding the regulatory direction, infrastructure readiness, and competitive landscapes across key global regions.
        </p>
      </header>

      <div className="grid-2" style={{ marginBottom: "64px" }}>
        <div className="glass-panel" style={{ borderTop: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-text-primary)" }}>Singapore</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            A leading smart nation with heavily structured testbeds like CETRAN and highly coordinated government initiatives.
          </p>
          <Link href="/ecosystem/singapore" className="btn btn-secondary">Explore Singapore</Link>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-text-primary)" }}>India</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            A complex, high-chaos environment focusing more on smart mobility services, rural autonomy, and EV transitions.
          </p>
          <Link href="/ecosystem/india" className="btn btn-secondary">Explore India</Link>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-text-primary)" }}>Europe</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            Safety-first regulatory environments, heavily standards-driven (UNECE), with a focus on cross-border logistics.
          </p>
          <Link href="/ecosystem/europe" className="btn btn-secondary">Explore Europe</Link>
        </div>

        <div className="glass-panel">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-text-primary)" }}>USA</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            The pioneer of commercial Robotaxi deployments in states like California and Texas, navigating state vs. federal regulatory fragmentation.
          </p>
          <Link href="/ecosystem/usa" className="btn btn-secondary">Explore USA</Link>
        </div>
      </div>
    </div>
  );
}
