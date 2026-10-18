"use client";
// Toolkit state shared by the 3D scene and the 2D panels around it. Domain
// logic lives in src/lib/ev-battery-toolkit; this only holds choices.
import { useMemo } from "react";
import { create } from "zustand";
import { DEFAULT_CONFIG } from "@/data/ev-battery-toolkit/architectures";
import { FAULT_BY_ID, FAULTS } from "@/data/ev-battery-toolkit/faults";
import { applyLayout, resolvePack } from "@/lib/ev-battery-toolkit/pack";
import { simulate, type LoadState } from "@/lib/ev-battery-toolkit/simulation";
import type { ArchitectureId, BatteryConfig, ComponentId, FaultDefinition, PackLayout, RepairDepth } from "@/lib/ev-battery-toolkit/types";

export type Audience = "owner" | "technician";
export type ViewMode = "normal" | "thermal" | "voltage" | "current" | "bms";
export type FaultMode = "normal" | "known" | "unknown";
export type CameraCommand = "rotate-left" | "rotate-right" | "zoom-in" | "zoom-out" | "reset" | "focus-battery";
/** Each canvas listens on its own channel, so one button never moves both. */
export type CameraChannel = "workspace" | "locator";

export interface ToolkitState {
  audience: Audience;
  depth: RepairDepth;
  config: BatteryConfig;
  view: ViewMode;
  xray: boolean;
  exploded: boolean;
  selected: ComponentId | null;
  /** A cell group pointed at by a "Why?" explanation. */
  highlightGroup: number | null;
  faultMode: FaultMode;
  /** The fault chosen in the list, before it is injected. */
  pendingFaultId: string | null;
  /** The fault the simulated pack is running with. */
  faultId: string | null;
  revealed: boolean;
  load: LoadState;
  started: boolean;
  camera: { command: CameraCommand; channel: CameraChannel; nonce: number } | null;

  setAudience: (a: Audience) => void;
  setDepth: (d: RepairDepth) => void;
  setConfig: (patch: Partial<BatteryConfig>) => void;
  setLayout: (layout: PackLayout) => void;
  setArchitecture: (id: ArchitectureId) => void;
  setView: (v: ViewMode) => void;
  setXray: (on: boolean) => void;
  setExploded: (on: boolean) => void;
  select: (id: ComponentId | null) => void;
  setHighlightGroup: (g: number | null) => void;
  setFaultMode: (m: FaultMode) => void;
  choosePendingFault: (id: string | null) => void;
  injectFault: (id: string | null) => void;
  injectRandomFault: () => string;
  reveal: () => void;
  setLoad: (l: LoadState) => void;
  markStarted: () => boolean;
  sendCamera: (command: CameraCommand, channel?: CameraChannel) => void;
}

const DEFAULT_LAYOUT_FOR: Record<ArchitectureId, PackLayout> = { "fixed-floor": "fixed", swappable: "swappable", "serviceable-pack": "removable" };

export const useToolkit = create<ToolkitState>((set, get) => ({
  audience: "technician",
  depth: "basic",
  config: DEFAULT_CONFIG,
  view: "normal",
  xray: false,
  exploded: false,
  selected: null,
  highlightGroup: null,
  faultMode: "normal",
  pendingFaultId: null,
  faultId: null,
  revealed: false,
  load: "rest",
  started: false,
  camera: null,

  setAudience: (audience) => set({ audience }),
  setDepth: (depth) => set({ depth }),
  setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch }, highlightGroup: null })),
  setLayout: (layout) => set((s) => ({ config: applyLayout(s.config, layout), highlightGroup: null })),
  setArchitecture: (architecture) => set((s) => ({ config: { ...s.config, architecture, layout: DEFAULT_LAYOUT_FOR[architecture] }, highlightGroup: null })),
  setView: (view) => set({ view }),
  setXray: (xray) => set({ xray }),
  setExploded: (exploded) => set({ exploded }),
  select: (selected) => set({ selected }),
  setHighlightGroup: (highlightGroup) => set({ highlightGroup }),
  setFaultMode: (faultMode) =>
    set(faultMode === "normal" ? { faultMode, faultId: null, pendingFaultId: null, revealed: false, highlightGroup: null } : { faultMode, revealed: false }),
  choosePendingFault: (pendingFaultId) => set({ pendingFaultId }),
  injectFault: (faultId) => set({ faultId, revealed: false, highlightGroup: null }),
  injectRandomFault: () => {
    // Avoid the last fault so a repeat press gives a new case.
    const pool = FAULTS.filter((f) => f.id !== get().faultId);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    set({ faultId: pick.id, faultMode: "unknown", revealed: false, highlightGroup: null });
    return pick.id;
  },
  reveal: () => set({ revealed: true }),
  setLoad: (load) => set({ load }),
  markStarted: () => {
    if (get().started) return false;
    set({ started: true });
    return true;
  },
  sendCamera: (command, channel = "workspace") => set((s) => ({ camera: { command, channel, nonce: (s.camera?.nonce ?? 0) + 1 } })),
}));

export const faultOf = (id: string | null): FaultDefinition | null => (id ? (FAULT_BY_ID[id] ?? null) : null);

/** The resolved pack and its simulation, recomputed only when an input changes. */
export function useSimulation() {
  const config = useToolkit((s) => s.config);
  const faultId = useToolkit((s) => s.faultId);
  const load = useToolkit((s) => s.load);
  const pack = useMemo(() => resolvePack(config), [config]);
  const fault = faultOf(faultId);
  const result = useMemo(() => simulate({ pack, fault, load }), [pack, fault, load]);
  return { pack, fault, result };
}
