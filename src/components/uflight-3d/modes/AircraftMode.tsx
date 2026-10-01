// AIRCRAFT: understand the physical architecture. X-ray with system filters,
// the exploded view at three levels, cabin and structure views, and the
// aircraft's configurations from ground to cruise.
import { ScanLine } from "lucide-react";
import type { ExplodedLevel, ViewPreset } from "../types";
import { FLIGHT_CONFIGS, XRAY_FILTERS } from "../data/uflightReferenceAircraft";
import { useUFlightStore } from "../state/uflightStore";
import ui from "../uflight.module.css";

const VIEWS: readonly { id: ViewPreset; label: string }[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "cabin", label: "CABIN" },
  { id: "structure", label: "STRUCTURE" },
];

export const EXPLODED_LEVELS: readonly { id: ExplodedLevel; label: string; title: string }[] = [
  { id: 1, label: "ASSEMBLIES", title: "Level 1: major assemblies" },
  { id: 2, label: "SUBSYSTEMS", title: "Level 2: subsystem assemblies" },
  { id: 3, label: "COMPONENTS", title: "Level 3: inside the selected component" },
];

/** The exploded-view slider: 0 is assembled, 100 fully separated along the assembly axes. */
export function AssemblySlider() {
  const explodedAmount = useUFlightStore((s) => s.explodedAmount);
  const explodedLevel = useUFlightStore((s) => s.explodedLevel);
  const setExplodedAmount = useUFlightStore((s) => s.setExplodedAmount);
  const setExplodedLevel = useUFlightStore((s) => s.setExplodedLevel);
  const percent = Math.round(explodedAmount * 100);
  return (
    <div className={ui.controlGroup}>
      <label className={ui.slider}>
        <span className={ui.label}>ASSEMBLY</span>
        <input type="range" min={0} max={100} step={1} value={percent} aria-label="ASSEMBLY: exploded view, 0 to 100" data-track-event="uflight_3d_exploded" onChange={(e) => setExplodedAmount(Number(e.target.value) / 100)} />
        <span className={ui.sliderValue}>{percent}</span>
      </label>
      <div className={`${ui.segmented} ${ui.segmentedCompact}`} role="group" aria-label="Exploded view level">
        {EXPLODED_LEVELS.map(({ id, label, title }) => (
          <button key={id} type="button" className={ui.segment} aria-pressed={explodedLevel === id} title={title} onClick={() => setExplodedLevel(id)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfigurationControl() {
  const flightConfig = useUFlightStore((s) => s.flightConfig);
  const setFlightConfig = useUFlightStore((s) => s.setFlightConfig);
  return (
    <div className={`${ui.segmented} ${ui.segmentedCompact}`} role="group" aria-label="Aircraft configuration">
      {FLIGHT_CONFIGS.map(({ id, label }) => (
        <button key={id} type="button" className={ui.segment} aria-pressed={flightConfig === id} onClick={() => setFlightConfig(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function AircraftControls() {
  const xrayEnabled = useUFlightStore((s) => s.xrayEnabled);
  const xrayFilter = useUFlightStore((s) => s.xrayFilter);
  const viewPreset = useUFlightStore((s) => s.viewPreset);
  const toggleXray = useUFlightStore((s) => s.toggleXray);
  const setXrayFilter = useUFlightStore((s) => s.setXrayFilter);
  const setViewPreset = useUFlightStore((s) => s.setViewPreset);

  return (
    <div className={ui.controlStrip} role="group" aria-label="Aircraft view controls">
      <div className={ui.controlGroup}>
        <button type="button" className={ui.action} aria-pressed={xrayEnabled} aria-keyshortcuts="X" data-track-event="uflight_3d_xray" data-track-source="aircraft_controls" onClick={toggleXray}>
          <ScanLine size={14} aria-hidden="true" /> X-RAY
        </button>
        <div className={`${ui.segmented} ${ui.segmentedCompact}`} role="group" aria-label="View">
          {VIEWS.map(({ id, label }) => (
            <button key={id} type="button" className={ui.segment} aria-pressed={viewPreset === id} onClick={() => setViewPreset(id)}>
              {label}
            </button>
          ))}
        </div>
        <ConfigurationControl />
      </div>
      <AssemblySlider />
      {xrayEnabled && (
        <div className={ui.tabs} role="group" aria-label="X-ray filter: which system stays solid">
          {XRAY_FILTERS.map(({ id, label }) => (
            <button key={id} type="button" className={ui.tab} aria-pressed={xrayFilter === id} onClick={() => setXrayFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
