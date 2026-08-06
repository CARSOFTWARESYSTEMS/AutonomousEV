import { COMPONENTS } from "@/lib/battery-cybersecurity/data/components";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";
import styles from "./EnergyTrustChain.module.css";

const CORE_CHAIN_IDS = ["battery-pack", "bms", "ems", "vcu", "pdu", "inverter-motor-controller", "propulsion"];
const EXTERNAL_INTERFACE_IDS = ["charger-gse", "maintenance-laptop", "ota-system", "fleet-platform"];

const DOMAIN_LABEL: Record<string, string> = {
  energy: "Energy",
  propulsion: "Propulsion",
  "flight-control": "Flight Control",
  avionics: "Avionics",
  communications: "Communications",
  "ground-support": "Ground Support",
};

export function EnergyTrustChain() {
  const componentsById = new Map(COMPONENTS.map((c) => [c.id, c]));
  const coreChain = CORE_CHAIN_IDS.map((id) => componentsById.get(id)!).filter(Boolean);
  const externalInterfaces = EXTERNAL_INTERFACE_IDS.map((id) => componentsById.get(id)!).filter(Boolean);

  return (
    <section className="section" id="energy-trust-chain" aria-labelledby="trust-chain-heading">
      <div className="container">
        <SectionHeader label="Architecture" title="Electric Aircraft Energy Trust Chain" headingId="trust-chain-heading">
          <p>
            Every flight-safety decision depends on trusting this chain end to end: from the physical battery, through
            the systems that estimate and act on its state, to the propulsion it powers. A compromise anywhere in this
            chain can produce a false energy or power picture without damaging the physical battery at all.
          </p>
        </SectionHeader>

        <div
          className={`${pageStyles.navyPanel} ${styles.diagram}`}
          style={{ padding: "32px 24px" }}
          role="img"
          aria-label="Energy trust chain diagram: Battery Pack feeds the Battery Management System, which feeds Energy Management, which feeds the Vehicle Control Unit, which feeds the Power Distribution Unit, which feeds the Inverter and Motor Controller, which feeds Propulsion. Charger/Ground Support Equipment, Maintenance Laptop, OTA Update System, and Cloud/Fleet Platform are external interfaces feeding into the Battery Pack, BMS, and Energy Management System respectively."
        >
          <div className={styles.chainRow} aria-hidden="true">
            {coreChain.map((c, i) => (
              <span key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={styles.chainNode}>{c.name}</span>
                {i < coreChain.length - 1 && <span className={styles.chainArrow}>&rarr;</span>}
              </span>
            ))}
          </div>

          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-amber)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
              External Interfaces (Trust Boundaries)
            </p>
            <div className={styles.interfaceGrid} aria-hidden="true">
              {externalInterfaces.map((c) => (
                <div key={c.id} className={styles.interfaceNode}>
                  <strong>{c.name}</strong>
                  <span>{c.trustRole}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ color: "var(--text-secondary)", maxWidth: "800px", margin: "0 0 32px", lineHeight: 1.75, fontSize: "0.95rem" }}>
          The four external interfaces above are where the aircraft&rsquo;s trust boundary meets the outside world: ground
          charging equipment, a maintenance laptop, an OTA update channel, and a cloud/fleet platform. Each is a point
          where data or commands cross from a lower-trust actor into the aircraft&rsquo;s energy system, and each therefore
          needs an explicit verification control rather than implicit trust.
        </p>

        <div className={pageStyles.tableScroll}>
          <table aria-label="Full component list with domain and trust role">
            <thead>
              <tr>
                <th>Component</th>
                <th>Domain</th>
                <th>Role in the Trust Chain</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENTS.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" }}>{c.name}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{DOMAIN_LABEL[c.domain]}</td>
                  <td>{c.trustRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
