"use client";
// Scooter → enclosure → pack → modules → cell groups → cells → BMS + sensing →
// electrical / thermal paths. Each level selects its part in the 3D explorer.
import { ChevronRight } from "lucide-react";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import type { ComponentId } from "@/lib/ev-battery-toolkit/types";
import { scrollToAndFocus } from "../state/device";
import { useSimulation, useToolkit, type ViewMode } from "../state/store";
import { startWorkspace } from "../workspace/Workspace";
import css from "../toolkit.module.css";

const LEVELS: { name: string; text: string; component: ComponentId | null; view?: ViewMode }[] = [
  { name: "Scooter", text: "Where the battery sits and how it connects to the vehicle.", component: null },
  { name: "Battery enclosure", text: "Case, cover, seal and vent: protection from impact, water and dust.", component: "enclosure" },
  { name: "Pack", text: "Everything inside: modules, interconnects, BMS, fuse and connectors.", component: "busbars" },
  { name: "Modules", text: "Groups of cell groups built and replaced as units.", component: "modules" },
  { name: "Cell groups", text: "Cells in parallel; groups in series set the pack voltage.", component: "cells", view: "voltage" },
  { name: "Cells", text: "Cylindrical, prismatic or pouch cells that store the energy.", component: "cells" },
  { name: "BMS + sensing", text: "Voltage-sense harness, temperature sensors, current sensor and BMS board.", component: "bms", view: "bms" },
  { name: "Electrical / thermal paths", text: "The current path through fuse and busbars, and the heat path through the thermal interface.", component: "tim", view: "current" },
];

export default function Hierarchy() {
  const { pack } = useSimulation();
  const select = useToolkit((s) => s.select);
  const setView = useToolkit((s) => s.setView);
  return (
    <ol className={css.hierarchy}>
      {LEVELS.map((level, i) => (
        <li key={level.name}>
          <button
            type="button"
            className={css.hierarchyItem}
            onClick={() => {
              startWorkspace("hierarchy");
              select(level.component);
              if (level.view) setView(level.view);
              if (level.component) trackToolkit("component_selected", { component: level.component });
              scrollToAndFocus("explorer");
            }}
          >
            <span className={css.hierarchyIndex}>{String(i + 1).padStart(2, "0")}</span>
            <span className={css.hierarchyName}>
              {level.name}
              {level.name === "Cell groups" ? <small> · {pack.series} in series</small> : level.name === "Cells" ? <small> · {pack.parallel} per group</small> : level.name === "Modules" ? <small> · {pack.modules}</small> : null}
            </span>
            <span className={css.hierarchyText}>{level.text}</span>
            <ChevronRight size={16} aria-hidden="true" className={css.hierarchyArrow} />
          </button>
        </li>
      ))}
    </ol>
  );
}
