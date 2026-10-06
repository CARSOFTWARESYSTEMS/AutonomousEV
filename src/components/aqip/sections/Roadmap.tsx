import { EVIDENCE_API, LABELS } from "../data/product";
import { FIELD_LOOP, FIELD_QUESTION, VISION_FLOW, VISION_YEARS } from "../data/roadmap";
import PolicyAsCode from "../interactive/PolicyAsCode";
import RoadmapExplorer from "../interactive/RoadmapExplorer";
import { Block, Callout, Chip, Flow, Group, Tags } from "../ui/primitives";
import css from "../aqip.module.css";

export function Roadmap3Year() {
  return (
    <Block id="three-year-roadmap" title="The 3-year roadmap" label={<Chip tone="target">Planning targets</Chip>} lead="Each year adds a layer to the platform. The years are planning targets on the 2026–2031 horizon, not commitments." executive>
      <RoadmapExplorer />
    </Block>
  );
}

export function Vision5Year() {
  return (
    <Block id="five-year-vision" title="The 5-year vision" label={<Chip tone="vision" />} lead="Years 4 and 5 depend on the structured evidence that the first three years create." executive>
      <div className={css.cols2}>
        {VISION_YEARS.map((year) => (
          <article key={year.id} className={css.card}>
            <p className={css.cardEyebrow}>
              Year {year.year} · {year.period}
            </p>
            <h4 className={css.h4}>{year.theme}</h4>
            <p className={css.cardText}>{year.summary}</p>
            <Tags items={year.items} label={`Year ${year.year} work`} />
          </article>
        ))}
      </div>
      <Flow steps={VISION_FLOW} label="From factory to field, and back as intelligence" />
    </Block>
  );
}

export function QualityPolicyCode() {
  return (
    <Block
      id="quality-policy-as-code"
      title="Quality policy as code"
      label={<Chip tone="vision">{LABELS.policy.text}</Chip>}
      lead="A future AQIP capability could translate approved customer and quality rules into deterministic digital controls. The rules would be written and approved by people; AI would not author authoritative quality procedures."
    >
      <PolicyAsCode />
    </Block>
  );
}

export function FieldFeedbackLoop() {
  return (
    <Block id="field-to-factory" title="Field-to-factory closed loop" label={<Chip tone="vision" />} lead="The step from quality documentation to quality intelligence: when something happens in service, the manufacturing record can be asked what it knew.">
      <div className={css.split}>
        <Flow steps={FIELD_LOOP} label="Tracing a field issue back to its manufacturing history" direction="column" />
        <div>
          <Callout label="The question it should answer">{FIELD_QUESTION}</Callout>
          <div className={css.evolution}>
            <span>Quality Documentation</span>
            <span aria-hidden="true">→</span>
            <span className={css.srOnly}>becomes</span>
            <strong>Quality Intelligence</strong>
          </div>
        </div>
      </div>
    </Block>
  );
}

export function EvidenceApi() {
  return (
    <Block id="evidence-api" title="Long-term evidence API" label={<Chip tone="future">{LABELS.api.text}</Chip>} lead="A customer system could ask for the conformance of one serialised part and receive a structured, permission-checked answer. No such API exists today.">
      <div className={css.api}>
        <pre className={css.apiRequest}>
          <code>{EVIDENCE_API.request}</code>
        </pre>
        <dl className={css.apiResponse} aria-label="Illustrative response">
          {EVIDENCE_API.response.map((row) => (
            <div key={row.field}>
              <dt>{row.field}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Block>
  );
}

export function RoadmapGroup() {
  return (
    <Group id="roadmap" index={6} kicker="Roadmap" title="Roadmap: three years of execution, five years of direction" lead="Win a narrow wedge, widen it into an operating system, then connect the supply chain." executive>
      <Roadmap3Year />
      <Vision5Year />
      <QualityPolicyCode />
      <FieldFeedbackLoop />
      <EvidenceApi />
    </Group>
  );
}
