import { describe, expect, it } from "vitest";
import {
  INITIAL_MISSION,
  MISSION_DURATION_S,
  MISSION_PLAN,
  MISSION_PLAYBACK_RATE,
  MISSION_STAGE_ORDER,
  type MissionEvent,
  type MissionMachine,
  formatMissionClock,
  isMissionComplete,
  missionReducer,
  missionSnapshotAt,
  nextStage,
  orbitTimeAt,
  previousStage,
  stageAt,
  stagePlan,
} from "./mission";
import { ORBIT_EVENTS } from "./orbit";

const run = (events: MissionEvent[], from: MissionMachine = INITIAL_MISSION) => events.reduce(missionReducer, from);

describe("mission plan", () => {
  it("defines the eleven stages in the specified order on a 12:00 clock", () => {
    expect(MISSION_STAGE_ORDER).toEqual([
      "BOOT",
      "POWER",
      "ATTITUDE",
      "TARGET",
      "CAPTURE",
      "STORE",
      "GROUND_PASS",
      "UPLINK",
      "TELEMETRY",
      "PAYLOAD_DOWNLINK",
      "COMPLETE",
    ]);
    expect(MISSION_DURATION_S).toBe(720);
    expect(formatMissionClock(MISSION_DURATION_S)).toBe("12:00");
    expect(formatMissionClock(0)).toBe("00:00");
  });

  it("lays stages end to end with no gaps, in both mission time and orbit time", () => {
    expect(MISSION_PLAN[0].startS).toBe(0);
    MISSION_PLAN.forEach((p, i) => {
      expect(p.index).toBe(i + 1);
      expect(p.endS).toBeGreaterThan(p.startS);
      expect(p.orbitEndS).toBeGreaterThan(p.orbitStartS);
      if (i > 0) {
        expect(p.startS).toBe(MISSION_PLAN[i - 1].endS);
        expect(p.orbitStartS).toBeCloseTo(MISSION_PLAN[i - 1].orbitEndS, 9);
      }
    });
  });

  it("maps mission time to a strictly increasing orbit time", () => {
    let previous = -Infinity;
    for (let t = 0; t <= MISSION_DURATION_S; t += 3) {
      const orbit = orbitTimeAt(t);
      expect(orbit).toBeGreaterThan(previous);
      previous = orbit;
    }
  });

  it("resolves the stage for any mission time", () => {
    expect(stageAt(-5)).toBe("BOOT");
    expect(stageAt(0)).toBe("BOOT");
    expect(stageAt(stagePlan("CAPTURE").startS)).toBe("CAPTURE");
    expect(stageAt(stagePlan("CAPTURE").endS - 0.01)).toBe("CAPTURE");
    expect(stageAt(MISSION_DURATION_S)).toBe("COMPLETE");
    expect(stageAt(9999)).toBe("COMPLETE");
  });
});

