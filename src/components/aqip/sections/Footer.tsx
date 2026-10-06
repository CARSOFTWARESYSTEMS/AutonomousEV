import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LINK_EVENTS } from "../analytics";
import { AQIP } from "../data/overview";
import { ECOSYSTEM, FOOTER_COMPANY, FOOTER_DESIGNED_BY, FOOTER_ENGAGE, FOOTER_LEGAL, FOOTER_NAV, FOOTER_ROLES } from "../data/reference";
import css from "../chrome.module.css";

/**
 * AQIP's own footer, in place of the site's: its identity, where to go on this
 * page, the ecosystem, how to get in touch, who does what, and the site-wide
 * links that still apply. Its in-page links are inside the page root, so they
 * open a collapsed chapter before scrolling to it like any other.
 */
export default function AqipFooter() {
  return (
    <footer className={css.footer}>
      <div className={css.footerInner}>
        <div className={css.footerBrand}>
          <p className={css.footerMark}>{AQIP.short}</p>
          <p className={css.footerName}>{AQIP.name}</p>
          <p className={css.footerTagline}>{AQIP.tagline}</p>
          <p className={css.footerPhilosophy}>{AQIP.philosophy.join(" ")}</p>
        </div>

        <nav className={css.footerNav} aria-label="AQIP footer">
          {FOOTER_NAV.map((column) => (
            <div key={column.id} className={css.footerColumn}>
              <p id={`aqip-footer-${column.id}`} className={css.footerTitle}>
                {column.title}
              </p>
              <ul aria-labelledby={`aqip-footer-${column.id}`}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={css.footerLink} data-track-event={LINK_EVENTS.cta} data-track-cta={`footer-${link.href.slice(1)}`}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className={css.footerColumn}>
            <p id="aqip-footer-ecosystem" className={css.footerTitle}>
              Ecosystem
            </p>
            <ul aria-labelledby="aqip-footer-ecosystem">
              {ECOSYSTEM.map((entity) => {
                const tracking = { "data-track-event": LINK_EVENTS.ecosystem, "data-track-destination": entity.id, "data-track-placement": "footer" };
                return (
                  <li key={entity.id}>
                    {entity.external ? (
                      <a href={entity.href} target="_blank" rel="noopener noreferrer" className={css.footerLink} {...tracking}>
                        {entity.brand}
                        <span className={css.srOnly}> (opens in a new tab)</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </a>
                    ) : (
                      <Link href={entity.href} className={css.footerLink} {...tracking}>
                        {entity.brand}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={css.footerColumn}>
            <p id="aqip-footer-engage" className={css.footerTitle}>
              Engage
            </p>
            <ul aria-labelledby="aqip-footer-engage">
              {FOOTER_ENGAGE.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={css.footerLink} data-track-event={LINK_EVENTS.cta} data-track-cta={item.id}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Four roles and a credit. Separate names, never one legal entity. */}
        <dl className={css.footerRoles}>
          {FOOTER_ROLES.map((item) => (
            <div key={item.entity.id}>
              <dt>{item.role}</dt>
              <dd>{item.entity.name}</dd>
            </div>
          ))}
          <div>
            <dt>Designed by</dt>
            <dd>
              <Link href={FOOTER_DESIGNED_BY.href} className={css.footerLink} data-track-event={LINK_EVENTS.profile} data-track-placement="footer">
                {FOOTER_DESIGNED_BY.name}
              </Link>
              <span>{FOOTER_DESIGNED_BY.brand}</span>
            </dd>
          </div>
        </dl>

        <div className={css.footerBottom}>
          <ul className={css.footerLegal} aria-label="Site links">
            {FOOTER_LEGAL.map((link) => (
              <li key={link.href}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={css.footerLink}>
                    {link.label}
                    <span className={css.srOnly}> (opens in a new tab)</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                ) : (
                  <Link href={link.href} className={css.footerLink}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <address className={css.footerCompany}>
            <span>{FOOTER_COMPANY.name}</span>
            <span>{FOOTER_COMPANY.email}</span>
            <span>{FOOTER_COMPANY.telephone}</span>
            <span>{FOOTER_COMPANY.location}</span>
          </address>
          <p className={css.footerCopy}>
            {`© ${new Date().getFullYear()} iTelematics®. All rights reserved. AQIP is an early-stage initiative; this page describes a strategy, not a released product.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
