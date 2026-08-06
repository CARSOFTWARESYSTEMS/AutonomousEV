"use client";

import { Download } from "lucide-react";
import pageStyles from "../../page.module.css";

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Accepts the already-rendered markdown string, not the template object —
// functions (e.g. buildMarkdown) can't cross the Server -> Client Component
// boundary, so the parent Server Component calls buildMarkdown() first.
export function DownloadCard({
  id,
  title,
  description,
  filename,
  markdown,
}: {
  id: string;
  title: string;
  description: string;
  filename: string;
  markdown: string;
}) {
  return (
    <div className={pageStyles.navyPanel} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.92rem", marginBottom: "6px" }}>{title}</p>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{description}</p>
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: "0.82rem", padding: "0.55rem 1rem", alignSelf: "flex-start" }}
        onClick={() => downloadMarkdown(filename, markdown)}
        data-track-event="bcs_download_template"
        data-track-template={id}
      >
        <Download size={14} style={{ marginRight: "6px" }} aria-hidden="true" />
        Download as Markdown
      </button>
    </div>
  );
}
