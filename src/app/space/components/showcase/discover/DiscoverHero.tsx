"use client";
// "Space Explorer: your first mission": the Discover pathway's interactive
// 3D hero. A loop of four stages (Discover, Explore, Experiment, Mission)
// runs while the card is on screen; the learner can pause it, jump to any
// stage, explode the model, tap a part for one line about it, orbit and zoom.
// Uses Mission 1's own CubeSat model and its power numbers; everything is an
// educational, simulated model, as the caption says.
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BatteryCharging, Check, Layers, Pause, Play, PlayCircle, RotateCcw, Sun } from "lucide-react";
import { PARTS, sunlitPowerW, type PartId } from "@/components/space-academy/missions/cubesat/model";
import { useMedia, usePresence, useReducedMotion, useStageQuality } from "../useStage";
import { DiscoverPoster } from "../posters";
import { STAGES, Timeline, type StageId } from "./timeline";
import type { ViewHandle } from "./DiscoverHeroCanvas";
import showcase from "../showcase.module.css";
import styles from "./discover.module.css";

const DiscoverHeroCanvas = dynamic(() => import("./DiscoverHeroCanvas"), { ssr: false });

/** The five parts students are asked to find, each in one short line. */
const PARTS_TO_FIND: { id: PartId; name: string; line: string }[] = [
  { id: "panels", name: "Solar panels", line: "Turn sunlight into electricity." },
  { id: "battery", name: "Battery", line: "Stores energy for the eclipse, when Earth's shadow hides the Sun." },
  { id: "obc", name: "Flight computer", line: "Runs the satellite and decides what happens next." },
  { id: "adcs", name: "Sensors", line: "Measure which way the satellite points, so it can turn." },
  { id: "antenna", name: "Antenna", line: "Sends data home and receives commands." },
];

const lineFor = (id: PartId) => PARTS_TO_FIND.find((p) => p.id === id)?.line ?? PARTS[id].job.foundation;
const nameFor = (id: PartId) => PARTS_TO_FIND.find((p) => p.id === id)?.name ?? PARTS[id].name;

/** Mission 1's numbers: body panels plus wings, square to the Sun. */
const SOLAR_W = sunlitPowerW("wings", 0);

