// Page content for the toolkit: Owner Mode symptoms, Technician Mode
// workflow, common issues, workbench tools, external equipment, FAQ and the
// short answers written for search and answer engines.
//
// Owner Mode text is deliberately limited to safe actions: it never tells an
// owner to open an enclosure, work on a live pack or touch cells or busbars.
import type { RepairDepth } from "@/lib/ev-battery-toolkit/types";

export const TOOLKIT = {
  name: "EV.ENGINEER™ — EV Battery Health & Diagnostics Toolkit",
  shortName: "EV Battery Health & Diagnostics Toolkit",
  subtitle: "Interactive 3D Battery Diagnostics & Repair Workspace",
  statement: "Locate the battery. Inspect the pack. Analyse BMS data. Identify faults. Understand repair options. Verify battery health.",
  positioning:
    "Use this toolkit to structure and document real EV battery diagnosis. Vehicle-specific repair procedures must follow verified manufacturer service information.",
  route: "/internships/ev-battery-health-diagnostics-toolkit",
  reviewed: "2026-10-18",
} as const;

export const FLOW = ["Locate", "Inspect", "Connect", "Measure", "Diagnose", "Isolate", "Repair", "Verify", "Report"] as const;

export type SymptomSeverity = "Low" | "Moderate" | "High" | "Stop";

export interface OwnerSymptom {
  id: string;
  title: string;
  causes: string[];
  severity: SymptomSeverity;
  safeNextStep: string;
  inspection: string;
}

export const OWNER_SYMPTOMS: OwnerSymptom[] = [
  { id: "reduced-range", title: "Reduced range", causes: ["Normal battery ageing", "Cold weather or heavy loads", "One weak cell group limiting the pack", "Tyre pressure or riding mode"], severity: "Low", safeNextStep: "Note the range from several full charges and the riding conditions.", inspection: "Ask a qualified technician for a battery health check if range keeps falling." },
  { id: "not-charging", title: "Battery not charging", causes: ["Charger or wall socket fault", "Loose or damaged charge connector", "Battery protection after a fault", "Battery too hot or too cold to charge"], severity: "Moderate", safeNextStep: "Try a known-good socket with the original charger. Let a hot or cold scooter reach room temperature.", inspection: "If it still will not charge, book a professional inspection. Do not use a different charger." },
  { id: "stops-early", title: "Charging stops early", causes: ["Cell imbalance", "Battery protection triggering", "Charger fault", "High battery temperature"], severity: "Moderate", safeNextStep: "Note the percentage where charging stops and whether the battery felt hot.", inspection: "Book a professional inspection; a technician can compare cell-group voltages." },
  { id: "soc-drop", title: "Sudden SOC drop", causes: ["SOC estimate correcting itself", "Weak cell group", "Current-sensor or BMS issue"], severity: "Moderate", safeNextStep: "Note the percentage before and after the drop and what you were doing.", inspection: "Book a professional battery check if it repeats." },
  { id: "shutdown", title: "Vehicle shutdown", causes: ["Battery protection under heavy load", "Weak cell group", "Loose connection", "Motor or controller fault"], severity: "High", safeNextStep: "Stop safely, switch off and do not keep restarting it repeatedly.", inspection: "Professional inspection needed before regular use." },
  { id: "overheating", title: "Overheating", causes: ["Heavy load on a hot day", "Charging in a hot place", "Internal battery fault"], severity: "Stop", safeNextStep: "Stop charging or riding. Move away from the scooter and keep people away. If there is smoke, hissing or a strong smell, call emergency services.", inspection: "Do not use or charge it again until a professional has inspected it." },
  { id: "water", title: "Water exposure", causes: ["Riding through deep water", "Flooded parking", "High-pressure washing near seals"], severity: "Stop", safeNextStep: "Do not charge it. Park it in the open, away from buildings, and keep it switched off.", inspection: "Professional inspection before charging or riding." },
  { id: "storage", title: "Long-term storage", causes: ["Battery slowly discharging while parked", "Deep discharge if stored empty"], severity: "Moderate", safeNextStep: "If it was stored empty for a long time and will not wake, do not keep trying to charge it.", inspection: "Ask a technician to check the battery before charging. Store scooters partly charged in future." },
  { id: "warning", title: "Dashboard battery warning", causes: ["Battery protection message", "Communication fault", "Temperature or voltage warning"], severity: "High", safeNextStep: "Note the exact message or symbol and when it appears.", inspection: "Book a professional inspection and share the message with the technician." },
  { id: "slow-charging", title: "Slow charging", causes: ["Charger fault", "High or low battery temperature", "Worn connector or socket"], severity: "Low", safeNextStep: "Charge at room temperature with the original charger and note the time taken.", inspection: "If it stays slow, ask a technician to check the charger and battery." },
];

