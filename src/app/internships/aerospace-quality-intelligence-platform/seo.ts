import type { Metadata } from "next";
import { SITE_URL } from "@/data/public-entities";
import {
  EV_ENGINEER_BRAND_ID,
  EV_SOCIETY_ID,
  ITELEMATICS_ID,
  PERSON_ID,
  WEBSITE_ID,
  evEngineerBrandNode,
  evSocietyOrgNode,
  itelematicsOrgNode,
  sudarshanaKarkalaPersonNode,
  websiteNode,
} from "@/lib/structured-data/entities";
import { AQIP } from "@/components/aqip/data/overview";
import { FAQ, GLOSSARY, NAV } from "@/components/aqip/data/reference";

export const CANONICAL = `${SITE_URL}${AQIP.route}`;
export const TITLE = "AQIP — Aerospace Quality Intelligence Platform | EV.ENGINEER™";
export const DESCRIPTION =
  "A comprehensive strategy and engineering platform for aerospace and defence manufacturing quality intelligence — digital inspection, FAI, traceability, configuration control, supplier quality and trusted manufacturing evidence.";
export const OG_TITLE = `${AQIP.short} — ${AQIP.name}`;
export const OG_ALT = `${AQIP.short}, the ${AQIP.name}: ${AQIP.tagline}. EV.ENGINEER.`;
export const LAST_REVIEWED: string = AQIP.reviewed;
const OG_IMAGE = `${CANONICAL}/opengraph-image`;

/** The concepts the page is about, also used as its keywords. */
export const KEYWORDS = [
  "Aerospace Quality Intelligence Platform",
  "AQIP",
  "Aerospace Quality Management",
  "Defence Manufacturing MSME",
  "Aerospace Manufacturing Quality",
  "AS9102 FAI",
  "First Article Inspection",
  "Aerospace Inspection Software",
  "Engineering Drawing Intelligence",
  "GD&T Automation",
  "Aerospace Traceability",
  "Supplier Quality Management",
  "Aerospace Digital Thread",
  "Manufacturing Quality Evidence",
  "Aerospace Quality AI",
  "Defence Manufacturing Quality",
  "Aerospace MSME India",
  "3D Inspection Twin",
  "2D to 3D Engineering Drawing Reconstruction",
  "Aerospace Manufacturing Cybersecurity",
  "AI Assurance",
  "Human-in-the-Loop AI",
  "Secure Engineering Data",
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [...KEYWORDS],
  authors: [{ name: "Sudarshana Karkala", url: `${SITE_URL}/about/sudarshana-karkala` }],
  creator: "Sudarshana Karkala",
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
    type: "article",
    locale: "en_US",
    siteName: "EV.ENGINEER",
    modifiedTime: LAST_REVIEWED,
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
const ARTICLE_ID = `${CANONICAL}#article`;
const BREADCRUMB_ID = `${CANONICAL}#breadcrumb`;
const FAQ_ID = `${CANONICAL}#faq`;
const GLOSSARY_ID = `${CANONICAL}#glossary`;

/**
 * The page is described as a WebPage carrying a TechArticle, with its visible
 * FAQ and glossary. AQIP is not described as a SoftwareApplication: it is not a
 * released product, so there is nothing to offer, rate or review.
 */
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    // websiteNode() references the brand and its publisher, so both must be in this graph.
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    evSocietyOrgNode(),
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
      about: { "@id": ARTICLE_ID },
      mainEntity: { "@id": ARTICLE_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }, { "@id": EV_SOCIETY_ID }],
      breadcrumb: { "@id": BREADCRUMB_ID },
      hasPart: [{ "@id": FAQ_ID }, { "@id": GLOSSARY_ID }],
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "TechArticle",
      "@id": ARTICLE_ID,
      headline: `${AQIP.short} — ${AQIP.name}: strategy and operating manual`,
      name: `${AQIP.short} — ${AQIP.name}`,
      alternateName: AQIP.short,
      description: DESCRIPTION,
      url: CANONICAL,
      inLanguage: "en",
      dateModified: LAST_REVIEWED,
      author: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntityOfPage: { "@id": WEBPAGE_ID },
      keywords: KEYWORDS.join(", "),
      about: KEYWORDS.map((name) => ({ "@type": "Thing", name })),
      articleSection: NAV.map((item) => item.label),
      abstract: AQIP.narrative,
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
        { "@type": "ListItem", position: 3, name: AQIP.name, item: CANONICAL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": FAQ_ID,
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
    {
      "@type": "DefinedTermSet",
      "@id": GLOSSARY_ID,
      name: `${AQIP.short} glossary`,
      isPartOf: { "@id": WEBPAGE_ID },
      hasDefinedTerm: GLOSSARY.map((item) => ({ "@type": "DefinedTerm", name: item.term, description: item.definition })),
    },
  ],
};
