// Modules 8–12: detecting and isolating faults, forecasting health, the lab
// where it all runs, the platform it would run on, and the 12-week assignment.
import { APIS, CTO_HEADING, CTO_INTRO, CTO_QUESTIONS, CYBER_ATTACKS, CYBER_CHALLENGE, CYBER_CONTROLS, CYBER_HEADING, CYBER_INTRO, DATA_ARCHITECTURE, DIGITAL_THREAD, DIGITAL_THREAD_INTRO, NORTH_STAR } from "../data/architecture";
import { CHECKPOINT_BY_MODULE } from "../data/checkpoints";
import { ACCEPTANCE, COURSE_INTRO, FINAL_DELIVERABLE, PROGNOSTICS_DEFINITION, PROGNOSTICS_LIMIT, PROGNOSTIC_TERMS, READINESS_INTRO } from "../data/course";
import { CHALLENGE_CASES, DETECTION_METHODS, FAULT_LIBRARY, FAULT_LIBRARY_HEADING, FAULT_TREE, FDIR_DEFINITION, RCA_INTRO, RCA_STEPS, SENSOR_VS_ENGINE } from "../data/fdir";
import { MODULE_BY_ID, PRINCIPLE, VALUE_NOTE } from "../data/product";
import { DIAGNOSES } from "../simulation/isolation";
import Checkpoint from "../ui/Checkpoint";
import LiveSlot from "../ui/LiveSlot";
import ModulePanel from "../ui/ModulePanel";
import Picker from "../ui/Picker";
import { Block, Callout, Chain, Rows, Tag, Terms } from "../ui/primitives";
import { InjectInLab } from "../widgets/actions";
import FaultTree from "../widgets/FaultTree";
import KnowledgeGraph from "../widgets/KnowledgeGraph";
import ReadinessScore from "../widgets/ReadinessScore";
import WeekTracker from "../widgets/WeekTracker";
import css from "../advancedTwin.module.css";

const INJECTABLE = DIAGNOSES.filter((d) => d.id !== "nominal");

