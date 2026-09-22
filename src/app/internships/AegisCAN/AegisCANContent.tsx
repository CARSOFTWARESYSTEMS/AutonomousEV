import Link from "next/link";
import styles from "./page.module.css";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const LEARNING_ARCHITECTURE = [
  "Battery Fundamentals",
  "Battery Pack",
  "BMS",
  "BESS",
  "Embedded Controller / ECU",
  "CAN",
  "CAN Data Acquisition",
  "Monitoring",
  "Fault Injection",
  "Cybersecurity",
  "Anomaly Detection",
  "Validation",
  "Root Cause Analysis",
  "Engineering Evidence",
];

const BESS_FLOW = [
  "Battery Cells",
  "Modules",
  "Packs / Racks",
  "BMS",
  "Sensors",
  "Contactors / Protection",
  "DC Bus",
  "Power Conversion System / Inverter",
  "Energy Management System",
  "Thermal Management",
  "Communication",
  "Monitoring / SCADA",
];

const ARCHITECTURE_PIPELINE = [
  "Battery / BESS Simulator",
  "BMS Simulator",
  "CAN Message Generator",
  "Virtual CAN Bus",
  "CAN Logger",
  "AegisCAN Monitor",
  "Feature Extraction",
];

const DETECTION_BOX = ["Rule Detection", "Statistical Analysis", "Optional ML"];

const ARCHITECTURE_PIPELINE_TAIL = ["Threat / Fault Classifier", "Dashboard", "Engineering Evidence"];

type Persona = { badge: string; title: string; icon: string; body: string; needs: string[] };

const PERSONAS: Persona[] = [
  {
    badge: "Primary",
    icon: "🎓",
    title: "5th-Semester E&C / ECE / EEE / EE Student",
    body: "Starts with basic electronics, basic electrical circuits, microcontroller fundamentals, basic programming, and digital electronics. May not yet know batteries, BMS, BESS, CAN, DBC, automotive cybersecurity, intrusion detection, or validation engineering.",
    needs: [
      "A structured, beginner-friendly weekly path",
      "Simulation-first tools — no HV lab required",
      "Clear evidence to show mentors and interviewers",
    ],
  },
  {
    badge: "Secondary",
    icon: "🧑‍🏫",
    title: "Faculty / Project Mentor",
    body: "Guides and evaluates student progress across the 12 weeks alongside the student's regular academic subjects.",
    needs: [
      "Weekly progress visibility",
      "Engineering evidence and test results",
      "Student contribution tracking",
      "A reproducible final demonstration",
    ],
  },
  {
    badge: "Reviewer",
    icon: "🧑‍💼",
    title: "Industry Reviewer",
    body: "Assesses the finished project the way a hiring engineer or panel would — for fundamentals, not polish.",
    needs: [
      "What the student built",
      "What the student personally contributed",
      "Whether the student understands fundamentals",
      "How the student tested the solution, and whether results are reproducible",
    ],
  },
];

type SkillCategory = { icon: string; title: string; items: string[] };

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    icon: "🔋",
    title: "Battery Engineering",
    items: [
      "Cell / module / pack fundamentals",
      "Voltage, current, temperature",
      "SOC (State of Charge)",
      "SOH (State of Health)",
      "SOP concept",
      "Cell balancing fundamentals",
      "Battery safety concepts",
    ],
  },
  {
    icon: "🛡️",
    title: "BMS Engineering",
    items: [
      "BMS architecture",
      "Sensors",
      "Protection functions",
      "Fault states",
      "Communication",
      "Diagnostics",
    ],
  },
  {
    icon: "🏭",
    title: "BESS",
    items: [
      "BESS architecture",
      "Battery racks / packs",
      "BMS hierarchy",
      "PCS concept",
      "EMS concept",
      "Thermal management",
      "System monitoring",
      "Commissioning concepts",
    ],
  },
  {
    icon: "🔗",
    title: "Communication",
    items: [
      "CAN, CAN frame, CAN ID",
      "DLC, payload, arbitration",
      "Message timing",
      "CAN FD introduction",
      "DBC concept",
      "Awareness: SPI, UART, Modbus, Ethernet",
    ],
  },
  {
    icon: "✅",
    title: "Validation Engineering",
    items: [
      "Requirement → test case traceability",
      "Test planning",
      "Functional testing",
      "Fault injection",
      "Boundary testing",
      "Negative testing",
      "Regression testing",
      "Test evidence & defect reporting",
    ],
  },
  {
    icon: "📊",
    title: "Data Analysis",
    items: [
      "CAN logs & timestamps",
      "Message frequency",
      "Sensor trends",
      "SOC / SOH data",
      "Fault events",
      "Anomaly analysis",
    ],
  },
  {
    icon: "🔒",
    title: "Cybersecurity",
    items: [
      "Threat modelling",
      "Attack surface",
      "Spoofing concepts",
      "Replay concepts",
      "Flooding concepts",
      "Unauthorized CAN IDs",
      "Anomalous sensor values",
      "Defensive monitoring",
    ],
  },
  {
    icon: "🐍",
    title: "Automation (Python)",
    items: [
      "CAN simulation",
      "Log processing",
      "Test automation",
      "Anomaly detection",
      "Reporting",
    ],
  },
  {
    icon: "🛠️",
    title: "Engineering Skills",
    items: [
      "Debugging & troubleshooting",
      "Root-cause analysis",
      "Requirements writing",
      "Test documentation",
      "Git",
      "Technical reports & presentations",
      "Teamwork",
    ],
  },
];

type Story = { id: string; role: string; text: string };

const USER_STORIES: Story[] = [
  { id: "US-01", role: "As a student", text: "I want to simulate battery parameters so that I understand how battery operating data changes." },
  { id: "US-02", role: "As a student", text: "I want to monitor simulated battery signals so that I understand BMS functionality." },
  { id: "US-03", role: "As a student", text: "I want to encode BMS data into CAN messages so that I understand vehicle/network communication." },
  { id: "US-04", role: "As a validation engineer", text: "I want to record CAN messages so that system behaviour can be analysed." },
  { id: "US-05", role: "As a validation engineer", text: "I want to inject controlled faults so that I can verify expected system responses." },
  { id: "US-06", role: "As a security engineer", text: "I want to identify unusual CAN messages so that suspicious communication can be investigated." },
  { id: "US-07", role: "As a test engineer", text: "I want evidence around detected faults so that I can determine why the failure occurred." },
  { id: "US-08", role: "As an engineering team", text: "we want reproducible test evidence so that another engineer can verify our results." },
];

const FUNCTIONAL_REQUIREMENTS = [
  "Simulate battery/BMS data.",
  "Generate CAN-like frames.",
  "Support timestamp.",
  "Support CAN ID.",
  "Support DLC.",
  "Support payload.",
  "Decode selected BMS signals.",
  "Display voltage.",
  "Display current.",
  "Display temperature.",
  "Display SOC.",
  "Display SOH.",
  "Log messages.",
  "Calculate message frequency.",
  "Identify unknown CAN IDs.",
  "Identify abnormal message frequency.",
  "Identify configurable out-of-range BMS values.",
  "Provide controlled replay simulation.",
  "Provide controlled spoofing simulation.",
  "Provide controlled flooding simulation.",
  "Generate alerts.",
  "Assign anomaly category.",
  "Provide severity.",
  "Retain evidence.",
  "Export or preserve test results.",
];

