"use client";
// Heavy simulators are split into their own chunks and mounted only when
// they approach the viewport, keeping the initial mobile bundle small.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import styles from "../station.module.css";

function Placeholder({ label }: { label: string }) {
  return (
    <div className={styles.card} style={{ minHeight: 240, display: "grid", placeItems: "center" }}>
      <p role="status">Loading {label}…</p>
    </div>
  );
}

function whenNear(Component: ComponentType, label: string) {
  function Lazy() {
    const ref = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setNear(true);
            io.disconnect();
          }
        },
        { rootMargin: "800px 0px" },
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);
    return <div ref={ref}>{near ? <Component /> : <Placeholder label={label} />}</div>;
  }
  Lazy.displayName = `Lazy(${label})`;
  return Lazy;
}

export const LazyExperimentDesigner = whenNear(
  dynamic(() => import("./ExperimentDesigner"), { ssr: false, loading: () => <Placeholder label="experiment designer" /> }),
  "experiment designer",
);
export const LazyStationAnatomy = whenNear(
  dynamic(() => import("./StationAnatomy"), { ssr: false, loading: () => <Placeholder label="station anatomy" /> }),
  "station anatomy",
);
export const LazyPowerSimulator = whenNear(
  dynamic(() => import("./PowerSimulator"), { ssr: false, loading: () => <Placeholder label="power simulator" /> }),
  "power simulator",
);
export const LazyOrbitSimulator = whenNear(
  dynamic(() => import("./OrbitSimulator"), { ssr: false, loading: () => <Placeholder label="orbit simulator" /> }),
  "orbit simulator",
);
export const LazyDockingSimulator = whenNear(
  dynamic(() => import("./DockingSimulator"), { ssr: false, loading: () => <Placeholder label="docking simulator" /> }),
  "docking simulator",
);
export const LazyECLSSSimulator = whenNear(
  dynamic(() => import("./ECLSSSimulator"), { ssr: false, loading: () => <Placeholder label="life-support simulator" /> }),
  "life-support simulator",
);
export const LazyThermalSimulator = whenNear(
  dynamic(() => import("./ThermalSimulator"), { ssr: false, loading: () => <Placeholder label="thermal simulator" /> }),
  "thermal simulator",
);
export const LazyCrewDaySimulator = whenNear(
  dynamic(() => import("./CrewDaySimulator"), { ssr: false, loading: () => <Placeholder label="crew day" /> }),
  "crew day",
);
export const LazyStationDigitalTwin = whenNear(
  dynamic(() => import("./StationDigitalTwin"), { ssr: false, loading: () => <Placeholder label="digital twin" /> }),
  "digital twin",
);
export const LazyFailureSimulator = whenNear(
  dynamic(() => import("./FailureSimulator"), { ssr: false, loading: () => <Placeholder label="emergency simulator" /> }),
  "emergency simulator",
);
export const LazyStationDesigner = whenNear(
  dynamic(() => import("./StationDesigner"), { ssr: false, loading: () => <Placeholder label="station designer" /> }),
  "station designer",
);
export const LazyResearchQuestionGenerator = whenNear(
  dynamic(() => import("./ResearchQuestionGenerator"), { ssr: false, loading: () => <Placeholder label="question generator" /> }),
  "question generator",
);
