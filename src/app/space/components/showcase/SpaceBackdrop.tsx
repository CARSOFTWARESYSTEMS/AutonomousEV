"use client";
// A space backdrop for the showcase scenes: stars, a sunlit Earth with
// procedural oceans, land, clouds and ice caps, a glowing atmosphere, and the
// Sun. Everything is computed on the GPU from small shaders: no textures to
// download. Positions are seeded, so every visit draws the same sky.
import { useEffect, useMemo } from "react";
import { AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from "three";

/** A fixed, seeded star field on a large sphere. */
export function Starfield({ count = 1400, radius = 320 }: { count?: number; radius?: number }) {
  const geometry = useMemo(() => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      pos.set([radius * r * Math.cos(t), radius * u, radius * r * Math.sin(t)], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#dbe4ff" size={1.6} sizeAttenuation={false} transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

const NOISE = /* glsl */ `
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
`;

/** Earth: procedural surface lit by the Sun, a day/night terminator, faint city lights at night and a blue rim. */
export function Earth({ radius, position, sun }: { radius: number; position: [number, number, number]; sun: [number, number, number] }) {
  const surface = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uSun: { value: new Vector3(...sun).normalize() } },
        vertexShader: /* glsl */ `
          varying vec3 vLocal; varying vec3 vWorldNormal; varying vec3 vViewNormal;
          void main() {
            vLocal = normalize(position);
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vViewNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun;
          varying vec3 vLocal; varying vec3 vWorldNormal; varying vec3 vViewNormal;
          ${NOISE}
          void main() {
            vec3 n = vLocal;
            float h = fbm(n * 2.3 + 1.7);
            float land = smoothstep(0.53, 0.57, h);
            vec3 ocean = mix(vec3(0.015, 0.07, 0.24), vec3(0.03, 0.2, 0.5), fbm(n * 7.0) * 0.7);
            vec3 ground = mix(vec3(0.09, 0.3, 0.12), vec3(0.5, 0.42, 0.25), smoothstep(0.58, 0.72, h));
            vec3 col = mix(ocean, ground, land);
            col = mix(col, vec3(0.92, 0.95, 1.0), smoothstep(0.84, 0.92, abs(n.y)));
            float clouds = smoothstep(0.56, 0.78, fbm(n * 4.2 + vec3(5.2, 1.3, 2.7)));
            col = mix(col, vec3(0.92, 0.95, 1.0), clouds * 0.5);
            float d = dot(normalize(vWorldNormal), uSun);
            float day = smoothstep(-0.12, 0.3, d);
            vec3 lit = col * (0.06 + 1.15 * max(d, 0.0));
            float cities = land * (1.0 - clouds) * step(0.86, noise(n * 70.0)) * (1.0 - day);
            lit += vec3(1.0, 0.72, 0.38) * cities * 0.7;
            float rim = pow(1.0 - max(dot(normalize(vViewNormal), vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
            lit += vec3(0.28, 0.58, 1.0) * rim * (0.25 + 0.75 * day);
            gl_FragColor = vec4(lit, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [sun],
  );
  const atmosphere = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vViewNormal;
          void main() { vViewNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          varying vec3 vViewNormal;
          void main() {
            float i = pow(max(0.72 - dot(vViewNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.6);
            gl_FragColor = vec4(0.32, 0.62, 1.0, 1.0) * i * 1.15;
          }`,
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      surface.dispose();
      atmosphere.dispose();
    },
    [surface, atmosphere],
  );
  return (
    <group position={position}>
      <mesh material={surface}>
        <sphereGeometry args={[radius, 96, 64]} />
      </mesh>
      <mesh material={atmosphere} scale={1.07}>
        <sphereGeometry args={[radius, 64, 48]} />
      </mesh>
    </group>
  );
}

/** The Sun: a bright disc with a soft additive halo. */
export function Sun({ position, size = 6 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 32, 16]} />
        <meshBasicMaterial color="#fff6d8" toneMapped={false} />
      </mesh>
      {[2.2, 3.6, 6].map((k, i) => (
        <mesh key={k} scale={k}>
          <sphereGeometry args={[size, 32, 16]} />
          <meshBasicMaterial color="#fcd34d" transparent opacity={[0.22, 0.09, 0.04][i]} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A dark sky on the inside of a large sphere: near-black, with faint deep-blue haze. */
export function Nebula({ radius = 400 }: { radius?: number }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
          float noise(vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                       mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
          float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; } return v; }
          void main() {
            vec3 d = vDir;
            float c = smoothstep(0.45, 0.85, fbm(d * 2.4 + vec3(3.1, 0.7, 1.9)));
            float c2 = smoothstep(0.5, 0.9, fbm(d * 3.6 + vec3(9.4, 2.2, 4.8)));
            vec3 col = vec3(0.003, 0.005, 0.014);
            col += vec3(0.02, 0.05, 0.15) * c * 0.5;
            col += vec3(0.0, 0.06, 0.13) * c2 * 0.3;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material}>
      <sphereGeometry args={[radius, 48, 32]} />
    </mesh>
  );
}

