/**
 * Organisations in the APEX engineering ecosystem.
 *
 * A partner is linked to capabilities only through partner-capabilities.ts,
 * never by a field on the partner, so any partner can hold any number of
 * capabilities and any capability any number of partners. APEX Rocket Systems
 * and Gamyaa AeroSystems are in an engineering collaboration; every other
 * relationship is proposed unless it is confirmed. None is a joint venture,
 * alliance or exclusive partnership.
 */
import { APEX_OFFICIAL_SITE_URL } from "./site";

export type PartnerRelationshipStatus =
  | "CORE_ORGANIZATION"
  | "ENGINEERING_COLLABORATION"
  | "PROPOSED_PARTNER"
  | "CAPABILITY_PROVIDER"
  | "RESEARCH_PARTNER"
  | "ACADEMIC_PARTNER"
  | "PARTNER_REQUIRED"
  | "TO_BE_IDENTIFIED";

export const PARTNER_STATUS_LABEL: Record<PartnerRelationshipStatus, string> = {
  CORE_ORGANIZATION: "Program Owner",
  ENGINEERING_COLLABORATION: "Engineering Collaboration",
  PROPOSED_PARTNER: "Proposed Capability Partner",
  CAPABILITY_PROVIDER: "Capability Provider",
  RESEARCH_PARTNER: "Potential Research Partner",
  ACADEMIC_PARTNER: "Potential Academic Partner",
  PARTNER_REQUIRED: "Partner Required",
  TO_BE_IDENTIFIED: "To Be Identified",
};

export interface Partner {
  id: string;
  name: string;
  shortName: string;
  /** The one-line role, written as the card headline. */
  role: string;
  /** The capability line under the name on cards: "Embedded Systems · Firmware". */
  focus: string;
  logo?: string;
  website?: string;
  location?: string;
  description: string;
  relationshipStatus: PartnerRelationshipStatus;
}

export const PARTNERS: readonly Partner[] = [
  {
    id: "apex",
    name: "APEX Rocket Systems",
    shortName: "APEX",
    role: "Rocket System & Propulsion Program Owner",
    focus: "Rocket Propulsion · Integrated Launch Systems",
    website: APEX_OFFICIAL_SITE_URL,
    description:
      "Developing liquid-propulsion capability as a foundation for progressively integrated rocket systems. APEX holds mission intent, architecture, interfaces, configuration, test objectives and acceptance.",
    relationshipStatus: "CORE_ORGANIZATION",
  },
  {
    id: "gamyaa",
    name: "Gamyaa AeroSystems",
    shortName: "Gamyaa",
    role: "Digital Engineering & Quality",
    focus: "Digital Engineering · Digital Twin · Quality",
    website: "https://www.gamyaa.in/",
    description:
      "Working with APEX in an engineering collaboration, contributing systems engineering, digital engineering, Digital Twin, simulation, software, aerospace quality intelligence, manufacturing quality and test-data and engineering-data capabilities. APEX retains ownership of its rocket-system and propulsion engineering direction.",
    relationshipStatus: "ENGINEERING_COLLABORATION",
  },
  {
    id: "ifab",
    name: "iFab Innovations Private Limited",
    shortName: "iFab Innovations",
    role: "Embedded Systems & Firmware",
    focus: "Embedded Systems · Firmware",
    website: "https://ifab.tech/",
    location: "Bengaluru",
    description:
      "Proposed capability partner for embedded controllers, firmware, RTOS, sensor and actuator interfaces, embedded diagnostics, communication protocols and hardware/firmware integration.",
    relationshipStatus: "PROPOSED_PARTNER",
  },
  {
    id: "itelematics",
    name: "iTelematics Software Private Limited",
    shortName: "iTelematics",
    role: "Cybersecurity & AI",
    focus: "Cybersecurity · AI",
    website: "https://itelematics.com/",
    description:
      "Proposed capability partner for cybersecurity — secure architecture, firmware security, signing, supply-chain and data integrity — and for AI-assisted engineering workflows such as anomaly triage and knowledge retrieval.",
    relationshipStatus: "PROPOSED_PARTNER",
  },
  {
    id: "evsociety",
    name: "EV Society",
    shortName: "EV Society",
    role: "Skills & Workforce Development",
    focus: "Skills · Internships · Academia",
    website: "https://www.evsociety.org/",
    description:
      "Proposed capability partner for internships, student projects, workshops, certification programmes, academic collaboration and industry readiness.",
    relationshipStatus: "PROPOSED_PARTNER",
  },
  {
    id: "academic-institutions",
    name: "Universities, research institutes & engineering colleges",
    shortName: "Academic institutions",
    role: "Research & Talent",
    focus: "Research · Academia",
    description:
      "Open to universities, research institutes and engineering colleges for research collaboration, student projects and the future workforce. No institution is named until one is agreed.",
    relationshipStatus: "TO_BE_IDENTIFIED",
  },
];

export function partner(id: string): Partner {
  const found = PARTNERS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown APEX partner: ${id}`);
  return found;
}
