"use client";
// The highway corridor, in the hero vehicle's frame. Everything moves past the
// car at exactly the simulated distance travelled: the asphalt and verge
// textures scroll, and repeating items (dashes, barrier joints, guardrail
// posts, lamps, cabinets, gantries, trees, the distant skyline) are instanced
// and wrapped. The verge, trees and skyline belong to the Dynamic environment;
// elsewhere the highway is a quiet backdrop beside the charging site.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, ConeGeometry, CylinderGeometry, DoubleSide, type Group, type InstancedMesh, type Material, Matrix4, MeshStandardMaterial, Plane, Quaternion, Shape, ExtrudeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { asphaltTexture, grassTexture, laneSignTexture, windowTexture } from "../materials";
import { enableLocalClipping, setOffset, setOpacity, setVisible } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";
import { CABINET_Z, CUT, GUARDRAIL_Z, hash, LANE_WIDTH, laneZ, MEDIAN_Z, PAVED, ROAD_Z, WINDOW, wrapRel } from "./layout";

const LO = -WINDOW / 2;
const mtx = new Matrix4();
const pos = new Vector3();
const quat = new Quaternion();
const scl = new Vector3(1, 1, 1);

/** Instance i of a row repeating every `spacing` metres, wrapped into the window. */
function placeRow(mesh: InstancedMesh | null, count: number, spacing: number, x0: number, y: number, z: number, rotY = 0) {
  if (!mesh) return;
  quat.setFromAxisAngle(pos.set(0, 1, 0), rotY);
  for (let i = 0; i < count; i++) {
    pos.set(wrapRel(i * spacing, x0, count * spacing, LO), y, z);
    mtx.compose(pos, quat, scl);
    mesh.setMatrixAt(i, mtx);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/** Clipping planes that remove the cutaway window from the road surface and its markings. */
export function cutPlanes(): Plane[] {
  return [new Plane(new Vector3(1, 0, 0), -CUT.x1), new Plane(new Vector3(-1, 0, 0), CUT.x0), new Plane(new Vector3(0, 0, 1), -CUT.laneZ1), new Plane(new Vector3(0, 0, -1), CUT.trenchZ0)];
}

function setClipping(m: Material, planes: Plane[] | null) {
  m.clippingPlanes = planes;
  m.clipIntersection = true;
  m.needsUpdate = true;
}

function geometries() {
  const g = (geo: BufferGeometry) => (geo.index ? geo.toNonIndexed() : geo);
  // New-Jersey-profile median barrier, extruded along x.
  const nj = new Shape();
  nj.moveTo(-0.3, 0);
  nj.lineTo(0.3, 0);
  nj.lineTo(0.22, 0.08);
  nj.lineTo(0.1, 0.33);
  nj.lineTo(0.08, 0.81);
  nj.lineTo(-0.08, 0.81);
  nj.lineTo(-0.1, 0.33);
  nj.lineTo(-0.22, 0.08);
  nj.closePath();
  const barrier = new ExtrudeGeometry(nj, { depth: WINDOW, bevelEnabled: false });
  barrier.rotateY(Math.PI / 2);
  barrier.translate(LO, 0, MEDIAN_Z);
  // W-beam guardrails on both verges.
  const rails = mergeGeometries(GUARDRAIL_Z.map((z) => mergeGeometries([g(new BoxGeometry(WINDOW, 0.32, 0.05).translate(0, 0.62, z)), g(new BoxGeometry(WINDOW, 0.04, 0.12).translate(0, 0.62, z))])!))!;
  const lamp = mergeGeometries([
    g(new CylinderGeometry(0.07, 0.11, 10, 10).translate(0, 5, 0)),
    g(new BoxGeometry(2.6, 0.08, 0.1).translate(0, 9.9, 0)),
    g(new BoxGeometry(0.4, 0.5, 0.4).translate(0, 0.25, 0)),
  ])!;
  const lampHeads = mergeGeometries([g(new BoxGeometry(0.62, 0.07, 0.26).translate(-1.25, 9.82, 0)), g(new BoxGeometry(0.62, 0.07, 0.26).translate(1.25, 9.82, 0))])!;
  const cabinet = mergeGeometries([g(new BoxGeometry(0.62, 1.4, 0.46).translate(0, 0.82, 0)), g(new BoxGeometry(0.82, 0.12, 0.6).translate(0, 0.06, 0)), g(new BoxGeometry(0.68, 0.04, 0.52).translate(0, 1.54, 0))])!;
  // Sign gantry over the near carriageway: two posts, a truss beam, the sign panel.
  const gz0 = PAVED.z0 - 0.6;
  const gz1 = MEDIAN_Z - 0.5;
  const gantry = mergeGeometries([
    g(new CylinderGeometry(0.16, 0.2, 7, 12).translate(0, 3.5, gz0)),
    g(new CylinderGeometry(0.16, 0.2, 7, 12).translate(0, 3.5, gz1)),
    g(new BoxGeometry(0.5, 0.5, gz1 - gz0 + 0.4).translate(0, 6.6, (gz0 + gz1) / 2)),
  ])!;
  const sign = new BoxGeometry(0.06, 1.6, 6.4).translate(-0.3, 5.5, ROAD_Z + 1.8);
  // Lane dashes (between lanes 0–1 and 2–3), barrier joints, guardrail posts.
  const dash = new BoxGeometry(3, 0.004, 0.15);
  const joint = new BoxGeometry(0.02, 0.82, 0.62).translate(0, 0.41, 0);
  const post = new BoxGeometry(0.1, 0.8, 0.1).translate(0, 0.4, 0);
  // Trees: trunk and canopy.
  const trunk = new CylinderGeometry(0.12, 0.18, 2.4, 6).translate(0, 1.2, 0);
  const crown = mergeGeometries([g(new ConeGeometry(1.7, 3.6, 8).translate(0, 3.6, 0)), g(new ConeGeometry(1.3, 2.8, 8).translate(0, 5.0, 0))])!;
  // Skyline strip: buildings on both sides, 500 m long, far from the road.
  const blocks: BufferGeometry[] = [];
  for (let i = 0; i < 70; i++) {
    const side = i % 2 ? 1 : -1;
    const x = -250 + hash(i) * 500;
    const z = side > 0 ? PAVED.z1 + 110 + hash(i + 70) * 160 : ROAD_Z - 110 - hash(i + 70) * 160;
    const w = 12 + hash(i + 140) * 22;
    const d = 12 + hash(i + 210) * 18;
    const h = 14 + hash(i + 280) ** 2 * 70;
    const b = new BoxGeometry(w, h, d).toNonIndexed();
    const uv = b.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * (w / 14), uv.getY(k) * (h / 20));
    b.translate(x, h / 2, z);
    blocks.push(b);
  }
  const skyline = mergeGeometries(blocks)!;
  return { barrier, rails, lamp, lampHeads, cabinet, gantry, sign, dash, joint, post, trunk, crown, skyline };
}

/** Trees on both verges: road-frame x within one 250 m layout, lateral position and size. */
const TREES = Array.from({ length: 70 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  return { x: hash(i + 400) * 250, z: side > 0 ? PAVED.z1 + 7 + hash(i + 470) * 40 : ROAD_Z - 8 - hash(i + 470) * 40, s: 0.7 + hash(i + 540) * 0.7 };
});

const COUNTS = { dash: 40, joint: 100, post: 100, lamp: 10, cabinet: 10, gantry: 2 };

export function Corridor() {
  const gl = useThree((s) => s.gl);
  const geo = useMemo(() => geometries(), []);
  const tex = useMemo(() => {
    const asphalt = asphaltTexture();
    asphalt.repeat.set(WINDOW / 8, (PAVED.z1 - PAVED.z0) / 8);
    const grass = grassTexture();
    grass.repeat.set(WINDOW / 10, 12);
    const windows = windowTexture();
    const sign = laneSignTexture();
    return { asphalt, grass, windows, sign };
  }, []);
  const m = useMemo(
    () => ({
      road: new MeshStandardMaterial({ map: tex.asphalt, color: "#62666c", roughness: 0.86, metalness: 0.02 }),
      paint: new MeshStandardMaterial({ color: "#e8eae6", roughness: 0.55, emissive: new Color("#ffffff"), emissiveIntensity: 0.06 }),
      concrete: new MeshStandardMaterial({ color: "#a7aaa8", roughness: 0.85 }),
      joint: new MeshStandardMaterial({ color: "#6d706f", roughness: 0.9 }),
      steel: new MeshStandardMaterial({ color: "#a9aeb4", metalness: 0.85, roughness: 0.35 }),
      dark: new MeshStandardMaterial({ color: "#3a3f45", metalness: 0.6, roughness: 0.45 }),
      head: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#fff1dc"), emissiveIntensity: 2.2 }),
      cabinet: new MeshStandardMaterial({ color: "#c9cdd1", metalness: 0.4, roughness: 0.45 }),
      sign: new MeshStandardMaterial({ map: tex.sign, roughness: 0.4, emissive: new Color("#ffffff"), emissiveMap: tex.sign, emissiveIntensity: 0.35 }),
      grass: new MeshStandardMaterial({ map: tex.grass, color: "#8a9378", roughness: 0.95 }),
      trunk: new MeshStandardMaterial({ color: "#3b2f25", roughness: 0.9 }),
      crown: new MeshStandardMaterial({ color: "#1f3324", roughness: 0.9, side: DoubleSide }),
      city: new MeshStandardMaterial({ color: "#1b2029", roughness: 0.7, metalness: 0.3, emissive: new Color("#ffffff"), emissiveMap: tex.windows, emissiveIntensity: 0.5 }),
    }),
    [tex],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((x) => x.dispose());
      Object.values(tex).forEach((x) => x.dispose());
      Object.values(m).forEach((x) => x.dispose());
    },
    [geo, tex, m],
  );
  const planes = useMemo(() => cutPlanes(), []);
  const clipped = useRef(false);
  const inst = useRef<Record<string, InstancedMesh | null>>({});
  const ref = (k: string) => (el: InstancedMesh | null) => {
    inst.current[k] = el;
  };
  const dynamicOnly = useRef<Group>(null);
  const trees = useRef<{ trunk: InstancedMesh | null; crown: InstancedMesh | null }>({ trunk: null, crown: null });
  const skyline = useRef<(Group | null)[]>([]);

  useFrame(() => {
    const x0 = runtime.road.state.x;
    const env = useTwin.getState().environment;
    const dyn = env === "dynamic";
    setOffset(tex.asphalt, ((x0 / 8) % 1 + 1) % 1, 0);
    setOffset(tex.grass, ((x0 / 10) % 1 + 1) % 1, 0);
    // The cutaway removes a window of the surface over the hero lane (dynamic only).
    const cut = dyn && view.cut > 0.5;
    if (cut !== clipped.current) {
      clipped.current = cut;
      enableLocalClipping(gl);
      for (const mat of [m.road, m.paint]) setClipping(mat, cut ? planes : null);
    }
    setOpacity(m.road, 1 - 0.85 * (dyn ? view.underbody : 0), 0.9);
    const I = inst.current;
    placeRow(I.dash01 ?? null, COUNTS.dash, WINDOW / COUNTS.dash, x0, 0.006, ROAD_Z + LANE_WIDTH / 2);
    placeRow(I.dash23 ?? null, COUNTS.dash, WINDOW / COUNTS.dash, x0, 0.006, laneZ(2) + LANE_WIDTH / 2);
    placeRow(I.joint ?? null, COUNTS.joint, WINDOW / COUNTS.joint, x0, 0, MEDIAN_Z);
    placeRow(I.postNear ?? null, COUNTS.post, WINDOW / COUNTS.post, x0, 0, GUARDRAIL_Z[0]);
    placeRow(I.postFar ?? null, COUNTS.post, WINDOW / COUNTS.post, x0, 0, GUARDRAIL_Z[1]);
    // Lamp arms reach across both carriageways.
    placeRow(I.lamp ?? null, COUNTS.lamp, WINDOW / COUNTS.lamp, x0, 0.81, MEDIAN_Z, Math.PI / 2);
    placeRow(I.lampHead ?? null, COUNTS.lamp, WINDOW / COUNTS.lamp, x0, 0.81, MEDIAN_Z, Math.PI / 2);
    placeRow(I.cabinet ?? null, COUNTS.cabinet, WINDOW / COUNTS.cabinet, x0 - 12, 0, CABINET_Z);
    placeRow(I.gantry ?? null, COUNTS.gantry, WINDOW / COUNTS.gantry, x0 - 60, 0, 0);
    placeRow(I.sign ?? null, COUNTS.gantry, WINDOW / COUNTS.gantry, x0 - 60, 0, 0);
    setVisible(dynamicOnly.current, dyn);
    if (dyn) {
      const { trunk, crown } = trees.current;
      if (trunk && crown) {
        let k = 0;
        for (let copy = 0; copy < 2; copy++) {
          for (const t of TREES) {
            pos.set(wrapRel(t.x + copy * 250, x0, WINDOW, LO), 0, t.z);
            scl.set(t.s, t.s, t.s);
            quat.identity();
            mtx.compose(pos, quat, scl);
            trunk.setMatrixAt(k, mtx);
            crown.setMatrixAt(k, mtx);
            k++;
          }
        }
        scl.set(1, 1, 1);
        trunk.instanceMatrix.needsUpdate = true;
        crown.instanceMatrix.needsUpdate = true;
      }
      skyline.current.forEach((grp, c) => {
        if (grp) grp.position.x = wrapRel(c * WINDOW, x0, 2 * WINDOW, -WINDOW);
      });
    }
  });

  const zMid = (PAVED.z0 + PAVED.z1) / 2;
  return (
    <group>
      {/* Carriageways and shoulders (the asphalt texture scrolls with the distance travelled). */}
      <mesh material={m.road} position={[0, 0.002, zMid]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow {...pick("road-layers")}>
        <planeGeometry args={[WINDOW, PAVED.z1 - PAVED.z0]} />
      </mesh>
      {/* Solid edge lines and the lines along the median. */}
      {[ROAD_Z - LANE_WIDTH / 2, MEDIAN_Z - 0.55, MEDIAN_Z + 0.55, laneZ(3) + LANE_WIDTH / 2].map((z) => (
        <mesh key={z} material={m.paint} position={[0, 0.005, z]}>
          <boxGeometry args={[WINDOW, 0.004, 0.15]} />
        </mesh>
      ))}
      <instancedMesh ref={ref("dash01")} args={[geo.dash, m.paint, COUNTS.dash]} />
      <instancedMesh ref={ref("dash23")} args={[geo.dash, m.paint, COUNTS.dash]} />
      <mesh geometry={geo.barrier} material={m.concrete} castShadow receiveShadow />
      <instancedMesh ref={ref("joint")} args={[geo.joint, m.joint, COUNTS.joint]} />
      <mesh geometry={geo.rails} material={m.steel} castShadow />
      <instancedMesh ref={ref("postNear")} args={[geo.post, m.dark, COUNTS.post]} castShadow />
      <instancedMesh ref={ref("postFar")} args={[geo.post, m.dark, COUNTS.post]} castShadow />
      <instancedMesh ref={ref("lamp")} args={[geo.lamp, m.dark, COUNTS.lamp]} castShadow />
      <instancedMesh ref={ref("lampHead")} args={[geo.lampHeads, m.head, COUNTS.lamp]} />
      <instancedMesh ref={ref("cabinet")} args={[geo.cabinet, m.cabinet, COUNTS.cabinet]} castShadow {...pick("segment-controller")} />
      <instancedMesh ref={ref("gantry")} args={[geo.gantry, m.dark, COUNTS.gantry]} castShadow />
      <instancedMesh ref={ref("sign")} args={[geo.sign, m.sign, COUNTS.gantry]} />
      <group ref={dynamicOnly} visible={false}>
        {/* Verges on both sides (the ground plane of the site is hidden on the road). */}
        <mesh material={m.grass} position={[0, -0.01, PAVED.z0 - 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[WINDOW, 120]} />
        </mesh>
        <mesh material={m.grass} position={[0, -0.01, PAVED.z1 + 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[WINDOW, 120]} />
        </mesh>
        <instancedMesh ref={(el) => { trees.current.trunk = el; }} args={[geo.trunk, m.trunk, TREES.length * 2]} castShadow />
        <instancedMesh ref={(el) => { trees.current.crown = el; }} args={[geo.crown, m.crown, TREES.length * 2]} castShadow />
        {[0, 1].map((c) => (
          <group key={c} ref={(el) => { skyline.current[c] = el; }}>
            <mesh geometry={geo.skyline} material={m.city} />
          </group>
        ))}
      </group>
    </group>
  );
}
