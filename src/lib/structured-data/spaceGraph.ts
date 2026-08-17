// Structured-data entity graph for /space. Each entity is a distinct,
// truthful node — no shared `sameAs` between them, since `sameAs` claims two
// URLs represent the *same* entity, and these four organisations/brands are
// separate. Relationships are expressed only where they are already stated
// elsewhere on the live site (see /contact, / and /space itself).
//
// The shared entity ids and node shapes (iTelematics, EV.ENGINEER brand, EV
// Society, WebSite) are centralised in ./entities.ts, the single source of
// truth reused by every page's entity graph — see that file's own comment.

import {
  SITE_URL,
  ITELEMATICS_ID,
  EV_ENGINEER_BRAND_ID,
  EV_SOCIETY_ID,
  UFLIGHT_BRAND_ID,
  WEBSITE_ID,
  itelematicsOrgNode,
  evEngineerBrandNode,
  evSocietyOrgNode,
  uflightBrandNode,
  websiteNode,
} from "./entities";

const SPACE_URL = `${SITE_URL}/space`;
const MISSION_ID = `${SPACE_URL}#mission`;
const WEBPAGE_ID = `${SPACE_URL}#webpage`;

export interface SpaceGraphOptions {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  ogImageUrl: string;
  diagramImageUrl: string;
  citationUrls: string[];
}

export function buildSpaceEntityGraph({
  title,
  description,
  datePublished,
  dateModified,
  ogImageUrl,
  diagramImageUrl,
  citationUrls,
}: SpaceGraphOptions): object[] {
  return [
    itelematicsOrgNode(),
    evEngineerBrandNode(),
    evSocietyOrgNode(),
    uflightBrandNode(),
    // Verified on-site: /contact and / both identify iTelematics Software
    // Private Limited as the operator of EV.ENGINEER (see websiteNode()).
    websiteNode(),
    {
      "@type": "ResearchProject",
      "@id": MISSION_ID,
      name: "Autonomous Spacecraft Health Mission 2040",
      url: SPACE_URL,
      description,
      parentOrganization: { "@id": EV_SOCIETY_ID },
      keywords: [
        "autonomous spacecraft health management",
        "spacecraft fault detection isolation and recovery",
        "spacecraft FDIR",
        "spacecraft digital twin",
        "spacecraft telemetry simulator",
        "CubeSat health monitoring",
        "spacecraft prognostics",
        "verified safe recovery",
      ],
      creativeWorkStatus: "Planned",
    },
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: SPACE_URL,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": MISSION_ID },
      // Distinct from the WebSite's publisher: EV Society is the content
      // steward for this specific initiative page (see the "Space · An EV
      // Society initiative" footer line already on this page).
      publisher: { "@id": EV_SOCIETY_ID },
      mentions: [
        { "@id": EV_ENGINEER_BRAND_ID },
        { "@id": UFLIGHT_BRAND_ID },
        { "@id": ITELEMATICS_ID },
      ],
      inLanguage: "en",
      datePublished,
      dateModified,
      citation: citationUrls,
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: ogImageUrl,
        width: 1200,
        height: 630,
      },
      image: [
        { "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 },
        {
          "@type": "ImageObject",
          url: diagramImageUrl,
          width: 1200,
          height: 320,
          caption:
            "Autonomous spacecraft health-management loop from telemetry monitoring through verified safe recovery.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Space",
          item: SPACE_URL,
        },
      ],
    },
  ];
}
