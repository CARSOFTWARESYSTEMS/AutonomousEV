// Content for the /space page. Kept data-driven and separate from page.tsx
// so copy changes don't require touching layout/markup.
//
// Content integrity: no fabricated counts, testimonials, partners, or
// "already live" claims. Anything not yet real is labelled Planned /
// Proposed / Research Direction / In Development.

export type IconName =
  | "shield"
  | "satellite"
  | "orbit"
  | "activity"
  | "heartPulse"
  | "cpu"
  | "alertTriangle"
  | "lifeBuoy"
  | "graduationCap"
  | "flaskConical"
  | "rocket"
  | "radio"
  | "radar"
  | "refreshCw"
  | "globe"
  | "users"
  | "layers"
  | "checkCircle";

export const heroSummary: { value: string; label: string }[] = [
  { value: "Ages 14–18", label: "Space Education" },
  { value: "Engineering", label: "Internships & Research" },
  { value: "Young Founders", label: "Startup Pathway" },
  { value: "2040", label: "Long-Term Mission" },
];

export const missionConsole: {
  label: string;
  status: "Nominal" | "Monitor" | "Degraded" | "Advisory";
  icon: IconName;
}[] = [
  { label: "Electrical Power", status: "Nominal", icon: "activity" },
  { label: "Thermal Control", status: "Monitor", icon: "cpu" },
  { label: "Attitude Control", status: "Nominal", icon: "orbit" },
  { label: "Communications", status: "Degraded", icon: "radio" },
  { label: "Recovery Mode", status: "Advisory", icon: "lifeBuoy" },
];

export const missionLoop: { step: string; icon: IconName }[] = [
  { step: "Observe telemetry", icon: "activity" },
  { step: "Detect anomaly", icon: "alertTriangle" },
  { step: "Diagnose fault", icon: "cpu" },
  { step: "Predict impact", icon: "radar" },
  { step: "Recover safely", icon: "lifeBuoy" },
  { step: "Verify recovery", icon: "checkCircle" },
];

export const visionReferences: { label: string; href: string }[] = [
  { label: "Union Cabinet approves India's Mission (2024)", href: "https://www.isro.gov.in/UnionCabinetApprovesIndiasMission.html" },
  { label: "Mars Orbiter Mission, MOM (2013)", href: "https://www.isro.gov.in/MOM.html" },
  { label: "Achievements, Department of Space 2025", href: "https://www.isro.gov.in/Achievements_Department_of_Space_2025.html" },
  { label: "Indian Space Policy 2023 (PDF)", href: "https://www.isro.gov.in/media_isro/pdf/IndianSpacePolicy2023.pdf" },
];

export const pathwayStages: {
  stage: string;
  title: string;
  items: string[];
  icon: IconName;
  color: string;
}[] = [
  {
    stage: "Discover",
    title: "Ages 14–18",
    icon: "graduationCap",
    color: "#7C3AED",
    items: ["Spacecraft systems", "Sensors and telemetry", "Faults, redundancy and safe mode", "Mission-health challenge"],
  },
  {
    stage: "Engineer",
    title: "Higher Education",
    icon: "cpu",
    color: "#3B82F6",
    items: ["Simulator and telemetry engineering", "Digital twins", "Fault detection, isolation and recovery", "Hardware-in-the-loop validation"],
  },
  {
    stage: "Research",
    title: "Applied Teams",
    icon: "flaskConical",
    color: "#06B6D4",
    items: ["Verified algorithms", "Fault libraries and datasets", "Papers and patent candidates", "Academic and industry validation"],
  },
  {
    stage: "Venture",
    title: "Young Founders",
    icon: "rocket",
    color: "#F59E0B",
    items: ["Customer discovery", "Validated prototype", "Responsible incubation", "Space products and services"],
  },
];

export const educationAreas: string[] = [
  "Spacecraft subsystems",
  "Telemetry and sensors",
  "Safe mode and redundancy",
  "Mission communication delays",
  "Basic anomaly reasoning",
  "CanSat or simulated mission-health activity",
  "Engineering ethics and safety",
];

export const internshipWorkAreas: string[] = [
  "Mission and telemetry simulator",
  "Fault injection",
  "Digital twin",
  "Anomaly detection",
  "Fault isolation and diagnosis",
  "Prognostics",
  "Safe recovery logic",
  "Cyber-resilient telemetry",
  "Verification and safety assurance",
];

export const researchLayers: { title: string; icon: IconName }[] = [
  { title: "Mission & subsystem simulation", icon: "activity" },
  { title: "Digital twin & state estimation", icon: "layers" },
  { title: "Fault detection, isolation & diagnosis (FDIR)", icon: "alertTriangle" },
  { title: "Prognostics & safe recovery", icon: "lifeBuoy" },
  { title: "Verification & assurance", icon: "shield" },
];

