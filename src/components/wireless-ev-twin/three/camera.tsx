"use client";
// Camera direction. Every shot is a spherical pose around a target, which may
// follow the moving vehicle. A change of shot starts an eased move from where
// the camera is, timed by how far it travels; the first touch of the pointer
// hands the camera to the visitor and suspends direction until they ask for
// it back (Reset camera) or move to another engineering stage. A selected
// component is framed from its own bounds. Reduced motion cuts instead.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, type Object3D, type PerspectiveCamera, Sphere, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { EnvironmentId, ViewModeId } from "@/lib/wireless-charging/content";
import { facilityIfBuilt, runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { CABINET } from "./station/Site";
import { RX_X } from "./vehicle/Vehicle";
import { ROAD_Z } from "./road/layout";

type V3 = [number, number, number];
const DEG = Math.PI / 180;

export interface Shot {
  /** Look-at point, world metres (relative to the vehicle when `follow` is set). */
  target: V3;
  /** 0° looks from +z, 90° from +x. */
  azimuth: number;
  /** 0° looks straight down, 90° level, above 90° from below the ground. */
  polar: number;
  distance: number;
  min?: number;
  max?: number;
  /** Highest polar angle the visitor may orbit to (default just above the ground). */
  polarMax?: number;
  /** Follow the vehicle; "roadside" is a camera fixed beside the road that the vehicle drives past (a cut to the next one when it has passed). */
  follow?: "station-vehicle" | "parking-vehicle" | "roadside" | "park-focus" | "park-bay";
  /** Vertical field of view, degrees (default 34): long lenses for product shots, wide for close tracking. */
  fov?: number;
  /** A slow, small azimuth sweep after arrival (guided mode only): amplitude in degrees and period in seconds. */
  drift?: { az: number; period: number };
}

const DEFAULT_FOV = 34;

export type ShotId =
  | "establishing"
  | "approach"
  | "identify"
  | "alignment"
  | "ground-assembly"
  | "pads-exploded"
  | "receiver"
  | "field"
  | "cabinet"
  | "energy"
  | "battery"
  | "safety"
  | "xray"
  | "chassis"
  | "underbody"
  | "assembly"
  | "thermal"
  | "iot"
  | "cutaway"
  | "dynamic-follow"
  | "dynamic-cutaway"
  | "dynamic-top"
  | "dynamic-underbody"
  | "dynamic-roadside"
  | "dynamic-receiver"
  | "dynamic-coupling"
  | "road-tracking"
  | "road-low"
  | "road-side"
  | "road-rear"
  | "road-aerial"
  | "road-handover"
  | "road-failed"
  | "road-field"
  | "road-energy"
  | "autonomous"
  | "autonomous-top"
  | "district"
  | "district-energy"
  | "park-establishing"
  | "park-aerial"
  | "park-approach"
  | "park-entry"
  | "park-recognition"
  | "park-reader"
  | "park-barrier"
  | "park-top"
  | "park-tracking"
  | "park-parking"
  | "park-charging-bay"
  | "park-shelter"
  | "park-sensors"
  | "park-gateway"
  | "park-iot"
  | "park-solar"
  | "park-energy"
  | "park-environment"
  | "park-departure";

/** True when the segment from a to b passes through a wheel of the parked vehicle (bay frame). */
function hitsWheel(a: V3, b: V3, vehicleX: number): boolean {
  for (let i = 1; i < 24; i++) {
    const t = i / 24;
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    const z = a[2] + (b[2] - a[2]) * t;
    if (y > 0.74) continue;
    for (const wx of [vehicleX + 1.45, vehicleX - 1.45]) for (const wz of [0.81, -0.81]) if (Math.abs(x - wx) < 0.4 && Math.abs(z - wz) < 0.16) return true;
  }
  return false;
}

/**
 * The field section runs through both pad centres along the receiver's
 * offset; look at it square-on, from whichever side has a clear line of sight
 * past the wheels (the +x side when both do).
 */
function fieldShot(lateral: number, longitudinal: number): Shot {
  const dx = longitudinal;
  const dz = -lateral;
  const phi = Math.hypot(dx, dz) > 1e-3 ? Math.atan2(dz, dx) : 0;
  const target: V3 = [dx / 2, 0.12, dz / 2];
  const polar = 70;
  const distance = 2.3;
  const options = [1, -1].map((sign) => {
    const nx = -Math.sin(phi) * sign;
    const nz = Math.cos(phi) * sign;
    const h = distance * Math.sin(polar * DEG);
    const cam: V3 = [target[0] + nx * h, target[1] + distance * Math.cos(polar * DEG), target[2] + nz * h];
    return { nx, nz, clear: !hitsWheel(cam, target, longitudinal - 0.6) };
  });
  options.sort((a, b) => Number(b.clear) - Number(a.clear) || b.nx - a.nx);
  const n = options[0];
  return { target, azimuth: Math.atan2(n.nx, n.nz) / DEG, polar, distance, min: 0.6, max: 8 };
}

/** Composed shots. Station shots are in the bay frame (pad at the origin, vehicle nose toward +x). */
export function shotFor(id: ShotId): Shot {
  const s = useTwin.getState().station;
  switch (id) {
    case "establishing":
      // Eye height under the shelter's edge: the bay, the pad, the cabinet and the canopy above, the landscape beyond.
      return { target: [0.2, 1.25, -1.6], azimuth: -64, polar: 80.5, distance: 15.5, min: 3, max: 60, fov: 30, drift: { az: 5, period: 26 } };
    case "approach":
      return { target: [0.9, 0.7, 0], azimuth: -58, polar: 81, distance: 8.6, follow: "station-vehicle", min: 2, max: 40, fov: 30 };
    case "identify":
      return { target: [-1.6, 1.5, 0.3], azimuth: -38, polar: 72, distance: 9.5, min: 2, max: 40 };
    case "alignment":
      return { target: [s.longitudinal / 2, 0.1, -s.lateral / 2], azimuth: 40, polar: 38, distance: 2.6, min: 0.8, max: 12 };
    case "ground-assembly":
      return { target: [0, 0.24, 0], azimuth: 58, polar: 64, distance: 2.4, min: 0.6, max: 12 };
    case "pads-exploded":
      return { target: [0, 0.16, 0], azimuth: 62, polar: 82, distance: 2.9, min: 0.6, max: 12, polarMax: 100 };
    case "receiver":
      // Low beside the vehicle, between the wheels: the receiver under the ghosted battery, the ground pad beneath it.
      return { target: [RX_X - 0.05, 0.16, 0], azimuth: 18, polar: 84, distance: 2.1, follow: "station-vehicle", min: 0.6, max: 12, polarMax: 100 };
    case "field":
      return fieldShot(s.lateral, s.longitudinal);
    case "cutaway":
      // From the bay's open side, between the wheels, toward the clipped quarter (+x, +z).
      return { target: [0.02, 0.05, 0.02], azimuth: 22, polar: 64, distance: 1.75, min: 0.5, max: 10 };
    case "cabinet":
      // Square to the open cabinet (its door faces −x), from the vehicle's side of it.
      return { target: [CABINET.x - 0.1, 0.95, CABINET.z - 0.05], azimuth: -112, polar: 84, distance: 2.7, min: 0.6, max: 10 };
    case "energy":
      // Under the canopy, along the chain: transformer and cabinet at the head of the bay, the pads, the vehicle and its battery.
      return { target: [1.2, 0.85, 0.1], azimuth: -36, polar: 80, distance: 9.6, min: 2, max: 40, fov: 34 };
    case "battery":
      return { target: [0.1, 0.4, 0], azimuth: -38, polar: 56, distance: 4.4, follow: "station-vehicle", min: 1, max: 20 };
    case "safety":
      // From the bay's side, between the wheels, low enough to see the pad's top under the floor.
      // Eye level with the air gap: between the pads, under the body, past the wheels.
      return { target: [0.12, 0.1, -0.06], azimuth: -4, polar: 86, distance: 1.55, min: 0.6, max: 12, polarMax: 95 };
    case "xray":
      return { target: [0.1, 0.62, 0], azimuth: -46, polar: 66, distance: 6.2, follow: "station-vehicle", min: 1.2, max: 30 };
    case "chassis":
      return { target: [0.1, 0.5, 0], azimuth: -52, polar: 62, distance: 5.6, follow: "station-vehicle", min: 1.2, max: 30 };
    case "underbody":
      return { target: [0.1, 0.24, 0], azimuth: -30, polar: 128, distance: 4.0, follow: "station-vehicle", min: 1, max: 20, polarMax: 160 };
    case "assembly":
      return { target: [0.1, 1.0, 0], azimuth: -48, polar: 64, distance: 8.6, follow: "station-vehicle", min: 2, max: 30 };
    case "thermal":
      return { target: [0.6, 0.55, 0.4], azimuth: -40, polar: 60, distance: 7.5, min: 1, max: 30 };
    case "iot":
      return { target: [1.8, 2.2, -0.6], azimuth: -42, polar: 62, distance: 14, min: 3, max: 50 };
    case "dynamic-follow":
      return { target: [1.2, 0.6, ROAD_Z], azimuth: -32, polar: 74, distance: 11, min: 2, max: 60 };
    case "dynamic-roadside":
      return { target: [0.8, 0.6, ROAD_Z], azimuth: 145, polar: 84, distance: 30, follow: "roadside", min: 2, max: 80 };
    case "dynamic-receiver":
      // Low on the near shoulder, level with the receiver: the pads pass under it through the cut.
      return { target: [0.6, 0.02, ROAD_Z], azimuth: 200, polar: 86, distance: 2.7, min: 0.8, max: 20, polarMax: 95 };
    case "dynamic-coupling":
      // From above the next lane: the coupling chart in front, the vehicle and its lane behind it.
      return { target: [2.4, 0.7, ROAD_Z + 1.2], azimuth: 18, polar: 70, distance: 15, min: 3, max: 60 };
    case "dynamic-cutaway":
      // Down over the guardrail into the section: the trench wall, the duct bank, and the pads beside the car.
      return { target: [4.2, -0.18, ROAD_Z - 1.3], azimuth: 148, polar: 50, distance: 5.2, min: 1, max: 40, polarMax: 95 };
    case "road-tracking":
      // Front three-quarter, from the near shoulder ahead of the car: the car, the lane ahead, the landscape.
      return { target: [0.5, 0.72, ROAD_Z], azimuth: 122, polar: 82.5, distance: 8.8, min: 2, max: 60, fov: 30, drift: { az: 6, period: 22 } };
    case "road-low":
      // Near road level: wheels turning, the surface rushing past.
      return { target: [0.4, 0.5, ROAD_Z], azimuth: 116, polar: 88.4, distance: 5.6, min: 1.2, max: 40, polarMax: 92, fov: 38, drift: { az: 3, period: 18 } };
    case "road-side":
      // A parallel camera raised over the near verge (its sight line clears the guardrail): speed reads from the passing road.
      return { target: [0, 0.55, ROAD_Z], azimuth: 180, polar: 70, distance: 6.6, min: 1.5, max: 30, fov: 40 };
    case "road-rear":
      // Behind and above: the car driving through the successive segments ahead.
      return { target: [3.2, 0.5, ROAD_Z], azimuth: -68, polar: 77, distance: 10.5, min: 2, max: 60, fov: 32, drift: { az: 4, period: 24 } };
    case "road-aerial":
      return { target: [10, 0, ROAD_Z + 4], azimuth: 128, polar: 54, distance: 62, min: 10, max: 200, fov: 30, drift: { az: 6, period: 40 } };
    case "road-handover":
      // Down on the receiver and the pads around it (the car is seen through in this view).
      return { target: [0.6, 0.02, ROAD_Z], azimuth: 150, polar: 58, distance: 3.6, min: 0.8, max: 20, fov: 38 };
    case "road-failed":
      // Long lens down the lane ahead of the car: the failed pad comes up in the sequence.
      return { target: [5, 0.3, ROAD_Z], azimuth: -72, polar: 68, distance: 11.5, min: 2, max: 60, fov: 30 };
    case "road-energy":
      // Front three-quarter, a little above the car: the glowing pads beneath, the link, the DC path to the battery and the motor.
      return { target: [0.35, 0.36, ROAD_Z], azimuth: 148, polar: 78, distance: 6.6, min: 1.5, max: 40, fov: 32, drift: { az: 5, period: 24 } };
    case "road-field": {
      // Square to the field section through the receiver, from the near shoulder, level with the gap.
      const lateral = useTwin.getState().road.lateral;
      return { target: [0.6, 0.06, ROAD_Z - lateral], azimuth: 180, polar: 88.5, distance: 2.2, min: 0.6, max: 20, polarMax: 100, fov: 36 };
    }
    case "dynamic-top":
      // Nearly overhead from the median side, so the vehicle drives left to right.
      return { target: [1.5, 0, ROAD_Z + 0.2], azimuth: 0, polar: 14, distance: 13, min: 3, max: 60 };
    case "dynamic-underbody":
      return { target: [0.6, 0.05, ROAD_Z], azimuth: 160, polar: 118, distance: 4.5, min: 1, max: 20, polarMax: 160 };
    case "autonomous":
      return { target: [-4.6, 0.4, -4.2], azimuth: -50, polar: 62, distance: 14.7, follow: undefined, min: 3, max: 60 };
    case "autonomous-top":
      return { target: [-5, 0, -2], azimuth: -90, polar: 10, distance: 22, min: 3, max: 60 };
    case "district":
      return { target: [-2, 0, 6], azimuth: -38, polar: 43, distance: 126, min: 20, max: 260 };
    // ── Smart Parking: the facility is centred on the origin; world z = −(facility y). ──
    case "park-establishing":
      // Architectural: elevated from the south-east (front-lit), the south row in front, the north row and the entry beyond.
      return { target: [-1.5, 1.4, -1.5], azimuth: 30, polar: 70, distance: parkingGeom().scale * 31, min: 4, max: 140, fov: 32, drift: { az: 5, period: 30 } };
    case "park-aerial":
      return { target: [-2, 0, -1], azimuth: 26, polar: 44, distance: parkingGeom().scale * 58, min: 10, max: 200, fov: 30, drift: { az: 6, period: 40 } };
    case "park-approach":
      // Ahead of the vehicle on its right (the driver's side), the entry gate beyond.
      return { target: [2.2, 0.8, 0], azimuth: 68, polar: 80, distance: 11.5, follow: "park-focus", min: 2, max: 60, fov: 32 };
    case "park-entry": {
      const x = parkingGeom().entry;
      return { target: [x - 1.5, 1.1, 0.2], azimuth: -40, polar: 76, distance: 12, min: 2, max: 60, fov: 32 };
    }
    case "park-recognition": {
      const x = parkingGeom().entry;
      // Over the recognition camera's shoulder at the plate of a vehicle at the stop line.
      return { target: [x - 1.8, 0.7, 0], azimuth: 72, polar: 79, distance: 7.4, min: 1, max: 30, fov: 34 };
    }
    case "park-reader": {
      const x = parkingGeom().entry;
      return { target: [x - 3.1, 1.0, 1.9], azimuth: 18, polar: 80, distance: 4.6, min: 1, max: 30, fov: 34 };
    }
    case "park-barrier": {
      const x = parkingGeom().entry;
      return { target: [x, 1.0, 0.6], azimuth: 18, polar: 78, distance: 8, min: 1.5, max: 40, fov: 32 };
    }
    case "park-top":
      return { target: [0, 0, 0], azimuth: 0, polar: 9, distance: parkingGeom().scale * 44, min: 8, max: 160, fov: 32 };
    case "park-tracking":
      return { target: [0.8, 0.7, 0], azimuth: -42, polar: 70, distance: 13, follow: "park-focus", min: 2, max: 60, fov: 32 };
    case "park-parking":
      return { target: [0, 0.6, 0], azimuth: -26, polar: 58, distance: 10, follow: "park-focus", min: 2, max: 60, fov: 32 };
    case "park-charging-bay": {
      // Rear three-quarter from the aisle, raised under the canopy edge: the whole vehicle in its bay, the bay
      // indicator and sensor above it, and (through the ghosted body in X-ray) the receiver over the ground pad.
      const south = parkingGeom().focusRow === "S";
      return { target: [0, 0.45, south ? -0.55 : 0.55], azimuth: south ? 150 : 30, polar: 60, distance: 6.6, follow: "park-bay", min: 0.8, max: 30, polarMax: 96, fov: 36 };
    }
    case "park-shelter":
      // From the east end, along the north row: columns, beams, purlins, sensors and the cable tray under the opened roof.
      return { target: [-2, 2.1, -5.6], azimuth: 72, polar: 81, distance: 19, min: 3, max: 80, fov: 34 };
    case "park-sensors":
      return { target: [-2.7, 2.4, -5.2], azimuth: 30, polar: 92, distance: 7.5, min: 1.5, max: 40, polarMax: 100, fov: 36 };
    case "park-gateway": {
      const g = parkingGeom();
      return { target: [g.equipX, 1.1, -g.equipY], azimuth: 20, polar: 78, distance: 7.6, min: 1.5, max: 40, fov: 32 };
    }
    case "park-iot":
      return { target: [-2, 1.6, -1], azimuth: 24, polar: 56, distance: parkingGeom().scale * 34, min: 4, max: 120, fov: 32 };
    case "park-solar":
      return { target: [0, 3.4, -5.6], azimuth: 22, polar: 46, distance: 26, min: 4, max: 90, fov: 30 };
    case "park-energy": {
      const g = parkingGeom();
      return { target: [g.equipX - 6, 1.0, -2], azimuth: 12, polar: 58, distance: 26, min: 4, max: 120, fov: 32 };
    }
    case "park-environment":
      // From the south lawn, level with the canopy: the fans, the air node and the sensors under the south roof.
      return { target: [-1, 2.3, 5.6], azimuth: -24, polar: 84, distance: 12, min: 2, max: 60, polarMax: 98, fov: 34 };
    case "park-departure":
      return { target: [1.2, 0.8, 0], azimuth: -60, polar: 72, distance: 13, follow: "park-focus", min: 2, max: 60, fov: 32 };
    case "district-energy":
      return { target: [1, 0, 8], azimuth: -30, polar: 50, distance: 70, min: 15, max: 260 };
  }
}

/** The shot a visualisation mode uses when no guided stage is driving the camera. */
export function viewShot(env: EnvironmentId, v: ViewModeId): ShotId {
  if (env === "dynamic") {
    const road: Partial<Record<ViewModeId, ShotId>> = { energy: "road-energy", field: "road-field", cutaway: "dynamic-cutaway", underbody: "dynamic-underbody", segments: "dynamic-top", top: "dynamic-top", coupling: "dynamic-coupling", receiver: "dynamic-receiver", roadside: "dynamic-roadside" };
    return road[v] ?? "dynamic-follow";
  }
  if (env === "autonomous") return "autonomous";
  if (env === "parking") {
    const park: Partial<Record<ViewModeId, ShotId>> = { shelter: "park-shelter", occupancy: "park-top", top: "park-top", energy: "park-energy", environment: "park-environment", iot: "park-iot", xray: "park-charging-bay" };
    return park[v] ?? "park-establishing";
  }
  if (env === "infrastructure") return "district";
  const map: Partial<Record<ViewModeId, ShotId>> = {
    engineering: "alignment",
    xray: "xray",
    chassis: "chassis",
    underbody: "underbody",
    battery: "battery",
    receiver: "receiver",
    assembly: "assembly",
    power: "cabinet",
    cutaway: "cutaway",
    exploded: "pads-exploded",
    field: "field",
    energy: "energy",
    thermal: "thermal",
    iot: "iot",
  };
  return map[v] ?? "establishing";
}

/** Facility geometry the parking shots use (defaults before the facility exists). */
function parkingGeom() {
  const sim = facilityIfBuilt();
  const l = sim?.layout;
  const focusSession = sim?.focus ? [...sim.sessions.values()].find((x) => x.vehicleId === sim.focus) : undefined;
  const focusRow = focusSession?.bayId ? sim?.bays.find((b) => b.bay.id === focusSession.bayId)?.bay.row : undefined;
  // Wide shots grow with the facility (12 bays is the reference length).
  const scale = l ? Math.max(1, (l.perSide * l.inputs.bayWidth) / 16.2) : 1;
  return { entry: l?.entry.barrierX ?? -20.3, equipX: l ? l.aisle.xEast - 2.2 : 10.5, equipY: l ? l.aisle.half + 3.2 : 6.2, focusRow, scale };
}

/** Centre of the focus vehicle (or of its bay), world frame. */
function parkingFocus(kind: "park-focus" | "park-bay", out: Vector3): boolean {
  const sim = facilityIfBuilt();
  if (!sim || !sim.focus) return false;
  const v = sim.vehicles.find((x) => x.profile.id === sim.focus);
  if (kind === "park-bay") {
    const s = v ? sim.sessions.get(v.sessionId) : undefined;
    // The focus vehicle's bay, or else a bay where a vehicle is charging.
    const id = s?.bayId ?? [...sim.chargers.values()].find((c) => c.session)?.bayId;
    const b = id ? sim.bays.find((x) => x.bay.id === id) : undefined;
    if (b) {
      const pad = b.bay.pad ?? { x: b.bay.x, y: b.bay.y };
      out.x += pad.x;
      out.z += -pad.y;
      return true;
    }
  }
  if (!v || !v.spawned || v.gone) return false;
  out.x += v.pose.x + Math.cos(v.pose.heading) * (v.fp.wheelbase / 2);
  out.z += -(v.pose.y + Math.sin(v.pose.heading) * (v.fp.wheelbase / 2));
  return true;
}

/** Where a following shot's target is now. */
function followOffset(shot: Shot, out: Vector3): Vector3 {
  out.set(...shot.target);
  if (shot.follow === "park-focus" || shot.follow === "park-bay") {
    parkingFocus(shot.follow, out);
    return out;
  }
  if (shot.follow === "station-vehicle") {
    const v = runtime.station.state.vehicle;
    // Following shots are given relative to the vehicle's centre (x forward, z left).
    if (v.present) {
      out.x += v.x;
      out.z += -v.y;
    }
  }
  return out;
}

interface Pose {
  target: Vector3;
  azimuth: number;
  polar: number;
  distance: number;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const nearest = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
};

function poseFromCamera(camera: PerspectiveCamera, target: Vector3): Pose {
  const off = camera.position.clone().sub(target);
  const distance = Math.max(0.05, off.length());
  return { target: target.clone(), distance, polar: Math.acos(Math.min(1, Math.max(-1, off.y / distance))), azimuth: Math.atan2(off.x, off.z) };
}

function place(camera: PerspectiveCamera, pose: Pose) {
  const s = Math.sin(pose.polar);
  camera.position.set(s * Math.sin(pose.azimuth), Math.cos(pose.polar), s * Math.cos(pose.azimuth)).multiplyScalar(pose.distance).add(pose.target);
  camera.lookAt(pose.target);
}

/** The world bounds of every visible mesh tagged with a component id. */
export function componentBounds(root: Object3D, id: string): Sphere | null {
  const box = new Box3();
  const part = new Box3();
  let found = false;
  root.traverseVisible((o) => {
    if (o.userData?.component !== id) return;
    const g = (o as { geometry?: { boundingBox: Box3 | null; computeBoundingBox(): void } }).geometry;
    if (!g) return;
    if (!g.boundingBox) g.computeBoundingBox();
    part.copy(g.boundingBox!).applyMatrix4(o.matrixWorld);
    if (!found) box.copy(part);
    else box.union(part);
    found = true;
  });
  if (!found) return null;
  return box.getBoundingSphere(new Sphere());
}

/** The shot the current state asks for, and a key that changes when it does. */
function desiredShot(): { key: string; shot: Shot | null; focus: string | null } {
  const s = useTwin.getState();
  // Development only: a fixed shot for visual inspection scripts.
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    const debug = (window as unknown as { __wevctShot?: Shot }).__wevctShot;
    if (debug) return { key: `debug|${JSON.stringify(debug)}`, shot: debug, focus: null };
  }
  if (s.selected && s.camera.focus) return { key: `focus|${s.selected}|${s.camera.nonce}`, shot: null, focus: s.selected };
  if (s.guide.active && s.guide.shot) {
    const id = s.guide.shot;
    return { key: `stage|${s.guide.stageId}|${id}|${s.camera.nonce}`, shot: shotFor(id), focus: null };
  }
  const id = viewShot(s.environment, s.view);
  const st = s.station;
  const geo = id === "field" || id === "alignment" ? `|${st.lateral.toFixed(3)}|${st.longitudinal.toFixed(3)}` : "";
  return { key: `view|${s.environment}|${id}${geo}|${s.revision}|${s.camera.nonce}`, shot: shotFor(id), focus: null };
}

