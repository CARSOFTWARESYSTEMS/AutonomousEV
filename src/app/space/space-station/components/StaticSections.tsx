// Server-rendered sections: cybersecurity, economy, Earth-to-Moon and profile.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CYBER_TOPICS, CYBER_SOURCES, ECONOMY } from "../data/operations";
import { MOON_PROGRESSION, ENV_COMPARISON, type EnvKey } from "../data/stations";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import { ISHAVASYAM, ITELEMATICS_ORG } from "../data/organisations";
import { Badge, SourceList } from "./ui";
import { FactorCompare, CyberAreas } from "./MobilePickers";
import styles from "../station.module.css";

const THREATS: { threat: string; control: string }[] = [
  { threat: "Spoofed or replayed commands", control: "Command authentication, anti-replay counters, authorisation checks" },
  { threat: "Compromised research payload", control: "Payload network segmentation, gateways, least privilege" },
  { threat: "Malicious or faulty software update", control: "Code signing, staged testing, rollback" },
  { threat: "Tampered telemetry", control: "Integrity protection, cross-checks against physics models" },
  { threat: "Supply-chain compromise", control: "Provenance tracking, inspection, software bills of materials" },
  { threat: "Ground-segment intrusion", control: "Hardened control centres, monitoring, zero-trust access" },
];

