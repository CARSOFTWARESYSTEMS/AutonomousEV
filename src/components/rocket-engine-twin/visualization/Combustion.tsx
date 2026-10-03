// The hot side of the engine: combustion in the chamber, the heat load on its
// wall, the coolant that carries that heat away, the gas expanding through the
// nozzle, and the plume. All of it follows the engine's operating point, so a
// start builds up in order and a shutdown winds down. Conceptual throughout.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { LatheGeometry, type Mesh, type ShaderMaterial, Vector2 } from "three";
import { EXIT_RADIUS, EXIT_Y, INJECTOR_Y, PARTS, REGEN_END_Y, contour, gasRadius, isCut } from "../engine/layout";
import { type V3, pipe, revolve, wall } from "../engine/geometry";
import { damp, frame } from "../scene/frameState";
import { useRocketTwinStore } from "../state/twinStore";
import type { Atmosphere } from "../types";
import { FLOW_COLOR, combustionMaterial, coolantMaterial, flowMaterial, plumeMaterial, wallHeatMaterial } from "./shaders";

/** How far the plume spreads, and whether shock structure shows, by ambient pressure. Qualitative. */
const ATMOSPHERE: Record<Atmosphere, { spread: number; diamonds: number }> = {
  sea_level: { spread: 0.04, diamonds: 1 },
  high_altitude: { spread: 0.42, diamonds: 0.25 },
  vacuum: { spread: 1.1, diamonds: 0 },
};

const PLUME_LENGTH = 2.9;
const CUT = [Math.PI / 2, Math.PI * 1.5] as const;

/** The gas-side surface of the cooled wall, just inside the liner. */
function gasSide(cut: boolean): LatheGeometry {
  const points = contour(INJECTOR_Y, REGEN_END_Y).map(([r, y]) => new Vector2(r - 0.002, y));
  return cut ? new LatheGeometry(points, 48, CUT[0], CUT[1]) : new LatheGeometry(points, 64);
}

/** One shell of the exhaust: inside the nozzle from the throat, then on past the exit. */
function plumeShell(scale: number): LatheGeometry {
  const below = Array.from({ length: 13 }, (_, i) => new Vector2(EXIT_RADIUS * 0.9 * scale, EXIT_Y - PLUME_LENGTH * (1 - i / 12)));
  const inside = contour(EXIT_Y, 0, 20)
    .slice(1)
    .map(([r, y]) => new Vector2(r * 0.9 * scale, y));
  return new LatheGeometry([...below, ...inside], 40);
}

/** Paths the gas follows through the chamber and out along the nozzle wall. */
function streamline(angle: number, fraction: number): V3[] {
  return [0.7, 0.4, 0.15, 0, -0.2, -0.5, -0.9, -1.3, -1.6, -2.1].map((y) => {
    const r = gasRadius(Math.max(y, EXIT_Y)) * fraction * (y < EXIT_Y ? 1 + (EXIT_Y - y) * 0.12 : 1);
    return [Math.sin(angle) * r, y, Math.cos(angle) * r] as V3;
  });
}

/** A mesh's uniforms. The frame loop reaches materials through the meshes that carry them. */
const uniformsOf = (mesh: Mesh | null) => (mesh?.material as ShaderMaterial | undefined)?.uniforms;

const WALL_CHANNELS = wall(contour(INJECTOR_Y, REGEN_END_Y), 0.012, 0.022);

