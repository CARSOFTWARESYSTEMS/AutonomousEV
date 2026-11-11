"use client";
// Mission 1: Build Your First CubeSat, in the Mission Lab.
//
//  Explore   – the assembled 1U CubeSat: select any part (or take the guided
//              tour) and see what it does; a sunlight experiment shows
//              P = S·A·η·cos θ live against the satellite's load.
//  Learn     – meet the frame, install the eight subsystems in a workable
//              order, identify parts by their job.
//  Challenge – close the mass and power budgets, review the design, reflect.
//
// The physics is the same simplified model as before (./model.ts); numbers
// are illustrative teaching values.
import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Compass, Play, Square } from "lucide-react";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { saveMissionProgress, useLabSettings, useLevel, useMissionProgress } from "../../store";
import { academyEvent } from "../../analytics";
import ModelViewer from "../../viewer/ModelViewer";
import { createController } from "../../viewer/controller";
import MissionLab, { useLabMode, useLabRendering } from "../../lab/MissionLab";
import StepRunner, { type LabStep } from "../../lab/StepRunner";
import Debrief, { type Reflection } from "../../lab/Debrief";
import { ListenButton, speak } from "../../lab/speech";
import { Choice, Equation, SimTag, Slider, Stat, Stats } from "../../lesson/controls";
import lab from "../../lab/lab.module.css";
import styles from "../../lesson/lesson.module.css";
import CubeSat2D from "./CubeSat2D";
import type { CubeSatSceneProps } from "./CubeSatScene";
import { LAYOUT } from "./layout";
import {
  CELL_EFFICIENCY, CHECK_SUN_ANGLE, DEFAULT_DESIGN, INSTALLABLE, MASS_LIMIT_G, PARTS, PAYLOADS, REQUIRED_MARGIN, SOLAR, SOLAR_CONSTANT, SUNLIT_FRACTION, TRAY_ORDER, TX_POWER_W, BASE_LOAD_W, PAYLOAD_DUTY,
  canInstall, evaluateBudget, idQuestions, sunlitPowerW, type Design, type PartId, type PayloadId, type SolarId,
} from "./model";

const CubeSatScene = dynamic(() => import("./CubeSatScene"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#c3c6d8", fontSize: 14 }}>Loading the 3D model…</div>,
});

const pct = (x: number) => `${Math.round(x * 100)}%`;
const by = (level: Level, foundation: string, advanced: string) => (level === "advanced" ? advanced : foundation);

const LEARN_IDS = ["frame", "install", "identify"] as const;
const CHALLENGE_IDS = ["budget", "launch"] as const;
const ALL_IDS = [...LEARN_IDS, ...CHALLENGE_IDS] as string[];
/** The guided tour: structure, then the stack from the bottom up, then the outside. */
const TOUR: PartId[] = ["frame", "payload", "battery", "eps", "obc", "radio", "adcs", "panels", "antenna"];

const REFLECTION: Reflection = {
  prompt: "Which change did the most to close your power budget?",
  options: [
    {
      id: "wings",
      label: "Adding the deployable solar wings",
      feedback: "Right: the wings triple the cell area facing the Sun (A goes from 0.006 to 0.018 m²), and solar power grows in proportion to A. That is why many CubeSats unfold panels after launch, paying for it in mass and in hinges that must work first time.",
    },
    {
      id: "payload",
      label: "Choosing a lighter payload",
      feedback: "A lighter payload mostly helps the mass budget. It also draws less power while it is on, but the largest single gain in power came from more cell area facing the Sun.",
    },
    {
      id: "radio",
      label: "Cutting the radio time",
      feedback: "Transmitting is a big load (2 W while on), so less radio time helps. But the payload needs a minimum share of each orbit to send its data home, so it cannot go to zero.",
    },
    {
      id: "angle",
      label: "Pointing the panels straight at the Sun",
      feedback: "Pointing matters: cos 45° ≈ 0.71, so at 45° the panels lose about 29%. But the check fixes the angle, so cell area, not pointing, was the lever you could pull here.",
    },
  ],
};

const LEARNED = [
  "What a 1U CubeSat is, and what each of its eight subsystems does",
  "Why assembly runs inside-out: boards and battery first, panels next, antenna last",
  "Mass and power budgets, and why engineers keep a margin",
  "How the angle to the Sun changes solar power: P = S × A × η × cos θ",
];

