import Link from "next/link";
import styles from "./page.module.css";
import WeekAccordions, { type Week } from "./WeekAccordions";
import { AEGISCAN_FAQ } from "./faq";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const SECTION_NAV: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "mission", label: "Mission" },
  { id: "phases", label: "Phases" },
  { id: "milestones", label: "Milestones" },
  { id: "final-demo", label: "Final Demo" },
  { id: "timeline", label: "12-Week Plan" },
  { id: "architecture", label: "Architecture" },
  { id: "test-cases", label: "Testing" },
  { id: "submission", label: "Submission" },
  { id: "career", label: "Careers" },
  { id: "research-team", label: "Team" },
  { id: "faq", label: "FAQ" },
  { id: "references", label: "References" },
];

const HERO_METRICS = [
  { value: "12", label: "Weeks" },
  { value: "4–6 hrs", label: "Per Week" },
  { value: "3", label: "Milestone Demos" },
  { value: "1", label: "Working Prototype" },
  { value: "1", label: "Engineering Portfolio" },
];

const MISSION_FLOW = ["Battery", "BMS", "BESS", "CAN", "Validation", "Fault Injection", "Cybersecurity", "AegisCAN"];

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

type Persona = { badge: string; title: string; icon: string; body: string; needs: string[] };

const PERSONAS: Persona[] = [
  {
    badge: "Primary",
    icon: "🎓",
    title: "5th-Semester E&C / ECE / EEE / EE Student",
    body: "Starts with basic electronics, circuits, microcontrollers, programming and digital electronics. May not yet know batteries, BMS, BESS, CAN, DBC or embedded cybersecurity.",
    needs: ["A structured, beginner-friendly weekly path", "Simulation-first tools — no HV lab required", "Evidence to show mentors and interviewers"],
  },
  {
    badge: "Secondary",
    icon: "🧑‍🏫",
    title: "Faculty / Project Mentor",
    body: "Guides and evaluates progress across the 12 weeks alongside the student's regular academic subjects.",
    needs: ["Weekly progress visibility", "Engineering evidence and test results", "A reproducible final demonstration"],
  },
  {
    badge: "Reviewer",
    icon: "🧑‍💼",
    title: "Industry Reviewer",
    body: "Assesses the finished project the way a hiring engineer would — for fundamentals, not polish.",
    needs: ["What the student personally built and contributed", "Whether fundamentals are understood", "Whether results are reproducible"],
  },
];

/* ─── 3 Project Phases ─── */
type Phase = { num: string; title: string; weeks: string; flow: string[]; outcome: string };

const PHASES: Phase[] = [
  {
    num: "Phase 1",
    title: "Foundation",
    weeks: "Weeks 1–4",
    flow: ["Battery", "BMS", "BESS", "CAN"],
    outcome: "I can generate battery/BMS data and communicate it over CAN.",
  },
  {
    num: "Phase 2",
    title: "Validation & Security",
    weeks: "Weeks 5–8",
    flow: ["CAN Logging", "Testing", "Fault Injection", "Threat Analysis"],
    outcome: "I can test the system, inject controlled faults and explain abnormal behaviour.",
  },
  {
    num: "Phase 3",
    title: "AegisCAN",
    weeks: "Weeks 9–12",
    flow: ["Detection", "Analytics", "Integration", "QA", "Demo"],
    outcome: "I can detect CAN/BMS anomalies and demonstrate an integrated AegisCAN prototype.",
  },
];

/* ─── Engineering Milestone Reviews ─── */
type Milestone = {
  week: string;
  title: string;
  flow: string[];
  explain: string[];
  submit: string[];
};

const MILESTONES: Milestone[] = [
  {
    week: "Milestone 1 · Week 4",
    title: "Battery → BMS → CAN",
    flow: ["Battery Simulator", "BMS", "CAN Message Map", "Virtual CAN", "CAN Frames"],
    explain: [
      "What is Battery / BMS / BESS?",
      "What are SOC and SOH?",
      "Why CAN? What is a CAN ID and DLC?",
      "How are BMS signals mapped into CAN?",
    ],
    submit: ["Project Charter", "Battery/BMS/BESS study", "Architecture v1", "CAN message map", "Source code + sample CAN log", "Week-4 demo evidence"],
  },
  {
    week: "Milestone 2 · Week 8",
    title: "CAN Validation → Fault Injection → Cybersecurity",
    flow: ["Normal CAN Traffic", "CAN Logger", "CAN Decoder", "Fault Injection", "Test Result", "Root Cause Analysis"],
    explain: [
      "What was expected vs what actually happened?",
      "How was the fault detected, with what evidence?",
      "What is the likely root cause?",
      "How would another engineer reproduce it?",
    ],
    submit: ["Test Plan + Requirements Traceability Matrix", "Functional test cases", "CAN logs + fault catalogue", "RCA worksheet", "Threat Model + security dataset", "Week-8 demo evidence"],
  },
  {
    week: "Milestone 3 · Week 12",
    title: "AegisCAN Final Engineering Demo",
    flow: ["Battery / BESS", "BMS", "CAN", "CAN Logger", "AegisCAN", "Anomaly Detection", "Alert", "Evidence", "RCA"],
    explain: [
      "How does the full pipeline fit together end-to-end?",
      "How did AegisCAN detect each anomaly class?",
      "What engineering evidence proves it?",
      "What was your individual contribution?",
    ],
    submit: ["Final Report + Final Test Report", "Security Test Report + Traceability Matrix", "Source code + demo video", "Presentation + individual contribution", "Career Skill Matrix"],
  },
];

/* ─── Final Demo dashboard mockup data ─── */
const DASHBOARD_BMS_ROWS = [
  { label: "Pack Voltage", value: "352.4 V" },
  { label: "Current", value: "-18.2 A" },
  { label: "SOC", value: "74.5 %" },
  { label: "SOH", value: "96.1 %" },
  { label: "Max Temperature", value: "32.4 °C" },
];

const DASHBOARD_CAN_IDS = ["0x101", "0x102", "0x201", "0x202", "0x301", "0x7EE"];

const DASHBOARD_EVENTS: { time: string; label: string; severity: "ok" | "medium" | "high" }[] = [
  { time: "10:32:04", label: "NORMAL", severity: "ok" },
  { time: "10:32:15", label: "UNKNOWN_CAN_ID", severity: "medium" },
  { time: "10:32:22", label: "MESSAGE_FREQUENCY_ANOMALY", severity: "high" },
  { time: "10:32:40", label: "TEMPERATURE_ANOMALY", severity: "high" },
];

const DASHBOARD_BADGE: Record<string, string> = {
  ok: styles.dashboardEventBadgeOk,
  medium: styles.dashboardEventBadgeMedium,
  high: styles.dashboardEventBadgeHigh,
};

const DASHBOARD_SEVERITY_LABEL: Record<string, string> = { ok: "OK", medium: "MEDIUM", high: "HIGH" };

/* ─── Final Demo Scenarios ─── */
type Scenario = { title: string; desc: string; flag?: string };

const SCENARIOS: Scenario[] = [
  { title: "Start Healthy System", desc: "Start the Battery/BMS simulation and show voltage, current, temperature, SOC and SOH updating live.", flag: "STATUS: NORMAL" },
  { title: "Show CAN Communication", desc: "Display CAN IDs, payload, timestamp, decoded BMS signals and messages/sec on the bus." },
  { title: "Sensor / BMS Anomaly", desc: "Inject an unrealistic temperature or abnormal SOC transition.", flag: "SIGNAL ANOMALY" },
  { title: "Unknown CAN ID", desc: "Introduce an unexpected CAN ID onto the bus.", flag: "UNKNOWN CAN ID" },
  { title: "Message Frequency Anomaly", desc: "Change the expected 100 ms message timing to an abnormal rate.", flag: "MESSAGE FREQUENCY ANOMALY" },
  { title: "Missing / Stale Message", desc: "Stop one expected message and let AegisCAN notice it has gone silent.", flag: "MISSING / STALE MESSAGE" },
  { title: "Engineering Evidence", desc: "Select one event and show its timestamp, CAN ID, expected vs observed behaviour, detection rule, severity and evidence." },
  { title: "Root Cause Analysis", desc: "Explain what happened, why it was abnormal, how it was detected, what evidence proves it, and what an engineer would investigate next." },
];