export const OWNER_SAFETY_RULES = [
  "Never open the battery enclosure.",
  "Never use a charger that is not approved for your scooter.",
  "Do not charge a battery that is swollen, damaged, wet or hot.",
  "If you see smoke, hear hissing or smell burning, move away and call emergency services.",
];

export const REPAIR_DEPTH_SCOPE: Record<RepairDepth, string[]> = {
  basic: ["Battery location", "Visual inspection", "Pack voltage", "Charger inspection", "Connector inspection", "SOC", "SOH", "BMS summary", "Fault status", "Thermal inspection"],
  expert: ["Isolation", "Enclosure inspection", "Fuse", "Connectors", "BMS", "Current sensor", "Temperature sensors", "Modules", "Cell-group diagnosis"],
  advanced: ["Cylindrical", "Prismatic", "Pouch", "Cell-group diagnosis", "Balancing concepts", "Module replacement concepts", "Cell replacement concepts", "BMS replacement concepts", "Post-repair validation"],
};

export const FLOW_DETAIL: Record<(typeof FLOW)[number], string> = {
  Locate: "Find the battery and its architecture on the vehicle.",
  Inspect: "Visual, water, corrosion, swelling and connector checks.",
  Connect: "Connect the diagnostic interface or a meter safely.",
  Measure: "Pack voltage, cell groups, current and temperature.",
  Diagnose: "Root-cause candidates tied to evidence.",
  Isolate: "Narrow to one component, module or group.",
  Repair: "At the repair depth the evidence supports.",
  Verify: "Post-repair checks against stated criteria.",
  Report: "Job card and diagnostic report.",
};

export interface CommonIssue {
  id: string;
  title: string;
  symptom: string;
  area: string;
  severity: "Warning" | "Service" | "Critical";
  /** The simulated fault the card opens in the workspace. */
  faultId: string;
}

export const COMMON_ISSUES: CommonIssue[] = [
  { id: "reduced-range", title: "Reduced Range", symptom: "Range falls well below normal.", area: "SOH and cell-group comparison", severity: "Warning", faultId: "capacity-degradation" },
  { id: "imbalance", title: "Cell Imbalance", symptom: "Charging stops early; range shrinks.", area: "Cell delta and balancing", severity: "Service", faultId: "imbalance" },
  { id: "deep-discharge", title: "Deep Discharge", symptom: "Stored flat; will not wake or charge.", area: "Group voltages after storage", severity: "Critical", faultId: "deep-discharge" },
  { id: "not-charging", title: "Battery Not Charging", symptom: "Charger connected, nothing happens.", area: "Charger, charge path, BMS enable", severity: "Service", faultId: "no-charge" },
  { id: "bms-fault", title: "BMS Fault", symptom: "No battery data; will not start.", area: "BMS supply and communication", severity: "Service", faultId: "bms-offline" },
  { id: "overheating", title: "Overheating", symptom: "Pack hot or power limited.", area: "Thermal inspection", severity: "Critical", faultId: "hot-cell" },
  { id: "connector-heating", title: "Connector Heating", symptom: "Discoloured, hot connector.", area: "Connector resistance", severity: "Service", faultId: "connector-resistance" },
  { id: "water", title: "Water Ingress", symptom: "Faults after rain or flooding.", area: "Seals, corrosion, insulation", severity: "Critical", faultId: "water-ingress" },
  { id: "weak-cell", title: "Weak Cell", symptom: "Cuts out under acceleration.", area: "Group voltage under load", severity: "Service", faultId: "weak-cell" },
  { id: "capacity", title: "Capacity Degradation", symptom: "Gradual range loss over time.", area: "Capacity test", severity: "Warning", faultId: "ageing" },
  { id: "temp-sensor", title: "Temperature Sensor Fault", symptom: "Charging refused at room temperature.", area: "Temperature channel plausibility", severity: "Service", faultId: "temp-sensor-failure" },
  { id: "comms", title: "Communication Fault", symptom: "Battery error on the dashboard.", area: "CAN / UART / BLE link", severity: "Service", faultId: "can-failure" },
];

export interface WorkbenchTool {
  id: string;
  name: string;
  use: string;
  interactive: boolean;
}

