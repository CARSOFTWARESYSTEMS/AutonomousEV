import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { SectionHeader } from "../SectionHeader";
import { SeverityBadge, EvidenceStatusBadge } from "../Badges";
import pageStyles from "../page.module.css";
import styles from "./ThreatCatalogue.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  spoofing: "Spoofing",
  tampering: "Tampering",
  repudiation: "Repudiation",
  "information-disclosure": "Information Disclosure",
  "denial-of-service": "Denial of Service",
  "elevation-of-privilege": "Elevation of Privilege",
};

export function ThreatCatalogue() {
  return (
    <section className="section bg-surface" id="threat-catalogue" aria-labelledby="catalogue-heading">
      <div className="container">
        <SectionHeader label="Threat Catalogue" title="Battery & Energy System Threat Catalogue" headingId="catalogue-heading">
          <p>
            Twenty threats spanning telemetry, commands, firmware, supply chain, and ground/fleet operations, written
            in sober engineering terms. Expand any card for entry point, affected asset, safety consequence,
            detection, mitigation, a verification scenario, and residual risk.
          </p>
        </SectionHeader>

        <div className={styles.grid}>
          {THREAT_CATALOGUE.map((threat) => (
            <details key={threat.id} className={`${pageStyles.navyPanel} ${styles.card}`}>
              <summary aria-label={`${threat.name}, ${CATEGORY_LABEL[threat.category]}, ${threat.severity} severity — expand for details`}>
                <div className={styles.cardTitleRow}>
                  <span className={styles.cardTitle}>{threat.name}</span>
                  <SeverityBadge severity={threat.severity} />
                </div>
                <span className={styles.categoryPill}>{CATEGORY_LABEL[threat.category]}</span>
                <p className={styles.fieldValue} style={{ margin: 0 }}>{threat.summary}</p>
              </summary>
              <div className={styles.body}>
                <div>
                  <p className={styles.fieldLabel}>Entry Point</p>
                  <p className={styles.fieldValue}>{threat.entryPoint}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Asset / Data Affected</p>
                  <p className={styles.fieldValue}>{threat.assetAffected}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Attack Vector</p>
                  <p className={styles.fieldValue}>{threat.attackVector}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Safety Consequence</p>
                  <p className={styles.fieldValue}>{threat.potentialConsequence}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Detection</p>
                  <p className={styles.fieldValue}>Layered detection controls, see the Detection & Assurance Strategy section for full descriptions.</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Verification Scenario</p>
                  <p className={styles.fieldValue}>{threat.verificationScenario}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Residual Risk</p>
                  <p className={styles.fieldValue}>{threat.residualRiskNote}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>Capability Status</p>
                  <EvidenceStatusBadge status={threat.evidenceStatus} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
