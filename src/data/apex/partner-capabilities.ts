/**
 * Partner ⇄ capability. The only place a partner is tied to a capability.
 *
 * One record per pair: a partner may appear against many capabilities and a
 * capability against many partners. A capability with no record is shown as
 * "Partner Required", and every capability stays open to further partners.
 *
 * Role boundaries this file keeps (checked by tests):
 *  - iTelematics: Cybersecurity and AI only.
 *  - Gamyaa Aerospace: never Cybersecurity or AI.
 *  - iFab Innovations: embedded systems and firmware work.
 *  - EV Society: skills, workforce and academic collaboration.
 */
import { CAPABILITY_DEFINITIONS, RING_CATEGORY, type CapabilityDefinition } from "./capabilities";
import { PARTNERS, type Partner } from "./partners";

export type CapabilityRelationshipStatus = "PROGRAM_OWNER" | "PROPOSED" | "CONFIRMED" | "TO_BE_IDENTIFIED";

export interface CapabilityPartner {
  capabilityId: string;
  partnerId: string;
  role: string;
  contribution: string;
  relationshipStatus: CapabilityRelationshipStatus;
}

export const RELATIONSHIP_LABEL: Record<CapabilityRelationshipStatus, string> = {
  PROGRAM_OWNER: "Program Owner",
  PROPOSED: "Proposed Capability Partner",
  CONFIRMED: "Capability Provider",
  TO_BE_IDENTIFIED: "To Be Identified",
};

export const CAPABILITY_PARTNERS: readonly CapabilityPartner[] = [
  // APEX — program owner
  { capabilityId: "system-architecture", partnerId: "apex", role: "Owner", contribution: "Mission intent, vehicle architecture, system requirements and technical interfaces.", relationshipStatus: "PROGRAM_OWNER" },
  { capabilityId: "propulsion", partnerId: "apex", role: "Owner", contribution: "Propulsion architecture, engine requirements, hardware configuration and design decisions.", relationshipStatus: "PROGRAM_OWNER" },
  { capabilityId: "engine-control", partnerId: "apex", role: "Owner", contribution: "Engine control requirements and sequencing intent; integrated ECU published as the demonstrator's control approach.", relationshipStatus: "PROGRAM_OWNER" },
  { capabilityId: "integration-test-authority", partnerId: "apex", role: "Owner", contribution: "Integration authority, test objectives, readiness decisions and acceptance.", relationshipStatus: "PROGRAM_OWNER" },
  { capabilityId: "aerospace-manufacturing", partnerId: "apex", role: "Process owner", contribution: "Manufacturing-led development with design, manufacturing and assembly kept closely integrated (published).", relationshipStatus: "PROGRAM_OWNER" },
  { capabilityId: "welding-brazing", partnerId: "apex", role: "Process owner", contribution: "Orbital TIG welding and induction brazing within APEX's published manufacturing approach.", relationshipStatus: "PROGRAM_OWNER" },

  // Gamyaa Aerospace — digital engineering & quality
  { capabilityId: "systems-engineering", partnerId: "gamyaa", role: "Systems engineering support", contribution: "Requirements traceability, interface control and configuration baselines, under APEX authority.", relationshipStatus: "PROPOSED" },
  { capabilityId: "software-engineering", partnerId: "gamyaa", role: "Software engineering", contribution: "Software development process, architecture and verification for ground and test software.", relationshipStatus: "PROPOSED" },
  { capabilityId: "digital-twin", partnerId: "gamyaa", role: "Digital Twin", contribution: "Configuration-aware engine and subsystem models, pre-test prediction and predicted-vs-measured correlation.", relationshipStatus: "PROPOSED" },
  { capabilityId: "simulation", partnerId: "gamyaa", role: "Simulation", contribution: "Scenario simulation and test prediction feeding the Digital Twin.", relationshipStatus: "PROPOSED" },
  { capabilityId: "ground-software", partnerId: "gamyaa", role: "Ground & test software", contribution: "Test sequencing, data acquisition software and operator displays.", relationshipStatus: "PROPOSED" },
  { capabilityId: "test-data", partnerId: "gamyaa", role: "Test-data platform", contribution: "Traceable test records, correlation workspace and engineering-evidence views.", relationshipStatus: "PROPOSED" },
  { capabilityId: "quality-intelligence", partnerId: "gamyaa", role: "Aerospace Quality Intelligence", contribution: "Quality data, trends and supplier performance views.", relationshipStatus: "PROPOSED" },
  { capabilityId: "manufacturing-quality", partnerId: "gamyaa", role: "Manufacturing quality & FAI", contribution: "Inspection planning and First Article Inspection records.", relationshipStatus: "PROPOSED" },
  { capabilityId: "digital-quality-thread", partnerId: "gamyaa", role: "Digital Quality Thread", contribution: "Traceability from requirement through serial number, inspection and test to acceptance.", relationshipStatus: "PROPOSED" },

  // iFab Innovations — embedded systems & firmware
  { capabilityId: "embedded-firmware", partnerId: "ifab", role: "Embedded systems & firmware", contribution: "Embedded controllers, firmware, RTOS, device drivers, communication protocols and embedded diagnostics.", relationshipStatus: "PROPOSED" },
  { capabilityId: "engine-control", partnerId: "ifab", role: "Controller firmware", contribution: "Controller firmware and hardware/firmware integration for engine control, to APEX requirements.", relationshipStatus: "PROPOSED" },
  { capabilityId: "sensors-instrumentation", partnerId: "ifab", role: "Sensor & actuator interfaces", contribution: "Embedded sensor and actuator interfaces and acquisition firmware.", relationshipStatus: "PROPOSED" },

  // iTelematics — cybersecurity & AI only
  { capabilityId: "cybersecurity", partnerId: "itelematics", role: "Cybersecurity", contribution: "Secure architecture, firmware security, secure boot and signing, software supply-chain security, telemetry and data integrity, access control and monitoring.", relationshipStatus: "PROPOSED" },
  { capabilityId: "engineering-ai", partnerId: "itelematics", role: "AI for engineering", contribution: "Test-data anomaly support, knowledge retrieval, quality-document analysis and AI-assisted engineering workflows.", relationshipStatus: "PROPOSED" },

  // EV Society — skills & workforce
  { capabilityId: "skills-workforce", partnerId: "evsociety", role: "Skills & workforce", contribution: "Internships, workshops, certification programmes and an industry-ready talent pipeline.", relationshipStatus: "PROPOSED" },
  { capabilityId: "research-academia", partnerId: "evsociety", role: "Academic collaboration", contribution: "Student projects and academic collaboration.", relationshipStatus: "PROPOSED" },

  // Academic institutions — open
  { capabilityId: "research-academia", partnerId: "academic-institutions", role: "Research", contribution: "Research collaboration, laboratories and independent review.", relationshipStatus: "TO_BE_IDENTIFIED" },
  { capabilityId: "skills-workforce", partnerId: "academic-institutions", role: "Talent", contribution: "Student projects and the future workforce.", relationshipStatus: "TO_BE_IDENTIFIED" },
];

