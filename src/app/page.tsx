import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* 1. HERO BANNER */}
      <section className={styles.hero}>
        <div className={`container`}>
          <div className={styles.heroGlow} />
          <div className={styles.heroContent}>

            {/* ── Left Column ── */}
            <div className={styles.leftCol}>
              <a href="https://iTelematics.com" target="_blank" rel="noopener noreferrer" className={styles.locationBadge} style={{ textDecoration: 'none', display: 'inline-block' }}>iTelematics® Software Private Limited</a>

              <h1 className={styles.headline}>
                Engineering the{" "}<br />
                Future of{" "}
                <span className={styles.highlight}>Autonomous</span>{" "}
                <span className={styles.brandWhite}>eMobility</span>
              </h1>

              <p className={styles.subheadline}>
                Production-grade training, technical concepts, simulation-driven learning,
                cybersecurity insight, and engineering consulting for Autonomous EV systems.
              </p>

              <div className={styles.actions}>
                <Link href="/corporate-training" className="btn btn-primary">Training</Link>
                <Link href="/consulting" className="btn btn-secondary">Consulting</Link>
              </div>
            </div>

            {/* ── Right Column — Floating Cards ── */}
            <div className={styles.rightCol}>
              <div className={`${styles.floatingCard} ${styles.card1}`}>
                <p className={styles.cardTitle}>AV Architecture & RTOS</p>
                <p className={styles.cardText}>
                  ROS2/Autoware integration, deterministic scheduling, and sensor-fusion pipelines for production AV stacks.
                </p>
                <div className={styles.chipContainer} style={{ marginTop: '12px' }}>
                  {["ROS2", "Autoware", "Sensor Fusion"].map(c => (
                    <span key={c} className="pill">{c}</span>
                  ))}
                </div>
              </div>

              <Link href="/si-ems" className={`${styles.floatingCard} ${styles.card2}`} style={{ textDecoration: 'none', display: 'block' }}>
                <p className={styles.cardTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Super-Intelligent AI EMS
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>Research ›</span>
                </p>
                <p className={styles.cardText}>
                  AI-Driven Super-Intelligent Energy Management Systems for Autonomous EVs. Architectural Design & Proof-of-Concept for Level-4 Robotaxi Platforms.
                </p>
                <div className={styles.chipContainer} style={{ marginTop: '12px' }}>
                  {["BMS", "Cybersecurity", "Robotaxi"].map(c => (
                    <span key={c} className="pill">{c}</span>
                  ))}
                </div>
              </Link>

              <div className={`${styles.floatingCard} ${styles.card3}`}>
                <p className={styles.cardTitle}>AV Ecosystem</p>
                <p className={styles.cardText}>
                  CETRAN scenario testing, LTA guidelines, and Smart Nation deployment insights.
                </p>
                <div className={styles.chipContainer} style={{ marginTop: '12px' }}>
                  {["India", "Europe", "Singapore", "USA"].map(c => (
                    <span key={c} className="pill">{c}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY EV.ENGINEER™ */}
      <section className="section bg-surface">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why EV.<span className={styles.accentText}>ENGINEER™</span></h2>
            <p className={styles.sectionSubtitle}>
              A cross-functional view across AV, EV, AI, cybersecurity, diagnostics, and systems engineering. Built for real engineering teams.
            </p>
          </div>
          <div className={styles.cards3}>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Singapore Focus</h3>
              <p className={styles.cardText}>Deep understanding of the Smart Nation initiative, LTA guidelines, and CETRAN scenario testing requirements.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Engineering-Grade</h3>
              <p className={styles.cardText}>Move beyond high-level theory. We focus on ROS/Autoware architecture, RTOS constraints, and validation frameworks.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Cross-Domain View</h3>
              <p className={styles.cardText}>Connecting autonomous driving stack with underlying EV battery telemetry, security, and cloud logistics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRAINING TRACKS */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Training Tracks</h2>
            <p className={styles.sectionSubtitle}>Curriculums tailored to your audience's technical depth.</p>
          </div>
          <div className={styles.cards4}>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Executive Track</h3>
              <p className={styles.cardText}>For executives and directors focusing on strategy, ROI, compliance, and deployment pipelines.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Non-Technical</h3>
              <p className={styles.cardText}>For policy makers, managers, and risk teams dealing with ethics, insurance, and governance.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Engineer Track</h3>
              <p className={styles.cardText}>Mid-level deep dive into sensors, sensor fusion, basic controls, and component interactions.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Architect Track</h3>
              <p className={styles.cardText}>Advanced path exploring ROS integration, RTOS scheduling, deterministic timing, and edge cases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SINGAPORE AV ECOSYSTEM */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Navigating the Singapore AV Ecosystem</h2>
            <p className={styles.sectionSubtitle}>Aligned with one of the world's most advanced smart mobility landscapes.</p>
          </div>
          <div className={styles.cards2}>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>CETRAN & LTA Alignment</h3>
              <p className={styles.cardText}>Understand the rigorous testing scenarios required for public road deployment. We cover the scenario-based testing importance and certification thinking specific to Singapore's regulatory environment.</p>
              <br/>
              <Link href="/ecosystem/singapore" className="btn btn-secondary">Explore Ecosystem</Link>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Pilots & Deployments</h3>
              <p className={styles.cardText}>From NTU pilots and Punggol shuttles to Jurong Island cargo automation. Learn from real-world deployments and apply those insights to your architecture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIMULATION PLATFORM HIGHLIGHTS */}
      <section className="section bg-surface">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Simulation-Driven Learning</h2>
            <p className={styles.sectionSubtitle}>Validate before you build. Hands-on exposure to the AV simulation lifecycle.</p>
          </div>
          <div className={styles.cards3}>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Scenario Engineering</h3>
              <p className={styles.cardText}>Design complex edge cases: pedestrian crossings, sudden obstacles, and human-AV interactions.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Sensor Degradation</h3>
              <p className={styles.cardText}>Simulate rain, shadows, and sensor occlusion to validate perception AI resilience.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>CARLA & ROS</h3>
              <p className={styles.cardText}>Learn the integration path between Carla and ROS/Autoware pipelines for closed-loop testing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. USE CASES */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Key Use Cases</h2>
          </div>
          <div className={styles.cards2}>
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <h3 className={styles.cardTitle}>Autonomous Passenger Taxi</h3>
              <p className={styles.cardText}>End-to-end design lifecycle for urban ride services. Covering passenger safety, fleet operations, ITS integration, and urban cybersecurity risks.</p>
              <br/>
              <Link href="/design-development/passenger-taxi" className="btn btn-secondary">View Lifecycle</Link>
            </div>
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <h3 className={styles.cardTitle}>Autonomous Airport Cargo EV</h3>
              <p className={styles.cardText}>Closed-loop environment architectures. Duty-cycle analysis, geofencing, cargo workflow mapping, and logistics system integrations.</p>
              <br/>
              <Link href="/design-development/airport-cargo" className="btn btn-secondary">View Lifecycle</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CYBERSECURITY + BATTERY INTELLIGENCE */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Security & Diagnostic Intelligence</h2>
          </div>
          <div className={styles.cards2}>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Cybersecurity in AV</h3>
              <p className={styles.cardText}>Protecting attack surfaces: in-vehicle networks, OTA updates, V2X risks, and sensor spoofing. Secure architecture principles for autonomous fleets.</p>
              <br/>
              <Link href="/cybersecurity" className="btn btn-secondary">Learn More</Link>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Battery Health & Diagnostics</h3>
              <p className={styles.cardText}>Thermal risk, predictive maintenance, and lifecycle operations specific to non-stop AV duty cycles. Ensuring fleet availability through battery IQ.</p>
              <br/>
              <Link href="/battery-diagnostics" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CORPORATE OFFERINGS */}
      <section className="section bg-surface">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Enterprise Action Paths</h2>
          </div>
          <div className={styles.cards4}>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Corporate Training</h3>
              <p className={styles.cardText}>On-site or remote workshops tailored to your team's specific AV capabilities.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Technical Advisory</h3>
              <p className={styles.cardText}>Roadmap generation and feasibility studies for emerging AV teams.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Consulting</h3>
              <p className={styles.cardText}>Deep integration consulting covering AV stacks, battery diagnostics, and deployment validation.</p>
            </div>
            <div className="glass-panel">
              <h3 className={styles.cardTitle}>Architecture Reviews</h3>
              <p className={styles.cardText}>Rigorous analysis of your system design, functional safety, and simulation pipeline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="section" style={{ padding: "120px 0", textAlign: "center" }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Ready to Engineer the Future?</h2>
          <p className={styles.sectionSubtitle} style={{ marginBottom: "40px" }}>
            Partner with iTelematics® and transform your EV and AV strategies.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/corporate-training" className="btn btn-primary">Start Training</Link>
            <Link href="/consulting" className="btn btn-secondary">Engage Consulting</Link>
          </div>
        </div>
      </section>
    </>
  );
}
