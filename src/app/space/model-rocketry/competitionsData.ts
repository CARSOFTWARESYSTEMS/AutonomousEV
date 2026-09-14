// Student rocketry/CanSat competition data — kept separate from the general
// educational content so time-sensitive facts (dates, editions, status) can
// be reviewed and updated independently. Every entry lists an official
// source and the date it was last checked. Do not add a fact here without a
// verifiable source — see VERIFIED_ON for when this file was last checked.

export const VERIFIED_ON = "2026-09-14";

export type CompetitionStatus = "Open" | "Upcoming" | "Announced" | "Completed" | "Next edition not yet verified";
export type CompetitionFocus = "Rocket" | "CanSat" | "Both";
export type CompetitionRegion = "India" | "International";

export interface Competition {
  id: string;
  name: string;
  region: CompetitionRegion;
  audience: string;
  focus: CompetitionFocus;
  level: string;
  status: CompetitionStatus;
  currentEdition: string;
  officialSourceLabel: string;
  officialSourceUrl: string;
  verifiedOn: string;
  notes: string;
}

export const COMPETITIONS: Competition[] = [
  {
    id: "inspace-model-rocketry",
    name: "IN-SPACe Model Rocketry India Student Competition",
    region: "India",
    audience: "Undergraduate student teams, engineering and science streams",
    focus: "Rocket",
    level: "National",
    status: "Upcoming",
    currentEdition: "2nd edition (2026) — application deadline 30 April 2026; national finals expected October–November 2026 in Kushinagar, Uttar Pradesh",
    officialSourceLabel: "IN-SPACe official listing",
    officialSourceUrl: "https://www.inspace.gov.in/inspace?id=cansat_model_rocketry_2026",
    verifiedOn: VERIFIED_ON,
    notes: "Run jointly with the CAN-7USAT competition below — the model rocket carries a CAN-7USAT payload to 1000m altitude with safe ejection and precision landing.",
  },
  {
    id: "inspace-can7usat",
    name: "IN-SPACe CAN-7USAT India Student Competition",
    region: "India",
    audience: "Undergraduate student teams, engineering and science streams",
    focus: "CanSat",
    level: "National",
    status: "Upcoming",
    currentEdition: "3rd edition (2026) — same timeline as the Model Rocketry competition above",
    officialSourceLabel: "IN-SPACe official listing",
    officialSourceUrl: "https://www.inspace.gov.in/inspace?id=cansat_model_rocketry_2026",
    verifiedOn: VERIFIED_ON,
    notes: "The 1kg CAN-7USAT payload is the mission payload carried and ejected by the paired Model Rocketry competition.",
  },
  {
    id: "euroc",
    name: "European Rocketry Challenge (EuRoC)",
    region: "International",
    audience: "University student rocketry teams",
    focus: "Rocket",
    level: "International",
    status: "Upcoming",
    currentEdition: "7th edition — 15–21 October 2026, Constância, Portugal. 25 teams selected from a record 61 applications.",
    officialSourceLabel: "euroc.pt",
    officialSourceUrl: "https://euroc.pt/",
    verifiedOn: VERIFIED_ON,
    notes: "Organised by the Portuguese Space Agency.",
  },
  {
    id: "irec",
    name: "Spaceport America Cup / IREC",
    region: "International",
    audience: "University student rocketry teams",
    focus: "Rocket",
    level: "International",
    status: "Completed",
    currentEdition: "2026 edition held mid-June 2026, now hosted at Spaceport Midland (moved from Spaceport America in 2025).",
    officialSourceLabel: "Experimental Sounding Rocket Association (ESRA)",
    officialSourceUrl: "https://www.esrarocket.org/2026irec",
    verifiedOn: VERIFIED_ON,
    notes: "Check ESRA's site directly for the next edition's registration schedule.",
  },
  {
    id: "aas-cansat",
    name: "AAS Student CanSat Competition",
    region: "International",
    audience: "University student teams (global)",
    focus: "CanSat",
    level: "International",
    status: "Announced",
    currentEdition: "2026 edition completed (4–7 June 2026, Staunton & Monterey, VA — won by Thailand). 2027 edition announced: 10–13 June 2027, Monterey, VA.",
    officialSourceLabel: "American Astronautical Society",
    officialSourceUrl: "https://astronautical.org/events/cansat/",
    verifiedOn: VERIFIED_ON,
    notes: "Organised with NASA and the Naval Research Lab.",
  },
  {
    id: "german-cansat",
    name: "German CanSat Competition (Deutscher CanSat-Wettbewerb)",
    region: "International",
    audience: "School student teams (age 14+), Germany",
    focus: "CanSat",
    level: "National (Germany)",
    status: "Open",
    currentEdition: "13th edition (2026/27) — applications open, deadline 4 October 2026; finale 15–19 March 2027 in Bremen. CanSats are launched via model rocket to roughly 700m altitude.",
    officialSourceLabel: "DLR / cansat.de",
    officialSourceUrl: "https://www.cansat.de/",
    verifiedOn: VERIFIED_ON,
    notes: "Co-organised by the German Aerospace Center (DLR).",
  },
  {
    id: "korea-cansat",
    name: "Korea CanSat Competition",
    region: "International",
    audience: "Student teams, elementary through college level, Korea",
    focus: "CanSat",
    level: "National (Korea)",
    status: "Next edition not yet verified",
    currentEdition: "2026 finals held 5–6 August 2026.",
    officialSourceLabel: "KAIST Satellite Technology Research Center",
    officialSourceUrl: "https://cansat.kaist.ac.kr/",
    verifiedOn: VERIFIED_ON,
    notes: "Next edition's dates were not found as of this page's last verification.",
  },
];
