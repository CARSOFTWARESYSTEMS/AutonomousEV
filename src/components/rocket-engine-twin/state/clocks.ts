"use client";
// The two things that move on their own: the simulated test stepping through
// its phases, and the guided tour stepping through its stages. Both are plain
// timers over store state, so pausing, stopping or leaving always works.
import { useEffect, useState } from "react";
import { TEST_PHASES } from "../data/engineReference";
import { TOUR_STAGES } from "../data/twinContent";
import { PHASE_MS } from "../simulation/engineSim";
import { useRocketTwinStore } from "./twinStore";

/** Steps the simulated test through its phases while it is running and not held. */
export function useTestClock(): void {
  const status = useRocketTwinStore((s) => s.test.status);
  const phase = useRocketTwinStore((s) => s.test.phase);
  const hold = useRocketTwinStore((s) => s.test.hold);
  const advanceTest = useRocketTwinStore((s) => s.advanceTest);
  useEffect(() => {
    if (status !== "running" || hold) return;
    const timer = window.setTimeout(advanceTest, PHASE_MS[TEST_PHASES[phase].id]);
    return () => window.clearTimeout(timer);
  }, [status, phase, hold, advanceTest]);
}

/** Shows each tour stage as it becomes current, and moves on when its time is up unless the tour is paused. */
export function useTourClock(): void {
  const stage = useRocketTwinStore((s) => s.tour?.stage ?? -1);
  const paused = useRocketTwinStore((s) => s.tour?.paused ?? false);
  useEffect(() => {
    if (stage < 0) return;
    useRocketTwinStore.getState().applyTourStage(stage);
  }, [stage]);
  useEffect(() => {
    if (stage < 0 || paused) return;
    const timer = window.setTimeout(() => useRocketTwinStore.getState().setTourStage(stage + 1), TOUR_STAGES[stage].seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [stage, paused]);
}

/** A per-frame value, sampled a few times a second for the interface. `read` must be a stable function. */
export function useSampled<T>(read: () => T, hz = 8): T {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const timer = window.setInterval(() => setValue(read()), 1000 / hz);
    return () => window.clearInterval(timer);
  }, [read, hz]);
  return value;
}
