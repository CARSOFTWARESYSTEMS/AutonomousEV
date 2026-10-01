import { describe, expect, it } from "vitest";
import { referenceSpacecraft } from "@/app/space/satellite-engineering/programData";
import type { ComponentId, SubsystemId } from "../types";
import { CAMERA_PRESETS } from "../scene/cameraPresets";
import { MISSION_STAGE_ORDER } from "../simulation/mission";
import { ORBIT_REFERENCE } from "../simulation/orbit";
import { NOMINAL_LOADS_W } from "../simulation/power";
import { FLOW_IDS, FLOW_ROUTES, routeLength } from "../spacecraft/flowRoutes";
import { BUS, HALF, LAYOUT } from "../spacecraft/layout";
import { COMPONENTS, COMPONENT_IDS, OUTER_SHELL, XRAY_SELECTABLE, componentsInBuildStep, componentsOf, distinctName } from "./componentDefinitions";
import { BUILD_STEPS, BUILD_STEP_COUNT, DESKTOP_RECOMMENDATION, MISSION_FLOW, MISSION_STAGE_INFO, OVERVIEW_CARDS, SIGNAL_ORDER, SIGNAL_ROUTES, TOUR_STEPS } from "./missionSequence";
import { PRODUCT, SATELLITE_REFERENCE, SUBSYSTEMS, SUBSYSTEM_ORDER } from "./satelliteReference";

const UNVERIFIABLE = /revolutionary|world'?s first|never seen before|most advanced|flight[- ]qualified|flight[- ]proven/i;

describe("satellite reference", () => {
  it("is the single source of truth for the reference spacecraft", () => {
    expect(SATELLITE_REFERENCE.name).toBe("6U Earth Observation Reference Satellite");
    expect(SATELLITE_REFERENCE.mission).toBe("Earth Observation");
    expect([...SATELLITE_REFERENCE.subsystems].sort()).toEqual(["adcs", "avionics", "communications", "payload", "power", "structure", "thermal"]);
  });

  it("agrees with the reference spacecraft on the Satellite Engineering page", () => {
    const { facts } = referenceSpacecraft;
    expect(referenceSpacecraft.name).toContain("6U Earth Observation");
    expect(facts.orbit.value).toContain(SATELLITE_REFERENCE.orbit.altitudeRange);
    expect(SATELLITE_REFERENCE.orbit.altitudeKm).toBeGreaterThanOrEqual(500);
    expect(SATELLITE_REFERENCE.orbit.altitudeKm).toBeLessThanOrEqual(550);
    expect(facts.ttc.value).toBe(SATELLITE_REFERENCE.links.ttc);
    expect(facts.downlink.value).toBe(SATELLITE_REFERENCE.links.payloadDownlink);
    expect(facts.adcs.value).toMatch(/reaction wheels \+ magnetorquers/);
    expect(facts.power.value).toMatch(/Deployable solar arrays/);
  });

  it("labels the spacecraft, its values and its visualisations for what they are", () => {
    expect(SATELLITE_REFERENCE.provenance.spacecraft).toBe("REFERENCE SPACECRAFT");
    expect(SATELLITE_REFERENCE.provenance.values).toMatch(/REFERENCE/);
    expect(SATELLITE_REFERENCE.provenance.values).toMatch(/SIMULATED/);
    expect(SATELLITE_REFERENCE.provenance.visualization).toBe("ENGINEERING VISUALIZATION");
    expect(SATELLITE_REFERENCE.disclaimer).toMatch(/not specifications of flight hardware or of any real mission/);
  });

  it("uses the product name, subtitle and route from the brief", () => {
    expect(PRODUCT.name).toBe("SATELLITE EXPLORER 3D");
    expect(PRODUCT.subtitle).toBe("Build · Explore · Operate a Satellite");
    expect(PRODUCT.route).toBe("/space/satellite-engineering/interactive-3d");
    expect(SATELLITE_REFERENCE.orbit.periodMin).toBe(95);
    expect(ORBIT_REFERENCE.inclinationDeg).toBe(SATELLITE_REFERENCE.orbit.inclinationDeg);
  });
});

