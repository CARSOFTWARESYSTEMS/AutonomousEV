"use client";
// Practical Workshop: the eight-month programme as a journey. One month is in
// focus at a time — its deliverable and four weeks of paired learning and
// build units — and the six low-voltage proof-of-concept stages form a
// ladder, each with an animated architecture flow; the engineering detail
// (interfaces, bill of materials, instruments, tests, safety) opens on request.
import { useState } from "react";
import { BookOpen, FlaskConical, ShieldCheck, Wrench } from "lucide-react";
import { CURRICULUM, CURRICULUM_NOTE, CURRICULUM_TOTALS, HIGH_POWER_NOTE, POC_STAGES, PRODUCT } from "@/lib/wireless-charging/content";
import { Disclosure, ExpandScope, Kicker, SectionHero } from "../ui/Section";
import ui from "../twin.module.css";
import w from "./workshop.module.css";

/** The architecture string as a chain: "→" wired, "⇢" wireless; "+" joins parts on one bus. */
function flowOf(architecture: string): { parts: string[]; links: ("wire" | "wireless" | "bus")[] } {
  const text = architecture.replace(/\.$/, "");
  if (!/[→⇢]/.test(text)) {
    const parts = text.split(/\s*\+\s*/);
    return { parts, links: parts.slice(1).map(() => "bus") };
  }
  const parts: string[] = [];
  const links: ("wire" | "wireless")[] = [];
  const re = /\s*(→|⇢)\s*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    parts.push(text.slice(last, m.index));
    links.push(m[1] === "⇢" ? "wireless" : "wire");
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return { parts, links };
}

