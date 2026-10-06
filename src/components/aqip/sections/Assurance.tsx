import {
  AGENTS,
  AGENT_BOUNDS,
  AI_ASSURANCE,
  AI_EVOLUTION,
  AI_MITIGATIONS,
  AI_THREATS,
  DOCUMENT_AI,
  ENGINEERING_AI,
  ENGINEERING_AI_NOTE,
  ENGINEERING_AI_STORES,
  GOVERNANCE_CONTROLS,
  GOVERNANCE_FLOW,
  PROVENANCE,
  SECURE_RAG,
  WORKFLOW_AI_FLOW,
} from "../data/ai";
import { AQIP } from "../data/overview";
import { AI_GOVERNANCE, AI_MAY_ASSIST, AI_MUST_NOT } from "../data/product";
import HitlPanel from "../interactive/HitlPanel";
import InView from "../interactive/InView";
import MasterDetail from "../interactive/MasterDetail";
import { Block, Callout, Chip, DataTable, Flow, Group, ListCard, Tags } from "../ui/primitives";
import css from "../aqip.module.css";
import pillars from "../pillars.module.css";

export function AiEvolution() {
  return (
    <Block id="ai-evolution" title="From document AI to quality intelligence" lead="Five stages. Each is only useful once the one before it can be trusted, and the labels say how far along each is.">
      <Flow steps={AI_EVOLUTION.map((stage) => ({ label: stage.stage, note: stage.text, tone: stage.maturity }))} label="How AI-driven quality workflows are meant to evolve" />
      <div className={css.cols2}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Document AI</p>
          <Tags items={DOCUMENT_AI} label="Document AI capabilities" />
          <p className={css.cardText}>Turns a drawing, a certificate or a report into fields a person and a workflow can check.</p>
        </div>
        <div className={css.card} data-emphasis="accent">
          <p className={css.cardEyebrow}>Engineering AI</p>
          <Tags items={ENGINEERING_AI} label="Engineering AI capabilities" />
          <p className={css.cardText}>{ENGINEERING_AI_NOTE}</p>
          <p className={css.cardEyebrow}>Stored with every result</p>
          <Tags items={ENGINEERING_AI_STORES} label="What is stored with every engineering AI result" />
        </div>
      </div>
    </Block>
  );
}

export function WorkflowAi() {
  return (
    <Block id="workflow-ai" title="Workflow AI: assistance inside a controlled workflow" label={<Chip tone="planned-y1" />}>
      <Flow steps={WORKFLOW_AI_FLOW} label="A drawing's path from AI extraction to authorised approval" />
      <Callout>{AI_ASSURANCE.rule}</Callout>
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

export function BoundedAgents() {
  return (
    <Block
      id="agents"
      title="Agentic AI: nine bounded agents"
      label={<Chip tone="research">Research / long-term</Chip>}
      lead="One general assistant with broad access would be easy to build and impossible to trust. AQIP's design is the opposite: specialist agents, each with a narrow job and a stated limit. None is production software today."
    >
      <MasterDetail
        label="Bounded agents"
        event="aqip_agent_select"
        items={AGENTS.map((agent) => ({ id: agent.id, label: agent.name, meta: <Chip tone={agent.maturity} /> }))}
        panels={AGENTS.map((agent) => (
          <div key={agent.id}>
            <h4 className={css.h4}>{agent.name}</h4>
            <p className={css.roleSummary}>{agent.purpose}</p>
            <div className={pillars.permissions}>
              <div data-kind="can">
                <p className={css.cardEyebrow}>Can</p>
                <ul className={pillars.permissionList}>
                  {agent.can.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-kind="cannot">
                <p className={css.cardEyebrow}>Cannot</p>
                <ul className={pillars.permissionList}>
                  {agent.cannot.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      />
      <h4 className={css.h4}>What every agent is given</h4>
      <ul className={css.cardGrid} data-plain="">
        {AGENT_BOUNDS.map((bound) => (
          <li key={bound.name} className={css.card}>
            <p className={css.valueName}>{bound.name}</p>
            <p className={css.cardText}>{bound.text}</p>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export function HumanInTheLoop() {
  return (
    <Block
      id="hitl"
      title="Human-in-the-loop control panel"
      label={<Chip tone="future">Concept with synthetic data</Chip>}
      lead={`${AQIP.safetyPrinciple}, as an interface: an AI result and a geometry candidate, each waiting for a person. Choose an action to see the status it takes and what the record keeps.`}
    >
      <HitlPanel />
    </Block>
  );
}

export function AiProvenance() {
  return (
    <Block id="ai-provenance" title="AI provenance" label={<Chip tone="planned-y1" />} lead="Every important AI-assisted result keeps the trail that produced it.">
      <Callout label="The question AQIP should always be able to answer">{AI_ASSURANCE.question}</Callout>
      <DataTable caption="What is preserved with every important AI-assisted result" columns={["Preserved", "What is kept"]} rows={PROVENANCE.map((row) => [row.field, row.kept])} />
    </Block>
  );
}

export function ModelGovernance() {
  return (
    <Block id="model-governance" title="AI model governance" label={<Chip tone="planned-y1" />} lead="A model or an agent is released the way a measuring instrument is: checked before use, watched in use, and re-checked.">
      <InView className={css.flywheel}>
        <p className={css.cardEyebrow}>The lifecycle</p>
        <Flow steps={GOVERNANCE_FLOW} label="The lifecycle of a model or agent, from benchmark to revalidation" cycle />
      </InView>
      <ul className={css.cardGrid} data-plain="">
        {GOVERNANCE_CONTROLS.map((control) => (
          <li key={control.name} className={css.card}>
            <p className={css.valueName}>{control.name}</p>
            <p className={css.cardText}>{control.text}</p>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export function AiSecurity() {
  return (
    <Block id="ai-security" title="AI security" label={<Chip tone="planned">Design requirements</Chip>} lead="An AI component reads documents that someone else wrote. That makes it an attack surface, and it is designed as one.">
      <div className={css.cols2}>
        <ListCard title="Threats" items={AI_THREATS} emphasis="warn" />
        <ListCard title="Mitigations" items={AI_MITIGATIONS} emphasis="accent" />
      </div>
    </Block>
  );
}

export function SecureRag() {
  return (
    <Block id="secure-rag" title="Secure knowledge retrieval" label={<Chip tone="vision" />} lead="A future AQIP may answer questions from a customer's own knowledge. It would retrieve only what that user is authorised to see.">
      <div className={css.split}>
        <div className={css.card}>
          <p className={css.cardEyebrow}>Authorised sources only</p>
          <Tags items={SECURE_RAG.sources} label="Sources a knowledge system may retrieve from" />
        </div>
        <ListCard title="Rules" items={SECURE_RAG.rules} emphasis="accent" />
      </div>
    </Block>
  );
}

export function AiAssuranceGroup() {
  return (
    <Group id="ai-assurance" kicker="AI Assurance" title={AI_ASSURANCE.title} lead="AI interprets. Humans approve. Software proves. This section is how the first of those is kept honest.">
      <AiEvolution />
      <WorkflowAi />
      <AIGovernance />
      <BoundedAgents />
      <HumanInTheLoop />
      <AiProvenance />
      <ModelGovernance />
      <AiSecurity />
      <SecureRag />
    </Group>
  );
}
