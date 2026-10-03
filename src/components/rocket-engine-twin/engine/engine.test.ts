import { describe, expect, it } from "vitest";
import { SENSORS, SYSTEMS } from "../data/engineReference";
import { ARCHITECTURE_LAYERS, COMPONENT_LABEL, COMPONENT_LINE, COMPONENT_VIEW, MODEL_BY_SYSTEM, MODEL_CARDS, SYSTEM_VIEW, TOUR_STAGES } from "../data/twinContent";
import { CAMERA_PRESETS, ENTER_MS, transitionMs } from "../scene/cameraPresets";
import { partHealth, partLooks, sceneShift } from "../state/selectors";
import { INITIAL_STATE, type TwinState } from "../state/twinStore";
import type { CameraPresetId, ComponentId, PartId } from "../types";
import { CHAMBER_RADIUS, EXIT_RADIUS, EXIT_Y, INJECTOR_Y, PARTS, PART_IDS, PIPES, SENSOR_AT, THROAT_RADIUS, explodedOffset, gasRadius, harnessPath, isCut } from "./layout";

const state = (patch: Partial<TwinState>): TwinState => ({ ...INITIAL_STATE, entered: true, ...patch });
const triangles = (id: PartId, cut = false) => PARTS[id].build(cut).getAttribute("position").count / 3;

describe("engine layout", () => {
  it("has a chamber, a throat and a bell: the gas path narrows, then opens to the exit", () => {
    expect(gasRadius(INJECTOR_Y)).toBe(CHAMBER_RADIUS);
    expect(gasRadius(0)).toBeCloseTo(THROAT_RADIUS);
    expect(gasRadius(EXIT_Y)).toBeCloseTo(EXIT_RADIUS);
    const bell = Array.from({ length: 30 }, (_, i) => gasRadius((EXIT_Y * i) / 29));
    expect(bell).toEqual([...bell].sort((a, b) => a - b));
    // A bell, not a cone: it opens fastest just below the throat.
    expect(gasRadius(-0.2) - gasRadius(0)).toBeGreaterThan(gasRadius(EXIT_Y) - gasRadius(EXIT_Y + 0.2));
  });

  it("addresses every part by a semantic id that maps to a system and a selectable component", () => {
    const components = SYSTEMS.flatMap((s) => s.components.map((c) => c.id));
    for (const id of PART_IDS) {
      expect(id).toMatch(/^[a-z_]+$/);
      const part = PARTS[id];
      if (part.component) expect(components, id).toContain(part.component);
    }
    // Every component a learner can read about is somewhere on the engine.
    const onEngine = new Set(PART_IDS.map((id) => PARTS[id].component));
    for (const component of components.filter((c) => !["temperature_sensors", "speed_vibration_sensors"].includes(c))) expect(onEngine.has(component), component).toBe(true);
  });

  it("builds real geometry for every part, within a budget a laptop can draw", () => {
    let total = 0;
    for (const id of PART_IDS) {
      const count = triangles(id);
      expect(count, id).toBeGreaterThan(20);
      total += count;
    }
    expect(total).toBeGreaterThan(40_000);
    expect(total).toBeLessThan(400_000);
  });

  it("cuts parts open with their own geometry, not by making them transparent", () => {
    const cuttable = PART_IDS.filter((id) => PARTS[id].cutBy);
    expect(cuttable).toEqual(expect.arrayContaining(["turbopump_fuel", "turbopump_oxidiser", "chamber_liner", "cooling_jacket", "nozzle_extension", "injector_head"]));
    for (const id of cuttable) {
      const opened = PARTS[id].build(true);
      opened.computeBoundingBox();
      // The cut-away is still a solid body with extent on every axis.
      const size = opened.boundingBox!.max.clone().sub(opened.boundingBox!.min);
      expect(Math.min(size.x, size.y, size.z), id).toBeGreaterThan(0.05);
    }
    expect(isCut(PARTS.turbopump_fuel, "turbomachinery")).toBe(true);
    expect(isCut(PARTS.turbopump_fuel, "combustion")).toBe(false);
    expect(isCut(PARTS.turbopump_fuel, "all")).toBe(true);
    expect(isCut(PARTS.feed_fuel, "all")).toBe(false);
    expect(isCut(PARTS.chamber_liner, null)).toBe(false);
  });

  it("explodes hierarchically: assemblies first, then the components inside them", () => {
    const out: [number, number, number] = [0, 0, 0];
    expect([...explodedOffset(PARTS.rotor_fuel, 0, out)]).toEqual([0, 0, 0]);
    const half = [...explodedOffset(PARTS.rotor_fuel, 0.5, out)];
    const housing = [...explodedOffset(PARTS.turbopump_fuel, 0.5, out)];
    // At the half-way point the rotor is still inside its housing: they have moved together.
    expect(half).toEqual(housing);
    const full = [...explodedOffset(PARTS.rotor_fuel, 1, out)];
    expect(full[1]).toBeLessThan(half[1] - 0.5);
    expect([...explodedOffset(PARTS.turbopump_fuel, 1, out)]).toEqual(housing);
  });

  it("moves assemblies along their own axes, not radially in every direction", () => {
    expect(PARTS.nozzle_extension.explode[0]).toBe(0);
    expect(PARTS.nozzle_extension.explode[1]).toBeLessThan(0);
    expect(PARTS.gimbal_mount.explode[1]).toBeGreaterThan(0);
    expect(PARTS.turbopump_fuel.explode[0]).toBeGreaterThan(0);
    expect(PARTS.turbopump_oxidiser.explode[0]).toBeLessThan(0);
    expect(PARTS.chamber_liner.explode).toEqual([0, 0, 0]);
  });

  it("is deliberately not symmetric: the two turbopumps differ", () => {
    expect(triangles("turbopump_fuel")).toBe(triangles("turbopump_oxidiser"));
    const fuel = PARTS.turbopump_fuel.build(false);
    const oxidiser = PARTS.turbopump_oxidiser.build(false);
    fuel.computeBoundingBox();
    oxidiser.computeBoundingBox();
    expect(fuel.boundingBox!.max.y - fuel.boundingBox!.min.y).toBeGreaterThan(oxidiser.boundingBox!.max.y - oxidiser.boundingBox!.min.y);
  });

  it("places every sensor on a part and leads it to the controller", () => {
    expect(Object.keys(SENSOR_AT).sort()).toEqual(SENSORS.map((s) => s.id).sort());
    for (const sensor of SENSORS) {
      expect(PART_IDS).toContain(SENSOR_AT[sensor.id].host);
      const path = harnessPath(sensor.id);
      expect(path.length).toBeGreaterThan(3);
      expect(path[0]).toEqual(SENSOR_AT[sensor.id].at);
    }
    expect(Object.keys(PIPES).length).toBeGreaterThanOrEqual(10);
  });
});

