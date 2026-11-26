"use client";
// The highway corridor, in the hero vehicle's frame. Everything moves past the
// car at exactly the simulated distance travelled: the asphalt and verge
// textures scroll, and repeating items (dashes, barrier joints, guardrail
// posts, lamps, cabinets, gantries, trees, the distant skyline) are instanced
// and wrapped. The verge, trees and skyline belong to the Dynamic environment;
// elsewhere the highway is a quiet backdrop beside the charging site.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, CylinderGeometry, DoubleSide, type Group, type InstancedMesh, type Material, Matrix4, MeshStandardMaterial, Plane, Quaternion, Shape, ExtrudeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { runtime } from "../../state/runtime";
import { useTwin } from "../../state/store";
import { antiTile, asphaltTexture, grassTexture, laneSignTexture } from "../materials";
import { buildCity, cityMaterials, concreteFacade, glassFacade, hillRing, type Lot } from "../env/buildings";
import { Forest, type Plant } from "../env/Forest";
import { rng, type Species } from "../env/foliage";
import { enableLocalClipping, setOffset, setOpacity, setVisible } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";
import { CABINET_Z, CUT, GUARDRAIL_Z, LANE_WIDTH, laneZ, MEDIAN_Z, PAVED, ROAD_Z, WINDOW, wrapRel } from "./layout";

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
  return { barrier, rails, lamp, lampHeads, cabinet, gantry, sign, dash, joint, post };
}

/** Vegetation along both verges over one 500 m layout (the window's period, which divides the route): clumps of mixed species, shrubs near the rails. */
const ROAD_PLANTS: Plant[] = (() => {
  const out: Plant[] = [];
  const r = rng(515);
  const kinds: Species[] = ["broadleaf", "spreading", "columnar", "broadleaf", "young"];
  for (let clump = 0; clump < 44; clump++) {
    const side = clump % 2 ? 1 : -1;
    const cx = r() * WINDOW;
    const cz = side > 0 ? PAVED.z1 + 9 + r() * 46 : ROAD_Z - 10 - r() * 46;
    const n = 2 + Math.floor(r() * 4);
    const kind = kinds[Math.floor(r() * kinds.length)];
    for (let k = 0; k < n; k++) out.push({ x: cx + (r() - 0.5) * 14, z: cz + (r() - 0.5) * 10, species: r() < 0.75 ? kind : kinds[Math.floor(r() * kinds.length)], scale: 0.8 + r() * 0.55, rot: r() * Math.PI * 2, seed: out.length * 5 + 1 });
  }
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1;
    out.push({ x: r() * WINDOW, z: side > 0 ? PAVED.z1 + 2.2 + r() * 3 : ROAD_Z - 4.4 - r() * 2.5, species: "shrub", scale: 0.9 + r() * 0.7, rot: r() * Math.PI * 2, seed: out.length * 5 + 2 });
  }
  return out;
})();

/** Buildings beside the highway over one 500 m strip, set well back from both verges. */
const ROAD_LOTS: Lot[] = (() => {
  const lots: Lot[] = [];
  const r = rng(808);
  for (let i = 0; lots.length < 34 && i < 400; i++) {
    const side = i % 2 ? 1 : -1;
    const x = -WINDOW / 2 + r() * WINDOW;
    const z = side > 0 ? PAVED.z1 + 230 + r() * 150 : ROAD_Z - 230 - r() * 150;
    if (lots.some((l) => Math.hypot(l.x - x, l.z - z) < 46)) continue;
    lots.push({ x, z, size: 0.8 + r() * 0.5, height: r() < 0.18 ? 0.55 + r() * 0.35 : r() * 0.45, seed: i + 900 });
  }
  return lots;
})();

const COUNTS = { dash: 40, joint: 100, post: 100, lamp: 10, cabinet: 10, gantry: 2 };

export function Corridor() {
  const gl = useThree((s) => s.gl);
  const geo = useMemo(() => {
    const city = buildCity(ROAD_LOTS);
    return { ...geometries(), cityGlass: city.glass, cityConcrete: city.concrete, hills: hillRing(380, 450) };
  }, []);
  const tex = useMemo(() => {
    const asphalt = asphaltTexture();
    asphalt.repeat.set(WINDOW / 8, (PAVED.z1 - PAVED.z0) / 8);
    const grass = grassTexture();
    grass.repeat.set(WINDOW / 10, 12);
    const sign = laneSignTexture();
    const glassFacadeTex = glassFacade();
    const concreteFacadeTex = concreteFacade();
    return { asphalt, grass, sign, glassFacadeTex, concreteFacadeTex };
  }, []);
  const m = useMemo(
    () => ({
      road: new MeshStandardMaterial({ map: tex.asphalt, color: "#62666c", roughness: 0.86, metalness: 0.02 }),
      paint: new MeshStandardMaterial({ color: "#e8eae6", roughness: 0.55, emissive: new Color("#ffffff"), emissiveIntensity: 0.06, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      concrete: new MeshStandardMaterial({ color: "#a7aaa8", roughness: 0.85 }),
      joint: new MeshStandardMaterial({ color: "#6d706f", roughness: 0.9 }),
      steel: new MeshStandardMaterial({ color: "#a9aeb4", metalness: 0.85, roughness: 0.35 }),
      dark: new MeshStandardMaterial({ color: "#3a3f45", metalness: 0.6, roughness: 0.45 }),
      head: new MeshStandardMaterial({ color: "#ffffff", emissive: new Color("#fff1dc"), emissiveIntensity: 2.2 }),
      cabinet: new MeshStandardMaterial({ color: "#c9cdd1", metalness: 0.4, roughness: 0.45 }),
      sign: new MeshStandardMaterial({ map: tex.sign, roughness: 0.4, emissive: new Color("#ffffff"), emissiveMap: tex.sign, emissiveIntensity: 0.35 }),
      grass: antiTile(new MeshStandardMaterial({ map: tex.grass, color: "#e4e8d8", roughness: 0.95 })),
      cityGlass: cityMaterials(tex.glassFacadeTex, tex.concreteFacadeTex).glass,
      cityConcrete: cityMaterials(tex.glassFacadeTex, tex.concreteFacadeTex).concrete,
      hills: new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: DoubleSide }),
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
  const wrapTree = useMemo(() => (x: number) => wrapRel(x, runtime.road.state.x, WINDOW, LO), []);
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
        <mesh material={m.grass} position={[0, -0.04, PAVED.z0 - 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[WINDOW, 120]} />
        </mesh>
        <mesh material={m.grass} position={[0, -0.04, PAVED.z1 + 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[WINDOW, 120]} />
        </mesh>
        <Forest plants={ROAD_PLANTS} wrap={wrapTree} />
        {[0, 1].map((c) => (
          <group key={c} ref={(el) => { skyline.current[c] = el; }}>
            <mesh geometry={geo.cityGlass} material={m.cityGlass} />
            <mesh geometry={geo.cityConcrete} material={m.cityConcrete} />
          </group>
        ))}
        <mesh geometry={geo.hills} material={m.hills} position={[0, 0, ROAD_Z]} />
      </group>
    </group>
  );
}
