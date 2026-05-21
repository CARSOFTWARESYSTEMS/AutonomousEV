"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  BookOpen, Compass, Search, Award, AlertTriangle, Cpu, Layers, 
  Shield, Zap, Workflow, TrendingUp, Terminal, Sliders, FileText, 
  ChevronRight, ChevronDown, Download, RefreshCw, Flame, HelpCircle,
  PanelLeftClose, PanelLeft
} from "lucide-react";
import styles from "./page.module.css";

// ─── TYPES & DATA STRUCTURES ───

interface HandbookPart {
  num: string;
  title: string;
  desc: string;
  difficulty: "Beginner" | "Engineer" | "Architect" | "Expert";
  prerequisites: string;
  duration: string;
  skillsGained: string[];
  domains: string[];
  futureRelevance: string;
  status: "Available" | "Drafting" | "Researching" | "Scheduled";
  badgeClass: string;
  subsections: { title: string; anchor: string }[];
}

const HANDBOOK_PARTS: HandbookPart[] = [
  {
    num: "Part 0",
    title: "Handbook Orientation",
    desc: "Comprehensive orientation on EV pack design engineering goals, lab safety constraints, high-voltage PPE protocols, tools introduction, and unified capstone project guidelines.",
    difficulty: "Beginner",
    prerequisites: "None",
    duration: "1.5 Hrs",
    skillsGained: ["HV Lab Safety", "PPE Selection", "CAD Scope Planning"],
    domains: ["Safety", "Systems Integration"],
    futureRelevance: "Ensures standard OSHA and high-voltage electrical safety compliance for 2026-2030 laboratories.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "0.1 Handbook Scope & Objectives", anchor: "part-0-1" },
      { title: "0.2 Safety Bounds & HV PPE Protocols", anchor: "part-0-2" }
    ]
  },
  {
    num: "Part 1",
    title: "Battery Fundamentals",
    desc: "Lithium-ion electrochemistry, charge-transfer kinetics, equivalent series resistance (ESR) circuit models, and solid-electrolyte interface (SEI) layer growth dynamics under thermal stress.",
    difficulty: "Beginner",
    prerequisites: "None",
    duration: "3.5 Hrs",
    skillsGained: ["Electrochemical Modeling", "ESR Impedance Calculations", "SEI Growth Estimation"],
    domains: ["Electrochemical", "Materials Science"],
    futureRelevance: "Critical baseline knowledge for transition to high-nickel cathodes and silicon-anode cell architectures.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "1.1 Electrochemical Butler-Volmer Kinetics", anchor: "part-1-1" },
      { title: "1.2 SEI Layer Accumulation & Thermal Runaway Triggers", anchor: "part-1-2" }
    ]
  },
  {
    num: "Part 2",
    title: "EV Battery Requirements",
    desc: "Sizing traction packs to complex drive cycles (WLTP, US06), volumetric and gravimetric energy density goals, dynamic C-Rate load requests, and structural chassis bounds.",
    difficulty: "Beginner",
    prerequisites: "Part 1",
    duration: "2.5 Hrs",
    skillsGained: ["Drive Cycle Loading Maps", "Pack Energy-Mass Budgeting", "C-Rate Curve Modeling"],
    domains: ["Systems Engineering", "Mechanical Design"],
    futureRelevance: "Essential for 2026-2030 lightweight packaging targets and high-performance sports car EV specs.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "2.1 Sizing under WLTP & US06 Acceleration Profiles", anchor: "part-2-1" },
      { title: "2.2 Volumetric vs Gravimetric Packing Density Boundaries", anchor: "part-2-2" }
    ]
  },
  {
    num: "Part 3",
    title: "Cell Chemistry and Selection",
    desc: "Deep comparative study of cylindrical, prismatic, pouch cell formats. Selection matrix for NMC, LFP, LCO, post-lithium sodium-ion, and solid-state cell specifications.",
    difficulty: "Engineer",
    prerequisites: "Part 1",
    duration: "4.0 Hrs",
    skillsGained: ["Cell Spec Auditing", "Format Selection Matrix", "Sodium-ion Analytics"],
    domains: ["Chemical Engineering", "Manufacturing"],
    futureRelevance: "Crucial for solid-state cell characterization pipelines emerging globally by 2026-2028.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "3.1 Chemistry Matrix: NMC vs LFP vs Na-Ion vs Solid-State", anchor: "part-3-1" },
      { title: "3.2 Cylindrical Tabless cell dynamics (4680 formats)", anchor: "part-3-2" }
    ]
  },
  {
    num: "Part 4",
    title: "Electrical and Pack Design",
    desc: "High-voltage interconnects, rigid/flexible busbar sizing, series-parallel configurations, contactor coordination, pyrofuses, and insulation monitoring systems.",
    difficulty: "Engineer",
    prerequisites: "Part 3",
    duration: "5.0 Hrs",
    skillsGained: ["Busbar Resistive Sizing", "Contactor Selection", "HV Isolation Mapping"],
    domains: ["Electrical Design", "HV Safety"],
    futureRelevance: "Foundational for 800V fast-charging layouts and ultra-low resistance copper busbars.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "4.1 HV Interconnects & Wire Bond Resistance Sizing", anchor: "part-4-1" },
      { title: "4.2 Fuse Coordination & Fast Pyrofuse BMS Interrupt Loops", anchor: "part-4-2" }
    ]
  },
  {
    num: "Part 5",
    title: "BMS Hardware",
    desc: "Master-slave BMS topology, high-precision voltage/current sense circuits, multi-cell analog front-ends (AFE), and galvanically isolated daisy-chain communication buses.",
    difficulty: "Engineer",
    prerequisites: "Part 4",
    duration: "4.5 Hrs",
    skillsGained: ["BMS Schematic Layout", "AFE Chip Selection", "Daisy-Chain Noise Isolation"],
    domains: ["Electronics", "Hardware Engineering"],
    futureRelevance: "Required for robust multi-cell serial telemetry over extreme electromagnetic interference environments.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "5.1 Analog Front-Ends & Passive Cell Balancing Circuits", anchor: "part-5-1" },
      { title: "5.2 Galvanic Isolation & Isolated SPI Ring Redundancies", anchor: "part-5-2" }
    ]
  },
  {
    num: "Part 6",
    title: "BMS Software",
    desc: "Extended Kalman Filters (EKF) for State of Charge (SOC) estimation, State of Health (SOH), State of Function (SOF) algorithms, and balancing software control logic.",
    difficulty: "Architect",
    prerequisites: "Part 5",
    duration: "6.0 Hrs",
    skillsGained: ["EKF Observer Coding", "SOH Coulomb Counting Overlays", "Balancing Controls Logic"],
    domains: ["Software", "Controls Systems"],
    futureRelevance: "Transitioning to edge-AI estimation engines replacing legacy Coulomb counting models completely by 2027.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "6.1 Kalman Filters & State of Charge (SOC) Modeling", anchor: "part-6-1" },
      { title: "6.2 SOH Diagnostics & Capacity Degradation Overlays", anchor: "part-6-2" }
    ]
  },
  {
    num: "Part 7",
    title: "Thermal Design",
    desc: "Liquid cooling cold-plates, ribbon channel design, coolant flow modeling, phase change materials (PCM), thermal interface materials (TIM), and active cooling layouts.",
    difficulty: "Engineer",
    prerequisites: "Part 2",
    duration: "4.5 Hrs",
    skillsGained: ["Liquid Coolant Routing", "TIM Selection", "Thermal Flow CFD Auditing"],
    domains: ["Thermal", "Mechanical Engineering"],
    futureRelevance: "Critical for ultra-fast charging (4C+) thermal mitigation and solid-state heat management.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "7.1 Coolant Ribbon Plates & Single-Phase Liquid Cooling", anchor: "part-7-1" },
      { title: "7.2 Phase Change Materials (PCM) & Structural TIM Selections", anchor: "part-7-2" }
    ]
  },
  {
    num: "Part 8",
    title: "Mechanical Pack Design",
    desc: "Structural pack enclosure engineering, crashworthiness modeling, cell spacers, anti-vibration shock isolation mounts, and module-to-pack vs Cell-to-Pack (CTP) dynamics.",
    difficulty: "Engineer",
    prerequisites: "Part 7",
    duration: "5.0 Hrs",
    skillsGained: ["CTP Structural Enclosure Design", "Vibration Isolation FEA", "IP68 Enclosure Seals"],
    domains: ["Mechanical Design", "Manufacturing"],
    futureRelevance: "Essential for cell-to-chassis structural integration to optimize vehicle energy-to-weight index.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "8.1 Cell-to-Pack (CTP) & Cell-to-Chassis Chassis Integration", anchor: "part-8-1" },
      { title: "8.2 Enclosure Crashworthiness FEA & Vibration Isolation", anchor: "part-8-2" }
    ]
  },
  {
    num: "Part 9",
    title: "Safety Engineering",
    desc: "Thermal runaway kinetics, cell venting mechanisms, exhaust gas manifold design, and inter-cell thermal barrier design (silica aerogels, mica sheets).",
    difficulty: "Architect",
    prerequisites: "Part 8",
    duration: "4.5 Hrs",
    skillsGained: ["Thermal Propagation Blocking", "Venting Exhaust Manifolds", "Aerogel Selection"],
    domains: ["Safety", "Thermal Management"],
    futureRelevance: "Mandatory compliance base to prevent adjacent cell chain combustion under rigorous global testing protocols.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "9.1 Venting Gas Thermal Runaway & High-Temp Gas Routing", anchor: "part-9-1" },
      { title: "9.2 Silica Aerogel & Ceramic Composite Barriers", anchor: "part-9-2" }
    ]
  },
  {
    num: "Part 10",
    title: "Standards and Compliance",
    desc: "UN 38.3 shipping compliance, ECE R100 electric vehicle safety certifications, ISO 12405 testing, and heavy vehicle battery compliance rules.",
    difficulty: "Engineer",
    prerequisites: "Part 0",
    duration: "3.5 Hrs",
    skillsGained: ["UN 38.3 Certification Auditing", "ECE R100 Rev.3 Safety Testing", "ISO 12405 Protocol Execution"],
    domains: ["Standards", "Compliance Testing"],
    futureRelevance: "Primary gating mechanism for legal entry of custom transport packs into international markets.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "10.1 UN 38.3 Shipping Certification Methods", anchor: "part-10-1" },
      { title: "10.2 ECE R100 Rev.3 Cell/Pack Safety Certification", anchor: "part-10-2" }
    ]
  },
  {
    num: "Part 11",
    title: "Diagnostics and Battery Health",
    desc: "Electrochemical Impedance Spectroscopy (EIS) methods, phase-shift diagnostic probing, capacity fade tracking, and internal resistance degradation models.",
    difficulty: "Expert",
    prerequisites: "Part 6",
    duration: "4.0 Hrs",
    skillsGained: ["EIS Bode Plot Interpretation", "Lithium Plating Analytics", "Capacity Retention Calculations"],
    domains: ["Diagnostics", "Electrochemistry"],
    futureRelevance: "High-throughput on-vehicle EIS hardware sensors arriving to top-tier heavy vehicles by 2027.",
    status: "Drafting",
    badgeClass: styles.badgeDrafting,
    subsections: [
      { title: "11.1 EIS Spectra Bode and Nyquist Plots", anchor: "part-11-1" },
      { title: "11.2 Probing Lithium Plating and Electrolyte Consumptions", anchor: "part-11-2" }
    ]
  },
  {
    num: "Part 12",
    title: "AI and Battery Intelligence",
    desc: "Deploying machine learning models for early cell micro-short detection, remaining useful life (RUL) estimation, and predictive battery diagnostics.",
    difficulty: "Architect",
    prerequisites: "Part 11",
    duration: "5.5 Hrs",
    skillsGained: ["TinyML Model Deployment", "LSTM RUL Predictors", "Anomaly Short Diagnostics"],
    domains: ["AI / Machine Learning", "Controls Systems"],
    futureRelevance: "Essential for proactive fleet telemetry platforms to spot battery hazards hours before thermal runaway.",
    status: "Drafting",
    badgeClass: styles.badgeDrafting,
    subsections: [
      { title: "12.1 Edge AI TinyML for Lithium Dendrite Short Detection", anchor: "part-12-1" },
      { title: "12.2 Remaining Useful Life (RUL) LSTM Predictor Code", anchor: "part-12-2" }
    ]
  },
  {
    num: "Part 13",
    title: "Cloud Telemetry and Fleet Intelligence",
    desc: "IoT fleet ingestion architectures, MQTT transport under TLS 1.3, Google Protobuf serialization protocols, and real-world battery digital twins.",
    difficulty: "Architect",
    prerequisites: "Part 12",
    duration: "4.0 Hrs",
    skillsGained: ["Protobuf Schema Design", "MQTT Telemetry Ingestion", "Digital Twin Fleet Mapping"],
    domains: ["Cloud Telematics", "Software Systems"],
    futureRelevance: "Required for European Battery Passports compliance and vehicle-to-grid grid balancing networks.",
    status: "Drafting",
    badgeClass: styles.badgeDrafting,
    subsections: [
      { title: "13.1 MQTT Over TLS & High-Rate Ingestion Pipelines", anchor: "part-13-1" },
      { title: "13.2 Battery Digital Twin Architecture & Time-Series DBs", anchor: "part-13-2" }
    ]
  },
  {
    num: "Part 14",
    title: "EV Battery Cybersecurity",
    desc: "Securing CAN/CAN FD traffic, ISO 21434 risk mitigation models, BMS Hardware Security Modules (HSM), and secure OTA telemetry channels.",
    difficulty: "Expert",
    prerequisites: "Part 13",
    duration: "5.0 Hrs",
    skillsGained: ["CAN-FD SecOC Message Signing", "ISO 21434 Threat Modeling", "HSM Secure Boot Mapping"],
    domains: ["Cybersecurity", "Networking"],
    futureRelevance: "Strict cybersecurity rules (UNECE R155) require complete cryptographic assurance of vehicle BMS by 2026.",
    status: "Researching",
    badgeClass: styles.badgeResearching,
    subsections: [
      { title: "14.1 SecOC CAN-FD Message Authentication Overlays", anchor: "part-14-1" },
      { title: "14.2 Hardware HSM Cryptographic Key Schemes & Secure Boot", anchor: "part-14-2" }
    ]
  },
  {
    num: "Part 15",
    title: "Second-Life Battery Systems",
    desc: "Second-life grading protocols, rapid EIS-based health sorting, pack teardown automation, and scaling retired EV modules for stationary energy storage.",
    difficulty: "Engineer",
    prerequisites: "Part 11",
    duration: "3.5 Hrs",
    skillsGained: ["Retired Pack Disassembly Triage", "EIS Grading Protocols", "Stationary Storage Sizing"],
    domains: ["Circular Economy", "Mechanical Systems"],
    futureRelevance: "Mass scale-up of retired EV packs requires highly automated triage grading stations to keep repacking viable.",
    status: "Researching",
    badgeClass: styles.badgeResearching,
    subsections: [
      { title: "15.1 High-Throughput Cell Diagnostics & Grading Workflows", anchor: "part-15-1" },
      { title: "15.2 Sizing Stationary Grid Storage from Retired EV Modules", anchor: "part-15-2" }
    ]
  },
  {
    num: "Part 16",
    title: "Modern EV Architectures",
    desc: "800V bus overlays, multi-voltage traction converters (400V/800V dynamizing configurations), distributed BMS, and MegaWatt charging integration (MCS).",
    difficulty: "Architect",
    prerequisites: "Part 4",
    duration: "4.0 Hrs",
    skillsGained: ["800V Architecture Design", "Megawatt Charging Systems Sizing", "Multi-Voltage Switching Loops"],
    domains: ["Electrical Systems", "Systems Architecture"],
    futureRelevance: "Silicon Carbide (SiC) 800V traction systems are becoming the gold standard for charging time reductions.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "16.1 Dynamic 400V/800V Charging Configurations", anchor: "part-16-1" },
      { title: "16.2 MegaWatt Charging Systems (MCS) & High-Rate Thermal Loops", anchor: "part-16-2" }
    ]
  },
  {
    num: "Part 17",
    title: "End-to-End Reference Design",
    desc: "Full production-ready reference pack: 800V LFP layout, Cell-to-Pack structural blueprints, complete schematic CAD models, and ribbon CFD analyses.",
    difficulty: "Expert",
    prerequisites: "Part 8",
    duration: "5.5 Hrs",
    skillsGained: ["Reference CAD Auditing", "Electrical Schematic Mapping", "Liquid CFD Validation"],
    domains: ["Systems Engineering", "Design Validation"],
    futureRelevance: "State-of-the-art reference pack integration models ready for automotive factories.",
    status: "Drafting",
    badgeClass: styles.badgeDrafting,
    subsections: [
      { title: "17.1 Unified 800V Reference Schematic Schematics", anchor: "part-17-1" },
      { title: "17.2 CFD Coolant Ribbon Flow Velocity CFD Auditing", anchor: "part-17-2" }
    ]
  },
  {
    num: "Part 18",
    title: "Capstone Project and Verification",
    desc: "Hands-on capstone project: design, model, simulate, and present a 400V/800V dynamic transport pack prototype under industry jury evaluation criteria.",
    difficulty: "Expert",
    prerequisites: "All Parts",
    duration: "8.0 Hrs",
    skillsGained: ["E2E Pack Prototype Design", "CAD / Simulation submissions", "Verification Checklist Auditing"],
    domains: ["Systems Integration", "Testing Validation"],
    futureRelevance: "Final capstone portfolio demonstrating verified capability to prospective automotive engineering divisions.",
    status: "Drafting",
    badgeClass: styles.badgeDrafting,
    subsections: [
      { title: "18.1 Traction Pack CAD and Simulation Submission Requirements", anchor: "part-18-1" },
      { title: "18.2 Industry Review Jury Evaluation Guidelines & Checklists", anchor: "part-18-2" }
    ]
  }
];

