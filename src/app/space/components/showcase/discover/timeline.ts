// The Discover hero's 18-second loop, as one small state machine shared by
// the controls (outside the canvas) and the scene (inside). The scene
// advances time each frame; only a change of stage reaches React.
export const STAGES = [
  { id: "discover", label: "Discover" },
  { id: "explore", label: "Explore" },
  { id: "experiment", label: "Experiment" },
  { id: "mission", label: "Mission" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export const STAGE_SECONDS = 4.5;
export const LOOP_SECONDS = STAGE_SECONDS * STAGES.length;

export class Timeline {
  private t = 0;
  private listener: (index: number) => void = () => {};
  private requestFrame: () => void = () => {};

  get time() {
    return this.t;
  }

  /** Seconds into the current stage. */
  get local() {
    return this.t % STAGE_SECONDS;
  }

  get index() {
    return Math.floor(this.t / STAGE_SECONDS) % STAGES.length;
  }

  onStage(fn: (index: number) => void) {
    this.listener = fn;
  }

  setFrameRequester(fn: () => void) {
    this.requestFrame = fn;
  }

  advance(seconds: number) {
    const before = this.index;
    this.t = (this.t + seconds) % LOOP_SECONDS;
    if (this.index !== before) this.listener(this.index);
  }

  jump(index: number) {
    this.t = index * STAGE_SECONDS + 0.001;
    this.listener(this.index);
    this.requestFrame();
  }
}
