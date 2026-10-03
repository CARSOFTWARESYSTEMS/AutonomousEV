// Light and surroundings. One key light with soft shadows, a quiet fill, a rim
// to hold the silhouette, and a neutral room for the metal to reflect. Three
// surroundings share the scene and cross-fade: the dark studio, the simulated
// test environment and the digital twin.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferGeometry, CanvasTexture, Color, type DirectionalLight, Float32BufferAttribute, type HemisphereLight, type LineBasicMaterial, type MeshStandardMaterial, PMREMGenerator, type Texture } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { block, drum, merge, rod } from "../engine/geometry";
import { frame } from "./frameState";

interface Look {
  key: number;
  keyColor: string;
  fill: number;
  rim: number;
  hemisphere: number;
  reflections: number;
}

/** Before the twin is entered: one controlled light, and almost nothing else. */
const OPENING: Look = { key: 2.1, keyColor: "#fff1df", fill: 0.05, rim: 0.7, hemisphere: 0.03, reflections: 0.16 };
const LOOKS: Record<"studio" | "test" | "twin", Look> = {
  studio: { key: 2.7, keyColor: "#fff3e6", fill: 0.42, rim: 0.85, hemisphere: 0.12, reflections: 0.42 },
  test: { key: 2.4, keyColor: "#ffe9d2", fill: 0.3, rim: 0.6, hemisphere: 0.2, reflections: 0.34 },
  twin: { key: 1.5, keyColor: "#dce8f6", fill: 0.3, rim: 0.7, hemisphere: 0.16, reflections: 0.26 },
};
const ENVIRONMENTS = ["studio", "test", "twin"] as const;
const mixed = new Color();
const one = new Color();
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function Lighting({ shadows, shadowMapSize }: { shadows: boolean; shadowMapSize: number }) {
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const gl = useThree((state) => state.gl);
  const reflections = useRef<Texture | null>(null);

  // A neutral prefiltered room for reflections: generated here, so nothing is fetched.
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    reflections.current = target.texture;
    return () => {
      reflections.current = null;
      target.dispose();
      pmrem.dispose();
    };
  }, [gl]);

  useFrame(({ scene }) => {
    if (scene.environment !== reflections.current) scene.environment = reflections.current;
    let k = 0;
    let f = 0;
    let r = 0;
    let h = 0;
    let e = 0;
    mixed.setRGB(0, 0, 0);
    for (const id of ENVIRONMENTS) {
      const w = frame.environment[id];
      const look = LOOKS[id];
      k += look.key * w;
      f += look.fill * w;
      r += look.rim * w;
      h += look.hemisphere * w;
      e += look.reflections * w;
      mixed.add(one.set(look.keyColor).multiplyScalar(w));
    }
    const p = frame.power;
    // The plume lights the engine from below while it burns.
    const glow = frame.engine.plume;
    if (key.current) {
      key.current.intensity = mix(OPENING.key, k, p);
      key.current.color.copy(mixed).lerp(one.set(OPENING.keyColor), 1 - p);
    }
    if (fill.current) fill.current.intensity = mix(OPENING.fill, f, p);
    if (rim.current) rim.current.intensity = mix(OPENING.rim, r, p);
    if (hemisphere.current) {
      hemisphere.current.intensity = mix(OPENING.hemisphere, h, p) + 0.5 * glow;
      hemisphere.current.groundColor.set("#06070a").lerp(one.set("#ff9a5c"), 0.75 * glow);
    }
    scene.environmentIntensity = mix(OPENING.reflections, e, p);
  });

  return (
    <>
      <directionalLight
        ref={key}
        position={[4.2, 7.4, 5.6]}
        castShadow={shadows}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-2.6}
        shadow-camera-right={2.6}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={2}
        shadow-camera-far={22}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      <directionalLight ref={fill} position={[-6, 1.5, 4]} color="#b9cdea" />
      <directionalLight ref={rim} position={[-3.5, 4, -7]} color="#e3ebf7" />
      <hemisphereLight ref={hemisphere} color="#9aa8bd" groundColor="#06070a" />
    </>
  );
}

/** The floor is lit only under the engine: its edge falls away into the dark. */
function falloffTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.25, "#bdbdbd");
  gradient.addColorStop(0.55, "#3a3a3a");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