interface LearningPathStep {
  partNum: string;
  partTitle: string;
  focus: string;
}

interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  totalHours: string;
  outcomes: string[];
  focusPoints: string[];
  tag: string;
  tagColor: string;
  steps: LearningPathStep[];
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "beginner",
    title: "Beginner Path",
    subtitle: "Fundamental Electrochemical & Physics Core",
    icon: "🔬",
    totalHours: "11.5 Hours",
    tag: "Fundamentals",
    tagColor: "var(--accent-primary)",
    focusPoints: ["Electrochemistry Basics", "Equivalent Circuit Modeling", "WLTP Drive Cycles", "Format Sizing Matrix"],
    outcomes: ["Perform cell chemistry comparison audits", "Size energy-mass budgets for simple drive cycles", "Establish lab electrical safety protocol limits"],
    steps: [
      { partNum: "Part 0", partTitle: "Handbook Orientation", focus: "Safety Bounds & High-Voltage PPE protocols" },
      { partNum: "Part 1", partTitle: "Battery Fundamentals", focus: "Butler-Volmer kinetics & ESR circuit modeling" },
      { partNum: "Part 2", partTitle: "EV Battery Requirements", focus: "Drive cycle loading specs (WLTP, US06)" },
      { partNum: "Part 3", partTitle: "Cell Chemistry and Selection", focus: "NMC vs LFP format sizing tradeoffs" }
    ]
  },
  {
    id: "engineer",
    title: "Engineer Path",
    subtitle: "Physical Integration & BMS Systems Design",
    icon: "🔋",
    totalHours: "26.5 Hours",
    tag: "Systems Integration",
    tagColor: "#38bdf8",
    focusPoints: ["Busbar & Interconnect CAD", "Contactor & Fuse Sizing", "AFE Front-End Layouts", "Active/Passive Thermal CFD"],
    outcomes: ["Design physical battery module structures with CFD plates", "Assemble master-slave BMS daisy chain schematics", "Mitigate thermal propagation using silica aerogels"],
    steps: [
      { partNum: "Part 4", partTitle: "Electrical and Pack Design", focus: "HV contactors, pyrofuses & busbars" },
      { partNum: "Part 5", partTitle: "BMS Hardware", focus: "AFE sensing, passive balancing, isolated SPI" },
      { partNum: "Part 7", partTitle: "Thermal Design", focus: "Ribbon cooling channels, liquid cold-plates" },
      { partNum: "Part 8", partTitle: "Mechanical Pack Design", focus: "Enclosure crashworthiness & IP68 seals" },
      { partNum: "Part 9", partTitle: "Safety Engineering", focus: "Thermal venting manifolds & cell aerogels" }
    ]
  },
  {
    id: "architect",
    title: "Architect Path",
    subtitle: "Global Product Specifications & Compliance",
    icon: "📐",
    totalHours: "25.0 Hours",
    tag: "Global Specs & Validation",
    tagColor: "#a855f7",
    focusPoints: ["Extended Kalman Filter SOC/SOH", "ECE R100 Rev.3 Safety Testing", "MegaWatt MCS Thermal Loops", "Reference Blueprint CAD"],
    outcomes: ["Deploy robust state-observers (EKF) in firmware", "Pass global UN 38.3 shipping compliance tests", "Architect 800V silicon carbide traction converters"],
    steps: [
      { partNum: "Part 6", partTitle: "BMS Software", focus: "Extended Kalman Filter SOC & capacity overlays" },
      { partNum: "Part 10", partTitle: "Standards & Compliance", focus: "UN 38.3 shipping, ECE R100 test bounds" },
      { partNum: "Part 16", partTitle: "Modern EV Architectures", focus: "800V SiC converters & dynamic charging loops" },
      { partNum: "Part 17", partTitle: "End-to-End Reference Design", focus: "Unified 800V reference pack schematic CAD" }
    ]
  },
  {
    id: "ai",
    title: "AI & Battery Intelligence Path",
    subtitle: "Predictive Analytics & Digital Twins",
    icon: "🧠",
    totalHours: "19.0 Hours",
    tag: "Edge AI & Telematics",
    tagColor: "#ec4899",
    focusPoints: ["TinyML Micro-Short Models", "LSTM Remaining Useful Life", "Encrypted MQTT TLS 1.3", "Battery Passports"],
    outcomes: ["Compile LSTM prediction models into edge controllers", "Stream unified Protobuf telemetry to cloud databases", "Analyze lithium dendrite short circuits via EIS"],
    steps: [
      { partNum: "Part 11", partTitle: "Diagnostics & Health", focus: "EIS Bode/Nyquist impedance spectroscopy" },
      { partNum: "Part 12", partTitle: "AI & Battery Intelligence", focus: "LSTM early dendrite short-circuit models" },
      { partNum: "Part 13", partTitle: "Cloud Telemetry", focus: "MQTT, Google Protobuf & digital twin DBs" }
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Specialization",
    subtitle: "BMS Cryptographic Integrity & Network Hardening",
    icon: "🛡️",
    totalHours: "9.0 Hours",
    tag: "Cybersecurity",
    tagColor: "#ef4444",
    focusPoints: ["ISO 21434 Threat Modeling", "SecOC CAN-FD Signing", "Hardware Security Modules", "OTA Cryptographic Keys"],
    outcomes: ["Incorporate SecOC authentication into CAN buses", "Draft complete ISO 21434 threat matrices for EV systems", "Design secure boot verification structures with HSMs"],
    steps: [
      { partNum: "Part 14", partTitle: "EV Battery Cybersecurity", focus: "CAN SecOC overlays, HSM keys, ISO 21434" }
    ]
  },
  {
    id: "secondlife",
    title: "Second-Life Specialization",
    subtitle: "Circular Battery Sourcing & Repack Integration",
    icon: "♻️",
    totalHours: "7.0 Hours",
    tag: "Circular Economy",
    tagColor: "#10b981",
    focusPoints: ["High-Throughput EIS sorting", "Triage Disassembly Robotics", "Stationary Storage Sizing", "Economic Margin Models"],
    outcomes: ["Perform EIS grading on retired vehicle cells", "Size stationary backup storage grids with used modules", "Develop fire safety barriers for secondary packs"],
    steps: [
      { partNum: "Part 15", partTitle: "Second-Life Systems", focus: "Triage automation, EIS sorting & repacking" }
    ]
  }
];

