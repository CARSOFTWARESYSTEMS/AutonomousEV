"use client";
// Desktop application shell: the WebGL scene with the interface laid over it.
// Loaded as its own chunk, and only on a desktop-sized viewport with WebGL.
import { useCallback, useEffect, useState } from "react";
import type { ExplorerMode } from "./types";
import { BUILD_STEPS, MISSION_STAGE_INFO } from "./data/missionSequence";
import { SATELLITE_REFERENCE, SUBSYSTEMS } from "./data/satelliteReference";
import { REDUCED_MOTION_QUERY, getWebGLSupport, readDeviceCapabilities, selectQuality } from "./lib/capabilities";
import BuildMode from "./modes/BuildMode";
import ExploreMode from "./modes/ExploreMode";
import MissionMode from "./modes/MissionMode";
import OrbitMode, { OrbitPanel } from "./modes/OrbitMode";
import SignalMode, { SignalPanel } from "./modes/SignalMode";
import SystemsMode, { SystemPanel } from "./modes/SystemsMode";
import ExplorerCanvas from "./scene/ExplorerCanvas";
import { isActiveStage } from "./simulation/mission";
import { resetExplorerSession, useExplorerStore } from "./state/explorerStore";
import ComponentIndex from "./ui/ComponentIndex";
import ComponentPanel from "./ui/ComponentPanel";
import ExplorerHeader from "./ui/ExplorerHeader";
import HelpPanel from "./ui/HelpPanel";
import HeroOverlay from "./ui/HeroOverlay";
import LabelLayer from "./ui/LabelLayer";
import LoadingScreen from "./ui/LoadingScreen";
import MissionConsole from "./ui/MissionConsole";
import ModeToolbar from "./ui/ModeToolbar";
import StatusCaption, { Callout } from "./ui/StatusCaption";
import TourController from "./ui/TourController";
import theme from "./theme.module.css";
import ui from "./explorer.module.css";

// This module only ever loads in the browser (it is imported with ssr: false),
// so the device can be measured once, before the first render creates the renderer.
if (typeof window !== "undefined") {
  useExplorerStore.getState().setEnvironment({
    quality: selectQuality(readDeviceCapabilities(getWebGLSupport())),
    reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
  });
}

const SCENE_LABEL = `Interactive 3D scene of the ${SATELLITE_REFERENCE.name}`;
const SCENE_DESCRIPTION_ID = "satellite-explorer-scene-description";

const SHORTCUTS: Record<string, Exclude<ExplorerMode, "hero" | "signals">> = { b: "build", e: "explore", s: "systems", m: "mission", o: "orbit" };

const MODE_CONTROLS: Record<Exclude<ExplorerMode, "hero">, () => React.JSX.Element> = {
  build: BuildMode,
  explore: ExploreMode,
  systems: SystemsMode,
  mission: MissionMode,
  orbit: OrbitMode,
  signals: SignalMode,
};

/** One-sentence description of what the scene is showing, for assistive technology. */
function useSceneDescription(): string {
  const mode = useExplorerStore((s) => s.mode);
  const subsystem = useExplorerStore((s) => s.subsystem);
  const buildStep = useExplorerStore((s) => s.buildStep);
  const stage = useExplorerStore((s) => s.missionStage);
  const callout = useExplorerStore((s) => s.telemetry.callout);
  const sunlit = useExplorerStore((s) => s.telemetry.sunlit);
  const link = useExplorerStore((s) => s.telemetry.link);
  const exploded = useExplorerStore((s) => s.explodedAmount > 0.5);
  const xray = useExplorerStore((s) => s.xrayEnabled);

  switch (mode) {
    case "hero":
      return "The spacecraft in orbit above Earth.";
    case "build": {
      const step = BUILD_STEPS[buildStep - 1];
      return `Build step ${step.step} of ${BUILD_STEPS.length}: ${step.title}. ${step.caption}`;
    }
    case "explore":
      return `Explore view${exploded ? ", exploded" : ""}${xray ? ", X-ray on" : ""}.`;
    case "systems":
      return `${SUBSYSTEMS[subsystem].name}. ${SUBSYSTEMS[subsystem].purpose} Spacecraft in ${sunlit ? "sunlight" : "eclipse"}.`;
    case "mission":
      if (!isActiveStage(stage)) return "Mission ready to run.";
      return `Mission stage ${MISSION_STAGE_INFO[stage].label}. ${MISSION_STAGE_INFO[stage].caption}${callout ? ` ${callout}.` : ""}`;
    case "orbit":
      return `Orbit view. Spacecraft in ${sunlit ? "sunlight" : "eclipse"}. Ground link: ${link.replace("_", " ").toLowerCase()}.`;
    case "signals":
      return `Signal view. Ground link: ${link.replace("_", " ").toLowerCase()}.`;
  }
}

