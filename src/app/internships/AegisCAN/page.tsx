import type { Metadata } from "next";
import AegisCANContent from "./AegisCANContent";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import {
  SITE_URL,
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
} from "@/lib/structured-data/entities";

const PAGE_URL = `${SITE_URL}/internships/AegisCAN`;
const PAGE_TITLE = "AegisCAN | CAN Cybersecurity, BMS & BESS Student Project | EV.ENGINEER™";
const PAGE_DESCRIPTION =
  "12-week E&C/EEE engineering project covering Battery, BMS, BESS, CAN communication, validation, fault injection, cybersecurity, Python and anomaly detection.";

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
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const FAQ_ENTRIES = [
  {
    question: "What is AegisCAN?",
    answer:
      "AegisCAN is a 12-week educational R&D mini-project for 5th-semester E&C/ECE/EEE/EE students. Students build a simulation-based CAN monitoring and anomaly-detection prototype while learning Battery, BMS, BESS, CAN communication, validation engineering and embedded cybersecurity fundamentals.",
  },
  {
    question: "Is AegisCAN a production cybersecurity product?",
    answer:
      "No. AegisCAN is an educational and research prototype — not a production BMS, commercial intrusion-detection system, certified automotive cybersecurity product, flight-qualified aerospace system or safety-certified BESS controller. All exercises run in controlled simulation/lab environments.",
  },
  {
    question: "Do students need physical CAN hardware or a real battery pack?",
    answer:
      "No. The project is simulation-first — no high-voltage battery/BESS setup and no mandatory CAN hardware are required to complete the 12 weeks. A basic Python environment is enough.",
  },
  {
    question: "Is AI/ML required for AegisCAN?",
    answer:
      "No. Rule-based and statistical anomaly detection are mandatory. Machine learning (Week 10) and the PyBaMM battery-modelling track are both explicitly optional advanced exercises.",
  },
  {
    question: "How much time does AegisCAN take per week?",
    answer:
      "The project is scoped for roughly 4–6 hours per student per week alongside regular semester subjects, over 12 weeks from 21 September 2026 to 21 December 2026.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
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
      "@type": "Course",
      "@id": `${PAGE_URL}#course`,
      name: "AegisCAN — Intelligent CAN Cybersecurity for EV, BMS, BESS, Aerospace & UAV Systems",
      description: PAGE_DESCRIPTION,
      url: PAGE_URL,
      provider: { "@id": EV_ENGINEER_BRAND_ID },
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
      mainEntity: FAQ_ENTRIES.map((item) => ({
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
