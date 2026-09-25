// Crew day, emergencies, cybersecurity and economy.
// Schedules are generic educational examples — not an official mission timeline.
import type { SourceId } from "./sources";

export type ActivityKind = "sleep" | "routine" | "planning" | "science" | "maintenance" | "exercise" | "meal" | "comms" | "robotics" | "medical" | "personal" | "ops";

export const ACTIVITY_LABEL: Record<ActivityKind, string> = {
  sleep: "Sleep",
  routine: "Morning routine",
  planning: "Planning conference",
  science: "Science",
  maintenance: "Maintenance",
  exercise: "Exercise",
  meal: "Meals",
  comms: "Earth communication",
  robotics: "Robotics",
  medical: "Medical checks",
  personal: "Personal time",
  ops: "Vehicle / emergency operations",
};

export interface Block {
  kind: ActivityKind;
  hours: number;
  note: string;
}

export const CREW_PROFILES: Record<string, { label: string; summary: string; blocks: Block[] }> = {
  research: {
    label: "Research Intensive",
    summary: "Most of the working day goes to experiments; maintenance is kept to essentials.",
    blocks: [
      { kind: "sleep", hours: 8.5, note: "Protected sleep period in private crew quarters." },
      { kind: "routine", hours: 1, note: "Hygiene, breakfast, checking the day's timeline." },
      { kind: "planning", hours: 0.5, note: "Morning conference with ground control teams." },
      { kind: "science", hours: 4, note: "Experiment operations, sample handling, data checks." },
      { kind: "meal", hours: 1, note: "Lunch — often shared." },
      { kind: "exercise", hours: 2, note: "Resistance and aerobic exercise to protect bone and muscle." },
      { kind: "science", hours: 2.5, note: "Afternoon experiment sessions." },
      { kind: "medical", hours: 0.5, note: "Routine health measurements for research and monitoring." },
      { kind: "maintenance", hours: 0.5, note: "Housekeeping and filter checks." },
      { kind: "planning", hours: 0.5, note: "Evening conference." },
      { kind: "meal", hours: 1, note: "Dinner." },
      { kind: "personal", hours: 1.5, note: "Personal time, family calls, Earth observation." },
      { kind: "comms", hours: 0.5, note: "Public outreach or education event." },
    ],
  },
  maintenance: {
    label: "Maintenance Day",
    summary: "A pump, fan or filter needs attention; science is reduced.",
    blocks: [
      { kind: "sleep", hours: 8.5, note: "Protected sleep." },
      { kind: "routine", hours: 1, note: "Hygiene and breakfast." },
      { kind: "planning", hours: 0.5, note: "Walk through the repair procedure with ground specialists." },
      { kind: "maintenance", hours: 4, note: "Replace a failed unit; verify with ground telemetry." },
      { kind: "meal", hours: 1, note: "Lunch." },
      { kind: "exercise", hours: 2, note: "Exercise is rarely skipped — it is a health countermeasure." },
      { kind: "maintenance", hours: 2, note: "Checkout and inventory." },
      { kind: "science", hours: 1, note: "Time-critical experiment tasks only." },
      { kind: "planning", hours: 0.5, note: "Evening conference." },
      { kind: "meal", hours: 1, note: "Dinner." },
      { kind: "personal", hours: 2.5, note: "Personal time." },
    ],
  },
  docking: {
    label: "Docking Day",
    summary: "A visiting vehicle arrives; crew monitor the approach and prepare for hatch opening.",
    blocks: [
      { kind: "sleep", hours: 8.5, note: "Sleep may be shifted to fit the arrival time." },
      { kind: "routine", hours: 1, note: "Hygiene and breakfast." },
      { kind: "planning", hours: 1, note: "Arrival briefing and go/no-go." },
      { kind: "ops", hours: 3, note: "Monitor approach; robotic capture or docking; leak checks." },
      { kind: "robotics", hours: 1, note: "Robotic arm operations (for berthed vehicles)." },
      { kind: "meal", hours: 1, note: "Lunch." },
      { kind: "ops", hours: 2, note: "Hatch opening, air sampling, unloading priority cargo." },
      { kind: "exercise", hours: 1.5, note: "Shortened exercise session." },
      { kind: "meal", hours: 1, note: "Dinner." },
      { kind: "science", hours: 1, note: "Transfer cold-stowed samples to freezers." },
      { kind: "planning", hours: 0.5, note: "Evening conference." },
      { kind: "personal", hours: 2.5, note: "Personal time." },
    ],
  },
  emergency: {
    label: "Emergency Training",
    summary: "Crew rehearse emergency responses together with ground teams.",
    blocks: [
      { kind: "sleep", hours: 8.5, note: "Protected sleep." },
      { kind: "routine", hours: 1, note: "Hygiene and breakfast." },
      { kind: "planning", hours: 0.5, note: "Drill briefing." },
      { kind: "ops", hours: 2.5, note: "Simulated fire, depressurisation or toxic-atmosphere drill; review safe-haven routes." },
      { kind: "medical", hours: 1, note: "Medical emergency training with ground flight surgeons." },
      { kind: "meal", hours: 1, note: "Lunch." },
      { kind: "exercise", hours: 2, note: "Exercise." },
      { kind: "science", hours: 3, note: "Science operations." },
      { kind: "planning", hours: 0.5, note: "Debrief with ground." },
      { kind: "meal", hours: 1, note: "Dinner." },
      { kind: "personal", hours: 3, note: "Personal time." },
    ],
  },
};

