import { COMPETITOR_DATA_ACCESSED_DATE, COMPETITORS } from "@/lib/evAutoRickshaw/competitors";
import styles from "../page.module.css";
import { Badge } from "./Badge";
import { formatInrLakh, formatKWh, formatKg, formatKm } from "./format";
import type { EvSimulator } from "./useSimulator";

export function CompetitorSection({ sim }: { sim: EvSimulator }) {
  const { requirement, outputs } = sim;

  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="competitor" />
        <span className={styles.fieldHint}>Accessed {COMPETITOR_DATA_ACCESSED_DATE}</span>
      </div>

      <p className={styles.bodyText}>
        Certified range, published typical range and our simulated practical range are different measurements —
        they are labeled separately below rather than compared as if they were the same metric.
      </p>

      {/* Desktop table */}
      <div className={styles.tableWrapper} style={{ display: "block" }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Seating</th>
              <th>Battery</th>
              <th>Motor</th>
              <th>Range</th>
              <th>Top Speed</th>
              <th>Charging</th>
              <th>Kerb Weight</th>
              <th>Warranty</th>
              <th>Approx. Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Our EV (Configured)</strong></td>
              <td>D+{requirement.passengerCapacity}</td>
              <td>{formatKWh(outputs.battery.capacityKWh)} {requirement.chemistry}</td>
              <td>{outputs.powertrain.peakPowerKw.toFixed(1)} kW peak</td>
              <td>{formatKm(outputs.range.typicalKm)} (simulated practical)</td>
              <td>{requirement.maxSpeedKmh} km/h</td>
              <td>{outputs.charging.recommendedCharger}</td>
              <td>{formatKg(outputs.mass.kerbMassKg)}</td>
              <td>{requirement.vehicleWarrantyYears} yr</td>
              <td>{formatInrLakh(outputs.cost.sellingPriceInr)}</td>
            </tr>
            {COMPETITORS.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <div className={styles.fieldHint}>{c.manufacturer}</div>
                </td>
                <td>{c.seating}</td>
                <td>{c.batteryCapacityKWh !== null ? `${c.batteryCapacityKWh} kWh ${c.batteryChemistry ?? ""}` : "Not found"}</td>
                <td>{c.motorPowerKw !== null ? `${c.motorPowerKw} kW` : "Not found"}</td>
                <td>
                  {c.certifiedRangeKm !== null ? `${c.certifiedRangeKm} km (certified)` : ""}
                  {c.certifiedRangeKm !== null && c.publishedTypicalRangeKm !== null ? " · " : ""}
                  {c.publishedTypicalRangeKm !== null ? `${c.publishedTypicalRangeKm} km (typical)` : ""}
                  {c.certifiedRangeKm === null && c.publishedTypicalRangeKm === null ? "Not found" : ""}
                </td>
                <td>{c.topSpeedKmh !== null ? `${c.topSpeedKmh} km/h` : "Not found"}</td>
                <td>{c.chargingTimeHours !== null ? `~${c.chargingTimeHours} h` : "Not found"}</td>
                <td>{c.kerbWeightKg !== null ? `${c.kerbWeightKg} kg` : "Not found"}</td>
                <td>{c.vehicleWarranty ?? "Not found"}</td>
                <td>{c.approxPriceInr !== null ? formatInrLakh(c.approxPriceInr) : "Not found"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.fieldHint} style={{ marginTop: "0.75rem" }}>
        Differences from our configuration are shown for comparison, not to declare a winner — passenger capacity,
        battery size, motor power, expected range, charging and price all trade off against each other differently
        depending on your duty cycle.
      </p>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.1rem", textAlign: "left", marginTop: "2.5rem" }}>
        Sources
      </h3>
      <div className={styles.refColumns}>
        {COMPETITORS.map((c) => (
          <div key={c.id}>
            <p className={styles.fieldLabel} style={{ marginBottom: "0.4rem" }}>{c.name}</p>
            <div className={styles.competitorSourceRow}>
              {c.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.competitorSourceLink}
                >
                  {s.label} ({s.kind})
                </a>
              ))}
            </div>
            {c.rangeNote ? <p className={styles.fieldHint} style={{ marginTop: "0.4rem" }}>{c.rangeNote}</p> : null}
          </div>
        ))}
      </div>
    </>
  );
}
