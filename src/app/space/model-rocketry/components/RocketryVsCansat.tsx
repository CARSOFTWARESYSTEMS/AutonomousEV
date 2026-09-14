import styles from "../model-rocketry.module.css";

export default function RocketryVsCansat() {
  return (
    <div>
      <div className={styles.systemsGrid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div className={styles.systemGroup}>
          <h4 style={{ marginBottom: 4 }}>Model Rocketry Competition</h4>
          <p style={{ fontSize: 13, color: "var(--space-blue-text)", marginBottom: 12 }}>Primary engineering focus: the launch vehicle</p>
          <p style={{ marginBottom: 10 }}>Students learn:</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--space-muted)", fontSize: 14 }}>
            <li>Aerodynamics</li>
            <li>Structural design</li>
            <li>Stability</li>
            <li>Motor selection and integration</li>
            <li>Avionics</li>
            <li>Recovery</li>
            <li>Telemetry</li>
            <li>Launch operations</li>
            <li>Systems integration</li>
          </ul>
        </div>
        <div className={styles.systemGroup}>
          <h4 style={{ marginBottom: 4 }}>CanSat Competition</h4>
          <p style={{ fontSize: 13, color: "var(--space-blue-text)", marginBottom: 12 }}>Primary engineering focus: a miniature satellite/payload mission</p>
          <p style={{ marginBottom: 10 }}>Students learn:</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--space-muted)", fontSize: 14 }}>
            <li>Mission payload design</li>
            <li>Embedded electronics</li>
            <li>Sensors</li>
            <li>Telemetry</li>
            <li>Onboard software</li>
            <li>Power</li>
            <li>Data acquisition</li>
            <li>Recovery/descent</li>
            <li>Mission operations</li>
          </ul>
        </div>
      </div>
      <div className={styles.card} style={{ padding: 20, marginTop: 20 }}>
        <h4 style={{ marginBottom: 10 }}>Where they meet</h4>
        <p style={{ marginBottom: 10 }}>Both teach:</p>
        <div className={styles.componentChips}>
          {["Requirements", "Systems engineering", "Integration", "Testing", "Documentation", "Telemetry", "Mission operations", "Teamwork", "Design reviews", "Post-mission analysis"].map(
            (t) => (
              <span key={t} className={styles.componentChip}>
                {t}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
