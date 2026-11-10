import Link from "next/link";
import { manrope, inter, FONT_MANROPE, FONT_INTER } from "./fonts";
import SpaceHeader from "./components/SpaceHeader";
import SpaceFooter from "./components/SpaceFooter";
import FaqItem from "./components/FaqItem";
import SectionNav, { type SectionNavItem } from "./components/SectionNav";
import PropulsionTwinCardVisual from "./components/PropulsionTwinCardVisual";
import { ApexProjectCard, PartnersEcosystem } from "./components/PartnersEcosystem";
import ResearcherCard from "@/components/ResearcherCard";
import theme from "./spaceTheme.module.css";
import {
  Shield, Satellite, Orbit, Activity, HeartPulse, Cpu, AlertTriangle,
  LifeBuoy, GraduationCap, FlaskConical, Rocket, Radio, Radar, RefreshCw,
  Globe, Users, Layers, CheckCircle2, ArrowRight, ChevronRight,
  ChevronDown, ExternalLink,
} from "lucide-react";
import styles from "./space.module.css";
import portal from "./portal.module.css";
import {
  heroSummary, missionConsole, missionLoop, visionReferences, pathwayStages,
  educationAreas, internshipWorkAreas, researchLayers, plannedLabs,
  researchThemes, roadmap, participationAudiences,
  accessModels, faqs, type IconName, type PathwayCta,
} from "./spaceData";
import { EOI_FORM_URL } from "@/lib/eoi";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { SPACE_INITIATIVE } from "@/data/space-initiative";

const CONTACT_HREF = "/contact";
const ACADEMY_HREF = "/space/academy";

const iconMap: Record<IconName, React.ComponentType<{ size?: number; color?: string; "aria-hidden"?: boolean }>> = {
  shield: Shield,
  satellite: Satellite,
  orbit: Orbit,
  activity: Activity,
  heartPulse: HeartPulse,
  cpu: Cpu,
  alertTriangle: AlertTriangle,
  lifeBuoy: LifeBuoy,
  graduationCap: GraduationCap,
  flaskConical: FlaskConical,
  rocket: Rocket,
  radio: Radio,
  radar: Radar,
  refreshCw: RefreshCw,
  globe: Globe,
  users: Users,
  layers: Layers,
  checkCircle: CheckCircle2,
};

function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) {
  const Cmp = iconMap[name];
  return <Cmp size={size} color={color} aria-hidden />;
}

const statusColor: Record<string, string> = {
  Nominal: "#10B981",
  Monitor: "#F59E0B",
  Degraded: "#EF4444",
  Advisory: "#A78BFA",
};

/**
 * Text in a pathway hue uses a lighter tint of it, so labels pass WCAG AA on
 * navy. The base colours stay for fills, borders and icons.
 */
const TEXT_TINT: Record<string, string> = {
  "#7C3AED": "#C4B5FD",
  "#8B5CF6": "#C4B5FD",
  "#B39DDB": "#DDD3F3",
  "#3B82F6": "#93C5FD",
  "#06B6D4": "#67E8F9",
  "#F59E0B": "#FCD34D",
  "#10B981": "#6EE7B7",
};
const tint = (color: string) => TEXT_TINT[color.toUpperCase()] ?? color;

const diagramStepDetails: Record<string, string> = {
  "Observe telemetry": "Observe spacecraft state",
  "Detect anomaly": "Flag deviations",
  "Diagnose fault": "FDIR diagnosis",
  "Predict impact": "Predict mission impact",
  "Recover safely": "Supervised action",
  "Verify recovery": "Confirm safe state",
};

const diagramSteps = missionLoop.map((step) => ({
  ...step,
  detail: diagramStepDetails[step.step] ?? "",
}));

const statusTone: Record<string, string> = {
  Planned: "#F59E0B",
  Proposed: "#3B82F6",
  "Research Direction": "#06B6D4",
};

/** Passed to the shared partners section so its head matches the rest of the page. */
const sectionH2: React.CSSProperties = {
  fontFamily: FONT_MANROPE,
  fontSize: "clamp(28px, 3.6vw, 40px)",
  fontWeight: 800, letterSpacing: "-0.025em",
  color: "#fff", margin: "0 0 16px", lineHeight: 1.15,
};

const sectionDesc: React.CSSProperties = {
  color: "#C3C6D8", fontSize: 17, lineHeight: 1.7,
  maxWidth: 720, margin: "0 auto", textAlign: "center",
};