interface DependencyNode {
  id: string;
  name: string;
  partIndex: number;
  desc: string;
  prereqs: string[];
  leadsTo: string[];
}

const DEPENDENCY_NODES: DependencyNode[] = [
  {
    id: "fundamentals",
    name: "Battery Fundamentals",
    partIndex: 1,
    desc: "Electrochemistry & Butler-Volmer kinetics",
    prereqs: ["Orientation"],
    leadsTo: ["electrical", "thermal"]
  },
  {
    id: "electrical",
    name: "Electrical Design",
    partIndex: 4,
    desc: "Busbar sizes & HV isolation limits",
    prereqs: ["Fundamentals"],
    leadsTo: ["bms-hw"]
  },
  {
    id: "bms-hw",
    name: "BMS Hardware",
    partIndex: 5,
    desc: "AFE chips & SPI daisy-chain telemetry",
    prereqs: ["Electrical Design"],
    leadsTo: ["bms-sw"]
  },
  {
    id: "bms-sw",
    name: "BMS Software",
    partIndex: 6,
    desc: "EKF state observers & SOC calculations",
    prereqs: ["BMS Hardware"],
    leadsTo: ["ai-intel"]
  },
  {
    id: "thermal",
    name: "Thermal Design",
    partIndex: 7,
    desc: "Ribbon cooling & TIM heat mitigation",
    prereqs: ["Fundamentals"],
    leadsTo: ["safety"]
  },
  {
    id: "safety",
    name: "Safety Engineering",
    partIndex: 9,
    desc: "Venting manifolds & inter-cell propagation",
    prereqs: ["Thermal Design"],
    leadsTo: ["second-life"]
  },
  {
    id: "ai-intel",
    name: "AI Intelligence",
    partIndex: 12,
    desc: "TinyML micro-shorts & LSTM RUL estimators",
    prereqs: ["BMS Software"],
    leadsTo: ["cloud-intel"]
  },
  {
    id: "cloud-intel",
    name: "Cloud Telemetry",
    partIndex: 13,
    desc: "Google Protobuf streams & digital twins",
    prereqs: ["AI Intelligence"],
    leadsTo: ["cybersecurity"]
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    partIndex: 14,
    desc: "SecOC authentication & HSM secure boot",
    prereqs: ["Cloud Telemetry"],
    leadsTo: ["capstone"]
  }
];

interface SystemLevel {
  levelNum: number;
  name: string;
  status: string;
  statusColor: string;
  indicatorState: "solid" | "pulse" | "locked";
  voltageDetail?: string;
  limitDetail?: string;
  protocols?: string;
  algorithms?: string;
  standards?: string;
  sohDetail?: string;
  keyFocus: string[];
  schematicText: string;
  description: string;
  engineeringTip: string;
}

