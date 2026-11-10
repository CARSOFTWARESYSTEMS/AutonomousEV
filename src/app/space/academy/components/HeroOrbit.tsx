"use client";
// The Academy hero's interactive map: the seven tracks orbit a central
// panel. Hovering or focusing a track previews it; each is a real link.
// Positions are computed once and rounded, so server and browser agree
// to the digit (engines differ in the last digits of Math.cos).
import { useState } from "react";
import Link from "next/link";
import { TRACKS } from "../data/curriculum";
import TrackIcon from "./TrackIcon";
import styles from "../academy.module.css";

const R = 41; // % of the square, from its centre
const POINTS = TRACKS.map((t, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / TRACKS.length;
  return { slug: t.slug, left: Math.round((50 + R * Math.cos(a)) * 10) / 10, top: Math.round((50 + R * Math.sin(a)) * 10) / 10 };
});

export default function HeroOrbit() {
  const [active, setActive] = useState(0);
  const track = TRACKS[active];
  return (
    <div className={styles.orbit}>
      <div className={styles.orbitRing} aria-hidden="true" />
      <div className={styles.orbitRingInner} aria-hidden="true" />
      <div className={styles.orbitCentre} aria-live="polite">
        <span className={styles.orbitKicker}>Track {active + 1} of 7</span>
        <span className={styles.orbitTitle}>{track.title}</span>
        <span className={styles.orbitTagline}>{track.tagline}</span>
      </div>
      <ul className={styles.orbitNodes} aria-label="The seven learning tracks">
        {TRACKS.map((t, i) => (
          <li key={t.slug} style={{ left: `${POINTS[i].left}%`, top: `${POINTS[i].top}%`, ["--node" as string]: t.color }}>
            <Link
              href={`/space/academy/${t.slug}`}
              className={styles.orbitNode}
              data-active={i === active || undefined}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              data-track-event="academy_track_open"
              data-track-track={t.slug}
              data-track-placement="hero_orbit"
            >
              <TrackIcon name={t.icon} size={20} />
              <span className={styles.orbitNodeLabel}>{t.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
