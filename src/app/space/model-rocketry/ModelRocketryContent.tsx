"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, ArrowRight, Presentation } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import ResearcherCard from "@/components/ResearcherCard";
import { structuredData, LAST_REVIEWED } from "./seo";
import { manrope, inter } from "../fonts";
import SpaceHeader from "../components/SpaceHeader";
import SpaceFooter from "../components/SpaceFooter";
import spaceTheme from "../spaceTheme.module.css";
import styles from "./model-rocketry.module.css";
import LearningLevelProvider from "./components/LearningLevelProvider";
import LevelSwitcher from "./components/LevelSwitcher";
import ExperienceModeSwitcher, { type ExperienceMode } from "./components/ExperienceModeSwitcher";
import PresentationMode from "./components/PresentationMode";
import AnchorNav from "./components/AnchorNav";
import LaunchSequenceHero from "./components/LaunchSequenceHero";
import ComparisonTable from "./components/ComparisonTable";
import RocketExplorer from "./components/RocketExplorer";
import SystemsView from "./components/SystemsView";
import FlightPhysicsDiagram from "./components/FlightPhysicsDiagram";
import StabilityLab from "./components/StabilityLab";
import MissionWorkflow from "./components/MissionWorkflow";
import DesignReviews from "./components/DesignReviews";
import SimTools from "./components/SimTools";
import FailureLab from "./components/FailureLab";
import FmeaTable from "./components/FmeaTable";
import Glossary from "./components/Glossary";
import CareerMap from "./components/CareerMap";
import Roadmap from "./components/Roadmap";
import KnowledgeCheck from "./components/KnowledgeCheck";
import RocketryVsCansat from "./components/RocketryVsCansat";
import CompetitionExplorer from "./components/CompetitionExplorer";
import CostAnatomy from "./components/CostAnatomy";
import EnterpriseMap from "./components/EnterpriseMap";

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function ModelRocketryContent() {
  const [mode, setMode] = useState<ExperienceMode>("webpage");

  return (
    <div className={`${spaceTheme.theme} ${manrope.variable} ${inter.variable} ${styles.portal}`}>
      <JsonLd data={structuredData} />
      {mode === "presentation" && <PresentationMode onExit={() => setMode("webpage")} />}
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <div hidden={mode === "presentation"}>
        <SpaceHeader basePath="/space" />
      </div>
      <LearningLevelProvider>
        <main id="main-content" className={styles.container} hidden={mode === "presentation"}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/space">Space</Link>
            <ChevronRight size={12} />
            <Link href="/space#simulations">Simulations &amp; R&amp;D Projects</Link>
            <ChevronRight size={12} />
            <span aria-current="page">Model Rocketry</span>
          </nav>

          {/* ── Hero: Virtual Launch ── */}
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroEyebrow}>Interactive Aerospace Learning</div>
            <h1 id="hero-title">Model Rocketry</h1>
            <p className={styles.heroSubtitle}>
              Learn aerospace engineering by following one rocket from mission idea to recovery.
            </p>
            <div className={styles.heroVisual}>
              <LaunchSequenceHero />
            </div>
            <div className={styles.heroPrimaryActions}>
              <a href="#what-is-it" className={styles.primaryButton}>
                Explore the Rocket <ArrowRight size={16} />
              </a>
              <button type="button" className={styles.textButton} onClick={() => setMode("presentation")}>
                <Presentation size={16} /> Start Workshop (Presentation Mode)
              </button>
            </div>
            <div className={styles.heroControlGroup}>
              <span className={styles.heroControlLabel}>Learning Level</span>
              <LevelSwitcher />
            </div>
            <div className={styles.heroControlGroup}>
              <span className={styles.heroControlLabel}>Experience</span>
              <ExperienceModeSwitcher mode={mode} onChange={setMode} />
            </div>
          </section>

          <AnchorNav />

          {/* ── What is Model Rocketry? ── */}
          <section id="what-is-it" className={styles.section}>
            <SectionHeading
              eyebrow="WHAT IS MODEL ROCKETRY?"
              title="Not just a small rocket — a complete learning environment."
              description="Model rocketry is a practical, hands-on environment for learning real aerospace engineering, at educational scale."
            />
            <p>
              Model rocketry uses small, certified commercial motors to fly lightweight rockets that students and
              hobbyists design, build and fly themselves. It teaches basic physics — forces, motion, pressure — and
              a complete systems-engineering cycle: design, build, test, fly and analyse.
            </p>
            <p>
              It is an excellent entry point into aerospace because a single small project touches nearly every
              discipline a real aerospace mission needs: requirements, aerodynamics, structures, propulsion,
              electronics, software, telemetry, recovery, safety, verification, project management and post-flight
              analysis — at a scale a student team can actually build and fly.
            </p>
            <p>
              Model rocketry sits at the accessible end of a spectrum that continues through high-power amateur
              rocketry and on to professional, licensed aerospace vehicles — the engineering mindset carries across
              that whole spectrum, even though scale, regulation and risk change enormously.
            </p>
          </section>

          {/* ── Model vs Real Rocketry ── */}
          <section id="model-vs-real" className={styles.section}>
            <SectionHeading
              eyebrow="MODEL ROCKETRY VS PROFESSIONAL ROCKETRY"
              title="Different scale. Same engineering mindset."
              description="The vehicles look nothing alike, but the underlying engineering disciplines — requirements, margins, testing, FMEA — transfer directly."
            />
            <ComparisonTable />
          </section>

          {/* ── Rocket Explorer ── */}
          <section id="explorer" className={styles.section}>
            <SectionHeading
              eyebrow="INTERACTIVE ROCKET EXPLORER"
              title="Explore every subsystem, component by component."
              description="Select a highlighted point on the cutaway diagram to learn what it is, why it matters, how it can fail, and the careers behind it."
            />
            <RocketExplorer />
          </section>

          {/* ── System of Systems ── */}
          <section id="systems" className={styles.section}>
            <SectionHeading
              eyebrow="A ROCKET IS A SYSTEM OF SYSTEMS"
              title="Systems engineering, taught by example."
              description="Every subsystem below belongs to a bigger mission system. Select one to see its purpose, interfaces, failure modes and career connection."
            />
            <SystemsView />
          </section>

          {/* ── Flight physics + Stability lab ── */}
          <section id="flight-physics" className={styles.section}>
            <SectionHeading
              eyebrow="HOW A ROCKET FLIES"
              title="Four forces, and the balance that keeps it stable."
              description="Thrust, weight, drag and aerodynamic side forces determine how a rocket moves. Centre of gravity (CG) and centre of pressure (CP) determine whether it stays pointed the right way."
            />
            <FlightPhysicsDiagram />
            <h3 style={{ marginTop: 32, marginBottom: 12 }}>CG / CP Stability Lab</h3>
            <p style={{ marginBottom: 16 }}>
              The Centre of Gravity (CG) is the point where a rocket&apos;s mass can be considered concentrated. The
              Centre of Pressure (CP) is the point where the net aerodynamic force acts. Move the sliders below to
              see how their relative position affects stability.
            </p>
            <StabilityLab />
          </section>

          {/* ── Propulsion (safety-bounded) ── */}
          <section id="propulsion" className={styles.section}>
            <SectionHeading
              eyebrow="PROPULSION"
              title="Understanding thrust, safely."
              description="This section covers propulsion engineering concepts and safe motor selection — not motor or propellant manufacture."
            />
            <p>
              A motor converts stored chemical energy into thrust over a short burn. Motors are classified by total
              impulse (a letter class, such as A through G in typical model rocketry) and described by a
              thrust-time curve showing how thrust varies across the burn — peak thrust, average thrust and burn
              duration all matter for motor selection.
            </p>
            <p>
              Motor selection is a data-sheet exercise: matching a certified commercial motor&apos;s total impulse
              and thrust-to-weight performance to the vehicle&apos;s mass and mission goal, then verifying the motor
              mount and retention hardware fit that specific motor&apos;s dimensions.
            </p>
            <div className={styles.card} style={{ padding: 20, marginTop: 20, borderLeft: "3px solid var(--space-amber)" }}>
              <p style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: 0 }}>
                <ShieldCheck size={18} style={{ color: "var(--space-amber)", flexShrink: 0, marginTop: 2 }} />
                <span>
                  This page only covers <strong>understanding propulsion engineering</strong> — selecting, mounting
                  and safely handling certified commercial motors under manufacturer instructions and official range
                  procedures. It does not cover, and will not cover, motor or propellant manufacture, energetic
                  materials, or bypassing safety and range controls.
                </span>
              </p>
            </div>
          </section>

          {/* ── Mission-to-Flight Workflow ── */}
          <section id="workflow" className={styles.section}>
            <SectionHeading
              eyebrow="FROM MISSION REQUIREMENT TO LAUNCH"
              title="A systems-engineering workflow, not a build recipe."
              description="Select a stage to see its inputs, outputs, key engineering questions and common mistakes."
            />
            <MissionWorkflow />
          </section>

          {/* ── Design Reviews ── */}
          <section id="design-reviews" className={styles.section}>
            <SectionHeading
              eyebrow="ENGINEERING REVIEWS"
              title="Checkpoints that catch problems before they become failures."
              description="Real aerospace programmes pause at defined reviews to check evidence before moving forward. Expand each review to learn more."
            />
            <DesignReviews />
          </section>

          {/* ── Simulation & Tools ── */}
          <section id="sim-tools" className={styles.section}>
            <SectionHeading
              eyebrow="SIMULATION, TESTING & ENGINEERING TOOLS"
              title="From idea to flight: tools you will learn."
              description="Start with the fundamentals of each tool, then grow into more advanced techniques as your projects demand them."
            />
            <SimTools />
          </section>

          {/* ── Failure Lab ── */}
          <section id="failure-lab" className={styles.section}>
            <SectionHeading
              eyebrow="FAILURE LAB"
              title="A successful aerospace engineer studies failure before flight."
              description="Expand each failure mode to see what you'd observe, likely causes, the engineering consequence, and how to prevent it."
            />
            <FailureLab />
          </section>

          {/* ── FMEA ── */}
          <section id="fmea" className={styles.section}>
            <SectionHeading
              eyebrow="FMEA — FAILURE MODE AND EFFECTS ANALYSIS"
              title="Think about failure before failure happens."
              description="FMEA is a structured way to identify how a system could fail, its effects, and mitigations, before it flies. Switch learning levels above to see more detail."
            />
            <FmeaTable />
            <KnowledgeCheck
              question="Why is onboard data logging still useful even when a telemetry radio is sending data in real time?"
              answer="A telemetry link can drop out during flight — from RF interference, range limits, or antenna shadowing — while onboard logging keeps recording independently. The two are complementary safeguards against the same underlying risk (losing flight data), not redundant copies of the same thing."
            />
          </section>

          {/* ── Model Rocketry vs CanSat ── */}
          <section id="rocketry-vs-cansat" className={styles.section}>
            <SectionHeading
              eyebrow="MODEL ROCKETRY VS CANSAT"
              title="Two competition tracks, one shared engineering discipline."
              description="Model Rocketry competitions focus on the launch vehicle; CanSat competitions focus on the payload mission. Both teach real systems engineering."
            />
            <RocketryVsCansat />
          </section>

          {/* ── Competitions Explorer ── */}
          <section id="competitions" className={styles.section}>
            <SectionHeading
              eyebrow="WHERE CAN STUDENTS COMPETE?"
              title="India and international student rocketry / CanSat competitions."
              description="A snapshot of current student competitions, each linked to its official source with a last-verified date."
            />
            <CompetitionExplorer />
          </section>

          {/* ── Glossary ── */}
          <section id="glossary" className={styles.section}>
            <SectionHeading
              eyebrow="GLOSSARY"
              title="Key terms, defined plainly."
              description="Search or scan the terms used throughout this page."
            />
            <Glossary />
          </section>

          {/* ── Career Map ── */}
          <section id="careers" className={styles.section}>
            <SectionHeading
              eyebrow="ONE ROCKET. MANY AEROSPACE CAREERS."
              title="Every subsystem connects to a real engineering career."
              description="These are illustrative career directions related to each subsystem area, not job openings."
            />
            <CareerMap />
          </section>

          {/* ── Cost Anatomy ── */}
          <section id="cost" className={styles.section}>
            <SectionHeading
              eyebrow="WHAT DOES MODEL ROCKETRY COST?"
              title="Cost depends on mission ambition, not a single number."
              description="Explore what gets added to a project's cost anatomy as it grows from a first learning rocket to a research-grade prototype."
            />
            <CostAnatomy />
          </section>

          {/* ── Enterprise / Startup Map ── */}
          <section id="enterprise" className={styles.section}>
            <SectionHeading
              eyebrow="FROM LEARNING TO ENTERPRISE"
              title="Where model rocketry creates economic opportunity."
              description="Explore a maturity pathway and illustrative startup opportunity categories that can grow out of model-rocketry skills."
            />
            <EnterpriseMap />
          </section>

          {/* ── Learning Roadmap ── */}
          <section id="roadmap" className={styles.section}>
            <SectionHeading
              eyebrow="LEARNING ROADMAP"
              title="Your path from first principles to a launched, analysed mission."
              description="A suggested progression — move at your own pace."
            />
            <Roadmap />
          </section>

          {/* ── Cross-link to workshop guide ── */}
          <section className={styles.section}>
            <div className={styles.crossLink}>
              <div>
                <h3 style={{ marginBottom: 8 }}>Want the workshop version?</h3>
                <p>
                  This page is the evergreen, self-paced guide. For a structured, day-by-day learning companion tied
                  to the IN-SPACe Model Rocketry Workshop, open the 7-Day Learning Guide.
                </p>
              </div>
              <Link href="/space/2026-INSPACe-ROCKETRY-059" className={styles.primaryButton}>
                Open the 7-Day Learning Guide <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <div style={{ padding: "24px var(--space-inset)" }}>
            <ResearcherCard />
          </div>

          <section className={styles.section} style={{ borderBottom: "none" }}>
            <p className={styles.formNote}>
              Content last reviewed: <time dateTime={LAST_REVIEWED}>14 September 2026</time>. Model Rocketry is an
              EV Society™ educational initiative hosted on EV.ENGINEER™. Commercial engineering products and
              services, where applicable, are handled separately by iTelematics Software Private Limited under
              explicit agreements. UFlight™ is referenced within the broader ecosystem for aerospace health and
              usage monitoring. These references do not imply a partnership, endorsement, certification, ISRO or
              IN-SPACe affiliation, or government approval unless explicitly documented.
            </p>
          </section>
        </main>
      </LearningLevelProvider>
      {mode !== "presentation" && <SpaceFooter basePath="/space" />}
    </div>
  );
}
