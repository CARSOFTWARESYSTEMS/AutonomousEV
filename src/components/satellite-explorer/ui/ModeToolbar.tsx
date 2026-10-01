import { Box, Boxes, Layers, Orbit, RadioTower, Rocket, RotateCcw } from "lucide-react";
import type { ExplorerMode } from "../types";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

export const MODES: { id: Exclude<ExplorerMode, "hero">; label: string; shortcut: string; icon: typeof Box; track?: string }[] = [
  { id: "build", label: "BUILD", shortcut: "B", icon: Boxes, track: "build_mode_open" },
  { id: "explore", label: "EXPLORE", shortcut: "E", icon: Box },
  { id: "systems", label: "SYSTEMS", shortcut: "S", icon: Layers },
  { id: "mission", label: "MISSION", shortcut: "M", icon: Rocket },
  { id: "orbit", label: "ORBIT", shortcut: "O", icon: Orbit },
  { id: "signals", label: "SIGNALS", shortcut: "", icon: RadioTower, track: "signal_view_open" },
];

/** Bottom mode navigation: compact icon + label, one clearly active. */
export default function ModeToolbar() {
  const mode = useExplorerStore((s) => s.mode);
  const setMode = useExplorerStore((s) => s.setMode);
  const reset = useExplorerStore((s) => s.reset);
  return (
    <nav className={ui.toolbar} aria-label="Explorer modes">
      {MODES.map(({ id, label, shortcut, icon: Icon, track }) => (
        <button
          key={id}
          type="button"
          className={ui.modeButton}
          aria-current={mode === id ? "page" : undefined}
          aria-keyshortcuts={shortcut || undefined}
          title={shortcut ? `${label} (${shortcut})` : label}
          data-track-event={track}
          data-track-source={track ? "mode_toolbar" : undefined}
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