export function CameraRig() {
  const camera = useThree((st) => st.camera) as PerspectiveCamera;
  const controls = useThree((st) => st.controls) as unknown as OrbitControlsImpl | null;
  const scene = useThree((st) => st.scene);
  const rig = useRef({
    key: "",
    tween: null as null | { from: Pose; to: Pose; start: number; duration: number; shot: Shot | null; fov0: number },
    /** Pose on arrival, the base of a drifting shot, and when the drift started. */
    base: null as null | { pose: Pose; since: number },
    shot: null as Shot | null,
    lastFollow: new Vector3(),
    first: true,
    roadside: null as number | null,
    pose: { target: new Vector3(), azimuth: 0, polar: 0, distance: 1 } as Pose,
  });
  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3() }), []);

  // Any pointer input hands the camera to the visitor.
  useEffect(() => {
    if (!controls) return;
    const take = () => {
      rig.current.tween = null;
      const s = useTwin.getState();
      if (s.camera.mode !== "free") s.setCamera({ mode: "free" });
    };
    controls.addEventListener("start", take);
    return () => controls.removeEventListener("start", take);
  }, [controls]);

  useFrame(() => {
    if (!controls) return;
    const r = rig.current;
    const s = useTwin.getState();
    const want = desiredShot();
    const guided = s.camera.mode === "guided";
    if (want.key !== r.key && guided) {
      r.key = want.key;
      let to: Pose | null = null;
      let shot = want.shot;
      if (want.focus) {
        const b = componentBounds(scene, want.focus);
        if (b) {
          const fov = camera.fov * DEG;
          const dist = Math.min(30, Math.max(0.45, (b.radius / Math.sin(fov / 2)) * 1.15));
          // Look along the current view's composed direction, which that view keeps clear of obstructions.
          const base = shotFor(viewShot(s.environment, s.view));
          to = { target: b.center.clone(), azimuth: base.azimuth * DEG, polar: Math.min(86 * DEG, Math.max(28 * DEG, base.polar * DEG)), distance: dist };
          shot = { target: [b.center.x, b.center.y, b.center.z], azimuth: to.azimuth / DEG, polar: to.polar / DEG, distance: dist, min: Math.max(0.15, b.radius * 0.6), max: dist * 6 };
        }
      }
      if (shot && !to) {
        const t = followOffset(shot, tmp.a);
        to = { target: t.clone(), azimuth: shot.azimuth * DEG, polar: shot.polar * DEG, distance: shot.distance };
      }
      if (shot?.follow === "roadside") {
        // A roadside camera is a cut, not a move.
        r.tween = null;
        r.shot = shot;
        r.roadside = null;
        r.first = false;
        relaxLimits(controls);
        to = null;
      }
      if (to && shot) {
        const from = poseFromCamera(camera, controls.target);
        to.azimuth = nearest(from.azimuth, to.azimuth);
        const travel = from.target.distanceTo(to.target) + Math.abs(from.distance - to.distance) * 0.6 + Math.abs(to.azimuth - from.azimuth) * 1.2 + Math.abs(to.polar - from.polar) * 1.5;
        const duration = r.first || s.reducedMotion ? 0 : Math.min(2600, Math.max(800, 800 + travel * 140));
        r.first = false;
        r.shot = shot;
        // While moving, allow any distance and angle; the shot's limits apply on arrival.
        relaxLimits(controls);
        r.base = null;
        if (duration === 0) {
          controls.target.copy(to.target);
          place(camera, to);
          setFov(camera, shot.fov ?? DEFAULT_FOV);
          r.tween = null;
          applyLimits(controls, shot);
          if (shot.drift && !shot.follow) r.base = { pose: { ...to, target: to.target.clone() }, since: performance.now() };
        } else r.tween = { from, to, start: performance.now(), duration, shot, fov0: camera.fov };
        if (shot.follow) r.lastFollow.copy(followOffset(shot, tmp.b));
      }
    }
    if (r.tween) {
      const tw = r.tween;
      const k = ease(Math.min(1, (performance.now() - tw.start) / tw.duration));
      // A following target keeps moving during the move: aim at where it is now.
      const end = tw.shot?.follow ? followOffset(tw.shot, tmp.a) : tw.to.target;
      const p = r.pose;
      p.target.lerpVectors(tw.from.target, end, k);
      p.azimuth = tw.from.azimuth + (tw.to.azimuth - tw.from.azimuth) * k;
      p.polar = tw.from.polar + (tw.to.polar - tw.from.polar) * k;
      p.distance = tw.from.distance * Math.pow(tw.to.distance / tw.from.distance, k);
      controls.target.copy(p.target);
      place(camera, p);
      setFov(camera, tw.fov0 + ((tw.shot?.fov ?? DEFAULT_FOV) - tw.fov0) * k);
      if (k >= 1) {
        r.tween = null;
        if (tw.shot) applyLimits(controls, tw.shot);
        if (tw.shot?.follow) r.lastFollow.copy(end);
        if (tw.shot?.drift && !tw.shot.follow && !s.reducedMotion) r.base = { pose: { ...p, target: p.target.clone() }, since: performance.now() };
      }
    } else if (r.base && guided && r.shot?.drift) {
      // A slow sweep around the subject while the shot holds (stops on the first touch).
      const d = r.shot.drift;
      const t = (performance.now() - r.base.since) / 1000;
      const sweep = d.az * DEG * Math.sin((2 * Math.PI * t) / d.period);
      const p = r.pose;
      p.target.copy(r.base.pose.target);
      p.azimuth = r.base.pose.azimuth + sweep;
      p.polar = r.base.pose.polar;
      p.distance = r.base.pose.distance;
      controls.target.copy(p.target);
      place(camera, p);
    } else if (r.shot?.follow === "roadside") {
      if (guided) placeRoadside(r, camera, controls);
    } else if (r.shot?.follow) {
      // After arrival (and in free mode), the camera rides along with the vehicle it is following.
      const now = followOffset(r.shot, tmp.a);
      const d = tmp.b.copy(now).sub(r.lastFollow);
      if (d.lengthSq() > 1e-10 && d.lengthSq() < 100) {
        controls.target.add(d);
        camera.position.add(d);
      }
      r.lastFollow.copy(now);
    }
    // Depth precision follows the shot: the near plane scales with the distance to the subject, so
    // surfaces millimetres apart (road, markings, lawn, slab) never fight at any distance.
    fitClipping(camera, camera.position.distanceTo(controls.target));
    // Free mode keeps the key in step, so returning to guided starts from where the visitor left it.
    if (!guided) {
      r.key = "";
      r.base = null;
    }
  });
  return null;
}

