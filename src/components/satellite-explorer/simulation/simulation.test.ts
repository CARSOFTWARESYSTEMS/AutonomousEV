import { describe, expect, it } from "vitest";
import { DEG, dot, length, quatAngle, quatRotate } from "../lib/math";
import { ADCS_REFERENCE, attitudeFor, bodyRate, slewDemoAt, sunIncidenceCos, wheelSpeedsRpm, SLEW_DEMO } from "./adcs";
import { AOS_WINDOW_S, linkAt } from "./communications";
import {
  ECLIPSE_FRACTION,
  EARTH_RADIUS_KM,
  GROUND_STATION,
  OBSERVATION_TARGET,
  ORBIT_EVENTS,
  ORBIT_PERIOD_S,
  ORBIT_REFERENCE,
  SUN_DIRECTION,
  geoToUnit,
  intersectEarth,
  lookAngles,
  orbitStateAt,
  subSatellitePoint,
  sunFractionAt,
  surfacePointAt,
  unitToGeo,
} from "./orbit";
import { CAPTURE_SEQUENCE_S, CAPTURE_TIMING, PAYLOAD_REFERENCE, captureSequenceAt, swathKm } from "./payload";
import { NOMINAL_LOADS_W, POWER_REFERENCE, busVoltageV, generationW, loadsW, stepBattery, totalLoadW } from "./power";

describe("orbit model", () => {
  it("has a ~95 minute period and a ~34 minute eclipse at the reference altitude", () => {
    expect(ORBIT_PERIOD_S / 60).toBeGreaterThan(94);
    expect(ORBIT_PERIOD_S / 60).toBeLessThan(96);
    const eclipseMin = (ECLIPSE_FRACTION * ORBIT_PERIOD_S) / 60;
    expect(eclipseMin).toBeGreaterThan(30);
    expect(eclipseMin).toBeLessThan(36);
  });

  it("keeps the spacecraft at the reference altitude with velocity perpendicular to position", () => {
    for (const t of [-1500, 0, 800, 4000]) {
      const s = orbitStateAt(t);
      expect(length(s.position) - EARTH_RADIUS_KM).toBeCloseTo(ORBIT_REFERENCE.altitudeKm, 6);
      expect(dot(s.zenith, s.velocityDir)).toBeCloseTo(0, 9);
    }
  });

  it("flies over the observation target at t = 0, heading south, in daylight", () => {
    const at = subSatellitePoint(0);
    expect(at.latDeg).toBeCloseTo(OBSERVATION_TARGET.latDeg, 3);
    expect(at.lonDeg).toBeCloseTo(OBSERVATION_TARGET.lonDeg, 3);
    expect(subSatellitePoint(30).latDeg).toBeLessThan(at.latDeg);
    expect(sunFractionAt(0)).toBe(1);
    // The target itself is on the day side.
    expect(dot(surfacePointAt(OBSERVATION_TARGET, 0), SUN_DIRECTION)).toBeGreaterThan(0);
  });

  it("round-trips latitude and longitude through the texture mapping", () => {
    const geo = unitToGeo(geoToUnit(GROUND_STATION));
    expect(geo.latDeg).toBeCloseTo(GROUND_STATION.latDeg, 9);
    expect(geo.lonDeg).toBeCloseTo(GROUND_STATION.lonDeg, 9);
  });

  it("orders the reference events: eclipse exit → target → AOS → closest approach → LOS → eclipse entry", () => {
    const { eclipseExitS, targetS, pass, eclipseEntryS } = ORBIT_EVENTS;
    expect(eclipseExitS).toBeLessThan(targetS);
    expect(targetS).toBeLessThan(pass.aosS);
    expect(pass.aosS).toBeLessThan(pass.closestApproachS);
    expect(pass.closestApproachS).toBeLessThan(pass.losS);
    expect(pass.losS).toBeLessThan(eclipseEntryS);
    expect(pass.maxElevationDeg).toBeGreaterThan(30);
    // A realistic low-Earth-orbit pass lasts a few minutes.
    expect((pass.losS - pass.aosS) / 60).toBeGreaterThan(5);
    expect((pass.losS - pass.aosS) / 60).toBeLessThan(12);
  });

  it("is in shadow just before the eclipse exit and in sunlight just after", () => {
    expect(sunFractionAt(ORBIT_EVENTS.eclipseExitS - 60)).toBe(0);
    expect(sunFractionAt(ORBIT_EVENTS.eclipseExitS + 60)).toBe(1);
  });

  it("intersects the Earth along the nadir direction at the sub-satellite point", () => {
    const s = orbitStateAt(120);
    const hit = intersectEarth(s.position, [-s.zenith[0], -s.zenith[1], -s.zenith[2]]);
    expect(hit).not.toBeNull();
    expect(length(hit!)).toBeCloseTo(EARTH_RADIUS_KM, 6);
    expect(intersectEarth(s.position, s.zenith)).toBeNull();
  });
});

