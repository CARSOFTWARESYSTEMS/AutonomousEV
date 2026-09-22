/**
 * Canonical registry of verified, publicly intentional facts about the
 * entities this site discusses: EV.ENGINEER (brand/platform), the legal
 * companies behind it and behind Sudarshana Karkala, EV Society, Sudarshana
 * Karkala himself, the internship programme, and the public business
 * contact point.
 *
 * This is the single source of truth for names, legal names, canonical
 * URLs, verified contact fields and `sameAs` links used across metadata and
 * JSON-LD. Do not duplicate these values inline in page components — import
 * from here instead, and extend `src/lib/structured-data/entities.ts`
 * (the JSON-LD node builders) if a page needs a graph node for one of these
 * entities.
 *
 * Every field here has been verified against content already live and
 * intentionally public elsewhere in this repository (see the comments on
 * each entity). Nothing here is invented. In particular:
 *  - No email address is recorded for Sudarshana Karkala personally — only
 *    his published phone number and LinkedIn profile are verified-public.
 *  - EV.ENGINEER is modelled as a Brand/platform, not a legal entity.
 */

export type PublicEntity = {
  id: string;
  type: "Person" | "Organization" | "Brand" | "Program";
  name: string;
  legalName?: string;
  description: string;
  canonicalUrl: string;
  publicEmail?: string;
  publicTelephone?: string;
  publicLocation?: string;
  logoUrl?: string;
  imageUrl?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  affiliations?: string[];
};

export const SITE_URL = "https://autonomous.ev.engineer";

/**
 * EV.ENGINEER — the platform/brand this site operates under. Verified via
 * the site's own home page, /trust-center, /space (nav credits both
 * "EV.ENGINEER" and "EV Society") and layout.tsx metadata. Deliberately
 * typed "Brand", not "Organization" — the repo does not establish
 * EV.ENGINEER as a separate registered legal entity.
 */
export const EV_ENGINEER: PublicEntity = {
  id: `${SITE_URL}/#brand`,
  type: "Brand",
  name: "EV.ENGINEER",
  description:
    "EV.ENGINEER is an engineering-education platform and brand publishing content, internships and student project tracks in EV battery systems, autonomous vehicles, cybersecurity, aerospace and space engineering.",
  canonicalUrl: `${SITE_URL}/`,
};

/**
 * iTelematics Software Private Limited — verified as the legal operator of
 * the EV.ENGINEER platform via /contact (published company name, email,
 * phone and address) and the home page ("iTelematics® Software Private
 * Limited" badge, linking to iTelematics.com).
 */
export const ITELEMATICS: PublicEntity = {
  id: "https://itelematics.com/#organization",
  type: "Organization",
  name: "iTelematics Software Private Limited",
  legalName: "iTelematics Software Private Limited",
  description:
    "iTelematics Software Private Limited is the company that publishes its contact details on autonomous.ev.engineer/contact as the operator of the EV.ENGINEER platform.",
  canonicalUrl: "https://itelematics.com/",
  publicEmail: "info@iTelematics.com",
  publicTelephone: "+91 91082 06147",
  publicLocation: "Bhoganahalli, Bangalore - 560103, India",
};

/**
 * EV Society — verified as a separate community/educational initiative via
 * /space (footer credits "Space · An EV Society initiative"; nav links to
 * evsociety.org as an external, distinct site) and the rocketry page's own
 * "EV Society / EV.ENGINEER" attribution. Not described as a registered
 * Section 8 company anywhere on this site, so it is not claimed here either.
 */
export const EV_SOCIETY: PublicEntity = {
  id: "https://www.evsociety.org/#organization",
  type: "Organization",
  name: "EV Society",
  description:
    "EV Society is a community initiative, distinct from EV.ENGINEER, that stewards the Space Initiative and related educational content published on this site.",
  canonicalUrl: "https://www.evsociety.org/",
};

/**
 * Sudarshana Karkala — verified public professional facts only. Phone
 * number is the same +91 9845561518 already published on his behalf across
 * multiple existing pages (si-ems, battery-fire-prevention,
 * battery-pack-design, ev-help-agent, battery-cybersecurity, the rocketry
 * page's author block). LinkedIn is his one verified social profile,
 * confirmed working across the same pages. Topmate is verified via
 * /trust-center's source configuration and PrerequisitesSection. No email
 * address is recorded for him personally — none is published anywhere in
 * this repository.
 */
