"use client";
// The cinematic timeline: playback, stage navigation and a stage strip that
// works as a scrubber, the simulation clock and its time scale, the camera
// (guided or the visitor's own), the view menu, narration, captions and sound.
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Captions, ChevronLeft, ChevronRight, Layers, MessageSquareText, Pause, Play, RotateCcw, StepForward, Volume2, VolumeX } from "lucide-react";
import { VIEW_MODES, type ViewModeId } from "@/lib/wireless-charging/content";
import { facilityIfBuilt, resetEnvironment, runtime, singleStep, useSampled } from "../state/runtime";
import { siteClock } from "./parkingMetrics";
import { SPEEDS, useTwin } from "../state/store";
import { enterStage, guideClock, leaveTour, nextStage, prevStage, resumeTour } from "../story/guide";
import { chapterOf, DEMO_CHAPTERS, stagesFor } from "../story/stages";
import { fmt } from "../ui/controls";
import lab from "./lab.module.css";

/** Visualisation modes each environment offers. */
export const VIEWS_BY_ENV: Record<string, ViewModeId[]> = {
  parking: ["cinematic", "shelter", "occupancy", "energy", "environment", "iot", "xray", "top"],
  station: ["cinematic", "xray", "chassis", "underbody", "battery", "receiver", "assembly", "power", "cutaway", "exploded", "engineering", "field", "energy", "thermal", "iot"],
  dynamic: ["cinematic", "energy", "xray", "chassis", "cutaway", "receiver", "field", "segments", "coupling", "roadside", "top"],
  autonomous: ["cinematic", "xray", "chassis"],
  infrastructure: ["cinematic"],
};

