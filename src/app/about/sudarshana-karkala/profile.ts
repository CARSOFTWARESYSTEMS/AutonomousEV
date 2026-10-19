// Everything the profile says, in one place. The page, its social image and
// its tests read it from here, so they cannot drift apart.
//
// The profile is a summary. It names the person, the initiatives and the work,
// and links to the pages that are the evidence; it does not repeat them.
//
// Three relationships are fixed here and must read the same wherever they
// appear (page, metadata, structured data, llms.txt):
//   - EV.ENGINEER™ is the engineering identity of Sudarshana, his team and the
//     projects they build. It is never written as a founder title on this page.
//   - ISHAVASYAM.ORG is the primary initiative, and he is its Founder.
//   - iTelematics Software Private Limited is one of his consulting
//     engagements, listed with the others. It is not a position he holds, a
//     job title or employment, and it is not stated on its own anywhere.
//
// Three kinds of relationship are kept apart on the page and never blur:
// the career (roles held), the consulting engagements (work done for an
// organisation), and the academic engagement (students taught and mentored
// at an institution, which is neither employment nor a partnership).
import { SPACE_INITIATIVE } from "@/data/space-initiative";
import { ITELEMATICS } from "@/data/public-entities";

/** EV.ENGINEER's address: the platform's own site. Not "/": this page is also served on hosts whose root is another page. */
export const EV_ENGINEER_URL = "https://autonomous.ev.engineer/";

/** The organisations whose links the profile reports, by the id analytics sends. */
export type TrackedOrganisation = "ishavasyam" | "ev_engineer" | "itelematics" | "thasmai" | "gamyaa";

/**
 * An organisation as a row names it. `href` is its own site, where one is on record; `tracked` is set for the
 * organisations whose links the profile reports. A former employer has an address at most, and no event.
 */
export type Organisation = { name: string; href?: string; tracked?: { id: TrackedOrganisation; destination: string } };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** A date as the owner gave it, as the page writes it: "2025-11" is "Nov 2025", and "2001" stays "2001". */
export const shownDate = (date: string) => (date.length === 7 ? `${MONTHS[Number(date.slice(5)) - 1]} ${date.slice(0, 4)}` : date);

export const HERO = {
  name: "Sudarshana Karkala",
  /** The engineering identity. Not a role. */
  identity: "EV.ENGINEER™",
  identityLink: { href: EV_ENGINEER_URL, id: "ev_engineer", destination: "autonomous.ev.engineer" },
  /**
   * The primary initiative. The hero names it beside the identity, "EV.ENGINEER™ @ ISHAVASYAM.ORG", its name a link to its
   * own site. The role is written out ("Founder — ISHAVASYAM.ORG") in the social card, the metadata and the structured data.
   */
  primaryRole: { title: "Founder", organisation: SPACE_INITIATIVE.brand, link: { href: SPACE_INITIATIVE.url, id: "ishavasyam", destination: "ishavasyam.org" } },
  focus: ["Space Station Research", "Satellite & Rocket Engineering", "Digital Twins", "Cybersecurity"],
} as const;

/** A role as it is written on the page: "Founder — ISHAVASYAM.ORG". */
export const roleLine = (role: { title: string; organisation: string }) => `${role.title} — ${role.organisation}`;

export const ABOUT = [
  "Sudarshana Karkala is a technology leader and systems architect working across Space, Aerospace, Digital Twins, Cybersecurity, Electric Vehicles and intelligent energy systems.",
  "His engineering background spans software architecture, cybersecurity, connected systems and advanced engineering R&D, with current research interests in Space Station systems, satellite engineering, rocket and propulsion systems, spacecraft health and Digital Twins.",
] as const;

export const PRIMARY_INITIATIVE = {
  id: "ishavasyam",
  eyebrow: "Primary initiative",
  name: SPACE_INITIATIVE.brand,
  subtitle: ["Research", "Engineering", "Experimentation"],
  copy: "Space-focused research and engineering initiative exploring Space Station systems, Satellite Engineering, Rocket & Propulsion research, spacecraft Digital Twins and autonomous spacecraft health.",
  links: [
    { label: "ishavasyam.org", href: SPACE_INITIATIVE.url, external: true, destination: "ishavasyam.org" },
    { label: "Space initiative", href: "/space", external: false, destination: "/space" },
  ],
} as const;

