"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function BatteryDiagnosticsContent() {
  return (
    <div className={styles.pageContainer}>
      
      {/* 1. HERO & POSITIONING */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <span>Engineering Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
            EV Battery Intelligence Platform
          </h1>
          <p className={styles.heroDesc} style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>
            This is not just a fire prevention solution. It is a full-stack platform for battery diagnostics, grading, identity, and second-life repurposing.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#workflow" className="btn btn-primary">View System Workflow</Link>
            <Link href="#architecture" className="btn btn-secondary">Explore Architecture</Link>
          </div>
        </div>
      </section>

      {/* 1.5 ARCHITECT CARD */}
      <section className={styles.pageSection} style={{ padding: '0 0 4rem 0' }}>
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

      {/* 2. MAIN WORKFLOW (CENTERPIECE) */}
      <section className={styles.pageSectionAlt} id="workflow">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Core Workflow</span>
            <h2 className={styles.sectionTitle}>Battery Lifecycle & Intelligence Flow</h2>
          </div>
          <div className={styles.flowChart} style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            <div className={styles.flowNode}>Intake</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Registration</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack Diagnostics</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ background: 'rgba(234, 179, 8, 0.1)', borderColor: '#eab308' }}>Decision Gate</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Module Testing</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Testing</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Grading</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>ID Assignment</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Repack</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Thermal Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80' }}>Deployment</div>
          </div>
          <div className={styles.calloutBlock} style={{ marginTop: '2rem', textAlign: 'center' }}>
            <strong>Decision Logic:</strong> Direct Reuse (SOH &gt; 80%) vs. Disassemble for Modules vs. Scrap & Material Recovery.
          </div>
        </div>
      </section>

      {/* 3. 3-LEVEL DIAGNOSTICS */}
      <section className={styles.pageSection} id="architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Resolution</span>
            <h2 className={styles.sectionTitle}>3-Level Diagnostic Architecture</h2>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>A. Pack Level</h3>
              <dl className={styles.diagnosticMeta}>
                <dt>Purpose</dt><dd>Baseline health qualification.</dd>
                <dt>Tests</dt><dd>BMS comms, OCV/CCV, Insulation, Fault extraction.</dd>
                <dt>Outputs</dt><dd>Pack SOH estimate, isolation score.</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>B. Module Level</h3>
              <dl className={styles.diagnosticMeta}>
                <dt>Purpose</dt><dd>Integrity of cell clusters.</dd>
                <dt>Tests</dt><dd>Capacity cycling, imbalance detection, DCIR.</dd>
                <dt>Outputs</dt><dd>Module capacity, imbalance matrix.</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>C. Cell Level</h3>
              <dl className={styles.diagnosticMeta}>
                <dt>Purpose</dt><dd>Granular grading & matching.</dd>
                <dt>Tests</dt><dd>Measured capacity, ACIR/DCIR, Self-discharge.</dd>
                <dt>Outputs</dt><dd>Exact cell grade, thermal risk score.</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HARDWARE PLATFORM */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Hardware</span>
            <h2 className={styles.sectionTitle}>Battery Intelligence Hardware</h2>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Test Benches</h3>
              <ul className={styles.list}>
                <li>Pack Test Bench (HV Isolation)</li>
                <li>Module Tester (Precision Load)</li>
                <li>Cell Cycler (Multi-channel Rack)</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Instrumentation</h3>
              <ul className={styles.list}>
                <li>V/I/T Precision Sensors</li>
                <li>Thermal Camera Interface</li>
                <li>QR/NFC Label Printer</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Safety Systems</h3>
              <ul className={styles.list}>
                <li>Emergency Stop Mesh</li>
                <li>Isolation Fixtures</li>
                <li>Fire Suppression Integration</li>
              </ul>
            </div>
          </div>
          <div className={styles.flowChart} style={{ marginTop: '2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className={styles.flowNode}>Hardware</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Controller</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Software</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cloud</div>
          </div>
        </div>
      </section>

      {/* 5. SOFTWARE ARCHITECTURE */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Stack</span>
            <h2 className={styles.sectionTitle}>Software Layered Architecture</h2>
          </div>
          <div className={styles.card} style={{ padding: '0' }}>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L7</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Dashboard & Analytics</h3></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L6</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Identity & Traceability System</h3></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L5</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Grading Engine</h3></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L4</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Analytics Core (SOH, IR)</h3></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L3</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Data Acquisition Layer</h3></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L2</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Test Execution Engine</h3></div></div>
            <div className={styles.stackLayer}><div className={styles.layerNum}>L1</div><div className={styles.layerContent}><h3 className={styles.layerTitle}>Device Interface Layer</h3></div></div>
          </div>
        </div>
      </section>

      {/* 6. GRADING MODEL */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Qualification</span>
            <h2 className={styles.sectionTitle}>Deterministic Grading Model</h2>
          </div>
          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <table className={styles.gradeTable}>
              <thead>
                <tr><th>Grade</th><th>Primary Output</th><th>Key Metrics</th></tr>
              </thead>
              <tbody>
                <tr><td>Grade A</td><td>Direct Reuse in Packs</td><td>Capacity &gt; 80%, IR &lt; 1.2x nom</td></tr>
                <tr><td>Grade B</td><td>Stationary / Moderate Use</td><td>Capacity 65-80%, IR 1.2-1.5x nom</td></tr>
                <tr><td>Grade C</td><td>Low-load / Rural Reserve</td><td>Capacity 50-65%, IR 1.5-2.0x nom</td></tr>
                <tr><td>Grade D</td><td>Scrap & Material Recovery</td><td>Unstable IR or Capacity &lt; 50%</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.sectionSubtitle} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            *Grading is multi-parameter: Capacity + Internal Resistance + Thermal Rise Factor.
          </p>
        </div>
      </section>

      {/* 7. DIGITAL IDENTITY */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Traceability</span>
            <h2 className={styles.sectionTitle}>Encrypted Digital Identity</h2>
          </div>
          <div className={styles.grid2}>
            <div className={styles.card}>
              <ul className={styles.list}>
                <li>QR-based Unique Identity (UID)</li>
                <li>Encrypted Crypto-token Generation</li>
                <li>Backend Asset Genealogy Mapping</li>
                <li>Continuous Audit Trail</li>
              </ul>
              <div className={styles.calloutBlock} style={{ marginTop: '1rem' }}>
                Foundation for <strong>Battery Pack Aadhaar</strong> ecosystem.
              </div>
            </div>
            <div className={styles.flowChart} style={{ padding: '2rem' }}>
              <div className={styles.flowNode}>Cell</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode}>ID</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode}>Sticker</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode}>Scan</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode}>Cloud</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. THERMAL RECONFIGURATION */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Engineering</span>
            <h2 className={styles.sectionTitle}>Thermal Reconfiguration (BTMS)</h2>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cooling Methods</h3>
              <p className={styles.cardDesc}>Forced air corridors and directed passive heat sinks.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Thermal Design</h3>
              <p className={styles.cardDesc}>Cell spacing optimization and mica/ceramic propagation barriers.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Environmental</h3>
              <p className={styles.cardDesc}>Optimized for high-ambient rural Indian conditions (45°C+).</p>
            </div>
          </div>
          <div className={styles.flowChart} style={{ marginTop: '2rem', background: 'transparent' }}>
            <div className={styles.flowNode}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Thermal Validation</div>
          </div>
        </div>
      </section>

      {/* 9. ROADMAP */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Roadmap</span>
            <h2 className={styles.sectionTitle}>MVP to Scalable Product</h2>
          </div>
          <div className={styles.grid4}>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 1</div>
              <h3 className={styles.cardTitle}>Diagnostics</h3>
              <p className={styles.cardDesc}>Core lab SOPs and deterministic grading logic.</p>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 2</div>
              <h3 className={styles.cardTitle}>Grading + Identity</h3>
              <p className={styles.cardDesc}>Secure QR stickering and genealogy registry.</p>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 3</div>
              <h3 className={styles.cardTitle}>Repack System</h3>
              <p className={styles.cardDesc}>Automated matching and assembly workflows.</p>
            </div>
            <div className={styles.phaseCard}>
              <div className={styles.phaseNumber}>Phase 4</div>
              <h3 className={styles.cardTitle}>Thermal & Safety</h3>
              <p className={styles.cardDesc}>Custom BTMS for rural storage applications.</p>
            </div>
          </div>
          <div className={styles.phaseCard} style={{ marginTop: '2rem', borderLeft: '4px solid #38bdf8' }}>
            <div className={styles.phaseNumber}>Phase 5</div>
            <h3 className={styles.cardTitle}>Aadhaar Integration</h3>
            <p className={styles.cardDesc}>Full lifecycle traceability via National Battery Registry.</p>
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className={styles.pageSectionAlt} style={{ textAlign: "center", paddingBottom: "8rem" }}>
        <h2 className={styles.sectionTitle}>Engineering the Circular Battery Economy</h2>
        <p className={styles.sectionSubtitle} style={{ marginBottom: "2.5rem" }}>
          Providing practical, buildable infrastructure for the future of EV battery intelligence.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/contact" className="btn btn-primary">Request Collaboration</Link>
          <Link href="/contact" className="btn btn-secondary">Download System Specs</Link>
        </div>
      </section>

    </div>
  );
}