const NON_FUNCTIONAL_REQUIREMENTS = [
  "Beginner-friendly",
  "Modular architecture",
  "Reproducible simulation",
  "Deterministic test scenarios where practical",
  "Readable code",
  "Documented configuration",
  "Clear error handling",
  "No dependency on high-voltage equipment",
  "Safe lab operation",
  "Reasonable performance for student laptops",
  "Maintainable code",
  "Traceable requirements and tests",
];

const UI_UX_REQUIREMENTS = [
  "Desktop, tablet and mobile are all first-class — verified at 360px, 390px, 768px, 1024px and 1440px",
  "No horizontal scrolling, clipped headings, overflowing tables, tiny diagrams or overlapping buttons",
  "Weekly plan and interview-prep content use native, keyboard-accessible <details> accordions — never the only way to see essential information",
  "Tables scroll horizontally within their own container on narrow screens instead of breaking the page layout",
  "Semantic heading hierarchy, visible focus states and sufficient text contrast throughout",
];

const ACCEPTANCE_CRITERIA = [
  "A student can run the battery/BMS simulator and see voltage, current, temperature, SOC and SOH change over time (FR-01, FR-08–FR-12).",
  "Simulated BMS signals are encoded into CAN-like frames carrying timestamp, CAN ID, DLC and payload (FR-02–FR-06).",
  "The CAN logger records every generated frame to a CSV/JSON log that a decoder can replay (FR-13).",
  "Injecting an unknown CAN ID, an abnormal message rate, or an out-of-range BMS value produces an alert with a category and severity within the same test run (FR-15–FR-23).",
  "Every functional requirement has at least one passing automated or manually-executed test case with recorded evidence (FR-24, FR-25).",
  "The final dashboard shows pack voltage, current, SOC, SOH, temperature, active CAN IDs, messages/sec, faults, anomalies, severity and evidence in one screen.",
];

type Week = {
  n: number;
  title: string;
  learn: string[];
  build: string;
  deliverables: string[];
  demo: string;
};

const WEEKS: Week[] = [
  {
    n: 1,
    title: "Project Orientation & Industry Context",
    learn: ["What is EV?", "What is BESS?", "What is Battery?", "What is BMS?", "What is CAN?", "What does a BMS / Test / Validation engineer do?", "Why cybersecurity matters"],
    build: "Set up Git repository, project structure, Python environment, documentation structure.",
    deliverables: ["Project Charter", "Problem Statement", "Learning Goals", "Initial Architecture", "Git repository", "Individual responsibility matrix"],
    demo: "README + architecture diagram.",
  },
  {
    n: 2,
    title: "Battery Fundamentals",
    learn: ["Cell, module, pack", "Series / parallel", "Voltage, current, capacity, energy", "SOC, SOH, SOP introduction", "Temperature", "Charging / discharging", "Battery safety"],
    build: "Create a simple battery data simulator. (Optional: explore an existing PyBaMM example model — see the Advanced Track below.)",
    deliverables: ["Battery Fundamentals Note", "Battery parameter dictionary", "Python battery simulator", "Sample dataset", "Plots / logs"],
    demo: "Show voltage / current / SOC / temperature changing over time.",
  },
  {
    n: 3,
    title: "BMS + BESS Fundamentals",
    learn: ["BMS: sensing, protection, balancing, contactors, fault management, SOC/SOH, communications", "BESS: battery rack, BMS, PCS, EMS, thermal management, protection, monitoring"],
    build: "Extend the simulator into a simplified BMS model. (Optional: map a PyBaMM output to a BMS signal for the Advanced Track.)",
    deliverables: ["BMS block diagram", "BESS architecture diagram", "Simulated BMS signals", "Fault state definitions"],
    demo: "Normal BMS operation + one simulated battery fault.",
  },
  {
    n: 4,
    title: "CAN Fundamentals",
    learn: ["CAN bus, CAN-H / CAN-L concept", "CAN controller, transceiver", "Arbitration", "CAN ID, DLC, payload, frame", "Message frequency", "CAN FD introduction", "DBC concept"],
    build: "Convert selected BMS parameters into CAN messages.",
    deliverables: ["CAN learning note", "CAN message map", "CAN ID definition", "Signal scaling definition", "CAN generator"],
    demo: "Show BMS values becoming CAN frames.",
  },
  {
    n: 5,
    title: "CAN Monitoring & Data Acquisition",
    learn: ["CAN logging", "Timestamps", "Message rates", "Decoding", "Engineering data acquisition"],
    build: "CAN logger and decoder.",
    deliverables: ["CAN logger", "CAN decoder", "CSV / JSON logs", "Message frequency analysis"],
    demo: "Raw CAN → decoded BMS values.",
  },
  {
    n: 6,
    title: "Validation Engineering",
    learn: ["Requirements, verification, validation", "Test plans, test cases", "Expected vs actual", "Traceability", "Boundary tests, negative tests"],
    build: "Create automated tests for the simulated BMS/CAN system.",
    deliverables: ["Test Plan", "Requirement Traceability Matrix", "Minimum 10 functional test cases", "Automated test results"],
    demo: "Run the test suite and show evidence.",
  },
  {
    n: 7,
    title: "Fault Injection & Root Cause Analysis",
    learn: ["Fault injection", "Diagnostics, debugging", "Root-cause analysis", "FMEA concept"],
    build: "Controlled faults: high temperature, low/high voltage, invalid SOC, missing CAN message, abnormal CAN frequency.",
    deliverables: ["Fault Catalogue", "Fault injection module", "RCA worksheet", "Evidence logs"],
    demo: "Inject fault → observe → diagnose → explain root cause.",
  },
  {
    n: 8,
    title: "CAN Cybersecurity Fundamentals",
    learn: ["Threat, vulnerability, risk", "Attack surface", "Spoofing, replay, flooding", "Unauthorized message", "Anomaly"],
    build: "Create controlled abnormal CAN scenarios. Exercises stay defensive and simulation-only.",
    deliverables: ["Threat Model", "Attack surface diagram", "Simulated security dataset", "Security requirements"],
    demo: "Normal CAN vs anomalous CAN.",
  },
  {
    n: 9,
    title: "AegisCAN Detection Engine",
    learn: ["Baselines, thresholds, rules", "Timing anomaly", "Payload anomaly"],
    build: "Implement detection for: unknown CAN ID, message-rate anomaly, sensor range anomaly, sudden signal change, missing/stale message.",
    deliverables: ["Detection Engine", "Detection Rules", "Alert schema", "Security test results"],
    demo: "Inject anomaly → detect → generate alert.",
  },
  {
    n: 10,
    title: "Data Analytics + Optional AI/ML",
    learn: ["Feature engineering", "Baseline behaviour", "Anomaly scores", "False positive / false negative", "Precision / recall concept"],
    build: "Mandatory: statistical analysis. Optional: a simple ML anomaly-detection experiment — AI/ML stays optional throughout.",
    deliverables: ["Feature list", "Baseline analysis", "Detection comparison", "Short ML experiment if feasible"],
    demo: "Explain why a message was classified as normal or anomalous.",
  },
  {
    n: 11,
    title: "Integration, Dashboard & QA",
    learn: ["System integration practices", "Regression testing", "Defect triage"],
    build: "Integrate Battery → BMS → CAN → Logger → Fault Injection → AegisCAN → Dashboard (Pack Voltage, Current, SOC, SOH, Temperature, Active CAN IDs, Messages/sec, Faults, Anomalies, Severity, Evidence).",
    deliverables: ["Integrated prototype", "Dashboard", "Regression tests", "Bug list", "QA report"],
    demo: "End-to-end demonstration.",
  },
  {
    n: 12,
    title: "Industry Readiness & Final Engineering Review",
    learn: ["Presenting engineering work", "Career framing of the project"],
    build: "Complete requirements, architecture, code, testing, security testing, traceability, engineering evidence, presentation, demo video, résumé project description.",
    deliverables: ["Final Report", "Final Test Report", "Security Test Report", "Requirements Traceability Matrix", "Architecture", "Source Code", "Demo Video", "Presentation", "Individual Contribution Report", "Lessons Learned", "Career Skill Matrix"],
    demo: "Battery/BESS simulation → BMS → CAN → fault/anomaly → AegisCAN detection → alert → evidence → RCA.",
  },
];

