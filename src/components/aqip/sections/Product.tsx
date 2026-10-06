import { ShieldAlert } from "lucide-react";
import { AQIP, PRINCIPLES, SAFETY_RULE } from "../data/overview";
import {
  AI_GOVERNANCE,
  AI_MAY_ASSIST,
  AI_MUST_NOT,
  ARCHITECTURE,
  BOUNDARY_POSITIONING,
  INTEGRATES_WITH,
  LABELS,
  MATURITY_LEGEND,
  MATURITY_MATRIX,
  MODULES,
  PASSPORT_NOTES,
  PASSPORT_ROWS,
  REVISION_CHANGES,
  REVISION_IMPACT,
  SECURITY_CONTROLS,
  SECURITY_STATEMENT,
  SYNTHETIC_PART,
} from "../data/product";
import InView from "../interactive/InView";
import { DigitalThreadSimulator, QualityGraph } from "../interactive/Lazy";
import type { Maturity } from "../types";
import { Block, Callout, Chip, DataTable, Group, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";

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
          <p className={css.fine}>Select a row to see what stands behind it. The part, serial and statuses are synthetic.</p>
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
      label={<Chip tone="planned" />}
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
        <p className={css.fine}>Synthetic example. In the product, engineering and quality decide the scope of re-work; the analysis only shows them what is affected.</p>
      </div>
    </Block>
  );
}

const MATURITY_ORDER: readonly Maturity[] = ["now", "next", "later"];

export function ProductModules() {
  return (
    <Block id="modules" title="Product modules" lead="One core platform, fourteen modules. The label says when each is planned to be worked on, not that it exists." executive>
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
    <Block id="maturity" title="What exists and what is planned" lead="Only the first column describes software that exists today, and it is a prototype." executive>
      <div className={css.cols4}>
        {MATURITY_MATRIX.map((column) => (
          <ListCard key={column.status} title={column.heading} eyebrow={<Chip tone={column.status} />} items={column.items} emphasis={column.status === "available" ? "accent" : undefined}>
            <p className={css.cardText}>{column.note}</p>
          </ListCard>
        ))}
      </div>
    </Block>
  );
}

export function TechnicalArchitecture() {
  return (
    <Block id="architecture" title="Technology architecture" label={<Chip tone="planned">Target architecture</Chip>} lead="Data moves down the stack. Nothing reaches the quality graph without passing human verification, and security governs every layer.">
      <InView>
        <ol className={css.architecture} aria-label="Architecture layers, from input to output">
          {ARCHITECTURE.map((layer) => (
            <li key={layer.id} className={css.archLayer} data-emphasis={layer.emphasis}>
              <h4 className={css.archName}>{layer.layer}</h4>
              <Tags items={layer.items} />
            </li>
          ))}
        </ol>
      </InView>
    </Block>
  );
}

export function AIGovernance() {
  return (
    <Block id="ai-governance" title="AI and agentic AI: assist versus controlled authority" lead="Agentic AI can do useful preparatory work. It is never the authority for a controlled record.">
      <div className={css.cols2}>
        <ListCard title="Agentic AI may assist with" items={AI_MAY_ASSIST} emphasis="accent" />
        <ListCard title="Agentic AI must not independently" items={AI_MUST_NOT} emphasis="warn" />
      </div>
      <DataTable caption="AI assistance compared with controlled authority, by activity" columns={["Activity", "AI assist", "Controlled authority"]} rows={AI_GOVERNANCE.map((row) => [row.activity, row.assist, row.authority])} />
    </Block>
  );
}

export function SecurityArchitecture() {
  return (
    <Block
      id="security"
      title="Security architecture"
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
      <TechnicalArchitecture />
      <AIGovernance />
      <SecurityArchitecture />
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
        lead="Every part, requirement, measurement and approval becomes an entity with explicit links to the others. Select an entity to see what the graph is planned to hold about it and what it connects to."
      >
        <QualityGraph />
      </Block>
    </Group>
  );
}
