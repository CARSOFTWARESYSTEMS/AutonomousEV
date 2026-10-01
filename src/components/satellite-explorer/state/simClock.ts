// Per-frame simulation clocks. These change every animation frame, so they
// live outside React state: the render loop mutates them and the store only
// mirrors the parts the interface needs, at a throttled rate.
import { INITIAL_MISSION, type MissionMachine } from "../simulation/mission";
import { ORBIT_EVENTS } from "../simulation/orbit";

/** Sunlit, two minutes past the observation target: land, coast and cloud for the opening view. */
export const HERO_ORBIT_TIME_S = 120;

export interface OrbitSeek {
  from: number;
  to: number;
  /** performance.now() / 1000 when the seek began. */
  startedAt: number;
  durationS: number;
}

export const simClock = {
  mission: INITIAL_MISSION as MissionMachine,
  orbitTimeS: HERO_ORBIT_TIME_S,
  seek: null as OrbitSeek | null,
};

export const nowS = () => performance.now() / 1000;

/** Glide the orbit clock to a new time instead of jumping. */
export function seekOrbit(toS: number, durationS = 1.6) {
  if (Math.abs(simClock.orbitTimeS - toS) < 0.5) {
    simClock.seek = null;
    return;
  }
  simClock.seek = { from: simClock.orbitTimeS, to: toS, startedAt: nowS(), durationS };
}

export function resetSimClock() {
  simClock.mission = INITIAL_MISSION;
  simClock.orbitTimeS = HERO_ORBIT_TIME_S;
  simClock.seek = null;
}

const { pass, eclipseExitS, eclipseEntryS } = ORBIT_EVENTS;

/** Named orbit times the interface can jump to. */
export const ORBIT_BOOKMARKS = {
  hero: HERO_ORBIT_TIME_S,
  sunlight: (eclipseExitS + eclipseEntryS) / 2 - 500,
  eclipse: eclipseEntryS + 420,
  eclipseEntry: eclipseEntryS - 90,
  sunrise: eclipseExitS - 90,
  target: -28,
  passStart: pass.aosS - 40,
  passMid: pass.closestApproachS - 70,
} as const;
