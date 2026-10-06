"use client";
// The WebGL view of the inspection twin. This file and three.js are a separate
// chunk, requested only once the viewer is near the screen on a device with
// WebGL; until then, and wherever that never happens, the isometric drawing in
// IsoView stands in for it.
//
// It is deliberately light: one small part, no shadows, no textures, a capped
// pixel ratio, and a frame drawn only when something has changed, so a viewer
// nobody is touching, or that has scrolled away, costs nothing.
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { BufferGeometry, type DirectionalLight, ExtrudeGeometry, Float32BufferAttribute, Matrix4, type OrthographicCamera, Path, Plane as ClipPlane, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import type { StatusFamily, TwinMode } from "../../data/twin";
import {
  CENTRE,
  ISO,
  PART,
  PLACEMENT,
  PLANES,
  STANDARD_VIEWS,
  UNRESOLVED_EDGE,
  circle,
  endProfile,
  modelEdges,
  normalOf,
  rect,
  stadium,
  viewBasis,
  type CameraView,
  type Plane,
  type StandardView,
  type Vec2,
  type Vec3,
} from "./model";

/** What the toolbar can ask the camera to do. */
export interface TwinApi {
  rotate: (degrees: number) => void;
  zoom: (factor: number) => void;
  fit: () => void;
  reset: () => void;
  view: (name: StandardView) => void;
}

export interface TwinCanvasProps {
  label: string;
  mode: TwinMode;
  selected: string;
  /** The status family each feature's mark is drawn in; null when the highlight filter leaves it out. */
  tints: Readonly<Record<string, StatusFamily | null>>;
  showBalloons: boolean;
  isolate: boolean;
  section: boolean;
  /** A drag moves the part instead of turning it. */
  pan: boolean;
  /** A touch device: coarser curves. */
  simple: boolean;
  reducedMotion: boolean;
  apiRef: RefObject<TwinApi | null>;
  /** The balloon buttons, which live in the page and are moved here to follow the model. */
  balloonsRef: RefObject<Map<string, HTMLElement>>;
  onSelect: (id: string) => void;
  onReady: () => void;
  onLost: () => void;
}

// The page's own palette, so the model and the text beside it agree.
const COLOUR: Record<StatusFamily | "selected" | "body" | "edge" | "cut", string> = {
  ok: "#6ee7b7",
  attention: "#fbbf24",
  fail: "#fca5a5",
  none: "#9ba1b9",
  selected: "#60a5fa",
  body: "#8196bd",
  edge: "#dbe7ff",
  cut: "#3b82f6",
};

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 4;
const PITCH_MIN = -15;
const PITCH_MAX = 89;
const CAMERA_DISTANCE = 600;
/** Section A-A keeps everything on the near side of the cut. */
const CUT = [new ClipPlane(new Vector3(-1, 0, 0), PART.sectionX)];
const WHOLE: ClipPlane[] = [];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** The short way round from one yaw to another. */
function nearest(from: number, to: number) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return from + d;
}

// ── Geometry ──

const points = (outline: Vec2[]) => outline.map(([a, b]) => new Vector2(a, b));

function shapeOf(outline: Vec2[], openings: Vec2[][] = []) {
  const shape = new Shape(points(outline));
  for (const opening of openings) shape.holes.push(new Path(points(opening)));
  return shape;
}

/** Carries a shape drawn in (a, b) and extruded along c into the part's axes: a → x, b → y, c → z, then moved to `origin`. */
const placed = (x: Vec3, y: Vec3, z: Vec3, origin: Vec3) => new Matrix4().makeBasis(new Vector3(...x), new Vector3(...y), new Vector3(...z)).setPosition(...origin);
const onPlane = (plane: Plane, lift = 0) => {
  const n = normalOf(plane);
  return placed(plane.u, plane.v, n, [plane.origin[0] + n[0] * lift, plane.origin[1] + n[1] * lift, plane.origin[2] + n[2] * lift]);
};
const extruded = (shape: Shape, depth: number, matrix?: Matrix4) => {
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  return matrix ? geometry.applyMatrix4(matrix) : geometry;
};
const segmentsOf = (pairs: readonly (readonly [Vec3, Vec3])[]) => new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pairs.flatMap(([from, to]) => [...from, ...to]), 3));

