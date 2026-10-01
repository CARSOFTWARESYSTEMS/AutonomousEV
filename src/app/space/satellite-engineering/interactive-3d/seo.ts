import type { Metadata } from "next";
import {
  WEBSITE_ID,
  EV_SOCIETY_ID,
  EV_ENGINEER_BRAND_ID,
  websiteNode,
  evSocietyOrgNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
} from "@/lib/structured-data/entities";
import { PREPARED_BY, SATELLITE_REFERENCE, SUBSYSTEMS, SUBSYSTEM_ORDER } from "@/components/satellite-explorer/data/satelliteReference";

export const CANONICAL = "https://aerospace.ev.engineer/space/satellite-engineering/interactive-3d";
const PARENT = "https://aerospace.ev.engineer/space/satellite-engineering";
export const TITLE = "Satellite Explorer 3D | Interactive Satellite Engineering | EV.ENGINEER";
export const DESCRIPTION =
  "Explore a 6U Earth observation satellite in interactive 3D. Learn spacecraft structure, power, ADCS, avionics, payload, communications, orbit and ground-station operations through visual engineering demonstrations.";
export const LAST_REVIEWED: string = PREPARED_BY.reviewed;
const OG_IMAGE = `${CANONICAL}/opengraph-image`;
export const OG_ALT = "Satellite Explorer 3D — Build · Explore · Operate a Satellite. A 6U Earth observation satellite above Earth.";

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "satellite engineering",
    "CubeSat",
    "3D satellite",
    "interactive satellite model",
    "spacecraft systems",
    "satellite communication",
    "ground station",
    "satellite power system",
    "ADCS",
    "satellite avionics",
    "satellite payload",
    "space engineering education",
  ],
  authors: [{ name: "EV Society" }],
  creator: "EV Society",
  publisher: "EV Society",
  alternates: { canonical: CANONICAL },
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
    evSocietyOrgNode(),
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
      publisher: { "@id": EV_SOCIETY_ID },
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }],
      breadcrumb: { "@id": BREADCRUMB_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "WebApplication",
      "@id": APP_ID,
      name: "Satellite Explorer 3D",
      url: CANONICAL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web browser",
      browserRequirements: "Requires WebGL. The full interactive experience is designed for laptop and desktop screens.",
      description: `Interactive 3D model of an educational ${SATELLITE_REFERENCE.name}. Reference and simulated values; not flight hardware or a real mission.`,
      isAccessibleForFree: true,
      creator: { "@id": EV_SOCIETY_ID },
    },
    {
      "@type": "LearningResource",
      "@id": LEARNING_ID,
      name: "Satellite Explorer 3D — how a satellite is built and operated",
      url: CANONICAL,
      learningResourceType: ["Interactive simulation", "3D model"],
      educationalLevel: "Beginner to intermediate",
      inLanguage: "en",
      teaches: SUBSYSTEM_ORDER.map((id) => SUBSYSTEMS[id].name),
      isPartOf: { "@id": WEBPAGE_ID },
      creator: { "@id": EV_SOCIETY_ID },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Space", item: "https://aerospace.ev.engineer/space" },
        { "@type": "ListItem", position: 2, name: "Satellite Engineering", item: PARENT },
        { "@type": "ListItem", position: 3, name: "Satellite Explorer 3D", item: CANONICAL },
      ],
    },
  ],
};
