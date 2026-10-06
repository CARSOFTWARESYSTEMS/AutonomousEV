import { ShieldAlert } from "lucide-react";
import { AQIP, PRINCIPLES, SAFETY_RULE } from "../data/overview";
import {
  ARCHITECTURE,
  BOUNDARY_POSITIONING,
  INTEGRATES_WITH,
  LABELS,
  MATURITY_LEGEND,
  MATURITY_MATRIX,
  MODULES,
  NOT_PRODUCTION_READY,
  PASSPORT_NOTES,
  PASSPORT_ROWS,
  PLATFORM_ARCHITECTURE,
  REVISION_CHANGES,
  REVISION_IMPACT,
  SYNTHETIC_PART,
} from "../data/product";
import InView from "../interactive/InView";
import { DigitalThreadSimulator, QualityGraph } from "../interactive/Lazy";
import { MATURITY_ORDER } from "../types";
import { Block, Callout, Chip, Group, Layers, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";
import pillars from "../pillars.module.css";

export function ProductPrinciples() {
  return (
    <Block id="principles" title="Product principles">
      <p className={css.philosophy}>
        {AQIP.philosophy.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <ol className={css.principles}>
        {PRINCIPLES.map((principle) => (
          <li key={principle.title}>
            <h4 className={css.h4}>{principle.title}</h4>
            <p className={css.cardText}>{principle.text}</p>
          </li>
        ))}
      </ol>
      <div className={css.safety} role="note">
        <ShieldAlert size={22} aria-hidden="true" />
        <div>
          <p className={css.safetyLabel}>Safety rule · {AQIP.safetyPrinciple}</p>
          <p className={css.safetyText}>{SAFETY_RULE}</p>
        </div>
      </div>
    </Block>
  );
}

export function DigitalThread() {
  return (
    <Block
      id="digital-thread"
      title="Follow a Requirement Through AQIP"
      label={<Chip tone="synthetic">{LABELS.simulator.text}</Chip>}
      lead={`${SYNTHETIC_PART.description}: part ${SYNTHETIC_PART.part}, Revision ${SYNTHETIC_PART.revision}. The data is invented for this page. No real drawing is used, and nothing here implies certification or customer acceptance.`}
    >
      <DigitalThreadSimulator />
    </Block>
  );
}

export function QualityPassport() {
  return (
    <Block id="quality-passport" title="Digital Quality Passport" label={<Chip tone="future">{LABELS.passport.text}</Chip>}>
      <div className={css.split}>
        <div className={css.passport}>
          <dl className={css.passportId}>
            <div>
              <dt>Part</dt>
              <dd>{SYNTHETIC_PART.part}</dd>
            </div>
            <div>
              <dt>Serial</dt>
              <dd>{SYNTHETIC_PART.serial}</dd>
            </div>
            <div>
              <dt>Drawing</dt>
              <dd>Revision {SYNTHETIC_PART.revision}</dd>
            </div>
          </dl>
          <ul className={css.passportRows}>
            {PASSPORT_ROWS.map((row) => (
              <li key={row.item}>
                <details className={css.passportRow}>
                  <summary>
                    <span className={css.passportItem}>{row.item}</span>
                    <span className={css.passportStatus}>
                      <span aria-hidden="true">✓</span> {row.status}
                    </span>
                  </summary>
                  <p>{row.backing}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Callout>Prove the manufacturing history of a serialized aerospace product in seconds, not hours.</Callout>
          <ListCard title="Access is controlled" items={PASSPORT_NOTES} />
          <p className={css.fine}>
            Select a row to see what stands behind it. The part, serial and statuses are synthetic. The long-term idea of locating this history on the part is the{" "}
            <a href="#spatial-quality-passport" className={css.textLink}>
              Spatial Quality Passport
            </a>
            .
          </p>
        </div>
      </div>
    </Block>
  );
}

const CHANGE_MARK: Record<(typeof REVISION_CHANGES)[number]["kind"], string> = { changed: "~", added: "+", updated: "~", deleted: "−" };

export function RevisionIntelligence() {
  return (
    <Block
      id="revision-intelligence"
      title="Revision Intelligence"
      label={<Chip tone="planned-y1" />}
      lead="Listing what is on a drawing is useful. Knowing exactly what a new revision changes, and which quality work it invalidates, is worth more."
    >
      <div className={css.revision}>
        <div className={css.revisionHead}>
          <span className={css.revBadge}>REV C</span>
          <span className={css.revArrow} aria-hidden="true">
            →
          </span>
          <span className={css.revBadge} data-new="">
            REV D
          </span>
          <span className={css.srOnly}>Changes from Revision C to Revision D</span>
        </div>
        <div className={css.cols2}>
          <div className={css.card}>
            <p className={css.cardEyebrow}>What changed</p>
            <ul className={css.diff}>
              {REVISION_CHANGES.map((change) => (
                <li key={change.item} data-kind={change.kind}>
                  <span className={css.diffMark} aria-hidden="true">
                    {CHANGE_MARK[change.kind]}
                  </span>
                  <span className={css.diffItem}>{change.item}</span>
                  <span className={css.diffChange}>{change.change}</span>
                </li>
              ))}
            </ul>
          </div>
          <ListCard title="Impact analysis" items={REVISION_IMPACT} emphasis="accent" />
        </div>
        <p className={css.fine}>
          Synthetic example. Comparison is planned for Year 1 and impact analysis for Year 2. Engineering and quality decide the scope of re-work; the analysis only shows them what is affected. Seeing the same change on the geometry is{" "}
          <a href="#twin-revision" className={css.textLink}>
            3D revision intelligence
          </a>
          , a long-term idea.
        </p>
      </div>
    </Block>
  );
}

export function ProductModules() {
  return (
    <Block id="modules" title="Product modules" lead="One core platform, fifteen modules. Each carries one of six maturity labels. None of the six means production-ready." executive>
      <dl className={css.legend}>
        {MATURITY_ORDER.map((maturity) => (
          <div key={maturity}>
            <dt>
              <Chip tone={maturity} />
            </dt>
            <dd>{MATURITY_LEGEND[maturity]}</dd>
          </div>
        ))}
      </dl>
      <p className={css.corePlatform}>Core Platform</p>
      <ol className={css.modules}>
        {MODULES.map((module) => (
          <li key={module.n} className={css.module} data-maturity={module.maturity}>
            <p className={css.moduleNo}>
              Module {module.n} <Chip tone={module.maturity} />
            </p>
            <h4 className={css.h4}>{module.name}</h4>
            <p className={css.cardText}>{module.text}</p>
          </li>
        ))}
      </ol>
    </Block>
  );
}

export function MaturityMatrix() {
  return (
    <Block id="maturity" title="What exists and what is planned" lead="Only the first group describes software that exists today, and it is a prototype. Everything else is ahead." executive>
      <div className={css.maturityGrid}>
        {MATURITY_MATRIX.map((column) => (
          <ListCard key={column.status} title={column.heading} eyebrow={<Chip tone={column.status} />} items={column.items} emphasis={column.status === "prototype" ? "accent" : undefined}>
            <p className={css.cardText}>{column.note}</p>
          </ListCard>
        ))}
      </div>
      <div className={css.card} data-emphasis="warn">
        <p className={css.cardEyebrow}>Not production-ready today</p>
        <Tags items={NOT_PRODUCTION_READY} label="Capabilities that are not production-ready today" />
        <p className={css.cardText}>Where this page describes any of these, it describes a plan, research or a long-term vision.</p>
      </div>
    </Block>
  );
}

export function PlatformArchitecture() {
  return (
    <Block id="architecture" title="Platform architecture: four layers" label={<Chip tone="planned">Target architecture</Chip>} lead="Three layers stack: what quality teams do, what AI helps them interpret, and the graph that holds every record. The fourth does not stack. Cybersecurity and governance surrounds all of them.">
      <ol className={pillars.platform} aria-label="Platform architecture: three stacked layers, enclosed by cybersecurity and governance">
        {PLATFORM_ARCHITECTURE.map((layer) => (
          <li key={layer.id} className={pillars.platformLayer} data-spans={layer.spans ? "" : undefined}>
            <div>
              <h4 className={css.archName}>{layer.layer}</h4>
              <p className={pillars.platformRole}>{layer.role}</p>
            </div>
            <Tags items={layer.items} />
          </li>
        ))}
      </ol>
    </Block>
  );
}

export function TechnicalArchitecture() {
  return (
    <Block id="data-flow" title="How data moves through the platform" label={<Chip tone="planned">Target architecture</Chip>} lead="Data moves down the stack. Nothing reaches the quality graph without passing human verification, and security governs every layer.">
      <InView>
        <Layers label="Architecture layers, from input to output" layers={ARCHITECTURE} />
      </InView>
      <p className={css.fine}>
        The controls behind the security layer are in{" "}
        <a href="#cybersecurity" className={css.textLink}>
          Cybersecurity &amp; Digital Trust
        </a>
        ; the limits on AI are in{" "}
        <a href="#ai-assurance" className={css.textLink}>
          AI Assurance
        </a>
        .
      </p>
    </Block>
  );
}

export function ProductBoundary() {
  return (
    <Block id="product-boundary" title="Product boundary" lead="AQIP should integrate with the systems a manufacturer already runs. It should not initially attempt to replace all of them.">
      <div className={css.split}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Integrates with</p>
          <Tags items={INTEGRATES_WITH} label="Systems AQIP integrates with" />
        </div>
        <Callout label="Positioning">{BOUNDARY_POSITIONING}</Callout>
      </div>
    </Block>
  );
}

export function ProductGroup() {
  return (
    <Group id="product" kicker="Product" title="The product: principles, platform and proof" lead="AI interprets. Humans approve. Software proves." executive>
      <ProductPrinciples />
      <DigitalThread />
      <QualityPassport />
      <RevisionIntelligence />
      <ProductModules />
      <MaturityMatrix />
      <PlatformArchitecture />
      <TechnicalArchitecture />
      <ProductBoundary />
    </Group>
  );
}

export function QualityGraphGroup() {
  return (
    <Group id="quality-graph" kicker="Quality Graph" title="The Aerospace Quality Graph" lead="The long-term intelligence foundation of AQIP.">
      <Block
        title="How quality entities connect"
        label={<Chip tone="planned">Planned data model</Chip>}
        lead="Every part, requirement, measurement and approval becomes an entity with explicit links to the others. The lower band adds geometry: the path from a 2D characteristic to the 3D feature it controls, and on to its inspection, measurement and evidence. Select an entity to see what the graph is planned to hold about it and what it connects to."
      >
        <QualityGraph />
      </Block>
    </Group>
  );
}
