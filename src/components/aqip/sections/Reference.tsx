import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ResearcherCard from "@/components/ResearcherCard";
import { LINK_EVENTS } from "../analytics";
import { FINAL_MESSAGE } from "../data/execution";
import { STRATEGIC_HIERARCHY } from "../data/overview";
import { CTAS, FAQ as FAQ_ITEMS, GLOSSARY, ORGANISATIONS, SOURCES, SOURCES_NOTE } from "../data/reference";
import GlossarySearch from "../interactive/Glossary";
import { Block, Disclosure, Flow, Group } from "../ui/primitives";
import css from "../aqip.module.css";

export function FAQ() {
  return (
    <Block id="faq" title="Frequently asked questions">
      <div className={css.faq}>
        {FAQ_ITEMS.map((item) => (
          <Disclosure key={item.q} summary={item.q}>
            <p className={css.cardText}>{item.a}</p>
          </Disclosure>
        ))}
      </div>
    </Block>
  );
}

export function Glossary() {
  return (
    <Block id="glossary" title="Glossary" lead="The terms and acronyms used on this page.">
      <GlossarySearch terms={GLOSSARY} />
    </Block>
  );
}

export function Sources() {
  return (
    <Block id="sources" title="Sources & standards" lead="The official bodies and standards this page refers to. Numbers match the citations in the text.">
      <ol className={css.sources}>
        {SOURCES.map((source) => (
          <li key={source.n} id={`source-${source.n}`} value={source.n}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className={css.sourceLink} data-track-event={LINK_EVENTS.source} data-track-source={`source-${source.n}`}>
              {source.name}
              <span className={css.srOnly}> (opens in a new tab)</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <span className={css.sourceCovers}>{source.covers}</span>
            <span className={css.sourceUrl}>{source.url}</span>
          </li>
        ))}
      </ol>
      <p className={css.fine}>{SOURCES_NOTE}</p>
    </Block>
  );
}

export function ReferenceGroup() {
  return (
    <Group id="reference" index={17} kicker="Reference" title="FAQ, glossary and sources" lead="Short answers, plain definitions and where to check the facts.">
      <FAQ />
      <Glossary />
      <Sources />
    </Group>
  );
}

export function DesignedBy() {
  return (
    <section className={css.designedBy} aria-label="Designed by">
      <ResearcherCard profileLinkProps={{ "data-track-event": LINK_EVENTS.profile, "data-track-placement": "designed_by" }} />
    </section>
  );
}

export function OrganisationAttribution() {
  return (
    <div id="attribution" className={css.attribution}>
      <h3 className={css.h3}>The organisations and their roles</h3>
      <p className={css.blockLead}>Three distinct roles. EV Society™ and iTelematics® Software Private Limited are separate organisations.</p>
      <ul className={css.cols3}>
        {ORGANISATIONS.map((organisation) => {
          const event = organisation.id === "ev-society" ? LINK_EVENTS.evSociety : organisation.id === "itelematics" ? LINK_EVENTS.iTelematics : LINK_EVENTS.cta;
          return (
            <li key={organisation.id} className={css.card}>
              <p className={css.cardEyebrow}>{organisation.role}</p>
              <h4 className={css.h4}>{organisation.name}</h4>
              <p className={css.cardText}>{organisation.line}</p>
              {organisation.external ? (
                <a href={organisation.href} target="_blank" rel="noopener noreferrer" className={css.textLink} data-track-event={event}>
                  {organisation.linkLabel}
                  <span className={css.srOnly}> (opens in a new tab)</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ) : (
                <Link href={organisation.href} className={css.textLink} data-track-event={event} data-track-cta="ev-engineer-home">
                  {organisation.linkLabel}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Closing() {
  return (
    <section id="closing" className={css.closing} aria-labelledby="closing-title">
      <div className={css.container}>
        <p className={css.closingLead}>{FINAL_MESSAGE[0]}</p>
        <h2 id="closing-title" className={css.closingTitle}>
          {FINAL_MESSAGE[1]}
        </h2>
        <p className={css.closingVision}>{FINAL_MESSAGE[2]}</p>
        <Flow steps={STRATEGIC_HIERARCHY.map((step) => step.label)} label="FAI Engineer to AQIP to Aerospace Quality Network to Aerospace Manufacturing Trust Infrastructure" />
        <div className={css.ctaRow}>
          {CTAS.map((cta) => (
            <Link key={cta.id} href={cta.href} className={css.btn} data-kind={cta.kind} data-track-event={LINK_EVENTS.cta} data-track-cta={cta.id}>
              {cta.label}
            </Link>
          ))}
        </div>
        <p className={css.fine}>These links use the site&apos;s existing contact pages. AQIP is at an early stage; a conversation starts with your current FAI process, not a product demonstration.</p>
        <DesignedBy />
        <OrganisationAttribution />
      </div>
    </section>
  );
}
