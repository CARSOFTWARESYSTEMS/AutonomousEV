// Propulsion model: what each of the eight units is doing for a given flight
// state. Tilt units carry the aircraft in every phase; lift units only while
// the rotors share the lift. Simulated values.
import type { UnitNo } from "../types";
import { UNIT_MOUNTS, type UnitKind } from "../aircraft/layout";
import { baselineVibration } from "./faultModels";
import type { FlightState } from "./mission";

export interface UnitState {
  no: UnitNo;
  kind: UnitKind;
  rpm: number;
  /** Fraction of maximum continuous load, 0–1. */
  load: number;
  torqueNm: number;
  /** Phase current, A. */
  currentA: number;
  dcVoltage: number;
  windingTempC: number;
  inverterTempC: number;
  bearingTempC: number;
  /** Vibration at the front-bearing sensor, simulated units. */
  vibration: number;
  /** 90 = thrust up, 0 = thrust forward. Lift units are fixed at 90. */
  tiltDeg: number;
  /** Electrical power drawn, kW. */
  powerKw: number;
}

const MAX_TORQUE_NM = 620;
const MAX_CURRENT_A = 355;

/** Small fixed differences between units, so eight healthy units do not read identically. */
const UNIT_TRIM: readonly number[] = [0.012, -0.008, 0.004, -0.004, 0.009, -0.011, 0.006, -0.002];

export function unitStates(flight: FlightState, busVoltage: number): UnitState[] {
  return UNIT_MOUNTS.map((mount, index) => {
    const tilt = mount.kind === "tilt";
    const trim = 1 + UNIT_TRIM[index];
    const rpm = (tilt ? flight.tiltRpm : flight.liftRpm) * (1 + UNIT_TRIM[index] * 0.2);
    const load = (tilt ? flight.tiltLoad : flight.liftLoad) * trim;
    const running = rpm > 1;
    // Winding temperature follows the flight model for a tilt unit; a lift unit cools once it stops.
    const ambient = 32;
    const windingTempC = tilt ? flight.motorTempC * trim : ambient + (flight.motorTempC - ambient) * (running ? 0.96 : 0.42) * trim;
    const torqueNm = MAX_TORQUE_NM * load;
    return {
      no: mount.no,
      kind: mount.kind,
      rpm,
      load,
      torqueNm,
      currentA: MAX_CURRENT_A * load,
      dcVoltage: busVoltage,
      windingTempC,
      inverterTempC: ambient + (windingTempC - ambient) * 0.72,
      bearingTempC: running ? 34 + 9 * (rpm / 1250) + 30 * load : ambient + (windingTempC - ambient) * 0.3,
      vibration: baselineVibration(rpm, load) * trim,
      tiltDeg: tilt ? flight.tiltDeg : 90,
      powerKw: (torqueNm * rpm * 2 * Math.PI) / 60 / 1000 / 0.93,
    };
  });
}

export const unitState = (units: readonly UnitState[], no: UnitNo): UnitState => units[Number(no) - 1];
