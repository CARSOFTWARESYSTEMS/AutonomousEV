"use client";

import { Download } from "lucide-react";
import { buildJsonExport, buildMarkdownExport } from "@/lib/battery-cybersecurity/export";
import type { StudioResult } from "@/lib/battery-cybersecurity/types";

function downloadTextFile(filename: string, content: string, mime: string) {
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

export function StudioExportControls({ result }: { result: StudioResult }) {
  if (!result.valid) return null;

  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.85rem", padding: "0.6rem 1.1rem" }}
        onClick={() => downloadTextFile(`${result.input.threatId}-threat-model.json`, buildJsonExport(result), "application/json")}
        data-track-event="bcs_studio_export_json"
      >
        <Download size={15} style={{ marginRight: "6px" }} aria-hidden="true" />
        Export JSON
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.85rem", padding: "0.6rem 1.1rem" }}
        onClick={() => downloadTextFile(`${result.input.threatId}-threat-model.md`, buildMarkdownExport(result), "text/markdown")}
        data-track-event="bcs_studio_export_markdown"
      >
        <Download size={15} style={{ marginRight: "6px" }} aria-hidden="true" />
        Export Markdown
      </button>
    </div>
  );
}