describe("component metadata", () => {
  it("defines 20–36 meaningful assemblies, each under its own id", () => {
    expect(COMPONENT_IDS.length).toBeGreaterThanOrEqual(20);
    expect(COMPONENT_IDS.length).toBeLessThanOrEqual(36);
    COMPONENT_IDS.forEach((id) => expect(COMPONENTS[id].id).toBe(id));
  });

  it("covers every subsystem", () => {
    SUBSYSTEM_ORDER.forEach((subsystem) => expect(componentsOf(subsystem).length).toBeGreaterThan(0));
    COMPONENT_IDS.forEach((id) => expect(SUBSYSTEMS[COMPONENTS[id].subsystem]).toBeDefined());
  });

  it("includes the assemblies the brief names", () => {
    const required: ComponentId[] = [
      "primary-frame",
      "solar-array-left",
      "solar-array-right",
      "battery",
      "pcdu",
      "obc",
      "data-storage",
      "data-bus",
      "reaction-wheel-x",
      "reaction-wheel-y",
      "reaction-wheel-z",
      "reaction-wheel-r",
      "magnetorquers",
      "magnetometer",
      "sun-sensors",
      "star-tracker",
      "gnss-receiver",
      "optical-payload",
      "payload-processor",
      "sband-radio",
      "sband-antenna",
      "xband-transmitter",
      "xband-antenna",
      "mli-blanket",
      "radiator",
    ];
    required.forEach((id) => expect(COMPONENTS[id]).toBeDefined());
  });

  it("keeps Learn copy short: one sentence and at most three values", () => {
    COMPONENT_IDS.forEach((id) => {
      const c = COMPONENTS[id];
      expect(c.purpose.length, id).toBeLessThanOrEqual(110);
      expect(c.purpose.trim().endsWith("."), id).toBe(true);
      // One sentence: the only full stop is the last character.
      expect(c.purpose.slice(0, -1), id).not.toMatch(/\. /);
      expect(c.learnValues.length, id).toBeGreaterThanOrEqual(1);
      expect(c.learnValues.length, id).toBeLessThanOrEqual(3);
      expect(c.label, id).toBe(c.label.toUpperCase());
    });
  });

  it("gives Engineer mode a role, reference figures and interfaces", () => {
    COMPONENT_IDS.forEach((id) => {
      const c = COMPONENTS[id];
      expect(c.role.length, id).toBeGreaterThan(10);
      expect(c.role.length, id).toBeLessThanOrEqual(120);
      expect(c.engineerValues.length, id).toBeGreaterThanOrEqual(2);
      expect(c.engineerValues.length, id).toBeLessThanOrEqual(5);
      expect(c.interfaces.length, id).toBeGreaterThan(0);
    });
  });

  it("makes no unverifiable or flight-heritage claims", () => {
    COMPONENT_IDS.forEach((id) => {
      const c = COMPONENTS[id];
      const text = [c.name, c.purpose, c.role, c.interfaces, ...c.learnValues.map((v) => v.value), ...c.engineerValues.map((v) => v.value)].join(" ");
      expect(text, id).not.toMatch(UNVERIFIABLE);
    });
    [...BUILD_STEPS.map((s) => s.caption), ...Object.values(MISSION_STAGE_INFO).map((s) => s.caption), ...TOUR_STEPS.map((s) => s.caption)].forEach((text) =>
      expect(text).not.toMatch(UNVERIFIABLE),
    );
  });

  it("matches the battery example in the brief", () => {
    const battery = COMPONENTS.battery;
    expect(battery.purpose).toBe("Stores electrical energy for eclipse and peak loads.");
    expect(battery.learnValues.map((v) => v.label)).toEqual(["Status", "Supply"]);
    expect(battery.engineerValues.find((v) => v.label === "Energy")?.value).toBe("40 Wh reference");
    expect(battery.role).toBe("Eclipse operation and transient load support");
    expect(battery.interfaces).toBe("PCDU / Power bus");
  });

  it("marks reference figures as reference, and binds changing figures to the simulation", () => {
    const energy = COMPONENTS.battery.engineerValues.find((v) => v.label === "Energy");
    expect(energy?.live).toBeUndefined();
    expect(energy?.value).toMatch(/reference/);
    expect(COMPONENTS.battery.engineerValues.find((v) => v.label === "State of charge")?.live).toBe("batterySoc");
    expect(COMPONENTS["reaction-wheel-y"].learnValues[0].live).toBe("wheelY");
  });

  it("reports load power draws that match the power model", () => {
    expect(COMPONENTS.obc.powerDrawW).toBe(NOMINAL_LOADS_W.obc);
    expect(COMPONENTS["optical-payload"].powerDrawW).toBe(NOMINAL_LOADS_W.payload);
    expect(COMPONENTS["sband-radio"].powerDrawW).toBe(NOMINAL_LOADS_W.comms);
    expect(COMPONENTS.heaters.powerDrawW).toBe(NOMINAL_LOADS_W.heaters);
  });

  it("tells duplicate units apart by name", () => {
    expect(distinctName("solar-array-left")).toBe("Solar Array (left)");
    expect(distinctName("reaction-wheel-z")).toBe("Reaction Wheel Z");
    expect(new Set(COMPONENT_IDS.map(distinctName)).size).toBe(COMPONENT_IDS.length);
  });

  it("keeps X-ray shell and selectable sets consistent", () => {
    OUTER_SHELL.forEach((id) => expect(COMPONENTS[id]).toBeDefined());
    XRAY_SELECTABLE.forEach((id) => {
      expect(COMPONENTS[id]).toBeDefined();
      expect(OUTER_SHELL).not.toContain(id);
    });
  });
});