const SYSTEM_LEVELS: SystemLevel[] = [
  {
    levelNum: 1,
    name: "Cell Level",
    status: "Operational",
    statusColor: "#10b981",
    indicatorState: "solid",
    voltageDetail: "2.5V - 4.2V nominal",
    limitDetail: "-20°C to 60°C peak operating threshold",
    keyFocus: ["Lithium-ion Butler-Volmer kinetics", "Equivalent Series Resistance (ESR) circuit modeling", "SEI layer growth dynamics under high C-rates"],
    schematicText: "[Anode (Silicon-Graphite)] ── (Solid Electrolyte Interface Layer) ── [Cathode (High-Nickel NMC)]",
    description: "The fundamental electrochemical power source of the vehicle. Sizing begins with auditing individual cell chemistry specs and tabless cylindrical geometry limits.",
    engineeringTip: "Watch out for micro-shorts at high state-of-charge when cell temperatures drop below 10°C; this triggers dangerous lithium plating on anodes."
  },
  {
    levelNum: 2,
    name: "Module Level",
    status: "Operational",
    statusColor: "#10b981",
    indicatorState: "solid",
    voltageDetail: "48V typical serial unit",
    limitDetail: "Passive balancing max discharge: 150mA",
    keyFocus: ["Series-Parallel cell array configuration", "Mica mechanical sheet isolation barriers", "Aluminum Ribbon-coolant plate CFD modeling"],
    schematicText: "[12s4p Cell Serial-Parallel Grid] ── (Ribbon Channel Cold-Plate Thermal TIM)",
    description: "Combines multiple cells into secure physical packages. Houses voltage/temperature sensing nodes, balancing front-ends, and structural spacer bars.",
    engineeringTip: "To minimize parasitic heating, verify that the series cell links are wire-bonded or high-frequency laser-welded with zero micro-cracks."
  },
  {
    levelNum: 3,
    name: "Pack Level",
    status: "Calibrated",
    statusColor: "#10b981",
    indicatorState: "solid",
    voltageDetail: "400V / 800V Dual Traction Bus",
    limitDetail: "IP68 immersion certification standard",
    keyFocus: ["High-Voltage contactor welding coordination", "BMS central controller galvanic isolation SPI", "Fast pyrofuse mechanical trigger loops"],
    schematicText: "[Module Cluster Series Chain] ── (Isolation Monitoring IMD) ── [Pyrofuse + HV Contactors]",
    description: "The final vehicle-level structural energy enclosure. Contains high voltage distribution units, thermal propagation barriers, and gas manifolds.",
    engineeringTip: "The pyrotechnic pyrofuse is your final defense. Coordinate the fuse speed with contactor air-gap arc limits to prevent fatal contacts."
  },
  {
    levelNum: 4,
    name: "Vehicle Level",
    status: "Connected",
    statusColor: "#38bdf8",
    indicatorState: "solid",
    voltageDetail: "12V auxiliary / 800V Traction",
    limitDetail: "CAN-FD Bus Speed: 500kbps under SecOC",
    keyFocus: ["WLTP and US06 dynamic drive cycle loading", "Silicon Carbide (SiC) traction converter loops", "Vehicle Control Unit (VCU) power mapping"],
    schematicText: "[Central Traction Battery Pack] ── (CAN-FD Bus) ── [SiC Inverter + Dynamic Motor Drive]",
    description: "Establishes structural and data connections with the vehicle chassis. Integrates high-performance charging interfaces and drive cycles.",
    engineeringTip: "Implement dynamic peak charge limits that reflect both instant cell temp and calculated OCV lines during highway acceleration."
  },
  {
    levelNum: 5,
    name: "Cloud Level",
    status: "Synced",
    statusColor: "#10b981",
    indicatorState: "pulse",
    protocols: "MQTT over TLS 1.3 / Google Protobuf",
    keyFocus: ["Real-world Battery Digital Twin modeling", "European Battery Passports data compliance", "Time-series database fleet telematics telemetry"],
    schematicText: "[EV Telematics Gateway] ── (Secure TLS 1.3 MQTT) ── [Cloud Time-Series Database Digital Twin]",
    description: "A centralized ingestion platform storing and mapping vehicle fleet data. Tracks long-term charging histories and generates cell logs.",
    engineeringTip: "Use delta-compression on your Protobuf schemas to keep cell-level telemetry transfers viable over cellular networks."
  },
  {
    levelNum: 6,
    name: "AI Layer",
    status: "Analyzing",
    statusColor: "#a855f7",
    indicatorState: "pulse",
    algorithms: "LSTM RUL / TinyML Early Short Predictor",
    keyFocus: ["Extended Kalman Filter (EKF) SOC/SOH software observers", "LSTM algorithms forecasting Remaining Useful Life", "TinyML edge code spotting micro-shorts"],
    schematicText: "[Raw V, I, T Sensors] ── (Edge EKF State Observer) ── [AI LSTM Forecasting Engine]",
    description: "The computational brain predicting pack performance. Calculates dynamic State of Charge (SOC) and estimates capacity degradation trends.",
    engineeringTip: "Run a lightweight Coulomb-counter in parallel with the EKF observer. If OCV drift rises, use the EKF outputs to reset integration bounds."
  },
  {
    levelNum: 7,
    name: "Security Layer",
    status: "Encrypted",
    statusColor: "#ef4444",
    indicatorState: "locked",
    standards: "ISO 21434 / UNECE R155 Cybersecurity",
    keyFocus: ["BMS Hardware Security Module (HSM) secure boot keys", "SecOC CAN-FD message cryptographic validation", "Secure OTA firmware signature validation"],
    schematicText: "[Incoming OTA Firmware Update] ── (HSM Cryptographic Key Verification) ── [Secure Flash]",
    description: "Secures internal networks and cellular connections. Prevents physical injection attacks on CAN buses and isolates telemetry fields.",
    engineeringTip: "Always isolate the cellular telemetry module from the direct traction contactor loop by enforcing physical gateway packet filtering."
  },
  {
    levelNum: 8,
    name: "Second-life Lifecycle",
    status: "In Testing",
    statusColor: "#eab308",
    indicatorState: "solid",
    sohDetail: "Retirement limit: SOH < 80%",
    keyFocus: ["Rapid EIS-based electrochemical sorting protocols", "Automated pack disassembly robotic triaging", "Stationary backup grid storage container sizing"],
    schematicText: "[Retired EV Pack (SOH < 80%)] ── (Rapid EIS Health Sorting) ── [10 kWh Stationary Modular Storage]",
    description: "Enforces battery circular economy. Filters retired EV packs, grading healthy modules for long-term stationary backup power storage grid installations.",
    engineeringTip: "During pack sorting, use Nyquist phase angle shifts at 10Hz rather than full 10mHz EIS sweeps; this reduces diagnostic triage sorting time by 90%."
  }
];

const GLOSSARY_ITEMS = [
  {
    term: "C-Rate",
    definition: "The unit used to measure the rate at which a battery is charged or discharged relative to its maximum capacity. A 1C discharge rate means the discharge current will drain the entire battery in 1 hour."
  },
  {
    term: "State-of-Health (SOH)",
    definition: "A percentage figure reflecting the current general condition of a battery pack compared to its ideal brand-new state. It accounts for capacity loss, chemical aging, lithium plating accumulation, and internal series resistance rise."
  },
  {
    term: "State-of-Charge (SOC)",
    definition: "The level of charge of an electric battery relative to its capacity, expressed in percentage. Standard measurement involves integrating raw current (Coulomb counting) and correcting using mathematical observers (like Extended Kalman Filters) mapped to OCV curves."
  },
  {
    term: "State-of-Function (SOF)",
    definition: "A prediction of the dynamic maximum charge and discharge power limits that a battery can handle safely for brief durations (e.g. 10-second pulses) under current temperature, SOC, and age states."
  },
  {
    term: "Thermal Runaway Propagation",
    definition: "A catastrophic cascade failure mode where a singular cell undergoes an uncontrolled exothermic reaction, releasing intense heat, vaporized solvents, and toxic gases that trigger adjacent cells, leading to complete pack combustion."
  },
  {
    term: "Cell-to-Pack (CTP)",
    definition: "An integration architecture that skips intermediate modular frames, mounting cells directly inside the housing to drastically increase volumetric utilization, structural integrity, and mass efficiency."
  },
  {
    term: "Equivalent Series Resistance (ESR)",
    definition: "The resistive loss representation inside an electrochemical cell, comprising electrical contact resistances, electrolyte ionic resistance, and charge transfer resistance at the electrodes."
  },
  {
    term: "Pyrofuse",
    definition: "A fast-acting, pyrotechnically actuated high-voltage safety switch triggered by direct BMS hardware interrupts to mechanically disconnect the pack within 1-2 milliseconds during critical overcurrent events."
  },
  {
    term: "Electrochemical Impedance Spectroscopy (EIS)",
    definition: "An advanced diagnostic method that injects a small AC current sweep across various frequencies, measuring the complex impedance response to isolate electrode kinetics, SEI growth resistance, and dynamic lithium plating boundaries."
  },
  {
    term: "Analog Front-End (AFE)",
    definition: "A specialized multi-cell electronic chip responsible for direct high-precision differential voltage measurement, temperature sensor reads, and active/passive charge balancing calculations."
  },
  {
    term: "Hardware Security Module (HSM)",
    definition: "A dedicated physical cryptographic processor inside the central BMS microcontroller that securely isolates symmetric/asymmetric encryption keys, handles secure boot routines, and runs real-time SecOC message checks."
  },
  {
    term: "SecOC (Secure Onboard Communication)",
    definition: "A standardized layer (AUTOSAR) adding cryptographic message authentication codes (MAC) and freshness counters to CAN-FD frames, protecting traction bus commands from injection and replay attacks."
  }
];

