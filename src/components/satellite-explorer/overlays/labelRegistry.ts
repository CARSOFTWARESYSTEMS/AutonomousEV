// Labels anchored to points in the 3D scene but drawn as ordinary DOM, in a
// layer beside the canvas. A scene component declares a label and owns its
// anchor; the interface renders the content; once per rendered frame the
// anchors are projected and the elements moved. Keeping the elements out of
// the canvas keeps their clicks away from the scene's own pointer handling.
import type { ReactNode } from "react";
import { type Camera, type Object3D, Vector3 } from "three";

export interface LabelEntry {
  key: string;
  node: ReactNode;
  className?: string;
  /** Centre the content on the anchor instead of starting at it. */
  center: boolean;
}

export type LabelVisibility = (world: Vector3, camera: Camera) => boolean;

interface Anchor {
  object: Object3D;
  visible?: LabelVisibility;
}

const entries = new Map<string, LabelEntry>();
const anchors = new Map<string, Anchor>();
const elements = new Map<string, HTMLElement>();
const listeners = new Set<() => void>();
let snapshot: readonly LabelEntry[] = [];

function publish() {
  snapshot = [...entries.values()];
  for (const listener of listeners) listener();
}

export function subscribeLabels(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const labelSnapshot = (): readonly LabelEntry[] => snapshot;

export function setLabel(entry: LabelEntry) {
  entries.set(entry.key, entry);
  publish();
}

export function removeLabel(key: string) {
  if (entries.delete(key)) publish();
}

export function setLabelAnchor(key: string, object: Object3D, visible?: LabelVisibility) {
  anchors.set(key, { object, visible });
}

export function removeLabelAnchor(key: string) {
  anchors.delete(key);
}

export function setLabelElement(key: string, element: HTMLElement | null) {
  if (element) elements.set(key, element);
  else elements.delete(key);
}

const world = new Vector3();
const projected = new Vector3();

/** An object is drawn only if it and every ancestor are visible. */
function isDrawn(object: Object3D): boolean {
  for (let o: Object3D | null = object; o; o = o.parent) if (!o.visible) return false;
  return true;
}

interface Placed {
  x: number;
  y: number;
  width: number;
  height: number;
}

const placed: Placed[] = [];
/** How far two label boxes may overlap before one is moved: about the margin a label keeps from its anchor. */
const OVERLAP_ALLOWED = 5;

const overlaps = (a: Placed, b: Placed) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height - OVERLAP_ALLOWED && b.y < a.y + a.height - OVERLAP_ALLOWED;

/**
 * Move a label clear of the labels placed before it: up or down, whichever is
 * shorter at the first one it meets, and on in that direction past any others.
 * Earlier labels never move, so nothing swaps places as the camera turns.
 */
function separate(label: Placed, count: number) {
  let direction = 0;
  for (let pass = 0; pass < count; pass++) {
    let moved = false;
    for (let i = 0; i < count; i++) {
      const other = placed[i];
      if (!overlaps(label, other)) continue;
      if (direction === 0) direction = label.y + label.height / 2 >= other.y + other.height / 2 ? 1 : -1;
      label.y = direction > 0 ? other.y + other.height - OVERLAP_ALLOWED : other.y - label.height + OVERLAP_ALLOWED;
      moved = true;
    }
    if (!moved) return;
  }
}

/**
 * Move every label to its anchor's place on screen. Call after the frame has
 * been rendered. With `declutter`, labels whose anchors project close together
 * are stacked instead of drawn over one another.
 */
export function projectLabels(camera: Camera, width: number, height: number, declutter = false) {
  placed.length = 0;
  for (const [key, anchor] of anchors) {
    const element = elements.get(key);
    if (!element) continue;
    let shown = isDrawn(anchor.object);
    if (shown) {
      world.setFromMatrixPosition(anchor.object.matrixWorld);
      projected.copy(world).applyMatrix4(camera.matrixWorldInverse);
      // In front of the camera, and not hidden by whatever the label's owner checks for.
      shown = projected.z < 0 && (anchor.visible ? anchor.visible(world, camera) : true);
      if (shown) {
        projected.applyMatrix4(camera.projectionMatrix);
        const x = (projected.x * 0.5 + 0.5) * width;
        let y = (-projected.y * 0.5 + 0.5) * height;
        if (declutter) {
          const label = { x, y, width: element.offsetWidth, height: element.offsetHeight };
          separate(label, placed.length);
          placed.push(label);
          y = label.y;
        }
        element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    }
    const state = shown ? "true" : "false";
    if (element.dataset.shown !== state) element.dataset.shown = state;
  }
}
