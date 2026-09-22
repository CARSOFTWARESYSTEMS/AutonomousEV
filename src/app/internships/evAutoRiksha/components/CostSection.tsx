import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatInr, formatInrLakh, formatPct } from "./format";
import type { EvSimulator } from "./useSimulator";

const GROUP_LABELS: Record<string, string> = {
  battery: "Battery",
  powertrain: "Powertrain",
  chassisBody: "Chassis / Body",
  electricalElectronics: "Electrical / Electronics",
  suspensionBrakesWheels: "Suspension / Brakes / Wheels",
  assemblyWarrantyOther: "Assembly / Warranty / Other",
};

const GROUP_COLORS: Record<string, string> = {
  battery: "#4CA930",
  powertrain: "#7dd3fc",
  chassisBody: "#fcd34d",
  electricalElectronics: "#d8b4fe",
  suspensionBrakesWheels: "#fb923c",
  assemblyWarrantyOther: "#94a3b8",
};

function rows(cost: EvSimulator["outputs"]["cost"]) {
  return {
    batteryCellsPackInr: cost.batteryCellsPackInr,
    bmsInr: cost.bmsInr,
    motorControllerInr: cost.motorControllerInr,
    chargerInr: cost.chargerInr,
    dcDcInr: cost.dcDcInr,
    chassisBodyInr: cost.chassisBodyInr,
    suspensionBrakesWheelsInr: cost.suspensionBrakesWheelsInr,
    electricalElectronicsInr: cost.electricalElectronicsInr,
    interiorAcInr: cost.interiorAcInr,
    swapReadyInr: cost.swapReadyInr,
  };
}

const ROW_LABELS: Record<string, string> = {
  batteryCellsPackInr: "Battery cells / pack",
  bmsInr: "BMS",
  motorControllerInr: "Motor + controller",
  chargerInr: "Charger",
  dcDcInr: "DC-DC converter",
  chassisBodyInr: "Chassis / body",
  suspensionBrakesWheelsInr: "Suspension, brakes, wheels/tyres",
  electricalElectronicsInr: "Electrical harness, VCU, cluster, telematics",
  interiorAcInr: "Interior / seating / lighting (+AC if enabled)",
  swapReadyInr: "Swap-readiness hardware",
};

export function CostSection({ sim }: { sim: EvSimulator }) {
  const { outputs, requirement } = sim;
  const { cost } = outputs;
  const componentRows = rows(cost);

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="cost" />
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left" }}>
        Component BOM
      </h3>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(componentRows)
              .filter(([, v]) => v > 0)
              .map(([key, value]) => (
                <tr key={key}>
                  <td>{ROW_LABELS[key]}</td>
                  <td>₹{formatInr(value)}</td>
                </tr>
              ))}
            <tr>
              <td>Subtotal — components</td>
              <td>₹{formatInr(cost.subtotalComponentsInr)}</td>
            </tr>
            <tr>
              <td>Assembly + overhead</td>
              <td>₹{formatInr(cost.assemblyOverheadInr)}</td>
            </tr>
            <tr>
              <td>Warranty reserve</td>
              <td>₹{formatInr(cost.warrantyReserveInr)}</td>
            </tr>
            <tr>
              <td>Logistics</td>
              <td>₹{formatInr(cost.logisticsInr)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.cardGrid3} style={{ margin: "1.5rem 0" }}>
        <div className={styles.card}>
          <div className={styles.resultStatLabel}>Manufacturing Cost</div>
          <div className={styles.resultTitle} style={{ marginBottom: 0 }}>{formatInrLakh(cost.manufacturingCostInr)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.resultStatLabel}>Dealer + OEM Margin</div>
          <div className={styles.resultTitle} style={{ marginBottom: 0 }}>{formatInrLakh(cost.distributionMarginInr)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.resultStatLabel}>Indicative Selling Price</div>
          <div className={styles.resultTitle} style={{ marginBottom: 0, color: "var(--accent-primary)" }}>
            {formatInrLakh(cost.sellingPriceInr)}
          </div>
        </div>
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "2.5rem" }}>
        Cost Contribution by Group
      </h3>
      <div className={styles.allocBar}>
        {Object.entries(cost.shareByGroup).map(([key, share]) => (
          <div className={styles.allocRow} key={key}>
            <span className={styles.allocLabel}>{GROUP_LABELS[key]}</span>
            <div className={styles.allocTrack}>
              <div
                className={styles.allocFill}
                style={{ width: `${share * 100}%`, background: GROUP_COLORS[key] }}
              />
            </div>
            <span className={styles.allocValue}>{formatPct(share * 100, 0)}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "2.5rem" }}>
        Design to My Budget
      </h3>
      <p className={styles.bodyText}>
        Target purchase price: <strong>{formatInrLakh(requirement.targetPriceInr)}</strong>. Estimated selling
        price at the current configuration: <strong>{formatInrLakh(cost.sellingPriceInr)}</strong>.{" "}
        {outputs.budgetStatus === "within-budget"
          ? "This configuration is within the target budget."
          : "This configuration exceeds the target budget — see the cost-reduction priority order below."}
      </p>
      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          <strong>Safety-critical systems are never an optimization variable.</strong> When a configuration exceeds
          budget, reduce cost in this order: excess battery capacity, excess motor capacity, premium display,
          advanced telematics/software tier, premium trim, AC, 6.6 kW charger, swapping hardware — never braking
          safety, structural safety, BMS/HV protection, battery enclosure safety, required lighting or connector
          safety.
        </p>
      </div>
    </>
  );
}
