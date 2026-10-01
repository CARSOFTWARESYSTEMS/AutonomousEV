// Wraps the meshes of one semantic component. Owns everything a part does in
// response to state: separation in the exploded view, fading for X-ray and
// system focus, highlight, health and heat tint, and picking.
import { useLayoutEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Color, type Group, type Material, type Mesh, type MeshStandardMaterial } from "three";
import type { ComponentId, HealthState, Vec3 } from "../types";
import { COMPONENTS, ENCLOSED, assemblyOf } from "../data/componentDefinitions";
import { STATE_COLOR } from "../data/uflightReferenceAircraft";
import { damp } from "../lib/math";
import { frame } from "../scene/frameState";
import { THERMAL_LEGEND, thermalClass } from "../simulation/thermal";
import { useUFlightStore } from "../state/uflightStore";
import { PLACEMENT } from "./layout";
import { registerPart, unregisterPart } from "./modelRegistry";

interface Tracked {
  material: MeshStandardMaterial;
  baseOpacity: number;
  baseEmissive: Color;
  baseEmissiveIntensity: number;
  /** The material animates its own emissive (lights, screens). */
  live: boolean;
}

const WHITE = new Color("#ffffff");
const HEALTH_COLOR = Object.fromEntries(Object.entries(STATE_COLOR).map(([state, hex]) => [state, new Color(hex)])) as Record<HealthState, Color>;
const THERMAL_COLOR = Object.fromEntries(THERMAL_LEGEND.map((c) => [c.id, new Color(c.color)]));
const THERMAL_STRENGTH = { COOL: 0.4, NOMINAL: 0.24, WARM: 0.5, LIMITED: 0.62 } as const;
const overlay = new Color();

/** Fade a part: below full opacity its materials blend and stop writing depth. */
function applyOpacity(materials: Tracked[], factor: number) {
  for (const t of materials) {
    const opacity = t.baseOpacity * factor;
    const transparent = opacity < 0.995;
    t.material.opacity = opacity;
    // Below the "context" level so a part never changes depth behaviour as a fade settles.
    t.material.depthWrite = opacity > 0.4;
    if (t.material.transparent !== transparent) {
      t.material.transparent = transparent;
      // Opaque and blended materials use different shader variants, so the program has to be re-selected.
      t.material.needsUpdate = true;
    }
  }
}

/** Mix an emissive tint over a part's own emissive colour. */
function applyOverlay(materials: Tracked[], tint: Color, strength: number) {
  for (const t of materials) {
    if (t.live) continue;
    t.material.emissive.copy(t.baseEmissive).lerp(tint, strength);
    t.material.emissiveIntensity = t.baseEmissiveIntensity + (1 - t.baseEmissiveIntensity) * strength;
  }
}

interface PartProps {
  id: ComponentId;
  /**
   * The part sits inside a group that already carries its assembly's level 1
   * displacement (a propulsion unit), so it applies only its own level 2 move.
   */
  nested?: boolean;
  children: React.ReactNode;
}

