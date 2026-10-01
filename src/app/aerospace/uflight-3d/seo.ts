import type { Metadata } from "next";
import {
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  ITELEMATICS_ID,
  PERSON_ID,
  UFLIGHT_BRAND_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
  sudarshanaKarkalaPersonNode,
  uflightBrandNode,
} from "@/lib/structured-data/entities";
import { AIRCRAFT, OVERVIEW_CARDS, PREPARED_BY, PRODUCT } from "@/components/uflight-3d/data/uflightReferenceAircraft";

const HOME = "https://aerospace.ev.engineer/aerospace";
export const CANONICAL = `https://aerospace.ev.engineer${PRODUCT.route}`;
export const TITLE = "UFlight™ 3D | Advanced eVTOL Health Monitoring & Digital Twin";
export const DESCRIPTION =
  "Explore a next-generation 6-seat electric aircraft in interactive 3D. Visualize propulsion, batteries, avionics, flight controls, sensor networks, HUMS, diagnostics, prognostics and digital-twin health monitoring.";
export const LAST_REVIEWED: string = PREPARED_BY.reviewed;
const OG_IMAGE = `${CANONICAL}/opengraph-image`;
export const OG_ALT = "UFlight™ 3D — Advanced Health Monitoring Systems for Next-Generation Air Mobility. The UFlight™ Reference eVTOL in a dark engineering studio.";

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "advanced health monitoring systems",
    "HUMS aerospace",
    "eVTOL digital twin",
    "electric aircraft health monitoring",
    "air taxi digital twin",
    "aircraft predictive maintenance",
    "electric propulsion monitoring",
    "battery health aerospace",
    "aerospace prognostics",
    "aircraft fault diagnosis",
    "condition based maintenance",
    "air mobility systems engineering",
    "flight control architecture",
    "aerospace digital engineering",
  ],
  authors: [{ name: "EV.ENGINEER" }],
  creator: "EV.ENGINEER",
  publisher: "iTelematics Software Private Limited",
  alternates: { canonical: CANONICAL },
  // The Aerospace section's layout is not indexed; this page is.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    locale: "en_US",
    siteName: "EV.ENGINEER",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
    uflightBrandNode(),
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
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }, { "@id": UFLIGHT_BRAND_ID }],
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
      browserRequirements: "Requires WebGL. The full interactive experience is designed for laptop and desktop screens.",
      description: `Digital engineering demonstrator: an interactive 3D reference platform (${AIRCRAFT.name}, ${AIRCRAFT.seats}) for advanced health monitoring. Conceptual architecture and simulated health data; not flight hardware.`,
      isAccessibleForFree: true,
      brand: { "@id": UFLIGHT_BRAND_ID },
      creator: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
    },
    {
      "@type": "LearningResource",
      "@id": LEARNING_ID,
      name: `${PRODUCT.name} — ${PRODUCT.headline}`,
      url: CANONICAL,
      learningResourceType: ["Interactive simulation", "3D model"],
      educationalLevel: "Professional",
      inLanguage: "en",
      teaches: [...OVERVIEW_CARDS.map((card) => card.text), "Sensor-to-health data pipeline", "Diagnosis, prognosis and condition-based maintenance", "Digital twin: observed, estimated, expected and predicted state"],
      isPartOf: { "@id": WEBPAGE_ID },
      creator: { "@id": PERSON_ID },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Aerospace", item: HOME },
        { "@type": "ListItem", position: 2, name: PRODUCT.name, item: CANONICAL },
      ],
    },
  ],
};
