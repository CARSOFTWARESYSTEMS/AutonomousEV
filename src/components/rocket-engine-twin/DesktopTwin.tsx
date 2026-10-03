"use client";
// The immersive application: the WebGL scene with a small interface laid over
// it. Loaded as its own chunk, and only on a desktop-sized viewport with WebGL.
import { type ComponentType, useEffect, useMemo, useRef } from "react";
import { REDUCED_MOTION_QUERY, getWebGLSupport, readDeviceCapabilities, selectQuality } from "../satellite-explorer/lib/capabilities";
import { PRODUCT, SCHEMATIC_ALT } from "./data/engineReference";
import { COMPONENT_LABEL } from "./data/twinContent";
import { ArchitectureDock, ArchitectureLeft, ArchitectureRight } from "./modes/ArchitectureMode";
import { BuildDock } from "./modes/BuildMode";
import { ControlDock, ControlLeft } from "./modes/ControlMode";
import { EngineDock, EngineLeft } from "./modes/EngineMode";
import { FlowDock, FlowLeft } from "./modes/FlowMode";
import { HealthDock, HealthLeft, HealthRight } from "./modes/HealthMode";
import { TestDock, TestRight } from "./modes/TestMode";
import { TwinDock, TwinRight } from "./modes/TwinMode";
import RocketEngineScene from "./scene/RocketEngineScene";
import { useTestClock, useTourClock } from "./state/clocks";
import { stageCaption } from "./state/caption";
import { resetRocketTwinStore, useRocketTwinStore } from "./state/twinStore";
import type { ModeId } from "./types";
import { AudienceToggle, ModeBar } from "./ui/ModeBar";
import { ComponentPanel, SensorPanel } from "./ui/panels";
import { TourBar } from "./ui/TourBar";
import ui from "./twin3d.module.css";

type Slot = ComponentType | null;
const LEFT: Record<ModeId, Slot> = { engine: EngineLeft, build: null, flow: FlowLeft, control: ControlLeft, test: null, health: HealthLeft, twin: null, architecture: ArchitectureLeft };
const RIGHT: Record<ModeId, Slot> = { engine: null, build: null, flow: null, control: null, test: TestRight, health: HealthRight, twin: TwinRight, architecture: ArchitectureRight };
const DOCK: Record<ModeId, Slot> = { engine: EngineDock, build: BuildDock, flow: FlowDock, control: ControlDock, test: TestDock, health: HealthDock, twin: TwinDock, architecture: ArchitectureDock };

const DESCRIPTION_ID = "rocket-twin-scene-description";

export default function DesktopTwin() {
  const entered = useRocketTwinStore((s) => s.entered);
  const mode = useRocketTwinStore((s) => s.mode);
  const touring = useRocketTwinStore((s) => s.tour !== null);
  const component = useRocketTwinStore((s) => s.component);
  const sensor = useRocketTwinStore((s) => s.sensor);
  const faultActive = useRocketTwinStore((s) => s.bearing !== null);
  const hovered = useRocketTwinStore((s) => s.hovered);
  const ready = useRocketTwinStore((s) => s.sceneReady);
  const caption = useRocketTwinStore(stageCaption);
  const quality = useMemo(() => selectQuality(readDeviceCapabilities(getWebGLSupport())), []);
  const label = useRef<HTMLParagraphElement>(null);
  useTestClock();
  useTourClock();

  // Leaving the page ends the visit: coming back starts again from the opening view.
  useEffect(() => resetRocketTwinStore, []);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => useRocketTwinStore.getState().setReducedMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Escape steps back: out of the tour, then out of a selection.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const s = useRocketTwinStore.getState();
      if (s.tour) s.exitTour(false);
      else if (s.sensor) s.selectSensor(null);
      else if (s.component || s.systemFocus) s.backToEngine();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Left = LEFT[mode];
  const Right = RIGHT[mode];
  const Dock = DOCK[mode];

  return (
    <div
      id={PRODUCT.consoleId}
      className={ui.app}
      data-testid="rocket-twin-3d"
      data-mode={mode}
      data-entered={entered}
      data-ready={ready}
      data-hover={hovered !== null || undefined}
      onPointerMove={(event) => {
        // The hover label follows the pointer without going through React state.
        const rect = event.currentTarget.getBoundingClientRect();
        label.current?.style.setProperty("transform", `translate(${event.clientX - rect.left + 16}px, ${event.clientY - rect.top + 14}px)`);
      }}
    >
      <RocketEngineScene quality={quality} label={`Interactive 3D model. ${SCHEMATIC_ALT}`} describedBy={DESCRIPTION_ID} />
      <div className={ui.vignette} aria-hidden="true" />

      {entered && (
        <>
          <div className={ui.top}>
            <span className={ui.name} aria-hidden="true">
              {PRODUCT.name}
            </span>
            {mode === "test" && <span className={ui.banner}>SIMULATED ENGINE TEST</span>}
            <AudienceToggle />
          </div>
          {Left && (
            <div className={ui.left}>
              <Left />
            </div>
          )}
          {/* A sensor, when one is picked. Otherwise the fault and the twin keep their own panel, since the selection is their subject. */}
          <div className={ui.right}>{sensor ? <SensorPanel /> : Right && (mode === "twin" || (mode === "health" && faultActive)) ? <Right /> : component ? <ComponentPanel key={component} /> : Right ? <Right /> : null}</div>
          <div className={ui.dock}>
            {touring ? <TourBar /> : Dock && <Dock />}
            {!touring && <ModeBar />}
          </div>
          <a className={ui.more} href="#overview">
            Engineering notes ↓
          </a>
        </>
      )}

      <p ref={label} className={ui.hover} data-visible={hovered !== null} aria-hidden="true">
        {hovered ? COMPONENT_LABEL[hovered] : ""}
      </p>
      <p id={DESCRIPTION_ID} className={ui.srOnly} aria-live="polite" data-testid="scene-description">
        {caption}
      </p>
      <div className={ui.loading} data-hidden={ready} aria-hidden={ready || undefined}>
        <p role="status">INITIALIZING DIGITAL TWIN</p>
        <div className={ui.loadingBar} />
      </div>
    </div>
  );
}
