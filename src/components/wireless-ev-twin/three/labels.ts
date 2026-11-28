// Scene labels as plain DOM over the canvas (no drei <Html>, whose nested
// React roots crash on unmount under React 19). The scene sets anchor
// positions each frame; the projector moves each registered element there.
import type { Camera, Vector3 } from "three";

// No three.js at run time here: the interface imports labelRef, and must not pull the 3D bundle with it.
const anchors = new Map<string, [number, number, number]>();
const nodes = new Map<string, HTMLElement>();

export function setAnchor(id: string, x: number, y: number, z: number) {
  const a = anchors.get(id);
  if (a) {
    a[0] = x;
    a[1] = y;
    a[2] = z;
  } else anchors.set(id, [x, y, z]);
}

export function clearAnchor(id: string) {
  anchors.delete(id);
}

/** Ref callback for a label element. */
export const labelRef = (id: string) => (el: HTMLElement | null) => {
  if (el) nodes.set(id, el);
  else nodes.delete(id);
};

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Placed extends Box {
  el: HTMLElement;
  priority: number;
  anchorY: number;
}

const MARGIN = 6;
const GAP = 4;
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** The laboratory's own panels (stage card, instruments, caption, timeline, legends), re-measured a few times a second. */
let obstacles: Box[] = [];
let obstaclesAt = -1;
function scanObstacles(layer: HTMLElement | null, now: number) {
  if (now - obstaclesAt < 300) return;
  obstaclesAt = now;
  obstacles = [];
  const host = layer?.parentElement;
  if (!layer || !host) return;
  const origin = layer.getBoundingClientRect();
  for (const el of host.querySelectorAll<HTMLElement>('[data-label-obstacle], [class*="legend"]')) {
    if (el.parentElement?.closest('[data-label-obstacle], [class*="legend"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) obstacles.push({ x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height });
  }
}

const placed: Placed[] = [];
const candidates: Placed[] = [];

/**
 * Projects every anchored label to screen space, once a frame (the scene lends
 * a scratch vector). A label stands above its anchor. It is hidden only when
 * its anchor is behind the camera or outside the view, never merely because it
 * would be cut by an edge: it is moved inside the view instead. Labels are then
 * placed in priority order (`data-priority`, higher first; nearer the top of
 * the view first), each nudged vertically, then sideways, to the nearest
 * position clear of the labels already placed and of the laboratory's panels;
 * one that finds no clear position stays at its anchor.
 */
export function projectLabels(camera: Camera, width: number, height: number, tmp: Vector3) {
  candidates.length = 0;
  let layer: HTMLElement | null = null;
  for (const [id, el] of nodes) {
    const a = anchors.get(id);
    if (!a) {
      el.style.visibility = "hidden";
      continue;
    }
    tmp.set(a[0], a[1], a[2]).project(camera);
    const ax = (tmp.x * 0.5 + 0.5) * width;
    const ay = (-tmp.y * 0.5 + 0.5) * height;
    if (tmp.z > 1 || tmp.z < -1 || ax < 0 || ax > width || ay < 0 || ay > height) {
      el.style.visibility = "hidden";
      continue;
    }
    layer ??= el.parentElement;
    // Transforms and visibility do not dirty layout, so these reads are cheap.
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    candidates.push({ el, priority: Number(el.dataset.priority ?? 0), anchorY: ay, w, h, x: clamp(ax - w / 2, MARGIN, Math.max(MARGIN, width - MARGIN - w)), y: clamp(ay - h, MARGIN, Math.max(MARGIN, height - MARGIN - h)) });
  }
  scanObstacles(layer, performance.now());
  candidates.sort((p, q) => q.priority - p.priority || p.anchorY - q.anchorY);
  placed.length = 0;
  for (const c of candidates) {
    const home = { x: c.x, y: c.y };
    const clear = (x: number, y: number) => {
      const b = { x, y, w: c.w, h: c.h };
      return !placed.some((p) => overlaps(p, b)) && !obstacles.some((o) => overlaps(o, b));
    };
    let found = clear(c.x, c.y);
    const step = c.h + GAP;
    for (let k = 1; !found && k <= 4; k++)
      for (const [dx, dy] of [[0, -k * step], [0, k * step], [-k * (c.w / 2 + GAP), 0], [k * (c.w / 2 + GAP), 0]]) {
        const x = clamp(home.x + dx, MARGIN, Math.max(MARGIN, width - MARGIN - c.w));
        const y = clamp(home.y + dy, MARGIN, Math.max(MARGIN, height - MARGIN - c.h));
        if (clear(x, y)) {
          c.x = x;
          c.y = y;
          found = true;
          break;
        }
      }
    placed.push(c);
    c.el.style.visibility = "visible";
    c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
  }
}
