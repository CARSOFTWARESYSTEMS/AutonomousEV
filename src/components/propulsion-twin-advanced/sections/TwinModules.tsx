// Modules 5–7: how data gets from the hardware to the model, what the twin does
// with it, and where learned models belong beside the physics.
import { AI_ARCHITECTURE, AI_BOUNDARY, AI_INTRO, AI_TRUST, HYBRID_APPROACHES, HYBRID_HEADING, HYBRID_INTRO, MLOPS_INTRO, MLOPS_PRACTICES, MODEL_FAMILIES, XAI_EXAMPLE, XAI_INTRO } from "../data/aiml";
import { CHECKPOINT_BY_MODULE } from "../data/checkpoints";
import { ACQUISITION_CHAIN, ANALYTICS_HEADING, ANALYTICS_INTRO, ANALYTICS_LEVELS, QUALITY_CHECKS, SAMPLING_NOTES, TRANSFORMATION_HEADING, TRANSFORMATION_INTRO, TRANSFORMATION_STEPS } from "../data/pipeline";
import { MODULE_BY_ID } from "../data/product";
import {
  CREDIBILITY_INTRO,
  ESTIMATION_DEFINITION,
  ESTIMATORS,
  FUSION_DEFINITION,
  FUSION_SOURCES,
  MODEL_CARDS,
  MODEL_STATUSES,
  REDUNDANCY_KINDS,
  TWIN_STATES,
  UNCERTAINTY_DEFINITION,
  UNCERTAINTY_RULE,
  UNCERTAINTY_SOURCES,
  VV_RULE,
  VV_TERMS,
} from "../data/twin";
import Checkpoint from "../ui/Checkpoint";
import LiveSlot from "../ui/LiveSlot";
import ModulePanel from "../ui/ModulePanel";
import Picker from "../ui/Picker";
import { Block, Callout, Chain, ConceptCard, Rows, Tag, Terms } from "../ui/primitives";
import FusionPanel from "../widgets/FusionPanel";
import css from "../advancedTwin.module.css";

