import styles from "../page.module.css";
import { Badge } from "./Badge";

const CANVAS: { title: string; wide?: boolean; items: string[] }[] = [
  { title: "Customer Segments", items: ["Owner-drivers", "Fleet operators", "Shared mobility", "Hotels / resorts", "Institutions", "Employee transport", "Tourism"] },
  { title: "Value Proposition", wide: true, items: ["D+6 passenger architecture", "Competitive acquisition cost", "Low ₹/passenger-km", "South India duty-cycle durability", "Intelligent battery", "Connected service"] },
  { title: "Channels", items: ["Direct", "Dealers", "Fleet partnerships", "Digital"] },
  { title: "Customer Relationships", items: ["Connected service", "Roadside support", "AMC", "Mobile service"] },
  { title: "Revenue", items: ["Vehicle sale", "AMC", "Connected software", "Fleet SaaS", "Charging", "Future BaaS", "BESS", "Second-life battery services"] },
  { title: "Key Activities", items: ["Vehicle engineering", "System integration", "Validation", "Software", "Supplier management", "Service"] },
  { title: "Key Resources", items: ["Architecture & IP", "BMS", "VCU", "Software", "Supplier network", "Test data"] },
  { title: "Partners", wide: true, items: ["Cell suppliers", "Battery pack integrators", "Motor suppliers", "Electronics", "Body / chassis", "Financial institutions", "Service partners", "Charging partners"] },
  { title: "Cost Structure", items: ["R&D", "BOM", "Tooling", "Homologation", "Warranty", "Software", "Service", "Distribution"] },
];

const VARIANTS = [
  { title: "Value", desc: "Lowest acquisition price for shorter, predictable routes." },
  { title: "City", desc: "Default recommended product for typical Tier-2/3 duty cycles." },
  { title: "Long Range", desc: "Larger battery for high daily-km drivers." },
  { title: "Fleet+", desc: "High-utilization fleet configuration with swap-readiness." },
];

const DIFFERENTIATORS = [
  "D+6 passenger architecture",
  "Design-to-cost engineering",
  "South India duty-cycle optimization",
  "Intelligent battery",
  "Connected diagnostics",
  "Low ₹/passenger-km",
  "Configurable charging",
  "Future swap readiness",
  "Battery circular economy",
  "Cybersecurity-by-design",
];

const MARKETS = [
  { state: "Tamil Nadu", note: "High ambient heat, dense Tier-2 mobility, industrial corridors." },
  { state: "Karnataka", note: "Mixed urban and ghat-road use." },
  { state: "Kerala", note: "Monsoon rainfall, gradients, corrosion and humidity exposure." },
  { state: "Telangana", note: "High ambient heat and mixed urban usage." },
  { state: "Andhra Pradesh", note: "High ambient heat, coastal environment, mixed routes." },
];

const INVESTMENT_SCENARIOS = [
  { title: "Engineering / Prototype", range: "₹1.5–3 crore", items: ["Engineering", "Prototypes", "Initial testing"] },
  { title: "Pilot OEM", range: "₹5–10 crore", items: ["Tooling", "Homologation", "Software", "Initial inventory"] },
  { title: "Commercial Launch", range: "₹15–30+ crore", items: ["Assembly", "Service network", "Sales", "Warranty reserve", "Working capital"] },
];

export function BusinessSection() {
  return (
    <>
      <div className={styles.tagRow}>
        <Badge kind="target" label="Strategic Planning Estimate" />
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left" }}>
        Business Model Canvas
      </h3>
      <div className={styles.canvasGrid}>
        {CANVAS.map((cell) => (
          <div className={cell.wide ? styles.canvasCellWide : styles.canvasCell} key={cell.title}>
            <div className={styles.cardTitle} style={{ fontSize: "0.9rem" }}>{cell.title}</div>
            <ul className={styles.cardList}>
              {cell.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className={styles.fieldHint} style={{ marginTop: "1rem" }}>
        The company is not designed to depend solely on vehicle gross margin — AMC, connected/fleet software,
        charging, future Battery-as-a-Service, BESS reuse and recycling all contribute to the revenue model.
      </p>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "3rem" }}>
        Product Variant Strategy
      </h3>
      <p className={styles.bodyText} style={{ margin: "0 auto 1.5rem" }}>
        One common platform, configurable battery, powertrain and software — not four different vehicles.
      </p>
      <div className={styles.cardGrid4}>
        {VARIANTS.map((v) => (
          <div className={styles.card} key={v.title}>
            <div className={styles.cardTitle}>{v.title}</div>
            <p className={styles.cardBody}>{v.desc}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "3rem" }}>
        Development Objectives / Differentiators
      </h3>
      <div className={styles.pillGrid}>
        {DIFFERENTIATORS.map((d) => (
          <span className={styles.rolePill} key={d}>{d}</span>
        ))}
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "3rem" }}>
        Target Markets
      </h3>
      <div className={styles.cardGrid3}>
        {MARKETS.map((m) => (
          <div className={styles.card} key={m.state}>
            <div className={styles.cardTitle}>{m.state}</div>
            <p className={styles.cardBody}>{m.note}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "3rem" }}>
        Startup Investment Simulator
      </h3>
      <div className={styles.cardGrid3}>
        {INVESTMENT_SCENARIOS.map((s) => (
          <div className={styles.card} key={s.title}>
            <div className={styles.cardTitle}>{s.title}</div>
            <div className={styles.resultStatValue} style={{ marginBottom: "0.5rem", color: "var(--accent-primary)" }}>
              {s.range}
            </div>
            <ul className={styles.cardList}>
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem", textAlign: "left", marginTop: "3rem" }}>
        Go-to-Market
      </h3>
      <div className={styles.flowWrap}>
        {["Voice of Customer", "Requirements + Digital Engineering", "Alpha Prototypes", "Engineering Validation", "Beta Fleet", "One-City Pilot (20–50)", "500-Vehicle Scale-Up", "Multi-State Expansion"].map(
          (step, i, arr) => (
            <div className={styles.flowWrapPair} key={step}>
              <div className={styles.flowWrapStep}>{step}</div>
              {i < arr.length - 1 ? <span className={styles.flowWrapArrow}>→</span> : null}
            </div>
          ),
        )}
      </div>
      <p className={styles.bodyTextCenter} style={{ marginTop: "1.5rem" }}>
        <strong>Start with one city and one duty cycle.</strong> Do not launch in five states simultaneously.
      </p>
    </>
  );
}