describe("what parts look like", () => {
  it("leaves the engine untouched in the opening view, and nothing selectable", () => {
    const looks = partLooks(INITIAL_STATE);
    for (const id of PART_IDS) expect(looks.get(id)).toMatchObject({ dim: 0, opacity: 1, strength: 0, selectable: false });
  });

  it("recedes everything but the selected system, and holds the selected component", () => {
    const looks = partLooks(state({ system: "turbomachinery", component: "fuel_turbopump", systemFocus: true }));
    expect(looks.get("turbopump_fuel")!.dim).toBe(0);
    expect(looks.get("turbopump_fuel")!.strength).toBeGreaterThan(0);
    expect(looks.get("turbopump_oxidiser")!.dim).toBeGreaterThan(0);
    expect(looks.get("nozzle_extension")!.dim).toBeGreaterThan(looks.get("turbopump_oxidiser")!.dim);
  });

  it("dims the engine behind a flow, and opens only the jacket for cooling", () => {
    const propellant = partLooks(state({ mode: "flow", flow: "propellant" }));
    expect(propellant.get("nozzle_extension")!.dim).toBeGreaterThan(0.5);
    const cooling = partLooks(state({ mode: "flow", flow: "cooling" }));
    expect(cooling.get("cooling_jacket")!.opacity).toBeLessThan(0.3);
    expect(cooling.get("cooling_channels")!.opacity).toBe(0);
    // Selective transparency: nothing else goes see-through.
    const seeThrough = PART_IDS.filter((id) => cooling.get(id)!.opacity < 1);
    expect(seeThrough.sort()).toEqual(["cooling_channels", "cooling_jacket", "throat_ring"]);
  });

  it("uses health colour only in Health, and only as much as the state warrants", () => {
    for (const mode of ["engine", "build", "flow", "control", "test"] as const) {
      for (const look of partLooks(state({ mode, bearing: "diagnosis" }), 0.8).values()) expect(look.tint === null || look.tint === "#ffffff", mode).toBe(true);
    }
    const healthy = partLooks(state({ mode: "health" }), 0);
    const faulted = partLooks(state({ mode: "health", bearing: "diagnosis" }), 0.8);
    expect(healthy.get("bearing_fuel")!.strength).toBeLessThan(0.1);
    expect(faulted.get("bearing_fuel")!.strength).toBeGreaterThan(0.3);
    expect(faulted.get("bearing_fuel")!.tint).not.toBe(healthy.get("bearing_fuel")!.tint);
    expect(faulted.get("nozzle_extension")!.tint).toBe(healthy.get("nozzle_extension")!.tint);
    expect(partHealth(state({ bearing: "diagnosis" }), 0.8).get("bearing_fuel")).toBe("degraded");
    expect(partHealth(state({ bearing: "diagnosis" }), 0.8).get("chamber_liner")).toBe("nominal");
  });

  it("marks the residual on the faulted component in the twin and leaves the rest neutral", () => {
    const looks = partLooks(state({ mode: "twin", bearing: "anomaly", residual: true }), 0.6);
    expect(looks.get("bearing_fuel")!.strength).toBeGreaterThan(0.3);
    expect(looks.get("chamber_liner")).toMatchObject({ tint: null, strength: 0 });
    const hidden = partLooks(state({ mode: "twin", bearing: "anomaly", residual: false }), 0.6);
    expect(hidden.get("bearing_fuel")!.strength).toBe(0);
  });

  it("lights the physical parts a chosen architecture layer concerns", () => {
    const sensors = partLooks(state({ mode: "architecture", layer: "sensors" }));
    expect(sensors.get("sensor_bodies")!.dim).toBeLessThan(sensors.get("nozzle_extension")!.dim);
    const control = partLooks(state({ mode: "architecture", layer: "control" }));
    expect(control.get("engine_controller")!.dim).toBeLessThan(0.2);
    expect(control.get("valve_main_fuel")!.dim).toBeLessThan(0.2);
    const none = partLooks(state({ mode: "architecture" }));
    expect(new Set([...none.values()].map((l) => l.dim)).size).toBe(1);
  });

  it("fades the leads and brackets that have no place once the engine is taken apart", () => {
    const looks = partLooks(state({ mode: "build", explodedAmount: 0.5 }));
    for (const id of ["harness", "sensor_bodies", "structure"] as const) expect(looks.get(id)).toMatchObject({ opacity: 0, selectable: false });
    expect(looks.get("turbopump_fuel")!.opacity).toBe(1);
  });

  it("moves the engine aside for the hero text and for a panel", () => {
    expect(sceneShift(INITIAL_STATE)).toBeGreaterThan(0.1);
    expect(sceneShift(state({}))).toBe(0);
    expect(sceneShift(state({ component: "injector" }))).toBeLessThan(0);
  });
});

