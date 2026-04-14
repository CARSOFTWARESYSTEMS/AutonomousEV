import styles from "./page.module.css";
import Link from "next/link";

export const metadata = {
  title: "Hands-On AV Simulations | EV.ENGINEER™",
  description: "Learn the simulation lifecycle, environment modeling, and scenario testing using platforms like CARLA.",
};

export default function SimulationsPage() {
  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <header style={{ textAlign: "center", marginBottom: "64px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "16px" }}>Hands-On AV Simulations</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
          Bridging the gap between software algorithms and reality through high-fidelity virtual environments.
        </p>
      </header>

      {/* Intro Section */}
      <section className="glass-panel" style={{ borderLeft: "4px solid var(--color-accent)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>Why Simulation Matters</h2>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Testing exclusively on public roads is statistically insufficient to prove safety. Simulations allow engineers to construct highly specific edge cases, execute them deterministically across thousands of test iterations, and safely validate perception stacks against dangerous situations like sudden pedestrian crossings or sensor blindness.
        </p>
      </section>

      {/* Engineering Depth */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "32px" }}>The Simulation Lifecycle</h2>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Beginner: Environment Modeling</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>Understanding 3D game engines (Unreal/Unity). Designing maps, editing HD map definitions (OpenDRIVE), and deploying passive traffic actors.</p>
          </div>
          <div>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Mid-Level: Scenario Engineering</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>Utilizing tools like OpenSCENARIO to program reactive traffic. Simulating edge cases: sudden obstacles, sensor degradation (rain/fog), and aggressive human-AV cut-ins.</p>
          </div>
          <div>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Advanced: Integration & ROS</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>Connecting the simulator API to an external autonomy lifecycle (ROS / Autoware). Processing raw simulated LiDAR/Camera streams through the actual AV software stack in real-time.</p>
          </div>
          <div>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Validation Workflow & Logging</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>Automating parameterized tests. Capturing telemetry logic, decision analysis logs, and assessing pass/fail criteria for CI/CD pipelines.</p>
          </div>
        </div>
      </section>

      {/* CARLA Section */}
      <section className="glass-panel" style={{ background: "var(--color-surface)", marginBottom: "64px" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>The CARLA Ecosystem</h2>
        <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <p style={{ marginBottom: "16px" }}>CARLA (Car Learning to Act) is the preeminent open-source simulator for autonomous driving research. Based on Unreal Engine, it supports flexible specification of sensor suites, environmental conditions, and full control over static/dynamic actors.</p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            <li><strong>Architecture:</strong> Client-Server model. The server runs the simulation rendering and physics; the client controls the logic via Python/C++ APIs.</li>
            <li><strong>Developer Workflow:</strong> Compile source → Create map & sensors → Spawn Ego vehicle → Connect ROS Bridge → Validate stack.</li>
            <li><strong>Scenario Walkthroughs:</strong> Leverage ScenarioRunner to execute standardized NCAP (New Car Assessment Program) testing suites virtually.</li>
          </ul>
        </div>
      </section>

      {/* Simulator Catalog */}
      <section>
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>Industry AV Simulator Catalog</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Explore the ecosystem of tools used to train, test, and validate autonomous stacks.</p>
        
        <div className={styles.catalogGrid}>
          {/* CARLA */}
          <div className={`glass-panel ${styles.simCard}`}>
            <div className={styles.simHeader}>
              <span className={styles.simTitle}>CARLA</span>
              <span className={`${styles.badge} ${styles.badgeFree}`}>Open Source</span>
            </div>
            <p className={styles.simDescription}>The premier open-source academic and industry tool built on Unreal Engine.</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>Flexible Python API</span>
              <span className={styles.featureItem}>ROS / ROS 2 Bridge</span>
              <span className={styles.featureItem}>OpenDRIVE / OpenSCENARIO support</span>
            </div>
            <a href="https://carla.org/" target="_blank" rel="noreferrer" className={styles.docsLink}>Official Docs &rarr;</a>
            <div className={styles.pricingNote}>Free / Open-Source (MIT License)</div>
          </div>

          {/* LGSVL / SVL */}
          <div className={`glass-panel ${styles.simCard}`}>
            <div className={styles.simHeader}>
              <span className={styles.simTitle}>SVL Simulator</span>
              <span className={`${styles.badge} ${styles.badgeFree}`}>Open Source</span>
            </div>
            <p className={styles.simDescription}>Formerly LGSVL, a Unity-based simulator emphasizing ROS/Autoware and Apollo integration.</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>Native Autoware.Auto support</span>
              <span className={styles.featureItem}>Web-based scenario interface</span>
              <span className={styles.featureItem}>High fidelity sensor plugins</span>
            </div>
            <a href="https://www.svlsimulator.com/" target="_blank" rel="noreferrer" className={styles.docsLink}>Official Docs &rarr;</a>
            <div className={styles.pricingNote}>Free (Sunset, maintained by community)</div>
          </div>

          {/* NVIDIA Drive Sim */}
          <div className={`glass-panel ${styles.simCard}`}>
            <div className={styles.simHeader}>
              <span className={styles.simTitle}>NVIDIA DRIVE Sim</span>
              <span className={`${styles.badge} ${styles.badgeEnterprise}`}>Commercial</span>
            </div>
            <p className={styles.simDescription}>Built on Omniverse, providing physically based rendering and hyper-realistic sensor models.</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>Ray-traced sensor simulation</span>
              <span className={styles.featureItem}>Hardware-in-the-Loop (HIL)</span>
              <span className={styles.featureItem}>Digital Twin integration</span>
            </div>
            <a href="https://developer.nvidia.com/drive/simulation" target="_blank" rel="noreferrer" className={styles.docsLink}>Official Site &rarr;</a>
            <div className={styles.pricingNote}>Enterprise pricing / contact vendor</div>
          </div>

          {/* rFpro */}
          <div className={`glass-panel ${styles.simCard}`}>
            <div className={styles.simHeader}>
              <span className={styles.simTitle}>rFpro</span>
              <span className={`${styles.badge} ${styles.badgeEnterprise}`}>Commercial</span>
            </div>
            <p className={styles.simDescription}>Specializing in high-fidelity vehicle dynamics and ultra-low latency rendering for engineering validation.</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>1ms latency Driver-in-the-Loop</span>
              <span className={styles.featureItem}>Extensive digital circuit library</span>
              <span className={styles.featureItem}>Deep ADAS validation</span>
            </div>
            <a href="https://www.rfpro.com/" target="_blank" rel="noreferrer" className={styles.docsLink}>Official Site &rarr;</a>
            <div className={styles.pricingNote}>Enterprise pricing / contact vendor</div>
          </div>

          {/* MATLAB / Simulink */}
          <div className={`glass-panel ${styles.simCard}`}>
            <div className={styles.simHeader}>
              <span className={styles.simTitle}>MATLAB Automated Driving</span>
              <span className={`${styles.badge} ${styles.badgeEnterprise}`}>Commercial</span>
            </div>
            <p className={styles.simDescription}>The industry standard toolchain for model-based design, control logic, and system modeling.</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>Model-Based Design lifecycle</span>
              <span className={styles.featureItem}>Automated scenario generation</span>
              <span className={styles.featureItem}>Control system logic design</span>
            </div>
            <a href="https://www.mathworks.com/products/automated-driving.html" target="_blank" rel="noreferrer" className={styles.docsLink}>Official Site &rarr;</a>
            <div className={styles.pricingNote}>Enterprise pricing / Academic licensing</div>
          </div>
        </div>
      </section>

    </div>
  );
}
