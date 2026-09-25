// Bharatiya Antariksh Station and Indian microgravity research.
// Only facts stated in the cited official releases appear here. Anything not
// officially published is shown as NOT_SPECIFIED rather than estimated.
import type { SourceId } from "./sources";

export const NOT_SPECIFIED = "Not publicly specified";

export const BAS_FACTS: { label: string; value: string; sources: SourceId[] }[] = [
  { label: "Programme", value: "India's indigenous space station, an orbiting Indian human-spaceflight platform in Low Earth Orbit", sources: ["pib-bas-operationalisation-2024"] },
  { label: "Status", value: "Planned / under development — system engineering of BAS-01 and subsystem technology development in progress at ISRO centres", sources: ["pib-bas-benefits-2026"] },
  { label: "Approval", value: "Union Cabinet approved development and launch of the first module (BAS-01) in September 2024, by revising the scope of the Gaganyaan programme", sources: ["pib-bas-cabinet-2024"] },
  { label: "First module", value: "BAS-01 targeted by 2028", sources: ["pib-bas-cabinet-2024", "pib-bas-benefits-2026"] },
  { label: "Configuration", value: "Five modules — the overall configuration has been reviewed by a National Level Review Committee", sources: ["pib-bas-benefits-2026"] },
  { label: "Fully operational", value: "All five modules by 2035", sources: ["pib-bas-benefits-2026", "pib-gaganyaan-bas-2026"] },
  { label: "Approved cost (first module)", value: "₹1,763 crore for development and launch of the first module, 2025–2028", sources: ["pib-bas-benefits-2026"] },
  { label: "Industry", value: "Vikram Sarabhai Space Centre issued an Expression of Interest to Indian industry for the structure of the first module", sources: ["pib-bas-benefits-2026"] },
];

export const BAS_UNSPECIFIED: string[] = [
  "Module dimensions and mass",
  "Internal layout",
  "Crew capacity",
  "Orbital altitude and inclination",
  "Docking and berthing interface standards",
  "Power generation capacity",
  "Launch vehicle for each module",
];

export const BAS_TECHNOLOGIES: { name: string; why: string }[] = [
  { name: "Rendezvous & docking", why: "Every module, crew vehicle and cargo vehicle must find, approach and join the station safely." },
  { name: "Robotics", why: "Robotic arms and tools support assembly, inspection, maintenance and payload handling outside the station." },
  { name: "In-orbit refuelling", why: "Transferring propellant in orbit lets a station keep reboosting and controlling attitude for years." },
  { name: "Crew quarters", why: "Private sleep and rest space is essential for health and performance on long missions." },
  { name: "Intravehicular suits", why: "Suits worn inside spacecraft protect crew during dynamic phases and pressure emergencies." },
  { name: "Microgravity experiment racks", why: "Standardised racks provide power, data, cooling and containment so many experiments can share one laboratory." },
];

export const BAS_RESEARCH_AREAS = ["Life sciences", "Pharmaceuticals", "Materials science", "Manufacturing technologies"];

/** Technology Readiness Map — a learning sequence, not an official ISRO schedule. */
export const BAS_READINESS: { step: string; status: string; detail: string; sources: SourceId[] }[] = [
  { step: "Gaganyaan", status: "Under development", detail: "India's human-spaceflight programme. PIB (Aug 2026): first uncrewed mission targeted in Q4 2026; two more uncrewed missions and the first crewed mission targeted by 2027.", sources: ["pib-gaganyaan-bas-2026", "isro-gaganyaan"] },
  { step: "Human-rated systems", status: "Under development", detail: "Human-rated launch vehicle, crew escape system, orbital module, life support and recovery — the foundation for crewed station operations.", sources: ["pib-gaganyaan-bas-2026"] },
  { step: "SPADEX / docking", status: "Demonstrated (2025)", detail: "ISRO's Space Docking Experiment demonstrated autonomous docking and undocking of two satellites in orbit.", sources: ["pib-spadex-2025", "pib-space-odyssey-2026"] },
  { step: "BAS-01", status: "Planned (2028 target)", detail: "First module, approved by Cabinet in September 2024 together with precursor technology missions.", sources: ["pib-bas-cabinet-2024"] },
  { step: "Modular BAS", status: "Planned (2035 target)", detail: "Five-module station, fully operational by 2035.", sources: ["pib-bas-benefits-2026"] },
  { step: "Long-duration operations", status: "Planned", detail: "Medium- to long-duration human missions in LEO as part of a sustained Indian human space programme.", sources: ["pib-bas-operationalisation-2024"] },
  { step: "Future lunar exploration", status: "Government vision (2040)", detail: "The national vision includes an Indian crewed lunar mission by 2040; experience from long-duration LEO operations is a stepping stone.", sources: ["pib-bas-cabinet-2024"] },
];

export const IMEX = {
  summary:
    "IMEx-2026 is ISRO's Announcement of Opportunity (29 January 2026) inviting the Indian research community to conceptualise, develop and demonstrate microgravity experiments. The current cycle closed on 28 February 2026 — check ISRO for future cycles.",
  disciplines: [
    "Materials science",
    "Space biology and biotechnology",
    "Space agriculture",
    "Pharmacology and drug research",
    "Fluid physics and thermal transport",
    "Combustion and fire safety",
    "In-space manufacturing and processing",
  ],
  eligibility: ["Government-recognised academic institutions", "National research laboratories", "Indian start-ups and industry"],
  pathway: [
    "Demonstrate scientific feasibility with a laboratory-scale model using your own institutional resources.",
    "Promising experiments may be supported for validation on terrestrial microgravity platforms.",
    "Selected experiments — subject to safety, feasibility, platform constraints and expected outcomes — may be considered for ISRO-enabled flight opportunities in LEO, including aboard BAS.",
    "Collaborations are formalised through MoUs with the Human Space Flight Centre (HSFC).",
  ],
  sources: ["isro-imex-2026", "isro-imex-2026-ao"] as SourceId[],
};