function gridGeometry(half: number, step: number, y: number): BufferGeometry {
  const points: number[] = [];
  for (let v = -half; v <= half + 1e-6; v += step) points.push(-half, y, v, half, y, v, v, y, -half, v, y, half);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

/** A simulated test cell: a frame that holds the engine by its thrust mount, and a deflector under the plume. */
function testStandGeometry(): BufferGeometry {
  const columns = [-1, 1].flatMap((x) => [-1, 1].map((z) => block([0.16, 6.6, 0.16], [x * 1.9, -0.7, z * 1.6])));
  const braces = [-1, 1].flatMap((x) => [rod([x * 1.9, 2.5, -1.6], [x * 1.9, 0.4, 1.6], 0.035), rod([x * 1.9, 0.4, -1.6], [x * 1.9, -1.9, 1.6], 0.035)]);
  return merge([
    ...columns,
    ...braces,
    block([3.96, 0.2, 0.2], [0, 2.6, -1.6]),
    block([3.96, 0.2, 0.2], [0, 2.6, 1.6]),
    block([0.2, 0.2, 3.4], [-1.9, 2.6, 0]),
    block([0.2, 0.2, 3.4], [1.9, 2.6, 0]),
    block([3.96, 0.12, 0.12], [0, 0.4, -1.6]),
    block([0.12, 0.12, 3.4], [-1.9, 0.4, 0]),
    block([0.12, 0.12, 3.4], [1.9, 0.4, 0]),
    // Thrust take-out: carries the engine from its gimbal up into the frame.
    drum(0.24, 0.96, [0, 2.12, 0], { topRadius: 0.5, radial: 6 }),
    block([3.96, 0.16, 0.5], [0, 2.6, 0]),
    // Flame deflector.
    block([2.6, 0.12, 3.2], [0, -3.75, -0.4]).rotateX(0.32),
  ]);
}

function Surroundings() {
  const studio = useRef<MeshStandardMaterial>(null);
  const stand = useRef<MeshStandardMaterial>(null);
  const cell = useRef<MeshStandardMaterial>(null);
  const grid = useRef<LineBasicMaterial>(null);
  const falloff = useMemo(() => falloffTexture(), []);
  const twinGrid = useMemo(() => gridGeometry(6, 0.5, -1.9), []);
  const testStand = useMemo(() => testStandGeometry(), []);
  useEffect(
    () => () => {
      falloff.dispose();
      twinGrid.dispose();
      testStand.dispose();
    },
    [falloff, twinGrid, testStand],
  );

  useFrame(() => {
    const { studio: s, test, twin } = frame.environment;
    if (studio.current) {
      studio.current.opacity = Math.max(s, twin * 0.5);
      studio.current.visible = studio.current.opacity > 0.01;
    }
    if (cell.current) {
      cell.current.opacity = test;
      cell.current.visible = test > 0.01;
    }
    if (stand.current) {
      stand.current.opacity = test;
      stand.current.visible = test > 0.01;
      // Fully arrived, the frame is ordinary opaque geometry again.
      const transparent = test < 0.99;
      if (stand.current.transparent !== transparent) {
        stand.current.transparent = transparent;
        stand.current.needsUpdate = true;
      }
    }
    if (grid.current) {
      grid.current.opacity = 0.2 * twin;
      grid.current.visible = twin > 0.01;
    }
  });

  return (
    <group name="Surroundings">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]} receiveShadow>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial ref={studio} color="#14161b" roughness={0.78} metalness={0.1} alphaMap={falloff} transparent depthWrite={false} />
      </mesh>
      <mesh geometry={testStand} castShadow receiveShadow>
        <meshStandardMaterial ref={stand} color="#23262c" roughness={0.74} metalness={0.5} transparent opacity={0} visible={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial ref={cell} color="#090a0d" roughness={0.95} metalness={0} alphaMap={falloff} transparent depthWrite={false} opacity={0} visible={false} />
      </mesh>
      <lineSegments geometry={twinGrid}>
        <lineBasicMaterial ref={grid} color="#7fa6d6" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export default function Stage({ shadows, shadowMapSize }: { shadows: boolean; shadowMapSize: number }) {
  return (
    <>
      <Lighting shadows={shadows} shadowMapSize={shadowMapSize} />
      <Surroundings />
    </>
  );
}
