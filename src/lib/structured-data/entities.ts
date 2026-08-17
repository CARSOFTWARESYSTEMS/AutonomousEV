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
  THASMAI_INFOTECH,
  SUDARSHANA_KARKALA,
  SITE_URL,
} from "@/data/public-entities";

export { SITE_URL };

export const WEBSITE_ID = `${SITE_URL}/#website`;
export const EV_ENGINEER_BRAND_ID = EV_ENGINEER.id;
export const ITELEMATICS_ID = ITELEMATICS.id;
export const EV_SOCIETY_ID = EV_SOCIETY.id;
export const THASMAI_ID = THASMAI_INFOTECH.id;
export const PERSON_ID = SUDARSHANA_KARKALA.id;
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

export function thasmaiOrgNode() {
  return {
    "@type": "Organization",
    "@id": THASMAI_ID,
    name: THASMAI_INFOTECH.name,
    legalName: THASMAI_INFOTECH.legalName,
    url: THASMAI_INFOTECH.canonicalUrl,
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
