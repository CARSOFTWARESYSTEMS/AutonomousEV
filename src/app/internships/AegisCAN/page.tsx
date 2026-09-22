import type { Metadata } from "next";
import AegisCANContent from "./AegisCANContent";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { AEGISCAN_FAQ } from "./faq";
import {
  SITE_URL,
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
  sudarshanaKarkalaPersonNode,
  tanujaJadhavPersonNode,
  bhavyaKshatriPersonNode,
  roleNode,
  PERSON_ID,
  TANUJA_JADHAV_ID,
  BHAVYA_KSHATRI_ID,
} from "@/lib/structured-data/entities";

const PAGE_URL = `${SITE_URL}/internships/AegisCAN`;
const PAGE_TITLE = "AegisCAN — CAN Cybersecurity for EV, BMS & BESS | EV.ENGINEER™";
const PAGE_DESCRIPTION =
  "AegisCAN is a 12-week E&C/EEE engineering research project covering Battery, BMS, BESS, CAN communication, validation, fault injection and cybersecurity.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "AegisCAN",
    "CAN cybersecurity student project",
    "BMS internship",
    "BESS internship",
    "CAN bus intrusion detection",
    "battery management system project",
    "automotive cybersecurity student project",
    "CAN anomaly detection",
    "embedded cybersecurity internship",
    "EV.ENGINEER",
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
    tanujaJadhavPersonNode(),
    bhavyaKshatriPersonNode(),
    sudarshanaKarkalaPersonNode(),
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
          { "@type": "ListItem", position: 3, name: "AegisCAN", item: PAGE_URL },
        ],
      },
    },
    {
      // AegisCAN's primary project representation. Course extends
      // schema.org's CreativeWork, so `creator`/`contributor` (each wrapped
      // in a Role to carry the approved project-specific role name) is
      // valid here without inventing non-standard properties.
      "@type": "Course",
      "@id": `${PAGE_URL}#course`,
      name: "AegisCAN — Intelligent CAN Cybersecurity for EV, BMS, BESS, Aerospace & UAV Systems",
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      provider: { "@id": EV_ENGINEER_BRAND_ID },
      creator: roleNode("creator", TANUJA_JADHAV_ID, "Lead Researcher · EV.ENGINEER™"),
      contributor: [
        roleNode("contributor", BHAVYA_KSHATRI_ID, "Cybersecurity Researcher · EV.ENGINEER™"),
        roleNode("contributor", PERSON_ID, "Co-Researcher · EV.ENGINEER™"),
      ],
      inLanguage: "en-US",
      educationalLevel: "Beginner (5th-semester undergraduate)",
      teaches: [
        "Battery Fundamentals",
        "BMS Architecture",
        "BESS Architecture",
        "CAN Communication",
        "CAN Data Acquisition & Logging",
        "Fault Injection",
        "Embedded Cybersecurity",
        "Anomaly Detection",
        "Validation Engineering",
        "Root Cause Analysis",
      ],
      courseCode: "AEGISCAN-001",
      timeRequired: "P12W",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en-US",
        startDate: "2026-09-21",
        endDate: "2026-12-21",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: AEGISCAN_FAQ.map((item) => ({
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

export default function AegisCANPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <JsonLd data={jsonLd} />
      <AegisCANContent />
    </div>
  );
}
