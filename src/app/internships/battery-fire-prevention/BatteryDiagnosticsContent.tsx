"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function BatteryDiagnosticsContent() {
  return (
    <div className={styles.pageContainer}>
      
      {/* 1. HERO & POSITIONING (Step 1) */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <span>Engineering Platform v1.0</span>
          </div>
          <h1 className={styles.heroTitle}>
            EV Battery Intelligence Platform
          </h1>
          <p className={styles.heroDesc}>
            This is not just a battery fire prevention system.<br />
            It is a full-stack platform for battery diagnostics, grading, identity, repurposing, and thermal reconfiguration.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#workflow" className="btn btn-primary">View System Workflow</Link>
            <Link href="#architecture" className="btn btn-secondary">Explore Architecture</Link>
          </div>
        </div>
      </section>

      {/* 1.5 ARCHITECT CARD */}
      <section className={styles.pageSection} style={{ padding: '0 0 1.5rem 0' }}>
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

      {/* 2. MAIN WORKFLOW: END-TO-END ENGINEERING LIFECYCLE (Step 2) */}
      <section className={styles.pageSectionAlt} id="workflow">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Core Backbone</span>
            <h2 className={styles.sectionTitle}>End-to-End Battery Intelligence Workflow</h2>
            <p className={styles.sectionSubtitle}>A complete engineering pipeline from intake and diagnostics to grading, repack, and deployment.</p>
          </div>

          <div className={styles.flowChart} style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '4rem' }}>
            {/* INTAKE PHASE */}
            <div className={styles.flowNode}><span className={styles.levelLabel}>Intake</span>Battery Intake</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}><span className={styles.levelLabel}>Intake</span>Registration & Identification</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}><span className={styles.levelLabel}>Intake</span>Safety Inspection</div><span className={styles.flowArrow}>→</span>

            {/* PACK PHASE */}
            <div className={`${styles.flowNode} ${styles.packNode}`}><span className={styles.levelLabel}>Pack Level</span>Pack-Level Diagnostics</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`} style={{ borderColor: '#38bdf8' }}>
              <span className={styles.levelLabel}>Gate 1</span>
              Decision: Reuse / Disassemble / Scrap
            </div><span className={styles.flowArrow}>→</span>

            {/* TESTING PHASE */}
            <div className={`${styles.flowNode} ${styles.moduleNode}`}><span className={styles.levelLabel}>Module Level</span>Module-Level Testing</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`} style={{ borderColor: '#facc15' }}>
              <span className={styles.levelLabel}>Gate 2</span>
              Decision: Repair / Proceed to Cells
            </div><span className={styles.flowArrow}>→</span>
            
            <div className={`${styles.flowNode} ${styles.cellNode}`}><span className={styles.levelLabel}>Cell Level</span>Cell-Level Testing</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.cellNode}`}><span className={styles.levelLabel}>Cell Level</span>Cell Grading</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`} style={{ borderColor: '#4ade80' }}>
              <span className={styles.levelLabel}>Gate 3</span>
              Decision: Use / Reject
            </div><span className={styles.flowArrow}>→</span>

            {/* IDENTITY & DESIGN */}
            <div className={styles.flowNode}><span className={styles.levelLabel}>Digital ID</span>Identity Assignment (QR / Encrypted)</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}><span className={styles.levelLabel}>Design</span>Cell Matching & Binning</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}><span className={styles.levelLabel}>Design</span>Repack Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}><span className={styles.levelLabel}>Design</span>Thermal Reconfiguration</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}><span className={styles.levelLabel}>Final</span>Validation Testing</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80', color: '#4ade80' }}>
              <span className={styles.levelLabel}>Deployment</span>
              Second-Life Use
            </div>
          </div>

          <div className={styles.grid3} style={{ marginBottom: '3rem' }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Pack Gate</h3>
              <p className={styles.cardDesc}>Post-diagnostics triage determines if the pack can be reused directly, requires disassembly for modular salvage, or must be scrapped for materials.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Module Gate</h3>
              <p className={styles.cardDesc}>Evaluation of module health determines if specific sub-modules require repair or if the system can proceed to granular cell extraction.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cell Gate</h3>
              <p className={styles.cardDesc}>Final grading filters every cell node; only those meeting Grade A/B thresholds proceed to the matching and repack design phase.</p>
            </div>
          </div>

          <div className={styles.calloutBlock} style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ opacity: 0.9, fontSize: '1rem' }}>
              This workflow represents the complete lifecycle of second-life EV battery processing, from intake and diagnostics to grading, identity assignment, repack design, thermal validation, and safe deployment.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 3-LEVEL DIAGNOSTICS (Step 3) */}
      <section className={styles.pageSection} id="architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Resolution</span>
            <h2 className={styles.sectionTitle}>3-Level Diagnostic Stack</h2>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Level A</div>
              <h3 className={styles.cardTitle}>Pack Level</h3>
              <p className={styles.cardDesc}>Baseline qualification via BMS comms, isolation testing, and fault history extraction.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Key Metrics</dt><dd>Insulation Resistance, OCV/CCV Delta, BMS Error Logs.</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Level B</div>
              <h3 className={styles.cardTitle}>Module Level</h3>
              <p className={styles.cardDesc}>Intermediate health mapping focusing on cluster imbalance and DC Internal Resistance.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Key Metrics</dt><dd>Capacity Spread, Inter-cell Voltage Delta, Thermal Rise.</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Level C</div>
              <h3 className={styles.cardTitle}>Cell Level</h3>
              <p className={styles.cardDesc}>Granular characterization using high-precision cyclers for final grading.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Key Metrics</dt><dd>Measured Capacity, ACIR @ 1kHz, Self-discharge Slope.</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HARDWARE PLATFORM (Step 4) */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Hardware</span>
            <h2 className={styles.sectionTitle}>Diagnostic Hardware Platform</h2>
          </div>
          <div className={styles.grid2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Physical Infrastructure</h3>
              <ul className={styles.list}>
                <li><strong>Pack Test Bench:</strong> 800V Isolation / HV Discharge.</li>
                <li><strong>Module Tester:</strong> 60V/100A Precision Load Benches.</li>
                <li><strong>Cell Cycler:</strong> 5V/10A Multi-channel Automated Racks.</li>
                <li><strong>Sensor Array:</strong> High-res Voltage, Current, & Thermal Probes.</li>
                <li><strong>Safety System:</strong> Emergency Disconnect + Fire Suppression Mesh.</li>
              </ul>
            </div>
            <div className={styles.flowChart} style={{ padding: '2rem', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div className={styles.flowNode}>Hardware Fixture</div>
              <div className={styles.flowArrow} style={{ margin: '8px 0', transform: 'rotate(90deg)' }}>→</div>
              <div className={styles.flowNode}>Edge Controller</div>
              <div className={styles.flowArrow} style={{ margin: '8px 0', transform: 'rotate(90deg)' }}>→</div>
              <div className={styles.flowNode}>Platform Software</div>
              <div className={styles.flowArrow} style={{ margin: '8px 0', transform: 'rotate(90deg)' }}>→</div>
              <div className={styles.flowNode}>Cloud Intelligence</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SOFTWARE ARCHITECTURE (Step 5) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Stack</span>
            <h2 className={styles.sectionTitle}>Software System Architecture</h2>
          </div>
          <div className={styles.card} style={{ padding: '0' }}>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L5</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Intelligence & Dashboard</h3><p className={styles.cardDesc}>Visual analytics, fleet reports, and predictive health modeling.</p></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L4</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Identity & Traceability Engine</h3><p className={styles.cardDesc}>Cryptographic ID generation and blockchain-ready audit trails.</p></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L3</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Grading & Matching Logic</h3><p className={styles.cardDesc}>Deterministic scoring algorithms and cell-matching heuristics.</p></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L2</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Analytics Core (SOH, IR, Temp)</h3><p className={styles.cardDesc}>Signal processing and multi-parameter health estimation.</p></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L1</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Data Acquisition Layer</h3><p className={styles.cardDesc}>Real-time polling from hardware controllers and BMS interfaces.</p></div></div>
          </div>
        </div>
      </section>

      {/* 6. GRADING SYSTEM (Step 6) */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Qualification</span>
            <h2 className={styles.sectionTitle}>Deterministic Grading System</h2>
            <p className={styles.sectionSubtitle}>Multi-parameter qualification based on Capacity, IR, and Thermal Rise.</p>
          </div>
          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <table className={styles.gradeTable}>
              <thead>
                <tr><th>Grade</th><th>Threshold</th><th>Primary Action</th></tr>
              </thead>
              <tbody>
                <tr><td><span className={styles.gradeA}>Grade A</span></td><td>SOH &gt; 80% | IR &lt; 1.2x nom</td><td>Full Second-Life Reuse</td></tr>
                <tr><td><span className={styles.gradeB}>Grade B</span></td><td>SOH 65-80% | IR 1.2-1.5x nom</td><td>Moderate Utility / Storage</td></tr>
                <tr><td><span className={styles.gradeC}>Grade C</span></td><td>SOH 50-65% | IR 1.5-2.0x nom</td><td>Limited / Low-load Use</td></tr>
                <tr><td><span className={styles.gradeD}>Grade D</span></td><td>SOH &lt; 50% | Unstable IR</td><td>Material Recovery / Scrap</td></tr>
              </tbody>
            </table>
          </div>
          <div className={styles.calloutBlock} style={{ marginTop: '1.5rem' }}>
            <strong>Grading Methodology:</strong> Every cell is scored deterministically using measured capacity, internal resistance (ACIR/DCIR), and thermal rise factor under load. No subjective assessment — only data-driven classification.
          </div>
        </div>
      </section>

      {/* 7. DIGITAL IDENTITY (Step 7) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Traceability</span>
            <h2 className={styles.sectionTitle}>Encrypted Digital Identity</h2>
            <p className={styles.sectionSubtitle}>The foundation for the <strong>Battery Pack Aadhaar</strong> ecosystem.</p>
          </div>
          <div className={styles.grid2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Identity Framework</h3>
              <ul className={styles.list}>
                <li><strong>QR-based ID:</strong> Tamper-evident physical labels.</li>
                <li><strong>Encrypted Token:</strong> Secure crypto-link to cloud twin.</li>
                <li><strong>Backend Mapping:</strong> Full genealogy from origin pack to new repack.</li>
              </ul>
            </div>
            <div className={styles.flowChart} style={{ padding: '2rem', justifyContent: 'space-around' }}>
              <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Cell node</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>ID Gen</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Sticker</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Scan</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Cloud twin</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. THERMAL RECONFIGURATION (Step 8) */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Safety Engineering</span>
            <h2 className={styles.sectionTitle}>Thermal Reconfiguration & BTMS</h2>
            <p className={styles.sectionSubtitle}>Redesigned thermal management for repacked cells in second-life applications.</p>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cooling Strategy</h3>
              <p className={styles.cardDesc}>Active forced-air corridors and passive heat sinks integrated into the pack housing for continuous thermal regulation.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Airflow & Spacing</h3>
              <p className={styles.cardDesc}>Directed airflow channels between cell clusters. Mica/ceramic propagation barriers with optimized inter-cell pitch spacing.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Heat Dissipation</h3>
              <p className={styles.cardDesc}>Structural aluminium sinks and thermally conductive fillers to manage peak charge/discharge thermal events.</p>
            </div>
          </div>
          <div className={styles.calloutBlock} style={{ marginTop: '1.5rem' }}>
            <strong>Rural Deployment:</strong> Designed for high-ambient Indian conditions (45°C+). No dependence on external HVAC. Passive thermal safety must sustain operation in non-climate-controlled rural storage environments.
          </div>
          <div className={styles.flowChart} style={{ marginTop: '2rem', background: 'transparent' }}>
            <div className={styles.flowNode}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Thermal Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80' }}>Final Pack</div>
          </div>
        </div>
      </section>

      {/* 9. ROADMAP (Step 9) */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Vision</span>
            <h2 className={styles.sectionTitle}>Product Roadmap</h2>
          </div>
          <div className={styles.grid4}>
            <div className={styles.phaseCard}><div className={styles.phaseNumber}>Phase 1</div><h3 className={styles.cardTitle}>Diagnostics</h3><div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '100%' }}></div></div></div>
            <div className={styles.phaseCard}><div className={styles.phaseNumber}>Phase 2</div><h3 className={styles.cardTitle}>Grading</h3><div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '80%' }}></div></div></div>
            <div className={styles.phaseCard}><div className={styles.phaseNumber}>Phase 3</div><h3 className={styles.cardTitle}>Repack</h3><div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '50%' }}></div></div></div>
            <div className={styles.phaseCard}><div className={styles.phaseNumber}>Phase 4</div><h3 className={styles.cardTitle}>Thermal</h3><div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: '30%' }}></div></div></div>
          </div>
          <div className={styles.phaseCard} style={{ marginTop: '2rem', borderLeft: '4px solid #38bdf8' }}>
            <div className={styles.phaseNumber}>Phase 5</div>
            <h3 className={styles.cardTitle}>Battery Pack Aadhaar Registry Integration</h3>
            <p className={styles.cardDesc}>National scale traceability and circular lifecycle ecosystem.</p>
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className={styles.pageSectionAlt} style={{ textAlign: "center", paddingBottom: "8rem" }}>
        <h2 className={styles.sectionTitle}>Engineering the Future of Battery Intelligence</h2>
        <p className={styles.sectionSubtitle} style={{ marginBottom: "2.5rem" }}>
          Providing practical, buildable infrastructure for second-life battery circularity.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/contact" className="btn btn-primary">Partner with Us</Link>
          <Link href="/contact" className="btn btn-secondary">Request System Specs</Link>
        </div>
      </section>

    </div>
  );
}
