"use client";
// Technician Report Preview: the sample report, built from the current
// simulation and labelled as training data throughout. Real reports come from
// the Real Vehicle Diagnosis job card.
import { useCallback, useMemo, useState } from "react";
import { FileText, Printer } from "lucide-react";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { buildSimulationReport } from "@/lib/ev-battery-toolkit/report";
import { useSimulation } from "../state/store";
import { ReportDialog, printReport } from "../report/ReportDocument";
import css from "../toolkit.module.css";

const SAMPLE_TIME = new Date("2026-10-18T10:30:00");

export default function ReportPreview() {
  const { pack, fault, result } = useSimulation();
  const [open, setOpen] = useState(false);
  // A fixed sample time, so the server and the browser agree on the preview.
  const report = useMemo(() => buildSimulationReport(pack, result, fault, SAMPLE_TIME), [pack, result, fault]);
  const close = useCallback(() => setOpen(false), []);
  const print = () => {
    trackToolkit("report_generated", { context: "simulation" });
    printReport();
  };
  const before = report.sections.find((s) => s.id === "before");

  return (
    <div className={css.reportPreview}>
      <div className={css.reportCard}>
        <p className={css.reportBrand}>{report.brand}</p>
        <p className={css.reportTitle}>{report.title}</p>
        <ul className={css.reportSections}>
          {["BEFORE REPAIR", "DIAGNOSIS", "ROOT CAUSE", "REPAIR ACTION", "AFTER REPAIR", "FINAL VERIFICATION", "RECOMMENDATION", "EVIDENCE"].map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <dl className={css.reportPeek}>
          {before?.rows.slice(0, 6).map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>
                {r.value} <span className={css.peekProv}>{r.provenance}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className={css.fine}>Data Quality Summary: {report.quality.simulated} simulated, {report.quality.estimated} estimated fields. A real report counts measured, user-entered, manufacturer-verified and unknown fields.</p>
      </div>
      <div className={css.reportActions}>
        <button
          type="button"
          className={css.primaryButton}
          onClick={() => {
            setOpen(true);
            trackToolkit("report_preview_opened", { context: "simulation" });
          }}
        >
          <FileText size={16} aria-hidden="true" /> Open sample report
        </button>
        <button
          type="button"
          className={css.secondary}
          onClick={() => {
            setOpen(true);
            trackToolkit("report_preview_opened", { context: "simulation" });
            setTimeout(print, 50);
          }}
        >
          <Printer size={16} aria-hidden="true" /> Print / Save as PDF
        </button>
        <p className={css.fine}>Print-ready layout: use your browser&apos;s print dialog and choose “Save as PDF”.</p>
      </div>
      {open ? <ReportDialog report={report} onClose={close} onPrint={print} /> : null}
    </div>
  );
}
