import styles from "../../page.module.css";

export function DrawingTitleBlock({ configLabel }: { configLabel: string }) {
  return (
    <div className={styles.card} style={{ fontSize: "0.8rem" }}>
      <div className={styles.cardTitle} style={{ marginBottom: "0.75rem" }}>EV.ENGINEER™</div>
      <TitleRow label="Project" value="EV Auto Rickshaw" />
      <TitleRow label="Drawing" value="Concept General Arrangement" />
      <TitleRow label="Vehicle" value="D+6 Electric Passenger Three-Wheeler" />
      <TitleRow label="Drawing No." value="EVAR-GA-001" />
      <TitleRow label="Revision" value="0.1" />
      <TitleRow label="Status" value="CONCEPT / R&D" accent />
      <TitleRow label="Units" value="mm unless otherwise specified" />
      <TitleRow label="Scale" value="NTS — Not To Scale" />
      <TitleRow label="Configuration" value={configLabel} />
    </div>
  );
}

function TitleRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.3rem 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ color: accent ? "var(--accent-primary)" : "var(--text-primary)", fontWeight: 700 }}>{value}</span>
    </div>
  );
}
