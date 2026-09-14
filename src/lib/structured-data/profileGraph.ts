// Structured-data entity graph for /about/sudarshana-karkala — Sudarshana
// Karkala's single canonical public profile page. Uses ProfilePage with
// Person as mainEntity, per the AI-discoverability spec's §8 requirements.
//
// Only verified-public fields are included: no email address, no private
// contact data. The phone number and LinkedIn profile reused here are the
// same values already published on his behalf across multiple existing
// pages in this repo (si-ems, battery-fire-prevention, battery-pack-design,
// the rocketry page's author block) and are now also visibly printed on
// this profile page itself (see FounderContent.tsx's "Contact &
// Collaboration" section) — see src/data/public-entities.ts for the
// verification trail.

import { SUDARSHANA_KARKALA, SITE_URL } from "@/data/public-entities";
import {
  PERSON_ID,
  ITELEMATICS_ID,
  EV_ENGINEER_BRAND_ID,
  WEBSITE_ID,
  itelematicsOrgNode,
  evEngineerBrandNode,
  websiteNode,
} from "./entities";

const PROFILE_URL = SUDARSHANA_KARKALA.canonicalUrl;
const PROFILE_PAGE_ID = `${PROFILE_URL}#profilepage`;

export interface ProfileGraphOptions {
  title: string;
  description: string;
  dateModified: string;
}

export function buildProfileGraph({ title, description, dateModified }: ProfileGraphOptions): object[] {
  return [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SUDARSHANA_KARKALA.name,
      url: PROFILE_URL,
      image: SUDARSHANA_KARKALA.imageUrl,
      description: SUDARSHANA_KARKALA.description,
      jobTitle: "Founder",
      // Verified: FounderContent.tsx states he is founder of the
      // EV.ENGINEER platform/brand and a Consultant at iTelematics.
      worksFor: { "@id": EV_ENGINEER_BRAND_ID },
      affiliation: [{ "@id": ITELEMATICS_ID }],
      knowsAbout: SUDARSHANA_KARKALA.knowsAbout,
      sameAs: SUDARSHANA_KARKALA.sameAs,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "consulting inquiries",
        telephone: SUDARSHANA_KARKALA.publicTelephone,
      },
    },
    {
      "@type": "ProfilePage",
      "@id": PROFILE_PAGE_ID,
      url: PROFILE_URL,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
      dateModified,
      inLanguage: "en",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
          { "@type": "ListItem", position: 3, name: "Sudarshana Karkala", item: PROFILE_URL },
        ],
      },
    },
  ];
}
