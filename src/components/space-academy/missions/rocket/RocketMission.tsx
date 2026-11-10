"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { Level, TutorialRef } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { SAFETY_PRINCIPLES } from "@/app/space/academy/data/programme";
import { useLevel } from "../../store";
import { academyEvent } from "../../analytics";
import ModelViewer from "../../viewer/ModelViewer";
import LessonShell, { type LessonStep } from "../../lesson/LessonShell";
import { Choice, Equation, Explain, SimTag, Slider, Stat, Stats, Toggles } from "../../lesson/controls";
import styles from "../../lesson/lesson.module.css";
import Rocket2D from "./Rocket2D";
import type { RocketSceneProps } from "./RocketScene";
import {
  DEFAULT_ROCKET, DIAMETER_MM, FAULTS, LIMITS, MOTORS, NOSE_CP_FACTOR, NOSE_NAMES, STATUS_TEXT, TW_GUIDELINE,
  checkRocket, evaluateRocket, type MotorClass, type NoseShape, type RocketDesign, type RocketFault,
} from "./model";

const RocketScene = dynamic(() => import("./RocketScene"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#c3c6d8", fontSize: 14 }}>Loading the 3D rocket…</div>,
});

const by = (level: Level, foundation: string, advanced: string) => (level === "advanced" ? advanced : foundation);
const tone = (status: string) => (status === "stable" ? "good" : status === "unstable" ? "bad" : "warn") as "good" | "bad" | "warn";

