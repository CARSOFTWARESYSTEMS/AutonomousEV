import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import { ROADMAP_ITEMS } from "@/lib/battery-cybersecurity/data/roadmap";
import { WIZARD_QUESTIONS, WIZARD_STEP_LABELS } from "@/lib/battery-cybersecurity/data/wizardQuestions";
import type { BucketedRecommendation, WizardAnswers } from "@/lib/battery-cybersecurity/types";
import { SeverityBadge } from "../../../Badges";
import pageStyles from "../../../page.module.css";

const ARCHITECTURE_STEP_IDS = new Set(["battery-architecture", "communication", "firmware", "charging", "maintenance"]);
const VERIFICATION_STEP_IDS = new Set(["threat-detection", "verification"]);

export function EngineerDashboard({
  answers,
  recommendations,
}: {
  answers: WizardAnswers;
  recommendations: BucketedRecommendation[];
}) {
  const topThreats = THREAT_CATALOGUE.filter((t) => t.severity === "critical" || t.severity === "high").slice(0, 8);

  const unmet = WIZARD_QUESTIONS.filter((q) => q.type === "boolean" && answers[q.id] !== true);
  const architectureGaps = unmet.filter((q) => ARCHITECTURE_STEP_IDS.has(q.stepId));
  const verificationGaps = unmet.filter((q) => VERIFICATION_STEP_IDS.has(q.stepId));

  const controlsById = new Map(DETECTION_CONTROLS.map((c) => [c.id, c]));
  const recommendedControlIds = [...new Set(recommendations.map((r) => r.relatedControlId).filter((id): id is string => Boolean(id)))];
  const recommendedControls = recommendedControlIds.map((id) => controlsById.get(id)).filter((c): c is (typeof DETECTION_CONTROLS)[number] => Boolean(c));

  const futureImprovements = ROADMAP_ITEMS.filter((r) => r.phase === "next" || r.phase === "future");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Threat Matrix (Critical/High Severity)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
          {topThreats.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(148,163,184,0.05)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t.name}</span>
              <SeverityBadge severity={t.severity} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Architecture Gaps ({architectureGaps.length})</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto" }}>
            {architectureGaps.map((q) => (
              <li key={q.id} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-muted)" }}>[{WIZARD_STEP_LABELS[q.stepId]}]</span> {q.text}
              </li>
            ))}
          </ul>
        </div>

        <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Verification Gaps ({verificationGaps.length})</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto" }}>
            {verificationGaps.map((q) => (
              <li key={q.id} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {q.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Recommended Controls</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {recommendedControls.map((c) => (
            <p key={c.id} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong> — {c.description}
            </p>
          ))}
          {recommendedControls.length === 0 && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>None linked yet.</p>}
        </div>
      </div>

      <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Standards Guidance</p>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          No certification is claimed by this assessment. Gaps above can be structured using the intent of ISO/SAE
          21434-style threat analysis and risk assessment, and DO-326A/ED-202A airworthiness security concepts — see
          the Standards &amp; Assurance Positioning section for full detail. Applicability to a specific programme
          must be assessed by qualified aerospace safety, cybersecurity, and certification professionals.
        </p>
      </div>

      <div className={pageStyles.navyPanel} style={{ padding: "18px" }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "10px" }}>Future Improvements</p>
        <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {futureImprovements.map((r) => (
            <li key={r.id} style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              {r.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
