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
import { trackEvent } from "@/utils/analytics";

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
  status: "Available" | "Draft" | "Planned" | "Coming Next";
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
      { title: "0.1 Welcome to EV Battery Pack Engineering", anchor: "part-0-1" },
      { title: "0.2 Who Should Read This Handbook", anchor: "part-0-2" },
      { title: "0.3 Beginner → Engineer → Architect Learning Path", anchor: "part-0-3" },
      { title: "0.4 How to Use This Handbook", anchor: "part-0-4" },
      { title: "0.5 Engineering Philosophy of This Handbook", anchor: "part-0-5" },
      { title: "0.6 The Evolution of EV Battery Systems (2026–2030)", anchor: "part-0-6" },
      { title: "0.7 Safety Disclaimer", anchor: "part-0-7" },
      { title: "0.8 Final Learning Outcomes", anchor: "part-0-8" },
      { title: "0.9 Capstone Projects Overview", anchor: "part-0-9" },
      { title: "0.10 Navigation to Part 1", anchor: "part-0-10" }
    ]
  },
  {
    num: "Part 1",
    title: "Battery Fundamentals",
    desc: "Energy storage fundamentals, electrochemistry basics, cell-module-pack hierarchy, voltage/current/power/energy, capacity/C-rate, series-parallel configurations, lifecycle metrics, and tradeoffs.",
    difficulty: "Beginner",
    prerequisites: "None",
    duration: "3.5 Hrs",
    skillsGained: ["Electrochemical Storage Concepts", "Voltage/Current scaling", "Sizing & C-Rate calculations", "Tradeoff analysis"],
    domains: ["Electrochemical", "Electrical", "Systems Engineering"],
    futureRelevance: "Critical foundational engineering concepts required for all EV cell & pack design architectures.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "1.1 What Is a Battery?", anchor: "part-1-1" },
      { title: "1.2 What Is an EV Battery Pack?", anchor: "part-1-2" },
      { title: "1.3 Voltage, Current, Power, and Energy", anchor: "part-1-3" },
      { title: "1.4 Understanding Battery Capacity", anchor: "part-1-4" },
      { title: "1.5 Series and Parallel Connections", anchor: "part-1-5" },
      { title: "1.6 Battery States and Terminology", anchor: "part-1-6" },
      { title: "1.7 Power Battery vs Energy Battery", anchor: "part-1-7" },
      { title: "1.8 Battery Pack Design Trade-offs", anchor: "part-1-8" },
      { title: "1.9 Introduction to EV Battery System Layers", anchor: "part-1-9" },
      { title: "1.10 Beginner Engineering Exercises", anchor: "part-1-10" },
      { title: "1.11 Key Engineering Takeaways", anchor: "part-1-11" },
      { title: "1.12 Navigation to Part 2", anchor: "part-1-12" }
    ]
  },
  {
    num: "Part 2",
    title: "EV Battery Requirements and System Definition",
    desc: "Systems engineering and requirements capture for traction packs, customer voice translation, vehicle-level constraints, environmental stress mapping, safety hazard mitigation, repairability, and lifecycle trade-off optimization.",
    difficulty: "Beginner",
    prerequisites: "Part 1",
    duration: "3.0 Hrs",
    skillsGained: ["Requirements Engineering", "Customer Voice Translation", "Safety Hazard Auditing", "Traceability Mapping", "System Trade-off Analysis"],
    domains: ["Systems Engineering", "Safety & Verification", "Lifecycle Analysis"],
    futureRelevance: "Crucial for automotive system sign-off, safety certification compliance, and battery circularity economics.",
    status: "Available",
    badgeClass: styles.badgeAvailable,
    subsections: [
      { title: "2.1 Why Requirements Matter", anchor: "part-2-1" },
      { title: "2.2 EV Battery Application Types", anchor: "part-2-2" },
      { title: "2.3 Running Example — Second-Life Battery Pack", anchor: "part-2-3" },
      { title: "2.4 Customer Requirement Capture", anchor: "part-2-4" },
      { title: "2.5 Vehicle/System Requirement Definition", anchor: "part-2-5" },
      { title: "2.6 Environmental and Thermal Requirements", anchor: "part-2-6" },
      { title: "2.7 Safety Requirements", anchor: "part-2-7" },
      { title: "2.8 Serviceability and Maintainability", anchor: "part-2-8" },
      { title: "2.9 Cost, Weight, Volume, and Lifecycle Trade-offs", anchor: "part-2-9" },
      { title: "2.10 Battery Requirement Specification Document", anchor: "part-2-10" },
      { title: "2.11 System Engineering Workflow", anchor: "part-2-11" },
      { title: "2.12 Beginner Engineering Exercises", anchor: "part-2-12" },
      { title: "2.13 Key Engineering Takeaways", anchor: "part-2-13" },
      { title: "2.14 Navigation to Part 3", anchor: "part-2-14" }
    ]
  },
  {
    num: "Part 3",
    title: "Cell Chemistry and Selection",
    desc: "Deep comparative study of cylindrical, prismatic, pouch cell formats. Selection matrix for NMC, LFP, LCO, post-lithium sodium-ion, and solid-state cell specifications. Covers datasheet reading, second-life evaluation, cell aging, safety, and the complete selection process.",
    difficulty: "Engineer",
    prerequisites: "Part 1",
    duration: "4.0 Hrs",
    skillsGained: ["Cell Spec Auditing", "Format Selection Matrix", "Sodium-ion Analytics", "Datasheet Reading", "Second-Life Evaluation"],
    domains: ["Chemical Engineering", "Manufacturing"],
    futureRelevance: "Crucial for solid-state cell characterization pipelines emerging globally by 2026-2028.",
    status: "Draft",
    badgeClass: styles.badgeDraft,
    subsections: [
      { title: "3.1 Introduction to Lithium-Ion Batteries", anchor: "part-3-1" },
      { title: "3.2 Anatomy of a Cell", anchor: "part-3-2" },
      { title: "3.3 LFP Chemistry", anchor: "part-3-3" },
      { title: "3.4 NMC Chemistry", anchor: "part-3-4" },
      { title: "3.5 Sodium-Ion Batteries", anchor: "part-3-5" },
      { title: "3.6 Solid-State Concepts", anchor: "part-3-6" },
      { title: "3.7 Cell Formats (Cylindrical, Prismatic, Pouch)", anchor: "part-3-7" },
      { title: "3.8 Datasheet Reading", anchor: "part-3-8" },
      { title: "3.9 Cell Selection Process", anchor: "part-3-9" },
      { title: "3.10 Second-Life Cell Evaluation", anchor: "part-3-10" },
      { title: "3.11 Cell Aging and Degradation", anchor: "part-3-11" },
      { title: "3.12 Cell Safety Mechanisms", anchor: "part-3-12" },
      { title: "3.13 Chemistry Comparison Matrix", anchor: "part-3-13" },
      { title: "3.14 Exercises", anchor: "part-3-14" },
      { title: "3.15 Key Takeaways", anchor: "part-3-15" },
      { title: "3.16 Navigation to Part 4", anchor: "part-3-16" }
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "4.1 HV Interconnects & Wire Bond Resistance Sizing", anchor: "part-4-1" },
      { title: "4.2 Fuse Coordination & Fast Pyrofuse BMS Interrupt Loops", anchor: "part-4-2" },
      { title: "4.3 Contactor Selection & Pre-charge Circuits", anchor: "part-4-3" },
      { title: "4.4 Insulation Monitoring Devices (IMD)", anchor: "part-4-4" },
      { title: "4.5 HV Wiring Harness Design", anchor: "part-4-5" },
      { title: "4.6 Exercises", anchor: "part-4-6" },
      { title: "4.7 Navigation to Part 5", anchor: "part-4-7" }
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "5.1 Analog Front-Ends & Passive Cell Balancing Circuits", anchor: "part-5-1" },
      { title: "5.2 Galvanic Isolation & Isolated SPI Ring Redundancies", anchor: "part-5-2" },
      { title: "5.3 Current Sensing: Hall Effect vs Shunt Resistors", anchor: "part-5-3" },
      { title: "5.4 Master-Slave BMS Architecture", anchor: "part-5-4" },
      { title: "5.5 PCB Layout Guidelines for BMS", anchor: "part-5-5" },
      { title: "5.6 Exercises", anchor: "part-5-6" },
      { title: "5.7 Navigation to Part 6", anchor: "part-5-7" }
    ]
  },
  {
    num: "Part 6",
    title: "BMS Software",
    desc: "State of Charge (SOC) estimation methods, State of Health (SOH), State of Function (SOF) algorithms, and balancing software control logic.",
    difficulty: "Architect",
    prerequisites: "Part 5",
    duration: "6.0 Hrs",
    skillsGained: ["SOC Estimation Methods", "SOH Diagnostics", "Balancing Controls Logic"],
    domains: ["Software", "Controls Systems"],
    futureRelevance: "Transitioning to edge-AI estimation engines replacing legacy Coulomb counting models completely by 2027.",
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "6.1 Kalman Filters & State of Charge (SOC) Modeling", anchor: "part-6-1" },
      { title: "6.2 SOH Diagnostics & Capacity Degradation Overlays", anchor: "part-6-2" },
      { title: "6.3 State of Function (SOF) Algorithms", anchor: "part-6-3" },
      { title: "6.4 Active & Passive Balancing Control Logic", anchor: "part-6-4" },
      { title: "6.5 RTOS & Embedded Firmware Structure", anchor: "part-6-5" },
      { title: "6.6 CAN Bus Communication Layer", anchor: "part-6-6" },
      { title: "6.7 Exercises", anchor: "part-6-7" },
      { title: "6.8 Navigation to Part 7", anchor: "part-6-8" }
    ]
  },
  {
    num: "Part 7",
    title: "Thermal Design",
    desc: "Liquid cooling cold-plates, cooling channel design, coolant flow modeling, phase change materials (PCM), thermal interface materials (TIM), and active cooling layouts.",
    difficulty: "Engineer",
    prerequisites: "Part 2",
    duration: "4.5 Hrs",
    skillsGained: ["Liquid Coolant Routing", "TIM Selection", "Cooling Design Review"],
    domains: ["Thermal", "Mechanical Engineering"],
    futureRelevance: "Critical for ultra-fast charging (4C+) thermal mitigation and solid-state heat management.",
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "7.1 Coolant Ribbon Plates & Single-Phase Liquid Cooling", anchor: "part-7-1" },
      { title: "7.2 Phase Change Materials (PCM) & Structural TIM Selections", anchor: "part-7-2" },
      { title: "7.3 Thermal Resistance Modeling", anchor: "part-7-3" },
      { title: "7.4 CFD Simulation Basics for Battery Packs", anchor: "part-7-4" },
      { title: "7.5 Heating Systems for Cold Climate Operation", anchor: "part-7-5" },
      { title: "7.6 Exercises", anchor: "part-7-6" },
      { title: "7.7 Navigation to Part 8", anchor: "part-7-7" }
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "8.1 Cell-to-Pack (CTP) & Cell-to-Chassis Integration", anchor: "part-8-1" },
      { title: "8.2 Enclosure Crashworthiness FEA & Vibration Isolation", anchor: "part-8-2" },
      { title: "8.3 IP67/IP68 Sealing & Environmental Ingress Protection", anchor: "part-8-3" },
      { title: "8.4 Cell Compression Systems & Mechanical Fixtures", anchor: "part-8-4" },
      { title: "8.5 Module-to-Pack Assembly Workflow", anchor: "part-8-5" },
      { title: "8.6 Exercises", anchor: "part-8-6" },
      { title: "8.7 Navigation to Part 9", anchor: "part-8-7" }
    ]
  },
  {
    num: "Part 9",
    title: "Safety Engineering",
    desc: "Thermal runaway risk and prevention, cell venting mechanisms, exhaust gas manifold design, and inter-cell thermal barrier design (silica aerogels, mica sheets).",
    difficulty: "Architect",
    prerequisites: "Part 8",
    duration: "4.5 Hrs",
    skillsGained: ["Thermal Propagation Blocking", "Venting Exhaust Manifolds", "Aerogel Selection"],
    domains: ["Safety", "Thermal Management"],
    futureRelevance: "Mandatory compliance base to prevent adjacent cell chain combustion under rigorous global testing protocols.",
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "9.1 Thermal Runaway Risk & Trigger Mechanisms", anchor: "part-9-1" },
      { title: "9.2 Venting Gas Routing & High-Temp Gas Manifolds", anchor: "part-9-2" },
      { title: "9.3 Silica Aerogel & Ceramic Composite Barriers", anchor: "part-9-3" },
      { title: "9.4 Fire Suppression Integration", anchor: "part-9-4" },
      { title: "9.5 Propagation Testing Protocols", anchor: "part-9-5" },
      { title: "9.6 Exercises", anchor: "part-9-6" },
      { title: "9.7 Navigation to Part 10", anchor: "part-9-7" }
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "10.1 UN 38.3 Shipping Certification Methods", anchor: "part-10-1" },
      { title: "10.2 ECE R100 Rev.3 Cell/Pack Safety Certification", anchor: "part-10-2" },
      { title: "10.3 ISO 12405 Testing Standards", anchor: "part-10-3" },
      { title: "10.4 ISO 26262 Functional Safety for EV", anchor: "part-10-4" },
      { title: "10.5 IEC 62619 Stationary Storage Safety", anchor: "part-10-5" },
      { title: "10.6 Exercises", anchor: "part-10-6" },
      { title: "10.7 Navigation to Part 11", anchor: "part-10-7" }
    ]
  },
  {
    num: "Part 11",
    title: "Diagnostics and Battery Health",
    desc: "Battery health test methods, impedance-based diagnostics, capacity fade tracking, and internal resistance degradation models.",
    difficulty: "Expert",
    prerequisites: "Part 6",
    duration: "4.0 Hrs",
    skillsGained: ["Battery Health Test Data Analysis", "Lithium Plating Analytics", "Capacity Retention Calculations"],
    domains: ["Diagnostics", "Electrochemistry"],
    futureRelevance: "High-throughput on-vehicle EIS hardware sensors arriving to top-tier heavy vehicles by 2027.",
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "11.1 Battery Health Test Data Analysis", anchor: "part-11-1" },
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
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
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "16.1 Dynamic 400V/800V Charging Configurations", anchor: "part-16-1" },
      { title: "16.2 MegaWatt Charging Systems (MCS) & High-Rate Thermal Loops", anchor: "part-16-2" },
      { title: "16.3 Silicon Carbide (SiC) Inverter Architecture", anchor: "part-16-3" },
      { title: "16.4 Distributed BMS Topology", anchor: "part-16-4" },
      { title: "16.5 Exercises", anchor: "part-16-5" },
      { title: "16.6 Navigation to Part 17", anchor: "part-16-6" }
    ]
  },
  {
    num: "Part 17",
    title: "End-to-End Reference Design",
    desc: "Full production-ready reference pack: 800V LFP layout, Cell-to-Pack structural blueprints, complete schematic CAD models, and cooling design analyses.",
    difficulty: "Expert",
    prerequisites: "Part 8",
    duration: "5.5 Hrs",
    skillsGained: ["Reference CAD Auditing", "Electrical Schematic Mapping", "Cooling Flow Validation"],
    domains: ["Systems Engineering", "Design Validation"],
    futureRelevance: "State-of-the-art reference pack integration models ready for automotive factories.",
    status: "Planned",
    badgeClass: styles.badgePlanned,
    subsections: [
      { title: "17.1 Unified 800V Reference Schematic Schematics", anchor: "part-17-1" },
      { title: "17.2 Cooling Flow Design Review and Validation", anchor: "part-17-2" }
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
    status: "Coming Next",
    badgeClass: styles.badgeComingNext,
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
    focusPoints: ["How Batteries Work", "Basic Circuit Modeling", "Vehicle Usage Profiles", "Cell Format Sizing"],
    outcomes: ["Compare cell chemistries and understand tradeoffs", "Size energy budgets for simple vehicle scenarios", "Establish lab electrical safety protocol limits"],
    steps: [
      { partNum: "Part 0", partTitle: "Handbook Orientation", focus: "Safety basics & high-voltage PPE protocols" },
      { partNum: "Part 1", partTitle: "Battery Fundamentals", focus: "How batteries work and basic circuit modeling" },
      { partNum: "Part 2", partTitle: "EV Battery Requirements", focus: "Vehicle usage profiles and energy requirements" },
      { partNum: "Part 3", partTitle: "Cell Chemistry and Selection", focus: "NMC vs LFP cell format sizing tradeoffs" }
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
    focusPoints: ["SOC Estimation Methods", "ECE R100 Safety Testing", "MegaWatt Charging Thermal Loops", "Reference Blueprint CAD"],
    outcomes: ["Implement SOC estimation methods in BMS firmware", "Pass global UN 38.3 shipping compliance tests", "Architect 800V silicon carbide traction converters"],
    steps: [
      { partNum: "Part 6", partTitle: "BMS Software", focus: "SOC estimation methods & battery state tracking" },
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

interface PrereqNode {
  id: string;
  name: string;
  category: "electrical" | "embedded" | "thermal" | "cloud" | "cyber" | "systems";
  level: "Foundational" | "Core Engineering" | "System Architect";
  desc: string;
  prereqs: string[];
  downstream: string[];
  refresherBadge?: string;
  refresherUrl?: string;
  beginnerSafe: boolean;
}

const PREREQ_MATRIX: PrereqNode[] = [
  {
    id: "basic-elec",
    name: "Basic Electrical Concepts",
    category: "electrical",
    level: "Foundational",
    desc: "Voltage, current, Ohm's law, series-parallel resistor networks, and basic DC circuit laws.",
    prereqs: [],
    downstream: ["pack-sizing", "bms-hw"],
    refresherBadge: "⚡ Quick Refresher",
    beginnerSafe: true
  },
  {
    id: "embedded-basics",
    name: "Embedded Programming Basics",
    category: "embedded",
    level: "Foundational",
    desc: "C/C++ basics, microcontroller GPIOs, registers, ADCs, and simple SPI/I2C protocols.",
    prereqs: [],
    downstream: ["bms-fw"],
    refresherBadge: "⚡ Refresher Guide",
    beginnerSafe: true
  },
  {
    id: "thermal-basics",
    name: "Thermodynamics Fundamentals",
    category: "thermal",
    level: "Foundational",
    desc: "Heat transfer mechanisms (conduction, convection, radiation) and specific heat capacity calculations.",
    prereqs: [],
    downstream: ["thermal-sim"],
    refresherBadge: "⚡ Basic Formulas",
    beginnerSafe: true
  },
  {
    id: "can-basics",
    name: "CAN Communication Basics",
    category: "embedded",
    level: "Foundational",
    desc: "CAN bus architecture, differential signaling, CAN frame structure, and identifier arbitration.",
    prereqs: ["embedded-basics"],
    downstream: ["diagnostics", "secure-bms"],
    beginnerSafe: false
  },
  {
    id: "cloud-basics",
    name: "Cloud & Network Basics",
    category: "cloud",
    level: "Foundational",
    desc: "HTTP, TCP/IP networking, MQTT client-broker architecture, and JSON data formats.",
    prereqs: [],
    downstream: ["telemetry"],
    beginnerSafe: true
  },
  {
    id: "cyber-basics",
    name: "Cryptography Basics",
    category: "cyber",
    level: "Foundational",
    desc: "Symmetric vs asymmetric keys, hashing (SHA-256), HMACs, and digital signatures.",
    prereqs: [],
    downstream: ["secure-bms"],
    refresherBadge: "⚡ Encryption 101",
    beginnerSafe: true
  },
  {
    id: "pack-sizing",
    name: "Pack Sizing & Load Sizing",
    category: "systems",
    level: "Core Engineering",
    desc: "Determining series-parallel configurations, mass budget, and cell-to-pack structural envelopes.",
    prereqs: ["basic-elec"],
    downstream: ["thermal-sim"],
    beginnerSafe: true
  },
  {
    id: "bms-hw",
    name: "BMS Hardware Design",
    category: "electrical",
    level: "Core Engineering",
    desc: "Analog Front-End selection, galvanic isolation, current sensing, and cell balancing circuits.",
    prereqs: ["basic-elec", "embedded-basics"],
    downstream: ["bms-fw"],
    beginnerSafe: false
  },
  {
    id: "bms-fw",
    name: "BMS Firmware Development",
    category: "embedded",
    level: "Core Engineering",
    desc: "Developing drivers for AFEs, implementing Coulomb counting, passive balancing control, and SPI ring bus.",
    prereqs: ["embedded-basics", "bms-hw"],
    downstream: ["diagnostics", "secure-bms"],
    beginnerSafe: false
  },
  {
    id: "thermal-sim",
    name: "Thermal Simulation & CFD",
    category: "thermal",
    level: "Core Engineering",
    desc: "Coolant velocity modeling, Ribbon channels design, and heat dissipation cold-plate simulations.",
    prereqs: ["thermal-basics", "pack-sizing"],
    downstream: ["runaway-safety"],
    beginnerSafe: false
  },
  {
    id: "diagnostics",
    name: "State Estimation & EIS Diagnostics",
    category: "systems",
    level: "System Architect",
    desc: "Kalman Filter SOC estimation, EIS impedance spectroscopy, and predictive SOH analytics.",
    prereqs: ["bms-fw", "can-basics"],
    downstream: ["telemetry"],
    beginnerSafe: false
  },
  {
    id: "telemetry",
    name: "Fleet Telemetry & Digital Twins",
    category: "cloud",
    level: "System Architect",
    desc: "Real-time MQTT ingestion under TLS, time-series data storage, and fleet battery prediction models.",
    prereqs: ["cloud-basics", "diagnostics"],
    downstream: ["secure-bms"],
    beginnerSafe: false
  },
  {
    id: "secure-bms",
    name: "Secure BMS & Cybersecurity",
    category: "cyber",
    level: "System Architect",
    desc: "ISO 21434 compliance, SecOC message authentication, secure boot, and cryptographic OTA updates.",
    prereqs: ["cyber-basics", "can-basics", "bms-fw"],
    downstream: [],
    beginnerSafe: false
  },
  {
    id: "runaway-safety",
    name: "Runaway Containment Design",
    category: "systems",
    level: "System Architect",
    desc: "Cell venting design, aerogel insulation plates, gas exhaust routing, and fire containment bounds.",
    prereqs: ["thermal-sim"],
    downstream: [],
    beginnerSafe: false
  }
];

interface ToolItem {
  name: string;
  category: "electronics" | "firmware" | "simulation" | "mechanical" | "cloud" | "general";
  purpose: string;
  usageArea: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  license: "Free / Open-Source" | "Paid" | "Free / Paid Tier";
  requirement: "Mandatory" | "Optional" | "Awareness Only";
  macOS: "Apple Silicon Native" | "Intel Native" | "VM Required (Windows)" | "Cross-Platform";
}

const TOOLS_ECOSYSTEM: ToolItem[] = [
  {
    name: "Python",
    category: "simulation",
    purpose: "Telemetry analytics, capacity degradation curve fitting, battery health test data analysis, and battery model sizing scripts.",
    usageArea: "Battery Sizing & Degradation Analytics",
    level: "Beginner",
    license: "Free / Open-Source",
    requirement: "Mandatory",
    macOS: "Apple Silicon Native"
  },
  {
    name: "VS Code",
    category: "firmware",
    purpose: "Core IDE for BMS firmware code execution, embedded C development, and telematics client scripting.",
    usageArea: "BMS Coding & Scripting",
    level: "Beginner",
    license: "Free / Open-Source",
    requirement: "Mandatory",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Jupyter Notebooks",
    category: "simulation",
    purpose: "Interactive scripting workspace for plotting cell test data logs, battery health test results, and thermal curves.",
    usageArea: "Data Analysis & Prototyping",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Mandatory",
    macOS: "Apple Silicon Native"
  },
  {
    name: "KiCad",
    category: "electronics",
    purpose: "PCB design software used to map master-slave BMS schematics, layout AFE chips, and route daisy-chain serial paths.",
    usageArea: "BMS PCB Schematic Layout",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "LTSpice",
    category: "simulation",
    purpose: "Analog circuit simulation tool for auditing passive cell balancing resistors and sensing line low-pass filters.",
    usageArea: "Cell Balance Circuit Simulation",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "FreeCAD",
    category: "mechanical",
    purpose: "Open-source 3D CAD modeling software for designing custom battery cell holders, modules, and cooling bracket wraps.",
    usageArea: "Cell Module Structural CAD",
    level: "Beginner",
    license: "Free / Open-Source",
    requirement: "Mandatory",
    macOS: "Apple Silicon Native"
  },
  {
    name: "PyBaMM",
    category: "simulation",
    purpose: "Python-based battery mathematical modeling framework for simulating electrochemical battery systems (DFN/SPM).",
    usageArea: "Cell Electrochemical Modeling",
    level: "Advanced",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Wireshark",
    category: "general",
    purpose: "Network packet analyzer to capture and audit raw CAN-FD frames or debug encrypted MQTT over TLS 1.3 packets.",
    usageArea: "CAN Bus & Network Debugging",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Grafana & InfluxDB",
    category: "cloud",
    purpose: "Time-series database and visualization engine for plotting real-time battery pack temperatures, voltages, and SOC.",
    usageArea: "Fleet Telemetry Dashboard",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "GitHub",
    category: "general",
    purpose: "Version control platform for versioning BMS firmware source code and collaborate on hardware review gates.",
    usageArea: "Version Control & Gate Approvals",
    level: "Beginner",
    license: "Free / Open-Source",
    requirement: "Mandatory",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Linux Basics",
    category: "general",
    purpose: "Command-line operations for setting up local gateways, running Docker containers, and editing configuration files.",
    usageArea: "BMS Gateway & Scripting",
    level: "Beginner",
    license: "Free / Open-Source",
    requirement: "Mandatory",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Docker",
    category: "cloud",
    purpose: "Containerization platform to build, package, and deploy isolated telemetry databases and ingestion servers.",
    usageArea: "Telematics Server Deployment",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "CAN-FD Sniffers & Tools",
    category: "firmware",
    purpose: "USB-to-CAN hardware interfaces and SavvyCAN software used to sniff live battery network traffic.",
    usageArea: "CAN Frame Debugging",
    level: "Intermediate",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "MQTT Explorer",
    category: "cloud",
    purpose: "Desktop client used to monitor and publish telematics messages to battery MQTT brokers.",
    usageArea: "MQTT Telemetry Ingestion Checking",
    level: "Beginner",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "TensorFlow / PyTorch",
    category: "simulation",
    purpose: "Machine learning frameworks for training battery State-of-Health prediction models and remaining-useful-life LSTMs.",
    usageArea: "Predictive AI Diagnostics",
    level: "Advanced",
    license: "Free / Open-Source",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Firebase",
    category: "cloud",
    purpose: "Backend database service for small fleet telemetry storage and fast web app alerts integration.",
    usageArea: "Cloud Telematics Storage",
    level: "Beginner",
    license: "Free / Paid Tier",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "Fusion 360",
    category: "mechanical",
    purpose: "Cloud-based CAD/CAE package for mechanical integration, stress analysis, and simple thermal plate simulations.",
    usageArea: "Enclosure Mechanical CAD",
    level: "Intermediate",
    license: "Free / Paid Tier",
    requirement: "Optional",
    macOS: "Apple Silicon Native"
  },
  {
    name: "SolidWorks",
    category: "mechanical",
    purpose: "Industry standard mechanical design and finite element analysis (FEA) software for battery pack enclosures.",
    usageArea: "Automotive Mechanical CAD",
    level: "Advanced",
    license: "Paid",
    requirement: "Optional",
    macOS: "VM Required (Windows)"
  },
  {
    name: "ANSYS Fluent",
    category: "simulation",
    purpose: "Automotive-grade high-fidelity computational fluid dynamics (CFD) for coolant cold-plates and structural crash FEA.",
    usageArea: "High-Fidelity CFD & Crash FEA",
    level: "Advanced",
    license: "Paid",
    requirement: "Awareness Only",
    macOS: "VM Required (Windows)"
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
    desc: "How batteries store energy & basic electrical behavior",
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
    desc: "SOC estimation methods & battery state tracking",
    prereqs: ["BMS Hardware"],
    leadsTo: ["ai-intel"]
  },
  {
    id: "thermal",
    name: "Thermal Design",
    partIndex: 7,
    desc: "Cooling design review & heat management",
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
    desc: "Secure communication and secure boot basics",
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
    keyFocus: ["Basic battery chemistry (how cells store and release energy)", "Equivalent Series Resistance (ESR) — internal cell resistance", "How aging and temperature affect cell capacity"],
    schematicText: "[Anode (Silicon-Graphite)] ── (Electrolyte Interface) ── [Cathode (High-Nickel NMC)]",
    description: "The individual cell is the fundamental unit of every battery pack. Understanding cell chemistry, voltage, capacity, and aging is the essential starting point before building anything larger.",
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
    keyFocus: ["How cells are arranged in series and parallel", "Physical barriers to isolate cells from each other", "Cooling plate design to manage heat"],
    schematicText: "[12s4p Cell Grid] ── (Cooling Plate + Thermal Interface Material)",
    description: "A module groups multiple cells together into a manageable physical package. It houses temperature sensors, voltage monitoring, and structural spacers to hold cells safely.",
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
    keyFocus: ["High-voltage contactor and fuse coordination", "BMS isolation and sensing across the full pack", "Emergency disconnect (pyrofuse) protection"],
    schematicText: "[Module Chain] ── (Isolation Monitor) ── [Emergency Fuse + HV Contactors]",
    description: "The complete battery pack is the final energy enclosure fitted to the vehicle. It contains the high-voltage distribution, safety hardware, thermal barriers, and the main BMS controller.",
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
    keyFocus: ["How driving patterns (highway, city) affect battery demand", "High-performance motor drive inverter integration", "Vehicle Control Unit (VCU) power management"],
    schematicText: "[Traction Battery Pack] ── (CAN Bus) ── [Motor Inverter + Drive System]",
    description: "The vehicle level defines how the battery interacts with the rest of the car — the motor, charging ports, vehicle control unit, and all power routing under different driving conditions.",
    engineeringTip: "Implement dynamic peak charge limits that reflect both instant cell temp and calculated OCV lines during highway acceleration."
  },
  {
    levelNum: 5,
    name: "Cloud Level",
    status: "Synced",
    statusColor: "#10b981",
    indicatorState: "pulse",
    protocols: "MQTT over TLS 1.3 / Google Protobuf",
    keyFocus: ["Sending battery data securely to the cloud over the internet", "Digital twin — a live software model of your real battery", "European Battery Passport tracking and compliance"],
    schematicText: "[EV Gateway] ── (Secure Internet Link) ── [Cloud Database + Digital Twin]",
    description: "The cloud level collects real-time data from every vehicle in a fleet, stores charging and health histories, and makes that data available for diagnostics, compliance, and predictive analytics.",
    engineeringTip: "Use delta-compression on your Protobuf schemas to keep cell-level telemetry transfers viable over cellular networks."
  },
  {
    levelNum: 6,
    name: "AI Layer",
    status: "Analyzing",
    statusColor: "#a855f7",
    indicatorState: "pulse",
    algorithms: "SOC Estimator / Remaining Useful Life Predictor",
    keyFocus: ["SOC estimation methods — knowing how much charge is left", "AI models forecasting how much battery life remains", "Edge AI on the BMS detecting early warning signs"],
    schematicText: "[Voltage, Current, Temp Sensors] ── (SOC Estimation) ── [AI Forecasting Engine]",
    description: "The AI layer is the intelligence layer — it figures out how much charge is left (SOC), predicts how long the battery will last, and detects early signs of cell problems before they become dangerous.",
    engineeringTip: "Run a lightweight Coulomb-counter in parallel with the EKF observer. If OCV drift rises, use the EKF outputs to reset integration bounds."
  },
  {
    levelNum: 7,
    name: "Security Layer",
    status: "Encrypted",
    statusColor: "#ef4444",
    indicatorState: "locked",
    standards: "ISO 21434 / UNECE R155 Cybersecurity",
    keyFocus: ["Secure boot — making sure only trusted software runs on the BMS", "Secure message authentication on the vehicle network", "Secure over-the-air (OTA) firmware update validation"],
    schematicText: "[OTA Firmware Update] ── (Signature Verification) ── [Secure Flash]",
    description: "The security layer protects the battery system from cyber attacks and software tampering. It ensures that only trusted firmware runs, that vehicle network messages are authentic, and that telemetry data is encrypted.",
    engineeringTip: "Always isolate the cellular telemetry module from the direct traction contactor loop by enforcing physical gateway packet filtering."
  },
  {
    levelNum: 8,
    name: "Second-life Lifecycle",
    status: "In Testing",
    statusColor: "#eab308",
    indicatorState: "solid",
    sohDetail: "Retirement limit: SOH < 80%",
    keyFocus: ["Battery health sorting — grading retired packs for reuse", "Safe disassembly and triage of retired EV modules", "Sizing retired modules for stationary energy storage"],
    schematicText: "[Retired EV Pack (SOH < 80%)] ── (Health Sorting & Grading) ── [Stationary Storage System]",
    description: "When EV batteries are retired from vehicles (typically when capacity drops below 80%), they still have useful energy storage life. The second-life layer grades, repacks, and reuses them in stationary storage applications.",
    engineeringTip: "During pack sorting, use high-frequency impedance checks rather than full frequency sweeps — this speeds up the triage process significantly."
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

interface ReviewGate {
  gateNum: number;
  abbr: string;
  name: string;
  goal: string;
  failureModes: string[];
  dependencies: string[];
  metrics: string[];
  checksheet: { item: string; owner: string }[];
}

const REVIEW_GATES: ReviewGate[] = [
  {
    gateNum: 1,
    abbr: "SRR",
    name: "System Requirements Review",
    goal: "Freeze pack capacity (kWh), vehicle physical envelope sizing (mm), and continuous discharge power limits (kW) derived from the target vehicle usage profile.",
    failureModes: [
      "Inaccurate peak power estimates causing cell capacity sizing shortfalls.",
      "Chassis volume constraint miscalculations resulting in later pack frame adjustments."
    ],
    dependencies: ["Vehicle Integration Team", "Powertrain Specialists"],
    metrics: ["Pack target mass: < 450 kg", "Continuous discharge limit: 120 kW"],
    checksheet: [
      { item: "Vehicle usage profile and drive cycle assumptions frozen", owner: "Systems Lead" },
      { item: "Maximum continuous bus current calculated", owner: "Electrical Lead" }
    ]
  },
  {
    gateNum: 2,
    abbr: "SDR",
    name: "System Design Review",
    goal: "Evaluate electrochemical cell form-factors (cylindrical 4680 vs prismatic), chemistry selection (NMC vs LFP), and basic series-parallel pack configuration.",
    failureModes: [
      "Selecting LFP chemistry for high-acceleration vehicles without checking energy density drop.",
      "Miscalculating cylindrical cell pressure swells causing cell enclosure cracks."
    ],
    dependencies: ["Materials Science Team", "Cell Vendors"],
    metrics: ["Cell format selected: cylindrical 4680", "Cathode chemistry: High-Nickel NMC"],
    checksheet: [
      { item: "Cell mechanical swelling bounds verified", owner: "Mechanical Lead" },
      { item: "Anode lithium plating limits documented", owner: "Materials Lead" }
    ]
  },
  {
    gateNum: 3,
    abbr: "PDR",
    name: "Preliminary Design Review",
    goal: "Audit busbar physical layout cross-sections, BMS slave-master wiring layouts, and initial cooling plate design review.",
    failureModes: [
      "Inadequate copper busbar cross-sections causing thermal heat points under peak discharges.",
      "Poor isolated SPI communications routing creating electromagnet interference (EMI) errors."
    ],
    dependencies: ["Thermal CFD Team", "Electrical PCB Designers"],
    metrics: ["Busbar current density: < 6 A/mm²", "Coolant pressure drop: < 35 kPa"],
    checksheet: [
      { item: "Cooling design review and flow analysis completed", owner: "Thermal Lead" },
      { item: "Galvanic isolation boundaries mapped", owner: "Electrical Lead" }
    ]
  },
  {
    gateNum: 4,
    abbr: "CDR",
    name: "Critical Design Review",
    goal: "Finalize all engineering blueprints: cell spacing tolerance, contactor welding detection loops, pyrofuse coordination, and 3D CAD module structural brackets.",
    failureModes: [
      "Pyrofuse mechanical trip coordination delay exceeding contactor arc clearance speed.",
      "Module enclosure tolerances allowing cell spacer vibration rubbing during crash loads."
    ],
    dependencies: ["Manufacturing Assembly Lead", "Structural FEA Team"],
    metrics: ["Structural crash displacement: < 12mm", "BMS pyrofuse trip interrupt: < 2 ms"],
    checksheet: [
      { item: "Structural crashworthiness FEA approved", owner: "Mechanical Lead" },
      { item: "Contactor driver schematic approved", owner: "Firmware Lead" }
    ]
  },
  {
    gateNum: 5,
    abbr: "TRR",
    name: "Test Readiness Review",
    goal: "Approve battery test bench hardware, cell loading software profiles, emergency venting exhaust ducts, and high-voltage PPE equipment checks.",
    failureModes: [
      "Active high-voltage test bed without safety boundary warning lights.",
      "No gas capture ducts to capture toxic HF vapors during deliberate cell venting tests."
    ],
    dependencies: ["Lab Safety Officer", "Test Bed Technicians"],
    metrics: ["Lab insulation resistance: > 10 MΩ", "Safety watch perimeter cleared: Yes"],
    checksheet: [
      { item: "High-voltage PPE glove certification checked", owner: "Lab Watch" },
      { item: "Emergency ventilation flow rates verified", owner: "Safety Lead" }
    ]
  },
  {
    gateNum: 6,
    abbr: "SAR",
    name: "Safety & HAZOP Approval",
    goal: "Conduct full Hazard and Operability (HAZOP) audits. Sign off on cell venting manifolds, aerogel thermal block sheets, and fault diagnostic state logic.",
    failureModes: [
      "Exhaust manifold flow bottlenecks triggering gas pressure build-ups and cell explosions.",
      "Failure state logic causing contactors to lock shut during structural crash hazards."
    ],
    dependencies: ["Certification Regulators", "Safety Engineering Team"],
    metrics: ["Inter-cell thermal propagation delay: > 5 mins", "HAZOP safety review nodes: 0 open"],
    checksheet: [
      { item: "Exhaust manifold pressure release sizing signed off", owner: "Safety Engineer" },
      { item: "Crash sensor hardwired pyrofuse trigger certified", owner: "Systems Lead" }
    ]
  },
  {
    gateNum: 7,
    abbr: "ORR",
    name: "Operational Readiness Review",
    goal: "Perform full commissioning tests: calibration of BMS Analog Front-End voltage channels, checking current sensors, and testing temperature feedback loops.",
    failureModes: [
      "AFE voltage sense offset errors leading to cell overcharging.",
      "Temperature thermistors placed outside cell hotspots, missing hot points."
    ],
    dependencies: ["Firmware Devs", "Quality Control Team"],
    metrics: ["BMS voltage sensing accuracy: < 5 mV", "Current sensor offset calibration: < 50 mA"],
    checksheet: [
      { item: "High-precision current sensor calibrated", owner: "Quality Engineer" },
      { item: "BMS AFE balancing driver logs verified", owner: "Firmware Dev" }
    ]
  },
  {
    gateNum: 8,
    abbr: "FRR",
    name: "Flight/Vehicle Readiness Review",
    goal: "Verify battery pack is securely integrated into vehicle chassis. Validate SecOC CAN-FD cryptographic message signing and stream telemetry packet outputs.",
    failureModes: [
      "SecOC cryptographic freshness counters mismatching, dropping important CAN data.",
      "Telemetry stream frame drops under high-rate dynamic test acceleration profiles."
    ],
    dependencies: ["Vehicle Software Lead", "Cybersecurity Architect"],
    metrics: ["CAN-FD message signing speed: < 200 us", "Telemetry MQTT buffer drops: 0%"],
    checksheet: [
      { item: "SecOC cryptographic key exchange verified", owner: "Cybersecurity Lead" },
      { item: "Vehicle control unit battery commands active", owner: "Software Lead" }
    ]
  },
  {
    gateNum: 9,
    abbr: "PRR",
    name: "Production Readiness Review",
    goal: "Approve assembly line machinery, cell laser-welding cycle times, end-of-line (EOL) quality checkstations, and UN 38.3 shipping certification plans.",
    failureModes: [
      "Laser welder power deviations causing weak micro-cracks in busbar welds.",
      "EOL checkstation failing to spot series resistance anomalies before shipping packs."
    ],
    dependencies: ["Factory Plant Manager", "EOL Testers"],
    metrics: ["Assembly weld cycle time: < 45 s/module", "EOL isolation test voltage: 1500V DC"],
    checksheet: [
      { item: "UN 38.3 shipping compliance certificate issued", owner: "Logistics Lead" },
      { item: "EOL welding optical scanners operational", owner: "Plant Lead" }
    ]
  }
];

// ─── MAIN COMPONENT ───

export default function BatteryPackDesignContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>({});
  const [activeSection, setActiveSection] = useState("hero");
  const [activeLayer, setActiveLayer] = useState<"handbook" | "learning" | "projects" | "certification">("handbook");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGlossary, setExpandedGlossary] = useState<Record<number, boolean>>({});
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState("beginner");
  const [selectedLevelNum, setSelectedLevelNum] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [hoveredPrereqNode, setHoveredPrereqNode] = useState<string | null>(null);
  const [showBeginnerPath, setShowBeginnerPath] = useState(false);
  const [activeToolCategory, setActiveToolCategory] = useState<string>("all");
  const [selectedGate, setSelectedGate] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [openPartSections, setOpenPartSections] = useState<Record<string, boolean>>({
    part0Orientation: false,
    part1Fundamentals: false,
    part2Requirements: false,
  });
  const [safetyChecklist, setSafetyChecklist] = useState<Record<string, boolean>>({
    ppe: false,
    tools: false,
    extinguisher: false,
    extraction: false,
    discharging: false,
    transport: false
  });

  // Interactive UI states for Part 1 Fundamentals
  const [activeHierarchyLevel, setActiveHierarchyLevel] = useState<"cell" | "module" | "pack" | "system">("cell");
  const [wiringConfigTab, setWiringConfigTab] = useState<"series" | "parallel">("series");
  const [exerciseSolutions, setExerciseSolutions] = useState<Record<number, boolean>>({});
  const [tradeoffFocus, setTradeoffFocus] = useState<string | null>(null);
  const [seriesCount, setSeriesCount] = useState<number>(96);
  const [parallelCount, setParallelCount] = useState<number>(6);

  // Interactive UI states for Part 2 Requirements
  const [activeAppType, setActiveAppType] = useState<string>("car");
  const [gradingSoh, setGradingSoh] = useState<number>(85);
  const [gradingIr, setGradingIr] = useState<number>(1.2);
  const [selectedVocKey, setSelectedVocKey] = useState<string>("range");
  const [tradeoffSliderValue, setTradeoffSliderValue] = useState<number>(3);
  const [part2ExerciseSolutions, setPart2ExerciseSolutions] = useState<Record<number, boolean>>({});
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    overview: useRef<HTMLElement>(null),
    part0Orientation: useRef<HTMLElement>(null),
    part1Fundamentals: useRef<HTMLElement>(null),
    part2Requirements: useRef<HTMLElement>(null),
    masterIndex: useRef<HTMLElement>(null),
    architecture: useRef<HTMLElement>(null),
    roadmap: useRef<HTMLElement>(null),
    glossary: useRef<HTMLElement>(null),
    progression: useRef<HTMLElement>(null),
    prerequisiteMatrix: useRef<HTMLElement>(null),
    toolsEcosystem: useRef<HTMLElement>(null),
    capstone: useRef<HTMLElement>(null),
    simExercises: useRef<HTMLElement>(null),
    labSafety: useRef<HTMLElement>(null),
    reviewGates: useRef<HTMLElement>(null),
    readinessChecklist: useRef<HTMLElement>(null)
  };

  // Scroll active section tracker + reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Active section tracking
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
      // Reading progress (0–100)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
      setReadingProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const togglePartExpansion = (index: number) => {
    setExpandedParts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    HANDBOOK_PARTS.forEach((_, idx) => { all[idx] = true; });
    setExpandedParts(all);
    setOpenPartSections({ part0Orientation: true, part1Fundamentals: true, part2Requirements: true });
  };

  const collapseAll = () => {
    setExpandedParts({});
    setOpenPartSections({ part0Orientation: false, part1Fundamentals: false, part2Requirements: false });
  };

  const expandAllCards = expandAll;
  const collapseAllCards = collapseAll;

  const togglePartSection = (key: string) => {
    setOpenPartSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleGlossary = (index: number) => {
    setExpandedGlossary(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderAppMetrics = (voltage: number, capacity: number, continuousC: number, peakC: number, cooling: string, secondLife: string) => {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>Operating Voltage</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{voltage} V</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (voltage / 850) * 100)}%`, height: "100%", background: "var(--accent-primary)" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>Energy Capacity</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{capacity} Ah</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (capacity / 1200) * 100)}%`, height: "100%", background: "#38bdf8" }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>Continuous / Peak Discharge</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{continuousC}C / {peakC}C</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (peakC / 10) * 100)}%`, height: "100%", background: "#a855f7" }} />
            </div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            <div style={{ marginBottom: "2px" }}>Cooling Class: <span style={{ color: "#fff", fontWeight: 600 }}>{cooling}</span></div>
            <div>Second-Life Feasibility: <span style={{ color: "#fff", fontWeight: 600 }}>{secondLife}</span></div>
          </div>
        </div>
      </div>
    );
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

  // GA4: page_view with content_group
  useEffect(() => {
    trackEvent("page_view", {
      page_path: "/internships/battery-pack-design",
      page_title: "EV Battery Pack Design Handbook",
      page_location: typeof window !== "undefined" ? window.location.href : "",
      content_group: "EV Battery Pack Design Handbook",
    });
  }, []);

  // GA4: scroll depth milestones (25 / 50 / 75 / 100)
  useEffect(() => {
    const fired = { 25: false, 50: false, 75: false, 100: false };
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      ([25, 50, 75, 100] as const).forEach((depth) => {
        if (!fired[depth] && pct >= depth) {
          fired[depth] = true;
          trackEvent(`scroll_${depth}`, {
            page_path: "/internships/battery-pack-design",
            page_title: "EV Battery Pack Design Handbook",
            content_type: "handbook",
          });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (sectionKey: keyof typeof sectionRefs) => {
    let targetLayer: "handbook" | "learning" | "projects" | "certification" = "handbook";
    if (["progression", "prerequisiteMatrix"].includes(sectionKey)) {
      targetLayer = "learning";
    } else if (["toolsEcosystem", "capstone", "simExercises"].includes(sectionKey)) {
      targetLayer = "projects";
    } else if (["labSafety", "reviewGates", "readinessChecklist"].includes(sectionKey)) {
      targetLayer = "certification";
    }

    setActiveLayer(targetLayer);
    setMobileMenuOpen(false);

    setTimeout(() => {
      const element = sectionRefs[sectionKey].current;
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 80,
          behavior: "smooth"
        });
        setActiveSection(sectionKey);
      }
    }, 60);
  };

  return (
    <div style={{ backgroundColor: "var(--bg-dark)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ─── READING PROGRESS BAR ─── */}
      <div
        className={styles.readingProgressBar}
        style={{ width: `${readingProgress}%` }}
        aria-hidden="true"
      />

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

            <div className={styles.mobileLayerSelector}>
              {[
                { id: "handbook", label: "Handbook" },
                { id: "learning", label: "Learning" },
                { id: "projects", label: "Projects" },
                { id: "certification", label: "Gates & Safety" }
              ].map((l) => (
                <button
                  key={l.id}
                  className={activeLayer === l.id ? styles.mobileLayerTabActive : styles.mobileLayerTab}
                  onClick={() => setActiveLayer(l.id as any)}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className={styles.navTree}>
              {activeLayer === "handbook" && (
                <>
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
                      className={activeSection === "part0Orientation" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("part0Orientation")}
                    >
                      Part 0: Orientation
                    </button>
                  </div>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "part1Fundamentals" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("part1Fundamentals")}
                    >
                      Part 1: Fundamentals
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
                      className={activeSection === "roadmap" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("roadmap")}
                    >
                      Future Roadmap
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
                                setActiveLayer("handbook");
                                setMobileMenuOpen(false);
                                setTimeout(() => {
                                  const el = document.getElementById(`part-${partIdx}`);
                                  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                                }, 60);
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
                                  setActiveLayer("handbook");
                                  setMobileMenuOpen(false);
                                  setTimeout(() => {
                                    const el = document.getElementById(sub.anchor);
                                    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                                  }, 60);
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
                </>
              )}

              {activeLayer === "learning" && (
                <>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "progression" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("progression")}
                    >
                      Career Progression Path
                    </button>
                  </div>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "prerequisiteMatrix" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("prerequisiteMatrix")}
                    >
                      Prerequisite Matrix
                    </button>
                  </div>
                </>
              )}

              {activeLayer === "projects" && (
                <>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "toolsEcosystem" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("toolsEcosystem")}
                    >
                      Tools Ecosystem
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
                      className={activeSection === "simExercises" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("simExercises")}
                    >
                      Simulation Exercises
                    </button>
                  </div>
                </>
              )}

              {activeLayer === "certification" && (
                <>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "labSafety" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("labSafety")}
                    >
                      HV Lab Safety Protocols
                    </button>
                  </div>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "reviewGates" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("reviewGates")}
                    >
                      Engineering Review Gates
                    </button>
                  </div>
                  <div className={styles.navGroup}>
                    <button 
                      className={activeSection === "readinessChecklist" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                      onClick={() => scrollTo("readinessChecklist")}
                    >
                      Readiness Checklist
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── FLOATING SIDEBAR TOGGLE (always visible while scrolling, desktop only) ─── */}
      <button
        className={styles.sidebarFloatingToggle}
        onClick={() => setSidebarHidden(!sidebarHidden)}
        title={sidebarHidden ? "Show Index" : "Hide Index"}
      >
        {sidebarHidden ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
      </button>

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
            {activeLayer === "handbook" && (
              <>
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
                    className={activeSection === "part0Orientation" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("part0Orientation")}
                  >
                    Part 0: Orientation
                  </button>
                </div>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "part1Fundamentals" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("part1Fundamentals")}
                  >
                    Part 1: Fundamentals
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
                    className={activeSection === "roadmap" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("roadmap")}
                  >
                    Future Roadmap
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
                              setActiveLayer("handbook");
                              setTimeout(() => {
                                const el = document.getElementById(`part-${partIdx}`);
                                if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                              }, 60);
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
                                setActiveLayer("handbook");
                                setTimeout(() => {
                                  const el = document.getElementById(sub.anchor);
                                  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                                }, 60);
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
              </>
            )}

            {activeLayer === "learning" && (
              <>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "progression" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("progression")}
                  >
                    Career Progression Path
                  </button>
                </div>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "prerequisiteMatrix" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("prerequisiteMatrix")}
                  >
                    Prerequisite Matrix
                  </button>
                </div>
              </>
            )}

            {activeLayer === "projects" && (
              <>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "toolsEcosystem" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("toolsEcosystem")}
                  >
                    Tools Ecosystem
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
                    className={activeSection === "simExercises" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("simExercises")}
                  >
                    Simulation Exercises
                  </button>
                </div>
              </>
            )}

            {activeLayer === "certification" && (
              <>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "labSafety" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("labSafety")}
                  >
                    HV Lab Safety Protocols
                  </button>
                </div>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "reviewGates" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("reviewGates")}
                  >
                    Engineering Review Gates
                  </button>
                </div>
                <div className={styles.navGroup}>
                  <button 
                    className={activeSection === "readinessChecklist" ? styles.navGroupHeaderActive : styles.navGroupHeader}
                    onClick={() => scrollTo("readinessChecklist")}
                  >
                    Readiness Checklist
                  </button>
                </div>
              </>
            )}
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
                <button className="btn btn-primary" onClick={() => scrollTo("overview")}
                  data-track-event="start_handbook_click"
                  data-track-content-type="handbook"
                  data-track-section-id="hero">Explore Handbook</button>
                <button className="btn btn-secondary" onClick={() => scrollTo("progression")}
                  data-track-event="view_learning_path_click"
                  data-track-content-type="learning_path"
                  data-track-section-id="hero">View Learning Path</button>
                <button className="btn btn-secondary" style={{ background: "var(--glass-bg)" }} onClick={() => scrollTo("masterIndex")}
                  data-track-event="start_handbook_click"
                  data-track-content-type="handbook"
                  data-track-section-id="hero">Start with Fundamentals</button>
              </div>
            </div>
          </section>

          {/* ─── ARCHITECT PROFILE CARD ─── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            padding: "1rem 1.5rem",
            background: "rgba(6, 40, 28, 0.45)",
            border: "1px solid rgba(0, 245, 160, 0.1)",
            borderLeft: "4px solid var(--accent-primary)",
            borderRadius: "var(--radius-lg)",
            backdropFilter: "blur(12px)",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}>
            {/* Avatar initials */}
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(76,169,48,0.3), rgba(56,189,248,0.2))",
              border: "2px solid rgba(76,169,48,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--accent-primary)",
              flexShrink: 0,
              letterSpacing: "-0.02em",
            }}>SK</div>

            {/* Name + title */}
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-primary)", marginBottom: "2px" }}>
                EV.ENGINEER™
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                Sudarshana Karkala
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Co-Founder, Principal Architect | Thasmai Infotech Private Limited
              </div>
            </div>

            {/* Availability + contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
              <div style={{
                fontSize: "0.72rem",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(76, 169, 48, 0.08)",
                border: "1px solid rgba(76, 169, 48, 0.25)",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
              }}>
                Available for consulting & R&D partnerships
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <a
                  href="tel:+919845561518"
                  style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}
                >
                  <span>📞</span> +91 9845561518
                </a>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <a
                  href="https://www.linkedin.com/in/sudarshanakarkala/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}
                  data-track-event="linkedin_profile_click"
                  data-track-section-id="hero-architect-card"
                >
                  <span>🔗</span> LinkedIn Profile
                </a>
              </div>
            </div>
          </div>

          {/* ─── CONTENT STATUS BLOCK ─── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            background: "rgba(6, 20, 40, 0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "1.25rem",
          }}>
            <div>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-primary)", marginBottom: "6px" }}>Available Now</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-primary)", display: "inline-block", flexShrink: 0 }} />
                  Part 0 — Handbook Orientation
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-primary)", display: "inline-block", flexShrink: 0 }} />
                  Part 1 — Battery Fundamentals
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-primary)", display: "inline-block", flexShrink: 0 }} />
                  Part 2 — Requirements & System Definition
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#eab308", marginBottom: "6px" }}>Draft in Progress</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308", display: "inline-block", flexShrink: 0 }} />
                  Part 3 — Cell Chemistry and Selection
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "6px" }}>Planned Next</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Part 4 onwards — Electrical Design, BMS Hardware, BMS Software, Thermal, Mechanical, Safety, Standards, AI, Cloud, Cybersecurity, Second-Life, Architectures, Reference Design, and Capstone.
              </div>
            </div>
          </div>

          {/* BREADCRUMB LIST */}
          <div className={styles.breadcrumbs} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                className={styles.sidebarOpenBtn} 
                onClick={() => setSidebarHidden(!sidebarHidden)}
                title={sidebarHidden ? "Expand Index" : "Collapse Index"}
                style={{ marginRight: "12px" }}
              >
                {sidebarHidden
                  ? <><PanelLeft size={14} /> Show Index</>
                  : <><PanelLeftClose size={14} /> Hide Index</>
                }
              </button>
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

            {/* Expand / Collapse All toolbar */}
            <div className={styles.expandCollapseBar}>
              <button className={styles.expandCollapseBtn} onClick={expandAll}>
                <ChevronDown size={13} /> Expand All
              </button>
              <button className={styles.expandCollapseBtn} onClick={collapseAll}>
                <ChevronRight size={13} /> Collapse All
              </button>
              <span className={styles.expandCollapseCount}>
                {Object.values(expandedParts).filter(Boolean).length} / {filteredParts.length} cards expanded
              </span>
            </div>

            {filteredParts.length === 0 ? (
              <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No parts match your filter query.
                <button className="btn btn-secondary" style={{ marginTop: "1rem", display: "block", margin: "1rem auto 0" }} onClick={() => setSearchTerm("")}>Clear Search</button>
              </div>
            ) : (
              <div className={styles.masterIndexGrid}>
                {filteredParts.map((part) => {
                  const partIdx = HANDBOOK_PARTS.findIndex(p => p.num === part.num);
                  const isExpanded = !!expandedParts[partIdx];
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
                      </div>

                      {/* Collapsed summary row — always visible */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>⏱ {part.duration}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>📶 {part.difficulty}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>⚙ {part.prerequisites !== "None" ? `Needs: ${part.prerequisites}` : "No prerequisites"}</span>
                        <button
                          className={styles.indexCardToggleBtn}
                          style={{ marginLeft: "auto" }}
                          onClick={() => togglePartExpansion(partIdx)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? <><ChevronDown size={12} /> Hide details</> : <><ChevronRight size={12} /> Show details</>}
                        </button>
                      </div>

                      {/* Expanded detail — accordion */}
                      {isExpanded && (
                        <>
                          <div className={styles.indexCardSubsections} style={{ marginTop: "0.85rem" }}>
                            <div className={styles.subsectionsTitle}>Chapters & Subsections</div>
                            <div className={styles.subsectionsList}>
                              {part.subsections.map((sub, sIdx) => (
                                <div key={sIdx} className={styles.subsectionItem} id={`idx-${sub.anchor}`}>
                                  <span className={styles.subsectionAnchor}>{sub.anchor.replace("part-", "P")}</span>
                                  <span className={styles.subsectionText}>{sub.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {part.skillsGained.length > 0 && (
                            <div style={{ marginTop: "0.75rem" }}>
                              <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.04em", marginBottom: "0.4rem" }}>Skills Gained</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {part.skillsGained.map((skill, si) => (
                                  <span key={si} className={styles.pathwayFocusTag}>{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={styles.indexCardFooter} style={{ marginTop: "1rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{part.futureRelevance}</span>
                            {partIdx <= 2 ? (
                              <a
                                href={`#part${partIdx === 0 ? "0Orientation" : partIdx === 1 ? "1Fundamentals" : "2Requirements"}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  scrollTo(partIdx === 0 ? "part0Orientation" : partIdx === 1 ? "part1Fundamentals" : "part2Requirements");
                                }}
                                style={{ color: "var(--accent-primary)", fontWeight: 700, textDecoration: "none", fontSize: "0.8rem", flexShrink: 0 }}
                              >
                                Read →
                              </a>
                            ) : null}
                          </div>
                        </>
                      )}
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
              <h2 className={styles.sectionTitle}>Capstone Project: EV Battery Pack Design</h2>
              <p className={styles.sectionSubtitle}>
                The capstone is structured as progressive deliverables. You don't need to complete all levels — each builds on the previous one at your own pace.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
              {/* Beginner Deliverable */}
              <div style={{ background: "rgba(76,169,48,0.06)", border: "1px solid rgba(76,169,48,0.25)", borderTop: "3px solid var(--accent-primary)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-primary)", marginBottom: "8px" }}>Beginner Deliverable</div>
                <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.75rem" }}>Requirements Sheet + Basic Sizing</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Your first milestone. Write a clear requirement document for your target pack and perform a basic cell sizing calculation.
                </p>
                <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.7 }}>
                  <li>Target voltage, capacity, and energy requirements document</li>
                  <li>Cell format selected with justification (NMC or LFP)</li>
                  <li>Series and parallel cell count calculation</li>
                  <li>Estimated pack weight and volume budget</li>
                </ul>
              </div>

              {/* Engineer Deliverable */}
              <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderTop: "3px solid #38bdf8", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#38bdf8", marginBottom: "8px" }}>Engineer Deliverable</div>
                <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.75rem" }}>Electrical + Thermal + BMS Concept</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Build on your beginner design with physical integration — how the cells connect, cool, and are monitored.
                </p>
                <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.7 }}>
                  <li>Electrical schematic: busbars, contactors, fuses (KiCad)</li>
                  <li>Thermal analysis: cooling layout and temperature margins</li>
                  <li>BMS hardware block diagram with sensing and balancing</li>
                  <li>SOC estimation approach documented (Coulomb counting or similar)</li>
                </ul>
              </div>

              {/* Architect Deliverable */}
              <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)", borderTop: "3px solid #a855f7", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a855f7", marginBottom: "8px" }}>Architect Deliverable</div>
                <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.75rem" }}>Safety + Telemetry + Cybersecurity + Second-Life</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  The full system submission covering safety compliance, cloud telemetry, security, and end-of-life planning.
                </p>
                <ul style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.7 }}>
                  <li>Safety compliance checklist (UN 38.3, ECE R100, ISO 26262)</li>
                  <li>Cloud telemetry dashboard showing live pack data (Grafana)</li>
                  <li>Basic cybersecurity threat model for the BMS communication network</li>
                  <li>Second-life plan: at what health level would you retire this pack and for what use?</li>
                </ul>
              </div>
            </div>

            <CapstoneOutput>
              <h4 style={{ color: "#10b981", fontSize: "1rem", marginBottom: "0.5rem" }}>Jury Evaluation</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 0 }}>
                Submissions are scored on: technical accuracy (40%), design completeness (30%), safety analysis depth (20%), and presentation clarity (10%). Submit as a GitHub repository with a structured README. Beginners submit the first deliverable only — engineers and architects build on top.
              </p>
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

          {/* ─── GLOBAL EXPAND / COLLAPSE ALL ─── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            padding: "1rem 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "1.5rem"
          }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                Handbook Sections
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "0.75rem" }}>
                {Object.values(openPartSections).filter(Boolean).length} / {Object.keys(openPartSections).length} open
              </span>
            </div>
            <div className={styles.expandCollapseBar} style={{ margin: 0 }}>
              <button className={styles.expandCollapseBtn} onClick={expandAll}
                data-track-event="expand_all_sections"
                data-track-content-type="handbook">
                <ChevronDown size={13} /> Expand All
              </button>
              <button className={styles.expandCollapseBtn} onClick={collapseAll}
                data-track-event="collapse_all_sections"
                data-track-content-type="handbook">
                <ChevronRight size={13} /> Collapse All
              </button>
            </div>
          </div>

          {/* ═══ PART 0: HANDBOOK ORIENTATION ═══ */}
          <section id="part0Orientation" className={styles.pageSection} ref={sectionRefs.part0Orientation}>
            <div className={styles.sectionHeader}>
              <button
                className={styles.partSectionAccordionHeader}
                onClick={() => togglePartSection("part0Orientation")}
                aria-expanded={openPartSections.part0Orientation}
              >
                <div>
                  <span className={styles.sectionLabel}>Core Module · Beginner · 1.5 Hrs</span>
                  <h2 className={styles.sectionTitle}>Part 0 — Handbook Orientation</h2>
                  <p className={styles.sectionSubtitle}>
                    Prepare psychologically, technically, and architecturally before entering EV battery systems design.
                  </p>
                </div>
                <span className={styles.partSectionToggleBtn} aria-hidden="true">
                  {openPartSections.part0Orientation
                    ? <><ChevronDown size={14} /> Collapse</>
                    : <><ChevronRight size={14} /> Expand</>}
                </span>
              </button>
            </div>

            {openPartSections.part0Orientation && <div className={styles.chapterBox}>
              <div className={styles.chapterTitle}>Part 0: Handbook Orientation Reader</div>

              {/* 0.1 Welcome to EV Battery Pack Engineering */}
              <div id="part-0-1" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.1 Welcome to EV Battery Pack Engineering</h3>
                  <span className={styles.orientationAnchorBadge}>P0.1</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  EV battery pack design is the ultimate multidisciplinary engineering challenge in modern clean energy transition. The battery pack is not merely an electrical storage vessel; it represents the vehicle's structural core, its most critical thermal management challenge, its largest mass element, and its most complex control system loop.
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Traction battery systems represent the convergence of electrochemistry, mechanical design, thermodynamics, embedded firmware control, wireless cloud communications, predictive artificial intelligence, and rigorous physical safety parameters. Designing a pack requires understanding how cell chemistry reacts under thermal load, how mechanical frames disperse crash forces, how BMS circuits sense high voltages, and how cloud diagnostics anticipate cell failures.
                </p>
                <ArchitectInsight>
                  <strong>2026–2030 Battery Architect Scope:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    The ecosystem has moved beyond isolated systems. A unified battery design must integrate telemetry to feed digital twin diagnostics, implement secure onboard communication (SecOC) to protect against cyber attacks, and plan for safe disassembly and direct reuse in second-life grid stabilization schemes. These architect-level concerns span Parts 11–18.
                  </p>
                </ArchitectInsight>
                
                <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.75rem", fontWeight: 700 }}>Unified Battery Systems Lifecycle</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem" }}>
                  The roadmap below maps the flow of cells from raw electrochemistry to secondary applications:
                </p>

                <div className={styles.pipelineContainer}>
                  <div className={styles.pipelineNode}>
                    <span className={styles.pipelineNodePart}>Stage 01</span>
                    <span className={styles.pipelineNodeTitle}>Cell Selection</span>
                    <span className={styles.pipelineNodeFocus}>Auditing format limits (4680, prismatic) and chemistry bounds (NMC, LFP).</span>
                  </div>
                  <div className={styles.pipelineConnector}>
                    <div className={styles.pipelineConnectorLine} style={{ backgroundColor: "var(--accent-primary)" }} />
                    <div className={styles.pipelineConnectorArrow} style={{ borderLeftColor: "var(--accent-primary)" }} />
                  </div>
                  <div className={styles.pipelineNode}>
                    <span className={styles.pipelineNodePart}>Stage 02</span>
                    <span className={styles.pipelineNodeTitle}>Pack Design</span>
                    <span className={styles.pipelineNodeFocus}>Integrating busbars, structural compression, and liquid cooling channels.</span>
                  </div>
                  <div className={styles.pipelineConnector}>
                    <div className={styles.pipelineConnectorLine} style={{ backgroundColor: "var(--accent-primary)" }} />
                    <div className={styles.pipelineConnectorArrow} style={{ borderLeftColor: "var(--accent-primary)" }} />
                  </div>
                  <div className={styles.pipelineNode}>
                    <span className={styles.pipelineNodePart}>Stage 03</span>
                    <span className={styles.pipelineNodeTitle}>Edge BMS Control</span>
                    <span className={styles.pipelineNodeFocus}>Monitoring battery states and triggering automatic safety disconnects.</span>
                  </div>
                  <div className={styles.pipelineConnector}>
                    <div className={styles.pipelineConnectorLine} style={{ backgroundColor: "var(--accent-primary)" }} />
                    <div className={styles.pipelineConnectorArrow} style={{ borderLeftColor: "var(--accent-primary)" }} />
                  </div>
                  <div className={styles.pipelineNode}>
                    <span className={styles.pipelineNodePart}>Stage 04</span>
                    <span className={styles.pipelineNodeTitle}>Cloud Fleet IoT</span>
                    <span className={styles.pipelineNodeFocus}>Sending battery health data to the cloud securely and building performance dashboards.</span>
                  </div>
                  <div className={styles.pipelineConnector}>
                    <div className={styles.pipelineConnectorLine} style={{ backgroundColor: "var(--accent-primary)" }} />
                    <div className={styles.pipelineConnectorArrow} style={{ borderLeftColor: "var(--accent-primary)" }} />
                  </div>
                  <div className={styles.pipelineNode}>
                    <span className={styles.pipelineNodePart}>Stage 05</span>
                    <span className={styles.pipelineNodeTitle}>Second-Life Reuse</span>
                    <span className={styles.pipelineNodeFocus}>Health-testing retired packs, grading modules for reuse, and deploying in grid energy storage.</span>
                  </div>
                </div>
              </div>

              {/* 0.2 Who Should Read This Handbook */}
              <div id="part-0-2" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.2 Who Should Read This Handbook</h3>
                  <span className={styles.orientationAnchorBadge}>P0.2</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  This handbook is engineered as a multi-domain curriculum. Choose your discipline below to locate your primary learning paths and expected outcomes:
                </p>

                <div className={styles.orientationAudienceGrid}>
                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🎓</span>
                      <span className={styles.audienceCardTitle}>Students</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>HV isolation bounds, standard sizing math, and thermal containment models.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>Core Basics (Parts 1–5, 9).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Entry-ready automotive junior engineer capabilities.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🚗</span>
                      <span className={styles.audienceCardTitle}>EV Engineers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Traction pack packaging density, C-rate loading profiles, and safety compliance.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>System Integration (Parts 1–10).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Perform end-to-end pack sizing to WLTP drive profiles.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>📟</span>
                      <span className={styles.audienceCardTitle}>Embedded Engineers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>AFE SPI interfaces, real-time safety kernels, and ADC sensor calibrations.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>BMS Hardware & Software (Parts 5–6).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Program Kalman observers and cell balancing firmware.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>⚙️</span>
                      <span className={styles.audienceCardTitle}>Mechanical Engineers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Cell swelling containment, crash energy deflection, and shock absorber layouts.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>Mechanical & Structural (Parts 7–9).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Model battery enclosure stress and thermal propagation barriers.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🔋</span>
                      <span className={styles.audienceCardTitle}>Battery Pack Designers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Cell-to-Pack configurations, busbar weld resistances, and insulation creepage bounds.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>HV Design & Packaging (Parts 4, 8, 9).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Design 800V class low-impedance electrical pack skeletons.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🛡️</span>
                      <span className={styles.audienceCardTitle}>BMS Developers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>State machines, CAN-FD timing maps, and ISO 26262 diagnostic codes.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>ASIL Safety Systems (Parts 5, 6, 10).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Architect functional safety checks to meet ASIL-D standards.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🧠</span>
                      <span className={styles.audienceCardTitle}>AI Engineers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Neural network degradation modeling, charge curve feature analysis, and anomaly tracking.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>Data Intelligence (Parts 11–13).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Train predictive models predicting cell SOH under dynamic aging stress.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>☁️</span>
                      <span className={styles.audienceCardTitle}>Cloud Engineers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>MQTT telemetry brokers, time-series streaming databases, and SecOC encryption.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>IoT Telematics (Parts 13, 14).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Build low-latency pipelines ingest 100Hz pack telemetry packets.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🏛️</span>
                      <span className={styles.audienceCardTitle}>EV Architects</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Structural chassis integration, weight budgets, charging architectures, and cost.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>Complete Handbook Index.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Formulate architectural constraints for next-gen vehicle lines.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🚀</span>
                      <span className={styles.audienceCardTitle}>Startup Founders</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Cell supply parameters, cost curves, solid-state roadmap, and standard testing.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>System Overview & Standards.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Optimize cell selection to match price-to-performance vehicle goals.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🔬</span>
                      <span className={styles.audienceCardTitle}>Researchers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Anode silicon limits, SEI growth dynamics under heat, and EIS sweep analysis.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>Chemistry & Testing (Parts 1–3, 11).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Apply materials-level discoveries directly to vehicle pack structures.</span>
                    </div>
                  </div>

                  <div className={styles.orientationAudienceCard}>
                    <div className={styles.audienceCardHeader}>
                      <span className={styles.audienceCardIcon}>🔧</span>
                      <span className={styles.audienceCardTitle}>Service Engineers</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>What you will learn</span>
                      <span className={styles.audienceCardVal}>Pack safety discharge, insulation tracking tests, and replacement rules.</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Recommended Depth</span>
                      <span className={styles.audienceCardVal}>Safety & Diagnostics (Parts 9, 11, 15).</span>
                    </div>
                    <div className={styles.audienceCardSection}>
                      <span className={styles.audienceCardLabel}>Expected Outcome</span>
                      <span className={styles.audienceCardVal}>Safely open, diagnose, repair, and balance high-voltage battery modules.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 0.3 Beginner → Engineer → Architect Learning Path */}
              <div id="part-0-3" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.3 Beginner → Engineer → Architect Learning Path</h3>
                  <span className={styles.orientationAnchorBadge}>P0.3</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  This progression roadmap displays the career transition from basic cell sizing math to leading digital battery architectures:
                </p>

                <div className={styles.roadmapTimeline}>
                  <div className={styles.roadmapStep}>
                    <div className={styles.roadmapStepActive}>1</div>
                    <div className={styles.roadmapStepContent}>
                      <div className={styles.roadmapStepTitle}>Beginner (Cell-Level Basics)</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                        Focuses on cell chemistry fundamentals, electrochemistry limits, and standard cell format datasheets.
                      </p>
                      <div className={styles.roadmapStepGrid}>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Skills learned</span>
                          <span style={{ color: "var(--text-primary)" }}>Energy calculations, C-rate sizing, format sorting.</span>
                        </div>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Tools used</span>
                          <span style={{ color: "var(--text-primary)" }}>Python spreadsheets, cell database auditors.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.roadmapStep}>
                    <div className={styles.roadmapStepActive}>2</div>
                    <div className={styles.roadmapStepContent}>
                      <div className={styles.roadmapStepTitle}>Engineer (Physical Integration Designer)</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                        Focuses on physical and mechanical configuration: integrating electrical circuits, custom cooling loops, and high-voltage isolation layout barriers.
                      </p>
                      <div className={styles.roadmapStepGrid}>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Skills learned</span>
                          <span style={{ color: "var(--text-primary)" }}>CAD enclosures, busbar sizing, CFD thermal modeling.</span>
                        </div>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Tools used</span>
                          <span style={{ color: "var(--text-primary)" }}>SolidWorks, ANSYS Fluent, structural FEA simulators.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.roadmapStep}>
                    <div className={styles.roadmapStepActive}>3</div>
                    <div className={styles.roadmapStepContent}>
                      <div className={styles.roadmapStepTitle}>System Engineer (BMS Software & Control)</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                        Focuses on edge controls: developing high-precision BMS software algorithms, state of charge (SOC) observers, and real-time fault handlers.
                      </p>
                      <div className={styles.roadmapStepGrid}>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Skills learned</span>
                          <span style={{ color: "var(--text-primary)" }}>Kalman state filter design, SPI drivers, CAN communication frames.</span>
                        </div>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Tools used</span>
                          <span style={{ color: "var(--text-primary)" }}>MATLAB/Simulink, CANoe, C/C++ microcontrollers.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.roadmapStep}>
                    <div className={styles.roadmapStepActive}>4</div>
                    <div className={styles.roadmapStepTitle}>Battery Architect (Vehicle Platform Strategist)</div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                      Optimizes the global platform: balancing volumetric packing bounds, solid-state updates, and regulatory safety standards.
                    </p>
                    <div className={styles.roadmapStepGrid}>
                      <div className={styles.roadmapStepMeta}>
                        <span className={styles.audienceCardLabel}>Skills learned</span>
                        <span style={{ color: "var(--text-primary)" }}>Cell-to-Pack packaging, ISO 26262 functional safety, multi-pack architectures.</span>
                      </div>
                      <div className={styles.roadmapStepMeta}>
                        <span className={styles.audienceCardLabel}>Tools used</span>
                        <span style={{ color: "var(--text-primary)" }}>Systems safety modeling, multi-physics vehicle compilers.</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.roadmapStep}>
                    <div className={styles.roadmapStepActive}>5</div>
                    <div className={styles.roadmapStepContent}>
                      <div className={styles.roadmapStepTitle}>Battery Intelligence Architect (Connected Ecosystem Lead)</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                        Focuses on lifetime asset value: setting up high-frequency IoT streaming telemetry, digital twins, AI health prognostics, and second-life triage loops.
                      </p>
                      <div className={styles.roadmapStepGrid}>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Skills learned</span>
                          <span style={{ color: "var(--text-primary)" }}>Neural network degradation models, SecOC encryption, EIS triage analytics.</span>
                        </div>
                        <div className={styles.roadmapStepMeta}>
                          <span className={styles.audienceCardLabel}>Tools used</span>
                          <span style={{ color: "var(--text-primary)" }}>AWS/GCP IoT Core, TensorFlow/PyTorch, time-series data engines.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 0.4 How to Use This Handbook */}
              <div id="part-0-4" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.4 How to Use This Handbook</h3>
                  <span className={styles.orientationAnchorBadge}>P0.4</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  This handbook is structured sequentially. We suggest reading the parts in order as concepts compile directly on top of each other. Each part concludes with a hands-on practical assignment and builds toward one of the final Capstone Projects.
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  Pay close attention to the **Safety Warnings** and **Architect Insights** scattered throughout the text. These contain critical real-world lessons from engineers who have built validation laboratories and certified production-line EV packs.
                </p>

                <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "1rem", fontWeight: 700 }}>Chapter Dependency Progression</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Row 1 */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                    {["Part 1: Fundamentals", "Part 2: Requirements", "Part 3: Cell Selection"].map((label, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ background: "rgba(76,169,48,0.12)", border: "1px solid rgba(76,169,48,0.3)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
                        {i < arr.length - 1 && <span style={{ color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 700 }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Connector down */}
                  <div style={{ paddingLeft: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "rgba(76,169,48,0.4)", fontSize: "0.7rem" }}>└──</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>flows into ↓</span>
                  </div>
                  {/* Row 2 */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                    {["Part 4: Electrical Design", "Part 5: BMS Hardware", "Part 6: BMS Software"].map((label, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "#38bdf8", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
                        {i < arr.length - 1 && <span style={{ color: "#38bdf8", fontSize: "0.75rem", fontWeight: 700 }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Connector down */}
                  <div style={{ paddingLeft: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "rgba(56,189,248,0.4)", fontSize: "0.7rem" }}>└──</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>flows into ↓</span>
                  </div>
                  {/* Row 3 */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                    {["Part 7: Thermal Systems", "Part 8: Mechanical Design", "Part 9: Safety Engineering"].map((label, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "#ef4444", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
                        {i < arr.length - 1 && <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Connector down */}
                  <div style={{ paddingLeft: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "rgba(239,68,68,0.4)", fontSize: "0.7rem" }}>└──</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>flows into ↓</span>
                  </div>
                  {/* Row 4 */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                    {["Part 10: Standards", "Part 11/12: AI & Diagnostics", "Part 13: Cloud Telemetry"].map((label, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "#a855f7", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
                        {i < arr.length - 1 && <span style={{ color: "#a855f7", fontSize: "0.75rem", fontWeight: 700 }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Connector down */}
                  <div style={{ paddingLeft: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "rgba(168,85,247,0.4)", fontSize: "0.7rem" }}>└──</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>flows into ↓</span>
                  </div>
                  {/* Row 5 */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                    {["Part 14: Cybersecurity", "Part 15: Second-Life", "Part 16: Modern Architectures"].map((label, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "#eab308", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
                        {i < arr.length - 1 && <span style={{ color: "#eab308", fontSize: "0.75rem", fontWeight: 700 }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* 0.5 Engineering Philosophy of This Handbook */}
              <div id="part-0-5" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.5 Engineering Philosophy of This Handbook</h3>
                  <span className={styles.orientationAnchorBadge}>P0.5</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  EV battery engineering requires a unique philosophical approach. We adhere to ten core engineering principles that guide the architecture of all systems:
                </p>

                <div className={styles.philosophyInfographic}>
                  <div className={styles.philosophyNode}>
                    <div className={styles.philosophyNodeHeader}>
                      <span style={{ color: "var(--accent-primary)" }}>🛡️</span>
                      <span>Systems Thinking First</span>
                    </div>
                    <p className={styles.philosophyNodeText}>
                      Never select a cell, design a busbar, or build a BMS software filter in isolation. A chemistry swap modifies cooling layout, busbar weld mass, enclosure sizing, and sensor requirements.
                    </p>
                  </div>

                  <div className={styles.philosophyNode}>
                    <div className={styles.philosophyNodeHeader}>
                      <span style={{ color: "var(--accent-primary)" }}>🔥</span>
                      <span>Safety-First (Passive Containment)</span>
                    </div>
                    <p className={styles.philosophyNodeText}>
                      Design on the assumption that cells will fail. Ensure high-density packs integrate propagation barriers so a single cell thermal runaway cannot propagate to its neighbors.
                    </p>
                  </div>

                  <div className={styles.philosophyNode}>
                    <div className={styles.philosophyNodeHeader}>
                      <span style={{ color: "var(--accent-primary)" }}>🛠️</span>
                      <span>Design for Reliability & Serviceability</span>
                    </div>
                    <p className={styles.philosophyNodeText}>
                      Design the system for modular repair. Serviceable contactors, removable module lids, and standard structural access reduce full pack replacement costs.
                    </p>
                  </div>

                  <div className={styles.philosophyNode}>
                    <div className={styles.philosophyNodeHeader}>
                      <span style={{ color: "var(--accent-primary)" }}>📐</span>
                      <span>Design for Manufacturability (DFM)</span>
                    </div>
                    <p className={styles.philosophyNodeText}>
                      Optimize for assembly. Standardize busbar laser-welding access, minimize wire harnesses via smart modules, and reduce screw counts to enable automated robotic assembly.
                    </p>
                  </div>

                  <div className={styles.philosophyNode}>
                    <div className={styles.philosophyNodeHeader}>
                      <span style={{ color: "var(--accent-primary)" }}>📊</span>
                      <span>Diagnostics-First Architecture</span>
                    </div>
                    <p className={styles.philosophyNodeText}>
                      If a state cannot be measured or estimated, it cannot be safely controlled. Build high-fidelity voltage/current sensing loops and robust state estimation routines.
                    </p>
                  </div>

                  <div className={styles.philosophyNode}>
                    <div className={styles.philosophyNodeHeader}>
                      <span style={{ color: "var(--accent-primary)" }}>♻️</span>
                      <span>Second-Life Sustainability</span>
                    </div>
                    <p className={styles.philosophyNodeText}>
                      Traction packs should be planned for secondary stationary storage triage. Simple module sorting and standard EIS diagnostic pathways ensure batteries avoid premature recycling.
                    </p>
                  </div>
                </div>
              </div>

              {/* 0.6 The Evolution of EV Battery Systems (2026–2030) */}
              <div id="part-0-6" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.6 The Evolution of EV Battery Systems (2026–2030)</h3>
                  <span className={styles.orientationAnchorBadge}>P0.6</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Battery systems are transitioning from passive physical components to intelligent, software-defined systems. The roadmap below outlines key milestones in the field:
                </p>

                <div className={styles.evolutionTimeline}>
                  <div className={styles.evolutionCard}>
                    <span className={styles.evolutionYear}>2026</span>
                    <div className={styles.evolutionTitle}>Software-Defined Packs</div>
                    <ul className={styles.evolutionList}>
                      <li>• Dynamic parameter tuning based on charging temperature history.</li>
                      <li>• High-fidelity digital twin tracking on cloud-connected fleets.</li>
                      <li>• LFP chemistry scaling for standard passenger vehicle segments.</li>
                    </ul>
                  </div>

                  <div className={styles.evolutionCard}>
                    <span className={styles.evolutionYear}>2028</span>
                    <div className={styles.evolutionTitle}>Structural Integration</div>
                    <ul className={styles.evolutionList}>
                      <li>• Cell-to-Chassis (CTC) structural pack integration.</li>
                      <li>• Telemetry interfaces secured by post-quantum SecOC cryptography.</li>
                      <li>• Solid-electrolyte interface sensors for aging predictions.</li>
                    </ul>
                  </div>

                  <div className={styles.evolutionCard}>
                    <span className={styles.evolutionYear}>2030</span>
                    <div className={styles.evolutionTitle}>Autonomous Energy Systems</div>
                    <ul className={styles.evolutionList}>
                      <li>• Solid-state cell architectures scaling in premium EV lines.</li>
                      <li>• V2G energy trade orchestration based on battery age models.</li>
                      <li>• Standard battery passport identity profiles tracking modules.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 0.7 Safety Disclaimer */}
              <div id="part-0-7" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.7 Safety Disclaimer</h3>
                  <span className={styles.orientationAnchorBadge}>P0.7</span>
                </div>
                <SafetyWarning>
                  <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.5rem" }}>
                    CRITICAL HIGH-VOLTAGE & THERMAL WARNING:
                  </strong>
                  <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.85rem" }}>
                    The content inside this engineering handbook is for educational and training purposes only. EV battery packs contain high-voltage circuits (often 400V to 800V DC) capable of delivering fatal electrical shocks. In addition, active lithium cells present severe thermal runaway, explosion, and toxic gas release risks.
                  </p>
                  <p style={{ margin: "0.75rem 0 0 0", lineHeight: 1.5, fontSize: "0.85rem" }}>
                    Do not assemble, modify, or discharge high-voltage battery components without certified high-voltage isolation gear (PPE), dedicated safety isolation transformers, fire suppression systems, and qualified safety supervision. All designs must adhere strictly to local electrical standards (e.g. UL, ISO, SAE) and undergo complete laboratory certification.
                  </p>
                </SafetyWarning>
              </div>

              {/* 0.8 Final Learning Outcomes */}
              <div id="part-0-8" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.8 Final Learning Outcomes</h3>
                  <span className={styles.orientationAnchorBadge}>P0.8</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  By completing the modules in this handbook, you will acquire the following core engineering capabilities:
                </p>

                <div className={styles.outcomeGrid}>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Design and size EV battery packs for dynamic WLTP cycles</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Select optimal chemistry (NMC/LFP) and physical formats</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Develop custom BMS hardware sensing and balancing layouts</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Program real-time Kalman filters and SOC state estimators</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Architect liquid cooling circuits and heat dissipation sheets</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Conduct FMEA safety analysis and thermal runaway designs</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Build secure telemetry links using SecOC cryptographic keys</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Train neural network battery degradation estimators</span>
                  </div>
                  <div className={styles.outcomeCard}>
                    <span className={styles.outcomeCheck}>✓</span>
                    <span className={styles.outcomeText}>Build stationary energy storage systems from second-life triages</span>
                  </div>
                </div>
              </div>

              {/* 0.9 Capstone Projects Overview */}
              <div id="part-0-9" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.9 Capstone Projects Overview</h3>
                  <span className={styles.orientationAnchorBadge}>P0.9</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  To achieve certification, you will complete hands-on Capstone Projects. Select a path aligned with your discipline:
                </p>

                <div className={styles.capstoneGrid}>
                  <div className={styles.capstoneCard}>
                    <div className={styles.capstoneCardHeader}>
                      <span className={styles.capstoneCardTitle}>48V/100Ah LFP Pack Design</span>
                      <span className={styles.capstoneCardBadge} style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>Hardware</span>
                    </div>
                    <p className={styles.capstoneCardDesc}>
                      Model cell layouts, busbar weld resistances, structural module brackets, and cooling plate channels inside CAD. Deliver full fabrication documentation.
                    </p>
                  </div>

                  <div className={styles.capstoneCard}>
                    <div className={styles.capstoneCardHeader}>
                      <span className={styles.capstoneCardTitle}>BMS Kalman SOC Estimator</span>
                      <span className={styles.capstoneCardBadge} style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)" }}>Firmware</span>
                    </div>
                    <p className={styles.capstoneCardDesc}>
                      Write C/C++ observer firmware executing an Extended Kalman Filter (EKF) on an STM32 controller. Track SOC within 2% margin under dynamic drive loads.
                    </p>
                  </div>

                  <div className={styles.capstoneCard}>
                    <div className={styles.capstoneCardHeader}>
                      <span className={styles.capstoneCardTitle}>AI Fleet Aging Prognostics</span>
                      <span className={styles.capstoneCardBadge} style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.1)" }}>Data Science</span>
                    </div>
                    <p className={styles.capstoneCardDesc}>
                      Train neural network estimators in Python. Analyze dynamic telemetry data to forecast cell health degradation profiles and locate weak series cells.
                    </p>
                  </div>

                  <div className={styles.capstoneCard}>
                    <div className={styles.capstoneCardHeader}>
                      <span className={styles.capstoneCardTitle}>Second-Life Grid Storage Triage</span>
                      <span className={styles.capstoneCardBadge} style={{ color: "#eab308", background: "rgba(234, 179, 8, 0.1)" }}>Systems</span>
                    </div>
                    <p className={styles.capstoneCardDesc}>
                      Formulate automated scripts to parse electrochemical impedance spectroscopy (EIS) sweeps. Grade degraded packs for secondary energy storage installations.
                    </p>
                  </div>
                </div>
              </div>

              {/* 0.10 Navigation to Part 1 */}
              <div id="part-0-10" style={{ scrollMarginTop: "100px" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>0.10 Navigation to Part 1</h3>
                  <span className={styles.orientationAnchorBadge}>P0.10</span>
                </div>
                
                <div style={{ background: "rgba(76, 169, 48, 0.04)", border: "1px solid rgba(76, 169, 48, 0.15)", borderRadius: "var(--radius-lg)", padding: "2rem", marginTop: "1rem" }}>
                  <span className={styles.audienceCardLabel} style={{ color: "var(--accent-primary)", marginBottom: "0.25rem" }}>UP NEXT</span>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Part 1: Battery Fundamentals</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                    Dive into battery fundamentals. Understand how cells store and release energy, model basic equivalent circuits, and learn what happens inside a cell as it ages and heats up.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className={styles.audienceCardLabel}>Teaser Concept</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 700 }}>Butler-Volmer Equation</span>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "0.25rem" }}>
                        {"j = j_0 * [ exp(α_a F η / RT) - exp(-α_c F η / RT) ]"}
                      </span>
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className={styles.audienceCardLabel}>Simulation Preview</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 700 }}>Equivalent Series Circuit</span>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "0.25rem" }}>
                        {"V_cell = OCV - I*R_0 - V_rc1 - V_rc2"}
                      </span>
                    </div>
                  </div>

                  <a 
                    href="#part1Fundamentals" 
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo("part1Fundamentals");
                    }} 
                    className="btn btn-primary" 
                    style={{ textDecoration: "none", display: "inline-block" }}
                  >
                    Start Part 1: Battery Fundamentals →
                  </a>
                </div>
              </div>

              <div className={styles.chapterNav}>
                <div className={styles.chapterNavLink} style={{ opacity: 0.3, pointerEvents: "none" }}>
                  <span className={styles.chapterNavLabel}>Previous Part</span>
                  <span className={styles.chapterNavTitle}>None</span>
                </div>
                <div 
                  className={styles.chapterNavLink} 
                  style={{ alignItems: "flex-end", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("part1Fundamentals");
                  }}
                >
                  <span className={styles.chapterNavLabel}>Next Part</span>
                  <span className={styles.chapterNavTitle}>Part 1: Battery Fundamentals</span>
                </div>
              </div>

            </div>}
          </section>

          {/* ═══ PART 1: BATTERY FUNDAMENTALS ═══ */}
          <section id="part1Fundamentals" className={styles.pageSection} ref={sectionRefs.part1Fundamentals}>
            <div className={styles.sectionHeader}>
              <button
                className={styles.partSectionAccordionHeader}
                onClick={() => togglePartSection("part1Fundamentals")}
                aria-expanded={openPartSections.part1Fundamentals}
              >
                <div>
                  <span className={styles.sectionLabel}>Core Module · Beginner · 3.5 Hrs</span>
                  <h2 className={styles.sectionTitle}>Part 1 — Battery Fundamentals</h2>
                  <p className={styles.sectionSubtitle}>
                    Establish a deep electrochemical and electrical foundation for traction pack system engineering.
                  </p>
                </div>
                <span className={styles.partSectionToggleBtn} aria-hidden="true">
                  {openPartSections.part1Fundamentals
                    ? <><ChevronDown size={14} /> Collapse</>
                    : <><ChevronRight size={14} /> Expand</>}
                </span>
              </button>
            </div>

            {openPartSections.part1Fundamentals && <div className={styles.chapterBox}>
              <div className={styles.chapterTitle}>Part 1: Battery Fundamentals Reader</div>

              {/* 1.1 What Is a Battery? */}
              <div id="part-1-1" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.1 What Is a Battery?</h3>
                  <span className={styles.orientationAnchorBadge}>P1.1</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  At its core, a battery is an electrochemical energy storage device that converts chemical energy directly into electrical energy via reduction-oxidation (redox) reactions. During discharge, electrons are released through oxidation at the negative electrode (anode) and travel through an external electrical circuit to the positive electrode (cathode), where they drive reduction. At the same time, ions migrate internally through an ionic conductor (electrolyte) to balance the charge transfer.
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  In modern electric vehicles, the lithium-ion chemistry family dominates due to its superior gravimetric and volumetric energy densities. The charge and discharge cycles rely on <strong>intercalation</strong>—the insertion and extraction of lithium ions (<span style={{ fontFamily: "monospace" }}>Li⁺</span>) into the layered microstructures of the cathode and anode materials, rather than chemical phase changes.
                </p>

                {/* VISUAL DIAGRAM */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", margin: "1.5rem 0", padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ borderLeft: "3px solid #ef4444", paddingLeft: "12px" }}>
                    <h5 style={{ color: "#ef4444", margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 700 }}>1. Cathode (+)</h5>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Lithium transition metal oxides (e.g., NMC, LFP). Receptors of lithium ions during discharge, releasing electrons to the external circuit.
                    </p>
                  </div>
                  <div style={{ borderLeft: "3px solid #38bdf8", paddingLeft: "12px" }}>
                    <h5 style={{ color: "#38bdf8", margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 700 }}>2. Anode (-)</h5>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Graphite lattice structures or silicon composites. Stores intercalated lithium ions during charge, releasing them during discharge.
                    </p>
                  </div>
                  <div style={{ borderLeft: "3px solid #eab308", paddingLeft: "12px" }}>
                    <h5 style={{ color: "#eab308", margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 700 }}>3. Electrolyte</h5>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Liquid organic carbonates with dissolved LiPF₆ salt. Conducts lithium ions internally while blocking electron flow.
                    </p>
                  </div>
                  <div style={{ borderLeft: "3px solid #10b981", paddingLeft: "12px" }}>
                    <h5 style={{ color: "#10b981", margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 700 }}>4. Separator</h5>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Microporous polymeric membrane. Prevents physical contact (electrical shorting) while permitting ion transmission.
                    </p>
                  </div>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  A critical phenomenon in lithium-ion chemistry is the formation of the <strong>Solid Electrolyte Interphase (SEI)</strong> layer on the negative electrode. During the very first charge cycle (called the formation cycle), electrolyte solvent molecules react with lithium ions on the raw graphite surface, creating a passivation layer.
                </p>

                <EngineeringNote>
                  <strong>The Role & Lifecycle of the SEI Layer:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    The SEI layer is a double-edged sword. It consumes active lithium during formation (leading to a permanent initial capacity loss), but it acts as a crucial electronic barrier. By blocking electrons, it prevents continuous decomposition of the electrolyte, stabilizing the cell for thousands of cycles. However, mechanical swelling of graphite during charging and thermal excursions above 60°C can fracture the SEI. This exposes raw graphite, prompting fresh SEI formation, which consumes more active lithium, builds cell impedance, and eventually leads to thermal runaway.
                  </p>
                </EngineeringNote>
              </div>

              {/* 1.2 What Is an EV Battery Pack? */}
              <div id="part-1-2" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.2 What Is an EV Battery Pack?</h3>
                  <span className={styles.orientationAnchorBadge}>P1.2</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  A single battery cell typically provides between 3.2V and 4.2V nominal, with a capacity of 3Ah to 100Ah. Since an electric vehicle drivetrain requires high voltage (often 400V to 800V DC) and massive energy reserves (40kWh to over 100kWh), thousands of individual cells must be structured into a unified battery pack.
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  The physical integration utilizes a hierarchy to resolve electrical, mechanical, and safety constraints:
                </p>

                {/* HIERARCHY INTERACTIVE WIDGET */}
                <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "1rem", fontWeight: 700 }}>Interactive Hierarchy Navigator</h4>
                  
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {(["cell", "module", "pack", "system"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setActiveHierarchyLevel(level)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          borderRadius: "6px",
                          border: "none",
                          background: activeHierarchyLevel === level ? "var(--accent-primary)" : "transparent",
                          color: activeHierarchyLevel === level ? "var(--bg-dark)" : "var(--text-secondary)",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem", minHeight: "220px" }}>
                    {/* Visual mockup panel */}
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                      {activeHierarchyLevel === "cell" && (
                        <div style={{ width: "60px", height: "120px", borderRadius: "8px", border: "3px solid var(--accent-primary)", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                          <div style={{ width: "20px", height: "6px", background: "var(--accent-primary)", position: "absolute", top: "-9px", borderRadius: "2px" }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)" }}>CELL</span>
                          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "4px" }}>3.6V / 5Ah</span>
                        </div>
                      )}
                      {activeHierarchyLevel === "module" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                          <div style={{ border: "2px dashed rgba(255,255,255,0.2)", padding: "10px", borderRadius: "6px", display: "flex", justifyContent: "space-around" }}>
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} style={{ width: "22px", height: "45px", borderRadius: "3px", border: "2px solid var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem" }}>C</div>
                            ))}
                          </div>
                          <div style={{ height: "4px", background: "rgba(76, 169, 48, 0.4)", borderRadius: "2px" }} />
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>Connected via Copper Busbars</span>
                        </div>
                      )}
                      {activeHierarchyLevel === "pack" && (
                        <div style={{ width: "150px", height: "90px", border: "2px solid var(--accent-primary)", borderRadius: "8px", background: "rgba(76,169,48,0.05)", display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px", contentVisibility: "auto" }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: "1 1 40%", height: "28px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "3px", fontSize: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>MOD</div>
                          ))}
                        </div>
                      )}
                      {activeHierarchyLevel === "system" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ border: "1px solid var(--accent-primary)", padding: "6px", borderRadius: "4px", fontSize: "0.6rem" }}>BMS</div>
                          <div style={{ color: "var(--accent-primary)" }}>↔</div>
                          <div style={{ border: "2px solid #38bdf8", padding: "10px", borderRadius: "6px", fontSize: "0.7rem" }}>PACK</div>
                          <div style={{ color: "#38bdf8" }}>↔</div>
                          <div style={{ border: "1px solid #ef4444", padding: "6px", borderRadius: "4px", fontSize: "0.6rem" }}>INVERTER</div>
                        </div>
                      )}
                    </div>

                    {/* Details Panel */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      {activeHierarchyLevel === "cell" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>Cell Level (The Electrochemical Core)</h5>
                          <p style={{ margin: "0 0 10px 0", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            The basic chemical building block. Determines energy density limits, charge acceptance boundaries, and cell-level operating voltage envelopes.
                          </p>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)" }}><strong>Key Challenge:</strong> Preventing mechanical swelling, interior micro-shorts, and localized hot-spots.</span>
                        </>
                      )}
                      {activeHierarchyLevel === "module" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>Module Level (The Structural Assembly)</h5>
                          <p style={{ margin: "0 0 10px 0", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            A cluster of cells linked in series and parallel within a physical housing. Integrates voltage sensing taps, local thermal barrier sheets, and structural compression plates.
                          </p>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)" }}><strong>Key Challenge:</strong> Laser welding contact reliability and structural containment of cell expansions.</span>
                        </>
                      )}
                      {activeHierarchyLevel === "pack" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>Pack Level (The Electrical & Thermal System)</h5>
                          <p style={{ margin: "0 0 10px 0", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            The complete enclosure mounted to the chassis. Houses the BMS master unit, electrical contactors, high-voltage distribution lines, pyro-fuses, and main liquid cooling plates.
                          </p>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)" }}><strong>Key Challenge:</strong> Liquid leakage mitigation, seal ingress protection (IP67/IP69K), and high-voltage isolation.</span>
                        </>
                      )}
                      {activeHierarchyLevel === "system" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>Vehicle System Level (The Traction Grid)</h5>
                          <p style={{ margin: "0 0 10px 0", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            The integration of the battery pack with the vehicle's inverter, motor control loop, onboard charger, vehicle management unit, and cloud telematics system.
                          </p>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)" }}><strong>Key Challenge:</strong> EMI noise filtration, real-time current balancing, and secure vehicle network communication.</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ArchitectInsight>
                  <strong>Cell-to-Pack (CTP) & Cell-to-Chassis (CTC) Evolution:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    Traditional packs compile cells into modules, and modules into packs. While this provides repair serviceability at the module level, it incurs massive packaging weight penalties (frame components, wires, connectors). In the 2026–2030 vehicle lines, the industry is transitioning to <strong>Cell-to-Pack (CTP)</strong>, where structural cells are integrated directly into the pack case (eliminating modules entirely). To achieve extreme range targets, some developers utilize <strong>Cell-to-Chassis (CTC)</strong>, where the battery enclosure is the vehicle floor itself, saving up to 15% structural mass.
                  </p>
                </ArchitectInsight>
              </div>

              {/* 1.3 Voltage, Current, Power, and Energy */}
              <div id="part-1-3" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.3 Voltage, Current, Power, and Energy</h3>
                  <span className={styles.orientationAnchorBadge}>P1.3</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  To design a battery pack, an engineer must command the fundamental electrical properties that govern energy storage and performance. Sizing calculations must account for nominal ratings as well as transient physical realities.
                </p>

                {/* FORMULA BLOCKS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", margin: "1.5rem 0" }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem", borderRadius: "8px" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--accent-primary)", textTransform: "uppercase", fontWeight: 700 }}>Ohm's Law & Internal Resistance</span>
                    <div style={{ fontSize: "1.4rem", fontFamily: "monospace", color: "#fff", margin: "8px 0", fontWeight: 700 }}>
                      {"V_load = OCV - (I * R_internal)"}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      OCV represents the cell equilibrium voltage. Under loading current (<span style={{ fontFamily: "monospace" }}>I</span>), internal resistance (<span style={{ fontFamily: "monospace" }}>R_internal</span>) causes <strong>voltage sag</strong> during discharge or voltage rise during charging.
                    </p>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem", borderRadius: "8px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#38bdf8", textTransform: "uppercase", fontWeight: 700 }}>Joule Heating (Internal Losses)</span>
                    <div style={{ fontSize: "1.4rem", fontFamily: "monospace", color: "#fff", margin: "8px 0", fontWeight: 700 }}>
                      {"P_loss = I² * R_internal"}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      The power lost inside the cells and interconnects is dissipated as heat. Since losses scale with the square of the current, high-power packs must minimize current or design advanced thermal cooling.
                    </p>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem", borderRadius: "8px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#eab308", textTransform: "uppercase", fontWeight: 700 }}>Total Energy Capacity Sizing</span>
                    <div style={{ fontSize: "1.4rem", fontFamily: "monospace", color: "#fff", margin: "8px 0", fontWeight: 700 }}>
                      {"E(Wh) = V_nominal * C(Ah)"}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      The total stored energy is the product of the average operating voltage and the total usable charge capacity. Sizing maps directly to vehicle range parameters.
                    </p>
                  </div>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  A critical insight for vehicle architectures is the selection of system voltage class. Standard passenger EVs traditionally utilized 400V battery systems. By transition to **800V class architectures** at equivalent vehicle power requirements:
                </p>

                <div style={{ padding: "1rem", background: "rgba(56, 189, 248, 0.03)", border: "1px solid rgba(56, 189, 248, 0.15)", borderRadius: "8px", marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>800V ARCHITECTURAL ANALYSIS:</span>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    If power demand is 160 kW:
                    <br />
                    • At 400V: current required is <span style={{ fontFamily: "monospace" }}>160,000 / 400 = 400A</span>.
                    <br />
                    • At 800V: current required is <span style={{ fontFamily: "monospace" }}>160,000 / 800 = 200A</span>.
                    <br />
                    Since copper wire cross-section scales linearly with current, the 800V system uses thinner, lighter high-voltage cables. Moreover, since Joule heating scales as <span style={{ fontFamily: "monospace" }}>I² * R</span>, the internal electrical distribution losses are reduced by a factor of 4, enabling rapid fast-charging without excessive thermal load.
                  </p>
                </div>
              </div>

              {/* 1.4 Understanding Battery Capacity */}
              <div id="part-1-4" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.4 Understanding Battery Capacity</h3>
                  <span className={styles.orientationAnchorBadge}>P1.4</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Battery capacity represents the quantity of active charge that can be delivered by a cell or pack under specified operating conditions. It is measured in <strong>Ampere-hours (Ah)</strong>, denoting current times discharge duration. However, energy capacity—measured in <strong>Watt-hours (Wh)</strong> or <strong>Kilowatt-hours (kWh)</strong>—is the ultimate gauge of vehicle range, as it accounts for the nominal cell voltage profile.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 700 }}>C-Rate Parameters</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
                      The C-rate scales the current relative to the nominal capacity. A discharge rate of <strong>1C</strong> means a 100Ah battery will deliver 100A for exactly 1 hour. A discharge rate of <strong>5C</strong> delivers 500A for 12 minutes (1/5 of an hour). Conversely, a charge rate of <strong>0.5C</strong> requires 2 hours to fully charge the cell.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 700 }}>Dynamic C-Rate Trade-offs</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
                      High C-rate loading drops the usable capacity of the cell. As current increases, internal resistance creates a large internal voltage drop, causing the cell terminal voltage to hit the safety cut-off limit early. This is why high-acceleration events can limit usable battery energy.
                    </p>
                  </div>
                </div>

                <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>LITHIUM PLATING FAST-CHARGING HAZARD:</span>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    While high C-rate discharging causes heating, high C-rate **charging** introduces severe electrochemical hazards. If lithium ions are forced into the anode faster than they can intercalate into the graphite lattice, the anode potential drops below 0V vs. Li/Li⁺. This causes metallic lithium to deposit directly on the anode surface (lithium plating). Over time, this plating forms metallic needles (dendrites) that puncture the polymer separator, resulting in an internal short circuit and instant thermal runaway.
                  </p>
                </div>
              </div>

              {/* 1.5 Series and Parallel Connections */}
              <div id="part-1-5" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.5 Series and Parallel Connections</h3>
                  <span className={styles.orientationAnchorBadge}>P1.5</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  To scale cells up to high-voltage, high-capacity vehicle packs, engineers wire cells together in combinations of series (S) and parallel (P) configurations. The choice of layout dictates packaging efficiency, BMS complexity, and copper weld mass.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 700 }}>Series Routing (S)</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                      Cells are connected positive-to-negative.
                      <br />
                      • Voltage scales: <span style={{ fontFamily: "monospace" }}>V_sys = N_s * V_cell</span>
                      <br />
                      • Capacity remains constant: <span style={{ fontFamily: "monospace" }}>C_sys = C_cell</span>
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                      Allows high pack voltage to reduce vehicle currents, but a single cell failure or capacity limitation constrains the entire series string.
                    </span>
                  </div>

                  <div>
                    <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 700 }}>Parallel Routing (P)</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                      Cells are connected positive-to-positive and negative-to-negative.
                      <br />
                      • Voltage remains constant: <span style={{ fontFamily: "monospace" }}>V_sys = V_cell</span>
                      <br />
                      • Capacity scales: <span style={{ fontFamily: "monospace" }}>C_sys = N_p * C_cell</span>
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                      Scales stored energy capacity and current handling capability, buffering internal cell differences. Requires cell fuse links to avoid parallel loop failures.
                    </span>
                  </div>
                </div>

                {/* DYNAMIC WIRING CALCULATOR */}
                <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderLeft: "4px solid var(--accent-primary)" }}>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "1.25rem", fontWeight: 700 }}>Dynamic Pack Sizing & Parameter Calculator</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    {/* Controls */}
                    <div>
                      <span className={styles.audienceCardLabel} style={{ marginBottom: "0.5rem", display: "block" }}>Series Cells (Ns)</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                        <button 
                          onClick={() => setSeriesCount(Math.max(1, seriesCount - 1))} 
                          className="btn" 
                          style={{ padding: "4px 8px", minWidth: "30px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "4px", cursor: "pointer" }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>{seriesCount}</span>
                        <button 
                          onClick={() => setSeriesCount(Math.min(150, seriesCount + 1))} 
                          className="btn" 
                          style={{ padding: "4px 8px", minWidth: "30px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "4px", cursor: "pointer" }}
                        >
                          +
                        </button>
                      </div>

                      <span className={styles.audienceCardLabel} style={{ marginBottom: "0.5rem", display: "block" }}>Parallel Cells (Np)</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button 
                          onClick={() => setParallelCount(Math.max(1, parallelCount - 1))} 
                          className="btn" 
                          style={{ padding: "4px 8px", minWidth: "30px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "4px", cursor: "pointer" }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>{parallelCount}</span>
                        <button 
                          onClick={() => setParallelCount(Math.min(30, parallelCount + 1))} 
                          className="btn" 
                          style={{ padding: "4px 8px", minWidth: "30px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "4px", cursor: "pointer" }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Calculated Metrics */}
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Pack Voltage</span>
                        <span style={{ fontSize: "1rem", color: "var(--accent-primary)", fontWeight: 700 }}>{(seriesCount * 3.6).toFixed(1)} V</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Pack Capacity</span>
                        <span style={{ fontSize: "1rem", color: "var(--accent-primary)", fontWeight: 700 }}>{(parallelCount * 5.0).toFixed(1)} Ah</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Stored Energy</span>
                        <span style={{ fontSize: "1rem", color: "#fff", fontWeight: 700 }}>{((seriesCount * 3.6 * parallelCount * 5.0) / 1000).toFixed(2)} kWh</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Total Cells</span>
                        <span style={{ fontSize: "1rem", color: "#fff", fontWeight: 700 }}>{seriesCount * parallelCount}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Continuous Power</span>
                        <span style={{ fontSize: "1rem", color: "#38bdf8", fontWeight: 700 }}>{((seriesCount * 3.6 * parallelCount * 15) / 1000).toFixed(1)} kW</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Peak Power (6C)</span>
                        <span style={{ fontSize: "1rem", color: "#ef4444", fontWeight: 700 }}>{((seriesCount * 3.6 * parallelCount * 30) / 1000).toFixed(1)} kW</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Cell Mass Only</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>{(seriesCount * parallelCount * 0.07).toFixed(2)} kg</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Envelope Volume</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>{(seriesCount * parallelCount * 0.0242).toFixed(2)} L</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", fontFamily: "monospace" }}>
                    {"Calculation Basis: NMC 21700 cell (3.6V nominal, 5.0Ah capacity, 15A continuous, 30A peak, 70g mass, 21x70mm volume)."}
                  </div>
                </div>
              </div>

              {/* 1.6 Battery States and Terminology */}
              <div id="part-1-6" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.6 Battery States and Terminology</h3>
                  <span className={styles.orientationAnchorBadge}>P1.6</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  To safely and reliably manage a battery system, the onboard Battery Management System (BMS) must estimate states that cannot be directly measured. The following parameters represent the core dictionary of battery controls engineering:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)", padding: "12px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, display: "block", marginBottom: "4px" }}>SOC (State of Charge)</span>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      The equivalent of a fuel gauge. Denotes remaining charge as a percentage of usable capacity. Estimated by tracking charge flow and using state-estimation algorithms.
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)", padding: "12px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, display: "block", marginBottom: "4px" }}>SOH (State of Health)</span>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Tracks degradation. Measured via two parameters: Capacity Fade (diminished Ah storage) and Resistance Growth (higher impedance, limiting terminal power).
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)", padding: "12px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, display: "block", marginBottom: "4px" }}>SOF (State of Function)</span>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Dynamic current envelopes. Calculates peak charge and discharge current limits in real time based on temperature, SoC, and voltage margins.
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)", padding: "12px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, display: "block", marginBottom: "4px" }}>OCV (Open Circuit Voltage)</span>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      The stable cell terminal voltage when zero load current is applied and the cell has fully rested. Serves as the fundamental anchor for SoC estimation.
                    </p>
                  </div>
                </div>

                <EngineeringNote>
                  <strong>Non-Linear OCV-SoC Curve Challenge:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    Open Circuit Voltage varies non-linearly with State of Charge. In NMC chemistry, the OCV slope is relatively steep, making simple voltage-to-SoC lookup tables feasible during rest periods. In LFP (Lithium Iron Phosphate) chemistry, however, the OCV curve is extremely flat between 20% and 80% SoC. A minor voltage measurement error of 5 mV can result in a 30% error in estimated SoC. This necessitates high-fidelity sensor ADCs and advanced recursive algorithm estimators (like Extended Kalman Filters) to track SoC dynamically.
                  </p>
                </EngineeringNote>
              </div>

              {/* 1.7 Power Battery vs Energy Battery */}
              <div id="part-1-7" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.7 Power Battery vs Energy Battery</h3>
                  <span className={styles.orientationAnchorBadge}>P1.7</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Cell manufacturers optimize cell designs for either high capacity (Energy Cells) or high output rates (Power Cells). A traction pack designer must select the cell category that matches the target vehicle's performance and charging specifications.
                </p>

                {/* SIZING TABLE */}
                <div style={{ overflowX: "auto", margin: "1.5rem 0", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <th style={{ padding: "12px" }}>Parameter</th>
                        <th style={{ padding: "12px", color: "var(--accent-primary)" }}>Energy Cell (e.g., Tesla Range)</th>
                        <th style={{ padding: "12px", color: "#38bdf8" }}>Power Cell (e.g., Porsche Performance)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "12px", fontWeight: 600 }}>Electrode Coating</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>Thick coating layers, high active material density.</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>Thin coating layers, high surface area current collectors.</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "12px", fontWeight: 600 }}>Internal Resistance (IR)</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>Higher (~20–40 mΩ cylindrical cell)</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>Extremely low (~2–8 mΩ cylindrical cell)</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "12px", fontWeight: 600 }}>Continuous C-Rate Limit</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>0.5C to 1.5C</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>5C to 15C (continuous)</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "12px", fontWeight: 600 }}>Specific Energy Density</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>250–300 Wh/kg</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>120–180 Wh/kg</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "12px", fontWeight: 600 }}>Primary Application</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>Sedans, SUVs, long-haul commercial logistics.</td>
                        <td style={{ padding: "12px", color: "var(--text-secondary)" }}>Hybrid powertrains, high-regen racing cars.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  By coating the current collectors with thin active material layers, power cells facilitate rapid ion transport out of the electrodes, minimizing internal heating. However, this thin coating reduces the volume occupied by energy-storing chemistry, significantly cutting overall energy density. Sizing a long-range EV requires a delicate balance of these parameters.
                </p>
              </div>

              {/* 1.8 Battery Pack Design Trade-offs */}
              <div id="part-1-8" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.8 Battery Pack Design Trade-offs</h3>
                  <span className={styles.orientationAnchorBadge}>P1.8</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Traction pack engineering is a multi-dimensional optimization challenge. Improving a single parameter invariably forces compromises elsewhere in the system.
                </p>

                {/* TRADE-OFF INTERACTIVE ACCORDION */}
                <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "1rem", fontWeight: 700 }}>Interactive System Trade-off Matrix</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", minHeight: "200px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {[
                        { id: "density", label: "Energy Density vs Safety", icon: "🔋" },
                        { id: "fastcharge", label: "Fast Charging vs Lifecycle", icon: "⚡" },
                        { id: "voltage", label: "High Voltage vs BMS Complexity", icon: "📟" },
                        { id: "cost", label: "Materials Cost vs Mass Limits", icon: "🪙" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setTradeoffFocus(tradeoffFocus === item.id ? null : item.id)}
                          style={{
                            padding: "10px 12px",
                            fontSize: "0.8rem",
                            textAlign: "left",
                            fontWeight: 600,
                            borderRadius: "6px",
                            border: "none",
                            background: tradeoffFocus === item.id ? "rgba(76, 169, 48, 0.15)" : "rgba(255,255,255,0.03)",
                            borderLeft: tradeoffFocus === item.id ? "3px solid var(--accent-primary)" : "3px solid transparent",
                            color: tradeoffFocus === item.id ? "var(--accent-primary)" : "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <span style={{ marginRight: "6px" }}>{item.icon}</span> {item.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      {tradeoffFocus === "density" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>Cathode Energy Squeezing vs Safety Margin</h5>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            Increasing energy density via nickel-rich chemistries (e.g., NMC 811) provides long ranges. However, nickel decreases the thermal runaway trigger temperature, meaning a cell fails under lower thermal loads. To prevent propagation, engineers must add thick aerogel isolation sheets, which adds weight, reducing the pack-level energy density.
                          </p>
                        </>
                      )}
                      {tradeoffFocus === "fastcharge" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>High C-Rate Charging vs Active Lithium Cycle Loss</h5>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            Charging at 3C+ rates reduces charging stops to 15 minutes. However, the high current creates localized anode overpotentials, inducing lithium plating. This plated metallic lithium becomes isolated "dead lithium," permanently reducing the pack capacity and shortening cycle life from 1500 down to 500 cycles.
                          </p>
                        </>
                      )}
                      {tradeoffFocus === "voltage" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>800V class voltage vs BMS Daisy-Chain Isolation</h5>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            Scaling voltage to 800V reduces current levels and copper wiring weight. However, this series string length increases the risk of high electromagnetic noise coupled into the BMS lines. The BMS architecture must incorporate galvanic digital isolation (such as capacitor-coupled SPI links) and creepage clearances to avoid board damage.
                          </p>
                        </>
                      )}
                      {tradeoffFocus === "cost" && (
                        <>
                          <h5 style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: "0 0 6px 0" }}>LFP Chemistry cost advantage vs Volumetric Chassis footprint</h5>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            LFP chemistry is cobalt-free and highly economical, reducing cost-per-kWh by 30%. However, its low volumetric density requires a pack case that is 40% larger to hit equivalent range targets. This necessitates modifying the vehicle chassis design and increasing suspension performance due to the additional cell mass.
                          </p>
                        </>
                      )}
                      {!tradeoffFocus && (
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
                          Select a design tradeoff parameter on the left to review its system-level implications.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.9 Introduction to EV Battery System Layers */}
              <div id="part-1-9" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.9 Introduction to EV Battery System Layers</h3>
                  <span className={styles.orientationAnchorBadge}>P1.9</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  A battery pack is not just an electrical component—it is a complex engineering system. It requires the seamless integration of six distinct disciplines to function safely and efficiently:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "1.25rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "var(--accent-primary)" }}><Cpu size={16} /></span>
                      <h4 style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>1. Electrochemical Layer</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Cell selection, chemistry performance ratios, degradation behavior modeling, and cell impedance characterization (EIS).
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "1.25rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "#38bdf8" }}><Zap size={16} /></span>
                      <h4 style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>2. Electrical Layer</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Copper busbar cross-sectional sizing, fuse and pyrofuse coordination, contactor drive circuits, and creepage and clearance insulation mapping.
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "1.25rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "#ef4444" }}><Flame size={16} /></span>
                      <h4 style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>3. Thermal Layer</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Liquid cold-plate fluid dynamics, thermal interface material (TIM) selection, cell aerogel firewalls, and active coolant flow routing.
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "1.25rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "var(--accent-primary)" }}><Layers size={16} /></span>
                      <h4 style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>4. Structural Layer</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Enclosure mechanical frame FEA, shock-absorption structures, crash-force deflection channels, and under-pack road debris protective sheets.
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "1.25rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "#a855f7" }}><Sliders size={16} /></span>
                      <h4 style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>5. Control (BMS) Layer</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      AFE chip voltage sensing loops, passive cell balancing logic, SOC estimation algorithms, and ISO 26262 safety diagnostics.
                    </p>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "1.25rem", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "#eab308" }}><Workflow size={16} /></span>
                      <h4 style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>6. Cloud & Telemetry Layer</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      Low-latency CAN-to-LTE data routing, MQTT telematics payloads, secure message authentication, and predictive fleet health digital twins.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1.10 Beginner Engineering Exercises */}
              <div id="part-1-10" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.10 Beginner Engineering Exercises</h3>
                  <span className={styles.orientationAnchorBadge}>P1.10</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Apply the fundamental formulas you have learned to solve standard battery pack sizing exercises. Try to calculate the results on paper before revealing the solutions.
                </p>

                {/* EXERCISE 1 */}
                <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem", borderLeft: "4px solid var(--accent-primary)" }}>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 700 }}>Exercise 1: Cell Count & Pack Sizing Calculations</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                    A vehicle platform requires a <strong>75 kWh battery pack</strong>. You are utilizing cylindrical NMC 21700 cells with the following specifications:
                    <br />
                    • Nominal cell voltage = 3.6 V
                    <br />
                    • Cell capacity = 5.0 Ah
                    <br />
                    • Single cell mass = 70 g
                    <br />
                    Calculate:
                    <br />
                    1. The minimum number of cells required to meet the energy target.
                    <br />
                    2. A series/parallel configuration to achieve a nominal system voltage close to 360 V.
                    <br />
                    3. The total cell-only mass of the resulting pack.
                  </p>

                  <button
                    onClick={() => setExerciseSolutions(prev => ({ ...prev, 1: !prev[1] }))}
                    className="btn"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--accent-primary)",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    {exerciseSolutions[1] ? "Hide Solution" : "Reveal Engineering Solution & Steps"}
                  </button>

                  {exerciseSolutions[1] && (
                    <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, border: "1px dashed rgba(255,255,255,0.08)" }}>
                      <strong style={{ color: "#fff" }}>Step-by-Step Derivation:</strong>
                      <br />
                      1. <span style={{ textDecoration: "underline" }}>Single Cell Energy Calculation</span>:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>E_cell = V_nominal * C_cell = 3.6V * 5.0Ah = 18.0 Wh = 0.018 kWh</span>
                      <br />
                      2. <span style={{ textDecoration: "underline" }}>Minimum Cell Count</span>:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>Total Cells = 75,000 Wh / 18.0 Wh = 4166.67 ≈ 4167 cells</span>
                      <br />
                      3. <span style={{ textDecoration: "underline" }}>Series Configuration (Ns)</span>:
                      <br />
                      To hit a nominal pack voltage of 360V:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>N_s = V_target / V_cell = 360V / 3.6V = 100 cells in series (100S)</span>
                      <br />
                      4. <span style={{ textDecoration: "underline" }}>Parallel Configuration (Np)</span>:
                      <br />
                      To maintain a symmetric layout, divide the total cells by the series cells:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>N_p = 4167 cells / 100S = 41.67 ≈ 42 cells in parallel (42P)</span>
                      <br />
                      Therefore, final configuration is <strong>100S 42P</strong>.
                      <br />
                      Actual cell count = <span style={{ fontFamily: "monospace" }}>100 * 42 = 4200 cells</span>.
                      <br />
                      Actual pack energy = <span style={{ fontFamily: "monospace" }}>4200 * 18 Wh = 75,600 Wh = 75.6 kWh</span>.
                      <br />
                      5. <span style={{ textDecoration: "underline" }}>Total Cell Mass</span>:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>Mass = 4200 cells * 0.070 kg/cell = 294 kg</span> (this excludes busbars, BMS, cooling, and enclosure which typically add another 30-40% weight).
                    </div>
                  )}
                </div>

                {/* EXERCISE 2 */}
                <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent-primary)" }}>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: 700 }}>Exercise 2: Joule Heating and Busbar Resistance Sizing</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                    A parallel module group experiences a transient acceleration peak current of <strong>250 A</strong> for 10 seconds. The copper busbar linking this module has a resistance of exactly <strong>0.15 mΩ</strong> (1.5 × 10⁻⁴ Ω).
                    <br />
                    Calculate:
                    <br />
                    1. The electrical power lost as heat inside the copper busbar.
                    <br />
                    2. The minimum copper busbar cross-sectional area required, assuming a safety current density limit of <strong>6 A/mm²</strong>.
                  </p>

                  <button
                    onClick={() => setExerciseSolutions(prev => ({ ...prev, 2: !prev[2] }))}
                    className="btn"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--accent-primary)",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    {exerciseSolutions[2] ? "Hide Solution" : "Reveal Engineering Solution & Steps"}
                  </button>

                  {exerciseSolutions[2] && (
                    <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, border: "1px dashed rgba(255,255,255,0.08)" }}>
                      <strong style={{ color: "#fff" }}>Step-by-Step Derivation:</strong>
                      <br />
                      1. <span style={{ textDecoration: "underline" }}>Joule Heating Calculation</span>:
                      <br />
                      Using the electrical power loss equation:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>P_loss = I² * R</span>
                      <br />
                      <span style={{ fontFamily: "monospace" }}>P_loss = (250 A)² * (0.00015 Ω) = 62500 * 0.00015 = 9.375 W</span>
                      <br />
                      Over 10 seconds, this generates <span style={{ fontFamily: "monospace" }}>9.375 W * 10 s = 93.75 Joules</span> of thermal energy that must be dissipated by the cooling loop to prevent localized heat spots.
                      <br />
                      2. <span style={{ textDecoration: "underline" }}>Busbar Cross-Sectional Area</span>:
                      <br />
                      Using current density limits:
                      <br />
                      <span style={{ fontFamily: "monospace" }}>Area = Current / Max Current Density = 250 A / (6 A/mm²) = 41.67 mm²</span>
                      <br />
                      An engineer would select a standard copper sheet thickness of 2 mm, giving a width requirement of <span style={{ fontFamily: "monospace" }}>41.67 / 2 ≈ 21 mm</span> for the busbar cross section.
                    </div>
                  )}
                </div>
              </div>

              {/* 1.11 Key Engineering Takeaways */}
              <div id="part-1-11" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.11 Key Engineering Takeaways</h3>
                  <span className={styles.orientationAnchorBadge}>P1.11</span>
                </div>
                
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                    <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>1.</span>
                      <span><strong>The Cell Is the Master:</strong> All mechanical structures, electrical busbars, and cooling plates are secondary systems designed around the chemical properties and physical tolerances of the chosen cell chemistry.</span>
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>2.</span>
                      <span><strong>Joule Heating Governs Design:</strong> Power losses scale quadratically with current. Reducing pack currents by migrating to high-voltage classes (e.g. 800V) is a primary lever to reduce mass and heating.</span>
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>3.</span>
                      <span><strong>Safety Requires Passivation:</strong> Designing the SEI layer and preventing lithium plating during fast charge cycles are key limits for modern BMS safety controls.</span>
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>4.</span>
                      <span><strong>CTP is the Standard:</strong> Removing heavy modular brackets and packaging structures directly increases volumetric energy density. All new vehicle designs optimize for structural cell architectures.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 1.12 Navigation to Part 2 */}
              <div id="part-1-12" style={{ scrollMarginTop: "100px" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>1.12 Navigation to Part 2</h3>
                  <span className={styles.orientationAnchorBadge}>P1.12</span>
                </div>
                
                <div style={{ background: "rgba(76, 169, 48, 0.04)", border: "1px solid rgba(76, 169, 48, 0.15)", borderRadius: "var(--radius-lg)", padding: "2rem", marginTop: "1rem" }}>
                  <span className={styles.audienceCardLabel} style={{ color: "var(--accent-primary)", marginBottom: "0.25rem" }}>UP NEXT</span>
                  <h4 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Part 2: EV Battery Requirements</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                    Learn how system requirements are derived directly from the vehicle. Drive range budgets to WLTP and US06 dynamic acceleration profiles, map volumetric pack geometries inside physical chassis frames, and establish thermal limits.
                  </p>

                  <a 
                    href="#part-2" 
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo("masterIndex"); // Or scroll to requirements section when available
                    }} 
                    className="btn btn-primary" 
                    style={{ textDecoration: "none", display: "inline-block" }}
                  >
                    Go to Master Index →
                  </a>
                </div>
              </div>

              <div className={styles.chapterNav}>
                <div 
                  className={styles.chapterNavLink} 
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("part0Orientation");
                  }}
                >
                  <span className={styles.chapterNavLabel}>Previous Part</span>
                  <span className={styles.chapterNavTitle}>Part 0: Handbook Orientation</span>
                </div>
                <div 
                  className={styles.chapterNavLink} 
                  style={{ alignItems: "flex-end", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("part2Requirements");
                  }}
                >
                  <span className={styles.chapterNavLabel}>Next Part</span>
                  <span className={styles.chapterNavTitle}>Part 2: EV Battery Requirements and System Definition</span>
                </div>
              </div>

            </div>}
          </section>

          {/* ═══ PART 2: EV BATTERY REQUIREMENTS AND SYSTEM DEFINITION ═══ */}
          <section id="part2Requirements" className={styles.pageSection} ref={sectionRefs.part2Requirements}>
            <div className={styles.sectionHeader}>
              <button
                className={styles.partSectionAccordionHeader}
                onClick={() => togglePartSection("part2Requirements")}
                aria-expanded={openPartSections.part2Requirements}
              >
                <div>
                  <span className={styles.sectionLabel}>Core Module · Beginner · 3.0 Hrs</span>
                  <h2 className={styles.sectionTitle}>Part 2 — EV Battery Requirements and System Definition</h2>
                  <p className={styles.sectionSubtitle}>
                    Master the engineering discipline of requirements capture, system-level trade-offs, environmental constraints, and safety boundary definition.
                  </p>
                </div>
                <span className={styles.partSectionToggleBtn} aria-hidden="true">
                  {openPartSections.part2Requirements
                    ? <><ChevronDown size={14} /> Collapse</>
                    : <><ChevronRight size={14} /> Expand</>}
                </span>
              </button>
            </div>

            {openPartSections.part2Requirements && <div className={styles.chapterBox}>
              <div className={styles.chapterTitle}>Part 2: EV Battery Requirements Reader</div>

              {/* 2.1 Why Requirements Matter */}
              <div id="part-2-1" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.1 Why Requirements Matter</h3>
                  <span className={styles.orientationAnchorBadge}>P2.1</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Battery pack development is a high-stakes, multi-disciplinary engineering endeavor where electrical, chemical, mechanical, thermal, and software systems intersect under extreme safety constraints. Developing a battery pack without rigorous, upfront requirements engineering is a direct path to project failure. Common consequences of poor requirement definition include packaging mismatches during vehicle integration, severe thermal management failures under fast-charging loads, and catastrophic thermal runaway.
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Rigorous requirements engineering establishes clear boundaries and performance targets before physical prototyping begins. It differentiates between customer expectations (e.g., "fast acceleration") and engineering requirements (e.g., "discharge current of 450A for 10 seconds at cell temperatures between 15°C and 45°C"). This translation forms the backbone of pack architecture.
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⚙️</span> Requirement-to-Validation Engineering Lifecycle (V-Model)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", textAlign: "center" }}>
                    {[
                      { step: "1. Capture Requirements", desc: "VOC & System Goals", border: "var(--accent-primary)" },
                      { step: "2. Architecture Design", desc: "Cell/Module/Pack Sizing", border: "#38bdf8" },
                      { step: "3. Simulation & Optimization", desc: "Thermal & Electrical FEA", border: "#a855f7" },
                      { step: "4. Build & Verify", desc: "HIL Testing & Prototyping", border: "#eab308" },
                      { step: "5. Validation & Sign-off", desc: "UN 38.3 / ISO 26262 Certification", border: "#10b981" }
                    ].map((phase, idx) => (
                      <div key={idx} style={{ padding: "12px", border: `1px solid ${phase.border}`, borderRadius: "6px", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{phase.step}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{phase.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", color: "var(--accent-primary)", fontSize: "0.75rem", marginTop: "12px" }}>
                    ➔ Continuous Traceability: System Verification maps directly back to Captured Requirements ➔
                  </div>
                </div>
              </div>

              {/* 2.2 EV Battery Application Types */}
              <div id="part-2-2" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.2 EV Battery Application Types</h3>
                  <span className={styles.orientationAnchorBadge}>P2.2</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  EV battery packs are not one-size-fits-all. Different applications require drastically different voltage levels, energy capacities, safety architectures, and cooling topologies. Sizing a system requires analyzing the specific duty cycles and volume envelopes of the target application.
                </p>

                {/* Dynamic Selection Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
                  {[
                    { key: "ebike", name: "E-Bike", icon: "🚲" },
                    { key: "scooter", name: "Scooter / Micromobility", icon: "🛴" },
                    { key: "motorcycle", name: "Motorcycle", icon: "🏍️" },
                    { key: "car", name: "Passenger EV (BEV)", icon: "🚗" },
                    { key: "commercial", name: "Commercial Truck", icon: "🚛" },
                    { key: "stationary", name: "Stationary ESS", icon: "🔋" },
                    { key: "secondlife", name: "Second-Life Pack", icon: "♻️" }
                  ].map((app) => (
                    <button
                      key={app.key}
                      onClick={() => setActiveAppType(app.key)}
                      style={{
                        padding: "12px 8px",
                        background: activeAppType === app.key ? "rgba(76,169,48,0.15)" : "rgba(255,255,255,0.02)",
                        border: activeAppType === app.key ? "1.5px solid var(--accent-primary)" : "1.5px solid rgba(255,255,255,0.06)",
                        borderRadius: "6px",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{app.icon}</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{app.name}</span>
                    </button>
                  ))}
                </div>

                {/* Dynamic Details Panel */}
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  {activeAppType === "ebike" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>E-Bike Battery Pack Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        Low voltage, lightweight, and convection-cooled. Focused on portability, safety during indoor charging, and cost limits.
                      </p>
                      {renderAppMetrics(36, 15, 1.5, 3.0, "Passive Air (Convection)", "High (Often 18650 cells)")}
                    </div>
                  )}
                  {activeAppType === "scooter" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Scooter / Micromobility Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        Requires ruggedized mechanical casings to handle frequent drops, vibrations, and swappable battery slot mechanism contact cycles.
                      </p>
                      {renderAppMetrics(48, 25, 2.0, 4.0, "Passive Air / Heat Spreading Pads", "High")}
                    </div>
                  )}
                  {activeAppType === "motorcycle" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Electric Motorcycle Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        Strict aerodynamic packaging and volumetric limitations. Demands high discharge rates for quick acceleration without excessive thermal accumulation.
                      </p>
                      {renderAppMetrics(110, 40, 3.0, 8.0, "Forced Air / Liquid Cooled Fins", "Medium")}
                    </div>
                  )}
                  {activeAppType === "car" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Passenger EV (BEV) Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        High-voltage (400V–800V) systems designed for maximum range, active liquid cooling, high-power fast charging (350kW+), and structural chassis crash safety.
                      </p>
                      {renderAppMetrics(400, 200, 1.0, 5.0, "Active Liquid Cooling Plates", "Low")}
                    </div>
                  )}
                  {activeAppType === "commercial" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Commercial Truck Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        Extremely large scale packs (&gt;300 kWh) designed for deep cycling, long operational lifespan, maximum continuous power, and structural side-frame crash protection.
                      </p>
                      {renderAppMetrics(650, 600, 1.5, 3.0, "Active Liquid Chilling", "High (Repurposed as ESS)")}
                    </div>
                  )}
                  {activeAppType === "stationary" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Stationary Energy Storage System (ESS) Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        No volumetric/gravimetric mass constraints. Focuses strictly on cost per kWh, calendar longevity (&gt;15 years), and grid safety. Perfect match for LFP or Sodium-Ion cells.
                      </p>
                      {renderAppMetrics(800, 1200, 0.5, 1.0, "HVAC / Active Liquid Cooling", "N/A (End of first-life)")}
                    </div>
                  )}
                  {activeAppType === "secondlife" && (
                    <div>
                      <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Second-Life Battery Pack Specs</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
                        Assembled using degraded cells (SOH 70%–80%) harvested from retired electric vehicles. Requires advanced grading algorithms and safe design envelopes.
                      </p>
                      {renderAppMetrics(350, 100, 0.5, 1.5, "Forced Air / Passive Convective", "N/A (Recycled directly)")}
                    </div>
                  )}
                </div>
              </div>

              {/* 2.3 Running Example — Second-Life Battery Pack */}
              <div id="part-2-3" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.3 Running Example — Second-Life Battery Pack</h3>
                  <span className={styles.orientationAnchorBadge}>P2.3</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  To ground these engineering principles, this handbook uses a real-world running design challenge: the <strong>Second-Life LFP Battery Pack</strong>. When EV batteries degrade to roughly 70%–80% of their original capacity, they are no longer suitable for vehicular range requirements. However, the cells are still highly viable for secondary applications (like grid energy storage, backup power, or light mobility).
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Repurposing cells involves harvesting them from retired packs, testing and grading them based on State of Health (SOH) and Internal Resistance (IR), and grouping similar-performing cells into secondary modules. Because LFP chemistry has high thermal stability and a long cycle life, it is ideal for second-life stationary storage applications.
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.95rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>♻️</span> Interactive Second-Life Cell Grading Simulator
                  </h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
                    Simulate testing cells harvested from a retired commuter bus. Adjust State of Health (SOH) and Internal Resistance (IR) parameters to evaluate their suitability for repurposing.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        <span>State of Health (SOH)</span>
                        <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{gradingSoh}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={gradingSoh} 
                        onChange={(e) => setGradingSoh(parseInt(e.target.value))} 
                        style={{ width: "100%", accentColor: "var(--accent-primary)" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>50% (Highly Degraded)</span>
                        <span>100% (Brand New)</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        <span>Internal Resistance (IR)</span>
                        <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{gradingIr} mΩ</span>
                      </label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="5.0" 
                        step="0.1" 
                        value={gradingIr} 
                        onChange={(e) => setGradingIr(parseFloat(e.target.value))} 
                        style={{ width: "100%", accentColor: "var(--accent-primary)" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>0.5 mΩ (Low Loss)</span>
                        <span>5.0 mΩ (High Heat)</span>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    let grade = "Recycle";
                    let color = "#ef4444";
                    let desc = "Cell shows extreme capacity loss or excessive resistance. High heat risk under load. Unfit for secondary use, must be chemically recycled.";
                    
                    if (gradingSoh >= 80 && gradingIr <= 1.5) {
                      grade = "Grade A (Light Vehicle / Mobile Second-Life)";
                      color = "var(--accent-primary)";
                      desc = "Excellent health and minimal internal resistance. Suitable for light traction applications, golf carts, or marine auxiliary power.";
                    } else if (gradingSoh >= 70 && gradingIr <= 2.5) {
                      grade = "Grade B (Stationary ESS / Grid Backup)";
                      color = "#eab308";
                      desc = "Adequate remaining capacity and stable internal resistance. Highly recommended for grid-tied solar storage, peak shaving, or backup power vaults.";
                    }

                    return (
                      <div style={{ border: `1.5px solid ${color}`, background: `${color}08`, padding: "12px 16px", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Grading Result</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: color }}>{grade}</span>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>{desc}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 2.4 Customer Requirement Capture */}
              <div id="part-2-4" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.4 Customer Requirement Capture</h3>
                  <span className={styles.orientationAnchorBadge}>P2.4</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Systems engineering begins by collecting the "Voice of the Customer" (VOC) and translating these high-level, often qualitative desires into quantitative, testable engineering specifications.
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.95rem", marginBottom: "1rem" }}>🔊 Voice of Customer (VOC) Technical Specification Translator</h4>
                  
                  <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                    {[
                      { key: "range", label: "Long Range Drive" },
                      { key: "charge", label: "Ultra-Fast Charging" },
                      { key: "durability", label: "Decade Longevity" },
                      { key: "safety", label: "Severe Crash Safety" }
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => setSelectedVocKey(btn.key)}
                        style={{
                          padding: "8px 12px",
                          background: selectedVocKey === btn.key ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.02)",
                          border: selectedVocKey === btn.key ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "4px",
                          color: selectedVocKey === btn.key ? "#38bdf8" : "#fff",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          transition: "all 0.15s ease"
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {selectedVocKey === "range" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem" }}>
                      <div style={{ padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                        <strong style={{ color: "#eab308", display: "block", marginBottom: "4px" }}>Customer Voice:</strong>
                        "I want to drive at least 320 miles on the highway without stopping to charge."
                      </div>
                      <div style={{ padding: "10px", background: "rgba(56,189,248,0.05)", borderRadius: "4px", borderLeft: "3px solid #38bdf8" }}>
                        <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>Engineered System Specs:</strong>
                        • Minimum usable pack capacity: 85 kWh<br />
                        • Peak continuous energy discharge: 28 kW continuous at 70 mph<br />
                        • Cell Chemistry: High specific energy NMC (or advanced LFP)
                      </div>
                    </div>
                  )}
                  {selectedVocKey === "charge" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem" }}>
                      <div style={{ padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                        <strong style={{ color: "#eab308", display: "block", marginBottom: "4px" }}>Customer Voice:</strong>
                        "I only want to spend 15 minutes at charging stations during road trips."
                      </div>
                      <div style={{ padding: "10px", background: "rgba(56,189,248,0.05)", borderRadius: "4px", borderLeft: "3px solid #38bdf8" }}>
                        <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>Engineered System Specs:</strong>
                        • Charge capability: 10% to 80% SOC in &le; 18 minutes<br />
                        • Peak continuous charging current: &ge; 420 A (continuous 3.5C charge rate)<br />
                        • Cooling system: Active liquid bottom-cooling plate to reject 12kW peak heat loss
                      </div>
                    </div>
                  )}
                  {selectedVocKey === "durability" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem" }}>
                      <div style={{ padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                        <strong style={{ color: "#eab308", display: "block", marginBottom: "4px" }}>Customer Voice:</strong>
                        "I want my battery to last the entire lifespan of the car, at least 10 years."
                      </div>
                      <div style={{ padding: "10px", background: "rgba(56,189,248,0.05)", borderRadius: "4px", borderLeft: "3px solid #38bdf8" }}>
                        <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>Engineered System Specs:</strong>
                        • Capacity retention: &ge; 80% initial capacity at Year 10 / 200,000 miles<br />
                        • Calendar life targets: &ge; 3,500 equivalent full cycles under 1C rate<br />
                        • Thermal boundaries: BMS controls cooling to maintain cells between 25°C and 35°C
                      </div>
                    </div>
                  )}
                  {selectedVocKey === "safety" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem" }}>
                      <div style={{ padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                        <strong style={{ color: "#eab308", display: "block", marginBottom: "4px" }}>Customer Voice:</strong>
                        "I want total peace of mind that the battery won't catch fire in a highway collision."
                      </div>
                      <div style={{ padding: "10px", background: "rgba(56,189,248,0.05)", borderRadius: "4px", borderLeft: "3px solid #38bdf8" }}>
                        <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>Engineered System Specs:</strong>
                        • Passive propagation resistance: Zero thermal runaway propagation to adjacent cells<br />
                        • Structural integrity: Case must withstand 100 kN lateral crush load without intrusion<br />
                        • Safety isolation: High-voltage pyrofuse cuts off load circuit within &le; 2 ms upon collision detect
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2.5 Vehicle/System Requirement Definition */}
              <div id="part-2-5" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.5 Vehicle/System Requirement Definition</h3>
                  <span className={styles.orientationAnchorBadge}>P2.5</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Once customer voices are translated, the systems engineering team establishes concrete <strong>Vehicle-to-Pack Requirements</strong>. These specifications dictate key electrical, mechanical, and thermal parameters of the final system:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <h4 style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px" }}>⚡ Electrical Domain</h4>
                    <ul style={{ color: "var(--text-secondary)", fontSize: "0.8rem", paddingLeft: "15px", lineHeight: "1.5" }}>
                      <li><strong>Nominal Voltage:</strong> Determines drivetrain matching (e.g. 360V for commuter EVs, 720V for 800V fast-charging architectures).</li>
                      <li><strong>Continuous Current:</strong> Max current matching vehicle continuous cruise power.</li>
                      <li><strong>Peak Current:</strong> Max current requested under peak acceleration (e.g. 10-second boost).</li>
                      <li><strong>Regen Limits:</strong> Maximum absorption current during regenerative braking.</li>
                    </ul>
                  </div>

                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <h4 style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px" }}>📐 Mechanical & Packaging</h4>
                    <ul style={{ color: "var(--text-secondary)", fontSize: "0.8rem", paddingLeft: "15px", lineHeight: "1.5" }}>
                      <li><strong>Pack Envelope:</strong> Total X, Y, Z dimensional volume allocated underneath the vehicle cabin chassis.</li>
                      <li><strong>Gravimetric Budget:</strong> Maximum allowable mass allocation (e.g. &le; 450 kg) to maintain target vehicle suspension behavior.</li>
                      <li><strong>Mounting Interface:</strong> Location of chassis hardpoints to bear mechanical stress during dynamic cornering.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2.6 Environmental and Thermal Requirements */}
              <div id="part-2-6" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.6 Environmental and Thermal Requirements</h3>
                  <span className={styles.orientationAnchorBadge}>P2.6</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  EV battery packs are subjected to extreme, varying environmental stresses. Environmental requirements dictate case sealing, isolation boundaries, and thermal management architectures to ensure cell stability under all operation conditions.
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.9rem", marginBottom: "10px" }}>🌧️ Environmental Stress & Mitigation Mapping</h4>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                          <th style={{ padding: "8px" }}>Environmental Stress</th>
                          <th style={{ padding: "8px" }}>Target Hazard</th>
                          <th style={{ padding: "8px" }}>Engineering Requirement</th>
                          <th style={{ padding: "8px" }}>Design Mitigation</th>
                        </tr>
                      </thead>
                      <tbody style={{ color: "var(--text-secondary)" }}>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px", fontWeight: 600, color: "#fff" }}>Extreme Cold (-30°C)</td>
                          <td>Lithium plating, severe capacity loss</td>
                          <td>Warm cells to &gt; 0°C before charging</td>
                          <td>Integrated PTC liquid heaters / cell heaters</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px", fontWeight: 600, color: "#fff" }}>Extreme Heat (+55°C)</td>
                          <td>Accelerated aging, thermal runaway</td>
                          <td>Keep cell temp below 45°C under high loads</td>
                          <td>Active liquid cooling plates with chiller cycles</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px", fontWeight: 600, color: "#fff" }}>Water & Dust Ingress</td>
                          <td>HV short circuits, cell/BMS corrosion</td>
                          <td>IP67 (immersion), IP69K (high pressure wash)</td>
                          <td>Gore-vent seals, silicone perimeter gaskets</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", fontWeight: 600, color: "#fff" }}>Road Shock & Vibration</td>
                          <td>Interconnect mechanical fatigue/cracks</td>
                          <td>Withstand UN 38.3 vibration profile specs</td>
                          <td>Epoxy cell-bonding, wire bonding, rubber isolators</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2.7 Safety Requirements */}
              <div id="part-2-7" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.7 Safety Requirements</h3>
                  <span className={styles.orientationAnchorBadge}>P2.7</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Safety is the absolute primary boundary constraint for any lithium traction battery pack. High-voltage energy systems must integrate layered mechanical, electrical, and software safety boundaries to protect passengers, first responders, and technicians.
                </p>

                <SafetyWarning>
                  <strong>High Voltage Safety Target:</strong> Traction batteries exceeding 60 VDC are classified as high voltage systems. The pack design must integrate insulation monitoring sensors to actively measure electrical resistance between high-voltage busbars and the chassis ground. Any value below 100 Ω/V must trigger an immediate BMS safety interrupt.
                </SafetyWarning>

                <div style={{ marginTop: "1.25rem" }}>
                  <ArchitectInsight>
                    <strong>ISO 26262 Compliance:</strong> The battery management system's overvoltage detection, overtemperature shutdown, and contactor control circuits are typical candidates for Automotive Safety Integrity Level (ASIL) D classification—the highest safety level representing safety-critical controls.
                  </ArchitectInsight>
                </div>

                <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.9rem", marginBottom: "8px" }}>🔥 Thermal Runaway Propagation Prevention (UN 38.3 / ECE R100)</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: "1.5", margin: 0 }}>
                    In the event of a single cell entering thermal runaway (due to internal short circuit or defect), the pack design must prevent this failure from propagating to neighboring cells. Mechanical mitigations include Aerogel insulating pads between cells, mica sheet module separators, and dedicated cell pressure-relief vents that direct hot exhaust gas away from other cell modules.
                  </p>
                </div>
              </div>

              {/* 2.8 Serviceability and Maintainability */}
              <div id="part-2-8" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.8 Serviceability and Maintainability</h3>
                  <span className={styles.orientationAnchorBadge}>P2.8</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  A battery pack must not be designed as a sealed black box that is impossible to service. Modular engineering allows technicians to troubleshoot and replace individual components safely, extending the operational life of the battery.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <h4 style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "6px" }}>🔌 Manual Service Disconnect (MSD)</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: "1.5", margin: 0 }}>
                      An MSD is a physical plug accessible from outside or inside the cabin that splits the main series connection of the pack in half. Removing the MSD drops the exposed voltage levels of the pack below high-voltage safety thresholds, allowing technicians to work on internal components without hazard.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <h4 style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "6px" }}>📦 Modular Service Strategy</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: "1.5", margin: 0 }}>
                      Instead of laser-welding the entire pack envelope shut, top-cover plates are sealed with service-replaceable gaskets. If a cell module registers a sensor failure or cell defect, the module can be unbolted and swapped, avoiding costly total pack replacement.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2.9 Cost, Weight, Volume, and Lifecycle Trade-offs */}
              <div id="part-2-9" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.9 Cost, Weight, Volume, and Lifecycle Trade-offs</h3>
                  <span className={styles.orientationAnchorBadge}>P2.9</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  Battery pack engineering is a continuous balance of compromises. You cannot maximize all parameters simultaneously. Elevating specific energy usually compromises safety margins or cycle lifespan; lowering costs through cheaper chemistries (like LFP) increases weight and pack volume requirements.
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.95rem", marginBottom: "1rem" }}>⚖️ Interactive Battery Architecture Trade-off Balance tool</h4>
                  
                  <div style={{ marginBottom: "1.5rem" }}>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={tradeoffSliderValue} 
                      onChange={(e) => setTradeoffSliderValue(parseInt(e.target.value))} 
                      style={{ width: "100%", accentColor: "var(--accent-primary)", marginBottom: "6px" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      <span>1: ESS LFP (Budget/Durability)</span>
                      <span>3: Standard Commuter EV</span>
                      <span>5: Solid-State (Extreme Performance)</span>
                    </div>
                  </div>

                  {(() => {
                    let title = "";
                    let desc = "";
                    let energy = 0;
                    let safety = 0;
                    let cost = 0;
                    let thermal = 0;
                    let cycle = 0;

                    if (tradeoffSliderValue === 1) {
                      title = "Stationary LFP Energy Storage (ESS)";
                      desc = "Maximized for cost efficiency and lifespan. Volumetric density is low, requiring substantial physical room. Safety is excellent due to stable LFP chemistry.";
                      energy = 30; safety = 95; cost = 95; thermal = 20; cycle = 98;
                    } else if (tradeoffSliderValue === 2) {
                      title = "Commuter EV Pack (LFP/Sodium-Ion)";
                      desc = "Balanced budget solution with high safety margin. Slower charging rates, moderate range, but highly durable and cost-effective.";
                      energy = 50; safety = 85; cost = 80; thermal = 45; cycle = 88;
                    } else if (tradeoffSliderValue === 3) {
                      title = "Standard BEV (NMC Balanced)";
                      desc = "The default modern EV configuration. Balanced energy density for 300+ miles of range, active liquid cooling thermal load support, and moderate cost.";
                      energy = 75; safety = 65; cost = 55; thermal = 70; cycle = 70;
                    } else if (tradeoffSliderValue === 4) {
                      title = "Performance Track EV (NMC High C-Rate)";
                      desc = "Maximized for peak acceleration power and fast cooling. Features thin, high-performance electrodes. Lifespan and costs are severely compromised.";
                      energy = 85; safety = 50; cost = 30; thermal = 95; cycle = 50;
                    } else if (tradeoffSliderValue === 5) {
                      title = "Hypercar Solid-State (Future Concept)";
                      desc = "Maximum specific energy and chemical stability. Costs are extremely high due to early manufacturing scaling. Demands minimal active cooling infrastructure.";
                      energy = 98; safety = 90; cost = 10; thermal = 30; cycle = 80;
                    }

                    return (
                      <div>
                        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", marginBottom: "12px" }}>
                          <strong style={{ color: "var(--accent-primary)", fontSize: "0.85rem" }}>{title}</strong>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", margin: "4px 0 0 0" }}>{desc}</p>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {[
                            { name: "Specific Energy (Wh/kg)", val: energy, color: "var(--accent-primary)" },
                            { name: "Safety Margin (Thermal Stability)", val: safety, color: "#10b981" },
                            { name: "Cost Efficiency (Low $/kWh)", val: cost, color: "#38bdf8" },
                            { name: "Thermal Complexity (Liquid demand)", val: thermal, color: "#a855f7" },
                            { name: "Cycle Lifespan (Total Cycles)", val: cycle, color: "#eab308" }
                          ].map((item, idx) => (
                            <div key={idx}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "2px" }}>
                                <span>{item.name}</span>
                                <span style={{ color: "#fff", fontWeight: 600 }}>{item.val}%</span>
                              </div>
                              <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${item.val}%`, height: "100%", background: item.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 2.10 Battery Requirement Specification Document */}
              <div id="part-2-10" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.10 Battery Requirement Specification Document</h3>
                  <span className={styles.orientationAnchorBadge}>P2.10</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  All technical requirements must be collected into a centralized <strong>Requirement Specification Document</strong>. This registry lists clear, unambiguous requirements, each with a unique ID, description, subsystem target, and verification method.
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.9rem", marginBottom: "8px" }}>📋 Sample Traceability Matrix Structure</h4>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                          <th style={{ padding: "6px" }}>Requirement ID</th>
                          <th style={{ padding: "6px" }}>Subsystem Target</th>
                          <th style={{ padding: "6px" }}>Specification Target Description</th>
                          <th style={{ padding: "6px" }}>Verification Method</th>
                        </tr>
                      </thead>
                      <tbody style={{ color: "var(--text-secondary)" }}>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "6px", fontWeight: 600, color: "#fff" }}>REQ-BATT-ELEC-01</td>
                          <td>Electrical Interconnects</td>
                          <td>Busbars must carry 350A continuously without exceeding 60°C temperature rise.</td>
                          <td>Test (Thermal Chamber Load)</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "6px", fontWeight: 600, color: "#fff" }}>REQ-BATT-MECH-03</td>
                          <td>Pack Enclosure Case</td>
                          <td>Cover plates must prevent water ingress under 1-meter immersion for 30 minutes.</td>
                          <td>Test (IP67 Water Chamber)</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "6px", fontWeight: 600, color: "#fff" }}>REQ-BATT-SAFE-05</td>
                          <td>BMS Safety Software</td>
                          <td>BMS must disconnect contactors within 15 ms if voltage drops below 2.0V in any cell.</td>
                          <td>Analysis / Hardware HIL Test</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "6px", fontWeight: 600, color: "#fff" }}>REQ-BATT-THER-02</td>
                          <td>Cooling Channel</td>
                          <td>Coolant pressure drop across channels must not exceed 45 kPa at 8 L/min flow rate.</td>
                          <td>Analysis (CFD) / Inspection</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2.11 System Engineering Workflow */}
              <div id="part-2-11" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.11 System Engineering Workflow</h3>
                  <span className={styles.orientationAnchorBadge}>P2.11</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  The battery engineering workflow maps directly onto the systems engineering V-model. Designing a pack isn't just about putting cells in a container; it's a structured flow from requirements definition to hardware and software verification gates:
                </p>

                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h4 style={{ color: "#fff", fontSize: "0.9rem", marginBottom: "10px" }}>🔄 The V-Model Battery Engineering Gates</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                    {[
                      { gate: "1. System Concept & Requirements Definition", detail: "Translate customer voices to REQ specification targets (electrical, thermal, mechanical constraints)." },
                      { gate: "2. Preliminary Design Review (PDR)", detail: "Align cell selections, pack envelopes, thermal liquid maps, and simulation calculations." },
                      { gate: "3. Detailed Design Review (DDR)", detail: "Finalize CAD prints, busbar cross-sections, BMS daisy-chain architecture, and safety mitigation layouts." },
                      { gate: "4. Verification (V1 Testing)", detail: "Perform Hardware-in-the-Loop (HIL) BMS code runs, mechanical vibrations (UN 38.3), and IP chamber validation." },
                      { gate: "5. Final Validation (V2 Sign-off)", detail: "Execute crash testing, vehicle-level track endurance, fast-charge testing, and regulatory certification approvals." }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "12px", borderLeft: "2px solid var(--accent-primary)", paddingLeft: "12px" }}>
                        <div>
                          <strong style={{ color: "#fff", display: "block" }}>{item.gate}</strong>
                          <span style={{ color: "var(--text-secondary)" }}>{item.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2.12 Beginner Engineering Exercises */}
              <div id="part-2-12" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.12 Beginner Engineering Exercises</h3>
                  <span className={styles.orientationAnchorBadge}>P2.12</span>
                </div>
                
                <div className={styles.exerciseCard}>
                  <div className={styles.exerciseHeader}>
                    <span className={styles.exerciseBadge}>EXERCISE 1</span>
                    <h4 className={styles.exerciseTitle}>Delivery Vehicle Energy Sizing</h4>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "10px 0" }}>
                    A postal delivery van requires a range of 150 miles per day. Sizing calculations estimate its energy consumption at 420 Wh/mile. Sizing margins dictate keeping a 10% lower buffer (prevent over-discharge) and a 5% upper buffer (prevent over-charge). Calculate the total nominal energy capacity required for the pack.
                  </p>
                  
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPart2ExerciseSolutions(prev => ({ ...prev, 1: !prev[1] }))}
                    style={{ marginTop: "8px" }}
                  >
                    {part2ExerciseSolutions[1] ? "Hide Solution ▲" : "Reveal Solution ▼"}
                  </button>

                  {part2ExerciseSolutions[1] && (
                    <div style={{ marginTop: "12px", padding: "12px", borderTop: "1px dashed rgba(255,255,255,0.1)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "#fff", display: "block", marginBottom: "4px" }}>Step-by-Step Solution:</strong>
                      1. Calculate Usable Energy Required:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Usable Energy = Range &times; Consumption Rate = 150 miles &times; 420 Wh/mile = 63,000 Wh = 63 kWh.<br /><br />
                      2. Calculate Total Capacity Buffer Factor:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Usable buffer is bounded between 10% and 95% of SOC. Usable window = 95% - 10% = 85% (or 0.85).<br /><br />
                      3. Calculate Total Nominal Capacity:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Nominal Energy = Usable Energy / Usable Window = 63 kWh / 0.85 &asymp; 74.12 kWh.<br /><br />
                      <strong style={{ color: "var(--accent-primary)" }}>Nominal Capacity Target: 74.2 kWh</strong>
                    </div>
                  )}
                </div>

                <div className={styles.exerciseCard} style={{ marginTop: "1.25rem" }}>
                  <div className={styles.exerciseHeader}>
                    <span className={styles.exerciseBadge}>EXERCISE 2</span>
                    <h4 className={styles.exerciseTitle}>Continuous C-Rate Charging Estimation</h4>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "10px 0" }}>
                    An electric scooter has a 60V, 30Ah battery pack. The manufacturer wants to charge the battery from 20% to 80% SOC in 45 minutes using a steady current. Calculate the continuous charge current in Amperes, and the corresponding C-rate.
                  </p>
                  
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPart2ExerciseSolutions(prev => ({ ...prev, 2: !prev[2] }))}
                    style={{ marginTop: "8px" }}
                  >
                    {part2ExerciseSolutions[2] ? "Hide Solution ▲" : "Reveal Solution ▼"}
                  </button>

                  {part2ExerciseSolutions[2] && (
                    <div style={{ marginTop: "12px", padding: "12px", borderTop: "1px dashed rgba(255,255,255,0.1)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "#fff", display: "block", marginBottom: "4px" }}>Step-by-Step Solution:</strong>
                      1. Calculate capacity charge transfer required:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;ΔSOC = 80% - 20% = 60% = 0.60.<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Capacity charged = 30 Ah &times; 0.60 = 18 Ah.<br /><br />
                      2. Calculate charging current needed:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Time = 45 minutes = 0.75 hours.<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Current = Capacity / Time = 18 Ah / 0.75 h = 24 A.<br /><br />
                      3. Calculate C-rate:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;C-rate = Current / Total Nominal Capacity = 24 A / 30 Ah = 0.8C.<br /><br />
                      <strong style={{ color: "var(--accent-primary)" }}>Current Target: 24A at 0.8C Charge Rate</strong>
                    </div>
                  )}
                </div>

                <div className={styles.exerciseCard} style={{ marginTop: "1.25rem" }}>
                  <div className={styles.exerciseHeader}>
                    <span className={styles.exerciseBadge}>EXERCISE 3</span>
                    <h4 className={styles.exerciseTitle}>Second-Life SOH Degradation Evaluation</h4>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "10px 0" }}>
                    A module of 12 parallel cells undergoes static testing. The original cell capacity was 5.0 Ah. Testing shows the current capacity of the module is 46.2 Ah. Calculate the current SOH of the module and classify if it is Grade A, Grade B, or must be recycled (using thresholds: Grade A &ge; 80%, Grade B &ge; 70%).
                  </p>
                  
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPart2ExerciseSolutions(prev => ({ ...prev, 3: !prev[3] }))}
                    style={{ marginTop: "8px" }}
                  >
                    {part2ExerciseSolutions[3] ? "Hide Solution ▲" : "Reveal Solution ▼"}
                  </button>

                  {part2ExerciseSolutions[3] && (
                    <div style={{ marginTop: "12px", padding: "12px", borderTop: "1px dashed rgba(255,255,255,0.1)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "#fff", display: "block", marginBottom: "4px" }}>Step-by-Step Solution:</strong>
                      1. Calculate Original Module Capacity:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;Original Capacity = 12 cells &times; 5.0 Ah/cell = 60.0 Ah.<br /><br />
                      2. Calculate Module State of Health (SOH):<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;SOH = (Current Capacity / Original Capacity) &times; 100 = (46.2 Ah / 60.0 Ah) &times; 100 = 77.0%.<br /><br />
                      3. Classify module based on SOH:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;SOH is 77%. Since 70% &le; 77% &lt; 80%, the module falls into Grade B.<br /><br />
                      <strong style={{ color: "var(--accent-primary)" }}>SOH: 77% (Classified as Grade B for Stationary ESS)</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* 2.13 Key Engineering Takeaways */}
              <div id="part-2-13" style={{ scrollMarginTop: "100px", marginBottom: "3rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.13 Key Engineering Takeaways</h3>
                  <span className={styles.orientationAnchorBadge}>P2.13</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <strong style={{ color: "var(--accent-primary)", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>1. Requirements First</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                      You cannot design a battery pack in a vacuum. Always start by capturing structural packaging boundaries, voltage demands, thermal operating bounds, and continuous charging targets.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "1.25rem" }}>
                    <strong style={{ color: "var(--accent-primary)", display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>2. Design is a Compromise</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                      Every choice is a tradeoff. Maximizing range (NMC) increases costs and chemical hazards; maximizing safety and lifecycle (LFP) compromises packaging weight and cold temperature efficiency.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2.14 Navigation to Part 3 */}
              <div id="part-2-14" style={{ scrollMarginTop: "100px", marginBottom: "2rem" }}>
                <div className={styles.orientationSectionHeader}>
                  <h3 className={styles.orientationSubTitle}>2.14 Navigation to Part 3</h3>
                  <span className={styles.orientationAnchorBadge}>P2.14</span>
                </div>
                
                <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent-primary)" }}>
                  <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: "8px" }}>Next: Part 3 — Cell Chemistry and Cell Selection</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    Now that you understand system definitions and requirements engineering, the next architectural step is cell evaluation. In Part 3, we will analyze NMC, LFP, Sodium-Ion, and Solid-State electrochemistries, cell formats (cylindrical, prismatic, pouch), and grading procedures.
                  </p>
                  <a 
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo("masterIndex");
                    }}
                    className="btn btn-primary" 
                    style={{ textDecoration: "none", display: "inline-block", cursor: "pointer" }}
                  >
                    Go to Master Index →
                  </a>
                </div>
              </div>

              {/* Footer navigation for Part 2 */}
              <div className={styles.chapterNav}>
                <div 
                  className={styles.chapterNavLink} 
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("part1Fundamentals");
                  }}
                >
                  <span className={styles.chapterNavLabel}>Previous Part</span>
                  <span className={styles.chapterNavTitle}>Part 1: Battery Fundamentals</span>
                </div>
                <div 
                  className={styles.chapterNavLink} 
                  style={{ alignItems: "flex-end", cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("masterIndex");
                  }}
                >
                  <span className={styles.chapterNavLabel}>Next Part</span>
                  <span className={styles.chapterNavTitle}>Part 3: Cell Chemistry and Selection</span>
                </div>
              </div>

            </div>}
          </section>

          {/* ═══ PREREQUISITE KNOWLEDGE MATRIX ═══ */}
          <section id="prerequisiteMatrix" className={styles.pageSection} ref={sectionRefs.prerequisiteMatrix}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Learning Layer — Prerequisites</span>
              <h2 className={styles.sectionTitle}>Prerequisite Knowledge Matrix</h2>
              <p className={styles.sectionSubtitle}>
                Map your existing knowledge to this handbook's learning levels. Each node below shows what to review before entering that domain.
              </p>
            </div>
            <div className={styles.prereqLevelGrid}>
              {PREREQ_MATRIX.map((node) => (
                <div
                  key={node.id}
                  className={styles.prereqLevelCard}
                  style={{ borderLeft: `3px solid ${node.level === "Foundational" ? "var(--accent-primary)" : node.level === "Core Engineering" ? "#38bdf8" : "#a855f7"}` }}
                >
                  <div className={`${styles.prereqLevelLabel} ${node.level === "Foundational" ? styles.prereqBeginner : node.level === "Core Engineering" ? styles.prereqCore : styles.prereqArchitect}`}>
                    {node.level}
                  </div>
                  <div className={styles.prereqLevelName}>{node.name}</div>
                  <p className={styles.prereqLevelDesc}>{node.desc}</p>
                  {node.refresherBadge && (
                    <span style={{ fontSize: "0.65rem", color: "var(--accent-primary)", fontWeight: 700, marginTop: "0.5rem", display: "block" }}>
                      {node.refresherBadge}
                    </span>
                  )}
                  {node.prereqs.length > 0 && (
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      Needs: {node.prereqs.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ═══ TOOLS AND SOFTWARE ECOSYSTEM ═══ */}
          <section id="toolsEcosystem" className={styles.pageSection} ref={sectionRefs.toolsEcosystem}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Practical Layer — Tools</span>
              <h2 className={styles.sectionTitle}>Tools and Software Ecosystem</h2>
              <p className={styles.sectionSubtitle}>
                The software and hardware tool chain used across this handbook, organized by who needs what. Beginners start with mandatory tools only.
              </p>
            </div>

            {/* Tier legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "1.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem" }}>
                <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(76,169,48,0.15)", border: "1px solid rgba(76,169,48,0.35)", color: "var(--accent-primary)", fontWeight: 700, fontSize: "0.7rem" }}>Mandatory</span>
                <span style={{ color: "var(--text-muted)" }}>Required from Part 0 — install before you start</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem" }}>
                <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", fontWeight: 700, fontSize: "0.7rem" }}>Optional</span>
                <span style={{ color: "var(--text-muted)" }}>Needed for engineer/architect parts — install when you reach them</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem" }}>
                <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7", fontWeight: 700, fontSize: "0.7rem" }}>Awareness Only</span>
                <span style={{ color: "var(--text-muted)" }}>Industry tools — good to know exist, not required for this handbook</span>
              </div>
            </div>

            <div className={styles.toolCategoryFilter}>
              {["all", "electronics", "firmware", "simulation", "mechanical", "cloud", "general"].map((cat) => (
                <button
                  key={cat}
                  className={activeToolCategory === cat ? styles.toolFilterBtnActive : styles.toolFilterBtn}
                  onClick={() => setActiveToolCategory(cat)}
                >
                  {cat === "all" ? "All Tools" : cat}
                </button>
              ))}
            </div>

            <div className={styles.toolsGrid}>
              {TOOLS_ECOSYSTEM.filter(t => activeToolCategory === "all" || t.category === activeToolCategory).map((tool) => (
                <div key={tool.name} className={styles.toolCard}>
                  <div className={styles.toolCardHeader}>
                    <span className={styles.toolCardName}>{tool.name}</span>
                    <span className={`${styles.toolCardBadge} ${tool.requirement === "Mandatory" ? styles.toolCardMandatory : tool.requirement === "Optional" ? styles.toolCardOptional : styles.toolCardAwareness}`}>
                      {tool.requirement}
                    </span>
                  </div>
                  <p className={styles.toolCardDesc}>{tool.purpose}</p>
                  <div className={styles.toolCardMeta}>
                    <span>📶 {tool.level}</span>
                    <span>📄 {tool.license}</span>
                    <span>💻 {tool.macOS}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ HARDWARE LAB SAFETY ═══ */}
          <section id="labSafety" className={styles.pageSection} ref={sectionRefs.labSafety}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Certification Layer — Safety</span>
              <h2 className={styles.sectionTitle}>Hardware Lab Safety and Engineering Discipline</h2>
              <p className={styles.sectionSubtitle}>
                Before touching any live battery hardware, complete this pre-lab safety protocol. Check every item before entering the high-voltage lab.
              </p>
            </div>

            <div className={styles.safetyWarning}>
              <div className={styles.blockHeader}>
                <AlertTriangle size={16} /> Critical Safety Requirement
              </div>
              All high-voltage battery lab work requires completion of this checklist. Never work alone on live packs above 60V DC. Thermal runaway risk is real — treat every cell as potentially live.
            </div>

            <div className={styles.safetyCheckGrid}>
              {[
                { key: "ppe", label: "PPE Verified", note: "Insulated gloves (Class 0 min), face shield, arc-rated jacket, ESD wrist strap." },
                { key: "tools", label: "Insulated Tools Only", note: "All tools rated 1000V+. No bare metal contact with positive terminal." },
                { key: "extinguisher", label: "Fire Suppression Ready", note: "Use fire suppression appropriate for the battery chemistry and local regulations — consult trained safety personnel. A CO₂ or dry powder extinguisher is typically nearby." },
                { key: "extraction", label: "Ventilation Active", note: "Lab ventilation running. Thermal runaway releases toxic HF gas — extraction fan mandatory." },
                { key: "discharging", label: "Pack Discharged to Safe SoC", note: "Pack SoC below 30% for disassembly. Measure OCV before opening enclosure." },
                { key: "transport", label: "Safe Transport Protocol", note: "Lithium packs transported in fire-rated containment bag. Never in unsealed containers." },
              ].map(({ key, label, note }) => (
                <div
                  key={key}
                  className={safetyChecklist[key] ? styles.safetyCheckItemChecked : styles.safetyCheckItem}
                  onClick={() => setSafetyChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                  role="checkbox"
                  aria-checked={safetyChecklist[key]}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && setSafetyChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <div className={safetyChecklist[key] ? styles.safetyCheckBoxChecked : styles.safetyCheckBox}>
                    {safetyChecklist[key] ? "✓" : ""}
                  </div>
                  <div>
                    <div className={styles.safetyCheckLabel}>{label}</div>
                    <div className={styles.safetyCheckNote}>{note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <div className={styles.engineeringNote}>
                <div className={styles.blockHeader}><Zap size={15} /> Architect Insight</div>
                Industry labs enforce a "buddy system" — no solo work on packs above 48V. Build this habit early. A second engineer with a clear line of sight to the work area is non-negotiable in professional environments.
              </div>
            </div>
          </section>

          {/* ═══ ENGINEERING REVIEW GATES ═══ */}
          <section id="reviewGates" className={styles.pageSection} ref={sectionRefs.reviewGates}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Certification Layer — Gates</span>
              <h2 className={styles.sectionTitle}>Engineering Review Gates</h2>
              <p className={styles.sectionSubtitle}>
                Each gate marks a formal engineering checkpoint before advancing to the next phase. Click a gate to see its exit criteria.
              </p>
            </div>

            <div className={styles.gateGrid}>
              {REVIEW_GATES.map((gate, idx) => (
                <div
                  key={idx}
                  className={selectedGate === idx ? styles.gateCardActive : styles.gateCard}
                  onClick={() => setSelectedGate(idx)}
                >
                  <div className={styles.gateCardNum}>Gate {gate.gateNum} — {gate.abbr}</div>
                  <div className={styles.gateCardTitle}>{gate.name}</div>
                  <p className={styles.gateCardDesc}>{gate.goal}</p>
                </div>
              ))}
            </div>

            {REVIEW_GATES[selectedGate] && (
              <div className={styles.chapterBox} style={{ marginTop: "2rem" }}>
                <div className={styles.chapterTitle}>Gate {REVIEW_GATES[selectedGate].gateNum} — {REVIEW_GATES[selectedGate].name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  {REVIEW_GATES[selectedGate].checksheet.map((item, ci) => (
                    <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{item.item}</div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>Owner: {item.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {REVIEW_GATES[selectedGate].metrics.length > 0 && (
                  <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, width: "100%", marginBottom: "0.25rem" }}>Key Metrics</span>
                    {REVIEW_GATES[selectedGate].metrics.map((m, mi) => (
                      <span key={mi} className={styles.pathwayFocusTag}>{m}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ═══ READINESS CHECKLIST / CAPSTONE OVERVIEW ═══ */}
          <section id="readinessChecklist" className={styles.pageSection} ref={sectionRefs.readinessChecklist}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Certification Layer — Assessment</span>
              <h2 className={styles.sectionTitle}>Capstone Output Overview and Readiness Checklist</h2>
              <p className={styles.sectionSubtitle}>
                The capstone project is a full end-to-end battery pack design submission evaluated by an industry jury. Here is what you will produce.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {[
                { icon: "📐", title: "CAD Pack Enclosure Model", desc: "Full 3D cell-to-pack mechanical assembly with IP68 sealing, cell compression fixtures, and CTP structural integration." },
                { icon: "⚡", title: "Electrical Schematic", desc: "Complete HV busbar layout, contactor/fuse coordination diagram, and BMS master-slave schematic in KiCad." },
                { icon: "🌡️", title: "Thermal Analysis Report", desc: "CFD cold-plate simulation results showing temperature distribution under 2C continuous charge and 4C peak discharge." },
                { icon: "🛡️", title: "Safety Compliance Matrix", desc: "UN 38.3, ECE R100 Rev.3, and ISO 26262 compliance checklist with evidence references for each test category." },
                { icon: "🧠", title: "BMS Firmware Demo", desc: "Running SOC estimation (EKF or Coulomb counting) with CAN bus logging of cell voltages and temperatures." },
                { icon: "📊", title: "Telemetry Dashboard", desc: "Grafana dashboard showing live pack telemetry from MQTT broker — voltage, temperature, SOC, and fault flags." },
              ].map((item, i) => (
                <div key={i} className={styles.capstoneCard}>
                  <div className={styles.capstoneCardHeader}>
                    <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                    <span className={styles.capstoneCardTitle}>{item.title}</span>
                  </div>
                  <p className={styles.capstoneCardDesc}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.engineeringNote}>
              <div className={styles.blockHeader}><BookOpen size={15} /> Jury Evaluation Criteria</div>
              Submissions are scored on: technical accuracy (40%), design completeness (30%), safety analysis depth (20%), and presentation clarity (10%). All deliverables must be submitted as a GitHub repository with a structured README.
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
                <strong>Critical Safety Warning:</strong> Never work alone on live high-voltage battery packs above 60V DC. Always use certified PPE and ground isolation. Fire suppression should be appropriate for the battery chemistry and local regulations — consult trained safety personnel before working in a lab environment. Second-life and unknown-history packs must be treated as unknown-risk systems until fully tested.
              </SafetyWarning>
            </div>
          </section>

          {/* AUTHOR & ARCHITECT BLOCK */}
          <section className={styles.pageSection} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4rem", paddingBottom: "2rem" }}>
            <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="glass-panel" style={{ padding: "2rem", borderLeft: "4px solid var(--accent-primary)", textAlign: "left" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "1px" }}>EV.ENGINEER™</p>
                <h3 style={{ fontSize: "1.8rem", marginBottom: "8px", color: "#fff", fontWeight: 700 }}>Sudarshana Karkala</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>Co-Founder, Principal Architect | Thasmai Infotech Private Limited</p>
                <div style={{
                  display: "inline-block",
                  fontSize: "0.85rem",
                  padding: "8px 14px",
                  marginBottom: "16px",
                  borderRadius: "6px",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))",
                  borderLeft: "3px solid var(--accent-primary)",
                  color: "#fff"
                }}>
                  Available for strategic architectural consulting and advanced automotive R&D partnerships.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", flexWrap: "wrap" }}>
                  <a href="tel:+919845561518" style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>📞</span> +91 9845561518
                  </a>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
                  <a href="https://www.linkedin.com/in/sudarshanakarkala/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🔗</span> LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>

    </div>
  );
}
