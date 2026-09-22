"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatHours, formatInr, formatInrLakh, formatKWh, formatKg, formatKm } from "./format";
import type { EvSimulator } from "./useSimulator";

/** Simple daily energy-cost estimate shown as a primary result — same tariff/efficiency inputs as the TCO section. */
function estimateDailyEnergyCostInr(sim: EvSimulator): number {
  const { requirement, outputs, assumptions, overrides } = sim;
  const chargerEfficiency = overrides.chargerEfficiency ?? assumptions.chargerEfficiency;
  const dailyEnergyKWh = (requirement.dailyDistanceKm * outputs.energy.typical.whPerKm) / 1000 / chargerEfficiency;
  return dailyEnergyKWh * assumptions.electricityTariffInrPerKWh;
}

const MASS_COLORS = {
  glider: "#3D8C26",
  battery: "#4CA930",
  driver: "#7dd3fc",
  passengers: "#fcd34d",
  luggage: "#d8b4fe",
};

export function MassBreakdownBar({ sim }: { sim: EvSimulator }) {
  const { mass } = sim.outputs;
  const total = mass.loadedMassKg;
  const segments: { key: keyof typeof MASS_COLORS; label: string; value: number }[] = [
    { key: "glider", label: "Vehicle", value: mass.gliderMassKg },
    { key: "battery", label: "Battery", value: mass.batteryMassKg },
    { key: "driver", label: "Driver", value: mass.driverMassKg },
    { key: "passengers", label: "Passengers", value: mass.passengerMassKg },
    { key: "luggage", label: "Luggage", value: mass.luggageMassKg },
  ];

  return (
    <div>
      <div className={styles.stackBar}>
        {segments.map((s) => (
          <div
            key={s.key}
            className={styles.stackSegment}
            style={{ width: `${(s.value / total) * 100}%`, background: MASS_COLORS[s.key] }}
            title={`${s.label}: ${formatKg(s.value)}`}
          />
        ))}
      </div>
      <div className={styles.stackLegend}>
        {segments.map((s) => (
          <div className={styles.legendItem} key={s.key}>
            <span className={styles.legendDot} style={{ background: MASS_COLORS[s.key] }} />
            {s.label}: {formatKg(s.value)}
          </div>
        ))}
        <div className={styles.legendItem}>
          <strong>Total loaded mass: {formatKg(total)}</strong>
        </div>
      </div>
    </div>
  );
}

export function RecommendationPanel({ sim }: { sim: EvSimulator }) {
  const { outputs, requirement } = sim;
  const isWithinBudget = outputs.budgetStatus === "within-budget";
  const [showDetails, setShowDetails] = useState(false);
  const dailyEnergyCostInr = estimateDailyEnergyCostInr(sim);

  return (
    <div className={styles.resultPanel}>
      <div className={styles.resultCard}>
        <div className={styles.tagRow}>
          <Badge kind="simulated" />
        </div>
        <div className={styles.resultHeading}>Recommended Configuration</div>
        <div className={styles.resultTitle}>EV Auto City — D+{requirement.passengerCapacity}</div>

        <div className={styles.primaryStatGrid}>
          <PrimaryStat label="Estimated Vehicle Price" value={formatInrLakh(outputs.cost.sellingPriceInr)} testId="result-selling-price" />
          <PrimaryStat label="Estimated Practical Range" value={formatKm(outputs.range.typicalKm)} testId="result-range" />
          <PrimaryStat label="Battery" value={formatKWh(outputs.battery.capacityKWh)} />
          <PrimaryStat label="Energy Cost / Day" value={`₹${formatInr(dailyEnergyCostInr)}`} />
        </div>

        <span className={isWithinBudget ? styles.statusWithin : styles.statusAbove}>
          {isWithinBudget ? "Within Budget" : "Above Target Budget"}
        </span>

        <button
          type="button"
          className={styles.secondaryStatToggle}
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
        >
          {showDetails ? "Hide" : "Show"} secondary details {showDetails ? "▴" : "▾"}
        </button>

        {showDetails ? (
          <div className={styles.resultGrid} style={{ marginTop: "0.75rem" }}>
            <Stat label="System Voltage" value={requirement.voltageClass} />
            <Stat label="Motor (Peak)" value={`${outputs.powertrain.peakPowerKw.toFixed(1)} kW`} />
            <Stat label="Battery Mass" value={formatKg(outputs.battery.massKg)} />
            <Stat label="Loaded Mass" value={formatKg(outputs.mass.loadedMassKg)} />
            <Stat label="Recommended Charger" value={outputs.charging.recommendedCharger} />
            <Stat label="Full Charge (0–100%)" value={formatHours(outputs.charging.hoursToTarget)} />
            <Stat label="Estimated BOM" value={formatInrLakh(outputs.cost.manufacturingCostInr)} />
            <Stat label="Energy Cost" value={`${outputs.energy.typical.whPerKm.toFixed(0)} Wh/km`} />
            <Stat label="Target Budget" value={formatInrLakh(requirement.targetPriceInr)} />
          </div>
        ) : null}

        <a href="#vehicle" className={styles.linkButton} style={{ marginTop: "1rem" }}>
          View Full Engineering Specification
        </a>
      </div>

      <div className={styles.resultCard}>
        <div className={styles.resultHeading}>Mass Breakdown</div>
        <MassBreakdownBar sim={sim} />
      </div>

      <ConfigurationAssessment sim={sim} />
    </div>
  );
}

function PrimaryStat({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className={styles.primaryStat}>
      <span className={styles.primaryStatLabel}>{label}</span>
      <span className={styles.primaryStatValue} data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className={styles.resultStat}>
      <span className={styles.resultStatLabel}>{label}</span>
      <span className={styles.resultStatValue} data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

export function ConfigurationAssessment({ sim }: { sim: EvSimulator }) {
  const { warnings } = sim.outputs;

  if (warnings.length === 0) {
    return (
      <div className={styles.resultCard}>
        <div className={styles.resultHeading}>Configuration Assessment</div>
        <div className={styles.assessmentSuitable}>
          <strong>Suitable —</strong>&nbsp;the selected vehicle meets current conceptual duty-cycle assumptions.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultHeading}>Configuration Assessment</div>
      <div className={styles.warningList}>
        {warnings.map((w) => (
          <div key={w.title} className={w.severity === "caution" ? styles.warningCardCaution : styles.warningCard}>
            <div>
              <div className={styles.warningTitle}>{w.title}</div>
              <div className={styles.warningMessage}>{w.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileResultBar({ sim, onOpenDetails }: { sim: EvSimulator; onOpenDetails: () => void }) {
  const { outputs } = sim;
  return (
    <div className={styles.mobileBar}>
      <div>
        <div className={styles.mobileBarStats}>
          {formatInrLakh(outputs.cost.sellingPriceInr)} · {formatKm(outputs.range.typicalKm)} ·{" "}
          {formatKWh(outputs.battery.capacityKWh)}
        </div>
        <div className={styles.mobileBarSub}>
          {outputs.budgetStatus === "within-budget" ? "Within budget" : "Above target budget"}
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={onOpenDetails}>
        View Configuration
      </button>
    </div>
  );
}
