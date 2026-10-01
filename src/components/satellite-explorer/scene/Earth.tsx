// Earth: day imagery, night lights, clouds, ocean glint and limb scattering in
// one shader, lit by the simulation's Sun direction so the terminator and the
// eclipse are where the orbit model says they are. Children are placed in the
// rotating Earth-fixed frame (ground station, target, ground track).
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, type ShaderMaterial, SRGBColorSpace, type Texture, TextureLoader, Vector2, Vector3 } from "three";
import { useExplorerStore } from "../state/explorerStore";
import { EARTH_RADIUS_UNITS } from "./cameraPresets";
import { frame } from "./frameState";

const TEXTURE_BASE = "/space/satellite-explorer";

const VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const FRAGMENT = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform float uHasDay;
uniform float uHasNight;
uniform float uHasClouds;
uniform float uCloudShift;
uniform float uDetail;
uniform vec2 uDaySize;
uniform float uFade;
uniform vec3 uSunDir;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;

// Hash without trigonometry: stays well distributed at the large coordinates used for grain.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { return 0.5 * noise(p) + 0.25 * noise(p * 2.0) + 0.125 * noise(p * 4.0) + 0.0625 * noise(p * 8.0); }

// Bicubic (B-spline) lookup in four bilinear taps. From low orbit a texel spans many
// pixels; plain bilinear filtering would show it as a grid of diamonds.
vec4 cubicWeights(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;
}
vec4 textureSmooth(sampler2D map, vec2 uv, vec2 size) {
  vec2 st = uv * size - 0.5;
  vec2 f = fract(st);
  st -= f;
  vec4 xc = cubicWeights(f.x);
  vec4 yc = cubicWeights(f.y);
  vec4 c = st.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 offset = (c + vec4(xc.yw, yc.yw) / s) / size.xxyy;
  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);
  return mix(
    mix(texture2D(map, offset.yw), texture2D(map, offset.xw), sx),
    mix(texture2D(map, offset.yz), texture2D(map, offset.xz), sx),
    sy);
}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float ndl = dot(N, uSunDir);
  float day = smoothstep(-0.10, 0.20, ndl);

  vec3 albedo;
  float ocean;
  if (uHasDay > 0.5) {
    albedo = textureSmooth(uDay, vUv, uDaySize).rgb;
    ocean = smoothstep(0.015, 0.07, albedo.b - max(albedo.r, albedo.g));
  } else {
    // Illustrative procedural surface, used only if the imagery fails to load.
    vec2 p = vec2(vUv.x * 12.0, vUv.y * 6.0);
    float land = smoothstep(0.47, 0.52, fbm(p + vec2(7.2, 5.6)));
    ocean = 1.0 - land;
    albedo = mix(vec3(0.012, 0.045, 0.12), mix(vec3(0.07, 0.12, 0.05), vec3(0.2, 0.17, 0.1), fbm(p * 4.0)), land);
  }

  // Fine procedural variation: seen from low orbit a texel covers kilometres, so
  // this gives the surface grain where the imagery has run out of detail.
  vec2 grain = vUv * vec2(2.0, 1.0);
  float detail = fbm(grain * 420.0) * 0.6 + fbm(grain * 1300.0) * 0.4;
  albedo *= 1.0 + (detail - 0.47) * 0.36 * uDetail * (1.0 - ocean * 0.6);

  float light = max(ndl, 0.0) * 0.95 + smoothstep(-0.06, 0.5, ndl) * 0.3;
  vec3 color = albedo * light * 1.2;

  vec3 H = normalize(uSunDir + V);
  color += vec3(1.0, 0.93, 0.8) * pow(max(dot(N, H), 0.0), 90.0) * ocean * 0.5 * day;

  float cloud = 0.0;
  if (uHasClouds > 0.5) {
    vec2 cuv = vec2(fract(vUv.x + uCloudShift), vUv.y);
    float c = textureSmooth(uClouds, cuv, vec2(2048.0, 1024.0)).r;
    float wisp = 1.0 + 0.45 * (fbm(grain * 300.0) - 0.47) * uDetail;
    cloud = smoothstep(0.34, 0.98, c * wisp);
    color = mix(color, vec3(light * 0.98 + 0.006) * (0.9 + 0.2 * detail * uDetail), cloud * 0.8);
  }

  if (uHasNight > 0.5) {
    // City lights: the map is far coarser than a city seen from low orbit, so a fine
    // speckle breaks each texel into points instead of a soft blob.
    float lights = textureSmooth(uNight, vUv, vec2(2048.0, 1024.0)).r;
    float speckle = mix(1.0, pow(noise(grain * 5200.0), 3.0) * 5.0, uDetail);
    color += vec3(1.0, 0.76, 0.46) * lights * lights * speckle * (1.0 - day) * (1.0 - cloud * 0.8) * 0.6;
  }

  // Atmosphere seen against the surface: thin, strongest toward the limb.
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.2);
  color += vec3(0.2, 0.42, 0.95) * rim * (0.05 + 0.9 * day) * 0.7;
  float twilight = smoothstep(-0.12, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.18, ndl));
  color += vec3(0.55, 0.22, 0.08) * twilight * rim * 0.45;

  gl_FragColor = vec4(color * uFade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const setUniform = (uniform: { value: number }, value: number) => {
  uniform.value = value;
};

export default function Earth({ onProgress, children }: { onProgress?: (fraction: number) => void; children?: React.ReactNode }) {
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const quality = useExplorerStore((s) => s.quality);
  const progress = useRef(onProgress);
  useEffect(() => {
    progress.current = onProgress;
  }, [onProgress]);

  const uniforms = useMemo(
    () => ({
      uDay: { value: null as Texture | null },
      uNight: { value: null as Texture | null },
      uClouds: { value: null as Texture | null },
      uHasDay: { value: 0 },
      uHasNight: { value: 0 },
      uHasClouds: { value: 0 },
      uCloudShift: { value: 0 },
      uDetail: { value: 1 },
      uDaySize: { value: new Vector2(4096, 2048) },
      uFade: { value: 1 },
      uSunDir: { value: new Vector3(1, 0, 0) },
    }),
    [],
  );

  useEffect(() => {
    const loader = new TextureLoader();
    const loaded: Texture[] = [];
    let cancelled = false;
    const files: [slot: "Day" | "Night" | "Clouds", file: string][] = [
      ["Day", quality.earthTexture === "4k" ? "earth-day-4k.jpg" : "earth-day-2k.jpg"],
      ["Night", "earth-night-2k.jpg"],
    ];
    if (quality.clouds) files.push(["Clouds", "earth-clouds-2k.jpg"]);
    let settled = 0;
    const settle = () => {
      settled += 1;
      if (!cancelled) progress.current?.(settled / files.length);
    };
    files.forEach(([slot, file]) => {
      loader.load(
        `${TEXTURE_BASE}/${file}`,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }
          texture.colorSpace = SRGBColorSpace;
          texture.anisotropy = 8;
          loaded.push(texture);
          const u = material.current?.uniforms;
          if (u) {
            u[`u${slot}`].value = texture;
            u[`uHas${slot}`].value = 1;
            if (slot === "Day") u.uDaySize.value.set(texture.image.width, texture.image.height);
          }
          settle();
        },
        undefined,
        // A missing texture is not fatal: the shader falls back and the scene still starts.
        settle,
      );
    });
    return () => {
      cancelled = true;
      loaded.forEach((t) => t.dispose());
    };
  }, [quality.earthTexture, quality.clouds]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y = frame.earthRotation;
      // In the Build Mode studio the planet is faded out, then removed altogether.
      group.current.visible = frame.studio < 0.985;
    }
    const u = material.current?.uniforms;
    if (!u) return;
    u.uSunDir.value.copy(frame.sunDir);
    setUniform(u.uFade, 1 - frame.studio);
    // The grain is for close views; from far away it would only shimmer.
    const altitude = state.camera.position.length() - EARTH_RADIUS_UNITS;
    setUniform(u.uDetail, 1 - Math.min(1, Math.max(0, (altitude - 400) / 1200)));
    // Clouds drift very slowly relative to the surface.
    setUniform(u.uCloudShift, (u.uCloudShift.value + delta * 0.00012) % 1);
  });

  return (
    <group ref={group} name="Earth">
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 192, 96]} />
        <shaderMaterial ref={material} uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} />
      </mesh>
      {children}
    </group>
  );
}
