import type { Metadata } from "next";
import { EV_ENGINEER_BRAND_ID, ITELEMATICS_ID, PERSON_ID, WEBSITE_ID, evEngineerBrandNode, itelematicsOrgNode, sudarshanaKarkalaPersonNode, websiteNode } from "@/lib/structured-data/entities";
import { COURSE_PHASES } from "@/components/propulsion-twin-advanced/data/course";
import { FAQ } from "@/components/propulsion-twin-advanced/data/faq";
import { OBJECTIVES, PREPARED_BY, PRODUCT } from "@/components/propulsion-twin-advanced/data/product";

const SPACE = "https://aerospace.ev.engineer/space";
const FUNDAMENTALS = `https://aerospace.ev.engineer${PRODUCT.fundamentalsRoute}`;
export const CANONICAL = `https://aerospace.ev.engineer${PRODUCT.route}`;
export const TITLE = "Advanced Rocket Propulsion Digital Twin | Physics, AI/ML & Pressure Monitoring | EV.ENGINEER";
export const DESCRIPTION =
  "Learn how to design an advanced rocket propulsion Digital Twin for pressure monitoring using physics-based models, telemetry, state estimation, AI/ML, fault detection, prognostics and Digital Twin validation.";
export const OG_TITLE: string = PRODUCT.name;
export const OG_DESCRIPTION = "An interactive engineering tutorial: instrument a propulsion system, model its physics, synchronise the model with telemetry, and detect, diagnose and predict faults with physics and AI/ML.";
export const LAST_REVIEWED: string = PREPARED_BY.reviewed;
const OG_IMAGE = `${CANONICAL}/opengraph-image`;
export const OG_ALT = `${PRODUCT.name}: a rocket engine reference architecture beside the chain from physical system to physics, telemetry, AI/ML, Digital Twin and prognostics. EV.ENGINEER.`;

/** The subjects the tutorial connects, in the order it teaches them. */
export const SUBJECTS = [
  "Rocket propulsion",
  "Digital twin",
  "Propulsion pressure monitoring",
  "Rocket engine instrumentation",
  "Telemetry",
  "Physics-based modelling",
  "State estimation",
  "Fault detection and isolation",
  "Physics-informed machine learning",
  "Prognostics and health management",
  "Model verification and validation",
] as const;

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "rocket propulsion digital twin",
    "rocket engine digital twin",
    "propulsion pressure monitoring",
    "aerospace digital twin",
    "rocket engine health monitoring",
    "physics based digital twin",
    "physics informed machine learning aerospace",
    "propulsion anomaly detection",
    "Digital Twin FDIR",
    "rocket engine prognostics",
    "propulsion IVHM",
    "rocket engine pressure sensors",
    "Digital Twin architecture",
    "state estimation",
  ],
  authors: [{ name: "EV.ENGINEER" }],
  creator: "EV.ENGINEER",
  publisher: "iTelematics Software Private Limited",
  alternates: { canonical: CANONICAL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: CANONICAL,
    type: "website",
    locale: "en_US",
    siteName: "EV.ENGINEER",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: OG_ALT }],
  },
};

const WEBPAGE_ID = `${CANONICAL}#webpage`;
const LEARNING_ID = `${CANONICAL}#learning`;
const COURSE_ID = `${CANONICAL}#course`;
const FAQ_ID = `${CANONICAL}#faq`;
const BREADCRUMB_ID = `${CANONICAL}#breadcrumb`;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    // websiteNode() references the brand and its publisher, so both must be in this graph.
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    sudarshanaKarkalaPersonNode(),
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      dateModified: LAST_REVIEWED,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": LEARNING_ID },
      mainEntity: { "@id": LEARNING_ID },
      hasPart: [{ "@id": COURSE_ID }, { "@id": FAQ_ID }],
      author: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }],
      breadcrumb: { "@id": BREADCRUMB_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "LearningResource",
      "@id": LEARNING_ID,
      name: PRODUCT.name,
      description: "Interactive engineering tutorial on building a propulsion pressure-monitoring Digital Twin, with a simulated twin that runs in the browser. Uses a generic reference architecture and simulated telemetry; it does not represent any flight engine and is not correlated with test data.",
      url: CANONICAL,
      learningResourceType: ["Interactive tutorial", "Interactive simulation"],
      educationalLevel: "Advanced",
      educationalUse: "Self-study",
      inLanguage: "en",
      isAccessibleForFree: true,
      about: SUBJECTS.map((name) => ({ "@type": "Thing", name })),
      teaches: OBJECTIVES.flatMap((group) => group.items),
      isBasedOn: FUNDAMENTALS,
      isPartOf: { "@id": WEBPAGE_ID },
      creator: { "@id": PERSON_ID },
    },
    {
      // A self-paced syllabus published on this page. No enrolment, instructor, schedule or credential is offered.
      "@type": "Course",
      "@id": COURSE_ID,
      name: "12-Week Digital Twin Assignment",
      description: "A self-paced, twelve-week project in four phases in which the learner builds a propulsion pressure-monitoring Digital Twin against simulated or experimental telemetry, with a review at the end of each phase.",
      url: `${CANONICAL}#weeks`,
      inLanguage: "en",
      isAccessibleForFree: true,
      provider: { "@id": EV_ENGINEER_BRAND_ID },
      creator: { "@id": PERSON_ID },
      syllabusSections: COURSE_PHASES.map((phase) => ({ "@type": "Syllabus", name: phase.name, description: phase.weeks.map((week) => `Week ${week.week}: ${week.title}`).join("; ") })),
    },
    {
      "@type": "FAQPage",
      "@id": FAQ_ID,
      url: CANONICAL,
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Space", item: SPACE },
        { "@type": "ListItem", position: 2, name: "Rocket Engine Digital Twin", item: FUNDAMENTALS },
        { "@type": "ListItem", position: 3, name: PRODUCT.shortName, item: CANONICAL },
      ],
    },
  ],
};
