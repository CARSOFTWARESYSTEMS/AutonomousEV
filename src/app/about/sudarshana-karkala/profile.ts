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
//   - iTelematics Software Private Limited is where he is a Consultant.
import { SPACE_INITIATIVE } from "@/data/space-initiative";
import { ITELEMATICS } from "@/data/public-entities";

/** EV.ENGINEER's own address, as the Space header gives it. Not "/": this page is also served on hosts whose root is another page. */
export const EV_ENGINEER_URL = "https://ev.engineer/";

export const HERO = {
  name: "Sudarshana Karkala",
  /** The engineering identity. Not a role. */
  identity: "EV.ENGINEER™",
  /** The primary role, shown larger than the one after it. */
  primaryRole: { title: "Founder", organisation: SPACE_INITIATIVE.brand },
  secondaryRole: { title: "Consultant", organisation: ITELEMATICS.name },
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
    link: { label: "ev.engineer", href: EV_ENGINEER_URL, destination: "ev.engineer" },
  },
  {
    id: "car_software_systems",
    name: "CAR SOFTWARE SYSTEMS",
    line: "Electric Vehicle Engineering · Agentic AI Development",
    note: null,
    link: { label: "carsoftwaresystems.com", href: "https://carsoftwaresystems.com/", destination: "carsoftwaresystems.com" },
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

export const BACKGROUND = {
  roles: [
    { title: "Consultant", organisation: ITELEMATICS.name },
    { title: "Co-Founder", organisation: "Thasmai InfoTech Private Limited" },
  ],
  /** The long-standing experience, in the words the profile has always used for it. It names no Space or Aerospace experience. */
  experience: "Over two decades of experience across software architecture, cybersecurity, connected systems, IoT, telematics, AI, mobility, EV and energy platforms.",
} as const;

/** `status` marks what is not finished, so that it is never read as a credential already held. */
export const EDUCATION: readonly { institution: string; programme: string; meta: string; status?: "in-progress" }[] = [
  { institution: "NITK Surathkal", programme: "B.E. — Information Technology", meta: "Education" },
  { institution: "IIT Madras — CODE", programme: "Electric Vehicle Engineering & Development", meta: "Professional certification" },
  { institution: "IN-SPACe", programme: "Essentials of Model Rocketry", meta: "Workshop · Aug 2026" },
  { institution: "EV Society™", programme: "Certified EV Technology Officer (EVTO™)", meta: "In progress · expected Mar 2028", status: "in-progress" },
  { institution: "Business P.A.C.E.", programme: "Business & Entrepreneurship Development", meta: "Rajiv Talreja / QuantumLeap" },
];

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
export const LAST_REVIEWED = { iso: "2026-10-12", shown: "12 October 2026" } as const;
