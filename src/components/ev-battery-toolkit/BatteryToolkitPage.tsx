// EV.ENGINEER™ — EV Battery Health & Diagnostics Toolkit.
//
// The page is server-rendered: every section's text, the platform table, the
// FAQ and the answers are in the HTML. Interactive sections are client
// components; the 3D scenes are separate chunks loaded only on a desktop
// viewport with WebGL. The site's shared navbar and footer are not drawn on
// this route (see ChromeGate), so the page supplies its own.
//
// `data-track-manual` stops the site-wide click listener from also counting
// buttons here as generic clicks: the toolkit reports its own events, with
// privacy-filtered parameters (see lib/ev-battery-toolkit/analytics.ts).
import Link from "next/link";
import { ArrowRight, BatteryCharging, ChevronRight, ExternalLink, Laptop, ShieldCheck } from "lucide-react";
import ResearcherCard from "@/components/ResearcherCard";
import { ANSWERS, EXTERNAL_EQUIPMENT, EXTERNAL_LABEL, FAQ, FLOW, TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { EVEIUM_DATA_QUALITY } from "@/data/ev-battery-toolkit/eveium";
import { SPEC_FIELDS, VEHICLES } from "@/data/ev-battery-toolkit/vehicles";
import { LINK_EVENTS } from "@/lib/ev-battery-toolkit/analytics";
import { UNVERIFIED_SPEC } from "@/lib/ev-battery-toolkit/provenance";
import ArchitectureLabs from "./sections/ArchitectureLabs";
import BmsTwin from "./sections/BmsTwin";
import { DesktopCta, LaunchButton, PageViewTracker } from "./sections/ClientBits";
import DiagnosisSection from "./sections/DiagnosisSection";
import FaultEngine, { CommonIssues } from "./sections/FaultEngine";
import HealthDashboard from "./sections/HealthDashboard";
import Hierarchy from "./sections/Hierarchy";
import ModeSection from "./sections/ModeSection";
import ReportPreview from "./sections/ReportPreview";
import VehicleLocator from "./sections/VehicleLocator";
import { Pill, ProvenanceBadge, SectionHead } from "./ui/Badges";
import Workbench from "./workspace/Workbench";
import Workspace from "./workspace/Workspace";
import css from "./toolkit.module.css";

const NAV = [
  { href: "#modes", label: "Modes" },
  { href: "#locator", label: "Locator" },
  { href: "#explorer", label: "3D Explorer" },
  { href: "#bms", label: "BMS" },
  { href: "#faults", label: "Faults" },
  { href: "#diagnosis", label: "Diagnosis" },
  { href: "#report", label: "Report" },
  { href: "#faq", label: "FAQ" },
];

/** One row per platform family; a family's models are listed together. */
const PLATFORM_FAMILIES = Array.from(new Set(VEHICLES.map((v) => v.family))).map((family) => {
  const members = VEHICLES.filter((v) => v.family === family);
  const sourced = new Set(SPEC_FIELDS.filter((f) => members.some((m) => m.variants.some((x) => x.battery[f.key].value !== null || x.battery[f.key].conflict))).map((f) => f.key));
  return {
    family,
    manufacturer: members[0].manufacturer,
    variants: members.flatMap((m) => (m.variants.length === 1 && m.variants[0].id === "not-specified" ? [m.model] : m.variants.map((x) => x.name))),
    verified: sourced.size,
    total: SPEC_FIELDS.length,
    sourced,
    verificationStatus: members[0].verificationStatus,
    confidence: members[0].confidence,
    page: members[0].manufacturer === "EVeium" ? `${TOOLKIT.route}/vehicles/eveium` : null,
  };
});

function HeroVisual() {
  const cols = 10;
  const rows = 4;
  return (
    <figure className={css.heroVisual} aria-hidden="true">
      <svg viewBox="0 0 420 300">
        <defs>
          <pattern id="ebt-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(147,197,253,0.08)" />
          </pattern>
        </defs>
        <rect width="420" height="300" fill="url(#ebt-grid)" />
        <rect x="30" y="50" width="300" height="150" rx="10" className={css.hvEnclosure} />
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const weak = c === 6;
          return <circle key={i} cx={58 + c * 27} cy={82 + r * 30} r={10} className={weak ? css.hvCellWeak : css.hvCell} />;
        })}
        {Array.from({ length: cols }, (_, c) => (
          <line key={c} x1={58 + c * 27} y1={72} x2={58 + c * 27} y2={30} className={css.hvSense} />
        ))}
        <line x1="58" y1="30" x2="370" y2="30" className={css.hvSense} />
        <rect x="345" y="20" width="60" height="110" rx="6" className={css.hvBms} />
        <text x="375" y="80" textAnchor="middle" className={css.hvLabel}>
          BMS
        </text>
        <rect x="345" y="150" width="60" height="50" rx="6" className={css.hvConnector} />
        <text x="375" y="180" textAnchor="middle" className={css.hvLabel}>
          HV
        </text>
        <text x="30" y="232" className={css.hvCaption}>
          20S · cell group 7 Δ 340 mV · SIMULATED
        </text>
        <rect x="30" y="246" width="300" height="8" rx="4" className={css.hvBar} />
        <rect x="30" y="246" width="186" height="8" rx="4" className={css.hvBarFill} />
        <text x="30" y="276" className={css.hvCaption}>
          SOC 62 % · SOH 91 % · 31.4 °C max
        </text>
      </svg>
    </figure>
  );
}

