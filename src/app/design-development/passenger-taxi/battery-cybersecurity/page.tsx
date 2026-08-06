import type { Metadata } from "next";
import { ALL_FAQ_ITEMS } from "@/lib/battery-cybersecurity/data/faq";
import styles from "./page.module.css";
import { SectionNav } from "./SectionNav";
import { FadeInSection } from "./FadeInSection";
import { HeroSection } from "./_sections/HeroSection";
import { EnergyTrustChain } from "./_sections/EnergyTrustChain";
import { TrustQuestionSection } from "./_sections/TrustQuestionSection";
import { ThreatScenario } from "./_sections/ThreatScenario";
import { ThreatCatalogue } from "./_sections/ThreatCatalogue";
import { DetectionLayers } from "./_sections/DetectionLayers";
import { ThreatModellingStudio } from "./_sections/threat-modelling-studio/ThreatModellingStudio";
import { InternLearningPath } from "./_sections/InternLearningPath";
import { WorkshopSection } from "./_sections/WorkshopSection";
import { RoadmapSection } from "./_sections/RoadmapSection";
import { StandardsSection } from "./_sections/StandardsSection";
import { FaqSection } from "./_sections/FaqSection";
import { GlossarySection } from "./_sections/GlossarySection";
import { ReferencesSection } from "./_sections/ReferencesSection";
import { AuthorSection } from "./_sections/AuthorSection";
import { FrameworksSection } from "./_sections/FrameworksSection";
import { AttackSurfaceExplorer } from "./_sections/AttackSurfaceExplorer";
import { DecisionTreeSection } from "./_sections/DecisionTreeSection";
import { KnowledgeGraphExplorer } from "./_sections/KnowledgeGraphExplorer";
import { MaturityModelSection } from "./_sections/MaturityModelSection";
import { FlightPhaseExplorer } from "./_sections/FlightPhaseExplorer";
import { DigitalTwinSection } from "./_sections/DigitalTwinSection";
import { MethodologySection } from "./_sections/MethodologySection";
import { WorkshopJourneySection } from "./_sections/WorkshopJourneySection";
import { CapabilityMatrixSection } from "./_sections/CapabilityMatrixSection";
import { DownloadsSection } from "./_sections/DownloadsSection";
import { ResearchLibrarySection } from "./_sections/ResearchLibrarySection";
import { RelatedArticlesSection } from "./_sections/RelatedArticlesSection";
import { AssessmentWizardSection } from "./_sections/AssessmentWizardSection";
import { HowAssessmentWorksSection } from "./_sections/HowAssessmentWorksSection";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

const PAGE_URL = "https://autonomous.ev.engineer/design-development/passenger-taxi/battery-cybersecurity";
const PARENT_URL = "https://autonomous.ev.engineer/design-development/passenger-taxi";
const OG_IMAGE = "https://autonomous.ev.engineer/ev-engineer-car.png";
const PAGE_TITLE = "Electric Aircraft Battery Cybersecurity | eVTOL BMS Threat Modelling & Energy Assurance | EV.ENGINEER";
const PAGE_DESCRIPTION =
  "Cyber-resilient battery intelligence for electric aircraft: trust chains, BMS cybersecurity, telemetry integrity, threat modelling, an interactive threat-modelling studio, and a discovery workshop for eVTOL, eSTOL, and defense UAV energy systems.";

