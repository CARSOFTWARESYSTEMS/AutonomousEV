import { AlertTriangle } from "lucide-react";
import type { StudioResult } from "@/lib/battery-cybersecurity/types";
import { TrustStateBadge, SeverityBadge, EvidenceStatusBadge } from "../../Badges";
import pageStyles from "../../page.module.css";

export function StudioResultsPanel({ result }: { result: StudioResult }) {
  if (!result.valid) {
    return (
      <div
        className="glass-panel"
        style={{ borderLeft: "3px solid var(--bcs-amber)", display: "flex", gap: "12px", alignItems: "flex-start" }}
        role="status"
      >
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px", color: "var(--bcs-amber)" }} aria-hidden="true" />
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{result.validationMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} role="status" aria-live="polite">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <SeverityBadge severity={result.consequenceSeverity} />
        <EvidenceStatusBadge status={result.evidenceStatus} />
      </div>

      <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>{result.consequenceNarrative}</p>

      <div>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px" }}>
          Propagation Through the Energy Trust Chain
        </p>
        <ol style={{ display: "flex", flexDirection: "column", gap: "8px", listStyle: "none" }}>
          {result.propagationPath.map((step, i) => (
            <li
              key={step.componentId}
              className={pageStyles.navyPanel}
              style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", minWidth: "18px" }}>{i + 1}</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.88rem", flex: "1 1 160px" }}>{step.componentName}</span>
              <TrustStateBadge state={step.trustState} />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexBasis: "100%" }}>{step.rationale}</span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
            Recommended Detection Controls
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.recommendedDetectionControls.map((c) => (
              <li key={c.id} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong> — {c.description}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-cyan)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
            Recommended Mitigation Controls
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.recommendedMitigationControls.map((c) => (
              <li key={c.id} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong> — {c.description}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-panel" style={{ borderLeft: "3px solid var(--bcs-slate)" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bcs-slate)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>
          Residual Risk
        </p>
        <p style={{ fontSize: "0.87rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{result.residualRiskNote}</p>
      </div>
    </div>
  );
}
