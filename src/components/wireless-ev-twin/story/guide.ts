"use client";
// The guided sequence: enters stages, advances them in Explore mode when
// their engineering event has happened, pauses when the visitor interacts,
// and runs the technology demonstration. Narration uses the browser's speech
// synthesis and the ambience a quiet synthesised pad; both stay off until the
// visitor turns them on (autoplay rules forbid anything else).
import { useEffect, useRef } from "react";
import type { EnvironmentId } from "@/lib/wireless-charging/content";
import { useTwin, type PlaylistId } from "../state/store";
import { stagesFor, type Stage } from "./stages";

/** Playing time spent in the current stage, s (paused time does not count). */
export const guideClock = { elapsed: 0 };

let current: Stage | null = null;

export const currentStage = (): Stage | null => {
  const g = useTwin.getState().guide;
  return stagesFor(g.playlist)[g.index] ?? null;
};

/** Enters a stage: its environment, view, camera shot and simulation state. */
export function enterStage(playlist: PlaylistId, index: number, opts: { auto?: boolean } = {}) {
  const list = stagesFor(playlist);
  const i = Math.max(0, Math.min(list.length - 1, index));
  const stage = list[i];
  current?.exit?.();
  current = stage;
  guideClock.elapsed = 0;
  const s = useTwin.getState();
  if (s.environment !== stage.env) s.bump();
  useTwin.setState((x) => ({
    environment: stage.env,
    view: stage.view,
    selected: null,
    isolate: false,
    panel: x.panel === "component" ? "none" : x.panel,
    speed: stage.speed ?? 1,
    playing: true,
    guide: { ...x.guide, active: true, playlist, index: i, stageId: stage.id, shot: stage.shot, auto: opts.auto ?? x.guide.auto, enteredAt: performance.now() },
    camera: { ...x.camera, mode: "guided", nonce: x.camera.nonce + 1 },
  }));
  stage.enter?.();
  speak(stage.narration);
}

export function nextStage() {
  const g = useTwin.getState().guide;
  const list = stagesFor(g.playlist);
  if (g.index < list.length - 1) enterStage(g.playlist, g.index + 1);
  else if (useTwin.getState().demo.active) endDemo();
}

export function prevStage() {
  const g = useTwin.getState().guide;
  enterStage(g.playlist, g.index - 1);
}

/** Back to the guided tour where it was paused (or where the visitor left the view). */
export function resumeTour(auto = useTwin.getState().mode === "explore") {
  const g = useTwin.getState().guide;
  enterStage(g.playlist, g.index, { auto });
}

/** Leaves stage control: the visitor chose a view or environment themselves. */
export function leaveTour() {
  current?.exit?.();
  current = null;
  useTwin.setState((x) => ({ guide: { ...x.guide, active: false, auto: false }, speed: x.speed > 60 ? 1 : x.speed }));
  stopSpeech();
}

export function startDemo() {
  useTwin.setState({ demo: { active: true }, section: "twin", mode: "explore", panel: "none", drawer: false, selected: null });
  enterStage("demo", 0, { auto: true });
}

export function endDemo() {
  current?.exit?.();
  current = null;
  stopSpeech();
  const env: EnvironmentId = "station";
  useTwin.setState({ demo: { active: false } });
  enterStage(env, 0, { auto: false });
}

/** Switches environment and opens its sequence at the first stage. */
export function openEnvironment(env: EnvironmentId) {
  const s = useTwin.getState();
  if (s.demo.active) useTwin.setState({ demo: { active: false } });
  enterStage(env, 0, { auto: s.mode === "explore" && s.guide.auto });
}

// ── Narration and ambience ────────────────────────────────────────────────

function speak(text: string) {
  const s = useTwin.getState();
  if (!s.narration || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.97;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

class Ambience {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  start(volume: number) {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    for (const f of [110, 164.8, 220.6]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(filter);
      o.start();
    }
    filter.connect(gain).connect(ctx.destination);
    this.ctx = ctx;
    this.gain = gain;
  }
  stop() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.gain?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    window.setTimeout(() => void ctx.close(), 500);
    this.ctx = null;
    this.gain = null;
  }
}

/** Runs the guided sequence: stage ticks, auto-advance, narration toggles and the ambience. */
export function useGuideController() {
  const active = useTwin((s) => s.guide.active);
  const auto = useTwin((s) => s.guide.auto);
  const playing = useTwin((s) => s.playing);
  const narration = useTwin((s) => s.narration);
  const sound = useTwin((s) => s.sound);
  const ambience = useRef<Ambience | null>(null);

  useEffect(() => {
    if (!active || !playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      const s = useTwin.getState();
      // Hold the story until the 3D scene has drawn (or there is no 3D scene).
      if (s.sceneReady || s.contextLost) {
        guideClock.elapsed += dt;
        const stage = currentStage();
        if (stage) {
          if (current !== stage) current = stage;
          stage.tick?.(guideClock.elapsed);
          const t = guideClock.elapsed;
          const ready = t >= stage.min && (stage.done ? stage.done() : true);
          const timeout = stage.max !== undefined && t >= stage.max;
          if (s.guide.auto && s.section === "twin" && (ready || timeout)) nextStage();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, playing]);

  // Narration switched on mid-stage reads the current stage; switched off, it stops.
  useEffect(() => {
    if (narration) {
      const stage = currentStage();
      if (stage && useTwin.getState().guide.active) speak(stage.narration);
    } else stopSpeech();
  }, [narration]);

  useEffect(() => {
    if (!sound) return;
    const a = (ambience.current ??= new Ambience());
    a.start(0.03);
    return () => a.stop();
  }, [sound]);

  useEffect(() => () => stopSpeech(), []);
  void auto;
}