export default function DiscoverHero() {
  const reducedMotion = useReducedMotion();
  const quality = useStageQuality();
  const compact = useMedia("(max-width: 860px)");
  const frameRef = useRef<HTMLDivElement>(null);
  const { near, onScreen } = usePresence(frameRef);
  const [timeline] = useState(() => new Timeline());
  const viewRef = useRef<ViewHandle | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [explodedOverride, setExplodedOverride] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<PartId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => timeline.onStage(setStageIndex), [timeline]);

  const stage: StageId = STAGES[stageIndex].id;
  // Reduced motion: nothing moves until asked; the stage buttons still step through the story.
  const autoplay = !reducedMotion && !paused;
  const playing = near && onScreen && autoplay && ready;
  const exploded = explodedOverride ?? (stage === "explore" || stage === "experiment");

  const select = (id: PartId) => {
    setSelected((s) => (s === id ? null : id));
    setPaused(true);
  };

  const reset = () => {
    viewRef.current?.reset();
    setSelected(null);
    setExplodedOverride(null);
    timeline.jump(0);
  };

  return (
    <figure className={showcase.visual}>
      <div className={showcase.frameWrap}>
        <div
          ref={frameRef}
          className={`${showcase.frame} ${styles.frame}`}
          data-ready={ready || undefined}
          role="img"
          aria-label={`An educational 1U CubeSat model with deployed solar wings, large in the frame, Earth small and lit behind it. Stage ${stageIndex + 1} of 4: ${STAGES[stageIndex].label}.${selected ? ` Selected: ${nameFor(selected)}.` : ""}`}
        >
          <div className={showcase.poster} aria-hidden="true">
            <DiscoverPoster />
          </div>
          {near && quality !== null && (
            <div className={showcase.canvas} aria-hidden="true">
              <DiscoverHeroCanvas
                timeline={timeline}
                stage={stage}
                playing={playing}
                reducedMotion={reducedMotion}
                quality={quality}
                compact={compact}
                exploded={exploded}
                selected={selected}
                onSelect={select}
                viewRef={viewRef}
                onReady={() => setReady(true)}
              />
            </div>
          )}
          {/* Heads-up overlays: what each stage shows, in words and icons as well as colour. */}
          <div className={styles.hud} aria-hidden="true">
            <span className={styles.stageChip}>
              {stageIndex + 1} · {STAGES[stageIndex].label}
            </span>
            {stage === "experiment" && (
              <div className={styles.energy}>
                <span className={styles.energyRow}>
                  <Sun size={15} /> Solar {SOLAR_W.toFixed(1)} W in
                </span>
                <span className={styles.energyRow}>
                  <BatteryCharging size={15} /> Battery charging
                </span>
                <span className={styles.gauge}>
                  <span className={styles.gaugeFill} data-run={playing || undefined} />
                </span>
                <span className={styles.note}>Simulated · time-lapse</span>
              </div>
            )}
            {stage === "mission" && (
              <div className={styles.health}>
                {["Power", "Computer", "Radio"].map((s) => (
                  <span key={s} className={styles.healthRow}>
                    <Check size={14} /> {s} OK
                  </span>
                ))}
                <span className={styles.ready}>Ready for Mission 1</span>
              </div>
            )}
          </div>
          {quality === null && near && <p className={styles.fallback}>3D isn&rsquo;t available here, so a still picture is shown. Everything below still works.</p>}
        </div>
        <Link
          href="/space/academy/missions/build-your-first-cubesat"
          className={showcase.visualAction}
          data-track-event="space_academy_entry_click"
          data-track-placement="pathway_discover_visual"
          data-track-mission="build-your-first-cubesat"
        >
          <PlayCircle size={20} aria-hidden />
          <span>
            Play Mission 1<span className={showcase.actionMore}>: Build Your First CubeSat</span>
          </span>
        </Link>
        {selected && (
          <p className={styles.explain} aria-live="polite">
            <strong>{nameFor(selected)}:</strong> {lineFor(selected)}
          </p>
        )}
      </div>

      <div className={styles.bar}>
        <div className={styles.stages} role="group" aria-label="Animation stages">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={styles.stageBtn}
              aria-pressed={stageIndex === i}
              onClick={() => {
                setSelected(null);
                timeline.jump(i);
              }}
            >
              <span className={styles.stageNum}>{i + 1}</span>
              {s.label}
            </button>
          ))}
        </div>
        <div className={styles.tools}>
          <button type="button" className={styles.tool} aria-pressed={exploded} onClick={() => setExplodedOverride(!exploded)} aria-label="Exploded view">
            <Layers size={16} aria-hidden />
          </button>
          <button type="button" className={styles.tool} onClick={reset} aria-label="Reset the view">
            <RotateCcw size={16} aria-hidden />
          </button>
          <button type="button" className={styles.tool} aria-pressed={!autoplay} onClick={() => setPaused((p) => !p)} aria-label={autoplay ? "Pause the animation" : "Play the animation"} disabled={reducedMotion}>
            {autoplay ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          </button>
        </div>
      </div>
      <div className={styles.parts} role="group" aria-label="Find a part">
        {PARTS_TO_FIND.map((p) => (
          <button key={p.id} type="button" className={styles.partBtn} aria-pressed={selected === p.id} onClick={() => select(p.id)}>
            {p.name}
          </button>
        ))}
      </div>
      <figcaption className={showcase.caption}>
        An educational 1U CubeSat model (Mission 1&rsquo;s), not flight hardware. Energy and health readings are simulated. Not to scale: Earth is a backdrop. Drag to turn, pinch or scroll to zoom, tap a part.
      </figcaption>
    </figure>
  );
}
