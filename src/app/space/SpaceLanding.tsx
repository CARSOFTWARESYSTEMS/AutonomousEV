import Link from "next/link";
import { manrope, inter, FONT_MANROPE, FONT_INTER } from "./fonts";
import SpaceHeader from "./components/SpaceHeader";
import SpaceFooter from "./components/SpaceFooter";
import FaqItem from "./components/FaqItem";
import SectionNav, { type SectionNavItem } from "./components/SectionNav";
import OpenOnHash from "./components/OpenOnHash";
import TutorialShowcase from "./components/showcase/TutorialShowcase";
import PathwayShowcase from "./components/showcase/PathwayShowcase";
import SpaceAcademyShowcase from "./components/showcase/SpaceAcademyShowcase";
import MissionHealthTwin from "./components/health/MissionHealthTwin";
import health from "./components/health/health.module.css";
import { PartnersEcosystem } from "./components/PartnersEcosystem";
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
  missionConsole, missionLoop, visionReferences,
  internshipWorkAreas, researchLayers, plannedLabs,
  researchThemes, roadmap, participationAudiences,
  accessModels, faqs, type IconName,
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

const SECTION_NAV: SectionNavItem[] = [
  { label: "Pathways", href: "#pathway" },
  { label: "Ages 14–18", href: "#education" },
  { label: "Mission", href: "#mission" },
  { label: "Tutorials", href: "#simulations" },
  { label: "Research & Partners", href: "#programme" },
  { label: "FAQ", href: "#faq" },
  { label: "Get Involved", href: "#community" },
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

/** The open/close words of a panel toggle; CSS shows the one that matches the panel's state. */
function Toggle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className={portal.toggleShow}>Show</span>
      <span className={portal.toggleHide}>Hide</span> {children}
    </>
  );
}

/** A native disclosure: its body is in the HTML (crawlable, findable, readable without JavaScript) but closed until asked for. */
function PanelDisclosure({ id, toggle, children }: { id: string; toggle: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className={portal.panelDetails} data-panel>
      <summary className={portal.panelToggle} data-track-event="space_panel_toggle" data-track-panel={id}>
        <span><Toggle>{toggle}</Toggle></span>
      </summary>
      <div className={portal.panelBody}>{children}</div>
    </details>
  );
}

/**
 * One collapsible panel of the research, programme and partners area. Its
 * label, heading and one-line summary stay visible; the detail opens on
 * request, or when a link to the panel's anchor is followed (OpenOnHash).
 */
function Panel({ id, label, title, summary, meta, toggle, children }: { id: string; label: string; title: React.ReactNode; summary?: React.ReactNode; meta?: React.ReactNode; toggle: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className={portal.panel} aria-labelledby={`${id}-title`}>
      <div className={portal.panelHead}>
        <span className={portal.panelLabel}>{label}</span>
        <h2 id={`${id}-title`} className={portal.panelTitle}>{title}</h2>
        {summary && <p className={portal.panelSummary}>{summary}</p>}
        {meta}
      </div>
      <PanelDisclosure id={id} toggle={toggle}>{children}</PanelDisclosure>
    </section>
  );
}

