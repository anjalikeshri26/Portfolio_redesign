/** Small, deterministic ML primitives behind the Intelligence chapter. Everything displayed is computed from these. */
export const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = (r: () => number) => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) * 1.41; };

/* ---- 1. Feed-forward network ---- */
export const LAYERS = [4, 6, 6, 3];
export const WEIGHT_COUNT = LAYERS.slice(1).reduce((a, n, i) => a + n * LAYERS[i], 0);
export function makeNetwork() {
  const r = mulberry32(7);
  const pos = LAYERS.map((n, l) => Array.from({ length: n }, (_, i) => [(l - 1.5) * 2.5, (i - (n - 1) / 2) * 0.85, Math.sin(i * 2.1 + l * 1.3) * 0.9] as [number, number, number]));
  const W = LAYERS.slice(1).map((n, l) => Array.from({ length: n }, () => Array.from({ length: LAYERS[l] }, () => (r() - 0.5) * 2.2)));
  const edges: [number, number, number, number][] = []; // layer, from, to index pairs flattened below
  for (let l = 0; l < LAYERS.length - 1; l++) for (let a = 0; a < LAYERS[l]; a++) for (let b = 0; b < LAYERS[l + 1]; b++) edges.push([l, a, b, 0]);
  return { pos, W, edges };
}
/** One forward pass with tanh activations; returns every layer's activations. */
export function forward(W: number[][][], input: number[]) {
  const acts = [input];
  for (const layer of W) { const prev = acts[acts.length - 1]; acts.push(layer.map((row) => Math.tanh(row.reduce((s, w, i) => s + w * prev[i], 0)))); }
  return acts;
}

/* ---- 2. k-means on generated points ---- */
export const N_POINTS = 480, K = 3, K_ITERS = 8;
const CENTERS: [number, number, number][] = [[-1.9, 0.8, 0.3], [1.7, 0.4, -0.6], [0.1, -1.5, 0.9]];
export function makePoints() {
  const r = mulberry32(21), p = new Float32Array(N_POINTS * 3);
  for (let i = 0; i < N_POINTS; i++) { const c = CENTERS[i % K]; for (let j = 0; j < 3; j++) p[i * 3 + j] = c[j] + gauss(r) * 0.62; }
  return p;
}
export function kmeans(p: Float32Array) {
  // Deliberately poor start: the three initial centroids are all drawn from the same blob, so convergence takes real iterations.
  let cent = [0, 3, 6].map((i) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]]);
  const steps: { cent: number[][]; assign: Uint8Array; inertia: number }[] = [];
  for (let it = 0; it < K_ITERS; it++) {
    const assign = new Uint8Array(N_POINTS); let inertia = 0;
    for (let i = 0; i < N_POINTS; i++) {
      let best = 0, bd = Infinity;
      for (let k = 0; k < K; k++) { const d = (p[i * 3] - cent[k][0]) ** 2 + (p[i * 3 + 1] - cent[k][1]) ** 2 + (p[i * 3 + 2] - cent[k][2]) ** 2; if (d < bd) { bd = d; best = k; } }
      assign[i] = best; inertia += bd;
    }
    steps.push({ cent, assign, inertia });
    const sum = cent.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < N_POINTS; i++) { const s = sum[assign[i]]; s[0] += p[i * 3]; s[1] += p[i * 3 + 1]; s[2] += p[i * 3 + 2]; s[3]++; }
    cent = sum.map((s, k) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cent[k]));
  }
  return steps;
}

/* ---- 3. Gradient descent on a loss surface ---- */
export const loss = (x: number, y: number) => 0.09 * (x * x + y * y) + 0.32 * Math.sin(1.6 * x) * Math.sin(1.6 * y) * Math.exp(-0.04 * (x * x + y * y)) + 0.5;
const grad = (x: number, y: number): [number, number] => { const h = 1e-3; return [(loss(x + h, y) - loss(x - h, y)) / (2 * h), (loss(x, y + h) - loss(x, y - h)) / (2 * h)]; };
export const DESCENT_STEPS = 80, SURF = 4;
export function descend(lr: number) {
  let x = -3.1, y = 2.6; const path: [number, number, number][] = [[x, y, loss(x, y)]];
  for (let i = 0; i < DESCENT_STEPS; i++) {
    const [gx, gy] = grad(x, y);
    x = Math.max(-SURF, Math.min(SURF, x - lr * gx * 4)); y = Math.max(-SURF, Math.min(SURF, y - lr * gy * 4));
    path.push([x, y, loss(x, y)]);
  }
  return path;
}