/* ─── 12-Week Plan (Learn / Build / Demonstrate / Submit) ─── */
const WEEKS: Week[] = [
  {
    n: 1, phase: "Phase 1", title: "Project Orientation & Industry Context",
    learn: ["What is EV / BESS / Battery / BMS / CAN?", "What a BMS/Test/Validation engineer does", "Why cybersecurity matters"],
    build: ["Git repository + project structure", "Python environment", "Documentation structure"],
    demonstrate: ["A working repo with README and an initial architecture diagram"],
    submit: ["Project Charter", "Problem Statement + Learning Goals", "Initial Architecture", "Responsibility matrix"],
  },
  {
    n: 2, phase: "Phase 1", title: "Battery Fundamentals",
    learn: ["Cell, module, pack; series/parallel", "Voltage, current, capacity, energy", "SOC, SOH, SOP introduction", "Charging/discharging & battery safety"],
    build: ["Simple battery data simulator", "(Optional) explore a PyBaMM example model"],
    demonstrate: ["Voltage/current/SOC/temperature changing over time"],
    submit: ["Battery Fundamentals Note", "Parameter dictionary", "Simulator source + sample dataset/plots"],
  },
  {
    n: 3, phase: "Phase 1", title: "BMS + BESS Fundamentals",
    learn: ["BMS: sensing, protection, balancing, contactors, fault management", "BESS: rack, BMS, PCS, EMS, thermal management, monitoring"],
    build: ["Simplified BMS model extending the simulator", "(Optional) map a PyBaMM output to a BMS signal"],
    demonstrate: ["Normal BMS operation plus one simulated battery fault"],
    submit: ["BMS block diagram", "BESS architecture diagram", "Fault state definitions"],
  },
  {
    n: 4, phase: "Phase 1", title: "CAN Fundamentals",
    learn: ["CAN bus, controller, transceiver, arbitration", "CAN ID, DLC, payload, frame, message frequency", "CAN FD & DBC concept introduction"],
    build: ["Encode selected BMS parameters as CAN messages"],
    demonstrate: ["BMS values becoming CAN frames — Milestone 1"],
    submit: ["CAN learning note + CAN message map", "CAN ID / signal scaling definition", "CAN generator source"],
  },
  {
    n: 5, phase: "Phase 2", title: "CAN Monitoring & Data Acquisition",
    learn: ["CAN logging, timestamps, message rates", "Decoding and engineering data acquisition"],
    build: ["CAN logger and decoder"],
    demonstrate: ["Raw CAN → decoded BMS values"],
    submit: ["CAN logger + decoder source", "CSV/JSON logs", "Message frequency analysis"],
  },
  {
    n: 6, phase: "Phase 2", title: "Validation Engineering",
    learn: ["Requirements, verification, validation", "Test plans, expected vs actual, traceability", "Boundary and negative testing"],
    build: ["Automated tests for the simulated BMS/CAN system"],
    demonstrate: ["Test suite running with recorded evidence"],
    submit: ["Test Plan", "Requirements Traceability Matrix", "≥10 functional test cases + results"],
  },
  {
    n: 7, phase: "Phase 2", title: "Fault Injection & Root Cause Analysis",
    learn: ["Fault injection, diagnostics, debugging", "Root-cause analysis, FMEA concept"],
    build: ["Controlled faults: voltage, temperature, invalid SOC, missing message, abnormal frequency"],
    demonstrate: ["Inject fault → observe → diagnose → explain root cause"],
    submit: ["Fault Catalogue", "Fault injection module", "RCA worksheet + evidence logs"],
  },
  {
    n: 8, phase: "Phase 2", title: "CAN Cybersecurity Fundamentals",
    learn: ["Threat, vulnerability, risk, attack surface", "Spoofing, replay, flooding, unauthorized message"],
    build: ["Controlled abnormal CAN scenarios (simulation-only)"],
    demonstrate: ["Normal CAN vs anomalous CAN — Milestone 2"],
    submit: ["Threat Model + attack surface diagram", "Simulated security dataset", "Security requirements"],
  },
  {
    n: 9, phase: "Phase 3", title: "AegisCAN Detection Engine",
    learn: ["Baselines, thresholds, rules", "Timing anomaly, payload anomaly"],
    build: ["Detection for unknown ID, rate anomaly, sensor range, sudden change, missing/stale message"],
    demonstrate: ["Inject anomaly → detect → generate alert"],
    submit: ["Detection Engine + rules", "Alert schema", "Security test results"],
  },
  {
    n: 10, phase: "Phase 3", title: "Data Analytics + Optional AI/ML",
    learn: ["Feature engineering, baseline behaviour", "False positive/negative, precision/recall concept"],
    build: ["Mandatory: statistical analysis. Optional: a simple ML anomaly-detection experiment"],
    demonstrate: ["Explain why a message was classified normal vs anomalous"],
    submit: ["Feature list + baseline analysis", "Detection comparison", "Short ML experiment (if attempted)"],
  },
  {
    n: 11, phase: "Phase 3", title: "Integration, Dashboard & QA",
    learn: ["System integration practices", "Regression testing, defect triage"],
    build: ["Integrate Battery→BMS→CAN→Logger→Fault Injection→AegisCAN→Dashboard"],
    demonstrate: ["End-to-end demonstration"],
    submit: ["Integrated prototype + dashboard", "Regression tests + bug list", "QA report"],
  },
  {
    n: 12, phase: "Phase 3", title: "Industry Readiness & Final Engineering Review",
    learn: ["Presenting engineering work", "Career framing of the project"],
    build: ["Finish requirements, architecture, testing, traceability and evidence"],
    demonstrate: ["Full pipeline demo — Milestone 3 / Final Gate"],
    submit: ["Final Report + Final/Security Test Report", "Demo video + presentation", "Individual Contribution + Career Skill Matrix"],
  },
];

/* ─── Skill categories → compact chip groups (BOTH the industry-skills
   mapping and the "Industry-Ready Skills" ask collapse into this one
   section so the same content isn't shown twice) ─── */
type SkillGroup = { title: string; items: string[] };

const SKILL_GROUPS: SkillGroup[] = [
  { title: "Battery Engineering", items: ["Cell/module/pack", "Voltage · Current · Temp", "SOC", "SOH", "SOP", "Cell balancing", "Battery safety"] },
  { title: "BMS Engineering", items: ["BMS architecture", "Sensors", "Protection functions", "Fault states", "Diagnostics"] },
  { title: "BESS", items: ["BESS architecture", "Racks/packs", "PCS concept", "EMS concept", "Thermal management", "Commissioning"] },
  { title: "Communication", items: ["CAN", "CAN ID", "DLC", "Arbitration", "CAN FD", "DBC concept", "SPI/UART/Modbus (awareness)"] },
  { title: "Validation Engineering", items: ["Traceability", "Test planning", "Functional testing", "Fault injection", "Boundary/negative testing", "Regression testing"] },
  { title: "Data Analysis", items: ["CAN logs & timestamps", "Message frequency", "Sensor trends", "SOC/SOH data", "Anomaly analysis"] },
  { title: "Cybersecurity", items: ["Threat modelling", "Attack surface", "Spoofing", "Replay", "Flooding", "Defensive monitoring"] },
  { title: "Automation (Python)", items: ["CAN simulation", "Log processing", "Test automation", "Reporting"] },
  { title: "Engineering Skills", items: ["Debugging", "Root-cause analysis", "Requirements writing", "Git", "Technical reports"] },
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
  "Simulate battery/BMS data.", "Generate CAN-like frames.", "Support timestamp.", "Support CAN ID.", "Support DLC.",
  "Support payload.", "Decode selected BMS signals.", "Display voltage.", "Display current.", "Display temperature.",
  "Display SOC.", "Display SOH.", "Log messages.", "Calculate message frequency.", "Identify unknown CAN IDs.",
  "Identify abnormal message frequency.", "Identify configurable out-of-range BMS values.", "Provide controlled replay simulation.",
  "Provide controlled spoofing simulation.", "Provide controlled flooding simulation.", "Generate alerts.",
  "Assign anomaly category.", "Provide severity.", "Retain evidence.", "Export or preserve test results.",
];

