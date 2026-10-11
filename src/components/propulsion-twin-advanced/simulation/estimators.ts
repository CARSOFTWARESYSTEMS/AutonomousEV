// State estimation, worked on one state: chamber pressure. The same simulated
// throttle step is estimated five ways (moving average, Kalman, extended
// Kalman, unscented Kalman and particle filter) so their behaviour can be
// compared against a truth that only a simulation can show.
import { createRng } from "./channels";
import { DESIGN, type PlantParams, chamberTarget, scheduleSpeed, solveFlows } from "./plant";

export type EstimatorId = "kalman" | "ekf" | "ukf" | "particle";

export interface EstimatorDemoOptions {
  estimator: EstimatorId;
  /** Sensor noise, one standard deviation, in % of reference chamber pressure. */
  noise: number;
  /** Occasional large spikes on the sensor: noise that is not Gaussian. */
  spikes: boolean;
  /** The model's combustion efficiency is a few percent off the system's. */
  mismatch: boolean;
  seed?: number;
}

export interface EstimatorDemoResult {
  t: number[];
  /** Known only because this is a simulation. */
  truth: number[];
  raw: number[];
  /** Moving average of the raw signal: signal processing with no model. */
  filtered: number[];
  /** The model run open loop from the commands alone. */
  physics: number[];
  estimate: number[];
  /** One standard deviation of the estimate. */
  sigma: number[];
  rmse: { raw: number; filtered: number; physics: number; estimate: number };
}

const DT = 0.05;
const STEPS = 400;
/** Chamber response is slowed here so the transient is easy to see. */
const TAU = 0.35;
const WINDOW = 15;
const PROCESS_SIGMA = 0.12;
const SPIKE_RATE = 0.04;
const SPIKE_SCALE = 8;
const PARTICLES = 300;

/** Throttle command over the scenario: steady, a step down, and back. */
const throttleAt = (t: number) => (t < 5 ? 1 : t < 11 ? 0.8 : 1);

/** One step of the chamber: pressure moves toward what the flows at this speed would sustain. Nonlinear in pressure through the flow equation. */
function advance(p: PlantParams, pc: number, speed: number): number {
  return pc + (DT / TAU) * (chamberTarget(p, solveFlows(p, speed, pc), true) - pc);
}

const rmse = (a: readonly number[], b: readonly number[]) => Math.sqrt(a.reduce((sum, value, i) => sum + (value - b[i]) ** 2, 0) / a.length);