export function FdirModule() {
  return (
    <ModulePanel id="fdir">
      <Block title="What FDIR is">
        <p className={css.definition}>{FDIR_DEFINITION}</p>
      </Block>

      <Block title="Fault detection methods" intro="Fault detection decides that behaviour is no longer nominal. There are several ways to decide, each with strengths, limitations and its own kind of false alarm.">
        <LiveSlot widget="detectors" module="fdir">
          <p>Seven detectors running side by side on the same simulated telemetry, each showing its statistic against its own threshold and, after a fault is injected, how many seconds it took to raise an alarm.</p>
        </LiveSlot>
        <Picker
          label="Fault detection methods"
          items={DETECTION_METHODS.map((method) => ({
            id: method.id,
            label: method.name,
            panel: (
              <>
                <p className={css.panelTitle}>{method.name}</p>
                <p>{method.how}</p>
                <Rows
                  rows={[
                    { label: "Strengths", value: method.strengths },
                    { label: "Limitations", value: method.limitations },
                    { label: "False alarms", value: method.falseAlarms },
                    { label: "On this page", value: method.here },
                  ]}
                />
              </>
            ),
          }))}
        />
      </Block>

      <Block title={SENSOR_VS_ENGINE.heading}>
        <p className={css.definition}>{SENSOR_VS_ENGINE.definition}</p>
        <LiveSlot widget="sensorChallenge" module="fdir">
          <p>
            {SENSOR_VS_ENGINE.scenario} {SENSOR_VS_ENGINE.question} The challenge shows chamber pressure sensors A and B, pump discharge pressure, propellant flow, shaft speed, valve position, a thrust proxy and the physics prediction, asks for an answer, and then gives the diagnosis.
          </p>
          {CHALLENGE_CASES.map((item) => (
            <p key={item.id}>
              <strong>{item.verdict}</strong> {item.reasoning}
            </p>
          ))}
        </LiveSlot>
      </Block>

      <Block title="Fault isolation">
        <p className={css.definition}>{FAULT_TREE.intro}</p>
        <FaultTree />
      </Block>

      <Block title="Root-cause analysis workbench">
        <p className={css.definition}>{RCA_INTRO}</p>
        <LiveSlot widget="rcaWorkbench" module="fdir">
          <ol className={css.bullets}>
            {RCA_STEPS.map((step) => (
              <li key={step.id}>
                <strong>{step.label}.</strong> {step.text}
              </li>
            ))}
          </ol>
        </LiveSlot>
      </Block>

      <Block title={FAULT_LIBRARY_HEADING} intro="A fault library catalogues credible fault classes with the signature each would leave in the data. This one is organised by where the fault lives. It is a teaching catalogue, not a list of every possible failure.">
        <div className={css.sensorList}>
          {FAULT_LIBRARY.map((group) => (
            <details key={group.id} className={css.details}>
              <summary>
                <span className={css.detailsTitle}>{group.name}</span>
                <span className={css.detailsMeta}>{group.faults.length} fault classes</span>
              </summary>
              <ul className={css.faultList}>
                {group.faults.map((fault) => (
                  <li key={fault.name}>
                    <strong>{fault.name}</strong>
                    <span>{fault.signature}</span>
                    {fault.lab && <InjectInLab fault={fault.lab}>Demonstrate in the Lab</InjectInLab>}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.fdir!} />
    </ModulePanel>
  );
}

export function HealthModule() {
  return (
    <ModulePanel id="health">
      <Block title="From “something is wrong” to “how is it evolving?”">
        <p className={css.definition}>{PROGNOSTICS_DEFINITION}</p>
      </Block>

      <Block title="Live outlook" tag="SIMULATED" intro="The outlook follows whichever inferred parameter has used most of its action limit, and projects the quantity that parameter threatens.">
        <LiveSlot widget="prognostics" module="health">
          <p>A chart of the quantity of concern, chamber pressure, coolant temperature rise or pump suction margin, with its estimate, a projection sixty seconds ahead, a ±2σ band that widens with the horizon and the limit. Beside it: health index, remaining margin, probability of crossing the limit and time to the limit with its range, the degradation rate with its error, a recommendation to consider, and the share of each inferred health parameter&apos;s action limit that has been used.</p>
        </LiveSlot>
        <Callout kind="caution">{PROGNOSTICS_LIMIT}</Callout>
      </Block>

      <Block title="The vocabulary of prognostics">
        <Terms items={PROGNOSTIC_TERMS.map((t) => ({ id: t.id, term: t.term, text: t.text }))} columns={3} />
      </Block>

      <Block title="Digital Twin readiness score">
        <p className={css.definition}>{READINESS_INTRO}</p>
        <ReadinessScore />
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.health!} />
    </ModulePanel>
  );
}

export function LabModule() {
  return (
    <ModulePanel id="lab">
      <Block title="Engine control room and fault injection lab" tag="SIMULATED" intro="The control room runs the simulated engine and its Digital Twin together. Inject a fault and watch it travel: physical effect, sensor response, residual, detection, isolation, confidence, prediction and a recommended engineering investigation.">
        <LiveSlot widget="controlRoom" module="lab">
          <p>
            Status across the top: engine state, twin state, data quality, model confidence, health and anomalies. Eight charts: chamber pressure in its observed, estimated, expected and predicted states, pump discharge pressure, pump inlet pressure, injector ΔP, cooling ΔP, shaft speed, coolant temperature and vibration. Controls: live simulation, pause, inject fault, reset and compare, with throttle, simulation speed, start and shutdown. Below: the fault injection lab, the chain from physical effect to recommended investigation, the diagnosis with its evidence, and the fault history.
          </p>
        </LiveSlot>
        <p className={css.note}>{VALUE_NOTE}</p>
      </Block>

      <Block title="Faults you can inject" intro="Eleven educational faults: six in the physical system, two in sensors and three in the data path. Each changes the simulated system or its telemetry; the twin is never told which.">
        <div className={css.tableWrap} role="region" aria-label="Injectable faults" tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">Fault</th>
                <th scope="col">Where</th>
                <th scope="col">Physical effect</th>
                <th scope="col">Recommended engineering investigation</th>
              </tr>
            </thead>
            <tbody>
              {INJECTABLE.map((d) => (
                <tr key={d.id}>
                  <th scope="row">
                    {d.name}
                    <Tag>{d.cls.toUpperCase()}</Tag>
                  </th>
                  <td>{d.location}</td>
                  <td>{d.effect}</td>
                  <td>{d.investigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="What the lab is showing you">
        <ul className={css.principle} aria-label="The principle behind the twin">
          {PRINCIPLE.map((line) => (
            <li key={line.source}>
              <strong>{line.source}</strong> {line.says}
            </li>
          ))}
        </ul>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.lab!} />
    </ModulePanel>
  );
}

export function ArchitectureModule() {
  return (
    <ModulePanel id="architecture">
      <Block id="cto" title={CTO_HEADING} intro={CTO_INTRO}>
        <div className={css.sensorList}>
          {CTO_QUESTIONS.map((item, i) => (
            <details key={item.id} className={css.details} open={i === 0}>
              <summary>
                <span className={css.detailsTitle}>{item.q}</span>
              </summary>
              <p>{item.a}</p>
              <ul className={css.bullets}>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </Block>

      <Block title="North-star architecture" intro="The north-star architecture is the complete flow of a propulsion Digital Twin, from the physical system to validated decision support.">
        <ol className={css.northStar} aria-label="North-star architecture, top to bottom">
          {NORTH_STAR.map((row, i) => (
            <li key={i} data-parallel={typeof row === "string" ? undefined : ""}>
              {typeof row === "string" ? (
                row
              ) : (
                <ul>
                  {row.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Block>

      <Block title="Data architecture" intro="A Digital Twin data architecture separates acquisition at the edge, transport, storage, stateless model services and the state store that holds each asset's estimated condition, with APIs as the only way in or out.">
        <div className={css.layersStack}>
          {DATA_ARCHITECTURE.map((layer) => (
            <div key={layer.id} className={css.layerRow}>
              <h4 className={css.cardTitle}>{layer.layer}</h4>
              <p>{layer.role}</p>
              <ul className={css.chips}>
                {layer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={css.tableWrap} role="region" aria-label="Conceptual APIs" tabIndex={0} data-lens="engineer architect">
          <table className={css.table}>
            <caption className={css.caption}>Conceptual APIs. Paths illustrate the shape of each interface; they are not a published specification.</caption>
            <thead>
              <tr>
                <th scope="col">API</th>
                <th scope="col">Purpose</th>
                <th scope="col">Example</th>
                <th scope="col">Returns</th>
              </tr>
            </thead>
            <tbody>
              {APIS.map((api) => (
                <tr key={api.id}>
                  <th scope="row">{api.name}</th>
                  <td>{api.purpose}</td>
                  <td>
                    <code className={css.code}>{api.example}</code>
                  </td>
                  <td>{api.returns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="The digital thread">
        <p className={css.definition}>{DIGITAL_THREAD_INTRO}</p>
        <ol className={css.thread}>
          {DIGITAL_THREAD.map((stage) => (
            <li key={stage.id} data-twin={stage.id === "twin" || undefined}>
              <strong>{stage.stage}</strong>
              <span>{stage.gives}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block title={CYBER_HEADING}>
        <p className={css.definition}>{CYBER_INTRO}</p>
        <Terms items={CYBER_CONTROLS.map((c) => ({ id: c.id, term: c.name, text: c.text }))} columns={4} />
        <div className={css.tableWrap} role="region" aria-label="Digital Twin-specific attacks" tabIndex={0}>
          <table className={css.table}>
            <caption className={css.caption}>Attacks specific to a Digital Twin</caption>
            <thead>
              <tr>
                <th scope="col">Attack</th>
                <th scope="col">Effect on the twin</th>
                <th scope="col">Defence</th>
              </tr>
            </thead>
            <tbody>
              {CYBER_ATTACKS.map((attack) => (
                <tr key={attack.id}>
                  <th scope="row">{attack.name}</th>
                  <td>{attack.effect}</td>
                  <td>{attack.defence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4 className={css.h4}>{CYBER_CHALLENGE.question}</h4>
        <p className={css.prose}>{CYBER_CHALLENGE.text}</p>
        <div className={css.tableWrap} role="region" aria-label="Engine anomaly or cyber-induced data anomaly" tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">Ask</th>
                <th scope="col">Engine anomaly</th>
                <th scope="col">Cyber-induced data anomaly</th>
              </tr>
            </thead>
            <tbody>
              {CYBER_CHALLENGE.tests.map((test) => (
                <tr key={test.check}>
                  <th scope="row">{test.check}</th>
                  <td>{test.engine}</td>
                  <td>{test.cyber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={css.prose}>{CYBER_CHALLENGE.lab}</p>
        <InjectInLab fault="telemetry_replay">Inject replayed telemetry in the Lab</InjectInLab>
      </Block>

      <Block title="Knowledge graph" intro="A Digital Twin knowledge graph records how components, sensors, measurements, failure modes, models, requirements and test evidence relate, so that any one of them can be traced to all the others. Start from the chamber pressure sensor and discover everything connected to it.">
        <KnowledgeGraph />
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.architecture!} />
    </ModulePanel>
  );
}

export function WeeksModule() {
  return (
    <ModulePanel id="weeks">
      <Block title="Four phases, twelve weeks, four reviews">
        <p className={css.definition}>{COURSE_INTRO}</p>
        <WeekTracker />
      </Block>

      <Block title="Final deliverable" intro="At the end of twelve weeks the learner demonstrates the whole chain, in order.">
        <Chain items={FINAL_DELIVERABLE} label="What the learner must be able to demonstrate" vertical />
      </Block>

      <Block title="Acceptance criteria" intro="An initial Digital Twin should demonstrate each of the following. Each links to the module of this tutorial that demonstrates it.">
        <ul className={css.acceptance}>
          {ACCEPTANCE.map((item) => (
            <li key={item.item}>
              <span>{item.item}</span>
              <a href={`#${item.module}`} className={css.textLink}>
                {MODULE_BY_ID[item.module].label} <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </Block>
    </ModulePanel>
  );
}
