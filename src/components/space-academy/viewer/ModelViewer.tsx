"use client";
// The Academy's model viewer: one control layout for every mission, a 3D
// stage that loads only when it is near the screen and the device can draw
// it, and an accessible 2D drawing for everything else. The 2D drawing is
// also what the server renders, so the page has content before (and
// without) JavaScript.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { Box, Layers, RotateCcw, RotateCw, Square, Tag, ZoomIn, ZoomOut, LocateFixed } from "lucide-react";
import { getWebGLSupport, REDUCED_MOTION_QUERY } from "@/components/satellite-explorer/lib/capabilities";
import { setViewPreference, useViewPreference } from "../store";
import { academyEvent } from "../analytics";
import { createController, type Scene2DState, type SceneState, type StageQuality, type ViewerController } from "./controller";
import { StageQualityContext } from "./Stage3D";
import styles from "./viewer.module.css";

const COMPACT_QUERY = "(max-width: 767px)";

function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

/** null on the server and before hydration. */
function useWebGL(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    () => getWebGLSupport().supported,
    () => null,
  );
}

export interface ModelViewerProps<P extends object> {
  /** Accessible name of the model, e.g. "1U CubeSat model". */
  title: string;
  Scene3D: ComponentType<P & SceneState>;
  sceneProps: P;
  render2D: (state: Scene2DState) => ReactNode;
  /** Shows the exploded-view toggle. */
  explodable?: boolean;
  defaultExploded?: boolean;
  defaultLabels?: boolean;
  /** Text under the stage: what is shown and that it is illustrative. */
  caption: ReactNode;
  /** Mission slug, for analytics. */
  mission: string;
  /**
   * "lab": the stage fills its container (the Mission Lab's viewport) and the
   * view tools float over it in one column; the caption is kept for screen
   * readers. "inline" (default): a framed stage with the tools underneath.
   */
  variant?: "inline" | "lab";
  /** Controlled exploded view, so a mission can open the model to show a part. */
  exploded?: boolean;
  onExplodedChange?: (exploded: boolean) => void;
  /** A camera controller owned by the mission, for guided camera moves. */
  controller?: ViewerController;
  /** Overrides from the learner's settings; otherwise the device's preference and full quality. */
  reducedMotion?: boolean;
  quality?: StageQuality;
}

