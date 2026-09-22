import styles from "../page.module.css";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { Badge } from "./Badge";

interface ComponentSpec {
  title: string;
  points: string[];
}

const COMPONENT_SPECS: ComponentSpec[] = [
  {
    title: "Traction Battery",
    points: [
      "Chemistry: LFP (default) or NMC — see Battery System section",
      "Enclosure: sealed, structurally protected pack with IP target for monsoon/water exposure",
      "Disconnect: manual service disconnect + fusing + contactors with pre-charge circuit",
      "Sensing: cell/module temperature sensing, CAN telemetry to BMS/VCU",
    ],
  },
  {
    title: "BMS",
    points: [
      "Full protection, intelligence, connectivity and identity spec — see Smart Battery Management System section",
    ],
  },
  {
    title: "Motor (PMSM/IPM)",
    points: [
      "Continuous and peak power sized from duty cycle — see Powertrain section",
      "Liquid or forced-air cooling target depending on final thermal design",
      "Speed/torque characteristics validated on dynamometer before design freeze",
    ],
  },
  {
    title: "Motor Controller",
    points: [
      "Voltage/current rated to the selected voltage class and peak motor current",
      "Regenerative braking control coordinated with the VCU and hydraulic brakes",
      "CAN telemetry, thermal monitoring and fault protection",
    ],
  },
  {
    title: "VCU (Vehicle Control Unit)",
    points: [
      "Vehicle state machine: key-on, ready-to-drive, drive, regen, fault, limp-home",
      "Torque request arbitration between accelerator, regen and brake blending",
      "Drive-mode selection (Eco/City/Power) and diagnostic fault handling over CAN",
    ],
  },
  {
    title: "Charger",
    points: [
      "3.3 kW baseline, optional 6.6 kW for fleet use — see Charging section",
      "Charge protection: over-voltage, over-current, over-temperature, ground fault",
      "CAN telemetry to BMS and cluster for charge status",
    ],
  },
  {
    title: "DC-DC Converter",
    points: [
      "HV pack voltage stepped down to 12 V for lighting, cluster, telematics and controllers",
      "Power rating configurable to accessory load; protected against reverse polarity and overload",
    ],
  },
  {
    title: "Reduction / Differential",
    points: [
      "Final-drive ratio selected from the performance simulation (top speed vs gradeability trade-off)",
      "Sized for full GVW, not kerb weight",
    ],
  },
  {
    title: "Brakes",
    points: [
      "Hydraulic service brakes on all wheels, mechanical parking brake",
      "Regenerative braking blended with hydraulic braking under VCU coordination",
      "Full-load stopping performance and wet-weather behaviour require prototype validation",
    ],
  },
  {
    title: "Suspension",
    points: [
      "Heavy-duty three-wheeler front architecture, commercial-duty rear suspension",
      "Suspension must be designed for GVW (full load), not kerb weight",
      "Detailed spring/damper sizing is a downstream engineering task, not part of this simulator",
    ],
  },
  {
    title: "Tyres / Wheels",
    points: [
      "Commercial-duty tubeless tyres, 12-inch class as a concept baseline",
      "Selected for load rating, rolling resistance, durability and local spare-parts availability",
    ],
  },
  {
    title: "Telematics",
    points: ["GNSS + cellular connectivity, CAN integration, secure device identity — see Software section"],
  },
  {
    title: "Instrument Cluster",
    points: ["Speed, SOC, range estimate, warnings, drive mode and charging status"],
  },
  {
    title: "Charging Port",
    points: ["Safe interlock, weather-protected housing, and a connector chosen for local serviceability"],
  },
];

export function VehicleSection() {
  return (
    <>
      <div className={styles.bodyText}>
        <p>
          The glider — chassis, body, suspension, brakes, wheels and electronics excluding the battery — is sized
          around a D+6 passenger compartment: a low step-in height, grab rails, weather protection and a rear
          luggage provision, with repairable body panels and corrosion protection for coastal and monsoon
          conditions across Tamil Nadu, Karnataka, Kerala, Telangana and Andhra Pradesh.
        </p>
      </div>

      <div className={styles.tagRow}>
        <Badge kind="target" label="Ground Clearance ~180–190 mm+" />
        <Badge kind="validate" label="Water-Wading Target" />
        <Badge kind="validate" label="Full-Load Gradient Capability" />
      </div>

      <div className={styles.cardGrid3} style={{ marginTop: "1.5rem" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Suspension</div>
          <p className={styles.cardBody}>
            Heavy-duty front architecture and commercial-duty rear suspension, designed around full GVW — not kerb
            weight. Detailed spring/damper sizing is a downstream engineering task.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Brakes</div>
          <p className={styles.cardBody}>
            Hydraulic service brakes with a mechanical parking brake, regenerative braking blended under VCU
            coordination. Full-load and wet-weather stopping performance require prototype validation.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Tyres / Wheels</div>
          <p className={styles.cardBody}>
            Commercial-duty tubeless tyres, 12-inch class baseline, selected for load rating, rolling resistance,
            durability and local spare-parts availability.
          </p>
        </div>
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem", marginTop: "3rem", textAlign: "left" }}>
        Electrical / Electronic Architecture
      </h3>
      <p className={styles.bodyText} style={{ margin: "0 auto 1.5rem" }}>
        A single high-voltage traction path from battery to wheels, with 12V and charging branches, tied together
        by a CAN bus shared across BMS, VCU, motor controller, charger, cluster and telematics.
      </p>
      <div className={styles.tableWrapper} style={{ padding: "2rem", background: "var(--glass-bg)" }}>
        <ArchitectureDiagram />
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem", marginTop: "3rem", textAlign: "left" }}>
        Component Specification
      </h3>
      <div className={styles.accordionList}>
        {COMPONENT_SPECS.map((spec) => (
          <details className={styles.accordionItem} key={spec.title}>
            <summary className={styles.faqSummary}>
              <span className={styles.accordionSummaryTitle}>{spec.title}</span>
              <span className={styles.accordionChevron}>▾</span>
            </summary>
            <div className={styles.faqBody}>
              <ul className={styles.cardList}>
                {spec.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
