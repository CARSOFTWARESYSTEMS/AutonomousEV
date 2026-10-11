// Modules 1–4: what a propulsion Digital Twin is, the system it is a twin of,
// the pressure that runs through it, and the physics that says what that
// pressure should be. Server components: every word is in the page's HTML.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { advancedTwinLinkTracking } from "../analytics";
import { CHECKPOINT_BY_MODULE } from "../data/checkpoints";
import { FIDELITY_CHAIN, FIDELITY_INTRO, FIDELITY_LEVELS, PHYSICS_CONCEPTS, PHYSICS_INTRO, THIS_MODEL } from "../data/physics";
import { DELTA_PS, DELTA_P_CONCEPT, PRESSURE_QUESTIONS, PRESSURE_SENSORS, PRESSURE_UNIT, PRESSURE_UNIT_NOTE, SENSOR_CLASSES, VALVE_TAPS } from "../data/pressure";
import { AUDIENCE, DISTINCTIONS, ENGINEERING_CHAIN, LEARNING_STORY, LEARNING_STORY_END, OBJECTIVES, PRINCIPLE, PRODUCT, VALUE_NOTE } from "../data/product";
import { ARCHITECTURE_STATEMENT, OPERATING_MODES, SUBSYSTEMS } from "../data/system";
import { MATURITY_HEADLINE, MATURITY_HERE, MATURITY_LEVELS, TWIN_DEFINITION } from "../data/twin";
import Checkpoint from "../ui/Checkpoint";
import LiveSlot from "../ui/LiveSlot";
import ModulePanel from "../ui/ModulePanel";
import Picker from "../ui/Picker";
import { Block, Callout, Chain, ConceptCard, Rows, Tag, Terms } from "../ui/primitives";
import PressureMap from "../widgets/PressureMap";
import SystemExplorer from "../widgets/SystemExplorer";
import css from "../advancedTwin.module.css";

