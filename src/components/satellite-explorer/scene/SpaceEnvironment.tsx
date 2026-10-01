// Everything around the spacecraft: stars, Sun and lighting, Earth with its
// atmosphere, and the geometry drawn on or around Earth.
import GroundLink from "../overlays/GroundLink";
import { GroundTrack, OrbitRing, SubSatellitePoint, SunGeometry } from "../overlays/OrbitPath";
import PayloadFootprint from "../overlays/PayloadFootprint";
import Atmosphere from "./Atmosphere";
import Earth from "./Earth";
import GroundStation from "./GroundStation";
import StarField from "./StarField";
import SunLight from "./SunLight";

export default function SpaceEnvironment({ onEarthProgress }: { onEarthProgress?: (fraction: number) => void }) {
  return (
    <>
      <StarField />
      <SunLight />
      <Earth onProgress={onEarthProgress}>
        {/* Earth-fixed: these turn with the planet. */}
        <GroundStation />
        <GroundTrack />
      </Earth>
      <Atmosphere />
      {/* Inertial / spacecraft-relative geometry. */}
      <OrbitRing />
      <SunGeometry />
      <SubSatellitePoint />
      <PayloadFootprint />
      <GroundLink />
    </>
  );
}
