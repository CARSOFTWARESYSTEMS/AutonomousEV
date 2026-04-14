import Link from "next/link";
import React from "react";

export type TopicSection = {
  title: string;
  content: React.ReactNode;
};

export type TopicPageProps = {
  title: string;
  subtitle: string;
  execSummary: React.ReactNode;
  whyItMatters: React.ReactNode;
  basics: React.ReactNode;
  midLevel?: React.ReactNode;
  advanced?: React.ReactNode;
  regionRelevance?: React.ReactNode;
  caseStories?: React.ReactNode;
  simulationArchitecture?: React.ReactNode;
  keyTakeaways?: React.ReactNode;
};

export default function TopicPage({
  title,
  subtitle,
  execSummary,
  whyItMatters,
  basics,
  midLevel,
  advanced,
  regionRelevance,
  caseStories,
  simulationArchitecture,
  keyTakeaways
}: TopicPageProps) {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>{title}</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>{subtitle}</p>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "40px" }}>
        {/* Executive Summary */}
        <section className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-text-primary)" }}>Executive Summary</h2>
          <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{execSummary}</div>
        </section>

        {/* Why it matters */}
        <section>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "24px", color: "var(--color-accent)" }}>Why it matters</h2>
          <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{whyItMatters}</div>
        </section>

        {/* Learning Depth */}
        <div style={{ borderTop: "1px solid var(--color-glass-border)", margin: "24px 0" }}></div>
        
        <section>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "32px" }}>Technical Understanding</h2>
          
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", color: "#60a5fa" }}>Basics</h3>
            <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{basics}</div>
          </div>

          {midLevel && (
            <div className="glass-panel" style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", color: "#f472b6" }}>Mid-Level Engineering</h3>
              <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{midLevel}</div>
            </div>
          )}

          {advanced && (
            <div className="glass-panel" style={{ border: "1px solid rgba(17, 240, 87, 0.3)" }}>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", color: "var(--color-accent)" }}>Advanced View</h3>
              <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{advanced}</div>
            </div>
          )}
        </section>

        {/* Additional Sections */}
        {(regionRelevance || caseStories || simulationArchitecture) && (
          <div style={{ borderTop: "1px solid var(--color-glass-border)", margin: "24px 0" }}></div>
        )}

        {regionRelevance && (
          <section>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Regional Relevance</h2>
            <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{regionRelevance}</div>
          </section>
        )}

        {caseStories && (
          <section>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Real-World Use Cases</h2>
            <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{caseStories}</div>
          </section>
        )}

        {simulationArchitecture && (
          <section>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Simulation & Architecture</h2>
            <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{simulationArchitecture}</div>
          </section>
        )}

        {/* Key Takeaways & CTA */}
        <div style={{ borderTop: "1px solid var(--color-glass-border)", margin: "40px 0" }}></div>

        {keyTakeaways && (
          <section className="glass-panel" style={{ background: "rgba(10, 23, 18, 0.8)" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--color-text-primary)" }}>Key Takeaways</h2>
            <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{keyTakeaways}</div>
          </section>
        )}

        <section style={{ textAlign: "center", marginTop: "40px", padding: "40px 0" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>Advance your engineering capability</h2>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link href="/corporate-training" className="btn btn-primary">Request Training</Link>
            <Link href="/consulting" className="btn btn-secondary">Consulting Services</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
