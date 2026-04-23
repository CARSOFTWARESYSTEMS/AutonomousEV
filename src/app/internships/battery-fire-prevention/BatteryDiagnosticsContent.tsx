"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

/* ── Tiny reusable sub-components ── */
const WStep = ({ dot, title, desc }: { dot: string; title: string; desc: string }) => (
  <div className={styles.workflowStep}>
    <div className={`${styles.workflowDot} ${dot}`} />
    <div className={styles.workflowCard}>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

const WGate = ({ dot, title, desc }: { dot: string; title: string; desc: string }) => (
  <div className={styles.workflowStep}>
    <div className={`${styles.workflowDot} ${dot}`} />
    <div className={styles.workflowGateCard}>
      <h4>⚑ {title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);

const WLabel = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.workflowPhaseLabel}><span>{children}</span></div>
);

const HBlock = ({ icon, label, sub }: { icon: string; label: string; sub: string }) => (
  <div className={styles.hierarchyBlock}>
    <div className={styles.hierarchyIcon}>{icon}</div>
    <div className={styles.hierarchyLabel}>{label}</div>
    <div className={styles.hierarchySub}>{sub}</div>
  </div>
);

export default function BatteryDiagnosticsContent() {
  return (
    <div>

      {/* ═══ 1. HERO ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroPill}><span>Engineering Platform v1.0</span></div>

          <h1 className={styles.heroTitle}>EV Battery Intelligence Platform</h1>

          <p className={styles.heroPlatformScope}>
            This platform provides end-to-end battery lifecycle intelligence including diagnostics, grading, identity, repurposing, and thermal reconfiguration for second-life EV battery systems.
          </p>

          <div className={styles.heroPillars}>
            <div className={styles.heroPillarChip}><span>🔬</span> Multi-Level Diagnostics</div>
            <div className={styles.heroPillarChip}><span>🔄</span> Full Lifecycle System</div>
            <div className={styles.heroPillarChip}><span>♻️</span> Repurposing Pipeline</div>
            <div className={styles.heroPillarChip}><span>🛡️</span> Thermal Safety</div>
          </div>

          <div className={styles.heroCtas}>
            <Link href="#workflow" className="btn btn-primary">View System Workflow</Link>
            <Link href="#architecture" className="btn btn-secondary">Explore Architecture</Link>
          </div>
        </div>
      </section>

      {/* ═══ 1.5 ARCHITECT CARD ═══ */}
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

      {/* ═══ 2. LIFECYCLE WORKFLOW (Central Visual) ═══ */}
      <section className={styles.pageSectionAlt} id="workflow">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Core Backbone</span>
            <h2 className={styles.sectionTitle}>End-to-End Battery Intelligence Workflow</h2>
            <p className={styles.sectionSubtitle}>The complete engineering lifecycle — from battery intake through diagnostics, grading, identity, repack, and deployment.</p>
          </div>

          <div className={styles.workflowTimeline}>
            <WLabel>Intake Phase</WLabel>
            <WStep dot="" title="Battery Intake" desc="Receive retired EV battery packs; log origin, make, model, age, and prior usage history." />
            <WStep dot="" title="Registration & Identification" desc="Assign internal tracking ID. Capture pack serial, BMS firmware version, and physical condition." />
            <WStep dot="" title="Safety Inspection" desc="Visual check for swelling, leakage, connector damage. HV isolation pre-test before any electrical contact." />

            <WLabel>Pack-Level Diagnostics</WLabel>
            <WStep dot={styles.dotPack} title="Pack-Level Diagnostics" desc="BMS communication, OCV/CCV measurement, insulation resistance, fault-code extraction, and pack-level capacity estimation." />
            <WGate dot={styles.dotGate} title="Decision Gate 1 — Reuse / Disassemble / Scrap" desc="✓ SOH > 80%: direct reuse → Validation → Deployment (shortcut path).  ⚠ Degraded but viable: disassemble → Module testing.  ✕ Unsafe / failed isolation: exit → Material recovery & scrap." />

            <WLabel>Module-Level Testing</WLabel>
            <WStep dot={styles.dotModule} title="Module-Level Testing" desc="Capacity measurement, inter-cell voltage imbalance, DC internal resistance, and thermal behaviour under load." />
            <WGate dot={styles.dotGate} title="Decision Gate 2 — Repair / Proceed to Cells" desc="✓ Minor imbalance: repair module → Re-test.  ⚠ Degraded clusters: disassemble → Cell-level testing.  ✕ Failed modules: exit → Scrap / material recovery." />

            <WLabel>Cell-Level Testing & Grading</WLabel>
            <WStep dot={styles.dotCell} title="Cell-Level Testing" desc="Precision cycling: measured capacity, AC internal resistance at 1 kHz, self-discharge rate over 72 h, thermal rise under 1C load." />
            <WStep dot={styles.dotCell} title="Cell Grading" desc="Deterministic scoring (Grade A/B/C/D) based on capacity, IR, thermal stability, and safety risk. No subjective assessment." />
            <WGate dot={styles.dotGate} title="Decision Gate 3 — Use / Reject" desc="✓ Grade A & B: proceed → Cell matching & binning.  ⚠ Grade C: limited use → Low-load applications only.  ✕ Grade D: exit → Recycling pipeline." />

            <WLabel>Identity & Design</WLabel>
            <WStep dot="" title="Digital Identity Assignment" desc="QR-based encrypted ID generated, printed as tamper-evident label, and linked to cloud digital twin with full test history." />
            <WStep dot="" title="Cell Matching & Binning" desc="Algorithm groups cells by capacity band, IR range, and thermal profile for optimal electrical balance in new packs." />

            <WLabel>Repack & Thermal</WLabel>
            <WStep dot="" title="Repack Design" desc="Mechanical and electrical design of second-life pack: series/parallel configuration, BMS integration, enclosure engineering." />
            <WStep dot="" title="Thermal Reconfiguration" desc="Airflow corridors, heat sinks, cell spacing, and propagation barriers designed for target deployment environment." />

            <WLabel>Validation & Deployment</WLabel>
            <WStep dot="" title="Validation Testing" desc="End-of-line charge/discharge cycling, safety interlock verification, BMS communication validation, and thermal stress test." />
            <WStep dot={styles.dotDeploy} title="Second-Life Deployment" desc="Certified pack deployed for stationary storage, rural electrification, telecom backup, or EV auxiliary systems." />
          </div>

          {/* Decision Gate summary cards */}
          <div className={styles.grid3} style={{ marginTop: '3rem' }}>
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
              <p className={styles.cardDesc}>Final grading filters every cell; only those meeting Grade A/B thresholds proceed to the matching and repack design phase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2.5 SYSTEM ARCHITECTURE OVERVIEW ═══ */}
      <section className={styles.pageSection} id="system-boundaries">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>System Overview</span>
            <h2 className={styles.sectionTitle}>System Architecture Overview</h2>
            <p className={styles.sectionSubtitle}>Clear boundary definition across hardware, software, and platform layers to ensure development alignment.</p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.boundaryIcon}>⚙️</div>
              <h3 className={styles.cardTitle}>Hardware Layer</h3>
              <ul className={styles.boundaryList}>
                <li><strong>Sensors:</strong> Voltage, current, temperature probes (±0.1% accuracy)</li>
                <li><strong>Test Benches:</strong> Pack tester (800V), module bench (60V/100A), cell cycler (5V/10A)</li>
                <li><strong>Safety Systems:</strong> E-stop, isolation monitors, fire suppression, HV disconnect</li>
                <li><strong>Edge Controllers:</strong> MCU/PLC for real-time data acquisition</li>
              </ul>
            </div>
            <div className={styles.card}>
              <div className={styles.boundaryIcon}>💻</div>
              <h3 className={styles.cardTitle}>Software Layer</h3>
              <ul className={styles.boundaryList}>
                <li><strong>Data Acquisition:</strong> Real-time polling from hardware controllers &amp; BMS</li>
                <li><strong>Analytics Engine:</strong> SOH/SOC estimation, anomaly detection, health scoring</li>
                <li><strong>Grading Logic:</strong> Deterministic A/B/C/D classification based on measured data</li>
                <li><strong>Test Sequencing:</strong> Automated charge/discharge profiles &amp; safety interlocks</li>
              </ul>
            </div>
            <div className={styles.card}>
              <div className={styles.boundaryIcon}>🌐</div>
              <h3 className={styles.cardTitle}>Platform Layer</h3>
              <ul className={styles.boundaryList}>
                <li><strong>Identity:</strong> Encrypted digital twin with QR/NFC physical labels per cell and pack</li>
                <li><strong>Traceability:</strong> Full genealogy from OEM origin → disassembly → repack → deployment</li>
                <li><strong>Lifecycle Tracking:</strong> Every test, grade, owner transfer, and event logged immutably</li>
                <li><strong>Dashboard:</strong> Fleet analytics, predictive health modeling, operator alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. 3-LEVEL DIAGNOSTIC STACK ═══ */}
      <section className={styles.pageSection} id="architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Resolution</span>
            <h2 className={styles.sectionTitle}>3-Level Diagnostic Architecture</h2>
            <p className={styles.sectionSubtitle}>Battery failures originate at cell level and propagate upward. Our diagnostics resolve at every layer.</p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Level A</div>
              <h3 className={styles.cardTitle}>Pack Level</h3>
              <p className={styles.cardDesc}>Baseline qualification through BMS communication, isolation testing, and fault history extraction.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Key Metrics</dt><dd>Insulation Resistance, OCV/CCV Delta, BMS Error Logs, Total Energy Throughput</dd>
                <dt>Sensors</dt><dd>HV voltage/current transducers, isolation monitor, CAN/BMS interface</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Level B</div>
              <h3 className={styles.cardTitle}>Module Level</h3>
              <p className={styles.cardDesc}>Intermediate health mapping focusing on cluster imbalance and DC internal resistance characterization.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Key Metrics</dt><dd>Capacity Spread, Inter-cell Voltage Delta, Thermal Rise, DCIR</dd>
                <dt>Sensors</dt><dd>Multi-channel voltage sense, precision current shunt, K-type thermocouples</dd>
              </dl>
            </div>
            <div className={styles.card}>
              <div className={styles.phaseNumber}>Level C</div>
              <h3 className={styles.cardTitle}>Cell Level</h3>
              <p className={styles.cardDesc}>Granular characterization using high-precision cyclers for final grading and matching.</p>
              <dl className={styles.diagnosticMeta}>
                <dt>Key Metrics</dt><dd>Measured Capacity (Ah), ACIR @ 1 kHz, Self-discharge Slope, Thermal Rise Factor</dd>
                <dt>Sensors</dt><dd>5V/10A precision cycler channels, EIS module, NTC thermal probes</dd>
              </dl>
            </div>
          </div>

          <div className={styles.propagationNote}>
            <p>⚠️ Battery failures originate at the <strong>cell level</strong> — micro-short circuits, lithium plating, SEI growth — and propagate upward through modules to the full pack. Detection must resolve at every layer.</p>
          </div>

          {/* Hierarchy diagram */}
          <div className={styles.hierarchyDiagram}>
            <HBlock icon="🔋" label="Pack" sub="800V / 60+ kWh" />
            <span className={styles.hierarchyArrow}>→</span>
            <HBlock icon="📦" label="Module" sub="12–48V clusters" />
            <span className={styles.hierarchyArrow}>→</span>
            <HBlock icon="🔬" label="Cell" sub="3.2–4.2V unit" />
            <span className={styles.hierarchyArrow}>→</span>
            <HBlock icon="♻️" label="New Pack" sub="Second-life config" />
          </div>
        </div>
      </section>

      {/* ═══ 4. HARDWARE PLATFORM ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Hardware</span>
            <h2 className={styles.sectionTitle}>Battery Diagnostic Hardware Platform</h2>
            <p className={styles.sectionSubtitle}>Real EV battery systems require continuous sensing and protection through hardware and BMS integration.</p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Physical Infrastructure</h3>
              <ul className={styles.list}>
                <li><strong>Pack Test Bench:</strong> 800V-rated isolation tester, HV discharge fixture, BMS/CAN interface harness.</li>
                <li><strong>Module Tester:</strong> 60V/100A precision load bench with per-cell voltage tapping.</li>
                <li><strong>Cell Cycler:</strong> 5V/10A multi-channel automated racks (32–128 channels).</li>
                <li><strong>Sensor Array:</strong> High-resolution voltage, current, and thermal probes (±0.1% accuracy).</li>
                <li><strong>Safety System:</strong> Emergency disconnect, fire suppression mesh, isolation monitoring, E-stop.</li>
                <li><strong>Label Printer:</strong> Industrial QR / NFC tag printer for encrypted identity stickers.</li>
              </ul>
            </div>

            <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 className={styles.cardTitle} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>System Data Flow</h3>
              <div className={styles.flowChart} style={{ background: 'transparent', border: 'none', flexDirection: 'column', padding: '0', marginBottom: 0 }}>
                <div className={styles.flowNode}>Hardware Fixture & Sensors</div>
                <div className={styles.flowArrow} style={{ transform: 'rotate(90deg)', margin: '6px 0' }}>→</div>
                <div className={styles.flowNode}>Edge Controller (MCU / PLC)</div>
                <div className={styles.flowArrow} style={{ transform: 'rotate(90deg)', margin: '6px 0' }}>→</div>
                <div className={styles.flowNode}>Platform Software</div>
                <div className={styles.flowArrow} style={{ transform: 'rotate(90deg)', margin: '6px 0' }}>→</div>
                <div className={styles.flowNode} style={{ borderColor: 'var(--accent-primary)' }}>Cloud Intelligence & Dashboard</div>
              </div>
            </div>
          </div>

          <div className={styles.calloutBlock} style={{ marginTop: '1.5rem' }}>
            <strong>Why Hardware Matters:</strong> Real EV battery systems depend on continuous sensing and protection through integrated hardware and BMS communication. Software alone cannot guarantee safety — physical isolation monitoring, emergency disconnect, and thermal sensing are non-negotiable.
          </div>
        </div>
      </section>

      {/* ═══ 5. SOFTWARE ARCHITECTURE ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Software Stack</span>
            <h2 className={styles.sectionTitle}>Software System Architecture</h2>
            <p className={styles.sectionSubtitle}>Modern EV safety systems rely on continuous monitoring, anomaly detection, and predictive analytics to prevent thermal failures.</p>
          </div>

          <div className={styles.card} style={{ padding: 0 }}>
            {[
              { num: 'L7', title: 'Dashboard & Reporting', desc: 'Visual analytics, fleet reports, predictive health modeling, and operator alerts.' },
              { num: 'L6', title: 'Identity & Traceability Engine', desc: 'Cryptographic ID generation, genealogy tracking, and audit-ready lifecycle records.' },
              { num: 'L5', title: 'Grading & Matching Logic', desc: 'Deterministic scoring algorithms and cell-matching heuristics for optimal binning.' },
              { num: 'L4', title: 'Analytics Core (SOH, SOC, IR, Temp)', desc: 'Signal processing and multi-parameter health estimation with anomaly detection.' },
              { num: 'L3', title: 'Test Execution Engine', desc: 'Automated test sequencing, charge/discharge profile management, and safety interlocks.' },
              { num: 'L2', title: 'Data Acquisition Layer', desc: 'Real-time polling from hardware controllers, BMS interfaces, and sensor arrays.' },
              { num: 'L1', title: 'Device Interface Layer', desc: 'Hardware abstraction for cyclers, load banks, isolation testers, and label printers.' },
            ].map((layer) => (
              <div className={styles.stackLayer} key={layer.num}>
                <div className={styles.layerNum}>{layer.num}</div>
                <div className={styles.layerContent}>
                  <h3 className={styles.layerTitle}>{layer.title}</h3>
                  <p className={styles.cardDesc}>{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.calloutBlock} style={{ marginTop: '2rem' }}>
            <strong>Key Capabilities:</strong> Real-time monitoring · Anomaly detection · Predictive safety scoring · Automated test sequencing · Cloud-synced digital twins
          </div>
        </div>
      </section>

      {/* ═══ 6. GRADING SYSTEM ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Qualification</span>
            <h2 className={styles.sectionTitle}>Deterministic Grading System</h2>
            <p className={styles.sectionSubtitle}>Multi-parameter qualification based on measured capacity, internal resistance, thermal stability, and safety risk.</p>
          </div>

          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <table className={styles.gradeTable}>
              <thead>
                <tr><th>Grade</th><th>Threshold</th><th>Primary Action</th><th>Target Application</th></tr>
              </thead>
              <tbody>
                <tr><td><span className={styles.gradeA}>Grade A</span></td><td>SOH &gt; 80% · IR &lt; 1.2× nominal</td><td>Full second-life reuse</td><td>EV auxiliary, high-demand storage</td></tr>
                <tr><td><span className={styles.gradeB}>Grade B</span></td><td>SOH 65–80% · IR 1.2–1.5× nominal</td><td>Stationary energy storage</td><td>Telecom backup, solar buffer</td></tr>
                <tr><td><span className={styles.gradeC}>Grade C</span></td><td>SOH 50–65% · IR 1.5–2.0× nominal</td><td>Low-load applications</td><td>LED lighting, IoT power</td></tr>
                <tr><td><span className={styles.gradeD}>Grade D</span></td><td>SOH &lt; 50% · Unstable IR / thermal</td><td>Material recovery / scrap</td><td>Recycling pipeline</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.calloutBlock} style={{ marginTop: '1.5rem' }}>
            <strong>Grading Methodology:</strong> Every cell is scored deterministically using measured capacity (Ah), internal resistance (ACIR/DCIR), self-discharge slope, and thermal rise factor under load. No subjective assessment — only data-driven classification.
          </div>
        </div>
      </section>

      {/* ═══ 7. DIGITAL IDENTITY ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Traceability</span>
            <h2 className={styles.sectionTitle}>Encrypted Battery Digital Identity</h2>
            <p className={styles.sectionSubtitle}>The foundation for the <strong>Battery Pack Aadhaar</strong> ecosystem — every cell gets a unique, tamper-proof identity.</p>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Identity Framework</h3>
              <ul className={styles.list}>
                <li><strong>QR-based Identity:</strong> Tamper-evident physical labels with encoded cell/pack metadata.</li>
                <li><strong>Encrypted Token:</strong> AES-256 crypto-link between physical label and cloud digital twin.</li>
                <li><strong>Backend Mapping:</strong> Full genealogy from origin OEM pack → disassembly → new repack configuration.</li>
                <li><strong>Genealogy Tracking:</strong> Every test, grade, owner transfer, and deployment event logged immutably.</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Identity Lifecycle</h3>
              <div className={styles.flowChart} style={{ background: 'transparent', border: 'none', padding: '1rem 0', marginBottom: 0 }}>
                <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Cell</div><span className={styles.flowArrow}>→</span>
                <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>ID Gen</div><span className={styles.flowArrow}>→</span>
                <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Sticker</div><span className={styles.flowArrow}>→</span>
                <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Scan</div><span className={styles.flowArrow}>→</span>
                <div className={styles.flowNode} style={{ fontSize: '0.8rem' }}>Cloud Twin</div><span className={styles.flowArrow}>→</span>
                <div className={styles.flowNode} style={{ fontSize: '0.8rem', borderColor: 'var(--accent-primary)' }}>History</div>
              </div>
              <div className={styles.calloutBlock} style={{ marginTop: '1rem', marginBottom: 0 }}>
                <strong>Battery Pack Aadhaar:</strong> A national-scale identity registry enabling full lifecycle traceability for every EV battery cell in India.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. THERMAL RECONFIGURATION ═══ */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Safety Engineering</span>
            <h2 className={styles.sectionTitle}>Thermal Reconfiguration for Second-Life Packs</h2>
            <p className={styles.sectionSubtitle}>Redesigned thermal management is essential to prevent heat propagation and battery failure in repacked configurations.</p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cooling Strategy</h3>
              <p className={styles.cardDesc}>Active forced-air corridors and passive heat sinks integrated into the pack housing. Dual-mode operation: fan-assisted during charge, passive during standby.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Airflow & Cell Spacing</h3>
              <p className={styles.cardDesc}>Directed airflow channels between cell clusters. Mica/ceramic propagation barriers with optimized inter-cell pitch spacing to limit thermal runaway propagation.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Heat Dissipation</h3>
              <p className={styles.cardDesc}>Structural aluminium heat sinks and thermally conductive gap fillers to manage peak charge/discharge thermal events without active liquid cooling.</p>
            </div>
          </div>

          <div className={styles.thermalPrinciples}>
            <h4 className={styles.thermalPrinciplesTitle}>Core Thermal Design Principles</h4>
            <ul className={styles.boundaryList}>
              <li><strong>Airflow / Cooling:</strong> Active forced-air corridors with dual-mode operation (fan-assisted during charge, passive during standby)</li>
              <li><strong>Cell Spacing:</strong> Optimized inter-cell pitch with mica/ceramic propagation barriers to limit thermal runaway chain reaction</li>
              <li><strong>Heat Dissipation:</strong> Structural aluminium heat sinks and thermally conductive gap fillers for peak thermal events</li>
              <li><strong>Safety Margin:</strong> Designed for 45 °C+ ambient (Indian conditions) — no dependence on external HVAC; passive safety sustains operation in non-climate-controlled environments</li>
            </ul>
          </div>

          <div className={styles.calloutBlock} style={{ marginTop: '1.5rem' }}>
            <strong>Propagation Prevention:</strong> Thermal management is critical to prevent heat propagation across cells in repacked configurations. Mica barriers, directional airflow, and optimized cell spacing form a multi-layer thermal defence.
          </div>

          <div className={styles.flowChart} style={{ marginTop: '2rem', background: 'transparent' }}>
            <div className={styles.flowNode}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack Design</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Thermal Simulation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{ borderColor: '#4ade80' }}>Final Pack</div>
          </div>
        </div>
      </section>

      {/* ═══ 9. PRODUCT ROADMAP ═══ */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Vision</span>
            <h2 className={styles.sectionTitle}>Product Roadmap</h2>
            <p className={styles.sectionSubtitle}>From MVP diagnostics platform to national-scale Battery Pack Aadhaar integration.</p>
          </div>

          <div className={styles.grid4}>
            {[
              { phase: 'Phase 1', title: 'Diagnostics Platform', pct: '100%', features: ['Pack/Module/Cell test benches', 'Data acquisition pipeline', 'Baseline SOH estimation'] },
              { phase: 'Phase 2', title: 'Grading & Identity', pct: '75%', features: ['Deterministic grading engine', 'QR/NFC identity system', 'Cloud digital twin'] },
              { phase: 'Phase 3', title: 'Repack System', pct: '45%', features: ['Cell matching algorithms', 'Mechanical pack design', 'BMS integration framework'] },
              { phase: 'Phase 4', title: 'Thermal Optimization', pct: '25%', features: ['Airflow simulation', 'Propagation barrier design', 'Rural environment validation'] },
            ].map((p) => (
              <div className={styles.phaseCard} key={p.phase}>
                <div className={styles.phaseNumber}>{p.phase}</div>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <ul className={styles.phaseFeatures}>
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <div className={styles.maturityBar}><div className={styles.maturityFill} style={{ width: p.pct }} /></div>
              </div>
            ))}
          </div>

          <div className={styles.phaseCard} style={{ marginTop: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
            <div className={styles.phaseNumber}>Phase 5</div>
            <h3 className={styles.cardTitle}>Battery Pack Aadhaar Registry Integration</h3>
            <p className={styles.cardDesc}>National-scale traceability, circular lifecycle ecosystem, and regulatory compliance framework connecting every second-life battery cell to a unified digital identity registry.</p>
          </div>
        </div>
      </section>

      {/* ═══ 10. CTA ═══ */}
      <section className={styles.pageSectionAlt} style={{ textAlign: "center", paddingBottom: "8rem" }}>
        <h2 className={styles.sectionTitle}>Engineering the Future of Battery Intelligence</h2>
        <p className={styles.sectionSubtitle} style={{ marginBottom: "2.5rem" }}>
          A real, buildable infrastructure for second-life battery diagnostics, grading, identity, and safe deployment.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/contact" className="btn btn-primary">Partner with Us</Link>
          <Link href="/contact" className="btn btn-secondary">Request System Specs</Link>
        </div>
      </section>

    </div>
  );
}