// ─── REUSABLE UI BLOCKS ───

const EngineeringNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.engineeringNote}>
    <div className={styles.blockHeader}><BookOpen size={16} /> Engineering Note</div>
    <div>{children}</div>
  </div>
);

const SafetyWarning: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.safetyWarning}>
    <div className={styles.blockHeader}><AlertTriangle size={16} /> Safety Warning</div>
    <div>{children}</div>
  </div>
);

const ArchitectInsight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.architectInsight}>
    <div className={styles.blockHeader}><Compass size={16} /> Architect Insight</div>
    <div>{children}</div>
  </div>
);

const AIInsight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.aiInsight}>
    <div className={styles.blockHeader}><Zap size={16} /> AI Insight</div>
    <div>{children}</div>
  </div>
);

const IndustryStandard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.industryStandard}>
    <div className={styles.blockHeader}><Award size={16} /> Industry Standard</div>
    <div>{children}</div>
  </div>
);

const PracticalExercise: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.practicalExercise}>
    <div className={styles.blockHeader}><Terminal size={16} /> Practical Exercise</div>
    <div>{children}</div>
  </div>
);

const CapstoneOutput: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.capstoneOutput}>
    <div className={styles.blockHeader}><Workflow size={16} /> Capstone Output</div>
    <div>{children}</div>
  </div>
);

const FutureTechnology: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.futureTechnology}>
    <div className={styles.blockHeader}><TrendingUp size={16} /> Future Technology (2028-2030)</div>
    <div>{children}</div>
  </div>
);

// ─── MAIN COMPONENT ───

