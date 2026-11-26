"use client";
// Engineering Assurance: the verification suite run in this browser, review
// gates, traceability, registries, standards, risks and feature status.
import { useState } from "react";
import { Play } from "lucide-react";
import { CHECKS, runChecks } from "@/lib/wireless-charging/benchmarks";
import { COMPONENTS } from "@/lib/wireless-charging/components";
import { GATES, RISKS, STANDARDS } from "@/lib/wireless-charging/content";
import { FEATURE_COUNTS, FEATURES } from "@/lib/wireless-charging/coverage";
import { FIDELITY, MODELS } from "@/lib/wireless-charging/registry";
import { fmt } from "../ui/controls";
import { Disclosure, ExpandScope, SectionHero, ShowMore } from "../ui/Section";
import ui from "../twin.module.css";

type Result = ReturnType<typeof runChecks>[number] & { at: string };

export default function AssuranceSection() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState<string | null>(null);
  const runAll = async () => {
    for (const c of CHECKS) {
      setRunning(c.id);
      // Yield between checks so the page stays responsive.
      const r = await new Promise<Result>((resolve) => window.setTimeout(() => resolve({ ...runChecks([c.id])[0], at: new Date().toISOString() }), 10));
      setResults((x) => ({ ...x, [c.id]: r }));
    }
    setRunning(null);
  };
  const ran = Object.values(results);
  const passed = ran.filter((r) => r.passed).length;
  return (
    <ExpandScope>
    <div className={ui.labBody}>
      <SectionHero
        eyebrow="Engineering Assurance"
        title="Evidence, not claims"
        lede="Every check states its expected result and runs the real engine here, in your browser. Nothing is shown as passed until it has run and passed."
        stats={[
          { value: String(CHECKS.length), label: "Checks" },
          { value: ran.length ? `${passed}/${ran.length}` : "—", label: "Passed here" },
          { value: String(MODELS.length), label: "Models" },
          { value: String(COMPONENTS.length), label: "Components" },
        ]}
      />
      <section className={ui.labBlock} aria-labelledby="vv-title">
        <h3 id="vv-title">Verification suite</h3>
        <div className={ui.runBar}>
          <button type="button" onClick={runAll} disabled={running !== null}>
            <Play size={14} aria-hidden="true" /> {running ? `Running ${running}…` : `Run all ${CHECKS.length} checks`}
          </button>
          <span role="status">{ran.length ? `${passed} of ${ran.length} run passed${ran.length < CHECKS.length ? ` (${CHECKS.length - ran.length} not yet run)` : ""}.` : "Not run in this session."}</span>
        </div>
        <div className={ui.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${ran.length / CHECKS.length})` }} data-fail={ran.some((r) => !r.passed) || undefined} />
        </div>
        <ShowMore
          items={CHECKS}
          initial={6}
          noun="checks"
          className={ui.checkList}
          render={(c) => {
            const r = results[c.id];
            return (
              <Disclosure
                key={c.id}
                title={`${c.id} · ${c.title}`}
                summary={`${c.kind} · ${c.models.join(", ")}`}
                meta={<span className={ui.result} data-result={r ? (r.passed ? "pass" : "fail") : running === c.id ? "running" : undefined}>{r ? (r.passed ? "Passed" : "Failed") : running === c.id ? "Running" : "Not run"}</span>}
              >
                <dl className={ui.facts}>
                  <div><dt>Expected</dt><dd>{c.expected}</dd></div>
                  <div><dt>Measured here</dt><dd>{r ? `${r.measured} (${fmt(r.ms, 0)} ms)` : "Run the check to measure it in this browser."}</dd></div>
                </dl>
              </Disclosure>
            );
          }}
        />
      </section>
      <Disclosure title="Review gates" summary={`${GATES.length} gates · ${GATES.filter((g) => g.status !== "Not started").length} begun · none approved`}>
        <div className={ui.gates}>
          {GATES.map((g) => (
            <article key={g.id} className={ui.gate} data-status={g.status}>
              <p className={ui.eyebrow}>{g.id}</p>
              <h4>{g.name}</h4>
              <p className={ui.gateStatus}>{g.status}</p>
              <p>{g.purpose}</p>
              <dl className={ui.facts}>
                <div><dt>Criteria</dt><dd>{g.criteria.join("; ")}</dd></div>
                <div><dt>Evidence</dt><dd>{g.evidence.join("; ") || "None yet"}</dd></div>
                <div><dt>Outstanding</dt><dd>{g.open.join("; ")}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </Disclosure>
      <Disclosure title="Traceability" summary="Requirement → model → implementation → test → evidence → validation">
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Requirement (benchmark)</th>
                <th scope="col">Models</th>
                <th scope="col">Implementation</th>
                <th scope="col">Evidence</th>
                <th scope="col">Validation</th>
              </tr>
            </thead>
            <tbody>
              {CHECKS.filter((c) => c.kind === "benchmark").map((c) => (
                <tr key={c.id}>
                  <th scope="row">{`${c.id} · ${c.title}`}</th>
                  <td>{c.models.join(", ")}</td>
                  <td className={ui.mono}>{c.models.map((m) => MODELS.find((x) => x.id === m)?.implementation.split(" · ")[0]).filter(Boolean).join(", ")}</td>
                  <td>{results[c.id] ? (results[c.id].passed ? "Check passed in this browser" : "Check failed in this browser") : "Unit test in the repository; run here to see it"}</td>
                  <td>Not experimentally validated</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Disclosure>
      <Disclosure title="Model registry" summary={`${MODELS.length} models · fidelity, status, assumptions, limitations and checks`}>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">Fidelity</th>
                <th scope="col">Status</th>
                <th scope="col">Assumptions</th>
                <th scope="col">Limitations</th>
                <th scope="col">Checks</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id}>
                  <th scope="row">
                    {`${m.id} · ${m.name}`}
                    <small>{`v${m.version} · ${m.domain}`}</small>
                  </th>
                  <td>{`${m.fidelity} ${FIDELITY[m.fidelity].name}`}</td>
                  <td>{m.status}</td>
                  <td>{m.assumptions.join(" ")}</td>
                  <td>{m.limitations.join(" ")}</td>
                  <td>{m.tests.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Disclosure>
      <Disclosure title="Standards and requirements registry" summary={`${STANDARDS.length} standards for awareness · no compliance or certification is claimed`}>
          <ul className={ui.standards}>
            {STANDARDS.map((s) => (
              <li key={s.id}>
                <strong>{s.id}</strong> <span>{s.title}</span>
                <small>{`${s.area}. ${s.relevance} ${s.status}`}</small>
              </li>
            ))}
          </ul>
      </Disclosure>
      <Disclosure title="Risk register" summary={`${RISKS.length} risks with their effect and mitigation`}>
          <ul className={ui.standards}>
            {RISKS.map((r) => (
              <li key={r.risk}>
                <strong>{r.risk}</strong>
                <small>{`Effect: ${r.effect}. Mitigation: ${r.mitigation}.`}</small>
              </li>
            ))}
          </ul>
      </Disclosure>
      <Disclosure title="Feature status" summary={Object.entries(FEATURE_COUNTS).map(([k, v]) => `${k}: ${v}`).join(" · ")}>
        <p className={ui.small}>{Object.entries(FEATURE_COUNTS).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Feature</th>
                <th scope="col">Status</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((x) => (
                <tr key={`${x.area}-${x.feature}`} data-status={x.status}>
                  <td>{x.area}</td>
                  <th scope="row">{x.feature}</th>
                  <td>{x.status}</td>
                  <td>{x.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Disclosure>
    </div>
    </ExpandScope>
  );
}
