"use client";
// The Battery Diagnostic Report, as a document: on screen in a dialog and, via
// the browser's print dialog, as a PDF. No PDF library: print CSS does it.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { QUALITY_LABELS } from "@/lib/ev-battery-toolkit/report";
import type { Report } from "@/lib/ev-battery-toolkit/types";
import { ContextBanner, ProvenanceBadge } from "../ui/Badges";
import css from "../report.module.css";

function formatGenerated(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "—" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

export function ReportDocument({ report }: { report: Report }) {
  const when = formatGenerated(report.generatedAt);
  return (
    <article className={css.doc} aria-label={report.title}>
      <header className={css.docHead}>
        <p className={css.docBrand}>{report.brand}</p>
        <h2 className={css.docTitle}>{report.title}</h2>
        <ContextBanner context={report.context} />
        <dl className={css.docMeta}>
          <div>
            <dt>Job ID</dt>
            <dd>{report.jobId}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{when.date}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{when.time}</dd>
          </div>
        </dl>
      </header>

      <table className={css.docTable}>
        <caption>Vehicle and battery</caption>
        <tbody>
          {report.header.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{r.value}</td>
              <td>
                <ProvenanceBadge provenance={r.provenance} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {report.sections.map((section) => (
        <section key={section.id} className={css.docSection} aria-label={section.title}>
          <h3 className={css.docH3}>{section.title}</h3>
          {section.rows.length ? (
            <table className={css.docTable}>
              <tbody>
                {section.rows.map((r, i) => (
                  <tr key={`${r.label}-${i}`}>
                    <th scope="row">{r.label}</th>
                    <td>{r.value}</td>
                    <td>
                      <ProvenanceBadge provenance={r.provenance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {section.text?.map((t, i) => (
            <p key={i} className={css.docText}>
              {t}
            </p>
          ))}
        </section>
      ))}

      <section className={css.docSection} aria-label="Data Quality Summary">
        <h3 className={css.docH3}>DATA QUALITY SUMMARY</h3>
        <dl className={css.quality}>
          {QUALITY_LABELS.map((q) => (
            <div key={q.key}>
              <dt>{q.label}</dt>
              <dd>{report.quality[q.key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <dl className={css.docFinal}>
        <div>
          <dt>Final Health Status</dt>
          <dd>{report.finalHealth}</dd>
        </div>
        <div>
          <dt>Safety Status</dt>
          <dd>{report.safetyStatus}</dd>
        </div>
      </dl>
      <footer className={css.docFooter}>{report.footer}</footer>
    </article>
  );
}

const PRINT_FLAG = "data-ebt-print";

/** Prints only the report: the page is hidden by print CSS while the flag is set. */
export function printReport() {
  const root = document.documentElement;
  root.setAttribute(PRINT_FLAG, "");
  // The dialog locks scrolling with overflow:hidden on <body>; some browsers clip a multi-page print to it.
  // The site's dark page background would also print when "Background graphics" is on.
  const saved = { overflow: document.body.style.overflow, body: document.body.style.background, root: root.style.background };
  document.body.style.overflow = "visible";
  document.body.style.background = "#fff";
  root.style.background = "#fff";
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    root.removeAttribute(PRINT_FLAG);
    document.body.style.overflow = saved.overflow;
    document.body.style.background = saved.body;
    root.style.background = saved.root;
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
  // Some browsers print synchronously and never fire afterprint.
  setTimeout(done, 1000);
}

export function ReportDialog({ report, onClose, onPrint }: { report: Report; onClose: () => void; onPrint: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    // data-track-manual: the dialog sits outside the page root, so it opts out of the site-wide click tracking itself.
    <div className={css.overlay} role="dialog" aria-modal="true" aria-label={report.title} data-track-manual="">
      <div className={css.dialog}>
        <div className={css.dialogBar}>
          <p>{report.context === "real" ? "Report preview" : "Sample report preview"}</p>
          <div className={css.dialogActions}>
            <button type="button" className={css.barButton} onClick={onPrint}>
              <Printer size={16} aria-hidden="true" /> Print / Save as PDF
            </button>
            <button type="button" className={css.barButton} onClick={onClose} ref={closeRef} aria-label="Close report preview">
              <X size={16} aria-hidden="true" /> Close
            </button>
          </div>
        </div>
        <ReportDocument report={report} />
      </div>
    </div>,
    document.body,
  );
}
