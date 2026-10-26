// A pilot may be marked Passed only when its success criteria and its
// baseline were recorded: success has to be defined before it is claimed.
import type { Pilot } from "../state/model";

export const pilotCanPass = (pilot: Pick<Pilot, "criteria" | "baseline">) => Boolean(pilot.criteria.trim() && pilot.baseline.trim());
