"use client";
// The Space Research showcase's interactive visual: a still of the spacecraft
// that is always there (and is the fallback without WebGL), the 3D scene
// mounted over it once the section nears the screen, a quiet heads-up layer
// (stage, simulated telemetry), and controls: stages, subsystems, pause and
// reset. The loop runs only while the visual is on screen, and not at all
// until asked when the visitor prefers reduced motion.
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useMedia, usePresence, useReducedMotion, useStageQuality } from "@/app/space/components/showcase/useStage";
import { PHASES, RECOVERY_STEPS, STAGES, SUBSYSTEMS, StoryClock, chipsFor, flowIn, subsystem, telemetryFor, tonesFor, type SubsystemId, type Tone } from "./story";
import type { ViewHandle } from "./SpacecraftScene";
import styles from "./spaceResearch.module.css";

const SpacecraftScene = dynamic(() => import("./SpacecraftScene"), { ssr: false });

export const SPACECRAFT_POSTER = {
  src: "/aerospace/space-research/spacecraft.jpg",
  width: 1400,
  height: 1120,
} as const;

export default function SpacecraftPreview3D() {
  const reducedMotion = useReducedMotion();
  const quality = useStageQuality();
  const compact = useMedia("(max-width: 1024px)");
  const frameRef = useRef<HTMLDivElement>(null);
  const { near, onScreen } = usePresence(frameRef);
  const [clock] = useState(() => new StoryClock());
  const viewRef = useRef<ViewHandle | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  // null: follow the visitor's motion preference.
  const [paused, setPaused] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<SubsystemId | null>(null);
  const [ready, setReady] = useState(false);
  // Restarts the stage progress bar when the visitor jumps to a stage.
  const [run, setRun] = useState(0);

  useEffect(() => clock.onPhase(setPhaseIndex), [clock]);

  const phase = PHASES[phaseIndex];
  const stageIndex = phase.stage;
  const stage = STAGES[stageIndex];
  const autoplay = !(paused ?? reducedMotion);
  const playing = near && onScreen && autoplay && ready;

  const tones: Partial<Record<SubsystemId, Tone>> = selected ? { [selected]: "info" } : tonesFor(phase.id);
  const chips = selected ? [{ id: selected, text: subsystem(selected).name }] : chipsFor(phase.id, compact);
  const telemetry = selected ? null : telemetryFor(phase.id);

  const select = (id: SubsystemId) => {
    setSelected((s) => (s === id ? null : id));
    setPaused(true);
    viewRef.current?.release();
  };

  const goToStage = (i: number) => {
    setSelected(null);
    viewRef.current?.release();
    clock.jumpToStage(i);
    setRun((r) => r + 1);
  };

  const togglePlay = () => {
    if (!autoplay) {
      setSelected(null);
      viewRef.current?.release();
    }
    setPaused(autoplay);
  };

  const reset = () => {
    setSelected(null);
    viewRef.current?.reset();
  };

  return (
    <figure className={styles.visual}>
      <div className={styles.frameWrap}>
        <div
          ref={frameRef}
          className={styles.frame}
          data-ready={ready || undefined}
          role="img"
          aria-label={`Educational 3D model of a 6U CubeSat-class spacecraft with two deployed solar-array wings, a gold-insulated body, antennas and a star tracker, above Earth's horizon. Stage ${stageIndex + 1} of 4: ${stage.title}.${selected ? ` Selected: ${subsystem(selected).name}.` : ""}`}
        >
          <Image className={styles.poster} src={SPACECRAFT_POSTER.src} alt="" fill sizes="(min-width: 1025px) 700px, 100vw" />
          {near && quality !== null && (
            <div className={styles.canvas} aria-hidden="true">
              <SpacecraftScene
                clock={clock}
                tones={tones}
                chips={chips}
                flow={!selected && flowIn(phase.id)}
                anomaly={!selected && (phase.id === "anomaly" || phase.id === "safe-mode")}
                playing={playing}
                reducedMotion={reducedMotion}
                quality={quality}
                compact={compact}
                selected={selected}
                onSelect={select}
                viewRef={viewRef}
                onReady={() => setReady(true)}
              />
            </div>
          )}

          {/* Heads-up layer: the stage, and simulated telemetry in words as well as colour. */}
          <div className={styles.hud} aria-hidden="true">
            <div className={styles.stageChip}>
              <span className={styles.stageNum}>{selected ? "Subsystem" : `0${stageIndex + 1} / 04`}</span>
              <span className={styles.stageTitle}>{selected ? subsystem(selected).name : stage.title}</span>
              {!reducedMotion && !selected && (
                <span className={styles.stageBar}>
                  <span key={`${stageIndex}-${run}`} className={styles.stageFill} style={{ animationDuration: `${stage.seconds}s`, animationPlayState: playing ? "running" : "paused" }} />
                </span>
              )}
            </div>
            {telemetry && (
              <div className={styles.telemetry} data-alert={telemetry.alert || undefined}>
                <p className={styles.telemetryHead}>
                  <span className={styles.telemetryDot} /> Simulated telemetry
                </p>
                <dl className={styles.readings}>
                  <div>
                    <dt>Array</dt>
                    <dd>{telemetry.arrayW.toFixed(1)} W</dd>
                  </div>
                  <div>
                    <dt>Battery</dt>
                    <dd>
                      {telemetry.battery}% <span className={styles.readingNote}>{telemetry.batteryNote}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Mode</dt>
                    <dd className={styles.mode}>{telemetry.mode}</dd>
                  </div>
                </dl>
                {reducedMotion && stage.id === "recovery" ? (
                  <ol className={styles.steps}>
                    {RECOVERY_STEPS.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                ) : (
                  telemetry.note && <p className={styles.telemetryNote}>{telemetry.note}</p>
                )}
                <ul className={styles.healthList}>
                  {telemetry.health.map((h) => (
                    <li key={h.id} data-ok={h.ok || undefined}>
                      {h.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {quality === null && near && <p className={styles.fallback}>3D isn&rsquo;t available on this device, so a still image is shown.</p>}
        </div>

        <div className={styles.tools}>
          <button type="button" className={styles.tool} aria-pressed={!autoplay} onClick={togglePlay} aria-label={autoplay ? "Pause the animation" : "Play the animation"}>
            {autoplay ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          </button>
          <button type="button" className={styles.tool} onClick={reset} aria-label="Reset the camera">
            <RotateCcw size={16} aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.stages} role="group" aria-label="Animation stages">
          {STAGES.map((s, i) => (
            <button key={s.id} type="button" className={styles.stageBtn} aria-pressed={stageIndex === i && !selected} onClick={() => goToStage(i)}>
              <span className={styles.stageBtnNum} aria-hidden="true">
                {i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>
        <div className={styles.subsystems} role="group" aria-label="Spacecraft subsystems">
          {SUBSYSTEMS.map((s) => (
            <button key={s.id} type="button" className={styles.subBtn} aria-pressed={selected === s.id} onClick={() => select(s.id)}>
              {s.short}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          {selected && (
            <p className={styles.explain}>
              <strong>{subsystem(selected).name}:</strong> {subsystem(selected).line}
            </p>
          )}
        </div>
      </div>

      <figcaption className={styles.caption}>
        Educational 3D model of a generic 6U CubeSat-class spacecraft, not flight hardware. Telemetry and the anomaly are simulated; autonomous safe recovery is shown as a research concept, not an operational
        system. Earth is not to scale. Drag sideways to turn; pinch, or Ctrl/⌘ + scroll, to zoom.
      </figcaption>
    </figure>
  );
}
