import { FUNDING_PRINCIPLE, FUNDING_STAGES, INVESTOR_THESIS, MISSION, ORG_STAGES, ROLES, VALUES, VISION, VISION_SUPPORT } from "../data/company";
import MasterDetail from "../interactive/MasterDetail";
import { Block, Callout, Chip, Group, ListCard } from "../ui/primitives";
import css from "../aqip.module.css";

export function VisionMissionValues() {
  return (
    <>
      <Block id="vision-mission" title="Vision and mission" executive>
        <div className={css.cols2}>
          <div className={css.statement}>
            <p className={css.cardEyebrow}>Vision</p>
            <p className={css.statementText}>{VISION}</p>
            <p className={css.cardText}>{VISION_SUPPORT}</p>
          </div>
          <div className={css.statement}>
            <p className={css.cardEyebrow}>Mission</p>
            <p className={css.statementText}>{MISSION}</p>
          </div>
        </div>
      </Block>
      <Block id="core-values" title="Core values">
        <ul className={css.cardGrid} data-plain="">
          {VALUES.map((value) => (
            <li key={value.name} className={css.card}>
              <h4 className={css.valueName}>{value.name}</h4>
              <p className={css.cardText}>{value.text}</p>
            </li>
          ))}
        </ul>
      </Block>
    </>
  );
}

export function ExecutiveRoles() {
  return (
    <Block id="executive-roles" title="Leadership: the executive operating model" lead="Ten roles and what each is accountable for. In a small team one person holds several; the responsibilities still need an owner.">
      <MasterDetail
        label="Executive roles"
        event="aqip_role_select"
        items={ROLES.map((role) => ({ id: role.id, label: role.title }))}
        panels={ROLES.map((role) => (
          <div key={role.id}>
            <h4 className={css.h4}>{role.title}</h4>
            <p className={css.roleSummary}>{role.summary}</p>
            <p className={css.cardEyebrow}>Responsibilities</p>
            <ul className={css.listCols}>
              {role.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {role.principle ? <Callout label={role.principleLabel}>{role.principle}</Callout> : null}
          </div>
        ))}
      />
    </Block>
  );
}

export function OrganisationRoadmap() {
  return (
    <Block id="organisational-roadmap" title="Organisational roadmap" label={<Chip tone="target">Planning targets</Chip>} lead="How the team is expected to grow. Hire for the stage the company is in.">
      <div className={css.cols3}>
        {ORG_STAGES.map((stage) => (
          <ListCard key={stage.size} title={stage.size} eyebrow={stage.heading} items={stage.items} />
        ))}
      </div>
    </Block>
  );
}

export function LeadershipGroup() {
  return (
    <Group id="leadership" kicker="Leadership" title="Leadership: vision, values and who owns what" lead="What the company is for, what it stands on and how responsibility is divided." executive>
      <VisionMissionValues />
      <ExecutiveRoles />
      <OrganisationRoadmap />
    </Group>
  );
}

export function InvestorThesis() {
  return (
    <Block id="investor-thesis" title="Investor thesis" lead="Seven questions an investor will ask, answered briefly. No valuation is claimed anywhere on this page." executive>
      <dl className={css.thesis} data-plain="">
        {INVESTOR_THESIS.map((item) => (
          <div key={item.question} className={css.card}>
            <dt className={css.thesisQuestion}>{item.question}</dt>
            <dd>
              <p className={css.cardText}>{item.answer}</p>
              {item.points ? (
                <ul className={css.list}>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

export function FundingRoadmap() {
  return (
    <Block id="funding-strategy" title="Funding strategy" lead="Four stages, each unlocked by evidence from the one before." executive>
      <ol className={css.stages}>
        {FUNDING_STAGES.map((stage) => (
          <li key={stage.stage} className={css.card}>
            <p className={css.cardEyebrow}>{stage.stage}</p>
            <h4 className={css.h4}>{stage.name}</h4>
            <dl className={css.kv}>
              <div>
                <dt>Capital</dt>
                <dd>{stage.source}</dd>
              </div>
              <div>
                <dt>Objective</dt>
                <dd>{stage.objective}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>{stage.when}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <Callout label="Principle">{FUNDING_PRINCIPLE}</Callout>
    </Block>
  );
}

export function InvestorGroup() {
  return (
    <Group id="investor" kicker="Investor" title="Investor thesis and funding strategy" lead="Why this could become a large company, and how it should be financed on the way." executive>
      <InvestorThesis />
      <FundingRoadmap />
    </Group>
  );
}