/** A labelled bar: value against a scale, for live results. */
function Meter({ label, value, max, color, text }: { label: string; value: number; max: number; color: string; text: string }) {
  return (
    <div className={lab.meterRow}>
      <span>{label}</span>
      <span className={lab.meterBar} aria-hidden="true">
        <span className={lab.meterFill} style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      </span>
      <span className={lab.meterValue}>{text}</span>
    </div>
  );
}

export default function BuildCubeSatMission({ mission, related, next, info, trackTitle }: { mission: MissionMeta; related: TutorialRef[]; next?: { href: string; label: string }; info: ReactNode; trackTitle?: string }) {
  const level = useLevel();
  const settings = useLabSettings();
  const progress = useMissionProgress(mission.slug);
  const [mode, setMode] = useLabMode(mission.slug, "learn");
  const { quality, reducedMotion } = useLabRendering();
  const [controller] = useState(createController);
  const [exploded, setExploded] = useState(false);

  // Explore
  const [selected, setSelected] = useState<PartId | null>(null);
  const [tour, setTour] = useState<number | null>(null);
  const [sunAngle, setSunAngle] = useState(0);
  const [exploreSolar, setExploreSolar] = useState<SolarId>("body");
  const [sunView, setSunView] = useState(false);

  // Learn
  const [learnIndex, setLearnIndex] = useState(0);
  const [installed, setInstalled] = useState<PartId[]>([]);
  const [preview, setPreview] = useState<PartId | null>(null);
  const [installNote, setInstallNote] = useState<{ ok: boolean; text: string; part: PartId } | null>(null);
  const [answers, setAnswers] = useState<Record<string, PartId | "">>({});
  const [activeQ, setActiveQ] = useState(0);

  // Challenge
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);
  const [debrief, setDebrief] = useState(false);

  const questions = idQuestions(level);
  const learnStep = LEARN_IDS[learnIndex];
  const budget = evaluateBudget(design, level);
  const explore = evaluateBudget({ ...DEFAULT_DESIGN, solar: exploreSolar }, level, sunAngle);
  const exploreSunlit = sunlitPowerW(exploreSolar, sunAngle);
  const challengeDone = CHALLENGE_IDS.every((id) => progress.completed.includes(id));

  // ── Guided camera ──
  const focusPart = (id: PartId, open: boolean) => {
    const at = open && id !== "panels" ? LAYOUT[id].exploded : LAYOUT[id].pos;
    const distance = id === "antenna" ? 58 : id === "panels" || id === "frame" ? 44 : 30;
    controller.focus(at, distance);
  };

  const selectPart = (id: PartId, source: "list" | "model" | "tour") => {
    setSelected(id);
    // Parts inside the frame are hidden by the side panels: open the model to show them.
    const open = PARTS[id].internal || exploded;
    if (PARTS[id].internal && !exploded) setExploded(true);
    setSunView(false);
    focusPart(id, open);
    if (mode === "explore") academyEvent("lesson_explore_select", { mission: mission.slug, part: id, source });
  };

  const goTour = (i: number | null) => {
    setTour(i);
    if (i === null) {
      controller.reset();
      return;
    }
    const id = TOUR[i];
    selectPart(id, "tour");
    academyEvent("lesson_tour_step", { mission: mission.slug, part: id, index: i });
    if (settings.narrate) speak(`tour:${id}`, `${PARTS[id].name}. ${PARTS[id].job[level]}`);
  };

  const showSun = () => {
    if (sunView) return;
    setSunView(true);
    setSelected(null);
    setExploded(false);
    // A view from above, so the angle between the Sun's ray and the panels' facing direction reads directly.
    controller.focus([0, 0, 12], 82, [0.25, 1, 0.45]);
  };

  // ── Mode and step changes, with the camera move that suits each ──
  const changeMode = (m: typeof mode) => {
    setMode(m);
    setTour(null);
    setSunView(false);
    setExploded(false);
    setSelected(null);
    controller.reset();
  };

  const goLearn = (i: number) => {
    setLearnIndex(i);
    setSelected(null);
    if (LEARN_IDS[i] !== "identify") {
      setExploded(false);
      controller.reset();
    }
  };

  const goChallenge = (i: number) => {
    setChallengeIndex(i);
    setDebrief(false);
    setExploded(false);
    controller.reset();
  };

  // ── Learn: install and identify ──
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

  const onModelSelect = (id: PartId) => {
    if (mode === "learn" && learnStep === "identify") {
      const q = questions[activeQ];
      if (q) {
        setAnswers((a) => ({ ...a, [q.id]: id }));
        setActiveQ((i) => Math.min(questions.length - 1, i + 1));
      }
      setSelected(id);
      return;
    }
    if (mode === "explore") selectPart(id, "model");
    else setSelected(id);
  };

  const replay = () => {
    saveMissionProgress(mission.slug, null);
    setInstalled([]);
    setPreview(null);
    setInstallNote(null);
    setAnswers({});
    setActiveQ(0);
    setDesign(DEFAULT_DESIGN);
    setSelected(null);
    setTour(null);
    setDebrief(false);
    setLearnIndex(0);
    setChallengeIndex(0);
    setExploded(false);
    setMode("learn");
    controller.reset();
    academyEvent("lesson_reset", { mission: mission.slug, level });
  };

  // ── Learn steps ──
  const learnSteps: LabStep[] = [
    {
      id: "frame",
      title: "Meet the 1U frame",
      goal: by(level, "Rotate the empty frame and find the four rails it slides along.", "Inspect the structure: what must the frame do besides hold the boards?"),
      say: by(
        level,
        "A CubeSat is built from ten-centimetre cubes. One cube is a 1U CubeSat. Its four corner rails slide along a spring-loaded box on the rocket.",
        "The frame is the primary structure. It carries launch loads, gives the rail interface to the deployer and holds every board.",
      ),
      content: (
        <>
          <p>
            {by(
              level,
              "A CubeSat is built from 10 cm cubes called units; one cube is a 1U CubeSat, about the size of a large mug. It rides to orbit in a spring-loaded box and slides out along its four corner rails.",
              "The frame is the primary structure: it carries launch loads, provides the rail interface to the deployer and gives every board a mounting point. Unit size and mass limits come from the CubeSat Design Specification and each launch provider's documents.",
            )}
          </p>
          <p className={styles.sliderHint}>Drag the model to rotate it (or use the arrow keys); the buttons on the right zoom and reset.</p>
        </>
      ),
      maths: (
        <Equation
          name="How big is 1U?"
          expression="V = 10 cm × 10 cm × 10 cm"
          substitution="= 1,000 cm³ = 1 litre"
          units="V is volume, in cubic centimetres (cm³)"
          explain={by(level, "Everything the satellite needs has to fit in one litre: the computer, radio, battery, camera and more.", "Volume is only one constraint. Mass, power, heat and launch loads usually limit a design before space runs out.")}
        />
      ),
      hints: ["The rails are the four long bars at the corners: they are the only part that touches the deployer."],
    },
    {
      id: "install",
      title: "Install the subsystems",
      goal: by(level, "Put all eight parts into the satellite in an order that works.", "Integrate all eight parts in a workable order, and be able to justify the sequence."),
      say: "Pick parts from the tray to install them. Some parts block access to others once they are in, so the order matters.",
      content: (
        <>
          <p>{by(level, "Pick parts from the tray. Some parts block access to others once they are in.", "Anything that closes the structure must come after the parts it encloses; anything mounted outside comes last.")}</p>
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
        "Think inside-out: which parts could you no longer reach once the walls are on?",
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
      onRetry: () => {
        setInstalled([]);
        setInstallNote(null);
      },
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
                    if (v) {
                      setSelected(v);
                      focusPart(v, exploded);
                    }
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
        "Use the Labels and Exploded buttons on the model to see every part's name.",
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
      onRetry: () => {
        setAnswers({});
        setActiveQ(0);
      },
    },
  ];

  // ── Challenge steps ──
  const challengeSteps: LabStep[] = [
    {
      id: "budget",
      title: "Balance the budgets",
      goal: by(
        level,
        `Choose a payload, solar panels and radio time so the satellite stays under ${MASS_LIMIT_G} g and makes at least as much power as it uses.`,
        `Close the design with at least ${pct(REQUIRED_MARGIN.advanced.mass)} mass margin and ${pct(REQUIRED_MARGIN.advanced.power)} power margin, with the Sun ${CHECK_SUN_ANGLE.advanced}° off the panels.`,
      ),
      say: "Every gram and every watt counts. Pick a payload, the solar panels and how long the radio transmits, and watch the budget update as you go.",
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
              detail: `${PAYLOADS[id].massG} g · ${PAYLOADS[id].powerW} W when on · needs ${pct(PAYLOADS[id].downlinkDuty)} radio time`,
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
          <Stats label="Live budget">
            <Stat label="Mass" value={`${budget.massG} g`} tone={budget.checks.find((c) => c.id === "mass")?.pass ? "good" : "bad"} detail={`Limit ${MASS_LIMIT_G} g · margin ${pct(budget.massMargin)}`} />
            <Stat label="Power in (average)" value={`${budget.averageGenerationW.toFixed(2)} W`} detail={level === "advanced" ? `Sun ${CHECK_SUN_ANGLE.advanced}° off` : "Sun square-on"} />
            <Stat label="Power used (average)" value={`${budget.averageLoadW.toFixed(2)} W`} tone={budget.checks.find((c) => c.id === "power")?.pass ? "good" : "bad"} detail={`Margin ${pct(budget.powerMargin)}`} />
          </Stats>
        </>
      ),
      maths: (
        <>
          <Equation
            name="Solar power in sunlight"
            expression="P = S × A × η × cos θ"
            substitution={`= ${SOLAR_CONSTANT} × ${SOLAR[design.solar].sunFacingAreaM2} × ${CELL_EFFICIENCY} × cos ${CHECK_SUN_ANGLE[level]}° = ${budget.sunlitW.toFixed(2)} W`}
            units="S ≈ 1,361 W/m² (sunlight near Earth) · A: m² of cells facing the Sun · η: cell efficiency (illustrative 28%) · θ: angle from square-on"
            explain={`The satellite is in sunlight for ${pct(SUNLIT_FRACTION)} of each orbit in this lesson, so the orbit average is ${budget.sunlitW.toFixed(2)} × ${SUNLIT_FRACTION} = ${budget.averageGenerationW.toFixed(2)} W.`}
          />
          <Equation
            name="Average power used"
            expression="P_load = P_base + P_tx × d_tx + P_payload × d_payload"
            substitution={`= ${BASE_LOAD_W} + ${TX_POWER_W} × ${design.txDuty.toFixed(2)} + ${PAYLOADS[design.payload].powerW} × ${PAYLOAD_DUTY} = ${budget.averageLoadW.toFixed(2)} W`}
            units="d is the share of each orbit a load is switched on (0 to 1)"
            explain={by(level, "Power margin = (power in − power used) ÷ power used. Above zero means the battery ends each orbit as full as it started.", "Margin = (P_gen − P_load) ÷ P_load. A real design would also check the worst-case attitude, end-of-life cell degradation and battery charging losses.")}
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
      onRetry: () => setDesign(DEFAULT_DESIGN),
    },
    {
      id: "launch",
      title: "Pre-launch review",
      goal: "Review the finished design, then finish the challenge.",
      say: by(
        level,
        "After launch the CubeSat waits, opens its antenna, sends a beacon so ground stations can find it, and slows its tumbling.",
        "After deployment: a timed wait, antenna release, a health beacon, detumbling with the magnetorquers, then commissioning each subsystem.",
      ),
      content: (
        <>
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
              "After launch, the deployer pushes the CubeSat out. It waits so it is clear of the rocket, the antenna springs open, the computer sends a 'beacon' so ground stations can find it, and attitude control slows its tumbling.",
              "After deployment, a typical sequence is a timed wait for separation, antenna release, a beacon to confirm health, detumbling with the magnetorquers, then commissioning each subsystem before the payload is switched on. Each step is gated by checks, because nobody can reach the satellite to fix it.",
            )}
          </p>
          <p className={styles.sliderHint}>Simulated values for learning. This is not the design of any real satellite.</p>
        </>
      ),
      hints: [],
    },
  ];

  // ── Explore panel ──
  const selectedPart = selected ? PARTS[selected] : null;
  const maxW = sunlitPowerW("wings", 0);
  const explorePanel = (
    <div className={lab.runner}>
      <p className={lab.lead}>{by(level, "A 1U CubeSat, fully assembled. Choose a part to see what it does, or take the guided tour.", "A 1U CubeSat, fully assembled. Select a subsystem for its role, or take the guided tour of the stack.")}</p>
      <div className={lab.tour}>
        {tour === null ? (
          <button type="button" className={lab.secondary} onClick={() => goTour(0)}>
            <Play size={16} aria-hidden /> Guided tour
          </button>
        ) : (
          <>
            <button type="button" className={lab.ghost} onClick={() => goTour(tour - 1)} disabled={tour === 0} aria-label="Previous part">
              <ArrowLeft size={16} aria-hidden />
            </button>
            <span className={lab.tourCount} aria-live="polite">
              Part {tour + 1} of {TOUR.length}
            </span>
            <button type="button" className={lab.secondary} onClick={() => (tour < TOUR.length - 1 ? goTour(tour + 1) : goTour(null))}>
              {tour < TOUR.length - 1 ? (
                <>
                  Next <ArrowRight size={16} aria-hidden />
                </>
              ) : (
                "Finish tour"
              )}
            </button>
            <button type="button" className={lab.ghost} onClick={() => goTour(null)}>
              <Square size={14} aria-hidden /> End
            </button>
          </>
        )}
      </div>

      {selectedPart && (
        <section className={lab.annotation} aria-labelledby="part-annotation" aria-live="polite">
          <div className={lab.annotationTop}>
            <span className={lab.annotationTag}>{selectedPart.tag}</span>
            <ListenButton id={`part:${selectedPart.id}:${level}`} text={`${selectedPart.name}. ${selectedPart.job[level]}`} />
          </div>
          <h3 id="part-annotation">{selectedPart.name}</h3>
          <p>{selectedPart.job[level]}</p>
          <ul className={lab.facts} aria-label="Facts">
            <li>{selectedPart.id === "payload" ? `${PAYLOADS[DEFAULT_DESIGN.payload].massG} g (high-resolution camera)` : `${selectedPart.massG} g`}</li>
            <li>{selectedPart.internal ? "Inside the frame" : "Outside or structure"}</li>
          </ul>
        </section>
      )}

      <h3 className={lab.sectionTitle}>Parts</h3>
      <ul className={lab.partGrid} aria-label="Parts of the CubeSat">
        {TOUR.map((id) => (
          <li key={id}>
            <button type="button" className={lab.partBtn} aria-pressed={selected === id} onClick={() => selectPart(id, "list")}>
              {PARTS[id].name}
              <span>{PARTS[id].tag}</span>
            </button>
          </li>
        ))}
      </ul>

      <h3 className={lab.sectionTitle}>Sunlight experiment</h3>
      <p className={lab.lead}>{by(level, "Turn the Sun away from the panels and watch the power fall.", "Vary θ and the cell area; compare orbit-average generation with the average load.")}</p>
      <div onFocusCapture={showSun} onPointerDownCapture={showSun}>
        <Choice<SolarId>
          name="explore-solar"
          legend="Solar panels"
          value={exploreSolar}
          onChange={setExploreSolar}
          options={(Object.keys(SOLAR) as SolarId[]).map((id) => ({ value: id, label: SOLAR[id].name }))}
        />
        <Slider id="explore-sun" label="Angle between the Sun and the panels (θ)" value={sunAngle} min={0} max={90} step={5} unit="°" onChange={setSunAngle} />
      </div>
      <div className={lab.meter} role="group" aria-label="Live power results">
        <Meter label="In sunlight" value={exploreSunlit} max={maxW} color="#fcd34d" text={`${exploreSunlit.toFixed(2)} W`} />
        <Meter label="Orbit average" value={explore.averageGenerationW} max={maxW} color="#6ee7b7" text={`${explore.averageGenerationW.toFixed(2)} W`} />
        <Meter label="Power used" value={explore.averageLoadW} max={maxW} color="#93c5fd" text={`${explore.averageLoadW.toFixed(2)} W`} />
        <p className={lab.small} aria-live="polite">
          {explore.powerMargin >= 0
            ? `Enough: ${pct(explore.powerMargin)} more power than the satellite uses, on average.`
            : `Not enough: ${pct(-explore.powerMargin)} short on average, so the battery would slowly drain.`}{" "}
          (High-resolution camera, radio on {pct(DEFAULT_DESIGN.txDuty)} of each orbit.)
        </p>
      </div>
      <details className={lab.maths}>
        <summary>Show the maths</summary>
        <div className={lab.mathsBody}>
          <Equation
            name="Solar power"
            expression="P = S × A × η × cos θ"
            substitution={`= ${SOLAR_CONSTANT} × ${SOLAR[exploreSolar].sunFacingAreaM2} × ${CELL_EFFICIENCY} × cos ${sunAngle}° = ${exploreSunlit.toFixed(2)} W`}
            units="S ≈ 1,361 W/m² · A in m² facing the Sun · η cell efficiency (illustrative 28%) · θ from square-on"
            explain={by(level, `cos 0° = 1 and cos 90° = 0: square-on gives full power, edge-on gives none. The satellite is in sunlight ${pct(SUNLIT_FRACTION)} of each orbit here, so the average is lower.`, `Orbit-average generation = P × ${SUNLIT_FRACTION} (sunlit fraction). cos θ falls slowly near 0° (cos 20° ≈ 0.94) and quickly near 90°, which is why rough pointing is often good enough.`)}
          />
        </div>
      </details>

      <div className={lab.next}>
        <p>{progress.completed.includes("frame") ? "Pick up the guided lesson where you left it." : "Ready to build one yourself?"}</p>
        <button type="button" className={lab.primary} onClick={() => changeMode("learn")}>
          <Compass size={16} aria-hidden /> Start the guided lesson
        </button>
      </div>
    </div>
  );

  const panel =
    mode === "explore" ? (
      explorePanel
    ) : mode === "learn" ? (
      <StepRunner
        mission={mission}
        level={level}
        phase="learn"
        steps={learnSteps}
        stepIndex={learnIndex}
        onStepChange={goLearn}
        allStepIds={ALL_IDS}
        finish={{ label: "On to the Challenge", onFinish: () => changeMode("challenge") }}
      />
    ) : debrief ? (
      <Debrief mission={mission} level={level} reflection={REFLECTION} learned={LEARNED} next={next} related={related} onReplay={replay} />
    ) : (
      <>
        {challengeDone && (
          <p className={lab.small} style={{ marginBottom: 12 }}>
            You have completed this challenge in this browser.{" "}
            <button type="button" className={styles.linkButton} onClick={() => setDebrief(true)}>
              See the debrief
            </button>
          </p>
        )}
        <StepRunner
          mission={mission}
          level={level}
          phase="challenge"
          steps={challengeSteps}
          stepIndex={challengeIndex}
          onStepChange={goChallenge}
          allStepIds={ALL_IDS}
          finish={{ label: "Finish and reflect", onFinish: () => setDebrief(true) }}
        />
      </>
    );

  // What the model shows in each mode and step.
  const shownInstalled = mode === "learn" && learnIndex <= 1 ? (learnStep === "frame" ? [] : installed) : INSTALLABLE;
  const sceneProps: CubeSatSceneProps = {
    installed: shownInstalled,
    ghost: mode === "learn" && learnStep === "install" ? preview : null,
    selected,
    onSelect: onModelSelect,
    solar: mode === "explore" ? exploreSolar : mode === "challenge" ? design.solar : "body",
    sunAngle: mode === "explore" && sunView ? sunAngle : mode === "challenge" && challengeIndex === 0 ? CHECK_SUN_ANGLE[level] : null,
  };

  return (
    <MissionLab
      mission={mission}
      trackTitle={trackTitle}
      level={level}
      mode={mode}
      onModeChange={changeMode}
      info={info}
      progress={{ done: ALL_IDS.filter((id) => progress.completed.includes(id)).length, total: ALL_IDS.length }}
      onClearProgress={replay}
      stageOverlay={
        selectedPart && mode === "explore" ? (
          <p className={lab.overlayChip} aria-hidden="true">
            {selectedPart.name}
          </p>
        ) : null
      }
      panel={panel}
      viewport={
        <ModelViewer<CubeSatSceneProps>
          variant="lab"
          title="1U CubeSat model"
          mission={mission.slug}
          Scene3D={CubeSatScene}
          sceneProps={sceneProps}
          exploded={exploded}
          onExplodedChange={setExploded}
          controller={controller}
          quality={quality}
          reducedMotion={reducedMotion}
          render2D={(v) => <CubeSat2D {...v} installed={sceneProps.installed} ghost={sceneProps.ghost} selected={sceneProps.selected} solar={sceneProps.solar} onSelect={onModelSelect} />}
          caption="Illustrative 1U CubeSat for learning: simplified parts, simulated values. Select a part to learn what it does."
        />
      }
    />
  );
}
