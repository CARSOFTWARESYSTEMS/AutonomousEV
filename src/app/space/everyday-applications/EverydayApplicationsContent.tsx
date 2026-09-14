"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import ResearcherCard from "@/components/ResearcherCard";
import { structuredData, LAST_REVIEWED } from "./seo";
import { manrope, inter } from "../fonts";
import SpaceHeader from "../components/SpaceHeader";
import SpaceFooter from "../components/SpaceFooter";
import spaceTheme from "../spaceTheme.module.css";
import styles from "./everyday-applications.module.css";
import ViewProvider from "./components/ViewProvider";
import ViewSwitcher from "./components/ViewSwitcher";
import PersonaSelector from "./components/PersonaSelector";
import AnchorNav from "./components/AnchorNav";
import SystemDiagram from "./components/SystemDiagram";
import QuestionWall from "./components/QuestionWall";
import ApplicationExplorer from "./components/ApplicationExplorer";
import DayInLife from "./components/DayInLife";
import BenefitsSplit from "./components/BenefitsSplit";
import SpaceSystemsSources from "./components/SpaceSystemsSources";
import SatelliteToPhone from "./components/SatelliteToPhone";
import type { Persona } from "./applicationsData";

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function EverydayApplicationsContent() {
  const [persona, setPersona] = useState<Persona | null>(null);

  return (
    <div className={`${spaceTheme.theme} ${manrope.variable} ${inter.variable} ${styles.portal}`}>
      <JsonLd data={structuredData} />
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <SpaceHeader basePath="/space" />
      <ViewProvider>
        <main id="main-content" className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/space">Space</Link>
            <ChevronRight size={12} />
            <Link href="/space#simulations">Simulations &amp; R&amp;D Projects</Link>
            <ChevronRight size={12} />
            <span aria-current="page">Space Applications</span>
          </nav>

          {/* ── Hero ── */}
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroEyebrow}>Space Applications for Everyday India</div>
            <h1 id="hero-title">You may never see a satellite, but it already helps you every day.</h1>
            <p className={styles.heroSubtitle}>
              From weather forecasts and navigation to farming, connectivity, disaster warnings, healthcare, logistics
              and safer infrastructure, space technology quietly supports everyday decisions across India.
            </p>
            <div className={styles.heroPrimaryActions}>
              <a href="#system-diagram" className={styles.primaryButton}>
                See How Space Helps Me <ArrowRight size={16} />
              </a>
            </div>
            <div className={styles.heroControlGroup}>
              <span className={styles.heroControlLabel}>Who are you?</span>
              <PersonaSelector persona={persona} onChange={setPersona} />
            </div>
            <div className={styles.heroControlGroup}>
              <span className={styles.heroControlLabel}>View</span>
              <ViewSwitcher />
            </div>
          </section>

          <AnchorNav />

          <section id="system-diagram" className={styles.section}>
            <SectionHeading
              eyebrow="How Space Helps"
              title="Rocket → Satellite → Data → Intelligence → Service → You"
              description="Rockets provide access to space. Satellites create services from space. Data becomes valuable only when it improves a decision. Click through each stage."
            />
            <SystemDiagram />
          </section>

          <section id="questions" className={styles.section}>
            <SectionHeading
              eyebrow="Everyday Questions"
              title="Questions people actually ask"
              description="Expand a question to see the problem, how space helps, what you receive, who uses it, and where this could go next."
            />
            <QuestionWall />
          </section>

          <section id="applications" className={styles.section}>
            <SectionHeading
              eyebrow="Applications"
              title="Space applications for everyday India"
              description="Filter by category, or select who you are above to prioritise the applications most relevant to you."
            />
            <ApplicationExplorer persona={persona} />
          </section>

          <section id="day-in-life" className={styles.section}>
            <SectionHeading
              eyebrow="A Day in the Life"
              title="One ordinary day. Many invisible connections to space."
              description="Follow an ordinary day and see where space-enabled services quietly show up."
            />
            <DayInLife />
          </section>

          <section id="benefits" className={styles.section}>
            <SectionHeading
              eyebrow="Direct vs Indirect"
              title="Some benefits you see. Others work quietly behind the scenes."
              description="Not every benefit of space technology is something you personally interact with."
            />
            <BenefitsSplit />
          </section>

          <section id="space-systems" className={styles.section}>
            <SectionHeading
              eyebrow="India's Space Systems"
              title="What is working behind these services?"
              description="Each system here is explained through the question it helps answer — not a specifications sheet."
            />
            <SpaceSystemsSources />
          </section>

          <section id="satellite-to-phone" className={styles.section}>
            <SectionHeading
              eyebrow="From Satellite to My Phone"
              title="How does space information actually reach me?"
              description="A phone app doesn't usually talk to a satellite directly — here's the real chain of steps in between."
            />
            <SatelliteToPhone />
          </section>

          <section className={styles.section}>
            <p className={styles.formNote}>
              An EV Society™ initiative, hosted on EV.ENGINEER™. UFlight™ supports aerospace health and
              mission-intelligence research. Commercial engineering products and services are handled by iTelematics
              Software Private Limited. Content last reviewed {LAST_REVIEWED}.
            </p>
          </section>

          <div style={{ padding: "24px var(--space-inset)" }}>
            <ResearcherCard />
          </div>
        </main>
      </ViewProvider>
      <SpaceFooter basePath="/space" />
    </div>
  );
}
