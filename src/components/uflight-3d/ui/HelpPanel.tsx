import { X } from "lucide-react";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

const CONTROLS: readonly [string, string][] = [
  ["Drag", "Rotate the view"],
  ["Wheel", "Zoom"],
  ["Click", "Select a component"],
  ["Double Click", "Focus on it alone"],
  ["Esc", "Step back"],
  ["X", "X-ray on / off"],
  ["A S H M F T R", "Switch mode"],
];

export default function HelpPanel() {
  const open = useUFlightStore((s) => s.helpOpen);
  const setHelpOpen = useUFlightStore((s) => s.setHelpOpen);
  if (!open) return null;
  return (
    <div id="uflight-help" className={ui.help} role="dialog" aria-label="Controls">
      <button type="button" className={ui.closeButton} aria-label="Close help" onClick={() => setHelpOpen(false)}>
        <X size={15} aria-hidden="true" />
      </button>
      <p className={ui.panelHeading}>Controls</p>
      <dl className={ui.keys}>
        {CONTROLS.map(([key, action]) => (
          <div key={key} style={{ display: "contents" }}>
            <dt>{key}</dt>
            <dd>{action}</dd>
          </div>
        ))}
      </dl>
      <p className={ui.panelText}>Every action is also on screen. A selected propulsion unit or battery pack can be opened further: click one of its parts to go a level deeper.</p>
    </div>
  );
}