export function OverviewModule() {
  return (
    <ModulePanel id="overview">
      <Block title="What is a propulsion Digital Twin?">
        <p className={css.definition}>{TWIN_DEFINITION}</p>
        <p className={css.prose}>
          This tutorial builds one for a single purpose: <strong>{PRODUCT.focus}</strong>. Pressure is the thread. It is followed from the propellant tank to the nozzle, measured, modelled, estimated and finally used to say what is wrong with the engine and where it is heading.
        </p>
        <ul className={css.principle} aria-label="The principle behind the twin">
          {PRINCIPLE.map((line) => (
            <li key={line.source}>
              <strong>{line.source}</strong> {line.says}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="The complete engineering chain" intro="A Digital Twin is the end of a chain, and it is only as trustworthy as each link before it. The tutorial teaches the links in this order.">
        <Chain items={ENGINEERING_CHAIN} label="The engineering chain from physical system to Digital Twin" numbered />
      </Block>

      <Block title="Digital Twin maturity ladder" intro="The Digital Twin maturity ladder orders digital representations of an asset by what connects them to it, from geometry alone to a twin that supports decisions.">
        <Callout>{MATURITY_HEADLINE}</Callout>
        <Picker
          label="Digital Twin maturity levels"
          layout="ladder"
          initial="level_0"
          event="digital_twin_architecture_opened"
          items={MATURITY_LEVELS.map((level) => ({
            id: `level_${level.level}`,
            label: level.name,
            hint: level.isTwin ? "A Digital Twin" : "Not a Digital Twin",
            panel: (
              <>
                <p className={css.panelTitle}>
                  Level {level.level} — {level.name} <Tag>{level.isTwin ? "DIGITAL TWIN" : "NOT A DIGITAL TWIN"}</Tag>
                </p>
                <p>{level.what}</p>
                <Rows
                  rows={[
                    { label: "Still missing", value: level.missing },
                    { label: "Example", value: level.example },
                  ]}
                />
              </>
            ),
          }))}
        />
        <p className={css.note}>{MATURITY_HERE}</p>
      </Block>

      <Block title="Seven things to keep apart" intro="The tutorial is written so that a reader can always tell which of these they are looking at.">
        <Terms items={DISTINCTIONS.map((d) => ({ term: d.term, text: d.text }))} columns={3} />
      </Block>

      <Block title="Who this is for, and how each idea is taught">
        <p className={css.prose}>
          Written for: {AUDIENCE.roles.join(", ").toLowerCase()}. It assumes one reader in particular: {AUDIENCE.persona.charAt(0).toLowerCase() + AUDIENCE.persona.slice(1)}
        </p>
        <p className={css.prose}>Every advanced concept is therefore taught at five depths, and the Learn, Engineer and Architect switch above chooses how many are showing:</p>
        <Chain items={AUDIENCE.depth} label="The five depths at which each concept is taught" />
      </Block>

      <Block title="What you will be able to do">
        <div className={css.grid} data-columns="3">
          {OBJECTIVES.map((group) => (
            <div key={group.group} className={css.card}>
              <h4 className={css.cardTitle}>{group.group}</h4>
              <ul className={css.bullets}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>

      <Block title="The learning story">
        <ol className={css.story}>
          {LEARNING_STORY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <Callout>{LEARNING_STORY_END}</Callout>
      </Block>

      <Block title="Understand the engine first">
        <p className={css.prose}>
          This page teaches how to <strong>engineer the Digital Twin</strong>. If the engine itself is new to you, the fundamentals page teaches how to <strong>understand the engine</strong>: its systems in 3D, its flows, a simulated test and a first fault.
        </p>
        <Link href={PRODUCT.fundamentalsRoute} className={css.textLink} {...advancedTwinLinkTracking("digital_twin_architecture_opened", { view: "fundamentals_link" })}>
          {PRODUCT.fundamentalsCta} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.overview!} />
    </ModulePanel>
  );
}

export function SystemModule() {
  return (
    <ModulePanel id="system">
      <Block title="A generic liquid propulsion reference architecture" tag="REFERENCE MODEL">
        <p className={css.definition}>{ARCHITECTURE_STATEMENT}</p>
        <SystemExplorer />
      </Block>

      <Block title="The system, subsystem by subsystem" intro="For each subsystem: what it does, what is in it, what is measured, and which of its states the twin has to infer because nothing measures them.">
        <div className={css.grid} data-columns="2">
          {SUBSYSTEMS.map((s) => (
            <article key={s.id} className={css.card}>
              <h4 className={css.cardTitle}>{s.name}</h4>
              <p>{s.role}</p>
              <Rows
                rows={[
                  { label: "Contains", value: s.elements.join(" · ") },
                  { label: "Measured", value: s.measured.join(" · ") },
                  { label: "Hidden states", value: s.hidden.join(" · ") },
                ]}
              />
              <p data-lens="engineer architect" className={css.cardNote}>
                <strong>In the twin.</strong> {s.twin}
              </p>
            </article>
          ))}
        </div>
      </Block>

      <Block title="Operating modes" intro="An engine is a different system in each of its operating modes, and the twin has to know which one it is in: limits, expected values and what counts as a residual all depend on it.">
        <div className={css.tableWrap} role="region" aria-label="Operating modes" tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">Mode</th>
                <th scope="col">The engine</th>
                <th scope="col">The twin</th>
              </tr>
            </thead>
            <tbody>
              {OPERATING_MODES.map((mode) => (
                <tr key={mode.id}>
                  <th scope="row">{mode.name}</th>
                  <td>{mode.text}</td>
                  <td>{mode.twin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.system!} />
    </ModulePanel>
  );
}

export function PressureModule() {
  return (
    <ModulePanel id="pressure">
      <Block title="Interactive pressure map" intro="The pressure map shows every measured pressure in the propulsion system and traces how pressure evolves from the tank to the environment. Select any sensor to follow its measurement from the transducer to a statement about health.">
        <PressureMap />
        <p className={css.note}>
          {PRESSURE_UNIT_NOTE} {VALUE_NOTE}
        </p>
      </Block>

      <Block title="First questions about pressure" lens="learn engineer">
        <div className={css.qa}>
          {PRESSURE_QUESTIONS.map((item) => (
            <div key={item.q}>
              <h4 className={css.h4}>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Pressure-differential monitoring">
        <ConceptCard concept={DELTA_P_CONCEPT} />
        <div className={css.grid} data-columns="2">
          {DELTA_PS.map((dp) => (
            <article key={dp.id} className={css.card}>
              <h4 className={css.cardTitle}>{dp.name}</h4>
              <p className={css.formula}>{dp.formula}</p>
              <p>{dp.healthy}</p>
              <ul className={css.bullets} aria-label={`What a change in ${dp.name} may indicate`}>
                {dp.indicates.map((item) => (
                  <li key={item.change}>
                    <strong>{item.change}:</strong> {item.meaning}
                  </li>
                ))}
              </ul>
              <p data-lens="engineer architect" className={css.cardNote}>
                <strong>Instrumentation.</strong> {dp.instrumentation}
              </p>
            </article>
          ))}
        </div>
      </Block>

      <Block title="Pressure sensor architecture" intro={`Fifteen pressure sensors, placed where pressure is critical. Ranges are given as a class, never as an operating range. Reference values are in ${PRESSURE_UNIT}.`} tag="REFERENCE VALUE">
        <div className={css.sensorList}>
          {PRESSURE_SENSORS.map((s) => {
            const cls = SENSOR_CLASSES[s.cls];
            return (
              <details key={s.id} className={css.details}>
                <summary>
                  <span className={css.detailsTag}>{s.tag}</span>
                  <span className={css.detailsTitle}>{s.name}</span>
                  <span className={css.detailsMeta}>
                    {s.rangeClass} · {s.reference}
                  </span>
                </summary>
                <Rows
                  rows={[
                    { label: "Location", value: s.location },
                    { label: "Measurement", value: s.measures },
                    { label: "Purpose", value: s.purpose },
                    { label: "Engineering meaning", value: s.meaning },
                    { label: "Expected range class", value: `${s.rangeClass}. Reference value ${s.reference} ${PRESSURE_UNIT}.` },
                    { label: "Nominal trend", value: s.trend },
                    { label: "Expected physics", value: s.physics },
                    { label: "Sampling characteristics", value: cls.sampling },
                    { label: "Accuracy concept", value: cls.accuracy },
                    { label: "Redundancy concept", value: cls.redundancy },
                    { label: "Calibration", value: cls.calibration },
                    { label: "Noise", value: cls.noise },
                    { label: "Drift", value: cls.drift },
                    { label: "Bias", value: cls.bias },
                    { label: "Failure signature", value: s.failureSignature },
                    { label: "Digital Twin usage", value: s.twinUse },
                  ]}
                />
              </details>
            );
          })}
        </div>
        <p className={css.note}>
          Valve upstream and downstream pressures use sensors already listed:{" "}
          {VALVE_TAPS.map((tap) => `${tap.valve.toLowerCase()}, ${PRESSURE_SENSORS.find((s) => s.id === tap.upstream)?.tag} to ${PRESSURE_SENSORS.find((s) => s.id === tap.downstream)?.tag}`).join("; ")}.
        </p>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.pressure!} />
    </ModulePanel>
  );
}

export function PhysicsModule() {
  return (
    <ModulePanel id="physics">
      <Block title="What the physics engine does">
        <p className={css.definition}>{PHYSICS_INTRO}</p>
      </Block>

      <Block title="Operate the physics model" intro="Change the command or the condition of a component, and the model re-solves the pressure at every point of both propellant paths." tag="REFERENCE MODEL">
        <LiveSlot widget="pressureBudget" module="physics">
          <p>An interactive pressure budget. Four controls, throttle command, oxidiser pump head, cooling-channel restriction and oxidiser tank pressure, drive the reduced-order model. It shows the solved pressure at each point of the oxidiser path and the fuel path, with chamber pressure, mixture-ratio shift, coolant temperature rise and pump suction margin, and the change from the healthy design point.</p>
        </LiveSlot>
      </Block>

      <Block title="The physics hierarchy" intro="Three conservation laws, and the component models built from them.">
        <Picker
          label="Physics concepts"
          event="physics_model_opened"
          items={PHYSICS_CONCEPTS.map((concept) => ({ id: concept.id, label: concept.title, panel: <ConceptCard concept={concept} /> }))}
        />
      </Block>

      <Block title="Multi-fidelity modelling">
        <p className={css.definition}>{FIDELITY_INTRO}</p>
        <Picker
          label="Model fidelity levels"
          layout="pyramid"
          initial="reduced"
          event="physics_model_opened"
          items={FIDELITY_LEVELS.map((level) => ({
            id: level.id,
            label: level.name,
            hint: level.examples,
            panel: (
              <>
                <p className={css.panelTitle}>{level.name}</p>
                <p>{level.examples}.</p>
                <p className={css.groupLabel}>Use for</p>
                <ul className={css.bullets}>
                  {level.useFor.map((use) => (
                    <li key={use}>{use}</li>
                  ))}
                </ul>
                <Rows
                  rows={[
                    { label: "Cost", value: level.cost },
                    { label: "In the twin", value: level.inTwin },
                  ]}
                />
              </>
            ),
          }))}
        />
        <Chain items={FIDELITY_CHAIN} label="How fidelity levels feed one another" />
      </Block>

      <Block title="The model on this page" lens="engineer architect" tag="REFERENCE MODEL">
        <Rows
          rows={[
            { label: "Model", value: THIS_MODEL.name },
            { label: "Dynamic states", value: THIS_MODEL.states.join(" · ") },
            { label: "Solved algebraically", value: THIS_MODEL.algebraic.join(" · ") },
            { label: "Boundary conditions", value: THIS_MODEL.boundary.join(" · ") },
          ]}
        />
        <p className={css.groupLabel}>Assumptions</p>
        <ul className={css.bullets}>
          {THIS_MODEL.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.physics!} />
    </ModulePanel>
  );
}
