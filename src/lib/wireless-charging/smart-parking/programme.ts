// The three independent timelines of the Smart Parking work. They are kept
// apart on purpose: the eight-month practical workshop (content.ts, unchanged)
// teaches; the software phases 4A–4I build this environment; the 24-month
// physical research programme builds and validates the shelter. None replaces
// another. Statuses are honest: the physical programme has not started.
import type { ValidationStatus } from "../registry";

export interface Milestone {
  id: string;
  period: string;
  title: string;
  deliverables: string[];
  verification: string;
  evidence: string;
  status: ValidationStatus | "Not started" | "In progress";
}

export const SOFTWARE_PHASES: readonly Milestone[] = [
  { id: "4A", period: "Phase 4A", title: "Requirements and architecture", deliverables: ["Baseline requirements preserved", "Shared-model map", "State machine", "Session integration", "Hardware interfaces", "Traceability matrix"], verification: "Every baseline requirement traced; nothing omitted", evidence: "SMART_PARKING_REQUIREMENTS_TRACEABILITY.md", status: "Implemented" },
  { id: "4B", period: "Phase 4B", title: "Mathematical parking engine", deliverables: ["Arrivals", "Occupancy", "Queueing", "Reservations", "Allocation", "Lifecycle", "Billing"], verification: "SP-A01–A08, SP-B01–B05 pass before the 3D layer", evidence: "smart-parking.test.ts, engine.test.ts", status: "Tested" },
  { id: "4C", period: "Phase 4C", title: "Premium 3D facility", deliverables: ["Shelter", "Bays", "Vehicles", "Barriers", "Sensors", "Cameras", "Guidance", "Lighting", "Solar", "Cinematic shots"], verification: "Visual review at three viewport sizes; browser checks", evidence: "screenshots/phase-4/", status: "Implemented" },
  { id: "4D", period: "Phase 4D", title: "IoT and AI", deliverables: ["Sensor messages", "Identification adapters", "Fusion", "Communication faults", "Edge gateway", "Forecast baseline", "Anomaly detection"], verification: "SP-B06, B08, B19, B20, SP-A10, A12", evidence: "Engineering Assurance", status: "Tested" },
  { id: "4E", period: "Phase 4E", title: "Wireless charging integration", deliverables: ["Charging-aware allocation", "Compatibility verification", "Station session adapter", "Energy accounting", "Safe departure", "Transition to the Station"], verification: "SP-B11–B15", evidence: "Engineering Assurance", status: "Tested" },
  { id: "4F", period: "Phase 4F", title: "Environmental and energy management", deliverables: ["Thermal model", "Monitoring", "Ventilation", "Lighting", "Solar", "Storage", "Dispatch"], verification: "SP-A04–A06, SP-B09, B10", evidence: "Engineering Assurance", status: "Tested" },
  { id: "4G", period: "Phase 4G", title: "Guided learning and research", deliverables: ["Eighteen stages", "Component inspector", "Physics & Mathematics lesson", "Experiments", "Driver and operator workflows", "Reports"], verification: "Stage tests; browser checks", evidence: "laboratory.test.tsx, scripts/test-wireless-ev-twin.cjs", status: "Implemented" },
  { id: "4H", period: "Phase 4H", title: "Physical POC development package", deliverables: ["Hardware architecture", "BOM", "Firmware plan", "Interfaces", "MQTT schemas", "Installation plan", "Safety plan", "Test procedures"], verification: "Team review", evidence: "SMART_PARKING_POC_BOM.md, HARDWARE_PLAN.md, IOT_ARCHITECTURE.md, TEST_PLAN.md", status: "Designed" },
  { id: "4I", period: "Phase 4I", title: "Verification and acceptance", deliverables: ["Scientific verification", "Unit, integration and browser tests", "Performance", "Visual acceptance", "Regression", "Documentation"], verification: "Full suites; EV.ENGINEER™ team acceptance", evidence: "SMART_PARKING_IMPLEMENTATION_REPORT.md", status: "In progress" },
];

export const PHYSICAL_PROGRAMME: readonly Milestone[] = [
  { id: "M1-2", period: "Months 1–2", title: "Requirements, feasibility and architecture", deliverables: ["Site survey", "Functional and safety requirements", "System architecture", "Feasibility and risk register"], verification: "Requirements review", evidence: "Survey report, requirements baseline", status: "Not started" },
  { id: "M3-4", period: "Months 3–4", title: "Physical shelter and structural design", deliverables: ["Dimensional layout", "Structural concept and calculations (qualified engineer)", "Drainage and cable routing", "Fabrication drawings"], verification: "Design review; structural sign-off by a qualified engineer", evidence: "Drawings, calculations", status: "Not started" },
  { id: "M5-6", period: "Months 5–6", title: "Hardware and materials procurement", deliverables: ["Detailed BOM with quotations", "Funding and procurement checks", "Purchase records"], verification: "Budget within the approved allocation", evidence: "Procurement records", status: "Not started" },
  { id: "M7-8", period: "Months 7–8", title: "Shelter fabrication", deliverables: ["Miniature shelter and track", "Mounting points", "Cable trays"], verification: "Dimensional inspection", evidence: "Inspection record, photographs", status: "Not started" },
  { id: "M9-10", period: "Months 9–10", title: "IoT and embedded integration", deliverables: ["ESP32 firmware", "Sensor installation", "MQTT broker", "Device identity scheme"], verification: "Sensor calibration; message integrity tests", evidence: "Calibration records, logs", status: "Not started" },
  { id: "M11-12", period: "Months 11–12", title: "AI-based vehicle detection and identification", deliverables: ["Labelled synthetic-plate dataset", "Detector and OCR evaluation", "Edge deployment"], verification: "Accuracy on a declared test set (target ≥ 95 %)", evidence: "Evaluation report with dataset provenance", status: "Not started" },
  { id: "M13-14", period: "Months 13–14", title: "Intelligent allocation and automated access", deliverables: ["Allocation service", "Barrier and reader integration", "Interlock tests"], verification: "No unsafe closure in obstruction tests; no double allocation", evidence: "Test records", status: "Not started" },
  { id: "M15-16", period: "Months 15–16", title: "Centralised dashboard and database", deliverables: ["Cloud database and APIs", "Operator dashboard", "Twin synchronisation"], verification: "p95 sensor-to-dashboard latency < 1 s on the local network", evidence: "Latency measurements", status: "Not started" },
  { id: "M17-18", period: "Months 17–18", title: "Complete hardware and software integration", deliverables: ["End-to-end lifecycle on the prototype", "Low-voltage wireless link telemetry"], verification: "Entry-to-exit runs", evidence: "Run logs", status: "Not started" },
  { id: "M19-20", period: "Months 19–20", title: "Testing and validation", deliverables: ["Occupancy accuracy (target ≥ 98 %)", "Recognition accuracy", "Offline and recovery tests", "Model-versus-measurement residuals"], verification: "Acceptance criteria declared before testing", evidence: "Validation report", status: "Not started" },
  { id: "M21-22", period: "Months 21–22", title: "Physical deployment, demonstration and optimisation", deliverables: ["Site demonstration", "Operator training", "Tuning"], verification: "Deployment validation plan", evidence: "Demonstration records", status: "Not started" },
  { id: "M23-24", period: "Months 23–24", title: "Final validation, documentation, potential publications and IP assessment", deliverables: ["Final report", "Publication drafts (acceptance not guaranteed)", "IP assessment under the applicable agreements"], verification: "Review", evidence: "Final documentation", status: "Not started" },
];
