// Lighting. In orbit: one strong Sun (gated by the eclipse model), a weak
// blue bounce from the sunlit Earth below and almost no ambient. In Build
// Mode the same key light swings to a studio position with fill and rim, so
// the spacecraft is lit like a product only while it is being assembled.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, CanvasTexture, type AmbientLight, type DirectionalLight, PMREMGenerator, type Sprite, type Texture, Vector3, Quaternion, Euler, Scene, BackSide, Mesh, SphereGeometry, ShaderMaterial } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useExplorerStore } from "../state/explorerStore";
import { STUDIO_KEY_DIRECTION, frame } from "./frameState";

const SUN_INTENSITY = 3.6;
const STUDIO_FILL = new Vector3(0.85, 0.1, 0.5).normalize();
const STUDIO_RIM = new Vector3(0.1, 0.5, -0.86).normalize();
const SUN_DISTANCE = 70000;

const direction = new Vector3();
const studioDirection = new Vector3();
const UP = new Vector3(0, 1, 0);
const orientation = new Quaternion();
const euler = new Euler();

/** Soft radial sprite for the Sun's disc and glare. */
function sunTexture(): Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.06, "rgba(255,250,236,1)");
  g.addColorStop(0.1, "rgba(255,236,200,0.5)");
  g.addColorStop(0.3, "rgba(255,220,170,0.1)");
  g.addColorStop(1, "rgba(255,210,160,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Image-based light for orbit: black sky above, the sunlit Earth as a broad soft source below. */
function orbitEnvironmentScene(): Scene {
  const scene = new Scene();
  const material = new ShaderMaterial({
    side: BackSide,
    vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec3 vDir; void main() {
      float below = smoothstep(0.05, -0.55, vDir.y);
      float horizon = smoothstep(0.22, 0.0, abs(vDir.y + 0.08));
      vec3 earth = vec3(0.42, 0.6, 0.95) * below * 1.5 + vec3(0.5, 0.7, 1.0) * horizon * 0.6;
      // A faint even fill keeps metal from reading as black where it reflects empty sky.
      gl_FragColor = vec4(earth + vec3(0.05), 1.0);
    }`,
  });
  scene.add(new Mesh(new SphereGeometry(10, 32, 16), material));
  return scene;
}

export default function SunLight() {
  const sun = useRef<DirectionalLight>(null);
  const bounce = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const ambient = useRef<AmbientLight>(null);
  const disc = useRef<Sprite>(null);
  const quality = useExplorerStore((s) => s.quality);
  const gl = useThree((state) => state.gl);
  const sprite = useMemo(() => sunTexture(), []);
  const environments = useRef<{ orbit: Texture; studio: Texture } | null>(null);

  useEffect(() => () => sprite.dispose(), [sprite]);

  // Two prefiltered environments: orbit and studio. Metals need something to reflect.
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const orbitScene = orbitEnvironmentScene();
    const room = new RoomEnvironment();
    const orbit = pmrem.fromScene(orbitScene, 0.03);
    const studio = pmrem.fromScene(room, 0.04);
    environments.current = { orbit: orbit.texture, studio: studio.texture };
    orbitScene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material as ShaderMaterial).dispose();
      }
    });
    room.dispose();
    pmrem.dispose();
    return () => {
      orbit.dispose();
      studio.dispose();
      environments.current = null;
    };
  }, [gl]);

  useFrame((state) => {
    const studio = frame.studio;
    const orbitLight = 1 - studio;

    // Key light: the Sun in orbit, a studio key in Build Mode.
    studioDirection.copy(STUDIO_KEY_DIRECTION).applyQuaternion(frame.attitude);
    direction.copy(frame.sunDir).lerp(studioDirection, studio).normalize();
    const reach = 40 * frame.satScale;
    if (sun.current) {
      sun.current.position.copy(frame.satPos).addScaledVector(direction, reach);
      sun.current.target.position.copy(frame.satPos);
      sun.current.target.updateMatrixWorld();
      sun.current.intensity = SUN_INTENSITY * frame.sunFraction * orbitLight + 2.6 * studio;
      sun.current.castShadow = quality.shadows && frame.satScale < 1.6;
    }
    if (bounce.current) {
      bounce.current.position.copy(frame.satPos).addScaledVector(frame.zenith, -reach);
      bounce.current.target.position.copy(frame.satPos);
      bounce.current.target.updateMatrixWorld();
      bounce.current.intensity = 0.55 * frame.dayBelow * orbitLight;
    }
    if (fill.current) {
      // Studio fill in Build Mode. In orbit it becomes a faint light from the viewer while the
      // spacecraft is in Earth's shadow: a visualisation aid, so an eclipsed spacecraft stays readable.
      const eclipse = (1 - frame.sunFraction) * orbitLight;
      direction.copy(STUDIO_FILL).applyQuaternion(frame.attitude);
      if (eclipse > studio) direction.copy(state.camera.position).sub(frame.satPos).normalize();
      fill.current.position.copy(frame.satPos).addScaledVector(direction, reach);
      fill.current.target.position.copy(frame.satPos);
      fill.current.target.updateMatrixWorld();
      fill.current.intensity = 0.9 * studio + 1.1 * eclipse;
    }
    if (rim.current) {
      rim.current.position.copy(frame.satPos).addScaledVector(direction.copy(STUDIO_RIM).applyQuaternion(frame.attitude), reach);
      rim.current.target.position.copy(frame.satPos);
      rim.current.target.updateMatrixWorld();
      rim.current.intensity = 1.3 * studio;
    }
    if (ambient.current) ambient.current.intensity = (0.03 + 0.1 * (1 - frame.sunFraction)) * orbitLight + 0.16 * studio;

    if (disc.current) {
      disc.current.position.copy(frame.sunDir).multiplyScalar(SUN_DISTANCE);
      disc.current.material.opacity = orbitLight;
    }

    // Environment: Earth-glow from below in orbit, a soft room in the studio.
    const env = environments.current;
    if (env) {
      const scene = state.scene;
      const wantStudio = studio > 0.5;
      const texture = wantStudio ? env.studio : env.orbit;
      if (scene.environment !== texture) scene.environment = texture;
      if (wantStudio) {
        scene.environmentRotation.set(0, 0, 0);
        scene.environmentIntensity = 0.55 * Math.min(1, (studio - 0.5) * 2 + 0.2);
      } else {
        // Turn the map so its "down" is toward Earth's centre.
        orientation.setFromUnitVectors(UP, frame.zenith);
        scene.environmentRotation.copy(euler.setFromQuaternion(orientation));
        scene.environmentIntensity = (0.1 + 0.8 * frame.dayBelow) * Math.min(1, (0.5 - studio) * 2 + 0.2);
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.03} />
      <directionalLight
        ref={sun}
        color="#fff6ea"
        intensity={SUN_INTENSITY}
        castShadow={quality.shadows}
        shadow-mapSize={[quality.shadowMapSize, quality.shadowMapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={10}
        shadow-camera-far={80}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight ref={bounce} color="#9ec3ff" intensity={0.5} />
      <directionalLight ref={fill} color="#cfe0ff" intensity={0} />
      <directionalLight ref={rim} color="#ffffff" intensity={0} />
      <sprite ref={disc} scale={[9000, 9000, 1]} renderOrder={-9}>
        <spriteMaterial map={sprite} blending={AdditiveBlending} depthWrite={false} transparent toneMapped={false} color={[4, 3.7, 3.2]} />
      </sprite>
    </>
  );
}
