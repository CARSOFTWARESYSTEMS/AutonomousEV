"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { REDUCED_MOTION_QUERY } from "@/components/satellite-explorer/lib/capabilities";
import { useLevel } from "../../store";
import { academyEvent } from "../../analytics";
import ModelViewer from "../../viewer/ModelViewer";
import LessonShell, { type LessonStep } from "../../lesson/LessonShell";
import { Choice, Equation, Explain, SimTag, Slider, Stat, Stats, Toggles } from "../../lesson/controls";
import TelemetryChart, { bandsFrom } from "../../charts/TelemetryChart";
import styles from "../../lesson/lesson.module.css";
import Orbit2D from "./Orbit2D";
import type { OrbitSceneProps } from "./OrbitScene";
import {
  ADVANCED_FAULTS, ADVANCED_MAX_CELLS, CELL_WH, DEFAULT_EPS, FAULTS, LOADS, MAX_CELLS, SOC_FLOOR, SOLAR_SUNLIT_W, START_SOC_PCT,
  checkSurvival, orbitEnergyBalance, orbitSummary, simulateEps, type EpsConfig, type FaultId,
} from "./model";

const OrbitScene = dynamic(() => import("./OrbitScene"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#c3c6d8", fontSize: 14 }}>Loading the 3D orbit…</div>,
});

const by = (level: Level, foundation: string, advanced: string) => (level === "advanced" ? advanced : foundation);
const PLAY_SECONDS = 9;
const SOC_COLOR = "#3987e5";
const SOLAR_COLOR = "#c98500";
const LOAD_COLOR = "#3987e5";

