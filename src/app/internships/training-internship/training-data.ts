// Phase fees: 3 months per phase, online ₹11,800/mo, workspace ₹17,700/mo
export const PHASES = [
  {
    num: "00", label: "Phase 0", title: "Selection Process",
    duration: "Before Program Begins", effort: "Eligibility, Code Test & Interview",
    items: ["Candidate eligibility check", "Code test", "Technical interview", "Career discussion", "Selection for Phase 1"],
    phaseTotal: null, milestone: null, isCore: false,
  },
  {
    num: "01", label: "Phase 1", title: "Training",
    duration: "Month 1 – Month 3", effort: "15 hrs/week · Mon–Fri 2h · Sat 5h",
    items: ["Month 1: Introduction, fundamentals, module overview, feature concepts", "Month 2: Feasibility study, wireframes, system analysis, documentation, design", "Month 3: Development basics, testing process, localization, security testing, training completion"],
    phaseTotal: { 
      online: "₹35,400", workspace: "₹53,100", note: "3 months incl. GST",
      monthlyOnline: "₹11,800/mo", monthlyWorkspace: "₹17,700/mo"
    },
    milestone: "Training Completion Certificate", isCore: false,
  },
  {
    num: "02", label: "Phase 2", title: "Proof of Concept",
    duration: "Month 4 – Month 6", effort: "15 hrs/week",
    items: ["Month 4: Feature 1 feasibility, wireframe, design, working POC demo", "Month 5: Feature 2 feasibility, wireframe, design, working POC demo", "Month 6: Feature 3 feasibility, wireframe, design, working POC demo"],
    phaseTotal: { 
      online: "₹35,400", workspace: "₹53,100", note: "3 months incl. GST",
      monthlyOnline: "₹11,800/mo", monthlyWorkspace: "₹17,700/mo"
    },
    milestone: null, isCore: false,
  },
  {
    num: "03", label: "Phase 3", title: "Product Development",
    duration: "Month 7 – Month 9", effort: "15 hrs/week",
    items: ["Month 7: Feature 1 development, unit testing, code review, demo", "Month 8: Feature 2 development, unit testing, code review, demo", "Month 9: Feature 3 development, unit testing, code review, demo"],
    phaseTotal: { 
      online: "₹35,400", workspace: "₹53,100", note: "3 months incl. GST",
      monthlyOnline: "₹11,800/mo", monthlyWorkspace: "₹17,700/mo"
    },
    milestone: null, isCore: true,
  },
  {
    num: "04", label: "Phase 4", title: "Testing & Release Readiness",
    duration: "Month 10 – Month 12", effort: "15 hrs/week",
    items: ["Month 10: Quality testing, security testing, bug fixes, demo after fixes", "Month 11: Integration testing, beta testing, production demo, webinar / seminar", "Month 12: Pre-release checklist, production deployment, post-release verification, final review"],
    phaseTotal: { 
      online: "₹35,400", workspace: "₹53,100", note: "3 months incl. GST",
      monthlyOnline: "₹11,800/mo", monthlyWorkspace: "₹17,700/mo"
    },
    milestone: "Internship Completion Certificate", isCore: false,
  },
];

export const MONTH13 = [
  "Award / certificate distribution", "Internship completion certificate",
  "EV.ENGINEER™ internship completion recognition", "Placement support",
  "Mock interviews", "Resume improvement", "Career guidance",
];

export const DELIVERABLES = [
  "Requirements document", "Wireframes", "System analysis document",
  "High-level design", "Detailed design", "Safety & security design",
  "Working POC", "Product module", "Unit test cases",
  "Code review reports", "Quality testing report", "Security testing report",
  "Release readiness checklist", "Production demo", "Final presentation",
];

export const OUTCOMES = [
  "Understand real engineering workflows",
  "Build structured product documentation",
  "Design and develop working POCs",
  "Participate in product development",
  "Understand testing and release readiness",
  "Improve EV engineering competency",
  "Prepare for EV industry job roles",
];

export const ROLES = [
  "EV Software Engineer", "EV Battery Diagnostics Engineer",
  "Embedded Systems Engineer", "BMS Software Engineer",
  "Telematics Engineer", "EV Data & Analytics Engineer",
  "Product Development Engineer", "QA / Testing Engineer",
  "Technical Lead Trainee",
];

export const STATS = [
  { value: "12", label: "Months Program" },
  { value: "6", label: "Months Training" },
  { value: "6", label: "Months Internship" },
  { value: "15h", label: "Per Week" },
  { value: "15+", label: "Deliverables" },
  { value: "M13", label: "Certification" },
];
