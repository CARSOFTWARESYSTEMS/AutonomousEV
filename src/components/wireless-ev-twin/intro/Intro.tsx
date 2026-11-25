"use client";
// The cinematic introduction: six scenes flown over the live simulations.
// Shown once automatically (never with reduced motion), always skippable,
// pausable and replayable. Narration uses the browser's speech synthesis and
// sound a quiet synthesised pad; both are off until the visitor turns them on.
import { useEffect, useRef } from "react";
import { Pause, Play, SkipForward, Volume2, VolumeX, MessageSquareText, X, ChevronRight } from "lucide-react";
import { reservationExchange } from "@/lib/wireless-charging/autonomous";
import { INTRO_SCENES, PRODUCT } from "@/lib/wireless-charging/content";
import { resetEnvironment } from "../state/runtime";
import { useTwin } from "../state/store";
import { stationCommand } from "@/lib/wireless-charging/station";
import { runtime } from "../state/runtime";
import { introClock } from "./introClock";
import ui from "../twin.module.css";

const SEEN_KEY = "wevct-intro-seen-v1";

export function introSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the intro may show again next time */
  }
}

/** What each scene sets up when it begins. */
function enterScene(index: number) {
  const set = useTwin.getState().set;
  const scene = INTRO_SCENES[index]?.id;
  introClock.elapsed = 0;
  introClock.progress = 0;
  if (scene === "ecosystem") {
    set({ environment: "station", view: "cinematic" });
    introClock.speed = 1;
  } else if (scene === "park") {
    set({ environment: "station", view: "cinematic" });
    resetEnvironment("station");
    introClock.speed = 3;
  } else if (scene === "drive") {
    set({ environment: "dynamic", view: "cinematic" });
    resetEnvironment("dynamic");
    introClock.speed = 1;
  } else if (scene === "charge") {
    set({ environment: "autonomous", view: "cinematic" });
    resetEnvironment("autonomous");
    introClock.speed = 2.2;
  } else if (scene === "network") {
    set({ environment: "infrastructure", view: "cinematic", gridHour: 7 });
    introClock.speed = 60;
  } else if (scene === "science") {
    set({ environment: "station", view: "cinematic" });
    introClock.speed = 1;
  }
}

/** Mid-scene beats: reveal the pads under the car, open the road. */
function sceneBeat(index: number, progress: number) {
  const s = useTwin.getState();
  const id = INTRO_SCENES[index]?.id;
  if (id === "park" && progress > 0.62 && s.view !== "field") s.set({ view: "field" });
  if (id === "drive" && progress > 0.35 && s.view !== "cutaway") s.set({ view: "cutaway" });
  if (id === "network") s.set({ gridHour: 7 + progress * 12 });
}

