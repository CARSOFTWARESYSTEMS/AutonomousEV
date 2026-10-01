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

/** Move every label to its anchor's place on screen. Call after the frame has been rendered. */
export function projectLabels(camera: Camera, width: number, height: number) {
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
        const y = (-projected.y * 0.5 + 0.5) * height;
        element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    }
    const state = shown ? "true" : "false";
    if (element.dataset.shown !== state) element.dataset.shown = state;
  }
}
