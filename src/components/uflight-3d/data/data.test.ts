import { describe, expect, it } from "vitest";
import { MODULE_NUMBERS, PLACEMENT, UNIT_MOUNTS, anchorAt, fuselageHalfWidthAt, fuselagePoint, moduleCentre, unitPoint, BATTERY, FUSELAGE, ROTOR, TILT_Z, WING } from "../aircraft/layout";
import { FLOW_ROUTES } from "../aircraft/routes";
import { COMPONENTS, COMPONENT_IDS, ENCLOSED, OUTER_SHELL, assemblyOf, childrenOf, componentForMesh, componentsOf, getComponent, hierarchyOf, isComponentId, unitNumberOf } from "./componentDefinitions";
import { FAULT_SCENARIOS, FAULT_STAGES, NARRATIVE } from "./faultScenarios";
import { DATA_ARCHITECTURE, HUMS_LAYERS, NETWORK_FILTERS, TRACE_STEPS } from "./healthDefinitions";
import { MISSION_SEQUENCE, STAGE_INFO } from "./missionDefinition";
import { FLAGSHIP_SENSOR_ID, SENSORS, SENSOR_CATEGORIES, getSensor, sensorPosition, sensorsOfCategory, sensorsOn } from "./sensorDefinitions";
import * as reference from "./uflightReferenceAircraft";

describe("component lookup", () => {
  it("resolves a component by its semantic id", () => {
    const unit = getComponent("propulsion-unit-04");
    expect(unit).toMatchObject({ name: "Propulsion Unit 04", system: "propulsion", semanticType: "propulsion", healthSource: "propulsion-unit-04" });
    expect(unit.meshNames).toEqual(["Propulsion/PropulsionUnit04"]);
    expect(isComponentId("propulsion-unit-04")).toBe(true);
    expect(isComponentId("propulsion-unit-09")).toBe(false);
  });

  it("gives every propulsion unit the same inspectable sub-assemblies", () => {
    const parts = childrenOf("propulsion-unit-04").map((id) => id.replace("pu04-", ""));
    expect(parts).toEqual(expect.arrayContaining(["rotor", "shaft", "bearing-front", "bearing-rear", "motor", "resolver", "inverter", "motor-controller", "tilt-actuator", "cooling-interface", "sensors"]));
    // Lift units do not tilt.
    expect(childrenOf("propulsion-unit-07")).not.toContain("pu07-tilt-actuator");
    expect(componentsOf("propulsion").filter((id) => !COMPONENTS[id].parent)).toHaveLength(8);
  });

  it("knows which assembly a part belongs to", () => {
    expect(assemblyOf("pu04-bearing-front")).toBe("propulsion-unit-04");
    expect(assemblyOf("battery-module-03")).toBe("battery-pack-left");
    expect(assemblyOf("fuselage-shell")).toBe("fuselage-shell");
    expect(unitNumberOf("pu04-bearing-front")).toBe("04");
    expect(unitNumberOf("propulsion-unit-07")).toBe("07");
    expect(unitNumberOf("battery-module-03")).toBeNull();
    expect(hierarchyOf("pu04-bearing-front")).toEqual(["AIRCRAFT", "propulsion", "Propulsion Unit 04", "Front Bearing, Unit 04"]);
  });

  it("maps model node names back to components, so the model can be replaced", () => {
    expect(componentForMesh("Propulsion/PropulsionUnit04/BearingFront")).toBe("pu04-bearing-front");
    expect(componentForMesh("BatteryPackLeft")).toBe("battery-pack-left");
    expect(componentForMesh("FlightComputerB")).toBe("fcc-b");
    expect(componentForMesh("NotInTheModel")).toBeNull();
    COMPONENT_IDS.forEach((id) => expect(COMPONENTS[id].meshNames.length, id).toBeGreaterThan(0));
  });

  it("covers the reference hierarchy: structure, propulsion, energy, controls, navigation, communications, thermal, HUMS", () => {
    for (const id of ["battery-pack-left", "battery-pack-right", "bms-primary", "bms-secondary", "hv-contactors", "hvdc-bus", "lvdc-bus", "dcdc-converter", "charging-interface", "fcc-a", "fcc-b", "fcc-c", "gnss", "imu-a", "imu-b", "magnetometer", "radar-altimeter", "air-data", "vision-sensors", "nav-processor", "secure-gateway", "heat-exchanger", "coolant-pumps", "cooling-manifold", "hums-computer", "edge-processor", "maintenance-gateway"] as const) {
      expect(COMPONENTS[id], id).toBeDefined();
    }
    expect(MODULE_NUMBERS).toHaveLength(8);
    expect(OUTER_SHELL).toEqual(expect.arrayContaining(["fuselage-shell", "glazing", "wing-skin-left", "boom-right", "pu04-nacelle"]));
    expect(OUTER_SHELL).not.toContain("pu04-motor");
  });

  it("knows which components are hidden inside the airframe, so they are only drawn when the skin is see-through", () => {
    ENCLOSED.forEach((id) => {
      expect(COMPONENTS[id], id).toBeDefined();
      expect(COMPONENTS[id].shell, id).toBe(false);
    });
    for (const id of ["pu04-motor", "pu04-bearing-front", "battery-module-03", "hums-computer", "wing-structure-left"] as const) expect(ENCLOSED.has(id), id).toBe(true);
    // Anything seen from outside or through the glazing is always drawn.
    for (const id of ["fuselage-shell", "pu04-rotor", "pu04-nacelle", "cabin-seats", "nose-gear", "gnss", "flaperon-left", "flight-displays"] as const) expect(ENCLOSED.has(id), id).toBe(false);
  });

  it("places every component, with a logical axis for the exploded view", () => {
    COMPONENT_IDS.forEach((id) => {
      const placement = PLACEMENT[id];
      expect(placement, id).toBeDefined();
      [...placement.anchor, ...placement.explode, ...placement.explode2].forEach((v) => expect(Number.isFinite(v), id).toBe(true));
    });
    // The wing lifts, the battery and gear drop, equipment slides aft: never a radial scatter.
    expect(PLACEMENT["wing-skin-left"].explode).toEqual([0, 1.75, 0]);
    expect(PLACEMENT["battery-pack-left"].explode[1]).toBeLessThan(0);
    expect(PLACEMENT["nose-gear"].explode[1]).toBeLessThan(0);
    expect(PLACEMENT["fcc-b"].explode[0]).toBeLessThan(0);
    // Inside a unit, parts separate along the thrust axis.
    expect(PLACEMENT["pu04-rotor"].explode2[0]).toBeGreaterThan(PLACEMENT["pu04-motor"].explode2[0]);
    expect(PLACEMENT["pu04-motor"].explode2[0]).toBeGreaterThan(PLACEMENT["pu04-inverter"].explode2[0]);
    expect(anchorAt("battery-pack-left", 1)[1]).toBeGreaterThan(0);
  });
});

