"use client";
// Interface state: what is shown and the inputs the visitor has set. The
// simulations themselves live in ./runtime and are never React state.
import { create } from "zustand";
import { DEFAULT_PARKING_INPUTS, type ParkingInputs } from "@/lib/wireless-charging/autonomous";
import type { EnvironmentId, ModeId, SectionId, ViewModeId } from "@/lib/wireless-charging/content";
import { DEFAULT_ROAD_INPUTS, type RoadInputs } from "@/lib/wireless-charging/dynamic";
import { DEFAULT_GRID_INPUTS, type GridInputs } from "@/lib/wireless-charging/infrastructure";
import { DEFAULT_STATION_INPUTS, NO_FAULTS, type StationFaults, type StationInputs } from "@/lib/wireless-charging/station";
import type { ShotId } from "../three/camera";
import { viewFor } from "../three/componentViews";

export const SPEEDS = [0.5, 1, 2, 5, 20, 60, 300] as const;

/** Rendering quality. Never changes a calculated value. */
export type QualityChoice = "auto" | "high" | "balanced" | "performance";
export type PlaylistId = EnvironmentId | "demo";
/** The right-hand panel: the environment's inputs (Engineer, Research), a component, the current stage's science, or its data panels. */
export type PanelId = "none" | "inputs" | "research" | "component" | "science" | "data";

export interface GuideState {
  /** True while the current stage drives the view and the camera. */
  active: boolean;
  playlist: PlaylistId;
  index: number;
  stageId: string;
  shot: ShotId | null;
  /** Auto-advance (Explore mode, until the visitor interacts). */
  auto: boolean;
  /** performance.now() when the stage was entered. */
  enteredAt: number;
}

export interface TwinState {
  section: SectionId;
  environment: EnvironmentId;
  mode: ModeId;
  view: ViewModeId;
  selected: string | null;
  hovered: string | null;
  /** Unrelated parts ghosted while a component is selected. */
  isolate: boolean;
  playing: boolean;
  /** Simulation time per wall-clock second. */
  speed: number;
  /** Bumped on every reset so views can rebuild what they cached. */
  revision: number;
  guide: GuideState;
  /** The cinematic technology demonstration (chapters across the environments, minimal interface). */
  demo: { active: boolean };
  camera: { mode: "guided" | "free"; nonce: number; focus: boolean };
  panel: PanelId;
  /** Left drawer with the environment's inputs and fault injection. */
  drawer: boolean;
  narration: boolean;
  sound: boolean;
  captions: boolean;
  quality: QualityChoice;
  reducedMotion: boolean;
  sceneReady: boolean;
  /** The 3D context was lost and could not be restored: show the 2D view. */
  contextLost: boolean;
  /** Full-screen research environment: the browser's Fullscreen API, a full-viewport overlay where that is unavailable, or off. */
  fullscreen: "off" | "native" | "overlay";
  /** Lesson to open when the Physics & Mathematics section is shown. */
  lesson: string | null;
  station: StationInputs;
  faults: StationFaults;
  road: RoadInputs;
  parking: ParkingInputs;
  grid: GridInputs;
  /** Hour of the district day being shown, 0–24. */
  gridHour: number;
  /** Field-line phase ωt, rad (Research mode). */
  fieldPhase: number;
  /** A proposed environment whose preview is open in the rail (never a working environment). */
  preview: string | null;
  /** How the magnetic-field views are drawn (never what is computed). */
  fieldDisplay: FieldDisplay;
  setFieldDisplay: (patch: Partial<FieldDisplay>) => void;
  set: (patch: Partial<TwinState>) => void;
  setStation: (patch: Partial<StationInputs>) => void;
  setFaults: (patch: Partial<StationFaults>) => void;
  setRoad: (patch: Partial<RoadInputs>) => void;
  setParking: (patch: Partial<ParkingInputs>) => void;
  setGrid: (patch: Partial<GridInputs>) => void;
  setCamera: (patch: Partial<TwinState["camera"]>) => void;
  setGuide: (patch: Partial<GuideState>) => void;
  select: (id: string | null) => void;
  bump: () => void;
}

export interface FieldDisplay {
  scale: "log" | "linear";
  /** Road: a section that follows the receiver, or one fixed at a road segment. */
  section: "receiver" | "segment";
  /** Segment index for a fixed section (null: the next pad ahead of the receiver). */
  segment: number | null;
  lines: boolean;
  vectors: boolean;
  contours: boolean;
  /** Sweep the field-line phase through the cycle (a slowed visual cue). */
  sweep: boolean;
}

/** A visitor's own action: pause guided progression (the tour can be resumed). */
const interacted = (s: TwinState): Partial<TwinState> => (s.guide.auto ? { guide: { ...s.guide, auto: false } } : {});

export const useTwin = create<TwinState>((set) => ({
  section: "twin",
  environment: "station",
  mode: "explore",
  view: "cinematic",
  selected: null,
  hovered: null,
  isolate: false,
  playing: true,
  speed: 1,
  revision: 0,
  guide: { active: true, playlist: "station", index: 0, stageId: "", shot: null, auto: false, enteredAt: 0 },
  demo: { active: false },
  camera: { mode: "guided", nonce: 0, focus: true },
  panel: "none",
  drawer: false,
  narration: false,
  sound: false,
  captions: true,
  quality: "auto",
  reducedMotion: false,
  sceneReady: false,
  contextLost: false,
  fullscreen: "off",
  lesson: null,
  station: DEFAULT_STATION_INPUTS,
  faults: NO_FAULTS,
  road: DEFAULT_ROAD_INPUTS,
  parking: DEFAULT_PARKING_INPUTS,
  grid: DEFAULT_GRID_INPUTS,
  gridHour: 12,
  fieldPhase: 0,
  preview: null,
  fieldDisplay: { scale: "log", section: "receiver", segment: null, lines: true, vectors: false, contours: true, sweep: false },
  setFieldDisplay: (patch) => set((s) => ({ fieldDisplay: { ...s.fieldDisplay, ...patch } })),
  set: (patch) => set(patch),
  setStation: (patch) => set((s) => ({ ...interacted(s), station: { ...s.station, ...patch } })),
  setFaults: (patch) => set((s) => ({ ...interacted(s), faults: { ...s.faults, ...patch } })),
  setRoad: (patch) => set((s) => ({ ...interacted(s), road: { ...s.road, ...patch } })),
  setParking: (patch) => set((s) => ({ ...interacted(s), parking: { ...s.parking, ...patch } })),
  setGrid: (patch) => set((s) => ({ ...interacted(s), grid: { ...s.grid, ...patch } })),
  setCamera: (patch) => set((s) => ({ ...(patch.mode === "free" ? interacted(s) : {}), camera: { ...s.camera, ...patch } })),
  setGuide: (patch) => set((s) => ({ guide: { ...s.guide, ...patch } })),
  // Selecting a component pauses the tour and opens the inspector; clearing it returns to the system.
  select: (id) =>
    set((s) => {
      // A part hidden in the current view is shown in the view where it can be seen (the tour pauses).
      const view = id ? viewFor(id, s.view, s.environment) : null;
      return {
      ...(id ? interacted(s) : {}),
      ...(view ? { view, guide: { ...s.guide, active: false, auto: false } } : {}),
      selected: id,
      isolate: id ? s.isolate : false,
      panel: id ? "component" : s.panel === "component" ? "none" : s.panel,
      camera: { ...s.camera, nonce: id || s.selected ? s.camera.nonce + 1 : s.camera.nonce, mode: "guided" },
      };
    }),
  bump: () => set((s) => ({ revision: s.revision + 1 })),
}));
