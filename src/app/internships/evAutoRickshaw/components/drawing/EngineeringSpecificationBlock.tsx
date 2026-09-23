import { packSpecificEnergyTier } from "@/lib/evAutoRickshaw/battery";
import type { VehicleDimensions } from "@/lib/evAutoRickshaw/dimensions";
import type { CustomerRequirement, SimulatorAssumptions, SimulatorOutputs } from "@/lib/evAutoRickshaw/types";
import styles from "../../page.module.css";
import { Badge } from "../Badge";
import { formatHours, formatKWh, formatKg, formatKm } from "../format";

function SpecTable({ title, rows, badge }: { title: string; rows: [string, string][]; badge?: "target" | "simulated" }) {
  return (
    <div className={styles.card}>
      {badge ? (
        <div className={styles.tagRow}>
          <Badge kind={badge} />
        </div>
      ) : null}
      <div className={styles.cardTitle} style={{ fontSize: "0.85rem" }}>{title}</div>
      <table style={{ width: "100%", fontSize: "0.78rem", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={{ padding: "0.3rem 0", color: "var(--text-muted)" }}>{label}</td>
              <td style={{ padding: "0.3rem 0", textAlign: "right", color: "var(--text-primary)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EngineeringSpecificationBlock({
  outputs,
  requirement,
  assumptions,
  dimensions,
}: {
  outputs: SimulatorOutputs;
  requirement: CustomerRequirement;
  assumptions: SimulatorAssumptions;
  dimensions: VehicleDimensions;
}) {
  return (
    <div className={styles.cardGrid3}>
      <SpecTable
        title="MASS"
        rows={[
          ["Glider (ex-battery)", formatKg(outputs.mass.gliderMassKg)],
          ["Battery", formatKg(outputs.mass.batteryMassKg)],
          ["Kerb Mass", formatKg(outputs.mass.kerbMassKg)],
          ["Driver", formatKg(outputs.mass.driverMassKg)],
          ["Passengers", formatKg(outputs.mass.passengerMassKg)],
          ["Luggage", formatKg(outputs.mass.luggageMassKg)],
          ["Loaded Vehicle Mass (GVW)", formatKg(outputs.mass.loadedMassKg)],
        ]}
      />

      <SpecTable
        title="DIMENSIONS"
        badge="target"
        rows={[
          ["Overall Length", `${dimensions.overallLengthMm} mm`],
          ["Overall Width", `${dimensions.overallWidthMm} mm`],
          ["Overall Height", `${dimensions.overallHeightMm} mm`],
          ["Wheelbase", `${dimensions.wheelbaseMm} mm`],
          ["Front Track", `${dimensions.frontTrackMm} mm`],
          ["Rear Track", `${dimensions.rearTrackMm} mm`],
          ["Ground Clearance", `${dimensions.groundClearanceMm} mm`],
          ["Wheel Diameter", `${dimensions.wheelDiameterMm.toFixed(0)} mm`],
        ]}
      />

      <SpecTable
        title="POWERTRAIN"
        badge="simulated"
        rows={[
          ["Motor Type", "PMSM / IPM (baseline)"],
          ["Continuous Power", `${outputs.powertrain.continuousPowerKw.toFixed(1)} kW`],
          ["Peak Power", `${outputs.powertrain.peakPowerKw.toFixed(1)} kW`],
          ["Nominal Voltage", requirement.voltageClass],
          ["Top Speed Target", `${requirement.maxSpeedKmh} km/h`],
          [
            "Sustained Gradeability",
            `${outputs.powertrain.sustainedGradeabilityPct.toFixed(1)}% @ ${outputs.powertrain.gradeSpeedKmh} km/h`,
          ],
          [
            "Hill-Start Status",
            outputs.powertrain.hillStartGradeabilityPct !== null
              ? `${outputs.powertrain.hillStartGradeabilityPct.toFixed(1)}%`
              : "Requires torque-curve validation",
          ],
        ]}
      />

      <SpecTable
        title="BATTERY"
        badge="simulated"
        rows={[
          ["Chemistry", requirement.chemistry],
          ["Capacity", formatKWh(outputs.battery.capacityKWh)],
          ["Usable Energy", `${(outputs.battery.usableEnergyWh / 1000).toFixed(1)} kWh`],
          ["Nominal Voltage", requirement.voltageClass],
          [
            "Pack Specific Energy",
            `${assumptions.packSpecificEnergyWhPerKg.toFixed(0)} Wh/kg (${packSpecificEnergyTier(assumptions.packSpecificEnergyWhPerKg)})`,
          ],
          ["Estimated Pack Mass", formatKg(outputs.battery.massKg)],
          ["BMS", "Full protection / intelligence / connectivity (see Battery section)"],
          ["Ingress Protection Target", "Not yet modelled — Engineering Assumption pending"],
        ]}
      />

      <SpecTable
        title="CHARGING"
        badge="simulated"
        rows={[
          ["Onboard Charger", outputs.charging.recommendedCharger],
          [
            "Charging Availability",
            requirement.chargingAvailability === "overnight"
              ? "Overnight only"
              : requirement.chargingAvailability === "overnight-opportunity"
                ? "Overnight + opportunity"
                : requirement.chargingAvailability === "fleet-depot"
                  ? "Fleet depot"
                  : "Battery swapping",
          ],
          ["0–80% Estimate", formatHours(outputs.charging.hoursTo80)],
          ["Full Charge Estimate", formatHours(outputs.charging.hoursToTarget)],
          ["Charging Window", `${outputs.charging.availableWindowHours} h`],
        ]}
      />

      <SpecTable
        title="PERFORMANCE — SIMULATED"
        badge="simulated"
        rows={[
          ["Light-Load Range", formatKm(outputs.range.lightLoadKm)],
          ["Typical (Practical) Range", formatKm(outputs.range.typicalKm)],
          ["Full-Load / Severe Range", formatKm(outputs.range.fullLoadKm)],
          ["Top Speed Target", `${requirement.maxSpeedKmh} km/h`],
          ["Energy Consumption", `${outputs.energy.typical.whPerKm.toFixed(0)} Wh/km`],
          ["Front Axle Load", "To Be Calculated During Detailed Packaging"],
          ["Rear Axle Load", "To Be Calculated During Detailed Packaging"],
          ["CG / Axle Load Analysis", "Pending detailed packaging"],
        ]}
      />
    </div>
  );
}
