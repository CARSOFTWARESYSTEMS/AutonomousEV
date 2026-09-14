"use client";
import { Satellite, Radio, Cpu, Building2, Database, BrainCircuit, Smartphone, User } from "lucide-react";
import { SATELLITE_TO_PHONE } from "../applicationsData";
import { useViewMode } from "./ViewProvider";
import styles from "../everyday-applications.module.css";

const ICONS = [Satellite, Radio, Cpu, Building2, Database, BrainCircuit, Smartphone, User];

export default function SatelliteToPhone() {
  const { view } = useViewMode();

  return (
    <div>
      <div className={styles.chainList}>
        {SATELLITE_TO_PHONE.map((step, i) => {
          const Icon = ICONS[i] ?? Satellite;
          const note = view === "engineering" ? step.engineeringNote : view === "business" ? step.businessNote : undefined;
          return (
            <div key={step.id}>
              <div className={styles.chainStep}>
                <span className={styles.chainStepIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 4px" }}>{step.label}</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>{step.text}</p>
                  {note && (
                    <p className={styles.formNote} style={{ marginTop: 6 }}>
                      {note}
                    </p>
                  )}
                </div>
              </div>
              {i < SATELLITE_TO_PHONE.length - 1 && <div className={styles.chainArrow} aria-hidden="true">↓</div>}
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