describe("camera presets and content", () => {
  const required: CameraPresetId[] = ["hero", "engine_overview", "feed_overview", "turbomachinery", "pump_close", "shaft_close", "bearing_close", "chamber", "chamber_cutaway", "cooling_channel", "injector_region", "nozzle", "controller", "sensor_network", "test_stand", "health", "digital_twin", "architecture"];

  it("defines every view the brief names", () => {
    for (const id of required) expect(CAMERA_PRESETS[id], id).toBeDefined();
  });

  it("never goes so close that the surrounding engine is lost", () => {
    for (const [id, preset] of Object.entries(CAMERA_PRESETS)) {
      expect(preset.distance, id).toBeGreaterThanOrEqual(1.8);
      expect(preset.minDistance, id).toBeLessThanOrEqual(preset.distance);
      expect(preset.maxDistance, id).toBeGreaterThan(preset.distance);
    }
  });

  it("looks into the cut-aways from the side they open toward", () => {
    for (const id of ["pump_close", "bearing_close", "chamber_cutaway", "cooling_channel"] as const) {
      expect(CAMERA_PRESETS[id].azimuthDeg, id).toBeGreaterThan(20);
      expect(CAMERA_PRESETS[id].azimuthDeg, id).toBeLessThan(70);
    }
  });

  it("takes between 700 and 1800 ms for any move, and longer for longer moves", () => {
    for (const a of required) for (const b of required) {
      const ms = transitionMs(CAMERA_PRESETS[a], CAMERA_PRESETS[b]);
      expect(ms).toBeGreaterThanOrEqual(700);
      expect(ms).toBeLessThanOrEqual(1800);
    }
    expect(transitionMs(CAMERA_PRESETS.engine_overview, CAMERA_PRESETS.bearing_close)).toBeGreaterThan(transitionMs(CAMERA_PRESETS.pump_close, CAMERA_PRESETS.shaft_close));
    expect(ENTER_MS).toBeGreaterThanOrEqual(1200);
    expect(ENTER_MS).toBeLessThanOrEqual(1800);
  });

  it("gives every system and component a view, a label and one short line", () => {
    for (const system of SYSTEMS) {
      expect(CAMERA_PRESETS[SYSTEM_VIEW[system.id]]).toBeDefined();
      expect(MODEL_CARDS[MODEL_BY_SYSTEM[system.id]]).toBeDefined();
      for (const component of system.components) {
        expect(COMPONENT_LABEL[component.id]).toMatch(/^[A-Z ]+$/);
        expect(COMPONENT_LINE[component.id].split(" ").length).toBeLessThanOrEqual(14);
      }
    }
    for (const preset of Object.values(COMPONENT_VIEW)) expect(CAMERA_PRESETS[preset as CameraPresetId]).toBeDefined();
    expect(Object.keys(COMPONENT_LABEL) as ComponentId[]).toEqual(expect.arrayContaining(["bearing_region", "fuel_turbopump"]));
  });

  it("gives different models different credibility, and correlates none of them with test data", () => {
    const cards = Object.values(MODEL_CARDS);
    expect(new Set(cards.map((c) => c.level)).size).toBeGreaterThan(1);
    expect(new Set(cards.map((c) => c.uncertainty)).size).toBeGreaterThan(1);
    for (const card of cards) {
      expect(card.correlation).toBe("Not Test-Correlated");
      expect(card.data).toBe("Simulated");
      expect(card.assumptions.length).toBeGreaterThan(0);
    }
  });

  it("orders the architecture from hardware to evidence and the tour in twelve stages", () => {
    expect(ARCHITECTURE_LAYERS.map((l) => l.name)).toEqual(["ENGINE HARDWARE", "SENSORS", "DATA ACQUISITION", "ENGINE CONTROL", "PHYSICS MODELS", "FDIR / HEALTH LOGIC", "DIGITAL TWIN", "TEST EVIDENCE"]);
    for (const layer of ARCHITECTURE_LAYERS) if (layer.parts !== "all") for (const part of layer.parts) expect(PART_IDS).toContain(part);
    expect(TOUR_STAGES.map((s) => s.title)).toEqual([
      "Meet the Engine",
      "Open the Engine",
      "Follow Propellant",
      "Understand Turbomachinery",
      "Enter the Combustion Chamber",
      "See Regenerative Cooling",
      "Understand the Nozzle",
      "Start the Engine",
      "Monitor Sensors",
      "Detect an Anomaly",
      "Compare the Digital Twin",
      "Review the Test",
    ]);
    const minutes = TOUR_STAGES.reduce((sum, s) => sum + s.seconds, 0) / 60;
    expect(minutes).toBeGreaterThanOrEqual(4);
    expect(minutes).toBeLessThanOrEqual(6);
  });
});