/**
 * The bracket, built from four simple extrusions that meet without overlapping:
 * the flange, the web in two layers (so the pocket has a floor) and the web's
 * top strip (so the rear chamfer can be cut from it).
 */
function buildPart(mode: TwinMode, segments: number) {
  const { length, depth, flange, height, webFront, pocketFloor, capBase, hole12, hole13, slot, hole17, pocket } = PART;
  const webHole = circle(hole17.x, hole17.z, hole17.r, segments);
  const webFace = rect(0, flange, length, capBase);
  // Drawn in (x, z), extruded towards the front: a → x, b → z, c → −y.
  const intoWeb = (from: number) => placed([1, 0, 0], [0, 0, 1], [0, -1, 0], [0, from, 0]);
  // The web's top strip in (y, z). Approved CAD cuts the chamfer from its rear corner; a reconstruction leaves it square.
  const strip: Vec2[] =
    mode === "cad"
      ? [
          [webFront, capBase],
          [depth, capBase],
          [depth - PART.chamfer, height],
          [webFront, height],
        ]
      : rect(webFront, capBase, depth, height);
  return [
    extruded(shapeOf(rect(0, 0, length, depth), [circle(hole12.x, hole12.y, hole12.r, segments), circle(hole13.x, hole13.y, hole13.r, segments), stadium(slot.x, slot.y, slot.half, slot.r, Math.round(segments / 2))]), flange),
    extruded(shapeOf(webFace, [webHole, rect(pocket.x0, pocket.z0, pocket.x1, pocket.z1)]), pocketFloor - webFront, intoWeb(pocketFloor)),
    extruded(shapeOf(webFace, [webHole]), depth - pocketFloor, intoWeb(depth)),
    // Drawn in (y, z), extruded along the length: a → y, b → z, c → x.
    extruded(shapeOf(strip), length, placed([0, 1, 0], [0, 0, 1], [1, 0, 0], [0, 0, 0])),
  ];
}

/** The cut faces of Section A-A: the flange either side of the hole it passes through, and the web. */
function buildCut(mode: TwinMode) {
  const { depth, flange, webFront, hole12 } = PART;
  const web = endProfile(mode).filter(([y, z]) => y >= webFront && z > flange);
  const faces = [rect(0, 0, hole12.y - hole12.r, flange), rect(hole12.y + hole12.r, 0, depth, flange), [[webFront, flange] as const, [depth, flange] as const, ...web]];
  return faces.map((outline) => new ShapeGeometry(shapeOf(outline)).applyMatrix4(onPlane(PLANES.section)));
}

/** The edge a reconstruction cannot place the chamfer on, as a row of dashes along it: a question, not geometry. */
function buildUnresolved() {
  const [from, depth] = UNRESOLVED_EDGE[0];
  const [to] = UNRESOLVED_EDGE[1];
  const dashes: Shape[] = [];
  for (let x = from + 1; x < to; x += 10) dashes.push(shapeOf(rect(x, depth - 1.8, Math.min(x + 6, to), depth)));
  return new ShapeGeometry(dashes).applyMatrix4(onPlane(PLANES.webTop, 0.3));
}

const buildMarks = (mode: TwinMode) =>
  Object.entries(PLACEMENT).map(([id, placement]) => ({
    id,
    geometries: placement.marks(mode).map((mark) => new ShapeGeometry(shapeOf(mark.outer, mark.inner ? [mark.inner] : [])).applyMatrix4(onPlane(PLANES[mark.plane], 0.12))),
  }));

// ── The camera ──

interface Pose extends CameraView {
  target: Vector3;
}

const poseOf = (view: CameraView, target: Vec3 = CENTRE): Pose => ({ ...view, target: new Vector3(...target) });
/** A feature's own view, centred part-way between the part and the feature so the context stays in frame. */
const featurePose = (id: string): Pose => {
  const { view, anchor } = PLACEMENT[id];
  const towards = (i: 0 | 1 | 2) => CENTRE[i] + (anchor[i] - CENTRE[i]) * 0.65;
  return poseOf(view, [towards(0), towards(1), towards(2)]);
};

const scratch = new Vector3();

