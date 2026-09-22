"use client";

import { useMemo, useState } from "react";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatHours, formatInrLakh } from "./format";
import type { EvSimulator } from "./useSimulator";

export function ChargingSection({ sim }: { sim: EvSimulator }) {
  const { requirement, outputs } = sim;
  const { charging } = outputs;

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="simulated" />
      </div>

      <div className={styles.cardGrid3} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>3.3 kW Standard</div>
          <p className={styles.cardBody}>Recommended default for overnight home/depot charging.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>6.6 kW Fleet</div>
          <p className={styles.cardBody}>Optional for higher daily utilization or opportunity charging windows.</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Battery Swap</div>
          <p className={styles.cardBody}>Optional ecosystem — evaluated separately below, cost included explicitly.</p>
        </div>
      </div>

      <div className={styles.resultGrid} style={{ marginBottom: "1rem" }}>
        <Stat label="Energy Required" value={`${(charging.energyRequiredWh / 1000).toFixed(1)} kWh`} />
        <Stat label="Time to 80%" value={formatHours(charging.hoursTo80)} />
        <Stat label="Time to Target SOC" value={formatHours(charging.hoursToTarget)} />
        <Stat label="Recommended Charger" value={charging.recommendedCharger} />
      </div>

      <p className={styles.bodyText}>{charging.recommendationNote}</p>
      <p className={styles.fieldHint}>
        Actual charging time depends on battery temperature, BMS current limits, charger behaviour, state of
        charge and cell chemistry. High-power DC fast charging is a research/future option only, not part of the
        default fixed-battery configuration.
      </p>

      <div className={styles.card} style={{ marginTop: "1.5rem", maxWidth: 480 }}>
        <ToggleRow
          label="Enable Battery Swapping"
          checked={requirement.swappingEnabled}
          onChange={(v) => sim.updateRequirement("swappingEnabled", v)}
        />
      </div>

      {requirement.swappingEnabled ? <SwapEconomics /> : null}

      <FleetChargingPlanner />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.resultStat}>
      <span className={styles.resultStatLabel}>{label}</span>
      <span className={styles.resultStatValue}>{value}</span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={styles.toggleRow}>
      <span className={styles.fieldLabel}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? styles.toggleOn : styles.toggle}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleKnob} />
      </button>
    </div>
  );
}

function SwapEconomics() {
  const infrastructureCostInr = 1250000; // per station, planning placeholder
  const vehicleAddOnInr = 12000;

  return (
    <div className={styles.cardGrid2} style={{ marginTop: "1.5rem" }}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Vehicle Cost</div>
        <p className={styles.cardBody}>
          Swap-compatible enclosure, high-cycle connectors, locking system and battery authentication add
          approximately <strong>{formatInrLakh(vehicleAddOnInr)}</strong> to the per-vehicle BOM — already reflected
          in the Cost section when swapping is enabled.
        </p>
      </div>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Infrastructure Cost</div>
        <p className={styles.cardBody}>
          A swap station (charging rack, batteries in rotation, battery-management cloud) is a separate planning
          estimate of roughly <strong>{formatInrLakh(infrastructureCostInr)}</strong> per station — not a per-vehicle
          cost, and not included in the vehicle BOM.
        </p>
      </div>
      <p className={styles.fieldHint} style={{ gridColumn: "1 / -1" }}>
        Architecture: Vehicle ↕ Battery Cassette ↕ Swap Station ↕ Charging Rack ↕ Battery Management Cloud. Fixed
        battery remains the default cost-optimized configuration — swapping is opt-in.
      </p>
    </div>
  );
}

