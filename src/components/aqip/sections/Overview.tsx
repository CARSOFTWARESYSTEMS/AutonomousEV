import { AQIP, CONNECTS, CORE_PROBLEM, EXECUTIVE_SUMMARY, FRAGMENTS, MARKET_DRIVERS, PROBLEM_FLOW, STAKEHOLDERS, STRATEGIC_HIERARCHY, WHERE_WE_ARE_GOING, WHERE_WE_START } from "../data/overview";
import { PROBLEMS, PROBLEM_FIELDS, type Problem } from "../data/problems";
import InView from "../interactive/InView";
import MasterDetail from "../interactive/MasterDetail";
import { Block, Callout, Chip, Flow, Group, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";

export function ExecutiveSummary() {
  return (
    <Group id="overview" kicker="Overview" title="What is AQIP?" lead={AQIP.longTermVision} executive>
      <Block id="executive-summary" title="Executive summary" executive>
        <div className={css.split}>
          <div>
            <p className={css.prose}>{EXECUTIVE_SUMMARY}</p>
            <p className={css.fine}>
              Strategy last reviewed: <time dateTime={AQIP.reviewed}>{AQIP.reviewedLabel}</time>. Planning horizon: {AQIP.horizon}.
            </p>
          </div>
          <ListCard title="What AQIP is intended to connect" items={CONNECTS} />
        </div>
      </Block>

      <Block title="Where we start, and where we are going" executive>
        <div className={css.cols2}>
          <div className={css.card}>
            <p className={css.cardEyebrow}>Where we start</p>
            <Flow steps={WHERE_WE_START} label="Where AQIP starts" direction="wrap" />
            <p className={css.cardText}>FAI is the initial market entry wedge.</p>
          </div>
          <div className={css.card} data-emphasis="accent">
            <p className={css.cardEyebrow}>Where we are going</p>
            <Flow steps={WHERE_WE_ARE_GOING} label="Where AQIP is going" direction="wrap" />
            <p className={css.cardText}>Long-term destination: Aerospace Manufacturing Trust Infrastructure.</p>
          </div>
        </div>
      </Block>

      <Block title="The strategic hierarchy" lead="Where the initiative starts, how the platform expands, how the network develops and what it can ultimately become." executive>
        <Flow steps={STRATEGIC_HIERARCHY} label="Strategic hierarchy, from the prototype to the long-term vision" />
      </Block>

      <Block title="Who is behind AQIP">
        <p className={css.prose}>{AQIP.relationship}</p>
        <p className={css.fine}>
          EV Society™ and iTelematics® Software Private Limited are separate organisations with different roles.{" "}
          <a href="#attribution" className={css.textLink}>
            See the organisations and their roles
          </a>
          .
        </p>
      </Block>
    </Group>
  );
}

export function IndiaOpportunity() {
  return (
    <Group
      id="opportunity"
      kicker="Opportunity"
      title="Why now: the India opportunity"
      lead="What is changing in Indian aerospace and defence manufacturing, described as market drivers rather than market-size claims."
    >
      <Block title="Market drivers" label={<Chip tone="current">Qualitative</Chip>}>
        <ol className={css.cardGrid} data-plain="">
          {MARKET_DRIVERS.map((driver) => (
            <li key={driver.title} className={css.card}>
              <h4 className={css.h4}>{driver.title}</h4>
              <p className={css.cardText}>{driver.text}</p>
              {driver.sources ? (
                <p className={css.cites}>
                  Sources:{" "}
                  {driver.sources.map((n) => (
                    <a key={n} href={`#source-${n}`} className={css.cite} aria-label={`Source ${n}`}>
                      [{n}]
                    </a>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        <Callout kind="note" label="A note on numbers">
          This page gives no TAM, SAM or SOM figures. No verified market-size data is published in this project, so none is claimed here.
        </Callout>
      </Block>
    </Group>
  );
}

function ProblemPanel({ problem }: { problem: Problem }) {
  return (
    <div>
      <h4 className={css.h4}>
        {problem.code} · {problem.title}
      </h4>
      <dl className={css.kv}>
        {PROBLEM_FIELDS.map((field) => (
          <div key={field.key}>
            <dt>{field.label}</dt>
            <dd>{problem[field.key]}</dd>
          </div>
        ))}
        <div>
          <dt>Product phase</dt>
          <dd>
            <Chip tone={problem.phase} /> {problem.phaseNote}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function CoreProblem() {
  return (
    <Block id="core-problem" title="The core industry problem" executive>
      <Callout>{CORE_PROBLEM}</Callout>
      <div className={css.fragmentation}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Today: the evidence is scattered</p>
          <Tags items={FRAGMENTS} label="Where quality evidence lives today" />
          <p className={css.cardText}>Each step is recorded in a different place, by a different person, in a different format.</p>
        </div>
        <Flow steps={PROBLEM_FLOW} label="The path from engineering intent to quality approval" direction="column" />
        <div className={css.card} data-emphasis="accent">
          <p className={css.cardEyebrow}>
            With AQIP <Chip tone="planned" />
          </p>
          <p className={css.cardText}>One connected record. Each of those sources is linked to the requirement it supports; none of them has to be thrown away.</p>
          <p className={css.cardText}>The question “what proves this characteristic?” gets a direct answer.</p>
        </div>
      </div>
    </Block>
  );
}

export function ProblemExplorer() {
  return (
    <Block id="top-10-problems" title="Top 10 problems AQIP will solve" lead="Select a problem to see how it is handled today, what goes wrong, and what AQIP is planned to do about it.">
      <MasterDetail
        label="The ten problems"
        event="aqip_problem_expand"
        items={PROBLEMS.map((problem) => ({ id: problem.id, code: problem.code, label: problem.title, meta: <Chip tone={problem.phase} /> }))}
        panels={PROBLEMS.map((problem) => (
          <ProblemPanel key={problem.id} problem={problem} />
        ))}
      />
    </Block>
  );
}

export function StakeholderValue() {
  return (
    <Block id="win-win" title="Win-Win-Win-Win" lead="AQIP is worth building only if every party gains. Each gives something to the shared record and gets something back.">
      <InView className={css.valueLoop}>
        <p className={css.valueHub}>
          <span>Shared, trusted quality evidence</span>
        </p>
        {STAKEHOLDERS.map((stakeholder) => (
          <div key={stakeholder.id} className={css.card} data-stakeholder={stakeholder.id}>
            <h4 className={css.h4}>{stakeholder.name}</h4>
            <p className={css.valueGives}>
              <span className={css.valueArrow} aria-hidden="true" />
              {stakeholder.gives}
            </p>
            <p className={css.cardEyebrow}>Wins</p>
            <ul className={css.list}>
              {stakeholder.wins.map((win) => (
                <li key={win}>{win}</li>
              ))}
            </ul>
          </div>
        ))}
      </InView>
    </Block>
  );
}

export function ProblemsGroup() {
  return (
    <Group id="problems" kicker="Problems" title="The problems AQIP solves" lead="One core problem, ten places it shows up, and who gains when it is solved." executive>
      <CoreProblem />
      <ProblemExplorer />
      <StakeholderValue />
    </Group>
  );
}