/** Puts each balloon button over the point its balloon floats at, as this camera sees it. */
function placeBalloons(elements: Map<string, HTMLElement>, camera: OrthographicCamera) {
  for (const [id, element] of elements) {
    const placement = PLACEMENT[id];
    if (!placement) continue;
    scratch.set(...placement.balloon).project(camera);
    element.style.left = `${((scratch.x + 1) / 2) * 100}%`;
    element.style.top = `${((1 - scratch.y) / 2) * 100}%`;
  }
}

/** Hands the balloons back to the places the fixed view gave them. */
function releaseBalloons(elements: Map<string, HTMLElement>) {
  for (const element of elements.values()) {
    element.style.left = element.dataset.left ?? "";
    element.style.top = element.dataset.top ?? "";
  }
}

interface RigProps extends Pick<TwinCanvasProps, "selected" | "section" | "pan" | "reducedMotion" | "apiRef" | "balloonsRef" | "onReady" | "onLost"> {
  lightRef: RefObject<DirectionalLight | null>;
}

/**
 * The camera is always a pose round a target: a yaw, a pitch and a zoom. A
 * drag changes the pose, the toolbar and a selection move it through an eased
 * change, and after each frame the balloon buttons are placed over the model.
 */
function Rig({ selected, section, pan, reducedMotion, apiRef, balloonsRef, lightRef, onReady, onLost }: RigProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera) as OrthographicCamera;
  const invalidate = useThree((state) => state.invalidate);
  const rig = useRef({
    pose: poseOf(STANDARD_VIEWS.iso),
    tween: null as null | { from: Pose; to: Pose; start: number; duration: number },
    pointers: new Map<number, { x: number; y: number }>(),
    ready: false,
    // What the camera last answered to, so it moves only when one of them really changes.
    selected,
    section,
    pan,
    reducedMotion,
  });

  useEffect(() => {
    rig.current.pan = pan;
    rig.current.reducedMotion = reducedMotion;
  }, [pan, reducedMotion]);

  // Moves start from wherever the camera is, and a drag can interrupt them.
  const moves = useMemo(() => {
    const go = (to: Pose, duration = 420) => {
      const r = rig.current;
      to.yaw = nearest(r.pose.yaw, to.yaw);
      to.pitch = clamp(to.pitch, PITCH_MIN, PITCH_MAX);
      to.zoom = clamp(to.zoom, ZOOM_MIN, ZOOM_MAX);
      if (r.reducedMotion || duration === 0) {
        r.pose = to;
        r.tween = null;
      } else {
        r.tween = { from: { ...r.pose, target: r.pose.target.clone() }, to, start: performance.now(), duration };
      }
      invalidate();
    };
    const from = () => ({ ...rig.current.pose, target: rig.current.pose.target.clone() });
    return { go, from };
  }, [invalidate]);

  useEffect(() => {
    apiRef.current = {
      rotate: (degrees) => moves.go({ ...moves.from(), yaw: moves.from().yaw + degrees }, 220),
      zoom: (factor) => moves.go({ ...moves.from(), zoom: moves.from().zoom * factor }, 160),
      fit: () => moves.go({ ...moves.from(), zoom: 1, target: new Vector3(...CENTRE) }),
      reset: () => moves.go(poseOf(STANDARD_VIEWS.iso)),
      view: (name) => moves.go(poseOf(STANDARD_VIEWS[name])),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, moves]);

  // Selecting a feature takes the camera to it, and cutting the section turns the cut face to the viewer. The opening view is left alone.
  useEffect(() => {
    const r = rig.current;
    if (r.selected === selected && r.section === section) return;
    r.selected = selected;
    r.section = section;
    moves.go(section ? poseOf(STANDARD_VIEWS.section) : featurePose(selected));
  }, [selected, section, moves]);

  useEffect(() => {
    const element = gl.domElement;
    const r = rig.current;
    const unitsPerPixel = () => 1 / camera.zoom;

    const slide = (dx: number, dy: number) => {
      const { right, up } = viewBasis(r.pose.yaw, r.pose.pitch);
      const k = unitsPerPixel();
      r.pose.target.x += (-dx * right[0] + dy * up[0]) * k;
      r.pose.target.y += (-dx * right[1] + dy * up[1]) * k;
      r.pose.target.z += (-dx * right[2] + dy * up[2]) * k;
    };
    const spread = () => {
      const [a, b] = [...r.pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const down = (event: PointerEvent) => {
      r.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      element.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      const last = r.pointers.get(event.pointerId);
      if (!last) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      if (r.pointers.size === 2) {
        // Two fingers: pinch to zoom, and move together to slide the part.
        const before = spread();
        last.x = event.clientX;
        last.y = event.clientY;
        const after = spread();
        if (before > 0) r.pose.zoom = clamp((r.pose.zoom * after) / before, ZOOM_MIN, ZOOM_MAX);
        slide(dx / 2, dy / 2);
      } else {
        last.x = event.clientX;
        last.y = event.clientY;
        if (r.pan || event.shiftKey || (event.buttons & 6) !== 0) slide(dx, dy);
        else {
          r.pose.yaw -= dx * 0.4;
          r.pose.pitch = clamp(r.pose.pitch + dy * 0.4, PITCH_MIN, PITCH_MAX);
        }
      }
      r.tween = null;
      invalidate();
    };
    const up = (event: PointerEvent) => {
      r.pointers.delete(event.pointerId);
    };
    // A plain wheel scrolls the page, as it would anywhere else. A pinch on a trackpad, or the wheel with Ctrl or ⌘, zooms.
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      r.tween = null;
      r.pose.zoom = clamp(r.pose.zoom * Math.exp(-event.deltaY * 0.01), ZOOM_MIN, ZOOM_MAX);
      invalidate();
    };
    const menu = (event: Event) => event.preventDefault();
    const lost = (event: Event) => {
      event.preventDefault();
      onLost();
    };

    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("contextmenu", menu);
    element.addEventListener("webglcontextlost", lost);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("contextmenu", menu);
      element.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, camera, invalidate, onLost]);

  // Hand the balloons back to the fixed view's positions when this view goes away.
  useEffect(() => {
    const elements = balloonsRef.current;
    return () => releaseBalloons(elements);
  }, [balloonsRef]);

  useFrame((state) => {
    const r = rig.current;
    const view = state.camera as OrthographicCamera;
    if (r.tween) {
      const t = Math.min(1, (performance.now() - r.tween.start) / r.tween.duration);
      const k = ease(t);
      const { from, to } = r.tween;
      r.pose.yaw = from.yaw + (to.yaw - from.yaw) * k;
      r.pose.pitch = from.pitch + (to.pitch - from.pitch) * k;
      r.pose.zoom = from.zoom + (to.zoom - from.zoom) * k;
      r.pose.target.lerpVectors(from.target, to.target, k);
      if (t >= 1) r.tween = null;
      else invalidate();
    }

    const { toViewer, right, up } = viewBasis(r.pose.yaw, r.pose.pitch);
    view.up.set(0, 0, 1);
    view.position.set(toViewer[0], toViewer[1], toViewer[2]).multiplyScalar(CAMERA_DISTANCE).add(r.pose.target);
    // The same framing as the isometric drawing this view replaces: its scale, on this viewport's width.
    view.zoom = ((ISO.scale * state.size.width) / ISO.width) * r.pose.zoom;
    view.lookAt(r.pose.target);
    view.updateProjectionMatrix();
    view.updateMatrixWorld();
    // A headlight, up and to the right of the viewer, so every face reads at every angle.
    lightRef.current?.position.set(toViewer[0] * 2 + right[0] + up[0], toViewer[1] * 2 + right[1] + up[1], toViewer[2] * 2 + right[2] + up[2]);

    placeBalloons(balloonsRef.current, view);

    if (!r.ready) {
      r.ready = true;
      onReady();
    }
  });

  return null;
}

// ── The scene ──

function Scene({ mode, selected, tints, showBalloons, isolate, section, simple, onSelect }: Pick<TwinCanvasProps, "mode" | "selected" | "tints" | "showBalloons" | "isolate" | "section" | "simple" | "onSelect">) {
  const gl = useThree((state) => state.gl);
  const segments = simple ? 16 : 32;
  const part = useMemo(() => buildPart(mode, segments), [mode, segments]);
  const cut = useMemo(() => buildCut(mode), [mode]);
  const marks = useMemo(() => buildMarks(mode), [mode]);
  const edges = useMemo(() => segmentsOf(modelEdges(mode, segments)), [mode, segments]);
  const leaders = useMemo(() => segmentsOf(Object.values(PLACEMENT).map((placement) => [placement.anchor, placement.balloon] as const)), []);
  const unresolved = useMemo(() => buildUnresolved(), []);

  useEffect(
    () => () => {
      for (const geometry of [...part, ...cut, ...marks.flatMap((mark) => mark.geometries), edges]) geometry.dispose();
    },
    [part, cut, marks, edges],
  );
  useEffect(() => () => [leaders, unresolved].forEach((geometry) => geometry.dispose()), [leaders, unresolved]);

  const planes = section ? CUT : WHOLE;
  // A material compiles its clipping in, so a change of cut needs a new one.
  const cutKey = section ? "cut" : "whole";

  const pick = (id: string) => (event: ThreeEvent<MouseEvent>) => {
    // The end of a drag is not a click.
    if (event.delta > 5) return;
    event.stopPropagation();
    onSelect(id);
  };
  const cursor = (value: string) => () => {
    gl.domElement.style.cursor = value;
  };

  return (
    <>
      {part.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshStandardMaterial key={cutKey} color={COLOUR.body} metalness={0.25} roughness={0.6} transparent={isolate} opacity={isolate ? 0.14 : 1} depthWrite={!isolate} clippingPlanes={planes} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      ))}
      {section
        ? cut.map((geometry, i) => (
            <mesh key={i} geometry={geometry}>
              <meshBasicMaterial color={COLOUR.cut} transparent opacity={isolate ? 0.3 : 0.9} />
            </mesh>
          ))
        : null}
      <lineSegments geometry={edges}>
        <lineBasicMaterial key={cutKey} color={COLOUR.edge} transparent opacity={isolate ? 0.3 : 0.85} clippingPlanes={planes} />
      </lineSegments>
      {mode === "reconstruction" ? (
        <mesh geometry={unresolved}>
          <meshBasicMaterial key={cutKey} color={COLOUR.attention} clippingPlanes={planes} />
        </mesh>
      ) : null}
      {showBalloons ? (
        <lineSegments geometry={leaders}>
          <lineBasicMaterial color={COLOUR.edge} transparent opacity={0.55} />
        </lineSegments>
      ) : null}
      {marks.map(({ id, geometries }) => {
        const chosen = id === selected;
        const tint = tints[id];
        // Isolating shows the selected feature alone; a highlight filter drops the features it does not pick out.
        if (!chosen && (isolate || !tint)) return null;
        return geometries.map((geometry, i) => (
          <mesh key={`${id}-${i}`} geometry={geometry} onClick={pick(id)} onPointerOver={cursor("pointer")} onPointerOut={cursor("")}>
            <meshBasicMaterial key={cutKey} color={chosen ? COLOUR.selected : COLOUR[tint ?? "none"]} transparent opacity={chosen ? 0.95 : 0.78} depthWrite={false} clippingPlanes={planes} />
          </mesh>
        ));
      })}
    </>
  );
}

