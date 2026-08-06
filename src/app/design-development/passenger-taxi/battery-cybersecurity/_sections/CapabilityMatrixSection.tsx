import { buildCapabilityMatrix } from "@/lib/battery-cybersecurity/capabilityMatrix";
import { THREAT_CATALOGUE } from "@/lib/battery-cybersecurity/data/threatCatalogue";
import { DETECTION_CONTROLS } from "@/lib/battery-cybersecurity/data/detectionControls";
import { TRUST_QUESTIONS } from "@/lib/battery-cybersecurity/data/trustQuestions";
import { WORKSHOP_DELIVERABLES } from "@/lib/battery-cybersecurity/data/workshop";
import { ROADMAP_ITEMS } from "@/lib/battery-cybersecurity/data/roadmap";
import { MATURITY_LEVELS } from "@/lib/battery-cybersecurity/data/maturityModel";
import { DIGITAL_TWIN_LAYERS } from "@/lib/battery-cybersecurity/data/digitalTwin";
import type { EvidenceStatus } from "@/lib/battery-cybersecurity/types";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

const EVIDENCE_COLUMNS: Array<{ status: EvidenceStatus; label: string }> = [
  { status: "available-capability", label: "Available Today" },
  { status: "demonstration-poc", label: "POC" },
  { status: "research-in-progress", label: "Research" },
  { status: "future-roadmap", label: "Future" },
];

export function CapabilityMatrixSection() {
  const matrix = buildCapabilityMatrix([
    { label: "Threat Catalogue", items: THREAT_CATALOGUE },
    { label: "Detection & Assurance Controls", items: DETECTION_CONTROLS },
    { label: "Trust Questions", items: TRUST_QUESTIONS },
    { label: "Workshop Deliverables", items: WORKSHOP_DELIVERABLES },
    { label: "Roadmap Items", items: ROADMAP_ITEMS.map((r) => ({ evidenceStatus: r.status })) },
    { label: "Maturity Model Levels", items: MATURITY_LEVELS },
    { label: "Digital Twin Layers", items: DIGITAL_TWIN_LAYERS },
  ]);

  return (
    <section className="section bg-surface" id="capability-matrix" aria-labelledby="capability-matrix-heading">
      <div className="container">
        <SectionHeader label="Capability Matrix" title="What Is Available Today vs. Roadmap" headingId="capability-matrix-heading">
          <p>
            A single aggregated view of every claim-bearing item on this page, classified as available today, demonstration/POC,
            research in progress, or future roadmap. This introduces no new claims — it summarises the evidence status already
            attached to each item throughout the page.
          </p>
        </SectionHeader>

        <div className={pageStyles.tableScroll}>
          <table aria-label="Capability matrix by category and evidence status">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                {EVIDENCE_COLUMNS.map((c) => (
                  <th key={c.status}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.category}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" }}>{row.category}</td>
                  <td>{row.totalCount}</td>
                  {EVIDENCE_COLUMNS.map((c) => (
                    <td key={c.status}>{row.counts[c.status]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
