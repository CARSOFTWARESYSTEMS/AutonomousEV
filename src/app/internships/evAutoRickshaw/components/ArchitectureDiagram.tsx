import styles from "../page.module.css";

const CAN_NODES = ["BMS", "VCU", "Motor Controller", "Charger", "Cluster", "Telematics"];

export function ArchitectureDiagram() {
  return (
    <div className={styles.diagram}>
      <div className={styles.diagramBoxAccent}>Battery Pack</div>
      <div className={styles.diagramArrowDown}>↓</div>
      <div className={styles.diagramBox}>BMS</div>
      <div className={styles.diagramArrowDown}>↓</div>
      <div className={styles.diagramBox}>HV Distribution / Protection</div>
      <div className={styles.diagramArrowDown}>↓</div>
      <div className={styles.diagramBox}>Motor Controller</div>
      <div className={styles.diagramArrowDown}>↓</div>
      <div className={styles.diagramBox}>PMSM Traction Motor</div>
      <div className={styles.diagramArrowDown}>↓</div>
      <div className={styles.diagramBox}>Reduction / Differential</div>
      <div className={styles.diagramArrowDown}>↓</div>
      <div className={styles.diagramBoxAccent}>Rear Wheels</div>

      <div className={styles.diagramBranch} style={{ marginTop: "1.5rem" }}>
        <div className={styles.diagramBranchCol}>
          <span className={styles.diagramCaption}>12V Supply</span>
          <div className={styles.diagramBox}>DC-DC Converter</div>
          <div className={styles.diagramArrowDown}>↓</div>
          <div className={styles.diagramBox}>12V Loads</div>
        </div>
        <div className={styles.diagramBranchCol}>
          <span className={styles.diagramCaption}>Charging</span>
          <div className={styles.diagramBox}>On-board Charger</div>
          <div className={styles.diagramArrowDown}>↓</div>
          <div className={styles.diagramBox}>Charging Port</div>
        </div>
      </div>

      <div className={styles.canBusRow}>
        <span className={styles.diagramCaption}>CAN Bus:&nbsp;</span>
        {CAN_NODES.map((node, i) => (
          <span key={node} className={styles.diagramCaption}>
            {node}
            {i < CAN_NODES.length - 1 ? " ↔ " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
