// Structured-data entity graph for /internships — the canonical internship
// hub. Uses CollectionPage + ItemList only (per the AI-discoverability
// spec's §9): no EducationalOccupationalProgram (not every card carries
// verified duration/fee/eligibility fields) and no JobPosting (there is no
// active, job-like vacancy posting on this page).
//
// Every ItemList entry below corresponds to a real, currently-visible
// ProjectCard on /internships (see InternshipsClient.tsx) — the
// "Miscellaneous" grab-bag section (VTU Internyet, AICTE, CAR Software
// Systems, etc.) is deliberately excluded, since those are external
// resource links, not EV.ENGINEER-offered programme tracks.

import { SITE_URL, INTERNSHIP_PROGRAM } from "@/data/public-entities";
import {
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  ITELEMATICS_ID,
  websiteNode,
  evEngineerBrandNode,
  itelematicsOrgNode,
} from "./entities";

const HUB_URL = INTERNSHIP_PROGRAM.canonicalUrl;
const COLLECTION_ID = INTERNSHIP_PROGRAM.id;

const PROGRAMME_TRACKS: { name: string; url: string; description: string }[] = [
  {
    name: "EV Battery Intelligence Platform (Cybersecurity & Fire Prevention)",
    url: `${SITE_URL}/internships/battery-cybersecurity`,
    description: "Risk analysis and thermal-runaway prevention for EV battery systems.",
  },
  {
    name: "EV Battery Pack Design",
    url: `${SITE_URL}/internships/battery-pack-design`,
    description: "Electrochemistry, structural CTP frames, BMS algorithms and cloud telemetry.",
  },
  {
    name: "Battery Pack Aadhaar System",
    url: `${SITE_URL}/internships/battery-aadhaar`,
    description: "Unified identity protocols for battery life tracking and health.",
  },
  {
    name: "AegisCAN — Intelligent CAN Cybersecurity",
    url: `${SITE_URL}/internships/AegisCAN`,
    description: "Learn Battery, BMS, BESS, CAN communication, system validation and embedded cybersecurity by building an intelligent CAN monitoring and anomaly-detection prototype.",
  },
  {
    name: "EV Help Agent",
    url: "https://help.ev.engineer/",
    description: "AI voice agent design and real-world dialog projects for EV support.",
  },
  {
    name: "Super-Intelligent AI EMS",
    url: `${SITE_URL}/si-ems`,
    description: "AI-driven Energy Management Systems research for autonomous EVs.",
  },
  {
    name: "EV Battery Health & Diagnostics",
    url: "https://battery.ev.engineer/",
    description: "Advanced diagnostics and intelligence for EV battery lifecycles.",
  },
  {
    name: "Autonomous Air Taxi (eVTOL)",
    url: `${SITE_URL}/design-development/passenger-taxi`,
    description: "End-to-end design lifecycle for urban air mobility.",
  },
  {
    name: "Autonomous Airport Cargo EV",
    url: `${SITE_URL}/design-development/airport-cargo`,
    description: "Duty-cycle analysis and integrations for closed-loop cargo environments.",
  },
  {
    name: "IN-SPACe Model Rocketry — Learning Guide",
    url: `${SITE_URL}/space/2026-INSPACe-ROCKETRY-059`,
    description: "Aerospace and space-engineering student project track: model rocketry mission architecture, avionics, recovery and telemetry.",
  },
  {
    name: "EV Repair Workshop",
    url: "https://repair.ev.engineer/",
    description: "EV diagnostics, repair mechanisms and maintenance workflows.",
  },
  {
    name: "Battery Circular Economy (BMC)",
    url: `${SITE_URL}/internships/battery-circular-economy`,
    description: "Financial model for EV battery secondary life, cell grading and repacking economics.",
  },
];

export interface InternshipsGraphOptions {
  title: string;
  description: string;
  dateModified: string;
}

export function buildInternshipsGraph({ title, description, dateModified }: InternshipsGraphOptions): object[] {
  return [
    websiteNode(),
    evEngineerBrandNode(),
    itelematicsOrgNode(),
    {
      "@type": "CollectionPage",
      "@id": COLLECTION_ID,
      url: HUB_URL,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": EV_ENGINEER_BRAND_ID },
      // Verified on-site: /contact and / both identify iTelematics Software
      // Private Limited as the operator of EV.ENGINEER, which offers these
      // programme tracks.
      provider: { "@id": ITELEMATICS_ID },
      dateModified,
      inLanguage: "en",
      hasPart: {
        "@type": "ItemList",
        "@id": `${HUB_URL}#programme-list`,
        itemListElement: PROGRAMME_TRACKS.map((track, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: track.name,
          url: track.url,
          item: {
            "@type": "CreativeWork",
            name: track.name,
            url: track.url,
            description: track.description,
          },
        })),
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Internships", item: HUB_URL },
        ],
      },
    },
  ];
}
