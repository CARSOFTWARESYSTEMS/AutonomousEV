// Structured-data entity graph for /contact. The ContactPoint fields below
// match, field for field, what is visibly printed on the contact page
// (see src/app/contact/page.tsx): organisation name, email, phone and
// address. No phone number or field is added here that is not already
// intentionally public and printed on this exact page — per the
// AI-discoverability spec's §11 rule, this graph does not invent a new
// business contact channel, it only describes the one already shown.

import { SITE_URL, PUBLIC_CONTACT } from "@/data/public-entities";
import { WEBSITE_ID, ITELEMATICS_ID, websiteNode, itelematicsOrgNode } from "./entities";

const CONTACT_URL = PUBLIC_CONTACT.canonicalUrl;

export interface ContactGraphOptions {
  title: string;
  description: string;
}

export function buildContactGraph({ title, description }: ContactGraphOptions): object[] {
  return [
    websiteNode(),
    itelematicsOrgNode(),
    {
      "@type": "ContactPage",
      "@id": PUBLIC_CONTACT.id,
      url: CONTACT_URL,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ITELEMATICS_ID },
      mainEntity: {
        "@type": "ContactPoint",
        contactType: "general enquiries",
        email: PUBLIC_CONTACT.email,
        telephone: PUBLIC_CONTACT.telephone,
        // Derived directly from the printed address ("...India"), not an
        // independent claim.
        areaServed: "IN",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Contact", item: CONTACT_URL },
        ],
      },
    },
  ];
}
