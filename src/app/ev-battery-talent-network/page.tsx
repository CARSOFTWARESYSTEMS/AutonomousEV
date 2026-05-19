"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { trackEvent } from "@/utils/analytics";
import { useEffect } from "react";

export default function EVBatteryTalentNetwork() {
  useEffect(() => {
    trackEvent("talent_network_page_view", {
      page_title: "EV Battery Talent Intelligence Platform",
      page_path: "/ev-battery-talent-network"
    });
  }, []);

  return (
    <>
      {/* 1. HERO BANNER */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGlow} />
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              EV Battery <br />
              <span className={styles.highlight}>Talent Intelligence</span><br />
              Platform
            </h1>
            <p className={styles.subtitle}>
              Curated and technically validated EV battery specialists, researchers, scientists, engineers, and emerging leaders for lithium-ion battery intelligence systems.
            </p>
            <div className={styles.actions}>
              <a href="mailto:info@iTelematics.com?subject=Find%20EV%20Battery%20Specialists" className="btn btn-primary" data-track-event="talent_network_hero_hire_click">
                Find EV Battery Specialists
              </a>
              <a href="mailto:info@iTelematics.com?subject=Submit%20Hiring%20Requirements" className="btn btn-secondary" data-track-event="talent_network_hero_submit_click">
                Submit Hiring Requirements
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EMPLOYER FLOW & CONTACT */}
      <section className={`section bg-surface`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>For Employers & Hiring Managers</h2>
            <p className={styles.sectionSubtitle}>
              Gain exclusive access to our premium curated EV Battery talent intelligence ecosystem.
              Share your requirements with us to receive validated profiles.
            </p>
          </div>
          <div className={styles.contactBox}>
            <h3 style={{ fontSize: "1.75rem", color: "#fff", marginBottom: "24px" }}>Start Hiring Premium Talent</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.1rem" }}>
              Our profiles are not publicly exposed. We use a deep technical validation approach to maintain premium quality standards.
            </p>
            <div className={styles.contactMethod}>
              Email: <a href="mailto:info@iTelematics.com" data-track-event="talent_network_email_click">info@iTelematics.com</a>
            </div>
            <div className={styles.contactMethod}>
              Phone: <a href="tel:+919108206147" data-track-event="talent_network_phone_click">+91 91082 06147</a>
            </div>
            <div className={styles.companyInfo}>
              <strong>iTelematics Software Private Limited</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TALENT CATEGORIES (CANDIDATE MODEL) */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Talent Categories</h2>
            <p className={styles.sectionSubtitle}>
              Curated professionals strictly verified across the core EV Battery and embedded engineering stack.
            </p>
          </div>
          <div className={styles.grid2}>
            
            <div className={styles.candidateCard}>
              <div className={styles.candidateTier}>Platinum Tier</div>
              <h3 className={styles.candidateTitle}>Platinum Battery Leaders</h3>
              <p className={styles.candidateLocation}>📍 Global / Remote / Relocation</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                Scientists, Researchers, Architects, and Senior technical experts with proven track records in next-generation battery technologies.
              </p>
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem" }}>Example: "Battery Thermal Systems Researcher — Platinum Battery Leader"</p>
            </div>

            <div className={styles.candidateCard}>
              <div className={styles.candidateTier}>Gold Tier</div>
              <h3 className={styles.candidateTitle}>Battery Intelligence Specialists</h3>
              <p className={styles.candidateLocation}>📍 Global / Relocation</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                Specialized in AI, Battery Diagnostics, Advanced BMS, Thermal Intelligence, and Battery Analytics.
              </p>
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem" }}>Example: "Battery Diagnostics Engineer — Gold Tier"</p>
            </div>

            <div className={styles.candidateCard}>
              <div className={styles.candidateTier}>Verified Tier</div>
              <h3 className={styles.candidateTitle}>Verified Battery Engineers</h3>
              <p className={styles.candidateLocation}>📍 Global / India Hubs</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                Validated battery engineers with practical skill validation in embedded systems, BMS testing, and battery pack development.
              </p>
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.9rem" }}>Example: "Battery AI Engineer — Bangalore — Verified Battery Specialist"</p>
            </div>

            <div className={styles.candidateCard}>
              <div className={styles.candidateTier}>Emerging Tier</div>
              <h3 className={styles.candidateTitle}>Emerging Battery Leaders</h3>
              <p className={styles.candidateLocation}>📍 Pan India</p>
              <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                Interns, Freshers, Students, and Researchers trained in production-grade concepts from our own simulation and diagnostic tracks.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. VALIDATION CHECKLIST */}
      <section className="section bg-surface">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Deep Technical Validation</h2>
            <p className={styles.sectionSubtitle}>
              EV.ENGINEER™ follows a deep technical validation approach to maintain premium quality standards.
            </p>
          </div>
          <div className={styles.contactBox} style={{ background: "var(--glass-bg)", textAlign: "left", maxWidth: "800px" }}>
            <ul className={styles.validationList}>
              <li className={styles.validationItem}><strong>Resume Review:</strong> Strict filtering for relevant EV battery domain experience.</li>
              <li className={styles.validationItem}><strong>Live Technical Interviews:</strong> Conducted by seasoned EV and embedded architects.</li>
              <li className={styles.validationItem}><strong>Practical Assessments:</strong> Hands-on testing in simulation environments, diagnostics, and data analytics.</li>
              <li className={styles.validationItem}><strong>Architecture Discussions:</strong> Evaluating the ability to design safe, scalable, and thermal-aware battery systems.</li>
              <li className={styles.validationItem}><strong>GitHub & Project Review:</strong> Deep dive into code quality, logic, and hardware-software integration capabilities.</li>
              <li className={styles.validationItem}><strong>Research Validation:</strong> Peer review of published papers and theoretical understanding for R&D roles.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. SKILLS & CORE COMPETENCIES */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Core Competency Focus Areas</h2>
            <p className={styles.sectionSubtitle}>
              We source, validate, and curate talent exclusively for these high-demand EV Battery engineering domains.
            </p>
          </div>
          <div className={styles.grid3}>
            <div className="glass-panel">
              <h3 className={styles.candidateTitle}>Intelligence & AI</h3>
              <ul className={styles.validationList} style={{ marginTop: "16px" }}>
                <li className={styles.validationItem}>Battery AI Engineer</li>
                <li className={styles.validationItem}>Battery Data Analytics Engineer</li>
                <li className={styles.validationItem}>Battery Diagnostics Engineer</li>
              </ul>
            </div>
            <div className="glass-panel">
              <h3 className={styles.candidateTitle}>Core Engineering</h3>
              <ul className={styles.validationList} style={{ marginTop: "16px" }}>
                <li className={styles.validationItem}>BMS Engineer</li>
                <li className={styles.validationItem}>Battery Embedded Systems Engineer</li>
                <li className={styles.validationItem}>Battery Pack Development Engineer</li>
              </ul>
            </div>
            <div className="glass-panel">
              <h3 className={styles.candidateTitle}>Safety & Research</h3>
              <ul className={styles.validationList} style={{ marginTop: "16px" }}>
                <li className={styles.validationItem}>Battery Thermal Systems Engineer</li>
                <li className={styles.validationItem}>Battery Validation Engineer</li>
                <li className={styles.validationItem}>Battery Cybersecurity Engineer</li>
              </ul>
            </div>
            <div className="glass-panel" style={{ gridColumn: "1 / -1", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
              <h3 className={styles.candidateTitle}>Lifecycle & Innovation</h3>
              <ul className={styles.validationList} style={{ marginTop: "16px", textAlign: "left", display: "inline-block" }}>
                <li className={styles.validationItem}>Second-Life Battery Systems Engineer</li>
                <li className={styles.validationItem}>Battery Research Scientist</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
