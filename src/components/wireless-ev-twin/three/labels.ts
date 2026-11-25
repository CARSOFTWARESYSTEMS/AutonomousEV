// Scene labels as plain DOM over the canvas (no drei <Html>, whose nested
// React roots crash on unmount under React 19). The scene sets anchor
// positions each frame; the projector moves each registered element there.
import { type Camera, Vector3 } from "three";

const anchors = new Map<string, Vector3>();
const nodes = new Map<string, HTMLElement>();
const tmp = new Vector3();

export function setAnchor(id: string, x: number, y: number, z: number) {
  const a = anchors.get(id);
  if (a) a.set(x, y, z);
  else anchors.set(id, new Vector3(x, y, z));
}

export function clearAnchor(id: string) {
  anchors.delete(id);
}

/** Ref callback for a label element. */
export const labelRef = (id: string) => (el: HTMLElement | null) => {
  if (el) nodes.set(id, el);
  else nodes.delete(id);
};

/** Projects every anchored label to screen space. Called once a frame by the scene. */
export function projectLabels(camera: Camera, width: number, height: number) {
  for (const [id, el] of nodes) {
    const a = anchors.get(id);
    if (!a) {
      el.style.visibility = "hidden";
      continue;
    }
    tmp.copy(a).project(camera);
    const behind = tmp.z > 1 || tmp.z < -1;
    const x = (tmp.x * 0.5 + 0.5) * width;
    const y = (-tmp.y * 0.5 + 0.5) * height;
    el.style.visibility = behind ? "hidden" : "visible";
    el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
}
