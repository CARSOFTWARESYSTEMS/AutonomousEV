"use client";

import { Download, Printer } from "lucide-react";
import { buildWizardMarkdownReport, buildWizardJsonReport, buildWizardCsvReport } from "@/lib/battery-cybersecurity/wizardExport";
import type { WizardExportInput } from "@/lib/battery-cybersecurity/wizardExport";

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function WizardExportControls({ input }: { input: WizardExportInput }) {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
        onClick={() => downloadFile("battery-cybersecurity-assessment.md", buildWizardMarkdownReport(input), "text/markdown")}
        data-track-event="bcs_wizard_export_markdown"
      >
        <Download size={14} style={{ marginRight: "6px" }} aria-hidden="true" />
        Export Markdown
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
        onClick={() => downloadFile("battery-cybersecurity-assessment.json", buildWizardJsonReport(input), "application/json")}
        data-track-event="bcs_wizard_export_json"
      >
        <Download size={14} style={{ marginRight: "6px" }} aria-hidden="true" />
        Export JSON
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
        onClick={() => downloadFile("battery-cybersecurity-recommendations.csv", buildWizardCsvReport(input.recommendations), "text/csv")}
        data-track-event="bcs_wizard_export_csv"
      >
        <Download size={14} style={{ marginRight: "6px" }} aria-hidden="true" />
        Export CSV
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
        onClick={() => window.print()}
        data-track-event="bcs_wizard_print"
      >
        <Printer size={14} style={{ marginRight: "6px" }} aria-hidden="true" />
        Print
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem", opacity: 0.5, cursor: "not-allowed" }}
        disabled
        title="PDF export is planned for a future release"
      >
        PDF (Coming Soon)
      </button>
    </div>
  );
}
