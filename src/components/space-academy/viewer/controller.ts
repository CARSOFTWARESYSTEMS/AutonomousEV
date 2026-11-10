// A tiny command channel from the viewer's toolbar (outside the canvas) to
// the camera (inside it). The 3D stage registers handlers when it mounts.
export interface ViewerHandlers {
  zoom: (factor: number) => void;
  rotate: (degrees: number) => void;
  reset: () => void;
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
  };
}

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