/** A camera on a post beside the near shoulder; when the vehicle has passed it, cut to the next post ahead. */
function placeRoadside(r: { roadside: number | null }, camera: PerspectiveCamera, controls: OrbitControlsImpl) {
  const x = runtime.road.state.x;
  if (r.roadside === null || r.roadside - x < -24 || r.roadside - x > 80) r.roadside = x + 34;
  camera.position.set(r.roadside - x, 1.25, ROAD_Z - 5.4);
  controls.target.set(0.8, 0.62, ROAD_Z);
  camera.lookAt(controls.target);
}

/** Near and far planes from the distance to the subject (close-ups keep a 2 cm near plane). */
export function clippingFor(distance: number): { near: number; far: number } {
  const near = Math.min(3, Math.max(0.02, distance * 0.012));
  const far = Math.min(2400, Math.max(1000, distance * 12 + 900));
  return { near, far };
}

function fitClipping(camera: PerspectiveCamera, distance: number) {
  const { near, far } = clippingFor(distance);
  if (Math.abs(camera.near - near) / near < 0.04 && Math.abs(camera.far - far) / far < 0.04) return;
  camera.near = near;
  camera.far = far;
  camera.updateProjectionMatrix();
}

function setFov(camera: PerspectiveCamera, fov: number) {
  if (Math.abs(camera.fov - fov) < 1e-3) return;
  camera.fov = fov;
  camera.updateProjectionMatrix();
}

function relaxLimits(controls: OrbitControlsImpl) {
  controls.minDistance = 0.05;
  controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI;
}

function applyLimits(controls: OrbitControlsImpl, shot: Shot) {
  controls.minDistance = shot.min ?? 0.4;
  controls.maxDistance = shot.max ?? 300;
  controls.maxPolarAngle = (shot.polarMax ?? 88) * DEG;
}
