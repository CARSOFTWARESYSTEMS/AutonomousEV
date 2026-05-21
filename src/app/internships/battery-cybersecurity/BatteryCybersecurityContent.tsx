"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ShieldAlert, ShieldCheck, Lock, Server, Cpu, Database,
  Network, GitBranch, Activity, Terminal, Search, Award,
  TrendingUp, Briefcase, KeyRound, RefreshCw, FileText, Brain,
  ChevronRight, Laptop, Users, Calendar, AlertTriangle
} from "lucide-react";
import styles from "./page.module.css";

// --- DATA STRUCTURES ---

const SPECIALIZATIONS = [
  {
    title: "Battery Intrusion Detection",
    desc: "AI-driven anomaly detection for battery systems to identify adversarial signals, CAN spoofing, and malicious telemetry injections.",
    icon: ShieldAlert
  },
  {
    title: "Battery Telemetry Security",
    desc: "Implementing secure telemetry pipelines, packet filtering, and data integrity verification for EV battery communications.",
    icon: Network
  },
  {
    title: "BMS Threat Detection",
    desc: "Detect and mitigate attacks targeting physical Battery Management Systems, memory safety, and hardware bus protocols.",
    icon: Cpu
  },
  {
    title: "Secure Battery Identity",
    desc: "Developing cryptographically encrypted, tamper-evident battery digital identifiers for life-cycle traceability.",
    icon: KeyRound
  },
  {
    title: "OTA Security",
    desc: "Designing secure over-the-air firmware updates, verification pipelines, signing configurations, and rollback protection.",
    icon: RefreshCw
  },
  {
    title: "AI-Based Threat Intelligence",
    desc: "Developing agentic AI threat monitors, analysis loops, and protection structures against prompt injection and data poisoning.",
    icon: Brain
  },
  {
    title: "Battery Threat Analytics",
    desc: "Threat analytics, event correlation, and signature detection models built specifically for EV battery fleet ecosystems.",
    icon: Activity
  },
  {
    title: "Cloud Security for Battery Systems",
    desc: "Securing APIs, cloud endpoints, microservices, and databases housing telemetry data from unauthorized access.",
    icon: Server
  },
  {
    title: "Quantum-Ready Telemetry Security",
    desc: "Future-ready secure telemetry configurations utilizing Post-Quantum Cryptography (PQC) simulation principles.",
    icon: Lock
  }
];

const ROLES = [
  "EV Battery Cybersecurity Engineer",
  "Battery Intelligence Security Researcher",
  "Automotive Cybersecurity Engineer",
  "Secure OTA Engineer",
  "Battery Threat Intelligence Analyst",
  "Battery Intrusion Detection Engineer",
  "Product Security Engineer – EV / IoT / Cloud",
  "AI Security Engineer for EV Systems",
  "BMS Security Engineer",
  "EV Security Validation Engineer"
];

