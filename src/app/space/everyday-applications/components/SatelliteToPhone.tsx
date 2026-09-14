import { Satellite, Radio, Cpu, Building2, Database, BrainCircuit, Smartphone, User } from "lucide-react";
import styles from "../everyday-applications.module.css";

const STEPS = [
  { icon: Satellite, label: "Satellite", text: "A satellite instrument observes weather, land, ocean or broadcasts a signal." },
  { icon: Radio, label: "Ground Station", text: "A ground station receives the raw signal or imagery from the satellite." },
  { icon: Cpu, label: "Processing", text: "Raw data is calibrated and processed into a usable form." },
  { icon: Building2, label: "Scientific / Government / Commercial System", text: "A weather service, government agency or company turns processed data into a data product." },
  { icon: Database, label: "Data Product", text: "A forecast, map, advisory or dataset is produced." },
  { icon: BrainCircuit, label: "Analytics / AI", text: "Analytics or AI models turn the data product into a specific recommendation or alert." },
  { icon: Smartphone, label: "Application", text: "An app, broadcast or advisory service delivers this to you." },
  { icon: User, label: "You", text: "You see a forecast, a route, an alert, or an advisory — and make a better decision." },
];

export default function SatelliteToPhone() {
  return (
    <div>
      <div className={styles.chainList}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label}>
              <div className={styles.chainStep}>
                <span className={styles.chainStepIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 4px" }}>{step.label}</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>{step.text}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className={styles.chainArrow} aria-hidden="true">↓</div>}
            </div>
          );
        })}
      </div>
      <p className={styles.formNote} style={{ marginTop: 16 }}>
        Example: satellite weather observation → weather data → forecast models → weather service → app or alert →
        you. A phone app does not usually talk to a satellite directly — it talks to a service built on top of the
        data chain above.
      </p>
    </div>
  );
}
