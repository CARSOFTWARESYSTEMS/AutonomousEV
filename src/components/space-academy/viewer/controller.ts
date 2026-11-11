// A tiny command channel from the viewer's toolbar (outside the canvas) to
// the camera (inside it). The 3D stage registers handlers when it mounts.
export interface ViewerHandlers {
  zoom: (factor: number) => void;
  rotate: (degrees: number) => void;
  reset: () => void;
  /**
   * Guided camera: glide to look at a point from a distance, optionally from a
   * direction (otherwise the current one). Jumps when motion is reduced.
   */
  focus: (target: [number, number, number], distance?: number, direction?: [number, number, number]) => void;
}

export interface ViewerController extends ViewerHandlers {
  register: (handlers: ViewerHandlers) => () => void;
}

export function createController(): ViewerController {
  let current: ViewerHandlers | null = null;
  return {
    register(handlers) {
      current = handlers;
      return () => {
        if (current === handlers) current = null;
      };
    },
    zoom: (factor) => current?.zoom(factor),
    rotate: (degrees) => current?.rotate(degrees),
    reset: () => current?.reset(),
    focus: (target, distance, direction) => current?.focus(target, distance, direction),
  };
}

/** Rendering quality the stage resolves to: pixel ratio is the main cost on phones. */
export type StageQuality = "high" | "low";

/** What every mission scene receives from the viewer. */
export interface SceneState {
  exploded: boolean;
  labels: boolean;
  reducedMotion: boolean;
  /** Narrow viewport: fewer labels, lower pixel ratio. */
  compact: boolean;
  controller: ViewerController;
  onContextLost: () => void;
}

/** What the 2D fallback receives. */
export interface Scene2DState {
  exploded: boolean;
  labels: boolean;
  compact: boolean;
}
