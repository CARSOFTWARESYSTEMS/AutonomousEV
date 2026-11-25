// Longitudinal vehicle dynamics (WPT-VEH-001): road-load forces, traction
// power at the wheels and at the battery, with drivetrain efficiency,
// auxiliary load and a regenerative-braking power limit.
import { AIR_DENSITY, G0 } from "./math";

export interface VehicleParams {
  /** Kerb mass plus payload, kg. */
  mass: number;
  dragCoefficient: number;
  /** Frontal area, m². */
  frontalArea: number;
  rollingResistance: number;
  /** Equivalent-mass factor for rotating inertia. */
  rotationalFactor: number;
  /** Battery-to-wheel efficiency when motoring. */
  drivetrainEfficiency: number;
  /** Wheel-to-battery efficiency when regenerating. */
  regenEfficiency: number;
  /** Most regenerative power the drivetrain and battery accept, W. */
  regenLimit: number;
  /** Heating, cooling, electronics, W. */
  auxiliaryPower: number;
  wheelbase: number;
  /** Vehicle body length, m (covers road coils for the safety interlock). */
  length: number;
  /** Receiver pad centre ahead of the vehicle centre, m. */
  receiverOffset: number;
}

export const DEFAULT_VEHICLE: VehicleParams = {
  mass: 1950,
  dragCoefficient: 0.26,
  frontalArea: 2.35,
  rollingResistance: 0.009,
  rotationalFactor: 1.05,
  drivetrainEfficiency: 0.88,
  regenEfficiency: 0.75,
  regenLimit: 60000,
  auxiliaryPower: 1200,
  wheelbase: 2.9,
  length: 4.7,
  receiverOffset: 0.6,
};

export interface RoadLoad {
  aero: number;
  rolling: number;
  grade: number;
  inertia: number;
  total: number;
  /** Power at the wheels, W (negative when braking). */
  wheelPower: number;
  /** Electrical power drawn from the battery, W (negative when regenerating). */
  electricalPower: number;
  /** Braking power the friction brakes absorb, W. */
  frictionPower: number;
}

/**
 * Forces at speed v (m/s), acceleration a (m/s²) and road gradient θ (rad):
 * F_aero = ½ρC_dAv², F_roll = C_rr·m·g·cosθ, F_grade = m·g·sinθ,
 * F_inertia = k_r·m·a; P_wheel = F·v.
 */
export function roadLoad(p: VehicleParams, v: number, a: number, grade: number): RoadLoad {
  const aero = 0.5 * AIR_DENSITY * p.dragCoefficient * p.frontalArea * v * v;
  const rolling = v > 0.01 ? p.rollingResistance * p.mass * G0 * Math.cos(grade) : 0;
  const gradeForce = p.mass * G0 * Math.sin(grade);
  const inertia = p.rotationalFactor * p.mass * a;
  const total = aero + rolling + gradeForce + inertia;
  const wheelPower = total * v;
  let electricalPower: number;
  let frictionPower = 0;
  if (wheelPower >= 0) electricalPower = wheelPower / p.drivetrainEfficiency + p.auxiliaryPower;
  else {
    const regen = Math.min(-wheelPower * p.regenEfficiency, p.regenLimit);
    frictionPower = -wheelPower - regen / p.regenEfficiency;
    electricalPower = -regen + p.auxiliaryPower;
  }
  return { aero, rolling, grade: gradeForce, inertia, total, wheelPower, electricalPower, frictionPower };
}
