"use client";
// Desktop application shell: the WebGL scene with the interface laid over it.
// Loaded as its own chunk, and only on a desktop-sized viewport with WebGL.
import { useEffect, useState } from "react";
import type { UFlightMode } from "./types";
import { getComponent } from "./data/componentDefinitions";
import { NARRATIVE } from "./data/faultScenarios";
import { STAGE_INFO } from "./data/missionDefinition";
import { AIRCRAFT, DISCLAIMER, PROVENANCE, SYSTEMS, VEHICLE_LABEL } from "./data/uflightReferenceAircraft";
import { REDUCED_MOTION_QUERY, getWebGLSupport, readDeviceCapabilities, selectQuality } from "../satellite-explorer/lib/capabilities";
import AircraftControls from "./modes/AircraftMode";
import ArchitectureControls, { ArchitectureChain, ArchitecturePanel } from "./modes/ArchitectureMode";
import FaultControls, { FaultPanel, FaultStages } from "./modes/FaultLabMode";
import { HealthDetail, HealthSummary } from "./modes/HealthMode";
import MissionControls, { MissionCaption, MissionPanel } from "./modes/MissionMode";
import SystemsControls, { SystemPanel } from "./modes/SystemsMode";
import TwinControls, { TwinPanel, TwinSystems } from "./modes/TwinMode";
import UFlightCanvas from "./scene/UFlightCanvas";
import { isActivePhase } from "./simulation/mission";
import { resetUFlightSession, useUFlightStore } from "./state/uflightStore";
import AboutPanel from "./ui/AboutPanel";
import ComponentPanel from "./ui/ComponentPanel";
import Header from "./ui/Header";
import HelpPanel from "./ui/HelpPanel";
import HeroOverlay from "./ui/HeroOverlay";
import LabelLayer from "./ui/LabelLayer";
import LoadingScreen from "./ui/LoadingScreen";
import ModeToolbar from "./ui/ModeToolbar";
import SensorPanel from "./ui/SensorPanel";
import theme from "./theme.module.css";
import ui from "./uflight.module.css";

// This module only ever loads in the browser (it is imported with ssr: false),
// so the device can be measured once, before the first render creates the renderer.
if (typeof window !== "undefined") {
  useUFlightStore.getState().setEnvironment({
    quality: selectQuality(readDeviceCapabilities(getWebGLSupport())),
    reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
  });
}

type ActiveMode = Exclude<UFlightMode, "hero">;

const SCENE_LABEL = `Interactive 3D scene of the ${AIRCRAFT.name}`;
const SCENE_DESCRIPTION_ID = "uflight-scene-description";

const SHORTCUTS: Record<string, ActiveMode> = { a: "aircraft", s: "systems", h: "health", m: "mission", f: "fault-lab", t: "twin", r: "architecture" };

const CONTROLS: Record<ActiveMode, (() => React.JSX.Element | null) | null> = {
  aircraft: AircraftControls,
  systems: SystemsControls,
  health: null,
  mission: MissionControls,
  "fault-lab": FaultControls,
  twin: TwinControls,
  architecture: ArchitectureControls,
};

const LEFT: Record<ActiveMode, (() => React.JSX.Element | null) | null> = {
  aircraft: null,
  systems: null,
  health: HealthSummary,
  mission: MissionCaption,
  "fault-lab": FaultStages,
  twin: TwinSystems,
  architecture: ArchitectureChain,
};

const RIGHT: Record<ActiveMode, (() => React.JSX.Element | null) | null> = {
  aircraft: null,
  systems: SystemPanel,
  health: HealthDetail,
  mission: MissionPanel,
  "fault-lab": FaultPanel,
  twin: TwinPanel,
  architecture: ArchitecturePanel,
};

