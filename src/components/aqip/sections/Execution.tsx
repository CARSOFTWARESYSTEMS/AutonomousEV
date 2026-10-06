import { ANTI_PATTERNS, METRIC_GROUPS, NORTH_STAR, PLAYBOOK, RISKS, RISK_NOTE } from "../data/execution";
import DecisionFrameworkTool from "../interactive/DecisionFramework";
import NinetyDayChecklist from "../interactive/NinetyDayChecklist";
import type { Level } from "../types";
import { Block, Chip, DataTable, Disclosure, Group } from "../ui/primitives";
import css from "../aqip.module.css";

export function DecisionFramework() {
  return (
    <Block id="decision-framework" title="Management decision framework" lead="Six questions for any proposed feature. Tick the ones it genuinely answers yes to.">
      <DecisionFrameworkTool />
    </Block>
  );
}

export function FounderPlaybook() {
  return (
    <Block id="founder-playbook" title="Founder playbook">
      <Disclosure summary="How to Start AQIP From Scratch: twelve steps, in order" open>
        <ol className={css.playbook}>
          {PLAYBOOK.map((item) => (
            <li key={item.step}>
              <h4 className={css.h4}>{item.step}</h4>
              <p className={css.cardText}>{item.text}</p>
            </li>
          ))}
        </ol>
      </Disclosure>
    </Block>
  );
}

export function AntiPatterns() {
  return (
    <Block id="what-not-to-do" title="What not to do" lead="Each of these has ended companies like this one.">
      <ul className={css.warnings}>
        {ANTI_PATTERNS.map((item) => (
          <li key={item.dont}>
            <span className={css.warningMark} aria-hidden="true">
              ✕
            </span>
            <p>
              <strong>Do not {item.dont.charAt(0).toLowerCase() + item.dont.slice(1)}.</strong> {item.because}
            </p>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export function ExecutionGroup() {
  return (
    <Group id="execution" kicker="Execution" title="Execution: how to decide, how to start and what to avoid" lead="The operating habits that keep a small team on the right problem.">
      <DecisionFramework />
      <FounderPlaybook />
      <AntiPatterns />
    </Group>
  );
}

export function MetricsDashboard() {
  return (
    <Block id="core-metrics" title="Core business metrics" label={<Chip tone="target">Targets to track</Chip>} lead="What the company will measure. No values are shown, because there are no production results to report yet.">
      <div className={css.cols4}>
        {METRIC_GROUPS.map((group) => (
          <div key={group.group} className={css.card}>
            <h4 className={css.h4}>{group.group}</h4>
            <ul className={css.metrics}>
              {group.metrics.map((metric) => (
                <li key={metric}>
                  <span>{metric}</span>
                  <Chip tone={group.label} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Block>
  );
}

export function NorthStarMetric() {
  return (
    <Block id="north-star" title="North star metric">
      <div className={css.northStar}>
        <div>
          <p className={css.cardEyebrow}>North star</p>
          <p className={css.northStarMetric}>{NORTH_STAR.metric}</p>
          <p className={css.prose}>{NORTH_STAR.explanation}</p>
        </div>
        <div className={css.northStarExample}>
          <Chip tone="illustrative">{NORTH_STAR.exampleLabel}</Chip>
          <p className={css.northStarValue}>{NORTH_STAR.example}</p>
          <p className={css.fine}>{NORTH_STAR.exampleNote}</p>
        </div>
      </div>
    </Block>
  );
}

export function MetricsGroup() {
  return (
    <Group id="metrics" kicker="Metrics" title="Metrics: what the company measures" lead="Customer outcome first, then product, business and trust.">
      <MetricsDashboard />
      <NorthStarMetric />
    </Group>
  );
}

const LEVELS: readonly Level[] = ["Low", "Medium", "High"];

function RiskMatrix() {
  return (
    <div className={css.matrix} role="img" aria-label="Risk matrix: impact on the vertical axis, probability on the horizontal. The table below lists every risk with the same classification.">
      <span className={css.matrixAxisY} aria-hidden="true">
        Impact
      </span>
      <div className={css.matrixGrid} aria-hidden="true">
        {[...LEVELS].reverse().map((impact) => (
          <div key={impact} className={css.matrixRow}>
            <span className={css.matrixLevel}>{impact}</span>
            {LEVELS.map((probability) => {
              const severity = LEVELS.indexOf(impact) + LEVELS.indexOf(probability);
              return (
                <span key={probability} className={css.matrixCell} data-severity={severity}>
                  {RISKS.filter((risk) => risk.impact === impact && risk.probability === probability).map((risk) => (
                    <span key={risk.id} className={css.matrixRisk}>
                      {risk.id}
                    </span>
                  ))}
                </span>
              );
            })}
          </div>
        ))}
        <div className={css.matrixRow}>
          <span />
          {LEVELS.map((probability) => (
            <span key={probability} className={css.matrixLevel}>
              {probability}
            </span>
          ))}
        </div>
      </div>
      <span className={css.matrixAxisX} aria-hidden="true">
        Probability
      </span>
    </div>
  );
}

export function RiskRegister() {
  return (
    <Block id="risk-register" title="Risk register" label={<Chip tone="example">Sample classifications</Chip>} lead={RISK_NOTE}>
      <RiskMatrix />
      <DataTable
        caption="Risk register: probability, impact, mitigation, owner and early warning indicator for each risk"
        columns={["Risk", "Probability", "Impact", "Mitigation", "Owner", "Early warning indicator"]}
        rows={RISKS.map((risk) => [`${risk.id} · ${risk.risk}`, risk.probability, risk.impact, risk.mitigation, risk.owner, risk.warning])}
      />
    </Block>
  );
}

export function RisksGroup() {
  return (
    <Group id="risks" kicker="Risks" title="Risks: what could go wrong, and who watches for it" lead="Sixteen risks with an owner and an early warning sign for each.">
      <RiskRegister />
    </Group>
  );
}

export function Execution90Day() {
  return (
    <Group id="90-day-plan" kicker="90-Day Plan" title="The 90-day execution plan" lead="A founder's checklist for the first three months. Tick items off as they are done." executive>
      <Block id="ninety-day-checklist" title="Founder checklist" executive>
        <NinetyDayChecklist />
      </Block>
    </Group>
  );
}