const NON_FUNCTIONAL_REQUIREMENTS = [
  "Beginner-friendly", "Modular architecture", "Reproducible simulation", "Deterministic test scenarios where practical",
  "Readable, documented, maintainable code", "Clear error handling", "No dependency on high-voltage equipment",
  "Safe lab operation", "Reasonable performance for student laptops", "Traceable requirements and tests",
];

const UI_UX_REQUIREMENTS = [
  "Desktop, tablet and mobile are all first-class — verified at 360/390/430/768/1024/1280/1440/1920px",
  "No horizontal page scroll, clipped headings, overflowing tables or overlapping buttons",
  "The weekly plan and interview prep use native, keyboard-accessible <details> accordions",
  "Wide tables collapse into per-row cards on narrow screens instead of forcing sideways scrolling",
  "A sticky section nav lets a student jump the long page without losing their place",
];

const ACCEPTANCE_CRITERIA = [
  "A student can run the battery/BMS simulator and see voltage, current, temperature, SOC and SOH change over time.",
  "Simulated BMS signals are encoded into CAN-like frames carrying timestamp, CAN ID, DLC and payload.",
  "The CAN logger records every frame to a log a decoder can replay.",
  "Injecting an unknown CAN ID, an abnormal rate, or an out-of-range value produces an alert with category and severity.",
  "Every functional requirement has at least one passing test case with recorded evidence.",
  "The final dashboard shows pack voltage, current, SOC, SOH, temperature, CAN IDs, messages/sec, faults and anomalies together.",
];

const SECURITY_REQUIREMENTS = [
  { id: "SEC-01", text: "Testing only on authorized simulation/lab systems." },
  { id: "SEC-02", text: "No functionality intended for attacking real vehicles or deployed BESS systems." },
  { id: "SEC-03", text: "Validate external inputs." },
  { id: "SEC-04", text: "Protect logs from accidental modification where practical." },
  { id: "SEC-05", text: "Clearly identify simulated attack data." },
  { id: "SEC-06", text: "Do not expose secrets in source control." },
  { id: "SEC-07", text: "Use dependency/version management." },
  { id: "SEC-08", text: "Log security-relevant events." },
  { id: "SEC-09", text: "Separate detection logic from simulation/fault-injection logic." },
  { id: "SEC-10", text: "Maintain reproducible test evidence." },
];

const FUNCTIONAL_TEST_CASES: { id: string; requirement: string; input: string; expected: string }[] = [
  { id: "TC-F-01", requirement: "Battery/BMS sim", input: "Run simulator for 60s", expected: "Voltage/current/temp/SOC/SOH all update each tick" },
  { id: "TC-F-02", requirement: "CAN encoding", input: "Encode one BMS sample", expected: "Frame carries valid timestamp, CAN ID, DLC=8, payload" },
  { id: "TC-F-03", requirement: "CAN decoding", input: "Decode a logged frame", expected: "Decoded signals match the encoded values" },
  { id: "TC-F-04", requirement: "Message frequency", input: "Send 20 frames of 0x101 in 2s", expected: "Computed frequency ≈ 10 msg/s (±1)" },
  { id: "TC-F-05", requirement: "Unknown ID detection", input: "Send frame with CAN ID 0x9FF", expected: "Flagged UNKNOWN_CAN_ID" },
  { id: "TC-F-06", requirement: "Flood detection", input: "Flood 0x101 at 200 msg/s (baseline 10)", expected: "Flagged MESSAGE_FREQUENCY_ANOMALY" },
  { id: "TC-F-07", requirement: "Sensor range", input: "pack_voltage_v = 900 (valid 250–420)", expected: "Flagged SENSOR_RANGE_ANOMALY" },
  { id: "TC-F-08", requirement: "Alert schema", input: "Trigger any anomaly above", expected: "Alert generated with category + severity" },
];

type TestCase = { id: string; requirement: string; precondition: string; input: string; steps: string; expected: string; actual: string; pass: boolean; evidence: string };

const SECURITY_TEST_CASES: TestCase[] = [
  { id: "TC-SEC-01", requirement: "FR-15 / SEC-05", precondition: "Message map has known IDs", input: "Frame with CAN ID 0x7EE", steps: "Inject frame → observe monitor", expected: "UNKNOWN_CAN_ID, severity MEDIUM", actual: "UNKNOWN_CAN_ID raised, MEDIUM", pass: true, evidence: "log_unknown_id_001.json" },
  { id: "TC-SEC-02", requirement: "FR-16, FR-20", precondition: "Baseline interval 100 ms", input: "Flood 0x101 at 5 ms for 10s", steps: "Start flood → observe alert", expected: "MESSAGE_FREQUENCY_ANOMALY, HIGH", actual: "Raised, HIGH", pass: true, evidence: "log_flood_002.json" },
  { id: "TC-SEC-03", requirement: "FR-18", precondition: "10s of normal traffic captured", input: "Replay same 10s capture immediately", steps: "Replay → compare sequence/timestamps", expected: "REPLAY_PATTERN raised", actual: "Raised on duplicate sequence", pass: true, evidence: "log_replay_003.json" },
  { id: "TC-SEC-04", requirement: "FR-17", precondition: "Valid temp range 0–60°C", input: "max_cell_temp_c = 145", steps: "Inject spoofed value → observe", expected: "SENSOR_RANGE_ANOMALY, HIGH", actual: "Raised, HIGH", pass: true, evidence: "log_sensor_range_004.json" },
  { id: "TC-SEC-05", requirement: "FR-17", precondition: "Previous SOC = 74.5%", input: "Next SOC = 12.0% within 250 ms", steps: "Inject jump → observe", expected: "UNEXPECTED_SOC_TRANSITION raised", actual: "Raised", pass: true, evidence: "log_soc_jump_005.json" },
  { id: "TC-SEC-06", requirement: "FR-06", precondition: "Expected DLC=8 for 0x101", input: "Frame with DLC=3, truncated payload", steps: "Inject malformed frame", expected: "MALFORMED_FRAME, decoder survives", actual: "Raised, handled gracefully", pass: true, evidence: "log_malformed_006.json" },
  { id: "TC-SEC-07", requirement: "FR-16", precondition: "0x101 expected every 100 ms", input: "Withhold 0x101 for 2s", steps: "Stop generator → wait timeout", expected: "MISSING/STALE_SIGNAL raised", actual: "STALE_SIGNAL raised", pass: true, evidence: "log_missing_007.json" },
  { id: "TC-SEC-08", requirement: "SEC-03", precondition: "Config file present", input: "Corrupted JSON config", steps: "Start AegisCAN with bad config", expected: "Fails safely with clear error", actual: "Validation error on startup", pass: true, evidence: "log_config_008.json" },
];

const POSITIVE_USE_CASES = [
  "Normal battery operation", "Normal CAN traffic", "Expected SOC change over a discharge cycle",
  "Expected temperature variation under load", "Expected message interval (e.g. 100 ms)", "Known CAN IDs matching the message map",
];

const NEGATIVE_USE_CASES = [
  "Unknown CAN ID", "Excessive message frequency (flooding)", "Replayed message sequence", "Spoofed sensor value",
  "Unrealistic temperature or SOC transition", "Invalid DLC / malformed payload", "Missing or stale message",
];

