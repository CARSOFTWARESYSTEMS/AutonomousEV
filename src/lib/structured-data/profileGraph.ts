// Structured-data entity graph for /about/sudarshana-karkala — Sudarshana
// Karkala's single canonical public profile page. Uses ProfilePage with
// Person as mainEntity, per the AI-discoverability spec's §8 requirements.
//
// Only verified-public fields are included: no email address, no private
// contact data. The phone number and LinkedIn profile reused here are the
// same values already published on his behalf across multiple existing
// pages in this repo (si-ems, battery-fire-prevention, battery-pack-design,
// the rocketry page's author block) and are also visibly printed on this
// profile page itself (see ProfileContent.tsx's "Contact / Consultation"
// section) — see src/data/public-entities.ts for the verification trail.
//
// The graph says what the page says, and nothing the page does not:
//   - ISHAVASYAM.ORG: he is its Founder. Said on the organisation (`founder`)
//     and in his `jobTitle` and `affiliation`.
//   - iTelematics Software Private Limited: one of five consulting
//     engagements on the page, and the publisher of the website. Its node is
//     here as the publisher. He is given no job title, affiliation or
//     employment there: a consulting engagement is none of those.
//   - EV.ENGINEER: the engineering identity of him, his team and their
//     projects. A `brand` he maintains, never an employer and never a founder
//     title.
//   - EV Society and the NITK Surathkal Alumni Association: the
//     communities of Professional & Community Leadership. `memberOf`, each
//     through an OrganizationRole naming his role as the page writes it, and
//     never `worksFor` or `affiliation`. The Alumni Association has no
//     address on record, so it is an inline node with no @id or URL.
//   - CAR SOFTWARE SYSTEMS: an initiative the page lists. Named on the page
//     node (`mentions`) and given no relationship the page does not state.
//   - Thasmai InfoTech Private Limited and Gamyaa AeroSystems are rows of the
//     visible career, and are not modelled here: see docs/ai-discoverability.md.
//     Nor are the former employers, the consulting organisations or the
//     institutions of the academic engagement.

import { ISHAVASYAM, SUDARSHANA_KARKALA, SITE_URL } from "@/data/public-entities";
import {
  PERSON_ID,
  ISHAVASYAM_ID,
  EV_ENGINEER_BRAND_ID,
  EV_SOCIETY_ID,
  WEBSITE_ID,
  itelematicsOrgNode,
  ishavasyamOrgNode,
  evEngineerBrandNode,
  evSocietyOrgNode,
  websiteNode,
} from "./entities";

const PROFILE_URL = SUDARSHANA_KARKALA.canonicalUrl;
const PROFILE_PAGE_ID = `${PROFILE_URL}#profilepage`;
/** The address is the one the profile and the internships page already link to. */
export const CAR_SOFTWARE_SYSTEMS_ID = "https://carsoftwaresystems.com/#organization";

/** His role, as the hero writes it. */
export const PROFILE_JOB_TITLE = `Founder, ${ISHAVASYAM.name}`;

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
    evSocietyOrgNode(),
    // Stated on this page only, where the Person node it points to is in the same graph.
    { ...ishavasyamOrgNode(), founder: { "@id": PERSON_ID } },
    {
      "@type": "Organization",
      "@id": CAR_SOFTWARE_SYSTEMS_ID,
      name: "CAR SOFTWARE SYSTEMS",
      url: "https://carsoftwaresystems.com/",
      description: "Electric Vehicle Engineering and Agentic AI Development.",
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SUDARSHANA_KARKALA.name,
      url: PROFILE_URL,
      image: SUDARSHANA_KARKALA.imageUrl,
      description: SUDARSHANA_KARKALA.description,
      jobTitle: PROFILE_JOB_TITLE,
      brand: { "@id": EV_ENGINEER_BRAND_ID },
      affiliation: { "@id": ISHAVASYAM_ID },
      memberOf: [
        {
          "@type": "OrganizationRole",
          roleName: "Core Team Member, NITKSAA Alumni Digital Ecosystem",
          memberOf: {
            "@type": "Organization",
            name: "NITK Surathkal Alumni Association",
            alternateName: "NITKSAA",
            description: "The alumni association of the National Institute of Technology Karnataka, Surathkal.",
          },
        },
        { "@type": "OrganizationRole", roleName: "Founding Member", memberOf: { "@id": EV_SOCIETY_ID } },
      ],
      // NITK Surathkal is his degree-granting alma mater (B.E. Information
      // Technology). Deliberately NOT modelled as a full node with its own
      // @id since this site has no verified canonical URL for NITK; an
      // inline Organization avoids fabricating one. IIT Madras (CODE) is a
      // certification program, not a degree, so it is intentionally left
      // out of alumniOf — see ProfileContent.tsx's Education section.
      alumniOf: { "@type": "CollegeOrUniversity", name: "National Institute of Technology Karnataka, Surathkal" },
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
      mentions: [{ "@id": CAR_SOFTWARE_SYSTEMS_ID }],
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
