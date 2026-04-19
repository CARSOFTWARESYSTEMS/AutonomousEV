import TopicPage from "@/components/TopicPage";

export const metadata = {
  title: "Battery Pack Aadhaar System | EV.ENGINEER™",
  description:
    "Internship project: Developing a unique digital identity system for EV battery packs — enabling lifecycle traceability, second-life assessment, and tamper-proof provenance using embedded IDs and blockchain anchoring.",
};

export default function BatteryAadhaarPage() {
  return (
    <TopicPage
      title="Battery Pack Aadhaar System"
      subtitle="An internship project to create a unique, tamper-proof digital identity for every EV battery pack — from manufacturing to end-of-life."
      execSummary={
        <p>
          Inspired by India's Aadhaar identity framework, the Battery Pack
          Aadhaar System assigns every battery pack a cryptographically unique
          digital identity at the point of manufacture. This identity travels
          with the pack through its entire lifecycle — enabling OEMs,
          fleet operators, regulators, and recyclers to access a trusted,
          immutable history of the battery's health, provenance, and usage.
        </p>
      }
      whyItMatters={
        <p>
          Counterfeit battery packs, opaque second-life assessments, and
          inability to trace recalled units are systemic problems costing the
          industry billions. A standardised digital identity layer is the
          foundational infrastructure needed to unlock battery-as-a-service
          models, circular economy compliance, and confident second-life EV
          deployments in markets like India.
        </p>
      }
      basics={
        <>
          <p>
            <strong>Identity Architecture:</strong> Embedding a cryptographically
            signed unique identifier (UID) into the battery BMS at the
            manufacturing stage — combining hardware security modules (HSM) with
            a public key infrastructure (PKI) root of trust.
          </p>
          <p>
            <strong>Data Schema Design:</strong> Defining a standardised digital
            passport schema capturing manufacturer, cell chemistry, initial
            capacity, date of first use, and cumulative cycle count.
          </p>
        </>
      }
      midLevel={
        <>
          <p>
            <strong>Lifecycle Event Logging:</strong> Designing APIs that allow
            authorised stakeholders (OEMs, fleet operators, service centers) to
            append signed events — charge cycles, thermal events, SOH assessments
            — to the battery's immutable digital record.
          </p>
          <p>
            <strong>Second-Life Assessment Module:</strong> Building an ML-driven
            evaluation pipeline that uses the battery's full lifecycle log to
            produce a certified State-of-Health (SOH) score and recommended
            second-life application (stationary storage, micro-grid, etc.).
          </p>
        </>
      }
      advanced={
        <>
          <p>
            <strong>Blockchain Anchoring:</strong> Periodic Merkle-tree anchoring
            of battery records to a public blockchain (e.g., Polygon) for
            tamper-evidence — ensuring no single entity can silently alter
            historical records.
          </p>
          <p>
            <strong>Regulatory Compliance:</strong> Aligning the system with
            India's FAME II battery disposal norms, EU Battery Regulation 2023
            digital product passport requirements, and the emerging Global Battery
            Alliance (GBA) passport standard.
          </p>
        </>
      }
      keyTakeaways={
        <ul>
          <li>• A hardware-rooted UID is the bedrock of a trustworthy battery identity system.</li>
          <li>• Standardised data schemas enable interoperability across OEMs and recyclers.</li>
          <li>• Blockchain anchoring provides tamper-evidence without centralised trust.</li>
          <li>• Second-life certification unlocks significant residual value from used packs.</li>
        </ul>
      }
    />
  );
}
