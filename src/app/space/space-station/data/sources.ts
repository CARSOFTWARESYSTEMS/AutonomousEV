// Single registry of authoritative sources for /space/space-station.
// Every URL here was opened and checked on LAST_REVIEWED (HTTP 200 from a
// browser user agent, or — where the site blocks automated requests — its
// domain confirmed through the organisation's own search listing). Section
// citations and the Research Library both read from this list, so a source
// is never cited in one place with a different URL in another.

export const LAST_REVIEWED = "2026-09-25";
export const LAST_REVIEWED_LABEL = "25 September 2026";

export type Region = "India" | "United States" | "Europe" | "Japan" | "Canada" | "China" | "Russia" | "Commercial" | "Academic" | "Standards";

export interface Source {
  id: string;
  org: string;
  title: string;
  url: string;
  region: Region;
  domain: string;
  note: string;
  /** Set when automated checks are blocked but the URL is the organisation's official domain. */
  accessNote?: string;
}

export const SOURCES = [
  // ── India ──
  { id: "pib-bas-cabinet-2024", org: "PIB · Government of India (Cabinet)", title: "Bharatiya Anthariksh Station: first module in 2028 (Cabinet approval, 18 Sep 2024)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2055978", region: "India", domain: "BAS · Policy", note: "Cabinet approval of BAS-1 within the revised Gaganyaan programme; vision of an operational BAS by 2035 and an Indian crewed lunar mission by 2040." },
  { id: "pib-bas-benefits-2026", org: "PIB · Department of Space", title: "Parliament Question: Advantages and benefits of Bharatiya Antriksh Station (25 Mar 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2244978", region: "India", domain: "BAS · Technology", note: "Five-module configuration; BAS-01 by 2028; all five modules by 2035; technology goals and microgravity research areas." },
  { id: "pib-bas-operationalisation-2024", org: "PIB · Department of Space", title: "Parliament Question: Operationalisation of the Bharatiya Antriksh Station (18 Dec 2024)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2085592", region: "India", domain: "BAS · Policy", note: "BAS as an orbiting Indian human-spaceflight platform in LEO for medium- to long-duration missions." },
  { id: "pib-gaganyaan-bas-2026", org: "PIB · Department of Space", title: "Parliament Question: Gaganyaan mission and Bharatiya Antariksh Station (5 Aug 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2294771", region: "India", domain: "Gaganyaan · BAS", note: "Gaganyaan development status; first uncrewed mission targeted in Q4 2026; first crewed mission targeted by 2027." },
  { id: "pib-spadex-2025", org: "PIB · Government of India", title: "SpaDeX Mission: Revolutionising Space Exploration (Jan 2025, PDF)", url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/jan/doc2025116486201.pdf", region: "India", domain: "Docking", note: "Background on ISRO's Space Docking Experiment and its relevance to future stations." },
  { id: "pib-space-odyssey-2026", org: "PIB · Government of India", title: "India's Space Odyssey: Building India's Space Future (21 Jun 2026, PDF)", url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc2026621898801.pdf", region: "India", domain: "Programme overview", note: "Government overview of India's space programme including BAS and SPADEX." },
  { id: "isro-home", org: "ISRO", title: "Indian Space Research Organisation", url: "https://www.isro.gov.in/", region: "India", domain: "Agency", note: "Official portal of ISRO and the Department of Space." },
  { id: "isro-gaganyaan", org: "ISRO", title: "Gaganyaan — India's human spaceflight programme", url: "https://www.isro.gov.in/Gaganyaan.html", region: "India", domain: "Human spaceflight", note: "Programme overview for the human-rated systems BAS builds upon." },
  { id: "isro-hsfc", org: "ISRO · HSFC", title: "Human Space Flight Centre", url: "https://www.isro.gov.in/HSFC.html", region: "India", domain: "Human spaceflight", note: "ISRO centre responsible for the human spaceflight programme." },
  { id: "isro-imex-2026", org: "ISRO · HSFC", title: "Announcement of Opportunity: Indian Microgravity Experiments — IMEx-2026", url: "https://www.isro.gov.in/IndianMicrogravityExperiments_IMEx2026.html", region: "India", domain: "Microgravity research", note: "Proposal pathway from laboratory feasibility to terrestrial microgravity platforms and possible flight opportunities, including BAS." },
  { id: "isro-imex-2026-ao", org: "ISRO · HSFC", title: "IMEx-2026 Announcement of Opportunity document (PDF)", url: "https://www.isro.gov.in/media_isro/pdf/IMEx_2026_AO_13_Feb_14022026.pdf", region: "India", domain: "Microgravity research", note: "Eligibility, proposal format and submission process." },
  { id: "inspace", org: "IN-SPACe", title: "Indian National Space Promotion and Authorization Centre", url: "https://www.inspace.gov.in/", region: "India", domain: "Industry · Authorization", note: "Single-window agency for non-governmental space activities in India." },

  // ── United States ──
  { id: "nasa-iss", org: "NASA", title: "International Space Station", url: "https://www.nasa.gov/international-space-station/", region: "United States", domain: "ISS", note: "NASA's ISS hub: operations, crew, research and news." },
  { id: "nasa-iss-facts", org: "NASA", title: "International Space Station Facts and Figures", url: "https://www.nasa.gov/international-space-station/space-station-facts-and-figures/", region: "United States", domain: "ISS", note: "Official figures: continuous occupation since November 2000, pressurised volume, mass, power and docking capacity." },
  { id: "nasa-iss-research", org: "NASA", title: "Space Station Research and Technology", url: "https://www.nasa.gov/international-space-station/space-station-research-and-technology/", region: "United States", domain: "Microgravity research", note: "How research is conducted on the ISS and how to propose it." },
  { id: "nasa-research-explorer", org: "NASA", title: "Space Station Research Explorer", url: "https://www.nasa.gov/mission/station/research-explorer/", region: "United States", domain: "Microgravity research", note: "Searchable database of ISS experiments, facilities and results." },
  { id: "nasa-bps", org: "NASA", title: "Biological and Physical Sciences Division", url: "https://science.nasa.gov/biological-physical/", region: "United States", domain: "Space biology · Physical sciences", note: "NASA's programme for fundamental space biology and physical-science research." },
  { id: "nasa-hrp", org: "NASA", title: "Human Research Program", url: "https://www.nasa.gov/hrp/", region: "United States", domain: "Space medicine", note: "Risks to human health and performance in spaceflight and the countermeasures being researched." },
  { id: "nasa-water-recovery", org: "NASA", title: "NASA Achieves Water Recovery Milestone on International Space Station", url: "https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/", region: "United States", domain: "ECLSS", note: "ISS life-support water recovery demonstration." },
  { id: "nasa-cld", org: "NASA", title: "Commercial Space Stations", url: "https://www.nasa.gov/humans-in-space/commercial-space/commercial-space-stations/", region: "United States", domain: "Commercial LEO", note: "NASA's Commercial LEO Destinations strategy and partners." },
  { id: "nasa-leo-2026", org: "NASA", title: "NASA Unveils Initiatives to Achieve America's National Space Policy (24 Mar 2026)", url: "https://www.nasa.gov/news-release/nasa-unveils-initiatives-to-achieve-americas-national-space-policy/", region: "United States", domain: "Commercial LEO · Gateway", note: "Adds an ISS-anchored Core Module option for LEO; states NASA intends to pause Gateway in its current form." },
  { id: "nasa-iss-transition-faq", org: "NASA", title: "FAQs: The International Space Station Transition Plan", url: "https://www.nasa.gov/faqs-the-international-space-station-transition-plan/", region: "United States", domain: "ISS · Commercial LEO", note: "How NASA plans to move from the ISS to commercial destinations." },
  { id: "nasa-usdv", org: "NASA", title: "NASA Selects International Space Station US Deorbit Vehicle", url: "https://www.nasa.gov/news-release/nasa-selects-international-space-station-us-deorbit-vehicle/", region: "United States", domain: "ISS", note: "Controlled deorbit planned after the end of ISS operations in 2030." },
  { id: "nasa-axiom-order", org: "NASA", title: "NASA, Axiom Space Change Assembly Order of Commercial Space Station (Dec 2024)", url: "https://www.nasa.gov/humans-in-space/commercial-space/leo-economy/nasa-axiom-space-change-assembly-order-of-commercial-space-station/", region: "United States", domain: "Commercial LEO", note: "Axiom's first module to attach to the ISS and later depart as a free-flying station." },
  { id: "nasa-gateway", org: "NASA", title: "Gateway", url: "https://www.nasa.gov/mission/gateway/", region: "United States", domain: "Lunar orbit", note: "Gateway mission page: HALO, PPE, NRHO and international contributions." },
  { id: "nasa-gateway-faq", org: "NASA", title: "Gateway: Frequently Asked Questions", url: "https://www.nasa.gov/gateway-frequently-asked-questions/", region: "United States", domain: "Lunar orbit", note: "Why a near-rectilinear halo orbit, and how Gateway was designed to operate uncrewed." },
  { id: "nasa-sr1", org: "NASA", title: "Space Reactor-1 Freedom", url: "https://www.nasa.gov/mission/space-reactor-1-freedom/", region: "United States", domain: "Deep space", note: "Mission that NASA realigned to include Gateway's Power and Propulsion Element in 2026." },
  { id: "nasa-skylab", org: "NASA", title: "Skylab", url: "https://www.nasa.gov/mission/skylab/", region: "United States", domain: "History", note: "America's first space station (1973–1979)." },
  { id: "nasa-mir-35", org: "NASA History", title: "35 Years Ago: Launch of Mir Space Station's First Module", url: "https://www.nasa.gov/history/35-years-ago-launch-of-mir-space-stations-first-module/", region: "United States", domain: "History", note: "Mir's origins in the Salyut and Almaz programmes and its modular assembly." },
  { id: "nasa-shuttle-mir", org: "NASA", title: "Shuttle-Mir", url: "https://www.nasa.gov/space-shuttle/shuttle-mir/", region: "United States", domain: "History", note: "Phase 1 of the ISS programme and lessons carried into ISS design." },
  { id: "nasa-hidh", org: "NASA", title: "Human Integration Design Handbook", url: "https://www.nasa.gov/organizations/ochmo/human-integration-design-handbook/", region: "United States", domain: "Crew systems · Human factors", note: "Design guidance for habitable volume, lighting, noise, workstations and more." },
  { id: "nasa-odpo", org: "NASA", title: "Orbital Debris Program Office", url: "https://orbitaldebris.jsc.nasa.gov/", region: "United States", domain: "Orbital debris", note: "Debris environment models, measurements and quarterly news." },
  { id: "nasa-space-security", org: "NASA", title: "NASA Issues New Space Security Best Practices Guide", url: "https://www.nasa.gov/general/nasa-issues-new-space-security-best-practices-guide/", region: "United States", domain: "Cybersecurity", note: "Mission security principles and controls for space and ground segments." },
  { id: "ntrs", org: "NASA", title: "NASA Technical Reports Server (NTRS)", url: "https://ntrs.nasa.gov/", region: "United States", domain: "Literature", note: "Open archive of NASA technical reports, conference papers and handbooks." },
  { id: "ntrs-bvad", org: "NASA", title: "NTRS search: Life Support Baseline Values and Assumptions Document", url: "https://ntrs.nasa.gov/search?q=Baseline%20Values%20and%20Assumptions%20Document", region: "United States", domain: "ECLSS", note: "Search entry point for NASA's reference values for crew consumables and life-support design." },
  { id: "issnl", org: "ISS National Laboratory (CASIS)", title: "ISS National Laboratory", url: "https://www.issnationallab.org/", region: "United States", domain: "Commercial research", note: "Manages the US National Laboratory portion of ISS research for non-NASA users.", accessNote: "Site blocks automated checks; domain confirmed via the organisation's own pages." },

  // ── Europe ──
  { id: "esa-hre", org: "ESA", title: "Human and Robotic Exploration", url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration", region: "Europe", domain: "Agency", note: "ESA's human spaceflight, ISS and exploration activities." },
  { id: "esa-columbus", org: "ESA", title: "Columbus laboratory", url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Columbus", region: "Europe", domain: "ISS · Laboratory", note: "Europe's research laboratory on the ISS." },
  { id: "esa-iss", org: "ESA", title: "International Space Station (ESA)", url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/International_Space_Station", region: "Europe", domain: "ISS", note: "ESA's contributions to and research on the ISS." },
  { id: "esa-gateway", org: "ESA", title: "Gateway (ESA)", url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Exploration/Gateway", region: "Europe", domain: "Lunar orbit", note: "European contributions to the Gateway lunar station." },
  { id: "esa-debris", org: "ESA", title: "Space Debris", url: "https://www.esa.int/Space_Safety/Space_Debris", region: "Europe", domain: "Orbital debris", note: "ESA's debris environment reports and mitigation work." },

  // ── Japan ──
  { id: "jaxa", org: "JAXA", title: "Japan Aerospace Exploration Agency", url: "https://global.jaxa.jp/", region: "Japan", domain: "Agency", note: "JAXA's global portal." },
  { id: "jaxa-kibo", org: "JAXA", title: "Kibo — Japanese Experiment Module", url: "https://humans-in-space.jaxa.jp/en/kibo/", region: "Japan", domain: "ISS · Laboratory", note: "Kibo's pressurised laboratory, exposed facility and utilisation programmes." },

  // ── Canada ──
  { id: "csa", org: "CSA", title: "Canadian Space Agency", url: "https://www.asc-csa.gc.ca/eng/", region: "Canada", domain: "Agency", note: "CSA's official portal." },
  { id: "csa-canadarm2", org: "CSA", title: "Canadarm2", url: "https://www.asc-csa.gc.ca/eng/iss/canadarm2/", region: "Canada", domain: "Robotics", note: "The ISS robotic arm and its role in assembly, maintenance and capture." },

  // ── China ──
  { id: "cmse", org: "China Manned Space (CMSE)", title: "China Manned Space", url: "https://en.cmse.gov.cn/", region: "China", domain: "Agency", note: "Official English site of China's human spaceflight programme." },
  { id: "cmse-tianhe", org: "China Manned Space (CMSE)", title: "Core Module Tianhe", url: "https://en.cmse.gov.cn/missions/CMTH/", region: "China", domain: "Tiangong", note: "Core module for integrated control and management of the station." },
  { id: "cmse-wentian", org: "China Manned Space (CMSE)", title: "Wentian Lab Module", url: "https://en.cmse.gov.cn/missions/wentian/", region: "China", domain: "Tiangong", note: "First laboratory module, with airlock for extravehicular activity." },
  { id: "cmse-mengtian", org: "China Manned Space (CMSE)", title: "Mengtian Lab Module", url: "https://en.cmse.gov.cn/missions/mengtian/", region: "China", domain: "Tiangong", note: "Second laboratory module, with a cargo airlock." },
  { id: "cmse-tiangong1", org: "China Manned Space (CMSE)", title: "Tiangong-1", url: "https://en.cmse.gov.cn/missions/tiangongi/", region: "China", domain: "History", note: "China's first target spacecraft and space laboratory." },

  // ── Russia ──
  { id: "roscosmos", org: "Roscosmos", title: "State Space Corporation Roscosmos", url: "https://www.roscosmos.ru/", region: "Russia", domain: "Agency", note: "Official site (in Russian). ISS partner agency.", accessNote: "May be unavailable from some regions or to automated checks." },

  // ── Commercial ──
  { id: "axiom-station", org: "Axiom Space", title: "Axiom Station", url: "https://www.axiomspace.com/axiom-station", region: "Commercial", domain: "Commercial LEO", note: "Operator's description of its planned commercial station." },
  { id: "starlab", org: "Starlab Space", title: "Starlab", url: "https://starlab-space.com/", region: "Commercial", domain: "Commercial LEO", note: "Operator's description of its planned single-launch station." },
  { id: "starlab-cdr", org: "Starlab Space", title: "Starlab Completes NASA Commercial Critical Design Review (Feb 2026)", url: "https://starlab-space.com/press-releases/starlab-completes-nasa-commercial-critical-design-review/", region: "Commercial", domain: "Commercial LEO", note: "Operator press release on its design-review milestone." },
  { id: "orbital-reef", org: "Sierra Space", title: "Orbital Reef", url: "https://www.sierraspace.com/commercial-space-stations/orbital-reef-space-station/", region: "Commercial", domain: "Commercial LEO", note: "Blue Origin and Sierra Space's planned mixed-use station." },
  { id: "vast-haven1", org: "Vast", title: "Haven-1", url: "https://www.vastspace.com/haven-1", region: "Commercial", domain: "Commercial LEO", note: "Operator's description of its planned single-module station." },

  // ── Academic & standards ──
  { id: "scholar", org: "Google Scholar", title: "Google Scholar", url: "https://scholar.google.com/", region: "Academic", domain: "Literature search", note: "Search peer-reviewed literature; verify each paper at its publisher." },
  { id: "crossref", org: "Crossref", title: "Crossref Search", url: "https://search.crossref.org/", region: "Academic", domain: "Literature search", note: "Look up and verify DOIs before citing." },
  { id: "pubmed", org: "US National Library of Medicine", title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", region: "Academic", domain: "Space medicine · Biology", note: "Biomedical literature on spaceflight physiology and space biology." },
  { id: "arxiv", org: "arXiv", title: "arXiv", url: "https://arxiv.org/", region: "Academic", domain: "Preprints", note: "Preprints in physics, engineering and computer science — not peer reviewed." },
  { id: "nist-8270", org: "NIST", title: "NIST IR 8270: Introduction to Cybersecurity for Commercial Satellite Operations", url: "https://csrc.nist.gov/pubs/ir/8270/final", region: "Standards", domain: "Cybersecurity", note: "Applies the NIST Cybersecurity Framework to commercial space operations." },
  { id: "nist-8401", org: "NIST", title: "NIST IR 8401: Satellite Ground Segment — Applying the Cybersecurity Framework", url: "https://csrc.nist.gov/pubs/ir/8401/final", region: "Standards", domain: "Cybersecurity", note: "Cybersecurity profile for satellite ground segments." },
] as const satisfies readonly Source[];

export type SourceId = (typeof SOURCES)[number]["id"];

const byId = new Map<string, Source>(SOURCES.map((s) => [s.id, s]));

export function source(id: SourceId): Source {
  const s = byId.get(id);
  if (!s) throw new Error(`Unknown source ${id}`);
  return s;
}

export const REGIONS: Region[] = ["India", "United States", "Europe", "Japan", "Canada", "China", "Russia", "Commercial", "Academic", "Standards"];
