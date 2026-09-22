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

const COST_REDUCTION_PRIORITY = [
  "Excess battery capacity",
  "Excess motor capacity",
  "Premium software tier",
  "Premium display / trim",
  "Air conditioning",
  "6.6 kW charger",
  "Swap-readiness hardware",
];

export function CostSection({ sim }: { sim: EvSimulator }) {
  const { outputs, requirement } = sim;
  const { cost } = outputs;
  const componentRows = rows(cost);

  const marginInr = requirement.targetPriceInr - cost.sellingPriceInr;
  const isOverBudget = marginInr < 0;

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="cost" />
      </div>

      {/* Lead with the answer a non-engineer actually wants. */}
      <div className={styles.resultCard} style={{ maxWidth: 420, marginBottom: "2rem" }}>
        <div className={styles.resultHeading}>Estimated Selling Price</div>
        <div className={styles.resultTitle} style={{ fontSize: "2rem", color: "var(--accent-primary)" }}>
          {formatInrLakh(cost.sellingPriceInr)}
        </div>
        <p className={styles.fieldHint}>
          Manufacturing cost {formatInrLakh(cost.manufacturingCostInr)} + dealer/OEM margin{" "}
          {formatInrLakh(cost.distributionMarginInr)}.
        </p>
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left" }}>
        Where Does the Money Go?
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
      <div className={styles.cardGrid3} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.card}>
          <div className={styles.resultStatLabel}>Target Price</div>
          <div className={styles.resultTitle} style={{ marginBottom: 0 }}>{formatInrLakh(requirement.targetPriceInr)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.resultStatLabel}>Current Estimate</div>
          <div className={styles.resultTitle} style={{ marginBottom: 0 }}>{formatInrLakh(cost.sellingPriceInr)}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.resultStatLabel}>{isOverBudget ? "Over Budget" : "Remaining Margin"}</div>
          <div
            className={styles.resultTitle}
            style={{ marginBottom: 0, color: isOverBudget ? "#fca5a5" : "var(--accent-primary)" }}
          >
            {isOverBudget ? "+" : ""}
            {formatInrLakh(Math.abs(marginInr))}
          </div>
        </div>
      </div>

      {isOverBudget ? (
        <div className={styles.warningCardCaution} style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className={styles.warningTitle}>Cost-Optimization Opportunities, In Order</div>
            <div className={styles.warningMessage}>
              <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
                {COST_REDUCTION_PRIORITY.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.bodyText}>This configuration is within the target budget.</p>
      )}

      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          <strong>Safety-critical systems are never an optimization variable.</strong> Braking safety, structural
          safety, BMS/HV protection, battery enclosure safety, required lighting and connector safety are never
          reduced to hit a target price.
        </p>
      </div>

      <details className={styles.accordionItem} style={{ marginTop: "2.5rem" }}>
        <summary className={styles.faqSummary}>
          <span className={styles.accordionSummaryTitle}>Detailed BOM</span>
          <span className={styles.accordionChevron}>▾</span>
        </summary>
        <div className={styles.faqBody}>
          <div className={styles.tableWrapper} style={{ marginTop: "0.5rem" }}>
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
                <tr>
                  <td>
                    <strong>Manufacturing Cost</strong>
                  </td>
                  <td>
                    <strong>₹{formatInr(cost.manufacturingCostInr)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Dealer + OEM Margin</td>
                  <td>₹{formatInr(cost.distributionMarginInr)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </>
  );
}
