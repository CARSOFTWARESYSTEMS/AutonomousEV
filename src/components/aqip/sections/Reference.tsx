import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ResearcherCard from "@/components/ResearcherCard";
import { LINK_EVENTS } from "../analytics";
import { AQIP_PRINCIPLES, STRATEGIC_HIERARCHY, STRATEGIC_HIERARCHY_LABEL, STRATEGIC_MESSAGE, ULTIMATE_PRODUCT } from "../data/overview";
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
    <Group id="reference" kicker="Reference" title="FAQ, glossary and sources" lead="Short answers, plain definitions and where to check the facts.">
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
      <h3 className={css.h3}>The ecosystem and each name&apos;s role</h3>
      <p className={css.blockLead}>Four distinct roles. EV Society™ and iTelematics® Software Private Limited are separate organisations; EV.ENGINEER™ and UFlight™ are brands, not companies.</p>
      <ul className={css.cols4}>
        {ORGANISATIONS.map((organisation) => {
          const event = organisation.id === "ev-society" ? LINK_EVENTS.evSociety : organisation.id === "itelematics" ? LINK_EVENTS.iTelematics : LINK_EVENTS.ecosystem;
          return (
            <li key={organisation.id} className={css.card}>
              <p className={css.cardEyebrow}>{organisation.role}</p>
              <h4 className={css.h4}>{organisation.name}</h4>
              <p className={css.cardText}>{organisation.line}</p>
              {organisation.external ? (
                <a href={organisation.href} target="_blank" rel="noopener noreferrer" className={css.textLink} data-track-event={event} data-track-destination={organisation.id} data-track-placement="attribution">
                  {organisation.linkLabel}
                  <span className={css.srOnly}> (opens in a new tab)</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ) : (
                <Link href={organisation.href} className={css.textLink} data-track-event={event} data-track-destination={organisation.id} data-track-placement="attribution">
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

export function FinalPrinciples() {
  return (
    <div id="principles-final" className={css.finalPrinciples}>
      <h3 className={css.h3}>The AQIP principles</h3>
      <ol className={css.principles}>
        {AQIP_PRINCIPLES.map((principle) => (
          <li key={principle.name}>
            <h4 className={css.h4}>{principle.name}</h4>
            <p className={css.cardText}>{principle.text}</p>
          </li>
        ))}
      </ol>
      <div className={css.ultimate}>
        <h4 className={css.h4}>Trust</h4>
        <p className={css.cardText}>AQIP&apos;s ultimate product is not {ULTIMATE_PRODUCT.not.slice(0, -1).join(", not ")} and not {ULTIMATE_PRODUCT.not[ULTIMATE_PRODUCT.not.length - 1]}.</p>
        <p className={css.ultimateText}>{ULTIMATE_PRODUCT.is}</p>
      </div>
    </div>
  );
}

export function Closing() {
  return (
    <section id="closing" className={css.closing} aria-labelledby="closing-title">
      <div className={css.container}>
        <p className={css.closingLead}>
          <strong>{STRATEGIC_MESSAGE.not}</strong> {STRATEGIC_MESSAGE.connects}
        </p>
        <h2 id="closing-title" className={css.closingTitle}>
          {STRATEGIC_MESSAGE.proves}
        </h2>
        <p className={css.closingVision}>{STRATEGIC_MESSAGE.longTerm}</p>
        <Flow steps={STRATEGIC_HIERARCHY.map((step) => step.label)} label={STRATEGIC_HIERARCHY_LABEL} />
        <div className={css.ctaRow}>
          {CTAS.map((cta) => (
            <Link key={cta.id} href={cta.href} className={css.btn} data-kind={cta.kind} data-track-event={LINK_EVENTS.cta} data-track-cta={cta.id}>
              {cta.label}
            </Link>
          ))}
        </div>
        <p className={css.fine}>These links use the site&apos;s existing contact pages. AQIP is at an early stage; a conversation starts with your current FAI process, not a product demonstration.</p>
        <FinalPrinciples />
        <DesignedBy />
        <OrganisationAttribution />
      </div>
    </section>
  );
}
