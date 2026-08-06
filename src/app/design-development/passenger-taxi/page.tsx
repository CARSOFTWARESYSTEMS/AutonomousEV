import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PriorityPieChart, { type PieDataItem } from "@/components/PriorityPieChart";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

const PAGE_URL = "https://autonomous.ev.engineer/design-development/passenger-taxi";
const OG_IMAGE = "https://autonomous.ev.engineer/ev-engineer-car.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://autonomous.ev.engineer"),
  title:
    "Passenger Air Taxi Component Architecture | eVTOL Battery, Propulsion, Cybersecurity & AI | EV.ENGINEER",
  description:
    "Explore passenger air taxi and eVTOL component architecture covering battery intelligence, propulsion, flight control, avionics, AI, cybersecurity, safety criticality, cost distribution, and engineering priority analysis by EV.ENGINEER.",
  keywords: [
    "passenger air taxi",
    "eVTOL air taxi",
    "air taxi component architecture",
    "eVTOL component architecture",
    "electric aircraft components",
    "eVTOL battery system",
    "air taxi battery intelligence",
    "eVTOL propulsion system",
    "distributed electric propulsion",
    "eVTOL flight control system",
    "eVTOL avionics",
    "eVTOL cybersecurity",
    "electric aircraft cybersecurity",
    "BMS cybersecurity",
    "battery aadhaar",
    "battery digital identity",
    "battery trust score",
    "aircraft trust score",
    "EV.ENGINEER",
    "autonomous EV engineer",
    "Sudarshana Karkala",
    "Sudarshana Karkala EV.ENGINEER",
  ],
  authors: [
    {
      name: "Sudarshana Karkala",
      url: "https://autonomous.ev.engineer/about/sudarshana-karkala",
    },
  ],
  creator: "Sudarshana Karkala",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title:
      "Passenger Air Taxi Component Architecture | eVTOL Battery, Propulsion, Cybersecurity & AI | EV.ENGINEER",
    description:
      "Explore passenger air taxi and eVTOL component architecture covering battery intelligence, propulsion, flight control, avionics, AI, cybersecurity, safety criticality, cost distribution, and engineering priority analysis by EV.ENGINEER.",
    url: PAGE_URL,
    type: "article",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "EV.ENGINEER — Passenger Air Taxi Component Architecture" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Passenger Air Taxi Component Architecture | eVTOL Battery, Propulsion, Cybersecurity & AI | EV.ENGINEER",
    description:
      "Explore passenger air taxi and eVTOL component architecture covering battery intelligence, propulsion, flight control, avionics, AI, cybersecurity, safety criticality, cost distribution, and engineering priority analysis.",
    images: [OG_IMAGE],
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": PAGE_URL,
      url: PAGE_URL,
      name: "Passenger Air Taxi Component Architecture | EV.ENGINEER",
      description:
        "A systems-level view of the major aircraft, energy, propulsion, avionics, software, safety, and cybersecurity components required to design, develop, verify, and operate a modern eVTOL air taxi.",
      isPartOf: { "@id": "https://autonomous.ev.engineer" },
      author: { "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala" },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      url: PAGE_URL,
      headline: "Passenger Air Taxi Component Architecture & Priority Analysis",
      description:
        "An engineering systems analysis of the major components, cost distribution, safety criticality, cybersecurity exposure, and engineering complexity for a modern eVTOL passenger air taxi.",
      author: { "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala" },
      publisher: {
        "@type": "Organization",
        name: "EV.ENGINEER",
        url: "https://autonomous.ev.engineer",
      },
      about: [
        "eVTOL air taxi",
        "battery intelligence",
        "eVTOL cybersecurity",
        "air taxi component architecture",
        "distributed electric propulsion",
      ],
    },
    {
      "@type": "Person",
      "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala",
      name: "Sudarshana Karkala",
      url: "https://autonomous.ev.engineer/about/sudarshana-karkala",
      jobTitle: "Founder of EV.ENGINEER",
      worksFor: {
        "@type": "Organization",
        name: "EV.ENGINEER",
        url: "https://autonomous.ev.engineer",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://autonomous.ev.engineer",
      name: "EV.ENGINEER",
      url: "https://autonomous.ev.engineer",
      founder: { "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://autonomous.ev.engineer" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Design & Development",
          item: "https://autonomous.ev.engineer/design-development",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Passenger Air Taxi",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What components are needed for a passenger air taxi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A passenger air taxi requires ten major system domains: airframe, propulsion, battery and energy, thermal management, flight control, avionics and navigation, software and AI autonomy, safety and emergency systems, cybersecurity, and ground support infrastructure. Each domain has distinct hardware, software, certification, and cybersecurity responsibilities.",
          },
        },
        {
          "@type": "Question",
          name: "Which air taxi component is most critical?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Battery and energy, flight control, and propulsion are the three most mission-critical and safety-critical domains in an eVTOL air taxi. Battery failure, flight control faults, or propulsion failures can directly prevent safe mission completion. These three domains also represent the highest combined cost, safety certification effort, and cybersecurity exposure.",
          },
        },
        {
          "@type": "Question",
          name: "Why is battery intelligence important for eVTOL aircraft?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For a passenger air taxi, the battery is not just a power source — it is a safety-critical, mission-critical, cyber-physical system. Incorrect state-of-health estimation, false telemetry, firmware tampering, or thermal runaway can directly affect mission readiness and passenger safety. Battery intelligence covering digital identity, BMS cybersecurity, and mission trust scoring is therefore the highest-priority engineering foundation for any eVTOL platform.",
          },
        },
        {
          "@type": "Question",
          name: "What cybersecurity risks exist in an eVTOL air taxi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The highest cybersecurity exposure in an eVTOL air taxi is concentrated in software and OTA update systems (28%), battery and BMS communication (22%), flight control computers (18%), communication links (12%), and connected avionics (10%). Key threats include firmware tampering, BMS spoofing, replay attacks on telemetry, and unauthorized OTA updates. Secure boot, signed firmware, PKI certificate management, and intrusion detection are the primary defensive controls required.",
          },
        },
        {
          "@type": "Question",
          name: "How does EV.ENGINEER prioritise air taxi requirements?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "EV.ENGINEER prioritises air taxi requirements through a cross-domain matrix that scores each domain against cost, mission importance, safety criticality, and cybersecurity exposure. Based on this analysis, Battery Aadhaar (digital identity), Battery Cybersecurity, and Mission Battery Trust Score are classified as immediate priorities, followed by Flight Control Trust and Aircraft Digital Identity, and then Predictive Maintenance and Fleet Intelligence as future phases.",
          },
        },
      ],
    },
  ],
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPONENTS = [
  {
    number: "01",
    title: "Airframe System",
    description:
      "The structural body of the aircraft, including fuselage, cabin, wings, rotor arms, landing gear, composite panels, doors, windows, frames, bulkheads, and mounting structures.",
    accent: "#22D3EE",
  },
  {
    number: "02",
    title: "Propulsion System",
    description:
      "Electric motors, propellers, rotors, hubs, motor controllers, inverters, ESCs, bearings, shafts, motor mounts, and tilt or lift mechanisms used to generate thrust for hover, climb, cruise, and landing.",
    accent: "#FB923C",
  },
  {
    number: "03",
    title: "Battery & Energy System",
    description:
      "Battery packs, modules, cells, BMS, cell monitoring units, contactors, fuses, pre-charge circuits, HV connectors, temperature sensors, insulation monitoring, battery enclosure, and digital battery identity.",
    accent: "#4CA930",
  },
  {
    number: "04",
    title: "Thermal Management",
    description:
      "Cooling plates, coolant pumps, heat exchangers, radiators, valves, hoses, fans, cabin HVAC, battery heating, motor cooling, inverter cooling, and temperature monitoring.",
    accent: "#F472B6",
  },
  {
    number: "05",
    title: "Flight Control System",
    description:
      "Flight control computers, fly-by-wire logic, actuators, control laws, redundancy management, air data processing, IMU, AHRS, autopilot, and safety monitors.",
    accent: "#A78BFA",
  },
  {
    number: "06",
    title: "Avionics & Navigation",
    description:
      "Mission computers, cockpit displays, GNSS, INS, radar altimeter, barometric altimeter, magnetometer, flight recorder, warning systems, communication radios, ADS-B, and transponders.",
    accent: "#FBBF24",
  },
  {
    number: "07",
    title: "Software, AI & Autonomy",
    description:
      "Flight software, health monitoring, route planning, AI-assisted mission logic, obstacle avoidance, landing-zone detection, predictive maintenance, OTA updates, fleet intelligence, and digital twin integration.",
    accent: "#34D399",
  },
  {
    number: "08",
    title: "Safety & Emergency Systems",
    description:
      "Fire detection, fire suppression, emergency battery disconnect, crash detection, emergency lighting, evacuation systems, ELT, parachute systems where applicable, and emergency landing logic.",
    accent: "#EF4444",
  },
  {
    number: "09",
    title: "Cybersecurity System",
    description:
      "Secure boot, signed firmware, key management, PKI certificates, secure OTA updates, intrusion detection, secure logging, encrypted communication, BMS protection, and mission trust scoring.",
    accent: "#818CF8",
  },
  {
    number: "10",
    title: "Ground Support & Operations",
    description:
      "Charging stations, ground power units, diagnostic tools, maintenance laptops, fleet dashboards, mission planning, service carts, inspection records, and charging or battery-swap infrastructure.",
    accent: "#F59E0B",
  },
];