const SECTION_NAV: SectionNavItem[] = [
  { label: "Pathways", href: "#pathway" },
  { label: "Mission", href: "#mission" },
  { label: "Ages 14–18", href: "#education" },
  { label: "Tutorials", href: "#simulations" },
  { label: "Labs", href: "#labs" },
  { label: "Research", href: "#research" },
  { label: "Themes", href: "#projects" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Partners", href: "#partners" },
  { label: "FAQ", href: "#faq" },
  { label: "Space Academy", href: ACADEMY_HREF },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className={portal.eyebrow}>{children}</span>;
}

function SectionHead({ label, title, children, id }: { label: React.ReactNode; title: React.ReactNode; children?: React.ReactNode; id?: string }) {
  return (
    <div className={portal.head}>
      <SectionLabel>{label}</SectionLabel>
      <h2 id={id} className={portal.h2}>{title}</h2>
      {children}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span className={portal.pill} style={{ background: `${color}1F`, color: tint(color), border: `1px solid ${color}59` }}>
      {label}
    </span>
  );
}

function PathwayCtaLink({ cta, stage }: { cta: PathwayCta; stage: string }) {
  const track = {
    "data-track-event": "space_pathway_cta_click",
    "data-track-pathway": stage.toLowerCase(),
    "data-track-destination": cta.track,
  };
  const content = (
    <>
      <span>{cta.label}</span>
      {cta.kind === "eoi" ? <ExternalLink size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
    </>
  );
  if (cta.kind === "eoi") {
    return (
      <a
        href={EOI_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${cta.label} (opens Google Form in a new tab)`}
        className={portal.pathwayCta}
        {...track}
      >
        {content}
      </a>
    );
  }
  if (cta.kind === "route") {
    return (
      <Link href={cta.href as string} className={portal.pathwayCta} {...track}>
        {content}
      </Link>
    );
  }
  return (
    <a href={cta.href} className={portal.pathwayCta} {...track}>
      {content}
    </a>
  );
}

// The JSON-LD graph is a prop so each host's route (see ../ishavasyam-space)
// can ship its own entity graph while sharing this page body. Every section,
// the APEX partner card and the Partners & Engineering Ecosystem among them,
// is shown on both hosts.
//
// A server component: only the header, the section navigation and the FAQ
// items are client islands.
export default function SpaceLanding({ entityGraph }: { entityGraph: object }) {
  return (
    <div className={`${styles.root} ${theme.theme} ${portal.page} ${manrope.variable} ${inter.variable}`} style={{ background: "var(--space-background)", minHeight: "100vh", fontFamily: FONT_INTER, overflowX: "clip" }}>
      <JsonLd data={entityGraph} />
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>

      <SpaceHeader />

      <main id="main-content">
        {/* ── 1. Mission hero and overview (#home) ── */}
        <section id="home" style={{ display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }} className={`${styles.gridBg} ${styles.heroSection}`}>
          <div className={styles.orb} style={{ width: 600, height: 600, background: "#7C3AED", top: -100, left: -200 }} />
          <div className={styles.orb} style={{ width: 400, height: 400, background: "#06B6D4", bottom: -100, right: -100 }} />
          <div className={styles.orb} style={{ width: 300, height: 300, background: "#3B82F6", top: "40%", left: "40%" }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", gap: 48, alignItems: "center" }} className={`${styles.heroGrid} ${styles.heroInset}`}>
            <div className={styles.fadeInUp}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 999, padding: "7px 16px", marginBottom: 28,
              }}>
                <Shield size={14} color="#C4B5FD" style={{ flexShrink: 0 }} aria-hidden />
                <span style={{ color: "#D8CCF0", fontSize: 13.5, fontWeight: 500 }}>{SPACE_INITIATIVE.brand} · Autonomous Spacecraft Health Mission 2040</span>
              </div>

              <h1 style={{
                fontFamily: FONT_MANROPE, fontSize: "clamp(34px, 4.2vw, 54px)",
                fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 22px",
              }}>
                <span style={{ color: "#fff" }}>Learn to </span>
                <span style={{ background: "linear-gradient(135deg, #A78BFA, #60A5FA, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Protect Missions.</span>
                {" "}
                <br />
                <span style={{ color: "#fff" }}>Build Systems That Protect Spacecraft.</span>
              </h1>

              <p className={portal.heroLede}>
                A long-term education, engineering and startup pathway focused on Autonomous Spacecraft Health Management and Safe Recovery.
              </p>

              <ol className={portal.stageTrail} aria-label="The pathway">
                <li>Space Education (14–18)</li>
                <li>Internships &amp; Research</li>
                <li>Validated Prototypes</li>
                <li>Young Space Startups</li>
              </ol>

              <div className={styles.ctaGroup} style={{ marginBottom: 20 }}>
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Expression of Interest (opens Google Form in a new tab)"
                  className={styles.eoiCta}
                >
                  Expression of Interest
                </a>
                <a href="#mission" className={portal.btnPrimary}>
                  Explore the Mission <ArrowRight size={16} aria-hidden />
                </a>
                <a href="#pathway" className={theme.secondaryButton}>View the Pathway</a>
                <a href="https://www.evsociety.org/join" target="_blank" rel="noopener noreferrer" className={portal.btnGhost}>Join Community</a>
              </div>

              <Link
                href={ACADEMY_HREF}
                className={portal.academyNotice}
                data-track-event="space_academy_entry_click"
                data-track-placement="hero"
              >
                <span className={portal.academyNoticeTag}>New</span>
                <span>Space Academy for ages 14–18, with interactive 3D missions</span>
                <ArrowRight size={16} aria-hidden />
              </Link>

              <dl className={portal.heroStats}>
                {heroSummary.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right – Mission health console */}
            <div className={styles.floatAnim} style={{ position: "relative" }}>
              <div style={{
                background: "rgba(17,21,46,0.85)", backdropFilter: "blur(24px)",
                border: "1px solid rgba(124,58,237,0.25)", borderRadius: 24,
                padding: "24px", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: "#C4B5FD", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                      Mission Health Console
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: FONT_MANROPE }}>Illustrative Mission Simulation</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }} aria-hidden="true">
                    {["#FF6B6B", "#FFD93D", "#6BCB77"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  </div>
                </div>
                <p style={{ fontSize: 12.5, color: "#A3A7BD", margin: "0 0 16px" }}>
                  Illustrative simulation, not live spacecraft telemetry.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {missionConsole.map((row) => {
                    const c = statusColor[row.status];
                    return (
                      <div key={row.label} className={styles.consoleRow}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                          background: `${c}22`, flexShrink: 0, color: c,
                        }}><Icon name={row.icon} size={18} /></div>
                        <div className={styles.consoleLabel}>
                          <div style={{ fontSize: 14.5, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{row.label}</div>
                        </div>
                        <span className={styles.consoleBadge} style={{
                          fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                          background: `${c}18`, color: c, border: `1px solid ${c}40`, textTransform: "uppercase", letterSpacing: "0.04em",
                        }}>{row.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionNav items={SECTION_NAV} />

        {/* ── 2. Four pathway categories (#pathway) ── */}
        <section id="pathway" className={portal.section}>
          <div className={portal.inner}>
            <SectionHead label="Education to Startup" title="One mission. A lifelong pathway.">
              <p className={portal.lede}>This is a Mission Pathway, not a certification roadmap &mdash; each stage builds on the last.</p>
            </SectionHead>

            <div className={portal.pathwayGrid}>
              {pathwayStages.map((stage) => (
                <article key={stage.stage} className={portal.pathwayCard} data-pathway={stage.key} aria-labelledby={`pathway-${stage.key}`}>
                  <div className={portal.pathwayTop}>
                    <div className={portal.pathwayIcon}><Icon name={stage.icon} size={22} /></div>
                    <div>
                      <span className={portal.pathwayStage}>{stage.stage}</span>
                      <h3 id={`pathway-${stage.key}`} className={portal.pathwayTitle}>{stage.title}</h3>
                    </div>
                  </div>
                  <ul className={portal.pathwayList}>
                    {stage.items.map((item) => (
                      <li key={item}>
                        <ChevronRight size={14} aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <PathwayCtaLink cta={stage.cta} stage={stage.stage} />
                  <p className={portal.pathwayCtaNote}>{stage.cta.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Mission-health explanation (#mission) ── */}
        <section id="mission" className={`${portal.section} ${portal.band}`}>
          <div className={portal.inner}>
            <div className={portal.head} style={{ maxWidth: 820 }}>
              <SectionLabel>One Mission</SectionLabel>
              <h2 className={portal.h2}>Can a spacecraft understand its own health and recover safely?</h2>
              <p className={`${portal.lede} ${portal.ledeStrong} ${styles.proseLeft}`}>
                Autonomous Spacecraft Health Management is the capability to observe spacecraft telemetry, detect and isolate faults, predict mission impact, and recommend or execute verified recovery actions within bounded safety limits.
              </p>
              <details className={portal.more}>
                <summary>Why spacecraft need this</summary>
                <div className={portal.moreBody}>
                  <p>
                    Future long-duration, autonomous, crewed, lunar and deep-space missions cannot depend on continuous ground intervention. A spacecraft must be able to observe its telemetry, detect anomalies, and isolate likely faults through Fault Detection, Isolation and Recovery (FDIR), predict mission impact, and recommend&mdash;or within verified limits execute&mdash;a safe recovery.
                  </p>
                </div>
              </details>
            </div>

            <ol className={portal.loopSteps} aria-label="The health-management loop, step by step">
              {missionLoop.map((step, i) => (
                <li key={step.step} className={portal.loopStep}>
                  <div className={portal.loopIcon}><Icon name={step.icon} size={20} /></div>
                  <div className={portal.stepNumber}>{String(i + 1).padStart(2, "0")}</div>
                  <div className={portal.loopLabel}>{step.step}</div>
                </li>
              ))}
            </ol>

            <figure style={{ maxWidth: 960, margin: "0 auto 32px", textAlign: "center" }}>
              <div className={styles.diagramDesktop}>
                {/* eslint-disable-next-line @next/next/no-img-element -- a crawlable SVG diagram at its intrinsic size */}
                <img
                  src="/space/autonomous-spacecraft-health-management-loop.svg"
                  width={1200}
                  height={320}
                  alt="Autonomous spacecraft health-management loop from telemetry monitoring through verified safe recovery."
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              <div className={styles.diagramMobile}>
                {diagramSteps.map((step, i) => (
                  <div key={step.step}>
                    <div className={styles.diagramStepCard}>
                      <div className={styles.diagramStepIcon}><Icon name={step.icon} size={17} /></div>
                      <div className={styles.diagramStepText}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{step.step}</div>
                        <div style={{ fontSize: 13, color: "#A3A7BD", marginTop: 2 }}>{step.detail}</div>
                      </div>
                    </div>
                    {i < diagramSteps.length - 1 && (
                      <div className={styles.diagramArrowDown} aria-hidden="true"><ChevronDown size={16} /></div>
                    )}
                  </div>
                ))}
                <div className={styles.diagramLoopBack}>
                  Verified state feeds back into continuous telemetry monitoring
                </div>
              </div>
              <figcaption style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.6, color: "#A3A7BD" }}>
                The autonomous spacecraft health-management loop: telemetry monitoring flows into anomaly detection, fault isolation (FDIR), mission-impact prediction, bounded recovery and verification, which feeds back into continuous telemetry monitoring.
              </figcaption>
            </figure>

            <div className={portal.autonomyLadder}>
              <div className={portal.ladderSteps}>
                <span>Advisory</span><ArrowRight size={14} aria-hidden />
                <span>Supervised</span><ArrowRight size={14} aria-hidden />
                <span>Bounded Autonomy</span>
              </div>
              <p className={`${portal.ladderNote} ${styles.proseLeft}`}>
                Generative AI must not directly control a safety-critical spacecraft loop. Autonomy is introduced gradually, under human supervision, and always within verified, bounded limits.
              </p>
            </div>
          </div>
        </section>

        {/* ── Alignment & Independence (#vision) ── */}
        <section id="vision" className={portal.section}>
          <div className={portal.narrow}>
            <SectionHead label="Long-Term Vision" title="Building capability for the missions of 2035, 2040 and beyond">
              <p className={portal.lede}>
                This research direction is aligned with publicly stated Indian ambitions, including long-duration missions, autonomous rendezvous and docking, the Bharatiya Antariksha Station goal for 2035, and an indigenous crewed lunar landing goal for 2040.
              </p>
            </SectionHead>

            <div className={portal.refGrid}>
              {visionReferences.map((ref) => (
                <a key={ref.href} href={ref.href} target="_blank" rel="noopener noreferrer" className={portal.refLink}>
                  {ref.label}
                  <ExternalLink size={15} aria-hidden />
                </a>
              ))}
            </div>

            <div className={portal.notice}>
              <strong>Independent initiative.</strong> References to national space goals are provided for educational context and do not imply endorsement, affiliation or partnership with ISRO, IN-SPACe, NSIL or the Department of Space.
            </div>

            <p className={portal.freshness}>
              Prepared by the {SPACE_INITIATIVE.brand} technical team. Last reviewed: 14 August 2026.
            </p>
          </div>
        </section>

        {/* ── 4. Education to startup, the first two stages in detail (#education, #internships) ── */}
        <div className={`${portal.section} ${portal.band}`}>
          <div className={portal.stageGrid}>
            {/* ── Space Health Explorers (#education) ── */}
            <section id="education" className={portal.stagePanel} data-pathway="discover" aria-labelledby="education-title">
              <SectionLabel>Ages 14&ndash;18</SectionLabel>
              <h2 id="education-title" className={portal.h2}>How does a spacecraft know whether it is healthy?</h2>
              <div>
                <StatusPill label="Planned Programme" color={statusTone.Planned} />
              </div>
              <p className={portal.lede}>Space Health Explorers is a planned programme for students aged 14&ndash;18 exploring spacecraft health from first principles.</p>
              <ul className={portal.tagList} aria-label="Planned learning areas">
                {educationAreas.map((t) => <li key={t} className={portal.tag}>{t}</li>)}
              </ul>
              <div className={portal.academyCard}>
                <h3 className={portal.academyCardTitle}>Start with Space Academy</h3>
                <p className={portal.academyCardText}>
                  Seven learning tracks for ages 14&ndash;16 and 17&ndash;18, and interactive 3D missions you can play in your browser. Online classes and CanSat and Model Rocketry workshops are planned.
                </p>
                <div className={portal.ctaRow}>
                  <Link
                    href={ACADEMY_HREF}
                    className={portal.btnPrimary}
                    data-track-event="space_academy_entry_click"
                    data-track-placement="education"
                  >
                    Explore Space Academy <ArrowRight size={16} aria-hidden />
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Engineering Internships & Research (#internships) ── */}
            <section id="internships" className={portal.stagePanel} data-pathway="engineer" aria-labelledby="internships-title">
              <SectionLabel>Internships &amp; Research</SectionLabel>
              <h2 id="internships-title" className={portal.h2}>One multidisciplinary mission team</h2>
              <p className={portal.lede}>Engineering students work together as one mission team rather than on unrelated projects.</p>
              <div className={portal.notice} style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.22)" }}>
                <strong style={{ color: "#93C5FD" }}>Reference mission: </strong>
                A 3U/6U CubeSat health-management test environment covering electrical power, thermal control, attitude control, onboard computing, communications and payload behaviour.
              </div>
              <ul className={portal.tagList} aria-label="Internship work areas">
                {internshipWorkAreas.map((t) => <li key={t} className={portal.tag}>{t}</li>)}
              </ul>
              <div className={`${portal.notice} ${portal.noticeQuiet}`} style={{ marginTop: "auto" }}>
                Paid training and internships are distinct. Internships will be merit-based and governed by the published terms of each cohort; sponsored or stipended opportunities will be identified explicitly when available.
              </div>
            </section>
          </div>
        </div>

        {/* ── 5. Featured tutorials and simulations (#simulations) ── */}
        <section id="simulations" className={portal.section}>
          <div className={portal.inner}>
            <SectionHead label="Simulations & R&D Projects" title="Learn by building mission-ready thinking">
              <p className={portal.lede}>Explore guided simulation projects that turn spacecraft concepts into testable models, telemetry and engineering evidence.</p>
            </SectionHead>
            <div className={styles.projectGrid}>
              <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard}`}>
                <StatusPill label="Interactive Learning Experience" color="#06B6D4" />
                <h3 className={styles.projectTitle}>Space Applications</h3>
                <p className={styles.projectDesc}>Discover how satellites and space data improve everyday life—from weather and mobility to agriculture, connectivity, disaster response and infrastructure.</p>
                <Link href="/space/everyday-applications" className={`${theme.secondaryButton} ${styles.projectCta}`}>Explore Space Applications <ArrowRight size={16} /></Link>
                <p className={styles.projectNote}>Educational reference · No aerospace background needed.</p>
              </div>
              <div className={`${styles.cardHover} ${styles.projectCard} ${styles.flagshipCard}`}>
                <StatusPill label="Flagship Advanced Program" color="#B39DDB" />
                <h3 className={styles.projectTitle}>Satellite Engineering</h3>
                <p className={styles.flagshipSubtitle}>From First Principles to Spacecraft Systems Architect</p>
                <p className={styles.projectDesc}>A systems-level architecture and engineering leadership program covering mission design, spacecraft subsystems, digital twins, verification, operations, risk, cost and technical decision-making.</p>
                <Link href="/space/satellite-engineering" className={`${theme.secondaryButton} ${styles.projectCta} ${styles.flagshipCta}`}>Explore Satellite Engineering <ArrowRight size={16} /></Link>
                <p className={styles.projectNote}>Architecture &amp; Leadership Track · Systems Leads · CTO · Chief Architect</p>
              </div>
              <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard}`}>
                <StatusPill label="Interactive Learning Experience" color="#7C3AED" />
                <h3 className={styles.projectTitle}>Model Rocketry</h3>
                <p className={styles.projectDesc}>Learn aerospace engineering from first principles—mission design, aerodynamics, stability, structures, propulsion, avionics, recovery and flight analysis.</p>
                <Link href="/space/model-rocketry" className={`${theme.secondaryButton} ${styles.projectCta}`}>Explore Model Rocketry <ArrowRight size={16} /></Link>
                <p className={styles.projectNote}>Educational aerospace learning · Beginner to advanced.</p>
              </div>
              <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard}`}>
                <StatusPill label="Educational Prototype · 12-Week Student R&D Project" color="#06B6D4" />
                <h3 className={styles.projectTitle}>CubeTwin</h3>
                <p className={styles.projectDesc}>A Digital-Twin Simulation Platform for CubeSat Energy, Mission and Reliability Analysis</p>
                <p className={styles.projectDesc}>Model orbit sunlight, solar generation, battery state of charge, mission loads, faults and safe-mode decisions through an interactive beginner-friendly laboratory.</p>
                <Link href="/space/cubesat" className={`${theme.secondaryButton} ${styles.projectCta}`}>Explore CubeTwin <ArrowRight size={16} /></Link>
                <p className={styles.projectNote}>Educational R&D prototype · Simulated data · Not flight software.</p>
              </div>
              <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard}`}>
                <StatusPill label="Interactive Research Platform" color="#3B82F6" />
                <h3 className={styles.projectTitle}>Space Station</h3>
                <p className={styles.projectDesc}>Explore how orbital research stations are designed, powered, controlled and operated—from life support and microgravity laboratories to docking, robotics and future lunar stations.</p>
                <Link href="/space/space-station" className={`${theme.secondaryButton} ${styles.projectCta}`}>Explore Space Station <ArrowRight size={16} /></Link>
                <p className={styles.projectNote}>Educational models · Sourced programme facts · Not mission design data.</p>
              </div>
              <ApexProjectCard pill={<StatusPill label="Partner Engineering Ecosystem" color="#06B6D4" />} />
              {/* The two propulsion twins sit side by side as one learning progression: see .twinPairStart. */}
              <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard} ${styles.twinPairStart}`}>
                <StatusPill label="Interactive Digital Twin" color="#F59E0B" />
                <h3 className={styles.projectTitle}>Next-Generation Rocket Engine Digital Twin</h3>
                <p className={styles.projectDesc}>Explore a reusable liquid rocket engine reference architecture—propellant feed, turbomachinery, combustion, regenerative cooling, control, simulated testing and engine health monitoring.</p>
                <Link
                  href="/space/rocket-engine-digital-twin"
                  className={`${theme.secondaryButton} ${styles.projectCta}`}
                  data-track-event="space_project_card_click"
                  data-track-project="rocket_engine_digital_twin"
                  data-track-placement="simulation_projects"
                >
                  Explore Rocket Engine Digital Twin <ArrowRight size={16} />
                </Link>
                <p className={styles.projectNote}>Educational demonstrator · Reference and simulated data · Not a real engine.</p>
              </div>
              <div className={`${styles.cardHover} ${theme.card} ${styles.projectCard} ${styles.advancedTwinCard}`}>
                <PropulsionTwinCardVisual className={styles.advancedTwinVisual} flowClassName={styles.advancedTwinFlow} />
                <StatusPill label="Physics · Pressure Monitoring · AI/ML · FDIR · Prognostics" color="#F59E0B" />
                <h3 className={styles.projectTitle}>Advanced Rocket Propulsion Digital Twin</h3>
                <p className={styles.twinProgression}>
                  <span>Understand the Engine</span>
                  <ArrowRight size={14} aria-hidden="true" />
                  <span className={styles.srOnly}>, then </span>
                  <span>Engineer the Digital Twin</span>
                </p>
                <p className={styles.projectDesc}>Build a physics-based, data-driven and AI/ML-assisted Digital Twin for an end-to-end rocket propulsion system, with a focus on pressure monitoring, fault detection, diagnosis and prognostics.</p>
                <Link
                  href="/space/rocket-engine-digital-twin-advanced"
                  className={`${theme.secondaryButton} ${styles.projectCta}`}
                  data-track-event="space_project_card_click"
                  data-track-project="rocket_propulsion_digital_twin_advanced"
                  data-track-placement="simulation_projects"
                >
                  Explore Advanced Digital Twin <ArrowRight size={16} />
                </Link>
                <p className={styles.projectNote}>Advanced educational and research-oriented reference architecture · Simulated data · Not a proprietary or flight engine.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Planned labs (#labs) ── */}
        <section id="labs" className={`${portal.section} ${portal.band}`}>
          <div className={portal.inner}>
            <SectionHead label="Planned Labs" title="Hands-on mission-health labs">
              <p className={portal.lede}>Isolated, authorised simulations &mdash; not yet built. Express interest to help shape them.</p>
            </SectionHead>

            <div className={portal.labGrid}>
              {plannedLabs.map((lab) => (
                <article key={lab.title} className={portal.labCard}>
                  <div className={portal.labTop}>
                    <div className={portal.labIcon} style={{ background: `${lab.color}1F`, color: tint(lab.color) }}><Icon name={lab.icon} size={18} /></div>
                    <StatusPill label="Planned" color={statusTone.Planned} />
                  </div>
                  <h3 className={portal.labTitle}>{lab.title}</h3>
                  <p className={portal.labPurpose}>{lab.purpose}</p>
                  <a
                    href={EOI_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Express Interest in ${lab.title} (opens Google Form in a new tab)`}
                    className={portal.labLink}
                    style={{ color: tint(lab.color) }}
                  >
                    Express Interest <ChevronRight size={14} aria-hidden />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Research Platform (#research) ── */}
        <section id="research" className={portal.section}>
          <div className={portal.inner}>
            <SectionHead label="Research" title="Autonomous Spacecraft Health Management System">
              <div>
                <StatusPill label="Planned Research Platform" color={statusTone["Research Direction"]} />
              </div>
            </SectionHead>

            <ol className={portal.layerList} aria-label="Platform layers">
              {researchLayers.map((layer, i) => (
                <li key={layer.title} className={portal.layer}>
                  <div className={portal.layerIcon}><Icon name={layer.icon} size={18} /></div>
                  <div className={portal.layerNumber}>Layer {i + 1}</div>
                  <div className={portal.layerTitle}>{layer.title}</div>
                </li>
              ))}
            </ol>

            <ol className={portal.pipeline} aria-label="Validation pathway">
              {["Simulation", "Physical Emulation", "Digital Twin", "Supervised Recovery", "Flight-Representative Validation"].map((s, i, arr) => (
                <li key={s}>
                  {s}{i < arr.length - 1 && <ArrowRight size={14} aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 7. Research Themes (#projects) ── */}
        <section id="projects" className={`${portal.section} ${portal.band}`}>
          <div className={portal.inner}>
            <SectionHead label="Research Themes" title="Disciplined research directions">
              <p className={portal.lede}>Every theme below is Proposed or a Research Direction &mdash; none are claimed as active projects, papers, or repositories yet.</p>
            </SectionHead>

            <ul className={portal.themeGrid}>
              {researchThemes.map((t, i) => (
                <li key={t.title} className={portal.theme}>
                  <span className={portal.themeNumber} style={{ background: `${t.color}26`, border: `1.5px solid ${t.color}`, color: tint(t.color) }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={portal.themeTitle}>{t.title}</h3>
                  <StatusPill label={t.status} color={statusTone[t.status]} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 8. Roadmap (#roadmap) ── */}
        <section id="roadmap" className={portal.section}>
          <div className={portal.inner}>
            <SectionHead label="Five-Year Roadmap" title="Goals, not completed milestones">
              <p className={portal.lede}>Every milestone below is a goal the team is working toward, phrased honestly as forward-looking.</p>
            </SectionHead>

            <ol className={portal.roadmap}>
              {roadmap.map((r, i) => (
                <li key={r.year} className={portal.milestone}>
                  <div className={portal.milestoneDot} style={{ background: "#11152E", border: `2px solid ${r.color}`, color: tint(r.color), boxShadow: `0 0 24px ${r.color}55` }}>{i + 1}</div>
                  <div className={portal.milestoneCard} style={{ borderColor: `${r.color}40` }}>
                    <div className={portal.milestoneYear} style={{ color: tint(r.color) }}>{r.year}</div>
                    <h3 className={portal.milestoneTitle}>{r.title}</h3>
                    <p className={portal.milestoneDesc}>{r.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Participation Model (#community) ── */}
        <section id="community" className={`${portal.section} ${portal.band}`}>
          <div className={portal.inner}>
            <SectionHead label="Participation" title="A neutral platform for people who want to build responsibly" />

            <ul className={portal.audienceGrid}>
              {participationAudiences.map((a) => (
                <li key={a} className={portal.audience}>
                  <Users size={16} aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            <div className={`${styles.ctaGroup} ${portal.centerRow}`}>
              <a
                href={EOI_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Express Interest (opens Google Form in a new tab)"
                className={portal.btnPrimary}
              >Express Interest</a>
              <Link href={CONTACT_HREF} className={portal.btnSecondary}>Partner With Us</Link>
              <Link href={CONTACT_HREF} className={portal.btnGhost}>Contact Us</Link>
            </div>
          </div>
        </section>

        {/* ── Sustainable Access (#access) ── */}
        <section id="access" className={portal.section}>
          <div className={portal.narrow} style={{ textAlign: "center" }}>
            <SectionHead label="Sustainable Access" title="How programmes will be funded">
              <p className={`${portal.lede} ${styles.proseLeft}`}>
                Availability, selection, fees, sponsorship and stipend conditions will be published for each programme.
              </p>
            </SectionHead>
            <ul className={portal.tagList} style={{ justifyContent: "center" }}>
              {accessModels.map((m) => <li key={m} className={portal.tag}>{m}</li>)}
            </ul>
          </div>
        </section>

        {/* ── 9. Partners & Engineering Ecosystem (#partners) ── */}
        <PartnersEcosystem
          className={`${portal.section} ${portal.band}`}
          label={<SectionLabel>Partners</SectionLabel>}
          pill={(label, color) => <StatusPill label={label} color={color} />}
          h2Style={sectionH2}
          descStyle={sectionDesc}
        />

        {/* ── Ecosystem and Responsibilities (#ecosystem) ── */}
        <section id="ecosystem" className={portal.section}>
          <div className={portal.narrow}>
            <SectionHead label="Ecosystem" title="Ecosystem and Responsibilities" />
            <p className={portal.prose}>
              Space is an{" "}
              <a href={SPACE_INITIATIVE.url} target="_blank" rel="noopener noreferrer">{SPACE_INITIATIVE.brand}</a> education, research and engineering initiative, hosted within the{" "}
              <Link href="/">EV.ENGINEER</Link> engineering ecosystem.{" "}
              <a href="https://www.uflight.in/" target="_blank" rel="noopener noreferrer">UFlight</a> focuses on health and usage monitoring technologies for aerospace and autonomous platforms. Commercial engineering products and services, where applicable, are handled separately by{" "}
              <a href="https://itelematics.com/" target="_blank" rel="noopener noreferrer">iTelematics Software Private Limited</a> under explicit agreements. Community membership is offered through{" "}
              <a href="https://www.evsociety.org/" target="_blank" rel="noopener noreferrer">EV Society</a>, a separate community initiative.
            </p>
          </div>
        </section>

        {/* ── FAQ (#faq) ── */}
        <section id="faq" className={`${portal.section} ${portal.band}`}>
          <div className={portal.narrow}>
            <SectionHead label="FAQ" title="Common Questions" />
            <div className={portal.faqList}>
              {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className={portal.section}>
          <div className={portal.finalCta}>
            <div className={styles.orb} style={{ width: 300, height: 300, background: "#7C3AED", top: -80, left: -80, opacity: 0.2 }} />
            <div className={styles.orb} style={{ width: 200, height: 200, background: "#06B6D4", bottom: -60, right: -60, opacity: 0.15 }} />
            <Satellite size={36} color="#A78BFA" style={{ marginBottom: 16 }} aria-hidden />
            <h2 className={portal.finalTitle}>
              Help Build Spacecraft That Can Protect Their Missions
            </h2>
            <p className={portal.finalText}>
              Join an education, research and venture pathway dedicated to trustworthy spacecraft health, autonomy and safe recovery.
            </p>
            <div className={`${styles.ctaGroup} ${portal.centerRow}`}>
              <a href="#mission" className={portal.btnPrimary}>
                Explore the Mission <ArrowRight size={18} aria-hidden />
              </a>
              <a
                href={EOI_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Express Interest (opens Google Form in a new tab)"
                className={portal.btnSecondary}
              >Express Interest</a>
              <Link href="/" className={portal.btnGhost}>Back to EV.ENGINEER</Link>
            </div>
          </div>
        </section>

        <section className={portal.section} style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 0 }}>
          {/* Space is an ISHAVASYAM.ORG initiative, so its designer is credited as that organisation's founder. */}
          <ResearcherCard role={`Founder · ${SPACE_INITIATIVE.brand}`} />
        </section>
      </main>

      {/* ── Footer ── */}
      <SpaceFooter />
    </div>
  );
}