function Flow({ architecture }: { architecture: string }) {
  const f = flowOf(architecture);
  return (
    <ol className={w.flow} aria-label="Architecture">
      {f.parts.map((p, i) => (
        <li key={i}>
          {i > 0 && <span className={w.link} data-kind={f.links[i - 1]} aria-label={f.links[i - 1] === "wireless" ? "wireless link" : f.links[i - 1] === "bus" ? "and" : "to"} />}
          <span className={w.node}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function WorkshopSection() {
  const [month, setMonth] = useState(1);
  const [poc, setPoc] = useState(0);
  const m = CURRICULUM[month - 1];
  const p = POC_STAGES[poc];
  return (
    <ExpandScope>
      <div className={ui.labBody}>
        <SectionHero
          eyebrow="Practical Workshop"
          title="Eight months from first principles to a working twin"
          lede="Every week pairs a learning unit with a build or measurement unit. Each month ends in a deliverable; six low-voltage proofs of concept carry the work into hardware."
          stats={[
            { value: String(CURRICULUM_TOTALS.weeks), label: "Weeks" },
            { value: String(CURRICULUM_TOTALS.units), label: "Units" },
            { value: `~${CURRICULUM_TOTALS.hours}`, label: "Hours" },
            { value: String(POC_STAGES.length), label: "Prototypes" },
          ]}
        >
          <p className={w.programme}>{PRODUCT.programme}</p>
        </SectionHero>

        {/* ── The journey ── */}
        <section className={w.journey} aria-labelledby="journey-title">
          <Kicker>
            <span id="journey-title">The programme, month by month</span>
          </Kicker>
          <div className={w.rail} role="tablist" aria-label="Months">
            <span className={w.railTrack} aria-hidden="true">
              <span className={w.railFill} style={{ transform: `scaleX(${(month - 1) / (CURRICULUM.length - 1)})` }} />
            </span>
            {CURRICULUM.map((c) => (
              <button
                key={c.month}
                type="button"
                role="tab"
                aria-selected={c.month === month}
                data-done={c.month < month || undefined}
                onClick={() => setMonth(c.month)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") setMonth(Math.min(CURRICULUM.length, month + 1));
                  if (e.key === "ArrowLeft") setMonth(Math.max(1, month - 1));
                }}
                tabIndex={c.month === month ? 0 : -1}
              >
                <span className={w.dot} aria-hidden="true" />
                <span className={w.railMonth}>{`M${c.month}`}</span>
                <span className={w.railTitle}>{c.title}</span>
              </button>
            ))}
          </div>

          <div className={w.month} role="tabpanel" aria-label={`Month ${m.month}: ${m.title}`} key={m.month}>
            <div className={w.monthLead}>
              <p className={w.monthNo}>{`Month ${m.month}`}</p>
              <h3 className={w.monthTitle}>{m.title}</h3>
              <p className={w.weeks}>{`Weeks ${m.weeks[0].week}–${m.weeks[m.weeks.length - 1].week} · ${m.weeks.reduce((s, x) => s + x.units[0].hours + x.units[1].hours, 0)} hours`}</p>
              <div className={w.deliverable}>
                <span>Deliverable</span>
                <p>{m.deliverable}</p>
              </div>
              <div className={w.stepper}>
                <button type="button" onClick={() => setMonth(Math.max(1, month - 1))} disabled={month === 1}>
                  Previous month
                </button>
                <button type="button" onClick={() => setMonth(Math.min(CURRICULUM.length, month + 1))} disabled={month === CURRICULUM.length}>
                  Next month
                </button>
              </div>
            </div>
            <ol className={w.weekGrid}>
              {m.weeks.map((wk) => (
                <li key={wk.week} className={w.week}>
                  <p className={w.weekNo}>{`Week ${wk.week}`}</p>
                  <h4>{wk.theme}</h4>
                  <div className={w.unit}>
                    <BookOpen size={15} aria-hidden="true" />
                    <p>
                      <strong>{`${wk.units[0].code} · Learn`}</strong>
                      {wk.units[0].title}
                    </p>
                    <span>{`${wk.units[0].hours} h`}</span>
                  </div>
                  <div className={w.unit}>
                    <Wrench size={15} aria-hidden="true" />
                    <p>
                      <strong>{`${wk.units[1].code} · Build`}</strong>
                      {wk.units[1].title}
                    </p>
                    <span>{`${wk.units[1].hours} h`}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Proof of concept ── */}
        <section className={w.pocSection} aria-labelledby="poc-title">
          <Kicker>
            <span id="poc-title">Physical proof of concept · six low-voltage stages</span>
          </Kicker>
          <div className={w.ladder} role="tablist" aria-label="Proof-of-concept stages">
            {POC_STAGES.map((s, i) => (
              <button key={s.id} type="button" role="tab" aria-selected={i === poc} onClick={() => setPoc(i)} tabIndex={i === poc ? 0 : -1} onKeyDown={(e) => {
                if (e.key === "ArrowRight") setPoc(Math.min(POC_STAGES.length - 1, poc + 1));
                if (e.key === "ArrowLeft") setPoc(Math.max(0, poc - 1));
              }}>
                <span className={w.ladderNo}>{s.id.replace("POC ", "")}</span>
                <span className={w.ladderTitle}>{s.title}</span>
              </button>
            ))}
          </div>
          <article className={w.poc} role="tabpanel" aria-label={`${p.id}: ${p.title}`} key={p.id}>
            <header>
              <p className={w.pocId}>{p.id}</p>
              <h3>{p.title}</h3>
              <p className={w.goal}>{p.goal}</p>
            </header>
            <Flow architecture={p.architecture} />
            <div className={w.chips}>
              <div>
                <p>Interfaces</p>
                <ul>
                  {p.interfaces.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p>Instruments</p>
                <ul>
                  {p.instrumentation.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={w.pocDetail}>
              <Disclosure title="Test plan" summary={`${p.tests.length} tests`} icon={<FlaskConical size={18} />}>
                <ul className={w.list}>
                  {p.tests.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure title="Preliminary bill of materials" summary={`${p.bom.length} categories`} icon={<Wrench size={18} />}>
                <ul className={w.list}>
                  {p.bom.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure title="Safety requirements" summary="Isolated, current-limited low voltage, supervised" icon={<ShieldCheck size={18} />} tone="warning">
                <ul className={w.list}>
                  {p.safety.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Disclosure>
            </div>
          </article>
          <p className={w.note}>{HIGH_POWER_NOTE}</p>
          <p className={w.note}>{CURRICULUM_NOTE}</p>
        </section>
      </div>
    </ExpandScope>
  );
}