describe("mission stage machine", () => {
  it("starts idle and ignores the clock until it is run", () => {
    expect(INITIAL_MISSION).toEqual({ stage: "IDLE", timeS: 0, playing: false });
    expect(run([{ type: "TICK", dtS: 10 }])).toEqual(INITIAL_MISSION);
    expect(run([{ type: "PREVIOUS" }])).toEqual(INITIAL_MISSION);
  });

  it("RUN starts playing from BOOT", () => {
    expect(run([{ type: "RUN" }])).toEqual({ stage: "BOOT", timeS: 0, playing: true });
  });

  it("advances the clock at the playback rate only while playing", () => {
    const playing = run([{ type: "RUN" }, { type: "TICK", dtS: 2 }]);
    expect(playing.timeS).toBe(2 * MISSION_PLAYBACK_RATE);
    const paused = run([{ type: "PAUSE" }, { type: "TICK", dtS: 5 }], playing);
    expect(paused.timeS).toBe(playing.timeS);
    expect(paused.playing).toBe(false);
    expect(run([{ type: "PLAY" }, { type: "TICK", dtS: 1 }], paused).timeS).toBe(playing.timeS + MISSION_PLAYBACK_RATE);
  });

  it("NEXT walks every stage in order and stops at COMPLETE", () => {
    let state = run([{ type: "RUN" }, { type: "PAUSE" }]);
    const visited = [state.stage];
    for (let i = 0; i < MISSION_STAGE_ORDER.length - 1; i++) {
      state = missionReducer(state, { type: "NEXT" });
      visited.push(state.stage);
      expect(state.timeS).toBe(stagePlan(state.stage as (typeof MISSION_STAGE_ORDER)[number]).startS);
    }
    expect(visited).toEqual([...MISSION_STAGE_ORDER]);
    const end = missionReducer(state, { type: "NEXT" });
    expect(end.stage).toBe("COMPLETE");
    expect(end.timeS).toBe(MISSION_DURATION_S);
    expect(end.playing).toBe(false);
    expect(isMissionComplete(end)).toBe(true);
    expect(missionReducer(end, { type: "NEXT" })).toEqual(end);
  });

  it("PREVIOUS returns to the start of the previous stage and stops at BOOT", () => {
    const atCapture = run([{ type: "RUN" }, { type: "SEEK", timeS: stagePlan("CAPTURE").startS + 20 }]);
    expect(atCapture.stage).toBe("CAPTURE");
    const back = missionReducer(atCapture, { type: "PREVIOUS" });
    expect(back.stage).toBe("TARGET");
    expect(back.timeS).toBe(stagePlan("TARGET").startS);
    const first = run([{ type: "PREVIOUS" }, { type: "PREVIOUS" }, { type: "PREVIOUS" }, { type: "PREVIOUS" }, { type: "PREVIOUS" }], back);
    expect(first.stage).toBe("BOOT");
    expect(first.timeS).toBe(0);
  });

  it("NEXT and PREVIOUS keep the play state", () => {
    const playing = run([{ type: "RUN" }, { type: "NEXT" }]);
    expect(playing).toMatchObject({ stage: "POWER", playing: true });
    expect(run([{ type: "PAUSE" }, { type: "NEXT" }], playing)).toMatchObject({ stage: "ATTITUDE", playing: false });
  });

  it("runs end to end through every stage and stops itself at completion", () => {
    let state = run([{ type: "RUN" }]);
    const seen = new Set<string>();
    for (let i = 0; i < 2000 && state.playing; i++) {
      state = missionReducer(state, { type: "TICK", dtS: 0.1 });
      seen.add(state.stage);
    }
    expect([...seen]).toEqual([...MISSION_STAGE_ORDER]);
    expect(state.playing).toBe(false);
    expect(isMissionComplete(state)).toBe(true);
    // A full run takes about two minutes of real time.
    expect(MISSION_DURATION_S / MISSION_PLAYBACK_RATE).toBe(120);
  });

  it("RESTART and PLAY-after-complete begin again; RESET returns to idle", () => {
    const done = run([{ type: "RUN" }, { type: "SEEK", timeS: MISSION_DURATION_S }]);
    expect(isMissionComplete(done)).toBe(true);
    expect(missionReducer(done, { type: "PLAY" })).toEqual({ stage: "BOOT", timeS: 0, playing: true });
    expect(missionReducer(done, { type: "RESTART" })).toEqual({ stage: "BOOT", timeS: 0, playing: true });
    expect(missionReducer(done, { type: "RESET" })).toEqual(INITIAL_MISSION);
  });

  it("clamps SEEK to the mission and exposes neighbours without wrapping", () => {
    expect(run([{ type: "RUN" }, { type: "SEEK", timeS: -40 }]).timeS).toBe(0);
    expect(run([{ type: "RUN" }, { type: "SEEK", timeS: 5000 }]).timeS).toBe(MISSION_DURATION_S);
    expect(nextStage("IDLE")).toBe("BOOT");
    expect(nextStage("COMPLETE")).toBe("COMPLETE");
    expect(previousStage("BOOT")).toBe("BOOT");
    expect(previousStage("UPLINK")).toBe("GROUND_PASS");
  });
});

