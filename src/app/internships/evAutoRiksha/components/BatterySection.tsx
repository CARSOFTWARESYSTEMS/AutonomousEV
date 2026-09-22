import { CHEMISTRY_RATIONALE } from "@/lib/evAutoRickshaw/battery";
import Link from "next/link";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatKWh, formatKg } from "./format";
import type { EvSimulator } from "./useSimulator";

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
  const { requirement, outputs, updateRequirement } = sim;

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
        <div className={styles.cardTitle}>Estimated Pack Weight — {formatKg(outputs.battery.massKg)}</div>
        <p className={styles.cardBody}>
          Derived from a configurable pack-level specific energy assumption (Wh/kg) covering cells, enclosure,
          cooling, busbars, BMS and contactors. Final weight depends on the cell supplier, enclosure design,
          cooling approach and structural protection chosen during detailed engineering.
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