describe("communications", () => {
  const { pass } = ORBIT_EVENTS;

  it("reports NO LINK below the horizon, AOS on rising, LINK ACTIVE in view and LOS on setting", () => {
    expect(linkAt(pass.aosS - 120).state).toBe("NO_LINK");
    expect(linkAt(pass.aosS + 5).state).toBe("AOS");
    expect(linkAt(pass.aosS + AOS_WINDOW_S + 10).state).toBe("LINK_ACTIVE");
    expect(linkAt(pass.closestApproachS).state).toBe("LINK_ACTIVE");
    expect(linkAt(pass.losS + 5).state).toBe("LOS");
    expect(linkAt(pass.losS + 200).state).toBe("NO_LINK");
  });

  it("is visible exactly while the spacecraft is above the elevation mask", () => {
    expect(linkAt(pass.closestApproachS).visible).toBe(true);
    expect(linkAt(pass.closestApproachS).elevationDeg).toBeCloseTo(pass.maxElevationDeg, 0);
    expect(lookAngles(GROUND_STATION, pass.aosS).elevationDeg).toBeCloseTo(ORBIT_REFERENCE.elevationMaskDeg, 2);
    expect(linkAt(pass.aosS - 5).visible).toBe(false);
  });

  it("has its shortest slant range near closest approach", () => {
    expect(linkAt(pass.closestApproachS).rangeKm).toBeLessThan(linkAt(pass.aosS + 1).rangeKm);
    expect(linkAt(pass.closestApproachS).rangeKm).toBeGreaterThan(ORBIT_REFERENCE.altitudeKm);
  });
});

describe("power model", () => {
  it("nominal loads sum to the 12.1 W reference load", () => {
    expect(totalLoadW(NOMINAL_LOADS_W)).toBeCloseTo(12.1, 6);
    expect(totalLoadW(loadsW({ sunlit: true }))).toBeCloseTo(12.1, 6);
  });

  it("generates nothing in eclipse and peak power at normal incidence", () => {
    expect(generationW(0, 1)).toBe(0);
    expect(generationW(1, 1)).toBe(POWER_REFERENCE.arrayPeakW);
    expect(generationW(1, -0.4)).toBe(0);
    expect(generationW(1, 0.5)).toBeCloseTo(POWER_REFERENCE.arrayPeakW / 2, 6);
  });

  it("raises load for transmitting, imaging and eclipse heating", () => {
    const base = totalLoadW(loadsW({ sunlit: true }));
    expect(totalLoadW(loadsW({ sunlit: true, xbandTransmit: true }))).toBeGreaterThan(base);
    expect(totalLoadW(loadsW({ sunlit: true, imaging: true }))).toBeGreaterThan(base);
    expect(loadsW({ sunlit: false }).heaters).toBeGreaterThan(loadsW({ sunlit: true }).heaters);
    expect(totalLoadW(loadsW({ sunlit: false, booting: true }))).toBeLessThan(base);
  });

  it("charges in sunlight, discharges in eclipse and conserves energy", () => {
    const charging = stepBattery(0.5, 18.4, 12.1, 3600);
    expect(charging.state).toBe("CHARGING");
    expect(charging.socFraction).toBeCloseTo(0.5 + (6.3 * POWER_REFERENCE.chargeEfficiency) / POWER_REFERENCE.batteryCapacityWh, 6);

    const discharging = stepBattery(0.5, 0, 12.1, 600);
    expect(discharging.state).toBe("DISCHARGING");
    expect(discharging.socFraction).toBeLessThan(0.5);
    expect(discharging.batteryW).toBeCloseTo(-12.1, 6);
  });

  it("never exceeds 100% or drops below 0%, and stops drawing array power when full", () => {
    const full = stepBattery(1, 30, 5, 3600);
    expect(full.socFraction).toBe(1);
    expect(full.batteryW).toBe(0);
    expect(full.state).toBe("BALANCED");
    expect(stepBattery(0.001, 0, 20, 36000).socFraction).toBe(0);
  });

  it("reports about 8.1 V at 78% state of charge", () => {
    expect(busVoltageV(0.78)).toBeCloseTo(8.1, 1);
  });
});

