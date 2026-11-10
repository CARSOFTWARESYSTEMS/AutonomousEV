"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { useLevel } from "../../store";
import ModelViewer from "../../viewer/ModelViewer";
import LessonShell, { type LessonStep } from "../../lesson/LessonShell";
import { Choice, Equation, Explain, SimTag, Slider, Stat, Stats } from "../../lesson/controls";
import styles from "../../lesson/lesson.module.css";
import CubeSat2D from "./CubeSat2D";
import type { CubeSatSceneProps } from "./CubeSatScene";
import {
  CELL_EFFICIENCY, CHECK_SUN_ANGLE, DEFAULT_DESIGN, INSTALLABLE, MASS_LIMIT_G, PARTS, PAYLOADS, REQUIRED_MARGIN, SOLAR, SOLAR_CONSTANT, SUNLIT_FRACTION, TRAY_ORDER, TX_POWER_W,
  canInstall, evaluateBudget, idQuestions, sunlitPowerW, type Design, type PartId, type PayloadId, type SolarId,
} from "./model";

const CubeSatScene = dynamic(() => import("./CubeSatScene"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#c3c6d8", fontSize: 14 }}>Loading the 3D model…</div>,
});

const pct = (x: number) => `${Math.round(x * 100)}%`;
const by = (level: Level, foundation: string, advanced: string) => (level === "advanced" ? advanced : foundation);