const SECURITY_REQUIREMENTS = [
  { id: "SEC-01", text: "Testing only on authorized simulation/lab systems." },
  { id: "SEC-02", text: "Do not provide functionality intended for attacking real vehicles or deployed BESS systems." },
  { id: "SEC-03", text: "Validate external inputs." },
  { id: "SEC-04", text: "Protect logs from accidental modification where practical." },
  { id: "SEC-05", text: "Clearly identify simulated attack data." },
  { id: "SEC-06", text: "Do not expose secrets in source control." },
  { id: "SEC-07", text: "Use dependency/version management." },
  { id: "SEC-08", text: "Log security-relevant events." },
  { id: "SEC-09", text: "Separate detection logic from simulation/fault-injection logic." },
  { id: "SEC-10", text: "Maintain reproducible test evidence." },
];

type TestCase = {
  id: string;
  requirement: string;
  precondition: string;
  input: string;
  steps: string;
  expected: string;
  actual: string;
  pass: boolean;
  evidence: string;
};

const FUNCTIONAL_TEST_CASES: { id: string; requirement: string; input: string; expected: string }[] = [
  { id: "TC-F-01", requirement: "FR-01, FR-08–FR-12", input: "Run battery simulator for 60s", expected: "Voltage, current, temperature, SOC, SOH all update on each tick" },
  { id: "TC-F-02", requirement: "FR-02–FR-06", input: "Encode one BMS sample into a CAN frame", expected: "Frame carries valid timestamp, CAN ID, DLC=8, payload" },
  { id: "TC-F-03", requirement: "FR-07, FR-13", input: "Decode a logged CAN frame", expected: "Decoded signals match the values that were encoded" },
  { id: "TC-F-04", requirement: "FR-14", input: "Send 20 frames of CAN ID 0x101 over 2s", expected: "Computed frequency ≈ 10 msg/s (±1)" },
  { id: "TC-F-05", requirement: "FR-15", input: "Send a frame with CAN ID 0x9FF (not in message map)", expected: "Flagged as UNKNOWN_CAN_ID" },
  { id: "TC-F-06", requirement: "FR-16, FR-20", input: "Flood CAN ID 0x101 at 200 msg/s (baseline 10 msg/s)", expected: "Flagged as MESSAGE_FREQUENCY_ANOMALY" },
  { id: "TC-F-07", requirement: "FR-17", input: "Set pack_voltage_v = 900 (valid range 250–420)", expected: "Flagged as SENSOR_RANGE_ANOMALY" },
  { id: "TC-F-08", requirement: "FR-21–FR-23", input: "Trigger any anomaly above", expected: "Alert generated with category and severity populated" },
];

const SECURITY_TEST_CASES: TestCase[] = [
  {
    id: "TC-SEC-01",
    requirement: "FR-15 / SEC-05",
    precondition: "CAN message map configured with known IDs",
    input: "Frame with CAN ID 0x7EE (not in map)",
    steps: "1) Inject frame 2) Observe AegisCAN monitor",
    expected: "Alert UNKNOWN_CAN_ID, severity MEDIUM",
    actual: "UNKNOWN_CAN_ID raised, severity MEDIUM",
    pass: true,
    evidence: "log_unknown_id_001.json",
  },
  {
    id: "TC-SEC-02",
    requirement: "FR-16, FR-20",
    precondition: "Baseline interval learned at 100 ms",
    input: "Flood 0x101 at 5 ms interval for 10s",
    steps: "1) Start flood generator 2) Observe alert",
    expected: "MESSAGE_FREQUENCY_ANOMALY, severity HIGH",
    actual: "MESSAGE_FREQUENCY_ANOMALY raised, severity HIGH",
    pass: true,
    evidence: "log_flood_002.json",
  },
  {
    id: "TC-SEC-03",
    requirement: "FR-18",
    precondition: "10s of normal traffic captured",
    input: "Replay the same 10s capture immediately after",
    steps: "1) Replay captured frames 2) Compare sequence numbers/timestamps",
    expected: "REPLAY_PATTERN anomaly raised",
    actual: "REPLAY_PATTERN raised on duplicate sequence",
    pass: true,
    evidence: "log_replay_003.json",
  },
  {
    id: "TC-SEC-04",
    requirement: "FR-17",
    precondition: "max_cell_temp_c valid range configured (0–60°C)",
    input: "max_cell_temp_c = 145",
    steps: "1) Inject spoofed sensor value 2) Observe detection",
    expected: "SENSOR_RANGE_ANOMALY, severity HIGH",
    actual: "SENSOR_RANGE_ANOMALY raised, severity HIGH",
    pass: true,
    evidence: "log_sensor_range_004.json",
  },
  {
    id: "TC-SEC-05",
    requirement: "FR-17",
    precondition: "Previous SOC = 74.5%",
    input: "Next SOC sample = 12.0% within 250 ms",
    steps: "1) Inject implausible SOC jump 2) Observe detection",
    expected: "UNEXPECTED_SOC_TRANSITION anomaly raised",
    actual: "UNEXPECTED_SOC_TRANSITION raised",
    pass: true,
    evidence: "log_soc_jump_005.json",
  },
  {
    id: "TC-SEC-06",
    requirement: "FR-06",
    precondition: "Expected DLC = 8 for CAN ID 0x101",
    input: "Frame with DLC = 3, truncated payload",
    steps: "1) Inject malformed frame 2) Observe decoder + monitor",
    expected: "MALFORMED_FRAME anomaly raised, decoder does not crash",
    actual: "MALFORMED_FRAME raised, decoder handled gracefully",
    pass: true,
    evidence: "log_malformed_006.json",
  },
  {
    id: "TC-SEC-07",
    requirement: "FR-16",
    precondition: "0x101 expected every 100 ms",
    input: "Withhold 0x101 for 2s",
    steps: "1) Stop generator for ID 2) Observe monitor after timeout window",
    expected: "MISSING_MESSAGE / STALE_SIGNAL anomaly raised",
    actual: "STALE_SIGNAL raised after configured timeout",
    pass: true,
    evidence: "log_missing_007.json",
  },
  {
    id: "TC-SEC-08",
    requirement: "SEC-03",
    precondition: "Detection config file present",
    input: "Config file with invalid/corrupted JSON",
    steps: "1) Start AegisCAN with corrupted config 2) Observe startup",
    expected: "Startup fails safely with a clear error, no silent misconfiguration",
    actual: "Clear config validation error raised on startup",
    pass: true,
    evidence: "log_config_008.json",
  },
  {
    id: "TC-SEC-09",
    requirement: "SEC-03",
    precondition: "Log ingestion API/CLI available",
    input: "Malformed JSON payload submitted for ingestion",
    steps: "1) Submit invalid JSON 2) Observe ingestion response",
    expected: "Input rejected with validation error, no crash",
    actual: "Input rejected with validation error",
    pass: true,
    evidence: "log_invalid_input_009.json",
  },
  {
    id: "TC-SEC-10",
    requirement: "SEC-04, SEC-10",
    precondition: "Log directory temporarily unwritable",
    input: "Attempt to write an evidence log entry",
    steps: "1) Remove write permission on log path 2) Trigger a loggable event",
    expected: "Logging failure is surfaced (not silently dropped), evidence gap is recorded",
    actual: "Logging failure surfaced and recorded",
    pass: true,
    evidence: "log_failure_010.json",
  },
];