export const WORKBENCH_TOOLS: WorkbenchTool[] = [
  { id: "multimeter", name: "Digital Multimeter", use: "Voltage in parallel across chosen test points.", interactive: true },
  { id: "thermal-camera", name: "Thermal Camera", use: "Surface temperature map of the pack.", interactive: true },
  { id: "diag-interface", name: "Battery Diagnostic Interface", use: "Reads the simulated BMS.", interactive: true },
  { id: "clamp", name: "Clamp Meter", use: "Pack current without breaking the circuit.", interactive: false },
  { id: "can", name: "CAN Interface", use: "Bus traffic from the BMS and vehicle controller.", interactive: false },
  { id: "uart", name: "UART Interface", use: "Serial service port on many BMS boards.", interactive: false },
  { id: "ble", name: "BLE Interface", use: "Wireless BMS data, where fitted.", interactive: false },
  { id: "cell-analyser", name: "Cell Analyser", use: "Capacity and internal resistance of cells.", interactive: false },
  { id: "psu", name: "DC Power Supply", use: "Controlled supply for bench tests.", interactive: false },
  { id: "balancer", name: "Balancer", use: "Brings cell groups to a common voltage.", interactive: false },
  { id: "insulated", name: "Insulated Tools", use: "Rated tools for work near live parts.", interactive: false },
  { id: "torque", name: "Torque Tool", use: "Correct torque on bolted joints.", interactive: false },
];

export type CapabilityState = "VENDOR_STATED" | "NOT_VERIFIED";

export interface ExternalEquipment {
  id: string;
  name: string;
  vendor: string;
  website: string;
  capabilities: Record<"SOC" | "SOH" | "Capacity" | "BMS" | "Cell Imbalance" | "Fault Detection" | "Reporting", CapabilityState>;
  vendorStatement: string;
  compatibilityNotes: string;
  source: string;
  retrieved: string;
}

/**
 * External products, listed only in the equipment section. A capability is
 * VENDOR_STATED only where the vendor's own site claims it; everything else is
 * NOT_VERIFIED. No product is required to use the toolkit.
 */
export const EXTERNAL_EQUIPMENT: ExternalEquipment[] = [
  {
    id: "ev-doctor",
    name: "EV DOCTOR™",
    vendor: "BatteryOK Technologies",
    website: "https://batteryok.in/",
    capabilities: {
      SOC: "NOT_VERIFIED",
      SOH: "VENDOR_STATED",
      Capacity: "NOT_VERIFIED",
      BMS: "NOT_VERIFIED",
      "Cell Imbalance": "NOT_VERIFIED",
      "Fault Detection": "VENDOR_STATED",
      Reporting: "NOT_VERIFIED",
    },
    vendorStatement: "Vendor states it diagnoses EV battery health, detects early safety risks and identifies battery faults in about 15 minutes.",
    compatibilityNotes: "Compatibility with a given vehicle, pack voltage and BMS is not verified by EV.ENGINEER.",
    source: "Vendor website description, batteryok.in",
    retrieved: "2026-10-18",
  },
];

export const EXTERNAL_LABEL = "External product. Verify vehicle and BMS compatibility before use.";

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  { q: "What does this toolkit diagnose?", a: "Electric-scooter traction batteries: the pack, modules, cell groups, BMS, sensing, connectors, charging path and thermal behaviour. It structures the diagnosis, ties each conclusion to evidence and documents the repair and its verification." },
  { q: "Is this a full vehicle repair tool?", a: "No. It covers the traction battery only. Motor, controller, brakes and the rest of the vehicle are out of scope." },
  { q: "Does it support fixed batteries?", a: "Yes. The Integrated / Fixed Floor architecture covers packs serviced on the vehicle or after a workshop removal. Exact removal sequences vary by model and must follow authorised manufacturer service documentation." },
  { q: "Does it support swappable batteries?", a: "Yes. The Removable / Swappable architecture covers handle, guide rails, connector, interlock, locking and BMS verification after reinstallation, including incorrect-insertion cases." },
  { q: "What is BMS diagnosis?", a: "Reading and checking the Battery Management System: pack and cell-group voltages, current, temperatures, SOC, SOH, protection state, fault codes, charge and discharge enable, and communication over CAN, UART or BLE." },
  { q: "Can an EV owner use this toolkit?", a: "Yes, in Owner Mode. It explains symptoms, their possible causes, how serious they are and the safe next step. It never asks an owner to open the battery or work on it." },
  { q: "Can technicians diagnose cell imbalance?", a: "Yes. Technician Mode compares cell-group minimum, maximum and delta, checks balancing and load behaviour, and requires that evidence before it recommends a repair." },
  { q: "Does the toolkit replace manufacturer service documentation?", a: "No. It structures and documents diagnosis. Vehicle-specific procedures, limits and removal sequences must follow verified manufacturer service information." },
  { q: "Does it support NMC and LFP batteries?", a: "Yes. The configurator and simulation cover both chemistries. LFP's flat voltage curve makes SOC harder to read from voltage alone, which the toolkit points out." },
  { q: "Is the complete 3D experience available on mobile?", a: "No. The full 3D workspace is built for laptop and desktop. On a phone you get the overview, Owner Mode, supported platforms, diagnostic previews and a sample report." },
];

