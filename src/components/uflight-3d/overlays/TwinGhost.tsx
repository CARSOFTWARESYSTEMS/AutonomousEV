// The twin's healthy reference: a faint outline of the aircraft's own skin
// that arrives slightly apart from the physical aircraft and settles onto it.
// It shares the geometry of the real parts and follows them exactly, so the
// reference always describes the same aircraft in the same configuration.
// A quiet rim of light, not a hologram.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, FrontSide, type Group, Matrix4, Mesh, ShaderMaterial } from "three";
import { OUTER_SHELL } from "../data/componentDefinitions";
import { partMeshes } from "../aircraft/modelRegistry";
import { frame } from "../scene/frameState";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
    gl_FragColor = vec4(uColor, (0.04 + 0.9 * rim) * uOpacity);
  }
`;

/** How far above the aircraft the reference starts before it aligns. */
const START_OFFSET = 1.1;
const lift = new Matrix4();

export default function TwinGhost() {
  const root = useRef<Group>(null);
  const pairs = useRef<{ ghost: Mesh; source: Mesh }[]>([]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uColor: { value: new Color("#bfe2ff") }, uOpacity: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: FrontSide,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    const visible = frame.ghost > 0.01;
    group.visible = visible;
    if (!visible) return;

    // Built on first use, once the aircraft's parts have registered their meshes.
    if (pairs.current.length === 0) {
      for (const id of OUTER_SHELL) {
        for (const source of partMeshes(id)) {
          const ghost = new Mesh(source.geometry, material);
          ghost.matrixAutoUpdate = false;
          ghost.frustumCulled = false;
          ghost.renderOrder = 4;
          group.add(ghost);
          pairs.current.push({ ghost, source });
        }
      }
    }

    // Every ghost mesh shares one material; reach it through the first.
    const shader = pairs.current[0]?.ghost.material as ShaderMaterial | undefined;
    if (shader) shader.uniforms.uOpacity.value = 0.55 * frame.ghost;
    lift.makeTranslation(0, START_OFFSET * (1 - frame.ghostAlign), 0);
    for (const { ghost, source } of pairs.current) {
      ghost.matrix.copy(source.matrixWorld).premultiply(lift);
      ghost.matrixWorld.copy(ghost.matrix);
    }
  });

  return <group ref={root} name="TwinReference" visible={false} matrixAutoUpdate={false} />;
}
