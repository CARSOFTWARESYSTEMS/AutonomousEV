"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  cloneScenario,
  type Scenario,
  validateScenario,
} from "@/lib/cubetwin/scenario";
import {
  simulate,
  type SimulationResult,
  type MonteCarloResult,
} from "@/lib/cubetwin/engine";
interface SimulationContextValue {
  result: SimulationResult;
  baseline: SimulationResult;
  cursor: number;
  setCursor: (n: number) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  busy: boolean;
  error: string;
  setError: (s: string) => void;
  run: (s: Scenario) => void;
  monteCarlo: MonteCarloResult | null;
  runMonteCarlo: (trials: number, uncertainty: number) => void;
}
const Context = createContext<SimulationContextValue | null>(null);
export function useSimulation() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing simulation context");
  return c;
}
export default function SimulationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [result, setResult] = useState(() => simulate(cloneScenario())),
    [baseline, setBaseline] = useState(result),
    [cursor, setCursor] = useState(0),
    [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [monteCarlo, setMonteCarlo] = useState<MonteCarloResult | null>(null);
  const worker = useRef<Worker | null>(null),
    request = useRef(0),
    timeout = useRef<ReturnType<typeof setTimeout> | null>(null),
    viewer = useRef<HTMLDivElement>(null),
    visible = useRef(true);
  useEffect(() => {
    try {
      const w = new Worker(
        new URL(
          "../../../../lib/cubetwin/simulation.worker.ts",
          import.meta.url,
        ),
      );
      worker.current = w;
      w.onmessage = (e) => {
        if (e.data.id !== request.current) return;
        if (timeout.current) clearTimeout(timeout.current);
        setBusy(false);
        if (e.data.error) {
          setError(e.data.error);
          return;
        }
        if (e.data.kind === "monte-carlo") setMonteCarlo(e.data.result);
        else {
          setResult(e.data.result.run);
          setBaseline(e.data.result.baseline);
          setCursor(0);
          setPlaying(false);
          setMonteCarlo(null);
        }
      };
      w.onerror = () => {
        setBusy(false);
        setError(
          "The simulation worker could not start. Reload the page to retry.",
        );
      };
    } catch {
      setError(
        "This browser cannot start a simulation worker. The reference preview and lessons remain available.",
      );
    }
    return () => {
      worker.current?.terminate();
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  useEffect(() => {
    const target = document.getElementById("simulator");
    const observer = new IntersectionObserver(
      (entries) => {
        visible.current = entries[0].isIntersecting;
      },
      { rootMargin: "300px" },
    );
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    // Discrete playback consumes recorded samples; it never advances physics.
    const timer = setInterval(() => {
      if (document.hidden || !visible.current) return;
      setCursor((current) =>
        Math.min(
          result.samples.length - 1,
          current + Math.max(1, Math.floor(result.samples.length / 240)),
        ),
      );
    }, 100);
    return () => clearInterval(timer);
  }, [playing, result]);
  const send = (
    kind: "simulate" | "monte-carlo",
    scenario: Scenario,
    trials?: number,
    uncertainty?: number,
  ) => {
    try {
      validateScenario(scenario);
      if (!worker.current)
        throw new Error(
          "Simulation worker is unavailable. Reload the page to retry.",
        );
      setError("");
      setBusy(true);
      setPlaying(false);
      const id = ++request.current;
      worker.current.postMessage({ id, kind, scenario, trials, uncertainty });
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setBusy(false);
        setError(
          "This run is taking longer than expected. Reload to stop it, or wait for the result.",
        );
      }, 60000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid scenario.");
    }
  };
  return (
    <Context.Provider
      value={{
        result,
        baseline,
        cursor,
        setCursor,
        playing: playing && cursor < result.samples.length - 1,
        setPlaying,
        busy,
        error,
        setError,
        run: (s) => send("simulate", s),
        monteCarlo,
        runMonteCarlo: (n, u) => send("monte-carlo", result.scenario, n, u),
      }}
    >
      <div ref={viewer}>{children}</div>
    </Context.Provider>
  );
}