export default function RocketMission({ mission, related, next }: { mission: MissionMeta; related: TutorialRef[]; next?: { href: string; label: string } }) {
  const level = useLevel();
  const [stepIndex, setStepIndex] = useState(0);
  const [design, setDesign] = useState<RocketDesign>(DEFAULT_ROCKET);
  const [whatIf, setWhatIf] = useState<RocketFault | null>(null);
  const [forceAnswer, setForceAnswer] = useState<string | null>(null);
  const [cgAnswer, setCgAnswer] = useState<string | null>(null);
  const [cpAnswer, setCpAnswer] = useState<string | null>(null);

  const set = <K extends keyof RocketDesign>(key: K, value: RocketDesign[K]) =>
    setDesign((d) => {
      const nextDesign = { ...d, [key]: value };
      // A fin's tip chord cannot be longer than its root.
      if (nextDesign.tipChordMm > nextDesign.rootChordMm) nextDesign.tipChordMm = nextDesign.rootChordMm;
      return nextDesign;
    });

  const base = evaluateRocket(design);
  const shown = evaluateRocket(design, whatIf);
  const stepId = ["forces", "cg", "cp", "stable", "launch"][stepIndex];
  const sceneProps: RocketSceneProps = { design: whatIf === "finDamage" ? { ...design, spanMm: design.spanMm * 0.7 } : whatIf === "lostBallast" ? { ...design, ballastG: 0 } : design, cgMm: shown.cg.xMm, cpMm: shown.cp.xMm, selected: stepId === "cg" ? "cg" : stepId === "cp" ? "cp" : null };

  const sliders = (keys: (keyof typeof LIMITS)[]) =>
    keys.map((k) => {
      const [min, max, step] = LIMITS[k];
      const labels: Record<keyof typeof LIMITS, string> = {
        noseLengthMm: "Nose cone length",
        bodyLengthMm: "Body tube length",
        rootChordMm: "Fin root chord (along the body)",
        tipChordMm: "Fin tip chord",
        spanMm: "Fin span (how far it sticks out)",
        sweepMm: "Fin sweep",
        ballastG: "Clay ballast in the nose",
      };
      return (
        <Slider
          key={k}
          id={`rocket-${k}`}
          label={labels[k]}
          value={Math.round(design[k])}
          min={min}
          max={k === "tipChordMm" ? design.rootChordMm : max}
          step={step}
          unit={k === "ballastG" ? "g" : "mm"}
          onChange={(v) => set(k, v)}
        />
      );
    });

  const readout = (
    <Stats label="Stability readout">
      <Stat label="Centre of gravity" value={`${shown.cg.xMm.toFixed(0)} mm`} detail="from the nose tip" />
      <Stat label="Centre of pressure" value={`${shown.cp.xMm.toFixed(0)} mm`} detail="from the nose tip" />
      <Stat label="Static margin" value={`${shown.margin.toFixed(2)} cal`} tone={tone(shown.status)} detail={STATUS_TEXT[shown.status].label} />
      <Stat label="Mass" value={`${shown.cg.massG.toFixed(0)} g`} />
      <Stat label="Thrust-to-weight" value={shown.thrustToWeight.toFixed(1)} tone={level === "advanced" ? (shown.thrustToWeight >= TW_GUIDELINE ? "good" : "bad") : "neutral"} />
      <Stat label="Motor" value={MOTORS[design.motor].name.replace(" (illustrative)", "")} detail={`${MOTORS[design.motor].totalImpulseNs} N·s, illustrative`} />
    </Stats>
  );

  const motorChoice = (
    <Choice<MotorClass>
      name="motor"
      legend="Motor"
      value={design.motor}
      onChange={(m) => set("motor", m)}
      columns={3}
      options={(Object.keys(MOTORS) as MotorClass[]).map((m) => ({ value: m, label: `${m}-class`, detail: `${MOTORS[m].massG} g · ${MOTORS[m].averageThrustN} N average · ${MOTORS[m].totalImpulseNs} N·s` }))}
    />
  );

  const steps: LessonStep[] = [
    {
      id: "forces",
      title: "Parts and forces",
      goal: "Open the exploded view, find each part, and decide which force the fins provide.",
      content: (
        <>
          <Explain>
            <p>
              {by(
                level,
                "Four forces act on a rocket in flight: thrust from the motor pushes it up, weight pulls it down, drag from the air slows it, and when it tilts, the air pushes sideways on the fins. That sideways push swings the tail back in line, like the feathers on a dart.",
                "Thrust acts along the axis; weight acts at the centre of gravity (CG); aerodynamic forces act at the centre of pressure (CP). At a small angle of attack the normal force at the CP creates a moment about the CG. If the CP is behind the CG, that moment rotates the nose back into the airflow: static stability.",
              )}
            </p>
          </Explain>
          <Choice
            name="fin-force"
            legend="When the rocket tilts, which force do the fins mainly provide?"
            value={forceAnswer}
            onChange={setForceAnswer}
            columns={3}
            options={[
              { value: "thrust", label: "Thrust" },
              { value: "lift", label: "A sideways aerodynamic force (lift)" },
              { value: "weight", label: "Weight" },
            ]}
          />
        </>
      ),
      hints: ["Fins do not push the rocket forward and they barely weigh anything. What does air do to a tilted flat plate?"],
      check: () => ({ pass: forceAnswer === "lift", messages: [{ pass: forceAnswer === "lift", text: forceAnswer === "lift" ? "Yes: a tilted fin makes lift that pushes the tail back into line." : forceAnswer ? "Not quite. Think about air flowing past a tilted fin." : "Choose an answer first." }] }),
      checkLabel: "Check my answer",
      success: "Right. The fins' sideways lift is what makes a rocket weathervane into its flight path.",
    },
    {
      id: "cg",
      title: "Find the centre of gravity",
      goal: "Change the ballast and the motor and watch the CG ring move. Then answer the question.",
      content: (
        <>
          <SimTag>Illustrative masses</SimTag>
          {sliders(["ballastG"])}
          {motorChoice}
          {readout}
          <Equation
            name="Centre of gravity"
            expression="X_cg = Σ(m × x) ÷ Σm"
            substitution={`= ${shown.cg.items.reduce((s, i) => s + i.massG * i.xMm, 0).toFixed(0)} g·mm ÷ ${shown.cg.massG.toFixed(1)} g = ${shown.cg.xMm.toFixed(0)} mm`}
            units="m in grams · x in mm from the nose tip"
            explain={by(level, "The CG is the balance point: where you could hold the rocket on one finger. Heavy things far from it pull it towards them.", "Each component's mass is weighted by its position. The motor sits at the tail, so a heavier motor moves the CG aft, which reduces the static margin.")}
          />
          <details className={styles.details}>
            <summary>Mass table</summary>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Component masses and positions (illustrative)</caption>
                <thead>
                  <tr>
                    <th scope="col">Part</th>
                    <th scope="col">Mass</th>
                    <th scope="col">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.cg.items.map((i) => (
                    <tr key={i.id}>
                      <th scope="row">{i.label}</th>
                      <td>{i.massG.toFixed(1)} g</td>
                      <td>{i.xMm.toFixed(0)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <Choice name="cg-question" legend="Adding clay to the nose moves the CG…" value={cgAnswer} onChange={setCgAnswer} columns={2} options={[{ value: "forward", label: "towards the nose" }, { value: "aft", label: "towards the tail" }]} />
        </>
      ),
      hints: ["Slide the ballast up and watch the cyan CG ring."],
      check: () => ({ pass: cgAnswer === "forward", messages: [{ pass: cgAnswer === "forward", text: cgAnswer === "forward" ? "Correct: mass at the front pulls the balance point forward." : cgAnswer ? "Watch the CG readout while you add ballast." : "Choose an answer first." }] }),
      checkLabel: "Check my answer",
      success: "Right. Nose weight is the simplest way to move the CG forward.",
    },
    {
      id: "cp",
      title: "Find the centre of pressure",
      goal: "Change the fins and the nose and watch the CP ring move. Then answer the question.",
      content: (
        <>
          <Choice<NoseShape>
            name="nose"
            legend="Nose cone shape"
            value={design.noseShape}
            onChange={(s) => set("noseShape", s)}
            columns={3}
            options={(Object.keys(NOSE_NAMES) as NoseShape[]).map((s) => ({ value: s, label: NOSE_NAMES[s], detail: `CP at ${NOSE_CP_FACTOR[s]} × length` }))}
          />
          <Choice<"3" | "4"> name="fin-count" legend="Number of fins" value={String(design.finCount) as "3" | "4"} onChange={(n) => set("finCount", Number(n) as 3 | 4)} columns={2} options={[{ value: "3", label: "3 fins" }, { value: "4", label: "4 fins" }]} />
          {sliders(["spanMm", "rootChordMm", "tipChordMm", "sweepMm", "noseLengthMm"])}
          {readout}
          {level === "advanced" ? (
            <Equation
              name="Barrowman centre of pressure"
              expression="X_cp = (C_Nn × X_n + C_Nf × X_f) ÷ (C_Nn + C_Nf)"
              substitution={`= (2 × ${shown.cp.noseXMm.toFixed(1)} + ${shown.cp.finCn.toFixed(2)} × ${shown.cp.finXMm.toFixed(1)}) ÷ (2 + ${shown.cp.finCn.toFixed(2)}) = ${shown.cp.xMm.toFixed(1)} mm`}
              units="C_N: normal-force coefficients (nose cone = 2) · X: positions in mm from the tip"
              explain={`The fin coefficient C_Nf = [1 + R/(S+R)] × 4N(S/d)² ÷ [1 + √(1 + (2L_F/(C_R+C_T))²)] grows with span squared and fin count. Valid for subsonic flight and small angles of attack; it ignores the body tube's own lift, which a fuller analysis adds.`}
            />
          ) : (
            <Equation
              name="Where the CP sits"
              expression="CP ≈ balance point of the rocket's side outline"
              units="A cardboard cut-out of the side view balances near the CP (a rough, cautious estimate)"
              explain="Air pushes on the whole side of a tilted rocket. Bigger fins at the back add a lot of side area there, so they pull the CP towards the tail."
            />
          )}
          <Choice name="cp-question" legend="Making the fins bigger moves the CP…" value={cpAnswer} onChange={setCpAnswer} columns={2} options={[{ value: "forward", label: "towards the nose" }, { value: "aft", label: "towards the tail" }]} />
        </>
      ),
      hints: ["Slide the fin span up and watch the amber CP ring."],
      check: () => ({ pass: cpAnswer === "aft", messages: [{ pass: cpAnswer === "aft", text: cpAnswer === "aft" ? "Correct: bigger fins add side force at the tail." : cpAnswer ? "Watch the CP readout while you change the fin span." : "Choose an answer first." }] }),
      checkLabel: "Check my answer",
      success: "Right. Fins move the CP back; nose weight moves the CG forward. Together they set the margin.",
    },
    {
      id: "stable",
      title: "Make it stable",
      goal: by(level, "Get the static margin between 1.0 and 2.0 calibres.", `Get the static margin between 1.0 and 2.0 calibres, keep at least 1.0 with the heavier motor, and keep thrust-to-weight at ${TW_GUIDELINE} or more.`),
      content: (
        <>
          {readout}
          <p className={styles.sliderHint} aria-live="polite">
            <strong style={{ color: "#fff" }}>{STATUS_TEXT[shown.status].label}.</strong> {STATUS_TEXT[shown.status].flight}
          </p>
          {sliders(["spanMm", "rootChordMm", "tipChordMm", "sweepMm", "ballastG", "noseLengthMm", "bodyLengthMm"])}
          {motorChoice}
          <Toggles<RocketFault>
            legend="What if… (preview only)"
            items={(Object.keys(FAULTS) as RocketFault[]).map((f) => ({ id: f, name: FAULTS[f].name, effect: FAULTS[f].effect }))}
            active={whatIf ? [whatIf] : []}
            onToggle={(f) => {
              const on = whatIf !== f;
              setWhatIf(on ? f : null);
              academyEvent("lesson_fault_toggle", { mission: mission.slug, fault: f, on });
            }}
            note="Faults change the readout and the model while switched on. The check always uses your design as built, plus the heavier-motor case at the Advanced level."
          />
          <Equation
            name="Static margin"
            expression="SM = (X_cp − X_cg) ÷ d"
            substitution={`= (${base.cp.xMm.toFixed(0)} − ${base.cg.xMm.toFixed(0)}) ÷ ${DIAMETER_MM} = ${base.margin.toFixed(2)} calibres`}
            units="d = body diameter (40 mm) · one calibre = one body diameter"
            explain={by(level, "Positive means the CP is behind the CG, so the rocket flies straight. This lesson aims for 1 to 2 calibres: enough to recover from a gust, not so much that it turns into every crosswind.", "1–2 calibres is a common rule of thumb, not a guarantee. Real checks also consider the CG shift as propellant burns (the margin usually grows), launch-rod exit speed, and dynamic stability.")}
          />
        </>
      ),
      hints: [
        "If the margin is too low, make the fins bigger or add nose ballast.",
        "If it is overstable, shrink the fins a little or remove ballast.",
        by(level, "Change one thing at a time and watch the margin.", "A heavier motor moves the CG about half a calibre aft here, so aim for about 1.5 calibres with the standard motor."),
      ],
      check: () => checkRocket(design, level),
      checkLabel: "Check stability",
      success: "Stable. This rocket will fly straight.",
    },
    {
      id: "launch",
      title: "Launch review",
      goal: "Review the design and the safety rules, then finish the mission.",
      content: (
        <Explain>
          <Stats label="Final design">
            <Stat label="Static margin" value={`${base.margin.toFixed(2)} cal`} tone={tone(base.status)} />
            <Stat label="Mass" value={`${base.cg.massG.toFixed(0)} g`} />
            <Stat label="Thrust-to-weight" value={base.thrustToWeight.toFixed(1)} />
            <Stat label="Fins" value={`${design.finCount} × ${design.spanMm.toFixed(0)} mm span`} />
            <Stat label="Nose" value={`${NOSE_NAMES[design.noseShape]}, ${design.noseLengthMm} mm`} />
            <Stat label="Motor" value={`${design.motor}-class (illustrative)`} />
          </Stats>
          <p>{STATUS_TEXT[base.status].flight}</p>
          <h3 className={styles.subhead}>Safety, always</h3>
          <ul className={styles.learned}>
            {SAFETY_PRINCIPLES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className={styles.sliderHint}>Simplified Barrowman model with illustrative masses and motors. A real rocket is checked with a full flight simulation and a swing test before it flies.</p>
        </Explain>
      ),
      hints: [],
    },
  ];

  const replay = () => {
    setDesign(DEFAULT_ROCKET);
    setWhatIf(null);
    setForceAnswer(null);
    setCgAnswer(null);
    setCpAnswer(null);
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
        "The four forces on a rocket, and why the fins make it fly straight",
        "Finding the centre of gravity from masses and positions",
        "Finding the centre of pressure, and what moves it",
        "Static margin: stable, marginal, unstable and overstable designs",
      ]}
      next={next}
      related={related}
      viewer={
        <ModelViewer<RocketSceneProps>
          title="Model rocket with centre of gravity and centre of pressure"
          mission={mission.slug}
          Scene3D={RocketScene}
          sceneProps={sceneProps}
          render2D={(v) => <Rocket2D {...v} {...sceneProps} />}
          caption={`Illustrative model rocket. Cyan ring: centre of gravity (CG). Amber ring: centre of pressure (CP).${whatIf ? ` Previewing: ${FAULTS[whatIf].name.toLowerCase()}.` : ""}`}
        />
      }
    />
  );
}
