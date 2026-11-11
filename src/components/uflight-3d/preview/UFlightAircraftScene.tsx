// The UFlight™ scene for the homepage preview: the same aircraft, simulation
// driver, camera rig, lighting, studio and digital-twin workspace as the full
// application, with only the overlays the four stages use. Nothing here is a
// copy: every component is the application's own. Left out: the flight and
// vertiport environments (the preview stays in the dark studio), the side
// panels, scene labels and post-processing.
import CameraRig, { type CameraRigOptions } from "../scene/CameraRig";
import Lighting from "../scene/Lighting";
import SimulationDriver from "../scene/SimulationDriver";
import Sky from "../scene/Sky";
import StudioEnvironment from "../scene/StudioEnvironment";
import TwinEnvironment from "../scene/TwinEnvironment";
import UFlightAircraft from "../aircraft/UFlightAircraft";
import Flows from "../overlays/Flows";
import SensorMarkers from "../overlays/SensorMarkers";
import TwinGhost from "../overlays/TwinGhost";
import VibrationOverlay from "../overlays/VibrationOverlay";

export default function UFlightAircraftScene({ rig }: { rig: CameraRigOptions }) {
  return (
    <>
      <SimulationDriver />
      <CameraRig {...rig} />
      <Sky />
      <Lighting />
      <StudioEnvironment />
      <TwinEnvironment />
      <UFlightAircraft>
        <Flows />
        <VibrationOverlay />
        <SensorMarkers />
      </UFlightAircraft>
      <TwinGhost />
    </>
  );
}
