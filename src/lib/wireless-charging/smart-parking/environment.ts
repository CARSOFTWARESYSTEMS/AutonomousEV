// Shelter environment and its control (SP-MATH-007).
//
// Weather: irradiance follows the district model's daily PV shape (reused
// from WPT-GRID-001), reduced by cloud and rain; ambient temperature follows
// a declared daily cycle. The shelter air is one lumped thermal node:
//   C_th · dT/dt = Q_solar + Q_equipment − Q_ventilation − Q_loss
//   Q_solar = α · G · A_roof · f,  Q_vent = ṁ c_p (T − T_amb),  Q_loss = UA (T − T_amb)
// integrated exactly over each step (inputs held constant over the step).
// Carbon monoxide and the simulated smoke and gas are well-mixed volumes:
//   V · dc/dt = G_source − Q_air (c − c_amb)
// The local safety controller turns the fans to full and raises the alarm
// above thresholds, independently of the gateway and the cloud. Prototype
// smoke and gas sensors are not certified life-safety equipment; the twin
// never releases a real gas or smoke, and the POC tests use approved
// simulated methods only.
import { pvShape } from "../infrastructure";
import type { Rng } from "../math";

export interface EnvInputs {
  /** Daily mean ambient temperature and half-swing, °C. */
  ambientMean: number;
  ambientSwing: number;
  /** 0 clear – 1 overcast. */
  cloud: number;
  rain: boolean;
  humidity: number;
  /** Roof plan area, m². */
  roofArea: number;
  /** Shelter air volume (open sides count partly), m³. */
  volume: number;
  /** Fan airflow at full speed, m³/s. */
  fanFlow: number;
  /** Natural ventilation of the open structure, m³/s. */
  naturalFlow: number;
  /** Control thresholds. */
  fanOnTemperature: number;
  coLimit: number;
  smokeAlarm: number;
  gasAlarm: number;
}

export const DEFAULT_ENV: EnvInputs = { ambientMean: 29, ambientSwing: 5, cloud: 0.2, rain: false, humidity: 0.55, roofArea: 260, volume: 950, fanFlow: 9, naturalFlow: 6, fanOnTemperature: 31, coLimit: 35, smokeAlarm: 8, gasAlarm: 10 };

/** Declared thermal parameters of the shelter node. */
export const THERMAL = {
  /** Effective heat capacity: the air plus a thin layer of structure, J/K. */
  C: 4.2e6,
  /** Conductive/convective loss to ambient through the open structure, W/K. */
  UA: 2600,
  /** Roof absorptance × fraction of absorbed solar that reaches the shelter air. */
  solarGain: 0.06,
  rhoCp: 1.2 * 1005,
} as const;

export interface EnvState {
  t: number;
  hour: number;
  irradiance: number;
  ambient: number;
  temperature: number;
  humidity: number;
  /** Illuminance under the canopy from daylight, lux. */
  daylightLux: number;
  co: number;
  /** Simulated smoke, % obscuration per metre. */
  smoke: number;
  /** Simulated flammable gas, % of the lower explosive limit. */
  gas: number;
  fanDuty: number;
  fanFailed: boolean;
  lighting: number;
  alarm: "none" | "smoke" | "gas";
  alarmSince: number;
  acknowledged: boolean;
  /** Heat terms of the last step, W. */
  q: { solar: number; equipment: number; ventilation: number; loss: number };
}

export const newEnv = (inputs: EnvInputs, hour: number): EnvState => {
  const amb = ambientAt(inputs, hour);
  return { t: 0, hour, irradiance: irradianceAt(inputs, hour), ambient: amb, temperature: amb + 0.8, humidity: inputs.humidity, daylightLux: 0, co: 1, smoke: 0, gas: 0, fanDuty: 0, fanFailed: false, lighting: 0.3, alarm: "none", alarmSince: 0, acknowledged: false, q: { solar: 0, equipment: 0, ventilation: 0, loss: 0 } };
};

/** Global horizontal irradiance, W/m² (district PV shape scaled to 1000 W/m² at its peak, cloud and rain reduce it). */
export function irradianceAt(i: EnvInputs, hour: number): number {
  return (1000 * pvShape(((hour % 24) + 24) % 24)) / 0.82 * (1 - 0.75 * i.cloud) * (i.rain ? 0.35 : 1);
}

export function ambientAt(i: EnvInputs, hour: number): number {
  return i.ambientMean + i.ambientSwing * Math.sin((2 * Math.PI * (hour - 9)) / 24) - (i.rain ? 3 : 0);
}

