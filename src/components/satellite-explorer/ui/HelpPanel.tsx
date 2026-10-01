import { X } from "lucide-react";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

const CONTROLS: [action: string, input: string][] = [
  ["ROTATE", "Drag"],
  ["ZOOM", "Scroll"],
  ["PAN", "Right-drag"],
  ["SELECT", "Click"],
  ["FOCUS", "Double Click"],
  ["BACK", "Esc"],
];

const SHORTCUTS: [key: string, mode: string][] = [
  ["B", "Build"],
  ["E", "Explore"],
  ["S", "Systems"],
  ["M", "Mission"],
  ["O", "Orbit"],
  ["X", "X-ray"],
];

/** Compact, non-modal help. Every control is also reachable without the keyboard shortcuts. */
export default function HelpPanel() {
  const open = useExplorerStore((s) => s.helpOpen);
  const setHelpOpen = useExplorerStore((s) => s.setHelpOpen);
  if (!open) return null;
  return (
    <div id="explorer-help" className={ui.help} role="dialog" aria-label="Controls">
      <div className={ui.popoverHead}>
        <p className={ui.popoverTitle}>CONTROLS</p>
        <button type="button" className={ui.closeButton} aria-label="Close help" onClick={() => setHelpOpen(false)}>
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      <dl className={ui.helpList}>
        {CONTROLS.map(([action, input]) => (
          <div key={action}>
            <dt>{action}</dt>
            <dd>{input}</dd>
          </div>
        ))}
      </dl>
      <p className={ui.helpHeading}>KEYBOARD</p>
      <dl className={`${ui.helpList} ${ui.helpKeys}`}>
        {SHORTCUTS.map(([key, mode]) => (
          <div key={key}>
            <dt>
              <kbd>{key}</kbd>
            </dt>
            <dd>{mode}</dd>
          </div>
        ))}
      </dl>
      <p className={ui.helpNote}>Use COMPONENTS in the header to select any part from a list.</p>
    </div>
  );
}