/** Short, direct answers for search and answer engines; visible on the page. */
export const ANSWERS: Faq[] = [
  { q: "What is the EV Battery Health & Diagnostics Toolkit?", a: "An interactive 3D workspace from EV.ENGINEER™ for diagnosing electric-scooter batteries. It covers locating the battery, inspecting the pack, reading BMS data, identifying faults, choosing a repair depth, verifying the repair and producing a report." },
  { q: "Who is it for?", a: "Electric-scooter battery technicians and service workshops, first in South India, with a simplified Owner Mode for scooter owners." },
  { q: "What is Owner Mode?", a: "A safe mode for scooter owners: symptoms, possible causes, severity and a safe next step, ending in a recommendation for professional inspection. It shows no repair instructions." },
  { q: "What is Technician Mode?", a: "The workshop mode: Locate, Inspect, Connect, Measure, Diagnose, Isolate, Repair, Verify and Report, at Basic Diagnostic, Expert Service or Advanced Battery Repair depth." },
  { q: "What is BMS diagnostics?", a: "Checking what the Battery Management System measures and decides — voltages, current, temperatures, SOC, SOH, protection state, fault codes and communication — and whether those readings are plausible." },
  { q: "What is SOC?", a: "State of Charge: how full the battery is, as a percentage of its present usable capacity." },
  { q: "What is SOH?", a: "State of Health: the battery's present capability compared with when it was new, usually as remaining capacity in percent." },
  { q: "What is cell imbalance?", a: "A difference in voltage between series cell groups. The weakest group reaches its limit first, so the BMS stops charging or discharging early and usable range falls." },
  { q: "What is a fixed EV battery?", a: "A pack mounted in the vehicle, usually in the floor, that the owner charges on the scooter and only a workshop removes." },
  { q: "What is a removable battery?", a: "A pack the owner can take out of the scooter, typically to charge it indoors." },
  { q: "What is a swappable battery?", a: "A removable pack designed to be exchanged for a charged one, with a blind-mate connector, mechanical lock and interlock." },
  { q: "What battery faults can the toolkit help diagnose?", a: "Cell, thermal, electrical, BMS, charging, environmental, lifecycle, communication and safety faults — from weak cells and imbalance to connector resistance, sensor faults, water ingress and suspected thermal runaway." },
];

/** Search themes the page is about. */
export const KEYWORDS = [
  "EV battery diagnostics",
  "electric scooter battery repair",
  "EV battery health check",
  "BMS diagnostics",
  "EV battery SOC",
  "EV battery SOH",
  "battery cell imbalance",
  "electric scooter battery not charging",
  "EV battery overheating",
  "72V battery diagnostics",
  "LFP battery diagnostics",
  "NMC battery diagnostics",
  "electric scooter battery technician",
] as const;

/** The guided simulation complaint for Technician Mode. */
export const GUIDED_COMPLAINT = "Battery shows 60%, but scooter shuts down during acceleration.";

export interface GuidedStep {
  id: string;
  title: string;
  action: string;
  /** What the simulated vehicle shows when this step runs. Filled from the simulation. */
  evidenceKey: "identity" | "visual" | "bms" | "pack" | "groups" | "load" | "thermal" | "connector" | "candidates" | "next" | "decision";
}

