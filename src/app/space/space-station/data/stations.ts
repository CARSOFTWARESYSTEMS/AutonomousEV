// World stations, history and the LEO → Moon comparison.
// Status labels are kept strictly separate; nothing planned is described as operational.
import type { SourceId } from "./sources";

export type Lifecycle = "Operational" | "Under construction" | "Development" | "Concept" | "Retired" | "Planned";

export interface StationProfile {
  id: string;
  name: string;
  operator: string;
  category: "Government" | "International" | "Commercial";
  lifecycle: Lifecycle;
  statusNote: string;
  location: string;
  summary: string;
  highlights: { title: string; text: string }[];
  sources: SourceId[];
}

export const STATIONS: StationProfile[] = [
  {
    id: "iss",
    name: "International Space Station",
    operator: "NASA · Roscosmos · ESA · JAXA · CSA",
    category: "International",
    lifecycle: "Operational",
    statusNote: "Continuously occupied since November 2000. Partners have committed to operations through 2030, followed by a controlled deorbit.",
    location: "Low Earth orbit",
    summary:
      "A modular laboratory assembled in orbit by five space agencies from 15 countries. NASA lists a pressurised volume of 1,005 m³, eight solar arrays providing 75–90 kW, room for eight visiting spacecraft at once and a typical crew of seven.",
    highlights: [
      { title: "Modular architecture", text: "Pressurised modules joined by nodes, with a long integrated truss carrying solar arrays, radiators and external payloads. Built and expanded over many assembly flights." },
      { title: "Laboratories", text: "Destiny (US), Columbus (ESA) and Kibo (JAXA) host standard experiment racks with power, data, cooling and vacuum services; the Russian segment hosts its own research modules." },
      { title: "External research", text: "External platforms on the truss and Kibo's Exposed Facility expose experiments to vacuum, radiation and the view of Earth." },
      { title: "Robotics", text: "Canadarm2 (CSA) captures and berths cargo vehicles, moves payloads and supports spacewalks; other arms serve Kibo and the Russian segment." },
      { title: "Logistics", text: "Commercial and international cargo vehicles deliver supplies, experiments and spares; some return samples to Earth." },
      { title: "Power & life support", text: "Solar arrays charge batteries for the eclipse half of each orbit. Life support recovers most water from humidity and urine and generates oxygen by electrolysis." },
      { title: "Mission operations", text: "Control centres of the partner agencies share planning and monitoring, with the crew executing a detailed daily timeline." },
    ],
    sources: ["nasa-iss-facts", "nasa-iss", "nasa-usdv", "esa-columbus", "jaxa-kibo", "csa-canadarm2", "nasa-water-recovery"],
  },
  {
    id: "bas",
    name: "Bharatiya Antariksh Station",
    operator: "India · ISRO",
    category: "Government",
    lifecycle: "Planned",
    statusNote: "Planned / under development. First module (BAS-01) targeted by 2028; five modules fully operational by 2035.",
    location: "Low Earth orbit (altitude and inclination not publicly specified)",
    summary: "India's indigenous five-module space station for medium- to long-duration human missions and microgravity research. See the dedicated BAS section for sources.",
    highlights: [
      { title: "Research focus", text: "Life sciences, pharmaceuticals, materials science and manufacturing technologies." },
      { title: "Technology goals", text: "Rendezvous & docking, robotics, in-orbit refuelling, crew quarters, intravehicular suits and microgravity experiment racks." },
    ],
    sources: ["pib-bas-benefits-2026", "pib-bas-cabinet-2024"],
  },
  {
    id: "tiangong",
    name: "Tiangong (China Space Station)",
    operator: "China · China Manned Space",
    category: "Government",
    lifecycle: "Operational",
    statusNote: "Basic three-module configuration completed in 2022; crewed operations continuing.",
    location: "Low Earth orbit",
    summary: "A T-shaped station formed by the Tianhe core module and two laboratory modules, Wentian and Mengtian.",
    highlights: [
      { title: "Tianhe core module", text: "Mainly used for integrated control and management of the whole station." },
      { title: "Wentian lab module", text: "First science module: a working module, an airlock chamber and a resource module; supports crew, extravehicular activity and experiments." },
      { title: "Mengtian lab module", text: "Second science module with a cargo airlock permitting automatic transfer of cargo in and out." },
    ],
    sources: ["cmse-tianhe", "cmse-wentian", "cmse-mengtian", "cmse"],
  },
  {
    id: "gateway",
    name: "Gateway",
    operator: "NASA-led with international partners",
    category: "International",
    lifecycle: "Development",
    statusNote:
      "Paused: on 24 March 2026 NASA stated it intends to pause Gateway in its current form and shift focus to lunar-surface infrastructure; Gateway's Power and Propulsion Element was realigned to the SR-1 Freedom mission. Covered here for its engineering lessons.",
    location: "Near-rectilinear halo orbit (NRHO) around the Moon (as designed)",
    summary:
      "A small station designed to orbit the Moon, visited by crews for short periods and operating uncrewed in between. Its design still teaches how a deep-space outpost differs from a LEO station.",
    highlights: [
      { title: "NRHO", text: "A highly elliptical, stable orbit passing over the lunar poles, chosen for continuous Earth visibility and low station-keeping propellant." },
      { title: "HALO", text: "Habitation and Logistics Outpost — the first habitation module, providing command, docking and living space." },
      { title: "PPE", text: "Power and Propulsion Element — a solar-electric spacecraft designed to provide power, communications, attitude control and orbit transfer." },
      { title: "Uncrewed operations", text: "Long periods without crew demand autonomous health monitoring, fault response and robotics." },
      { title: "Radiation", text: "Outside Earth's magnetosphere, crew and electronics face galactic cosmic rays and solar particle events without geomagnetic shielding." },
      { title: "Moon-to-Mars role", text: "Designed as a staging point for lunar missions and a testbed for deep-space habitation." },
    ],
    sources: ["nasa-leo-2026", "nasa-gateway", "nasa-gateway-faq", "nasa-sr1", "esa-gateway"],
  },
];