const ROADMAP_MONTHS = [
  {
    month: "MONTH 1",
    title: "Foundations & Threat Modeling",
    desc: "Master EV battery and intelligence platform fundamentals. Dive into cybersecurity basics, Linux operations, security scripts in Python 3.12, and outline your first battery-centric Threat Model.",
    deliverable: "Initial threat model & Linux engineering environment setup."
  },
  {
    month: "MONTH 2",
    title: "Secure Battery Telemetry",
    desc: "Learn details of secure telemetry flow. Practice setting up MQTT secure connections, implementing API authorization controls, validating data integrity, and building a secure battery status visualizer.",
    deliverable: "Secure telemetry POC & dashboard."
  },
  {
    month: "MONTH 3",
    title: "BMS Threats & Attack Simulation",
    desc: "Simulate CAN bus spoofing, OBD-II data manipulation, and BLE communication vulnerabilities. Construct real attack vector simulations to capture and analyze data anomalies.",
    deliverable: "Simulated attack datasets & intrusion simulation log."
  },
  {
    month: "MONTH 4",
    title: "Battery Intrusion Detection System",
    desc: "Build AI-driven anomaly detection models using Scikit-learn and PyTorch. Train models to classify threats and display telemetry alerts on a Streamlit analytics dashboard.",
    deliverable: "AI intrusion detection engine & live security monitoring dashboard."
  },
  {
    month: "MONTH 5",
    title: "Red Teaming & Threat Analysis",
    desc: "Adopt an offensive mindset. Launch red-team attacks on APIs and simulated telemetry feeds, document vulnerabilities, and map threat intelligence profiles.",
    deliverable: "Red team testing report & EV battery threat intelligence audit."
  },
  {
    month: "MONTH 6",
    title: "Cloud Security & Containerization",
    desc: "Architect a hardened cloud telemetry backend using FastAPI and Docker. Implement secure Firebase authorization layers and container isolation settings.",
    deliverable: "Hardened FastAPI cloud backend & container security profiles."
  },
  {
    month: "MONTH 7",
    title: "Secure Battery Identity",
    desc: "Develop cryptographically signed digital identities for cells and packs. Integrate hashing, signature verification, and secure physical QR/NFC link mechanisms.",
    deliverable: "Secure battery identity token verification system."
  },
  {
    month: "MONTH 8",
    title: "Secure OTA Updates",
    desc: "Design software update workflows matching UNECE R156. Implement cryptographic firmware signatures, validation checklists, and automatic rollback protections.",
    deliverable: "Secure OTA update simulator & firmware verification POC."
  },
  {
    month: "MONTH 9",
    title: "AI Threat Intelligence Agents",
    desc: "Deploy LangChain/LangGraph autonomous agents for security telemetry parsing, prompt-injection testing, and diagnostic threat mitigation workflows.",
    deliverable: "AI threat monitoring agent & RAG security validation POC."
  },
  {
    month: "MONTH 10",
    title: "Quantum-Ready Telemetry Security",
    desc: "Explore Post-Quantum Cryptography (PQC) concepts. Use Kyber and Dilithium simulator libraries to encrypt telemetry streams, preparing battery fleets for the post-quantum era.",
    deliverable: "Post-Quantum Cryptography telemetry protection prototype."
  },
  {
    month: "MONTH 11",
    title: "Tesla-Style Interview Prep I",
    desc: "Focus on battery security systems design, threat architectures, secure coding audits, and resume polishing aimed at top-tier EV and automotive companies.",
    deliverable: "Secured portfolio architecture presentation & resume review."
  },
  {
    month: "MONTH 12",
    title: "Tesla-Style Interview Prep II",
    desc: "Participate in intensive technical mock interviews, present your final battery security portfolio code, and finalize your research thesis/engineering diary.",
    deliverable: "Final project demo presentation, portfolio, and research showcase."
  }
];

const STANDARDS = [
  { title: "ISO/SAE 21434", desc: "Road vehicles — Cybersecurity engineering standard governing the entire lifecycle." },
  { title: "UNECE R155", desc: "Cybersecurity Management System (CSMS) regulation for vehicle type approvals." },
  { title: "UNECE R156", desc: "Software Update and Software Update Management System (SUMS) regulation." },
  { title: "OWASP API Top 10", desc: "Security patterns for hardening battery cloud APIs and data integrations." },
  { title: "MQTT Security", desc: "Transport-layer encryption (TLS), client certs, and topic-level ACLs." },
  { title: "BLE Security", desc: "Secure pairing, bonding, and encryption key exchange in physical battery tags." },
  { title: "CAN & OBD-II Security", desc: "Protection profiles for legacy and next-gen vehicle communication networks." },
  { title: "TLS / PKI / Crypto", desc: "Public Key Infrastructures, certificate chains, and trusted platform modules." },
  { title: "NIST PQC Standards", desc: "Post-quantum cryptosystems (Kyber, Dilithium) for future-ready security." }
];

// --- COMPONENT ---

const TimelineNode = ({ month, index }: { month: any; index: number }) => {
  const ref = useRef(null);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`${styles.timelineNode} ${isEven ? styles.timelineNodeEven : styles.timelineNodeOdd}`}
    >
      <div className={styles.timelineContent}>
        <div className={styles.timelineCard}>
          <div className={styles.timelineLabel}>{month.month}</div>
          <h3 className={styles.timelineTitle}>{month.title}</h3>
          <p className={styles.timelineDesc}>{month.desc}</p>
          <div className={styles.timelineDeliverable}>
            <div className={styles.timelineDeliverableTitle}>Key Deliverable</div>
            <div className={styles.timelineDeliverableText}>{month.deliverable}</div>
          </div>
        </div>
      </div>

      <div className={styles.timelineAxisNode}>
        <div className={styles.timelineAxisDot} />
      </div>

      <div className={styles.timelineEmpty} />
    </div>
  );
};

