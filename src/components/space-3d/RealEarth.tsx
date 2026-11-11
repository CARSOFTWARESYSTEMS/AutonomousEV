"use client";
// Earth from the imagery Satellite Explorer already publishes
// (/space/satellite-explorer: day, night lights, clouds). Used by the /space
// Discover hero and the Space Research showcase on /aerospace.
// Day imagery lit by the Sun with ocean glint, city lights on the night side,
// a separate cloud layer that drifts a little faster than the surface, a thin
// atmosphere at the limb, and a slow spin on a 23.4° tilted axis. Textures
// use the GPU's best anisotropic filtering, so the planet stays sharp at an
// angle; all three are released when the scene unmounts.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BackSide, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector3, type Group, type Texture } from "three";

const BASE = "/space/satellite-explorer/";

function useEarthTextures(detail: "2k" | "4k") {
  const { gl, invalidate } = useThree();
  const [maps, setMaps] = useState<{ day: Texture; night: Texture; clouds: Texture } | null>(null);
  useEffect(() => {
    let alive = true;
    const loader = new TextureLoader();
    const aniso = gl.capabilities.getMaxAnisotropy();
    const load = (file: string, srgb: boolean) =>
      loader.loadAsync(BASE + file).then((t) => {
        if (srgb) t.colorSpace = SRGBColorSpace;
        t.anisotropy = aniso;
        return t;
      });
    Promise.all([load(`earth-day-${detail}.jpg`, true), load("earth-night-2k.jpg", true), load("earth-clouds-2k.jpg", false)])
      .then(([day, night, clouds]) => {
        if (!alive) {
          day.dispose();
          night.dispose();
          clouds.dispose();
          return;
        }
        setMaps({ day, night, clouds });
        invalidate();
      })
      // No imagery (offline, blocked): the sky simply has no Earth.
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [gl, invalidate, detail]);
  useEffect(
    () => () => {
      maps?.day.dispose();
      maps?.night.dispose();
      maps?.clouds.dispose();
    },
    [maps],
  );
  return maps;
}

interface Props {
  radius: number;
  position: [number, number, number];
  sun: [number, number, number];
  playing: boolean;
  /** Day imagery resolution: "4k" for a large Earth on a capable device. */
  detail?: "2k" | "4k";
  /** Overall brightness, so Earth can sit back as a backdrop. */
  exposure?: number;
}

export default function RealEarth({ radius, position, sun, playing, detail = "2k", exposure = 1 }: Props) {
  const maps = useEarthTextures(detail);
  const surfaceRef = useRef<Group>(null);
  const cloudsRef = useRef<Group>(null);
  const sunDir = useMemo(() => new Vector3(...sun).normalize(), [sun]);

  const surface = useMemo(() => {
    if (!maps) return null;
    return new ShaderMaterial({
      uniforms: { uDay: { value: maps.day }, uNight: { value: maps.night }, uSun: { value: sunDir }, uExposure: { value: exposure } },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vN; varying vec3 vPos;
        void main() {
          vUv = uv;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uDay; uniform sampler2D uNight; uniform vec3 uSun; uniform float uExposure;
        varying vec2 vUv; varying vec3 vN; varying vec3 vPos;
        void main() {
          vec3 n = normalize(vN);
          vec3 v = normalize(cameraPosition - vPos);
          float d = dot(n, uSun);
          float day = smoothstep(-0.06, 0.2, d);
          vec3 dayCol = texture2D(uDay, vUv).rgb;
          vec3 nightCol = texture2D(uNight, vUv).rgb;
          // Oceans: where blue clearly dominates. They get the Sun's glint.
          float ocean = smoothstep(0.015, 0.09, dayCol.b - max(dayCol.r, dayCol.g));
          float glint = pow(max(dot(n, normalize(uSun + v)), 0.0), 70.0) * ocean;
          vec3 col = dayCol * (0.025 + 1.3 * max(d, 0.0)) + vec3(1.0, 0.94, 0.82) * glint * 0.8 * day;
          col += nightCol * vec3(1.0, 0.78, 0.5) * (1.0 - day) * 1.6;
          // A faint warm band along the terminator.
          col += vec3(0.9, 0.42, 0.16) * clamp(1.0 - abs(d) * 5.0, 0.0, 1.0) * 0.05;
          // Blue scattering at the limb, strongest on the day side.
          float rim = pow(1.0 - max(dot(n, v), 0.0), 4.0);
          col += vec3(0.3, 0.56, 1.0) * rim * (0.1 + 0.9 * day) * 0.7;
          gl_FragColor = vec4(col * uExposure, 1.0);
          #include <colorspace_fragment>
        }`,
    });
  }, [maps, sunDir, exposure]);

  const atmosphere = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uSun: { value: sunDir }, uExposure: { value: exposure } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vPos;
          void main() { vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vPos = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun; uniform float uExposure; varying vec3 vN; varying vec3 vPos;
          void main() {
            vec3 v = normalize(cameraPosition - vPos);
            float edge = pow(max(0.0, 1.0 - abs(dot(normalize(vN), v))), 6.0);
            float lit = smoothstep(-0.25, 0.4, dot(normalize(vN), uSun));
            gl_FragColor = vec4(vec3(0.35, 0.62, 1.0) * edge * lit * 1.4 * uExposure, 1.0);
          }`,
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [sunDir, exposure],
  );

  useEffect(() => () => surface?.dispose(), [surface]);
  useEffect(() => () => atmosphere.dispose(), [atmosphere]);

  useFrame((_, delta) => {
    if (!playing) return;
    const dt = Math.min(delta, 0.05);
    if (surfaceRef.current) surfaceRef.current.rotation.y += 0.018 * dt;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.024 * dt;
  });

  if (!maps || !surface) return null;
  return (
    <group position={position} rotation={[0, 0, (23.4 * Math.PI) / 180]}>
      <group ref={surfaceRef} rotation={[0, 2.2, 0]}>
        <mesh material={surface}>
          <sphereGeometry args={[radius, 128, 96]} />
        </mesh>
      </group>
      <group ref={cloudsRef} rotation={[0, 2.2, 0]}>
        <mesh>
          <sphereGeometry args={[radius * 1.006, 96, 72]} />
          <meshStandardMaterial color="#ffffff" alphaMap={maps.clouds} transparent depthWrite={false} roughness={1} metalness={0} opacity={Math.min(1, exposure)} />
        </mesh>
      </group>
      <mesh material={atmosphere} scale={1.025}>
        <sphereGeometry args={[radius, 96, 72]} />
      </mesh>
    </group>
  );
}