export function CyberThreatModel() {
  return (
    <>
      <ol className={`${styles.zoneStack} ${styles.mobileOnly}`} aria-label="Trust zones from station to ground">
        {["Station — vehicle control network (critical)", "Station — crew and payload networks, behind gateways", "Space segment interfaces", "Communication link — authenticated and encrypted", "Ground segment — control centres and payload operators"].map((z) => (
          <li key={z}>{z}</li>
        ))}
      </ol>
      <figure className={`${styles.archDiagram} ${styles.desktopOnly}`} style={{ margin: "0 0 20px" }}>
        <svg viewBox="0 0 720 330" role="img" aria-labelledby="tm-t tm-d" style={{ background: "#0b1733", borderRadius: 12 }}>
          <title id="tm-t">Defensive threat model of an orbital research station</title>
          <desc id="tm-d">
            Three trust zones: the ground segment, the space link, and the station. The station separates a critical vehicle-control network from crew and
            payload networks through controlled gateways. Supply chain inputs and monitoring span all zones. Threats are shown with the defensive control that
            addresses each.
          </desc>
          <g fontSize="12" fill="#e2e8f0">
            <rect x="16" y="40" width="170" height="220" rx="12" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeDasharray="5 4" />
            <text x="30" y="62" fontWeight="700" fill="#6ee7b7">Ground segment</text>
            {["Mission control", "Ground stations", "Payload operators"].map((t, i) => (
              <g key={t}>
                <rect x="32" y={80 + i * 56} width="138" height="40" rx="8" fill="#0f172a" stroke="#334155" />
                <text x="101" y={105 + i * 56} textAnchor="middle">{t}</text>
              </g>
            ))}
            <rect x="222" y="120" width="120" height="60" rx="10" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" />
            <text x="282" y="145" textAnchor="middle" fontWeight="700" fill="#93c5fd">Space link</text>
            <text x="282" y="164" textAnchor="middle" fontSize="11">Authenticated · encrypted</text>
            <line x1="186" y1="150" x2="222" y2="150" stroke="#93c5fd" strokeWidth="2" />
            <line x1="342" y1="150" x2="378" y2="150" stroke="#93c5fd" strokeWidth="2" />
            <rect x="378" y="20" width="326" height="260" rx="12" fill="rgba(124,58,237,0.07)" stroke="#8b5cf6" strokeDasharray="5 4" />
            <text x="392" y="42" fontWeight="700" fill="#c4b5fd">Station</text>
            <rect x="396" y="56" width="290" height="62" rx="8" fill="rgba(239,68,68,0.08)" stroke="#ef4444" />
            <text x="541" y="82" textAnchor="middle" fontWeight="700" fill="#fca5a5">Vehicle control network (critical)</text>
            <text x="541" y="102" textAnchor="middle" fontSize="11">GNC · power · life support · thermal</text>
            <rect x="396" y="170" width="136" height="56" rx="8" fill="#0f172a" stroke="#334155" />
            <text x="464" y="194" textAnchor="middle">Crew network</text>
            <text x="464" y="212" textAnchor="middle" fontSize="11">laptops · comms</text>
            <rect x="550" y="170" width="136" height="56" rx="8" fill="#0f172a" stroke="#334155" />
            <text x="618" y="194" textAnchor="middle">Payload network</text>
            <text x="618" y="212" textAnchor="middle" fontSize="11">multi-tenant racks</text>
            {[464, 618].map((x) => (
              <g key={x}>
                <line x1={x} y1="170" x2={x} y2="118" stroke="#fcd34d" strokeWidth="2" />
                <rect x={x - 34} y="134" width="68" height="20" rx="5" fill="#422006" stroke="#fcd34d" />
                <text x={x} y="148" textAnchor="middle" fontSize="10" fill="#fcd34d">Gateway</text>
              </g>
            ))}
            <text x="541" y="258" textAnchor="middle" fontSize="11" fill="#b5b8c9">Least privilege · signed software · anomaly detection</text>
            <rect x="16" y="290" width="688" height="30" rx="8" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" />
            <text x="360" y="310" textAnchor="middle" fontSize="12" fill="#fcd34d">Supply chain · monitoring · incident response span every zone</text>
          </g>
        </svg>
      </figure>
      <dl className={`${styles.defList} ${styles.mobileOnly}`} aria-label="Threats and defensive controls">
        {THREATS.map((t) => (
          <div key={t.threat}>
            <dt>{t.threat}</dt>
            <dd>{t.control}</dd>
          </div>
        ))}
      </dl>
      <div className={`${styles.scrollX} ${styles.desktopOnly}`}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Threats and defensive controls</caption>
          <thead>
            <tr>
              <th scope="col">Threat (what could go wrong)</th>
              <th scope="col">Defensive control</th>
            </tr>
          </thead>
          <tbody>
            {THREATS.map((t) => (
              <tr key={t.threat}>
                <th scope="row">{t.threat}</th>
                <td>{t.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.mobileOnly} style={{ marginTop: 20 }}>
        <CyberAreas />
      </div>
      <div className={`${styles.ruleGrid} ${styles.desktopOnly}`} style={{ marginTop: 24 }}>
        {CYBER_TOPICS.map((c) => (
          <article key={c.name}>
            <h4>{c.name}</h4>
            <p>{c.text}</p>
          </article>
        ))}
      </div>
      <SourceList ids={CYBER_SOURCES} />
    </>
  );
}

export function Economy() {
  return (
    <>
      <div className={styles.split}>
        <div>
          <h3>NASA&apos;s transition in low Earth orbit</h3>
          <ol className={styles.flow} style={{ margin: "12px 0" }}>
            {["ISS (government-owned)", "Commercial LEO destinations", "NASA as one customer among many"].map((s, i, a) => (
              <li key={s}>
                <span>{s}</span>
                {i < a.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <p>
            NASA plans to end ISS operations in 2030 and buy services from commercially owned stations. In March 2026 it added an ISS-anchored option
            using a government-owned Core Module that commercial modules attach to before detaching into free flight.
          </p>
          <p style={{ fontSize: 14 }}>
            Commercial maturity should not be overstated: no commercial free-flying station is operating yet, and sustained non-government demand remains to be demonstrated.
          </p>
        </div>
        <div className={styles.scrollX}>
          <table className={styles.table} style={{ minWidth: 0 }}>
            <caption className={styles.srOnly}>Station markets and their maturity</caption>
            <thead>
              <tr>
                <th scope="col">Market</th>
                <th scope="col">Maturity</th>
              </tr>
            </thead>
            <tbody>
              {ECONOMY.map((e) => (
                <tr key={e.name}>
                  <th scope="row">
                    {e.name}
                    <div style={{ fontWeight: 400, color: "var(--space-muted)", fontSize: 13 }}>{e.text}</div>
                  </th>
                  <td>
                    <Badge label={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <SourceList ids={["nasa-cld", "nasa-leo-2026", "nasa-iss-transition-faq", "issnl"]} />
    </>
  );
}

const ENV_LABEL: Record<EnvKey, string> = { leo: "LEO station", lunarOrbit: "Lunar-orbit station", lunarSurface: "Lunar-surface habitat" };

export function EarthToMoon() {
  const keys = Object.keys(ENV_LABEL) as EnvKey[];
  return (
    <>
      <ol className={styles.steps} style={{ marginBottom: 20 }} aria-label="Progression from Earth orbit to the Moon">
        {MOON_PROGRESSION.map((m) => (
          <li key={m.id}>
            <h4>{m.label}</h4>
            <p>{m.note}</p>
          </li>
        ))}
      </ol>
      <div className={`${styles.scrollX} ${styles.desktopOnly}`}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>LEO station vs lunar-orbit station vs lunar-surface habitat</caption>
          <thead>
            <tr>
              <th scope="col">Variable</th>
              {keys.map((k) => (
                <th key={k} scope="col">{ENV_LABEL[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENV_COMPARISON.map((row) => (
              <tr key={row.variable}>
                <th scope="row">{row.variable}</th>
                {keys.map((k) => (
                  <td key={k}>{row.values[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.mobileOnly}>
        <FactorCompare />
      </div>
      <SourceList ids={["nasa-gateway-faq", "nasa-leo-2026", "nasa-hrp", "nasa-iss-facts"]} />
    </>
  );
}

export function ResearchProfile() {
  const focus = ["Space Systems & Applications", "Avionics & Telemetry", "Digital Twins", "Aerospace Cybersecurity"];
  return (
    <div className={styles.profile}>
      <Image src="/SudarshanaKarkala.jpg" alt="Portrait of Sudarshana Karkala" width={72} height={72} />
      <div>
        <h3>{SUDARSHANA_KARKALA.name}</h3>
        <p style={{ marginTop: 6 }}>
          Research and project direction for this simulator. Current technology and R&amp;D focus areas include:
        </p>
        <ul className={styles.chips} style={{ listStyle: "none", padding: 0, margin: "8px 0 14px" }}>
          {focus.map((f) => (
            <li key={f} className={styles.tag} style={{ margin: 0 }}>
              {f}
            </li>
          ))}
        </ul>
        <Link href="/about/sudarshana-karkala" className={styles.primaryButton}>
          View profile <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function Organisations() {
  return (
    <div className={styles.grid2} style={{ marginTop: 16, maxWidth: 860 }}>
      <article className={styles.card}>
        <div className={styles.eyebrow}>{ISHAVASYAM.descriptor}</div>
        <h3>{ISHAVASYAM.name}</h3>
        <a className={styles.inlineLink} style={{ display: "inline-block", marginTop: 10 }} href={ISHAVASYAM.url} target="_blank" rel="noopener noreferrer">
          Visit {ISHAVASYAM.name}
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      </article>
      <article className={styles.card}>
        <div className={styles.eyebrow}>Commercial enquiries</div>
        <h3>{ITELEMATICS_ORG.name}</h3>
        <p style={{ marginTop: 6 }}>
          Commercial products and services, where applicable, are handled separately by {ITELEMATICS_ORG.name} under explicit agreements.
        </p>
        <a className={styles.inlineLink} href={ITELEMATICS_ORG.url} target="_blank" rel="noopener noreferrer">
          Visit {ITELEMATICS_ORG.shortName}
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      </article>
    </div>
  );
}
