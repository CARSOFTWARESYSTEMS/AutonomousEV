"use client";
// The running simulations and their clock. One object per environment, held
// outside React: the 3D scene reads it every frame, the interface samples it
// a few times a second. The clock advances in fixed steps, so a paused twin
// resumes from exactly the state it stopped in, and single-stepping is exact.
import { useEffect, useState } from "react";
import { createParking, type ParkingSim, stepParking } from "@/lib/wireless-charging/autonomous";
import { createRoad, type RoadSim, setRoadInputs, stepRoad } from "@/lib/wireless-charging/dynamic";
import { type GridStep, type GridTotals, simulateDay, STEP_HOURS } from "@/lib/wireless-charging/infrastructure";
import { createStation, setStationInputs, type StationSim, stepStation } from "@/lib/wireless-charging/station";
import { introClock } from "../intro/introClock";
import { useTwin } from "./store";

export interface Runtime {
  station: StationSim;
  road: RoadSim;
  parking: ParkingSim;
  grid: { steps: GridStep[]; totals: GridTotals; key: string };
  /** Seconds the active environment's clock has advanced since the last reset. */
  wall: number;
  /** Phase of the (time-scaled) 85 kHz carrier used to animate fields, rad. */
  carrier: number;
}

const s0 = useTwin.getState();
export const runtime: Runtime = {
  station: createStation(s0.station),
  road: createRoad(s0.road),
  parking: createParking(s0.parking, s0.station.airGap),
  grid: { ...simulateDay(s0.grid), key: JSON.stringify(s0.grid) },
  wall: 0,
  carrier: 0,
};

/** Station step: 50 ms up to 60× real time, 250 ms beyond (stated in Research mode). */
export const stationStep = (speed: number) => (speed > 60 ? 0.25 : 0.05);
export const ROAD_STEP = 0.001;
export const PARKING_STEP = 0.02;

export function resetEnvironment(env: string) {
  const s = useTwin.getState();
  if (env === "station") runtime.station = createStation(s.station);
  if (env === "dynamic") runtime.road = createRoad(s.road);
  if (env === "autonomous") runtime.parking = createParking(s.parking, s.station.airGap);
  runtime.wall = 0;
  useTwin.getState().bump();
}

export function refreshGrid() {
  const g = useTwin.getState().grid;
  const key = JSON.stringify(g);
  if (runtime.grid.key !== key) runtime.grid = { ...simulateDay(g), key };
}

const acc = { station: 0, road: 0, parking: 0 };

/** Advances the active environment by `dt` wall seconds at the chosen speed. Never more than ~12 ms of work. */
export function advance(dt: number) {
  const s = useTwin.getState();
  const speed = s.intro.active ? introClock.speed : s.speed;
  // Wall time, capped at 0.25 s so a hidden tab does not jump the twin forward on return.
  const simDt = Math.min(dt, 0.25) * speed;
  runtime.carrier += dt * 2 * Math.PI * 0.85;
  const env = s.environment;
  const started = performance.now();
  if (env === "station") {
    const h = stationStep(speed);
    acc.station += simDt;
    while (acc.station >= h && performance.now() - started < 12) {
      stepStation(runtime.station, s.faults, h);
      acc.station -= h;
    }
    if (acc.station > 5) acc.station = 0;
  } else if (env === "dynamic") {
    acc.road += Math.min(simDt, 0.25);
    while (acc.road >= ROAD_STEP && performance.now() - started < 12) {
      stepRoad(runtime.road, ROAD_STEP);
      acc.road -= ROAD_STEP;
    }
    if (acc.road > 0.05) acc.road = 0;
  } else if (env === "autonomous") {
    acc.parking += simDt;
    while (acc.parking >= PARKING_STEP) {
      stepParking(runtime.parking, PARKING_STEP);
      acc.parking -= PARKING_STEP;
    }
  } else if (env === "infrastructure") {
    const hour = (s.gridHour + (simDt * 0.4) / 60) % 24;
    useTwin.setState({ gridHour: hour });
  }
  runtime.wall += simDt;
}

/** One fixed step of the active environment (Single Step). */
export function singleStep() {
  const s = useTwin.getState();
  if (s.environment === "station") stepStation(runtime.station, s.faults, stationStep(s.speed));
  if (s.environment === "dynamic") for (let i = 0; i < 20; i++) stepRoad(runtime.road, ROAD_STEP);
  if (s.environment === "autonomous") stepParking(runtime.parking, PARKING_STEP);
  if (s.environment === "infrastructure") useTwin.setState({ gridHour: (s.gridHour + STEP_HOURS) % 24 });
}

/** Keeps the simulations' inputs in step with the store. */
export function useInputSync() {
  const station = useTwin((s) => s.station);
  const road = useTwin((s) => s.road);
  const grid = useTwin((s) => s.grid);
  useEffect(() => setStationInputs(runtime.station, station), [station]);
  useEffect(() => setRoadInputs(runtime.road, road), [road]);
  useEffect(() => refreshGrid(), [grid]);
}

/** Runs the clock while playing. */
export function useClock() {
  const playing = useTwin((s) => s.playing);
  const introPaused = useTwin((s) => s.intro.active && s.intro.paused);
  useEffect(() => {
    if (!playing || introPaused) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      advance((now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, introPaused]);
}

/** A value read from the runtime, sampled `hz` times a second. `read` must be stable. */
export function useSampled<T>(read: () => T, hz = 8): T {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const timer = window.setInterval(() => setValue(read()), 1000 / hz);
    return () => window.clearInterval(timer);
  }, [read, hz]);
  return value;
}
