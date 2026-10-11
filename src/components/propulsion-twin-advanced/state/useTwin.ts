"use client";
// Hooks that connect a view to the shared simulated twin. A view that shows
// live values registers itself, which is what fetches the simulation and keeps
// its clock running; when the last such view goes away the clock stops.
import { useEffect } from "react";
import type { TwinEngineApi, TwinSnapshot } from "../simulation/twinTypes";
import type { ModuleId } from "../types";
import { useLabStore } from "./labStore";

/** For a view that is always in the document: live only while its module is the one showing. */
export function useLiveTwin(module: ModuleId): TwinSnapshot | null {
  const active = useLabStore((s) => s.module === module);
  const watch = useLabStore((s) => s.watch);
  useEffect(() => (active ? watch() : undefined), [active, watch]);
  return useLabStore((s) => (s.module === module ? s.snapshot : null));
}

/** For an instrument that is only mounted while its module is showing. */
export function useTwin(): { snapshot: TwinSnapshot | null; engine: TwinEngineApi | null } {
  const watch = useLabStore((s) => s.watch);
  useEffect(() => watch(), [watch]);
  const snapshot = useLabStore((s) => s.snapshot);
  const engine = useLabStore((s) => s.engine);
  return { snapshot, engine };
}
