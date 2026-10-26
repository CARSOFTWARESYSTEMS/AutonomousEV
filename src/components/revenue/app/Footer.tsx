// The platform's footer, on every page of the framework.
import Link from "next/link";
import { LINK_EVENTS } from "../analytics";
import { CASE_STUDY, FRAMEWORK, INTERNSHIP, ROUTES } from "../data/framework";
import { SOURCES } from "../data/market";
import css from "../site.module.css";

const STEP_LINKS = [
  { label: "Overview", href: ROUTES.overview },
  { label: "Today", href: ROUTES.today },
  { label: "Customer · Steps 1–2", href: ROUTES.customer },
  { label: "Marketing · Steps 3–4", href: ROUTES.marketing },
  { label: "Sales · Steps 5–7", href: ROUTES.sales },
  { label: "Pilot · Step 8", href: ROUTES.pilot },
  { label: "Proposal & Close · Step 9", href: ROUTES.close },
  { label: "Revenue & Profit · Step 10", href: ROUTES.revenue },
  { label: "Case Study", href: ROUTES.caseStudy },
];

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.footerInner}>
        <div>
          <p className={css.footerBrand}>{FRAMEWORK.name}</p>
          <p className={css.footerText}>{FRAMEWORK.descriptor}</p>
          <p className={css.footerText}>By EV.ENGINEER™, operated by iTelematics Software Private Limited. Not affiliated with SAE International, any OEM or any government agency.</p>
        </div>
        <div>
          <p className={css.footerHead}>The 10 steps</p>
          <ul className={css.footerList}>
            {STEP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={css.footerHead}>More</p>
          <ul className={css.footerList}>
            <li>
              <a href={CASE_STUDY.productUrl} target="_blank" rel="noopener noreferrer" data-track-event={LINK_EVENTS.product} data-track-source="footer">
                FAI Engineer<span className={css.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <Link href={CASE_STUDY.contextUrl}>AQIP — Aerospace Quality Intelligence Platform</Link>
            </li>
            <li>
              <Link href={ROUTES.accounts}>Your accounts</Link>
            </li>
            <li>
              <Link href={ROUTES.pipeline}>Your pipeline</Link>
            </li>
            <li>
              <Link href="/internships">All internships</Link>
            </li>
            <li>
              <Link href={INTERNSHIP.apply.url} data-track-event={LINK_EVENTS.apply} data-track-source="footer">
                {INTERNSHIP.apply.label}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className={css.footerHead}>Sources</p>
          <ul className={css.footerList}>
            {Object.values(SOURCES).map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label}
                  <span className={css.srOnly}> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className={css.footerFine}>Last reviewed {FRAMEWORK.reviewedLabel}. Customer problems are hypotheses until customers confirm them. Estimates are not guaranteed outcomes.</p>
    </footer>
  );
}