export interface CommercialStation {
  name: string;
  developer: string;
  lifecycle: Lifecycle;
  status: string;
  sources: SourceId[];
}

export const COMMERCIAL_STATIONS: CommercialStation[] = [
  { name: "Axiom Station", developer: "Axiom Space", lifecycle: "Development", status: "First module to attach to the ISS, then depart (as early as 2028 per NASA) to become a free-flying station, with more modules added later.", sources: ["nasa-axiom-order", "axiom-station"] },
  { name: "Starlab", developer: "Starlab Space (Voyager, Airbus and partners)", lifecycle: "Development", status: "Completed NASA Commercial Critical Design Review in February 2026 (operator press release); moving to manufacturing and integration.", sources: ["starlab-cdr", "starlab", "nasa-cld"] },
  { name: "Orbital Reef", developer: "Blue Origin and Sierra Space", lifecycle: "Development", status: "Mixed-use station for commerce, research and tourism that the developers plan for the end of this decade.", sources: ["orbital-reef", "nasa-cld"] },
  { name: "Haven-1", developer: "Vast", lifecycle: "Under construction", status: "Single-module station in integration and testing; operator targets launch in 2027 on Falcon 9, with crew visiting in Dragon.", sources: ["vast-haven1", "nasa-cld"] },
];

export const CLD_CONTEXT =
  "NASA's Commercial LEO Destinations programme funded commercial station design under Space Act Agreements. In March 2026 NASA added an ISS-anchored option: a government-owned Core Module attached to the ISS, followed by commercial modules that later detach into free flight — with NASA eventually one of many customers.";

