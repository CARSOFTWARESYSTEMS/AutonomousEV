import { afterEach, describe, expect, it } from "vitest";
import { Object3D, PerspectiveCamera } from "three";
import { projectLabels, removeLabelAnchor, setLabelAnchor, setLabelElement } from "./labelRegistry";

const WIDTH = 1000;
const HEIGHT = 800;
const LABEL = { width: 120, height: 28 };

function camera() {
  const c = new PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 100);
  c.position.set(0, 0, 10);
  c.updateMatrixWorld();
  return c;
}

const keys: string[] = [];

/** A label of a fixed size anchored at a point in the scene. */
function label(key: string, x: number, y: number, z = 0) {
  const anchor = new Object3D();
  anchor.position.set(x, y, z);
  anchor.updateMatrixWorld();
  const element = document.createElement("div");
  Object.defineProperty(element, "offsetWidth", { value: LABEL.width });
  Object.defineProperty(element, "offsetHeight", { value: LABEL.height });
  setLabelAnchor(key, anchor);
  setLabelElement(key, element);
  keys.push(key);
  return element;
}

const top = (element: HTMLElement) => Number(/translate3d\([^,]+, ([-\d.]+)px/.exec(element.style.transform)![1]);
const left = (element: HTMLElement) => Number(/translate3d\(([-\d.]+)px/.exec(element.style.transform)![1]);

afterEach(() => {
  for (const key of keys.splice(0)) {
    removeLabelAnchor(key);
    setLabelElement(key, null);
  }
});

describe("labels projected from the scene", () => {
  it("places a label at its anchor and hides one behind the camera", () => {
    const centre = label("centre", 0, 0);
    const behind = label("behind", 0, 0, 20);
    projectLabels(camera(), WIDTH, HEIGHT);
    expect(left(centre)).toBeCloseTo(WIDTH / 2, 0);
    expect(top(centre)).toBeCloseTo(HEIGHT / 2, 0);
    expect(centre.dataset.shown).toBe("true");
    expect(behind.dataset.shown).toBe("false");
  });

  it("draws labels over each other unless asked to declutter", () => {
    const a = label("a", 0, 0);
    const b = label("b", 0.05, -0.02);
    projectLabels(camera(), WIDTH, HEIGHT);
    expect(Math.abs(top(a) - top(b))).toBeLessThan(LABEL.height / 2);
  });

  it("stacks labels whose anchors project close together, without moving the first", () => {
    const a = label("a", 0, 0);
    const b = label("b", 0.05, -0.02);
    const c = label("c", 0.1, -0.04);
    projectLabels(camera(), WIDTH, HEIGHT, true);
    expect(top(a)).toBeCloseTo(HEIGHT / 2, 0);
    const tops = [top(a), top(b), top(c)].sort((p, q) => p - q);
    // Each is at least most of a label's height from the next.
    expect(tops[1] - tops[0]).toBeGreaterThanOrEqual(LABEL.height - 6);
    expect(tops[2] - tops[1]).toBeGreaterThanOrEqual(LABEL.height - 6);
  });

  it("leaves labels that are already apart where they are", () => {
    const a = label("a", -2, 1);
    const b = label("b", 2, -1);
    projectLabels(camera(), WIDTH, HEIGHT);
    const before = [top(a), top(b)];
    projectLabels(camera(), WIDTH, HEIGHT, true);
    expect([top(a), top(b)]).toEqual(before);
  });
});