export const plannedLabs: { title: string; purpose: string; icon: IconName; color: string }[] = [
  { title: "Telemetry & Mission Operations Simulator", purpose: "Practice reading and reacting to simulated spacecraft telemetry streams.", icon: "activity", color: "#7C3AED" },
  { title: "Spacecraft Power Fault Lab", purpose: "Explore electrical power system faults and safe-mode responses.", icon: "cpu", color: "#3B82F6" },
  { title: "Thermal Anomaly Lab", purpose: "Study thermal control anomalies and their mission impact.", icon: "activity", color: "#06B6D4" },
  { title: "Attitude Sensor Fault Lab", purpose: "Investigate attitude-control sensor faults and reconfiguration.", icon: "orbit", color: "#8B5CF6" },
  { title: "Communications Degradation Lab", purpose: "Model link degradation and communication-delay scenarios.", icon: "radio", color: "#3B82F6" },
  { title: "Fault Injection & Diagnosis Lab", purpose: "Inject faults into a simulated bus and practice diagnosis.", icon: "alertTriangle", color: "#F59E0B" },
  { title: "Digital Twin Calibration Lab", purpose: "Calibrate a spacecraft digital twin against simulated telemetry.", icon: "layers", color: "#10B981" },
  { title: "Safe Recovery Verification Lab", purpose: "Verify bounded, supervised recovery actions before they run.", icon: "shield", color: "#06B6D4" },
];

export const researchThemes: { title: string; status: "Proposed" | "Research Direction"; color: string }[] = [
  { title: "Explainable spacecraft anomaly detection", status: "Research Direction", color: "#7C3AED" },
  { title: "Multi-sensor fault isolation", status: "Research Direction", color: "#3B82F6" },
  { title: "Remaining useful life and degradation prediction", status: "Proposed", color: "#06B6D4" },
  { title: "Mission-impact assessment", status: "Proposed", color: "#8B5CF6" },
  { title: "Safe-mode recommendation", status: "Research Direction", color: "#10B981" },
  { title: "Redundancy and reconfiguration", status: "Proposed", color: "#F59E0B" },
  { title: "Cyber-physical anomaly discrimination", status: "Research Direction", color: "#3B82F6" },
  { title: "Verification of bounded autonomous recovery", status: "Proposed", color: "#7C3AED" },
];

export const roadmap: { year: string; title: string; desc: string; color: string }[] = [
  { year: "Year 1", title: "Foundation", desc: "Reference CubeSat, telemetry simulator, fault scenarios, first education and internship pilots.", color: "#3B82F6" },
  { year: "Year 2", title: "Diagnosis", desc: "Subsystem models, fault detection, explainable diagnosis, initial research outputs.", color: "#7C3AED" },
  { year: "Year 3", title: "Prognostics", desc: "Degradation prediction, supervised recovery, hardware-in-the-loop testbed.", color: "#8B5CF6" },
  { year: "Year 4", title: "Validation", desc: "Academic/industry design partner and flight-representative pilot.", color: "#06B6D4" },
  { year: "Year 5", title: "Demonstration", desc: "Independently verified prototype and startup-ready technology components.", color: "#10B981" },
];

export const participationAudiences: string[] = [
  "School students and educators",
  "Engineering students",
  "Faculty and researchers",
  "Retired scientists and technical mentors",
  "Space startups and industry",
  "Government and institutional stakeholders",
  "CSR and scholarship partners",
  "Young founders",
];

export const accessModels: string[] = [
  "Participant-funded",
  "Institution-funded",
  "CSR-sponsored",
  "Scholarship-supported",
  "Grant-funded",
  "Industry-sponsored",
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "What is the single focus of the Space initiative?",
    a: "One mission: Autonomous Spacecraft Health Management and Safe Recovery — helping future spacecraft observe their own telemetry, detect anomalies, and recover safely with bounded, supervised autonomy.",
  },
  {
    q: "Is this an official ISRO or government programme?",
    a: "No. This is an independent EV Society initiative. References to national space goals are provided for educational context and do not imply endorsement, affiliation or partnership with ISRO, IN-SPACe, NSIL or the Department of Space.",
  },
  {
    q: "Who can participate?",
    a: "School students (ages 14–18), engineering students, faculty and researchers, retired scientists and mentors, space startups and industry, government and institutional stakeholders, CSR and scholarship partners, and young founders.",
  },
  {
    q: "What will students aged 14–18 learn?",
    a: "Planned learning areas include spacecraft subsystems, telemetry and sensors, safe mode and redundancy, mission communication delays, basic anomaly reasoning, a CanSat or simulated mission-health activity, and engineering ethics and safety.",
  },
  {
    q: "How are internships different from paid training?",
    a: "Paid training and internships are distinct. Internships are merit-based and governed by the published terms of each cohort; sponsored or stipended opportunities will be identified explicitly when available.",
  },
  {
    q: "Does EV Society own student or startup intellectual property?",
    a: "No. Student, academic, EV Society, iTelematics and startup intellectual-property rights are governed through transparent written agreements. Participation does not automatically transfer a participant's IP to iTelematics.",
  },
  {
    q: "Are the labs and digital twin already operational?",
    a: "No. The labs, digital twin, and research platform described here are Planned or Research Direction items, not operational products. Status is labelled honestly on each section.",
  },
  {
    q: "How can schools, faculty, experts and industry express interest?",
    a: "Use the Express Interest links on this page, which open our Expression of Interest form. Submitting the form records your interest only — it does not confirm selection, admission, internship, stipend, funding, partnership or participation. For anything else, use the Partner With Us or Contact Us links, which route to our existing contact channel.",
  },
  {
    q: "Will programmes be free?",
    a: "Not positioned as free. Programmes may be participant-funded, institution-funded, CSR-sponsored, scholarship-supported, grant-funded, or industry-sponsored. Availability, selection, fees, sponsorship and stipend conditions will be published for each programme.",
  },
  {
    q: "Where do commercial products and services belong?",
    a: "Commercial products and services, where applicable, are handled separately by iTelematics Software Private Limited under explicit agreements — not by EV Society, which focuses on the public-interest education, research and pre-incubation mission.",
  },
];
