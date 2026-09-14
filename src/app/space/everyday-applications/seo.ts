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
import { QUESTIONS } from "./applicationsData";

export const CANONICAL = "https://aerospace.ev.engineer/space/everyday-applications";
export const TITLE = "Space Applications for Everyday India | EV Society, UFlight & EV.ENGINEER";
export const DESCRIPTION =
  "How satellites and space technology already help everyday life in India — weather, navigation, agriculture, fisheries, disaster response, connectivity, healthcare and education — explained without jargon.";
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
        alt: "Space Applications for Everyday India — an interactive learning experience · EV.ENGINEER",
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
      educationalLevel: ["Beginner", "General Public"],
      about: "Space applications and satellite technology in everyday Indian life",
      keywords: [
        "space applications India",
        "satellite applications India",
        "space technology everyday life",
        "NavIC applications",
        "satellite agriculture India",
        "satellite disaster management",
        "satellite communications",
        "space technology careers",
        "space startups India",
        "Earth observation applications",
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
        { "@type": "ListItem", position: 3, name: "Space Applications for Everyday India", item: CANONICAL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL}#faq`,
      mainEntity: QUESTIONS.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${q.howSpaceHelps} ${q.whatYouReceive}`,
        },
      })),
    },
  ],
};