export const RESPONSE_PHASES = ["Detection", "Isolation", "Redundancy", "Safe mode", "Crew response", "Ground coordination", "Recovery"] as const;

export interface Scenario {
  id: string;
  name: string;
  hazard: string;
  phases: Record<(typeof RESPONSE_PHASES)[number], string>;
  lesson: string;
}

// Systems-engineering view only — deliberately no step-by-step procedures.
export const SCENARIOS: Scenario[] = [
  { id: "leak", name: "Cabin pressure leak", hazard: "Loss of breathable atmosphere.", phases: { Detection: "Pressure sensors show a falling trend; the rate indicates severity.", Isolation: "Hatches allow the affected volume to be closed off to find the leaking module.", Redundancy: "Stored gas can make up small losses while the leak is located.", "Safe mode": "Non-essential activities stop; crew gather in a safe location near their return vehicles.", "Crew response": "Follow trained procedures to locate and seal the leak, guided by rate and time available.", "Ground coordination": "Ground teams analyse telemetry, compute time to reach limits and advise.", Recovery: "Repair, re-pressurise and monitor; investigate the cause." }, lesson: "Leak rate, not the leak itself, decides urgency — designs provide time to respond." },
  { id: "fire", name: "Fire", hazard: "Smoke, toxic products and heat in a closed cabin.", phases: { Detection: "Smoke detectors and crew senses raise an alarm.", Isolation: "Ventilation and power to the affected area are removed to starve the fire.", Redundancy: "Portable extinguishers and breathing equipment are distributed around the station.", "Safe mode": "Station configured to limit spread; crew protected with breathing equipment.", "Crew response": "Trained response to locate and extinguish, then monitor air quality.", "Ground coordination": "Ground monitors atmosphere data and coordinates clean-up.", Recovery: "Atmosphere scrubbed and verified before normal operations resume." }, lesson: "Removing ventilation matters because flames in microgravity depend on forced airflow." },
  { id: "cooling", name: "Cooling failure", hazard: "Equipment overheating; loss of cabin temperature control.", phases: { Detection: "Coolant temperature, flow or pressure leave limits.", Isolation: "The failed loop or pump is isolated.", Redundancy: "Loads are moved to the remaining loop.", "Safe mode": "Non-essential loads powered down to cut heat.", "Crew response": "Prepare for repair; monitor temperatures.", "Ground coordination": "Re-plan power and experiments to fit reduced cooling.", Recovery: "Replace pump or repair loop; restore loads gradually." }, lesson: "Thermal and power are coupled: cutting heat means cutting power." },
  { id: "power", name: "Power bus failure", hazard: "Loss of power to a set of systems.", phases: { Detection: "Bus voltage and current anomalies; switch trips.", Isolation: "Fault isolated by switching so other channels stay healthy.", Redundancy: "Critical loads receive power from alternate channels.", "Safe mode": "Load shedding protects life support, communications and control.", "Crew response": "Verify configuration and support troubleshooting.", "Ground coordination": "Power specialists re-route power and plan repair.", Recovery: "Restore the channel after the fault is cleared." }, lesson: "Independent power channels turn a failure into a nuisance." },
  { id: "comms", name: "Communication outage", hazard: "No commanding or telemetry from the ground.", phases: { Detection: "Loss of signal beyond the expected coverage gaps.", Isolation: "Determine whether the cause is onboard, relay or ground.", Redundancy: "Backup antennas, bands or relay paths.", "Safe mode": "Station continues on onboard automation; data stored.", "Crew response": "Follow pre-agreed loss-of-communication plans.", "Ground coordination": "Try alternate paths; partner control centres assist.", Recovery: "Restore link and downlink stored data." }, lesson: "Stations are designed to stay safe without the ground for a period." },
  { id: "debris", name: "Debris warning", hazard: "Predicted close approach by tracked debris.", phases: { Detection: "Ground conjunction analysis predicts a close approach.", Isolation: "Assess probability of collision and timing.", Redundancy: "Reboost thrusters on the station or docked vehicles.", "Safe mode": "If risk is high, perform an avoidance manoeuvre; if time is short, crew shelter in return vehicles.", "Crew response": "Close hatches as directed; shelter if required.", "Ground coordination": "Tracking and flight dynamics teams plan and verify manoeuvres.", Recovery: "Return to nominal configuration once the object has passed." }, lesson: "Tracking plus manoeuvre capability are the main defences; shielding handles small particles." },
  { id: "dock", name: "Docking anomaly", hazard: "Visiting vehicle off-nominal during approach.", phases: { Detection: "Relative navigation shows approach outside the corridor.", Isolation: "Determine whether sensors, software or thrusters are at fault.", Redundancy: "Alternate sensors or manual control modes.", "Safe mode": "Abort: vehicle retreats to a safe distance.", "Crew response": "Monitor and, if assigned, command the abort.", "Ground coordination": "Evaluate and plan another attempt.", Recovery: "Retry after the fault is understood." }, lesson: "Hold points and abort paths are designed in from the start." },
  { id: "medical", name: "Crew medical emergency", hazard: "Illness or injury far from hospitals.", phases: { Detection: "Symptoms reported or observed.", Isolation: "Assess severity with onboard medical equipment.", Redundancy: "Crew medical officers and ground flight surgeons.", "Safe mode": "Workload re-planned around the patient.", "Crew response": "Provide care within trained capability.", "Ground coordination": "Flight surgeons advise; decision on early return if needed.", Recovery: "Treatment, monitoring or evacuation in the return vehicle." }, lesson: "Beyond LEO, evacuation takes days — onboard capability must grow." },
];

