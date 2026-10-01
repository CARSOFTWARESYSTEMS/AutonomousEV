// DIGITAL TWIN SPACE: used only for model comparison, health architecture,
// prediction and the data network. The physical setting is gone; what is left
// is a measured workspace — a fine reference grid under the aircraft.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, type Group, type LineBasicMaterial } from "three";
import { frame } from "./frameState";

function gridGeometry(extent: number, step: number, skip?: number): BufferGeometry {
  const points: number[] = [];
  for (let v = -extent; v <= extent; v += step) {
    if (skip && Math.abs(v % skip) < 1e-6) continue;
    points.push(-extent, 0, v, extent, 0, v, v, 0, -extent, v, 0, extent);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

export default function TwinEnvironment() {
  const root = useRef<Group>(null);
  const minor = useRef<LineBasicMaterial>(null);
  const major = useRef<LineBasicMaterial>(null);
  const fine = useMemo(() => gridGeometry(80, 1, 10), []);
  const coarse = useMemo(() => gridGeometry(80, 10), []);

  useFrame(() => {
    const w = frame.environment.twin;
    if (root.current) root.current.visible = w > 0.01;
    if (minor.current) minor.current.opacity = 0.1 * w;
    if (major.current) major.current.opacity = 0.26 * w;
  });

  return (
    <group ref={root} name="TwinEnvironment" visible={false}>
      <lineSegments geometry={fine}>
        <lineBasicMaterial ref={minor} color="#6f93b8" transparent opacity={0} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={coarse}>
        <lineBasicMaterial ref={major} color="#8fb4d8" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
