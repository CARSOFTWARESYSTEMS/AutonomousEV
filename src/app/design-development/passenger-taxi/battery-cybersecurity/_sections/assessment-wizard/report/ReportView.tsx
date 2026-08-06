"use client";

import { useState } from "react";
import type { AssessmentScores, BucketedRecommendation, RiskMatrixCell, WizardAnswers } from "@/lib/battery-cybersecurity/types";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { BatteryTrustScoreSection } from "./BatteryTrustScoreSection";
import { StrengthsWeaknesses } from "./StrengthsWeaknesses";
import { RecommendationsList } from "./RecommendationsList";
import { RiskMatrixView } from "./RiskMatrixView";
import { CtoDashboard } from "./CtoDashboard";
import { EngineerDashboard } from "./EngineerDashboard";
import { WizardExportControls } from "./WizardExportControls";

type DashboardView = "cto" | "engineer";

export function ReportView({
  aircraftProfileName,
  scores,
  recommendations,
  riskMatrix,
  answers,
  onReset,
}: {
  aircraftProfileName: string;
  scores: AssessmentScores;
  recommendations: BucketedRecommendation[];
  riskMatrix: RiskMatrixCell[];
  answers: WizardAnswers;
  onReset: () => void;
}) {
  const [view, setView] = useState<DashboardView>("cto");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <ExecutiveSummary aircraftProfileName={aircraftProfileName} scores={scores} recommendations={recommendations} />

      <BatteryTrustScoreSection scores={scores} />

      <StrengthsWeaknesses scores={scores} />

      <div>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>Recommendations</h4>
        <RecommendationsList recommendations={recommendations} />
      </div>

      <div>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>Risk Matrix</h4>
        <RiskMatrixView cells={riskMatrix} />
      </div>

      <div>
        <div role="tablist" aria-label="Dashboard view" style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            type="button"
            role="tab"
            aria-selected={view === "cto"}
            onClick={() => setView("cto")}
            className={view === "cto" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
          >
            CTO Dashboard
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "engineer"}
            onClick={() => setView("engineer")}
            className={view === "engineer" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
          >
            Engineer Dashboard
          </button>
        </div>
        {view === "cto" ? (
          <CtoDashboard scores={scores} recommendations={recommendations} />
        ) : (
          <EngineerDashboard answers={answers} recommendations={recommendations} />
        )}
      </div>

      <div>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>Export</h4>
        <WizardExportControls input={{ aircraftProfileName, scores, recommendations }} />
      </div>

      <div style={{ textAlign: "center", paddingTop: "12px", borderTop: "1px solid var(--bcs-panel-border)" }}>
        <button type="button" className="btn btn-secondary" onClick={onReset} data-track-event="bcs_wizard_reset">
          Start a New Assessment
        </button>
      </div>
    </div>
  );
}