describe("reference aircraft geometry", () => {
  it("is a six-seat aircraft with eight propulsion units: four tilting, four lift", () => {
    expect(reference.AIRCRAFT.seats).toBe("1 pilot + 5 passengers");
    expect(UNIT_MOUNTS).toHaveLength(8);
    expect(UNIT_MOUNTS.filter((m) => m.kind === "tilt")).toHaveLength(4);
    expect(UNIT_MOUNTS.filter((m) => m.kind === "lift")).toHaveLength(4);
    expect(UNIT_MOUNTS.find((m) => m.no === "04")).toMatchObject({ kind: "tilt", side: 1 });
    // Torque is balanced: as many units turn one way as the other.
    expect(UNIT_MOUNTS.reduce((sum, m) => sum + m.spin, 0)).toBe(0);
  });

  it("keeps clear air between neighbouring rotor discs in hover", () => {
    const discs = UNIT_MOUNTS.map((m) => {
      const hub = unitPoint(m, [m.kind === "tilt" ? 0.95 : 0.46, 0, 0], 90);
      return { no: m.no, x: hub[0], z: hub[2], r: m.kind === "tilt" ? ROTOR.tiltRadius : ROTOR.liftRadius };
    });
    for (let i = 0; i < discs.length; i++) {
      for (let j = i + 1; j < discs.length; j++) {
        const distance = Math.hypot(discs[i].x - discs[j].x, discs[i].z - discs[j].z);
        expect(distance, `${discs[i].no}–${discs[j].no}`).toBeGreaterThan(discs[i].r + discs[j].r);
      }
    }
    expect(TILT_Z.outboard + 0.3).toBeLessThan(WING.semiSpan);
  });

  it("fits the battery under the cabin floor, inside the fuselage section", () => {
    expect(BATTERY.topY).toBeLessThan(FUSELAGE.floorY);
    for (const no of MODULE_NUMBERS) {
      const centre = moduleCentre(no);
      const outer = Math.abs(centre[2]) + BATTERY.packWidth / 2;
      expect(fuselageHalfWidthAt(centre[0], BATTERY.bottomY, 0), no).toBeGreaterThan(outer);
    }
    // Lift rotors are above the fuselage where their discs pass over it.
    expect(fuselagePoint(2.7, 0)[1]).toBeLessThan(2.4);
  });

  it("moves a tilt unit's parts with its tilt angle, and leaves lift units fixed", () => {
    const tilt = UNIT_MOUNTS[3];
    expect(unitPoint(tilt, [1, 0, 0], 90)[1]).toBeCloseTo(tilt.pivot[1] + 1);
    expect(unitPoint(tilt, [1, 0, 0], 0)[0]).toBeCloseTo(tilt.pivot[0] + 1);
    const lift = UNIT_MOUNTS[4];
    expect(unitPoint(lift, [1, 0, 0], 0)).toEqual(unitPoint(lift, [1, 0, 0], 90));
  });
});