export default function EclipseMission({ mission, related, next }: { mission: MissionMeta; related: TutorialRef[]; next?: { href: string; label: string } }) {
  const level = useLevel();
  const [stepIndex, setStepIndex] = useState(0);
  const [config, setConfig] = useState<EpsConfig>(DEFAULT_EPS);
  const [answer, setAnswer] = useState<"larger" | "smaller" | "same" | null>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const progressRef = useRef(0);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const result = useMemo(() => simulateEps(config), [config]);
  const orbit = orbitSummary(config.altitudeKm);
  const balance = orbitEnergyBalance(config);
  const stepId = ["orbit", "balance", "battery", "faults", "review"][stepIndex];

  // Playback: progress runs 0 → 1 over a few seconds; reduced motion jumps to the end.
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      raf.current = requestAnimationFrame(() => {
        setProgress(1);
        setPlaying(false);
      });
      return () => {
        if (raf.current) cancelAnimationFrame(raf.current);
      };
    }
    let start: number | null = null;
    const from = progressRef.current >= 1 ? 0 : progressRef.current;
    const tick = (now: number) => {
      start ??= now;
      const p = Math.min(1, from + (now - start) / 1000 / PLAY_SECONDS);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const update = (patch: Partial<EpsConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
    setPlaying(false);
    setProgress(1);
  };

  const toggleFault = (id: FaultId) => {
    const on = !config.faults.includes(id);
    update({ faults: on ? [...config.faults, id] : config.faults.filter((f) => f !== id) });
    academyEvent("lesson_fault_toggle", { mission: mission.slug, fault: id, on });
  };

  const run = () => {
    setProgress(0);
    setPlaying(true);
  };

  // What the viewer shows: the sample at the playback position.
  const idx = Math.min(result.samples.length - 1, Math.round(progress * (result.samples.length - 1)));
  const sample = result.samples[idx];
  const phase = ((sample.tMin * 60) % orbit.periodS) / orbit.periodS;
  const sceneProps: OrbitSceneProps = { altitudeKm: config.altitudeKm, phase: stepId === "orbit" ? 0.3 : phase, sunlit: stepId === "orbit" ? true : sample.sunlit, safe: sample.safe };

  const x = result.samples.map((s) => s.tMin);
  const shadow = bandsFrom(x, result.samples.map((s) => !s.sunlit), "shadow");
  const safeBands = bandsFrom(x, result.samples.map((s) => s.safe), "safe");
  const floor = SOC_FLOOR[level];

  const perOrbit = [0, 1, 2].map((n) => {
    const inOrbit = result.samples.filter((s) => s.tMin * 60 >= n * orbit.periodS && s.tMin * 60 < (n + 1) * orbit.periodS);
    return { n: n + 1, min: Math.min(...inOrbit.map((s) => s.socPct)), end: inOrbit[inOrbit.length - 1]?.socPct ?? 0 };
  });

  const runControls = (
    <div className={styles.runRow}>
      <button type="button" className={styles.primary} onClick={() => (playing ? setPlaying(false) : run())}>
        {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />} {playing ? "Pause" : progress >= 1 ? "Run three orbits" : "Resume"}
      </button>
      {progress < 1 && !playing && (
        <button type="button" className={styles.ghost} onClick={() => setProgress(1)}>
          <RotateCcw size={16} aria-hidden /> Show the whole run
        </button>
      )}
      <SimTag>Simulated telemetry</SimTag>
    </div>
  );

  const charts = (
    <>
      <TelemetryChart
        title="Battery state of charge"
        x={x}
        series={[{ id: "soc", label: "State of charge", color: SOC_COLOR, values: result.samples.map((s) => s.socPct), format: (v) => `${v.toFixed(0)}%` }]}
        yMin={0}
        yMax={100}
        yTicks={[0, 25, 50, 75, 100]}
        yFormat={(v) => `${v}%`}
        thresholds={[{ value: floor, label: `Floor ${floor}%` }, ...(config.safeMode ? [{ value: config.safeEnterPct, label: `Safe mode below ${config.safeEnterPct}%` }] : [])]}
        bands={[...shadow, ...safeBands]}
        progress={progress}
        summary={`Three orbits of ${orbit.periodMin.toFixed(0)} minutes. The battery starts at ${START_SOC_PCT}% and its lowest point is ${result.minSocPct.toFixed(0)}%.`}
      />
      <TelemetryChart
        title="Power in and out"
        x={x}
        series={[
          { id: "solar", label: "Solar", color: SOLAR_COLOR, values: result.samples.map((s) => s.solarW), format: (v) => `${v.toFixed(1)} W` },
          { id: "load", label: "Load", color: LOAD_COLOR, values: result.samples.map((s) => s.loadW), format: (v) => `${v.toFixed(1)} W` },
        ]}
        yMin={0}
        yMax={6}
        yTicks={[0, 2, 4, 6]}
        yFormat={(v) => `${v} W`}
        bands={shadow}
        progress={progress}
        height={170}
        summary="Solar power drops to zero in each eclipse while the load continues."
      />
      <details className={styles.details}>
        <summary>Data table: each orbit</summary>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.srOnly}>State of charge per orbit (simulated)</caption>
            <thead>
              <tr>
                <th scope="col">Orbit</th>
                <th scope="col">Lowest charge</th>
                <th scope="col">Charge at end</th>
              </tr>
            </thead>
            <tbody>
              {perOrbit.map((o) => (
                <tr key={o.n}>
                  <th scope="row">{o.n}</th>
                  <td>{o.min.toFixed(0)}%</td>
                  <td>{o.end.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );

  const steps: LessonStep[] = [
    {
      id: "orbit",
      title: "Orbit and shadow",
      goal: "Change the altitude and see how long each orbit, and each eclipse, lasts.",
      content: (
        <>
          <Slider id="altitude" label="Orbit altitude" value={config.altitudeKm} min={300} max={1000} step={50} unit="km" onChange={(v) => update({ altitudeKm: v })} />
          <Stats label="Orbit readout">
            <Stat label="One orbit" value={`${orbit.periodMin.toFixed(1)} min`} />
            <Stat label="In shadow" value={`${orbit.eclipseMin.toFixed(1)} min`} />
            <Stat label="Share in shadow" value={`${Math.round(orbit.eclipseFraction * 100)}%`} />
          </Stats>
          <Equation
            name="Orbital period"
            expression="T = 2π × √(r³ ÷ μ)"
            substitution={`r = 6,371 + ${config.altitudeKm} = ${(6371 + config.altitudeKm).toLocaleString("en")} km → T = ${orbit.periodS.toFixed(0)} s = ${orbit.periodMin.toFixed(1)} min`}
            units="T in seconds · r from Earth's centre in km · μ = 398,600 km³/s² for Earth"
            explain={by(level, "Higher orbits are bigger circles travelled more slowly, so each lap takes longer.", "Kepler's third law: T grows with r^1.5. At 400 km a CubeSat makes about 15.6 orbits a day.")}
          />
          <Equation
            name="Share of the orbit in shadow"
            expression="f = asin(R ÷ r) ÷ π"
            substitution={`= asin(6,371 ÷ ${(6371 + config.altitudeKm).toLocaleString("en")}) ÷ π = ${orbit.eclipseFraction.toFixed(3)}`}
            units="R = Earth's radius, 6,371 km · r = orbit radius · f as a fraction"
            explain={by(
              level,
              "Earth blocks the Sun for part of every orbit. From higher up, Earth covers less of the sky, so a smaller share of the orbit is in shadow.",
              "Cylindrical shadow with the Sun in the orbit plane (beta angle 0°): the longest eclipse possible at that altitude. As the beta angle grows the eclipse shortens, and above a critical angle there is none.",
            )}
          />
          <Choice
            name="shadow-question"
            legend="As the satellite flies higher, the share of each orbit spent in shadow…"
            value={answer}
            onChange={setAnswer}
            options={[
              { value: "larger", label: "gets larger" },
              { value: "smaller", label: "gets smaller" },
              { value: "same", label: "stays the same" },
            ]}
            columns={3}
          />
        </>
      ),
      hints: ["Move the altitude slider from one end to the other and watch 'Share in shadow'."],
      check: () => ({
        pass: answer === "smaller",
        messages: [
          {
            pass: answer === "smaller",
            text: answer === "smaller" ? "Correct: from higher up, Earth hides less of the Sun." : answer ? "Look at the 'Share in shadow' readout as you raise the orbit." : "Choose an answer first.",
          },
        ],
      }),
      checkLabel: "Check my answer",
      success: "Right. Lower orbits spend a larger share of each lap in Earth's shadow.",
    },
    {
      id: "balance",
      title: "Power in, power out",
      goal: "Find a solar panel and imaging plan that brings in more energy than it uses over one orbit.",
      content: (
        <>
          <Choice
            name="solar"
            legend="Solar panels"
            value={config.solar}
            onChange={(solar) => update({ solar })}
            options={[
              { value: "body", label: "Body-mounted panels", detail: `${SOLAR_SUNLIT_W.body} W average in sunlight` },
              { value: "wings", label: "Body + deployable wings", detail: `${SOLAR_SUNLIT_W.wings} W average in sunlight` },
            ]}
            columns={2}
          />
          <Choice
            name="imaging"
            legend="When does the camera take pictures?"
            value={config.imaging}
            onChange={(imaging) => update({ imaging })}
            options={[
              { value: "always", label: "All orbit long", detail: `${LOADS.payloadW} W, in sunlight and in shadow` },
              { value: "sunlit", label: "Only in sunlight", detail: "Images of the dark side are not useful for this camera" },
            ]}
            columns={2}
          />
          <Stats label="Energy over one orbit">
            <Stat label="Energy in" value={`${balance.inWh.toFixed(2)} Wh`} />
            <Stat label="Energy out" value={`${balance.outWh.toFixed(2)} Wh`} />
            <Stat label="Balance per orbit" value={`${balance.netWh >= 0 ? "+" : ""}${balance.netWh.toFixed(2)} Wh`} tone={balance.netWh > 0 ? "good" : "bad"} />
          </Stats>
          <Equation
            name="Energy balance per orbit"
            expression="E_in − E_out = P_solar × t_sun − (P_sunlit load × t_sun + P_shadow load × t_shadow)"
            substitution={`= ${SOLAR_SUNLIT_W[config.solar]} × ${balance.sunH.toFixed(2)} h − (${balance.sunlitLoadW.toFixed(1)} × ${balance.sunH.toFixed(2)} + ${balance.eclipseLoadW.toFixed(1)} × ${balance.eclipseH.toFixed(2)}) = ${balance.netWh.toFixed(2)} Wh`}
            units="Energy in watt-hours (Wh) · power in watts · time in hours"
            explain={by(
              level,
              "If more energy goes out than comes in, the battery loses a little every orbit until it runs flat, however big it is.",
              `Before battery losses. The shadow load includes a ${LOADS.heaterW} W battery heater that runs only in eclipse, when the battery gets cold. A sustainable design needs a positive balance with margin, because charging and discharging each lose a few percent.`,
            )}
          />
        </>
      ),
      hints: ["Body-mounted panels cannot keep up with the camera running in sunlight.", "Wings help, but imaging through the eclipse still costs more than the wings bring in."],
      check: () => ({
        pass: balance.netWh > 0,
        messages: [
          {
            pass: balance.netWh > 0,
            text: balance.netWh > 0 ? `Positive balance: +${balance.netWh.toFixed(2)} Wh every orbit.` : `The battery loses ${Math.abs(balance.netWh).toFixed(2)} Wh every orbit, so it would eventually run flat.`,
          },
        ],
      }),
      checkLabel: "Check the balance",
      success: "Sustainable: more energy comes in than goes out over each orbit.",
    },
    {
      id: "battery",
      title: "A battery for the shadow",
      goal: by(level, `Choose a battery and run three orbits. The charge must never drop below ${SOC_FLOOR.foundation}%.`, `Choose a battery and run three orbits. The charge must never drop below ${SOC_FLOOR.advanced}%, and at least 80% of the planned imaging must happen.`),
      content: (
        <>
          <Slider
            id="cells"
            label="Battery packs"
            value={config.cells}
            min={1}
            max={MAX_CELLS}
            step={1}
            unit={`× ${CELL_WH} Wh`}
            onChange={(v) => update({ cells: v })}
            hint={`Capacity ${(config.cells * CELL_WH).toFixed(1)} Wh. Each pack is ${CELL_WH} Wh (illustrative: 3.6 V × 1.5 Ah). Every run starts at ${START_SOC_PCT}% charge.`}
          />
          {runControls}
          {charts}
          <Stats label="Run results">
            <Stat label="Lowest charge" value={`${result.minSocPct.toFixed(0)}%`} tone={result.minSocPct >= floor && !result.powerLost ? "good" : "bad"} />
            <Stat label="Deepest discharge" value={`${result.maxDodPct.toFixed(0)}%`} detail="of capacity, in one eclipse" />
            <Stat label="Imaging delivered" value={`${Math.round(result.imagingDelivered * 100)}%`} />
          </Stats>
          <Equation
            name="Depth of discharge"
            expression="DoD = E_shadow ÷ E_battery"
            substitution={`≈ ${(balance.eclipseLoadW * balance.eclipseH).toFixed(2)} Wh ÷ ${(config.cells * CELL_WH).toFixed(1)} Wh = ${Math.round(((balance.eclipseLoadW * balance.eclipseH) / (config.cells * CELL_WH)) * 100)}%`}
            units="Energy in Wh"
            explain={by(level, "The share of the battery used up in one eclipse. Smaller is gentler on the battery.", "Lithium-ion cycle life falls steeply with depth of discharge, and a low-orbit satellite goes through about 5,500 eclipses a year, so designers keep DoD modest.")}
          />
        </>
      ),
      hints: ["Press Run three orbits and watch the charge drop in each grey eclipse band.", "If the charge dips too low, add a battery pack; check the Power in, power out step is still positive."],
      check: () => checkSurvival(result, level),
      checkLabel: "Check the run",
      success: "The battery carries the satellite through every eclipse.",
    },
    {
      id: "faults",
      title: "Inject a fault",
      goal: by(
        level,
        "Switch on at least one fault, then use safe mode or a bigger battery so the satellite still survives three orbits.",
        `Survive three orbits with ${ADVANCED_FAULTS.map((f) => FAULTS[f].name.toLowerCase()).join(" and ")} together, using no more than ${ADVANCED_MAX_CELLS} battery packs and your own safe-mode thresholds.`,
      ),
      content: (
        <>
          <Toggles<FaultId> legend="Faults" items={(Object.keys(FAULTS) as FaultId[]).map((id) => ({ id, name: FAULTS[id].name, effect: `${FAULTS[id].effect}: ${FAULTS[id].detail}` }))} active={config.faults} onToggle={toggleFault} />
          <Toggles<"safe">
            legend="Safe mode"
            items={[{ id: "safe", name: "Automatic safe mode", effect: `Below ${config.safeEnterPct}%: camera and transmitter off, beacon only (${LOADS.safeW} W). Back to normal above ${config.safeExitPct}%.` }]}
            active={config.safeMode ? ["safe"] : []}
            onToggle={() => update({ safeMode: !config.safeMode })}
          />
          {level === "advanced" && (
            <>
              <Slider id="safe-enter" label="Enter safe mode below" value={config.safeEnterPct} min={10} max={70} step={5} unit="%" onChange={(v) => update({ safeEnterPct: v })} />
              <Slider id="safe-exit" label="Leave safe mode above" value={config.safeExitPct} min={20} max={95} step={5} unit="%" onChange={(v) => update({ safeExitPct: v })} hint="The gap between the two is the hysteresis band. Without it the spacecraft could switch modes back and forth." />
            </>
          )}
          <Slider id="cells-fault" label="Battery packs" value={config.cells} min={1} max={MAX_CELLS} step={1} unit={`× ${CELL_WH} Wh`} onChange={(v) => update({ cells: v })} />
          {runControls}
          {charts}
          <Explain>
            <p>
              {by(
                level,
                "Safe mode is how a spacecraft protects itself when something goes wrong and nobody on the ground can answer in time: it switches off everything that is not essential and waits for help.",
                "This is the simplest form of Fault Detection, Isolation and Recovery (FDIR): a threshold detects the symptom (low charge), the response is a pre-planned, verified mode change, and recovery waits for a separate, higher threshold. Real FDIR also isolates the cause, for example which solar string failed.",
              )}
            </p>
          </Explain>
        </>
      ),
      hints: [
        "Run with the fault on first, without safe mode, to see what goes wrong.",
        by(level, "Turn on safe mode, or add a battery pack, and run again.", `With both faults, one pack is not enough. Try ${ADVANCED_MAX_CELLS} packs, safe mode on, and an exit threshold well above the entry threshold.`),
      ],
      check: () => checkSurvival(result, level, { faultChallenge: true, config }),
      checkLabel: "Check the fault run",
      success: "The satellite rode out the fault. That is fault tolerance.",
    },
    {
      id: "review",
      title: "Mission review",
      goal: "Review what kept the satellite alive, then finish the mission.",
      content: (
        <Explain>
          <Stats label="Final configuration">
            <Stat label="Altitude" value={`${config.altitudeKm} km`} />
            <Stat label="Solar" value={config.solar === "wings" ? "Body + wings" : "Body-mounted"} />
            <Stat label="Battery" value={`${(config.cells * CELL_WH).toFixed(1)} Wh`} />
            <Stat label="Imaging" value={config.imaging === "sunlit" ? "Sunlight only" : "All orbit"} />
            <Stat label="Safe mode" value={config.safeMode ? `${config.safeEnterPct}% / ${config.safeExitPct}%` : "Off"} />
            <Stat label="Lowest charge" value={`${result.minSocPct.toFixed(0)}%`} />
          </Stats>
          <p>
            {by(
              level,
              "Three things kept the satellite alive: enough solar power over each orbit, a battery big enough for the shadow, and safe mode for when something breaks.",
              "Energy balance sets whether the design is sustainable; battery size sets how deep each eclipse discharge is; mode logic sets how the spacecraft degrades when a fault takes away margin. Real missions add battery temperature, charge-rate limits, degradation over years and seasonal changes in eclipse length.",
            )}
          </p>
          <p className={styles.sliderHint}>Simulated, illustrative values. Not the power system of any real satellite.</p>
        </Explain>
      ),
      hints: [],
    },
  ];

  const replay = () => {
    setConfig(DEFAULT_EPS);
    setAnswer(null);
    setProgress(0);
    setPlaying(false);
  };

  return (
    <LessonShell
      mission={mission}
      level={level}
      steps={steps}
      stepIndex={stepIndex}
      onStepChange={(i) => {
        setStepIndex(i);
        setPlaying(false);
        setProgress(1);
      }}
      onReplay={replay}
      learned={[
        "How altitude sets the orbit period and the time spent in Earth's shadow",
        "Energy balance: a design must bring in more energy than it uses over each orbit",
        "Sizing a battery for the eclipse, and depth of discharge",
        "Safe mode and hysteresis: how a spacecraft protects itself after a fault",
      ]}
      next={next}
      related={related}
      viewer={
        <ModelViewer<OrbitSceneProps>
          title="CubeSat orbit and Earth's shadow"
          mission={mission.slug}
          Scene3D={OrbitScene}
          sceneProps={sceneProps}
          explodable={false}
          render2D={(v) => <Orbit2D {...v} {...sceneProps} />}
          caption={`Illustrative orbit, Sun in the orbit plane. ${stepId === "orbit" ? "" : "The satellite follows the simulation as it runs."}`}
        />
      }
    />
  );
}
