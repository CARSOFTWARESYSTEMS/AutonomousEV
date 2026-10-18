import type { Metadata } from "next";
import { SITE_URL } from "@/data/public-entities";
import { ANSWERS, FAQ, KEYWORDS, TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { EV_ENGINEER_BRAND_ID, ITELEMATICS_ID, PERSON_ID, WEBSITE_ID, evEngineerBrandNode, itelematicsOrgNode, sudarshanaKarkalaPersonNode, websiteNode } from "@/lib/structured-data/entities";

export const CANONICAL = `https://aerospace.ev.engineer${TOOLKIT.route}`;
export const TITLE = "EV Battery Health & Diagnostics Toolkit — 3D Battery Repair & BMS Diagnostics | EV.ENGINEER™";
export const DESCRIPTION =
  "Interactive 3D EV battery diagnostics toolkit for electric-scooter technicians. Explore battery packs, BMS, cells, SOC, SOH, thermal behaviour, faults and guided repair workflows.";
export const OG_ALT = `${TOOLKIT.name} — ${TOOLKIT.subtitle}`;
export const DATE_PUBLISHED = "2026-10-18";
const OG_IMAGE = `${CANONICAL}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
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
const APP_ID = `${CANONICAL}#toolkit`;
const BREADCRUMB_ID = `${CANONICAL}#breadcrumb`;
const FAQ_ID = `${CANONICAL}#faq`;
const TERMS_ID = `${CANONICAL}#answers`;

/**
 * A WebPage carrying a WebApplication (the interactive toolkit), its visible
 * FAQ and its short answers. No offers, ratings or reviews: none are published.
 */
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
      datePublished: DATE_PUBLISHED,
      dateModified: TOOLKIT.reviewed,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": APP_ID },
      mainEntity: { "@id": APP_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      breadcrumb: { "@id": BREADCRUMB_ID },
      hasPart: [{ "@id": FAQ_ID }, { "@id": TERMS_ID }],
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "WebApplication",
      "@id": APP_ID,
      name: TOOLKIT.name,
      alternateName: TOOLKIT.shortName,
      description: DESCRIPTION,
      url: CANONICAL,
      applicationCategory: "EngineeringApplication",
      operatingSystem: "Web browser (laptop or desktop recommended for the 3D workspace)",
      inLanguage: "en",
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      publisher: { "@id": ITELEMATICS_ID },
      brand: { "@id": EV_ENGINEER_BRAND_ID },
      audience: { "@type": "Audience", audienceType: "Electric-scooter battery technicians, service workshops and scooter owners" },
      featureList: [
        "Owner Mode and Technician Mode",
        "Vehicle battery locator",
        "Fixed, swappable and serviceable battery architectures",
        "3D battery explorer with x-ray, exploded, thermal, cell-voltage, current-flow and BMS views",
        "BMS digital twin",
        "Battery fault injection",
        "Real vehicle diagnosis with evidence gate",
        "Repair decision and post-repair verification",
        "Battery diagnostic report",
      ],
      keywords: KEYWORDS.join(", "),
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
        { "@type": "ListItem", position: 3, name: TOOLKIT.shortName, item: CANONICAL },
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
      "@id": TERMS_ID,
      name: `${TOOLKIT.shortName} — in brief`,
      isPartOf: { "@id": WEBPAGE_ID },
      hasDefinedTerm: ANSWERS.map((item) => ({ "@type": "DefinedTerm", name: item.q, description: item.a })),
    },
  ],
};
