// Root of the UFlight™ Reference eVTOL. Position and attitude come from the
// simulation; the assemblies below register their parts under semantic ids.
// To swap in an authored GLB, render it here in place of the procedural
// assemblies and bind its nodes with `bindModel` (see modelRegistry.ts).
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { frame } from "../scene/frameState";
import Avionics from "./Avionics";
import Cabin from "./Cabin";
import EnergySystem from "./EnergySystem";
import FlightControls from "./FlightControls";
import Fuselage from "./Fuselage";
import HUMS from "./HUMS";
import LandingGear from "./LandingGear";
import Navigation, { Communications } from "./Navigation";
import NavLights from "./NavLights";
import Propulsion, { disposeRotorTextures } from "./Propulsion";
import Tail from "./Tail";
import Thermal from "./Thermal";
import Wing, { Booms } from "./Wing";
import { AIRCRAFT_CENTRE } from "./layout";
import { disposeGeometryCache } from "./geometry";
import { disposeMaterialTextures } from "./materials";

/** Pitch turns the aircraft about a point near its centre of gravity rather than about the ground. */
const PIVOT_Y = AIRCRAFT_CENTRE[1];

export default function UFlightAircraft({ children }: { children?: React.ReactNode }) {
  const root = useRef<Group>(null);
  const attitude = useRef<Group>(null);

  useEffect(
    () => () => {
      disposeGeometryCache();
      disposeMaterialTextures();
      disposeRotorTextures();
    },
    [],
  );

  useFrame(() => {
    root.current?.position.set(frame.position.x, frame.position.y + frame.lift + PIVOT_Y, frame.position.z);
    if (attitude.current) attitude.current.rotation.z = frame.pitch;
  });

  return (
    <group ref={root} name="AircraftRoot">
      <group ref={attitude}>
        <group position={[0, -PIVOT_Y, 0]}>
          <Fuselage />
          <Cabin />
          <Wing />
          <Booms />
          <Tail />
          <LandingGear />
          <Propulsion />
          <EnergySystem />
          <FlightControls />
          <Navigation />
          <Communications />
          <Avionics />
          <Thermal />
          <HUMS />
          <NavLights />
          {/* Overlays drawn in aircraft coordinates. */}
          {children}
        </group>
      </group>
    </group>
  );
}