/* ─── Document Submission: 8 grouped packages ─── */
type Package = { num: string; title: string; includes: string[] };

const PACKAGES: Package[] = [
  { num: "01", title: "Project Definition", includes: ["Project Charter", "Business Goal + Problem Statement", "Scope, team & responsibilities", "Learning objectives"] },
  { num: "02", title: "Engineering Study", includes: ["Battery, BMS, BESS notes", "CAN study", "Cybersecurity fundamentals", "References"] },
  { num: "03", title: "System Design", includes: ["Architecture + module design", "Interfaces", "CAN message map + signal definitions", "Threat model"] },
  { num: "04", title: "Requirements & Traceability", includes: ["Functional + non-functional requirements", "Security requirements", "Acceptance criteria", "Traceability matrix"] },
  { num: "05", title: "Test & Validation Report", includes: ["Test plan + functional/negative tests", "Fault injection + security tests", "Results & defects", "Root cause analysis"] },
  { num: "06", title: "Engineering Evidence", includes: ["CAN logs, datasets, screenshots, plots", "Sample JSON + configuration", "Demo-1, Demo-2 & final-demo evidence"] },
  { num: "07", title: "Source Code", includes: ["Git repository + README", "Setup instructions + dependencies", "Configuration", "Release/tag + contribution history"] },
  { num: "08", title: "Final Project Package", includes: ["Final report + presentation", "Final demo video", "Individual contribution + lessons learned", "Career skill matrix + résumé summary"] },
];

const FINAL_READINESS_CHECKLIST = [
  "Battery simulator works and BMS values are generated",
  "CAN frames are generated, decoded and logged",
  "Normal traffic is recognized as normal",
  "Unknown ID, abnormal frequency, sensor anomaly and missing message are all detected",
  "Dashboard works end-to-end",
  "Functional and security tests pass, each mapped to a requirement",
  "Requirement traceability is complete",
  "Source code is version controlled with a README another student can follow",
  "Final demonstration is reproducible",
  "Student can explain the system without reading slides",
];

const QA_CHECKS = ["Requirements are testable", "Tests map to requirements", "Expected results are defined", "Evidence exists", "Regression testing performed", "Security scenarios tested"];
const ARCHITECT_CHECKS = ["System architecture", "Module boundaries", "CAN message design", "Detection architecture", "Safety/cybersecurity assumptions", "Extensibility"];

/* ─── Career: grouped role families ─── */
type CareerGroup = { title: string; roles: string[] };

const CAREER_GROUPS: CareerGroup[] = [
  { title: "Battery & Energy", roles: ["BMS Engineer", "BMS Test Engineer", "BMS Validation Engineer", "Battery Systems Engineer", "Battery Test Engineer", "BESS Engineer", "BESS Validation Engineer"] },
  { title: "Embedded & Communication", roles: ["Embedded Systems Engineer", "Embedded Test Engineer", "CAN Communication Engineer", "ECU Test Engineer"] },
  { title: "Validation", roles: ["Verification & Validation Engineer", "System Integration Engineer", "Automotive Test Engineer", "Automotive Validation Engineer", "Test Automation Engineer", "Data Acquisition / Validation Engineer"] },
  { title: "Cybersecurity", roles: ["Automotive Cybersecurity Engineer", "Embedded Cybersecurity Engineer"] },
  { title: "Aerospace / UAV", roles: ["UAV Embedded Systems Engineer", "Avionics Systems / Test Engineer"] },
];

const SKILL_MATRIX: { skill: string; weeks: string }[] = [
  { skill: "Battery fundamentals", weeks: "Weeks 2–3" }, { skill: "BMS", weeks: "Weeks 3–12" }, { skill: "BESS", weeks: "Weeks 3–12" },
  { skill: "SOC / SOH / SOP", weeks: "Weeks 2–3" }, { skill: "CAN", weeks: "Weeks 4–12" }, { skill: "Data acquisition", weeks: "Week 5 onward" },
  { skill: "Functional testing", weeks: "Week 6 onward" }, { skill: "Fault injection", weeks: "Week 7 onward" }, { skill: "Root cause analysis", weeks: "Week 7 onward" },
  { skill: "Cybersecurity", weeks: "Week 8 onward" }, { skill: "Test automation", weeks: "Weeks 6–12" }, { skill: "Python", weeks: "Throughout" },
  { skill: "Requirements & traceability", weeks: "Weeks 1, 6 & 4" }, { skill: "Git", weeks: "Throughout" }, { skill: "System integration", weeks: "Week 11" },
];

const INTERVIEW_QUESTIONS = [
  "What is a battery cell/module/pack?", "What is BMS? What is BESS? What's the difference?", "What are SOC and SOH?",
  "What is CAN? Why is it used? What is a CAN ID / DLC / arbitration?", "What is fault injection, and what is validation?",
  "What is requirement traceability? How did you test your project?", "What happens if a CAN message disappears?",
  "How can abnormal message frequency be detected?", "What is CAN spoofing? What is replay?",
  "What is anomaly detection, and how did AegisCAN detect anomalies?", "What was your contribution?",
  "What failed during the project, and how did you debug it?", "What engineering evidence did you create?",
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
  { name: "ISO 11898 — CAN physical/data link layer overview", href: "https://www.iso.org/standard/63648.html" },
  { name: "DroneCAN documentation", href: "https://dronecan.github.io/" },
  { name: "PyBaMM — Python Battery Mathematical Modelling docs", href: "https://docs.pybamm.org/" },
  { name: "IEEE Xplore — battery/BMS and automotive cybersecurity research", href: "https://ieeexplore.ieee.org/" },
];

/* ─── Research & Project Leadership ─── */
type ResearcherLink = { label: string; href: string; external?: boolean };
type Researcher = {
  role: string;
  name: string;
  focus?: string;
  body: string;
  links: ResearcherLink[];
};