export const GUIDED_STEPS: GuidedStep[] = [
  { id: "identify", title: "Vehicle Identification", action: "Record the vehicle and battery architecture.", evidenceKey: "identity" },
  { id: "visual", title: "Visual Inspection", action: "Enclosure, connectors, water, corrosion, swelling.", evidenceKey: "visual" },
  { id: "bms", title: "Read BMS", action: "SOC, status, fault codes, enable states.", evidenceKey: "bms" },
  { id: "pack", title: "Pack Voltage", action: "Meter across the pack terminals.", evidenceKey: "pack" },
  { id: "groups", title: "Cell Group Comparison", action: "Minimum, maximum and delta at rest.", evidenceKey: "groups" },
  { id: "load", title: "Load Behaviour", action: "Group voltages during a controlled load.", evidenceKey: "load" },
  { id: "thermal", title: "Temperature Inspection", action: "BMS channels and thermal camera.", evidenceKey: "thermal" },
  { id: "connector", title: "Connector Inspection", action: "Engagement, pins and heat marks.", evidenceKey: "connector" },
  { id: "candidates", title: "Root Cause Candidates", action: "Rank the candidates by evidence.", evidenceKey: "candidates" },
  { id: "next", title: "Recommended Next Test", action: "Close the evidence gap.", evidenceKey: "next" },
  { id: "decision", title: "Repair Decision", action: "Decide at the depth the evidence supports.", evidenceKey: "decision" },
];

/** Fixed and swappable labs: the steps each architecture is serviced through. */
export const FIXED_LAB = [
  { id: "isolation", title: "Vehicle isolation", text: "Key off, isolate the traction supply and confirm the pack output is safe before any work." },
  { id: "access", title: "Service access", text: "Floor panels or covers are removed to reach the pack and its connectors." },
  { id: "location", title: "Battery location", text: "The pack sits in the floor, close to the vehicle's centre of mass." },
  { id: "connectors", title: "Connector isolation", text: "Traction and signal connectors are disconnected in the order the manufacturer specifies." },
  { id: "support", title: "Pack support", text: "The pack is supported on a suitable lift before its mounts are released." },
  { id: "removal", title: "Removal concept", text: "The pack is lowered or lifted out as one unit." },
  { id: "inspection", title: "Inspection", text: "Enclosure, seals, mounts and connectors are inspected before and after removal." },
];

export const SWAP_LAB = [
  { id: "unlock", title: "Unlock", text: "Release the seat or bay and the pack's mechanical lock." },
  { id: "safe", title: "Safe state", text: "Vehicle off, so the connector is not breaking current." },
  { id: "handle", title: "Handle", text: "Lift by the handle, keeping the pack upright." },
  { id: "rails", title: "Guide rails", text: "Rails align the pack with the blind-mate connector." },
  { id: "connector", title: "Connector", text: "Inspect pins for heat marks, debris and bent contacts." },
  { id: "interlock", title: "Interlock", text: "A signal pin tells the BMS the pack is fully seated before power is enabled." },
  { id: "removal", title: "Removal", text: "Lift straight out along the rails." },
  { id: "inspection", title: "Inspection", text: "Case, handle, latch and connector checked before reinstallation." },
  { id: "reinstall", title: "Reinstallation", text: "Lower along the rails until it seats." },
  { id: "engagement", title: "Connector engagement", text: "Full engagement, confirmed by the interlock." },
  { id: "lock", title: "Mechanical lock", text: "Lock engaged; the pack cannot lift." },
  { id: "verify", title: "BMS verification", text: "BMS online, no faults, charge and discharge enabled." },
];

export type SwapScenarioId = "normal" | "incorrect-insertion" | "incomplete-engagement" | "removal-active" | "damaged-connector";

export const SWAP_SCENARIOS: { id: SwapScenarioId; name: string; result: string; tone: "ok" | "warning" | "critical"; guidance: string }[] = [
  { id: "normal", name: "Correct swap", result: "Interlock closed · lock engaged · BMS ONLINE", tone: "ok", guidance: "Verify BMS status and that charge and discharge are enabled before handing over." },
  { id: "incorrect-insertion", name: "Incorrect insertion", result: "Pack not on the rails · connector misaligned · power not enabled", tone: "warning", guidance: "Lift out and re-seat along the rails. Never force a pack into the bay." },
  { id: "incomplete-engagement", name: "Incomplete connector engagement", result: "Interlock open · BMS reports pack not seated", tone: "warning", guidance: "Partial engagement can cause arcing and heating. Re-seat fully and confirm the interlock." },
  { id: "removal-active", name: "Removal attempt while active", result: "Vehicle on · interlock would break under current", tone: "critical", guidance: "STOP. Switch the vehicle off and wait for the safe state before releasing the lock." },
  { id: "damaged-connector", name: "Damaged connector", result: "Heat-marked or bent pins · high contact resistance", tone: "critical", guidance: "Do not reinstall or charge. Quarantine the pack and replace the connector through authorised service." },
];

export const FIXED_REMOVAL_NOTE = "Exact mechanical removal sequence varies by model. Refer to authorised manufacturer service documentation.";