describe("attitude control", () => {
  const s = orbitStateAt(0);
  const ctx = { position: s.position, velocityDir: s.velocityDir, sunDir: SUN_DIRECTION };

  it("points the payload boresight (−Y) at Earth's centre in NADIR", () => {
    const boresight = quatRotate(attitudeFor("NADIR", ctx), [0, -1, 0]);
    expect(dot(boresight, s.zenith)).toBeCloseTo(-1, 9);
  });

  it("points the solar-cell normal (+Z) at the Sun in SUN_POINTING", () => {
    expect(sunIncidenceCos(attitudeFor("SUN_POINTING", ctx), SUN_DIRECTION)).toBeCloseTo(1, 9);
  });

  it("points the boresight at the aim point when tracking", () => {
    const early = orbitStateAt(-40);
    const aim = surfacePointAt(OBSERVATION_TARGET, -40);
    const q = attitudeFor("TARGET_TRACK", { position: early.position, velocityDir: early.velocityDir, sunDir: SUN_DIRECTION, aimPoint: aim });
    const boresight = quatRotate(q, [0, -1, 0]);
    const toTarget = [aim[0] - early.position[0], aim[1] - early.position[1], aim[2] - early.position[2]] as const;
    expect(dot(boresight, toTarget) / length(toTarget)).toBeCloseTo(1, 9);
    // Tracking a target ahead means pitching away from straight down.
    expect(quatAngle(q, attitudeFor("NADIR", { ...ctx, position: early.position, velocityDir: early.velocityDir })) / DEG).toBeGreaterThan(10);
  });

  it("yaws the arrays toward the Sun while nadir pointing", () => {
    expect(sunIncidenceCos(attitudeFor("NADIR", ctx), SUN_DIRECTION)).toBeGreaterThan(0.3);
  });

  it("spins each wheel against the body rate about its axis", () => {
    const bias = ADCS_REFERENCE.biasRpm;
    const rpm = wheelSpeedsRpm([1 * DEG, 0, -0.5 * DEG]);
    expect(rpm[0]).toBeCloseTo(bias[0] - ADCS_REFERENCE.rpmPerDegPerS, 6);
    expect(rpm[1]).toBeCloseTo(bias[1], 6);
    expect(rpm[2]).toBeCloseTo(bias[2] + 0.5 * ADCS_REFERENCE.rpmPerDegPerS, 6);
    expect(wheelSpeedsRpm([0, 0, 0])).toEqual([...bias]);
    expect(Math.abs(wheelSpeedsRpm([100, 0, 0])[0])).toBe(ADCS_REFERENCE.maxRpm);
  });

  it("recovers the rate between two attitudes", () => {
    const a = attitudeFor("NADIR", ctx);
    expect(length(bodyRate(a, a, 1))).toBe(0);
    const later = orbitStateAt(10);
    const b = attitudeFor("NADIR", { position: later.position, velocityDir: later.velocityDir, sunDir: SUN_DIRECTION });
    // Nadir pointing turns the body roughly once per orbit.
    expect(length(bodyRate(a, b, 10)) / DEG).toBeGreaterThan(0.04);
    expect(length(bodyRate(a, b, 10)) / DEG).toBeLessThan(0.2);
  });

  it("slew demonstration turns the wheel opposite to the body and ends at the commanded angle", () => {
    const mid = slewDemoAt(SLEW_DEMO.durationS / 2);
    expect(mid.rateDegS).toBeGreaterThan(0);
    expect(mid.wheelDeltaRpm).toBeLessThan(0);
    expect(Math.sign(slewDemoAt(SLEW_DEMO.durationS / 2, -1).wheelDeltaRpm)).toBe(1);
    const end = slewDemoAt(SLEW_DEMO.durationS + 1);
    expect(end.done).toBe(true);
    expect(end.angleDeg).toBeCloseTo(SLEW_DEMO.angleDeg, 6);
    expect(end.wheelDeltaRpm).toBeCloseTo(0, 9);
    expect(slewDemoAt(0).angleDeg).toBe(0);
  });
});

describe("payload", () => {
  it("images a ~70 km swath from the reference altitude", () => {
    expect(swathKm()).toBeGreaterThan(65);
    expect(swathKm()).toBeLessThan(75);
  });

  it("walks through acquire → capture → process → stored and adds the capture to storage", () => {
    expect(captureSequenceAt(-1).phase).toBe("IDLE");
    expect(captureSequenceAt(1).phase).toBe("TARGET_ACQUIRED");
    expect(captureSequenceAt(CAPTURE_TIMING.acquireS + 0.5).phase).toBe("CAPTURING");
    expect(captureSequenceAt(CAPTURE_TIMING.acquireS + CAPTURE_TIMING.exposeS + 1).phase).toBe("PROCESSING");
    const done = captureSequenceAt(CAPTURE_SEQUENCE_S + 0.1);
    expect(done.phase).toBe("STORED");
    expect(captureSequenceAt(0).storedMb).toBe(243);
    expect(done.storedMb).toBe(PAYLOAD_REFERENCE.storedBeforeCaptureMb + PAYLOAD_REFERENCE.captureSizeMb);
    expect(done.storedMb).toBe(318);
  });

  it("only grows stored data, never shrinks it, through the sequence", () => {
    let previous = 0;
    for (let t = -1; t <= CAPTURE_SEQUENCE_S + 1; t += 0.2) {
      const { storedMb } = captureSequenceAt(t);
      expect(storedMb).toBeGreaterThanOrEqual(previous);
      previous = storedMb;
    }
  });
});