export default function Combustion() {
  const cut = useRocketTwinStore((s) => isCut(PARTS.chamber_liner, s.cutaway));
  const heat = useRef<Mesh>(null);
  const sheet = useRef<Mesh>(null);
  const section = useRef<Mesh>(null);
  const gas = useRef<Mesh>(null);
  const plume = useRef<(Mesh | null)[]>([]);
  const lines = useRef<(Mesh | null)[]>([]);
  const spread = useRef({ spread: ATMOSPHERE.sea_level.spread, diamonds: 1 });

  const g = useMemo(
    () => ({
      heatFull: gasSide(false),
      heatCut: gasSide(true),
      // The coolant where its passages are: a surface under the jacket, and a band on each cut face.
      sheet: new LatheGeometry(
        contour(INJECTOR_Y, REGEN_END_Y).map(([r, y]) => new Vector2(r + 0.03, y)),
        48,
        CUT[0],
        CUT[1],
      ),
      section: revolve(WALL_CHANNELS, { cut: true }),
      gas: revolve([...contour(INJECTOR_Y - 0.03, 0.01, 24).map(([r, y]) => [r * 0.86, y] as const).reverse(), [0.001, INJECTOR_Y - 0.03], [0.001, 0.01]]),
      plume: [1, 0.66, 0.36].map(plumeShell),
      lines: [1.2, 2.2, 3.2, 4.2, 5.2].flatMap((angle) => [pipe(streamline(angle, 0.62), 0.006, { radial: 5 }), pipe(streamline(angle + 0.5, 0.3), 0.006, { radial: 5 })]),
    }),
    [],
  );
  const m = useMemo(
    () => ({
      heat: wallHeatMaterial(),
      sheet: coolantMaterial(REGEN_END_Y, INJECTOR_Y, true),
      section: coolantMaterial(REGEN_END_Y, INJECTOR_Y, false),
      gas: combustionMaterial(),
      plume: [0, 0.5, 1].map(plumeMaterial),
      line: flowMaterial(FLOW_COLOR.hot, 9, 0.7),
    }),
    [],
  );

  useEffect(
    () => () => {
      [g.heatFull, g.heatCut, g.sheet, g.section, g.gas, ...g.plume, ...g.lines].forEach((geometry) => geometry.dispose());
      [m.heat, m.sheet, m.section, m.gas, ...m.plume, m.line].forEach((material) => material.dispose());
    },
    [g, m],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const state = useRocketTwinStore.getState();
    const { engine } = frame;

    // Heat load on the wall. With its coolant the wall sits well below its limit; without, it climbs.
    const load = engine.thermal * 0.42 * frame.wallHeat;
    const heatUniforms = uniformsOf(heat.current);
    if (heatUniforms) heatUniforms.uHeat.value = load;
    if (heat.current) heat.current.visible = load > 0.01;

    const cooling = frame.flow.cooling;
    for (const mesh of [sheet.current, section.current]) {
      const uniforms = uniformsOf(mesh);
      if (!mesh || !uniforms) continue;
      uniforms.uTime.value = frame.now;
      uniforms.uStrength.value = cooling;
      uniforms.uHeat.value = Math.min(1.6, frame.wallHeat);
      mesh.visible = cooling > 0.01;
    }

    const gasUniforms = uniformsOf(gas.current);
    if (gas.current && gasUniforms) {
      gasUniforms.uTime.value = frame.now;
      gasUniforms.uActivity.value = engine.chamber;
      gas.current.visible = engine.chamber > 0.01;
    }

    const atmosphere = ATMOSPHERE[state.atmosphere];
    spread.current.spread = damp(spread.current.spread, atmosphere.spread, 2.5, dt);
    spread.current.diamonds = damp(spread.current.diamonds, atmosphere.diamonds, 2.5, dt);
    plume.current.forEach((mesh) => {
      const uniforms = uniformsOf(mesh);
      if (!mesh || !uniforms) return;
      uniforms.uTime.value = frame.now;
      uniforms.uPlume.value = engine.plume;
      uniforms.uSpread.value = spread.current.spread;
      uniforms.uDiamonds.value = spread.current.diamonds;
      mesh.visible = engine.plume > 0.01;
    });

    // Streamlines: only where the expansion itself is the subject. They share one material.
    const expansion = Math.max(frame.flow.hot_gas, state.cutaway === "nozzle" && state.mode !== "build" ? engine.plume : 0);
    const lineUniforms = uniformsOf(lines.current[0] ?? null);
    if (lineUniforms) {
      lineUniforms.uTime.value = frame.now;
      lineUniforms.uStrength.value = expansion * 0.5;
    }
    lines.current.forEach((mesh) => {
      if (mesh) mesh.visible = expansion > 0.01;
    });
  });

  return (
    <group name="Combustion">
      <mesh ref={heat} geometry={cut ? g.heatCut : g.heatFull} material={m.heat} visible={false} renderOrder={2} />
      <mesh ref={sheet} geometry={g.sheet} material={m.sheet} visible={false} renderOrder={3} />
      <mesh ref={section} geometry={g.section} material={m.section} visible={false} renderOrder={3} />
      <mesh ref={gas} geometry={g.gas} material={m.gas} visible={false} renderOrder={5} />
      {g.plume.map((geometry, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={m.plume[i]}
          visible={false}
          renderOrder={6 + i}
          frustumCulled={false}
          ref={(node) => {
            plume.current[i] = node;
          }}
        />
      ))}
      {g.lines.map((geometry, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={m.line}
          visible={false}
          renderOrder={7}
          ref={(node) => {
            lines.current[i] = node;
          }}
        />
      ))}
    </group>
  );
}
