/**
 * Shared JSON-LD node builders for the site's entity graph. Each function
 * returns a plain object node with a stable `@id`, sourced from the
 * verified registry in `src/data/public-entities.ts` — the single source
 * of truth for names, legal names and canonical URLs.
 *
 * Import these builders (and the `@id` constants) from any page that needs
 * to reference one of these shared entities, instead of re-typing the
 * fields inline. That keeps every graph on the site pointing at the same
 * node for the same entity, per the "one stable @id per entity, reuse
 * across pages" rule.
 */

import {
  EV_ENGINEER,
  ITELEMATICS,
  EV_SOCIETY,
  SUDARSHANA_KARKALA,
  TANUJA_JADHAV,
  BHAVYA_KSHATRI,
  SITE_URL,
} from "@/data/public-entities";

export { SITE_URL };

export const WEBSITE_ID = `${SITE_URL}/#website`;
export const EV_ENGINEER_BRAND_ID = EV_ENGINEER.id;
export const ITELEMATICS_ID = ITELEMATICS.id;
export const EV_SOCIETY_ID = EV_SOCIETY.id;
export const PERSON_ID = SUDARSHANA_KARKALA.id;
export const TANUJA_JADHAV_ID = TANUJA_JADHAV.id;
export const BHAVYA_KSHATRI_ID = BHAVYA_KSHATRI.id;
// Not sourced from public-entities.ts (UFlight is referenced only in the
// /space graph as a distinct external brand, not modelled as a full entity
// with verified contact facts), but kept here so every page importing
// entity ids has one place to look.
export const UFLIGHT_BRAND_ID = "https://www.uflight.in/#brand";

export function evEngineerBrandNode() {
  return {
    "@type": "Brand",
    "@id": EV_ENGINEER_BRAND_ID,
    name: EV_ENGINEER.name,
    url: EV_ENGINEER.canonicalUrl,
    description: EV_ENGINEER.description,
  };
}

export function itelematicsOrgNode() {
  return {
    "@type": "Organization",
    "@id": ITELEMATICS_ID,
    name: ITELEMATICS.name,
    legalName: ITELEMATICS.legalName,
    url: ITELEMATICS.canonicalUrl,
  };
}

export function evSocietyOrgNode() {
  return {
    "@type": "Organization",
    "@id": EV_SOCIETY_ID,
    name: EV_SOCIETY.name,
    url: EV_SOCIETY.canonicalUrl,
  };
}

export function uflightBrandNode() {
  return {
    "@type": "Brand",
    "@id": UFLIGHT_BRAND_ID,
    name: "UFlight",
    url: "https://www.uflight.in/",
  };
}

export function sudarshanaKarkalaPersonNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SUDARSHANA_KARKALA.name,
    url: SUDARSHANA_KARKALA.canonicalUrl,
    description: SUDARSHANA_KARKALA.description,
    sameAs: SUDARSHANA_KARKALA.sameAs,
    affiliation: { "@id": EV_ENGINEER_BRAND_ID },
  };
}

export function tanujaJadhavPersonNode() {
  return {
    "@type": "Person",
    "@id": TANUJA_JADHAV_ID,
    name: TANUJA_JADHAV.name,
    url: TANUJA_JADHAV.canonicalUrl,
    description: TANUJA_JADHAV.description,
    sameAs: TANUJA_JADHAV.sameAs,
    affiliation: { "@id": EV_ENGINEER_BRAND_ID },
  };
}

export function bhavyaKshatriPersonNode() {
  return {
    "@type": "Person",
    "@id": BHAVYA_KSHATRI_ID,
    name: BHAVYA_KSHATRI.name,
    url: BHAVYA_KSHATRI.canonicalUrl,
    description: BHAVYA_KSHATRI.description,
    sameAs: BHAVYA_KSHATRI.sameAs,
    affiliation: { "@id": EV_ENGINEER_BRAND_ID },
  };
}

/**
 * Wraps a Person `@id` reference in a Schema.org `Role`, so a property like
 * `creator` or `contributor` can carry a project-specific role name without
 * inventing a non-standard property (e.g. a made-up `leadResearcher` field).
 * `property` is the same property name the Role is nested under (`creator`,
 * `contributor`, …) — the documented Schema.org pattern for "this agent held
 * this role on this work". See https://schema.org/Role.
 */
export function roleNode(property: "creator" | "contributor", personId: string, roleName: string) {
  return {
    "@type": "Role",
    roleName,
    [property]: { "@id": personId },
  };
}

/**
 * The site's WebSite node. `publisher` points at iTelematics Software
 * Private Limited — verified on-site via /contact and the home page, which
 * both identify it as the operator of EV.ENGINEER.
 */
export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: EV_ENGINEER.name,
    url: EV_ENGINEER.canonicalUrl,
    brand: { "@id": EV_ENGINEER_BRAND_ID },
    publisher: { "@id": ITELEMATICS_ID },
  };
}