describe("mission snapshot", () => {
  const at = (stage: (typeof MISSION_STAGE_ORDER)[number], fraction: number) => {
    const p = stagePlan(stage);
    return missionSnapshotAt(p.startS + (p.endS - p.startS) * fraction);
  };

  it("is deterministic: the same mission time always gives the same state", () => {
    expect(missionSnapshotAt(287.5)).toEqual(missionSnapshotAt(287.5));
  });

  it("boots in eclipse on battery power", () => {
    const boot = at("BOOT", 0.3);
    expect(boot.sunFraction).toBe(0);
    expect(boot.powerGenerationW).toBe(0);
    expect(boot.powerState).toBe("DISCHARGING");
    expect(boot.mode).toBe("INITIALIZATION");
    expect(at("BOOT", 0.05).bootProgress).toBe(0);
    expect(at("BOOT", 0.9).bootProgress).toBe(1);
    expect(at("BOOT", 0.9).callout).toBe("BOOT COMPLETE");
  });

  it("enters sunlight during POWER and starts charging", () => {
    expect(at("POWER", 0).sunFraction).toBe(0);
    const late = at("POWER", 0.8);
    expect(late.sunFraction).toBe(1);
    expect(late.powerGenerationW).toBeGreaterThan(late.loadW);
    expect(late.powerState).toBe("CHARGING");
  });

  it("acquires attitude: slews, spins the wheels, then locks on nadir", () => {
    const slewing = at("ATTITUDE", 0.45);
    expect(slewing.slewing).toBe(true);
    expect(slewing.attitudeLocked).toBe(false);
    const locked = at("ATTITUDE", 0.9);
    expect(locked.attitudeLocked).toBe(true);
    expect(locked.attitudeMode).toBe("NADIR");
    expect(locked.callout).toBe("ATTITUDE ACQUIRED");
    expect(locked.mode).toBe("NOMINAL");
    expect(at("BOOT", 0.5).wheelRpm).toEqual([0, 0, 0, 0]);
    expect(Math.abs(locked.wheelRpm[0])).toBeGreaterThan(500);
  });

  it("captures over the target and stores 75 MB onboard", () => {
    expect(at("TARGET", 0.5).payloadDataMb).toBe(243);
    expect(at("CAPTURE", 0.45).capture.phase).toBe("TARGET_ACQUIRED");
    const exposing = at("CAPTURE", 0.62);
    expect(exposing.capture.phase).toBe("CAPTURING");
    expect(exposing.mode).toBe("IMAGING");
    // The exposure happens within a few seconds of the target overflight.
    expect(Math.abs(exposing.time - ORBIT_EVENTS.targetS)).toBeLessThan(12);
    expect(at("STORE", 0.5).payloadDataMb).toBe(318);
    expect(at("STORE", 0.5).capture.phase).toBe("STORED");
  });

  it("has no ground link until the ground pass, then AOS", () => {
    expect(at("CAPTURE", 0.6).groundContact).toBe(false);
    expect(at("STORE", 0.5).groundContact).toBe(false);
    expect(at("GROUND_PASS", 0.05).link.state).toBe("NO_LINK");
    const risen = at("GROUND_PASS", 0.9);
    expect(risen.link.state).toBe("AOS");
    expect(risen.callout).toBe("AOS");
  });

  it("uplinks, routes, executes and verifies the command in that order", () => {
    const phases = [0.01, 0.15, 0.4, 0.7, 0.95].map((f) => at("UPLINK", f).command.phase);
    expect(phases).toEqual(["NONE", "UPLINK", "ROUTING", "EXECUTING", "VERIFIED"]);
    expect(at("UPLINK", 0.7).slewing).toBe(true);
    expect(at("UPLINK", 0.95).attitudeMode).toBe("STATION_TRACK");
    expect(at("UPLINK", 0.95).callout).toBe("COMMAND VERIFIED");
    expect(at("UPLINK", 0.95).groundContact).toBe(true);
  });

  it("returns telemetry, then downlinks the payload data to 100% while the link is active", () => {
    expect(at("TELEMETRY", 0.9).telemetry).toBe(1);
    expect(at("TELEMETRY", 0.9).callout).toBe("SPACECRAFT NOMINAL");
    expect(at("TELEMETRY", 0.9).batterySOC).toBeGreaterThan(74);
    expect(at("TELEMETRY", 0.9).batterySOC).toBeLessThan(82);

    let previous = -1;
    for (const f of [0, 0.2, 0.4, 0.6, 0.8, 0.95]) {
      const s = at("PAYLOAD_DOWNLINK", f);
      expect(s.downlink).toBeGreaterThanOrEqual(previous);
      expect(s.link.visible).toBe(true);
      previous = s.downlink;
    }
    const done = at("PAYLOAD_DOWNLINK", 0.97);
    expect(done.downlink).toBe(1);
    expect(done.callout).toBe("EARTH OBSERVATION DATA RECEIVED");
    expect(at("PAYLOAD_DOWNLINK", 0.5).mode).toBe("DOWNLINK");
    expect(at("PAYLOAD_DOWNLINK", 0.5).loadW).toBeGreaterThan(at("GROUND_PASS", 0.5).loadW);
  });

  it("ends with loss of signal as the spacecraft sets", () => {
    const end = missionSnapshotAt(MISSION_DURATION_S);
    expect(end.stage).toBe("COMPLETE");
    expect(end.groundContact).toBe(false);
    expect(end.callout).toBe("LOS");
    expect(end.downlink).toBe(1);
    expect(end.command.phase).toBe("VERIFIED");
  });

  it("keeps the battery within limits for the whole mission", () => {
    for (let t = 0; t <= MISSION_DURATION_S; t += 10) {
      const s = missionSnapshotAt(t);
      expect(s.batterySOC).toBeGreaterThan(40);
      expect(s.batterySOC).toBeLessThanOrEqual(100);
      expect(s.wheelRpm.every((r) => Number.isFinite(r) && Math.abs(r) <= 6000)).toBe(true);
    }
  });
});