describe("spacecraft layout (semantic mapping)", () => {
  it("places every component, and nothing else", () => {
    expect(Object.keys(LAYOUT).sort()).toEqual([...COMPONENT_IDS].sort());
  });

  it("keeps internal units inside the 6U envelope", () => {
    const internal: ComponentId[] = ["battery", "pcdu", "obc", "data-storage", "sband-radio", "xband-transmitter", "payload-electronics", "payload-processor", "reaction-wheel-x", "reaction-wheel-y", "reaction-wheel-z", "reaction-wheel-r"];
    internal.forEach((id) => {
      const [x, y, z] = LAYOUT[id].anchor;
      expect(Math.abs(x), id).toBeLessThan(HALF.x);
      expect(Math.abs(y), id).toBeLessThan(HALF.y);
      expect(Math.abs(z), id).toBeLessThan(HALF.z);
    });
    // 6U: two units wide, three long, one deep.
    expect(BUS.width / BUS.depth).toBeCloseTo(2.263, 3);
    expect(BUS.length / BUS.depth).toBeCloseTo(3.66, 2);
  });

  it("explodes along engineering directions, not at random", () => {
    expect(LAYOUT["solar-array-left"].explode[0]).toBeLessThan(0);
    expect(LAYOUT["solar-array-right"].explode[0]).toBeGreaterThan(0);
    // The payload slides out along its boresight (toward the Earth-facing end).
    expect(LAYOUT["optical-payload"].explode).toEqual([0, -1.7, 0]);
    // Stack units slide out of the same face and keep their order along the stack.
    const stack: ComponentId[] = ["xband-transmitter", "sband-radio", "obc", "data-storage", "pcdu", "battery"];
    const explodedY = stack.map((id) => LAYOUT[id].anchor[1] + LAYOUT[id].explode[1]);
    expect([...explodedY].sort((a, b) => a - b)).toEqual(explodedY);
    stack.forEach((id) => expect(LAYOUT[id].explode[2]).toBe(1.75));
    expect(LAYOUT["primary-frame"].explode).toEqual([0, 0, 0]);
  });

  it("routes every flow between distinct points with a real length", () => {
    expect(FLOW_ROUTES.map((r) => r.id).sort()).toEqual([...FLOW_IDS].sort());
    FLOW_ROUTES.forEach((route) => {
      expect(route.points.length, route.id).toBeGreaterThanOrEqual(2);
      expect(routeLength(route.points), route.id).toBeGreaterThan(0.1);
      // Pulses stay lightweight.
      expect(route.pulses, route.id).toBeLessThanOrEqual(10);
    });
    expect(FLOW_ROUTES.reduce((n, r) => n + r.pulses, 0)).toBeLessThanOrEqual(120);
  });
});

describe("build steps", () => {
  it("defines the eight steps of the brief in order", () => {
    expect(BUILD_STEP_COUNT).toBe(8);
    expect(BUILD_STEPS.map((s) => s.label)).toEqual(["STRUCTURE", "POWER", "AVIONICS", "ADCS", "COMMUNICATIONS", "PAYLOAD", "THERMAL", "READY"]);
    BUILD_STEPS.forEach((s, i) => expect(s.step).toBe(i + 1));
    expect(BUILD_STEPS[0].caption).toBe("Provides mechanical support and launch-load path.");
  });

  it("installs every component in exactly one step, and nothing in READY", () => {
    const installed = BUILD_STEPS.flatMap((s) => componentsInBuildStep(s.step));
    expect(installed.sort()).toEqual([...COMPONENT_IDS].sort());
    for (let step = 1; step <= 7; step++) expect(componentsInBuildStep(step).length, `step ${step}`).toBeGreaterThan(0);
    expect(componentsInBuildStep(8)).toEqual([]);
  });

  it("installs the units the brief lists at each step", () => {
    const at = (step: number) => componentsInBuildStep(step);
    expect(at(2)).toEqual(expect.arrayContaining(["battery", "pcdu", "solar-array-left", "solar-array-right"]));
    expect(at(3)).toEqual(expect.arrayContaining(["obc", "data-storage", "data-bus"]));
    expect(at(4)).toEqual(expect.arrayContaining(["reaction-wheel-x", "magnetorquers", "sun-sensors", "magnetometer", "star-tracker"]));
    expect(at(5)).toEqual(expect.arrayContaining(["sband-radio", "sband-antenna", "xband-transmitter", "xband-antenna"]));
    expect(at(6)).toEqual(expect.arrayContaining(["optical-payload", "payload-electronics", "payload-processor"]));
    expect(at(7)).toEqual(expect.arrayContaining(["mli-blanket", "radiator", "heaters"]));
  });

  it("builds each subsystem in the step that carries its name", () => {
    const expected: Partial<Record<SubsystemId, number>> = { power: 2, avionics: 3, adcs: 4, communications: 5, payload: 6, thermal: 7 };
    (Object.keys(expected) as SubsystemId[]).forEach((subsystem) =>
      componentsOf(subsystem).forEach((id) => expect(COMPONENTS[id].buildStep, id).toBe(expected[subsystem])),
    );
  });
});

