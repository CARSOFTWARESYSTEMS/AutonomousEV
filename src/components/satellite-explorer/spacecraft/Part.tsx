// Wraps the meshes of one semantic assembly. Owns everything a part does in
// response to state: installation in Build Mode, separation in the exploded
// view, fading for X-ray / system focus, highlight, thermal tint and picking.
import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Color, type Group, type Material, type Mesh, type MeshStandardMaterial } from "three";
import type { ComponentId, Vec3 } from "../types";
import { COMPONENTS } from "../data/componentDefinitions";
import { damp, easeOutCubic, smoothstep } from "../lib/math";
import { useExplorerStore } from "../state/explorerStore";
import { type PartPresentation, partPresentation } from "../state/selectors";
import { frame } from "../scene/frameState";
import { LAYOUT } from "./layout";
import { registerPart, unregisterPart } from "./modelRegistry";

interface Tracked {
  material: MeshStandardMaterial;
  baseOpacity: number;
  baseEmissive: Color;
  baseEmissiveIntensity: number;
  /** The material animates its own emissive (status LEDs, exposure flash). */
  live: boolean;
}

const THERMAL_COLOR = { warm: new Color("#ff5a2c"), nominal: new Color("#d9b65a"), cool: new Color("#3d8bff") } as const;
const THERMAL_STRENGTH = { warm: 0.5, nominal: 0.16, cool: 0.46 } as const;
/** Surfaces whose temperature follows the Sun rather than internal dissipation. */
const SUN_DRIVEN = new Set<ComponentId>(["solar-array-left", "solar-array-right", "mli-blanket"]);
const WHITE = new Color("#ffffff");
const overlay = new Color();

/** Fade a part: below full opacity its materials blend and stop writing depth. */
function applyOpacity(materials: Tracked[], factor: number) {
  for (const t of materials) {
    const opacity = t.baseOpacity * factor;
    const transparent = opacity < 0.995;
    t.material.opacity = opacity;
    // Below the "context" level (0.5) so a part never changes depth behaviour as a fade settles.
    t.material.depthWrite = opacity > 0.4;
    if (t.material.transparent !== transparent) {
      t.material.transparent = transparent;
      // Opaque and blended materials use different shader variants (three.js forces
      // alpha to 1 in the opaque one), so the program has to be re-selected.
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

/** Seconds between successive parts settling into place within a Build Mode step. */
const INSTALL_STAGGER_S = 0.3;
/** Seconds the highlight pulse from the ANIMATE action lasts. */
const PULSE_S = 1.6;

export function Part({ id, children }: { id: ComponentId; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const tracked = useRef<Tracked[]>([]);
  const presentation = useRef<PartPresentation>({ opacity: 1, selectable: true, focused: false });
  const live = useRef({ install: 1, opacity: 1, appliedOpacity: -1, appliedOverlay: -1, appliedOverlayColor: 0 });

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;
    const meshes: Mesh[] = [];
    const materials: Tracked[] = [];
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      meshes.push(mesh);
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
  }, [id]);

  // Recompute the target appearance only when interaction state changes.
  useEffect(() => {
    const apply = () => {
      presentation.current = partPresentation(useExplorerStore.getState(), id);
    };
    apply();
    return useExplorerStore.subscribe(apply);
  }, [id]);

  useFrame((_, delta) => {
    const root = group.current;
    if (!root) return;
    const state = useExplorerStore.getState();
    const dt = Math.min(delta, 0.1);
    const placement = LAYOUT[id];
    const definition = COMPONENTS[id];
    const l = live.current;

    // ── Installation (Build Mode) ──
    let installTarget = 1;
    if (state.mode === "build") {
      if (definition.buildStep > state.buildStep) installTarget = 0;
      else if (definition.buildStep === state.buildStep) {
        const waited = frame.now - state.buildStepChangedAt;
        installTarget = waited >= placement.order * INSTALL_STAGGER_S ? 1 : l.install;
      }
    }
    l.install = state.reducedMotion ? installTarget : damp(l.install, installTarget, installTarget >= l.install ? 3.4 : 8, dt);
    if (Math.abs(l.install - installTarget) < 0.0015) l.install = installTarget;
    const seated = easeOutCubic(l.install);

    // ── Position: exploded offset plus the approach from staging ──
    const e = frame.exploded;
    const s = 1 - seated;
    root.position.set(
      placement.explode[0] * e + placement.staging[0] * s,
      placement.explode[1] * e + placement.staging[1] * s,
      placement.explode[2] * e + placement.staging[2] * s,
    );

    // ── Opacity ──
    const targetOpacity = presentation.current.opacity * smoothstep(0, 0.3, l.install);
    l.opacity = state.reducedMotion ? targetOpacity : damp(l.opacity, targetOpacity, 9, dt);
    if (Math.abs(l.opacity - targetOpacity) < 0.003) l.opacity = targetOpacity;
    root.visible = l.opacity > 0.012;
    if (Math.abs(l.opacity - l.appliedOpacity) > 0.002) {
      l.appliedOpacity = l.opacity;
      applyOpacity(tracked.current, l.opacity);
    }

    // ── Emissive overlay: thermal tint, hover, selection, ANIMATE pulse ──
    let strength = 0;
    let tint: Color = WHITE;
    if (frame.flags.thermal) {
      const thermalClass = SUN_DRIVEN.has(id) ? (frame.sunFraction > 0.5 ? "warm" : "cool") : placement.thermal;
      tint = THERMAL_COLOR[thermalClass];
      strength = THERMAL_STRENGTH[thermalClass];
    }
    let accent = 0;
    if (state.hoveredComponent === id) accent = 0.13;
    else if (state.selectedComponent === id) accent = 0.06;
    const animation = state.componentAnimation;
    if (animation && animation.id === id) {
      const p = (frame.now - animation.startedAt) / PULSE_S;
      if (p >= 0 && p < 1) accent = Math.max(accent, 0.34 * Math.sin(Math.PI * p) ** 2);
    }
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
    const state = useExplorerStore.getState();
    return state.started && state.mode !== "orbit" && presentation.current.selectable && live.current.install > 0.9 && live.current.opacity > 0.25;
  };

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive()) return;
    event.stopPropagation();
    useExplorerStore.getState().setHovered(id);
  };
  const onPointerOut = () => {
    const state = useExplorerStore.getState();
    if (state.hoveredComponent === id) state.setHovered(null);
  };
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    // A drag that ends on the part is a camera move, not a selection.
    if (!interactive() || event.delta > 5) return;
    event.stopPropagation();
    useExplorerStore.getState().selectComponent(id);
  };
  const onDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive()) return;
    event.stopPropagation();
    useExplorerStore.getState().isolateComponent(id);
  };

  return (
    <group ref={group} name={id} userData={{ componentId: id }} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick} onDoubleClick={onDoubleClick}>
      {children}
    </group>
  );
}

/** A sub-assembly that separates along its own direction in the exploded view. */
export function Offset({ explode, children }: { explode: Vec3; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const e = frame.exploded;
    group.current?.position.set(explode[0] * e, explode[1] * e, explode[2] * e);
  });
  return <group ref={group}>{children}</group>;
}
