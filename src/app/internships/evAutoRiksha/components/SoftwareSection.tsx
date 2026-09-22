import Link from "next/link";
import styles from "../page.module.css";
import type { EvSimulator } from "./useSimulator";

const TIERS = [
  {
    id: "standard" as const,
    title: "Standard",
    items: ["SOC", "Speed", "Range estimate", "Odometer", "Warnings", "Diagnostics"],
  },
  {
    id: "connected" as const,
    title: "Connected",
    items: ["GPS location", "Mobile app", "Charging status", "Service alerts", "Vehicle location"],
  },
  {
    id: "fleet" as const,
    title: "Fleet",
    items: ["Fleet tracking", "Driver analytics", "Battery health", "Energy cost", "Utilization", "Geofencing", "Remote diagnostics"],
  },
  {
    id: "intelligence" as const,
    title: "Intelligence",
    items: ["Predictive maintenance", "Advanced SOH", "Battery passport", "Anomaly detection", "Cybersecurity monitoring", "Digital twin / historical analytics"],
  },
];

export function SoftwareSection({ sim }: { sim: EvSimulator }) {
  const { requirement, updateRequirement } = sim;

  return (
    <>
      <div className={styles.cardGrid4}>
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            type="button"
            className={requirement.softwareTier === tier.id ? styles.presetCardActive : styles.presetCard}
            onClick={() => updateRequirement("softwareTier", tier.id)}
          >
            <div className={styles.presetTitle}>{tier.title}</div>
            <ul className={styles.cardList}>
              {tier.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className={styles.disclaimer} style={{ marginTop: "2rem" }}>
        <p className={styles.disclaimerText}>
          <strong>Cybersecurity by design.</strong> CAN security, secure boot, signed firmware, authenticated
          diagnostics, OTA security, device identity, encrypted cloud communication, API security, battery and
          charger authentication, event logging and rollback protection are development objectives shared with the{" "}
          <Link href="/internships/AegisCAN">AegisCAN</Link> project — see AegisCAN for the full CAN/BMS
          cybersecurity engineering treatment rather than duplicating it here.
        </p>
      </div>
    </>
  );
}