describe("sensors", () => {
  it("has unique tags, each mounted on a known component and collected by an acquisition node", () => {
    expect(new Set(SENSORS.map((s) => s.id)).size).toBe(SENSORS.length);
    SENSORS.forEach((s) => {
      expect(COMPONENTS[s.component], s.id).toBeDefined();
      expect(COMPONENTS[s.node].system, s.id).toBe("hums");
      s.position.forEach((v) => expect(Number.isFinite(v), s.id).toBe(true));
    });
  });

  it("offers the six filter categories, each with sensors", () => {
    expect(SENSOR_CATEGORIES.map((c) => c.label)).toEqual(["VIBRATION", "THERMAL", "ELECTRICAL", "STRUCTURAL", "POSITION", "NAVIGATION"]);
    SENSOR_CATEGORIES.forEach((c) => expect(sensorsOfCategory(c.id).length, c.id).toBeGreaterThan(4));
  });

  it("includes the flagship vibration sensor on the front bearing of motor 04", () => {
    const sensor = getSensor(FLAGSHIP_SENSOR_ID)!;
    expect(sensor).toMatchObject({ id: "VIB-M04-A", kind: "vibration", category: "vibration", component: "pu04-bearing-front", node: "acquisition-node-wing-right", signal: "pu04.vibration" });
    expect(sensorPosition(sensor, 0)).not.toEqual(sensorPosition(sensor, 90));
    expect(getSensor("NOPE")).toBeUndefined();
  });

  it("lists the sensors of an assembly", () => {
    expect(sensorsOn("propulsion-unit-04").map((s) => s.id)).toEqual(expect.arrayContaining(["VIB-M04-A", "VIB-M04-B", "TMP-M04-W", "TMP-M04-B", "TMP-I04", "CUR-M04", "RPM-M04", "POS-T04"]));
    expect(sensorsOn("propulsion-unit-07").map((s) => s.id)).not.toContain("POS-T07");
    expect(sensorsOn("battery-pack-left")).toHaveLength(8);
    expect(sensorsOn("fuselage-shell")).toHaveLength(0);
  });
});

describe("health and architecture definitions", () => {
  it("describes HUMS in six layers, from the physical system to prognostics", () => {
    expect(HUMS_LAYERS.map((l) => l.name)).toEqual(["PHYSICAL SYSTEM", "SENSING", "ACQUISITION", "EDGE ANALYTICS", "HEALTH REASONING", "PROGNOSTICS"]);
    expect(HUMS_LAYERS[3].items).toEqual(["Feature extraction", "FFT", "Order analysis", "Sensor fusion", "Anomaly detection"]);
    HUMS_LAYERS.forEach((l) => l.components.forEach((id) => expect(COMPONENTS[id], id).toBeDefined()));
  });

  it("traces a signal through eight steps, sensor to maintenance action", () => {
    expect(TRACE_STEPS.map((s) => s.label)).toEqual(["Sensor", "Acquisition Node", "Edge Processing", "Feature Extraction", "Health Model", "Diagnostic State", "Prognostic Model", "Maintenance Action"]);
  });

  it("lays out the data architecture from sensors to the ground health platform", () => {
    expect(DATA_ARCHITECTURE.map((s) => s.label)).toEqual(["SENSORS", "REMOTE I/O", "AIRCRAFT DATA NETWORK", "FLIGHT COMPUTE", "HEALTH COMPUTE", "EDGE ANALYTICS", "SECURE COMMUNICATION", "GROUND HEALTH PLATFORM"]);
    expect(NETWORK_FILTERS.map((f) => f.label)).toEqual(["ALL", "FLIGHT CRITICAL", "HEALTH", "MAINTENANCE", "GROUND"]);
  });

  it("routes every flow through finite points, and tags data routes with their network", () => {
    expect(new Set(FLOW_ROUTES.map((r) => r.id)).size).toBe(FLOW_ROUTES.length);
    FLOW_ROUTES.forEach((route) => {
      expect(route.points.length, route.id).toBeGreaterThan(1);
      route.points.flat().forEach((v) => expect(Number.isFinite(v), route.id).toBe(true));
    });
    expect(FLOW_ROUTES.filter((r) => r.group === "hv-unit")).toHaveLength(8);
    expect(FLOW_ROUTES.filter((r) => r.network === "health").length).toBeGreaterThan(8);
    expect(FLOW_ROUTES.filter((r) => r.network === "flight-critical").length).toBeGreaterThan(8);
  });
});