export interface EnvDrivers {
  /** Heat from equipment, chargers' losses, lighting and parked vehicles, W. */
  equipment: number;
  /** Conventional vehicles moving under the shelter (CO sources). */
  movingCombustion: number;
  /** Simulated sources (scenarios only). */
  smokeSource: boolean;
  gasSource: boolean;
  fanFailure: boolean;
  /** Occupancy-based lighting: someone is moving in the shelter. */
  activity: boolean;
  sensorFailure: boolean;
}

/** Ventilation demand of the local controller, 0–1. */
export function fanDemand(e: EnvState, i: EnvInputs): number {
  if (e.alarm !== "none") return 1;
  const thermal = Math.min(1, Math.max(0, (e.temperature - i.fanOnTemperature) / 6));
  const co = Math.min(1, Math.max(0, (e.co - i.coLimit * 0.6) / (i.coLimit * 0.8)));
  return Math.max(thermal, co);
}

/** One step of the shelter environment and its local control. */
export function stepEnv(e: EnvState, i: EnvInputs, d: EnvDrivers, hour: number, dt: number, r: Rng) {
  e.t += dt;
  e.hour = hour;
  e.irradiance = irradianceAt(i, hour);
  e.ambient = ambientAt(i, hour);
  // Canopy shade: about 3 % of open-sky daylight reaches the bays (1 W/m² ≈ 110 lux of daylight).
  e.daylightLux = e.irradiance * 110 * 0.03;
  e.fanFailed = d.fanFailure;
  const demand = fanDemand(e, i);
  e.fanDuty = e.fanFailed ? 0 : demand;
  const Q = i.naturalFlow * (i.rain ? 0.8 : 1) + i.fanFlow * e.fanDuty;
  const mcp = THERMAL.rhoCp * Q;
  const qSolar = THERMAL.solarGain * e.irradiance * i.roofArea;
  const gain = qSolar + d.equipment;
  const k = THERMAL.UA + mcp;
  const tInf = e.ambient + gain / k;
  const tau = THERMAL.C / k;
  e.temperature = tInf + (e.temperature - tInf) * Math.exp(-dt / tau);
  e.q = { solar: qSolar, equipment: d.equipment, ventilation: mcp * (e.temperature - e.ambient), loss: THERMAL.UA * (e.temperature - e.ambient) };
  // Humidity relaxes toward ambient (higher in rain); 20 min time constant.
  const rhTarget = Math.min(0.98, i.humidity + (i.rain ? 0.3 : 0));
  e.humidity = rhTarget + (e.humidity - rhTarget) * Math.exp(-dt / 1200);
  // Well-mixed pollutants: exact step of V dc/dt = G − Q (c − c_amb).
  const mix = (c: number, source: number, amb: number) => {
    const cInf = amb + source / Q;
    return cInf + (c - cInf) * Math.exp((-Q / i.volume) * dt);
  };
  // CO: about 0.9 ppm·m³/s from one slow-moving combustion vehicle (representative), background 1 ppm.
  e.co = mix(e.co, 0.9 * d.movingCombustion, 1);
  e.smoke = mix(e.smoke, d.smokeSource ? 140 : 0, 0);
  e.gas = mix(e.gas, d.gasSource ? 170 : 0, 0);
  // Local safety controller (independent of the gateway): alarm on simulated smoke or gas.
  const smokeHigh = e.smoke >= i.smokeAlarm;
  const gasHigh = e.gas >= i.gasAlarm;
  if (e.alarm === "none" && (smokeHigh || gasHigh)) {
    e.alarm = gasHigh ? "gas" : "smoke";
    e.alarmSince = e.t;
    e.acknowledged = false;
  } else if (e.alarm !== "none" && !smokeHigh && !gasHigh && e.smoke < i.smokeAlarm * 0.5 && e.gas < i.gasAlarm * 0.5 && e.acknowledged) e.alarm = "none";
  // Lighting: daylight-linked dimming to hold 150 lux at the bays, raised to full by activity, 30 % standby at night.
  const need = Math.max(0, Math.min(1, (150 - e.daylightLux) / 150));
  e.lighting = e.alarm !== "none" ? 1 : need <= 0.02 ? 0 : Math.max(0.3 * need + 0.05, d.activity ? need : 0.3 * need);
  void r;
}

/** Electrical load of the environmental equipment, W. */
export const envLoads = (e: EnvState) => ({ fans: 4 * 180 * e.fanDuty ** 3 + (e.fanDuty > 0 ? 24 : 0), lighting: 24 * 40 * e.lighting, alarm: e.alarm !== "none" ? 60 : 4 });
