import { CHEMISTRY_RATIONALE, estimateBatteryMassBreakdown, packSpecificEnergyTier } from "@/lib/evAutoRickshaw/battery";
import Link from "next/link";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatKWh, formatKg } from "./format";
import type { EvSimulator } from "./useSimulator";

const MASS_BREAKDOWN_COLORS: Record<string, string> = {
  cellsKg: "#4CA930",
  enclosureKg: "#7dd3fc",
  bmsContactorsBusbarsKg: "#fcd34d",
  thermalStructuralKg: "#d8b4fe",
};

const MASS_BREAKDOWN_LABELS: Record<string, string> = {
  cellsKg: "Cells",
  enclosureKg: "Enclosure",
  bmsContactorsBusbarsKg: "BMS / Contactors / Busbars",
  thermalStructuralKg: "Thermal / Structural",
};

const BMS_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Protection",
    items: [
      "Cell / pack over-voltage and under-voltage",
      "Charge and discharge over-current",
      "Short-circuit protection",
      "Over-temperature and under-temperature charge protection",
      "Contactor and pre-charge circuit monitoring",
    ],
  },
  {
    title: "Intelligence",
    items: [
      "State of Charge (SOC), State of Health (SOH), State of Power (SOP), State of Energy (SOE)",
      "Cycle count and energy throughput tracking",
      "Cell imbalance detection and degradation monitoring",
      "Remaining useful life estimation",
    ],
  },
  {
    title: "Connectivity",
    items: ["CAN bus telemetry", "On-board diagnostics", "Telematics and service-data upload", "Event history log"],
  },
  {
    title: "Battery Identity — \"Battery Passport\"",
    items: [
      "Unique battery ID and manufacturing history",
      "Vehicle association across its service life",
      "Charging history, service history and SOH history",
      "Second-life history and recycling traceability",
    ],
  },
];

export function BatterySection({ sim }: { sim: EvSimulator }) {
  const { requirement, overrides, assumptions, outputs, updateRequirement } = sim;
  const specificEnergyWhPerKg = overrides.packSpecificEnergyWhPerKg ?? assumptions.packSpecificEnergyWhPerKg;
  const specificEnergyTier = packSpecificEnergyTier(specificEnergyWhPerKg);
  const massBreakdown = estimateBatteryMassBreakdown(outputs.battery.massKg);
  const massBreakdownEntries = (["cellsKg", "enclosureKg", "bmsContactorsBusbarsKg", "thermalStructuralKg"] as const).map(
    (key) => ({ key, value: massBreakdown[key] }),
  );

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="simulated" />
      </div>
      <div className={styles.resultGrid} style={{ marginBottom: "2rem" }}>
        <Stat label="Recommended Capacity" value={formatKWh(outputs.battery.capacityKWh)} />
        <Stat label="Usable Energy" value={`${(outputs.battery.usableEnergyWh / 1000).toFixed(1)} kWh`} />
        <Stat label="Estimated Pack Weight" value={formatKg(outputs.battery.massKg)} />
        <Stat label="System Voltage" value={requirement.voltageClass} />
      </div>

      <div className={styles.cardGrid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Chemistry</div>
          <div className={styles.segmentGroup} style={{ marginBottom: "1rem" }}>
            {(["LFP", "NMC"] as const).map((chem) => (
              <button
                key={chem}
                type="button"
                className={requirement.chemistry === chem ? styles.segmentChipActive : styles.segmentChip}
                onClick={() => updateRequirement("chemistry", chem)}
              >
                {chem}
              </button>
            ))}
          </div>
          <p className={styles.cardBody}>{CHEMISTRY_RATIONALE[requirement.chemistry]}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>System Voltage Class</div>
          <div className={styles.segmentGroup} style={{ marginBottom: "1rem" }}>
            {(["60V", "72V", "76.8V", "96V"] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                className={requirement.voltageClass === cls ? styles.segmentChipActive : styles.segmentChip}
                onClick={() => updateRequirement("voltageClass", cls)}
              >
                {cls}
              </button>
            ))}
          </div>
          <p className={styles.cardBody}>
            72/76.8 V is the default recommended architecture for this duty cycle. Changing capacity, chemistry or
            voltage class updates range, mass, price, charging time and energy reserve throughout this page.
          </p>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <div className={styles.tagRow}>
          <Badge kind="target" label={`${specificEnergyTier} Pack-Level Specific Energy`} />
        </div>
        <div className={styles.cardTitle}>Estimated Pack Weight — {formatKg(outputs.battery.massKg)}</div>
        <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>
          Pack-Level Specific Energy: <strong>{specificEnergyWhPerKg.toFixed(0)} Wh/kg</strong>. Pack-level specific
          energy includes more than cells — final pack weight must be confirmed after cell selection and mechanical
          design. This is a configurable engineering assumption (see Engineering mode), not a claim about a
          specific supplier or cell chemistry.
        </p>
        <div className={styles.stackBar}>
          {massBreakdownEntries.map(({ key, value }) => (
            <div
              key={key}
              className={styles.stackSegment}
              style={{ width: `${(value / massBreakdown.totalKg) * 100}%`, background: MASS_BREAKDOWN_COLORS[key] }}
              title={`${MASS_BREAKDOWN_LABELS[key]}: ${formatKg(value)}`}
            />
          ))}
        </div>
        <div className={styles.stackLegend}>
          {massBreakdownEntries.map(({ key, value }) => (
            <div className={styles.legendItem} key={key}>
              <span className={styles.legendDot} style={{ background: MASS_BREAKDOWN_COLORS[key] }} />
              {MASS_BREAKDOWN_LABELS[key]}: {formatKg(value)}
            </div>
          ))}
        </div>
        <p className={styles.fieldHint} style={{ marginTop: "1rem" }}>
          This split is an illustrative concept-level breakdown, not a specific supplier&apos;s bill of materials —
          final proportions depend on cell format, enclosure design and cooling approach.
        </p>
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem", marginTop: "3rem", textAlign: "left" }}>
        Smart Battery Management System
      </h3>
      <div className={styles.cardGrid2}>
        {BMS_GROUPS.map((group) => (
          <div className={styles.card} key={group.title}>
            <div className={styles.cardTitle}>{group.title}</div>
            <ul className={styles.cardList}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className={styles.fieldHint} style={{ marginTop: "1rem" }}>
        The Battery Passport / Battery Aadhaar concept does not imply any regulatory approval or certification —
        it is a development objective for battery lifecycle traceability.
      </p>

      <div className={styles.disclaimer} style={{ marginTop: "2rem" }}>
        <p className={styles.disclaimerText}>
          Interested in what happens after this battery&apos;s first life? See the{" "}
          <Link href="/internships/battery-circular-economy">Battery Circular Economy</Link> project for second-life
          qualification, stationary BESS reuse and recycling economics.
        </p>
      </div>
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
