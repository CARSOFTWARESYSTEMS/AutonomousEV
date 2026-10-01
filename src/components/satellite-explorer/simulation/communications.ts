// Ground-link model: visibility of the illustrative ground station, the
// AOS / LOS transitions around a pass, and reference figures for the two RF
// links. No operational station, frequency licence or data rate is implied.
import type { LinkState } from "../types";
import { GROUND_STATION, ORBIT_REFERENCE, lookAngles } from "./orbit";

export const COMMS_REFERENCE = {
  sband: {
    name: "S-band",
    role: "TT&C",
    roleLong: "Telemetry, Tracking & Command",
    band: "2.0–2.3 GHz",
    uplinkKbps: 32,
    downlinkKbps: 128,
  },
  xband: {
    name: "X-band",
    role: "Payload data",
    roleLong: "Imagery / mission data downlink",
    band: "8.0–8.4 GHz",
    downlinkMbps: 5,
  },
} as const;

/** How long the AOS and LOS callouts stay up around the horizon crossings. */
export const AOS_WINDOW_S = 25;
export const LOS_WINDOW_S = 30;

export interface LinkSample {
  state: LinkState;
  /** True whenever the spacecraft is above the station's elevation mask. */
  visible: boolean;
  elevationDeg: number;
  rangeKm: number;
}

const above = (t: number) => lookAngles(GROUND_STATION, t).elevationDeg >= ORBIT_REFERENCE.elevationMaskDeg;

/** Link state at orbit time t. Stateless, so it is valid for any pass on any revolution. */
export function linkAt(t: number): LinkSample {
  const { elevationDeg, rangeKm } = lookAngles(GROUND_STATION, t);
  const visible = elevationDeg >= ORBIT_REFERENCE.elevationMaskDeg;
  let state: LinkState;
  if (visible) state = above(t - AOS_WINDOW_S) ? "LINK_ACTIVE" : "AOS";
  else state = above(t - LOS_WINDOW_S) ? "LOS" : "NO_LINK";
  return { state, visible, elevationDeg, rangeKm };
}

export const LINK_STATE_LABEL: Record<LinkState, string> = {
  NO_LINK: "NO LINK",
  AOS: "AOS",
  LINK_ACTIVE: "LINK ACTIVE",
  LOS: "LOS",
};

export const LINK_STATE_DESCRIPTION: Record<LinkState, string> = {
  NO_LINK: "Spacecraft is below the station's horizon",
  AOS: "Acquisition of Signal",
  LINK_ACTIVE: "Spacecraft is in view of the station",
  LOS: "Loss of Signal",
};

/** One-way free-space light time for a slant range, milliseconds. */
export const lightTimeMs = (rangeKm: number) => (rangeKm / 299792.458) * 1000;