export default function BatteryCybersecurityContent() {
  const roadmapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: roadmapRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div style={{ backgroundColor: "var(--bg-dark)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ═══ 1. HERO SECTION ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <span>CYBERSECURITY SPECIALIZATION</span>
          </div>

          <h1 className={styles.heroTitle}>
            EV Battery Intelligence <br />
            <span className="glowing-text">Security Platform</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Elite Specialized EV Battery Cybersecurity Engineering Internship
          </p>

          <p className={styles.heroDesc}>
            A rigorous 12-month industry-style internship focused on building EV Battery Cybersecurity Engineers & Researchers.
            Design, secure, and validate an AI-driven, quantum-ready EV battery telemetry and control security architecture.
          </p>

          <div className={styles.heroCtas}>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20applying%20for%20the%20EV%20Battery%20Cybersecurity%20Engineering%20Internship."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-track-event="cybersecurity_hero_apply_click"
              data-track-location="hero"
            >
              Apply for Internship →
            </a>
            <a
              href="#roadmap"
              className="btn btn-secondary"
              data-track-event="cybersecurity_hero_roadmap_click"
              data-track-location="hero"
            >
              View 12-Month Roadmap →
            </a>
            <a
              href="#why-cybersecurity"
              className="btn btn-secondary"
              style={{ background: "var(--glass-bg)" }}
              data-track-event="cybersecurity_hero_explore_click"
              data-track-location="hero"
            >
              Explore Platform →
            </a>
          </div>
        </div>
      </section>

      {/* ═══ 2. WHY THIS INTERNSHIP ═══ */}
      <section className={styles.pageSectionAlt} id="why-cybersecurity">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>WHY EV BATTERY CYBERSECURITY</span>
            <h2 className={styles.sectionTitle}>Why EV Battery Cybersecurity Matters</h2>
            <p className={styles.sectionSubtitle}>
              Modern EVs are connected software-defined energy systems. Future EV platforms continuously exchange battery intelligence data, exposing critical telemetry pipelines to high-stakes cyber risks.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <ShieldAlert size={24} />
              </div>
              <h3 className={styles.cardTitle}>Vulnerability Points</h3>
              <p className={styles.cardDesc}>
                Battery systems exchange gigabytes of telemetry data with cloud platforms. Malicious actors targeting these interfaces can spoof telemetry, inject false SOH/SOC states, override BMS limits, or disrupt fleets via API attacks.
              </p>
              <ul className={styles.list}>
                <li>Telemetry data tampering and battery state spoofing</li>
                <li>OTA update hijacking and malicious firmware execution</li>
                <li>BMS calibration alterations leading to thermal incidents</li>
                <li>AI prompt injections altering charging schedule heuristics</li>
              </ul>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <ShieldCheck size={24} />
              </div>
              <h3 className={styles.cardTitle}>Our Core Focus</h3>
              <p className={styles.cardDesc}>
                This internship doesn't teach generic penetration testing. It focuses strictly on engineering security controls for EV power systems, secure diagnostics communication, physical threat isolation, and post-quantum encryption protocols.
              </p>
              <ul className={styles.list}>
                <li>Building secure MQTT/FastAPI telematics brokers</li>
                <li>Designing cryptographically secure digital battery identities</li>
                <li>Integrating machine learning threat-classification pipelines</li>
                <li>Developing fallback firmware architectures for secure updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. SPECIALIZATION AREAS ═══ */}
      <section className={styles.pageSection} id="specializations">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>SPECIALIZATION TRACKS</span>
            <h2 className={styles.sectionTitle}>Core Cybersecurity Specializations</h2>
            <p className={styles.sectionSubtitle}>
              Deep dive into specialized sub-domains covering modern telematics, threat containment, and intelligence workflows.
            </p>
          </div>

          <div className={styles.grid3}>
            {SPECIALIZATIONS.map((spec, i) => (
              <div className={styles.card} key={i}>
                <div className={styles.cardIcon}>
                  <spec.icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{spec.title}</h3>
                <p className={styles.cardDesc}>{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. WHO SHOULD APPLY & PREREQS ═══ */}
      <section className={styles.pageSectionAlt} id="who-should-apply">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>TARGET STUDENTS</span>
            <h2 className={styles.sectionTitle}>Who Should Apply</h2>
            <p className={styles.sectionSubtitle}>
              This program is designed for dedicated learners aiming to step into premium automotive, hardware security, or secure DevOps roles.
            </p>
          </div>

          <div className={styles.prereqContainer}>
            <div className={styles.prereqBlock}>
              <h3 className={styles.prereqTitle}>
                <span>👤</span> Target Candidates
              </h3>
              <ul className={styles.prereqList}>
                <li>Cybersecurity majors eager to specialize in IoT/Automotive</li>
                <li>Python developers interested in hardware/protocol security</li>
                <li>Electric Vehicle enthusiasts with strong software aptitudes</li>
                <li>Aspiring Security Researchers & Product Security Engineers</li>
                <li><strong>Optional:</strong> BE/BTech/MTech students and freshers</li>
              </ul>
            </div>

            <div className={styles.prereqBlock}>
              <h3 className={styles.prereqTitle}>
                <span>⚠️</span> Prerequisites
              </h3>
              <ul className={styles.prereqList}>
                <li><strong>Mandatory:</strong> Basic Python knowledge and interest in cybersecurity</li>
                <li><strong>Mandatory:</strong> Willingness to dedicate minimum 15 hours/week</li>
                <li><strong>Good To Have:</strong> Understanding of Linux commands, networking, and APIs</li>
                <li><strong>Good To Have:</strong> General awareness of battery physics and AI/ML models</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. CAREER OUTCOMES ═══ */}
      <section className={styles.pageSection} id="career-outcomes">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>CAREER OUTCOME</span>
            <h2 className={styles.sectionTitle}>What Students Become After Internship</h2>
            <p className={styles.sectionSubtitle}>
              Acquire highly marketable engineering skill sets that bridge the gap between software security and automotive hardware design.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {ROLES.map((role, i) => (
              <div className={styles.companyChip} style={{ padding: "12px 24px" }} key={i}>
                <span style={{ color: "var(--accent-primary)", marginRight: "8px" }}>✦</span>
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. TARGET COMPANIES ═══ */}
      <section className={styles.pageSectionAlt} id="target-companies">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>INDUSTRY ALIGNMENT</span>
            <h2 className={styles.sectionTitle}>Target Industry & Companies</h2>
            <p className={styles.sectionSubtitle}>
              Our curriculum aligns with the rigorous security standards enforced by premier electric mobility, battery manufacturing, and cybersecurity firms.
            </p>
          </div>

          <div className={styles.companyCategory}>
            <h3 className={styles.companyTitle}>EV & Automotive</h3>
            <div className={styles.companyChips}>
              {["Tesla", "BYD", "Rivian", "Lucid Motors", "Bosch", "Continental", "BlackBerry QNX", "Qualcomm Automotive"].map((c, i) => (
                <div className={styles.companyChip} key={i}>{c}</div>
              ))}
            </div>
          </div>

          <div className={styles.companyCategory}>
            <h3 className={styles.companyTitle}>Cybersecurity Leaders</h3>
            <div className={styles.companyChips}>
              {["Fortinet", "Palo Alto Networks", "CrowdStrike", "Zscaler", "VicOne", "Upstream Security"].map((c, i) => (
                <div className={styles.companyChip} key={i}>{c}</div>
              ))}
            </div>
          </div>

          <div className={styles.companyCategory}>
            <h3 className={styles.companyTitle}>Battery & Energy Platforms</h3>
            <div className={styles.companyChips}>
              {["CATL", "LG Energy Solution", "Panasonic Energy", "Samsung SDI"].map((c, i) => (
                <div className={styles.companyChip} key={i}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. TECHNOLOGY STACK ═══ */}
      <section className={styles.pageSection} id="tech-stack">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>TECH STACK</span>
            <h2 className={styles.sectionTitle}>Industry-Grade Cybersecurity Stack</h2>
            <p className={styles.sectionSubtitle}>
              Work on open-source, industry-standard simulation toolchains, virtualization utilities, and security suites.
            </p>
          </div>

          <div className={styles.grid4}>
            <div className={styles.techCategoryCard}>
              <h3 className={styles.techCategoryTitle}>Programming & AI</h3>
              <div className={styles.techBadgeList}>
                {["Python 3.12", "Scikit-learn", "PyTorch Basics", "LangChain", "LangGraph", "ChromaDB"].map((t, i) => (
                  <span className={styles.techBadge} key={i}>{t}</span>
                ))}
              </div>
            </div>

            <div className={styles.techCategoryCard}>
              <h3 className={styles.techCategoryTitle}>Infrastructure & APIs</h3>
              <div className={styles.techBadgeList}>
                {["FastAPI", "Docker", "Linux VM", "MQTT Brokers", "Firebase Free Tier", "Streamlit"].map((t, i) => (
                  <span className={styles.techBadge} key={i}>{t}</span>
                ))}
              </div>
            </div>

            <div className={styles.techCategoryCard}>
              <h3 className={styles.techCategoryTitle}>Security & Analysis</h3>
              <div className={styles.techBadgeList}>
                {["Kali Linux", "Wireshark", "OWASP ZAP", "Postman", "OpenSSL", "NIST PQC Libs"].map((t, i) => (
                  <span className={styles.techBadge} key={i}>{t}</span>
                ))}
              </div>
            </div>

            <div className={styles.techCategoryCard}>
              <h3 className={styles.techCategoryTitle}>Simulators & Bus</h3>
              <div className={styles.techBadgeList}>
                {["PyBaMM", "CAN Simulator", "OBD-II Simulator", "BLE Simulator"].map((t, i) => (
                  <span className={styles.techBadge} key={i}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. STANDARDS & PROTOCOLS ═══ */}
      <section className={styles.pageSectionAlt} id="standards">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>STANDARDS & PROTOCOLS</span>
            <h2 className={styles.sectionTitle}>EV Cybersecurity Standards Covered</h2>
            <p className={styles.sectionSubtitle}>
              Acquire hands-on familiarity with safety compliance models and regulatory frameworks driving the global electric transport market.
            </p>
          </div>

          <div className={styles.grid3}>
            {STANDARDS.map((std, i) => (
              <div className={styles.card} key={i}>
                <div className={styles.cardIcon}>
                  <ShieldCheck size={24} />
                </div>
                <h3 className={styles.cardTitle}>{std.title}</h3>
                <p className={styles.cardDesc}>{std.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. 12 MONTH ROADMAP ═══ */}
      <section className={styles.pageSection} id="roadmap" ref={roadmapRef}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>12-MONTH EXECUTION PLAN</span>
            <h2 className={styles.sectionTitle}>Month-by-Month Internship Roadmap</h2>
            <p className={styles.sectionSubtitle}>
              A comprehensive structured milestone plan focused on practical engineering deliverables and weekly iterations.
            </p>
          </div>

          <div className={styles.timelineContainer}>
            {/* Background center line */}
            <div className={styles.timelineLine} />

            {/* Animated center line */}
            <motion.div
              className={styles.timelineAnimatedLine}
              style={{ scaleY }}
            />

            {ROADMAP_MONTHS.map((m, i) => (
              <TimelineNode key={i} month={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10. WEEKLY EXECUTION MODEL ═══ */}
      <section className={styles.pageSectionAlt} id="weekly-execution">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>WEEKLY STRUCTURE</span>
            <h2 className={styles.sectionTitle}>15 Hours Per Week Execution</h2>
            <p className={styles.sectionSubtitle}>
              Balanced weekly schedule divided between engineering execution, secure coding analysis, and interview preparation.
            </p>
          </div>

          <div className={styles.weeklyTableContainer}>
            <table className={styles.weeklyTable}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Hours Allocation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Theory + Standards + Security Architecture</td>
                  <td>3 Hours</td>
                </tr>
                <tr>
                  <td>Hands-on Labs / Secure POC Implementations</td>
                  <td>4 Hours</td>
                </tr>
                <tr>
                  <td>Ethical Hacking / Red Team Simulations</td>
                  <td>3 Hours</td>
                </tr>
                <tr>
                  <td>Secure Product Design &amp; DevOps Engineering</td>
                  <td>3 Hours</td>
                </tr>
                <tr>
                  <td>Tesla-Style Interview Prep &amp; System Design</td>
                  <td>1 Hour</td>
                </tr>
                <tr>
                  <td>Engineering Diary &amp; Project Documentation</td>
                  <td>1 Hour</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ 11. MONTHLY REVIEW CYCLE & CERTIFICATIONS ═══ */}
      <section className={styles.pageSection} id="reviews-certs">
        <div className="container">
          <div className={styles.grid2}>
            {/* Reviews */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Award size={24} />
              </div>
              <h3 className={styles.cardTitle}>Industry-Style Monthly Reviews</h3>
              <p className={styles.cardDesc}>
                Every month ends with a design and code review simulating a real automotive corporate ecosystem:
              </p>
              <ul className={styles.list}>
                <li>Threat Model &amp; Secure Architecture Review</li>
                <li>Git Commit Logs &amp; Static Code Analysis Review</li>
                <li>Simulated Red Team Exploitation Walkthroughs</li>
                <li>Engineering Diary &amp; Technical Presentation audits</li>
                <li>One-on-One Technical Mock Interviews</li>
              </ul>
            </div>

            {/* Certifications */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <TrendingUp size={24} />
              </div>
              <h3 className={styles.cardTitle}>Recommended Certifications</h3>
              <p className={styles.cardDesc}>
                Students are mentored and prepared to clear at least one of these professional credentials during their internship tenure:
              </p>
              <ul className={styles.list}>
                <li>Automotive Cybersecurity Fundamentals (ISO 21434)</li>
                <li>CompTIA Security+</li>
                <li>API Security Fundamentals (OWASP)</li>
                <li>Cloud Security Fundamentals (Firebase/AWS)</li>
                <li>IEEE Automotive Systems Security Credentials</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 12. FINAL DELIVERABLES & FORMAT ═══ */}
      <section className={styles.pageSectionAlt} id="deliverables">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>FINAL OUTPUT & MODEL</span>
            <h2 className={styles.sectionTitle}>Internship Model & Deliverables</h2>
            <p className={styles.sectionSubtitle}>
              Build a comprehensive, demonstrable portfolio verifying your engineering and research accomplishments.
            </p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>What You Build</h3>
              <p className={styles.cardDesc}>
                Maintain a clean public GitHub portfolio compiling actual security modules:
              </p>
              <ul className={styles.list}>
                <li>Comprehensive Threat Model &amp; System Architecture docs</li>
                <li>AI intrusion detection engine &amp; classification models</li>
                <li>Cryptographic Battery Identity generation pipelines</li>
                <li>Secure OTA firmware signing update scripts</li>
                <li>Quantum-safe telematics encryption simulators</li>
                <li>Weekly engineering diaries and code documentation</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Structured Internship Format</h3>
              <p className={styles.cardDesc}>
                This is not a generic tutorial-watching course. It is an engineering simulation.
              </p>
              <ul className={styles.list}>
                <li><strong>Continuous Build Cycle:</strong> Weekly coding sprints.</li>
                <li><strong>Attack &amp; Defend:</strong> Red vs Blue team exercises.</li>
                <li><strong>Standards Aligned:</strong> Code conforms to ISO 21434 profiles.</li>
                <li><strong>Public Portfolios:</strong> Code and research logs published regularly.</li>
                <li><strong>Mock Prep:</strong> Bi-weekly interview training sessions.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 13. FEE STRUCTURE ═══ */}
      <section className={styles.pageSection} id="pricing-plans">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>FEE STRUCTURE</span>
            <h2 className={styles.sectionTitle}>Training & Internship Plans</h2>
            <p className={styles.sectionSubtitle}>
              Select the option that aligns with your educational path and residency status.
            </p>
          </div>

          <div className={styles.pricingContainer}>
            {/* Online */}
            <div className={styles.pricingCard}>
              <div className={styles.pricingLabel}>REMOTE MENTORSHIP</div>
              <h3 className={styles.pricingTitle}>Online Plan</h3>
              <div className={styles.pricingPrice}>
                ₹20,000<span>/month + GST</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeatureItem}>1-on-1 Remote Architecture guidance</li>
                <li className={styles.pricingFeatureItem}>Weekly Code &amp; Security review logs</li>
                <li className={styles.pricingFeatureItem}>Online mock interview prep &amp; portfolio audits</li>
                <li className={styles.pricingFeatureItem}>Automated evaluation suite access</li>
                <li className={styles.pricingFeatureItem}>Thesis and research diary mentoring</li>
              </ul>
              <a
                href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20the%20Online%20EV%20Battery%20Cybersecurity%20Internship%20plan."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ marginTop: "auto", width: "100%" }}
                data-track-event="cybersecurity_apply_online_click"
              >
                Enroll Online Plan
              </a>
            </div>

            {/* In-Person Workspace */}
            <div className={styles.pricingWorkspaceCard}>
              <div className={styles.pricingLabel}>BANGALORE HUB ONLY</div>
              <h3 className={styles.pricingTitle}>Workspace Plan</h3>
              <div className={styles.pricingPrice}>
                ₹30,000<span>/month + GST</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li className={styles.pricingFeatureItem}>20 days/month physical workspace access</li>
                <li className={styles.pricingFeatureItem}>Direct in-person mentoring and reviews</li>
                <li className={styles.pricingFeatureItem}>Access to hardware/BMS test benches</li>
                <li className={styles.pricingFeatureItem}>In-person mock panel interviews</li>
                <li className={styles.pricingFeatureItem}>All benefits of the Online Plan</li>
              </ul>
              <a
                href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20the%20Workspace%20EV%20Battery%20Cybersecurity%20Internship%20plan."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ marginTop: "auto", width: "100%" }}
                data-track-event="cybersecurity_apply_workspace_click"
              >
                Enroll Workspace Plan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 14. DISCLAIMER SECTION ═══ */}
      <section className={styles.pageSectionAlt} id="disclaimer">
        <div className="container">
          <div className={styles.disclaimerBlock}>
            <p style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#FF4D4D", marginBottom: "1rem" }}>
              <AlertTriangle size={20} /> IMPORTANT DISCLAIMER
            </p>
            <p>
              This internship is a rigorous <strong>educational mentorship program</strong>. EV.ENGINEER™ provides training, architecture guidance, portfolio preparation, and mock interview setups; we <strong>do not guarantee jobs or external corporate placements</strong>. Career progression depends on candidate dedication and performance.
            </p>
            <p>
              <strong>Ethical Cybersecurity Use:</strong> Penetration testing, threat execution, and payload simulations must only be conducted in closed local lab environments. Testing or attacking external networks, vehicles, infrastructure, or third-party APIs without authorization is strictly prohibited.
            </p>
            <p>
              All IP-sensitive datasets and advanced proprietary codebase sections developed by industry partners will remain isolated. Public portfolio entries must filter out restricted database strings and configuration files.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 15. FOOTER CTA ═══ */}
      <section className={styles.pageSection} style={{ textAlign: "center", paddingBottom: "8rem" }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Build the Future of EV Battery Cybersecurity</h2>
          <p className={styles.sectionSubtitle} style={{ marginBottom: "2.5rem" }}>
            Join a specialized, engineering-focused internship designed to train the next generation of Automotive Cybersecurity Engineers.
          </p>
          <div className={styles.heroCtas}>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20would%20like%20to%20apply%20for%20the%20EV%20Battery%20Cybersecurity%20Internship."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-track-event="cybersecurity_bottom_apply_click"
            >
              Apply for Internship →
            </a>
            <Link
              href="/internships/roadmap"
              className="btn btn-secondary"
              data-track-event="cybersecurity_bottom_roadmap_click"
            >
              Explore Roadmap →
            </Link>
            <Link
              href="/contact"
              className="btn btn-secondary"
              style={{ background: "var(--glass-bg)" }}
              data-track-event="cybersecurity_bottom_contact_click"
            >
              Contact EV.ENGINEER →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
