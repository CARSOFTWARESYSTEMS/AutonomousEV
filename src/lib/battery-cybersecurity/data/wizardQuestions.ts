import type { WizardQuestion } from "../types";

// 55 scored boolean questions + 2 multi-select context questions across 7 steps.
// Each boolean question's `dimensions` declares which of the 9 trust axes a
// "Yes" answer earns credit toward, and how much (weight). Multi-select
// questions carry no `dimensions` — they only inform recommendationRules.ts,
// never the score, keeping the scoring math answerable purely from yes/no data.
export const WIZARD_QUESTIONS: WizardQuestion[] = [
  // ── Battery Architecture (12) ──
  { id: "supplier-known", stepId: "battery-architecture", type: "boolean", text: "Is the battery supplier known and documented?", dimensions: [{ dimension: "identity", weight: 1 }] },
  { id: "battery-passport", stepId: "battery-architecture", type: "boolean", text: "Is a battery passport (lifecycle/provenance record) available?", dimensions: [{ dimension: "identity", weight: 1 }, { dimension: "evidence", weight: 1 }] },
  { id: "battery-identity-verified", stepId: "battery-architecture", type: "boolean", text: "Is battery pack and BMS identity cryptographically verified?", dimensions: [{ dimension: "identity", weight: 2 }] },
  { id: "bms-redundancy", stepId: "battery-architecture", type: "boolean", text: "Does the BMS have redundancy?", dimensions: [{ dimension: "resilience", weight: 1 }, { dimension: "availability", weight: 1 }] },
  { id: "dual-pack", stepId: "battery-architecture", type: "boolean", text: "Is the architecture dual-pack?", dimensions: [{ dimension: "resilience", weight: 1 }, { dimension: "availability", weight: 1 }] },
  { id: "distributed-pack", stepId: "battery-architecture", type: "boolean", text: "Is the architecture distributed-pack?", dimensions: [{ dimension: "resilience", weight: 1 }] },
  { id: "hot-swap", stepId: "battery-architecture", type: "boolean", text: "Does the aircraft support hot-swap battery packs?", dimensions: [{ dimension: "availability", weight: 1 }] },
  { id: "cell-balancing", stepId: "battery-architecture", type: "boolean", text: "Is active cell balancing implemented?", dimensions: [{ dimension: "safety", weight: 1 }] },
  { id: "pack-monitoring", stepId: "battery-architecture", type: "boolean", text: "Is continuous pack-level monitoring implemented?", dimensions: [{ dimension: "integrity", weight: 1 }, { dimension: "safety", weight: 1 }] },
  { id: "temperature-sensors", stepId: "battery-architecture", type: "boolean", text: "Are redundant temperature sensors installed?", dimensions: [{ dimension: "safety", weight: 1 }, { dimension: "integrity", weight: 1 }] },
  { id: "current-sensors", stepId: "battery-architecture", type: "boolean", text: "Are current sensors independently verified?", dimensions: [{ dimension: "integrity", weight: 1 }] },
  { id: "voltage-redundancy", stepId: "battery-architecture", type: "boolean", text: "Is voltage sensing redundant?", dimensions: [{ dimension: "integrity", weight: 1 }, { dimension: "resilience", weight: 1 }] },

  // ── Communication (1 context + 5 scored) ──
  { id: "protocols-used", stepId: "communication", type: "multi-select", text: "Which communication protocols are used on the vehicle network?", options: ["CAN", "CAN FD", "Ethernet", "ARINC", "UART", "SPI", "I2C", "Wireless"], dimensions: [] },
  { id: "authenticated", stepId: "communication", type: "boolean", text: "Are messages authenticated?", dimensions: [{ dimension: "authenticity", weight: 2 }] },
  { id: "encrypted", stepId: "communication", type: "boolean", text: "Is communication encrypted?", dimensions: [{ dimension: "integrity", weight: 1 }, { dimension: "authenticity", weight: 1 }] },
  { id: "replay-protection", stepId: "communication", type: "boolean", text: "Is replay protection implemented?", dimensions: [{ dimension: "integrity", weight: 1 }, { dimension: "resilience", weight: 1 }] },
  { id: "message-integrity", stepId: "communication", type: "boolean", text: "Is message integrity verified (e.g. MAC/CRC with authentication)?", dimensions: [{ dimension: "integrity", weight: 2 }] },
  { id: "timestamp-validation", stepId: "communication", type: "boolean", text: "Is timestamp/freshness validation performed on incoming messages?", dimensions: [{ dimension: "integrity", weight: 1 }, { dimension: "detection", weight: 1 }] },

  // ── Firmware (8) ──
  { id: "secure-boot", stepId: "firmware", type: "boolean", text: "Is secure boot implemented?", dimensions: [{ dimension: "integrity", weight: 2 }, { dimension: "resilience", weight: 1 }] },
  { id: "signed-firmware", stepId: "firmware", type: "boolean", text: "Is firmware cryptographically signed?", dimensions: [{ dimension: "authenticity", weight: 2 }, { dimension: "integrity", weight: 1 }] },
  { id: "ota", stepId: "firmware", type: "boolean", text: "Is over-the-air (OTA) update capability implemented with signature verification?", dimensions: [{ dimension: "availability", weight: 1 }] },
  { id: "rollback-protection", stepId: "firmware", type: "boolean", text: "Is rollback (downgrade) protection implemented?", dimensions: [{ dimension: "resilience", weight: 2 }] },
  { id: "version-control", stepId: "firmware", type: "boolean", text: "Is firmware version tracked and controlled?", dimensions: [{ dimension: "evidence", weight: 1 }, { dimension: "integrity", weight: 1 }] },
  { id: "certificate-management", stepId: "firmware", type: "boolean", text: "Is there a certificate management process?", dimensions: [{ dimension: "authenticity", weight: 2 }] },
  { id: "key-rotation", stepId: "firmware", type: "boolean", text: "Is cryptographic key rotation supported?", dimensions: [{ dimension: "authenticity", weight: 1 }, { dimension: "resilience", weight: 1 }] },
  { id: "supply-chain-verification", stepId: "firmware", type: "boolean", text: "Is supply-chain provenance verified for firmware and hardware?", dimensions: [{ dimension: "identity", weight: 1 }, { dimension: "integrity", weight: 1 }] },

  // ── Charging (1 context + 5 scored) ──
  { id: "charger-types", stepId: "charging", type: "multi-select", text: "Which charging methods are supported?", options: ["Ground charger", "Fast charging", "Wireless", "Maintenance charger"], dimensions: [] },
  { id: "charging-authentication", stepId: "charging", type: "boolean", text: "Is the charger authenticated before a charge session begins?", dimensions: [{ dimension: "authenticity", weight: 2 }] },
  { id: "charging-certificates", stepId: "charging", type: "boolean", text: "Are charging certificates used?", dimensions: [{ dimension: "authenticity", weight: 1 }, { dimension: "integrity", weight: 1 }] },
  { id: "charging-encrypted", stepId: "charging", type: "boolean", text: "Is the charging data channel encrypted?", dimensions: [{ dimension: "integrity", weight: 1 }] },
  { id: "charging-authorization", stepId: "charging", type: "boolean", text: "Is each charge session explicitly authorized?", dimensions: [{ dimension: "authenticity", weight: 1 }, { dimension: "resilience", weight: 1 }] },
  { id: "charging-audit-trail", stepId: "charging", type: "boolean", text: "Is a charging audit trail maintained?", dimensions: [{ dimension: "evidence", weight: 2 }] },

  // ── Maintenance (7) ──
  { id: "laptop-authentication", stepId: "maintenance", type: "boolean", text: "Does the maintenance laptop require authentication to connect?", dimensions: [{ dimension: "authenticity", weight: 2 }] },
  { id: "engineer-identity", stepId: "maintenance", type: "boolean", text: "Is the maintenance engineer's identity verified per session?", dimensions: [{ dimension: "identity", weight: 1 }, { dimension: "authenticity", weight: 1 }] },
  { id: "offline-mode", stepId: "maintenance", type: "boolean", text: "Can safety-critical functions operate correctly if maintenance tooling is offline?", dimensions: [{ dimension: "availability", weight: 1 }, { dimension: "resilience", weight: 1 }] },
  { id: "usb-protection", stepId: "maintenance", type: "boolean", text: "Are USB ports protected against unauthorized device connection?", dimensions: [{ dimension: "integrity", weight: 1 }, { dimension: "resilience", weight: 1 }] },
  { id: "debug-port-protection", stepId: "maintenance", type: "boolean", text: "Are debug ports access-controlled?", dimensions: [{ dimension: "integrity", weight: 1 }] },
  { id: "jtag-disabled", stepId: "maintenance", type: "boolean", text: "Is JTAG disabled or access-controlled in production units?", dimensions: [{ dimension: "integrity", weight: 2 }] },
  { id: "secure-logs", stepId: "maintenance", type: "boolean", text: "Are maintenance actions logged in a tamper-evident way?", dimensions: [{ dimension: "evidence", weight: 2 }] },

  // ── Threat Detection (9) ──
  { id: "rule-engine", stepId: "threat-detection", type: "boolean", text: "Is a deterministic rule-based detection engine in place?", dimensions: [{ dimension: "detection", weight: 2 }] },
  { id: "ai-detection", stepId: "threat-detection", type: "boolean", text: "Is AI-assisted anomaly detection used (as a supplement to, not a replacement for, deterministic controls)?", dimensions: [{ dimension: "detection", weight: 1 }] },
  { id: "physics-validation", stepId: "threat-detection", type: "boolean", text: "Are physics-based plausibility checks implemented?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "integrity", weight: 1 }] },
  { id: "cross-sensor-validation", stepId: "threat-detection", type: "boolean", text: "Is cross-sensor validation implemented?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "integrity", weight: 1 }] },
  { id: "independent-soc-estimation", stepId: "threat-detection", type: "boolean", text: "Is an independent state-of-charge (SOC) estimate maintained as a cross-check?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "availability", weight: 1 }] },
  { id: "independent-soh-estimation", stepId: "threat-detection", type: "boolean", text: "Is an independent state-of-health (SOH) estimate maintained as a cross-check?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "safety", weight: 1 }] },
  { id: "thermal-anomaly-detection", stepId: "threat-detection", type: "boolean", text: "Is thermal anomaly detection implemented?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "safety", weight: 1 }] },
  { id: "power-anomaly-detection", stepId: "threat-detection", type: "boolean", text: "Is power/current anomaly detection implemented?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "safety", weight: 1 }] },
  { id: "identity-anomaly-detection", stepId: "threat-detection", type: "boolean", text: "Is identity anomaly detection implemented (e.g. unexpected component substitution)?", dimensions: [{ dimension: "detection", weight: 1 }, { dimension: "identity", weight: 1 }] },

  // ── Verification (9) ──
  { id: "threat-modelling", stepId: "verification", type: "boolean", text: "Has structured threat modelling been performed?", dimensions: [{ dimension: "verification", weight: 2 }] },
  { id: "pen-testing", stepId: "verification", type: "boolean", text: "Has penetration testing been performed?", dimensions: [{ dimension: "verification", weight: 2 }] },
  { id: "simulation", stepId: "verification", type: "boolean", text: "Has the architecture been validated in simulation?", dimensions: [{ dimension: "verification", weight: 1 }] },
  { id: "cyber-range", stepId: "verification", type: "boolean", text: "Has cyber-range testing been performed?", dimensions: [{ dimension: "verification", weight: 1 }, { dimension: "detection", weight: 1 }] },
  { id: "fault-injection", stepId: "verification", type: "boolean", text: "Has fault-injection testing been performed?", dimensions: [{ dimension: "verification", weight: 1 }, { dimension: "resilience", weight: 1 }] },
  { id: "hardware-in-loop", stepId: "verification", type: "boolean", text: "Has hardware-in-the-loop (HIL) testing been performed?", dimensions: [{ dimension: "verification", weight: 1 }] },
  { id: "digital-twin", stepId: "verification", type: "boolean", text: "Is a digital twin used for verification?", dimensions: [{ dimension: "verification", weight: 1 }] },
  { id: "safety-analysis", stepId: "verification", type: "boolean", text: "Has a formal safety analysis been performed?", dimensions: [{ dimension: "verification", weight: 1 }, { dimension: "safety", weight: 1 }] },
  { id: "evidence-generation", stepId: "verification", type: "boolean", text: "Does the verification process generate retained evidence artifacts?", dimensions: [{ dimension: "verification", weight: 1 }, { dimension: "evidence", weight: 1 }] },
];

export const WIZARD_STEP_ORDER = [
  "battery-architecture",
  "communication",
  "firmware",
  "charging",
  "maintenance",
  "threat-detection",
  "verification",
] as const;

export const WIZARD_STEP_LABELS: Record<(typeof WIZARD_STEP_ORDER)[number], string> = {
  "battery-architecture": "Battery Architecture",
  communication: "Communication",
  firmware: "Firmware",
  charging: "Charging",
  maintenance: "Maintenance",
  "threat-detection": "Threat Detection",
  verification: "Verification",
};
