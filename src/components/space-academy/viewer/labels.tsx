"use client";
// Scene labels as ordinary DOM over the canvas. Parts register an anchor (an
// object and an offset); the overlay registers one element per label; a
// projector inside the canvas moves each element to its anchor's screen
// position whenever a frame is drawn. No nested React roots (unlike drei's
// <Html>, whose roots crashed on unmount under React 19), so labels can
// mount and unmount freely.
import { createContext, useContext, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Camera, type Object3D } from "three";

export class LabelRegistry {
  private anchors = new Map<string, { object: Object3D; offset: Vector3 }>();
  private nodes = new Map<string, HTMLElement>();
  private requestFrame: () => void = () => {};
  private readonly world = new Vector3();

  setAnchor(id: string, object: Object3D, offset: Vector3) {
    this.anchors.set(id, { object, offset });
    this.requestFrame();
  }

  removeAnchor(id: string, object: Object3D) {
    if (this.anchors.get(id)?.object === object) this.anchors.delete(id);
  }

  setNode(id: string, node: HTMLElement | null) {
    if (node) {
      node.style.visibility = "hidden";
      this.nodes.set(id, node);
    } else this.nodes.delete(id);
  }

  setFrameRequester(fn: () => void) {
    this.requestFrame = fn;
    fn();
  }

  refresh() {
    this.requestFrame();
  }

  project(camera: Camera, width: number, height: number) {
    for (const [id, node] of this.nodes) {
      const anchor = this.anchors.get(id);
      if (!anchor) {
        node.style.visibility = "hidden";
        continue;
      }
      this.world.copy(anchor.offset);
      anchor.object.localToWorld(this.world);
      this.world.project(camera);
      node.style.visibility = this.world.z > 1 ? "hidden" : "visible";
      node.style.transform = `translate(${((this.world.x + 1) / 2) * width}px, ${((1 - this.world.y) / 2) * height}px) translate(-50%, -50%)`;
    }
  }
}

export const LabelContext = createContext<LabelRegistry | null>(null);

export function useLabelRegistry() {
  return useMemo(() => new LabelRegistry(), []);
}

/** Inside the canvas: register an object as a label anchor. */
export function useLabelAnchor(id: string | null, ref: React.RefObject<Object3D | null>, offset: [number, number, number]) {
  const registry = useContext(LabelContext);
  const key = offset.join(",");
  useEffect(() => {
    const object = ref.current;
    if (!registry || !object || id === null) return;
    const [x, y, z] = key.split(",").map(Number);
    registry.setAnchor(id, object, new Vector3(x, y, z));
    return () => registry.removeAnchor(id, object);
  }, [registry, id, ref, key]);
}

/** Inside the canvas: projects every anchored label on each drawn frame. */
export function LabelProjector() {
  const registry = useContext(LabelContext);
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    registry?.setFrameRequester(invalidate);
  }, [registry, invalidate]);
  useFrame(() => registry?.project(camera, size.width, size.height));
  return null;
}

/** Outside the canvas: the label elements themselves. */
export function LabelOverlay({ labels, className, activeClassName }: { labels: { id: string; text: string; active?: boolean }[]; className: string; activeClassName: string }) {
  const registry = useContext(LabelContext);
  useEffect(() => {
    registry?.refresh();
  }, [labels, registry]);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
      {labels.map((l) => (
        <span
          key={l.id}
          ref={(node) => registry?.setNode(l.id, node)}
          className={`${className} ${l.active ? activeClassName : ""}`}
          style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}
