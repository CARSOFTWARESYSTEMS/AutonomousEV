// RF traffic between the ground station and the spacecraft. Two links with
// different signatures (not just different colours): S-band TT&C is a thin
// beam with sparse round pulses; X-band payload data is a dense stream of
// elongated pulses. The command uplink is one packet whose position is the
// command's actual progress.
import { useMemo, useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { BufferGeometry, Color, Float32BufferAttribute, type InstancedMesh, Line, type LineBasicMaterial, Object3D, Quaternion, Vector3 } from "three";
import { ACCENT } from "../data/satelliteReference";
import { frame } from "../scene/frameState";

// <line> is the SVG element in JSX, so THREE.Line is registered under its own name.
extend({ ThreeLine: Line });

const UPLINK_PULSES = 3;
const TELEMETRY_PULSES = 6;
const PAYLOAD_PULSES = 18;
const TOTAL = UPLINK_PULSES + TELEMETRY_PULSES + PAYLOAD_PULSES;

const UP = new Vector3(0, 1, 0);
const ground = new Vector3();
const sat = new Vector3();
const beam = new Vector3();
const side = new Vector3();
const toCamera = new Vector3();
const point = new Vector3();
const orientation = new Quaternion();
const dummy = new Object3D();
const sband = new Color(ACCENT.rf).multiplyScalar(2.4);
const xband = new Color(ACCENT.data).multiplyScalar(2.2);

export default function GroundLink() {
  const sLine = useRef<LineBasicMaterial>(null);
  const xLine = useRef<LineBasicMaterial>(null);
  const pulses = useRef<InstancedMesh>(null);
  const colored = useRef(false);

  const [sGeometry, xGeometry] = useMemo(() => {
    const make = () => {
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(new Float32Array(6), 3));
      return g;
    };
    return [make(), make()];
  }, []);

  useFrame((state) => {
    const mesh = pulses.current;
    if (!mesh) return;
    if (!colored.current) {
      colored.current = true;
      for (let i = 0; i < TOTAL; i++) mesh.setColorAt(i, i < UPLINK_PULSES + TELEMETRY_PULSES ? sband : xband);
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    const shown = frame.flags.groundSegment && frame.studio < 0.5 ? frame.linkStrength : 0;
    const visible = shown > 0.02;
    mesh.visible = visible;
    if (sLine.current) sLine.current.opacity = shown * (0.22 + 0.5 * Math.max(frame.uplink, frame.telemetry));
    if (xLine.current) xLine.current.opacity = shown * (0.1 + 0.6 * frame.payloadDownlink);
    if (!visible) return;

    // Beam endpoints: the dish feed and the spacecraft.
    ground.copy(frame.stationPos).addScaledVector(toCamera.copy(frame.stationPos).normalize(), 4);
    sat.copy(frame.satPos);
    beam.subVectors(sat, ground);
    const length = beam.length();
    beam.divideScalar(length);
    orientation.setFromUnitVectors(UP, beam);

    // Draw the two links side by side as seen from the camera.
    toCamera.subVectors(state.camera.position, sat).normalize();
    side.crossVectors(beam, toCamera).normalize();
    const cameraDistance = state.camera.position.distanceTo(sat);
    const gap = cameraDistance * 0.006;

    const write = (geometry: BufferGeometry, offset: number) => {
      const p = geometry.getAttribute("position") as Float32BufferAttribute;
      p.setXYZ(0, ground.x + side.x * offset, ground.y + side.y * offset, ground.z + side.z * offset);
      p.setXYZ(1, sat.x + side.x * offset, sat.y + side.y * offset, sat.z + side.z * offset);
      p.needsUpdate = true;
    };
    write(sGeometry, -gap);
    write(xGeometry, gap);

    const place = (index: number, u: number, offset: number, size: number, stretch: number) => {
      if (size <= 0 || u < 0 || u > 1) {
        dummy.scale.setScalar(0);
      } else {
        point.copy(ground).addScaledVector(beam, length * u).addScaledVector(side, offset);
        const s = state.camera.position.distanceTo(point) * size;
        dummy.position.copy(point);
        dummy.quaternion.copy(orientation);
        dummy.scale.set(s, s * stretch, s);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    };

    // Uplink (ground → spacecraft): one command packet with a short trail.
    const commanding = frame.command.phase === "UPLINK";
    for (let i = 0; i < UPLINK_PULSES; i++) {
      const u = commanding ? frame.command.progress - i * 0.035 : (frame.now * 0.3 + i / UPLINK_PULSES) % 1;
      const size = (commanding ? 0.0072 - i * 0.0018 : 0.004) * (commanding ? 1 : frame.uplink);
      place(i, u, -gap, size, 1);
    }
    // Telemetry (spacecraft → ground): sparse, round.
    for (let i = 0; i < TELEMETRY_PULSES; i++) {
      const u = 1 - ((frame.now * 0.22 + i / TELEMETRY_PULSES) % 1);
      place(UPLINK_PULSES + i, u, -gap, 0.0042 * frame.telemetry * Math.sin(Math.PI * u) ** 0.4, 1);
    }
    // Payload data (spacecraft → ground): dense, elongated.
    for (let i = 0; i < PAYLOAD_PULSES; i++) {
      const u = 1 - ((frame.now * 0.36 + i / PAYLOAD_PULSES) % 1);
      place(UPLINK_PULSES + TELEMETRY_PULSES + i, u, gap, 0.0034 * frame.payloadDownlink * Math.sin(Math.PI * u) ** 0.4, 2.8);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="GroundLink">
      <threeLine geometry={sGeometry} frustumCulled={false}>
        <lineBasicMaterial ref={sLine} color={ACCENT.rf} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </threeLine>
      <threeLine geometry={xGeometry} frustumCulled={false}>
        <lineBasicMaterial ref={xLine} color={ACCENT.data} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </threeLine>
      <instancedMesh ref={pulses} args={[undefined, undefined, TOTAL]} frustumCulled={false} visible={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
