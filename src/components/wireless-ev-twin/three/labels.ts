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

/** Projects every anchored label to screen space. Called once a frame by the scene, which lends a scratch vector. */
export function projectLabels(camera: Camera, width: number, height: number, tmp: Vector3) {
  for (const [id, el] of nodes) {
    const a = anchors.get(id);
    if (!a) {
      el.style.visibility = "hidden";
      continue;
    }
    tmp.set(a[0], a[1], a[2]).project(camera);
    const behind = tmp.z > 1 || tmp.z < -1;
    const x = (tmp.x * 0.5 + 0.5) * width;
    const y = (-tmp.y * 0.5 + 0.5) * height;
    // A label the canvas edge would cut is hidden rather than shown in part (transforms do not dirty layout, so these reads are cheap).
    const w = el.offsetWidth;
    const clipped = x - w / 2 < 2 || x + w / 2 > width - 2 || y - el.offsetHeight < 2 || y > height - 2;
    el.style.visibility = behind || clipped ? "hidden" : "visible";
    el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
}
