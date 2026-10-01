import { RadioTower, Satellite, Send } from "lucide-react";
import { DEMO_COMMAND, SIGNAL_ORDER, SIGNAL_ROUTES } from "../data/missionSequence";
import { ACCENT, SATELLITE_REFERENCE } from "../data/satelliteReference";
import { useExplorerStore } from "../state/explorerStore";
import ui from "../explorer.module.css";

/** Signals controls: which traffic to follow, and the two viewpoints. */
export default function SignalMode() {
  const view = useExplorerStore((s) => s.signalView);
  const camera = useExplorerStore((s) => s.cameraPreset);
  const setView = useExplorerStore((s) => s.setSignalView);
  const setCamera = useExplorerStore((s) => s.setCamera);
  const sendCommand = useExplorerStore((s) => s.startCommandDemo);
  const commandPhase = useExplorerStore((s) => s.telemetry.commandPhase);
  const sending = commandPhase !== "NONE" && commandPhase !== "VERIFIED";

  return (
    <div className={ui.controlStrip} data-testid="signal-controls">
      <div className={ui.tabs} role="tablist" aria-label="Signal type">
        {SIGNAL_ORDER.map((id) => (
          <button key={id} type="button" role="tab" aria-selected={view === id} aria-controls="signal-panel" className={ui.tab} style={{ "--accent": id === "payload-data" ? ACCENT.data : ACCENT.rf } as React.CSSProperties} onClick={() => setView(id)}>
            {SIGNAL_ROUTES[id].label}
          </button>
        ))}
      </div>
      <span className={ui.stripRule} aria-hidden="true" />
      {view === "command" && (
        <button type="button" className={ui.action} onClick={sendCommand} disabled={sending}>
          <Send size={14} aria-hidden="true" /> SEND COMMAND
        </button>
      )}
      <div className={ui.segmented} role="group" aria-label="Viewpoint">
        <button type="button" className={ui.segment} aria-pressed={camera !== "groundStation"} onClick={() => setCamera("signals")}>
          <Satellite size={13} aria-hidden="true" /> SPACECRAFT
        </button>
        <button type="button" className={ui.segment} aria-pressed={camera === "groundStation"} onClick={() => setCamera("groundStation")}>
          <RadioTower size={13} aria-hidden="true" /> GROUND STATION
        </button>
      </div>
    </div>
  );
}

/** The selected signal's route, hop by hop, from source to destination. */
export function SignalPanel() {
  const view = useExplorerStore((s) => s.signalView);
  const route = SIGNAL_ROUTES[view];
  const accent = view === "payload-data" ? ACCENT.data : ACCENT.rf;
  return (
    <aside id="signal-panel" role="tabpanel" className={ui.panel} aria-label={`${route.label} route`} data-testid="signal-panel" style={{ "--accent": accent } as React.CSSProperties}>
      <p className={ui.panelEyebrow}>
        <span className={ui.accentDot} aria-hidden="true" />
        {route.band}
      </p>
      <h2 className={ui.panelTitle}>{route.label}</h2>
      <p className={ui.direction}>{route.direction}</p>
      <p className={ui.panelText}>{route.caption}</p>
      {view === "command" && (
        <p className={ui.commandText} aria-label={`Example command: ${DEMO_COMMAND}`}>
          {DEMO_COMMAND}
        </p>
      )}
      <ol className={ui.hops}>
        {route.hops.map((hop, i) => (
          <li key={hop}>
            <span className={ui.hopIndex} aria-hidden="true">
              {i + 1}
            </span>
            {hop}
          </li>
        ))}
      </ol>
      <p className={ui.provenance}>{SATELLITE_REFERENCE.provenance.visualization}</p>
    </aside>
  );
}
