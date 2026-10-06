import { SECURITY_CONTROLS, SECURITY_STATEMENT } from "../data/product";
import {
  FILE_AI_RULE,
  FILE_BOUNDARY,
  FILE_HANDLING,
  FILE_MITIGATIONS,
  FILE_THREATS,
  SECURITY_LAYERS,
  SECURITY_PRINCIPLES,
  SECURITY_QUALITY_LINKS,
  TRUST,
  TRUST_AREAS,
  TRUST_TRIANGLE,
  TRUST_TRIANGLE_NOTE,
} from "../data/trust";
import InView from "../interactive/InView";
import { Block, Callout, Chip, Group, Layers, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";
import pillars from "../pillars.module.css";

/** The triangle itself. Decoration: the three corners and what each asks are written out beside it. */
function TriangleFigure() {
  return (
    <svg className={pillars.triangleSvg} viewBox="0 0 420 300" aria-hidden="true" focusable="false">
      <path d="M210 52 L80 238 L340 238 Z" className={pillars.triangleEdge} />
      <path d="M210 52 L210 176 M80 238 L210 176 M340 238 L210 176" className={pillars.triangleSpoke} />
      <circle cx="210" cy="176" r="38" className={pillars.triangleCore} />
      <text x="210" y="181" textAnchor="middle" className={pillars.triangleTrust}>
        TRUST
      </text>
      <circle cx="210" cy="52" r="9" className={pillars.triangleNode} />
      <circle cx="80" cy="238" r="9" className={pillars.triangleNode} />
      <circle cx="340" cy="238" r="9" className={pillars.triangleNode} />
      <text x="210" y="28" textAnchor="middle" className={pillars.triangleLabel}>
        QUALITY
      </text>
      <text x="80" y="270" textAnchor="middle" className={pillars.triangleLabel}>
        CYBERSECURITY
      </text>
      <text x="340" y="270" textAnchor="middle" className={pillars.triangleLabel}>
        AI ASSURANCE
      </text>
    </svg>
  );
}

export function TrustTriangle() {
  return (
    <Block id="trust-triangle" title="The Trust Triangle" lead="Three questions a manufacturer has to be able to answer before a quality record is worth anything." executive>
      <div className={pillars.triangle}>
        <TriangleFigure />
        <ol className={pillars.triangleSides}>
          {TRUST_TRIANGLE.map((side) => (
            <li key={side.id} className={css.card} data-side={side.id}>
              <h4 className={pillars.sideName}>{side.name}</h4>
              <p className={pillars.sideQuestion}>{side.question}</p>
              <p className={css.cardText}>{side.text}</p>
            </li>
          ))}
        </ol>
      </div>
      <Callout>{TRUST_TRIANGLE_NOTE}</Callout>
    </Block>
  );
}

export function SecurityPillar() {
  return (
    <Block id="security-pillar" title="Security as platform infrastructure" lead="Cybersecurity is not a module beside the others. It runs underneath every one of them, in eight areas.">
      <ul className={css.cardGrid} data-plain="">
        {TRUST_AREAS.map((area) => (
          <li key={area.area} className={css.card}>
            <h4 className={css.h4}>{area.area}</h4>
            <p className={css.cardText}>{area.text}</p>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export function SecurityQuality() {
  return (
    <Block id="security-quality" title="Where cybersecurity meets quality" lead="A security failure in a quality system does not stay a security failure. It becomes a part that should not have been accepted.">
      <ul className={pillars.links}>
        {SECURITY_QUALITY_LINKS.map((link) => (
          <li key={link.cause}>
            <span className={pillars.linkCause}>{link.cause}</span>
            <span className={pillars.linkArrow} aria-hidden="true" />
            <span className={css.srOnly}>leads to</span>
            <span className={pillars.linkEffect}>{link.effect}</span>
          </li>
        ))}
      </ul>
      <Callout>{TRUST.integrity}</Callout>
    </Block>
  );
}

export function CybersecurityArchitecture() {
  return (
    <Block id="security-architecture" title="Cybersecurity architecture" label={<Chip tone="planned">Design requirements</Chip>} lead="Six layers, from who is acting down to what an AI component is allowed to do.">
      <InView>
        <Layers label="Cybersecurity architecture, from identity to AI security" layers={SECURITY_LAYERS} />
      </InView>
    </Block>
  );
}

export function SecurityControls() {
  return (
    <Block
      id="security"
      title="Security controls by area"
      label={<Chip tone="planned">Design requirements</Chip>}
      lead="Security is a first-class requirement, not a later phase. These are the controls the platform is being designed around; they are not a certification claim."
    >
      <div className={css.cardGrid} data-plain="">
        {SECURITY_CONTROLS.map((group) => (
          <ListCard key={group.group} title={group.group} items={group.items} />
        ))}
      </div>
      <Callout kind="safety" label="Data commitment">
        {SECURITY_STATEMENT}
      </Callout>
    </Block>
  );
}

export function SecurityPrinciples() {
  return (
    <Block id="security-principles" title="Cybersecurity principles">
      <ol className={css.principles}>
        {SECURITY_PRINCIPLES.map((principle) => (
          <li key={principle.name}>
            <h4 className={css.h4}>{principle.name}</h4>
            <p className={css.cardText}>{principle.text}</p>
          </li>
        ))}
      </ol>
      <Callout kind="note" label="No certification is claimed">
        {TRUST.certification}
      </Callout>
    </Block>
  );
}

export function FileSecurity() {
  return (
    <Block
      id="file-security"
      title="Engineering files: every upload crosses a security boundary"
      label={<Chip tone="planned">Design requirements</Chip>}
      lead="A drawing or a CAD file is untrusted input until it has been checked, and sensitive data from the moment it arrives. The 3D Inspection Twin is subject to all of this."
    >
      <div className={css.cols2}>
        <ListCard title="Potential threats" items={FILE_THREATS} emphasis="warn" />
        <ListCard title="Mitigations" items={FILE_MITIGATIONS} emphasis="accent" />
      </div>
      <div className={css.card}>
        <p className={css.cardEyebrow}>What every uploaded drawing and CAD file is subject to</p>
        <Tags items={FILE_HANDLING} label="Controls applied to uploaded engineering files" />
      </div>
      <div className={css.cols2}>
        <Callout label="Principle">{FILE_BOUNDARY}</Callout>
        <Callout kind="safety" label="Rule">
          {FILE_AI_RULE}
        </Callout>
      </div>
    </Block>
  );
}

export function CybersecurityGroup() {
  return (
    <Group id="cybersecurity" kicker="Cybersecurity" title={TRUST.title} lead={TRUST.statement} executive>
      <TrustTriangle />
      <SecurityPillar />
      <SecurityQuality />
      <CybersecurityArchitecture />
      <SecurityControls />
      <SecurityPrinciples />
      <FileSecurity />
    </Group>
  );
}
