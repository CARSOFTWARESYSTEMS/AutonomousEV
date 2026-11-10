// How the Academy is delivered, who may enquire and the notices every Academy
// page carries. Status words are deliberate: "Available" only for what a
// visitor can use today; everything else is "Planned".

export type FormatStatus = "Available" | "Planned";

export interface Format {
  title: string;
  mode: "Online" | "Offline";
  status: FormatStatus;
  description: string;
  details: string[];
}

export const FORMATS: Format[] = [
  {
    title: "Self-paced 3D missions",
    mode: "Online",
    status: "Available",
    description: "Play the interactive missions in a browser on a phone, tablet or computer. No account needed.",
    details: ["Three missions available", "Progress is kept only in this browser", "2D view for devices without 3D graphics"],
  },
  {
    title: "Live online classes",
    mode: "Online",
    status: "Planned",
    description: "Small-group classes that work through each track at the 14–16 or 17–18 level, with a mentor.",
    details: ["Schedules, fees and eligibility will be published per cohort", "Express interest to be told when a cohort opens"],
  },
  {
    title: "CanSat workshop",
    mode: "Offline",
    status: "Planned",
    description: "Hands-on build of a can-sized payload: sensors, radio, power and a parachute, ending in a supervised test.",
    details: ["Dates, venue, fees and eligibility will be published per workshop", "Under-18 participants need a parent or guardian's written consent"],
  },
  {
    title: "Model Rocketry workshop",
    mode: "Offline",
    status: "Planned",
    description: "Design and build a model rocket, check its stability, and take part in a supervised launch.",
    details: ["Dates, venue, fees, eligibility and safety arrangements will be published per workshop", "Under-18 participants need a parent or guardian's written consent"],
  },
];

/** Safety boundaries for the rocketry and CanSat content. */
export const SAFETY_PRINCIPLES: string[] = [
  "This Academy never teaches how to make rocket motors, propellants or energetic materials.",
  "Any launch or drop test happens only under the supervision of qualified adults and within applicable local rules.",
  "Simulations here are for learning. They are simplified and must not be used to design real flight hardware.",
];

export const DISCLAIMERS = {
  independence:
    "Space Academy is part of an independent ISHAVASYAM.ORG education initiative. It is not affiliated with, endorsed by, or run on behalf of ISRO, IN-SPACe, NSIL or the Department of Space.",
  eligibility:
    "Learning here does not register anyone for, or make anyone eligible for, any national or international competition. Each competition's organisers set its rules and eligibility.",
  simulated:
    "Interactive missions use simplified models and simulated, illustrative values. They are labelled as such and are not flight data.",
  ages:
    "Written for learners aged 14 to 18. Anyone may play the self-paced missions; enquiries from under-18s need a parent or guardian.",
  privacy:
    "Missions never ask for a name, school, age or contact details. Progress is stored only in this browser and can be cleared at any time. This site uses Google Analytics to count page visits and mission steps.",
  signIn:
    "Some of the site's existing tutorials ask visitors to sign in with a Google account. If you are under 18, check with a parent or guardian before signing in.",
};

export type EnquiryRole = "student" | "parent" | "school";

export const ENQUIRY_PATHS: Record<EnquiryRole, { label: string; intro: string; include: string[]; consent?: string }> = {
  student: {
    label: "I am a student",
    intro: "Great that you want to take part. Because you are under 18, a parent or guardian should know about your enquiry and agree to it before it is sent.",
    include: ["Your parent or guardian's contact details, not your own phone number", "Which track or workshop interests you", "Your age group: 14–16 or 17–18"],
    consent: "My parent or guardian knows about this enquiry and agrees to it being sent.",
  },
  parent: {
    label: "I am a parent or guardian",
    intro: "Enquire on behalf of a learner aged 14 to 18. We reply to you, not to the learner.",
    include: ["The learner's age group and interests", "Whether online classes or an offline workshop suits you", "Your preferred city for workshops"],
  },
  school: {
    label: "I represent a school",
    intro: "Schools and educators can enquire about classes, workshops or using the missions in lessons.",
    include: ["School name and city", "Approximate number of learners and their ages", "Online, on-campus or both"],
  },
};
