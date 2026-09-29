import type { Metadata } from "next";
import {
  WEBSITE_ID,
  EV_SOCIETY_ID,
  EV_ENGINEER_BRAND_ID,
  ITELEMATICS_ID,
  PERSON_ID,
  websiteNode,
  evSocietyOrgNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
} from "@/lib/structured-data/entities";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";
import {
  COURSE_NAME,
  COURSE_DESCRIPTION,
  LAST_REVIEWED,
  audiences,
  credential,
  phases,
  readiness,
  teaches,
} from "./programData";

export const CANONICAL = "https://aerospace.ev.engineer/space/satellite-engineering";
export const TITLE = "Satellite Engineering Course | Spacecraft Systems Architecture | EV.ENGINEER";
export const DESCRIPTION =
  "Advanced satellite engineering program covering spacecraft systems architecture, digital twins, CubeSat engineering, mission design, testing and operations.";
export const DATE_PUBLISHED = "2026-09-29";
const OG_IMAGE = `${CANONICAL}/opengraph-image`;
const OG_ALT =
  "Satellite Engineering — From First Principles to Spacecraft Systems Architect · Architecture & Leadership Track · EV.ENGINEER";

export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "satellite engineering",
    "satellite engineering course",
    "satellite engineering training",
    "satellite engineering India",
    "spacecraft systems engineering",
    "satellite systems engineering",
    "spacecraft systems architecture",
    "spacecraft systems architect",
    "space mission engineering",
    "CubeSat engineering",
    "spacecraft digital twin",
  ],
  authors: [{ name: SUDARSHANA_KARKALA.name, url: SUDARSHANA_KARKALA.canonicalUrl }],
  creator: SUDARSHANA_KARKALA.name,
  publisher: "EV Society",
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

const COURSE_ID = `${CANONICAL}#course`;
const WEBPAGE_ID = `${CANONICAL}#webpage`;
const BREADCRUMB_ID = `${CANONICAL}#breadcrumb`;

// Person node limited to name, profile URL and verified profiles; it shares
// the canonical @id so it merges with the full node on the profile page.
const PERSON_NODE = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SUDARSHANA_KARKALA.name,
  url: SUDARSHANA_KARKALA.canonicalUrl,
  sameAs: SUDARSHANA_KARKALA.sameAs,
};

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    websiteNode(),
    // websiteNode() names iTelematics as the WebSite publisher, so its node
    // must be present for that reference to resolve within this graph.
    itelematicsOrgNode(),
    // EV.ENGINEER is the program / technical-education brand and the Course
    // provider (same pattern as /internships/AegisCAN). It stays a Brand node:
    // the entity registry deliberately does not model it as a legal entity.
    evEngineerBrandNode(),
    // EV Society stewards the /space initiative that publishes this page.
    evSocietyOrgNode(),
    PERSON_NODE,
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
      about: { "@id": COURSE_ID },
      mainEntity: { "@id": COURSE_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": EV_SOCIETY_ID },
      mentions: [{ "@id": EV_ENGINEER_BRAND_ID }, { "@id": ITELEMATICS_ID }],
      breadcrumb: { "@id": BREADCRUMB_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630, caption: OG_ALT },
    },
    {
      "@type": "Course",
      "@id": COURSE_ID,
      name: COURSE_NAME,
      alternateName: "Satellite Engineering — Architecture & Leadership Track",
      description: COURSE_DESCRIPTION,
      url: CANONICAL,
      inLanguage: "en",
      provider: { "@id": EV_ENGINEER_BRAND_ID },
      author: { "@id": PERSON_ID },
      educationalLevel: "Advanced / Professional",
      timeRequired: "P12W",
      teaches,
      coursePrerequisites: readiness.map((r) => `${r.area}: ${r.items.join(", ")}`),
      educationalCredentialAwarded: `${credential.primary} — ${credential.track}`,
      audience: {
        "@type": "EducationalAudience",
        audienceType: audiences.map((a) => a.role).join(", "),
      },
      syllabusSections: phases.flatMap((phase) =>
        phase.weeks.map((week) => ({
          "@type": "Syllabus",
          name: `Week ${week.number} · ${week.title}`,
          description: [
            week.focus,
            week.milestones && `Review gates: ${week.milestones.map((m) => m.code).join(", ")}.`,
            week.checkpoint && `Checkpoint: ${week.checkpoint}.`,
          ]
            .filter(Boolean)
            .join(" "),
          timeRequired: "P1W",
        })),
      ),
    },
    {
      "@type": "BreadcrumbList",
      "@id": BREADCRUMB_ID,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Space", item: "https://aerospace.ev.engineer/space" },
        { "@type": "ListItem", position: 2, name: "Satellite Engineering", item: CANONICAL },
      ],
    },
  ],
};
