"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
// No extra imports needed

export default function BatteryDiagnosticsContent() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <span>Flagship Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
            EV Battery Intelligence Platform
          </h1>
          <span className={styles.heroHighlight} style={{ display: 'block' }}>
            Diagnostics, Grading, Identity, and Thermal Reconfiguration for Second-Life EV Battery Systems
          </span>
          <p className={styles.heroDesc}>
            This is not just a battery fire prevention solution. This is a full-stack EV battery diagnostics and repurposing platform designed to assess, classify, and safely reconfigure used EV battery packs for second-life applications.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#workflow" className="btn btn-primary">
              View System Workflow
            </Link>
            <Link href="#architecture" className="btn btn-secondary">
              Explore Architecture
            </Link>
          </div>

          {/* SYSTEM HIERARCHY VISUAL (Step 10) */}
          <div className={styles.flowChart} style={{ marginTop: '3rem', background: 'transparent', border: 'none', padding: 0 }}>
            <div className={styles.flowNode} style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>Pack</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>Modules</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>Cells</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80', color: '#4ade80' }}>Graded Cells</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80', color: '#4ade80' }}>Reconfigured Pack</div>
          </div>
        </div>
      </section>

      {/* 1.5 ARCHITECT CARD */}
      <section className={styles.pageSection} style={{ padding: '2rem 0 0 0' }}>
        <div className="container">
          <div className={styles.architectCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#4ca930", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>EV.ENGINEER™</p>
                <h2 style={{ fontSize: "1.8rem", marginBottom: "8px", color: "#fff", fontWeight: "600" }}>Sudarshana Karkala</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>Co-Founder, Principal Architect | Thasmai Infotech Private Limited</p>
                <div className={styles.availabilityHighlight}>
                  Available for strategic architectural consulting and advanced automotive R&D partnerships.
                </div>
                <div className={styles.contactLinks}>
                  <a href="tel:+919845561518" style={{ color: "#4ca930", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📞</span> +91 9845561518
                  </a>
                  <span className={styles.contactSeparator} style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
                  <a href="https://www.linkedin.com/in/sudarshanakarkala/" target="_blank" rel="noopener noreferrer" style={{ color: "#4ca930", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🔗</span> LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* 2. SYSTEM IDENTITY — PLATFORM POSITIONING */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.platformStatement}>
            <span className={styles.sectionNumber}>Platform Identity</span>
            <h2>EV Battery Intelligence Platform</h2>
            <div className={styles.platformQuote}>
              This is not just a battery fire prevention system.<br />
              This is a full-stack battery diagnostics, grading, identity, and repurposing platform designed for second-life EV battery ecosystems.
            </div>
            <div className={styles.platformPillars}>
              <div className={styles.pillarItem}>
                <span>🔬</span>
                <strong>Multi-Level Diagnostics</strong>
                <p>Pack, module, and cell-level health assessment</p>
              </div>
              <div className={styles.pillarItem}>
                <span>🔄</span>
                <strong>Repurposing Pipeline</strong>
                <p>Intake to certified second-life deployment</p>
              </div>
              <div className={styles.pillarItem}>
                <span>🌡️</span>
                <strong>Thermal Redesign</strong>
                <p>Mandatory BTMS reconfiguration for safety</p>
              </div>
              <div className={styles.pillarItem}>
                <span>🔒</span>
                <strong>Traceability System</strong>
                <p>Encrypted identity &amp; Aadhaar readiness</p>
              </div>
            </div>
          </div>
          <div className={styles.flowChart} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem' }}>
            <div className={styles.flowNode} style={{ borderColor: '#38bdf8' }}>Original Pack</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#38bdf8' }}>Module Set</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#38bdf8' }}>Cell Set</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80' }}>New Reconfigured Pack</div>
          </div>
        </div>
      </section>

      {/* 3. EXECUTIVE OVERVIEW */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.executiveCard}>
            <ul className={styles.list} style={{ fontSize: '1rem', lineHeight: '1.9' }}>
              <li>India’s EV transition has created an urgent need for sustainable end-of-life battery solutions.</li>
              <li>Safe repurposing of 2W, 3W, and 4W batteries into stationary storage requires significantly more rigor than simple voltage checks.</li>
              <li>True circular economy demands multi-level diagnostics at pack, module, and cell resolution to identify hidden degradation, thermal anomalies, and BMS faults.</li>
              <li>By merging rigorous hardware engineering with an encrypted digital identity and thermal redesign frameworks, we transform used EV batteries into highly traceable, certified, and safe energy platforms.</li>
              <li><strong>Primary target:</strong> Solar PV-based rural EV charging stations.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM STATEMENT */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>The Challenge</span>
            <h2 className={styles.sectionTitle}>Why Surface-Level Assessment Fails</h2>
          </div>
          <div className={styles.grid2}>
            <div>
              <ul className={styles.list}>
                <li>Used EV battery packs inevitably arrive with unknown and untraceable cycle histories.</li>
                <li>Packs often harbor hidden degradation, internal resistance growth, moisture exposure, thermal hotspots, and micro-shorts.</li>
                <li>Many secondary life applications fail catastrophically because packs were evaluated based solely on surface voltage and capacity checks.</li>
                <li>Merely reassembling cells is inadequate; repurposed packs require entirely new thermal and electrical architectures.</li>
                <li>Without a secure digital identity and full traceability framework, the second-life battery sector cannot build trust at scale.</li>
              </ul>
            </div>
            <div className={styles.problemHighlight}>
              Target use case: second-life battery systems for solar PV-based rural EV charging stations, with performance-cost trade-off, thermal safety, and circular battery utilisation.
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE OBJECTIVES */}
      <section className={styles.pageSection} id="architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Core Objectives</span>
            <h2 className={styles.sectionTitle}>Platform Competencies</h2>
          </div>
          <div className={styles.grid4}>
            {[
              { title: "Intake & Registration", icon: "🔗", desc: "Secure visual inspection and quarantine handling workflows." },
              { title: "Pack-Level Diagnostics", icon: "🔋", desc: "Non-invasive BMS comms, insulation testing, and full thermal scanning." },
              { title: "Module-Level Diagnostics", icon: "⚙️", desc: "Imbalance monitoring, capacity profiling, and DC IR baselining." },
              { title: "Cell-Level Grading", icon: "🔌", desc: "Pulse response, self-discharge analysis, and risk scoring." },
              { title: "Anomaly Detection", icon: "🛡️", desc: "Early spotting of moisture ingress, deep-discharge faults, and micro-shorts." },
              { title: "Encrypted Digital Identity", icon: "🔒", desc: "Tamper-evident stickering backing a crypto-secured digital twin." },
              { title: "Matching & Thermal Redesign", icon: "🌡️", desc: "Clustering algorithms driving entirely new passive/active thermal layouts." },
              { title: "Battery Pack Aadhaar", icon: "📱", desc: "Forward compatibility and eventual full traceability integration." }
            ].map((obj, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardIcon}>{obj.icon}</div>
                <h3 className={styles.cardTitle}>{obj.title}</h3>
                <p className={styles.cardDesc}>{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. END-TO-END SYSTEM WORKFLOW (CENTERPIECE) */}
      <section className={styles.pageSectionAlt} id="workflow">
        <div className="container">
          <div className={styles.sectionHeader} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className={styles.sectionNumber}>Core Backbone</span>
            <h2 className={styles.sectionTitle}>End-to-End Platform Workflow</h2>
            <p className={styles.sectionSubtitle}>A dominant visual flow from battery reception to second-life deployment</p>
          </div>

          <div className={styles.flowChart} style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
            <div className={styles.flowNode}>Battery Intake</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Registration</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Safety Check</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack Diagnostics</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Decision Gate 1</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Module Testing</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Decision Gate 2</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Testing</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Grading</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Decision Gate 3</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Identity Assignment</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Repack Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Thermal Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80' }}>Deployment</div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Gate 1</div>
              <h3 className={styles.cardTitle}>Pack Decision</h3>
              <p className={styles.cardDesc}>Evaluate for direct reuse, modular disassembly, or immediate scrap based on insulation and initial thermal scan.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Gate 2</div>
              <h3 className={styles.cardTitle}>Module Decision</h3>
              <p className={styles.cardDesc}>Determine if sub-assemblies are viable as intact blocks or if full cell-level extraction is required due to imbalance.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Gate 3</div>
              <h3 className={styles.cardTitle}>Grading Decision</h3>
              <p className={styles.cardDesc}>Final classification of every cell into specific usage tiers (Grade A/B/C/D) using multi-parameter scoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MULTI-LEVEL DIAGNOSTIC ARCHITECTURE (Step 3) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Resolution</span>
            <h2 className={styles.sectionTitle}>Multi-Level Diagnostic Architecture</h2>
            <p className={styles.sectionSubtitle}>
              Granular analysis from complete pack down to individual cell nodes.
            </p>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>A. Pack-Level Diagnostics</h3>
              <p className={styles.cardDesc}>Non-destructive baseline qualification.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Purpose</dt>
                <dd>Baseline health qualification and safety screening.</dd>
                <dt>Tests Performed</dt>
                <dd>BMS CAN communication, insulation resistance, thermal scanning, fault log extraction.</dd>
                <dt>Outputs</dt>
                <dd>Pack-level SOH, insulation score, isolation integrity.</dd>
                <dt>Decision Logic</dt>
                <dd>SOH &gt; 80% with no faults → Direct Reuse; Else → Module Disassembly.</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>B. Module-Level Diagnostics</h3>
              <p className={styles.cardDesc}>Intermediate integrity evaluation for viable subsystems.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Purpose</dt>
                <dd>Verify subsystem integrity and load performance.</dd>
                <dt>Tests Performed</dt>
                <dd>Capacity profiling, DCIR matching, inter-cell imbalance, thermal rise factor.</dd>
                <dt>Outputs</dt>
                <dd>Module-level capacity matrix, impedance spread, imbalance ratio.</dd>
                <dt>Decision Logic</dt>
                <dd>Imbalance &lt; 2% → Module Reuse; Else → Cell-Level Extraction.</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>C. Cell-Level Diagnostics</h3>
              <p className={styles.cardDesc}>Granular characterization for final asset matching.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Purpose</dt>
                <dd>Final deterministic grading for application matching.</dd>
                <dt>Tests Performed</dt>
                <dd>1kHz ACIR, high-precision capacity cycles, self-discharge rate, safety risk index.</dd>
                <dt>Outputs</dt>
                <dd>Measured capacity, IR curve, self-discharge slope, safety score.</dd>
                <dt>Decision Logic</dt>
                <dd>Grade assignment (A/B/C) based on composite health and safety index.</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HARDWARE PLATFORM (Step 4) */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Hardware</span>
            <h2 className={styles.sectionTitle}>Battery Diagnostic Hardware Platform</h2>
          </div>
          <div className={styles.calloutBlock}>
            <strong>This is a physical + digital system, not just AI software.</strong> The platform integrates high-precision cyclers and test benches directly with the software stack to ensure deterministic grading and safety.
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.1 Pack & Module Bench</h3>
              <ul className={styles.list}>
                <li>Pack Test Bench (HV Isolation)</li>
                <li>Module Test Bench (Precision Load)</li>
                <li>Thermal Camera Array (Safety)</li>
                <li>E-Stop & Automated Isolation Mesh</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.2 Cell Diagnostic Rack</h3>
              <ul className={styles.list}>
                <li>Multi-Channel Cell Cyclers (5V/10A)</li>
                <li>ACIR 1kHz Spectrometers</li>
                <li>Environmental Chamber Integration</li>
                <li>Temperature Probe Grid (Per Fixture)</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.3 Sensors & Labeling</h3>
              <ul className={styles.list}>
                <li>HV Voltage & Current Sensors (Hall Effect)</li>
                <li>Precise Contactless Temperature Mapping</li>
                <li>QR / NFC Label Printer (Hardware ID)</li>
                <li>Tamper-Evident Asset Tags</li>
              </ul>
            </div>
          </div>

          <div className={styles.flowChart} style={{ marginTop: "3rem", padding: "1.5rem" }}>
            <div className={styles.flowNode} style={{ padding: "0.5rem 1.5rem", borderColor: '#94a3b8' }}>Hardware</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ padding: "0.5rem 1.5rem", borderColor: '#38bdf8' }}>Edge Controller</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ padding: "0.5rem 1.5rem", borderColor: '#eab308' }}>Software Stack</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ padding: "0.5rem 1.5rem", borderColor: '#4ade80' }}>Cloud Intelligence</div>
          </div>
        </div>
      </section>

      {/* 8. SOFTWARE PLATFORM DESIGN */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Stack</span>
            <h2 className={styles.sectionTitle}>Software Stack: From Bench Control to Intelligence</h2>
            <p className={styles.sectionSubtitle}>
              Real-time monitoring · Offline lab mode · Cloud integration · API-first design
            </p>
          </div>

          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L7</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Dashboard & Reporting Layer</h3>
              <p className={styles.cardDesc}>Visual certification, health reports, and fleet-wide diagnostic analytics.</p>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L6</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Identity & Traceability Layer</h3>
              <p className={styles.cardDesc}>Encrypted token generation and Battery Pack Aadhaar registry syncing.</p>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L5</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Grading Engine</h3>
              <p className={styles.cardDesc}>Deterministic classification logic based on multi-parameter health scores.</p>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L4</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Analytics Engine (SOH, SOC, IR)</h3>
              <p className={styles.cardDesc}>Processing raw data into actionable health, capacity, and resistance indices.</p>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L3</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Data Acquisition Layer</h3>
              <p className={styles.cardDesc}>High-frequency logging of V/I/T curves and BMS status packets.</p>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L2</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Test Execution Engine</h3>
              <p className={styles.cardDesc}>Automated sequencing of charge/discharge recipes and safety checks.</p>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>L1</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Device Interface Layer</h3>
              <p className={styles.cardDesc}>TCP/IP instrument control, CAN bus translation, and edge-polling firmware.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. HEALTH SCORING & GRADING MODEL */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Qualification</span>
            <h2 className={styles.sectionTitle}>Health Scoring, Risk Index, & Grading</h2>
          </div>

          <div className={styles.calloutBlock} style={{ marginBottom: '2rem' }}>
            <strong>Grading is multi-parameter based — not a single metric.</strong> Each cell/module is evaluated across capacity retention, internal resistance, thermal stability, self-discharge rate, and BMS integrity. No single parameter can override the composite grade.
          </div>

          <div className={styles.grid2} style={{ marginBottom: '2rem' }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Diagnostic Vectors</h3>
              <ul className={styles.list}>
                <li>Battery Health Index (Overall SOH)</li>
                <li>Safety Risk & Imbalance Level</li>
                <li>Thermal Stability & Rise Factor</li>
                <li>Moisture / Ingress Suspicion Signal</li>
                <li>BMS Comms Integrity Score</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Decision Matrix</h3>
              <p className={styles.cardDesc} style={{ marginTop: '0.5rem' }}>
                Grading unifies all electrical performance curves, observed thermal behaviors, latent safety indicators, and peer-cluster statistics into a deterministic qualification tier.
              </p>
            </div>
          </div>

          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <table className={styles.gradeTable}>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Capacity</th>
                  <th>IR Threshold</th>
                  <th>Thermal Risk</th>
                  <th>Secondary Target</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.gradeA}>Grade A</td>
                  <td><span className={styles.thresholdBadge}>&gt; 80% SOH</span></td>
                  <td><span className={styles.thresholdBadge}>&lt; 1.2× nominal</span></td>
                  <td>Negligible</td>
                  <td>Reuse in new packs / Solar Storage</td>
                </tr>
                <tr>
                  <td className={styles.gradeB}>Grade B</td>
                  <td><span className={styles.thresholdBadge}>65–80% SOH</span></td>
                  <td><span className={styles.thresholdBadge}>1.2–1.5× nominal</span></td>
                  <td>Low / Trackable</td>
                  <td>Stationary use / Rural Reserve</td>
                </tr>
                <tr>
                  <td className={styles.gradeC}>Grade C</td>
                  <td><span className={styles.thresholdBadge}>50–65% SOH</span></td>
                  <td><span className={styles.thresholdBadge}>1.5–2.0× nominal</span></td>
                  <td>Elevated</td>
                  <td>Low load use / Isolated Auxiliary</td>
                </tr>
                <tr>
                  <td className={styles.gradeD}>Grade D</td>
                  <td><span className={styles.thresholdBadge}>&lt; 50% SOH</span></td>
                  <td><span className={styles.thresholdBadge}>&gt; 2.0× nominal</span></td>
                  <td>Critical</td>
                  <td>Immediate Scrap & Material Recycle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 10. ENCRYPTED IDENTITY & TRACEABILITY (Step 7) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Traceability</span>
            <h2 className={styles.sectionTitle}>Encrypted Battery Identity & Traceability System</h2>
          </div>
          <div className={styles.grid2}>
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Every discrete pack, module, and cell is issued a tamper-aware digital identity via a physical sticker. The QR code exposes minimal plaintext metadata while embedding an encrypted cryptographic core.
              </p>
              <div className={styles.calloutBlock} style={{ marginTop: '1.5rem' }}>
                <strong>This forms the foundation for Battery Pack Aadhaar.</strong> The system provides an immutable audit trail and genealogy tracking for every lithium node in the second-life ecosystem.
              </div>
              <ul className={styles.list}>
                <li>Unique ID for each Pack / Module / Cell</li>
                <li>QR-based Encrypted Token Strategy</li>
                <li>Secure Backend Database Mapping</li>
                <li>Full Genealogy & Audit Trail Tracking</li>
              </ul>
            </div>
            <div className={styles.flowChart} style={{ margin: 0, padding: '1.5rem' }}>
              <div className={styles.flowNode} style={{ padding: '0.5rem 1rem' }}>Cell</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ padding: '0.5rem 1rem' }}>Generate ID</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ padding: '0.5rem 1rem' }}>Sticker</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ padding: '0.5rem 1rem' }}>Scan</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ padding: '0.5rem 1rem' }}>Cloud</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ padding: '0.5rem 1rem' }}>History</div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. DATA MODEL */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Data Architecture</span>
            <h2 className={styles.sectionTitle}>Digital Twin & Genealogy Schema</h2>
          </div>
          <div className={styles.grid2}>
            <div>
              <ul className={styles.list}>
                <li>Historical Pack → Module Extractor → Isolated Cells</li>
                <li>Original Metrics vs Re-tested Outputs</li>
                <li>Matched Repack Grouping → Final Second-Life Cluster</li>
              </ul>
              <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
                This data structure maps the continuous lifespan of each lithium node, preventing fraudulent masking of historically dangerous packs and enabling long-term warranty or predictive analytics.
              </p>
            </div>
            <div className={styles.jsonBox}>
              <pre>{`{
  "trace_id": "TC-90X7-LFP-02",
  "parent": "PACK_VIN_A8",
  "chemistry_class": "NMC_811",
  "diagnostic_session": "SID_9921",
  "health_index": 78.4,
  "thermal_stability": 91.0,
  "match_cluster": "REPACK_P4",
  "cert_token": "0xcd3...6a9"
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* 12. THERMAL RECONFIGURATION (Step 8) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Engineering Safety</span>
            <h2 className={styles.sectionTitle}>Thermal Reconfiguration for Second-Life Battery Packs</h2>
          </div>

          <div className={styles.calloutBlock} style={{ marginBottom: '2rem' }}>
            <strong>Thermal redesign is mandatory before reuse.</strong> Second-life packs face different duty cycles and ambient conditions than their original chassis. We reconstruct the heat profile explicitly for the secondary application.
          </div>

          <div className={styles.flowChart} style={{ marginBottom: '3rem', padding: '1.5rem' }}>
            <div className={styles.flowNode}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Thermal Simulation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80' }}>Final Pack</div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cooling Strategies</h3>
              <p className={styles.cardDesc}>Validated forced air or directed passive cooling corridors optimized for rural environments.</p>
              <ul className={styles.list} style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <li>Forced Air Induction</li>
                <li>Directed Passive Cooling</li>
                <li>Heat Dissipation Modeling</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Propagation Barriers</h3>
              <p className={styles.cardDesc}>Physical separation to halt thermal runaway using advanced materials.</p>
              <ul className={styles.list} style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <li>Ceramic Cell Spacers</li>
                <li>Non-Flammable Mica Barriers</li>
                <li>Optimized Inter-Cell Pitch</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Rural Constraints</h3>
              <p className={styles.cardDesc}>Engineering for high ambient temperatures and dust-heavy environments.</p>
              <ul className={styles.list} style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <li>High Ambient Ops (45°C+)</li>
                <li>Dust Ingress Protection (IP54)</li>
                <li>Maintenance-Free Thermal Mesh</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 13. PRODUCT ROADMAP: MVP → SCALE (Step 9) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Project Execution</span>
            <h2 className={styles.sectionTitle}>Product Roadmap: MVP to Scalable Platform</h2>
            <p className={styles.sectionSubtitle}>Five structured phases from lab prototype to national-scale battery traceability.</p>
          </div>
          <div className={styles.grid4} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 1</div>
              <h3 className={styles.cardTitle}>Diagnostics Platform</h3>
              <ul className={styles.list} style={{ fontSize: '0.8rem' }}>
                <li>Lab SOP Deployment</li>
                <li>Core Grading Logic</li>
                <li>Manual Intake UI</li>
              </ul>
              <p className={styles.cardDesc} style={{ marginTop: '0.75rem', fontWeight: 600, color: '#4ade80' }}>Output: Working Lab Bench</p>
              <div className={styles.phaseMaturity}>
                <div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '100%' }}></div></div>
                <span className={styles.maturityLabel}>Maturity: MVP</span>
              </div>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 2</div>
              <h3 className={styles.cardTitle}>Grading + Identity</h3>
              <ul className={styles.list} style={{ fontSize: '0.8rem' }}>
                <li>Encrypted QR Tokens</li>
                <li>Deterministic Scorer</li>
                <li>Operator Dashboard</li>
              </ul>
              <p className={styles.cardDesc} style={{ marginTop: '0.75rem', fontWeight: 600, color: '#4ade80' }}>Output: Graded Asset Registry</p>
              <div className={styles.phaseMaturity}>
                <div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '80%' }}></div></div>
                <span className={styles.maturityLabel}>Maturity: Beta</span>
              </div>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 3</div>
              <h3 className={styles.cardTitle}>Repack System</h3>
              <ul className={styles.list} style={{ fontSize: '0.8rem' }}>
                <li>Cell Matching Engine</li>
                <li>Autonomous Cycler Logic</li>
                <li>Genealogy Mapping</li>
              </ul>
              <p className={styles.cardDesc} style={{ marginTop: '0.75rem', fontWeight: 600, color: '#facc15' }}>Output: Optimized Pack Cluster</p>
              <div className={styles.phaseMaturity}>
                <div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '50%' }}></div></div>
                <span className={styles.maturityLabel}>Maturity: Dev</span>
              </div>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 4</div>
              <h3 className={styles.cardTitle}>Thermal Optimization</h3>
              <ul className={styles.list} style={{ fontSize: '0.8rem' }}>
                <li>Custom BTMS Profiles</li>
                <li>Rural Load Simulation</li>
                <li>Aero-Thermal Validation</li>
              </ul>
              <p className={styles.cardDesc} style={{ marginTop: '0.75rem', fontWeight: 600, color: '#facc15' }}>Output: Second-Life Blueprint</p>
              <div className={styles.phaseMaturity}>
                <div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '30%' }}></div></div>
                <span className={styles.maturityLabel}>Maturity: R&D</span>
              </div>
            </div>
          </div>
          <div className={styles.phaseCard} style={{ marginTop: '2rem', borderLeft: '4px solid #38bdf8' }}>
            <div className={styles.phaseNumber}>Phase 5</div>
            <h3 className={styles.cardTitle}>Battery Pack Aadhaar Integration</h3>
            <p className={styles.cardDesc}>Scaling to national lifecycle registry via secure APIs and ecosystem-wide traceability.</p>
            <div className={styles.phaseMaturity}>
              <div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '10%', background: '#38bdf8' }}></div></div>
              <span className={styles.maturityLabel}>Maturity: Vision</span>
            </div>
          </div>
        </div>
      </section>

      {/* 15. USE CASES */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Applications</span>
            <h2 className={styles.sectionTitle}>Core Target Deployments</h2>
          </div>
          <div className={styles.grid4}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🔋</div>
              <h3 className={styles.cardTitle}>Rural PV Energy Stops</h3>
              <p className={styles.cardDesc}>Supplying cost-effective, thermally secure buffers for rural grid-independent EV chargers.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>⚡</div>
              <h3 className={styles.cardTitle}>Grid Peak Shaving</h3>
              <p className={styles.cardDesc}>Pooling Grade A & B matched cells into significant rack-mount setups for low-stress commercial load buffering.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>⚙️</div>
              <h3 className={styles.cardTitle}>OEM Service Hubs</h3>
              <p className={styles.cardDesc}>Allowing regional workshops to independently evaluate warranty packs before shipping them centrally.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🛡️</div>
              <h3 className={styles.cardTitle}>University Battery Labs</h3>
              <p className={styles.cardDesc}>Providing an open infrastructure testbed for students simulating future grid interoperability systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 16. WHAT WE BUILD FIRST & 17. DELIVERABLES */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.grid2}>
            <div>
              <h2 className={styles.sectionTitle} style={{ fontSize: "1.8rem" }}>The Pilot Implementation</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                Our initial software and bench builds intentionally limit scope to selected high-volume 2W/3W/4W lithium chemistries. The priority lies in producing a strictly deterministic health score, deploying the encrypted sticker regime, and proving out the operator UI workflow. <strong>This core layer will permanently anchor all future Battery Pack Aadhaar tracking expansions.</strong>
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Direct Engineering Deliverables</h3>
              <ul className={styles.list}>
                <li>Automated instrument & bench edge-firmware layers.</li>
                <li>The Python / FastAPI backend test engine.</li>
                <li>Encrypted label generator and data schema.</li>
                <li>A fully mocked engineering visual dashboard.</li>
                <li>The thermal configuration methodology output paper.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 19. CTA SECTION */}
      <section className={styles.pageSectionAlt} style={{ textAlign: "center", paddingBottom: "8rem" }}>
        <h2 className={styles.sectionTitle}>Build the circular foundation today.</h2>
        <p className={styles.sectionSubtitle} style={{ marginBottom: "2.5rem" }}>
          Pioneering safe, traceable, and highly engineered second-life EV battery frameworks.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/contact" className="btn btn-primary">Request Engineering Collaboration</Link>
          <Link href="/contact" className="btn btn-secondary">Explore Battery Pack Aadhaar Vision</Link>
        </div>
      </section>

    </div>
  );
}