const POSITIVE_USE_CASES = [
  "Normal battery operation",
  "Normal CAN traffic",
  "Expected SOC change over a discharge cycle",
  "Expected temperature variation under load",
  "Expected message interval (e.g. 100 ms for 0x101)",
  "Known CAN IDs matching the message map",
  "Valid payload within DLC and range limits",
];

const NEGATIVE_USE_CASES = [
  "Unknown CAN ID",
  "Excessive message frequency (flooding)",
  "Replayed message sequence",
  "Spoofed sensor value",
  "Unrealistic temperature reading",
  "Unrealistic SOC transition",
  "Invalid DLC",
  "Malformed payload",
  "Missing expected message",
  "Stale signal (value never updates)",
];

const MANUAL_VERIFICATION = [
  "Battery simulator works",
  "BMS values generated",
  "CAN frames generated",
  "CAN frames decoded",
  "Logs stored",
  "Normal traffic recognized",
  "Unknown ID detected",
  "Abnormal frequency detected",
  "Sensor anomaly detected",
  "Missing message detected",
  "Dashboard works",
  "Test cases documented",
  "Security tests documented",
  "Requirement traceability completed",
  "README complete",
  "Final report complete",
  "Final demo reproducible",
];

const DEFINITION_OF_DONE = [
  "Requirements are documented.",
  "Architecture is documented.",
  "Battery/BMS/BESS concepts are understood.",
  "CAN simulator works.",
  "CAN logger works.",
  "CAN decoder works.",
  "Fault injection works.",
  "Minimum anomaly detection works.",
  "Functional tests pass.",
  "Security tests pass.",
  "Requirement traceability exists.",
  "Engineering evidence exists.",
  "Source code is version controlled.",
  "README allows another student to reproduce the demo.",
  "Final demonstration is completed.",
  "Student can explain the system without reading slides.",
];

const ENGINEERING_EVIDENCE = [
  "01 · Project Charter", "02 · Requirements", "03 · System Architecture", "04 · Battery Study",
  "05 · BMS Study", "06 · BESS Study", "07 · CAN Study", "08 · CAN Message Map",
  "09 · Threat Model", "10 · Source Code", "11 · Test Plan", "12 · Traceability Matrix",
  "13 · Test Report", "14 · Security Test Report", "15 · CAN Dataset", "16 · Root Cause Analysis",
  "17 · QA Report", "18 · Demo Video", "19 · Final Report", "20 · Presentation", "21 · Individual Contribution",
];

const QA_CHECKS = [
  "Requirements are testable",
  "Tests map to requirements",
  "Expected results are defined",
  "Evidence exists",
  "Failures are documented",
  "Regression testing performed",
  "Security scenarios tested",
  "Documentation is reproducible",
];

const ARCHITECT_CHECKS = [
  "System architecture",
  "Module boundaries",
  "CAN message design",
  "Detection architecture",
  "Safety assumptions",
  "Cybersecurity assumptions",
  "Extensibility",
  "Engineering documentation",
];

const JOB_FAMILIES = [
  "BMS Engineer", "BMS Test Engineer", "BMS Validation Engineer", "Battery Systems Engineer",
  "Battery Test Engineer", "BESS Engineer", "BESS Validation Engineer", "Embedded Systems Engineer",
  "Embedded Test Engineer", "CAN Communication Engineer", "Automotive Test Engineer",
  "Automotive Validation Engineer", "ECU Test Engineer", "System Integration Engineer",
  "Verification & Validation Engineer", "Automotive Cybersecurity Engineer", "Embedded Cybersecurity Engineer",
  "Test Automation Engineer", "Data Acquisition / Validation Engineer", "UAV Embedded Systems Engineer",
  "Avionics Systems / Test Engineer",
];

const SKILL_MATRIX: { skill: string; weeks: string }[] = [
  { skill: "Battery fundamentals", weeks: "Weeks 2–3" },
  { skill: "BMS", weeks: "Weeks 3–12" },
  { skill: "BESS", weeks: "Weeks 3–12" },
  { skill: "SOC / SOH / SOP", weeks: "Weeks 2–3" },
  { skill: "CAN", weeks: "Weeks 4–12" },
  { skill: "Data acquisition", weeks: "Week 5 onward" },
  { skill: "Functional testing", weeks: "Week 6 onward" },
  { skill: "Fault injection", weeks: "Week 7 onward" },
  { skill: "Root cause analysis", weeks: "Week 7 onward" },
  { skill: "Cybersecurity", weeks: "Week 8 onward" },
  { skill: "Test automation", weeks: "Weeks 6–12" },
  { skill: "Python", weeks: "Throughout" },
  { skill: "Data analysis", weeks: "Weeks 5–10" },
  { skill: "Requirements", weeks: "Weeks 1 & 6" },
  { skill: "Test documentation", weeks: "Weeks 6–12" },
  { skill: "Git", weeks: "Throughout" },
  { skill: "Technical presentation", weeks: "Week 12" },
  { skill: "System integration", weeks: "Week 11" },
];

const INTERVIEW_QUESTIONS = [
  "What is a battery cell/module/pack?",
  "What is BMS?",
  "What is BESS?",
  "Difference between BMS and BESS?",
  "What are SOC and SOH?",
  "What is CAN?",
  "Why is CAN used?",
  "What is CAN ID?",
  "What is DLC?",
  "What is arbitration?",
  "What is CAN logging?",
  "What is fault injection?",
  "What is validation?",
  "What is requirement traceability?",
  "How did you test your project?",
  "What happens if a CAN message disappears?",
  "How can abnormal message frequency be detected?",
  "What is CAN spoofing?",
  "What is replay?",
  "What is anomaly detection?",
  "How did AegisCAN detect anomalies?",
  "What was your contribution?",
  "What failed during the project?",
  "How did you debug it?",
  "What engineering evidence did you create?",
];

const WHATS_NEXT = [
  { v: "AegisCAN v0.1", d: "Simulation + Rule-Based Detection", current: true },
  { v: "AegisCAN v0.2", d: "Physical CAN Interface", current: false },
  { v: "AegisCAN v0.3", d: "Real BMS Integration", current: false },
  { v: "AegisCAN v0.4", d: "BESS Test & Validation", current: false },
  { v: "AegisCAN v0.5", d: "CAN FD + Advanced Detection", current: false },
  { v: "AegisCAN Research", d: "AI/ML-assisted IDS", current: false },
  { v: "Future Research", d: "EV | BESS | UAV | Aerospace", current: false },
];

const REQUIRED_READING = [
  { name: "CAN in Automation (CiA) — CAN basics", href: "https://www.can-cia.org/can-knowledge/" },
  { name: "Bosch CAN specification overview", href: "https://www.bosch-semiconductors.com/ip-modules/can-bus/" },
  { name: "NIST Cybersecurity Framework", href: "https://www.nist.gov/cyberframework" },
  { name: "OWASP — Threat modelling basics", href: "https://owasp.org/www-community/Threat_Modeling" },
  { name: "AUTOSAR — overview & scope", href: "https://www.autosar.org/" },
];