export function Part({ id, nested = false, children }: PartProps) {
  const group = useRef<Group>(null);
  const tracked = useRef<Tracked[]>([]);
  const live = useRef({ opacity: 1, appliedOpacity: -1, appliedOverlay: -1, appliedOverlayColor: 0, sub: 0, deep: 0 });
  // Inside the airframe: casts no shadow of its own and is not drawn while the skin hides it.
  const enclosed = ENCLOSED.has(id);

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;
    const meshes: Mesh[] = [];
    const materials: Tracked[] = [];
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      meshes.push(mesh);
      if (enclosed) mesh.castShadow = false;
      const list = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Material[];
      list.forEach((m) => {
        const material = m as MeshStandardMaterial;
        if (!material.isMeshStandardMaterial) return;
        materials.push({
          material,
          baseOpacity: material.opacity,
          baseEmissive: material.emissive.clone(),
          baseEmissiveIntensity: material.emissiveIntensity,
          live: Boolean(material.userData.live),
        });
      });
    });
    tracked.current = materials;
    registerPart(id, root, meshes);
    return () => unregisterPart(id, root);
  }, [id, enclosed]);

  useFrame((_, delta) => {
    const root = group.current;
    if (!root) return;
    const state = useUFlightStore.getState();
    const dt = Math.min(delta, 0.1);
    const placement = PLACEMENT[id];
    const l = live.current;
    const instant = state.reducedMotion;

    // ── Position: major-assembly move, then the part's own move within its assembly ──
    const subTarget = frame.subOpen.get(id) ? frame.exploded : 0;
    l.sub = instant ? subTarget : damp(l.sub, subTarget, 7, dt);
    if (Math.abs(l.sub - subTarget) < 0.001) l.sub = subTarget;
    const deepTarget = frame.deepOpen.get(id) ? frame.exploded : 0;
    l.deep = instant ? deepTarget : damp(l.deep, deepTarget, 7, dt);
    if (Math.abs(l.deep - deepTarget) < 0.001) l.deep = deepTarget;
    frame.deep.set(id, l.deep);
    const e = nested ? 0 : frame.exploded;
    root.position.set(
      placement.explode[0] * e + placement.explode2[0] * l.sub,
      placement.explode[1] * e + placement.explode2[1] * l.sub,
      placement.explode[2] * e + placement.explode2[2] * l.sub,
    );

    // ── Opacity ──
    const targetOpacity = frame.presentation.get(id)?.opacity ?? 1;
    l.opacity = instant ? targetOpacity : damp(l.opacity, targetOpacity, 9, dt);
    if (Math.abs(l.opacity - targetOpacity) < 0.003) l.opacity = targetOpacity;
    frame.opacity.set(id, l.opacity);
    root.visible = l.opacity > 0.012 && (!enclosed || frame.revealed);
    if (Math.abs(l.opacity - l.appliedOpacity) > 0.002) {
      l.appliedOpacity = l.opacity;
      applyOpacity(tracked.current, l.opacity);
    }

    // ── Emissive overlay: heat, health state, hover and selection ──
    let strength = 0;
    let tint: Color = WHITE;
    const heat = frame.flags.thermal ? frame.thermal[id] : undefined;
    if (heat !== undefined) {
      const thermal = thermalClass(heat);
      tint = THERMAL_COLOR[thermal];
      strength = THERMAL_STRENGTH[thermal];
    } else if (frame.flags.healthTint) {
      // A unit's housing carries a quieter indication of the unit's state than the faulted part itself.
      const own = frame.health[id];
      const definition = COMPONENTS[id];
      const inherited = definition.shell && definition.parent ? frame.health[definition.parent] : undefined;
      const health = own ?? inherited;
      if (health && health !== "NOMINAL") {
        tint = HEALTH_COLOR[health];
        strength = own ? 0.46 + 0.1 * Math.sin(frame.now * 2.2) : 0.2;
      }
    }
    let accent = 0;
    if (state.hoveredComponent === id || (state.hoveredComponent && assemblyOf(id) === state.hoveredComponent)) accent = 0.12;
    else if (state.selectedComponent === id) accent = 0.05;
    const total = Math.min(0.8, strength + accent);
    overlay.copy(tint);
    if (accent > 0 && total > 0) overlay.lerp(WHITE, accent / (strength + accent));
    const colorKey = overlay.getHex();
    if (Math.abs(total - l.appliedOverlay) > 0.004 || colorKey !== l.appliedOverlayColor) {
      l.appliedOverlay = total;
      l.appliedOverlayColor = colorKey;
      applyOverlay(tracked.current, overlay, total);
    }
  });

  const interactive = () => {
    const state = useUFlightStore.getState();
    return state.started && (frame.presentation.get(id)?.selectable ?? true) && live.current.opacity > 0.25;
  };

  /**
   * A part of an assembly is reached through the assembly: the first click
   * selects the propulsion unit or the battery pack, the next the part itself.
   */
  const target = (): ComponentId => {
    const assembly = assemblyOf(id);
    if (assembly === id) return id;
    const focus = useUFlightStore.getState().selectedComponent;
    return focus && assemblyOf(focus) === assembly ? id : assembly;
  };

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive()) return;
    event.stopPropagation();
    useUFlightStore.getState().setHovered(target());
  };
  const onPointerOut = () => {
    const state = useUFlightStore.getState();
    if (state.hoveredComponent === id || state.hoveredComponent === assemblyOf(id)) state.setHovered(null);
  };
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    // A drag that ends on the part is a camera move, not a selection.
    if (!interactive() || event.delta > 5) return;
    event.stopPropagation();
    useUFlightStore.getState().selectComponent(target());
  };
  const onDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive()) return;
    event.stopPropagation();
    useUFlightStore.getState().isolateComponent(target());
  };

  return (
    <group ref={group} name={COMPONENTS[id].meshNames[0].split("/").pop()} userData={{ componentId: id }} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick} onDoubleClick={onDoubleClick}>
      {children}
    </group>
  );
}

/** Moves a whole assembly along its level 1 axis in the exploded view. */
export function Assembly({ id, name, children }: { id: ComponentId; name?: string; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const { explode } = PLACEMENT[id];
    const e = frame.exploded;
    group.current?.position.set(explode[0] * e, explode[1] * e, explode[2] * e);
  });
  return (
    <group ref={group} name={name}>
      {children}
    </group>
  );
}

/** A piece inside a part that separates along its own direction at level 3 (component inspection). */
export function Deep({ of, explode, children }: { of: ComponentId; explode: Vec3; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const d = frame.deep.get(of) ?? 0;
    group.current?.position.set(explode[0] * d, explode[1] * d, explode[2] * d);
  });
  return <group ref={group}>{children}</group>;
}
