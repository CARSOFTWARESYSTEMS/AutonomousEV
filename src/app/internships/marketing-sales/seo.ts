import type { Metadata } from "next";
import { SITE_URL } from "@/data/public-entities";
import { EV_ENGINEER_BRAND_ID, ITELEMATICS_ID, WEBSITE_ID, evEngineerBrandNode, itelematicsOrgNode, websiteNode } from "@/lib/structured-data/entities";
import { CASE_STUDY, FRAMEWORK } from "@/components/revenue/data/framework";

export const CANONICAL = `${SITE_URL}${FRAMEWORK.route}`;
export const TITLE = "B2B Revenue Engineering for Aerospace & Defence MSMEs | Marketing & Sales Framework | EV.ENGINEER™";
export const DESCRIPTION =
  "A practical 12-week B2B marketing, customer discovery and consultative sales framework using a live AS9102 FAI software case study for Bengaluru aerospace and defence MSMEs.";
export const OG_TITLE = `${FRAMEWORK.name} — Marketing & Sales for Aerospace & Defence MSMEs`;
export const OG_ALT = `${FRAMEWORK.name}: ${FRAMEWORK.headline}. Live case study: ${CASE_STUDY.title}. EV.ENGINEER.`;
const OG_IMAGE = `${CANONICAL}/opengraph-image`;

/** What the page is about. Used as keywords and as the WebPage's topics. */
export const KEYWORDS = [
  "B2B Marketing",
  "B2B Sales",
  "Aerospace Sales",
  "Defence MSME",
  "Aerospace MSME",
  "Bengaluru Aerospace",
  "Bangalore Aerospace",
  "Customer Discovery",
  "Consultative Sales",
  "Business Model Canvas",
  "Go-To-Market",
  "Sales Pipeline",
  "Revenue Engineering",
  "AS9102",
  "First Article Inspection",
  "FAI",
  "Balloon Drawing",
  "Aerospace Quality",
  "Marketing and Sales Internship",
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [...KEYWORDS],
  publisher: "iTelematics Software Private Limited",
  alternates: { canonical: CANONICAL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: OG_TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    locale: "en_IN",
    siteName: "EV.ENGINEER",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: OG_ALT }],
  },
};

const WEBPAGE_ID = `${CANONICAL}#webpage`;
const BREADCRUMB_ID = `${CANONICAL}#breadcrumb`;

/**
 * A WebPage with its breadcrumb and topics. The framework is not marked up
 * as a Course or a job posting: there is no fee, schedule or vacancy on the
 * page to describe, and no affiliation with SAE or any OEM is implied.
 */
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    // websiteNode() references the brand and its publisher, so both must be in this graph.
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      dateModified: FRAMEWORK.reviewed,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ITELEMATICS_ID },
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }],
      about: KEYWORDS.map((name) => ({ "@type": "Thing", name })),
      breadcrumb: { "@id": BREADCRUMB_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
        { "@type": "ListItem", position: 3, name: FRAMEWORK.name, item: CANONICAL },
      ],
    },
  ],
};
