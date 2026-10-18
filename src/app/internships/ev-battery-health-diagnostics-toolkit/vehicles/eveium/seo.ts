import type { Metadata } from "next";
import { SITE_URL } from "@/data/public-entities";
import { TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { EVEIUM_FAQ } from "@/components/ev-battery-toolkit/eveium/faq";
import { ITELEMATICS_ID, PERSON_ID, WEBSITE_ID, evEngineerBrandNode, itelematicsOrgNode, sudarshanaKarkalaPersonNode, websiteNode } from "@/lib/structured-data/entities";

export const CANONICAL = `${SITE_URL}${TOOLKIT.route}/vehicles/eveium`;
export const TITLE = "EVeium Battery Diagnostics — Cosmo, Comet & Czar 72V Battery | EV.ENGINEER™";
export const DESCRIPTION =
  "Real-vehicle battery diagnosis for EVeium Cosmo, Comet and Czar: published 72 V lithium-ion specifications with sources, safety screen, measured evidence, BMS data, evidence-gated repair decisions and reports.";
const OG_IMAGE = `${SITE_URL}${TOOLKIT.route}/opengraph-image`;

export const KEYWORDS = [
  "EVeium battery diagnostics",
  "EVeium Cosmo battery",
  "EVeium Comet battery",
  "EVeium Czar battery",
  "72V EV scooter battery diagnostics",
  "72V lithium-ion scooter battery",
  "EV scooter not charging",
  "EV scooter battery range loss",
  "72V BMS diagnostics",
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, url: CANONICAL, type: "website", siteName: "EV.ENGINEER", images: [{ url: OG_IMAGE, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const WEBPAGE_ID = `${CANONICAL}#webpage`;
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
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
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      dateModified: "2026-10-18",
      breadcrumb: { "@id": `${CANONICAL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
        { "@type": "ListItem", position: 3, name: TOOLKIT.shortName, item: `${SITE_URL}${TOOLKIT.route}` },
        { "@type": "ListItem", position: 4, name: "EVeium", item: CANONICAL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL}#faq`,
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntity: EVEIUM_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};
