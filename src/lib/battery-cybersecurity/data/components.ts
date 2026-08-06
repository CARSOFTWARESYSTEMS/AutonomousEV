import type { AircraftComponent } from "../types";

// Adjacency (downstreamComponentIds) encodes the energy trust chain used by the
// Threat-Modelling Studio's propagation walk: Battery Pack -> BMS -> Energy
// Management -> Power Distribution -> Propulsion -> Flight Safety, plus the
// sensing, charging, maintenance, and OTA/fleet paths that feed into it.
export const COMPONENTS: AircraftComponent[] = [
  {
    id: "battery-cells",
    name: "Battery Cells & Modules",
    domain: "energy",
    trustRole: "The physical energy source. Cell-level voltage and temperature are the ground truth every higher-level trust decision is ultimately checked against.",
    downstreamComponentIds: ["battery-pack"],
  },
  {
    id: "battery-pack",
    name: "Battery Pack",
    domain: "energy",
    trustRole: "Aggregates cells/modules behind the pack-level HV interface. Its reported state feeds the BMS and is the first point where cell-level ground truth can be misrepresented.",
    downstreamComponentIds: ["bms"],
  },
  {
    id: "bms",
    name: "Battery Management System",
    domain: "energy",
    trustRole: "Estimates SOC/SOH, enforces safe operating limits, and issues contactor, balancing, and thermal commands. The central trust broker between the physical battery and the rest of the aircraft.",
    downstreamComponentIds: ["ems", "contactors", "thermal-management"],
  },
  {
    id: "sensors",
    name: "Cell & Pack Sensors",
    domain: "energy",
    trustRole: "Voltage, current, temperature, and insulation sensors that supply the raw measurements the BMS reasons over.",
    downstreamComponentIds: ["bms"],
  },
  {
    id: "contactors",
    name: "Contactors & Pre-Charge Circuit",
    domain: "energy",
    trustRole: "Physically connects or isolates the pack from the high-voltage bus on BMS command. A trusted contactor command is the last line of defense against an unsafe electrical state.",
    downstreamComponentIds: ["pdu"],
  },
  {
    id: "thermal-management",
    name: "Thermal Management System",
    domain: "energy",
    trustRole: "Cooling/heating loop that keeps the pack within safe thermal limits based on BMS-reported temperature and load.",
    downstreamComponentIds: ["bms"],
  },
  {
    id: "ems",
    name: "Energy Management System",
    domain: "energy",
    trustRole: "Converts BMS state into an aircraft-level energy and power-availability picture used for mission and flight-phase decisions.",
    downstreamComponentIds: ["vcu"],
  },
  {
    id: "vcu",
    name: "Vehicle Control Unit",
    domain: "flight-control",
    trustRole: "Arbitrates power requests from flight control against the energy picture from the EMS and issues power-distribution commands.",
    downstreamComponentIds: ["pdu"],
  },
  {
    id: "pdu",
    name: "Power Distribution Unit",
    domain: "propulsion",
    trustRole: "Routes electrical power from the battery/contactors to the inverters and other loads under VCU authority.",
    downstreamComponentIds: ["inverter-motor-controller"],
  },
  {
    id: "inverter-motor-controller",
    name: "Inverter & Motor Controller",
    domain: "propulsion",
    trustRole: "Converts distributed power into commanded motor torque/thrust for each propulsor.",
    downstreamComponentIds: ["propulsion"],
  },
  {
    id: "propulsion",
    name: "Propulsion System",
    domain: "propulsion",
    trustRole: "The physical motors/propulsors that convert commanded power into thrust — the end of the energy trust chain, where a false upstream picture becomes a real flight-safety consequence.",
    downstreamComponentIds: [],
  },
  {
    id: "charger-gse",
    name: "Charger / Ground Support Equipment",
    domain: "ground-support",
    trustRole: "Ground-side charging and diagnostic equipment with a direct electrical and data interface into the battery pack and BMS between flights.",
    downstreamComponentIds: ["battery-pack"],
  },
  {
    id: "maintenance-laptop",
    name: "Maintenance Laptop / Diagnostic Tool",
    domain: "ground-support",
    trustRole: "Field tool with privileged diagnostic and configuration access to the BMS, often the least-monitored device with the most access.",
    downstreamComponentIds: ["bms"],
  },
  {
    id: "ota-system",
    name: "OTA Update System",
    domain: "communications",
    trustRole: "Distributes firmware and configuration updates to the BMS, VCU, and EMS. A single compromised update can affect every component it reaches.",
    downstreamComponentIds: ["bms", "vcu", "ems"],
  },
  {
    id: "fleet-platform",
    name: "Cloud / Fleet Energy Platform",
    domain: "communications",
    trustRole: "Aggregates telemetry and issues OTA campaigns across the fleet. Compromise here has the widest blast radius of any single entry point.",
    downstreamComponentIds: ["ota-system", "ems"],
  },
];