export default function DesktopExplorer() {
  const [progress, setProgress] = useState(0.3);
  const started = useExplorerStore((s) => s.started);
  const mode = useExplorerStore((s) => s.mode);
  const sceneReady = useExplorerStore((s) => s.sceneReady);
  const hovering = useExplorerStore((s) => s.hoveredComponent !== null);
  const selected = useExplorerStore((s) => s.selectedComponent);
  const missionStage = useExplorerStore((s) => s.missionStage);
  const description = useSceneDescription();

  const handleProgress = useCallback((fraction: number) => setProgress(0.3 + 0.65 * fraction), []);

  // Leaving the page ends the visit: coming back starts again from the opening view.
  useEffect(() => resetExplorerSession, []);

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
    const update = () => useExplorerStore.getState().setEnvironment({ reducedMotion: mql.matches });
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Keyboard: Esc steps back; letters switch mode. Every action also has an on-screen control.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const state = useExplorerStore.getState();
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

  const Controls = mode === "hero" ? null : MODE_CONTROLS[mode];
  const visualization = mode === "systems" || mode === "signals" || mode === "build" || (mode === "mission" && isActiveStage(missionStage));

  return (
    <div className={ui.app} data-testid="satellite-explorer" data-mode={mode} data-ready={sceneReady} data-mission-stage={missionStage} data-hover={hovering || undefined}>
      <ExplorerCanvas onProgress={handleProgress} label={SCENE_LABEL} describedBy={SCENE_DESCRIPTION_ID} />
      <LabelLayer />
      <div className={ui.vignette} aria-hidden="true" />
      <ExplorerHeader />
      <HeroOverlay />

      {started && (
        <>
          <p className={ui.provenanceBar}>
            {SATELLITE_REFERENCE.provenance.spacecraft}
            {visualization ? ` · ${SATELLITE_REFERENCE.provenance.visualization}` : ""}
          </p>
          <Callout />
          {/* Signals: route panel on the right, console on the left. Mission: the console takes the
              right-hand slot, leaving the left for the stage caption. */}
          {mode === "signals" && (
            <div className={ui.left}>
              <MissionConsole />
            </div>
          )}
          <div className={ui.side}>
            {selected ? (
              <ComponentPanel key={selected} />
            ) : mode === "systems" ? (
              <SystemPanel />
            ) : mode === "signals" ? (
              <SignalPanel />
            ) : mode === "orbit" ? (
              <OrbitPanel />
            ) : mode === "mission" ? (
              <MissionConsole />
            ) : null}
          </div>
          <div className={ui.captionSlot}>
            <StatusCaption />
            <TourController />
          </div>
          <div className={ui.dock}>
            {Controls && <Controls />}
            <ModeToolbar />
          </div>
        </>
      )}

      <HelpPanel />
      <ComponentIndex />
      <p id={SCENE_DESCRIPTION_ID} className={theme.srOnly} aria-live="polite" data-testid="scene-description">
        {description}
      </p>
      <LoadingScreen progress={sceneReady ? 1 : progress} hidden={sceneReady} />
    </div>
  );
}