function ViewMenu() {
  const [open, setOpen] = useState(false);
  const env = useTwin((s) => s.environment);
  const view = useTwin((s) => s.view);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);
  const allowed = VIEWS_BY_ENV[env];
  if (allowed.length < 2) return null;
  const groups = ["Assembly", "Science", "Camera"] as const;
  return (
    <div className={lab.menuWrap} ref={box}>
      <button type="button" className={lab.tlBtn} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)} title="Visualisation">
        <Layers size={16} aria-hidden="true" />
        <span className={lab.tlLabel}>{VIEW_MODES.find((v) => v.id === view)?.label ?? "View"}</span>
      </button>
      {open && (
        <div className={lab.menu} role="group" aria-label="Visualisation">
          {groups.map((g) => {
            const items = VIEW_MODES.filter((v) => v.group === g && allowed.includes(v.id));
            if (!items.length) return null;
            return (
              <div key={g}>
                <p className={lab.menuHead}>{g === "Assembly" ? "Assembly and views" : g === "Science" ? "Scientific overlays" : "Cameras"}</p>
                <div className={lab.menuGrid}>
                  {items.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={view === v.id}
                      onClick={() => {
                        leaveTour();
                        useTwin.setState((s) => ({ view: v.id, camera: { ...s.camera, mode: "guided", nonce: s.camera.nonce + 1 }, selected: null }));
                        setOpen(false);
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Clock() {
  const env = useTwin((s) => s.environment);
  const speed = useTwin((s) => s.speed);
  const parking = env === "parking" || (env === "station" && useTwin.getState().handover !== null);
  const read = useCallback(() => (parking ? facilityIfBuilt()?.t ?? 0 : env === "station" ? runtime.station.state.t : env === "dynamic" ? runtime.road.state.t : env === "autonomous" ? runtime.parking.state.t : useTwin.getState().gridHour * 3600), [env, parking]);
  const t = useSampled(read, 5);
  const sim = facilityIfBuilt();
  const text = parking && sim ? siteClock(sim, t, true) : env === "infrastructure" ? `${String(Math.floor(t / 3600)).padStart(2, "0")}:${String(Math.floor((t % 3600) / 60)).padStart(2, "0")}` : t >= 3600 ? `${Math.floor(t / 3600)} h ${String(Math.floor((t % 3600) / 60)).padStart(2, "0")} min` : `${fmt(t, 1)} s`;
  return (
    <span className={lab.clock}>
      <span className={lab.clockLabel}>{parking ? "Site time" : "Simulation time"}</span> {text}
      {speed !== 1 && <span className={lab.accelerated}>{speed > 1 ? `Accelerated ×${speed}` : `Slow ×${speed}`}</span>}
    </span>
  );
}

function StageStrip() {
  const g = useTwin((s) => s.guide);
  const demo = useTwin((s) => s.demo.active);
  const stages = stagesFor(g.playlist);
  const read = useCallback(() => {
    const st = stagesFor(useTwin.getState().guide.playlist)[useTwin.getState().guide.index];
    return st ? Math.min(1, guideClock.elapsed / Math.max(1, st.min)) : 0;
  }, []);
  const progress = useSampled(read, 6);
  return (
    <ol className={lab.strip} aria-label={demo ? "Demonstration chapters" : "Engineering stages"}>
      {stages.map((s, i) => {
        const state = !g.active ? (i === g.index ? "held" : "next") : i < g.index ? "done" : i === g.index ? "now" : "next";
        const chapter = demo ? chapterOf(i) : -1;
        const label = demo ? `Chapter ${chapter + 1}: ${DEMO_CHAPTERS[chapter].title} — ${s.title}` : `Stage ${i + 1}: ${s.title}`;
        return (
          <li key={`${s.id}-${i}`} data-state={state} data-chapter-start={demo && (i === 0 || chapterOf(i - 1) !== chapter) ? "" : undefined}>
            <button type="button" aria-current={i === g.index ? "step" : undefined} aria-label={label} title={label} onClick={() => enterStage(g.playlist, i, { auto: false })}>
              <span className={lab.stripFill} style={state === "now" ? { transform: `scaleX(${progress})` } : undefined} />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function Timeline() {
  const playing = useTwin((s) => s.playing);
  const speed = useTwin((s) => s.speed);
  const env = useTwin((s) => s.environment);
  const g = useTwin((s) => s.guide);
  const demo = useTwin((s) => s.demo.active);
  const cameraMode = useTwin((s) => s.camera.mode);
  const narration = useTwin((s) => s.narration);
  const captions = useTwin((s) => s.captions);
  const sound = useTwin((s) => s.sound);
  const mode = useTwin((s) => s.mode);
  const set = useTwin((s) => s.set);
  const stages = stagesFor(g.playlist);
  const stage = stages[g.index];
  return (
    <div className={lab.timeline} role="group" aria-label="Playback and stages">
      <div className={lab.tlGroup}>
        <button type="button" className={lab.tlBtn} onClick={prevStage} disabled={g.index === 0} aria-label="Previous stage">
          <ChevronLeft size={17} aria-hidden="true" />
        </button>
        <button type="button" className={lab.tlPrimary} onClick={() => set({ playing: !playing })} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        </button>
        <button type="button" className={lab.tlBtn} onClick={nextStage} disabled={g.index >= stages.length - 1 && !demo} aria-label="Next stage">
          <ChevronRight size={17} aria-hidden="true" />
        </button>
        {!demo && (
          <>
            <button type="button" className={lab.tlBtn} onClick={() => singleStep()} disabled={playing} aria-label="Single step" title="Single simulation step (while paused)">
              <StepForward size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={lab.tlBtn}
              onClick={() => {
                resetEnvironment(env);
                enterStage(g.playlist, 0, { auto: useTwin.getState().mode === "explore" });
              }}
              aria-label="Restart"
              title="Restart the environment and its sequence"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <div className={lab.tlCentre}>
        <p className={lab.tlStage}>
          <span className={lab.tlCount}>{`${g.index + 1}/${stages.length}`}</span>
          <span className={lab.tlTitle}>{g.active ? stage?.title : "Guided sequence paused"}</span>
          {(!g.active || (!g.auto && mode === "explore")) && (
            <button type="button" className={lab.resume} onClick={() => resumeTour()}>
              {g.active ? "Continue tour" : "Resume tour"}
            </button>
          )}
        </p>
        <StageStrip />
      </div>
      <div className={lab.tlGroup}>
        <Clock />
        {!demo && (
          <label className={lab.speed}>
            <span className={lab.srOnly}>Simulation speed</span>
            <select value={speed} onChange={(e) => set({ speed: Number(e.target.value), guide: { ...g, auto: false } })}>
              {SPEEDS.map((s) => (
                <option key={s} value={s}>{`${s}×`}</option>
              ))}
            </select>
          </label>
        )}
        {!demo && (
          <button
            type="button"
            className={lab.tlBtn}
            data-free={cameraMode === "free" || undefined}
            onClick={() => useTwin.getState().setCamera({ mode: "guided", nonce: useTwin.getState().camera.nonce + 1 })}
            aria-label={cameraMode === "free" ? "Camera: your view. Return to the guided camera" : "Camera: guided. Reset the camera"}
            title={cameraMode === "free" ? "Your view — click to return to the guided camera" : "Guided camera — click to reset"}
          >
            <Camera size={16} aria-hidden="true" />
          </button>
        )}
        {!demo && <ViewMenu />}
        <button type="button" className={lab.tlBtn} aria-pressed={narration} onClick={() => set({ narration: !narration })} aria-label="Narration" title="Narration (browser speech)">
          <MessageSquareText size={16} aria-hidden="true" />
        </button>
        <button type="button" className={lab.tlBtn} aria-pressed={captions} onClick={() => set({ captions: !captions })} aria-label="Captions" title="Captions">
          <Captions size={16} aria-hidden="true" />
        </button>
        <button type="button" className={lab.tlBtn} aria-pressed={sound} onClick={() => set({ sound: !sound })} aria-label="Sound" title="Ambient sound">
          {sound ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
