// Simulated vibration signal for one propulsion unit, in the three views an
// engineer would use: the waveform, its spectrum, and the spectrum normalised
// by shaft speed (order domain). The signal is synthesised from its physical
// contributors, then really transformed, so the three views agree.
// SIMULATED SIGNAL — not measured data.
import { clamp01, mulberry32 } from "../lib/math";
import { BEARING_ORDER, BEARING_SHAPE, BEARING_SHAPE_RMS, baselineVibration, faultAmplitude } from "./faultModels";

/** Blade-pass order of a tilt unit: its five blades. */
export const BLADE_PASS_ORDER = 5;
/** A structural resonance the bearing impacts excite, Hz. */
const RESONANCE_HZ = 172;

/** RMS of the healthy contributors in `sample` at unit level: four tones and uniform noise. */
const HEALTHY_RMS = Math.sqrt((0.62 ** 2 + 0.26 ** 2 + 0.46 ** 2 + 0.12 ** 2) / 2 + 0.42 ** 2 / 3);

const SAMPLE_RATE = 1024;
const SAMPLES = 1024;
/** Revolutions covered by the order-domain record. */
const REVOLUTIONS = 16;

export interface SignalInputs {
  rpm: number;
  load: number;
  /** Bearing fault severity, 0–1. */
  severity: number;
  /** Changes the noise realisation; the same seed always gives the same signal. */
  seed?: number;
}

export interface Series {
  x: number[];
  y: number[];
}

export interface SignalMarker {
  x: number;
  label: string;
  /** The marker belongs to the fault feature, as opposed to a normal line. */
  fault: boolean;
}

export interface VibrationSignal {
  /** Acceleration against time in seconds. */
  time: Series;
  /** Amplitude against frequency in Hz. */
  frequency: Series;
  /** Amplitude against shaft order. */
  order: Series;
  shaftHz: number;
  rms: number;
  frequencyMarkers: SignalMarker[];
  orderMarkers: SignalMarker[];
}

/** In-place radix-2 FFT. */
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const step = (-2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const c = Math.cos(step * k);
        const s = Math.sin(step * k);
        const a = start + k;
        const b = a + half;
        const tr = re[b] * c - im[b] * s;
        const ti = re[b] * s + im[b] * c;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
      }
    }
  }
}

/** Single-sided amplitude spectrum with a Hann window (amplitude-corrected). */
function amplitudeSpectrum(samples: Float64Array): Float64Array {
  const n = samples.length;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = samples[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
  fft(re, im);
  const out = new Float64Array(n / 2);
  // Hann halves the coherent amplitude; single-sided doubles it: together ×4/n.
  for (let i = 0; i < n / 2; i++) out[i] = (Math.hypot(re[i], im[i]) * 4) / n;
  return out;
}

/**
 * Acceleration as a function of shaft angle (in revolutions) and time.
 * Healthy contributors: residual imbalance at shaft speed, blade pass, a
 * little electrical ripple and broadband noise. The bearing adds a tone at its
 * defect frequency and, at each ball pass, a short ring of the structure,
 * scaled so the total level follows the fault model. `level` is the healthy RMS.
 */
function sample(revolutions: number, timeS: number, level: number, severity: number, noise: number): number {
  const turn = 2 * Math.PI * revolutions;
  const healthy =
    0.62 * Math.sin(turn) + 0.26 * Math.sin(2 * turn + 0.7) + 0.46 * Math.sin(BLADE_PASS_ORDER * turn + 1.3) + 0.12 * Math.sin(2 * BLADE_PASS_ORDER * turn + 0.4) + 0.42 * noise;
  if (severity <= 0) return (level * healthy) / HEALTHY_RMS;

  const defect = BEARING_ORDER * revolutions;
  const sincePass = defect - Math.floor(defect);
  // Decaying ring after each ball pass, expressed in the angle domain so it tracks speed.
  const ring = Math.exp(-sincePass * BEARING_SHAPE.ringDecay) * Math.sin(2 * Math.PI * RESONANCE_HZ * timeS);
  const tone = Math.sin(2 * Math.PI * defect) + BEARING_SHAPE.secondHarmonic * Math.sin(4 * Math.PI * defect + 0.9);
  const bearing = (faultAmplitude(severity) * (tone + BEARING_SHAPE.ring * ring)) / BEARING_SHAPE_RMS;
  return level * (healthy / HEALTHY_RMS + bearing);
}

export function vibrationSignal({ rpm, load, severity, seed = 1 }: SignalInputs): VibrationSignal {
  const shaftHz = Math.max(0, rpm) / 60;
  const running = shaftHz > 0.5;
  const sev = clamp01(severity);
  // The healthy waveform's RMS is the baseline vibration level.
  const level = running ? baselineVibration(rpm, load) : 0.02;
  const random = mulberry32(seed);

  // Time record: one second at 1024 Hz.
  const inTime = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    inTime[i] = sample(t * shaftHz, t, level, running ? sev : 0, random() * 2 - 1);
  }
  let sumSquares = 0;
  for (let i = 0; i < SAMPLES; i++) sumSquares += inTime[i] * inTime[i];

  // Angle record: the same signal sampled evenly in shaft angle, so its spectrum is in orders.
  const inAngle = new Float64Array(SAMPLES);
  const angleRandom = mulberry32(seed + 17);
  for (let i = 0; i < SAMPLES; i++) {
    const revolutions = (i / SAMPLES) * REVOLUTIONS;
    inAngle[i] = sample(revolutions, shaftHz > 0 ? revolutions / shaftHz : 0, level, running ? sev : 0, angleRandom() * 2 - 1);
  }

  const spectrum = amplitudeSpectrum(inTime);
  const orders = amplitudeSpectrum(inAngle);

  const shownTime = 320;
  const maxHz = 256;
  const maxOrder = 12;
  const orderBins = Math.round(maxOrder * REVOLUTIONS);
  const bearingHz = BEARING_ORDER * shaftHz;

  return {
    time: { x: Array.from({ length: shownTime }, (_, i) => i / SAMPLE_RATE), y: Array.from(inTime.subarray(0, shownTime)) },
    frequency: { x: Array.from({ length: maxHz }, (_, i) => i), y: Array.from(spectrum.subarray(0, maxHz)) },
    order: { x: Array.from({ length: orderBins }, (_, i) => i / REVOLUTIONS), y: Array.from(orders.subarray(0, orderBins)) },
    shaftHz,
    rms: Math.sqrt(sumSquares / SAMPLES),
    frequencyMarkers: running
      ? [
          { x: shaftHz, label: "1× shaft", fault: false },
          { x: BLADE_PASS_ORDER * shaftHz, label: "Blade pass", fault: false },
          { x: bearingHz, label: "Bearing", fault: true },
        ]
      : [],
    orderMarkers: running
      ? [
          { x: 1, label: "1×", fault: false },
          { x: BLADE_PASS_ORDER, label: `${BLADE_PASS_ORDER}× blade pass`, fault: false },
          { x: BEARING_ORDER, label: `${BEARING_ORDER}× bearing`, fault: true },
        ]
      : [],
  };
}

/** Amplitude of the spectrum nearest to `x`, taking the peak of the neighbouring bins. */
export function amplitudeNear(series: Series, x: number): number {
  let best = 0;
  let nearest = 0;
  let distance = Infinity;
  series.x.forEach((value, i) => {
    const d = Math.abs(value - x);
    if (d < distance) {
      distance = d;
      nearest = i;
    }
  });
  for (let i = Math.max(0, nearest - 1); i <= Math.min(series.y.length - 1, nearest + 1); i++) best = Math.max(best, series.y[i]);
  return best;
}
