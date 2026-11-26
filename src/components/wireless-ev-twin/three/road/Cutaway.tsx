"use client";
// The road section shown in the Cutaway view: a window of the wearing course
// removed over the hero lane (exposing the pad modules and their feeders), and
// a utility trench along the near shoulder whose walls show the construction
// layers and the duct bank. Only this window is opened — the rest of the road
// stays solid. Layer depths are representative, not a pavement design.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, type BufferGeometry, Color, CylinderGeometry, type Group, MeshStandardMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useTwin } from "../../state/store";
import { setAnchor } from "../labels";
import { setVisible } from "../mutate";
import { pick } from "../pick";
import { view } from "../viewState";
import { CUT, LAYERS } from "./layout";

const T = 0.012;
const L = CUT.x1 - CUT.x0;
const XM = (CUT.x0 + CUT.x1) / 2;

/** A thin slab between depths top and bottom (positive, below the surface). */
const slabX = (top: number, bottom: number, z: number) => new BoxGeometry(L, bottom - top, T).translate(XM, -(top + bottom) / 2, z).toNonIndexed();
const slabZ = (top: number, bottom: number, x: number, z0: number, z1: number) => new BoxGeometry(T, bottom - top, z1 - z0).translate(x, -(top + bottom) / 2, (z0 + z1) / 2).toNonIndexed();

function build() {
  const per: BufferGeometry[][] = LAYERS.map(() => []);
  LAYERS.forEach((layer, i) => {
    const top = i === 0 ? 0 : LAYERS[i - 1].bottom;
    const bottom = layer.bottom;
    // Trench walls (both long sides) and the trench part of both end walls carry every layer.
    per[i].push(slabX(top, bottom, CUT.laneZ0 - T / 2), slabX(top, bottom, CUT.trenchZ0 + T / 2));
    per[i].push(slabZ(top, bottom, CUT.x0 + T / 2, CUT.trenchZ0, CUT.laneZ0), slabZ(top, bottom, CUT.x1 - T / 2, CUT.trenchZ0, CUT.laneZ0));
    // Over the lane only the wearing course is removed: its far wall and its end walls.
    if (i === 0) per[i].push(slabX(top, bottom, CUT.laneZ1 + T / 2), slabZ(top, bottom, CUT.x0 + T / 2, CUT.laneZ0, CUT.laneZ1), slabZ(top, bottom, CUT.x1 - T / 2, CUT.laneZ0, CUT.laneZ1));
  });
  const layers = per.map((parts) => mergeGeometries(parts)!);
  const deep = LAYERS[LAYERS.length - 1].bottom;
  const floors = mergeGeometries([
    // Top of the binder course over the lane, where the wearing course was lifted.
    new BoxGeometry(L, T, CUT.laneZ1 - CUT.laneZ0).translate(XM, -LAYERS[0].bottom - T / 2, (CUT.laneZ0 + CUT.laneZ1) / 2).toNonIndexed(),
  ])!;
  const trenchFloor = new BoxGeometry(L, T, CUT.laneZ0 - CUT.trenchZ0).translate(XM, -deep - T / 2, (CUT.trenchZ0 + CUT.laneZ0) / 2).toNonIndexed();
  // Duct bank: three power ducts and one communication duct on a sand bed.
  const zc = (CUT.trenchZ0 + CUT.laneZ0) / 2;
  const duct = (y: number, z: number, r: number) => {
    const g = new CylinderGeometry(r, r, L - 0.04, 20).toNonIndexed();
    g.rotateZ(Math.PI / 2);
    g.translate(XM, y, z);
    return g;
  };
  const power = mergeGeometries([duct(-0.3, zc - 0.14, 0.055), duct(-0.3, zc, 0.055), duct(-0.3, zc + 0.14, 0.055)])!;
  const comms = duct(-0.43, zc + 0.12, 0.032);
  const sand = new BoxGeometry(L - 0.04, 0.08, CUT.laneZ0 - CUT.trenchZ0 - 0.04).translate(XM, -0.5, zc).toNonIndexed();
  return { layers, floors, trenchFloor, power, comms, sand };
}

export function Cutaway() {
  const geo = useMemo(() => build(), []);
  const m = useMemo(
    () => ({
      layers: LAYERS.map((l) => new MeshStandardMaterial({ color: l.color, roughness: 0.95 })),
      floor: new MeshStandardMaterial({ color: "#3b3d42", roughness: 0.9 }),
      power: new MeshStandardMaterial({ color: "#f07c22", roughness: 0.5 }),
      comms: new MeshStandardMaterial({ color: "#3a8f5a", roughness: 0.5 }),
      sand: new MeshStandardMaterial({ color: "#b49a6c", roughness: 1, emissive: new Color("#000000") }),
    }),
    [],
  );
  useEffect(
    () => () => {
      geo.layers.forEach((g) => g.dispose());
      [geo.floors, geo.trenchFloor, geo.power, geo.comms, geo.sand].forEach((g) => g.dispose());
      m.layers.forEach((x) => x.dispose());
      [m.floor, m.power, m.comms, m.sand].forEach((x) => x.dispose());
    },
    [geo, m],
  );
  const root = useRef<Group>(null);
  useFrame(() => {
    const on = useTwin.getState().environment === "dynamic" && view.cut > 0.5;
    setVisible(root.current, on);
    if (!on) return;
    // Labels in a staircase along the trench wall, so thin layers do not stack on screen.
    const zc = (CUT.trenchZ0 + CUT.laneZ0) / 2;
    LAYERS.forEach((l, i) => {
      const top = i === 0 ? 0 : LAYERS[i - 1].bottom;
      setAnchor(`cut-${l.id}`, 9 - i * 2.2, -(top + l.bottom) / 2, CUT.laneZ0);
    });
    setAnchor("cut-ducts", -3, -0.3, zc);
    setAnchor("cut-module", 2.5, 0.0, (CUT.laneZ0 + CUT.laneZ1) / 2);
  });
  return (
    <group ref={root} visible={false} {...pick("road-layers")}>
      {geo.layers.map((g, i) => (
        <mesh key={LAYERS[i].id} geometry={g} material={m.layers[i]} receiveShadow />
      ))}
      <mesh geometry={geo.floors} material={m.floor} receiveShadow />
      <mesh geometry={geo.trenchFloor} material={m.layers[LAYERS.length - 1]} />
      <mesh geometry={geo.sand} material={m.sand} />
      <mesh geometry={geo.power} material={m.power} castShadow />
      <mesh geometry={geo.comms} material={m.comms} />
    </group>
  );
}
