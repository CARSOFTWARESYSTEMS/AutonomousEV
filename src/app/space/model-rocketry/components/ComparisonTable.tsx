import styles from "../model-rocketry.module.css";

interface Row {
  area: string;
  model: string;
  professional: string;
}

const ROWS: Row[] = [
  { area: "Mission", model: "Education and experimentation", professional: "Scientific, commercial or strategic mission" },
  { area: "Size", model: "Small", professional: "Large, mission-dependent" },
  { area: "Propulsion", model: "Certified commercial model motors", professional: "Highly engineered propulsion systems" },
  { area: "Altitude", model: "Limited educational flight envelope", professional: "Suborbital, orbital or deep-space" },
  { area: "Payload", model: "Small educational payload", professional: "Satellite, spacecraft, cargo or crew" },
  { area: "Guidance", model: "Often passive or basic avionics", professional: "Advanced guidance, navigation and control" },
  { area: "Materials", model: "Accessible engineering materials", professional: "Aerospace-qualified materials" },
  { area: "Testing", model: "Educational qualification and testing", professional: "Extensive qualification and acceptance testing" },
  { area: "Regulation", model: "Local or range rules", professional: "National or international regulation" },
  { area: "Risk", model: "Controlled educational risk", professional: "Mission, public and asset safety at stake" },
  { area: "Cost", model: "Educational scale", professional: "Very high" },
  { area: "Team", model: "Student or small engineering team", professional: "Large multidisciplinary organisation" },
];

export default function ComparisonTable() {
  return (
    <div>
      <div className={styles.comparisonWrap}>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Model Rocketry</th>
              <th>Professional Rocketry</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.area}>
                <td>{r.area}</td>
                <td>{r.model}</td>
                <td>{r.professional}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.comparisonCards}>
        {ROWS.map((r) => (
          <div key={r.area} className={styles.comparisonCard}>
            <h4 style={{ margin: 0, color: "var(--space-text)" }}>{r.area}</h4>
            <dl style={{ margin: 0 }}>
              <dt>Model Rocketry</dt>
              <dd>{r.model}</dd>
              <dt>Professional Rocketry</dt>
              <dd>{r.professional}</dd>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
