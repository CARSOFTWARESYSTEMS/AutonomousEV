// The intro's own clock, outside React: the camera director reads it every frame.
export const introClock = {
  /** Seconds into the current scene. */
  elapsed: 0,
  /** 0–1 through the current scene. */
  progress: 0,
  /** Simulation speed while the intro runs, set per scene. */
  speed: 1,
};
