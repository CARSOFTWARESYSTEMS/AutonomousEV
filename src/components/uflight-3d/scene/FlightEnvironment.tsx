// FLIGHT: open air for takeoff, transition, cruise and landing. A ground
// plane far below gives height and speed something to be read against; the
// haze takes it to the horizon. Deliberately plain: no city, no landmarks.
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, type Mesh, type MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";
import { mulberry32 } from "../lib/math";
import { frame } from "./frameState";

/** Metres covered by one tile of the ground texture. */
const TILE = 520;
const SIZE = 14000;

/** Fields, tracks and tone variation, seeded so the ground is the same on every visit. */
function groundTexture(): CanvasTexture {
  const px = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext("2d")!;
  const random = mulberry32(41);
  ctx.fillStyle = "#59626a";
  ctx.fillRect(0, 0, px, px);
  for (let i = 0; i < 90; i++) {
    const w = 30 + random() * 110;
    const h = 24 + random() * 90;
    const x = random() * px;
    const y = random() * px;
    const tone = 74 + Math.floor(random() * 38);
    ctx.fillStyle = `rgba(${tone + 4}, ${tone + 8 + Math.floor(random() * 6)}, ${tone + 8}, ${0.35 + random() * 0.4})`;
    // Draw each field four times so the tile repeats without a seam.
    for (const dx of [0, -px]) for (const dy of [0, -px]) ctx.fillRect(x + dx, y + dy, w, h);
  }
  ctx.strokeStyle = "rgba(190, 196, 188, 0.24)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    const y = random() * px;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(px * 0.3, y + (random() - 0.5) * 60, px * 0.7, y + (random() - 0.5) * 60, px, y);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(SIZE / TILE, SIZE / TILE);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export default function FlightEnvironment() {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const texture = useMemo(() => groundTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const ground = mesh.current;
    if (!ground || !material.current) return;
    const w = Math.max(frame.environment.vertiport, frame.environment.flight);
    ground.visible = w > 0.01;
    material.current.opacity = w;
    // The plane follows the aircraft in whole tiles, so the pattern stays fixed to the ground.
    ground.position.x = Math.round(frame.position.x / TILE) * TILE;
  });

  return (
    <mesh ref={mesh} name="FlightEnvironment" rotation={[-Math.PI / 2, 0, 0]} receiveShadow visible={false}>
      <planeGeometry args={[SIZE, SIZE]} />
      <meshStandardMaterial ref={material} map={texture} color="#9aa6b0" roughness={0.96} metalness={0} transparent />
    </mesh>
  );
}
