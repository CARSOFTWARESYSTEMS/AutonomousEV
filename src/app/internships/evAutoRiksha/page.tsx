import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import {
  SITE_URL,
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  PERSON_ID,
  SHILAJIT_DAS_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
  sudarshanaKarkalaPersonNode,
  shilajitDasPersonNode,
  roleNode,
} from "@/lib/structured-data/entities";
import EvAutoRikshaContent from "./EvAutoRikshaContent";
import { EV_AUTO_RIKSHA_FAQ } from "./faq";

const PAGE_URL = `${SITE_URL}/internships/evAutoRiksha`;
const PAGE_TITLE = "Electric Auto Rickshaw Design Simulator | D+6 EV Engineering & Cost Model | EV.ENGINEER™";
const PAGE_DESCRIPTION =
  "Configure and simulate a D+6 electric auto rickshaw for Indian Tier-2 and Tier-3 cities. Explore battery sizing, BMS, motor, charging, range, cost, TCO, maintenance, fleet charging and business models.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "electric auto rickshaw design",
    "electric three wheeler India",
    "passenger electric three wheeler",
    "D+6 electric auto",
    "EV auto rickshaw battery",
    "EV three wheeler battery",
    "electric auto BMS",
    "electric three wheeler motor",
    "EV auto charging",
    "battery swapping three wheeler",
    "EV auto cost",
    "electric auto TCO",
    "electric rickshaw simulator",
    "EV design simulator",
    "Tier 2 electric mobility India",
    "Tier 3 electric mobility India",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: "article",
    siteName: "EV.ENGINEER",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    sudarshanaKarkalaPersonNode(),
    shilajitDasPersonNode(),
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      inLanguage: "en-US",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": EV_ENGINEER_BRAND_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
          { "@type": "ListItem", position: 3, name: "EV Auto Rickshaw", item: PAGE_URL },
        ],
      },
    },
    {
      // A concept-stage engineering + business R&D program page, represented
      // as a TechArticle (extends CreativeWork) rather than Product/Vehicle —
      // this is explicitly a simulator and research write-up, not a
      // commercial offer, and no production vehicle exists to describe.
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#techarticle`,
      headline: "EV Auto Rickshaw — D+6 Electric Three-Wheeler Engineering & Cost Simulator",
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      publisher: { "@id": EV_ENGINEER_BRAND_ID },
      creator: roleNode("creator", PERSON_ID, "EV.ENGINEER™"),
      contributor: roleNode("contributor", SHILAJIT_DAS_ID, "Battery Degradation Researcher · NITK Surathkal"),
      inLanguage: "en-US",
      dateModified: "2026-09-22",
      about: [
        "Electric auto rickshaw engineering",
        "D+6 passenger electric three-wheeler",
        "EV battery sizing and BMS",
        "EV motor and powertrain sizing",
        "EV charging and battery swapping",
        "Electric three-wheeler cost and TCO modelling",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: EV_AUTO_RIKSHA_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function EvAutoRikshaPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <JsonLd data={jsonLd} />
      <EvAutoRikshaContent />
    </div>
  );
}
