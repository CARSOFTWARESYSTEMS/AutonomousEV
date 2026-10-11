// The learned models, small enough to train in the browser from simulated
// data: principal component analysis for anomaly detection, and multinomial
// logistic regression for fault classification. Plain arrays, no library.
import type { Rng } from "./channels";

// ── Principal component analysis ────────────────────────────────────────────

export interface PcaModel {
  mean: number[];
  std: number[];
  /** Principal directions, one row each, in standardised feature space. */
  components: number[][];
  /** Share of the training variance each component explains. */
  explained: number[];
  /** Reconstruction error exceeded by one training sample in a hundred. */
  threshold: number;
}

/** Eigen-decomposition of a symmetric matrix by Jacobi rotations. Returns eigenvalues and eigenvectors (as rows), largest first. */
export function symmetricEigen(matrix: number[][]): { values: number[]; vectors: number[][] } {
  const n = matrix.length;
  const a = matrix.map((row) => [...row]);
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
    if (off < 1e-18) break;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[j][j] - a[i][i]);
  return { values: order.map((i) => a[i][i]), vectors: order.map((i) => v.map((row) => row[i])) };
}

function standardise(x: ArrayLike<number>, mean: readonly number[], std: readonly number[]): number[] {
  return Array.from(x, (value, j) => (value - mean[j]) / std[j]);
}

/** Squared reconstruction error of one sample: what is left after projecting onto the learned components. */
export function reconstructionError(model: PcaModel, x: ArrayLike<number>): number {
  const z = standardise(x, model.mean, model.std);
  let kept = 0;
  for (const component of model.components) {
    let score = 0;
    for (let j = 0; j < z.length; j++) score += component[j] * z[j];
    kept += score * score;
  }
  let total = 0;
  for (const value of z) total += value * value;
  return Math.max(0, total - kept);
}

/** Fits `count` principal components to the rows of `data`. */
export function trainPca(data: readonly (readonly number[])[], count: number): PcaModel {
  const n = data.length;
  const d = data[0].length;
  const mean = Array.from({ length: d }, (_, j) => data.reduce((sum, row) => sum + row[j], 0) / n);
  const std = Array.from({ length: d }, (_, j) => Math.max(1e-6, Math.sqrt(data.reduce((sum, row) => sum + (row[j] - mean[j]) ** 2, 0) / (n - 1))));
  const z = data.map((row) => standardise(row, mean, std));
  const covariance = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => z.reduce((sum, row) => sum + row[i] * row[j], 0) / (n - 1)));
  const { values, vectors } = symmetricEigen(covariance);
  const totalVariance = values.reduce((a, b) => a + Math.max(0, b), 0);
  const model: PcaModel = { mean, std, components: vectors.slice(0, count), explained: values.slice(0, count).map((v) => Math.max(0, v) / totalVariance), threshold: 1 };
  const errors = data.map((row) => reconstructionError(model, row)).sort((p, q) => p - q);
  model.threshold = Math.max(1e-6, errors[Math.min(n - 1, Math.floor(0.99 * n))]);
  return model;
}

// ── Multinomial logistic regression ─────────────────────────────────────────

export interface SoftmaxModel {
  /** One row of weights per class; the last weight of each row is the bias. */
  weights: number[][];
}

export function predictProbabilities(model: SoftmaxModel, x: readonly number[]): number[] {
  const logits = model.weights.map((w) => {
    let sum = w[x.length];
    for (let j = 0; j < x.length; j++) sum += w[j] * x[j];
    return sum;
  });
  const top = Math.max(...logits);
  const e = logits.map((l) => Math.exp(l - top));
  const total = e.reduce((a, b) => a + b, 0);
  return e.map((value) => value / total);
}

export const argmax = (values: readonly number[]) => values.reduce((best, value, i) => (value > values[best] ? i : best), 0);

/** Fits the classifier by mini-batch gradient descent with weight decay. Repeatable for a given generator. */
export function trainSoftmax(x: readonly (readonly number[])[], y: readonly number[], classes: number, rng: Rng, options: { epochs?: number; rate?: number; decay?: number; batch?: number } = {}): SoftmaxModel {
  const { epochs = 60, rate = 0.5, decay = 1e-4, batch = 32 } = options;
  const d = x[0].length;
  const model: SoftmaxModel = { weights: Array.from({ length: classes }, () => new Array<number>(d + 1).fill(0)) };
  const order = x.map((_, i) => i);
  const gradient = Array.from({ length: classes }, () => new Array<number>(d + 1).fill(0));
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const step = rate / (1 + 0.05 * epoch);
    for (let start = 0; start < order.length; start += batch) {
      const end = Math.min(order.length, start + batch);
      for (const row of gradient) row.fill(0);
      for (let k = start; k < end; k++) {
        const sample = x[order[k]];
        const p = predictProbabilities(model, sample);
        for (let c = 0; c < classes; c++) {
          const error = p[c] - (y[order[k]] === c ? 1 : 0);
          const g = gradient[c];
          for (let j = 0; j < d; j++) g[j] += error * sample[j];
          g[d] += error;
        }
      }
      const scale = step / (end - start);
      for (let c = 0; c < classes; c++) {
        const w = model.weights[c];
        const g = gradient[c];
        for (let j = 0; j < d; j++) w[j] -= scale * g[j] + step * decay * w[j];
        w[d] -= scale * g[d];
      }
    }
  }
  return model;
}

/** Rows are the true class, columns the predicted class. */
export function confusionMatrix(model: SoftmaxModel, x: readonly (readonly number[])[], y: readonly number[], classes: number): number[][] {
  const matrix = Array.from({ length: classes }, () => new Array<number>(classes).fill(0));
  x.forEach((sample, i) => {
    matrix[y[i]][argmax(predictProbabilities(model, sample))] += 1;
  });
  return matrix;
}

export function accuracy(matrix: readonly (readonly number[])[]): number {
  let correct = 0;
  let total = 0;
  matrix.forEach((row, i) =>
    row.forEach((count, j) => {
      total += count;
      if (i === j) correct += count;
    }),
  );
  return total ? correct / total : 0;
}
