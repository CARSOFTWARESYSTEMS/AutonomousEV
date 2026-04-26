import Link from "next/link";
import styles from "./about.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | EV.ENGINEER™",
  description: "EV.ENGINEER™ is a next-generation engineering platform focused on building intelligent, safe, and scalable energy systems for the future of electric mobility.",
};

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      {/* Header Section */}
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "16px", fontWeight: "800", color: "#fff" }}>EV.ENGINEER™</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--accent-primary)", fontWeight: "400", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "64px" }}>
          Building <strong>World-Class Engineers</strong> to Solve <strong>Energy</strong> and <strong>EV Battery</strong> Challenges
        </p>
      </div>

      {/* Mission & Vision */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginBottom: "80px" }}>
        <div style={{ flex: "1 1 400px", background: "var(--glass-bg)", padding: "3rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "16px", color: "var(--accent-primary)", fontWeight: "800" }}>Our Mission</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--text-secondary)", fontStyle: "italic" }}>
            "To build world-class engineers and develop intelligent energy systems that ensure safety, reliability, and sustainability in electric mobility."
          </p>
        </div>
        <div style={{ flex: "1 1 400px", background: "var(--glass-bg)", padding: "3rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "16px", color: "var(--accent-primary)", fontWeight: "800" }}>Our Vision</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--text-secondary)", fontStyle: "italic" }}>
            "To eliminate EV battery failures and enable a future powered by safe, intelligent, and autonomous energy systems."
          </p>
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "64px" }}>
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "var(--accent-primary)", fontWeight: "700" }}>What we build</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-secondary)", listStyle: "none", padding: 0 }}>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> EV Battery Intelligence Platform</li>
          </ul>
        </div>
        
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "var(--accent-primary)", fontWeight: "700" }}>Our Focus</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-secondary)", listStyle: "none", padding: 0 }}>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> EV Battery Technology</li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> EV Battery Safety &amp; Security</li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> AI/ML for Energy Systems</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "var(--accent-primary)", fontWeight: "700" }}>How we work</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-secondary)", listStyle: "none", padding: 0 }}>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> Engineering-first approach</li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> Problem-driven innovation</li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> Simulation + real-world validation</li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> Safety-first system design</li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--accent-primary)" }}>→</span> Scalable and production-ready architectures</li>
          </ul>
        </div>
      </div>



      {/* Core Capabilities */}
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "32px", fontWeight: "700" }}>Core Capabilities</h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", maxWidth: "800px", margin: "0 auto" }}>
          {["EV Systems Engineering", "Battery Diagnostics & Analytics", "AI & Machine Learning", "Embedded Systems & BMS", "Cloud & Edge AI", "Simulation & Digital Twin", "Cybersecurity for EV"].map((skill) => (
            <span key={skill} style={{ padding: "10px 24px", border: "1px solid var(--accent-primary)", borderRadius: "var(--radius-pill)", color: "#fff", background: "rgba(76, 169, 48, 0.1)", fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.02em" }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Platform Approach */}
      <div style={{ textAlign: "center", marginBottom: "80px", maxWidth: "800px", margin: "0 auto 80px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "24px", fontWeight: "700", color: "var(--accent-primary)" }}>Platform Approach</h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-secondary)", marginBottom: "24px" }}>
          <strong>EV.ENGINEER™</strong> operates as a platform that integrates:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "32px" }}>
          {["Research", "Engineering", "Training", "Real-world deployment"].map((item) => (
            <span key={item} style={{ padding: "12px 24px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontWeight: "600" }}>
              {item}
            </span>
          ))}
        </div>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          This enables continuous innovation while building a strong ecosystem of engineers and solutions.
        </p>
      </div>

      {/* Founder Section */}
      <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", borderTop: "2px solid var(--accent-primary)", maxWidth: "800px", margin: "0 auto 80px" }}>
        <h2 style={{ fontSize: "1.2rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>Founder</h2>
        <p style={{ fontSize: "2rem", fontWeight: "800", color: "#fff", marginBottom: "0.25rem" }}>Sudarshana Karkala</p>
        <p style={{ fontSize: "1rem", color: "var(--accent-primary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>EV.ENGINEER™</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link href="/about/sudarshana-karkala" className="btn btn-primary">View Profile</Link>
          <a href="https://www.linkedin.com/in/sudarshanakarkala/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">LinkedIn</a>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--glass-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "16px", fontWeight: "800" }}>Ready to Shape the Future?</h2>
        <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
          Join <strong>EV.ENGINEER™</strong> to build, learn, and contribute to the future of electric mobility.
        </p>
        <Link href="/contact" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>Connect With Us</Link>
      </div>

    </div>
  );
}
