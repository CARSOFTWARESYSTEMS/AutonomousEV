"use client";

import { useMemo, useState } from "react";
import { WIZARD_QUESTIONS, WIZARD_STEP_ORDER, WIZARD_STEP_LABELS } from "@/lib/battery-cybersecurity/data/wizardQuestions";
import { AIRCRAFT_PROFILES } from "@/lib/battery-cybersecurity/data/aircraftProfiles";
import { RECOMMENDATION_RULES } from "@/lib/battery-cybersecurity/data/recommendationRules";
import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import { scoreAssessment } from "@/lib/battery-cybersecurity/wizardScoring";
import { buildRecommendations } from "@/lib/battery-cybersecurity/wizardRecommendations";
import { buildRiskMatrix } from "@/lib/battery-cybersecurity/wizardRiskMatrix";
import type { WizardAnswers, WizardAnswerValue, WizardStepId } from "@/lib/battery-cybersecurity/types";
import { WizardStepNav } from "./WizardStepNav";
import { WelcomeStep } from "./steps/WelcomeStep";
import { AircraftProfileStep } from "./steps/AircraftProfileStep";
import { QuestionStep } from "./steps/QuestionStep";
import { ReportView } from "./report/ReportView";
import pageStyles from "../../page.module.css";

type FlowStepId = "welcome" | "aircraft-profile" | WizardStepId | "report";

const WIZARD_STEP_ID_SET: ReadonlySet<string> = new Set(WIZARD_STEP_ORDER);

function isWizardStepId(id: FlowStepId): id is WizardStepId {
  return WIZARD_STEP_ID_SET.has(id);
}

const STEP_DESCRIPTIONS: Record<WizardStepId, string> = {
  "battery-architecture": "Questions about pack architecture, identity, redundancy, and sensing.",
  communication: "Which protocols are used, and whether messages are authenticated, encrypted, and integrity-checked.",
  firmware: "Secure boot, signing, update, and key-management practices.",
  charging: "Charger types and whether charging sessions are authenticated, authorized, and audited.",
  maintenance: "Diagnostic access control, physical port protection, and log integrity.",
  "threat-detection": "Current detection capabilities across rule-based, physics-based, and cross-validation methods.",
  verification: "Verification and validation activities performed on the architecture.",
};

const FLOW_STEPS: Array<{ id: FlowStepId; label: string }> = [
  { id: "welcome", label: "Welcome" },
  { id: "aircraft-profile", label: "Aircraft" },
  ...WIZARD_STEP_ORDER.map((id) => ({ id, label: WIZARD_STEP_LABELS[id] })),
  { id: "report", label: "Report" },
];

export function AssessmentWizard() {
  const [currentStepId, setCurrentStepId] = useState<FlowStepId>(FLOW_STEPS[0].id);
  const [aircraftProfileId, setAircraftProfileId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<WizardAnswers>({});

  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStepId);

  const completedIds = useMemo(() => {
    const set = new Set<string>();
    if (aircraftProfileId) set.add("aircraft-profile");
    for (const stepId of WIZARD_STEP_ORDER) {
      const stepQuestions = WIZARD_QUESTIONS.filter((q) => q.stepId === stepId && q.type === "boolean");
      if (stepQuestions.every((q) => answers[q.id] !== undefined && answers[q.id] !== null)) {
        set.add(stepId);
      }
    }
    return set;
  }, [answers, aircraftProfileId]);

  const scores = useMemo(() => scoreAssessment(answers, WIZARD_QUESTIONS), [answers]);
  const recommendations = useMemo(() => buildRecommendations(answers, RECOMMENDATION_RULES, DETECTION_CONTROLS), [answers]);
  const riskMatrix = useMemo(() => buildRiskMatrix(recommendations, answers), [recommendations, answers]);
  const aircraftProfile = AIRCRAFT_PROFILES.find((p) => p.id === aircraftProfileId) ?? AIRCRAFT_PROFILES[0];

  function goNext() {
    if (currentIndex < FLOW_STEPS.length - 1) setCurrentStepId(FLOW_STEPS[currentIndex + 1].id);
  }
  function goBack() {
    if (currentIndex > 0) setCurrentStepId(FLOW_STEPS[currentIndex - 1].id);
  }
  function handleAnswerChange(questionId: string, value: WizardAnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }
  function handleReset() {
    setAnswers({});
    setAircraftProfileId(null);
    setCurrentStepId(FLOW_STEPS[0].id);
  }

  const isWelcome = currentStepId === "welcome";
  const isReport = currentStepId === "report";

  return (
    <div className={pageStyles.navyPanel} style={{ padding: "28px" }}>
      {!isWelcome && <WizardStepNav steps={FLOW_STEPS} currentId={currentStepId} completedIds={completedIds} onSelect={(id) => setCurrentStepId(id as FlowStepId)} />}

      {isWelcome && <WelcomeStep onStart={goNext} />}

      {currentStepId === "aircraft-profile" && <AircraftProfileStep selectedId={aircraftProfileId} onSelect={setAircraftProfileId} />}

      {isWizardStepId(currentStepId) && (
        <QuestionStep
          stepId={currentStepId}
          title={WIZARD_STEP_LABELS[currentStepId]}
          description={STEP_DESCRIPTIONS[currentStepId]}
          questions={WIZARD_QUESTIONS}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
      )}

      {isReport && (
        <ReportView
          aircraftProfileName={aircraftProfile.name}
          scores={scores}
          recommendations={recommendations}
          riskMatrix={riskMatrix}
          answers={answers}
          onReset={handleReset}
        />
      )}

      {!isWelcome && !isReport && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
          <button type="button" className="btn btn-secondary" onClick={goBack} disabled={currentIndex === 0}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={goNext} data-track-event="bcs_wizard_next">
            {currentIndex === FLOW_STEPS.length - 2 ? "View Report" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
