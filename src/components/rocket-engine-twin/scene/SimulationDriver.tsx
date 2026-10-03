// Runs first every frame: turns interaction state and the pure simulation
// models into the per-frame values everything else draws from. Nothing here
// draws, and nothing that draws decides anything.
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TEST_PHASES } from "../data/engineReference";
import { SCENARIO_SECONDS, SEVERITY_LIMIT, stageAt, twinReading } from "../simulation/bearingFault";
import { COLD, type OperatingPoint, PHASE_MS, REFERENCE_RUNNING, operatingPoint, scriptedThrottle } from "../simulation/engineSim";
import { partHealth, partLooks } from "../state/selectors";
import { type TwinState, useRocketTwinStore } from "../state/twinStore";
import type { FlowId } from "../types";
import { damp, frame, resetFrame } from "./frameState";

/** Turbopump rotation at full power, radians per second. Scaled for the eye: not a shaft speed. */
const VISUAL_SPIN = 7.5;
/** The uncooled comparison runs this long before the wall is restored, in seconds. */
const COMPARISON_SECONDS = 1.8;
const FLOWS: readonly FlowId[] = ["propellant", "cooling", "hot_gas", "data"];
const KEYS = Object.keys(COLD) as (keyof OperatingPoint)[];

/** What the engine should be doing when no test is running: views that need it running get a steady reference point. */
function restingPoint(s: TwinState): OperatingPoint {
  if (s.mode === "flow" && s.flow && s.flow !== "data") return REFERENCE_RUNNING;
  if (s.bearing !== null && (s.mode === "health" || s.mode === "twin")) return { ...REFERENCE_RUNNING, chamber: 0, plume: 0, thermal: 0, thrust: 0, flow: 0.4 };
  if (s.energyFlow || (s.cutaway === "turbomachinery" && s.system === "turbomachinery")) return { ...COLD, rotor: 0.6, flow: 0.4 };
  if (s.cutaway === "nozzle" && s.mode !== "build") return REFERENCE_RUNNING;
  return COLD;
}

export default function SimulationDriver() {
  const clock = useRef({ phase: -1, status: "idle", comparison: 0 });

  // Looks only change when the state does, so they are worked out then, not every frame.
  useEffect(() => {
    resetFrame();
    const update = (s: TwinState) => {
      frame.looks = partLooks(s, frame.severity);
      frame.health = partHealth(s, frame.severity);
    };
    update(useRocketTwinStore.getState());
    return useRocketTwinStore.subscribe(update);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = useRocketTwinStore.getState();
    const c = clock.current;
    frame.now += dt;
    frame.power = damp(frame.power, s.entered ? 1 : 0, 1.6, dt);
    frame.exploded = s.reducedMotion ? s.explodedAmount : damp(frame.exploded, s.explodedAmount, 5, dt);

    // ── Simulated Engine Test ──
    const phase = TEST_PHASES[s.test.phase].id;
    if (c.phase !== s.test.phase || c.status !== s.test.status) {
      c.phase = s.test.phase;
      c.status = s.test.status;
      frame.phaseElapsed = 0;
    } else {
      frame.phaseElapsed += dt * 1000;
    }
    const running = s.test.status === "running";
    const progress = Math.min(1, frame.phaseElapsed / PHASE_MS[phase]);
    const throttle = s.throttle !== null ? s.throttle / 100 : phase === "throttle" ? scriptedThrottle(progress) : 1;
    const target = running ? operatingPoint(phase, progress, throttle) : restingPoint(s);
    // The test's own phases are already smooth; everything else eases in and out.
    const rate = running && phase !== "throttle" ? 9 : 2.4;
    for (const key of KEYS) frame.engine[key] = damp(frame.engine[key], target[key], rate, dt);
    frame.rotorAngle += dt * VISUAL_SPIN * frame.engine.rotor;

    // ── Flows ──
    for (const id of FLOWS) {
      let strength = s.mode === "flow" && s.flow === id ? 1 : 0;
      if (id === "propellant" && s.mode === "test") strength = Math.max(strength, 0.6 * frame.engine.flow);
      if (id === "data" && (s.tracing || s.mode === "architecture")) strength = 1;
      if (id === "hot_gas" && s.energyFlow) strength = 0.8;
      frame.flow[id] = damp(frame.flow[id], strength, 4, dt);
    }
    frame.pressure = damp(frame.pressure, s.pressure ? 1 : 0, 5, dt);

    // ── Cooling comparison: the wall heats without its coolant, briefly, then is restored ──
    if (!s.cooled) {
      c.comparison += dt;
      if (c.comparison > COMPARISON_SECONDS) s.restoreCooling();
    } else {
      c.comparison = 0;
    }
    frame.wallHeat = damp(frame.wallHeat, s.cooled ? 1 : 2.6, s.cooled ? 2.2 : 3.4, dt);

    // ── Bearing degradation ──
    if (s.bearing !== null) {
      frame.severity = Math.min(SEVERITY_LIMIT, frame.severity + (dt * SEVERITY_LIMIT) / SCENARIO_SECONDS);
      const stage = stageAt(frame.severity);
      if (stage !== s.bearing) s.setBearingStage(stage);
    } else if (frame.severity > 0) {
      frame.severity = Math.max(0, frame.severity - dt * 0.8);
    }

    // ── Digital twin ──
    const twin = s.mode === "twin";
    frame.ghost = damp(frame.ghost, twin ? 1 : 0, 3, dt);
    const reading = twinReading(s.twinTime, frame.severity);
    // Looking back or at now the residual is measured; looking ahead it is the projected loss of health.
    const gap = reading.residual ?? 1 - (reading.predicted ?? 1);
    const residual = twin && s.residual ? Math.min(1, Math.abs(gap) / 1.2) : 0;
    frame.residual = damp(frame.residual, residual, 4, dt);

    // ── Environment ──
    const env = s.mode === "test" ? "test" : twin ? "twin" : "studio";
    frame.environment.studio = damp(frame.environment.studio, env === "studio" ? 1 : 0, 2.4, dt);
    frame.environment.test = damp(frame.environment.test, env === "test" ? 1 : 0, 2.4, dt);
    frame.environment.twin = damp(frame.environment.twin, env === "twin" ? 1 : 0, 2.4, dt);

    frame.energyStep = s.energyFlow ? Math.floor((frame.now * 0.7) % 5) : -1;
  });

  return null;
}