const OPTIONAL_READING = [
  { name: "SAE J1939 — higher-layer CAN protocol overview", href: "https://www.sae.org/standards/content/j1939_201808/" },
  { name: "ISO 11898 — CAN physical/data link layer (publicly explainable overview)", href: "https://www.iso.org/standard/63648.html" },
  { name: "DroneCAN documentation", href: "https://dronecan.github.io/" },
  { name: "PyBaMM — Python Battery Mathematical Modelling documentation", href: "https://docs.pybamm.org/" },
  { name: "IEEE Xplore — battery/BMS and automotive cybersecurity research", href: "https://ieeexplore.ieee.org/" },
];

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function AegisCANContent() {
  return (
    <>
      {/* ═══════ BREADCRUMB ═══════ */}
      <nav className={`container ${styles.breadcrumb}`} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span> / </span>
        <Link href="/internships">Internships</Link>
        <span> / </span>
        <span aria-current="page">AegisCAN</span>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className={styles.hero} id="overview">
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroPillRow}>
            <span className={styles.heroPill}>12-Week Educational R&amp;D Mini Project</span>
            <span className={styles.heroPill}>E&amp;C / ECE / EEE / EE Engineering Students</span>
          </div>

          <h1 className={styles.heroTitle}>AegisCAN</h1>
          <p className={styles.heroSubtitle}>
            Intelligent CAN Cybersecurity for EV, BMS, BESS, Aerospace &amp; UAV Systems
          </p>

          <p className={styles.heroDesc}>
            AegisCAN is a 12-week educational engineering project designed to help students understand how
            battery systems, Battery Management Systems (BMS), Battery Energy Storage Systems (BESS), CAN
            communication, validation engineering and embedded cybersecurity work together.
          </p>
          <p className={styles.heroDesc}>
            Students progressively build a simulation-based CAN monitoring and anomaly-detection prototype
            while learning the engineering skills used in EV, battery, energy-storage and embedded-system
            industries.
          </p>

          <div className={styles.heroCtas}>
            <a href="#timeline" className="btn btn-primary" data-track-event="aegiscan_hero_start_journey">
              Start 12-Week Journey
            </a>
            <a href="#architecture" className="btn btn-secondary" data-track-event="aegiscan_hero_view_architecture">
              View Architecture
            </a>
            <a href="#career" className="btn btn-secondary" data-track-event="aegiscan_hero_career_skills">
              Explore Career Skills
            </a>
          </div>

          {/* ═══════ DISCLAIMER ═══════ */}
          <div className={styles.disclaimer} id="disclaimer">
            <span className={styles.disclaimerIcon} aria-hidden="true">ℹ️</span>
            <p className={styles.disclaimerText}>
              <strong>AegisCAN is an educational and research prototype.</strong> It is not a production BMS,
              commercial intrusion-detection system, certified automotive cybersecurity product, flight-qualified
              aerospace system or safety-certified BESS controller. All fault-injection and cybersecurity
              exercises must be performed only in controlled simulation/lab environments on systems the student
              is authorized to test.
            </p>
          </div>

          <nav className={styles.quickNav} aria-label="Jump to section">
            <a className={styles.quickNavLink} href="#why">Why This Project</a>
            <a className={styles.quickNavLink} href="#skills-mapping">Industry Skills</a>
            <a className={styles.quickNavLink} href="#requirements">Requirements</a>
            <a className={styles.quickNavLink} href="#architecture">Architecture</a>
            <a className={styles.quickNavLink} href="#security">Security</a>
            <a className={styles.quickNavLink} href="#timeline">12-Week Plan</a>
            <a className={styles.quickNavLink} href="#career">Careers</a>
            <a className={styles.quickNavLink} href="#pybamm">PyBaMM (Optional)</a>
            <a className={styles.quickNavLink} href="#references">References</a>
          </nav>
        </div>
      </section>

      {/* ═══════ WHY THIS PROJECT ═══════ */}
      <section className={styles.pageSectionAlt} id="why">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Why AegisCAN</span>
            <h2 className={styles.sectionTitle}>Why This Project?</h2>
            <p className={styles.sectionSubtitle}>Feature Description — what the project actually asks a student to build</p>
          </div>
          <p className={styles.bodyTextCenter}>
            Modern EVs and energy-storage systems depend on electronics, sensors, embedded controllers, BMS
            software and communication networks. An engineer working in this industry needs more than
            theoretical battery knowledge — they need to understand battery behaviour, BMS and BESS
            architecture, sensors and embedded controllers, CAN communication, data acquisition, validation,
            fault injection, debugging, cybersecurity, test automation, root-cause analysis and engineering
            documentation. AegisCAN connects these concepts through one manageable student project: a
            simulation-based Battery → BMS → CAN → Monitoring → Detection pipeline, built, tested and
            documented like a real engineering deliverable.
          </p>
        </div>
      </section>

      {/* ═══════ BUSINESS GOAL ═══════ */}
      <section className={styles.pageSection} id="business-goal">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 01</span>
            <h2 className={styles.sectionTitle}>Business Goal</h2>
          </div>
          <p className={styles.bodyTextCenter}>
            The goal is to develop engineering talent capable of understanding and validating intelligent
            battery and energy-storage systems. The project should help students develop foundational skills
            relevant to Electric Vehicles, Battery Management Systems, Battery Energy Storage Systems,
            Automotive Electronics, Embedded Systems, Energy Systems, CAN Networks, System Validation,
            Cybersecurity, UAV systems and Aerospace embedded systems. The emphasis is employability through
            engineering fundamentals and demonstrable project evidence.
          </p>
        </div>
      </section>

      {/* ═══════ PROBLEM STATEMENT ═══════ */}
      <section className={styles.pageSectionAlt} id="problem-statement">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 02</span>
            <h2 className={styles.sectionTitle}>Problem Statement</h2>
          </div>
          <p className={styles.bodyTextCenter}>
            Battery-powered systems increasingly depend on distributed electronic controllers and communication
            networks. Battery parameters such as cell voltage, pack voltage, current, temperature, SOC, SOH,
            protection status, contactor state and alarms may be exchanged between controllers. Communication
            faults, incorrect messages, abnormal values or unauthorized traffic can affect monitoring,
            diagnostics and potentially system behaviour. Students need an educational environment where they
            can understand:
          </p>
          <div className={styles.cardGrid3} style={{ marginTop: "2rem" }}>
            {[
              "How battery systems work",
              "How BMS monitors batteries",
              "How BESS integrates battery packs and supporting subsystems",
              "How CAN carries system information",
              "How engineers monitor CAN traffic",
              "How faults can be injected safely",
              "How abnormal behaviour can be identified",
              "How systems are tested and validated",
              "How cybersecurity relates to safety-critical systems",
            ].map((item, i) => (
              <div className={styles.card} key={i}>
                <div className={styles.cardEyebrow}>{String(i + 1).padStart(2, "0")}</div>
                <div className={styles.cardBody}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ USER PERSONAS ═══════ */}
      <section className={styles.pageSection} id="personas">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 03</span>
            <h2 className={styles.sectionTitle}>User Personas</h2>
            <p className={styles.sectionSubtitle}>Who this page and project need to serve</p>
          </div>
          <div className={styles.cardGrid3}>
            {PERSONAS.map((p) => (
              <div className={styles.personaCard} key={p.title}>
                <span className={styles.personaBadge}>{p.badge}</span>
                <div className={styles.cardIcon} aria-hidden="true">{p.icon}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>{p.body}</p>
                <div className={styles.cardEyebrow}>Needs</div>
                <ul className={styles.cardList}>
                  {p.needs.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LEARNING ARCHITECTURE ═══════ */}
      <section className={styles.pageSectionAlt} id="learning-architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 04</span>
            <h2 className={styles.sectionTitle}>Learning Architecture</h2>
            <p className={styles.sectionSubtitle}>Learn → Build → Test → Break Safely → Detect → Debug → Validate → Document → Demonstrate → Prepare for Industry</p>
          </div>
          <div className={styles.flowVertical}>
            {LEARNING_ARCHITECTURE.map((step, i) => (
              <div key={step}>
                <div className={styles.flowVerticalStep}>{step}</div>
                {i < LEARNING_ARCHITECTURE.length - 1 && <div className={styles.flowVerticalArrow} aria-hidden="true">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BESS FUNDAMENTALS ═══════ */}
      <section className={styles.pageSection} id="bess">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 05 — BESS Fundamentals</span>
            <h2 className={styles.sectionTitle}>Understanding BESS</h2>
            <p className={styles.sectionSubtitle}>
              BESS = Battery Energy Storage System. Students learn the data and communication layer through
              simulation — the project does not require building a real BESS.
            </p>
          </div>

          <div className={styles.flowWrap}>
            {BESS_FLOW.map((step, i) => (
              <span key={step} style={{ display: "contents" }}>
                <span className={styles.flowWrapStep}>{step}</span>
                {i < BESS_FLOW.length - 1 && <span className={styles.flowWrapArrow} aria-hidden="true">→</span>}
              </span>
            ))}
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Term</th>
                  <th>What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>Battery</td>
                  <td>The electrochemical energy-storage device itself — cells, modules and packs.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>BMS</td>
                  <td>The electronics and software that sense, protect, balance and report on one battery pack.</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>BESS</td>
                  <td>The full system built around one or more battery packs — BMS hierarchy, power conversion (PCS), energy management (EMS), thermal management, protection and monitoring/SCADA — deployed for grid, industrial or backup energy storage.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ INDUSTRY SKILLS MAPPING ═══════ */}
      <section className={styles.pageSectionAlt} id="skills-mapping">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 06</span>
            <h2 className={styles.sectionTitle}>From Mini Project to Industry Skills</h2>
            <p className={styles.sectionSubtitle}>Every project activity maps to a practical engineering skill</p>
          </div>
          <div className={styles.cardGrid3}>
            {SKILL_CATEGORIES.map((cat) => (
              <div className={styles.card} key={cat.title}>
                <div className={styles.cardIcon} aria-hidden="true">{cat.icon}</div>
                <div className={styles.cardTitle}>{cat.title}</div>
                <ul className={styles.cardList}>
                  {cat.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ EPIC & USER STORIES ═══════ */}
      <section className={styles.pageSection} id="epic-stories">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 07</span>
            <h2 className={styles.sectionTitle}>Epic &amp; User Stories</h2>
          </div>

          <div className={styles.card} style={{ maxWidth: 820, margin: "0 auto 2.5rem" }}>
            <div className={styles.cardEyebrow}>Epic</div>
            <p className={styles.cardBody} style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
              &ldquo;As an engineering student, I want to build and validate a simulated battery/BMS CAN network
              and develop an AegisCAN monitoring system so that I can understand battery systems, BMS, BESS, CAN
              communication, testing and cybersecurity using an industry-style engineering workflow.&rdquo;
            </p>
          </div>

          <div className={styles.cardGrid2}>
            {USER_STORIES.map((s) => (
              <div className={styles.card} key={s.id}>
                <div className={styles.cardEyebrow}>{s.id}</div>
                <p className={styles.cardBody}>
                  <strong style={{ color: "var(--text-primary)" }}>{s.role}, </strong>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REQUIREMENTS ═══════ */}
      <section className={styles.pageSectionAlt} id="requirements">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 08</span>
            <h2 className={styles.sectionTitle}>Functional &amp; Non-Functional Requirements</h2>
            <p className={styles.sectionSubtitle}>The minimum prototype every student team must reach by Week 11</p>
          </div>

          <div className={styles.sectionHeaderLeft}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Functional Requirements</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>ID</th><th>Requirement</th></tr>
              </thead>
              <tbody>
                {FUNCTIONAL_REQUIREMENTS.map((req, i) => (
                  <tr key={i}>
                    <td><code>FR-{String(i + 1).padStart(2, "0")}</code></td>
                    <td>{req}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Non-Functional Requirements</h3>
          </div>
          <div className={styles.checklistGrid}>
            {NON_FUNCTIONAL_REQUIREMENTS.map((nfr, i) => (
              <div className={styles.checklistItem} key={i}>
                <span className={styles.checklistCheck} aria-hidden="true">✓</span>{nfr}
              </div>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>UI/UX Requirements</h3>
            <p className={styles.sectionSubtitle}>This page and the AegisCAN dashboard both follow the same rules</p>
          </div>
          <div className={styles.checklistGrid}>
            {UI_UX_REQUIREMENTS.map((r, i) => (
              <div className={styles.checklistItem} key={i}>
                <span className={styles.checklistCheck} aria-hidden="true">✓</span>{r}
              </div>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Acceptance Criteria</h3>
          </div>
          <div className={styles.checklistGrid}>
            {ACCEPTANCE_CRITERIA.map((a, i) => (
              <div className={styles.checklistItem} key={i}>
                <span className={styles.checklistCheck} aria-hidden="true">✓</span>{a}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SYSTEM ARCHITECTURE ═══════ */}
      <section className={styles.pageSection} id="architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 09 — Architecture Notes</span>
            <h2 className={styles.sectionTitle}>System Architecture</h2>
            <p className={styles.sectionSubtitle}>Simulation-first pipeline — no physical CAN hardware required</p>
          </div>
          <div className={styles.flowVertical}>
            {ARCHITECTURE_PIPELINE.map((step) => (
              <div key={step}>
                <div className={styles.flowVerticalStep}>{step}</div>
                <div className={styles.flowVerticalArrow} aria-hidden="true">↓</div>
              </div>
            ))}
            <div className={styles.flowVerticalBox}>
              <div className={styles.flowVerticalBoxTitle}>Detection Layer</div>
              <div className={styles.flowVerticalBoxList}>
                {DETECTION_BOX.map((d) => <div className={styles.flowVerticalBoxItem} key={d}>{d}</div>)}
              </div>
            </div>
            <div className={styles.flowVerticalArrow} aria-hidden="true">↓</div>
            {ARCHITECTURE_PIPELINE_TAIL.map((step, i) => (
              <div key={step}>
                <div className={styles.flowVerticalStepMuted}>{step}</div>
                {i < ARCHITECTURE_PIPELINE_TAIL.length - 1 && <div className={styles.flowVerticalArrow} aria-hidden="true">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SAMPLE DATA ═══════ */}
      <section className={styles.pageSectionAlt} id="sample-data">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 10</span>
            <h2 className={styles.sectionTitle}>Sample Input &amp; Output JSON</h2>
            <p className={styles.sectionSubtitle}>A beginner-friendly example of one CAN sample going in, and one alert coming out</p>
          </div>
          <div className={styles.jsonGrid}>
            <div className={styles.codeBlockWrapper}>
              <div className={styles.codeBlockHeader}><span>Sample Input</span><span>can_frame.json</span></div>
              <pre className={styles.codeBlock}>{`{
  "timestamp": "2026-11-16T10:15:30.250Z",
  "can_id": "0x101",
  "dlc": 8,
  "source": "BMS",
  "signals": {
    "pack_voltage_v": 352.4,
    "pack_current_a": -18.2,
    "soc_percent": 74.5,
    "soh_percent": 96.1,
    "max_cell_temp_c": 32.4
  }
}`}</pre>
            </div>
            <div className={styles.codeBlockWrapper}>
              <div className={styles.codeBlockHeader}><span>Sample Output</span><span>alert.json</span></div>
              <pre className={styles.codeBlock}>{`{
  "status": "ANOMALY_DETECTED",
  "timestamp": "2026-11-16T10:15:30.250Z",
  "can_id": "0x101",
  "category": "MESSAGE_FREQUENCY_ANOMALY",
  "severity": "HIGH",
  "expected_interval_ms": 100,
  "observed_interval_ms": 5,
  "evidence": [
    "Message frequency exceeded configured baseline"
  ]
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ USE CASES ═══════ */}
      <section className={styles.pageSection} id="use-cases">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 11</span>
            <h2 className={styles.sectionTitle}>Positive &amp; Negative Use Cases</h2>
            <p className={styles.sectionSubtitle}>All negative/anomalous scenarios run only as controlled educational simulations</p>
          </div>
          <div className={styles.useCaseGrid}>
            <div className={styles.useCasePanelPositive}>
              <div className={styles.useCasePanelTitlePositive}><span aria-hidden="true">✓</span> Positive Use Cases</div>
              <ul className={styles.useCaseList}>
                {POSITIVE_USE_CASES.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
            <div className={styles.useCasePanelNegative}>
              <div className={styles.useCasePanelTitleNegative}><span aria-hidden="true">✕</span> Negative / Anomalous Use Cases</div>
              <ul className={styles.useCaseList}>
                {NEGATIVE_USE_CASES.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECURITY REQUIREMENTS ═══════ */}
      <section className={styles.pageSectionAlt} id="security">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 12</span>
            <h2 className={styles.sectionTitle}>Security Requirements</h2>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>ID</th><th>Requirement</th></tr></thead>
              <tbody>
                {SECURITY_REQUIREMENTS.map((s) => (
                  <tr key={s.id}>
                    <td><code>{s.id}</code></td>
                    <td>{s.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ TEST CASES ═══════ */}
      <section className={styles.pageSection} id="test-cases">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 13</span>
            <h2 className={styles.sectionTitle}>Functional &amp; Security Test Cases</h2>
            <p className={styles.sectionSubtitle}>Representative test evidence produced during Weeks 6, 8 and 9</p>
          </div>

          <div className={styles.sectionHeaderLeft}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Functional Test Cases</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>Test ID</th><th>Requirement</th><th>Input</th><th>Expected Result</th></tr>
              </thead>
              <tbody>
                {FUNCTIONAL_TEST_CASES.map((t) => (
                  <tr key={t.id}>
                    <td><code>{t.id}</code></td>
                    <td>{t.requirement}</td>
                    <td>{t.input}</td>
                    <td>{t.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Security Test Cases</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Test ID</th><th>Requirement</th><th>Precondition</th><th>Input</th><th>Steps</th>
                  <th>Expected Result</th><th>Actual Result</th><th>Pass/Fail</th><th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {SECURITY_TEST_CASES.map((t) => (
                  <tr key={t.id}>
                    <td><code>{t.id}</code></td>
                    <td>{t.requirement}</td>
                    <td>{t.precondition}</td>
                    <td>{t.input}</td>
                    <td>{t.steps}</td>
                    <td>{t.expected}</td>
                    <td>{t.actual}</td>
                    <td style={{ color: t.pass ? "var(--accent-primary)" : "var(--error)", fontWeight: 700 }}>
                      {t.pass ? "PASS" : "FAIL"}
                    </td>
                    <td><code>{t.evidence}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.bodyText} style={{ margin: "1rem auto 0", textAlign: "center", fontSize: "0.85rem" }}>
            Sample results shown above are illustrative of the expected evidence format — each student team
            records its own actual results, timestamps and evidence files.
          </p>
        </div>
      </section>

      {/* ═══════ 12-WEEK PLAN ═══════ */}
      <section className={styles.pageSectionAlt} id="timeline">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 14</span>
            <h2 className={styles.sectionTitle}>12-Week Project Plan</h2>
            <p className={styles.sectionSubtitle}>
              Discussion started 21 September 2026 · Target completion 21 December 2026 · ~4–6 hours/week/student
            </p>
          </div>

          <div className={styles.accordionList}>
            {WEEKS.map((w) => (
              <details className={styles.accordionItem} key={w.n}>
                <summary className={styles.accordionSummary}>
                  <span className={styles.accordionSummaryLeft}>
                    <span className={styles.accordionWeekNum}>Week {w.n}</span>
                    <span className={styles.accordionSummaryTitle}>{w.title}</span>
                  </span>
                  <span className={styles.accordionChevron} aria-hidden="true">▾</span>
                </summary>
                <div className={styles.accordionBody}>
                  <div className={styles.accordionBodyBlock}>
                    <h4>Learn</h4>
                    <ul>{w.learn.map((l, i) => <li key={i}>{l}</li>)}</ul>
                  </div>
                  <div className={styles.accordionBodyBlock}>
                    <h4>Deliverables</h4>
                    <ul>{w.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
                  </div>
                  <div className={`${styles.accordionBodyBlock} ${styles.accordionBodyFull}`}>
                    <h4>Build</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{w.build}</p>
                  </div>
                  <div className={`${styles.accordionBodyBlock} ${styles.accordionBodyFull}`}>
                    <h4>Demo</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{w.demo}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WEBINAR ═══════ */}
      <section className={styles.pageSection} id="webinar">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 15</span>
            <h2 className={styles.sectionTitle}>EV Society Technical Webinar</h2>
          </div>
          <div className={styles.card} style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className={styles.cardEyebrow}>Suggested Title</div>
            <div className={styles.cardTitle} style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              &ldquo;From Battery to Cybersecurity — Building AegisCAN&rdquo;
            </div>
            <p className={styles.cardBody}>
              Students explain the journey Battery → BMS → BESS → CAN → Validation → Fault Injection →
              Cybersecurity → Detection → Testing → Results, emphasizing engineering understanding rather than
              only showing source code.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ MANUAL VERIFICATION ═══════ */}
      <section className={styles.pageSectionAlt} id="verification">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 16</span>
            <h2 className={styles.sectionTitle}>Manual Verification Checklist</h2>
          </div>
          <div className={styles.checklistGrid}>
            {MANUAL_VERIFICATION.map((m, i) => (
              <div className={styles.checklistItem} key={i}>
                <span className={styles.checklistCheck} aria-hidden="true">☐</span>{m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DEFINITION OF DONE ═══════ */}
      <section className={styles.pageSection} id="dod">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 17</span>
            <h2 className={styles.sectionTitle}>Definition of Done</h2>
            <p className={styles.sectionSubtitle}>AegisCAN is complete only when every item below is true</p>
          </div>
          <div className={styles.checklistGrid}>
            {DEFINITION_OF_DONE.map((d, i) => (
              <div className={styles.checklistItem} key={i}>
                <span className={styles.checklistCheck} aria-hidden="true">{i + 1}.</span>{d}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ENGINEERING EVIDENCE ═══════ */}
      <section className={styles.pageSectionAlt} id="evidence">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 18</span>
            <h2 className={styles.sectionTitle}>Engineering Evidence</h2>
            <p className={styles.sectionSubtitle}>The 21-item evidence set every team assembles by Week 12</p>
          </div>
          <div className={styles.evidenceGrid}>
            {ENGINEERING_EVIDENCE.map((e) => (
              <div className={styles.evidenceItem} key={e}>{e}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ QA + ARCHITECT GATES ═══════ */}
      <section className={styles.pageSection} id="qa-architect">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 19</span>
            <h2 className={styles.sectionTitle}>QA Review &amp; Architect Approval</h2>
            <p className={styles.sectionSubtitle}>Two engineering review gates before final demonstration</p>
          </div>
          <div className={styles.gateGrid}>
            <div className={styles.gateCard}>
              <div className={styles.gateStatus}>QA Status: Pending</div>
              <div className={styles.cardTitle}>QA Review</div>
              <ul className={styles.cardList}>
                {QA_CHECKS.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
            <div className={styles.gateCard}>
              <div className={styles.gateStatus}>Architect Status: Pending</div>
              <div className={styles.cardTitle}>Architect Approval</div>
              <ul className={styles.cardList}>
                {ARCHITECT_CHECKS.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CAREER OPPORTUNITIES ═══════ */}
      <section className={styles.pageSectionAlt} id="career">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 20</span>
            <h2 className={styles.sectionTitle}>How AegisCAN Helps Your Engineering Career</h2>
            <p className={styles.sectionSubtitle}>
              AegisCAN provides foundational exposure relevant to industry roles — it does not guarantee employment.
            </p>
          </div>
          <div className={styles.pillGrid}>
            {JOB_FAMILIES.map((j) => (
              <span className={styles.rolePill} key={j}>{j}</span>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }} id="skill-matrix">Job-Readiness Skill Matrix</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>Industry Skill</th><th>AegisCAN Experience</th></tr></thead>
              <tbody>
                {SKILL_MATRIX.map((s) => (
                  <tr key={s.skill}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.skill}</td>
                    <td>{s.weeks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ INTERVIEW PREP ═══════ */}
      <section className={styles.pageSection} id="interview">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 21</span>
            <h2 className={styles.sectionTitle}>Can You Explain This in an Interview?</h2>
            <p className={styles.sectionSubtitle}>
              After 12 weeks, students should be able to answer beginner-level questions like these — using
              their own project evidence, not memorized answers.
            </p>
          </div>
          <div className={styles.accordionList} style={{ maxWidth: 780, margin: "0 auto" }}>
            {INTERVIEW_QUESTIONS.map((q, i) => (
              <details className={styles.accordionItem} key={i}>
                <summary className={styles.faqSummary}>
                  <span>{q}</span>
                  <span className={styles.accordionChevron} aria-hidden="true">▾</span>
                </summary>
                <div className={styles.faqBody}>
                  Answer this using your own AegisCAN evidence — logs, test results, diagrams and code you
                  personally wrote or configured — not a memorized script.
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S NEXT ═══════ */}
      <section className={styles.pageSectionAlt} id="whats-next">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 22</span>
            <h2 className={styles.sectionTitle}>What&rsquo;s Next?</h2>
          </div>
          <div className={styles.roadmapFlow}>
            {WHATS_NEXT.map((step, i) => (
              <div key={step.v}>
                <div className={step.current ? styles.roadmapStepCurrent : styles.roadmapStep}>
                  <div className={styles.roadmapStepTitle}>{step.v}</div>
                  <div className={styles.roadmapStepDesc}>{step.d}</div>
                  {step.current && <span className={styles.roadmapStepBadge}>This Project</span>}
                </div>
                {i < WHATS_NEXT.length - 1 && <div className={styles.roadmapArrow} aria-hidden="true">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PYBAMM ADVANCED TRACK (OPTIONAL) ═══════ */}
      <section className={styles.pageSection} id="pybamm">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 23</span>
            <h2 className={styles.sectionTitle}>Battery-Aware Cybersecurity &amp; Validation — Advanced Track</h2>
            <p className={styles.sectionSubtitle}>PyBaMM (Python Battery Mathematical Modelling) is an optional, advanced learning tool</p>
          </div>

          <div className={styles.optionalCard} style={{ maxWidth: 900, margin: "0 auto 2rem" }}>
            <span className={styles.optionalBanner}>Optional — not required to complete AegisCAN</span>
            <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>
              The mandatory beginner path remains: <strong style={{ color: "var(--text-primary)" }}>Simple Python
              Battery Simulator → BMS Simulator → CAN → AegisCAN</strong>. Students who progress faster may
              instead explore an existing PyBaMM example model as an optional path:
              <strong style={{ color: "var(--text-primary)" }}> PyBaMM Battery Model → Battery Behaviour / Dataset
              → BMS Signal Mapping → CAN Messages → AegisCAN Monitoring → Validation / Anomaly Analysis</strong>.
            </p>
            <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>
              Students may use PyBaMM to explore battery voltage behaviour, current, charge/discharge cycles,
              SOC-related behaviour, temperature (where supported by the selected model), and degradation/SOH
              concepts. Students start with an existing PyBaMM model or example and focus on understanding
              engineering outputs — deriving or implementing electrochemical models is not required.
            </p>
            <p className={styles.cardBody}>
              AegisCAN should eventually be capable of comparing communication-layer behaviour with physically
              plausible battery behaviour reported by a model like PyBaMM. Example:
            </p>
            <div className={styles.discrepancyRow}>
              <div className={styles.discrepancyBox}>
                <div className={styles.discrepancyLabel}>Battery Model Expected Voltage</div>
                <div className={styles.discrepancyValue}>3.7 V</div>
              </div>
              <span aria-hidden="true" style={{ color: "var(--accent-primary)", fontSize: "1.3rem" }}>vs</span>
              <div className={styles.discrepancyBox}>
                <div className={styles.discrepancyLabel}>BMS / CAN Reported Voltage</div>
                <div className={styles.discrepancyValueAlert}>4.8 V</div>
              </div>
            </div>
            <p className={styles.cardBody}>
              AegisCAN may flag the discrepancy for investigation — this is the &ldquo;Battery-Aware
              Cybersecurity &amp; Validation&rdquo; capability, and it stays clearly optional throughout the
              project: in Tools &amp; Technologies, the Week 2/3 optional exercises, Career Skills, What&rsquo;s
              Next and References.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ REFERENCES ═══════ */}
      <section className={styles.pageSectionAlt} id="references">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section 24</span>
            <h2 className={styles.sectionTitle}>References</h2>
            <p className={styles.sectionSubtitle}>Summarized and linked to original sources — no copyrighted material is reproduced</p>
          </div>
          <div className={styles.refColumns}>
            <div>
              <div className={styles.sectionHeaderLeft}><h3 className={styles.sectionTitle} style={{ fontSize: "1.1rem" }}>Required Reading</h3></div>
              <ul className={styles.refList}>
                {REQUIRED_READING.map((r) => (
                  <li className={styles.refItem} key={r.name}>
                    <a href={r.href} target="_blank" rel="noopener noreferrer">{r.name} ↗</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className={styles.sectionHeaderLeft}><h3 className={styles.sectionTitle} style={{ fontSize: "1.1rem" }}>Optional Advanced Reading</h3></div>
              <ul className={styles.refList}>
                {OPTIONAL_READING.map((r) => (
                  <li className={styles.refItem} key={r.name}>
                    <a href={r.href} target="_blank" rel="noopener noreferrer">{r.name} ↗</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className={styles.finalSection}>
        <div className={styles.finalGlow} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2 className={styles.finalTitle}>Build, Break Safely, Detect &amp; Document</h2>
          <p className={styles.finalDesc}>
            Start with Week 1 of the AegisCAN 12-week plan, or explore the rest of the EV.ENGINEER internship
            programme.
          </p>
          <div className={styles.finalCtas}>
            <a href="https://forms.gle/CeBqi41CMrrEd6B5A" className="btn btn-primary" data-track-event="aegiscan_final_apply">
              Apply
            </a>
            <Link href="/internships" className="btn btn-secondary" data-track-event="aegiscan_final_back_to_internships">
              Back to Internships
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
