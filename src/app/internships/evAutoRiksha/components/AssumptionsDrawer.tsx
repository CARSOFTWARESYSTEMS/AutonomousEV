"use client";

import { X } from "lucide-react";
import type { SimulatorAssumptions } from "@/lib/evAutoRickshaw/types";
import styles from "../page.module.css";
import type { EvSimulator } from "./useSimulator";

const ASSUMPTION_FIELDS: { key: keyof SimulatorAssumptions; label: string; step: number }[] = [
  { key: "airDensityKgM3", label: "Air density (kg/m³)", step: 0.01 },
  { key: "rollingResistanceCoefficient", label: "Rolling resistance (Crr)", step: 0.001 },
  { key: "dragCoefficient", label: "Drag coefficient (Cd)", step: 0.01 },
  { key: "frontalAreaM2", label: "Frontal area (m²)", step: 0.05 },
  { key: "drivetrainEfficiency", label: "Drivetrain efficiency", step: 0.01 },
  { key: "chargerEfficiency", label: "Charger efficiency", step: 0.01 },
  { key: "usableSocWindow", label: "Usable SOC window", step: 0.01 },
  { key: "reserveFraction", label: "Reserve fraction", step: 0.01 },
  { key: "degradationAllowance", label: "Degradation allowance", step: 0.01 },
  { key: "packSpecificEnergyWhPerKg", label: "Pack specific energy (Wh/kg)", step: 1 },
  { key: "batteryCostPerKWhInr", label: "Battery cost (₹/kWh)", step: 100 },
  { key: "electricityTariffInrPerKWh", label: "Electricity tariff (₹/kWh)", step: 0.5 },
  { key: "loanInterestRatePct", label: "Loan interest rate (% p.a.)", step: 0.5 },
];

export function AssumptionsDrawer({ sim, onClose }: { sim: EvSimulator; onClose: () => void }) {
  const { assumptions, updateAssumption, resetAssumptions } = sim;

  return (
    <div className={styles.drawerOverlay} role="dialog" aria-modal="true" aria-label="Simulator assumptions" onClick={onClose}>
      <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>View Simulator Assumptions</h3>
          <button type="button" className={styles.drawerCloseBtn} onClick={onClose} aria-label="Close assumptions">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>
          These are concept-level planning assumptions, editable here for exploration. They are not supplier
          quotations, test results or homologated values.
        </p>

        {ASSUMPTION_FIELDS.map((field) => (
          <div className={styles.assumptionRow} key={field.key}>
            <span className={styles.assumptionLabel}>{field.label}</span>
            <input
              className={styles.assumptionInput}
              type="number"
              step={field.step}
              value={assumptions[field.key] as number}
              onChange={(e) => updateAssumption(field.key, Number(e.target.value))}
            />
          </div>
        ))}

        <button type="button" className={styles.linkButton} style={{ marginTop: "1.5rem" }} onClick={resetAssumptions}>
          Reset Assumptions
        </button>
      </div>
    </div>
  );
}