export const INITIATIVES = [
  {
    id: "ev_engineer",
    name: "EV.ENGINEER™",
    line: "Building World-Class Engineers to Solve Energy and EV Battery Challenges",
    note: "EV.ENGINEER™ represents the engineering identity of our team and the projects we build together.",
    links: [
      { label: "autonomous.ev.engineer", href: EV_ENGINEER_URL, external: true, destination: "autonomous.ev.engineer" },
      // The workshops, in pictures. A page of this site, so it opens in place on whichever host is being read.
      { label: "Workshop gallery", href: "/workshop-gallery", external: false, destination: "/workshop-gallery" },
    ],
  },
  {
    id: "car_software_systems",
    name: "CAR SOFTWARE SYSTEMS",
    line: "Electric Vehicle Engineering · Agentic AI Development",
    note: null,
    links: [
      { label: "carsoftwaresystems.com", href: "https://carsoftwaresystems.com/", external: true, destination: "carsoftwaresystems.com" },
      { label: "Workshop / Labs", href: "https://labs.ev.engineer/", external: true, destination: "labs.ev.engineer" },
    ],
  },
] as const;

export const FOCUS_AREAS = [
  { title: "Space Systems", items: ["Space Station", "Satellite Engineering", "Rocket & Propulsion", "Spacecraft Health"] },
  { title: "Digital Twins", items: ["Simulation", "Telemetry", "State Estimation", "FDIR", "Prognostics"] },
  { title: "Cybersecurity", items: ["Aerospace", "Automotive", "Connected Systems", "Data Integrity"] },
  { title: "EV & Energy", items: ["Battery Intelligence", "BMS", "Diagnostics", "Energy Systems"] },
] as const;

/** Said once on the page, and only here. What each project is, and how mature, is said on the project's own page. */
export const SCOPE_NOTE = "Space and Aerospace activities include research, simulation, engineering development and education.";

/** A title and a few words on what kind of thing it is. The page it links to is the evidence. */
export const SELECTED_WORK = [
  { id: "space_station", title: "Space Station Research", kind: "Research simulator", href: "/space/space-station" },
  { id: "satellite_engineering", title: "Satellite Engineering", kind: "Course", href: "/space/satellite-engineering" },
  { id: "advanced_propulsion_twin", title: "Advanced Rocket Propulsion Digital Twin", kind: "Engineering tutorial", href: "/space/rocket-engine-digital-twin-advanced" },
  { id: "cubetwin", title: "CubeTwin — CubeSat Digital Twin", kind: "Educational simulator", href: "/space/cubesat" },
  { id: "model_rocketry", title: "Model Rocketry", kind: "Learning programme", href: "/space/model-rocketry" },
  { id: "ev_battery_intelligence", title: "EV Battery Intelligence", kind: "Research", href: "/si-ems" },
] as const;