describe("mission, signals and tour content", () => {
  it("describes every mission stage with a short caption and a real camera preset", () => {
    expect(Object.keys(MISSION_STAGE_INFO).sort()).toEqual([...MISSION_STAGE_ORDER].sort());
    MISSION_STAGE_ORDER.forEach((stage) => {
      const info = MISSION_STAGE_INFO[stage];
      expect(info.caption.length, stage).toBeLessThanOrEqual(110);
      expect(CAMERA_PRESETS[info.camera], stage).toBeDefined();
    });
    expect(MISSION_STAGE_ORDER.map((s) => MISSION_STAGE_INFO[s].label)).toEqual([
      "BOOT",
      "POWER",
      "ATTITUDE ACQUISITION",
      "TARGET APPROACH",
      "EARTH OBSERVATION",
      "STORE DATA",
      "GROUND PASS",
      "COMMAND UPLINK",
      "TELEMETRY",
      "PAYLOAD DOWNLINK",
      "PASS COMPLETE",
    ]);
  });

  it("defines the three signal routes with the hops from the brief", () => {
    expect(SIGNAL_ORDER).toEqual(["command", "telemetry", "payload-data"]);
    expect(SIGNAL_ROUTES.command.direction).toBe("Ground → Satellite");
    expect(SIGNAL_ROUTES.telemetry.direction).toBe("Satellite → Ground");
    expect(SIGNAL_ROUTES["payload-data"].direction).toBe("Satellite → Ground");
    expect(SIGNAL_ROUTES.command.hops.slice(3)).toEqual(["Antenna", "Transceiver", "OBC", "Flight software", "Target subsystem"]);
    expect(SIGNAL_ROUTES.telemetry.hops.slice(0, 5)).toEqual(["Sensors", "OBC", "Packetisation", "Transceiver", "Antenna"]);
    expect(SIGNAL_ROUTES["payload-data"].hops.slice(0, 5)).toEqual(["Payload", "Processor", "Storage", "X-band transmitter", "Antenna"]);
    // TT&C and payload data use different bands.
    expect(SIGNAL_ROUTES.command.band).toMatch(/S-band/);
    expect(SIGNAL_ROUTES["payload-data"].band).toMatch(/X-band/);
    SIGNAL_ORDER.forEach((id) => SIGNAL_ROUTES[id].components.forEach((c) => expect(COMPONENTS[c], `${id}:${c}`).toBeDefined()));
  });

  it("runs a nine-step guided tour of three to five minutes", () => {
    expect(TOUR_STEPS.map((s) => s.title)).toEqual([
      "Meet the satellite",
      "Open the spacecraft",
      "Power system",
      "Flight computer",
      "Attitude control",
      "Payload",
      "Communication",
      "Ground station",
      "Complete mission",
    ]);
    const minutes = TOUR_STEPS.reduce((n, s) => n + s.durationS, 0) / 60;
    expect(minutes).toBeGreaterThanOrEqual(3);
    expect(minutes).toBeLessThanOrEqual(5.5);
    TOUR_STEPS.forEach((s) => {
      expect(s.caption.length, s.id).toBeLessThanOrEqual(130);
      if (s.camera) expect(CAMERA_PRESETS[s.camera], s.id).toBeDefined();
    });
    expect(TOUR_STEPS[TOUR_STEPS.length - 1].runMission).toBe(true);
  });

  it("provides the compact overview content for small screens", () => {
    expect(OVERVIEW_CARDS.map((c) => c.title)).toEqual(["POWER", "AVIONICS", "ADCS", "PAYLOAD", "COMMUNICATIONS", "THERMAL"]);
    expect(OVERVIEW_CARDS.find((c) => c.id === "power")?.flow).toBe("Sunlight → Electricity → Battery");
    expect(MISSION_FLOW).toEqual(["GROUND", "UPLINK", "SATELLITE", "PAYLOAD", "DOWNLINK", "GROUND"]);
    expect(DESKTOP_RECOMMENDATION.badge).toBe("DESKTOP EXPERIENCE RECOMMENDED");
    expect(DESKTOP_RECOMMENDATION.headline).toBe("Interactive 3D experience is designed for Laptop/Desktop");
  });
});