export const SUDARSHANA_KARKALA: PublicEntity = {
  id: `${SITE_URL}/about/sudarshana-karkala#person`,
  type: "Person",
  name: "Sudarshana Karkala",
  description:
    "Sudarshana Karkala is a software architect and technology leader with over two decades of experience in eMobility, eVTOL, AirTaxi, security, cloud and energy systems engineering. He founded the EV.ENGINEER platform and consults for iTelematics Software Private Limited.",
  canonicalUrl: `${SITE_URL}/about/sudarshana-karkala`,
  publicTelephone: "+91 9845561518",
  imageUrl: `${SITE_URL}/SudarshanaKarkala.jpg`,
  sameAs: ["https://www.linkedin.com/in/sudarshanakarkala/", "https://topmate.io/sudarshana_karkala"],
  knowsAbout: [
    "EV battery intelligence and diagnostics",
    "Battery Management Systems",
    "EV battery safety and cybersecurity",
    "eVTOL and air-taxi systems engineering",
    "cloud and energy systems architecture",
    "autonomous energy management systems",
  ],
  affiliations: [EV_ENGINEER.canonicalUrl, ITELEMATICS.canonicalUrl],
};

/**
 * Tanuja Jadhav — Lead Researcher · EV.ENGINEER™ for the AegisCAN internship
 * project (/internships/AegisCAN). She initiated and leads AegisCAN. Role,
 * affiliation and profile links are sourced from the approved AegisCAN
 * researcher-attribution brief; this site has no separate internal profile
 * page for her, so `canonicalUrl` points at the AegisCAN research-team
 * section, and `id` uses her EV Society research profile as the stable
 * external identity anchor.
 */
export const TANUJA_JADHAV: PublicEntity = {
  id: "https://www.evsociety.org/projects/battery-safety-systems/candidates/tanujajadhav#person",
  type: "Person",
  name: "Tanuja Jadhav",
  description:
    "Tanuja Jadhav leads the AegisCAN initiative on EV.ENGINEER, including project direction, student research coordination and development of the Battery–BMS–BESS–CAN engineering learning framework.",
  canonicalUrl: `${SITE_URL}/internships/AegisCAN#research-team`,
  sameAs: [
    "https://www.linkedin.com/in/tanuja-jadhav-049431398/",
    "https://www.evsociety.org/projects/battery-safety-systems/candidates/tanujajadhav",
  ],
  knowsAbout: ["AegisCAN project research direction", "Battery/BMS/BESS/CAN engineering education"],
  affiliations: [EV_ENGINEER.canonicalUrl],
};

/**
 * Bhavya Naga Sai Parvathi Kshatri — Cybersecurity Researcher · EV.ENGINEER™
 * for AegisCAN. Role, professional focus and profile link are sourced from
 * the approved AegisCAN researcher-attribution brief. No internal profile
 * page exists for her on this site, so `id`/`canonicalUrl` follow the same
 * pattern as Tanuja Jadhav above.
 */
export const BHAVYA_KSHATRI: PublicEntity = {
  id: "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri-3140251a2/#person",
  type: "Person",
  name: "Bhavya Naga Sai Parvathi Kshatri",
  description:
    "Bhavya Naga Sai Parvathi Kshatri contributes to the AegisCAN cybersecurity research track on EV.ENGINEER, including threat analysis, security monitoring, anomaly investigation and defensive cybersecurity concepts relevant to CAN-based systems.",
  canonicalUrl: `${SITE_URL}/internships/AegisCAN#research-team`,
  sameAs: ["https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri-3140251a2/"],
  knowsAbout: ["Cybersecurity", "AI SOC analysis", "Threat detection and alert investigation"],
  affiliations: [EV_ENGINEER.canonicalUrl],
};

/**
 * The internship programme hub at /internships. Modelled as a "Program" in
 * this registry (a descriptive, non-schema.org-specific category); the
 * corresponding JSON-LD uses CollectionPage + ItemList (see
 * src/lib/structured-data/entities.ts) rather than
 * EducationalOccupationalProgram or JobPosting, since not every visible
 * card on /internships carries the verified duration/fee/eligibility fields
 * those types would require.
 */
export const INTERNSHIP_PROGRAM: PublicEntity = {
  id: `${SITE_URL}/internships#internship-program`,
  type: "Program",
  name: "EV.ENGINEER Internships & Student Projects",
  description:
    "A collection of engineering internships and student project tracks in EV battery systems, BMS, cybersecurity, autonomous systems, aerospace, space engineering and model rocketry, offered through the EV.ENGINEER platform.",
  canonicalUrl: `${SITE_URL}/internships`,
};

/**
 * The public business contact point, exactly as printed on /contact. Do
 * not add fields here that are not visibly printed on that page.
 */
export const PUBLIC_CONTACT = {
  id: `${SITE_URL}/contact#contact`,
  organizationName: ITELEMATICS.name,
  email: ITELEMATICS.publicEmail as string,
  telephone: ITELEMATICS.publicTelephone as string,
  location: ITELEMATICS.publicLocation as string,
  canonicalUrl: `${SITE_URL}/contact`,
};