export default function ModelViewer<P extends object>({
  title,
  Scene3D,
  sceneProps,
  render2D,
  explodable = true,
  defaultExploded = false,
  defaultLabels = true,
  caption,
  mission,
  variant = "inline",
  exploded: explodedProp,
  onExplodedChange,
  controller: controllerProp,
  reducedMotion: reducedMotionProp,
  quality = "high",
}: ModelViewerProps<P>) {
  const webgl = useWebGL();
  const preference = useViewPreference();
  const systemReducedMotion = useMedia(REDUCED_MOTION_QUERY, false);
  const reducedMotion = reducedMotionProp ?? systemReducedMotion;
  const compact = useMedia(COMPACT_QUERY, false);
  const [explodedState, setExplodedState] = useState(defaultExploded);
  const exploded = explodedProp ?? explodedState;
  const setExploded = (update: (v: boolean) => boolean) => {
    const next = update(exploded);
    setExplodedState(next);
    onExplodedChange?.(next);
  };
  const [labels, setLabels] = useState(defaultLabels);
  const [contextLost, setContextLost] = useState(false);
  const [near, setNear] = useState(false);
  const [zoom2d, setZoom2d] = useState(1);
  const ownController = useMemo(() => createController(), []);
  const controller = controllerProp ?? ownController;
  const lab = variant === "lab";
  const stageRef = useRef<HTMLDivElement>(null);

  const can3d = webgl === true && !contextLost;
  // Browsers without IntersectionObserver simply mount the stage straight away.
  const ready = near || typeof IntersectionObserver === "undefined";
  const mode: "3d" | "2d" = can3d && preference !== "2d" ? "3d" : "2d";

  // Mount the 3D stage only once it is close to the screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || near || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (webgl === false) academyEvent("lesson_viewer_fallback", { mission, reason: "no_webgl" });
  }, [webgl, mission]);

  const onContextLost = useCallback(() => {
    setContextLost(true);
    academyEvent("lesson_viewer_fallback", { mission, reason: "context_lost" });
  }, [mission]);

  const chooseMode = (next: "3d" | "2d") => {
    setViewPreference(next);
    academyEvent("lesson_view_mode", { mission, mode: next });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const handled: Record<string, () => void> = mode === "3d"
      ? { ArrowLeft: () => controller.rotate(-15), ArrowRight: () => controller.rotate(15), "+": () => controller.zoom(1.2), "=": () => controller.zoom(1.2), "-": () => controller.zoom(1 / 1.2), "0": () => controller.reset() }
      : { "+": () => setZoom2d((z) => Math.min(2, z + 0.25)), "=": () => setZoom2d((z) => Math.min(2, z + 0.25)), "-": () => setZoom2d((z) => Math.max(1, z - 0.25)), "0": () => setZoom2d(1) };
    const fn = handled[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  const zoomIn = () => (mode === "3d" ? controller.zoom(1.25) : setZoom2d((z) => Math.min(2, z + 0.25)));
  const zoomOut = () => (mode === "3d" ? controller.zoom(1 / 1.25) : setZoom2d((z) => Math.max(1, z - 0.25)));
  const reset = () => {
    if (mode === "3d") controller.reset();
    setZoom2d(1);
  };

  const hintId = `${mission}-viewer-hint`;
  const status =
    webgl === false
      ? "3D graphics are not available on this device, so the 2D drawing is shown."
      : contextLost
        ? "The 3D view stopped (the graphics context was lost), so the 2D drawing is shown."
        : null;

  return (
    <figure className={styles.viewer} data-variant={variant} aria-label={title}>
      <div
        ref={stageRef}
        className={styles.stage}
        data-mode={mode}
        tabIndex={0}
        role="group"
        aria-roledescription="model viewer"
        aria-label={`${title}, ${mode === "3d" ? "3D view" : "2D drawing"}`}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
      >
        {mode === "3d" && ready ? (
          <StageQualityContext.Provider value={quality}>
            <Scene3D {...sceneProps} exploded={exploded} labels={labels} reducedMotion={reducedMotion} compact={compact} controller={controller} onContextLost={onContextLost} />
          </StageQualityContext.Provider>
        ) : (
          <div className={styles.flat} style={{ transform: zoom2d === 1 ? undefined : `scale(${zoom2d})` }}>
            {render2D({ exploded, labels, compact })}
          </div>
        )}
        {mode === "3d" && !ready && <div className={styles.loading}>Preparing the 3D model…</div>}
        <p id={hintId} className={styles.hint}>
          {mode === "3d" ? (compact ? "Drag to rotate · pinch to zoom" : "Drag to rotate · scroll or pinch to zoom · arrow keys rotate, + and − zoom, 0 resets") : compact ? "2D drawing" : "2D drawing · + and − zoom, 0 resets"}
        </p>
      </div>

      <div className={styles.toolbar} role="toolbar" aria-label="View controls" aria-orientation={lab ? "vertical" : undefined}>
        <div className={styles.group}>
          {mode === "3d" && (
            <>
              <button type="button" className={styles.tool} onClick={() => controller.rotate(-30)} aria-label="Rotate left" title="Rotate left">
                <RotateCcw size={18} aria-hidden />
              </button>
              <button type="button" className={styles.tool} onClick={() => controller.rotate(30)} aria-label="Rotate right" title="Rotate right">
                <RotateCw size={18} aria-hidden />
              </button>
            </>
          )}
          <button type="button" className={styles.tool} onClick={zoomOut} aria-label="Zoom out" title="Zoom out">
            <ZoomOut size={18} aria-hidden />
          </button>
          <button type="button" className={styles.tool} onClick={zoomIn} aria-label="Zoom in" title="Zoom in">
            <ZoomIn size={18} aria-hidden />
          </button>
          <button type="button" className={styles.tool} onClick={reset} aria-label="Reset view" title="Reset view">
            <LocateFixed size={18} aria-hidden />
          </button>
        </div>
        <div className={styles.group}>
          {explodable && (
            <button type="button" className={styles.toggle} aria-pressed={exploded} onClick={() => setExploded((v) => !v)}>
              <Layers size={17} aria-hidden />
              <span>Exploded</span>
            </button>
          )}
          <button type="button" className={styles.toggle} aria-pressed={labels} onClick={() => setLabels((v) => !v)}>
            <Tag size={17} aria-hidden />
            <span>Labels</span>
          </button>
        </div>
        {!lab && (
        <div className={styles.segmented} role="group" aria-label="View type">
          <button type="button" aria-pressed={mode === "3d"} disabled={!can3d} onClick={() => chooseMode("3d")} className={styles.segment}>
            <Box size={16} aria-hidden /> 3D
          </button>
          <button type="button" aria-pressed={mode === "2d"} onClick={() => chooseMode("2d")} className={styles.segment}>
            <Square size={16} aria-hidden /> 2D
          </button>
        </div>
        )}
      </div>

      <figcaption className={lab ? styles.captionLab : styles.caption}>
        {status && <span className={styles.status}>{status} </span>}
        {lab ? <span className={styles.srOnly}>{caption}</span> : caption}
      </figcaption>
    </figure>
  );
}
