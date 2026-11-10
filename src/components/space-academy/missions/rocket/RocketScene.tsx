"use client";
// The parametric model rocket in 3D, lying along +x with the nose to the
// left (1 unit = 10 mm). CG and CP are coloured rings around the body.
import { useEffect, useMemo, useRef } from "react";
import { DoubleSide, LatheGeometry, Shape, ExtrudeGeometry, Vector2, type Group } from "three";
import Stage3D, { useEasedPosition } from "../../viewer/Stage3D";
import type { SceneState } from "../../viewer/controller";
import { useLabelAnchor } from "../../viewer/labels";
import { DIAMETER_MM, MOTOR_LENGTH_MM, finRootLeadingEdgeMm, totalLengthMm, type RocketDesign } from "./model";
import { finOutline, noseProfile } from "./geometry";

export interface RocketSceneProps {
  design: RocketDesign;
  cgMm: number;
  cpMm: number;
  selected: "cg" | "cp" | null;
}

const S = 0.1;
const R = (DIAMETER_MM / 2) * S;
type V3 = [number, number, number];

function Moving({ to, reducedMotion, children, anchor, anchorOffset }: { to: V3; reducedMotion: boolean; children: React.ReactNode; anchor?: string; anchorOffset?: V3 }) {
  const ref = useRef<Group>(null);
  useEasedPosition(ref, to, reducedMotion);
  useLabelAnchor(anchor ?? null, ref, anchorOffset ?? [0, 0, 0]);
  return <group ref={ref}>{children}</group>;
}

function Marker({ x, color, id }: { x: number; color: string; id: string }) {
  const ref = useRef<Group>(null);
  useLabelAnchor(id, ref, [0, R + 2.4, 0]);
  return (
    <group ref={ref} position={[x, 0, 0]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[R + 0.35, 0.18, 10, 40]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, R + 1.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function RocketScene(props: RocketSceneProps & SceneState) {
  const d = props.design;
  const L = totalLengthMm(d);
  const tip = (-L / 2) * S;
  const X = (mm: number) => tip + mm * S;
  const ex = props.exploded;

  const nose = useMemo(() => {
    const pts = noseProfile(d.noseShape, d.noseLengthMm).map(([x, r]) => new Vector2(r * S, x * S));
    return new LatheGeometry(pts, 40);
  }, [d.noseShape, d.noseLengthMm]);

  const fin = useMemo(() => {
    const shape = new Shape(finOutline(d).map(([x, y]) => new Vector2(x * S, y * S)));
    const g = new ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
    g.translate(0, 0, -0.15);
    return g;
  }, [d]);

  // Geometries rebuilt as sliders move are freed on the GPU when replaced.
  useEffect(() => () => nose.dispose(), [nose]);
  useEffect(() => () => fin.dispose(), [fin]);

  const finAngles = Array.from({ length: d.finCount }, (_, i) => (d.finCount === 4 ? Math.PI / 4 : Math.PI) + (i * 2 * Math.PI) / d.finCount);

  const labels = props.labels
    ? [
        { id: "cg", text: "CG", active: props.selected === "cg" },
        { id: "cp", text: "CP", active: props.selected === "cp" },
        ...(ex && !props.compact ? [{ id: "nose", text: "Nose cone" }, { id: "motor", text: "Motor" }, { id: "chute", text: "Parachute" }, { id: "fins", text: "Fins" }] : []),
      ]
    : [];

  return (
    <Stage3D
      controller={props.controller}
      reducedMotion={props.reducedMotion}
      compact={props.compact}
      onContextLost={props.onContextLost}
      cameraPosition={[6, 14, 62]}
      minDistance={20}
      maxDistance={140}
      labels={labels}
    >
      {/* Nose cone (with its ballast inside) */}
      <Moving to={[X(0) - (ex ? 6 : 0), 0, 0]} reducedMotion={props.reducedMotion} anchor="nose" anchorOffset={[d.noseLengthMm * S * 0.5, R + 1.5, 0]}>
        <mesh geometry={nose} rotation={[0, 0, -Math.PI / 2]}>
          <meshStandardMaterial color="#e5e7eb" roughness={0.45} metalness={0.05} side={DoubleSide} />
        </mesh>
      </Moving>
      {/* Body tube */}
      <mesh position={[X(d.noseLengthMm + d.bodyLengthMm / 2), 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[R, R, d.bodyLengthMm * S, 40, 1, ex]} />
        <meshStandardMaterial color="#3b5bdb" roughness={0.5} metalness={0.1} side={DoubleSide} />
      </mesh>
      {/* Fins */}
      <Moving to={[X(finRootLeadingEdgeMm(d)), 0, 0]} reducedMotion={props.reducedMotion} anchor="fins" anchorOffset={[d.rootChordMm * S * 0.5, -(R + d.spanMm * S + 1.5), 0]}>
        {finAngles.map((a) => (
          <group key={a} rotation={[a, 0, 0]}>
            <mesh geometry={fin} position={[0, R + (ex ? 1.5 : 0), 0]}>
              <meshStandardMaterial color="#f59e0b" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </Moving>
      {/* Motor: hidden inside the tail until the exploded view slides it out */}
      <Moving to={[X(L - MOTOR_LENGTH_MM / 2) + (ex ? 11 : 0), 0, 0]} reducedMotion={props.reducedMotion} anchor="motor" anchorOffset={[0, 2.2, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.9, 0.9, MOTOR_LENGTH_MM * S, 24]} />
          <meshStandardMaterial color="#78716c" roughness={0.7} />
        </mesh>
      </Moving>
      {/* Parachute, packed in the body until exploded */}
      {ex && (
        <Moving to={[X(d.noseLengthMm + 0.3 * d.bodyLengthMm), R + 6, 0]} reducedMotion={props.reducedMotion} anchor="chute" anchorOffset={[0, 3.5, 0]}>
          <mesh>
            <sphereGeometry args={[3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ef4444" side={DoubleSide} roughness={0.8} />
          </mesh>
        </Moving>
      )}
      <Marker id="cg" x={X(props.cgMm)} color="#67e8f9" />
      <Marker id="cp" x={X(props.cpMm)} color="#fcd34d" />
    </Stage3D>
  );
}
