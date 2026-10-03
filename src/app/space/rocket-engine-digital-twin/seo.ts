import type { Metadata } from "next";
import {
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  ITELEMATICS_ID,
  PERSON_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
  sudarshanaKarkalaPersonNode,
} from "@/lib/structured-data/entities";
import { OVERVIEW, PREPARED_BY, PRODUCT } from "@/components/rocket-engine-twin/data/engineReference";

const SPACE = "https://aerospace.ev.engineer/space";
export const CANONICAL = `https://aerospace.ev.engineer${PRODUCT.route}`;
export const TITLE = `${PRODUCT.name} | Interactive Propulsion Engineering | EV.ENGINEER`;
export const DESCRIPTION =
  "Explore a next-generation reusable liquid rocket engine through an interactive 3D digital twin covering propulsion architecture, turbomachinery, combustion, regenerative cooling, control, instrumentation, simulated testing and engine health monitoring.";
export const OG_TITLE: string = PRODUCT.name;
export const OG_DESCRIPTION =
  "Explore rocket propulsion architecture, turbomachinery, combustion, cooling, instrumentation, control, simulated testing and engine health through an interactive 3D digital twin.";
export const LAST_REVIEWED: string = PREPARED_BY.reviewed;
const OG_IMAGE = `${CANONICAL}/opengraph-image`;
export const OG_ALT = `${PRODUCT.name}: schematic of a reusable liquid rocket engine reference architecture in a dark engineering environment. EV.ENGINEER.`;

/** The subjects the page connects, in the order the engine connects them. */
export const SUBJECTS = [
  "Rocket propulsion",
  "Reusable liquid rocket engine",
  "Turbomachinery",
  "Combustion chamber",
  "Regenerative cooling",
  "Rocket engine instrumentation",
  "Engine control",
  "Engine health monitoring",
  "Fault diagnosis",
  "Digital twin",
] as const;

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "rocket engine digital twin",
    "reusable liquid rocket engine",
    "rocket propulsion engineering",
    "turbomachinery",
    "turbopump",
    "combustion chamber",
    "regenerative cooling",
    "rocket nozzle",
    "rocket engine instrumentation",
    "engine control system",
    "engine health monitoring",
    "simulated engine test",
    "model credibility",
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
const APP_ID = `${CANONICAL}#app`;
const LEARNING_ID = `${CANONICAL}#learning`;
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
      about: { "@id": APP_ID },
      mainEntity: { "@id": APP_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }],
      breadcrumb: { "@id": BREADCRUMB_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "WebApplication",
      "@id": APP_ID,
      name: PRODUCT.name,
      url: CANONICAL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web browser",
      browserRequirements: "Requires JavaScript for the interactive console. The page content is readable without it.",
      description: "Educational digital-engineering demonstrator: a reusable liquid rocket engine reference architecture with simulated telemetry, operating states, faults and test scenarios. Not a real engine and not correlated with test data.",
      isAccessibleForFree: true,
      creator: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
    },
    {
      "@type": "LearningResource",
      "@id": LEARNING_ID,
      name: PRODUCT.name,
      description: PRODUCT.description,
      url: CANONICAL,
      learningResourceType: "Interactive simulation",
      educationalUse: "Self-study",
      inLanguage: "en",
      isAccessibleForFree: true,
      about: SUBJECTS.map((name) => ({ "@type": "Thing", name })),
      teaches: OVERVIEW.covers,
      isPartOf: { "@id": WEBPAGE_ID },
      creator: { "@id": PERSON_ID },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Space", item: SPACE },
        { "@type": "ListItem", position: 2, name: PRODUCT.name, item: CANONICAL },
      ],
    },
  ],
};
