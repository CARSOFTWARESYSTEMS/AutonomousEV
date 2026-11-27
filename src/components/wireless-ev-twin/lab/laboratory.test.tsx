import { describe, expect, it, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import { Box3, Vector3 } from "three";
import { componentById } from "@/lib/wireless-charging/components";
import { VIEW_MODES } from "@/lib/wireless-charging/content";
import { modelById } from "@/lib/wireless-charging/registry";
import { stepStation } from "@/lib/wireless-charging/station";
import { resetEnvironment, runtime } from "../state/runtime";
import { useTwin } from "../state/store";
import { enterStage, leaveTour } from "../story/guide";
import { DEMO_CHAPTERS, DEMO_STAGES, PLAYLISTS, STATION_STAGES } from "../story/stages";
import { shotFor, viewShot, type ShotId } from "../three/camera";
import { targets } from "../three/viewState";
import { buildBody, BODY_GROUPS, ARCH_RADIUS, WHEEL_RADIUS, WHEEL_X } from "../three/vehicle/body";
import { NOMINAL_GAP, RX_MOUNT_Y } from "../three/vehicle/Vehicle";
import { WINDING_OFFSET } from "../three/station/Pad";
import TwinApp from "../TwinApp";
import { METRICS, type MetricId } from "./metrics";
import { PARKING_STAGES } from "../story/parkingStages";
import { launchLink, parseLaunch } from "../state/launch";
import { beginHandover, endHandover, facility, handoverActive } from "../state/runtime";
import { focus } from "../story/parkingControl";
import { runFacility } from "@/lib/wireless-charging/smart-parking/facility";
import { reachedState } from "@/lib/wireless-charging/smart-parking/lifecycle";

const fresh = () => {
  resetEnvironment("station");
  useTwin.setState({ guide: { active: true, playlist: "station", index: 0, stageId: "", shot: null, auto: false, enteredAt: 0 }, demo: { active: false }, selected: null, faults: useTwin.getInitialState().faults, speed: 1 });
};

/** Advances the station simulation by `seconds` at the stage's own fixed step. */
const run = (seconds: number) => {
  for (let i = 0; i < seconds / 0.05; i++) stepStation(runtime.station, useTwin.getState().faults, 0.05);
};

describe("guided engineering stages", () => {
  beforeEach(fresh);

  it("define twelve station stages and eight demonstration chapters, each fully specified", () => {
    expect(STATION_STAGES).toHaveLength(12);
    expect(DEMO_CHAPTERS).toHaveLength(8);
    const viewIds = new Set<string>(VIEW_MODES.map((v) => v.id));
    for (const list of [...Object.values(PLAYLISTS), DEMO_STAGES]) {
      for (const s of list) {
        expect(s.title.length, s.id).toBeGreaterThan(5);
        expect(s.objective.length, s.id).toBeGreaterThan(10);
        expect(s.explanation.length, s.id).toBeGreaterThan(40);
        expect(s.narration.length, s.id).toBeGreaterThan(20);
        expect(s.physics.equation.length, s.id).toBeGreaterThan(3);
        expect(viewIds.has(s.view), `${s.id} view`).toBe(true);
        for (const c of s.components) expect(componentById(c), `${s.id} component ${c}`).toBeDefined();
        for (const m of s.models) expect(modelById(m), `${s.id} model ${m}`).toBeDefined();
        for (const m of s.metrics) expect(METRICS[m], `${s.id} metric ${m}`).toBeDefined();
        const shot = shotFor(s.shot);
        expect([shot.azimuth, shot.polar, shot.distance, ...shot.target].every(Number.isFinite), `${s.id} shot`).toBe(true);
      }
    }
  });

  it("open an empty bay for the overview and the ground assembly, holding back the default arrival", () => {
    enterStage("station", 0);
    run(5);
    expect(runtime.station.state.vehicle.present).toBe(false);
    expect(runtime.station.state.phase).toBe("available");
    enterStage("station", 1);
    run(5);
    expect(runtime.station.state.vehicle.present).toBe(false);
  });

  it("bring the simulation to the state a stage needs by running the model, not by faking it", () => {
    enterStage("station", STATION_STAGES.findIndex((s) => s.id === "field"));
    expect(runtime.station.state.phase).toBe("charging");
    expect(runtime.station.state.vehicle.parked).toBe(true);
    expect(runtime.station.state.point.pBattery).toBeGreaterThan(1000);
    // Energy accounting holds after the fast-forward.
    const e = runtime.station.state.energy;
    expect(Math.abs(e.grid - (e.batteryTerminals + e.transformer + e.pfc + e.inverter + e.txCoil + e.rxCoil + e.rectifier + e.dcdc))).toBeLessThan(1e-6 * Math.max(1, e.grid));
  });

  it("run the foreign-object stage: detection trips, power is removed, and charging resumes once the pad is clear", () => {
    const i = STATION_STAGES.findIndex((s) => s.id === "safety");
    enterStage("station", i);
    const stage = STATION_STAGES[i];
    stage.tick!(3);
    expect(useTwin.getState().faults.foreignObject).toBe(true);
    run(1);
    expect(runtime.station.state.phase).toBe("foreign-object");
    expect(runtime.station.state.point.pBattery).toBe(0);
    stage.tick!(10);
    expect(useTwin.getState().faults.foreignObject).toBe(false);
    run(40);
    expect(runtime.station.state.phase === "charging" || runtime.station.state.phase === "optimizing").toBe(true);
    stage.exit!();
  });

  it("label accelerated time by setting the stage's speed, and restore real time when the tour is left", () => {
    enterStage("station", STATION_STAGES.findIndex((s) => s.id === "battery"));
    expect(useTwin.getState().speed).toBe(60);
    enterStage("station", STATION_STAGES.findIndex((s) => s.id === "complete"));
    expect(useTwin.getState().speed).toBe(300);
    leaveTour();
    expect(useTwin.getState().speed).toBe(1);
  });

  it("pause guided progression when the visitor interacts, and keep the simulation state", () => {
    enterStage("station", 4, { auto: true });
    const t = runtime.station.state.t;
    useTwin.getState().select("tx-coil");
    expect(useTwin.getState().guide.auto).toBe(false);
    expect(useTwin.getState().panel).toBe("component");
    expect(runtime.station.state.t).toBe(t);
    useTwin.setState((s) => ({ guide: { ...s.guide, auto: true } }));
    useTwin.getState().setStation({ airGap: 0.18 });
    expect(useTwin.getState().guide.auto).toBe(false);
    useTwin.setState({ station: useTwin.getInitialState().station });
  });
});

describe("views and camera", () => {
  it("ghost the vehicle around the receiver in the alignment and field views, and open the pads in the exploded view", () => {
    expect(targets("engineering").receiver).toBe(1);
    expect(targets("field").receiver).toBe(1);
    expect(targets("exploded")).toMatchObject({ exploded: 1, chassis: 1 });
    expect(targets("cutaway", "dynamic").xray).toBe(0);
    expect(targets("cinematic").studio).toBe(0);
    expect(targets("battery").studio).toBe(1);
  });

  it("frame every view with a finite shot", () => {
    for (const env of ["parking", "station", "dynamic", "autonomous", "infrastructure"] as const)
      for (const v of VIEW_MODES) {
        const s = shotFor(viewShot(env, v.id) as ShotId);
        expect([s.azimuth, s.polar, s.distance].every(Number.isFinite)).toBe(true);
      }
  });

  it("look at the field section from a side whose line of sight clears the wheels", () => {
    for (const [lat, long] of [
      [0.04, -0.03],
      [0.1, 0],
      [0, 0.1],
      [-0.08, 0.06],
    ]) {
      useTwin.setState((s) => ({ station: { ...s.station, lateral: lat, longitudinal: long } }));
      const s = shotFor("field");
      const t = new Vector3(...s.target);
      const p = new Vector3(Math.sin((s.polar * Math.PI) / 180) * Math.sin((s.azimuth * Math.PI) / 180), Math.cos((s.polar * Math.PI) / 180), Math.sin((s.polar * Math.PI) / 180) * Math.cos((s.azimuth * Math.PI) / 180)).multiplyScalar(s.distance).add(t);
      const vx = long - 0.6;
      let hit = false;
      for (let i = 1; i < 40; i++) {
        const q = p.clone().lerp(t, i / 40);
        for (const wx of [vx + WHEEL_X, vx - WHEEL_X]) for (const wz of [0.81, -0.81]) if (q.y < 0.71 && Math.abs(q.x - wx) < 0.36 && Math.abs(q.z - wz) < 0.13) hit = true;
      }
      expect(hit, `offsets ${lat}, ${long}`).toBe(false);
    }
    useTwin.setState({ station: useTwin.getInitialState().station });
  });
});

describe("vehicle and pad geometry", () => {
  const body = buildBody();

  it("is a 4.70 × 1.88 × 1.47 m body with paint, glass, trim, lamps and seams", () => {
    const b = new Box3().setFromBufferAttribute(body.geometry.getAttribute("position") as never);
    const size = b.getSize(new Vector3());
    expect(size.x).toBeCloseTo(4.7, 1);
    expect(size.z).toBeCloseTo(1.88, 1);
    expect(b.max.y).toBeCloseTo(1.47, 1);
    expect(body.geometry.groups.map((g) => g.materialIndex)).toEqual(BODY_GROUPS.map((_, i) => i));
    for (const g of body.geometry.groups) expect(g.count, BODY_GROUPS[g.materialIndex!]).toBeGreaterThan(0);
  });

  it("leaves the wheel arches open", () => {
    const pos = body.geometry.getAttribute("position");
    const idx = body.geometry.getIndex()!;
    for (let f = 0; f < idx.count; f += 3) {
      let x = 0;
      let y = 0;
      let z = 0;
      for (let k = 0; k < 3; k++) {
        const v = idx.getX(f + k);
        x += pos.getX(v) / 3;
        y += pos.getY(v) / 3;
        z += pos.getZ(v) / 3;
      }
      if (Math.abs(z) < 0.62) continue;
      for (const wx of [WHEEL_X, -WHEEL_X]) expect(Math.hypot(x - wx, y - WHEEL_RADIUS)).toBeGreaterThan(ARCH_RADIUS * 0.9);
    }
  });

  it("places the receiver winding at exactly the simulated air gap above the ground pad's winding", () => {
    const groundWinding = 0.002 + WINDING_OFFSET;
    for (const gap of [0.1, 0.15, 0.25]) {
      const lift = gap - NOMINAL_GAP;
      const receiverWinding = RX_MOUNT_Y - WINDING_OFFSET + lift;
      expect(receiverWinding - groundWinding).toBeCloseTo(gap, 9);
    }
  });
});

describe("laboratory shell", () => {
  it("never sends the no-WebGL message in the server HTML", () => {
    const html = renderToString(<TwinApp />);
    expect(html).toContain("Preparing the 3D laboratory");
    expect(html).not.toMatch(/3D view unavailable/);
  });

  it("reads every instrument from the running models", () => {
    for (const id of Object.keys(METRICS) as MetricId[]) {
      const r = METRICS[id].read();
      expect(typeof r.value, id).toBe("string");
      expect(r.value.length, id).toBeGreaterThan(0);
    }
  });
});

describe("Smart Parking environment (01)", () => {
  it("defines eighteen guided stages, each waiting on a simulation event or a minimum time", () => {
    expect(PARKING_STAGES).toHaveLength(18);
    expect(new Set(PARKING_STAGES.map((s) => s.id)).size).toBe(18);
    for (const s of PARKING_STAGES) expect(s.env).toBe("parking");
    expect(PLAYLISTS.parking).toBe(PARKING_STAGES);
  });

  it("brings a compatible EV through recognition, allocation and the barrier into a wireless bay, then to the Station's charging", () => {
    resetEnvironment("parking");
    const sim = facility();
    sim.stationStep = 0.25;
    enterStage("parking", PARKING_STAGES.findIndex((x) => x.id === "sp-arrival"));
    const f = () => focus()!;
    for (let i = 0; i < 60 * 10 && !(f() && reachedState(f().lc, "charging")); i++) runFacility(sim, 0.1);
    // The tour's EV has a covered plate: the read is uncertain, never trusted, and the booking's QR code identifies it.
    expect(reachedState(f().lc, "id-uncertain")).toBe(true);
    expect(f().credential).toBe("qr");
    expect(f().reservationId).not.toBeNull();
    expect(reachedState(f().lc, "identified")).toBe(true);
    expect(reachedState(f().lc, "barrier-opening")).toBe(true);
    const bay = sim.bays.find((b) => b.bay.id === f().bayId)!;
    expect(bay.bay.type).toBe("wireless");
    expect(f().lc.state).toBe("charging");
    leaveTour();
  });

  it("shows a bay's live charging session at the Station and gives the Station its own simulation back on return", () => {
    resetEnvironment("parking");
    const sim = facility();
    sim.stationStep = 0.25;
    const own = runtime.station;
    const charging = [...sim.chargers.values()].find((c) => c.session);
    expect(charging).toBeDefined();
    expect(beginHandover(charging!.bayId, 11)).toBe(true);
    expect(handoverActive()).toBe(true);
    expect(runtime.station).toBe(charging!.sim);
    expect(useTwin.getState().handover?.bayId).toBe(charging!.bayId);
    expect(useTwin.getState().station.capacityKWh).toBe(charging!.sim.inputs.capacityKWh);
    endHandover();
    expect(runtime.station).toBe(own);
    expect(useTwin.getState().handover).toBeNull();
    // Parking occupancy and sessions are untouched by the round trip.
    expect(charging!.session).not.toBeNull();
  });
});

describe("shareable Smart Parking link", () => {
  it("opens environment 01 from ?env=parking, with the presentation options, and builds the same link", () => {
    const o = parseLaunch("?fs=0&sound=1&narration=0&captions=0&demo=0&env=parking");
    expect(o).toEqual({ fullscreen: false, sound: true, narration: false, captions: false, demo: false, env: "parking", quality: null });
    const link = launchLink("https://example.org", "/internships/wireless-ev-charging-digital-twin", o!);
    expect(link).toContain("env=parking");
    expect(link).toContain("#research-laboratory");
    expect(parseLaunch(new URL(link).search)?.env).toBe("parking");
  });
});