const CHARTS: Array<{ title: string; description: string; data: PieDataItem[]; insight: string }> = [
  {
    title: "Estimated Cost Distribution",
    description: "Conceptual share of engineering and hardware investment by subsystem.",
    data: [
      { name: "Battery & Energy", value: 25 },
      { name: "Propulsion", value: 18 },
      { name: "Airframe", value: 17 },
      { name: "Avionics & Flight Control", value: 14 },
      { name: "Software & AI", value: 10 },
      { name: "Thermal Management", value: 7 },
      { name: "Certification & Testing", value: 9 },
    ],
    insight:
      "Battery, propulsion, and airframe together represent the largest investment concentration and should be treated as early design-priority domains.",
  },
  {
    title: "Relative Mission Importance",
    description: "Estimated contribution of each subsystem to mission success.",
    data: [
      { name: "Battery & Energy", value: 22 },
      { name: "Flight Control", value: 18 },
      { name: "Propulsion", value: 17 },
      { name: "Airframe", value: 15 },
      { name: "Software & AI", value: 10 },
      { name: "Navigation & Sensors", value: 10 },
      { name: "Other Systems", value: 8 },
    ],
    insight:
      "Battery, flight control, and propulsion are mission-enabling systems. Failure in any of these domains can directly prevent safe mission completion.",
  },
  {
    title: "Safety Criticality Allocation",
    description: "Estimated contribution of subsystems to overall flight safety.",
    data: [
      { name: "Flight Control", value: 24 },
      { name: "Battery", value: 21 },
      { name: "Propulsion", value: 18 },
      { name: "Airframe", value: 16 },
      { name: "Navigation", value: 9 },
      { name: "Thermal Management", value: 7 },
      { name: "Other", value: 5 },
    ],
    insight:
      "Flight control, battery, propulsion, and airframe dominate safety-critical engineering and certification evidence planning.",
  },
  {
    title: "Engineering Complexity",
    description: "Estimated distribution of engineering difficulty across major domains.",
    data: [
      { name: "Battery", value: 20 },
      { name: "AI & Software", value: 19 },
      { name: "Flight Control", value: 18 },
      { name: "Certification", value: 15 },
      { name: "Propulsion", value: 13 },
      { name: "Airframe", value: 9 },
      { name: "Thermal", value: 6 },
    ],
    insight:
      "The most challenging areas combine aerospace engineering, embedded systems, electrical design, thermal design, safety analysis, software verification, and certification traceability.",
  },
  {
    title: "Cybersecurity Exposure",
    description: "Estimated distribution of cybersecurity attack surface across connected systems.",
    data: [
      { name: "Software & OTA", value: 28 },
      { name: "Battery/BMS", value: 22 },
      { name: "Flight Control", value: 18 },
      { name: "Communication", value: 12 },
      { name: "Avionics", value: 10 },
      { name: "Ground Systems", value: 6 },
      { name: "Sensors", value: 4 },
    ],
    insight:
      "The highest cybersecurity exposure is concentrated in software, OTA updates, BMS, flight control computers, communication links, and connected ground systems.",
  },
];