export const HISTORY: { era: string; years: string; status: Lifecycle; lesson: string; detail: string; sources: SourceId[] }[] = [
  { era: "Salyut & Almaz", years: "1971–1986", status: "Retired", lesson: "Single-launch stations prove long stays are possible — and that resupply decides mission length.", detail: "The Soviet Salyut series moved from single-port stations to two docking ports, allowing cargo resupply while a crew was aboard. That hardware became the foundation for Mir.", sources: ["nasa-mir-35"] },
  { era: "Skylab", years: "1973–1979", status: "Retired", lesson: "Design for repair: in-orbit repair saved a damaged station.", detail: "America's first station was damaged during launch; crews deployed a sunshade and freed a stuck solar array, showing the value of spacewalk-capable repair.", sources: ["nasa-skylab"] },
  { era: "Mir", years: "1986–2001", status: "Retired", lesson: "Modular assembly works, but fire, collision and ageing hardware must be designed for.", detail: "Mir grew module by module. Lessons from the Shuttle-Mir programme — including single-command shutdown of ventilation to stop fire spreading and quick-disconnect cables for depressurisation — shaped ISS design.", sources: ["nasa-mir-35", "nasa-shuttle-mir"] },
  { era: "International Space Station", years: "1998–2030 (planned)", status: "Operational", lesson: "International interfaces, standard racks and robotics make a long-lived shared laboratory possible.", detail: "Five agencies integrated hardware built on different continents. Standard interfaces and Canadarm2 enabled assembly, maintenance and a continuous research programme.", sources: ["nasa-iss-facts", "csa-canadarm2"] },
  { era: "Tiangong", years: "2021–present", status: "Operational", lesson: "A compact modular station can be assembled quickly with automated rendezvous and cargo airlocks.", detail: "China's earlier Tiangong-1 and Tiangong-2 laboratories preceded a three-module station assembled from 2021 to 2022.", sources: ["cmse-tiangong1", "cmse-mengtian"] },
  { era: "Commercial LEO era", years: "2020s–", status: "Development", lesson: "The hard problem shifts from engineering alone to sustainable business models.", detail: "Commercial stations must find enough paying customers; NASA intends to become one customer among many.", sources: ["nasa-cld", "nasa-leo-2026"] },
  { era: "Bharatiya Antariksh Station", years: "2028–2035 (targets)", status: "Planned", lesson: "Building national capability step by step: human rating, docking, then modules.", detail: "India's programme sequences Gaganyaan, docking demonstrations and the first module before a five-module station.", sources: ["pib-bas-benefits-2026"] },
  { era: "Gateway", years: "Paused 2026", status: "Development", lesson: "Deep-space outposts must operate autonomously and survive long uncrewed periods — and programmes change with policy.", detail: "Gateway's design drove work on autonomy, radiation and cislunar logistics before NASA paused it in its current form in March 2026.", sources: ["nasa-leo-2026", "nasa-gateway"] },
  { era: "Future lunar & deep-space habitats", years: "Future", status: "Concept", lesson: "Closed-loop life support, radiation protection and autonomy become mandatory, not optional.", detail: "Surface outposts and deep-space habitats cannot rely on quick resupply or return, so reliability and self-sufficiency dominate design.", sources: ["nasa-hrp"] },
];

export type EnvKey = "leo" | "lunarOrbit" | "lunarSurface";

export const MOON_PROGRESSION = [
  { id: "iss", label: "ISS / LEO", note: "Operational laboratory; the reference for everything that follows." },
  { id: "bas", label: "BAS", note: "India's planned LEO station (2028–2035 targets)." },
  { id: "clds", label: "Commercial LEO", note: "Commercial stations in development." },
  { id: "gateway", label: "Gateway", note: "Lunar-orbit station — paused in its current form (2026)." },
  { id: "surface", label: "Lunar surface", note: "Surface outposts are the focus of current lunar plans." },
  { id: "mars", label: "Future Mars infrastructure", note: "Concept stage; depends on lessons from all earlier steps." },
];

export const ENV_COMPARISON: { variable: string; values: Record<EnvKey, string> }[] = [
  { variable: "Radiation", values: { leo: "Partly shielded by Earth's magnetic field", lunarOrbit: "Full galactic cosmic rays and solar particle events", lunarSurface: "Half the sky blocked by the Moon; regolith can shield habitats" } },
  { variable: "Communication delay", values: { leo: "Negligible (well under a second via relays)", lunarOrbit: "About 1.3 s each way", lunarSurface: "About 1.3 s each way; far side needs relays" } },
  { variable: "Resupply", values: { leo: "Frequent; cargo vehicles from several providers", lunarOrbit: "Infrequent and expensive", lunarSurface: "Rare; in-situ resources become valuable" } },
  { variable: "Gravity", values: { leo: "Microgravity (free fall)", lunarOrbit: "Microgravity (free fall)", lunarSurface: "About one-sixth of Earth's" } },
  { variable: "Thermal environment", values: { leo: "Sunlight/eclipse every ~90 min; Earth IR and albedo", lunarOrbit: "Cold deep-space sink; long Sun periods", lunarSurface: "Extreme swings; two-week lunar nights at most latitudes" } },
  { variable: "Emergency return", values: { leo: "Hours", lunarOrbit: "Days", lunarSurface: "Days, and requires ascent from the surface first" } },
  { variable: "Autonomy", values: { leo: "Ground-supported; continuous monitoring", lunarOrbit: "Must run uncrewed and handle faults onboard", lunarSurface: "High; crew and robots act with delayed ground support" } },
  { variable: "Power", values: { leo: "Solar with batteries for ~35 min eclipses", lunarOrbit: "Solar; eclipses depend on the orbit", lunarSurface: "Solar plus long-duration storage or fission for lunar night" } },
  { variable: "Dust", values: { leo: "None", lunarOrbit: "None", lunarSurface: "Abrasive, electrostatic dust affects seals, suits and lungs" } },
  { variable: "Logistics", values: { leo: "Established commercial supply chain", lunarOrbit: "Heavy-lift launches and long transfers", lunarSurface: "Landers, surface mobility and storage" } },
];