export default function TwinCanvas({ label, mode, selected, tints, showBalloons, isolate, section, pan, simple, reducedMotion, apiRef, balloonsRef, onSelect, onReady, onLost }: TwinCanvasProps) {
  const lightRef = useRef<DirectionalLight>(null);
  const start = viewBasis(STANDARD_VIEWS.iso.yaw, STANDARD_VIEWS.iso.pitch).toViewer;

  return (
    <Canvas
      orthographic
      flat
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, stencil: false, powerPreference: "default" }}
      camera={{ position: [CENTRE[0] + start[0] * CAMERA_DISTANCE, CENTRE[1] + start[1] * CAMERA_DISTANCE, CENTRE[2] + start[2] * CAMERA_DISTANCE], up: [0, 0, 1], near: 1, far: CAMERA_DISTANCE * 2 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      role="img"
      aria-label={label}
    >
      <ambientLight intensity={1.5} />
      <directionalLight ref={lightRef} intensity={2.4} />
      <Rig selected={selected} section={section} pan={pan} reducedMotion={reducedMotion} apiRef={apiRef} balloonsRef={balloonsRef} lightRef={lightRef} onReady={onReady} onLost={onLost} />
      <Scene mode={mode} selected={selected} tints={tints} showBalloons={showBalloons} isolate={isolate} section={section} simple={simple} onSelect={onSelect} />
    </Canvas>
  );
}