const MATRIX_ROWS = [
  { domain: "Battery Intelligence", cost: "Very High", importance: "Very High", safety: "Very High", security: "Very High", priority: "Immediate" },
  { domain: "Battery Cybersecurity", cost: "High", importance: "Very High", safety: "Very High", security: "Very High", priority: "Immediate" },
  { domain: "Flight Control Trust", cost: "High", importance: "Very High", safety: "Very High", security: "High", priority: "Next" },
  { domain: "Aircraft Digital Identity", cost: "Medium", importance: "High", safety: "High", security: "High", priority: "Next" },
  { domain: "Predictive Maintenance", cost: "Medium", importance: "High", safety: "High", security: "Medium", priority: "Future" },
  { domain: "Fleet Intelligence", cost: "Medium", importance: "Medium", safety: "Medium", security: "High", priority: "Future" },
];

const MISSIONS = [
  {
    code: "ALPHA",
    name: "Battery Aadhaar",
    description:
      "Create trusted digital identity for every battery pack, module, BMS, firmware version, certificate, ownership record, maintenance event, and operational history.",
    requirements: [
      "Battery identity record",
      "Battery manufacturer details",
      "Cell chemistry",
      "Pack serial number",
      "BMS serial number",
      "Firmware version",
      "Manufacturing location",
      "Certificate upload",
      "Maintenance record",
      "Ownership record",
      "QR code / digital passport",
    ],
    color: "#4CA930",
  },
  {
    code: "BRAVO",
    name: "Battery Cybersecurity",
    description:
      "Protect the battery and BMS ecosystem from spoofing, replay attacks, firmware tampering, unauthorized updates, and false telemetry.",
    requirements: [
      "Secure firmware validation",
      "Signed telemetry",
      "Replay attack detection",
      "BMS spoofing detection",
      "OTA update audit trail",
      "Certificate validation",
      "Cybersecurity incident log",
      "Battery cyber health score",
    ],
    color: "#818CF8",
  },
  {
    code: "CHARLIE",
    name: "Mission Battery Trust Score",
    description:
      "Generate a 0–100 mission readiness score using identity, health, safety, cybersecurity, telemetry, maintenance, and certification evidence.",
    requirements: [
      "SOC, SOH, temperature, cycle count",
      "Remaining useful life",
      "Safety event history",
      "Firmware trust status",
      "Maintenance compliance",
      "Certificate validity",
      "Cyber event history",
      "Mission Ready / Not Ready decision",
    ],
    color: "#22D3EE",
  },
  {
    code: "DELTA",
    name: "Aircraft Trust Score",
    description:
      "Extend the Battery Trust Score model to full aircraft-level digital identity and system readiness scoring.",
    requirements: [
      "Aircraft digital identity",
      "Propulsion identity",
      "Flight controller identity",
      "Avionics identity",
      "Sensor identity",
      "Charger identity",
      "Software identity",
      "Aggregated mission readiness score",
    ],
    color: "#FBBF24",
  },
];

