import type { Metadata } from "next";
import {
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  EV_SOCIETY_ID,
  ITELEMATICS_ID,
  UFLIGHT_BRAND_ID,
  PERSON_ID,
  evSocietyOrgNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
  uflightBrandNode,
  websiteNode,
} from "@/lib/structured-data/entities";

export const CANONICAL = "https://aerospace.ev.engineer/space/model-rocketry";
export const TITLE = "Model Rocketry: Beginner to Advanced Aerospace Learning | EV.ENGINEER";
export const DESCRIPTION =
  "An interactive Model Rocketry learning experience covering rocket systems, aerodynamics, avionics, recovery, propulsion safety, OpenRocket simulation, FMEA, student competitions and aerospace careers.";
export const LAST_REVIEWED = "2026-09-14";

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
        alt: "Model Rocketry — an interactive aerospace learning experience · EV.ENGINEER",
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
    websiteNode(),
    evSocietyOrgNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    uflightBrandNode(),
    {
      "@type": ["WebPage", "LearningResource"],
      "@id": `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      dateModified: LAST_REVIEWED,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": EV_SOCIETY_ID },
      learningResourceType: ["Interactive Resource", "Reference"],
      educationalLevel: ["Beginner", "Intermediate", "Advanced"],
      about: "Model rocketry and aerospace systems engineering",
      keywords: [
        "model rocketry",
        "aerospace engineering",
        "rocket systems engineering",
        "aerodynamics",
        "rocket avionics",
        "rocket recovery systems",
        "OpenRocket simulation",
        "student rocketry competitions",
        "FMEA",
        "aerospace careers",
      ],
      mentions: [
        { "@id": PERSON_ID },
        { "@id": EV_ENGINEER_BRAND_ID },
        { "@id": ITELEMATICS_ID },
        { "@id": UFLIGHT_BRAND_ID },
      ],
      breadcrumb: { "@id": `${CANONICAL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Space", item: "https://aerospace.ev.engineer/space" },
        { "@type": "ListItem", position: 2, name: "Simulations & R&D Projects", item: "https://aerospace.ev.engineer/space#simulations" },
        { "@type": "ListItem", position: 3, name: "Model Rocketry", item: CANONICAL },
      ],
    },
  ],
};
