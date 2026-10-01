// Shared types for Satellite Explorer 3D. Nothing here depends on three.js or
// React, so data, simulation and tests can import it freely.

export type Vec3 = readonly [number, number, number];
/** Quaternion as [x, y, z, w]. */
export type Quat = readonly [number, number, number, number];

export type SubsystemId = "power" | "avionics" | "adcs" | "communications" | "payload" | "thermal" | "structure";

export type ExplorerMode = "hero" | "build" | "explore" | "systems" | "mission" | "orbit" | "signals";

export type DetailLevel = "learn" | "engineer";

export type SignalView = "command" | "telemetry" | "payload-data";

/** Semantic component ids. Interaction, data and camera logic use only these — never mesh names. */
export type ComponentId =
  | "primary-frame"
  | "end-plates"
  | "side-panels"
  | "payload-deck"
  | "avionics-deck"
  | "deployer-interface"
  | "solar-array-left"
  | "solar-array-right"
  | "battery"
  | "pcdu"
  | "power-harness"
  | "obc"
  | "data-storage"
  | "data-bus"
  | "reaction-wheel-x"
  | "reaction-wheel-y"
  | "reaction-wheel-z"
  | "reaction-wheel-r"
  | "magnetorquers"
  | "magnetometer"
  | "sun-sensors"
  | "star-tracker"
  | "gnss-receiver"
  | "optical-payload"
  | "payload-electronics"
  | "payload-processor"
  | "sband-radio"
  | "sband-antenna"
  | "xband-transmitter"
  | "xband-antenna"
  | "rf-harness"
  | "mli-blanket"
  | "radiator"
  | "heaters";

export type SpacecraftMode = "INITIALIZATION" | "SUN_SAFE" | "NOMINAL" | "IMAGING" | "DOWNLINK";

export type AttitudeMode = "SUN_POINTING" | "NADIR" | "TARGET_TRACK" | "STATION_TRACK";

export type PowerState = "CHARGING" | "DISCHARGING" | "BALANCED";

export type LinkState = "NO_LINK" | "AOS" | "LINK_ACTIVE" | "LOS";

export type MissionStage =
  | "IDLE"
  | "BOOT"
  | "POWER"
  | "ATTITUDE"
  | "TARGET"
  | "CAPTURE"
  | "STORE"
  | "GROUND_PASS"
  | "UPLINK"
  | "TELEMETRY"
  | "PAYLOAD_DOWNLINK"
  | "COMPLETE";

/** Which values a reference figure is: none of them describe flight hardware. */
export type ValueProvenance = "REFERENCE" | "SIMULATED" | "ILLUSTRATIVE";

/**
 * Simulation output consumed by the renderer. The 3D layer never computes
 * physics; it visualises this state. A future source (for example CubeTwin)
 * only has to produce the same shape.
 */
export interface SatelliteState {
  /** Orbit time in seconds relative to the reference epoch (target overflight = 0). */
  time: number;
  /** Battery state of charge, percent. */
  batterySOC: number;
  powerGenerationW: number;
  loadW: number;
  mode: SpacecraftMode;
  /** Body-to-inertial attitude. */
  attitude: Quat;
  groundContact: boolean;
  payloadDataMb: number;
}

export interface SatelliteStateSource {
  sample(orbitTimeS: number): SatelliteState;
}
