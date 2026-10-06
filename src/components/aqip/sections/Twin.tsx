import { LABELS, SYNTHETIC_PART } from "../data/product";
import {
  CAD_FLOW,
  CAD_FORMATS,
  DRAWING_GAPS,
  ENGINE_FLOW,
  ENGINE_LIMIT,
  PRIMITIVES,
  SPATIAL_PASSPORT,
  TECH_NOTE,
  TECH_OPTIONS,
  TWIN,
  TWIN_CAPABILITIES,
  TWIN_FLOW,
  TWIN_MODES,
  TWIN_REVISION,
  UNCERTAINTY_RULES,
  VIEWER_CONTROLS,
} from "../data/twin";
import InView from "../interactive/InView";
import { InspectionTwin } from "../interactive/Lazy";
import { Block, Callout, Chip, Disclosure, Flow, Group, Layers, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";
import pillars from "../pillars.module.css";

export function TwinConcept() {
  return (
    <Block id="twin-concept" title="A drawing you can turn over in your hands" label={<Chip tone={LABELS.twin.tone}>{LABELS.twin.text}</Chip>} executive>
      <Callout>{TWIN.statement}</Callout>
      <div className={css.cols2}>
        <div className={css.card} data-emphasis="accent">
          <p className={css.cardEyebrow}>What AQIP means by it</p>
          <h4 className={css.h4}>{TWIN.concept}</h4>
          <p className={css.cardText}>A geometry candidate with its assumptions and confidence on show, which an engineer confirms, corrects or marks unresolved before anyone relies on it.</p>
        </div>
        <div className={css.card} data-emphasis="warn">
          <p className={css.cardEyebrow}>What it is not</p>
          <h4 className={css.h4}>{TWIN.notConcept}</h4>
          <p className={css.cardText}>AQIP does not claim that an arbitrary engineering drawing can always be reconstructed exactly, and a reconstruction never replaces the engineering definition.</p>
        </div>
      </div>
      <Callout kind="safety" label="Engineering authority">
        {TWIN.authority}
      </Callout>
    </Block>
  );
}

export function TwinLimits() {
  return (
    <Block id="twin-limits" title="Why reconstruction has to be verified" lead="A 2D drawing can be a complete definition for a person who knows how to read it and still leave geometry unstated. A single view may not define any of these.">
      <div className={css.split}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>What a drawing may not define</p>
          <Tags items={DRAWING_GAPS} label="What a 2D drawing may not define" />
          <p className={css.cardText}>Where the drawing is silent, the honest output is a question for an engineer, not a guess presented as geometry.</p>
        </div>
        <ListCard title="For geometry it is unsure of, AQIP is designed to" items={UNCERTAINTY_RULES} ordered emphasis="accent" />
      </div>
    </Block>
  );
}

export function TwinDemo() {
  return (
    <Block
      id="twin-demo"
      title="Explore the 3D Inspection Twin"
      label={<Chip tone={LABELS.twinDemo.tone}>{LABELS.twinDemo.text}</Chip>}
      lead={`${SYNTHETIC_PART.description}: part ${SYNTHETIC_PART.part}, Revision ${SYNTHETIC_PART.revision}. Select a balloon on the drawing, on the model or in the list: all three are the same selection. The part, its measurements and its statuses are invented for this page.`}
    >
      <InspectionTwin />
      <Disclosure summary="Viewer controls on a desktop and on a phone">
        <div className={css.cols2}>
          <div>
            <p className={css.cardEyebrow}>Desktop: a large viewport and the full toolbar</p>
            <Tags items={VIEWER_CONTROLS.desktop} label="Desktop viewer controls" />
          </div>
          <div>
            <p className={css.cardEyebrow}>Phone: a simplified touch viewer</p>
            <Tags items={VIEWER_CONTROLS.mobile} label="Phone viewer controls" />
          </div>
        </div>
        <p className={css.fine}>
          Phones keep every feature, status and record, and leave out the small precision controls. {VIEWER_CONTROLS.notShown} Where WebGL is not available the model is shown as a fixed isometric drawing, and the rest of the page is unaffected.
        </p>
      </Disclosure>
    </Block>
  );
}

export function TwinCapabilities() {
  return (
    <Block id="twin-capabilities" title="What the twin is for" lead="Not a decorative model. A way to find a requirement, its measurement and its evidence by pointing at the part.">
      <ul className={css.cardGrid}>
        {TWIN_CAPABILITIES.map((capability) => (
          <li key={capability.name} className={css.card}>
            <p className={css.cardEyebrow}>
              <Chip tone={capability.maturity} />
            </p>
            <h4 className={css.h4}>{capability.name}</h4>
            <p className={css.cardText}>{capability.text}</p>
          </li>
        ))}
      </ul>
      <Callout label="Visual FAI">{TWIN.visualFai}</Callout>
    </Block>
  );
}

export function TwinFlow() {
  return (
    <Block id="twin-flow" title="From upload to inspection twin" label={<Chip tone="research">Research workflow</Chip>} lead="Nine steps. The two in green belong to a person: nothing after them happens until an engineer has reviewed the candidate.">
      <InView>
        <Layers label="From an uploaded 2D drawing to an inspection twin" layers={TWIN_FLOW.map((step) => ({ id: step.id, layer: step.step, items: step.items, emphasis: step.human ? "human" : undefined }))} />
      </InView>
    </Block>
  );
}

export function TwinModes() {
  return (
    <Block id="twin-modes" title="Two sources of geometry" lead="If the customer also supplies approved 3D geometry, AQIP should prefer it. Displaying an authoritative model is more reliable than reconstructing one, and the two are never presented as the same thing.">
      <div className={css.cols2}>
        {TWIN_MODES.map((mode) => (
          <div key={mode.id} className={css.card} data-emphasis={mode.id === "cad" ? "accent" : undefined}>
            <p className={css.cardEyebrow}>
              {mode.code} <Chip tone={mode.maturity} />
            </p>
            <h4 className={css.h4}>{mode.name}</h4>
            <p className={css.cardText}>{mode.summary}</p>
            <ul className={css.list}>
              {mode.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={css.card}>
        <p className={css.cardEyebrow}>Mode A, where technically feasible</p>
        <Tags items={CAD_FORMATS} label="CAD inputs AQIP is intended to accept" />
        <Flow steps={CAD_FLOW} label="Mapping a drawing's characteristics onto approved CAD" />
      </div>
    </Block>
  );
}

export function TwinEngine() {
  return (
    <Block id="twin-engine" title="Reconstruction engine architecture" label={<Chip tone="research" />} lead="How a geometry candidate could be produced. It ends, always, at a person.">
      <Flow steps={ENGINE_FLOW} label="Reconstruction engine, from drawing input to engineer review" />
      <div className={css.cols2}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Geometry primitives</p>
          <Tags items={PRIMITIVES} label="Geometry primitives the engine works with" />
          <p className={css.cardText}>{ENGINE_LIMIT}</p>
        </div>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Technologies to evaluate</p>
          <Tags items={TECH_OPTIONS} label="Technologies to evaluate" />
          <p className={css.cardText}>{TECH_NOTE}</p>
        </div>
      </div>
      <p className={css.fine}>
        Drawings and CAD are sensitive. Every file follows the same security architecture as the rest of AQIP:{" "}
        <a href="#file-security" className={css.textLink}>
          see how uploaded engineering files are handled
        </a>
        .
      </p>
    </Block>
  );
}

export function TwinRevision() {
  return (
    <Block id="twin-revision" title="3D revision intelligence" label={<Chip tone="vision">Long-term · advanced capability</Chip>} lead="Compare two revisions in 2D and in 3D at once, and see which inspection characteristics the change reaches.">
      <div className={css.split}>
        <div className={pillars.revision}>
          <p className={css.cardEyebrow}>Revision change · synthetic example</p>
          <h4 className={css.h4}>
            {TWIN_REVISION.item} · {TWIN_REVISION.what}
          </h4>
          <dl className={pillars.revisionPair}>
            <div>
              <dt>{TWIN_REVISION.from.revision}</dt>
              <dd>{TWIN_REVISION.from.value}</dd>
            </div>
            <div data-new="">
              <dt>{TWIN_REVISION.to.revision}</dt>
              <dd>{TWIN_REVISION.to.value}</dd>
            </div>
          </dl>
          <p className={css.cardEyebrow}>Impact</p>
          <ul className={css.list}>
            {TWIN_REVISION.impact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <ListCard title="What the comparison would highlight" items={TWIN_REVISION.highlights} />
      </div>
      <p className={css.fine}>In the demonstration above this is the feature marked “Revision impacted”. Engineering and quality decide what has to be repeated; the comparison only shows them what is affected.</p>
    </Block>
  );
}

export function SpatialPassport() {
  return (
    <Block id="spatial-quality-passport" title="Spatial Quality Passport" label={<Chip tone="vision">Future product vision</Chip>} lead="The serialised Quality Passport, connected to the geometry: not only whether a part was verified, but where.">
      <div className={css.split}>
        <div className={css.card}>
          <dl className={css.passportId}>
            <div>
              <dt>Part</dt>
              <dd>{SPATIAL_PASSPORT.part}</dd>
            </div>
            <div>
              <dt>Serial</dt>
              <dd>{SPATIAL_PASSPORT.serial}</dd>
            </div>
          </dl>
          <p className={css.cardEyebrow}>The 3D model could display</p>
          <Tags items={SPATIAL_PASSPORT.shows} label="What a Spatial Quality Passport could display" />
        </div>
        <Callout>A question such as “where on this serial was the nonconformance?” would be answered by looking at the part.</Callout>
      </div>
      <p className={css.fine}>
        A concept that depends on the{" "}
        <a href="#quality-passport" className={css.textLink}>
          Digital Quality Passport
        </a>{" "}
        and on verified geometry existing first. Neither does today.
      </p>
    </Block>
  );
}

export function InspectionTwinGroup() {
  return (
    <Group id="inspection-twin" kicker="3D Inspection Twin" title="2D drawing → interactive 3D Inspection Twin" lead="Quality information should be understandable in a 2D drawing and in 3D geometry. The first already exists everywhere; the second is what AQIP is researching." executive>
      <TwinConcept />
      <TwinLimits />
      <TwinDemo />
      <TwinCapabilities />
      <TwinFlow />
      <TwinModes />
      <TwinEngine />
      <TwinRevision />
      <SpatialPassport />
    </Group>
  );
}
