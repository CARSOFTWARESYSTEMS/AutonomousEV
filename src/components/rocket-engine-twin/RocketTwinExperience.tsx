"use client";
// The top of the page. Decides which experience this device gets and mounts
// only that one: the three.js application is a separate chunk, requested
// solely on a desktop-sized viewport with working WebGL. Phones, and desktops
// without WebGL, get the lightweight schematic and console instead.
//
// The hero (the page's H1 and its calls to action) is rendered on the server
// and shared by both, so the page says what it is before any of this runs.
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { DESKTOP_MIN_WIDTH, DESKTOP_QUERY, type Experience, getWebGLSupport, resolveExperience } from "../satellite-explorer/lib/capabilities";
import { POSTER, PRODUCT } from "./data/engineReference";
import { DESKTOP_NOTE } from "./data/twinContent";
import HeroActions from "./HeroActions";
import LargerScreenNote from "./LargerScreenNote";
import { useRocketTwinStore } from "./state/twinStore";
import TwinConsole from "./TwinConsole";
import TwinStage from "./TwinStage";
import styles from "./rocketTwin.module.css";

const DesktopTwin = dynamic(() => import("./DesktopTwin"), { ssr: false });

function subscribe(notify: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}

function getSnapshot(): Experience {
  // WebGL is only probed on a desktop-sized viewport, so phones never create a context.
  const wide = window.matchMedia(DESKTOP_QUERY).matches;
  return resolveExperience({ width: wide ? DESKTOP_MIN_WIDTH : 0, webgl: wide && getWebGLSupport().supported });
}

/** The server cannot know the viewport, so it renders both layouts, gated by the stylesheet. */
const getServerSnapshot = (): Experience | "pending" => "pending";

export default function RocketTwinExperience() {
  const experience = useSyncExternalStore<Experience | "pending">(subscribe, getSnapshot, getServerSnapshot);
  const entered = useRocketTwinStore((s) => s.entered);
  const desktop = experience === "desktop";

  return (
    <div className={styles.experience} data-experience={experience} data-entered={entered || undefined}>
      {desktop && <DesktopTwin />}

      <section className={styles.hero} aria-labelledby="rocket-twin-title">
        {/* A still of the 3D engine, for the experiences that do not run it. Until the viewport is known it is
            also in the desktop HTML, hidden: there the smallest candidate is requested instead of the full poster. */}
        <div className={styles.poster}>
          <Image src={POSTER.src} alt={POSTER.alt} width={POSTER.width} height={POSTER.height} sizes={experience === "fallback" ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 1px, 100vw"} loading="eager" fetchPriority="high" />
        </div>
        <p className={styles.brandLine} aria-hidden="true">
          EV.ENGINEER™
        </p>
        <h1 id="rocket-twin-title" className={styles.title}>
          {PRODUCT.name}
        </h1>
        <p className={styles.tagline}>{PRODUCT.tagline}</p>
        <p className={styles.platform}>{PRODUCT.platform}</p>
        <p className={styles.description}>{PRODUCT.description}</p>
        <HeroActions immersive={desktop} />
        <p className={styles.desktopNote}>{DESKTOP_NOTE}</p>
        <LargerScreenNote />
      </section>

      {/* The lightweight experience keeps its place in the tree from the server render onward. */}
      {!desktop && (
        <div className={styles.light}>
          <TwinStage />
          <TwinConsole />
        </div>
      )}
    </div>
  );
}
