/**
 * How the system is engineered, built, proved and improved.
 *
 * These are lifecycle descriptions at architecture and process level. They
 * describe what happens and what evidence it leaves — never how to build
 * propulsion hardware.
 */

export type LifecyclePhase = "engineer" | "build" | "prove" | "improve";

export const PHASE_LABEL: Record<LifecyclePhase, string> = {
  engineer: "Engineer",
  build: "Build",
  prove: "Prove",
  improve: "Improve",
};

/** ENGINEER → BUILD → PROVE → IMPROVE. */
export const ENGINEERING_PHILOSOPHY: readonly { phase: LifecyclePhase; summary: string; items: string[] }[] = [
  { phase: "engineer", summary: "Decide what must be true.", items: ["Requirements", "Architecture", "Interfaces", "Analysis", "Simulation"] },
  { phase: "build", summary: "Make it, and record what was made.", items: ["Detailed design", "Manufacturing", "Assembly", "Firmware", "Software", "Instrumentation"] },
  { phase: "prove", summary: "Show it with evidence.", items: ["Inspection", "Component testing", "Subsystem testing", "Engine testing", "HIL", "Integrated testing"] },
  { phase: "improve", summary: "Learn, and change the baseline.", items: ["Compare", "Investigate", "Update model", "Update hardware", "Retest"] },
];

/** From requirement to verified engine. */
export const ENGINE_FLOW: readonly { id: string; label: string; phase: LifecyclePhase; detail: string }[] = [
  { id: "mission-need", label: "Mission need", phase: "engineer", detail: "The job the engine must do for the vehicle." },
  { id: "engine-requirements", label: "Engine requirements", phase: "engineer", detail: "Verifiable statements of thrust class, operation, interfaces and safety." },
  { id: "architecture", label: "Architecture", phase: "engineer", detail: "The cycle and functional blocks chosen to meet them." },
  { id: "subsystem-definition", label: "Subsystem definition", phase: "engineer", detail: "Each block's requirements and interfaces." },
  { id: "analysis", label: "Analysis", phase: "engineer", detail: "First-order performance, thermal and structural margins." },
  { id: "simulation", label: "Simulation", phase: "engineer", detail: "Behaviour explored across operating scenarios." },
  { id: "detailed-design", label: "Detailed design", phase: "build", detail: "Drawings, models and bills of material under configuration control." },
  { id: "manufacturing", label: "Manufacturing", phase: "build", detail: "Parts made with recorded processes." },
  { id: "inspection", label: "Inspection", phase: "prove", detail: "Parts shown to match their drawings." },
  { id: "assembly", label: "Assembly", phase: "build", detail: "Built to a recorded configuration." },
  { id: "instrumentation", label: "Instrumentation", phase: "build", detail: "Sensors fitted, calibrated and mapped to channels." },
  { id: "component-test", label: "Component test", phase: "prove", detail: "Individual parts and assemblies tested on their own." },
  { id: "engine-test", label: "Engine test", phase: "prove", detail: "The integrated engine tested to a written objective." },
  { id: "data-correlation", label: "Data correlation", phase: "improve", detail: "Measured results compared with prediction." },
  { id: "engineering-decision", label: "Engineering decision", phase: "improve", detail: "Accept, investigate or change — decided by APEX." },
  { id: "iteration", label: "Iteration", phase: "improve", detail: "A new baseline, and the next test." },
];

/** The signature loop. */
export const SIGNATURE_LOOP: readonly { id: string; label: string; detail: string }[] = [
  { id: "design", label: "Design", detail: "Requirements become an architecture and a configuration-controlled design." },
  { id: "simulate", label: "Simulate", detail: "Models predict how the hardware should behave in the planned test." },
  { id: "build", label: "Build", detail: "Hardware is made and assembled, and the as-built configuration recorded." },
  { id: "instrument", label: "Instrument", detail: "Sensors, signal conditioning and DAQ make behaviour measurable and time-aligned." },
  { id: "test", label: "Test", detail: "A physical test runs to a written objective and procedure." },
  { id: "correlate", label: "Correlate", detail: "Measured data is compared with prediction for the same configuration." },
  { id: "improve", label: "Improve", detail: "The model, the hardware or both are updated — then the loop runs again." },
];

