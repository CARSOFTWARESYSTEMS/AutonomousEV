"use client";
// One showcase row's visual. The server renders the poster (an SVG drawing of
// the same subject), which is also what visitors without WebGL, or with the
// 3D still loading, see. The 3D scene mounts only when the row comes near the
// screen, animates only while it is on screen (and the visitor has not asked
// for reduced motion or paused it), and unmounts when it is far away again,
// so at most a few canvases exist at once. Drag sideways or use Turn to
// rotate; vertical swipes still scroll the page.
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Pause, Play, PlayCircle, RotateCw } from "lucide-react";
import { getWebGLSupport } from "@/components/satellite-explorer/lib/capabilities";
import { Spin, type ShowcaseTopic } from "./spin";
import styles from "./showcase.module.css";

const ShowcaseCanvas = dynamic(() => import("./ShowcaseCanvas"), { ssr: false });

const REDUCED = "(prefers-reduced-motion: reduce)";

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** "low" on software rendering, little memory or few cores. Null on the server, and where WebGL is missing. */
function useStageQuality(): "high" | "low" | null {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const gl = getWebGLSupport();
      if (!gl.supported) return null;
      const nav = navigator as Navigator & { deviceMemory?: number };
      return gl.software || (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2 ? "low" : "high";
    },
    () => null,
  );
}

export default function ShowcaseVisual({
  topic,
  name,
  label,
  caption,
  poster,
  animated = true,
  action,
}: {
  topic: ShowcaseTopic;
  /** Short name of the model, e.g. "CubeSat". */
  name: string;
  /** Text alternative for the picture. */
  label: string;
  caption: ReactNode;
  poster: ReactNode;
  animated?: boolean;
  /** A way straight in from the picture, e.g. the first playable mission. */
  action?: { label: string; href: string; track?: Record<string, string> };
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [spin] = useState(() => new Spin());
  const drag = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);
  const reducedMotion = useMedia(REDUCED);
  const quality = useStageQuality();

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const nearIo = new IntersectionObserver(([e]) => {
      setNear(e.isIntersecting);
      if (!e.isIntersecting) setReady(false);
    }, { rootMargin: "320px 0px" });
    const seenIo = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 });
    nearIo.observe(el);
    seenIo.observe(el);
    return () => {
      nearIo.disconnect();
      seenIo.disconnect();
    };
  }, []);

  const show3d = near && quality !== null;
  const canAnimate = animated && !reducedMotion;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return;
    drag.current = { x: e.clientX, y: e.clientY, horizontal: e.pointerType === "mouse" ? true : null };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    // On touch, decide once: a sideways drag turns the model, an upward or downward one scrolls the page.
    if (d.horizontal === null && Math.hypot(dx, dy) > 8) d.horizontal = Math.abs(dx) > Math.abs(dy);
    if (!d.horizontal) return;
    spin.add(dx * 0.008);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <figure className={styles.visual}>
      <div className={styles.frameWrap}>
      <div
        ref={frameRef}
        className={styles.frame}
        data-ready={ready || undefined}
        role="img"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div className={styles.poster} aria-hidden="true">
          {poster}
        </div>
        {show3d && (
          <div className={styles.canvas} aria-hidden="true">
            <ShowcaseCanvas topic={topic} playing={onScreen && !paused && canAnimate} reducedMotion={reducedMotion} quality={quality} spin={spin} onReady={() => setReady(true)} />
          </div>
        )}
      </div>
      {action && (
        <Link href={action.href} className={styles.visualAction} {...action.track}>
          <PlayCircle size={20} aria-hidden />
          <span>
            {action.label.split(":")[0]}
            {action.label.includes(":") && <span className={styles.actionMore}>:{action.label.split(":").slice(1).join(":")}</span>}
          </span>
        </Link>
      )}
      </div>
      <div className={styles.visualBar}>
        <figcaption className={styles.caption}>{caption}</figcaption>
        {/* Always laid out, shown once the 3D is ready, so its arrival never moves the text below (CLS). */}
        {(
          <div className={styles.visualTools} style={{ visibility: ready ? "visible" : "hidden" }} aria-hidden={!ready || undefined}>
            <button type="button" className={styles.tool} onClick={() => spin.add(Math.PI / 4)} aria-label={`Turn the ${name} model`}>
              <RotateCw size={16} aria-hidden />
              <span>Turn</span>
            </button>
            {canAnimate && (
              <button type="button" className={styles.tool} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
                {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
                <span>{paused ? "Play" : "Pause"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}
