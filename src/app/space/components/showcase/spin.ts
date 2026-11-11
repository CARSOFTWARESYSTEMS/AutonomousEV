// A tiny bridge between a showcase visual's buttons and drag (outside the
// canvas) and its model's rotation (inside). Mutation lives behind methods,
// so React state is never mutated during render.
export class Spin {
  /** Extra yaw the learner added by dragging or with the Turn button, radians. */
  private yaw = 0;
  private resets = 0;
  private requestFrame: () => void = () => {};

  /** Increments on every reset, so the turntable can clear its drift too. */
  get epoch() {
    return this.resets;
  }

  reset() {
    this.yaw = 0;
    this.resets += 1;
    this.requestFrame();
  }

  get target() {
    return this.yaw;
  }

  add(radians: number) {
    this.yaw += radians;
    this.requestFrame();
  }

  setFrameRequester(fn: () => void) {
    this.requestFrame = fn;
  }
}

export type ShowcaseTopic = "earth" | "cubesat" | "rocket" | "eps" | "station" | "engine" | "propulsion" | "discover" | "engineer" | "venture" | "academy";
