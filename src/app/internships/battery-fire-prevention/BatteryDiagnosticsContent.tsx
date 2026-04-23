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
            <span>Engineering Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
            AI-Powered EV Battery Fire Prevention System
          </h1>
          <span className={styles.heroHighlight} style={{ display: 'block' }}>
            Second-Life EV Battery Intelligence Platform
          </span>
          <p className={styles.heroDesc}>
            Secure Battery Diagnostics, Grading, Traceability, & Thermal Reconfiguration for Circular EV Energy Systems. Enabling pack, module, and cell-level health assessment for safe rural energy storage applications.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#architecture" className="btn btn-primary">
              Explore Architecture
            </Link>
            <Link href="#workflow" className="btn btn-secondary">
              View Workflow
            </Link>
          </div>
        </div>
      </section>

      {/* 2. EXECUTIVE OVERVIEW */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.executiveCard}>
            <p>
              The transition to electric mobility in India has created an urgent need for sustainable end-of-life battery solutions. However, safe repurposing of 2W, 3W, and 4W batteries into stationary storage requires significantly more rigor than simple voltage checks. True circular economy demands multi-level diagnostics at pack, module, and cell resolution to identify hidden degradation, thermal anomalies, and underlying BMS faults. By merging rigorous hardware engineering with an encrypted digital identity and explicit thermal redesign frameworks, we transform used EV liability assets into highly traceable, certified, and safe energy platforms—optimised specifically for solar PV-based rural EV charging stations.
            </p>
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

      {/* 5. END-TO-END SYSTEM WORKFLOW */}
      <section className={styles.pageSectionAlt} id="workflow">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Process</span>
            <h2 className={styles.sectionTitle}>End-to-End System Workflow</h2>
          </div>
          
          <div className={styles.flowChart}>
            <div className={styles.flowNode}>Battery Reception</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Asset Registration & Quarantine</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Pack-Level Diagnostics</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Gate 1: Pack Decision</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Controlled Disassembly</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Module Diagnostics</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Gate 2: Module Decision</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Extraction</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Diagnostics</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Gate 3: Cell Grading</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>ID Stickering & Binning</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Cell Matching Engine</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>New Pack & Thermal Design</div><span className={styles.flowArrow}>→</span>
            <div className={`${styles.flowNode} ${styles.gate}`}>Gate 4: Repack Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode}>Second-Life Deployment & Tracking</div>
          </div>
          
          <div className={styles.grid4} style={{ marginTop: '2rem' }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{color: '#eab308'}}>Gate 1: Pack Decision</h3>
              <p className={styles.cardDesc}>Direct reuse candidate vs. Disassembly required vs. Immediate Scrap based on full-pack insulation and thermal scan.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{color: '#eab308'}}>Gate 2: Module Decision</h3>
              <p className={styles.cardDesc}>Can the module be repurposed as an intact block, or does severe imbalance dictate full cell-level extraction?</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{color: '#eab308'}}>Gate 3: Cell Decision</h3>
              <p className={styles.cardDesc}>Binning cells into Grades A/B/C/D based on precision capacity, internal resistance, and self-discharge criteria.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle} style={{color: '#eab308'}}>Gate 4: Repack Qualification</h3>
              <p className={styles.cardDesc}>Final end-of-line verification of the newly assembled pack, confirming BMS communication and thermal safety.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MULTI-LEVEL DIAGNOSTIC ARCHITECTURE */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Resolution</span>
            <h2 className={styles.sectionTitle}>Multi-Level Diagnostic Architecture</h2>
            <p className={styles.sectionSubtitle}>
              The depth of disassembly mapping is strategically driven by measured viability; deeper disassembly increases recovery processing costs exponentially.
            </p>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>A. Pack-Level Diagnostics</h3>
              <p className={styles.cardDesc}>Non-destructive baseline qualification.</p>
              <ul className={styles.list}>
                <li>Visual housing inspection & OCV read.</li>
                <li>High-voltage insulation resistance testing.</li>
                <li>BMS CAN communication & fault log extraction.</li>
                <li>Pack-level low-current thermal mapping.</li>
                <li>Connector & contactor health evaluation.</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>B. Module-Level Diagnostics</h3>
              <p className={styles.cardDesc}>Intermediate integrity evaluation for viable subsystems.</p>
              <ul className={styles.list}>
                <li>Module capacity testing & voltage profiling.</li>
                <li>Symmetrical DC Internal Resistance (DCIR).</li>
                <li>Inter-cell voltage imbalance tracking.</li>
                <li>Calculated self-discharge tendency.</li>
                <li>Thermal rise mapping under defined loads.</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>C. Cell-Level Diagnostics</h3>
              <p className={styles.cardDesc}>Granular characterization for final asset matching.</p>
              <ul className={styles.list}>
                <li>High-precision capacity & efficiency cycles.</li>
                <li>Impedance checks (1kHz ACIR + DCIR).</li>
                <li>Dynamic pulse response curves.</li>
                <li>Safety risk & micro-short indices.</li>
                <li>Optimal clustering & matching suitability maps.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HARDWARE PLATFORM DESIGN */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Hardware</span>
            <h2 className={styles.sectionTitle}>Hardware Architecture for Battery Intelligence</h2>
          </div>
          <div className={styles.grid3}>
             <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.1 Intake & Safety</h3>
              <ul className={styles.list}>
                <li><strong>Role:</strong> Secure quarantine & registration</li>
                <li><strong>Components:</strong> QR/NFC scanners, thermal cameras</li>
                <li><strong>Safety:</strong> E-stop mesh, insulated tools, PPE checklist</li>
                <li><strong>Data:</strong> Registration push to PostgreSQL DB</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.2 Pack Diagnostic Bench</h3>
              <ul className={styles.list}>
                <li><strong>Role:</strong> Non-destructive pack testing</li>
                <li><strong>Components:</strong> Programmable loads, insulation monitor</li>
                <li><strong>Safety:</strong> Hardware safety shutdown loop</li>
                <li><strong>Data:</strong> CAN/UART BMS comms to edge controller</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.3 Module Validation</h3>
              <ul className={styles.list}>
                <li><strong>Role:</strong> Sub-assembly integrity checks</li>
                <li><strong>Components:</strong> Medium-power cycler, precision DAQ</li>
                <li><strong>Safety:</strong> Medium-voltage isolation fixtures</li>
                <li><strong>Data:</strong> Imbalance matrices & thermal logs</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.4 Cell Diagnostic Rack</h3>
              <ul className={styles.list}>
                <li><strong>Role:</strong> Granular cell-level profiling</li>
                <li><strong>Components:</strong> Multi-channel 5V cycler banks</li>
                <li><strong>Safety:</strong> Temperature probe per fixture</li>
                <li><strong>Data:</strong> V/I curves, ACIR/DCIR to Matching Engine</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.5 Identity & Stickering</h3>
              <ul className={styles.list}>
                <li><strong>Role:</strong> Secure asset tagging</li>
                <li><strong>Components:</strong> QR printer, NFC writer</li>
                <li><strong>Safety:</strong> Tamper-evident backing material</li>
                <li><strong>Data:</strong> Encrypted token payload from backend</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>7.6 Repack & Assembly</h3>
              <ul className={styles.list}>
                <li><strong>Role:</strong> Final secondary pack construction</li>
                <li><strong>Components:</strong> Cell sorting bins, welding setups</li>
                <li><strong>Safety:</strong> Thermal pad & barrier QA tools</li>
                <li><strong>Data:</strong> End-of-line cert push to Database</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SOFTWARE PLATFORM DESIGN */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Stack</span>
            <h2 className={styles.sectionTitle}>Software Stack: From Bench Control to Intelligence</h2>
          </div>
          
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 7</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Future Ecosystem Integration</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>Battery Pack Aadhaar</span>
                <span className={styles.layerTag}>API-first Connectivity</span>
                <span className={styles.layerTag}>Remote Lab Support</span>
              </div>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 6</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Reporting & Operator Dashboard</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>React/Next.js Interface</span>
                <span className={styles.layerTag}>Quality Audits</span>
                <span className={styles.layerTag}>Historical Risk Rendering</span>
              </div>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 5</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Digital Identity & Traceability</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>Token Generation</span>
                <span className={styles.layerTag}>Genealogy DB (PostgreSQL)</span>
                <span className={styles.layerTag}>Encrypted Audit Logs</span>
              </div>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 4</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Grading & Matching Engine</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>Repack Clustering Algorithm</span>
                <span className={styles.layerTag}>Thermal Compatibility Rules</span>
                <span className={styles.layerTag}>Target Application Scorer</span>
              </div>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 3</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Analytics & Health Engine</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>SOH & SOE Models</span>
                <span className={styles.layerTag}>Self-Discharge Slopes</span>
                <span className={styles.layerTag}>Degradation Pattern Detection</span>
              </div>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 2</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Test Execution Engine</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>Test Recipe Sequencing</span>
                <span className={styles.layerTag}>Pass/Fail Rules DB</span>
                <span className={styles.layerTag}>Automation Core</span>
              </div>
            </div>
          </div>
          <div className={styles.stackLayer}>
            <div className={styles.layerNum}>Layer 1</div>
            <div className={styles.layerContent}>
              <h3 className={styles.layerTitle}>Device Interface Layer</h3>
              <div className={styles.layerTags}>
                <span className={styles.layerTag}>Instrument TCP/IP Layer</span>
                <span className={styles.layerTag}>BMS CAN Translator</span>
                <span className={styles.layerTag}>Python edge polling</span>
              </div>
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
          
          <div className={styles.grid2} style={{ marginBottom: "2rem" }}>
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
              <p className={styles.cardDesc} style={{marginTop: "0.5rem"}}>
                Grading unifies all electrical performance curves, observed thermal behaviors, latent safety indicators, and peer-cluster statistics into a deterministic qualification tier.
              </p>
            </div>
          </div>

          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <table className={styles.gradeTable}>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Observed Status</th>
                  <th>Risk Profile</th>
                  <th>Secondary Target</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.gradeA}>Grade A</td>
                  <td>Premium SOH, superb impedance, low divergence.</td>
                  <td>Negligible</td>
                  <td>Primary Solar / Peak Demand Reserve</td>
                </tr>
                <tr>
                  <td className={styles.gradeB}>Grade B</td>
                  <td>Standard SOH, moderate capacity bleed.</td>
                  <td>Low / Trackable</td>
                  <td>Base-load Station / Rural Reserve</td>
                </tr>
                <tr>
                  <td className={styles.gradeC}>Grade C</td>
                  <td>Sub-standard capacity or heightened impedance.</td>
                  <td>Elevated</td>
                  <td>Isolated Auxiliary Sub-systems only</td>
                </tr>
                <tr>
                  <td className={styles.gradeD}>Grade D</td>
                  <td>Under-voltage faults, micro-shorts, leaks.</td>
                  <td>Critical</td>
                  <td>Immediate De-energisation & Material Recycle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 10. ENCRYPTED IDENTITY */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Traceability</span>
            <h2 className={styles.sectionTitle}>Encrypted Digital Identity & Label Strategy</h2>
          </div>
          <div className={styles.grid2}>
            <div>
              <p style={{color: "var(--text-secondary)", lineHeight: 1.7}}>
                Every discrete pack, module, and cell is issued a tamper-aware digital identity via a physical sticker. The sticker QR code deliberately exposes minimal plaintext metadata while embedding an encrypted cryptographic core. When scanned by an authorised client, this token accesses the deep backend to reveal full diagnostic lineage and grading, acting as the foundational mechanism for the anticipated Battery Pack Aadhaar scheme.
              </p>
              <ul className={styles.list}>
                <li>Unique Asset ID & Component Genealogy</li>
                <li>Encrypted Payload / Auth Checksum</li>
                <li>Chain of Custody Timestamping</li>
              </ul>
            </div>
            <div className={styles.flowChart} style={{ margin: 0, padding: "1.5rem" }}>
              <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Physical Asset</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>ID Generation</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Token Storage</div><span className={styles.flowArrow}>→</span>
              <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Label Printing</div>
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

      {/* 12. THERMAL RECONFIGURATION */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Engineering Safety</span>
            <h2 className={styles.sectionTitle}>Thermal Reconfiguration & BTMS Upgrade</h2>
          </div>
          
          <div className={styles.executiveCard} style={{marginBottom: "3rem", padding: "1.5rem", fontSize: "1rem"}}>
            Repurposing entails strict thermal redesign. A cell cluster running inside an Indian rural solar charging environment will face vastly different ambient loads, static duty cycles, and passive ventilation bounds compared to its original high-speed vehicle chassis. We reconstruct the heat profile explicitly for the secondary application.
          </div>

          <div className={styles.flowChart} style={{ marginBottom: "3rem", padding: "1.5rem" }}>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Cell Matching</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>New Pack Topology</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Thermal Design Concept</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Electro-Thermal Simulation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Cost vs Performance Trade-off</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Prototype Build</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Thermal Validation</div><span className={styles.flowArrow}>→</span>
            <div className={styles.flowNode} style={{padding: "0.5rem 1rem"}}>Final Pack Design</div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Cooling Re-evaluation</h3>
              <p className={styles.cardDesc}>Transitioning from expensive cold-plate/liquid to mathematically validated forced or directed passive air corridors.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Geometric Barriers</h3>
              <p className={styles.cardDesc}>Establishing larger inter-cell spatial tolerances and non-flammable barriers to physically halt runaway propagation.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Electro-Thermal Simulation</h3>
              <p className={styles.cardDesc}>Pre-emptive simulation of the matching algorithm's proposed pack topology against peak daily solar loads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. AI / ANALYTICS ROADMAP */}
      <section className={styles.pageSectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Roadmap</span>
            <h2 className={styles.sectionTitle}>Evolution of Platform Intelligence</h2>
          </div>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Stage 1: Deterministic Engine</h3>
              <ul className={styles.list}>
                <li>Rule-based static threshold checks</li>
                <li>Boolean deterministic grading</li>
                <li>Immediate lab SOP deployment</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Stage 2: Pattern Analytics</h3>
              <ul className={styles.list}>
                <li>Historical degradation clustering</li>
                <li>Automated matching suggestions</li>
                <li>Hidden anomaly correlation</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Stage 3: Predictive ML Platform</h3>
              <ul className={styles.list}>
                <li>Remaining Useful Life (RUL) estimation</li>
                <li>Thermal event forecasting</li>
                <li>Deep predictive SOH classification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 14. ROADMAP */}
      <section className={styles.pageSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Project Execution</span>
            <h2 className={styles.sectionTitle}>MVP to Deployment Timeline</h2>
          </div>
          <div className={styles.grid4} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phase 1: Foundation</h3>
              <p className={styles.cardDesc}>Selecting target chemistry families, mapping the core grading logic, defining database schemas, and outlining the initial UI layout.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phase 2: Pilot Workbench</h3>
              <p className={styles.cardDesc}>Spinning up rudimentary edge interfaces, building the V1 diagnostic operator dashboard, and running manual trial bench assets.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phase 3: Traceability</h3>
              <p className={styles.cardDesc}>Switching to autonomous cell array cycling, rolling out encrypted QR stickers, and finalizing the repack cluster mapping engine.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phase 4: Thermal Validation</h3>
              <p className={styles.cardDesc}>Constructing physical prototype repurposed packs containing custom BTMS profiles, then testing them within live rural PV deployments.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Phase 5: Ecosystem</h3>
              <p className={styles.cardDesc}>Battery Pack Aadhaar integration, lifecycle registry APIs, remote service center analytics, and secure cloud syncing.</p>
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
              <h2 className={styles.sectionTitle} style={{fontSize: "1.8rem"}}>The Pilot Implementation</h2>
              <p style={{color: "var(--text-secondary)", marginBottom: "1.5rem"}}>
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