export const metadata: Metadata = {
  metadataBase: new URL("https://autonomous.ev.engineer"),
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "electric aircraft battery cybersecurity",
    "eVTOL battery cybersecurity",
    "BMS cybersecurity",
    "electric aircraft energy assurance",
    "battery threat modelling",
    "aviation battery security",
    "secure aircraft charging",
    "battery telemetry integrity",
    "state-of-charge spoofing",
    "aircraft energy-system cybersecurity",
    "cyber-resilient battery systems",
    "electric aviation cybersecurity workshop",
    "EV.ENGINEER",
    "Sudarshana Karkala",
  ],
  authors: [{ name: "Sudarshana Karkala", url: "https://autonomous.ev.engineer/about/sudarshana-karkala" }],
  creator: "Sudarshana Karkala",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "article",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "EV.ENGINEER — Electric Aircraft Battery Cybersecurity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
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
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      isPartOf: { "@id": "https://autonomous.ev.engineer" },
      author: { "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala" },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      dateModified: "2026-08-06",
    },
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      url: PAGE_URL,
      headline: "Electric Aircraft Battery Cybersecurity: Trust Chains, Threat Modelling & Energy Assurance",
      description: PAGE_DESCRIPTION,
      author: { "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala" },
      publisher: { "@type": "Organization", name: "EV.ENGINEER", url: "https://autonomous.ev.engineer" },
      isPartOf: { "@id": `${PARENT_URL}#article` },
      about: [
        "electric aircraft battery cybersecurity",
        "eVTOL battery cybersecurity",
        "BMS cybersecurity",
        "battery threat modelling",
        "aircraft energy-system cybersecurity",
        "battery cybersecurity maturity model",
        "flight phase risk explorer",
        "attack surface explorer",
        "battery digital twin",
        "energy trust pyramid",
        "battery cybersecurity assessment",
        "battery trust score",
      ],
      dateModified: "2026-08-06",
    },
    {
      "@type": "Person",
      "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala",
      name: "Sudarshana Karkala",
      url: "https://autonomous.ev.engineer/about/sudarshana-karkala",
      jobTitle: "Founder of EV.ENGINEER",
      worksFor: { "@type": "Organization", name: "EV.ENGINEER", url: "https://autonomous.ev.engineer" },
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
        { "@type": "ListItem", position: 2, name: "Design & Development", item: "https://autonomous.ev.engineer/design-development" },
        { "@type": "ListItem", position: 3, name: "Passenger Air Taxi", item: PARENT_URL },
        { "@type": "ListItem", position: 4, name: "Battery & Energy Cybersecurity", item: PAGE_URL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: ALL_FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

const SECTION_NAV_ITEMS = [
  { id: "frameworks", label: "Frameworks" },
  { id: "how-assessment-works", label: "How It Works" },
  { id: "assessment-wizard", label: "Assessment" },
  { id: "energy-trust-chain", label: "Trust Chain" },
  { id: "attack-surface-explorer", label: "Attack Surface" },
  { id: "trust-questions", label: "Trust Questions" },
  { id: "decision-trees", label: "Decision Trees" },
  { id: "flagship-scenario", label: "Threat Scenario" },
  { id: "threat-catalogue", label: "Catalogue" },
  { id: "knowledge-graph", label: "Knowledge Graph" },
  { id: "detection-strategy", label: "Detection" },
  { id: "maturity-model", label: "Maturity Model" },
  { id: "threat-modelling-studio", label: "Studio" },
  { id: "flight-phase-explorer", label: "Flight Phases" },
  { id: "digital-twin", label: "Digital Twin" },
  { id: "methodology", label: "Methodology" },
  { id: "learning-path", label: "Learning Path" },
  { id: "workshop", label: "Workshop" },
  { id: "workshop-journey", label: "Workshop Journey" },
  { id: "capability-matrix", label: "Capability Matrix" },
  { id: "roadmap", label: "Roadmap" },
  { id: "standards", label: "Standards" },
  { id: "downloads", label: "Downloads" },
  { id: "research-library", label: "Research Library" },
  { id: "faq", label: "FAQ" },
  { id: "glossary", label: "Glossary" },
  { id: "related-articles", label: "Related Reading" },
  { id: "references", label: "References" },
];

export default function BatteryCybersecurityPage() {
  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSection />
      <SectionNav items={SECTION_NAV_ITEMS} />
      <FrameworksSection />
      <HowAssessmentWorksSection />
      <AssessmentWizardSection />
      <EnergyTrustChain />
      <AttackSurfaceExplorer />
      <TrustQuestionSection />
      <DecisionTreeSection />
      <FadeInSection>
        <ThreatScenario />
      </FadeInSection>
      <ThreatCatalogue />
      <KnowledgeGraphExplorer />
      <DetectionLayers />
      <MaturityModelSection />
      <ThreatModellingStudio />
      <FlightPhaseExplorer />
      <DigitalTwinSection />
      <MethodologySection />
      <InternLearningPath />
      <FadeInSection>
        <WorkshopSection />
      </FadeInSection>
      <WorkshopJourneySection />
      <CapabilityMatrixSection />
      <RoadmapSection />
      <StandardsSection />
      <DownloadsSection />
      <ResearchLibrarySection />
      <FaqSection />
      <GlossarySection />
      <RelatedArticlesSection />
      <ReferencesSection />
      <AuthorSection />
    </div>
  );
}
