"use client";
// The procedural battery pack, built entirely from data: the resolved pack, its
// layout and the simulation. Cells are instanced (one InstancedMesh per
// module). Every mesh carries a toolkit component id, which is all selection
// and the diagnostic overlays use — so a GLB can replace this geometry later.
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import { BoxGeometry, BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute, Matrix4, Mesh, Quaternion, Vector3, type Group, type InstancedMesh } from "three";
import { sensorGroups } from "@/lib/ev-battery-toolkit/simulation";
import type { PackLayoutResult } from "@/lib/ev-battery-toolkit/pack";
import type { SimulationResult } from "@/lib/ev-battery-toolkit/simulation";
import type { BatteryArchitecture, BatteryPack, ComponentId } from "@/lib/ev-battery-toolkit/types";
import type { ViewMode } from "../state/store";
import { COLOR, thermalColor, voltageColor } from "./palette";

export interface PackModelProps {
  pack: BatteryPack;
  layout: PackLayoutResult;
  sim: SimulationResult;
  architecture: BatteryArchitecture;
  view: ViewMode;
  xray: boolean;
  /** 0 = assembled, 1 = fully exploded; animated outside React. */
  explode: RefObject<number>;
  exploded: boolean;
  selected: ComponentId | null;
  highlightGroup: number | null;
  /** Components a known or revealed fault sits in. */
  faultComponents: ComponentId[];
  swelling: boolean;
  reducedMotion: boolean;
  onSelect: (id: ComponentId, group?: number) => void;
}

type Vec3 = [number, number, number];

/** Moves its children by `offset × explode`, every frame, without re-rendering React. */
function Explodable({ explode, offset, children }: { explode: RefObject<number>; offset: Vec3; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const k = explode.current ?? 0;
    ref.current?.position.set(offset[0] * k, offset[1] * k, offset[2] * k);
  });
  return <group ref={ref}>{children}</group>;
}

function useClick(id: ComponentId, onSelect: PackModelProps["onSelect"]) {
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };
}

const hover = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  },
  onPointerOut: () => {
    document.body.style.cursor = "";
  },
};

function Part({
  id,
  size,
  position,
  color,
  selected,
  fault,
  opacity = 1,
  pickable = true,
  onSelect,
  edges,
  metalness = 0.18,
  roughness = 0.62,
}: {
  id: ComponentId;
  size: Vec3;
  position: Vec3;
  color: string;
  selected: boolean;
  fault: boolean;
  opacity?: number;
  pickable?: boolean;
  onSelect: PackModelProps["onSelect"];
  edges?: string;
  metalness?: number;
  roughness?: number;
}) {
  const click = useClick(id, onSelect);
  const transparent = opacity < 1;
  return (
    <mesh
      position={position}
      userData={{ componentId: id }}
      onClick={pickable ? click : undefined}
      {...(pickable ? hover : {})}
      raycast={pickable ? Mesh.prototype.raycast : () => null}
    >
      <boxGeometry args={size} />
      {/* Keyed on transparency: three.js does not re-apply `transparent` to a material already in use. */}
      <meshStandardMaterial
        key={transparent ? "translucent" : "opaque"}
        color={color}
        metalness={metalness}
        roughness={roughness}
        transparent={transparent}
        opacity={opacity}
        depthWrite={!transparent}
        emissive={selected ? COLOR.selected : fault ? COLOR.fault : "#000000"}
        emissiveIntensity={selected ? 0.55 : fault ? 0.6 : 0}
      />
      {edges ? <Edges color={selected ? COLOR.highlight : edges} /> : null}
    </mesh>
  );
}

const tmpMatrix = new Matrix4();
const tmpQuat = new Quaternion();
const tmpScale = new Vector3();
const tmpPos = new Vector3();
const tmpColor = new Color();

function ModuleCells({ slots, geometry, colors, scales, onPick }: { slots: { position: Vec3; group: number }[]; geometry: BufferGeometry; colors: string[]; scales: Vec3[]; onPick: (group: number) => void }) {
  const ref = useRef<InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    slots.forEach((slot, i) => {
      tmpPos.set(...slot.position);
      tmpScale.set(...scales[i]);
      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
      mesh.setMatrixAt(i, tmpMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidate();
  }, [slots, scales, invalidate]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    colors.forEach((c, i) => mesh.setColorAt(i, tmpColor.set(c)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
  }, [colors, invalidate]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, undefined, slots.length]}
      userData={{ componentId: "cells" }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) onPick(slots[e.instanceId].group);
      }}
      {...hover}
    >
      <meshStandardMaterial metalness={0.15} roughness={0.5} />
    </instancedMesh>
  );
}

