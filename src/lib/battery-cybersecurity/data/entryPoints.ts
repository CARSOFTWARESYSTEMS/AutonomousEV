import type { EntryPoint } from "../types";

export const ENTRY_POINTS: EntryPoint[] = [
  {
    id: "vehicle-network-bus",
    name: "Onboard Vehicle Network Bus",
    exposure: "wireless-local",
    description: "The CAN, Ethernet, or equivalent in-vehicle bus carrying telemetry and commands between the BMS, EMS, VCU, PDU, contactors, and sensors.",
    reachableComponentIds: ["bms", "ems", "vcu", "pdu", "contactors", "sensors", "thermal-management"],
  },
  {
    id: "ota-update-channel",
    name: "OTA Update Channel",
    exposure: "wireless-wide-area",
    description: "The wide-area link used to distribute signed firmware and configuration packages to onboard controllers.",
    reachableComponentIds: ["ota-system", "bms", "vcu", "ems"],
  },
  {
    id: "ground-diagnostic-port",
    name: "Ground Diagnostic Port",
    exposure: "physical",
    description: "A physical maintenance connector used by ground crew diagnostic tools to read and configure the BMS.",
    reachableComponentIds: ["maintenance-laptop", "bms"],
  },
  {
    id: "charging-interface",
    name: "Charging Interface",
    exposure: "physical",
    description: "The electrical and data connection between ground charging/support equipment and the battery pack.",
    reachableComponentIds: ["charger-gse", "battery-pack", "bms"],
  },
  {
    id: "telemetry-uplink",
    name: "Telemetry Uplink",
    exposure: "wireless-wide-area",
    description: "The wide-area link carrying battery and energy telemetry from the aircraft to the fleet energy platform.",
    reachableComponentIds: ["fleet-platform", "ems"],
  },
  {
    id: "supply-chain-component",
    name: "Supply Chain / Component Provenance",
    exposure: "supply-chain",
    description: "The manufacturing and logistics chain through which battery cells, packs, and BMS hardware reach the aircraft before first flight.",
    reachableComponentIds: ["battery-pack", "battery-cells", "bms"],
  },
];