const FAQ_ITEMS = [
  {
    question: "What components are needed for a passenger air taxi?",
    answer:
      "A passenger air taxi requires ten major engineering domains: airframe, distributed electric propulsion, battery and energy systems, thermal management, flight control, avionics and navigation, software and AI autonomy, safety and emergency systems, cybersecurity, and ground support infrastructure. Each domain has distinct hardware, software, safety certification, and cybersecurity responsibilities that must be designed, verified, and maintained together as an integrated aerospace system.",
  },
  {
    question: "Which air taxi component is most critical for mission success?",
    answer:
      "Battery and energy, flight control, and propulsion are the three most mission-critical and safety-critical domains in an eVTOL air taxi. Together they account for over 57% of relative mission importance. Battery failure, flight control faults, or propulsion failures can directly prevent safe mission completion. These domains also carry the highest combined cost, safety certification burden, and cybersecurity exposure across the full aircraft.",
  },
  {
    question: "Why is battery intelligence important for eVTOL aircraft?",
    answer:
      "For a passenger air taxi, the battery is not only a power source — it is a safety-critical, mission-critical, cyber-physical system. Incorrect state-of-health estimation, false telemetry, firmware tampering, or thermal runaway can directly affect mission readiness and passenger safety. Battery Aadhaar (digital identity), BMS cybersecurity, and Mission Battery Trust Score are therefore the highest-priority engineering foundations for any eVTOL platform, preceding full aircraft-level trust scoring.",
  },
  {
    question: "What cybersecurity risks exist in an eVTOL air taxi?",
    answer:
      "The highest cybersecurity exposure in an eVTOL air taxi is concentrated in software and OTA update systems (28%), battery and BMS communication (22%), flight control computers (18%), communication links (12%), and connected avionics (10%). Key threats include firmware tampering, BMS spoofing, replay attacks on telemetry, and unauthorized OTA updates. Defensive controls include secure boot, signed firmware, PKI certificate management, intrusion detection systems, and encrypted communication channels.",
  },
  {
    question: "How does EV.ENGINEER prioritise eVTOL engineering requirements?",
    answer:
      "EV.ENGINEER applies a cross-domain priority matrix that evaluates each subsystem against cost, mission importance, safety criticality, and cybersecurity exposure. Based on this analysis, Battery Aadhaar and Battery Cybersecurity are classified as immediate priorities. Flight Control Trust and Aircraft Digital Identity follow as the next phase. Predictive Maintenance and Fleet Intelligence are planned as future-phase requirements once the battery and flight control trust foundations are established.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 14px",
        background: "rgba(76,169,48,0.1)",
        border: "1px solid rgba(76,169,48,0.3)",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "var(--accent-primary)",
        textTransform: "uppercase",
        marginBottom: "16px",
      }}
    >
      {children}
    </span>
  );
}

