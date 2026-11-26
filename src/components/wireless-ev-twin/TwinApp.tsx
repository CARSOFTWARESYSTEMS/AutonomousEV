"use client";
// The research environment: a minimal toolbar (identity, the current
// environment, the four interaction modes, the demonstration, quality and full
// screen), the research sections, and the active section. The simulations keep
// running across sections and modes; every mode works on the same state.
import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { Clapperboard, LogOut, Maximize2, Minimize2 } from "lucide-react";
import { ENVIRONMENTS, MODES, type ModeId, SECTIONS, type SectionId } from "@/lib/wireless-charging/content";
import { getWebGLSupport, readDeviceCapabilities, REDUCED_MOTION_QUERY, selectQuality } from "../satellite-explorer/lib/capabilities";
import Laboratory, { type Capabilities } from "./lab/Laboratory";
import { APP_ID, exitFullscreen, toggleFullscreen, useFullscreenSync } from "./state/fullscreen";
import { runtime, useClock, useInputSync } from "./state/runtime";
import { type QualityChoice, useTwin } from "./state/store";
import { endDemo, startDemo, useGuideController } from "./story/guide";
import { Segmented } from "./ui/controls";
import ui from "./twin.module.css";
import lab from "./lab/lab.module.css";

const OverviewSection = dynamic(() => import("./sections/OverviewSection"));
const PhysicsSection = dynamic(() => import("./sections/PhysicsSection"));
const SimulationSection = dynamic(() => import("./sections/SimulationSection"));
const CircuitSection = dynamic(() => import("./sections/CircuitSection"));
const IotSection = dynamic(() => import("./sections/IotSection"));
const ResearchSection = dynamic(() => import("./sections/ResearchSection"));
const WorkshopSection = dynamic(() => import("./sections/WorkshopSection"));
const AssuranceSection = dynamic(() => import("./sections/AssuranceSection"));

const SECTION_VIEWS: Record<Exclude<SectionId, "twin">, React.ComponentType> = {
  overview: OverviewSection,
  physics: PhysicsSection,
  simulation: SimulationSection,
  circuit: CircuitSection,
  iot: IotSection,
  research: ResearchSection,
  workshop: WorkshopSection,
  assurance: AssuranceSection,
};

const QUALITY: { id: QualityChoice; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "high", label: "High" },
  { id: "balanced", label: "Balanced" },
  { id: "performance", label: "Performance" },
];

const noop = () => () => {};
let cache: Capabilities | null = null;
function capabilityCache(): Capabilities {
  if (!cache) {
    const support = getWebGLSupport();
    cache = { webgl: support.supported, quality: support.supported ? selectQuality(readDeviceCapabilities(support)) : null };
  }
  return cache;
}
/**
 * WebGL is probed once, on the client. The server (and hydration) render a
 * neutral "preparing" state — never the no-WebGL message, which used to reach
 * every first paint and every reader of the HTML.
 */
const useCapabilities = () => useSyncExternalStore(noop, capabilityCache, () => null);

/** Switching mode changes how much is shown, never the simulation. */
export function setMode(mode: ModeId) {
  useTwin.setState((s) => ({
    mode,
    panel: mode === "explore" ? (s.selected ? "component" : "none") : mode === "learn" ? (s.selected ? "component" : "science") : s.selected ? "component" : "data",
    drawer: mode === "engineer" || mode === "research",
    guide: { ...s.guide, auto: mode === "explore" ? s.guide.auto : false },
  }));
}

export default function TwinApp() {
  const section = useTwin((s) => s.section);
  const mode = useTwin((s) => s.mode);
  const env = useTwin((s) => s.environment);
  const demo = useTwin((s) => s.demo.active);
  const quality = useTwin((s) => s.quality);
  const set = useTwin((s) => s.set);
  const caps = useCapabilities();
  const fullscreen = useTwin((s) => s.fullscreen);
  useFullscreenSync();
  useInputSync();
  useClock();
  useGuideController();

  // Development only: expose the store and runtime to inspection scripts.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __wevct?: unknown }).__wevct = { useTwin, runtime };
  }, []);

  // Reduced motion; and the hero's "Watch Technology Demonstration" link (#demo).
  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => useTwin.setState({ reducedMotion: mql.matches });
    update();
    mql.addEventListener("change", update);
    const onHash = () => {
      if (window.location.hash === "#demo" && getWebGLSupport().supported) {
        startDemo();
        document.getElementById(APP_ID)?.scrollIntoView({ block: "start" });
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      mql.removeEventListener("change", update);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  // Escape: leave the demonstration, then clear a selection, then leave the overlay full screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const s = useTwin.getState();
      if (s.demo.active) endDemo();
      else if (s.selected) s.select(null);
      else if (s.fullscreen === "overlay") void exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const meta = ENVIRONMENTS.find((e) => e.id === env)!;
  const Active = section === "twin" ? null : SECTION_VIEWS[section];
  return (
    <div className={ui.app} id={APP_ID} data-section={section} data-fullscreen={fullscreen === "off" ? undefined : fullscreen} data-demo={demo || undefined}>
      <div className={lab.toolbar}>
        <p className={lab.identity}>
          <span className={lab.brand}>EV.ENGINEER™</span>
          <span className={lab.labName}>Digital Twin Laboratory</span>
          <span className={lab.envName}>{`${meta.number} ${meta.short}`}</span>
        </p>
        {!demo && <Segmented label="Experience mode" value={mode} options={MODES.map((m) => ({ id: m.id, label: m.label }))} onChange={(v) => setMode(v)} />}
        <div className={lab.toolbarRight}>
          {caps?.webgl &&
            (demo ? (
              <button type="button" className={lab.toolBtn} data-strong onClick={endDemo}>
                <LogOut size={15} aria-hidden="true" /> <span>Exit demonstration</span>
              </button>
            ) : (
              <button type="button" className={lab.toolBtn} onClick={startDemo} title="Watch the technology demonstration">
                <Clapperboard size={15} aria-hidden="true" /> <span className={lab.toolText}>Demonstration</span>
              </button>
            ))}
          {caps?.webgl && !demo && (
            <label className={lab.quality}>
              <span className={lab.toolText}>Quality</span>
              <select value={quality} onChange={(e) => set({ quality: e.target.value as QualityChoice })} aria-label="Rendering quality">
                {QUALITY.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" className={lab.toolBtn} onClick={() => void toggleFullscreen()} aria-pressed={fullscreen !== "off"} aria-keyshortcuts="F" title="Full screen (F)">
            {fullscreen === "off" ? <Maximize2 size={15} aria-hidden="true" /> : <Minimize2 size={15} aria-hidden="true" />}
            <span className={lab.toolText}>{fullscreen === "off" ? "Full screen" : "Exit full screen"}</span>
          </button>
        </div>
      </div>
      <nav className={lab.sections} aria-label="Research environment" data-hidden={demo || undefined}>
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button type="button" aria-current={section === s.id ? "page" : undefined} onClick={() => set({ section: s.id, selected: null })}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
        <p className={lab.modeNote}>{MODES.find((m) => m.id === mode)?.text}</p>
      </nav>
      {section === "twin" ? (
        <Laboratory caps={caps} />
      ) : (
        Active && (
          <div className={ui.lab}>
            <Active />
          </div>
        )
      )}
    </div>
  );
}
