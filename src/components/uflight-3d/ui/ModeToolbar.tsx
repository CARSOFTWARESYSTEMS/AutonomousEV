import { Activity, Box, Bug, Copy, Layers, Network, Plane, RotateCcw } from "lucide-react";
import type { UFlightMode } from "../types";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

export const MODES: { id: Exclude<UFlightMode, "hero">; label: string; shortcut: string; icon: typeof Box; track: string }[] = [
  { id: "aircraft", label: "AIRCRAFT", shortcut: "A", icon: Box, track: "uflight_3d_aircraft_mode" },
  { id: "systems", label: "SYSTEMS", shortcut: "S", icon: Layers, track: "uflight_3d_systems_mode" },
  { id: "health", label: "HEALTH", shortcut: "H", icon: Activity, track: "uflight_3d_health_mode" },
  { id: "mission", label: "MISSION", shortcut: "M", icon: Plane, track: "uflight_3d_mission_mode" },
  { id: "fault-lab", label: "FAULT LAB", shortcut: "F", icon: Bug, track: "uflight_3d_fault_lab" },
  { id: "twin", label: "TWIN", shortcut: "T", icon: Copy, track: "uflight_3d_twin_mode" },
  { id: "architecture", label: "ARCHITECTURE", shortcut: "R", icon: Network, track: "uflight_3d_architecture" },
];

/** Bottom mode navigation: compact icon and label, one clearly active. */
export default function ModeToolbar() {
  const mode = useUFlightStore((s) => s.mode);
  const setMode = useUFlightStore((s) => s.setMode);
  const reset = useUFlightStore((s) => s.reset);
  return (
    <nav className={ui.toolbar} aria-label="UFlight 3D modes">
      {MODES.map(({ id, label, shortcut, icon: Icon, track }) => (
        <button
          key={id}
          type="button"
          className={ui.modeButton}
          aria-current={mode === id ? "page" : undefined}
          aria-keyshortcuts={shortcut}
          title={`${label} (${shortcut})`}
          data-track-event={track}
          data-track-source="mode_toolbar"
          onClick={() => setMode(id)}
        >
          <Icon size={17} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
      <span className={ui.toolbarRule} aria-hidden="true" />
      <button type="button" className={`${ui.modeButton} ${ui.modeButtonQuiet}`} title="Reset the view" onClick={reset}>
        <RotateCcw size={16} aria-hidden="true" />
        <span>RESET</span>
      </button>
    </nav>
  );
}