function ComponentCard({
  number,
  title,
  description,
  accent,
}: {
  number: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div
      className="glass-panel"
      style={{ borderTop: `3px solid ${accent}`, display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            color: accent,
            letterSpacing: "0.05em",
            background: `${accent}18`,
            padding: "3px 8px",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        >
          {number}
        </span>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Very High": { bg: "rgba(239,68,68,0.12)", color: "#F87171" },
    High: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
    Medium: { bg: "rgba(76,169,48,0.12)", color: "#4CA930" },
  };
  const s = map[level] ?? { bg: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {level}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Immediate: { bg: "rgba(239,68,68,0.15)", color: "#F87171" },
    Next: { bg: "rgba(251,191,36,0.15)", color: "#FBBF24" },
    Future: { bg: "rgba(34,211,238,0.12)", color: "#22D3EE" },
  };
  const s = map[priority] ?? { bg: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {priority}
    </span>
  );
}

function PriorityMatrix() {
  return (
    <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px", fontSize: "0.875rem" }}
        aria-label="eVTOL component priority matrix"
      >
        <thead>
          <tr style={{ background: "rgba(76,169,48,0.08)", borderBottom: "1px solid var(--glass-border)" }}>
            {["Domain", "Cost", "Mission Importance", "Safety Criticality", "Cybersecurity", "Priority"].map(
              (col) => (
                <th
                  key={col}
                  style={{
                    padding: "14px 18px",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {MATRIX_ROWS.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid rgba(0,245,160,0.07)",
                background: i % 2 === 0 ? "var(--glass-bg)" : "transparent",
              }}
            >
              <td style={{ padding: "14px 18px", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {row.domain}
              </td>
              <td style={{ padding: "14px 18px" }}><LevelBadge level={row.cost} /></td>
              <td style={{ padding: "14px 18px" }}><LevelBadge level={row.importance} /></td>
              <td style={{ padding: "14px 18px" }}><LevelBadge level={row.safety} /></td>
              <td style={{ padding: "14px 18px" }}><LevelBadge level={row.security} /></td>
              <td style={{ padding: "14px 18px" }}><PriorityBadge priority={row.priority} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoadmapMissionCard({
  code,
  name,
  description,
  requirements,
  color,
}: {
  code: string;
  name: string;
  description: string;
  requirements: string[];
  color: string;
}) {
  return (
    <div
      className="glass-panel"
      style={{ borderLeft: `4px solid ${color}`, display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color,
              background: `${color}15`,
              padding: "3px 10px",
              borderRadius: "6px",
            }}
          >
            MISSION {code}
          </span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
          {name}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{description}</p>
      </div>
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Requirements
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px" }}
        >
          {requirements.map((req, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.825rem", color: "var(--text-secondary)" }}
            >
              <span style={{ color, flexShrink: 0, marginTop: "1px", fontSize: "0.7rem" }}>▸</span>
              {req}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <div style={{ marginBottom: "40px" }}>
          <SectionLabel>Frequently Asked Questions</SectionLabel>
          <h2 id="faq-heading" style={{ marginBottom: "12px" }}>
            Common Questions About eVTOL Air Taxi Engineering
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "680px" }}>
            Engineering and architecture questions about passenger air taxi components, battery intelligence,
            cybersecurity, and EV.ENGINEER priority methodology.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="glass-panel"
              style={{ borderLeft: "3px solid rgba(76,169,48,0.4)" }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  lineHeight: 1.4,
                }}
              >
                {item.question}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthorSection() {
  return (
    <section className="section bg-surface" id="author" aria-labelledby="author-heading">
      <div className="container">
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            alignItems: "center",
            background: "var(--glass-bg)",
            padding: "2.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--glass-border)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid rgba(76,169,48,0.3)",
              boxShadow: "0 0 24px rgba(76,169,48,0.15)",
            }}
          >
            <Image
              src="/SudarshanaKarkala.jpg"
              alt="Sudarshana Karkala — Founder of EV.ENGINEER"
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-primary)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Architect Behind EV.ENGINEER™
            </p>
            <h2
              id="author-heading"
              style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}
            >
              Sudarshana Karkala
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px", maxWidth: "560px" }}>
              This passenger air taxi systems analysis is part of the EV.ENGINEER™ vision led by Sudarshana
              Karkala, focused on intelligent energy systems, battery intelligence, cybersecurity, and
              AI-driven engineering platforms for electric vehicles and aerospace applications.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/about/sudarshana-karkala" className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.25rem" }}>
                View Profile
              </Link>
              <Link href="/cybersecurity" className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.25rem" }}>
                Cybersecurity
              </Link>
              <Link href="/design-development/airport-cargo" className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.25rem" }}>
                Airport Cargo EV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PassengerTaxiPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section
        style={{ paddingTop: "140px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            background:
              "radial-gradient(ellipse, rgba(76,169,48,0.1) 0%, rgba(34,211,238,0.05) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
            <SectionLabel>Air Taxi System Architecture</SectionLabel>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                marginBottom: "24px",
                lineHeight: 1.1,
                fontWeight: 800,
              }}
            >
              Passenger Air Taxi{" "}
              <span style={{ color: "var(--accent-primary)" }}>Component Architecture</span>
            </h1>

            <p
              style={{
                fontSize: "1.15rem",
                color: "var(--text-secondary)",
                maxWidth: "760px",
                margin: "0 auto 16px",
                lineHeight: 1.7,
              }}
            >
              A modern air taxi is not just an aircraft. It is an integrated aerospace system combining battery
              intelligence, distributed electric propulsion, flight controls, avionics, autonomy, cybersecurity,
              certification evidence, and ground operations.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                maxWidth: "680px",
                margin: "0 auto 40px",
                lineHeight: 1.6,
              }}
            >
              A systems-level view of the major aircraft, energy, propulsion, avionics, software, safety, and
              cybersecurity components required to design, develop, verify, and operate a modern eVTOL air taxi.
            </p>

            <div
              className="flex-responsive"
              style={{ gap: "16px", justifyContent: "center", marginBottom: "48px" }}
            >
              <a href="#component-priorities" className="btn btn-primary">
                Explore Component Priorities
              </a>
              <a href="#requirement-roadmap" className="btn btn-secondary">
                View Upcoming Requirements
              </a>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
              {["Battery Intelligence", "Distributed Propulsion", "Flight Control", "Cybersecurity", "Certification"].map(
                (badge) => (
                  <span
                    key={badge}
                    style={{
                      display: "inline-flex",
                      padding: "7px 16px",
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Important Note ── */}
      <section className="section bg-surface">
        <div className="container">
          <div
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.25)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 32px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }}>⚠</span>
            <p style={{ fontSize: "0.9rem", color: "rgba(234,247,241,0.8)", lineHeight: 1.7 }}>
              <strong style={{ color: "#FBBF24" }}>Note: </strong>The charts on this page are conceptual
              engineering estimates for planning and prioritisation. They are not manufacturer-specific
              bill-of-materials data. They are intended to help identify where engineering, safety, cybersecurity,
              and product-development focus should be placed first.
            </p>
          </div>
        </div>
      </section>

      {/* ── Battery & Energy Cybersecurity Deep Dive ── */}
      <section className="section">
        <div className="container">
          <div
            className="glass-panel"
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-between",
              borderLeft: "3px solid #818CF8",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <div style={{ flex: "1 1 420px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  background: "rgba(129,140,248,0.1)",
                  border: "1px solid rgba(129,140,248,0.3)",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#818CF8",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                Deep Dive
              </span>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>
                Explore Battery &amp; Energy Cybersecurity in Depth
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                A dedicated deep dive into the eVTOL energy trust chain, BMS threat modelling, an interactive
                threat-modelling studio, and a discovery workshop for electric and hybrid-electric aircraft energy
                cybersecurity.
              </p>
            </div>
            <Link
              href="/design-development/passenger-taxi/battery-cybersecurity"
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
              data-track-event="passenger_taxi_battery_cybersecurity_link"
            >
              Battery &amp; Energy Cybersecurity
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 1: Major Components ── */}
      <section className="section" id="major-components">
        <div className="container">
          <div style={{ marginBottom: "48px" }}>
            <SectionLabel>System Overview</SectionLabel>
            <h2 style={{ marginBottom: "12px" }}>Major Air Taxi Components</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "680px" }}>
              An eVTOL air taxi integrates ten major engineering domains, each with distinct hardware, software,
              safety, and certification responsibilities.
            </p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}
          >
            {COMPONENTS.map((c) => (
              <ComponentCard key={c.number} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Priority Charts ── */}
      <section className="section bg-surface" id="component-priorities">
        <div className="container">
          <div style={{ marginBottom: "48px" }}>
            <SectionLabel>Priority Analysis</SectionLabel>
            <h2 style={{ marginBottom: "12px" }}>Component Priority Dashboard</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "680px" }}>
              Five engineering lenses — cost, mission importance, safety criticality, engineering complexity, and
              cybersecurity exposure — mapped across major eVTOL air taxi subsystems. Hover each slice to explore
              the data.
            </p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "28px" }}
          >
            {CHARTS.map((chart, i) => (
              <PriorityPieChart key={i} {...chart} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Priority Matrix ── */}
      <section className="section" id="priority-matrix">
        <div className="container">
          <div style={{ marginBottom: "40px" }}>
            <SectionLabel>Engineering Matrix</SectionLabel>
            <h2 style={{ marginBottom: "12px" }}>Component Priority Matrix</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "680px" }}>
              A cross-domain view of cost, mission importance, safety criticality, cybersecurity exposure, and
              recommended engineering priority for each major air taxi domain.
            </p>
          </div>
          <PriorityMatrix />
        </div>
      </section>

      {/* ── Section 4: Requirement Roadmap ── */}
      <section className="section bg-surface" id="requirement-roadmap">
        <div className="container">
          <div style={{ marginBottom: "48px" }}>
            <SectionLabel>Requirement Roadmap</SectionLabel>
            <h2 style={{ marginBottom: "12px" }}>Recommended Requirement Roadmap</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "680px" }}>
              Four sequenced mission packages that progressively build from battery digital identity to full
              aircraft trust scoring — starting with Battery Aadhaar, through Battery Cybersecurity, Mission
              Battery Trust Score, and Aircraft Trust Score.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {MISSIONS.map((mission) => (
              <RoadmapMissionCard key={mission.code} {...mission} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Strategic Fit ── */}
      <section className="section" id="strategic-fit">
        <div className="container">
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "48px" }}>
            <SectionLabel>EV.ENGINEER Strategic Fit</SectionLabel>
            <h2 style={{ marginBottom: "20px" }}>Why Battery Intelligence Comes First</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "1.05rem" }}>
              For a passenger air taxi, the battery system is not only a power source. It is a
              safety-critical, mission-critical, cyber-physical system. Battery failure, false telemetry,
              firmware tampering, thermal runaway, or incorrect state-of-health estimation can directly affect
              mission readiness. Therefore, Battery Aadhaar, Battery Cybersecurity, and Mission Battery Trust
              Score should be prioritised before expanding to full aircraft-level trust scoring.
            </p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}
          >
            {[
              {
                step: "01",
                title: "Start with Battery Aadhaar",
                body: "Build the digital identity foundation for every battery pack, module, firmware version, and certificate.",
                color: "#4CA930",
              },
              {
                step: "02",
                title: "Add Battery Cybersecurity",
                body: "Protect firmware, telemetry, certificates, and BMS trust from spoofing, tampering, and replay attacks.",
                color: "#818CF8",
              },
              {
                step: "03",
                title: "Scale to Aircraft Trust",
                body: "Aggregate battery, propulsion, flight control, avionics, and maintenance evidence into an aircraft-level readiness score.",
                color: "#22D3EE",
              },
            ].map((card) => (
              <div
                key={card.step}
                className="glass-panel"
                style={{ borderTop: `3px solid ${card.color}`, textAlign: "center" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: `${card.color}20`,
                    border: `2px solid ${card.color}`,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: card.color,
                    marginBottom: "16px",
                  }}
                >
                  {card.step}
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "10px" }}>{card.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Author ── */}
      <AuthorSection />

      {/* ── CTA ── */}
      <section className="section bg-surface" style={{ textAlign: "center" }}>
        <div className="container">
          <h2 style={{ marginBottom: "16px" }}>Advance Your eVTOL Engineering Capability</h2>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 36px",
              fontSize: "1.05rem",
            }}
          >
            Partner with EV.ENGINEER™ to build intelligent battery systems, cybersecurity frameworks, and
            aircraft trust scoring for modern eVTOL air taxis.
          </p>
          <div className="flex-responsive" style={{ gap: "16px", justifyContent: "center" }}>
            <Link href="/corporate-training" className="btn btn-primary">
              Request Training
            </Link>
            <Link href="/consulting" className="btn btn-secondary">
              Consulting Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
