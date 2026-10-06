import {
  BUSINESS_MODEL_CANVAS,
  COMPETITIVE_CATEGORIES,
  DIFFERENTIATORS,
  FLYWHEEL,
  MOAT_LAYERS,
  MOAT_MESSAGE,
  NETWORK_BENEFITS,
  NETWORK_MODELS,
  NOT_STRATEGY,
  PRICING,
  PRICING_LABEL,
  REVENUE_ENGINES,
  TWIN_REVENUE,
} from "../data/business";
import { DECISION_MAKERS, MARKETING_ASSETS, MARKETING_PRINCIPLE, ONBOARDING, ROUNDTABLE, SALES_MOTION, SALES_PRINCIPLE, SUCCESS_METRICS } from "../data/company";
import { LABELS } from "../data/product";
import InView from "../interactive/InView";
import { RoiCalculator } from "../interactive/Lazy";
import MasterDetail from "../interactive/MasterDetail";
import MobileDisclosure from "../interactive/MobileDisclosure";
import { Block, Callout, Chip, DataTable, Flow, Group, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";

export function RevenueEngines() {
  return (
    <Block id="revenue-model" title="Revenue model: seven engines" lead="Several ways the same platform can earn. The label shows when each is planned to start; none is earning today." executive>
      <MasterDetail
        label="Revenue engines"
        event="aqip_revenue_engine_select"
        items={REVENUE_ENGINES.map((engine) => ({ id: engine.id, code: `E${engine.n}`, label: engine.name, meta: <Chip tone={engine.starts} /> }))}
        panels={REVENUE_ENGINES.map((engine) => (
          <div key={engine.id}>
            <h4 className={css.h4}>
              Engine {engine.n} · {engine.name}
            </h4>
            <dl className={css.kv}>
              <div>
                <dt>How it works</dt>
                <dd>{engine.how}</dd>
              </div>
              <div>
                <dt>Who pays</dt>
                <dd>{engine.payer}</dd>
              </div>
              <div>
                <dt>Starts</dt>
                <dd>
                  <Chip tone={engine.starts} />
                </dd>
              </div>
              <div>
                <dt>Note</dt>
                <dd>{engine.note}</dd>
              </div>
            </dl>
          </div>
        ))}
      />
      <h4 className={css.h4}>
        Indicative pricing <Chip tone="illustrative" />
      </h4>
      <p className={css.fine}>{PRICING_LABEL} These are not established market prices.</p>
      <DataTable caption="Indicative pricing hypotheses by customer segment" columns={["Segment", "Illustrative annual pricing"]} rows={PRICING.map((row) => [row.segment, row.price])} />
      <div id="twin-revenue" className={css.card}>
        <p className={css.cardEyebrow}>
          {TWIN_REVENUE.kind} <Chip tone={LABELS.revenue3d.tone}>{LABELS.revenue3d.text}</Chip>
        </p>
        <h4 className={css.h4}>{TWIN_REVENUE.name}</h4>
        <p className={css.cardText}>{TWIN_REVENUE.text}</p>
        <p className={css.cardEyebrow}>Potential pricing dimensions</p>
        <Tags items={TWIN_REVENUE.dimensions} label="Potential pricing dimensions for the 3D Inspection Twin" />
        <p className={css.fine}>{TWIN_REVENUE.note}</p>
      </div>
    </Block>
  );
}

export function ROICalculator() {
  return (
    <Block id="roi-calculator" title="ROI calculator" label={<Chip tone="illustrative">Illustrative assumptions</Chip>} lead="A rough estimate of what a supplier could save. The starting values are illustrative assumptions, not benchmarks; replace them with the customer's own numbers.">
      <RoiCalculator />
    </Block>
  );
}

export function BusinessModelCanvas() {
  return (
    <Block id="business-model-canvas" title="Business model canvas">
      <div className={css.canvas}>
        {BUSINESS_MODEL_CANVAS.map((cell, i) => (
          <MobileDisclosure key={cell.id} title={cell.title} defaultOpen={i === 3} area={cell.area}>
            {cell.flow ? <Flow steps={cell.items} label={cell.title} direction="column" /> : <Tags items={cell.items} label={cell.title} />}
          </MobileDisclosure>
        ))}
      </div>
    </Block>
  );
}

export function NetworkFlywheel() {
  return (
    <Block id="network-model" title="The network business model" label={<Chip tone="strategy">{LABELS.network.text}</Chip>} lead="Two ways AQIP can be bought. The second is how a supplier tool becomes a network. This network does not exist yet." executive>
      <div className={css.cols2}>
        {NETWORK_MODELS.map((model) => (
          <div key={model.id} className={css.card} data-emphasis={model.id === "b" ? "accent" : undefined}>
            <p className={css.cardEyebrow}>{model.name}</p>
            <p className={css.modelText}>{model.text}</p>
          </div>
        ))}
      </div>
      <div className={css.network}>
        <div className={css.networkTree} role="img" aria-label="An OEM connects through the AQIP network to Supplier 1, Supplier 2, Supplier 3 and onwards to Supplier N">
          <span className={css.networkNode} data-level="oem">
            OEM
          </span>
          <span className={css.networkLink} aria-hidden="true" />
          <span className={css.networkNode} data-level="hub">
            AQIP Network
          </span>
          <span className={css.networkLink} aria-hidden="true" />
          <span className={css.networkSuppliers}>
            {["Supplier 1", "Supplier 2", "Supplier 3", "…", "Supplier N"].map((name) => (
              <span key={name} className={css.networkNode}>
                {name}
              </span>
            ))}
          </span>
        </div>
        <div className={css.cols3}>
          {NETWORK_BENEFITS.map((benefit) => (
            <ListCard key={benefit.who} title={benefit.who} eyebrow="Potential benefits" items={benefit.items} />
          ))}
        </div>
      </div>
      <InView className={css.flywheel}>
        <p className={css.cardEyebrow}>The flywheel</p>
        <Flow steps={FLYWHEEL} label="The network flywheel" cycle />
      </InView>
    </Block>
  );
}

export function CompetitiveLandscape() {
  return (
    <Block id="competitive-landscape" title="Competitive landscape" lead="There is competition, and much of it is good at what it does. AQIP's strategy is not to be another ballooning tool.">
      <DataTable caption="Existing categories of software and what each does well" columns={["Existing category", "What it does well"]} rows={COMPETITIVE_CATEGORIES.map((row) => [row.category, row.strength])} />
      <p className={css.prose}>
        AQIP strategy is <strong>not</strong> “{NOT_STRATEGY}”. The differentiators below are strategic goals, not achieved advantages.
      </p>
      <ol className={css.differentiators}>
        {DIFFERENTIATORS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </Block>
  );
}

export function MoatPyramid() {
  return (
    <Block id="moat" title="The moat" lead="Seven layers, built from the bottom up. The higher the layer, the longer it takes to earn and the harder it is to copy.">
      <ol className={css.moat} reversed>
        {[...MOAT_LAYERS]
          .map((layer, i) => ({ layer, n: i + 1 }))
          .reverse()
          .map(({ layer, n }) => (
            <li key={layer} className={css.moatLayer} value={n}>
              <span className={css.moatNo}>Layer {n}</span>
              <span>{layer}</span>
            </li>
          ))}
      </ol>
      <Callout>{MOAT_MESSAGE}</Callout>
    </Block>
  );
}

export function BusinessGroup() {
  return (
    <Group id="business" kicker="Business" title="The business: revenue, model and defensibility" lead="How AQIP earns, what it costs a customer not to have it, and why the position gets stronger with use." executive>
      <RevenueEngines />
      <ROICalculator />
      <BusinessModelCanvas />
      <NetworkFlywheel />
      <CompetitiveLandscape />
      <MoatPyramid />
    </Group>
  );
}

export function SalesMotion() {
  return (
    <Block id="sales-motion" title="Sales motion" lead="Every deal follows the same path, and each step produces evidence for the next.">
      <Flow steps={SALES_MOTION} label="The sales motion, from discovery to supplier network" />
      <h4 className={css.h4}>Decision makers</h4>
      <DataTable caption="Decision makers and what each one cares about" columns={["Decision maker", "What they care about"]} rows={DECISION_MAKERS.map((row) => [row.role, row.cares])} />
      <Callout label="Sales principle">{SALES_PRINCIPLE}</Callout>
    </Block>
  );
}

export function CustomerSuccess() {
  return (
    <Block id="customer-success" title="Customer success" lead="The first ninety days with a customer decide whether they stay.">
      <div className={css.split}>
        <ol className={css.timeline}>
          {ONBOARDING.map((step) => (
            <li key={step.when}>
              <span className={css.timelineWhen}>{step.when}</span>
              <span>{step.what}</span>
            </li>
          ))}
        </ol>
        <ListCard title="Customer success metrics" items={SUCCESS_METRICS} />
      </div>
    </Block>
  );
}

export function MarketingStrategy() {
  return (
    <Block id="marketing-strategy" title="Marketing strategy" lead="No generic “AI transformation” content. Teach the category what good looks like, with evidence.">
      <div className={css.cols2}>
        <ListCard title="Educational assets to create" eyebrow={<Chip tone="planned" />} items={MARKETING_ASSETS} />
        <div className={css.card}>
          <p className={css.cardEyebrow}>
            <Chip tone="strategy">{ROUNDTABLE.label}</Chip>
          </p>
          <h4 className={css.h4}>{ROUNDTABLE.name}</h4>
          <p className={css.cardText}>{ROUNDTABLE.concept}</p>
          <Tags items={ROUNDTABLE.participants} label="Proposed participants" />
        </div>
      </div>
      <Callout label="Marketing principle">{MARKETING_PRINCIPLE}</Callout>
    </Block>
  );
}

export function GoToMarketGroup() {
  return (
    <Group id="go-to-market" kicker="Go-To-Market" title="Go-to-market: sell outcomes, then keep them" lead="How a deal is won, how a customer is made successful and how the category is taught.">
      <SalesMotion />
      <CustomerSuccess />
      <MarketingStrategy />
    </Group>
  );
}
