"use client";
// The research environment: section navigation, experience modes and the
// active section. The simulations keep running across sections.
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Clapperboard, Maximize2, Minimize2 } from "lucide-react";
import { MODES, SECTIONS, type SectionId } from "@/lib/wireless-charging/content";
import { getWebGLSupport, readDeviceCapabilities, REDUCED_MOTION_QUERY, selectQuality, type QualitySettings } from "../satellite-explorer/lib/capabilities";
import { introSeen, startIntro, useIntroController, finishIntro } from "./intro/Intro";
import { APP_ID, exitFullscreen, toggleFullscreen, useFullscreenSync } from "./state/fullscreen";
import { useClock, useInputSync } from "./state/runtime";
import { useTwin } from "./state/store";
import { Segmented } from "./ui/controls";
import TwinSection from "./sections/TwinSection";
import ui from "./twin.module.css";

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

const noop = () => () => {};
/** WebGL is probed once, on the client. */
const useCapabilities = () =>
  useSyncExternalStore(
    noop,
    () => capabilityCache(),
    () => null,
  );
let cache: { webgl: boolean; quality: QualitySettings | null } | null = null;
function capabilityCache() {
  if (!cache) {
    const support = getWebGLSupport();
    cache = { webgl: support.supported, quality: support.supported ? selectQuality(readDeviceCapabilities(support)) : null };
  }
  return cache;
}

export default function TwinApp() {
  const section = useTwin((s) => s.section);
  const mode = useTwin((s) => s.mode);
  const set = useTwin((s) => s.set);
  const introActive = useTwin((s) => s.intro.active);
  const caps = useCapabilities();
  const fullscreen = useTwin((s) => s.fullscreen);
  const [checked, setChecked] = useState(false);
  useFullscreenSync();
  useInputSync();
  useClock();
  useIntroController();

  // Reduced motion, and the first visit's intro (never with reduced motion or without WebGL).
  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => useTwin.setState({ reducedMotion: mql.matches });
    update();
    mql.addEventListener("change", update);
    const timer = window.setTimeout(() => {
      setChecked(true);
      if (!mql.matches && !introSeen() && getWebGLSupport().supported && window.location.hash !== "#lab") startIntro();
    }, 0);
    return () => {
      mql.removeEventListener("change", update);
      window.clearTimeout(timer);
    };
  }, []);

  // Escape: leave the intro, then clear a selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const s = useTwin.getState();
      if (s.intro.active) finishIntro();
      else if (s.selected) s.select(null);
      // The browser handles Esc for native full screen; the overlay needs it here.
      else if (s.fullscreen === "overlay") void exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Active = section === "twin" ? null : SECTION_VIEWS[section];
  return (
    <div className={ui.app} id={APP_ID} data-section={section} data-checked={checked || undefined} data-fullscreen={fullscreen === "off" ? undefined : fullscreen}>
      <div className={ui.bar} data-hidden={introActive || undefined}>
        <nav className={ui.sections} aria-label="Research environment">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button type="button" aria-current={section === s.id ? "page" : undefined} onClick={() => set({ section: s.id, selected: null })}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={ui.barRight}>
          <Segmented label="Experience mode" value={mode} options={MODES.map((m) => ({ id: m.id, label: m.label }))} onChange={(v) => set({ mode: v })} />
          {caps?.webgl && (
            <button type="button" className={ui.replay} onClick={startIntro} title="Replay introduction">
              <Clapperboard size={15} aria-hidden="true" /> <span className={ui.btnText}>Replay introduction</span>
            </button>
          )}
          <button type="button" className={ui.replay} onClick={() => void toggleFullscreen()} aria-pressed={fullscreen !== "off"} aria-keyshortcuts="F" title="Full screen (F)">
            {fullscreen === "off" ? <Maximize2 size={15} aria-hidden="true" /> : <Minimize2 size={15} aria-hidden="true" />}
            <span className={ui.btnText}>{fullscreen === "off" ? "Full screen" : "Exit full screen"}</span>
          </button>
        </div>
      </div>
      <p className={ui.modeNote}>{MODES.find((m) => m.id === mode)?.text}</p>
      {section === "twin" ? <TwinSection webgl={Boolean(caps?.webgl)} quality={caps?.quality ?? null} /> : Active && <div className={ui.lab}><Active /></div>}
    </div>
  );
}