export function runEstimatorDemo(options: EstimatorDemoOptions): EstimatorDemoResult {
  const rng = createRng(options.seed ?? 20261011);
  const truthParams: PlantParams = { ...DESIGN };
  const modelParams: PlantParams = options.mismatch ? { ...DESIGN, etaC: 1.03 } : { ...DESIGN };
  const r = options.noise;
  const q = PROCESS_SIGMA;
  const result: EstimatorDemoResult = { t: [], truth: [], raw: [], filtered: [], physics: [], estimate: [], sigma: [], rmse: { raw: 0, filtered: 0, physics: 0, estimate: 0 } };

  let speed = scheduleSpeed(1);
  let truth = 100;
  let physics = advanceToSteady(modelParams, speed);
  let x = physics;
  let variance = r * r;
  const particles = Array.from({ length: PARTICLES }, () => x + r * rng.gauss());
  const weights = new Array<number>(PARTICLES).fill(1 / PARTICLES);
  const window: number[] = [];
  // A model that is known to be off gets more process noise, so the filter leans on the sensor.
  const qFilter = options.mismatch ? q * 4 : q;
  const likelihood = (innovation: number) => {
    const core = Math.exp(-0.5 * (innovation / r) ** 2) / r;
    if (!options.spikes) return core;
    const wide = r * SPIKE_SCALE;
    return (1 - SPIKE_RATE) * core + (SPIKE_RATE * Math.exp(-0.5 * (innovation / wide) ** 2)) / wide;
  };

  for (let k = 0; k < STEPS; k++) {
    const t = k * DT;
    speed += ((scheduleSpeed(throttleAt(t)) - speed) * DT) / DESIGN.tauN;
    truth = advance(truthParams, truth, speed) + q * rng.gauss();
    const spike = options.spikes && rng.next() < SPIKE_RATE;
    const z = truth + r * (spike ? SPIKE_SCALE : 1) * rng.gauss();
    const previousPhysics = physics;
    physics = advance(modelParams, physics, speed);

    window.push(z);
    if (window.length > WINDOW) window.shift();
    const filtered = window.reduce((a, b) => a + b, 0) / window.length;

    if (options.estimator === "particle") {
      let total = 0;
      for (let i = 0; i < PARTICLES; i++) {
        particles[i] = advance(modelParams, particles[i], speed) + qFilter * rng.gauss();
        weights[i] *= likelihood(z - particles[i]);
        total += weights[i];
      }
      if (total < 1e-300) {
        weights.fill(1 / PARTICLES);
        total = 1;
      }
      let mean = 0;
      let effective = 0;
      for (let i = 0; i < PARTICLES; i++) {
        weights[i] /= total;
        mean += weights[i] * particles[i];
        effective += weights[i] * weights[i];
      }
      let spread = 0;
      for (let i = 0; i < PARTICLES; i++) spread += weights[i] * (particles[i] - mean) ** 2;
      x = mean;
      variance = spread;
      // Systematic resampling, once the weights have concentrated on too few particles.
      if (1 / effective < PARTICLES / 2) {
        const drawn: number[] = [];
        const start = rng.next() / PARTICLES;
        let cumulative = weights[0];
        let i = 0;
        for (let m = 0; m < PARTICLES; m++) {
          const u = start + m / PARTICLES;
          while (u > cumulative && i < PARTICLES - 1) cumulative += weights[++i];
          drawn.push(particles[i]);
        }
        for (let m = 0; m < PARTICLES; m++) particles[m] = drawn[m];
        weights.fill(1 / PARTICLES);
      }
    } else {
      // Predict.
      if (options.estimator === "kalman") {
        // Linear: the state moves by however much the open-loop model moved.
        x += physics - previousPhysics;
        variance += qFilter * qFilter;
      } else if (options.estimator === "ekf") {
        // The model is linearised about the current estimate.
        const h = 0.05;
        const slope = (advance(modelParams, x + h, speed) - advance(modelParams, x - h, speed)) / (2 * h);
        x = advance(modelParams, x, speed);
        variance = slope * variance * slope + qFilter * qFilter;
      } else {
        // Unscented: three sigma points go through the nonlinear model itself.
        const kappa = 2;
        const reach = Math.sqrt((1 + kappa) * variance);
        const points = [x, x + reach, x - reach].map((point) => advance(modelParams, point, speed));
        const w = [kappa / (1 + kappa), 0.5 / (1 + kappa), 0.5 / (1 + kappa)];
        const mean = points.reduce((sum, point, i) => sum + w[i] * point, 0);
        variance = points.reduce((sum, point, i) => sum + w[i] * (point - mean) ** 2, 0) + qFilter * qFilter;
        x = mean;
      }
      // Update: the measurement is the state itself plus noise.
      const gain = variance / (variance + r * r);
      x += gain * (z - x);
      variance *= 1 - gain;
    }

    result.t.push(t);
    result.truth.push(truth);
    result.raw.push(z);
    result.filtered.push(filtered);
    result.physics.push(physics);
    result.estimate.push(x);
    result.sigma.push(Math.sqrt(Math.max(0, variance)));
  }

  result.rmse = { raw: rmse(result.raw, result.truth), filtered: rmse(result.filtered, result.truth), physics: rmse(result.physics, result.truth), estimate: rmse(result.estimate, result.truth) };
  return result;
}

function advanceToSteady(p: PlantParams, speed: number): number {
  let pc = 100;
  for (let i = 0; i < 200; i++) pc = advance(p, pc, speed);
  return pc;
}