export const CYBER_TOPICS: { name: string; text: string }[] = [
  { name: "Command authentication", text: "Only authenticated, authorised commands are accepted; replayed or altered commands are rejected." },
  { name: "Spacecraft networks", text: "Critical control networks are separated from crew and payload networks." },
  { name: "Payload isolation", text: "Experiments from many organisations run on segmented networks and cannot reach vehicle control." },
  { name: "Supply-chain security", text: "Hardware and software origins are tracked and verified before integration." },
  { name: "Software integrity", text: "Code is signed and verified; configuration is controlled." },
  { name: "Secure updates", text: "Updates are authenticated, tested and reversible." },
  { name: "Telemetry integrity", text: "Telemetry is protected so operators can trust what they see." },
  { name: "Ground-segment security", text: "Control centres, antennas and data systems are protected like critical infrastructure." },
  { name: "Access control", text: "Least privilege for crew, ground and payload users." },
  { name: "Anomaly detection", text: "Monitoring distinguishes faults from malicious activity." },
  { name: "Resilience", text: "Critical functions keep working in a degraded or compromised state." },
  { name: "Zero-trust concepts", text: "No implicit trust based on network location; every request is verified." },
  { name: "Incident response", text: "Plans, roles and drills for detecting, containing and recovering from incidents." },
];

export const CYBER_SOURCES: SourceId[] = ["nasa-space-security", "nist-8270", "nist-8401"];

export const ECONOMY: { name: string; status: "Demonstrated" | "Emerging" | "Proposed"; text: string }[] = [
  { name: "Government research", status: "Demonstrated", text: "Agencies fund most station research today." },
  { name: "National laboratories", status: "Demonstrated", text: "The ISS National Lab gives non-NASA users access to US research allocation." },
  { name: "Technology demonstrations", status: "Demonstrated", text: "Companies and agencies test hardware before free-flying missions." },
  { name: "Education", status: "Demonstrated", text: "Student experiments and crew education events." },
  { name: "Private astronaut missions", status: "Demonstrated", text: "Commercially arranged missions have visited the ISS under NASA agreements." },
  { name: "Space logistics", status: "Demonstrated", text: "Commercial cargo and crew transport services are operating." },
  { name: "Commercial research", status: "Emerging", text: "Companies buy research time; recurring demand is still being proven." },
  { name: "Pharmaceuticals & biotechnology", status: "Emerging", text: "Crystallisation and biomanufacturing research; products are not yet routine." },
  { name: "Media", status: "Emerging", text: "Filming and brand activities have occurred occasionally." },
  { name: "Manufacturing", status: "Proposed", text: "Commercial-scale orbital manufacturing is still at demonstration stage." },
  { name: "Servicing", status: "Proposed", text: "Station-based servicing of other spacecraft remains a concept." },
];
