"use client";
import { useState } from "react";
import { CURRICULUM, CURRICULUM_NOTE, CURRICULUM_TOTALS, HIGH_POWER_NOTE, POC_STAGES, PRODUCT } from "@/lib/wireless-charging/content";
import ui from "../twin.module.css";

export default function WorkshopSection() {
  const [open, setOpen] = useState(1);
  return (
    <div className={ui.labBody}>
      <header className={ui.labHead}>
        <p className={ui.eyebrow}>Practical Workshop</p>
        <h2>{PRODUCT.programme}</h2>
        <p>{`${CURRICULUM_TOTALS.weeks} weeks · ${CURRICULUM_TOTALS.units} learning and experimental units · about ${CURRICULUM_TOTALS.hours} hours, with a deliverable every month. ${CURRICULUM_NOTE}`}</p>
      </header>
      <ol className={ui.months}>
        {CURRICULUM.map((m) => (
          <li key={m.month} data-open={open === m.month || undefined}>
            <button type="button" aria-expanded={open === m.month} onClick={() => setOpen(open === m.month ? 0 : m.month)}>
              <span className={ui.envNumber}>{`Month ${m.month}`}</span>
              <strong>{m.title}</strong>
              <span>{`Weeks ${m.weeks[0].week}–${m.weeks[m.weeks.length - 1].week}`}</span>
            </button>
            {open === m.month && (
              <div className={ui.monthBody}>
                <table className={ui.table}>
                  <thead>
                    <tr>
                      <th scope="col">Week</th>
                      <th scope="col">Theme</th>
                      <th scope="col">Learning unit</th>
                      <th scope="col">Experimental unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.weeks.map((w) => (
                      <tr key={w.week}>
                        <th scope="row">{w.week}</th>
                        <td>{w.theme}</td>
                        <td>{`${w.units[0].code} · ${w.units[0].title} (${w.units[0].hours} h)`}</td>
                        <td>{`${w.units[1].code} · ${w.units[1].title} (${w.units[1].hours} h)`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={ui.deliverable}>
                  <strong>Deliverable</strong> {m.deliverable}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>
      <section className={ui.labBlock} aria-labelledby="poc-title">
        <h3 id="poc-title">Physical proof of concept</h3>
        <p className={ui.warning}>{HIGH_POWER_NOTE}</p>
        <div className={ui.pocGrid}>
          {POC_STAGES.map((p) => (
            <article key={p.id} className={ui.poc}>
              <p className={ui.eyebrow}>{p.id}</p>
              <h4>{p.title}</h4>
              <p>{p.goal}</p>
              <dl className={ui.facts}>
                <div><dt>Architecture</dt><dd>{p.architecture}</dd></div>
                <div><dt>Interfaces</dt><dd>{p.interfaces.join("; ")}</dd></div>
                <div><dt>Preliminary BOM categories</dt><dd>{p.bom.join("; ")}</dd></div>
                <div><dt>Instrumentation</dt><dd>{p.instrumentation.join("; ")}</dd></div>
                <div><dt>Test plan</dt><dd>{p.tests.join("; ")}</dd></div>
                <div><dt>Safety requirements</dt><dd>{p.safety.join("; ")}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