class Ambience {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  start() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
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

/** Runs the intro while it is active. */
export function useIntroController() {
  const active = useTwin((s) => s.intro.active);
  const scene = useTwin((s) => s.intro.scene);
  const paused = useTwin((s) => s.intro.paused);
  const narration = useTwin((s) => s.narration);
  const sound = useTwin((s) => s.sound);
  const reduced = useTwin((s) => s.reducedMotion);
  const ambience = useRef<Ambience | null>(null);

  useEffect(() => {
    if (!active) return;
    enterScene(scene);
    if (narration && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(INTRO_SCENES[scene].narration);
      u.rate = 0.98;
      window.speechSynthesis.speak(u);
    }
  }, [active, scene, narration]);

  useEffect(() => {
    if (!active || paused) return;
    let raf = 0;
    let last = performance.now();
    const seconds = INTRO_SCENES[scene].seconds;
    const loop = (now: number) => {
      // Wall-clock time, so a slow device gets a slower frame rate, not a slower story.
      const dt = Math.min(1, (now - last) / 1000);
      last = now;
      // Hold the story until the 3D scene has drawn its first frames.
      if (!useTwin.getState().sceneReady) {
        raf = requestAnimationFrame(loop);
        return;
      }
      // With reduced motion, scenes are still frames: they wait for Next.
      if (!reduced) {
        introClock.elapsed += dt;
        introClock.progress = Math.min(1, introClock.elapsed / seconds);
        sceneBeat(scene, introClock.progress);
        if (introClock.progress >= 1) {
          if (scene < INTRO_SCENES.length - 1) useTwin.getState().set({ intro: { active: true, scene: scene + 1, paused: false } });
          return;
        }
      } else {
        introClock.progress = 1;
        sceneBeat(scene, 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, scene, reduced]);

  useEffect(() => {
    if (!active || !sound) return;
    const a = (ambience.current ??= new Ambience());
    a.start();
    return () => a.stop();
  }, [active, sound]);

  useEffect(() => {
    if (!active || !paused) return;
    if ("speechSynthesis" in window) window.speechSynthesis.pause();
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.resume();
    };
  }, [active, paused]);
}

export function startIntro() {
  useTwin.getState().set({ intro: { active: true, scene: 0, paused: false }, section: "twin", selected: null });
}

export function finishIntro() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  markSeen();
  introClock.speed = 1;
  useTwin.getState().set({ intro: { active: false, scene: 0, paused: false }, environment: "station", view: "cinematic", section: "twin", playing: true });
  resetEnvironment("station");
  stationCommand(runtime.station, "arrive");
}

const RESERVATION = reservationExchange("EVSIM042", "S2", 48121);

export default function IntroOverlay() {
  const intro = useTwin((s) => s.intro);
  const narration = useTwin((s) => s.narration);
  const sound = useTwin((s) => s.sound);
  const reduced = useTwin((s) => s.reducedMotion);
  const set = useTwin((s) => s.set);
  const enterRef = useRef<HTMLButtonElement>(null);
  const scene = INTRO_SCENES[intro.scene];
  const last = intro.scene === INTRO_SCENES.length - 1;
  useEffect(() => {
    if (last) enterRef.current?.focus();
  }, [last]);
  if (!intro.active) return null;
  return (
    <div className={ui.intro} data-scene={scene.id} role="region" aria-label="Introduction">
      <div className={ui.introTop}>
        <p className={ui.introBrand}>{PRODUCT.brand}</p>
        <ol className={ui.introDots} aria-label="Introduction scenes">
          {INTRO_SCENES.map((s, i) => (
            <li key={s.id} data-on={i === intro.scene || undefined} data-done={i < intro.scene || undefined}>
              <span className={ui.srOnly}>{`Scene ${i + 1}: ${s.title}${i === intro.scene ? " (current)" : ""}`}</span>
            </li>
          ))}
        </ol>
        <div className={ui.introControls}>
          <button type="button" onClick={() => set({ narration: !narration })} aria-pressed={narration} title="Narration">
            <MessageSquareText size={16} aria-hidden="true" />
            <span className={ui.srOnly}>Narration</span>
          </button>
          <button type="button" onClick={() => set({ sound: !sound })} aria-pressed={sound} title="Sound">
            {sound ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
            <span className={ui.srOnly}>Sound</span>
          </button>
          {!reduced && (
            <button type="button" onClick={() => set({ intro: { ...intro, paused: !intro.paused } })} aria-pressed={intro.paused} title={intro.paused ? "Play" : "Pause"}>
              {intro.paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              <span className={ui.srOnly}>{intro.paused ? "Play" : "Pause"}</span>
            </button>
          )}
          <button type="button" className={ui.introSkip} onClick={finishIntro}>
            Skip introduction <X size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={ui.introCaption} aria-live="polite">
        <p className={ui.introEyebrow}>{`${String(intro.scene + 1).padStart(2, "0")} / ${String(INTRO_SCENES.length).padStart(2, "0")}`}</p>
        {last ? (
          <>
            <h2 className={ui.introTitleBig}>{PRODUCT.closing}</h2>
            <p className={ui.introText}>{PRODUCT.name}</p>
            <button ref={enterRef} type="button" className={ui.introEnter} onClick={finishIntro}>
              Enter Research Laboratory <ChevronRight size={18} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <h2 className={ui.introTitle}>{scene.title}</h2>
            <p className={ui.introText}>{scene.caption}</p>
          </>
        )}
        {scene.id === "charge" && (
          <ol className={ui.introMessages} aria-label="Simulated reservation messages">
            {RESERVATION.map((m) => (
              <li key={m.type}>
                <span>{`${m.from} → ${m.to}`}</span>
                <strong>{m.type}</strong>
              </li>
            ))}
          </ol>
        )}
        {reduced && !last && (
          <button type="button" className={ui.introNext} onClick={() => set({ intro: { ...intro, scene: intro.scene + 1 } })}>
            Next scene <SkipForward size={15} aria-hidden="true" />
          </button>
        )}
        <p className={ui.introNote}>Live simulation · SIMULATED values · procedural 3D models</p>
      </div>
    </div>
  );
}