export type CapabilityStatus = "CORE" | "SUPPORTED" | "PROPOSED" | "PARTNER_REQUIRED";

export const CAPABILITY_STATUS_LABEL: Record<CapabilityStatus, string> = {
  CORE: "APEX Core",
  SUPPORTED: "Supported",
  PROPOSED: "Partner Proposed",
  PARTNER_REQUIRED: "Partner Required",
};

export interface Capability extends CapabilityDefinition {
  category: string;
  /** Partner ids, APEX first. Derived from CAPABILITY_PARTNERS. */
  partners: string[];
  status: CapabilityStatus;
}

export function relationshipsForCapability(capabilityId: string): CapabilityPartner[] {
  return CAPABILITY_PARTNERS.filter((record) => record.capabilityId === capabilityId).sort(
    (a, b) => Number(b.partnerId === "apex") - Number(a.partnerId === "apex"),
  );
}

export function relationshipsForPartner(partnerId: string): CapabilityPartner[] {
  return CAPABILITY_PARTNERS.filter((record) => record.partnerId === partnerId);
}

function deriveStatus(definition: CapabilityDefinition, records: CapabilityPartner[]): CapabilityStatus {
  if (definition.apexOwned) return "CORE";
  if (records.some((record) => record.relationshipStatus === "CONFIRMED")) return "SUPPORTED";
  if (records.some((record) => record.relationshipStatus === "PROPOSED")) return "PROPOSED";
  return "PARTNER_REQUIRED";
}

export const CAPABILITIES: readonly Capability[] = CAPABILITY_DEFINITIONS.map((definition) => {
  const records = relationshipsForCapability(definition.id);
  return {
    ...definition,
    category: RING_CATEGORY[definition.ring],
    partners: records.map((record) => record.partnerId),
    status: deriveStatus(definition, records),
  };
});

export function capability(id: string): Capability {
  const found = CAPABILITIES.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown APEX capability: ${id}`);
  return found;
}

export function partnersForCapability(capabilityId: string): { partner: Partner; relationship: CapabilityPartner }[] {
  return relationshipsForCapability(capabilityId).map((relationship) => ({
    partner: PARTNERS.find((item) => item.id === relationship.partnerId)!,
    relationship,
  }));
}

export function capabilitiesForPartner(partnerId: string): { capability: Capability; relationship: CapabilityPartner }[] {
  return relationshipsForPartner(partnerId).map((relationship) => ({
    capability: capability(relationship.capabilityId),
    relationship,
  }));
}

/** Counts for the investor view. */
export function capabilityCoverage() {
  const count = (status: CapabilityStatus) => CAPABILITIES.filter((item) => item.status === status).length;
  return {
    total: CAPABILITIES.length,
    core: count("CORE"),
    supported: count("SUPPORTED"),
    proposed: count("PROPOSED"),
    partnerRequired: count("PARTNER_REQUIRED"),
  };
}