function FleetChargingPlanner() {
  const [fleetSize, setFleetSize] = useState(20);
  const [batteryPerVehicleKWh, setBatteryPerVehicleKWh] = useState(12);
  const [dailyKmPerVehicle, setDailyKmPerVehicle] = useState(120);
  const [chargerCount, setChargerCount] = useState(8);
  const [chargerKw, setChargerKw] = useState(3.3);
  const [solarEnabled, setSolarEnabled] = useState(false);
  const [bessEnabled, setBessEnabled] = useState(false);

  const result = useMemo(() => {
    const whPerKmAssumption = 90; // planning-level assumption, independent of the vehicle simulator
    const usableEnergyPerVehicleKWh = batteryPerVehicleKWh * 0.85; // usable SOC window, planning-level
    const demandedEnergyPerVehicleKWh = (dailyKmPerVehicle * whPerKmAssumption) / 1000;
    // A vehicle cannot draw more than its own pack holds on a single daily charge — if the
    // duty cycle demands more, it implies multiple charge cycles/day (opportunity charging).
    const dailyEnergyPerVehicleKWh = Math.min(demandedEnergyPerVehicleKWh, usableEnergyPerVehicleKWh);
    const fleetDailyEnergyKWh = dailyEnergyPerVehicleKWh * fleetSize;
    const connectedLoadKw = chargerCount * chargerKw;
    const managedLoadKw = connectedLoadKw * 0.7; // typical managed-charging diversity factor
    const bessCapacityKWh = bessEnabled ? fleetDailyEnergyKWh * 0.3 : 0;
    const infraCostInr = chargerCount * (chargerKw >= 6 ? 45000 : 28000) + (bessEnabled ? bessCapacityKWh * 12000 : 0) + (solarEnabled ? 900000 : 0);

    return { fleetDailyEnergyKWh, connectedLoadKw, managedLoadKw, bessCapacityKWh, infraCostInr };
  }, [fleetSize, batteryPerVehicleKWh, dailyKmPerVehicle, chargerCount, chargerKw, solarEnabled, bessEnabled]);

  return (
    <div className={styles.card} style={{ marginTop: "2rem" }}>
      <div className={styles.tagRow}>
        <Badge kind="cost" label="Planning Estimate" />
      </div>
      <div className={styles.cardTitle}>Fleet Charging + BESS Planner</div>
      <p className={styles.cardBody} style={{ marginBottom: "1.25rem" }}>
        Grid / Solar → BESS → Energy Management System → EV Chargers / Charging Rack → EV Fleet. These are planning
        estimates, not electrical-system designs — a licensed electrical contractor must size the actual site.
      </p>

      <div className={styles.cardGrid2}>
        <NumberField label="Fleet Size (vehicles)" value={fleetSize} min={1} max={100} onChange={setFleetSize} />
        <NumberField label="Battery per Vehicle (kWh)" value={batteryPerVehicleKWh} min={8} max={16} onChange={setBatteryPerVehicleKWh} />
        <NumberField label="Daily km per Vehicle" value={dailyKmPerVehicle} min={40} max={250} onChange={setDailyKmPerVehicle} />
        <NumberField label="Number of Chargers" value={chargerCount} min={1} max={100} onChange={setChargerCount} />
      </div>

      <div className={styles.field} style={{ marginTop: "1rem" }}>
        <span className={styles.fieldLabel}>Charger Rating</span>
        <div className={styles.segmentGroup}>
          {[3.3, 6.6].map((kw) => (
            <button
              key={kw}
              type="button"
              className={chargerKw === kw ? styles.segmentChipActive : styles.segmentChip}
              onClick={() => setChargerKw(kw)}
            >
              {kw} kW
            </button>
          ))}
        </div>
      </div>

      <div className={styles.toggleRow} style={{ marginTop: "1rem" }}>
        <ToggleRow label="Optional Solar" checked={solarEnabled} onChange={setSolarEnabled} />
      </div>
      <div className={styles.toggleRow} style={{ marginTop: "0.5rem" }}>
        <ToggleRow label="Optional BESS" checked={bessEnabled} onChange={setBessEnabled} />
      </div>

      <div className={styles.resultGrid} style={{ marginTop: "1.5rem" }}>
        <Stat label="Fleet Daily Energy" value={`${result.fleetDailyEnergyKWh.toFixed(0)} kWh`} />
        <Stat label="Connected Charger Load" value={`${result.connectedLoadKw.toFixed(1)} kW`} />
        <Stat label="Managed Charging Load (est.)" value={`${result.managedLoadKw.toFixed(1)} kW`} />
        {bessEnabled ? <Stat label="Approx. BESS Capacity" value={`${result.bessCapacityKWh.toFixed(0)} kWh`} /> : null}
        <Stat label="Estimated Infrastructure Cost" value={formatInrLakh(result.infraCostInr)} />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.fieldValue}>{value}</span>
      </div>
      <input
        className={styles.slider}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