/** One sentence describing what the scene is showing, for assistive technology. */
function useSceneDescription(): string {
  const mode = useUFlightStore((s) => s.mode);
  const system = useUFlightStore((s) => s.selectedSystem);
  const selected = useUFlightStore((s) => s.selectedComponent);
  const xray = useUFlightStore((s) => s.xrayEnabled);
  const exploded = useUFlightStore((s) => s.explodedAmount > 0.5);
  const missionStage = useUFlightStore((s) => s.missionStage);
  const faultScenario = useUFlightStore((s) => s.faultScenario);
  const faultStage = useUFlightStore((s) => s.faultStage);
  const twinSystem = useUFlightStore((s) => s.twinSystem);
  const vehicle = useUFlightStore((s) => s.vehicleState);
  const focus = selected ? ` ${getComponent(selected).name} selected.` : "";
  const status = ` Aircraft status: ${VEHICLE_LABEL[vehicle].toLowerCase()}.`;

  switch (mode) {
    case "hero":
      return "The aircraft in a dark engineering studio, lit from above.";
    case "aircraft":
      return `Aircraft view${exploded ? ", exploded" : ""}${xray ? ", X-ray on" : ""}.${focus}`;
    case "systems":
      return `${SYSTEMS[system ?? "propulsion"].name} system. ${SYSTEMS[system ?? "propulsion"].purpose}${focus}`;
    case "health":
      return `Health view.${status}${focus}`;
    case "mission":
      if (missionStage === "COMPLETE") return `Mission complete.${status}`;
      return isActivePhase(missionStage) ? `Mission stage ${STAGE_INFO[missionStage].label}. ${STAGE_INFO[missionStage].caption}${status}` : "Mission ready to run.";
    case "fault-lab":
      return faultScenario ? `Fault lab, stage ${NARRATIVE[faultScenario][faultStage].label}. ${NARRATIVE[faultScenario][faultStage].text}${status}` : "Fault lab: choose a scenario.";
    case "twin":
      return `Digital twin, comparing ${SYSTEMS[twinSystem].name.toLowerCase()}.${status}`;
    case "architecture":
      return `Architecture view: data routes inside the aircraft.${status}`;
  }
}

/** The loading bar ticks through its steps while the scene is prepared, and completes when it is ready. */
function useLoadingProgress(ready: boolean): number {
  const [progress, setProgress] = useState(0.22);
  useEffect(() => {
    if (ready) return;
    const id = window.setInterval(() => setProgress((p) => p + (0.86 - p) * 0.3), 260);
    return () => window.clearInterval(id);
  }, [ready]);
  return ready ? 1 : progress;
}

export default function DesktopUFlight() {
  const started = useUFlightStore((s) => s.started);
  const mode = useUFlightStore((s) => s.mode);
  const sceneReady = useUFlightStore((s) => s.sceneReady);
  const hovering = useUFlightStore((s) => s.hoveredComponent !== null || s.hoveredSensor !== null);
  const selected = useUFlightStore((s) => s.selectedComponent);
  const selectedSensor = useUFlightStore((s) => s.selectedSensor);
  const missionStage = useUFlightStore((s) => s.missionStage);
  const faultStage = useUFlightStore((s) => s.faultStage);
  const faultScenario = useUFlightStore((s) => s.faultScenario);
  const environment = useUFlightStore((s) => s.environment);
  const description = useSceneDescription();
  const progress = useLoadingProgress(sceneReady);

  // Leaving the page ends the visit: coming back starts again from the opening view.
  useEffect(() => resetUFlightSession, []);

  // The application owns the viewport: no page scroll behind it.
  useEffect(() => {
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => useUFlightStore.getState().setEnvironment({ reducedMotion: mql.matches });
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Keyboard: Esc steps back; letters switch mode. Every action also has an on-screen control.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const state = useUFlightStore.getState();
      if (event.key === "Escape") {
        state.goBack();
        return;
      }
      if (!state.started) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.toLowerCase();
      if (key === "x") state.toggleXray();
      else if (SHORTCUTS[key]) state.setMode(SHORTCUTS[key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = mode === "hero" ? null : mode;
  const Controls = active ? CONTROLS[active] : null;
  const Left = active ? LEFT[active] : null;
  const Right = active ? RIGHT[active] : null;

  return (
    <div
      className={`${theme.theme} ${ui.app}`}
      data-testid="uflight-3d"
      data-mode={mode}
      data-ready={sceneReady}
      data-environment={environment}
      data-mission-stage={missionStage}
      data-fault-scenario={faultScenario ?? undefined}
      data-fault-stage={faultStage}
      data-hover={hovering || undefined}
    >
      <UFlightCanvas label={SCENE_LABEL} describedBy={SCENE_DESCRIPTION_ID} />
      <LabelLayer />
      <div className={ui.vignette} aria-hidden="true" />
      <Header />
      <HeroOverlay />

      {started && (
        <>
          {Left && (
            <div className={ui.left}>
              <Left />
            </div>
          )}
          <div className={ui.right}>{selectedSensor ? <SensorPanel /> : selected ? <ComponentPanel key={selected} /> : Right ? <Right /> : null}</div>
          <div className={ui.dock}>
            {Controls && <Controls />}
            <ModeToolbar />
          </div>
          <p className={ui.disclaimer}>
            {PROVENANCE.platform} · {DISCLAIMER}
          </p>
        </>
      )}

      <HelpPanel />
      <AboutPanel />
      <p id={SCENE_DESCRIPTION_ID} className={theme.srOnly} aria-live="polite" data-testid="scene-description">
        {description}
      </p>
      <LoadingScreen progress={progress} hidden={sceneReady} />
    </div>
  );
}
