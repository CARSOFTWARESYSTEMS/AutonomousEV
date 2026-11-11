"use client";
// The UFlight™ card's visual on the Aerospace homepage: the existing still,
// and over it, once the card nears the screen, a compact preview of the
// UFlight™ 3D application — the same aircraft and engine, walked through four
// stages. This module is light (no three.js); the scene is a separate chunk.
// The loop runs only on screen, and waits for a Play when the visitor prefers
// reduced motion. Without WebGL the still stays, and the stages read as text.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Pause, Play, RotateCcw } from "lucide-react";
import { getWebGLSupport, readDeviceCapabilities, selectQuality, type QualitySettings } from "../../satellite-explorer/lib/capabilities";
import { useMedia, usePresence, useReducedMotion } from "@/app/space/components/showcase/useStage";
import { AIRCRAFT } from "../data/uflightReferenceAircraft";
import { STAGES, StageClock, type PlayState } from "./stages";
import UFlightStageNavigation from "./UFlightStageNavigation";
import styles from "./preview.module.css";

const UFlightPreviewScene = dynamic(() => import("./UFlightPreviewScene"), { ssr: false });

const cache = new Map<boolean, QualitySettings | null>();

/** The application's quality tier, made lighter for a card: no post-processing, capped pixel ratio, no shadows on small screens. */
function previewQuality(compact: boolean): QualitySettings | null {
  if (!cache.has(compact)) {
    const webgl = getWebGLSupport();
    if (!webgl.supported) cache.set(compact, null);
    else {
      const q = selectQuality(readDeviceCapabilities(webgl));
      cache.set(compact, { ...q, postprocessing: false, dpr: Math.min(q.dpr, compact ? 1.5 : 1.75), shadows: q.shadows && !compact, shadowMapSize: Math.min(q.shadowMapSize, 1024) });
    }
  }
  return cache.get(compact)!;
}

const noop = () => () => {};

/** undefined on the server and before hydration; null where WebGL is missing. */
function useQuality(compact: boolean) {
  return useSyncExternalStore(
    noop,
    () => previewQuality(compact),
    () => undefined,
  );
}

export default function UFlightShowcasePreview({ poster }: { poster: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const compact = useMedia("(max-width: 1024px)");
  const quality = useQuality(compact);
  const frameRef = useRef<HTMLDivElement>(null);
  const { near, onScreen } = usePresence(frameRef);
  const [clock] = useState(() => new StageClock());
  const [stage, setStage] = useState(0);
  // null: follow the motion preference (run, or wait for Play).
  const [choice, setChoice] = useState<PlayState | null>(null);
  const [ready, setReady] = useState(false);
  // Restarts the stage progress bar on a jump.
  const [run, setRun] = useState(0);
  const play: PlayState = choice ?? (reducedMotion ? "paused" : "auto");

  useEffect(() => clock.onStage(setStage), [clock]);
  useEffect(() => clock.setPlay(play), [clock, play]);

  const select = (i: number) => {
    setChoice("stage");
    clock.jump(i, "stage");
    setRun((r) => r + 1);
  };

  const togglePlay = () => {
    const next: PlayState = play === "paused" ? "auto" : "paused";
    setChoice(next);
    clock.setPlay(next);
  };

  const reset = () => {
    setChoice(null);
    clock.jump(0, reducedMotion ? "paused" : "auto");
    setRun((r) => r + 1);
  };

  // Dragging, pinching or zooming the view pauses the sequence: the visitor has the camera.
  const interact = useCallback(() => {
    setChoice("paused");
    clock.setPlay("paused");
  }, [clock]);

  const current = STAGES[stage];
  const running = play !== "paused" && onScreen && ready;

  return (
    <div className={styles.preview} data-stage={current.id}>
      <div className={styles.stageArea}>
        <div
          ref={frameRef}
          className={styles.frame}
          data-ready={ready || undefined}
          role="img"
          aria-label={`Interactive 3D preview of the ${AIRCRAFT.name}, a six-seat high-wing electric aircraft with eight propulsion units, in a dark engineering studio. Stage ${stage + 1} of 4: ${current.label}.`}
        >
          <div className={styles.poster}>{poster}</div>
          {near && quality && (
            <div className={styles.scene}>
              <UFlightPreviewScene clock={clock} quality={quality} reducedMotion={reducedMotion} onScreen={onScreen} onReady={() => setReady(true)} onInteract={interact} />
            </div>
          )}
          <div className={styles.stageChip} aria-hidden="true">
            <span className={styles.stageChipNum}>{current.number}</span>
            <span>{current.label}</span>
            {!reducedMotion && (
              <span className={styles.stageBar}>
                <span
                  key={`${stage}-${run}`}
                  className={styles.stageFill}
                  style={{ animationDuration: `${current.seconds}s`, animationPlayState: running ? "running" : "paused" }}
                />
              </span>
            )}
          </div>
          {quality === null && <p className={styles.fallback}>3D isn&rsquo;t available on this device, so a still image is shown.</p>}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.lineRow}>
          <p className={styles.line} aria-live={play === "auto" ? "off" : "polite"}>
            {current.line}
          </p>
          <div className={styles.tools}>
            <button type="button" className={styles.tool} aria-pressed={play === "paused"} onClick={togglePlay} aria-label={play === "paused" ? "Play the preview" : "Pause the preview"}>
              {play === "paused" ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
            </button>
            <button type="button" className={styles.tool} onClick={reset} aria-label="Reset the preview">
              <RotateCcw size={15} aria-hidden />
            </button>
          </div>
        </div>
        <UFlightStageNavigation stage={stage} onSelect={select} />
      </div>
    </div>
  );
}
