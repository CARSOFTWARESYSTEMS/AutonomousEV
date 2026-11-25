import type { Metadata } from "next";
import { SITE_URL } from "@/data/public-entities";
import { ENVIRONMENTS, FAQ, PRODUCT } from "@/lib/wireless-charging/content";
import { EV_ENGINEER_BRAND_ID, ITELEMATICS_ID, PERSON_ID, TANUJA_JADHAV_ID, WEBSITE_ID, evEngineerBrandNode, itelematicsOrgNode, sudarshanaKarkalaPersonNode, tanujaJadhavPersonNode, websiteNode } from "@/lib/structured-data/entities";

// The site is autonomous.ev.engineer (SITE_URL), like every other /internships route.
export const CANONICAL = `${SITE_URL}${PRODUCT.route}`;
export const TITLE = `${PRODUCT.name} — ${PRODUCT.tagline} | EV.ENGINEER™`;
export const DESCRIPTION =
  "Interactive 3D digital twin for wireless EV charging: stationary, dynamic and autonomous charging and smart energy infrastructure, with physics, mathematics, circuits, IoT, simulation and an 8-month research workshop.";
export const DATE_PUBLISHED = "2026-11-25";
export const LAST_REVIEWED = "2026-11-25";

export const KEYWORDS = [
  "Wireless EV Charging",
  "Inductive Power Transfer",
  "Dynamic Wireless Charging",
  "Electrified Road",
  "Autonomous EV Charging",
  "Digital Twin",
  "Magnetic Coupling",
  "Resonant Compensation",
  "Series-Series Compensation",
  "Battery Management System",
  "Smart Charging Infrastructure",
  "EV.ENGINEER",
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  creator: "EV.ENGINEER™",
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
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const WEBPAGE_ID = `${CANONICAL}#webpage`;
const APP_ID = `${CANONICAL}#twin`;
const BREADCRUMB_ID = `${CANONICAL}#breadcrumb`;
const FAQ_ID = `${CANONICAL}#faq`;

/** A WebPage carrying the WebApplication and its visible FAQ. No offers, ratings or reviews: none are published. */
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    tanujaJadhavPersonNode(),
    sudarshanaKarkalaPersonNode(),
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      datePublished: DATE_PUBLISHED,
      dateModified: LAST_REVIEWED,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": APP_ID },
      mainEntity: { "@id": APP_ID },
      author: { "@id": EV_ENGINEER_BRAND_ID },
      publisher: { "@id": ITELEMATICS_ID },
      breadcrumb: { "@id": BREADCRUMB_ID },
      hasPart: [{ "@id": FAQ_ID }],
    },
    {
      "@type": "WebApplication",
      "@id": APP_ID,
      name: PRODUCT.name,
      description: DESCRIPTION,
      url: CANONICAL,
      applicationCategory: "EngineeringApplication",
      operatingSystem: "Web browser (desktop recommended for the 3D research environment)",
      inLanguage: "en",
      author: { "@id": EV_ENGINEER_BRAND_ID },
      creator: { "@id": EV_ENGINEER_BRAND_ID },
      publisher: { "@id": ITELEMATICS_ID },
      brand: { "@id": EV_ENGINEER_BRAND_ID },
      // The Research & Project Leadership section on the page.
      contributor: [{ "@id": TANUJA_JADHAV_ID }, { "@id": PERSON_ID }],
      featureList: [...ENVIRONMENTS.map((e) => e.name), "Physics & Mathematics Laboratory", "Circuit Laboratory", "IoT & Data Laboratory", "Research Laboratory", "32-week practical workshop", "Engineering assurance and verification"],
      keywords: KEYWORDS.join(", "),
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Internships", item: `${SITE_URL}/internships` },
        { "@type": "ListItem", position: 3, name: PRODUCT.name, item: CANONICAL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": FAQ_ID,
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};