const RESEARCHERS: Researcher[] = [
  {
    role: "Lead Researcher · EV.ENGINEER™",
    name: "Tanuja Jadhav",
    body: "Project Initiated & Led by Tanuja Jadhav. Leads the AegisCAN initiative, including project direction, student research coordination and development of the Battery–BMS–BESS–CAN engineering learning framework.",
    links: [
      { label: "Tanuja Jadhav — EV Society Research Profile", href: "https://www.evsociety.org/projects/battery-safety-systems/candidates/tanujajadhav" },
      { label: "Tanuja Jadhav on LinkedIn", href: "https://www.linkedin.com/in/tanuja-jadhav-049431398/" },
    ],
  },
  {
    role: "Cybersecurity Researcher · EV.ENGINEER™",
    name: "Bhavya Naga Sai Parvathi Kshatri",
    focus: "Cybersecurity Professional · AI SOC Analyst · Threat Detection & Alert Investigation",
    body: "Contributes to the AegisCAN cybersecurity research track, including threat analysis, security monitoring, anomaly investigation and defensive cybersecurity concepts relevant to CAN-based systems.",
    links: [
      { label: "Bhavya Naga Sai Parvathi Kshatri on LinkedIn", href: "https://www.linkedin.com/in/bhavya-naga-sai-parvathi-kshatri-3140251a2/" },
    ],
  },
  {
    role: "Co-Researcher · EV.ENGINEER™",
    name: "Harsh Yadav",
    focus: "Aerospace Cybersecurity Researcher · Aerospace Quality Management · AS9102 FAI",
    body: "Contributes to AegisCAN research with a focus on aerospace cybersecurity and engineering practices relevant to safety-critical and mission-critical systems. His current project work also includes aerospace quality-management workflows and AS9102 First Article Inspection (FAI).",
    links: [{ label: "Harsh Yadav on LinkedIn", href: "https://www.linkedin.com/in/harsh-yadav-871a0a26b/" }],
  },
  {
    role: "Co-Researcher · EV.ENGINEER™",
    name: "Sudarshana Karkala",
    body: "Contributes to AegisCAN research direction, engineering architecture, Battery/BMS/BESS/CAN integration and the broader EV.ENGINEER™ engineering research framework.",
    links: [
      { label: "Sudarshana Karkala — EV.ENGINEER Profile", href: "https://aerospace.ev.engineer/about/sudarshana-karkala" },
      { label: "Sudarshana Karkala on LinkedIn", href: "https://www.linkedin.com/in/sudarshanakarkala/" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

function FlowChain({ steps, currentIndex }: { steps: string[]; currentIndex?: number }) {
  return (
    <div className={styles.flowWrap}>
      {steps.map((step, i) => (
        <span className={styles.flowWrapPair} key={step}>
          <span className={i === currentIndex ? styles.flowWrapStepCurrent : styles.flowWrapStep}>{step}</span>
          {i < steps.length - 1 && <span className={styles.flowWrapArrow} aria-hidden="true">→</span>}
        </span>
      ))}
    </div>
  );
}

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
            <span className={styles.heroPill}>E&amp;C / ECE / EEE / EE Students</span>
          </div>

          <h1 className={styles.heroTitle}>AegisCAN</h1>
          <p className={styles.heroSubtitle}>Intelligent CAN Cybersecurity · EV · BMS · BESS · Aerospace · UAV</p>

          <p className={styles.heroDesc}>
            Build a simulated Battery/BMS system, communicate its data over CAN, validate normal and faulty
            behaviour, and develop AegisCAN to detect abnormal CAN/BMS activity.
          </p>

          <div className={styles.heroMetrics}>
            {HERO_METRICS.map((m) => (
              <div className={styles.heroMetric} key={m.label}>
                <span className={styles.heroMetricValue}>{m.value}</span>
                <span className={styles.heroMetricLabel}>{m.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.heroCtas}>
            <a href="#timeline" className="btn btn-primary" data-track-event="aegiscan_hero_start_journey">
              Start the 12-Week Journey
            </a>
            <a href="#final-demo" className="btn btn-secondary" data-track-event="aegiscan_hero_view_final_demo">
              View Final Demo
            </a>
          </div>

          {/* ═══════ DISCLAIMER ═══════ */}
          <div className={styles.disclaimer} id="disclaimer">
            <p className={styles.disclaimerText}>
              <strong>AegisCAN is an educational and research prototype.</strong> Not a production BMS,
              commercial IDS, certified automotive/aerospace cybersecurity product, or safety-certified BESS
              controller. All fault-injection and cybersecurity exercises run only in controlled simulation/lab
              environments on systems the student is authorized to test.
            </p>
          </div>

          <p className={styles.attribution}>
            Project Initiated &amp; Led by <a href="#research-team">Tanuja Jadhav</a> — Lead Researcher · EV.ENGINEER™
          </p>
        </div>
      </section>

      {/* ═══════ STICKY SECTION NAV ═══════ */}
      <nav className={styles.sectionNav} aria-label="AegisCAN page sections">
        <div className={`container ${styles.sectionNavInner}`}>
          {SECTION_NAV.map((s) => (
            <a className={styles.sectionNavLink} href={`#${s.id}`} key={s.id}>{s.label}</a>
          ))}
        </div>
      </nav>

      {/* ═══════ YOUR MISSION ═══════ */}
      <section className={styles.pageSection} id="mission">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your 12-Week Mission</h2>
          </div>
          <FlowChain steps={MISSION_FLOW} />
          <p className={styles.missionSentence}>
            Learn the system, build the simulation, test failures, detect anomalies and demonstrate your
            engineering evidence.
          </p>
        </div>
      </section>

      {/* ═══════ 3 PROJECT PHASES ═══════ */}
      <section className={styles.pageSectionAlt} id="phases">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Understand → Learn → Build → Demonstrate</span>
            <h2 className={styles.sectionTitle}>Three Project Phases</h2>
            <p className={styles.sectionSubtitle}>The 12 weeks group into three phases, each ending with a clear, demonstrable outcome.</p>
          </div>
          <div className={styles.phaseGrid}>
            {PHASES.map((p) => (
              <div className={styles.phaseCard} key={p.num}>
                <div className={styles.phaseNum}>{p.num}</div>
                <div className={styles.phaseTitle}>{p.title}</div>
                <div className={styles.phaseWeeks}>{p.weeks}</div>
                <div className={styles.phaseFlow}>
                  {p.flow.map((f, i) => (
                    <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                      <span className={styles.phaseFlowStep}>{f}</span>
                      {i < p.flow.length - 1 && <span className={styles.phaseFlowArrow} aria-hidden="true">→</span>}
                    </span>
                  ))}
                </div>
                <div className={styles.phaseOutcome}>
                  <strong>Outcome</strong>
                  {p.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ENGINEERING MILESTONE REVIEWS ═══════ */}
      <section className={styles.pageSection} id="milestones">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section · Every 4 Weeks</span>
            <h2 className={styles.sectionTitle}>Engineering Milestone Reviews</h2>
            <p className={styles.sectionSubtitle}>Students demonstrate working engineering progress every four weeks — not just at the very end.</p>
          </div>
          <div className={styles.milestoneGrid}>
            {MILESTONES.map((m) => (
              <div className={styles.milestoneCard} key={m.week}>
                <span className={styles.milestoneWeekBadge}>{m.week}</span>
                <div className={styles.milestoneTitle}>{m.title}</div>
                <div className={styles.milestoneBlock}>
                  <h4>Must Explain</h4>
                  <ul>{m.explain.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
                <div className={styles.milestoneBlock} style={{ marginBottom: 0 }}>
                  <h4>Submit</h4>
                  <ul>{m.submit.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHAT WILL YOU DEMONSTRATE AT THE END ═══════ */}
      <section className={styles.pageSectionAlt} id="final-demo">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section · Final Gate</span>
            <h2 className={styles.sectionTitle}>What Will You Demonstrate at the End?</h2>
            <p className={styles.sectionSubtitle}>
              The target educational prototype — a conceptual dashboard, not a production application.
            </p>
          </div>

          <div className={styles.dashboardMockup}>
            <div className={styles.dashboardTitleBar}>
              <strong>AegisCAN — Battery &amp; CAN Security Monitor</strong>
              <span className={styles.dashboardStatusOk}>BUS: NORMAL</span>
            </div>
            <div className={styles.dashboardBody}>
              <div>
                <div className={styles.dashboardPanelTitle}>Battery / BMS</div>
                <div className={styles.dashboardRowGrid}>
                  {DASHBOARD_BMS_ROWS.map((r) => (
                    <div className={styles.dashboardRow} key={r.label}>
                      <span className={styles.dashboardLabel}>{r.label}</span>
                      <span className={styles.dashboardValue}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className={styles.dashboardPanelTitle}>CAN Network</div>
                <div className={styles.dashboardRowGrid}>
                  <div className={styles.dashboardRow}><span className={styles.dashboardLabel}>Active CAN IDs</span><span className={styles.dashboardValue}>6</span></div>
                  <div className={styles.dashboardRow}><span className={styles.dashboardLabel}>Messages/sec</span><span className={styles.dashboardValue}>60</span></div>
                  <div className={styles.dashboardRow}><span className={styles.dashboardLabel}>Bus State</span><span className={styles.dashboardValue}>NORMAL</span></div>
                </div>
                <div className={styles.dashboardIdChips}>
                  {DASHBOARD_CAN_IDS.map((id) => <span className={styles.dashboardIdChip} key={id}>{id}</span>)}
                </div>
              </div>

              <div>
                <div className={styles.dashboardPanelTitle}>Security / Validation Events</div>
                <div className={styles.dashboardEventList}>
                  {DASHBOARD_EVENTS.map((e) => (
                    <div className={styles.dashboardEventRow} key={e.time}>
                      <span className={styles.dashboardEventTime}>{e.time}</span>
                      <span className={styles.dashboardEventLabel}>{e.label}</span>
                      <span className={DASHBOARD_BADGE[e.severity]}>{DASHBOARD_SEVERITY_LABEL[e.severity]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className={styles.dashboardPanelTitle}>Selected Event</div>
                <div className={styles.dashboardDetailGrid}>
                  <div className={styles.dashboardDetailItem}><strong>Type</strong>MESSAGE_FREQUENCY_ANOMALY</div>
                  <div className={styles.dashboardDetailItem}><strong>Severity</strong>HIGH</div>
                  <div className={styles.dashboardDetailItem}><strong>Expected Interval</strong>100 ms</div>
                  <div className={styles.dashboardDetailItem}><strong>Observed Interval</strong>5 ms</div>
                  <div className={`${styles.dashboardDetailItem} ${styles.dashboardDetailFull}`}>
                    <strong>Evidence</strong>Message frequency exceeded configured baseline.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem", textAlign: "center" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Final Demo Scenario</h3>
            <p className={styles.sectionSubtitle}>Eight scenarios, run in order, prove the whole pipeline works.</p>
          </div>
          <div className={styles.scenarioList}>
            {SCENARIOS.map((s, i) => (
              <div className={styles.scenarioItem} key={s.title}>
                <span className={styles.scenarioNum}>{i + 1}</span>
                <div className={styles.scenarioBody}>
                  <div className={styles.scenarioTitle}>{s.title}</div>
                  <div className={styles.scenarioDesc}>{s.desc}</div>
                  {s.flag && <span className={styles.scenarioFlag}>{s.flag}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 12-WEEK EXECUTION PLAN ═══════ */}
      <section className={styles.pageSection} id="timeline">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section · Execution Plan</span>
            <h2 className={styles.sectionTitle}>12-Week Execution Plan</h2>
            <p className={styles.sectionSubtitle}>
              Discussion started 21 September 2026 · Target completion 21 December 2026 · ~4–6 hrs/week.
              Every week follows the same shape — Learn · Build · Demonstrate · Submit.
            </p>
          </div>
          <WeekAccordions weeks={WEEKS} />
        </div>
      </section>

      {/* ═══════ WHY THIS PROJECT / BUSINESS GOAL / PROBLEM STATEMENT ═══════ */}
      <section className={styles.pageSectionAlt} id="why">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why This Project?</h2>
          </div>
          <p className={styles.bodyTextCenter}>
            Modern EVs and energy-storage systems run on electronics, sensors, embedded controllers, BMS
            software and communication networks. AegisCAN connects battery behaviour, BMS/BESS architecture,
            CAN communication, validation, fault injection and cybersecurity into one manageable project.
          </p>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Business Goal</h3>
          </div>
          <p className={styles.bodyText} style={{ margin: "0 auto" }}>
            Develop engineering talent capable of understanding and validating intelligent battery and
            energy-storage systems — foundational skills relevant to EVs, BMS, BESS, automotive electronics,
            embedded systems, CAN networks, system validation, cybersecurity and UAV/aerospace systems.
            The emphasis is employability through engineering fundamentals and demonstrable evidence.
          </p>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Problem Statement</h3>
            <p className={styles.sectionSubtitle} style={{ maxWidth: "none" }}>
              Battery parameters (voltage, current, temperature, SOC, SOH, protection status, alarms) travel
              between controllers over CAN. Communication faults, incorrect messages or unauthorized traffic can
              affect monitoring and diagnostics. Students need an environment where they can understand:
            </p>
          </div>
          <div className={styles.cardGrid3}>
            {[
              "How battery systems and BMS work",
              "How BESS integrates a pack with supporting subsystems",
              "How CAN carries system information",
              "How engineers monitor CAN traffic",
              "How faults can be injected safely",
              "How abnormal behaviour is identified, tested and traced back to a root cause",
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
            <h2 className={styles.sectionTitle}>Who Is This For?</h2>
          </div>
          <div className={styles.cardGrid3}>
            {PERSONAS.map((p) => (
              <div className={styles.personaCard} key={p.title}>
                <span className={styles.personaBadge}>{p.badge}</span>
                <div className={styles.cardIcon} aria-hidden="true">{p.icon}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>{p.body}</p>
                <div className={styles.cardEyebrow}>Needs</div>
                <ul className={styles.cardList}>{p.needs.map((n, i) => <li key={i}>{n}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BESS FUNDAMENTALS ═══════ */}
      <section className={styles.pageSectionAlt} id="bess">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Technical Reference · BESS Fundamentals</span>
            <h2 className={styles.sectionTitle}>Understanding BESS</h2>
            <p className={styles.sectionSubtitle}>
              BESS = Battery Energy Storage System. Students learn the data and communication layer through
              simulation — the project does not require building a real BESS.
            </p>
          </div>
          <FlowChain steps={BESS_FLOW} />
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>Term</th><th>What it means</th></tr></thead>
              <tbody>
                <tr><td style={{ fontWeight: 700, color: "var(--text-primary)" }}>Battery</td><td>The electrochemical energy-storage device — cells, modules and packs.</td></tr>
                <tr><td style={{ fontWeight: 700, color: "var(--text-primary)" }}>BMS</td><td>Electronics and software that sense, protect, balance and report on one battery pack.</td></tr>
                <tr><td style={{ fontWeight: 700, color: "var(--text-primary)" }}>BESS</td><td>The full system around one or more packs — BMS hierarchy, PCS, EMS, thermal management, protection and monitoring/SCADA.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ EPIC & USER STORIES ═══════ */}
      <section className={styles.pageSection} id="epic-stories">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Technical Reference</span>
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
                <p className={styles.cardBody}><strong style={{ color: "var(--text-primary)" }}>{s.role}, </strong>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REQUIREMENTS ═══════ */}
      <section className={styles.pageSectionAlt} id="requirements">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Technical Reference</span>
            <h2 className={styles.sectionTitle}>Functional &amp; Non-Functional Requirements</h2>
          </div>

          <div className={styles.sectionHeaderLeft}><h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Functional Requirements</h3></div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>ID</th><th>Requirement</th></tr></thead>
              <tbody>
                {FUNCTIONAL_REQUIREMENTS.map((req, i) => (
                  <tr key={i}><td><code>FR-{String(i + 1).padStart(2, "0")}</code></td><td>{req}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}><h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Non-Functional Requirements</h3></div>
          <div className={styles.checklistGrid}>
            {NON_FUNCTIONAL_REQUIREMENTS.map((nfr, i) => (
              <div className={styles.checklistItem} key={i}><span className={styles.checklistCheck} aria-hidden="true">✓</span>{nfr}</div>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}><h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>UI/UX Requirements</h3></div>
          <div className={styles.checklistGrid}>
            {UI_UX_REQUIREMENTS.map((r, i) => (
              <div className={styles.checklistItem} key={i}><span className={styles.checklistCheck} aria-hidden="true">✓</span>{r}</div>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}><h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Acceptance Criteria</h3></div>
          <div className={styles.checklistGrid}>
            {ACCEPTANCE_CRITERIA.map((a, i) => (
              <div className={styles.checklistItem} key={i}><span className={styles.checklistCheck} aria-hidden="true">✓</span>{a}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SYSTEM ARCHITECTURE ═══════ */}
      <section className={styles.pageSection} id="architecture">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Technical Reference · Architecture Notes</span>
            <h2 className={styles.sectionTitle}>System Architecture</h2>
            <p className={styles.sectionSubtitle}>Simulation-first pipeline — no physical CAN hardware required</p>
          </div>
          <div className={styles.flowWrap}>
            {ARCHITECTURE_PIPELINE.map((step) => (
              <span className={styles.flowWrapPair} key={step}>
                <span className={styles.flowWrapStep}>{step}</span>
                <span className={styles.flowWrapArrow} aria-hidden="true">→</span>
              </span>
            ))}
            <span className={styles.flowWrapPair}>
              <div className={styles.flowVerticalBox}>
                <div className={styles.flowVerticalBoxTitle}>Detection Layer</div>
                <div className={styles.flowVerticalBoxList}>
                  {DETECTION_BOX.map((d) => <div className={styles.flowVerticalBoxItem} key={d}>{d}</div>)}
                </div>
              </div>
              <span className={styles.flowWrapArrow} aria-hidden="true">→</span>
            </span>
            {ARCHITECTURE_PIPELINE_TAIL.map((step, i) => (
              <span className={styles.flowWrapPair} key={step}>
                <span className={styles.flowWrapStep}>{step}</span>
                {i < ARCHITECTURE_PIPELINE_TAIL.length - 1 && <span className={styles.flowWrapArrow} aria-hidden="true">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SAMPLE DATA ═══════ */}
      <section className={styles.pageSectionAlt} id="sample-data">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Technical Reference</span>
            <h2 className={styles.sectionTitle}>Sample Input &amp; Output JSON</h2>
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

      {/* ═══════ USE CASES + SECURITY REQUIREMENTS + TEST CASES ═══════ */}
      <section className={styles.pageSection} id="use-cases">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Testing &amp; Security</span>
            <h2 className={styles.sectionTitle}>Positive &amp; Negative Use Cases</h2>
            <p className={styles.sectionSubtitle}>All anomalous scenarios run only as controlled educational simulations</p>
          </div>
          <div className={styles.useCaseGrid}>
            <div className={styles.useCasePanelPositive}>
              <div className={styles.useCasePanelTitlePositive}><span aria-hidden="true">✓</span> Positive Use Cases</div>
              <ul className={styles.useCaseList}>{POSITIVE_USE_CASES.map((u, i) => <li key={i}>{u}</li>)}</ul>
            </div>
            <div className={styles.useCasePanelNegative}>
              <div className={styles.useCasePanelTitleNegative}><span aria-hidden="true">✕</span> Negative / Anomalous Use Cases</div>
              <ul className={styles.useCaseList}>{NEGATIVE_USE_CASES.map((u, i) => <li key={i}>{u}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.pageSectionAlt} id="security">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Security Requirements</h2>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>ID</th><th>Requirement</th></tr></thead>
              <tbody>{SECURITY_REQUIREMENTS.map((s) => (
                <tr key={s.id}><td><code>{s.id}</code></td><td>{s.text}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.pageSection} id="test-cases">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Functional &amp; Security Test Cases</h2>
            <p className={styles.sectionSubtitle}>On narrow screens, each row becomes its own card — no sideways scrolling required to read one test case.</p>
          </div>

          <div className={styles.sectionHeaderLeft}><h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Functional Test Cases</h3></div>
          <div className={`${styles.tableWrapper} ${styles.responsiveTable}`}>
            <table className={styles.dataTable}>
              <thead><tr><th>Test ID</th><th>Requirement</th><th>Input</th><th>Expected Result</th></tr></thead>
              <tbody>
                {FUNCTIONAL_TEST_CASES.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Test ID"><code>{t.id}</code></td>
                    <td data-label="Requirement">{t.requirement}</td>
                    <td data-label="Input">{t.input}</td>
                    <td data-label="Expected Result">{t.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "2.5rem" }}><h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Security Test Cases</h3></div>
          <div className={`${styles.tableWrapper} ${styles.responsiveTable}`}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>Test ID</th><th>Requirement</th><th>Precondition</th><th>Input</th><th>Steps</th><th>Expected</th><th>Actual</th><th>Pass/Fail</th><th>Evidence</th></tr>
              </thead>
              <tbody>
                {SECURITY_TEST_CASES.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Test ID"><code>{t.id}</code></td>
                    <td data-label="Requirement">{t.requirement}</td>
                    <td data-label="Precondition">{t.precondition}</td>
                    <td data-label="Input">{t.input}</td>
                    <td data-label="Steps">{t.steps}</td>
                    <td data-label="Expected">{t.expected}</td>
                    <td data-label="Actual">{t.actual}</td>
                    <td data-label="Pass/Fail" style={{ color: t.pass ? "var(--accent-primary)" : "var(--error)", fontWeight: 700 }}>{t.pass ? "PASS" : "FAIL"}</td>
                    <td data-label="Evidence"><code>{t.evidence}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.bodyText} style={{ margin: "1rem auto 0", textAlign: "center", fontSize: "0.85rem" }}>
            Shown results are illustrative of the expected evidence format — each team records its own actual results and evidence files.
          </p>
        </div>
      </section>

      {/* ═══════ DOCUMENT SUBMISSION ═══════ */}
      <section className={styles.pageSectionAlt} id="submission">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Section · What You Submit</span>
            <h2 className={styles.sectionTitle}>Document Submission — 8 Packages</h2>
            <p className={styles.sectionSubtitle}>Engineering evidence groups into eight submission packages, not 21 separate reports.</p>
          </div>
          <div className={styles.cardGrid4}>
            {PACKAGES.map((p) => (
              <div className={styles.packageCard} key={p.num}>
                <div className={styles.packageNum}>{p.num}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <ul className={styles.cardList}>{p.includes.map((inc, i) => <li key={i}>{inc}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className={styles.submissionChecklist}>
            {PACKAGES.map((p) => (
              <div className={styles.submissionChecklistItem} key={p.num}>
                <span>{p.num} — {p.title}</span>
                <span className={styles.submissionChecklistBox} aria-hidden="true">☐</span>
              </div>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Final Readiness Checklist</h3>
          </div>
          <div className={styles.checklistGrid}>
            {FINAL_READINESS_CHECKLIST.map((c, i) => (
              <div className={styles.checklistItem} key={i}><span className={styles.checklistCheck} aria-hidden="true">☐</span>{c}</div>
            ))}
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>QA Review &amp; Architect Approval</h3>
          </div>
          <div className={styles.gateGrid}>
            <div className={styles.gateCard}>
              <div className={styles.gateStatus}>QA Status: Pending</div>
              <div className={styles.cardTitle}>QA Review</div>
              <ul className={styles.cardList}>{QA_CHECKS.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
            <div className={styles.gateCard}>
              <div className={styles.gateStatus}>Architect Status: Pending</div>
              <div className={styles.cardTitle}>Architect Approval</div>
              <ul className={styles.cardList}>{ARCHITECT_CHECKS.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CAREER OPPORTUNITIES ═══════ */}
      <section className={styles.pageSection} id="career">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Career Preparation</span>
            <h2 className={styles.sectionTitle}>How AegisCAN Helps Your Engineering Career</h2>
            <p className={styles.sectionSubtitle}>Foundational skills relevant to these career paths — completion does not guarantee employment.</p>
          </div>
          {CAREER_GROUPS.map((g) => (
            <div className={styles.careerGroup} key={g.title}>
              <div className={styles.careerGroupTitle}>{g.title}</div>
              <div className={styles.pillGrid}>{g.roles.map((r) => <span className={styles.rolePill} key={r}>{r}</span>)}</div>
            </div>
          ))}

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }}>
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Industry-Ready Skills</h3>
          </div>
          {SKILL_GROUPS.map((g) => (
            <div className={styles.careerGroup} key={g.title}>
              <div className={styles.careerGroupTitle}>{g.title}</div>
              <div className={styles.skillChipGrid} style={{ justifyContent: "flex-start" }}>
                {g.items.map((it) => <span className={styles.skillChip} key={it}>{it}</span>)}
              </div>
            </div>
          ))}

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }} id="skill-matrix">
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Job-Readiness Skill Matrix</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead><tr><th>Industry Skill</th><th>AegisCAN Experience</th></tr></thead>
              <tbody>
                {SKILL_MATRIX.map((s) => (
                  <tr key={s.skill}><td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.skill}</td><td>{s.weeks}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.sectionHeaderLeft} style={{ marginTop: "3rem" }} id="interview">
            <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem" }}>Can You Explain This in an Interview?</h3>
            <p className={styles.sectionSubtitle} style={{ maxWidth: "none" }}>
              Answer using your own AegisCAN evidence — logs, results, diagrams and code you personally wrote — not a memorized script.
            </p>
          </div>
          <div className={styles.accordionList} style={{ maxWidth: 780 }}>
            {INTERVIEW_QUESTIONS.map((q, i) => (
              <details className={styles.accordionItem} key={i}>
                <summary className={styles.faqSummary}>
                  <span>{q}</span>
                  <span className={styles.accordionChevron} aria-hidden="true">▾</span>
                </summary>
                <div className={styles.faqBody}>Answer this using your own project evidence, not a memorized script.</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PYBAMM ADVANCED TRACK (OPTIONAL) ═══════ */}
      <section className={styles.pageSectionAlt} id="pybamm">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Battery-Aware Cybersecurity &amp; Validation</h2>
            <p className={styles.sectionSubtitle}>Advanced Track — Optional. PyBaMM and ML anomaly detection are never required to finish AegisCAN.</p>
          </div>
          <div className={styles.optionalCard} style={{ maxWidth: 900, margin: "0 auto" }}>
            <span className={styles.optionalBanner}>Optional — not required to complete AegisCAN</span>
            <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>
              Mandatory path: <strong style={{ color: "var(--text-primary)" }}>Simple Python Battery Simulator →
              BMS Simulator → CAN → AegisCAN</strong>. Optional path for faster students:
            </p>
            <FlowChain steps={["Simple Python Battery Simulator", "PyBaMM Battery Model", "Expected Battery Behaviour", "BMS Signal Mapping", "CAN", "AegisCAN"]} />
            <p className={styles.cardBody} style={{ marginBottom: "1rem" }}>
              Students start from an existing PyBaMM example and focus on engineering outputs — voltage, current,
              charge/discharge cycles, SOC-related behaviour and degradation/SOH concepts. Deriving electrochemical
              models is never required. Optional ML anomaly detection (Week 10) follows the same rule: rule-based
              and statistical detection are mandatory; ML is an optional advanced experiment on top.
            </p>
            <div className={styles.discrepancyRow}>
              <div className={styles.discrepancyBox}><div className={styles.discrepancyLabel}>Battery Model Expected</div><div className={styles.discrepancyValue}>3.7 V</div></div>
              <span aria-hidden="true" style={{ color: "var(--accent-primary)", fontSize: "1.3rem" }}>vs</span>
              <div className={styles.discrepancyBox}><div className={styles.discrepancyLabel}>BMS / CAN Reported</div><div className={styles.discrepancyValueAlert}>4.8 V</div></div>
            </div>
            <p className={styles.cardBody}>
              AegisCAN may flag this discrepancy for investigation — comparing communication-layer behaviour with
              physically plausible battery behaviour, clearly labelled optional throughout.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S NEXT ═══════ */}
      <section className={styles.pageSectionAlt} id="webinar">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>EV Society Technical Webinar</h2>
          </div>
          <div className={styles.card} style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className={styles.cardEyebrow}>Suggested Title</div>
            <div className={styles.cardTitle} style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
              &ldquo;From Battery to Cybersecurity — Building AegisCAN&rdquo;
            </div>
            <p className={styles.cardBody}>
              Students explain Battery → BMS → BESS → CAN → Validation → Fault Injection → Cybersecurity →
              Detection → Testing → Results, emphasizing engineering understanding over source code.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ WHAT'S NEXT ═══════ */}
      <section className={styles.pageSection} id="whats-next">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What&rsquo;s Next?</h2>
          </div>
          <FlowChain steps={WHATS_NEXT.map((s) => s.v)} currentIndex={0} />
          <div className={styles.cardGrid4} style={{ marginTop: "0.5rem" }}>
            {WHATS_NEXT.map((s) => (
              <div className={styles.card} key={s.v} style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                <div className={styles.cardTitle} style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>{s.v}</div>
                <div className={styles.cardBody} style={{ fontSize: "0.78rem" }}>{s.d}</div>
                {s.current && <span className={styles.roadmapStepBadge}>This Project</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ RESEARCH & PROJECT LEADERSHIP ═══════ */}
      <section className={styles.pageSectionAlt} id="research-team">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>Research &amp; Attribution</span>
            <h2 className={styles.sectionTitle}>Research &amp; Project Leadership</h2>
            <p className={styles.sectionSubtitle}>
              Researchers guiding the AegisCAN engineering and cybersecurity initiative through EV.ENGINEER™
            </p>
          </div>
          <div className={styles.researcherGrid}>
            {RESEARCHERS.map((r) => (
              <div className={styles.researcherCard} key={r.name}>
                <span className={styles.researcherRole}>{r.role}</span>
                <h3 className={styles.researcherName}>{r.name}</h3>
                <div className={styles.researcherAffiliation}>EV.ENGINEER™</div>
                {r.focus && <div className={styles.researcherFocus}>{r.focus}</div>}
                <p className={styles.researcherBody}>{r.body}</p>
                <div className={styles.researcherLinks}>
                  {r.links.map((l) => (
                    <a
                      className={styles.researcherLink}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={l.href}
                      aria-label={l.label}
                    >
                      {l.label.includes("LinkedIn") ? "LinkedIn ↗" : "Research Profile →"}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AEGISCAN FAQ ═══════ */}
      <section className={styles.pageSection} id="faq">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>AegisCAN FAQ</h2>
          </div>
          <div className={styles.accordionList} style={{ maxWidth: 780, margin: "0 auto" }}>
            {AEGISCAN_FAQ.map((f) => (
              <details className={styles.accordionItem} key={f.question}>
                <summary className={styles.faqSummary}>
                  <span>{f.question}</span>
                  <span className={styles.accordionChevron} aria-hidden="true">▾</span>
                </summary>
                <div className={styles.faqBody}>{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ REFERENCES ═══════ */}
      <section className={styles.pageSection} id="references">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>References</h2>
            <p className={styles.sectionSubtitle}>Summarized and linked to original sources — no copyrighted material reproduced</p>
          </div>

          <div className={styles.relatedLinks}>
            <Link href="/internships/battery-aadhaar" className={styles.quickNavLink}>Battery Pack Aadhaar System</Link>
            <Link href="/internships/battery-circular-economy" className={styles.quickNavLink}>Battery Circular Economy</Link>
            <Link href="/about/sudarshana-karkala" className={styles.quickNavLink}>Sudarshana Karkala — EV.ENGINEER Profile</Link>
          </div>

          <div className={styles.refColumns} style={{ marginTop: "2rem" }}>
            <div>
              <div className={styles.sectionHeaderLeft}><h3 className={styles.sectionTitle} style={{ fontSize: "1.1rem" }}>Required Reading</h3></div>
              <ul className={styles.refList}>{REQUIRED_READING.map((r) => (
                <li className={styles.refItem} key={r.name}><a href={r.href} target="_blank" rel="noopener noreferrer">{r.name} ↗</a></li>
              ))}</ul>
            </div>
            <div>
              <div className={styles.sectionHeaderLeft}><h3 className={styles.sectionTitle} style={{ fontSize: "1.1rem" }}>Optional Advanced Reading</h3></div>
              <ul className={styles.refList}>{OPTIONAL_READING.map((r) => (
                <li className={styles.refItem} key={r.name}><a href={r.href} target="_blank" rel="noopener noreferrer">{r.name} ↗</a></li>
              ))}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className={styles.finalSection}>
        <div className={styles.finalGlow} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2 className={styles.finalTitle}>Build, Break Safely, Detect &amp; Document</h2>
          <p className={styles.finalDesc}>Start with Week 1, or explore the rest of the EV.ENGINEER internship programme.</p>
          <div className={styles.finalCtas}>
            <a href="https://forms.gle/CeBqi41CMrrEd6B5A" className="btn btn-primary" data-track-event="aegiscan_final_apply">Apply</a>
            <Link href="/internships" className="btn btn-secondary" data-track-event="aegiscan_final_back_to_internships">Back to Internships</Link>
          </div>
        </div>
      </section>
    </>
  );
}