export function DataModule() {
  return (
    <ModulePanel id="data">
      <Block title={TRANSFORMATION_HEADING}>
        <p className={css.definition}>{TRANSFORMATION_INTRO}</p>
        <Picker
          label="The twelve steps from physical system to Digital Twin"
          layout="steps"
          walk
          event="digital_twin_architecture_opened"
          items={TRANSFORMATION_STEPS.map((step, i) => ({
            id: step.id,
            label: step.title,
            panel: (
              <>
                <p className={css.panelTitle}>
                  Step {i + 1} — {step.title}
                </p>
                <p>{step.summary}</p>
                <p className={css.groupLabel}>What this step produces</p>
                <ul className={css.chips}>
                  {step.outputs.map((output) => (
                    <li key={output}>{output}</li>
                  ))}
                </ul>
                <Rows rows={[{ label: "On this page", value: step.here }]} />
                <a href={`#${step.module}`} className={css.textLink}>
                  Go to the {MODULE_BY_ID[step.module].label} module <span aria-hidden="true">→</span>
                </a>
              </>
            ),
          }))}
        />
      </Block>

      <Block title="Data acquisition: from sensor to telemetry" intro="Data acquisition is the chain that carries a physical quantity from a sensor to a time-stamped engineering value that a model can use. Each link can fail in its own way, and the twin has to know every one of them.">
        <Chain items={ACQUISITION_CHAIN.map((link) => link.label)} label="The acquisition chain" />
        <div className={css.tableWrap} role="region" aria-label="The acquisition chain, link by link" tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">Link</th>
                <th scope="col">What it does</th>
                <th scope="col">How it fails</th>
              </tr>
            </thead>
            <tbody>
              {ACQUISITION_CHAIN.map((link) => (
                <tr key={link.id}>
                  <th scope="row">{link.label}</th>
                  <td>{link.text}</td>
                  <td>{link.failure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-lens="engineer architect">
          <Terms items={SAMPLING_NOTES.map((n) => ({ term: n.term, text: n.text }))} columns={2} />
        </div>
      </Block>

      <Block title="Telemetry you can trust: the data-quality layer" intro="A data-quality layer checks every sample before any model sees it, and passes on a verdict beside the value. It is what lets the twin tell a fault in the data from a fault in the engine.">
        <LiveSlot widget="dataQuality" module="data">
          <p>A live table of the three acquisition nodes, feed, turbomachinery and chamber, with each node&apos;s latency, clock skew and sequence status, the findings of the quality checks, and buttons that inject a packet delay, a timestamp error, sensor noise or replayed telemetry into the simulation.</p>
        </LiveSlot>
        <div className={css.tableWrap} role="region" aria-label="Data-quality checks" tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">Check</th>
                <th scope="col">Finds</th>
                <th scope="col">How</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_CHECKS.map((check) => (
                <tr key={check.id}>
                  <th scope="row">{check.name}</th>
                  <td>{check.finds}</td>
                  <td>{check.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="Parameter identification" intro="Parameter identification estimates a model's unknown parameters from measurements of the real asset, so that the model represents the hardware as built and not as drawn." tag="SIMULATED">
        <LiveSlot widget="identification" module="data">
          <p>The result of identifying the model in your browser: its error across the pressure channels with design values and with identified parameters, and the separate simulated data sets used for identification, for baselines and thresholds, for classifier training and for classifier validation.</p>
        </LiveSlot>
      </Block>

      <Block title={ANALYTICS_HEADING}>
        <p className={css.definition}>{ANALYTICS_INTRO}</p>
        <div className={css.grid} data-columns="4">
          {ANALYTICS_LEVELS.map((level) => (
            <article key={level.id} className={css.card}>
              <h4 className={css.cardTitle}>{level.name}</h4>
              <p className={css.formula}>{level.question}</p>
              <p>{level.text}</p>
              <p className={css.cardNote}>
                <strong>Example.</strong> {level.example}
              </p>
            </article>
          ))}
        </div>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.data!} />
    </ModulePanel>
  );
}

export function TwinModule() {
  return (
    <ModulePanel id="twin">
      <Block title="The core Digital Twin states" intro="A Digital Twin keeps several views of the same quantity side by side. The differences between them are where its information is.">
        <LiveSlot widget="twinStates" module="twin">
          <p>A live chart of chamber pressure in its four states, observed, estimated with an uncertainty band, expected and predicted, with the residual and the health interpretation beside it.</p>
        </LiveSlot>
        <dl className={css.terms} data-columns="3">
          {TWIN_STATES.map((state) => (
            <div key={state.id} className={css.term}>
              <dt>{state.label}</dt>
              <dd>
                <strong>{state.definition}</strong> {state.source}
                <span className={css.termMeta}>Drawn as: {state.line.toLowerCase()}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="State estimation">
        <p className={css.definition}>{ESTIMATION_DEFINITION}</p>
        <LiveSlot widget="estimatorLab" module="twin">
          <p>An interactive chamber-pressure example through a throttle step. It compares the raw sensor, a filtered pressure, the physics prediction and the estimated true state for a Kalman, extended Kalman, unscented Kalman or particle filter, with adjustable sensor noise, non-Gaussian spikes and a deliberate model error, and reports each signal&apos;s error against the simulated truth.</p>
        </LiveSlot>
        <Picker label="State estimators" items={ESTIMATORS.map((estimator) => ({ id: estimator.id, label: estimator.title, panel: <ConceptCard concept={estimator} /> }))} />
      </Block>

      <Block title="Sensor fusion and diagnostic reasoning">
        <p className={css.definition}>{FUSION_DEFINITION}</p>
        <p className={css.prose}>Sources combined: {FUSION_SOURCES.join(", ").toLowerCase()}.</p>
        <FusionPanel />
        <Terms items={REDUNDANCY_KINDS.map((k) => ({ id: k.id, term: k.name, text: k.text }))} columns={3} />
      </Block>

      <Block title="Uncertainty">
        <p className={css.definition}>{UNCERTAINTY_DEFINITION}</p>
        <div className={css.tableWrap} role="region" aria-label="Sources of uncertainty" tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">What it is</th>
                <th scope="col">On this page</th>
              </tr>
            </thead>
            <tbody>
              {UNCERTAINTY_SOURCES.map((source) => (
                <tr key={source.id}>
                  <th scope="row">{source.name}</th>
                  <td>{source.text}</td>
                  <td>{source.here}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout>{UNCERTAINTY_RULE}</Callout>
      </Block>

      <Block id="model-credibility" title="Model credibility">
        <p className={css.definition}>{CREDIBILITY_INTRO}</p>
        <ul className={css.statusList} aria-label="Model status terms, in order of evidence">
          {MODEL_STATUSES.map((s) => (
            <li key={s.status}>
              <Tag>{s.status}</Tag> {s.meaning}
            </li>
          ))}
        </ul>
        <Picker
          label="Model cards"
          event="physics_model_opened"
          items={MODEL_CARDS.map((card) => ({
            id: card.id,
            label: card.name,
            panel: (
              <>
                <p className={css.panelTitle}>
                  {card.name} <Tag>{card.status}</Tag>
                </p>
                <Rows
                  rows={[
                    { label: "Purpose", value: card.purpose },
                    { label: "Fidelity", value: card.fidelity },
                    { label: "Inputs", value: card.inputs },
                    { label: "Outputs", value: card.outputs },
                    { label: "Assumptions", value: card.assumptions },
                    { label: "Calibration data", value: card.calibrationData },
                    { label: "Validation data", value: card.validationData },
                    { label: "Operating envelope", value: card.envelope },
                    { label: "Uncertainty", value: card.uncertainty },
                    { label: "Version", value: card.version },
                    { label: "Owner", value: card.owner },
                    { label: "Last validation date", value: card.lastValidation },
                    { label: "Limitations", value: card.limitations },
                  ]}
                />
              </>
            ),
          }))}
        />
      </Block>

      <Block title="Verification and validation" intro="Verification and validation are different questions, and a model can pass one and fail the other.">
        <div className={css.grid} data-columns="2">
          {VV_TERMS.map((term) => (
            <article key={term.id} className={css.card}>
              <h4 className={css.cardTitle}>{term.term}</h4>
              <p className={css.formula}>{term.question}</p>
              <p>{term.text}</p>
              <p className={css.cardNote}>
                <strong>On this page.</strong> {term.here}
              </p>
            </article>
          ))}
        </div>
        <Callout>{VV_RULE}</Callout>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.twin!} />
    </ModulePanel>
  );
}

export function AiModule() {
  return (
    <ModulePanel id="ai">
      <Block title="Where AI and machine learning belong">
        <p className={css.definition}>{AI_INTRO}</p>
      </Block>

      <Block title="The learned models, running beside the physics" tag="SIMULATED" intro="Two small models are trained in your browser on simulated data when this module opens: an anomaly detector that is given no physics, and a fault classifier that is given physics-derived features.">
        <LiveSlot widget="aiLive" module="ai">
          <p>Four live panels. Anomaly detection two ways, a learned detector on raw telemetry beside a physics-informed residual statistic, with the time each took to alarm. The fault classifier&apos;s probabilities beside the physics-based and the fused result. The classifier&apos;s validation evidence, with its training and validation set sizes, accuracies and confusion matrix. And the explanation of the current verdict.</p>
        </LiveSlot>
      </Block>

      <Block title={HYBRID_HEADING}>
        <p className={css.definition}>{HYBRID_INTRO}</p>
        <Picker label="Hybrid physics and machine-learning approaches" event="ai_model_opened" items={HYBRID_APPROACHES.map((approach) => ({ id: approach.id, label: approach.title, panel: <ConceptCard concept={approach} /> }))} />
      </Block>

      <Block title="AI/ML model catalogue" intro="Each family of learned model does a particular job. The catalogue says which, with what, and on what condition.">
        <Picker
          label="AI and machine-learning model families"
          event="ai_model_opened"
          items={MODEL_FAMILIES.map((family) => ({
            id: family.id,
            label: family.name,
            panel: (
              <>
                <p className={css.panelTitle}>{family.name}</p>
                <p className={css.definition}>{family.definition}</p>
                <p className={css.groupLabel}>Use for</p>
                <ul className={css.bullets}>
                  {family.useFor.map((use) => (
                    <li key={use}>{use}</li>
                  ))}
                </ul>
                <p className={css.groupLabel}>Possible algorithms</p>
                <ul className={css.chips}>
                  {family.algorithms.map((algorithm) => (
                    <li key={algorithm}>{algorithm}</li>
                  ))}
                </ul>
                <Rows
                  rows={[
                    { label: "What it needs", value: family.needs },
                    { label: "On this page", value: family.here },
                  ]}
                />
              </>
            ),
          }))}
        />
      </Block>

      <Block title="Digital Twin AI architecture" intro="The AI architecture of a Digital Twin places learned models in parallel with the physics model and the estimator, downstream of a data-quality layer and upstream of evidence fusion. No learned model sits alone between the data and a decision.">
        <ol className={css.flow} aria-label="Digital Twin AI architecture, from the physical system to engineering review">
          {AI_ARCHITECTURE.map((stage) => (
            <li key={stage.id} data-parallel={stage.parallel ? "" : undefined}>
              {stage.parallel ? (
                <ul className={css.flowParallel} aria-label={stage.label}>
                  {stage.parallel.map((engine) => (
                    <li key={engine.id}>
                      <strong>{engine.label}</strong>
                      <span>{engine.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <strong>{stage.label}</strong>
                  <span>{stage.text}</span>
                </>
              )}
            </li>
          ))}
        </ol>
      </Block>

      <Block title="Explainable AI">
        <p className={css.definition}>{XAI_INTRO}</p>
        <div className={css.detail}>
          <p className={css.verdict}>{XAI_EXAMPLE.verdict}</p>
          <p className={css.groupLabel}>Evidence</p>
          <ul className={css.bullets}>
            {XAI_EXAMPLE.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={css.note}>
            <strong>{XAI_EXAMPLE.question}</strong> {XAI_EXAMPLE.note}
          </p>
        </div>
      </Block>

      <Block title="AI safety and MLOps">
        <p className={css.definition}>{MLOPS_INTRO}</p>
        <Terms items={MLOPS_PRACTICES.map((p) => ({ id: p.id, term: p.name, text: p.text }))} columns={3} />
        <div className={css.tableWrap} role="region" aria-label="Where AI can be trusted and where physics is mandatory" tabIndex={0}>
          <table className={css.table}>
            <caption className={css.caption}>Where AI can be trusted, and where physics is mandatory</caption>
            <thead>
              <tr>
                <th scope="col">Use</th>
                <th scope="col">Verdict</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {AI_TRUST.map((row) => (
                <tr key={row.where}>
                  <th scope="row">{row.where}</th>
                  <td>
                    <Tag>{row.verdict.toUpperCase()}</Tag>
                  </td>
                  <td>{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="caution">{AI_BOUNDARY}</Callout>
      </Block>

      <Checkpoint data={CHECKPOINT_BY_MODULE.ai!} />
    </ModulePanel>
  );
}