export const BACKGROUND: {
  eyebrow: string;
  intro: string;
  career: readonly { from: string; to: string; current?: true; organisations: readonly Organisation[]; role?: string; context?: string | readonly string[] }[];
  established: { heading: string; items: readonly string[] };
  emerging: { heading: string; items: readonly string[] };
} = {
  /** How long, and in what. It is a length of engineering and technology work, never of Space or Aerospace experience. */
  eyebrow: "20+ Years · Engineering · Technology · Leadership",
  /** Aerospace and Space come last, and as the more recent work, so the 20+ years above is not read as theirs. */
  intro:
    "Engineering and technology leadership experience spanning software architecture, cybersecurity, connected systems, mobile platforms, IoT, AI and EV battery technologies, extending more recently into aerospace and emerging space-systems research.",
  /**
   * In the owner's order, most recent first: the dates to the month, the organisation, the role and a few words of
   * domain, all as the owner gave them. Nothing is claimed beyond them: no responsibility, achievement, customer,
   * figure or registration. NMS, Ness and eNovate have no role on record, so none is written. None of the
   * employers is presented as a Space or Aerospace employer.
   */
  career: [
    {
      from: "2025-11",
      to: "2026-11",
      current: true,
      // The link is to its Space research page.
      organisations: [{ name: "Thasmai InfoTech Private Limited", href: "https://www.thasmaiinfotech.com/space-research", tracked: { id: "thasmai", destination: "thasmaiinfotech.com/space-research" } }],
      role: "Co-Founder · Director",
      context: "Technology entrepreneurship, engineering R&D and aerospace / space research initiatives.",
    },
    {
      from: "2024-12",
      to: "2026-11",
      current: true,
      // No legal status is on record for it in this repository, so it is named without "Private Limited".
      organisations: [{ name: "Gamyaa AeroSystems", href: "https://aerosystems.gamyaa.in/", tracked: { id: "gamyaa", destination: "aerosystems.gamyaa.in" } }],
      role: "Co-Founder",
      context: "Defence and Aerospace Engineering Intelligence initiatives, with a focus on quality, engineering workflows and emerging aerospace technologies.",
    },
    {
      from: "2021-07",
      to: "2024-12",
      organisations: [{ name: "Enphase Solar Energy Private Limited" }],
      role: "Senior Engineering Manager",
      context: ["Software Engineering", "Mobile Platforms", "Connected Energy Systems", "Cybersecurity"],
    },
    {
      from: "2011-10",
      to: "2021-07",
      organisations: [{ name: "McAfee Software India Private Limited" }],
      role: "Engineering Manager",
      context: ["Software Engineering", "Mobile Security", "Cybersecurity", "Developer Ecosystems"],
    },
    { from: "2005-05", to: "2011-09", organisations: [{ name: "NMS Communications", href: "https://www.nmscommunications.com/" }, { name: "Ness Digital Engineering" }, { name: "eNovate Media Solutions" }] },
  ],
  /** What the 20+ years are made of, and, kept apart from it, what the work has moved into recently. They are never merged into one line. */
  established: {
    heading: "Established Professional Experience",
    items: ["Software Engineering", "Systems Architecture", "Cybersecurity", "Mobile Platforms", "Connected Systems", "IoT", "Energy Systems", "Engineering Leadership"],
  },
  emerging: {
    heading: "Current / Emerging Engineering & Research Focus",
    items: ["Space Systems", "Aerospace", "Digital Twins", "Avionics", "Telemetry", "IVHM / FDIR / PHM", "AI-assisted Engineering", "EV Battery Intelligence"],
  },
};

/**
 * Work done for an organisation, all in one period. Each is a "Consulting Engagement" unless the owner gave another
 * description ("Trainer & Consultant"). None is a position, employment, partnership, endorsement or deployment.
 */
export const CONSULTING: {
  id: string;
  heading: string;
  from: string;
  to: string;
  intro: string;
  engagements: readonly { organisation: Organisation; role: string; areas: readonly string[] }[];
} = {
  id: "consulting-engagements",
  heading: "Consulting Engagements",
  from: "2024-12",
  to: "2026-11",
  intro:
    "Worked across selected engineering, technology and training engagements spanning mobile software, GenAI, automotive engineering, embedded systems, IoT, aerospace, EV battery technologies and space research.",
  engagements: [
    { organisation: { name: "Skill-Lync" }, role: "Trainer & Consultant", areas: ["iOS", "GenAI", "Agentic AI"] },
    { organisation: { name: "Schaeffler India" }, role: "Consulting Engagement", areas: ["GenAI for Automotive & Embedded Engineering"] },
    { organisation: { name: "Crompton Greaves Consumer Electricals" }, role: "Consulting Engagement", areas: ["Smart Home IoT", "iOS", "Bluetooth Low Energy (BLE)"] },
    { organisation: { name: "iFab Innovations" }, role: "Consulting Engagement", areas: ["Aerospace Engineering"] },
    {
      organisation: { name: ITELEMATICS.name, href: ITELEMATICS.canonicalUrl, tracked: { id: "itelematics", destination: "itelematics.com" } },
      role: "Consulting Engagement",
      areas: ["EV Battery", "Engineering Research", "Space Research"],
    },
  ],
};

/**
 * Students taught and mentored, at the institutions where it happened. An institution is named as the place of the
 * engagement only: he was not employed there, and no partnership with it is claimed.
 */
