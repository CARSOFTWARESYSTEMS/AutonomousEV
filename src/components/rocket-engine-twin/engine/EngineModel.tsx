// The engine: one mesh per semantic part. A part owns everything it does in
// response to state: where it sits in the exploded view, whether it is cut
// open, how far it has receded, its tint, its spin, and picking.
import { useEffect, useMemo, useRef } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { Color, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { DEFAULT_LOOK, damp, frame } from "../scene/frameState";
import { useRocketTwinStore } from "../state/twinStore";
import type { PartId } from "../types";
import { PARTS, PART_IDS, PUMPS, PUMP_OF, explodedOffset, isCut } from "./layout";
import { FINISH, createMaterial } from "./materials";

const WHITE = new Color("#ffffff");
const BLACK = new Color("#000000");
const tint = new Color();
const offset: [number, number, number] = [0, 0, 0];

function EnginePart({ id }: { id: PartId }) {
  const def = PARTS[id];
  const cut = useRocketTwinStore((s) => isCut(def, s.cutaway));
  const solid = useMemo(() => def.build(false), [def]);
  const opened = useMemo(() => (def.cutBy ? def.build(true) : null), [def]);
  const material = useMemo(() => createMaterial(def.material), [def]);
  const base = useMemo(() => new Color(FINISH[def.material].color), [def]);
  const group = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const live = useRef({ dim: 0, opacity: 1, strength: 0 });

  useEffect(
    () => () => {
      solid.dispose();
      opened?.dispose();
      material.dispose();
    },
    [solid, opened, material],
  );

  useFrame((_, delta) => {
    const root = group.current;
    const surface = body.current?.material as MeshStandardMaterial | undefined;
    if (!root || !surface) return;
    const dt = Math.min(delta, 0.1);
    const state = useRocketTwinStore.getState();
    const look = frame.looks.get(id) ?? DEFAULT_LOOK;
    const l = live.current;

    // Place: the exploded view, plus the shake of a turbopump whose bearing is wearing.
    explodedOffset(def, frame.exploded, offset);
    const shake = PUMP_OF[id] === "fuel" ? 0.0045 * frame.severity * frame.engine.rotor : 0;
    root.position.set(offset[0] + shake * Math.sin(frame.now * 83), offset[1], offset[2] + shake * Math.cos(frame.now * 71));
    if (spin.current && def.rotor) spin.current.rotation.y = frame.rotorAngle * (def.rotor === "fuel" ? 1 : -1.15);

    // Recede.
    l.dim = damp(l.dim, look.dim, 7, dt);
    surface.color.copy(base).multiplyScalar(1 - 0.84 * l.dim);

    // Fade.
    l.opacity = damp(l.opacity, look.opacity, 9, dt);
    if (Math.abs(l.opacity - look.opacity) < 0.004) l.opacity = look.opacity;
    root.visible = l.opacity > 0.012;
    const transparent = l.opacity < 0.995;
    if (surface.transparent !== transparent) {
      surface.transparent = transparent;
      surface.needsUpdate = true;
    }
    surface.opacity = l.opacity;
    surface.depthWrite = l.opacity > 0.4;

    // Tint: state colour, selection, and a touch more under the pointer.
    const hovered = def.component !== null && state.hovered === def.component && look.selectable;
    const target = Math.min(0.8, look.strength + (hovered ? 0.1 : 0));
    l.strength = damp(l.strength, target, 10, dt);
    tint.set(look.tint ?? "#ffffff");
    if (hovered) tint.lerp(WHITE, 0.5);
    surface.emissive.copy(l.strength > 0.002 ? tint : BLACK);
    surface.emissiveIntensity = l.strength;
  });

  const selectable = () => (frame.looks.get(id) ?? DEFAULT_LOOK).selectable && live.current.opacity > 0.3;

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!selectable()) return;
    event.stopPropagation();
    useRocketTwinStore.getState().setHovered(def.component);
  };
  const onPointerOut = () => {
    const state = useRocketTwinStore.getState();
    if (state.hovered === def.component) state.setHovered(null);
  };
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    // A drag that ends on the part is a camera move, not a selection.
    if (!selectable() || event.delta > 5 || !def.component) return;
    event.stopPropagation();
    useRocketTwinStore.getState().selectComponent(def.component);
  };
  const onDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!selectable() || !def.component) return;
    event.stopPropagation();
    useRocketTwinStore.getState().focusComponent(def.component);
  };

  const mesh = <mesh ref={body} geometry={cut && opened ? opened : solid} material={material} castShadow receiveShadow />;

  return (
    <group ref={group} name={id} userData={{ partId: id }} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick} onDoubleClick={onDoubleClick}>
      {def.rotor ? (
        <group ref={spin} position={PUMPS[def.rotor].base as [number, number, number]} scale={PUMPS[def.rotor].scale}>
          {mesh}
        </group>
      ) : (
        mesh
      )}
    </group>
  );
}

export default function EngineModel() {
  return (
    <group name="Engine">
      {PART_IDS.map((id) => (
        <EnginePart key={id} id={id} />
      ))}
    </group>
  );
}
