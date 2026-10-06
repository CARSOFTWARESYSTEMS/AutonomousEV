import { AI_METRICS, CHANNELS, CHANNEL_LABEL, CLUSTERS, DISCOVERY, DISCOVERY_TOPICS, PMF_SIGNALS, PMF_STRONGEST, SEGMENTS, VALIDATION_MEASURES, VALIDATION_RULE } from "../data/customers";
import { CustomerScorecard as Scorecard } from "../interactive/Lazy";
import MasterDetail from "../interactive/MasterDetail";
import { Block, Callout, Chip, DataTable, Group, Tags } from "../ui/primitives";
import css from "../aqip.module.css";

export function CustomerSegments() {
  return (
    <Block id="customer-segments" title="Customer segments" lead="Start narrow. The pyramid is read from the top: the first customers are few and specific, and each later tier is opened only after the one above it works.">
      <ol className={css.pyramid}>
        {SEGMENTS.map((segment) => (
          <li key={segment.stage} className={css.tier}>
            <p className={css.cardEyebrow}>{segment.stage}</p>
            <h4 className={css.h4}>{segment.title}</h4>
            <Tags items={segment.items} />
          </li>
        ))}
      </ol>
    </Block>
  );
}

export function CustomerMap() {
  return (
    <Block id="where-to-find-customers" title="Where to find customers" lead="A practical map for the first hundred conversations. These are places to look, not relationships that exist.">
      <div className={css.cols2}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>India clusters to explore</p>
          <Tags items={CLUSTERS} label="Clusters to explore" />
        </div>
        <div className={css.card}>
          <p className={css.cardEyebrow}>
            Channels <Chip tone="strategy">{CHANNEL_LABEL}</Chip>
          </p>
          <Tags items={CHANNELS} label="Potential customer discovery channels" />
          <p className={css.cardText}>None of these organisations or events is a partner of AQIP. Each is a potential customer discovery channel.</p>
        </div>
      </div>
    </Block>
  );
}

export function CustomerDiscovery() {
  return (
    <Block id="customer-discovery" title="Customer discovery manual: how to interview an aerospace MSME" lead="The purpose of the first conversation is to understand how the work is really done. It is not a pitch.">
      <div className={css.cols2}>
        <Callout kind="safety" label="Do not open with">
          “{DISCOVERY.avoid}”
        </Callout>
        <Callout label="Recommended opening">{DISCOVERY.opening}</Callout>
      </div>
      <MasterDetail
        label="Interview topics"
        event="aqip_customer_playbook_open"
        items={DISCOVERY_TOPICS.map((topic) => ({ id: topic.id, label: topic.topic }))}
        panels={DISCOVERY_TOPICS.map((topic) => (
          <div key={topic.id}>
            <h4 className={css.h4}>{topic.topic}</h4>
            <ul className={css.questions}>
              {topic.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            <p className={css.fine}>
              <strong>Listen for:</strong> {topic.listenFor}
            </p>
          </div>
        ))}
      />
      <div className={css.cols2}>
        <Callout label="Ask">{DISCOVERY.validationAsk}</Callout>
        <Callout kind="safety" label="Do not ask only">
          “{DISCOVERY.validationAvoid}”
        </Callout>
      </div>
    </Block>
  );
}

export function CustomerScorecard() {
  return (
    <Block id="interview-scorecard" title="Customer interview scorecard" lead="After an interview, score what you heard. The indicator shows how good a pilot candidate the company is. It is a prompt for judgement, not a replacement for it.">
      <Scorecard />
    </Block>
  );
}

export function CustomersGroup() {
  return (
    <Group id="customers" kicker="Customers" title="Customers: who to serve first and how to learn from them" lead="An initial customer profile, where to find it, what to ask and how to score the answer.">
      <CustomerSegments />
      <CustomerMap />
      <CustomerDiscovery />
      <CustomerScorecard />
    </Group>
  );
}

export function ValidationFramework() {
  return (
    <Block id="product-validation" title="Product validation manual" lead="Run the same job both ways and record every measure for each. A claim of improvement needs both columns.">
      <div className={css.versus}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Existing process</p>
          <p className={css.cardText}>The PDF, manual ballooning, spreadsheets and re-typed results the customer uses today.</p>
        </div>
        <span className={css.versusMark} aria-hidden="true">
          VS
        </span>
        <div className={css.card} data-emphasis="accent">
          <p className={css.cardEyebrow}>AQIP process</p>
          <p className={css.cardText}>Assisted extraction, human verification, imported results and linked evidence, on the same drawing.</p>
        </div>
      </div>
      <DataTable caption="What to measure when comparing the existing process with the AQIP process" columns={["Measure", "How to measure it"]} rows={VALIDATION_MEASURES.map((row) => [row.measure, row.how])} />
      <h4 className={css.h4}>Evaluating the AI: do not use only “accuracy”</h4>
      <DataTable caption="AI evaluation metrics" columns={["Metric", "What it tells you"]} rows={AI_METRICS.map((row) => [row.metric, row.meaning])} />
      <Callout kind="safety" label="Critical rule">
        {VALIDATION_RULE}
      </Callout>
    </Block>
  );
}

export function PMFSignals() {
  return (
    <Block id="product-market-fit" title="Product-market fit" lead="A demo is NOT product-market fit. These are the signals that count, because each one costs the customer something.">
      <div className={css.split}>
        <ol className={css.signals}>
          {PMF_SIGNALS.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ol>
        <Callout label="The strongest signal">{PMF_STRONGEST}</Callout>
      </div>
    </Block>
  );
}

export function ValidationGroup() {
  return (
    <Group id="validation" kicker="Validation" title="Validation: prove it works before claiming it does" lead="Measure the product against the customer's existing process, and measure demand by what customers do.">
      <ValidationFramework />
      <PMFSignals />
    </Group>
  );
}
