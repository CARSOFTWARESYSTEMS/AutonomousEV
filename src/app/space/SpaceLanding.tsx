"use client";

import { useState } from "react";
import Link from "next/link";
import { manrope, inter, FONT_MANROPE, FONT_INTER } from "./fonts";
import SpaceHeader from "./components/SpaceHeader";
import SpaceFooter from "./components/SpaceFooter";
import PropulsionTwinCardVisual from "./components/PropulsionTwinCardVisual";
import ResearcherCard from "@/components/ResearcherCard";
import theme from "./spaceTheme.module.css";
import {
  Shield, Satellite, Orbit, Activity, HeartPulse, Cpu, AlertTriangle,
  LifeBuoy, GraduationCap, FlaskConical, Rocket, Radio, Radar, RefreshCw,
  Globe, Users, Layers, CheckCircle2, ArrowRight, ChevronRight,
  ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import styles from "./space.module.css";
import {
  heroSummary, missionConsole, missionLoop, visionReferences, pathwayStages,
  educationAreas, internshipWorkAreas, researchLayers, plannedLabs,
  researchThemes, roadmap, participationAudiences,
  accessModels, faqs, type IconName,
} from "./spaceData";
import { EOI_FORM_URL } from "@/lib/eoi";
import { JsonLd } from "@/lib/structured-data/JsonLd";

const CONTACT_HREF = "/contact";

const iconMap: Record<IconName, React.ComponentType<{ size?: number; color?: string }>> = {
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
  return <Cmp size={size} color={color} />;
}

const statusColor: Record<string, string> = {
  Nominal: "#10B981",
  Monitor: "#F59E0B",
  Degraded: "#EF4444",
  Advisory: "#7C3AED",
};

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

const sectionH2: React.CSSProperties = {
  fontFamily: FONT_MANROPE,
  fontSize: "clamp(24px, 3.2vw, 32px)",
  fontWeight: 800, letterSpacing: "-0.02em",
  color: "#fff", margin: "0 0 16px", lineHeight: 1.15,
};

const sectionDesc: React.CSSProperties = {
  color: "#B5B8C9", fontSize: 16, lineHeight: 1.7,
  maxWidth: 640, margin: "0 auto", textAlign: "center",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 999, padding: "6px 16px", marginBottom: 16 }}>
      <span style={{ color: "#B39DDB", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</span>
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", maxWidth: "100%", lineHeight: 1.5,
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
      background: `${color}18`, color, border: `1px solid ${color}40`,
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>{label}</span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${q.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div style={{
      background: open ? "rgba(124,58,237,0.08)" : "rgba(17,21,46,0.6)",
      border: `1px solid ${open ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16, transition: "background 0.2s, border-color 0.2s",
    }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
          font: "inherit",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>{q}</span>
        {open ? <ChevronUp size={18} color="#7C3AED" /> : <ChevronDown size={18} color="#B5B8C9" />}
      </button>
      <p
        id={panelId}
        hidden={!open}
        style={{ margin: 0, padding: "0 20px 18px", color: "#B5B8C9", fontSize: 14, lineHeight: 1.7 }}
      >
        {a}
      </p>
    </div>
  );
}

// The JSON-LD graph is a prop so each host's route (see ../ishavasyam-space)
// can ship its own entity graph while sharing this page body.
export default function SpaceLanding({ entityGraph }: { entityGraph: object }) {

  return (
    <div className={`${styles.root} ${theme.theme} ${manrope.variable} ${inter.variable}`} style={{ background: "var(--space-background)", minHeight: "100vh", fontFamily: FONT_INTER, overflowX: "hidden" }}>
      <JsonLd data={entityGraph} />
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>

      <SpaceHeader />

      <main id="main-content">
        {/* ── Hero (#home) ── */}
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
                <Shield size={14} color="#7C3AED" />
                <span style={{ color: "#B39DDB", fontSize: 13, fontWeight: 500 }}>EV Society · Autonomous Spacecraft Health Mission 2040</span>
              </div>

              <h1 style={{
                fontFamily: FONT_MANROPE, fontSize: "clamp(32px, 4.6vw, 54px)",
                fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", margin: "0 0 20px",
              }}>
                <span style={{ color: "#fff" }}>Learn to </span>
                <span style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Protect Missions.</span>
                {" "}
                <br />
                <span style={{ color: "#fff" }}>Build Systems That Protect Spacecraft.</span>
              </h1>

              <p style={{ color: "#B5B8C9", fontSize: 16, lineHeight: 1.7, maxWidth: 540, marginBottom: 20 }}>
                A long-term education, engineering and startup pathway focused on Autonomous Spacecraft Health Management and Safe Recovery.
              </p>

              <div style={{
                display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 28,
                color: "#93C5FD", fontSize: 14, fontWeight: 600,
              }}>
                <span>Space Education (14–18)</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight size={14} /> Internships &amp; Research
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight size={14} /> Validated Prototypes
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight size={14} /> Young Space Startups
                </span>
              </div>

              <div className={styles.ctaGroup} style={{ marginBottom: 40 }}>
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Expression of Interest (opens Google Form in a new tab)"
                  className={styles.eoiCta}
                >
                  Expression of Interest
                </a>
                <a href="#mission" style={{
                  padding: "13px 28px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                }}>
                  Explore the Mission <ArrowRight size={16} />
                </a>
                <a href="#pathway" className={theme.secondaryButton}>View the Pathway</a>
                <a href="https://www.evsociety.org/join" target="_blank" rel="noopener noreferrer" style={{
                  padding: "13px 24px", borderRadius: 12, background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)", color: "#B5B8C9", fontWeight: 600, fontSize: 15, textDecoration: "none",
                }}>Join Community</a>
              </div>

              <div style={{ display: "flex", columnGap: 0, rowGap: 20, flexWrap: "wrap" }}>
                {heroSummary.map((s, i) => (
                  <div key={s.label} style={{ paddingRight: 32, marginRight: 32, borderRight: i < heroSummary.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                    <div style={{ fontFamily: FONT_MANROPE, fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "#B5B8C9", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
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
                    <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                      Mission Health Console
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: FONT_MANROPE }}>Illustrative Mission Simulation</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#FF6B6B", "#FFD93D", "#6BCB77"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#8B8FA3", margin: "0 0 16px" }}>
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
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{row.label}</div>
                        </div>
                        <span className={styles.consoleBadge} style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
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

        {/* ── One Mission (#mission) ── */}
        <section id="mission" className={styles.section} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ maxWidth: 780, margin: "0 auto 40px", textAlign: "center" }}>
              <SectionLabel>One Mission</SectionLabel>
              <h2 style={sectionH2}>Can a spacecraft understand its own health and recover safely?</h2>
              <p className={styles.proseLeft} style={{ ...sectionDesc, fontWeight: 600, color: "#E4E6F5", marginBottom: 14 }}>
                Autonomous Spacecraft Health Management is the capability to observe spacecraft telemetry, detect and isolate faults, predict mission impact, and recommend or execute verified recovery actions within bounded safety limits.
              </p>
              <p className={styles.proseLeft} style={sectionDesc}>
                Future long-duration, autonomous, crewed, lunar and deep-space missions cannot depend on continuous ground intervention. A spacecraft must be able to observe its telemetry, detect anomalies, and isolate likely faults through Fault Detection, Isolation and Recovery (FDIR), predict mission impact, and recommend&mdash;or within verified limits execute&mdash;a safe recovery.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
              {missionLoop.map((step, i) => (
                <div key={step.step} className={styles.cardHover} style={{
                  background: "rgba(17,21,46,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, padding: "18px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(124,58,237,0.15)", color: "#B39DDB",
                  }}><Icon name={step.icon} size={20} /></div>
                  <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{step.step}</div>
                </div>
              ))}
            </div>

            <figure style={{ maxWidth: 900, margin: "0 auto 32px", textAlign: "center" }}>
              <div className={styles.diagramDesktop}>
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
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{step.step}</div>
                        <div style={{ fontSize: 12, color: "#9092B0", marginTop: 2 }}>{step.detail}</div>
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
              <figcaption style={{ marginTop: 10, fontSize: 12.5, color: "#8B8FA3" }}>
                The autonomous spacecraft health-management loop: telemetry monitoring flows into anomaly detection, fault isolation (FDIR), mission-impact prediction, bounded recovery and verification, which feeds back into continuous telemetry monitoring.
              </figcaption>
            </figure>

            <div style={{
              maxWidth: 780, margin: "0 auto", padding: "20px 24px", borderRadius: 18,
              background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)",
              display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center", fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 15, color: "#fff" }}>
                <span>Advisory</span><ArrowRight size={14} color="#B39DDB" />
                <span>Supervised</span><ArrowRight size={14} color="#B39DDB" />
                <span>Bounded Autonomy</span>
              </div>
              <p className={styles.proseLeft} style={{ margin: 0, color: "#B5B8C9", fontSize: 14, lineHeight: 1.7, maxWidth: 620 }}>
                Generative AI must not directly control a safety-critical spacecraft loop. Autonomy is introduced gradually, under human supervision, and always within verified, bounded limits.
              </p>
            </div>
          </div>
        </section>

        {/* ── Alignment & Independence (#vision) ── */}
        <section id="vision" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <SectionLabel>Long-Term Vision</SectionLabel>
              <h2 style={sectionH2}>Building capability for the missions of 2035, 2040 and beyond</h2>
              <p style={sectionDesc}>
                This research direction is aligned with publicly stated Indian ambitions, including long-duration missions, autonomous rendezvous and docking, the Bharatiya Antariksha Station goal for 2035, and an indigenous crewed lunar landing goal for 2040.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 24 }}>
              {visionReferences.map((ref) => (
                <a key={ref.href} href={ref.href} target="_blank" rel="noopener noreferrer" className={styles.cardHover} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "14px 16px", borderRadius: 14, background: "rgba(17,21,46,0.7)",
                  border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none", color: "#93C5FD", fontSize: 14, fontWeight: 600,
                }}>
                  {ref.label}
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>

            <div className={styles.proseLeft} style={{
              padding: "16px 20px", borderRadius: 14, background: "rgba(6,182,212,0.06)",
              border: "1px solid rgba(6,182,212,0.2)", color: "#B5B8C9", fontSize: 13, lineHeight: 1.7,
            }}>
              <strong style={{ color: "#fff" }}>Independent initiative.</strong> References to national space goals are provided for educational context and do not imply endorsement, affiliation or partnership with ISRO, IN-SPACe, NSIL or the Department of Space.
            </div>

            <p style={{ marginTop: 16, textAlign: "center", color: "#8B8FA3", fontSize: 12.5 }}>
              Prepared by the EV Society technical team. Last reviewed: 14 August 2026.
            </p>
          </div>
        </section>

        {/* ── Pathway (#pathway) ── */}
        <section id="pathway" className={styles.section} style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <SectionLabel>Education to Startup</SectionLabel>
            <h2 style={sectionH2}>One mission. A lifelong pathway.</h2>
            <p style={sectionDesc}>This is a Mission Pathway, not a certification roadmap &mdash; each stage builds on the last.</p>
          </div>

          <div style={{ display: "grid", gap: 16 }} className={styles.pathwayGrid}>
            {pathwayStages.map((stage) => (
              <div key={stage.stage} className={`${styles.cardHover} ${styles.gradientBorder}`} style={{ padding: 1 }}>
                <div style={{
                  background: "linear-gradient(135deg, #11152E, #13183A)", borderRadius: 20,
                  padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${stage.color}20`, color: stage.color,
                  }}><Icon name={stage.icon} size={22} /></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: stage.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{stage.stage}</div>
                    <h3 style={{ fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 17, color: "#fff", margin: 0 }}>{stage.title}</h3>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 6, margin: 0, padding: 0, listStyle: "none" }}>
                    {stage.items.map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "#B5B8C9", fontSize: 13, lineHeight: 1.5 }}>
                        <ChevronRight size={13} color={stage.color} style={{ marginTop: 2, flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Space Health Explorers (#education) ── */}
        <section id="education" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <SectionLabel>Ages 14&ndash;18</SectionLabel>
              <h2 style={sectionH2}>How does a spacecraft know whether it is healthy?</h2>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <StatusPill label="Planned Programme" color={statusTone.Planned} />
              </div>
              <p style={sectionDesc}>Space Health Explorers is a planned programme for students aged 14&ndash;18 exploring spacecraft health from first principles.</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {educationAreas.map((t) => <span key={t} className={styles.tagPill}>{t}</span>)}
            </div>
          </div>
        </section>

        {/* ── Engineering Internships & Research (#internships) ── */}
        <section id="internships" className={styles.section} style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <SectionLabel>Internships &amp; Research</SectionLabel>
            <h2 style={sectionH2}>One multidisciplinary mission team</h2>
            <p style={sectionDesc}>Engineering students work together as one mission team rather than on unrelated projects.</p>
          </div>

          <div className={styles.proseLeft} style={{
            padding: "20px 24px", borderRadius: 16, background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)", color: "#B5B8C9", fontSize: 14, lineHeight: 1.7, marginBottom: 28,
          }}>
            <strong style={{ color: "#93C5FD" }}>Reference mission: </strong>
            A 3U/6U CubeSat health-management test environment covering electrical power, thermal control, attitude control, onboard computing, communications and payload behaviour.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 28 }}>
            {internshipWorkAreas.map((t) => <span key={t} className={styles.tagPill}>{t}</span>)}
          </div>

          <div className={styles.proseLeft} style={{
            padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)", color: "#8B8FA3", fontSize: 13, lineHeight: 1.7,
          }}>
            Paid training and internships are distinct. Internships will be merit-based and governed by the published terms of each cohort; sponsored or stipended opportunities will be identified explicitly when available.
          </div>
        </section>

        {/* ── Research Platform (#research) ── */}
        <section id="research" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <SectionLabel>Research</SectionLabel>
              <h2 style={sectionH2}>Autonomous Spacecraft Health Management System</h2>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <StatusPill label="Planned Research Platform" color={statusTone["Research Direction"]} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
              {researchLayers.map((layer, i) => (
                <div key={layer.title} className={styles.cardHover} style={{
                  background: "rgba(17,21,46,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(6,182,212,0.15)", color: "#22D3EE",
                  }}><Icon name={layer.icon} size={18} /></div>
                  <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700 }}>Layer {i + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{layer.title}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 8, color: "#93C5FD", fontSize: 13, fontWeight: 600 }}>
              {["Simulation", "Physical Emulation", "Digital Twin", "Supervised Recovery", "Flight-Representative Validation"].map((s, i, arr) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s}{i < arr.length - 1 && <ArrowRight size={13} color="#B39DDB" />}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Planned Labs (#labs) ── */}
        <section id="labs" className={styles.section} style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <SectionLabel>Planned Labs</SectionLabel>
            <h2 style={sectionH2}>Hands-on mission-health labs</h2>
            <p style={sectionDesc}>Isolated, authorised simulations &mdash; not yet built. Express interest to help shape them.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {plannedLabs.map((lab) => (
              <div key={lab.title} className={`${styles.cardHover} ${theme.card}`} style={{
                padding: "16px", display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `${lab.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: lab.color,
                  }}><Icon name={lab.icon} size={18} /></div>
                  <StatusPill label="Planned" color={statusTone.Planned} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 15, color: "#fff", margin: "0 0 4px" }}>{lab.title}</h3>
                  <p style={{ fontSize: 13, color: "#B5B8C9", margin: 0, lineHeight: 1.6 }}>{lab.purpose}</p>
                </div>
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Express Interest in ${lab.title} (opens Google Form in a new tab)`}
                  style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4, color: lab.color, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                >
                  Express Interest <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="simulations" className={styles.section} style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <SectionLabel>Simulations &amp; R&amp;D Projects</SectionLabel>
            <h2 style={sectionH2}>Learn by building mission-ready thinking</h2>
            <p style={sectionDesc}>Explore guided simulation projects that turn spacecraft concepts into testable models, telemetry and engineering evidence.</p>
          </div>
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
        </section>

        {/* ── Research Themes (#projects) ── */}
        <section id="projects" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ marginBottom: 40, textAlign: "center" }}>
              <SectionLabel>Research Themes</SectionLabel>
              <h2 style={sectionH2}>Disciplined research directions</h2>
              <p style={sectionDesc}>Every theme below is Proposed or a Research Direction &mdash; none are claimed as active projects, papers, or repositories yet.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {researchThemes.map((theme, i) => (
                <div key={theme.title} className={styles.cardHover} style={{
                  background: "rgba(17,21,46,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 18, padding: "18px", display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: theme.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>{String(i + 1).padStart(2, "0")}</div>
                    <StatusPill label={theme.status} color={statusTone[theme.status]} />
                  </div>
                  <h3 style={{ fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 15, color: "#fff", margin: 0, lineHeight: 1.35 }}>{theme.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roadmap (#roadmap) ── */}
        <section id="roadmap" className={styles.section} style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <SectionLabel>Five-Year Roadmap</SectionLabel>
            <h2 style={sectionH2}>Goals, not completed milestones</h2>
            <p style={sectionDesc}>Every milestone below is a goal the team is working toward, phrased honestly as forward-looking.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, position: "relative" }}>
            <div style={{
              position: "absolute", top: 36, left: "10%", right: "10%", height: 2,
              background: "linear-gradient(90deg, #3B82F6, #7C3AED, #8B5CF6, #06B6D4, #10B981)",
              borderRadius: 2, zIndex: 0,
            }} className={styles.hiddenMobile} />

            {roadmap.map((r, i) => (
              <div key={r.year} style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", background: r.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: FONT_MANROPE, fontWeight: 800, fontSize: 13, color: "#fff",
                    boxShadow: `0 0 24px ${r.color}66`,
                  }}>{i + 1}</div>
                </div>
                <div style={{ background: "rgba(17,21,46,0.8)", border: `1px solid ${r.color}30`, borderRadius: 18, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: r.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{r.year}</div>
                  <div style={{ fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 10 }}>{r.title}</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#B5B8C9", lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Participation Model (#community) ── */}
        <section id="community" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <SectionLabel>Participation</SectionLabel>
              <h2 style={sectionH2}>A neutral platform for people who want to build responsibly</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
              {participationAudiences.map((a) => (
                <div key={a} style={{
                  padding: "16px", borderRadius: 14, background: "rgba(17,21,46,0.7)",
                  border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10,
                }}>
                  <Users size={16} color="#7C3AED" />
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{a}</span>
                </div>
              ))}
            </div>

            <div className={styles.ctaGroup} style={{ justifyContent: "center" }}>
              <a
                href={EOI_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Express Interest (opens Google Form in a new tab)"
                style={{
                  padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
                }}>Express Interest</a>
              <Link href={CONTACT_HREF} style={{
                padding: "12px 24px", borderRadius: 12, background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.35)", color: "#93C5FD", fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>Partner With Us</Link>
              <Link href={CONTACT_HREF} style={{
                padding: "12px 24px", borderRadius: 12, background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)", color: "#B5B8C9", fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>Contact Us</Link>
            </div>
          </div>
        </section>

        {/* ── Sustainable Access (#access) ── */}
        <section id="access" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <SectionLabel>Sustainable Access</SectionLabel>
            <h2 style={sectionH2}>How programmes will be funded</h2>
            <p className={styles.proseLeft} style={{ ...sectionDesc, marginBottom: 24 }}>
              Availability, selection, fees, sponsorship and stipend conditions will be published for each programme.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {accessModels.map((m) => <span key={m} className={styles.tagPill}>{m}</span>)}
            </div>
          </div>
        </section>

        {/* ── FAQ (#faq) ── */}
        <section id="faq" className={styles.section}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: 40, textAlign: "center" }}>
              <SectionLabel>FAQ</SectionLabel>
              <h2 style={sectionH2}>Common Questions</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── Ecosystem and Responsibilities (#ecosystem) ── */}
        <section id="ecosystem" className={styles.section} style={{ background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            <SectionLabel>Ecosystem</SectionLabel>
            <h2 style={sectionH2}>Ecosystem and Responsibilities</h2>
            <p style={{ ...sectionDesc, textAlign: "left" }}>
              Space is an{" "}
              <a href="https://www.evsociety.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#93C5FD", fontWeight: 600, textDecoration: "none" }}>EV Society</a> education and research initiative hosted on{" "}
              <Link href="/" style={{ color: "#93C5FD", fontWeight: 600, textDecoration: "none" }}>EV.ENGINEER</Link>.{" "}
              <a href="https://www.uflight.in/" target="_blank" rel="noopener noreferrer" style={{ color: "#93C5FD", fontWeight: 600, textDecoration: "none" }}>UFlight</a> focuses on health and usage monitoring technologies for aerospace and autonomous platforms. Commercial engineering products and services, where applicable, are handled separately by{" "}
              <a href="https://itelematics.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#93C5FD", fontWeight: 600, textDecoration: "none" }}>iTelematics Software Private Limited</a> under explicit agreements.
            </p>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className={styles.section}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
              border: "1px solid rgba(124,58,237,0.25)", borderRadius: 28, padding: "44px 32px",
              position: "relative", overflow: "hidden",
            }}>
              <div className={styles.orb} style={{ width: 300, height: 300, background: "#7C3AED", top: -80, left: -80, opacity: 0.2 }} />
              <div className={styles.orb} style={{ width: 200, height: 200, background: "#06B6D4", bottom: -60, right: -60, opacity: 0.15 }} />
              <Satellite size={36} color="#7C3AED" style={{ marginBottom: 16 }} />
              <h2 style={{ fontFamily: FONT_MANROPE, fontSize: "clamp(24px, 3.4vw, 32px)", fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
                Help Build Spacecraft That Can Protect Their Missions
              </h2>
              <p style={{ color: "#B5B8C9", fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
                Join an education, research and venture pathway dedicated to trustworthy spacecraft health, autonomy and safe recovery.
              </p>
              <div className={styles.ctaGroup} style={{ justifyContent: "center" }}>
                <a href="#mission" style={{
                  padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  border: "none", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  Explore the Mission <ArrowRight size={18} />
                </a>
                <a
                  href={EOI_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Express Interest (opens Google Form in a new tab)"
                  style={{
                    padding: "14px 28px", borderRadius: 12, background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.35)", color: "#93C5FD", fontWeight: 600, fontSize: 16, textDecoration: "none",
                  }}>Express Interest</a>
                <Link href="/" style={{
                  padding: "14px 28px", borderRadius: 12, background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)", color: "#B5B8C9", fontWeight: 600, fontSize: 16, textDecoration: "none",
                }}>Back to EV.ENGINEER</Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 0 }}>
          <ResearcherCard />
        </section>
      </main>

      {/* ── Footer ── */}
      <SpaceFooter />
    </div>
  );
}