export const ACADEMIC: {
  id: string;
  heading: string;
  since: string;
  intro: string;
  institutionsHeading: string;
  institutions: readonly { name: string; place?: string }[];
  initiative: { eyebrow: string; name: string; copy: string };
  areasHeading: string;
  areas: readonly string[];
} = {
  id: "academic-engagement",
  heading: "Academic Engagement & Student Mentorship",
  since: "2001",
  intro:
    "Guided engineering students through webinars, seminars, technical sessions, project mentoring, engineering reviews, career guidance and industry-oriented project development across software, cybersecurity, embedded systems, IoT, EV technologies, GenAI, aerospace and space engineering.",
  institutionsHeading: "Engineering Institutions Engaged",
  institutions: [
    { name: "National Institute of Technology Karnataka (NITK)", place: "Surathkal" },
    { name: "Canara Engineering College", place: "Benjanapadavu, Mangaluru" },
    { name: "SRM Institute of Science and Technology", place: "Tiruchirappalli" },
    { name: "NMAM Institute of Technology (NMAMIT)", place: "Nitte" },
    { name: "A J Institute of Engineering & Technology", place: "Mangaluru" },
    { name: "Srinivas Institute of Technology", place: "Mangaluru" },
    { name: "Sahyadri College of Engineering & Management", place: "Mangaluru" },
    { name: "SDM Institute of Technology", place: "Ujire" },
    { name: "SNM Polytechnic", place: "Moodbidri" },
    { name: "Mangalore Institute of Technology & Engineering (MITE)" },
    { name: "Padre Conceicao College of Engineering", place: "Goa" },
    { name: "BMS College of Engineering", place: "Bengaluru" },
    { name: "Dayananda Sagar College of Engineering", place: "Bengaluru" },
    { name: "Malnad College of Engineering", place: "Hassan" },
    { name: "VTU Constituent College", place: "Chintamani" },
  ],
  /** Student activities he initiated within McAfee's CSR-related student initiatives. Not a programme he founded or owned. */
  initiative: {
    eyebrow: "Industry–Academia Initiative",
    name: "McAfee Student Developer Program",
    copy: "Initiated student-focused activities through the McAfee Student Developer Program, supporting engineering engagement, project guidance, internships and industry exposure as part of McAfee's CSR-related student initiatives.",
  },
  areasHeading: "Engagement Areas",
  areas: ["Webinars", "Seminars", "Technical Sessions", "Student Project Guidance", "Technical Mentoring", "Engineering Reviews", "Industry Exposure", "Internships", "Innovation & R&D Guidance"],
};

/**
 * The degree, the certifications and the continuing professional learning, one row each.
 * A row has either the name of a programme or, for learning that spans several subjects, its areas.
 * `status` marks what is not finished, so that it is never read as a credential already held.
 */
export const WORKSHOPS: {
  id: string;
  heading: string;
  entries: readonly { institution: string; programme?: string; areas?: readonly string[]; meta?: string; status?: "in-progress" }[];
} = {
  id: "workshops",
  heading: "Workshops & Certifications",
  entries: [
    { institution: "NITK Surathkal", programme: "B.E. — Information Technology", meta: "Education" },
    { institution: "IIT Madras — CODE", programme: "Electric Vehicle Engineering & Development", meta: "Professional certification" },
    // The areas of his continuing learning with IN-SPACe and what kind of thing it is, both as the owner
    // states them. No lecture is listed as a certification of its own, and no title is claimed from it.
    { institution: "IN-SPACe", areas: ["Model Rocketry", "CANSAT", "Semiconductor", "Aerospace & Space Systems"], meta: "Workshops & Certification" },
    // The national workshop NW-ASHM 2026, named and described as the owner gives it.
    { institution: "CSIR-NAL", programme: "Aircraft Structural Health Monitoring (NW-ASHM 2026) from CSIR–National Aerospace Laboratories", meta: "Workshops & Certification" },
    { institution: "EV Society™", programme: "Certified EV Technology Officer (EVTO™)", meta: "In progress · expected Mar 2028", status: "in-progress" },
    { institution: "Business P.A.C.E.", programme: "Business & Entrepreneurship Development", meta: "Rajiv Talreja / QuantumLeap" },
  ],
};

export const CONTACT = {
  id: "contact",
  heading: "Contact / Consultation",
  topics: ["Space Research", "Digital Twins", "Cybersecurity", "Systems Architecture", "Engineering Consultation"],
  actions: [
    { type: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/sudarshanakarkala/", destinationType: "external", ariaLabel: "Sudarshana Karkala on LinkedIn (opens in a new tab)" },
    { type: "resume", label: "Resume (PDF)", href: "https://carsoftwaresystems.com/public/sudarshanakarkala.pdf", destinationType: "document", ariaLabel: "Resume (PDF) of Sudarshana Karkala (opens in a new tab)" },
    { type: "consultation", label: "Consulting", href: "/consulting", destinationType: "internal", ariaLabel: null },
  ],
} as const;

/** The day the profile was last reviewed: the date on the page and the page's `dateModified`. */
export const LAST_REVIEWED = { iso: "2026-10-19", shown: "19 October 2026" } as const;
