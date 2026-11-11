// The homepage preview's four stages and the clock that steps through them.
// No three.js and no engine imports: this module ships with the page, while
// the scene that acts on it loads only when the card nears the screen.

export const STAGES = [
  {
    id: "discover",
    number: "01",
    label: "Discover",
    seconds: 6,
    line: "The UFlight™ Reference eVTOL: one pilot and five passengers, a high wing and eight electric propulsion units.",
  },
  {
    id: "systems",
    number: "02",
    label: "Systems",
    seconds: 7,
    line: "Through the skin, one system at a time: propulsion, battery and energy, avionics, flight controls.",
  },
  {
    id: "health",
    number: "03",
    label: "Health",
    seconds: 7,
    line: "Simulated vibration at motor 04’s front bearing leaves its expected range, and an anomaly is flagged.",
  },
  {
    id: "twin",
    number: "04",
    label: "Digital Twin",
    seconds: 7,
    line: "The observation is compared with the healthy reference model, giving an illustrative maintenance advisory.",
  },
] as const;

export type PreviewStageId = (typeof STAGES)[number]["id"];

export const STAGE_STARTS: readonly number[] = STAGES.reduce<number[]>((starts, s, i) => [...starts, i === 0 ? 0 : starts[i - 1] + STAGES[i - 1].seconds], []);
export const LOOP_SECONDS = STAGES.reduce((sum, s) => sum + s.seconds, 0);

/**
 * auto: the stages run in order and loop back to Discover.
 * stage: the chosen stage plays through, then holds (manual selection overrides the sequence).
 * paused: nothing advances (the visitor paused, or took the camera).
 */
export type PlayState = "auto" | "stage" | "paused";

export function stageAt(t: number): number {
  let i = 0;
  for (let k = 0; k < STAGES.length; k++) if (t >= STAGE_STARTS[k]) i = k;
  return i;
}

export class StageClock {
  private t = 0;
  private playState: PlayState = "auto";
  private jumps = 0;
  private listener: (stage: number) => void = () => {};
  private requestFrame: () => void = () => {};

  /** Seconds into the loop. */
  get time() {
    return this.t;
  }

  get stage() {
    return stageAt(this.t);
  }

  /** Seconds into the current stage. */
  get local() {
    return this.t - STAGE_STARTS[this.stage];
  }

  get play() {
    return this.playState;
  }

  /** Changes on every jump, so the scene re-applies a stage even when it is the same one. */
  get generation() {
    return this.jumps;
  }

  onStage(fn: (stage: number) => void) {
    this.listener = fn;
  }

  setFrameRequester(fn: () => void) {
    this.requestFrame = fn;
  }

  setPlay(play: PlayState) {
    this.playState = play;
  }

  advance(seconds: number) {
    if (this.playState === "paused" || seconds <= 0) return;
    const before = this.stage;
    if (this.playState === "auto") {
      this.t = (this.t + seconds) % LOOP_SECONDS;
    } else {
      // Play the chosen stage to its end, then hold there.
      const end = STAGE_STARTS[before] + STAGES[before].seconds - 0.001;
      this.t = Math.min(this.t + seconds, end);
    }
    if (this.stage !== before) this.listener(this.stage);
  }

  jump(stage: number, play: PlayState) {
    this.t = STAGE_STARTS[stage];
    this.playState = play;
    this.jumps += 1;
    this.listener(stage);
    this.requestFrame();
  }
}
