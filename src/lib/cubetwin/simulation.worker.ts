import { simulate, runMonteCarlo } from "./engine";
import type { Scenario } from "./scenario";
self.onmessage = (
  event: MessageEvent<{
    id: number;
    scenario: Scenario;
    kind: "simulate" | "monte-carlo";
    trials?: number;
    uncertainty?: number;
  }>,
) => {
  const { id, scenario, kind, trials, uncertainty } = event.data;
  try {
    self.postMessage({
      id,
      kind,
      result:
        kind === "monte-carlo"
          ? runMonteCarlo(scenario, trials, uncertainty)
          : {
              run: simulate(scenario),
              baseline: simulate({ ...scenario, faults: [] }),
            },
    });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : "Simulation failed.",
    });
  }
};