/** The detailed closed loop behind the signature. */
export const CLOSED_LOOP: readonly string[] = [
  "Requirements",
  "Design",
  "Digital model",
  "Predict",
  "Build hardware",
  "Instrument",
  "Physical test",
  "Measure",
  "Compare",
  "Engineering review",
  "Model update / hardware update",
  "Retest",
];

export interface LifecycleNode {
  id: string;
  label: string;
  phase: LifecyclePhase;
  happens: string;
  deliverable: string;
  evidence: string;
  /** Capability ids; the partners come from the capability model. */
  capabilityIds: string[];
}

/** From mission to flight: one continuous engineering lifecycle. */
export const MISSION_TO_FLIGHT: readonly LifecycleNode[] = [
  { id: "mission-need", label: "Mission need", phase: "engineer", happens: "The customer and mission problem the vehicle must solve is defined.", deliverable: "Mission need statement", evidence: "Reviewed mission concept", capabilityIds: ["system-architecture"] },
  { id: "mission-requirements", label: "Mission requirements", phase: "engineer", happens: "The mission is turned into measurable requirements.", deliverable: "Mission requirements", evidence: "Requirements review record", capabilityIds: ["system-architecture", "systems-engineering"] },
  { id: "system-requirements", label: "System requirements", phase: "engineer", happens: "Mission requirements flow down to the vehicle and ground system.", deliverable: "System requirements specification", evidence: "Traceability matrix", capabilityIds: ["systems-engineering", "system-architecture"] },
  { id: "system-architecture", label: "System architecture", phase: "engineer", happens: "Subsystems, interfaces and allocations are chosen.", deliverable: "Architecture baseline and interface definitions", evidence: "Architecture review record", capabilityIds: ["system-architecture", "systems-engineering"] },
  { id: "subsystem-design", label: "Subsystem design", phase: "engineer", happens: "Each subsystem is designed against its allocated requirements.", deliverable: "Subsystem design descriptions", evidence: "Preliminary design review package", capabilityIds: ["propulsion", "structures", "avionics", "embedded-firmware", "gnc"] },
  { id: "detailed-design", label: "Detailed design", phase: "build", happens: "Drawings, models and bills of material are released.", deliverable: "Released drawings and BOMs", evidence: "Critical design review package", capabilityIds: ["propulsion", "structures", "mechanical-systems", "systems-engineering"] },
  { id: "simulation", label: "Simulation", phase: "engineer", happens: "Behaviour is predicted across operating and mission scenarios.", deliverable: "Analysis and simulation reports", evidence: "Model verification records", capabilityIds: ["simulation", "gnc", "research-academia"] },
  { id: "digital-twin", label: "Digital Twin", phase: "engineer", happens: "Models are tied to the exact hardware configuration to be tested.", deliverable: "Configuration-linked twin model", evidence: "Model revision tied to hardware baseline", capabilityIds: ["digital-twin", "test-data"] },
  { id: "procurement", label: "Procurement", phase: "build", happens: "Materials and components are bought from approved sources.", deliverable: "Purchase records and certificates", evidence: "Certificates of conformity", capabilityIds: ["supply-chain", "materials"] },
  { id: "manufacturing", label: "Manufacturing", phase: "build", happens: "Parts are made with recorded processes.", deliverable: "Manufactured parts with travellers", evidence: "Process and traveller records", capabilityIds: ["aerospace-manufacturing", "precision-machining", "welding-brazing", "special-processes"] },
  { id: "inspection", label: "Inspection", phase: "prove", happens: "Parts are inspected against their drawings.", deliverable: "Inspection and FAI reports", evidence: "Records tied to serial numbers", capabilityIds: ["manufacturing-quality", "ndt", "digital-quality-thread"] },
  { id: "software-development", label: "Software development", phase: "build", happens: "Ground, test and flight software is developed and verified.", deliverable: "Software releases", evidence: "Test results tied to each release", capabilityIds: ["software-engineering", "ground-software", "cybersecurity"] },
  { id: "firmware-development", label: "Firmware development", phase: "build", happens: "Controller firmware is developed, signed and released.", deliverable: "Firmware baseline", evidence: "Unit, interface and integration test results", capabilityIds: ["embedded-firmware", "engine-control", "cybersecurity"] },
  { id: "component-testing", label: "Component testing", phase: "prove", happens: "Individual components are tested against their requirements.", deliverable: "Component test reports", evidence: "Data, anomalies and dispositions", capabilityIds: ["integration-test-authority", "propulsion-test-infrastructure", "sensors-instrumentation"] },
  { id: "subsystem-testing", label: "Subsystem testing", phase: "prove", happens: "Assemblies are tested as working subsystems.", deliverable: "Subsystem test reports", evidence: "Predicted-vs-measured comparison", capabilityIds: ["integration-test-authority", "environmental-testing", "structural-test-labs", "digital-twin"] },
  { id: "hil", label: "Hardware-in-the-loop", phase: "prove", happens: "Real controllers and firmware run against a simulated vehicle and environment.", deliverable: "HIL test campaign", evidence: "HIL results per firmware release", capabilityIds: ["embedded-firmware", "simulation", "avionics", "gnc"] },
  { id: "system-integration", label: "System integration", phase: "build", happens: "Subsystems are integrated into the vehicle.", deliverable: "Integrated vehicle", evidence: "Integration records and as-built configuration", capabilityIds: ["integration-test-authority", "mechanical-systems", "systems-engineering"] },
  { id: "integrated-vehicle-test", label: "Integrated vehicle test", phase: "prove", happens: "The vehicle is tested as one system.", deliverable: "Integrated test reports", evidence: "System-level data and dispositions", capabilityIds: ["integration-test-authority", "emi-emc", "environmental-testing"] },
  { id: "ground-system-test", label: "Ground system test", phase: "prove", happens: "GSE, ground software and communications are tested end to end.", deliverable: "Ground system test reports", evidence: "End-to-end test records", capabilityIds: ["gse", "ground-software", "rf-telemetry"] },
  { id: "mission-simulation", label: "Mission simulation", phase: "prove", happens: "The full mission is rehearsed in simulation and with the ground team.", deliverable: "Mission rehearsal reports", evidence: "Rehearsal records", capabilityIds: ["simulation", "gnc", "launch-operations"] },
  { id: "flight-readiness", label: "Flight readiness", phase: "prove", happens: "The accumulated evidence is reviewed against flight criteria.", deliverable: "Flight readiness decision", evidence: "Readiness review record", capabilityIds: ["integration-test-authority", "regulatory-safety", "systems-engineering"] },
  { id: "flight", label: "Flight", phase: "prove", happens: "The vehicle flies, with telemetry recorded.", deliverable: "Flight data", evidence: "Telemetry and tracking records", capabilityIds: ["launch-operations", "rf-telemetry", "regulatory-safety"] },
  { id: "post-flight-analysis", label: "Post-flight analysis", phase: "improve", happens: "Flight data is compared with prediction.", deliverable: "Post-flight report", evidence: "Correlation and anomaly reports", capabilityIds: ["test-data", "digital-twin", "engineering-ai"] },
  { id: "design-iteration", label: "Design iteration", phase: "improve", happens: "Lessons become changes to the next baseline.", deliverable: "Updated baseline", evidence: "Change records with impact assessment", capabilityIds: ["systems-engineering", "propulsion", "digital-quality-thread"] },
];
