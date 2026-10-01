import { Pause, Play } from "lucide-react";
import { SATELLITE_REFERENCE } from "../data/satelliteReference";
import { GROUND_STATION } from "../simulation/orbit";
import { useExplorerStore } from "../state/explorerStore";
import { POWER_STATE_LABEL, formatGeo, formatPercent, linkLabel } from "../ui/liveValues";
import ui from "../explorer.module.css";

const SPEEDS = [30, 60, 240];

/** Orbit controls: playback, speed and jumps to the moments worth watching. */
export default function OrbitMode() {
  const playing = useExplorerStore((s) => s.orbitPlaying);
  const speed = useExplorerStore((s) => s.orbitSpeed);
  const setPlaying = useExplorerStore((s) => s.setOrbitPlaying);
  const setSpeed = useExplorerStore((s) => s.setOrbitSpeed);
  const jump = useExplorerStore((s) => s.jumpOrbit);

  return (
    <div className={ui.controlStrip} data-testid="orbit-controls">
      <button type="button" className={ui.action} aria-label={playing ? "Pause orbit" : "Play orbit"} onClick={() => setPlaying(!playing)}>
        {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />} {playing ? "PAUSE" : "PLAY"}
      </button>
      <div className={ui.segmented} role="group" aria-label="Orbit speed">
        {SPEEDS.map((s) => (
          <button key={s} type="button" className={ui.segment} aria-pressed={speed === s} aria-label={`${s} times real time`} onClick={() => setSpeed(s)}>
            ×{s}
          </button>
        ))}
      </div>
      <span className={ui.stripRule} aria-hidden="true" />
      <span className={ui.stripLabel}>GO TO</span>
      <button type="button" className={ui.action} onClick={() => jump("sunrise")}>
        SUNRISE
      </button>
      <button type="button" className={ui.action} onClick={() => jump("passStart")}>
        GROUND PASS
      </button>
      <button type="button" className={ui.action} onClick={() => jump("eclipseEntry")}>
        ECLIPSE
      </button>
    </div>
  );
}

/** Orbit readout: reference orbit parameters plus the live sunlight, battery and link state. */
export function OrbitPanel() {
  const t = useExplorerStore((s) => s.telemetry);
  const { orbit, provenance } = SATELLITE_REFERENCE;
  return (
    <aside className={ui.panel} aria-label="Orbit" data-testid="orbit-panel">
      <p className={ui.panelEyebrow}>{provenance.scale} · SPACECRAFT ENLARGED</p>
      <h2 className={ui.panelTitle}>REFERENCE ORBIT</h2>
      <p className={ui.panelText}>{orbit.description}. The dim arc of the orbit is Earth&apos;s shadow.</p>
      <dl className={ui.values}>
        <div className={ui.valueRow}>
          <dt>Altitude</dt>
          <dd>~{orbit.altitudeKm} km</dd>
        </div>
        <div className={ui.valueRow}>
          <dt>Inclination</dt>
          <dd>{orbit.inclinationDeg}° reference</dd>
        </div>
        <div className={ui.valueRow}>
          <dt>Period</dt>
          <dd>~{orbit.periodMin} min</dd>
        </div>
        <div className={ui.valueRow}>
          <dt>Over</dt>
          <dd>{formatGeo(t.latDeg, t.lonDeg)}</dd>
        </div>
      </dl>
      <p className={ui.stateLine} data-state={t.sunlit ? "sunlight" : "eclipse"}>
        {t.sunlit ? "SUNLIGHT" : "ECLIPSE"}
        <span>
          Battery {formatPercent(t.batterySoc)} · {POWER_STATE_LABEL[t.batteryState]}
        </span>
      </p>
      <p className={ui.stateLine} data-link={t.link}>
        {linkLabel(t.link)}
        <span>{GROUND_STATION.label}</span>
      </p>
      <p className={ui.provenance}>{provenance.values}</p>
    </aside>
  );
}