// The JSON-LD graph is a prop so each host's route (see ../ishavasyam-space)
// can ship its own entity graph while sharing this page body. Every section,
// the APEX partner card and the Partners & Engineering Ecosystem among them,
// is shown on both hosts.
//
// Progressive disclosure: the hero, the four pathways, Space Academy, the
// mission, the tutorials, the FAQ and the call to take part are open; the
// research, programme and partner detail sits in panels that keep their
// anchors and open on request. Every word stays in the HTML.
//
// A server component: only the header, the section navigation, the panel
// opener and the FAQ items are client islands.
export default function SpaceLanding({ entityGraph }: { entityGraph: object }) {
  return (
    <div className={`${styles.root} ${theme.theme} ${portal.page} ${manrope.variable} ${inter.variable}`} style={{ background: "var(--space-background)", minHeight: "100vh", fontFamily: FONT_INTER, overflowX: "clip" }}>
      <JsonLd data={entityGraph} />
      <OpenOnHash />
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>

      <SpaceHeader />

      <main id="main-content">
        {/* ── 1. Hero: one mission statement, Space Academy first (#home) ── */}
        <section id="home" style={{ display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }} className={`${styles.gridBg} ${styles.heroSection} ${portal.hero}`}>
          <div className={styles.orb} style={{ width: 600, height: 600, background: "#7C3AED", top: -100, left: -200 }} />
          <div className={styles.orb} style={{ width: 400, height: 400, background: "#06B6D4", bottom: -100, right: -100 }} />

          <div style={{ maxWidth: "calc(1600px + 2 * clamp(16px, 3.5vw, 56px))", margin: "0 auto", width: "100%", gap: 56, alignItems: "center" }} className={`${styles.heroGrid} ${styles.heroInset} ${portal.heroGridWide}`}>
            <div className={styles.fadeInUp}>
              <div className={portal.heroBadge}>
                <Shield size={14} color="#C4B5FD" style={{ flexShrink: 0 }} aria-hidden />
                <span>{SPACE_INITIATIVE.brand} · Autonomous Spacecraft Health Mission 2040</span>
              </div>

              <h1 className={portal.heroTitle} style={{ fontFamily: FONT_MANROPE }}>
                <span style={{ color: "#fff" }}>Learn to </span>
                <span style={{ background: "linear-gradient(135deg, #A78BFA, #60A5FA, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Protect Missions.</span>
                {" "}
                <br />
                <span style={{ color: "#fff" }}>Build Systems That Protect Spacecraft.</span>
              </h1>

              <p className={portal.heroLede}>
                A long-term education, engineering and startup pathway focused on Autonomous Spacecraft Health Management and Safe Recovery.
              </p>

              <div className={`${styles.ctaGroup} ${portal.heroCtas}`}>
                <Link
                  href={ACADEMY_HREF}
                  className={portal.heroAcademy}
                  data-track-event="space_academy_entry_click"
                  data-track-placement="hero"
                >
                  <span className={portal.heroAcademyText}>
                    <span className={portal.heroAcademyTitle}>Enter Space Academy</span>
                    <span className={portal.heroAcademySub}>Ages 14–18 · interactive 3D missions</span>
                  </span>
                  <ArrowRight size={18} aria-hidden />
                </Link>
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Expression of Interest (opens Google Form in a new tab)"
                  className={styles.eoiCta}
                >
                  Expression of Interest
                </a>
                <a href="#mission" className={portal.btnGhost}>
                  Explore the Mission <ArrowRight size={16} aria-hidden />
                </a>
              </div>
            </div>

            {/* Right – Mission health console */}
            <div className={`${styles.floatAnim} ${portal.heroConsole}`} style={{ position: "relative" }}>
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

        {/* ── 2. Four audience pathways (#pathway) ── */}
        <section id="pathway" className={portal.section}>
          <div className={portal.inner} style={{ maxWidth: 1440 }}>
            <SectionHead label="Choose Your Pathway" title="One mission. A lifelong pathway.">
              <ol className={portal.stageTrail} aria-label="The pathway">
                <li>Space Education (14–18)</li>
                <li>Internships &amp; Research</li>
                <li>Validated Prototypes</li>
                <li>Young Space Startups</li>
              </ol>
            </SectionHead>

            <PathwayShowcase />
          </div>
        </section>

        {/* ── 3. Space Academy, the primary destination for ages 14–18 (#education) ── */}
        <section id="education" className={`${portal.section} ${portal.band}`} aria-labelledby="education-title">
          <SpaceAcademyShowcase pill={<StatusPill label="Planned Programme" color={statusTone.Planned} />} />
        </section>

        {/* ── 4. Mission health: the six-stage loop as an interactive digital twin (#mission) ── */}
        <section id="mission" className={portal.section}>
          <div className={portal.inner} style={{ maxWidth: 1440 }}>
            <div className={portal.head} style={{ maxWidth: 860 }}>
              <SectionLabel>One Mission</SectionLabel>
              <h2 className={portal.h2}>Can a spacecraft understand its own health and recover safely?</h2>
              <p className={portal.missionSubtitle}>Observe. Diagnose. Recover. Verify.</p>
              <details className={`${portal.more} ${portal.scienceMore}`}>
                <summary data-track-event="space_panel_toggle" data-track-panel="mission_science">Learn the science</summary>
                <div className={portal.moreBody}>
                  <p className={`${portal.ledeStrong} ${styles.proseLeft}`}>
                    Autonomous Spacecraft Health Management is the capability to observe spacecraft telemetry, detect and isolate faults, predict mission impact, and recommend or execute verified recovery actions within bounded safety limits.
                  </p>
                </div>
              </details>
            </div>

            <MissionHealthTwin />

            <div className={health.autonomy}>
              <ol className={health.levels} aria-label="Advisory, then Supervised, then Bounded Autonomy">
                <li className={health.level}>
                  <span className={health.levelStep}>Level 1</span>
                  <h3 className={health.levelName}>Advisory</h3>
                  <p>The system detects, explains and recommends. People decide and act.</p>
                </li>
                <li className={health.level} data-current>
                  <span className={health.levelStep}>Level 2</span>
                  <h3 className={health.levelName}>Supervised</h3>
                  <p>The system proposes an action from a pre-approved list; an operator approves it before it runs.</p>
                  <span className={health.levelTag}>Used in the scenario above</span>
                </li>
                <li className={health.level}>
                  <span className={health.levelStep}>Level 3</span>
                  <h3 className={health.levelName}>Bounded Autonomy</h3>
                  <p>The system may act on its own, but only within limits verified before flight, and it reports every action. Anything outside them goes back to people.</p>
                </li>
              </ol>
              <p className={`${health.principle} ${styles.proseLeft}`}>
                Generative AI must not directly control a safety-critical spacecraft loop. Autonomy is introduced gradually, under human supervision, and always within verified, bounded limits.
              </p>
            </div>

            <div className={portal.moreStack}>
              <details className={portal.more}>
                <summary data-track-event="space_panel_toggle" data-track-panel="mission_why">Why spacecraft need this</summary>
                <div className={portal.moreBody}>
                  <p>
                    Future long-duration, autonomous, crewed, lunar and deep-space missions cannot depend on continuous ground intervention. A spacecraft must be able to observe its telemetry, detect anomalies, and isolate likely faults through Fault Detection, Isolation and Recovery (FDIR), predict mission impact, and recommend&mdash;or within verified limits execute&mdash;a safe recovery.
                  </p>
                </div>
              </details>

              <details className={portal.more}>
                <summary data-track-event="space_panel_toggle" data-track-panel="mission_diagram">The full health-management loop diagram</summary>
                <div className={portal.moreBody}>
                  <figure style={{ margin: 0, textAlign: "center" }}>
                    <div className={styles.diagramDesktop}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- a crawlable SVG diagram at its intrinsic size */}
                      <img
                        src="/space/autonomous-spacecraft-health-management-loop.svg"
                        width={1200}
                        height={320}
                        loading="lazy"
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
                    <figcaption style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.6, color: "#A3A7BD", textAlign: "left" }}>
                      The autonomous spacecraft health-management loop: telemetry monitoring flows into anomaly detection, fault isolation (FDIR), mission-impact prediction, bounded recovery and verification, which feeds back into continuous telemetry monitoring.
                    </figcaption>
                  </figure>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* ── 5. Featured tutorials and simulations (#simulations) ── */}
        <section id="simulations" className={`${portal.section} ${portal.band}`}>
          <div className={portal.inner} style={{ maxWidth: 1440 }}>
            <SectionHead label="Tutorials & Simulations" title="Learn by building mission-ready thinking">
              <p className={portal.lede}>Guided simulation projects that turn spacecraft concepts into testable models, telemetry and engineering evidence.</p>
            </SectionHead>
            <TutorialShowcase />
          </div>
        </section>

        {/* ── 6. Research, programme and partners: collapsible panels (#programme) ── */}
        <div id="programme" className={portal.section}>
          <div className={portal.inner}>
            <div className={portal.head}>
              <SectionLabel>Research, Programme &amp; Partners</SectionLabel>
              <p className={portal.lede}>For engineering students, academics, researchers and industry. Open any panel for the detail; every status is labelled as it stands today.</p>
              <nav className={portal.jumpRow} aria-label="Research, programme and partners">
                {[["Vision", "#vision"], ["Internships", "#internships"], ["Labs", "#labs"], ["Research", "#research"], ["Themes", "#projects"], ["Roadmap", "#roadmap"], ["Funding", "#access"], ["Partners", "#partners"], ["Ecosystem", "#ecosystem"]].map(([label, href]) => (
                  <a key={href} href={href}>{label}</a>
                ))}
              </nav>
            </div>

            <div className={portal.panelList}>
              {/* ── Alignment & Independence (#vision) ── */}
              <Panel
                id="vision"
                label="Long-Term Vision"
                title="Building capability for the missions of 2035, 2040 and beyond"
                summary={
                  <span className={portal.notice} style={{ display: "block", margin: 0 }}>
                    <strong>Independent initiative.</strong> References to national space goals are provided for educational context and do not imply endorsement, affiliation or partnership with ISRO, IN-SPACe, NSIL or the Department of Space.
                  </span>
                }
                toggle="the references"
              >
                <p className={portal.lede}>
                  This research direction is aligned with publicly stated Indian ambitions, including long-duration missions, autonomous rendezvous and docking, the Bharatiya Antariksha Station goal for 2035, and an indigenous crewed lunar landing goal for 2040.
                </p>
                <div className={portal.refGrid}>
                  {visionReferences.map((ref) => (
                    <a key={ref.href} href={ref.href} target="_blank" rel="noopener noreferrer" className={portal.refLink}>
                      {ref.label}
                      <ExternalLink size={15} aria-hidden />
                    </a>
                  ))}
                </div>
                <p className={portal.freshness}>
                  Prepared by the {SPACE_INITIATIVE.brand} technical team. Last reviewed: 14 August 2026.
                </p>
              </Panel>

              {/* ── Engineering Internships & Research (#internships) ── */}
              <Panel
                id="internships"
                label="Internships & Research"
                title="One multidisciplinary mission team"
                summary="Engineering students work together as one mission team rather than on unrelated projects."
                toggle="the work areas"
              >
                <div className={portal.notice} style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.22)" }}>
                  <strong style={{ color: "#93C5FD" }}>Reference mission: </strong>
                  A 3U/6U CubeSat health-management test environment covering electrical power, thermal control, attitude control, onboard computing, communications and payload behaviour.
                </div>
                <ul className={portal.tagList} aria-label="Internship work areas">
                  {internshipWorkAreas.map((t) => <li key={t} className={portal.tag}>{t}</li>)}
                </ul>
                <div className={`${portal.notice} ${portal.noticeQuiet}`}>
                  Paid training and internships are distinct. Internships will be merit-based and governed by the published terms of each cohort; sponsored or stipended opportunities will be identified explicitly when available.
                </div>
              </Panel>

              {/* ── Planned labs (#labs) ── */}
              <Panel
                id="labs"
                label="Planned Labs"
                title="Hands-on mission-health labs"
                summary={<>Isolated, authorised simulations &mdash; not yet built. Express interest to help shape them.</>}
                toggle={`${plannedLabs.length} labs`}
              >
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
              </Panel>

              {/* ── Research Platform (#research) ── */}
              <Panel
                id="research"
                label="Research"
                title="Autonomous Spacecraft Health Management System"
                meta={<div><StatusPill label="Planned Research Platform" color={statusTone["Research Direction"]} /></div>}
                toggle="the platform"
              >
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
              </Panel>

              {/* ── Research Themes (#projects) ── */}
              <Panel
                id="projects"
                label="Research Themes"
                title="Disciplined research directions"
                summary={<>Every theme is Proposed or a Research Direction &mdash; none are claimed as active projects, papers, or repositories yet.</>}
                toggle={`${researchThemes.length} themes`}
              >
                <ul className={portal.themeGrid}>
                  {researchThemes.map((t, i) => (
                    <li key={t.title} className={portal.theme}>
                      <span className={portal.themeNumber} style={{ background: `${t.color}26`, border: `1.5px solid ${t.color}`, color: tint(t.color) }}>{String(i + 1).padStart(2, "0")}</span>
                      <h3 className={portal.themeTitle}>{t.title}</h3>
                      <StatusPill label={t.status} color={statusTone[t.status]} />
                    </li>
                  ))}
                </ul>
              </Panel>

              {/* ── Roadmap (#roadmap) ── */}
              <Panel
                id="roadmap"
                label="Five-Year Roadmap"
                title="Goals, not completed milestones"
                summary="Every milestone is a goal the team is working toward, phrased honestly as forward-looking."
                toggle="the roadmap"
              >
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
              </Panel>

              {/* ── Sustainable Access (#access) ── */}
              <Panel
                id="access"
                label="Sustainable Access"
                title="How programmes will be funded"
                summary="Availability, selection, fees, sponsorship and stipend conditions will be published for each programme."
                toggle="funding models"
              >
                <ul className={portal.tagList}>
                  {accessModels.map((m) => <li key={m} className={portal.tag}>{m}</li>)}
                </ul>
              </Panel>

              {/* ── Partners & Engineering Ecosystem (#partners) ── */}
              <PartnersEcosystem
                className={portal.panel}
                headClassName={portal.panelHead}
                label={<span className={portal.panelLabel}>Partners</span>}
                pill={(label, color) => <StatusPill label={label} color={color} />}
                h2Style={{ fontFamily: FONT_MANROPE }}
                collapse={(body) => <PanelDisclosure id="partners" toggle="the partners">{body}</PanelDisclosure>}
              />

              {/* ── Ecosystem and Responsibilities (#ecosystem) ── */}
              <Panel
                id="ecosystem"
                label="Ecosystem"
                title="Ecosystem and Responsibilities"
                summary="Who is responsible for education, research, community and commercial work."
                toggle="who does what"
              >
                <p className={portal.prose}>
                  Space is an{" "}
                  <a href={SPACE_INITIATIVE.url} target="_blank" rel="noopener noreferrer">{SPACE_INITIATIVE.brand}</a> education, research and engineering initiative, hosted within the{" "}
                  <Link href="/">EV.ENGINEER</Link> engineering ecosystem.{" "}
                  <a href="https://www.uflight.in/" target="_blank" rel="noopener noreferrer">UFlight</a> focuses on health and usage monitoring technologies for aerospace and autonomous platforms. Commercial engineering products and services, where applicable, are handled separately by{" "}
                  <a href="https://itelematics.com/" target="_blank" rel="noopener noreferrer">iTelematics Software Private Limited</a> under explicit agreements. Community membership is offered through{" "}
                  <a href="https://www.evsociety.org/" target="_blank" rel="noopener noreferrer">EV Society</a>, a separate community initiative.
                </p>
              </Panel>
            </div>
          </div>
        </div>

        {/* ── 7. FAQ (#faq) ── */}
        <section id="faq" className={`${portal.section} ${portal.band}`}>
          <div className={portal.narrow}>
            <SectionHead label="FAQ" title="Common Questions" />
            <div className={portal.faqList}>
              {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── 8. Take part (#community) ── */}
        <section id="community" className={portal.section} aria-labelledby="community-title">
          <div className={portal.finalCta}>
            <div className={styles.orb} style={{ width: 300, height: 300, background: "#7C3AED", top: -80, left: -80, opacity: 0.2 }} />
            <div className={styles.orb} style={{ width: 200, height: 200, background: "#06B6D4", bottom: -60, right: -60, opacity: 0.15 }} />
            <Satellite size={36} color="#A78BFA" style={{ marginBottom: 16 }} aria-hidden />
            <SectionLabel>Participation</SectionLabel>
            <h2 id="community-title" className={portal.finalTitle}>
              Help Build Spacecraft That Can Protect Their Missions
            </h2>
            <p className={portal.finalText}>
              A neutral platform for people who want to build responsibly: an education, research and venture pathway dedicated to trustworthy spacecraft health, autonomy and safe recovery.
            </p>
            <ul className={portal.audienceChips} aria-label="Who can take part">
              {participationAudiences.map((a) => (
                <li key={a}>{a}</li>
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
              <a href="https://www.evsociety.org/join" target="_blank" rel="noopener noreferrer" className={portal.btnGhost}>Join Community</a>
            </div>
            <p className={portal.finalBack}>
              <Link href="/">Back to EV.ENGINEER</Link>
            </p>
          </div>
        </section>

        <section className={portal.section} style={{ maxWidth: "calc(1600px + 2 * clamp(16px, 3.5vw, 56px))", margin: "0 auto", paddingTop: 0 }}>
          {/* Space is an ISHAVASYAM.ORG initiative, so its designer is credited as that organisation's founder. */}
          <ResearcherCard role={`Founder · ${SPACE_INITIATIVE.brand}`} />
        </section>
      </main>

      {/* ── Footer ── */}
      <SpaceFooter wide />
    </div>
  );
}