export default function BuildCubeSatMission({ mission, related, next }: { mission: MissionMeta; related: TutorialRef[]; next?: { href: string; label: string } }) {
  const level = useLevel();
  const [stepIndex, setStepIndex] = useState(0);
  const [installed, setInstalled] = useState<PartId[]>([]);
  const [preview, setPreview] = useState<PartId | null>(null);
  const [installNote, setInstallNote] = useState<{ ok: boolean; text: string; part: PartId } | null>(null);
  const [answers, setAnswers] = useState<Record<string, PartId | "">>({});
  const [activeQ, setActiveQ] = useState(0);
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);
  const [sunAngle, setSunAngle] = useState(0);
  const [selected, setSelected] = useState<PartId | null>(null);

  const STEP_IDS = ["frame", "install", "identify", "budget", "launch"] as const;
  const stepId = STEP_IDS[stepIndex];
  // Past the install step the satellite is complete, including on a return visit.
  const shownInstalled = stepIndex > 1 ? INSTALLABLE : installed;
  const questions = idQuestions(level);

  const install = (id: PartId) => {
    const verdict = canInstall(installed, id);
    if (!verdict.ok) {
      setInstallNote({ ok: false, text: verdict.reason, part: id });
      return;
    }
    setInstalled((list) => [...list, id]);
    setPreview(null);
    setSelected(id);
    setInstallNote({ ok: true, text: PARTS[id].job[level], part: id });
  };

  const onSelect = (id: PartId) => {
    if (stepId === "identify") {
      const q = questions[activeQ];
      if (!q) return;
      setAnswers((a) => ({ ...a, [q.id]: id }));
      setActiveQ((i) => Math.min(questions.length - 1, i + 1));
    }
    setSelected(id);
  };

  const replay = () => {
    setInstalled([]);
    setPreview(null);
    setInstallNote(null);
    setAnswers({});
    setActiveQ(0);
    setDesign(DEFAULT_DESIGN);
    setSunAngle(0);
    setSelected(null);
  };

  const budget = evaluateBudget(design, level);
  const explore = evaluateBudget(design, level, sunAngle);
  const sunlit = sunlitPowerW(design.solar, sunAngle);

  const steps: LessonStep[] = [
    {
      id: "frame",
      title: "Meet the 1U frame",
      goal: by(level, "Look around the empty frame: rotate it, zoom in, and find the rails it slides along.", "Inspect the structure and note what the frame must do besides holding the boards."),
      content: (
        <Explain>
          <p>
            {by(
              level,
              "A CubeSat is a small satellite built from 10 cm cubes called units. One cube is a 1U CubeSat, about the size of a large mug. Standard sizes let many teams share one rocket: their satellites ride up in a spring-loaded box called a deployer and slide out along the four corner rails.",
              "CubeSats follow the CubeSat Design Specification, which fixes the 10 cm unit, the rail interface to the deployer and the mass allowed per unit. Those limits differ between revisions of the specification and between launch providers, so a real mission designs to the documents for its own launch. The frame is the primary structure: it carries launch loads, provides the rail interface and gives every board a mounting point.",
            )}
          </p>
          <Equation
            name="How big is 1U?"
            expression="V = 10 cm × 10 cm × 10 cm"
            substitution="= 1,000 cm³ = 1 litre"
            units="V is volume, in cubic centimetres (cm³)"
            explain={by(level, "Everything the satellite needs has to fit in one litre: the computer, radio, battery, camera and more.", "Volume is only one constraint. Mass, power, heat and the launch loads usually limit a design before space runs out.")}
          />
          <p className={styles.sliderHint}>Try the controls under the model: rotate, zoom, Exploded and Labels. Everything stays drawn in 2D if your device cannot show 3D.</p>
        </Explain>
      ),
      hints: ["The rails are the four long bars at the corners: they are the only part that touches the deployer."],
    },
    {
      id: "install",
      title: "Install the subsystems",
      goal: by(level, "Put all eight parts into the satellite in an order that works.", "Integrate all eight parts in a workable order, and be able to justify the sequence."),
      content: (
        <>
          <p>
            {by(
              level,
              "Pick parts from the tray to install them. Real assembly follows an order: some parts block access to others once they are in.",
              "Integration order is driven by access: anything that closes the structure must come after the parts it encloses, and anything mounted outside comes last.",
            )}
          </p>
          <ul className={styles.tray} aria-label="Parts tray">
            {TRAY_ORDER.map((id) => {
              const done = installed.includes(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={styles.trayButton}
                    data-installed={done || undefined}
                    disabled={done}
                    onClick={() => install(id)}
                    onMouseEnter={() => !done && setPreview(id)}
                    onMouseLeave={() => setPreview(null)}
                    onFocus={() => !done && setPreview(id)}
                    onBlur={() => setPreview(null)}
                  >
                    {PARTS[id].name}
                    <span>{done ? "Installed" : PARTS[id].tag}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.sliderHint} aria-live="polite">
            {installed.length} of {INSTALLABLE.length} installed.
          </p>
          {installNote && (
            <div className={installNote.ok ? styles.partCard : styles.result} data-pass={installNote.ok ? undefined : false} aria-live="polite">
              {installNote.ok ? (
                <>
                  <span className={styles.partTag}>Installed · {PARTS[installNote.part].tag}</span>
                  <h3>{PARTS[installNote.part].name}</h3>
                  <p>{installNote.text}</p>
                </>
              ) : (
                <p className={styles.resultTitle} style={{ margin: 0, fontWeight: 600 }}>
                  Not yet: {installNote.text}
                </p>
              )}
            </div>
          )}
        </>
      ),
      hints: [
        "Think inside-out: which parts would you no longer be able to reach once the walls are on?",
        "The boards, battery and camera go inside. The solar panels close the sides, and the antenna sits on the outside, so it goes on last.",
      ],
      check: () => {
        const left = INSTALLABLE.length - installed.length;
        return {
          pass: left === 0,
          messages: [{ pass: left === 0, text: left === 0 ? "All eight parts installed, inside first and the antenna last." : `${left} part${left === 1 ? "" : "s"} still to install.` }],
        };
      },
      checkLabel: "Check the assembly",
      success: "Assembled. Every part is in, and in a workable order.",
    },
    {
      id: "identify",
      title: "Which part does that?",
      goal: "Answer each question by choosing the part, from the list or by tapping it on the model.",
      content: (
        <ol className={styles.quiz}>
          {questions.map((q, i) => (
            <li key={q.id} data-active={i === activeQ || undefined}>
              <p className={styles.quizPrompt}>{q.prompt}</p>
              <div className={styles.quizAnswer}>
                <label htmlFor={`q-${q.id}`}>Your answer:</label>
                <select
                  id={`q-${q.id}`}
                  value={answers[q.id] ?? ""}
                  onFocus={() => setActiveQ(i)}
                  onChange={(e) => {
                    const v = e.target.value as PartId | "";
                    setAnswers((a) => ({ ...a, [q.id]: v }));
                    if (v) setSelected(v);
                  }}
                  style={{ minHeight: 44, padding: "0 10px", borderRadius: 10, background: "#0b0e22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", font: "inherit", fontSize: 15 }}
                >
                  <option value="">Choose a part…</option>
                  {INSTALLABLE.map((id) => (
                    <option key={id} value={id}>
                      {PARTS[id].name}
                    </option>
                  ))}
                </select>
                {i === activeQ && <span className={styles.sliderHint}>or tap a part on the model</span>}
              </div>
            </li>
          ))}
        </ol>
      ),
      hints: [
        "Use Labels and Exploded under the model to see every part's name.",
        by(level, "The battery stores energy; the computer decides and remembers; the solar panels make electricity from light.", "The magnetic coils (magnetorquers) on the attitude-control board create a magnetic field that pushes against Earth's."),
      ],
      check: () => {
        const messages = questions.map((q) => {
          const a = answers[q.id];
          const ok = a === q.answer;
          return { pass: ok, text: ok ? `${PARTS[q.answer].name}: correct.` : a ? `"${q.prompt}" Not the ${PARTS[a].name}. Look again.` : `"${q.prompt}" Not answered yet.` };
        });
        return { pass: messages.every((m) => m.pass), messages };
      },
      checkLabel: "Check my answers",
      success: "All correct. You know what each subsystem is for.",
    },
    {
      id: "budget",
      title: "Balance the budgets",
      goal: by(
        level,
        `Choose a payload, solar panels and radio time so the satellite stays under ${MASS_LIMIT_G} g and makes at least as much power as it uses.`,
        `Close the design with at least ${pct(REQUIRED_MARGIN.advanced.mass)} mass margin and ${pct(REQUIRED_MARGIN.advanced.power)} power margin, checked with the Sun ${CHECK_SUN_ANGLE.advanced}° off the panels.`,
      ),
      content: (
        <>
          <SimTag />
          <Choice<PayloadId>
            name="payload"
            legend="Payload"
            value={design.payload}
            onChange={(payload) => setDesign((d) => ({ ...d, payload }))}
            options={(Object.keys(PAYLOADS) as PayloadId[]).map((id) => ({
              value: id,
              label: PAYLOADS[id].name,
              detail: `${PAYLOADS[id].massG} g · ${PAYLOADS[id].powerW} W when on · needs ${pct(PAYLOADS[id].downlinkDuty)} radio time · ${PAYLOADS[id].note}`,
            }))}
          />
          <Choice<SolarId>
            name="solar"
            legend="Solar panels"
            value={design.solar}
            onChange={(solar) => setDesign((d) => ({ ...d, solar }))}
            options={(Object.keys(SOLAR) as SolarId[]).map((id) => ({
              value: id,
              label: SOLAR[id].name,
              detail: `${SOLAR[id].extraMassG ? `+${SOLAR[id].extraMassG} g · ` : ""}${SOLAR[id].note}`,
            }))}
          />
          <Slider
            id="tx-duty"
            label="Radio transmitting time"
            value={Math.round(design.txDuty * 100)}
            min={5}
            max={40}
            step={1}
            unit="% of each orbit"
            onChange={(v) => setDesign((d) => ({ ...d, txDuty: v / 100 }))}
            hint={`Transmitting uses ${TX_POWER_W} W. The ${PAYLOADS[design.payload].name.toLowerCase()} needs at least ${pct(PAYLOADS[design.payload].downlinkDuty)}.`}
          />
          <Stats label="Budget readout">
            <Stat label="Mass" value={`${budget.massG} g`} tone={budget.checks.find((c) => c.id === "mass")?.pass ? "good" : "bad"} detail={`Limit ${MASS_LIMIT_G} g · margin ${pct(budget.massMargin)}`} />
            <Stat label="Average power in" value={`${budget.averageGenerationW.toFixed(2)} W`} detail={level === "advanced" ? `Sun ${CHECK_SUN_ANGLE.advanced}° off` : "Sun square-on"} />
            <Stat label="Average power used" value={`${budget.averageLoadW.toFixed(2)} W`} tone={budget.checks.find((c) => c.id === "power")?.pass ? "good" : "bad"} detail={`Power margin ${pct(budget.powerMargin)}`} />
          </Stats>
          <Slider
            id="sun-angle"
            label="Explore: tilt the panels away from the Sun"
            value={sunAngle}
            min={0}
            max={75}
            step={5}
            unit="°"
            onChange={setSunAngle}
            hint={`At ${sunAngle}° the panels make ${sunlit.toFixed(2)} W in sunlight; the orbit average is ${explore.averageGenerationW.toFixed(2)} W (margin ${pct(explore.powerMargin)}). This slider is for exploring; the check uses ${CHECK_SUN_ANGLE[level]}°.`}
          />
          <Equation
            name="Solar power"
            expression="P = S × A × η × cos θ"
            substitution={`= ${SOLAR_CONSTANT} × ${SOLAR[design.solar].sunFacingAreaM2} × ${CELL_EFFICIENCY} × cos ${sunAngle}° = ${sunlit.toFixed(2)} W`}
            units="P in watts · S ≈ 1,361 W/m² (sunlight near Earth) · A in m² of cells facing the Sun · η cell efficiency (illustrative 28%) · θ angle from square-on"
            explain={by(
              level,
              `More cells facing the Sun, or a smaller angle, means more power. The satellite is only in sunlight for part of each orbit (${pct(SUNLIT_FRACTION)} in this lesson), so the average is lower than the sunlit figure.`,
              `Orbit-average generation is the sunlit power times the sunlit fraction (${pct(SUNLIT_FRACTION)} here). Comparing it with the orbit-average load gives the power margin; a real design would also check the worst-case attitude, end-of-life cell degradation and battery charging losses.`,
            )}
          />
        </>
      ),
      hints: [
        "Start with the mass: which choices add the most grams?",
        "Body-mounted panels alone cannot power even the basic camera with enough radio time. Deployable wings triple the cells facing the Sun.",
        by(level, "Try the basic or high-resolution camera with the wings, and set the radio to the time the camera needs.", "Only one payload keeps a 10% mass margin with the wings. Then set the radio to exactly the time that payload needs."),
      ],
      check: () => ({ pass: budget.pass, messages: budget.checks.map((c) => ({ pass: c.pass, text: c.message })) }),
      checkLabel: "Check the budgets",
      success: "The design closes: it fits the mass limit and makes more power than it uses.",
    },
    {
      id: "launch",
      title: "Pre-launch review",
      goal: "Review the finished design, then finish the mission.",
      content: (
        <Explain>
          <Stats label="Final design">
            <Stat label="Payload" value={PAYLOADS[design.payload].name} />
            <Stat label="Solar" value={design.solar === "wings" ? "Body + wings" : "Body-mounted"} />
            <Stat label="Mass" value={`${budget.massG} g`} />
            <Stat label="Power margin" value={pct(budget.powerMargin)} />
            <Stat label="Radio time" value={pct(design.txDuty)} />
            <Stat label="Mass margin" value={pct(budget.massMargin)} />
          </Stats>
          <p>
            {by(
              level,
              "After launch, the deployer pushes the CubeSat out. It waits a short time so it is clear of the rocket, then the antenna springs open, the computer starts sending a 'beacon' so ground stations can find it, and the attitude control slows its tumbling.",
              "After deployment, a typical sequence is: a timed wait for separation, antenna release, a beacon to confirm health, detumbling with the magnetorquers, then commissioning each subsystem before the payload is switched on. Each step is gated by checks, because nobody can reach the satellite to fix it.",
            )}
          </p>
          <p className={styles.sliderHint}>Simulated values for learning. This is not the design of any real satellite.</p>
        </Explain>
      ),
      hints: [],
    },
  ];

  const sceneProps: CubeSatSceneProps = {
    installed: shownInstalled,
    ghost: stepId === "install" ? preview : null,
    selected,
    onSelect,
    solar: stepIndex >= 3 ? design.solar : "body",
  };

  return (
    <LessonShell
      mission={mission}
      level={level}
      steps={steps}
      stepIndex={stepIndex}
      onStepChange={setStepIndex}
      onReplay={replay}
      learned={[
        "What a 1U CubeSat is, and what each of its eight subsystems does",
        "Why assembly runs inside-out: boards and battery first, panels next, antenna last",
        "Mass and power budgets, and why engineers keep a margin",
        "How the angle to the Sun changes solar power: P = S × A × η × cos θ",
      ]}
      next={next}
      related={related}
      viewer={
        <ModelViewer<CubeSatSceneProps>
          title="1U CubeSat model"
          mission={mission.slug}
          Scene3D={CubeSatScene}
          sceneProps={sceneProps}
          render2D={(v) => <CubeSat2D {...v} installed={sceneProps.installed} ghost={sceneProps.ghost} selected={sceneProps.selected} solar={sceneProps.solar} onSelect={onSelect} />}
          caption="Illustrative 1U CubeSat for learning: simplified parts, simulated values. Tap a part to select it."
        />
      }
    />
  );
}