describe("scenarios and mission content", () => {
  it("offers bearing degradation and battery imbalance, and lists the rest as planned", () => {
    expect(FAULT_SCENARIOS.filter((s) => s.available).map((s) => s.id)).toEqual(["bearing-degradation", "battery-imbalance"]);
    expect(FAULT_SCENARIOS.find((s) => s.id === "bearing-degradation")).toMatchObject({ subject: "propulsion-unit-04", title: "MOTOR BEARING DEGRADATION" });
    expect(FAULT_SCENARIOS.length).toBe(8);
  });

  it("tells each scenario in seven stages", () => {
    expect(FAULT_STAGES).toHaveLength(7);
    expect(FAULT_STAGES.map((s) => NARRATIVE["bearing-degradation"][s].label)).toEqual(["HEALTHY", "EARLY CHANGE", "ANOMALY", "DIAGNOSIS", "PROGNOSIS", "MISSION DECISION", "MAINTENANCE ACTION"]);
  });

  it("runs the mission through ten stages", () => {
    expect(MISSION_SEQUENCE.map((p) => `${STAGE_INFO[p].number} ${STAGE_INFO[p].label}`)).toEqual([
      "01 PREFLIGHT",
      "02 VERTICAL TAKEOFF",
      "03 TRANSITION",
      "04 CRUISE",
      "05 HEALTH EVENT",
      "06 DIAGNOSIS",
      "07 PROGNOSIS",
      "08 APPROACH",
      "09 LANDING",
      "10 POST-FLIGHT MAINTENANCE",
    ]);
    expect(STAGE_INFO.CRUISE.hums).toBe("HUMS · BACKGROUND MONITORING");
  });
});

describe("wording", () => {
  // Everything a visitor can read that is defined as data.
  const text = JSON.stringify([reference, COMPONENTS, SENSORS, FAULT_SCENARIOS, NARRATIVE, HUMS_LAYERS, TRACE_STEPS, DATA_ARCHITECTURE, STAGE_INFO]);

  it("uses the product identity from the brief", () => {
    expect(reference.PRODUCT.name).toBe("UFlight™ 3D");
    expect(reference.PRODUCT.headline).toBe("Advanced Health Monitoring Systems for Next-Generation Air Mobility");
    expect(reference.PRODUCT.tagline).toBe("THE AIRCRAFT KNOWS MORE THAN YOU CAN SEE.");
    expect(reference.PRODUCT.platform).toBe("6-Seat eVTOL Reference Platform");
    expect(reference.AIRCRAFT.name).toBe("UFlight™ Reference eVTOL");
    expect(reference.DISCLAIMER).toBe(
      "UFlight™ Reference eVTOL is a digital engineering demonstrator. Aircraft configuration, telemetry, health states, faults and predictions shown in this experience are illustrative/simulated unless explicitly identified otherwise.",
    );
  });

  it("names no other aircraft maker, operator or product", () => {
    expect(text).not.toMatch(/\b(joby|archer|lilium|volocopter|wisk|beta technologies|eve air|vertical aerospace|supernal|ehang|airbus|boeing|embraer|bell|tesla|uber|midnight|cityairbus|vx4)\b/i);
  });

  it("does not overclaim", () => {
    expect(text).not.toMatch(/world'?s (first|best)|first ever|flight[- ]proven|production[- ]ready|safest|certified|certification\b(?! statement)/i);
  });

  it("uses the approved health vocabulary, never GOOD, BAD or DANGER", () => {
    expect(Object.values(reference.STATE_LABEL)).toEqual(["NOMINAL", "DEGRADED", "LIMITED", "MAINTENANCE REQUIRED", "UNAVAILABLE"]);
    expect(Object.values(reference.VEHICLE_LABEL)).toEqual(["MISSION CAPABLE", "MISSION CAPABLE WITH LIMITATION", "NOT RELEASED"]);
    expect(text).not.toMatch(/\b(GOOD|BAD|DANGER)\b/);
    // Each state has its own glyph, so state never rests on colour alone.
    expect(new Set(Object.values(reference.STATE_GLYPH)).size).toBe(5);
  });

  it("shows system dependencies for the battery and for a propulsion unit", () => {
    expect(reference.dependentsOf("energy").map((d) => d.system)).toEqual(expect.arrayContaining(["propulsion", "flightControl", "avionics", "thermal", "communications", "hums"]));
    expect(reference.PROPULSION_UNIT_DEPENDENCIES.map((d) => d.kind)).toEqual(["Power", "Cooling", "Control", "Sensor", "Health", "Structure"]);
  });
});