export default function BatteryPackDesignContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGlossary, setExpandedGlossary] = useState<Record<number, boolean>>({});
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState("beginner");
  const [selectedLevelNum, setSelectedLevelNum] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    overview: useRef<HTMLElement>(null),
    progression: useRef<HTMLElement>(null),
    masterIndex: useRef<HTMLElement>(null),
    architecture: useRef<HTMLElement>(null),
    capstone: useRef<HTMLElement>(null),
    roadmap: useRef<HTMLElement>(null),
    chapterPreview: useRef<HTMLElement>(null),
    glossary: useRef<HTMLElement>(null)
  };

  // Scroll active section tracker (Intersection Observer)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const [key, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const top = ref.current.offsetTop;
          const height = ref.current.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(key);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const togglePartExpansion = (index: number) => {
    setExpandedParts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleGlossary = (index: number) => {
    setExpandedGlossary(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Filter handbook parts based on search
  const filteredParts = HANDBOOK_PARTS.filter(
    part =>
      part.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.num.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  // Auto-expand parts during active searches
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const autoExpanded: Record<number, boolean> = {};
      HANDBOOK_PARTS.forEach((_, idx) => {
        autoExpanded[idx] = true;
      });
      setExpandedParts(autoExpanded);
    }
  }, [searchTerm]);

  const scrollTo = (sectionKey: keyof typeof sectionRefs) => {
    const element = sectionRefs[sectionKey].current;
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
      setActiveSection(sectionKey);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-dark)", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* ─── PRINT ONLY WATERMARK CSS ─── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .${styles.sidebar}, .${styles.mobileBar}, .btn, header, footer { display: none !important; }
          .${styles.docContainer} { padding: 0 !important; max-width: 100% !important; }
          .${styles.mainContent} { width: 100% !important; min-width: 100% !important; }
          .${styles.block} { page-break-inside: avoid; border: 1px solid #ccc !important; background: #fff !important; color: #000 !important; }
          h1, h2, h3, h4 { color: #000 !important; }
          p, li { color: #333 !important; }
        }
      `}} />

      {/* ─── MOBILE BAR ─── */}
      <div className={styles.mobileBar}>
        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent-primary)" }}>EV.ENGINEER™ HANDBOOK</span>
        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(true)}>
          <Sliders size={14} /> Navigate Index
        </button>
      </div>

      {/* ─── MOBILE NAVIGATION DRAWER ─── */}
      {mobileMenuOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setMobileMenuOpen(false)} />
          <div className={styles.mobileDrawer}>
            <button className={styles.drawerClose} onClick={() => setMobileMenuOpen(false)}>✕ Close</button>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>EV Battery Pack</h2>
              <span className={styles.sidebarSubtitle}>Design Systems Handbook</span>
            </div>

            <div className={styles.searchBoxWrapper}>
              <input 
                type="text" 
                placeholder="Search chapters..." 
                className={styles.searchBox}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className={styles.searchIcon} size={15} />
            </div>

            <div className={styles.navTree}>
              <div className={styles.navGroup}>
                <button 
                  className={activeSection === "overview" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                  onClick={() => scrollTo("overview")}
                >
                  Overview
                </button>
              </div>
              <div className={styles.navGroup}>
                <button 
                  className={activeSection === "progression" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                  onClick={() => scrollTo("progression")}
                >
                  Learning Progression
                </button>
              </div>
              <div className={styles.navGroup}>
                <button 
                  className={activeSection === "masterIndex" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                  onClick={() => scrollTo("masterIndex")}
                >
                  Master Index ({filteredParts.length})
                </button>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "0.5rem 0", paddingTop: "0.5rem" }} />

              <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", paddingLeft: "8px", display: "block", marginBottom: "0.5rem" }}>Chapters</span>
              
              {filteredParts.map((part) => {
                const partIdx = HANDBOOK_PARTS.findIndex(p => p.num === part.num);
                return (
                  <div className={styles.navGroup} key={part.num}>
                    <button 
                      className={expandedParts[partIdx] ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => togglePartExpansion(partIdx)}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${part.num}: ${part.title}`}>
                        {part.num}: {part.title}
                      </span>
                      {expandedParts[partIdx] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    {expandedParts[partIdx] && (
                      <div className={styles.navGroupItems}>
                        <a 
                          href={`#part-${partIdx}`} 
                          className={styles.navItem} 
                          onClick={(e) => {
                            e.preventDefault();
                            setMobileMenuOpen(false);
                            const el = document.getElementById(`part-${partIdx}`);
                            if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                          }}
                        >
                          Core Overview
                        </a>
                        {part.subsections.map((sub, sIdx) => (
                          <a 
                            key={sIdx} 
                            href={`#${sub.anchor}`} 
                            className={styles.navItem}
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              const el = document.getElementById(sub.anchor);
                              if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                            }}
                          >
                            {sub.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ─── MAIN WEB CONTAINER ─── */}
      <div className={styles.docContainer}>
        
        {/* ─── STICKY LEFT SIDEBAR (DESKTOP ONLY) ─── */}
        {!sidebarHidden && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 className={styles.sidebarTitle}>EV Battery Pack Design</h2>
                <span className={styles.sidebarSubtitle}>Basics to Real-World Systems</span>
              </div>
              <button 
                className={styles.sidebarCloseBtn} 
                onClick={() => setSidebarHidden(true)}
                title="Hide Index"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

          <div className={styles.searchBoxWrapper}>
            <input 
              type="text" 
              placeholder="Search chapters..." 
              className={styles.searchBox}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className={styles.searchIcon} size={15} />
          </div>

          <div className={styles.navTree}>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "overview" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("overview")}
              >
                Handbook Overview
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "progression" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("progression")}
              >
                Learning Path
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "masterIndex" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("masterIndex")}
              >
                Master Index ({filteredParts.length})
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "architecture" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("architecture")}
              >
                Architecture Visuals
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "capstone" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("capstone")}
              >
                Capstone Systems
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "roadmap" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("roadmap")}
              >
                Future Roadmap
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "chapterPreview" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("chapterPreview")}
              >
                Chapter Template Layout
              </button>
            </div>
            <div className={styles.navGroup}>
              <button 
                className={activeSection === "glossary" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                onClick={() => scrollTo("glossary")}
              >
                Glossary Terms
              </button>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "1rem 0", paddingTop: "1rem" }} />

            <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", paddingLeft: "8px", display: "block", marginBottom: "0.5rem" }}>Chapters (Part 0 - 18)</span>
            
            {filteredParts.map((part) => {
              const partIdx = HANDBOOK_PARTS.findIndex(p => p.num === part.num);
              return (
                <div className={styles.navGroup} key={part.num}>
                  <button 
                    className={expandedParts[partIdx] ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => togglePartExpansion(partIdx)}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${part.num}: ${part.title}`}>
                      {part.num}: {part.title}
                    </span>
                    {expandedParts[partIdx] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {expandedParts[partIdx] && (
                    <div className={styles.navGroupItems}>
                      <a 
                        href={`#part-${partIdx}`} 
                        className={styles.navItem} 
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(`part-${partIdx}`);
                          if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                        }}
                      >
                        Core Overview
                      </a>
                      {part.subsections.map((sub, sIdx) => (
                        <a 
                          key={sIdx} 
                          href={`#${sub.anchor}`} 
                          className={styles.navItem}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(sub.anchor);
                            if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                          }}
                        >
                          {sub.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", marginTop: "auto" }}>
            <button className="btn btn-secondary" style={{ width: "100%", padding: "0.5rem 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.8rem" }} onClick={handlePrint}>
              <Download size={14} /> Export Handbook PDF
            </button>
          </div>
        </aside>
      )}

        {/* ─── MAIN RIGHT CONTENT AREA ─── */}
        <main className={styles.mainContent}>

          {/* ═══ HERO SECTION ═══ */}
          <section className={styles.hero} ref={sectionRefs.hero}>
            <div className={styles.heroGlow} />
            <div className={styles.heroInner}>
              <div className={styles.heroPill}>
                <span>📘 Technical Engineering Handbook</span>
              </div>
              <h1 className={styles.heroTitle}>
                EV Battery Pack Design
              </h1>
              <p className={styles.heroSubtitle}>
                Design EV Battery Packs from Scratch — Hardware, BMS, Thermal, Safety, AI, Cybersecurity, Cloud, and Second-Life Intelligence
              </p>
              
              <div className={styles.heroCtas}>
                <button className="btn btn-primary" onClick={() => scrollTo("overview")}>Explore Handbook</button>
                <button className="btn btn-secondary" onClick={() => scrollTo("progression")}>View Learning Path</button>
                <button className="btn btn-secondary" style={{ background: "var(--glass-bg)" }} onClick={() => scrollTo("masterIndex")}>Start with Fundamentals</button>
              </div>
            </div>
          </section>

          {/* BREADCRUMB LIST */}
          <div className={styles.breadcrumbs} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {sidebarHidden && (
                <button 
                  className={styles.sidebarOpenBtn} 
                  onClick={() => setSidebarHidden(false)}
                  title="Expand Index"
                  style={{ marginRight: "12px" }}
                >
                  <PanelLeft size={14} /> Show Index
                </button>
              )}
              <Link href="/internships" className={styles.breadcrumbLink}>Internships</Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbActive}>EV Battery Pack Design Handbook</span>
            </div>
          </div>

          {/* ═══ HANDBOOK OVERVIEW ═══ */}
          <section id="overview" className={styles.pageSection} ref={sectionRefs.overview}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>System Scope</span>
              <h2 className={styles.sectionTitle}>Handbook Overview & Engineering Platform</h2>
              <p className={styles.sectionSubtitle}>
                Welcome to the unified core documentation reference for 2026–2030 traction battery design. 
                This platform is meticulously crafted to bridge electrochemical theory with high-voltage physical architectures.
              </p>
            </div>

            <div className="grid-2">
              <div className="glass-panel" style={{ padding: "2rem" }}>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "1rem" }}>Target Engineering Audience</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  This handbook serves as the structural knowledge baseline for electric vehicle specialists across seven critical sub-disciplines:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["EV Engineers", "Battery Designers", "BMS Firmware Engineers", "Thermal Architects", "AI Telemetry Analysts", "Cybersecurity Engineers", "Second-Life Strategists"].map((tag, i) => (
                    <span key={i} style={{ fontSize: "0.75rem", color: "var(--accent-primary)", background: "rgba(76, 169, 48, 0.08)", border: "1px solid rgba(76, 169, 48, 0.2)", padding: "4px 12px", borderRadius: "4px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "2rem" }}>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "1rem" }}>Core Focus Dimensions</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Moving beyond basic formulas, we analyze the entire lifecycle of power containment: 
                  from cell grading algorithms through thermal propagation safety, up to multi-tenant telemetry layers.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["Hardware", "Software", "Thermal", "Safety", "AI / IoT", "Cybersecurity", "Recycling"].map((tag, i) => (
                    <span key={i} style={{ fontSize: "0.75rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "4px 12px", borderRadius: "4px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <EngineeringNote>
                This handbook is designed for fast, high-contrast, scalable reading. The complete documentation system is structured to compile immutably into a standard handbook PDF, ensuring clean print integration for lab environments and manufacturing plants.
              </EngineeringNote>
            </div>
          </section>

          {/* ═══ LEARNING PROGRESSION PATH ═══ */}
          <section id="progression" className={styles.pageSection} ref={sectionRefs.progression}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Syllabus Progression</span>
              <h2 className={styles.sectionTitle}>Battery Engineer Learning Progression Path</h2>
              <p className={styles.sectionSubtitle}>
                A clear, highly structured skill escalation matrix mapping the journey from fundamental battery theory to expert systems architecture. Select your engineering specialization pipeline below.
              </p>
            </div>

            {/* Pathway Tabs */}
            <div className={styles.pathwayTabs}>
              {LEARNING_PATHS.map((path) => (
                <button
                  key={path.id}
                  className={selectedPathId === path.id ? styles.pathwayTabActive : styles.pathwayTab}
                  onClick={() => setSelectedPathId(path.id)}
                >
                  <span style={{ fontSize: "1.2rem" }}>{path.icon}</span>
                  <div>
                    <div className={styles.pathwayTabTitle}>{path.title}</div>
                    <div className={styles.pathwayTabDuration}>{path.totalHours}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Path Details Card */}
            {(() => {
              const path = LEARNING_PATHS.find(p => p.id === selectedPathId) || LEARNING_PATHS[0];
              return (
                <div className={styles.pathwayDetailCard}>
                  <div className={styles.pathwayDetailHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "2rem" }}>{path.icon}</span>
                      <div>
                        <h3 className={styles.pathwayDetailTitle}>{path.title}</h3>
                        <span className={styles.pathwayDetailSubtitle}>{path.subtitle}</span>
                      </div>
                    </div>
                    <span 
                      style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: 700, 
                        color: path.tagColor, 
                        background: `rgba(255,255,255,0.02)`, 
                        border: `1px solid ${path.tagColor}`, 
                        padding: "6px 14px", 
                        borderRadius: "20px" 
                      }}
                    >
                      {path.tag} ({path.totalHours})
                    </span>
                  </div>

                  <div className="grid-2" style={{ margin: "2rem 0", gap: "1.5rem" }}>
                    <div className={styles.pathwaySection}>
                      <h4 className={styles.pathwaySectionHeader}>🎯 Dynamic Learning Outcomes</h4>
                      <ul className={styles.pathwayList}>
                        {path.outcomes.map((out, idx) => (
                          <li key={idx}>{out}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.pathwaySection}>
                      <h4 className={styles.pathwaySectionHeader}>🔑 Core Focus Areas</h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "0.5rem" }}>
                        {path.focusPoints.map((focus, idx) => (
                          <span key={idx} className={styles.pathwayFocusTag}>
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Flow pipeline */}
                  <h4 className={styles.pathwaySectionHeader} style={{ marginBottom: "1.25rem" }}>⛓️ Pipeline Execution Nodes</h4>
                  <div className={styles.pipelineContainer}>
                    {path.steps.map((step, idx) => {
                      const partIndex = HANDBOOK_PARTS.findIndex(p => p.num === step.partNum);
                      return (
                        <React.Fragment key={idx}>
                          <div 
                            className={styles.pipelineNode}
                            onClick={() => {
                              if (partIndex !== -1) {
                                const el = document.getElementById(`part-${partIndex}`);
                                if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                              }
                            }}
                          >
                            <div className={styles.pipelineNodePart} style={{ color: path.tagColor }}>{step.partNum}</div>
                            <div className={styles.pipelineNodeTitle}>{step.partTitle}</div>
                            <div className={styles.pipelineNodeFocus}>{step.focus}</div>
                            <div className={styles.pipelineNodeLink}>Click to Jump →</div>
                          </div>
                          {idx < path.steps.length - 1 && (
                            <div className={styles.pipelineConnector}>
                              <div className={styles.pipelineConnectorLine} style={{ backgroundColor: path.tagColor }} />
                              <div className={styles.pipelineConnectorArrow} style={{ borderLeftColor: path.tagColor }} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Interactive Visual Dependency Map */}
            <div className={styles.depMapContainer}>
              <h3 className={styles.pathwaySectionHeader} style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                🕸️ Interactive Visual Dependency Map
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                Hover over any module block to visualize dynamic prerequisite tracks (Red/Orange) and downstream propagation paths (Blue). Click any block to jump directly to its handbook chapter.
              </p>
              
              <div className={styles.depMapGrid}>
                {DEPENDENCY_NODES.map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isPrereqOfHovered = hoveredNodeId 
                    ? DEPENDENCY_NODES.find(n => n.id === hoveredNodeId)?.prereqs.includes(node.name) 
                    : false;
                  const isDownstreamOfHovered = hoveredNodeId
                    ? DEPENDENCY_NODES.find(n => n.id === hoveredNodeId)?.leadsTo.includes(node.id) ||
                      (hoveredNodeId === "fundamentals" && ["bms-hw", "bms-sw", "safety", "ai-intel", "cloud-intel", "cybersecurity"].includes(node.id)) ||
                      (hoveredNodeId === "electrical" && ["bms-sw", "ai-intel", "cloud-intel", "cybersecurity"].includes(node.id)) ||
                      (hoveredNodeId === "bms-hw" && ["ai-intel", "cloud-intel", "cybersecurity"].includes(node.id)) ||
                      (hoveredNodeId === "bms-sw" && ["cloud-intel", "cybersecurity"].includes(node.id)) ||
                      (hoveredNodeId === "thermal" && ["second-life"].includes(node.id)) ||
                      (hoveredNodeId === "ai-intel" && ["cybersecurity"].includes(node.id))
                    : false;

                  let nodeClass = styles.depNode;
                  if (isHovered) nodeClass += ` ${styles.depNodeHovered}`;
                  else if (isPrereqOfHovered) nodeClass += ` ${styles.depNodePrereq}`;
                  else if (isDownstreamOfHovered) nodeClass += ` ${styles.depNodeDownstream}`;

                  return (
                    <div
                      key={node.id}
                      className={nodeClass}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => {
                        const el = document.getElementById(`part-${node.partIndex}`);
                        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                      }}
                    >
                      <div className={styles.depNodeHeader}>
                        <span className={styles.depNodeTitle}>{node.name}</span>
                        <span className={styles.depNodeBadge}>Part {node.partIndex}</span>
                      </div>
                      <p className={styles.depNodeDesc}>{node.desc}</p>
                      
                      <div className={styles.depNodeFlowInfo}>
                        <div>
                          <span className={styles.depNodeLabel}>Prereqs:</span> {node.prereqs.join(", ")}
                        </div>
                        <div>
                          <span className={styles.depNodeLabel}>Downstream:</span> {
                            node.id === "fundamentals" ? "Electrical, Thermal" :
                            node.id === "electrical" ? "BMS Hardware" :
                            node.id === "bms-hw" ? "BMS Software" :
                            node.id === "bms-sw" ? "AI Intelligence" :
                            node.id === "thermal" ? "Safety" :
                            node.id === "safety" ? "Second-Life" :
                            node.id === "ai-intel" ? "Cloud Telemetry" :
                            node.id === "cloud-intel" ? "Cybersecurity" : "Capstone"
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ MASTER INDEX SECTION ═══ */}
          <section id="masterIndex" className={styles.pageSection} ref={sectionRefs.masterIndex}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Index Register</span>
              <h2 className={styles.sectionTitle}>Handbook Master Index Register</h2>
              <p className={styles.sectionSubtitle}>
                Explore the complete 19-part directory encompassing the entire body of knowledge for 2026–2030 electric transport pack design.
              </p>
            </div>

            <div className={styles.searchBoxWrapper} style={{ maxWidth: "500px" }}>
              <input 
                type="text" 
                placeholder="Filter index (e.g. 'BMS', 'Thermal', 'Part 5')..." 
                className={styles.searchBox}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className={styles.searchIcon} size={15} />
            </div>

            {filteredParts.length === 0 ? (
              <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No parts match your filter query. Resetting search filter.
                <button className="btn btn-secondary" style={{ marginTop: "1rem", display: "block", margin: "1rem auto 0" }} onClick={() => setSearchTerm("")}>Clear Search</button>
              </div>
            ) : (
              <div className={styles.masterIndexGrid}>
                {filteredParts.map((part) => {
                  const partIdx = HANDBOOK_PARTS.findIndex(p => p.num === part.num);
                  return (
                    <div className={styles.indexCard} key={part.num} id={`part-${partIdx}`}>
                      <div>
                        <div className={styles.indexCardHeader}>
                          <span className={styles.indexCardPart}>{part.num}</span>
                          <span className={`${styles.indexCardBadge} ${part.badgeClass}`}>
                            {part.status}
                          </span>
                        </div>
                        <h3 className={styles.indexCardTitle}>{part.title}</h3>
                        <p className={styles.indexCardDesc}>{part.desc}</p>
                        
                        <div className={styles.indexCardSubsections}>
                          <div className={styles.subsectionsTitle}>Chapters & Subsections</div>
                          <div className={styles.subsectionsList}>
                            {part.subsections.map((sub, sIdx) => (
                              <div key={sIdx} className={styles.subsectionItem} id={sub.anchor}>
                                <span className={styles.subsectionAnchor}>{sub.anchor.replace("part-", "P")}</span>
                                <span className={styles.subsectionText}>{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={styles.indexCardFooter}>
                        <div className={styles.indexCardMeta}>
                          <span>⏱️ {part.duration}</span>
                          <span>📶 {part.difficulty}</span>
                        </div>
                        <a href="#chapterPreview" onClick={() => scrollTo("chapterPreview")} style={{ color: "var(--accent-primary)", fontWeight: 700, textDecoration: "none" }}>Read Schema →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ═══ ARCHITECTURE VISUALIZATION SECTION ═══ */}
          <section id="architecture" className={styles.pageSection} ref={sectionRefs.architecture}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>System Schematics</span>
              <h2 className={styles.sectionTitle}>Advanced EV Architecture Cockpit</h2>
              <p className={styles.sectionSubtitle}>
                Select a system level below to access the dynamic live cockpit display. Audit electrical requirements, environmental safety bounds, active protocols, and core engineering schematics.
              </p>
            </div>

            <div className={styles.archDashboard}>
              {/* Left selector */}
              <div className={styles.archList}>
                {SYSTEM_LEVELS.map((level) => {
                  const isActive = selectedLevelNum === level.levelNum;
                  return (
                    <button
                      key={level.levelNum}
                      className={isActive ? styles.archBtnActive : styles.archBtn}
                      onClick={() => setSelectedLevelNum(level.levelNum)}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{level.name}</span>
                      <div className={styles.archIndicatorWrapper}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginRight: "4px" }}>
                          L{level.levelNum}
                        </span>
                        <span 
                          className={level.indicatorState === "pulse" ? styles.archLightPulse : styles.archLight} 
                          style={{ backgroundColor: level.statusColor }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right cockpit screen */}
              {(() => {
                const level = SYSTEM_LEVELS.find(l => l.levelNum === selectedLevelNum) || SYSTEM_LEVELS[0];
                return (
                  <div className={styles.archCockpit}>
                    <div className={styles.archCockpitHeader}>
                      <div>
                        <div className={styles.archCockpitLevel}>System Level {level.levelNum}</div>
                        <h3 className={styles.archCockpitTitle}>{level.name}</h3>
                      </div>
                      <span 
                        className={styles.archPill} 
                        style={{ 
                          color: level.statusColor, 
                          borderColor: level.statusColor,
                          background: "rgba(255,255,255,0.01)"
                        }}
                      >
                        <span 
                          className={level.indicatorState === "pulse" ? styles.archLightPulse : styles.archLight} 
                          style={{ backgroundColor: level.statusColor, width: "6px", height: "6px" }}
                        />
                        {level.status}
                      </span>
                    </div>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                      {level.description}
                    </p>

                    <div className={styles.archGrid}>
                      {level.voltageDetail && (
                        <div className={styles.archMetaBlock}>
                          <div className={styles.archMetaLabel}>Electrical Rating</div>
                          <div className={styles.archMetaValue}>{level.voltageDetail}</div>
                        </div>
                      )}
                      {level.limitDetail && (
                        <div className={styles.archMetaBlock}>
                          <div className={styles.archMetaLabel}>Limits & Bounds</div>
                          <div className={styles.archMetaValue}>{level.limitDetail}</div>
                        </div>
                      )}
                      {level.protocols && (
                        <div className={styles.archMetaBlock}>
                          <div className={styles.archMetaLabel}>Protocols & Ingestion</div>
                          <div className={styles.archMetaValue}>{level.protocols}</div>
                        </div>
                      )}
                      {level.algorithms && (
                        <div className={styles.archMetaBlock}>
                          <div className={styles.archMetaLabel}>Estimation Engines</div>
                          <div className={styles.archMetaValue}>{level.algorithms}</div>
                        </div>
                      )}
                      {level.standards && (
                        <div className={styles.archMetaBlock}>
                          <div className={styles.archMetaLabel}>Governing Standards</div>
                          <div className={styles.archMetaValue}>{level.standards}</div>
                        </div>
                      )}
                      {level.sohDetail && (
                        <div className={styles.archMetaBlock}>
                          <div className={styles.archMetaLabel}>Degradation Bounds</div>
                          <div className={styles.archMetaValue}>{level.sohDetail}</div>
                        </div>
                      )}
                    </div>

                    <div className={styles.archSchematicBox}>
                      {level.schematicText}
                    </div>

                    <h4 className={styles.pathwaySectionHeader} style={{ fontSize: "0.8rem", marginTop: "1.5rem" }}>
                      Key Architectural Focus Items
                    </h4>
                    <div className={styles.archFocusList}>
                      {level.keyFocus.map((focus, idx) => (
                        <div key={idx} className={styles.archFocusItem}>
                          <span className={styles.archFocusCheck}>✓</span>
                          <span>{focus}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.archTipBlock}>
                      <div className={styles.archTipHeader}>💡 Battery Design Engineering Tip</div>
                      <div className={styles.archTipText}>{level.engineeringTip}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* ═══ CAPSTONE PROJECT SECTION ═══ */}
          <section id="capstone" className={styles.pageSection} ref={sectionRefs.capstone}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Final Integrations</span>
              <h2 className={styles.sectionTitle}>Capstone Project: Production Pack Design Blueprint</h2>
              <p className={styles.sectionSubtitle}>
                The ultimate hands-on capstone project requires candidates to design, simulate, validate, and document a 400V structural EV battery pack blueprint.
              </p>
            </div>

            <CapstoneOutput>
              <h4 style={{ color: "#10b981", fontSize: "1.1rem", marginBottom: "0.75rem" }}>Unified Capstone Deliverables Checklist</h4>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Candidates must submit a complete, validated design document containing:
              </p>
              <ul style={{ listStyle: "circle", paddingLeft: "1.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                <li>Detailed mechanical CAD blueprints of pack structural frame (Cell-to-Pack format)</li>
                <li>Thermal simulation cooling plate fluid dynamics sheet showing peak operating margins</li>
                <li>BMS wiring configuration schematics with isolated SPI channel assignments</li>
                <li>BMS firmware script written in C/Python demonstrating Extended Kalman Filter (EKF) SOC estimation</li>
                <li>ISO 21434 compliant threat modeling matrix including security control boundaries</li>
                <li>Comprehensive cost projection spreadsheet detailing repacking circular economy metrics</li>
              </ul>
            </CapstoneOutput>
          </section>

          {/* ═══ FUTURE ROADMAP SECTION ═══ */}
          <section id="roadmap" className={styles.pageSection} ref={sectionRefs.roadmap}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Technology Roadmap</span>
              <h2 className={styles.sectionTitle}>Future Technology Roadmap (2026-2030)</h2>
              <p className={styles.sectionSubtitle}>
                A technical outlook on the emerging electrochemical and computing boundaries shaping the next decade of electric mobility.
              </p>
            </div>

            <div className="grid-2">
              <FutureTechnology>
                <h4 style={{ color: "#ec4899", fontSize: "1rem", marginBottom: "0.5rem" }}>Solid-State Volumetric Packs (2028)</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  Transitioning from liquid electrolytes to solid polymer/ceramic separators. Eliminates propagation risks, enables 500 Wh/kg densities, and requires new structural pressure containment chassis designs.
                </p>
              </FutureTechnology>

              <FutureTechnology>
                <h4 style={{ color: "#ec4899", fontSize: "1rem", marginBottom: "0.5rem" }}>Quantum Telemetry Encryption (2030)</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  Securing cellular telematics lines against mathematical decryption models. Integrating post-quantum lattice cryptography directly into low-overhead BMS microcontrollers.
                </p>
              </FutureTechnology>
            </div>
          </section>

          {/* ═══ REUSABLE CHAPTER LAYOUT DEMONSTRATION ═══ */}
          <section id="chapterPreview" className={styles.pageSection} ref={sectionRefs.chapterPreview}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Layout Schema</span>
              <h2 className={styles.sectionTitle}>Reusable Chapter Template Layout</h2>
              <p className={styles.sectionSubtitle}>
                A clear, comprehensive visual framework showcasing how future detailed chapters in this handbook are structured.
              </p>
            </div>

            <div className={styles.chapterBox}>
              <div className={styles.chapterTitle}>Part 5: BMS Software Algorithms & State Estimation</div>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem" }}>1. Introduction</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Accurate state estimation is the brain of the battery management system. Estimating the state of charge (SOC) and state of health (SOH) non-invasively requires mathematical observers that reconcile noisy voltage and current inputs with physical models of the cell.
              </p>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem" }}>2. Core Learning Objectives</h4>
              <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                <li>Implement Coulomb counting with periodic OCV-calibration overlays</li>
                <li>Understand the dynamics of Extended Kalman Filters (EKF) in state tracking</li>
                <li>Program cell-imbalance correction algorithms inside microcontrollers</li>
              </ul>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem" }}>3. Architectural Visualization</h4>
              <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "1.5rem", background: "rgba(0,0,0,0.2)", margin: "1rem 0", textAlign: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--accent-primary)", fontFamily: "monospace", display: "block" }}>
                  [Voltage Sense (V) + Current Sense (I)] → [Extended Kalman Filter (EKF) State Observer] → [Corrected State of Charge (SOC)]
                </span>
              </div>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem" }}>4. Governing Formulas</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                The basic Coulomb counting integration governing State of Charge is represented as:
              </p>
              <div className={styles.formula}>
                {"SOC(t) = SOC(t_0) - (1 / C_nominal) * ∫ [ I(t) / 3600 ] dt"}
              </div>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem", marginTop: "1rem" }}>5. Code Implementation (BMS Calibrations)</h4>
              <pre className={styles.codeBlock}>
{`# Extended Kalman Filter State of Charge Observer Model (Python)
import numpy as np

def update_ekf_soc(prev_soc, current_i, voltage_measured, dt, c_nominal):
    # Predict step
    soc_predict = prev_soc - (current_i * dt) / (c_nominal * 3600.0)
    
    # Simple observation correction model (OCV vs SOC lookup)
    ocv_predicted = 3.2 + 0.8 * soc_predict  # Simplified linear OCV curve
    voltage_error = voltage_measured - ocv_predicted
    
    # Correction gain (simplified kalman gain)
    k_gain = 0.05
    corrected_soc = soc_predict + k_gain * voltage_error
    
    return np.clip(corrected_soc, 0.0, 1.0)`}
              </pre>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem" }}>6. Real-world CAN Communication (CAN Bus Data Frame)</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                The BMS broadcasts the calculated SOC, SOH, and maximum charge current limit over CAN FD:
              </p>
              <div className={styles.canFrameGrid}>
                <div className={styles.canField}>
                  <div className={styles.canLabel}>Frame ID (HEX)</div>
                  <div className={styles.canValAccent}>0x10A</div>
                </div>
                <div className={styles.canField}>
                  <div className={styles.canLabel}>Byte 0: State of Charge</div>
                  <div className={styles.canVal}>0x5A (90% SOC)</div>
                </div>
                <div className={styles.canField}>
                  <div className={styles.canLabel}>Byte 1: State of Health</div>
                  <div className={styles.canVal}>0x62 (98% SOH)</div>
                </div>
                <div className={styles.canField}>
                  <div className={styles.canLabel}>Byte 2-3: Peak Discharge</div>
                  <div className={styles.canVal}>0x012C (300 Amps)</div>
                </div>
              </div>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem", marginTop: "1rem" }}>7. Practical Exercise</h4>
              <PracticalExercise>
                <span style={{ fontWeight: 700 }}>Exercise: Implement EKF in MicroPython</span>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.4rem", marginBottom: 0 }}>
                  Take raw voltage and current data logs from a driving cycle. Program the simple MicroPython kalman observer to run on an ESP32 edge sense circuit, outputting SOC estimates with less than 2% tracking error.
                </p>
              </PracticalExercise>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem" }}>8. References</h4>
              <ul style={{ paddingLeft: "1.25rem", color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.6, margin: 0 }}>
                <li>IEEE Transactions on Power Electronics: Kalman Filter Observers for Li-Ion Packs</li>
                <li>ISO 26262 compliance rules governing BMS safety state estimations</li>
              </ul>

              <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.5rem", marginTop: "1.25rem" }}>9. Chapter Summary</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                Accurate state estimation ensures that the vehicle never encounters sudden power drops, coordinates cell balancing, and limits thermal degradation under heavy fast-charging profiles.
              </p>

              <div className={styles.chapterNav}>
                <div className={styles.chapterNavLink}>
                  <span className={styles.chapterNavLabel}>Previous Chapter</span>
                  <span className={styles.chapterNavTitle}>Part 4: BMS Hardware Sensing</span>
                </div>
                <div className={styles.chapterNavLink} style={{ alignItems: "flex-end" }}>
                  <span className={styles.chapterNavLabel}>Next Chapter</span>
                  <span className={styles.chapterNavTitle}>Part 6: Thermal Systems</span>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ GLOSSARY SECTION ═══ */}
          <section id="glossary" className={styles.pageSection} ref={sectionRefs.glossary}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Vocabulary register</span>
              <h2 className={styles.sectionTitle}>Battery Systems Glossary</h2>
              <p className={styles.sectionSubtitle}>
                Quick, searchable definition index covering heavy engineering terminology.
              </p>
            </div>

            <div className={styles.glossaryContainer}>
              {GLOSSARY_ITEMS.map((item, i) => (
                <div className={styles.glossaryItem} key={i}>
                  <button className={styles.glossaryTrigger} onClick={() => toggleGlossary(i)}>
                    <span>{item.term}</span>
                    {expandedGlossary[i] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {expandedGlossary[i] && (
                    <div className={styles.glossaryContent}>
                      {item.definition}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <SafetyWarning>
                <strong>Critical Thermal Safety Warning:</strong> Never manipulate active lithium cells without standard ground isolation, protective fire containment gear, and certified extraction vents. Thermal runaway propagation represents severe safety risks.
              </SafetyWarning>
            </div>
          </section>

        </main>
      </div>

    </div>
  );
}
