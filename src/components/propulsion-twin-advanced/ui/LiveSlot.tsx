"use client";
// Where a live instrument goes. The instruments, and the simulation behind
// them, are separate chunks fetched only when the module that shows them is
// opened. Until then, and on the server, the slot holds a description of what
// the instrument shows, so the page reads completely without it.
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useLabStore } from "../state/labStore";
import type { ModuleId } from "../types";
import css from "../advancedTwin.module.css";

function Loading() {
  return (
    <p className={css.loading} role="status">
      Loading the simulation…
    </p>
  );
}

// next/dynamic needs its options written out at each call: it reads them at build time.
const WIDGETS = {
  controlRoom: dynamic(() => import("../live/ControlRoom"), { ssr: false, loading: Loading }),
  twinStates: dynamic(() => import("../live/TwinStates"), { ssr: false, loading: Loading }),
  estimatorLab: dynamic(() => import("../live/EstimatorLab"), { ssr: false, loading: Loading }),
  pressureBudget: dynamic(() => import("../live/PressureBudget"), { ssr: false, loading: Loading }),
  identification: dynamic(() => import("../live/Identification"), { ssr: false, loading: Loading }),
  aiLive: dynamic(() => import("../live/AiLive"), { ssr: false, loading: Loading }),
  detectors: dynamic(() => import("../live/Detectors"), { ssr: false, loading: Loading }),
  sensorChallenge: dynamic(() => import("../live/SensorChallenge"), { ssr: false, loading: Loading }),
  rcaWorkbench: dynamic(() => import("../live/RcaWorkbench"), { ssr: false, loading: Loading }),
  prognostics: dynamic(() => import("../live/Prognostics"), { ssr: false, loading: Loading }),
  dataQuality: dynamic(() => import("../live/DataQuality"), { ssr: false, loading: Loading }),
} as const;

export type WidgetId = keyof typeof WIDGETS;

export default function LiveSlot({ widget, module, children }: { widget: WidgetId; module: ModuleId; children: ReactNode }) {
  const active = useLabStore((s) => s.module === module);
  const Widget = WIDGETS[widget];
  return (
    <div className={css.live} data-widget={widget}>
      {active ? <Widget /> : <div className={css.liveFallback}>{children}</div>}
    </div>
  );
}
