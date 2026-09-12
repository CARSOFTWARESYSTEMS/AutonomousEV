import type { Metadata } from "next";
import { FAQ } from "@/lib/cubetwin/content";
import {
  EV_SOCIETY_ID,
  ITELEMATICS_ID,
  UFLIGHT_BRAND_ID,
  EV_ENGINEER_BRAND_ID,
  evSocietyOrgNode,
  itelematicsOrgNode,
  uflightBrandNode,
  evEngineerBrandNode,
} from "@/lib/structured-data/entities";
export const CANONICAL = "https://aerospace.ev.engineer/space/cubesat";
export const TITLE = "CubeTwin | CubeSat Battery & Energy Digital Twin";
export const DESCRIPTION =
  "Learn CubeSat power systems with an interactive digital twin that simulates orbit sunlight, solar generation, battery SOC, mission loads, faults and reliability.";
export const LAST_REVIEWED = "2026-09-12";
export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  authors: [{ name: "EV Society" }],
  creator: "EV Society",
  publisher: "EV Society",
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    siteName: "EV.ENGINEER",
    images: [
      {
        url: `${CANONICAL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CubeTwin · CubeSat energy simulation · An EV Society initiative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${CANONICAL}/opengraph-image`],
  },
};
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    evSocietyOrgNode(),
    itelematicsOrgNode(),
    uflightBrandNode(),
    evEngineerBrandNode(),
    {
      "@type": "WebPage",
      "@id": `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      dateModified: LAST_REVIEWED,
      publisher: { "@id": EV_SOCIETY_ID },
      about: { "@id": `${CANONICAL}#simulator` },
      mentions: [
        { "@id": ITELEMATICS_ID },
        { "@id": UFLIGHT_BRAND_ID },
        { "@id": EV_ENGINEER_BRAND_ID },
      ],
      breadcrumb: { "@id": `${CANONICAL}#breadcrumb` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${CANONICAL}#simulator`,
      name: "CubeTwin",
      url: `${CANONICAL}#simulator`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web browser",
      softwareVersion: "1.0",
      description:
        "Educational R&D prototype using simulated data. Not flight software or a validated operational twin.",
      creator: { "@id": EV_SOCIETY_ID },
    },
    {
      "@type": "LearningResource",
      "@id": `${CANONICAL}#learning`,
      name: "CubeTwin 12-Week Beginner Guide and Workbook",
      url: `${CANONICAL}#roadmap`,
      learningResourceType: ["Tutorial", "Workbook"],
      educationalLevel: "Beginner",
      inLanguage: "en",
      timeRequired: "P12W",
      isPartOf: { "@id": `${CANONICAL}#webpage` },
      creator: { "@id": EV_SOCIETY_ID },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Aerospace",
          item: "https://aerospace.ev.engineer/aerospace",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Space",
          item: "https://aerospace.ev.engineer/space",
        },
        { "@type": "ListItem", position: 3, name: "CubeTwin", item: CANONICAL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL}#faq`,
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};
