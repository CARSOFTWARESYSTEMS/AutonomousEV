"use client";
// Interface state: what is shown and the inputs the visitor has set. The
// simulations themselves live in ./runtime and are never React state.
import { create } from "zustand";
import { DEFAULT_PARKING_INPUTS, type ParkingInputs } from "@/lib/wireless-charging/autonomous";
import type { EnvironmentId, ModeId, SectionId, ViewModeId } from "@/lib/wireless-charging/content";
import { DEFAULT_ROAD_INPUTS, type RoadInputs } from "@/lib/wireless-charging/dynamic";
import { DEFAULT_GRID_INPUTS, type GridInputs } from "@/lib/wireless-charging/infrastructure";
import { DEFAULT_STATION_INPUTS, NO_FAULTS, type StationFaults, type StationInputs } from "@/lib/wireless-charging/station";

export const SPEEDS = [0.5, 1, 2, 5, 20, 60, 300] as const;

export interface TwinState {
  section: SectionId;
  environment: EnvironmentId;
  mode: ModeId;
  view: ViewModeId;
  selected: string | null;
  hovered: string | null;
  playing: boolean;
  /** Simulation time per wall-clock second. */
  speed: number;
  /** Bumped on every reset so views can rebuild what they cached. */
  revision: number;
  intro: { active: boolean; scene: number; paused: boolean };
  narration: boolean;
  sound: boolean;
  reducedMotion: boolean;
  sceneReady: boolean;
  /** Full-screen research environment: the browser's Fullscreen API, a full-viewport overlay where that is unavailable, or off. */
  fullscreen: "off" | "native" | "overlay";
  station: StationInputs;
  faults: StationFaults;
  road: RoadInputs;
  parking: ParkingInputs;
  grid: GridInputs;
  /** Hour of the district day being shown, 0–24. */
  gridHour: number;
  /** Field-line phase ωt, rad (Research mode). */
  fieldPhase: number;
  set: (patch: Partial<TwinState>) => void;
  setStation: (patch: Partial<StationInputs>) => void;
  setFaults: (patch: Partial<StationFaults>) => void;
  setRoad: (patch: Partial<RoadInputs>) => void;
  setParking: (patch: Partial<ParkingInputs>) => void;
  setGrid: (patch: Partial<GridInputs>) => void;
  select: (id: string | null) => void;
  bump: () => void;
}

export const useTwin = create<TwinState>((set) => ({
  section: "twin",
  environment: "station",
  mode: "explore",
  view: "cinematic",
  selected: null,
  hovered: null,
  playing: true,
  speed: 1,
  revision: 0,
  intro: { active: false, scene: 0, paused: false },
  narration: false,
  sound: false,
  reducedMotion: false,
  sceneReady: false,
  fullscreen: "off",
  station: DEFAULT_STATION_INPUTS,
  faults: NO_FAULTS,
  road: DEFAULT_ROAD_INPUTS,
  parking: DEFAULT_PARKING_INPUTS,
  grid: DEFAULT_GRID_INPUTS,
  gridHour: 12,
  fieldPhase: 0,
  set: (patch) => set(patch),
  setStation: (patch) => set((s) => ({ station: { ...s.station, ...patch } })),
  setFaults: (patch) => set((s) => ({ faults: { ...s.faults, ...patch } })),
  setRoad: (patch) => set((s) => ({ road: { ...s.road, ...patch } })),
  setParking: (patch) => set((s) => ({ parking: { ...s.parking, ...patch } })),
  setGrid: (patch) => set((s) => ({ grid: { ...s.grid, ...patch } })),
  select: (id) => set({ selected: id }),
  bump: () => set((s) => ({ revision: s.revision + 1 })),
}));