/** Animates the dashes along the current path. */
function FlowLine({ points, reverse, reducedMotion }: { points: Vec3[]; reverse: boolean; reducedMotion: boolean }) {
  const ref = useRef<{ material: { dashOffset: number } } | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.material.dashOffset += (reverse ? 1 : -1) * delta * 0.9;
    invalidate();
  });
  return <Line ref={ref as never} points={points} color={reverse ? "#60a5fa" : "#fbbf24"} lineWidth={2.5} dashed dashSize={0.22} gapSize={0.14} />;
}

export default function PackModel(props: PackModelProps) {
  const { pack, layout, sim, architecture, view, xray, explode, exploded, selected, highlightGroup, faultComponents, swelling, reducedMotion, onSelect } = props;
  const [ex, ey, ez] = layout.enclosure;
  const body = layout.cellBody;
  const format = pack.config.format;
  const groupTemps = sim.snapshot.groupTemps;
  const groupVolts = sim.snapshot.groupVoltages;
  const affected = sim.snapshot.weakGroup ?? sim.snapshot.hotGroup;
  const isFault = (id: ComponentId) => faultComponents.includes(id);
  const isSel = (id: ComponentId) => selected === id;

  const seeThrough = xray || exploded || view !== "normal";
  const shellOpacity = seeThrough ? 0.1 : 1;

  const geometry = useMemo<BufferGeometry>(() => {
    if (format === "cylindrical") return new CylinderGeometry(body[0] / 2, body[0] / 2, body[1], 18);
    return new BoxGeometry(body[0], body[1], body[2]);
  }, [format, body]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const blockTop = Math.max(...layout.cells.map((c) => c.position[1])) + body[1] / 2;
  const blockBottom = Math.min(...layout.cells.map((c) => c.position[1])) - body[1] / 2;

  // ── Per-module cell data ──
  const modules = useMemo(
    () =>
      layout.modules.map((m) => {
        const slots = layout.cells.filter((c) => c.module === m.module).map((c) => ({ position: c.position, group: c.group }));
        return { module: m, slots };
      }),
    [layout],
  );

  const avg = groupVolts.reduce((a, b) => a + b, 0) / Math.max(1, groupVolts.length);
  const sensors = useMemo(() => sensorGroups(pack.series), [pack.series]);

  const colorOfGroup = (g: number): string => {
    if (highlightGroup !== null) return g === highlightGroup ? COLOR.highlight : view === "normal" ? COLOR.dim : colorFor(g);
    return colorFor(g);
  };
  function colorFor(g: number): string {
    switch (view) {
      case "thermal":
        return thermalColor(groupTemps[g]);
      case "voltage":
        return voltageColor((groupVolts[g] - avg) * 1000);
      case "current":
      case "bms":
        return COLOR.dim;
      default:
        if (isFault("cells") && affected === g) return "#b4535a";
        return pack.config.chemistry === "LFP" ? COLOR.cellLFP : COLOR.cellNMC;
    }
  }

  const moduleData = modules.map(({ module, slots }) => {
    const colors = slots.map((s) => colorOfGroup(s.group));
    const scales: Vec3[] = slots.map((s) => {
      if (swelling && s.group === affected) return format === "cylindrical" ? [1.12, 1, 1.12] : [1.45, 1.02, 1.04];
      return [1, 1, 1];
    });
    return { module, slots, colors, scales };
  });

  // ── Busbars: one strip per series group across its cells' tops ──
  const busbars = useMemo(() => {
    const out: { group: number; module: number; center: Vec3; size: Vec3 }[] = [];
    for (let g = 0; g < pack.series; g++) {
      const cells = layout.cells.filter((c) => c.group === g);
      if (!cells.length) continue;
      const xs = cells.map((c) => c.position[0]);
      const zs = cells.map((c) => c.position[2]);
      const w = Math.max(...xs) - Math.min(...xs) + body[0] * 0.8;
      const d = Math.max(...zs) - Math.min(...zs) + (format === "cylindrical" ? body[2] * 0.8 : 0.12);
      out.push({ group: g, module: cells[0].module, center: [(Math.max(...xs) + Math.min(...xs)) / 2, blockTop + 0.015, (Math.max(...zs) + Math.min(...zs)) / 2], size: [Math.max(0.05, w), 0.02, Math.max(0.05, format === "cylindrical" ? d : 0.12)] });
    }
    return out;
  }, [layout, pack.series, body, blockTop, format]);

  // ── Fixed parts placed from the architecture ──
  const bmsSpec = useMemo((): { position: Vec3; size: Vec3; offset: Vec3; anchor: Vec3 } => {
    switch (architecture.bmsPosition) {
      case "top":
        return { position: [0, blockTop + 0.13, 0], size: [ex * 0.42, 0.05, ez * 0.5], offset: [0, 2.4, 0], anchor: [0, blockTop + 0.13, 0] };
      case "side":
        return { position: [0, 0, ez / 2 - 0.1], size: [ex * 0.45, ey * 0.55, 0.05], offset: [0, 0, 1.1], anchor: [0, 0, ez / 2 - 0.1] };
      default:
        return { position: [ex / 2 - 0.13, 0, 0], size: [0.05, ey * 0.62, ez * 0.6], offset: [1.3, 0, 0], anchor: [ex / 2 - 0.13, 0, 0] };
    }
  }, [architecture.bmsPosition, blockTop, ex, ey, ez]);

  const connectorAt = (face: "front" | "rear" | "top", z: number): { position: Vec3; offset: Vec3 } => {
    if (face === "front") return { position: [ex / 2 + 0.1, ey * 0.1, z], offset: [0.7, 0, 0] };
    if (face === "rear") return { position: [-ex / 2 - 0.1, ey * 0.1, z], offset: [-0.7, 0, 0] };
    return { position: [ex * 0.3, ey / 2 + 0.12, z], offset: [0, 0.9, 0] };
  };
  const discharge = architecture.connectors.find((c) => c.id === "discharge");
  const charge = architecture.connectors.find((c) => c.id === "charge");
  const dischargePos = discharge ? connectorAt(discharge.face, charge && charge.face === discharge.face ? -ez * 0.2 : -ez * 0.15) : null;
  const chargePos = charge ? connectorAt(charge.face, ez * 0.2) : null;
  // Fuse and shunt sit inside, next to the discharge exit.
  const exitX = discharge?.face === "rear" ? -ex / 2 + 0.16 : ex / 2 - 0.16;
  const fusePos: Vec3 = [exitX, blockTop + 0.08, -ez * 0.32];
  const shuntPos: Vec3 = [exitX, blockTop + 0.08, -ez * 0.12];

  // ── Voltage-sense harness: each group's top to the BMS ──
  const harness = useMemo(() => {
    const positions: number[] = [];
    const lift = blockTop + 0.09;
    for (const c of layout.groupCenters) {
      positions.push(c[0], blockTop, c[2], c[0], lift, c[2]);
      positions.push(c[0], lift, c[2], bmsSpec.anchor[0], Math.max(lift, bmsSpec.anchor[1]), bmsSpec.anchor[2]);
    }
    return new BufferGeometry().setAttribute("position", new Float32BufferAttribute(positions, 3));
  }, [layout.groupCenters, blockTop, bmsSpec.anchor]);
  useEffect(() => () => harness.dispose(), [harness]);

  // ── Current path for the flow view ──
  const flowY = blockTop + 0.06;
  const flowStart: Vec3 = dischargePos ? dischargePos.position : [ex / 2, flowY, 0];
  const flow: Vec3[] = [
    flowStart,
    [exitX, flowY, flowStart[2]],
    fusePos,
    shuntPos,
    ...layout.groupCenters.map((c): Vec3 => [c[0], flowY, c[2]]),
    [layout.groupCenters[layout.groupCenters.length - 1]?.[0] ?? 0, flowY, ez / 2 - 0.2],
    [flowStart[0], flowY, ez * 0.3],
  ];

  const harnessBright = view === "bms" || isSel("sense-harness");
  const moduleCount = layout.modules.length;

  return (
    <group>
      {/* Enclosure tray and its parts. */}
      <Part id="enclosure" size={[ex, ey, ez]} position={[0, 0, 0]} color={COLOR.enclosure} selected={isSel("enclosure")} fault={isFault("enclosure")} opacity={shellOpacity} pickable={!seeThrough} onSelect={onSelect} edges="#51608a" metalness={0.22} roughness={0.45} />
      <Explodable explode={explode} offset={[0, 1.7, 0]}>
        <Part id="cover" size={[ex + 0.04, 0.06, ez + 0.04]} position={[0, ey / 2 + 0.03, 0]} color={COLOR.cover} selected={isSel("cover")} fault={isFault("cover")} opacity={seeThrough ? 0.12 : 1} pickable={!seeThrough || exploded} onSelect={onSelect} edges="#5b6b94" metalness={0.22} />
        {architecture.removal === "swappable" ? (
          <mesh position={[0, ey / 2 + 0.06, 0]} rotation={[0, 0, 0]} userData={{ componentId: "cover" }}>
            <torusGeometry args={[Math.min(0.42, ex * 0.18), 0.05, 10, 28, Math.PI]} />
            <meshStandardMaterial color="#1f2a44" metalness={0.4} roughness={0.5} />
          </mesh>
        ) : null}
      </Explodable>
      <Explodable explode={explode} offset={[0, 0.95, 0]}>
        <Part id="gasket" size={[ex + 0.02, 0.025, ez + 0.02]} position={[0, ey / 2 - 0.012, 0]} color={COLOR.gasket} selected={isSel("gasket")} fault={isFault("gasket")} opacity={exploded ? 0.9 : 0.35} pickable={exploded} onSelect={onSelect} edges="#334155" />
      </Explodable>
      <Explodable explode={explode} offset={[0, 0.55, 0]}>
        <Part id="insulation" size={[ex - 0.3, 0.012, ez - 0.25]} position={[0, blockTop + 0.05, 0]} color={COLOR.insulation} selected={isSel("insulation")} fault={isFault("insulation")} opacity={exploded || isSel("insulation") ? 0.35 : 0.06} pickable={exploded} onSelect={onSelect} />
      </Explodable>
      <Explodable explode={explode} offset={[0, -0.6, 0]}>
        <Part id="tim" size={[ex - 0.3, 0.04, ez - 0.25]} position={[0, blockBottom - 0.03, 0]} color={COLOR.tim} selected={isSel("tim")} fault={isFault("tim")} opacity={0.8} pickable={exploded || seeThrough} onSelect={onSelect} />
      </Explodable>

      {/* Modules: cells, holders or compression plates, busbars. */}
      {moduleData.map(({ module, slots, colors, scales }) => {
        const spread = moduleCount > 1 ? (module.module - (moduleCount - 1) / 2) * 0.9 : 0;
        const [mx, , mz] = module.size;
        return (
          <Explodable key={module.module} explode={explode} offset={[spread, 0, 0]}>
            <mesh position={module.center} raycast={() => null}>
              <boxGeometry args={module.size} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              <Edges color={isSel("modules") ? COLOR.highlight : isFault("modules") ? COLOR.fault : "#4b5b80"} />
            </mesh>
            <ModuleCells key={`${format}-${slots.length}`} slots={slots} geometry={geometry} colors={colors} scales={scales} onPick={(g) => onSelect("cells", g)} />
            {format === "cylindrical" ? (
              <>
                <Part id="cell-holders" size={[mx - 0.04, 0.035, mz - 0.04]} position={[module.center[0], blockTop - 0.06, 0]} color={COLOR.holder} selected={isSel("cell-holders")} fault={isFault("cell-holders")} opacity={view === "normal" && !isSel("cell-holders") ? 0.35 : 0.15} pickable={false} onSelect={onSelect} />
                <Part id="cell-holders" size={[mx - 0.04, 0.035, mz - 0.04]} position={[module.center[0], blockBottom + 0.06, 0]} color={COLOR.holder} selected={isSel("cell-holders")} fault={isFault("cell-holders")} opacity={view === "normal" && !isSel("cell-holders") ? 0.35 : 0.15} pickable={false} onSelect={onSelect} />
              </>
            ) : (
              <>
                <Part id="modules" size={[0.05, blockTop - blockBottom, mz]} position={[module.center[0] - mx / 2 - 0.03, (blockTop + blockBottom) / 2, 0]} color="#3a4663" selected={isSel("modules")} fault={false} onSelect={onSelect} metalness={0.3} />
                <Part id="modules" size={[0.05, blockTop - blockBottom, mz]} position={[module.center[0] + mx / 2 + 0.03, (blockTop + blockBottom) / 2, 0]} color="#3a4663" selected={isSel("modules")} fault={false} onSelect={onSelect} metalness={0.3} />
              </>
            )}
            {busbars
              .filter((b) => b.module === module.module)
              .map((b) => (
                <Part key={b.group} id="busbars" size={b.size} position={b.center} color={view === "current" ? "#d6dbe6" : COLOR.busbar} selected={isSel("busbars")} fault={isFault("busbars") && b.group === affected} onSelect={onSelect} metalness={0.4} roughness={0.3} />
              ))}
          </Explodable>
        );
      })}

      {/* Temperature sensors at the BMS channels. */}
      {sensors.map((g, ch) => {
        const c = layout.groupCenters[g];
        if (!c) return null;
        const failed = sim.snapshot.failedSensors.includes(ch);
        return (
          <Explodable key={`ntc-${ch}`} explode={explode} offset={[moduleCount > 1 ? (layout.cells.find((x) => x.group === g)!.module - (moduleCount - 1) / 2) * 0.9 : 0, 0, 0]}>
            <Part id="temp-sensors" size={[0.09, 0.05, 0.09]} position={[c[0], blockTop + 0.05, c[2] + Math.min(0.25, ez * 0.1)]} color={failed ? COLOR.fault : COLOR.sensor} selected={isSel("temp-sensors")} fault={failed && isFault("temp-sensors")} onSelect={onSelect} />
          </Explodable>
        );
      })}

      {/* BMS board with a few components on it. */}
      <Explodable explode={explode} offset={bmsSpec.offset}>
        <Part id="bms" size={bmsSpec.size} position={bmsSpec.position} color={view === "bms" ? "#155e75" : COLOR.bms} selected={isSel("bms")} fault={isFault("bms")} onSelect={onSelect} edges={view === "bms" ? "#67e8f9" : "#1e5a6e"} />
      </Explodable>

      {/* Main current path parts. */}
      <Explodable explode={explode} offset={[0, 0.9, 0]}>
        <Part id="fuse" size={[0.14, 0.08, 0.1]} position={fusePos} color={COLOR.fuse} selected={isSel("fuse")} fault={isFault("fuse")} onSelect={onSelect} />
        <Part id="current-sensor" size={[0.16, 0.04, 0.08]} position={shuntPos} color={COLOR.shunt} selected={isSel("current-sensor")} fault={isFault("current-sensor")} onSelect={onSelect} metalness={0.4} roughness={0.35} />
      </Explodable>
      {dischargePos ? (
        <Explodable explode={explode} offset={dischargePos.offset}>
          <Part id="discharge-connector" size={[0.18, 0.2, 0.3]} position={dischargePos.position} color={COLOR.discharge} selected={isSel("discharge-connector")} fault={isFault("discharge-connector")} onSelect={onSelect} />
        </Explodable>
      ) : null}
      {chargePos ? (
        <Explodable explode={explode} offset={chargePos.offset}>
          <Part id="charge-connector" size={[0.16, 0.16, 0.22]} position={chargePos.position} color={COLOR.charge} selected={isSel("charge-connector")} fault={isFault("charge-connector")} onSelect={onSelect} />
        </Explodable>
      ) : null}
      <Part id="vent" size={[0.04, 0.16, 0.16]} position={[-ex / 2 - 0.02, ey * 0.25, ez * 0.3]} color={COLOR.vent} selected={isSel("vent")} fault={isFault("vent")} onSelect={onSelect} />

      {/* Sense harness, hidden while exploded so it never points at the wrong place. */}
      {!exploded ? (
        <lineSegments geometry={harness} raycast={() => null} userData={{ componentId: "sense-harness" }}>
          <lineBasicMaterial color={harnessBright ? "#a5f3fc" : COLOR.harness} transparent opacity={harnessBright ? 0.95 : seeThrough ? 0.35 : 0} />
        </lineSegments>
      ) : null}

      {view === "current" && !exploded ? <FlowLine points={flow} reverse={sim.snapshot.packCurrent.value !== null && sim.snapshot.packCurrent.value < 0} reducedMotion={reducedMotion} /> : null}
    </group>
  );
}