export default function BatteryToolkitPage() {
  return (
    <div className={css.page} data-track-manual="">
      <PageViewTracker />
      <a href="#main-content" className={css.skipLink}>
        Skip to content
      </a>
      <header className={css.header}>
        <div className={css.headerInner}>
          <Link href="/internships" className={css.brand}>
            <span className={css.brandMark} aria-hidden="true">
              <BatteryCharging size={16} />
            </span>
            <span>
              EV.ENGINEER<sup>™</sup> <span className={css.brandSub}>Battery Toolkit</span>
            </span>
          </Link>
          <nav aria-label="Toolkit sections" className={css.nav}>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/internships" className={css.headerLink}>
            Internships
          </Link>
        </div>
      </header>

      <main id="main-content">
        {/* 1 · Hero */}
        <div className={css.heroWrap}>
          <div className={css.container}>
            <nav className={css.breadcrumb} aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href="/internships">Internships</Link>
                  <ChevronRight size={12} aria-hidden="true" />
                </li>
                <li aria-current="page">EV Battery Health &amp; Diagnostics Toolkit</li>
              </ol>
            </nav>
            <section className={css.hero} aria-labelledby="hero-title">
              <div className={css.heroCopy}>
                <p className={css.heroEyebrow}>Electric scooters · South India · V1</p>
                <h1 id="hero-title" className={css.h1}>
                  {TOOLKIT.name}
                </h1>
                <p className={css.heroSub}>{TOOLKIT.subtitle}</p>
                <p className={css.heroLede}>{TOOLKIT.statement}</p>
                <div className={css.heroActions}>
                  <LaunchButton />
                  <a href="#diagnosis" className={css.secondaryButton}>
                    Explore Battery Diagnostics
                  </a>
                </div>
                <ol className={css.heroFlow} aria-label="Diagnostic flow">
                  {FLOW.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className={css.positioning}>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{TOOLKIT.positioning}</span>
                </p>
              </div>
              <HeroVisual />
            </section>
          </div>
        </div>

        {/* 2 · Modes */}
        <section id="modes" className={css.section} aria-labelledby="modes-h">
          <div className={css.container}>
            <SectionHead id="modes-h" eyebrow="Owner / Technician Mode" title="Two modes, one battery">
              <p>Owners get symptoms, severity and the safe next step. Technicians get the full workflow, from locating the battery to the report.</p>
            </SectionHead>
            <ModeSection />
          </div>
        </section>

        {/* 3 · Locator */}
        <section id="locator" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="locator-h">
          <div className={css.container}>
            <SectionHead id="locator-h" eyebrow="Vehicle Battery Locator" title="Find the battery on the vehicle">
              <p>Select the scooter, confirm the architecture you see and locate the battery on a generic 3D scooter.</p>
            </SectionHead>
            <VehicleLocator />
          </div>
        </section>

        {/* 4 · Architectures */}
        <section id="architectures" className={css.section} aria-labelledby="arch-h">
          <div className={css.container}>
            <SectionHead id="arch-h" eyebrow="Fixed / Swappable Battery Architecture" title="Three architectures, one data model">
              <p>Integrated floor packs, removable and swappable packs, and traditional serviceable packs. The 3D model is built from each architecture&apos;s data.</p>
            </SectionHead>
            <ArchitectureLabs />
          </div>
        </section>

        {/* 5 · 3D Explorer */}
        <section id="explorer" className={`${css.section} ${css.sectionAlt} ${css.sectionMajor}`} aria-labelledby="explorer-h">
          <div className={css.containerWide}>
            <SectionHead id="explorer-h" eyebrow="3D Battery Explorer" title="Open the pack. Follow the current. Find the fault.">
              <p>Configure a pack, then rotate, x-ray and explode it. Switch to thermal, cell-voltage, current-flow or BMS views, and select any part to see what it does and how it fails.</p>
            </SectionHead>
            <Workspace />
            <h3 className={css.subTitle}>Virtual Diagnostic Workbench</h3>
            <Workbench />
          </div>
        </section>

        {/* 6 · Hierarchy */}
        <section id="hierarchy" className={css.section} aria-labelledby="hierarchy-h">
          <div className={css.container}>
            <SectionHead id="hierarchy-h" eyebrow="Battery Pack → Module → Cell → BMS" title="From the scooter down to the cell">
              <p>Each level opens in the 3D explorer.</p>
            </SectionHead>
            <Hierarchy />
          </div>
        </section>

        {/* 7 · Health */}
        <section id="health" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="health-h">
          <div className={css.container}>
            <SectionHead id="health-h" eyebrow="Battery Health Dashboard" title="Health as a status you can explain">
              <p>Healthy, Attention, Service Recommended or Critical — with every contributing factor and its reference threshold.</p>
            </SectionHead>
            <HealthDashboard />
          </div>
        </section>

        {/* 8 · BMS */}
        <section id="bms" className={css.section} aria-labelledby="bms-h">
          <div className={css.container}>
            <SectionHead id="bms-h" eyebrow="BMS Digital Twin" title="What the BMS measures, decides and reports">
              <p>From cell sensing to the vehicle controller over CAN, UART or BLE. Abnormal values explain themselves.</p>
            </SectionHead>
            <BmsTwin />
          </div>
        </section>

        {/* 9 · Faults */}
        <section id="faults" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="faults-h">
          <div className={css.container}>
            <SectionHead id="faults-h" eyebrow="Fault Injection / Battery Issues" title="Inject a fault, then find it">
              <p>Thirty-nine simulated faults across cell, thermal, electrical, BMS, charging, environment, lifecycle, communication and safety.</p>
            </SectionHead>
            <FaultEngine />
            <h3 className={css.subTitle}>Common battery issues</h3>
            <CommonIssues />
          </div>
        </section>

        {/* 10 · Diagnosis */}
        <section id="diagnosis" className={`${css.section} ${css.sectionMajor}`} aria-labelledby="diagnosis-h">
          <div className={css.container}>
            <SectionHead id="diagnosis-h" eyebrow="Technician Diagnostic Workflow" title="Diagnose a real scooter, step by step">
              <p>Customer complaint to customer report, with a safety screen first, evidence behind every conclusion and verification before the scooter goes back.</p>
            </SectionHead>
            <DiagnosisSection />
          </div>
        </section>

        {/* 11 · Platforms */}
        <section id="platforms" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="platforms-h">
          <div className={css.container}>
            <SectionHead id="platforms-h" eyebrow="Supported Scooter Platforms" title="Priority South India EV Scooter Battery Platforms">
              <p>The first five platform families the toolkit structures data for. The order is a priority for this toolkit, not a ranking of reliability.</p>
            </SectionHead>
            <div className={css.tableWrap}>
              <table className={css.platformTable}>
                <caption className={css.srOnly}>Priority platforms and the verification state of their battery data</caption>
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Variants</th>
                    <th scope="col">Battery data</th>
                    <th scope="col">Verification</th>
                    <th scope="col">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_FAMILIES.map((f) => (
                    <tr key={f.family}>
                      <th scope="row">
                        {f.family}
                        <span className={css.cellSub}>{f.manufacturer}</span>
                      </th>
                      <td>{f.variants.join(", ")}</td>
                      <td>
                        {f.verified > 0 ? (
                          <>
                            {EVEIUM_DATA_QUALITY} <ProvenanceBadge provenance="MANUFACTURER_VERIFIED" />
                            {f.page ? (
                              <Link href={f.page} className={css.inlineLink}>
                                Open {f.manufacturer} battery diagnostics →
                              </Link>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {UNVERIFIED_SPEC} <ProvenanceBadge provenance="UNKNOWN" />
                          </>
                        )}
                        <details className={css.specDetails}>
                          <summary>
                            {f.verified} of {f.total} fields published with a source
                          </summary>
                          <ul>
                            {SPEC_FIELDS.map((field) => (
                              <li key={field.key}>
                                {field.label}: <span>{f.sourced.has(field.key) ? "SOURCED" : "UNKNOWN"}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      </td>
                      <td>{f.verificationStatus}</td>
                      <td>
                        <Pill family="warning">{f.confidence}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={css.fineNote}>
              Battery values appear here only once verified from a recorded source. Until then the toolkit structures the diagnosis around what the technician measures on the vehicle. Variant names identify the vehicle in a job card and carry no battery data.
            </p>
          </div>
        </section>

        {/* 12 · Report */}
        <section id="report" className={css.section} aria-labelledby="report-h">
          <div className={css.container}>
            <SectionHead id="report-h" eyebrow="Technician Report Preview" title="Battery Diagnostic Report">
              <p>Before and after repair, diagnosis, root cause, verification and evidence — with the origin of every value and a data quality summary.</p>
            </SectionHead>
            <ReportPreview />
          </div>
        </section>

        {/* 13 · Equipment */}
        <section id="equipment" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="equipment-h">
          <div className={css.container}>
            <SectionHead id="equipment-h" eyebrow="External equipment" title="Compatible Battery Diagnostic Equipment">
              <p>External testers can supply measurements. None is required to use this toolkit.</p>
            </SectionHead>
            <ul className={css.equipmentGrid}>
              {EXTERNAL_EQUIPMENT.map((tool) => (
                <li key={tool.id} className={css.equipment}>
                  <div className={css.equipmentHead}>
                    <h3 className={css.h3}>{tool.name}</h3>
                    <span className={css.cellSub}>{tool.vendor}</span>
                  </div>
                  <p className={css.externalLabel}>{EXTERNAL_LABEL}</p>
                  <p>{tool.vendorStatement}</p>
                  <dl className={css.capabilities}>
                    {Object.entries(tool.capabilities).map(([cap, state]) => (
                      <div key={cap}>
                        <dt>{cap}</dt>
                        <dd data-state={state}>{state === "VENDOR_STATED" ? "Vendor-stated" : "Not verified"}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className={css.fine}>
                    {tool.compatibilityNotes} Source: {tool.source}, retrieved {tool.retrieved}.
                  </p>
                  <a href={tool.website} target="_blank" rel="noopener noreferrer" className={css.textLink} data-track-event={LINK_EVENTS.externalTool} data-track-tool={tool.id}>
                    External website <ExternalLink size={14} aria-hidden="true" />
                    <span className={css.srOnly}> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 14 · Desktop */}
        <section id="desktop" className={css.section} aria-labelledby="desktop-h">
          <div className={css.container}>
            <div className={css.desktopPanel}>
              <Laptop size={28} aria-hidden="true" />
              <div>
                <h2 id="desktop-h" className={css.h2Small}>
                  Built for Laptop &amp; Desktop
                </h2>
                <p>The complete 3D battery diagnostics workspace is optimised for laptop and desktop systems.</p>
                <p className={css.mobileOnly}>Open this toolkit on a laptop or desktop for the complete interactive 3D diagnostic experience.</p>
                <div className={css.mobileOnly}>
                  <DesktopCta />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 15 · FAQ and answers */}
        <section id="faq" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="faq-h">
          <div className={css.container}>
            <SectionHead id="faq-h" eyebrow="FAQ" title="Questions and short answers" />
            <h3 className={css.subTitle}>The toolkit in brief</h3>
            <dl className={css.answers}>
              {ANSWERS.map((a) => (
                <div key={a.q}>
                  <dt>{a.q}</dt>
                  <dd>{a.a}</dd>
                </div>
              ))}
            </dl>
            <h3 className={css.subTitle}>Frequently asked questions</h3>
            <div className={css.faqList}>
              {FAQ.map((f) => (
                <details key={f.q} className={css.faq}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <p className={css.related}>
              Related on EV.ENGINEER:{" "}
              <Link href="/internships/battery-pack-design">EV Battery Pack Design</Link> · <Link href="/internships/battery-fire-prevention">Battery Fire Prevention</Link> ·{" "}
              <Link href="/internships/AegisCAN">AegisCAN — CAN &amp; BMS Cybersecurity</Link> · <Link href="/space/satellite-engineering">Satellite Engineering</Link>
            </p>
          </div>
        </section>

        {/* 16 · Designed by */}
        <section className={`${css.section} ${css.designedBy}`} aria-label="Designed by">
          <div className={css.container}>
            <ResearcherCard profileLinkProps={{ "data-track-event": LINK_EVENTS.profile, "data-track-source": "ev_battery_toolkit" }} />
            <p className={css.providerNote}>
              {TOOLKIT.name} is an EV.ENGINEER™ engineering toolkit. EV.ENGINEER is operated by iTelematics Software Private Limited.
            </p>
            <p className={css.reviewed}>
              Toolkit information last reviewed: <time dateTime={TOOLKIT.reviewed}>18 October 2026</time>.
            </p>
          </div>
        </section>
      </main>

      <footer className={css.footer}>
        <div className={css.container}>
          <div className={css.footerInner}>
            <div>
              <p className={css.footerBrand}>EV.ENGINEER™ — EV Battery Health &amp; Diagnostics Toolkit</p>
              <p className={css.fine}>{TOOLKIT.positioning}</p>
            </div>
            <ul className={css.footerLinks}>
              <li>
                <Link href="/internships">Internships</Link>
              </li>
              <li>
                <Link href="/space/satellite-engineering">Satellite Engineering</Link>
              </li>
              <li>
                <Link href="/about/sudarshana-karkala">Sudarshana Karkala</Link>
              </li>
              <li>
                <Link href="/contact">
                  Contact <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
