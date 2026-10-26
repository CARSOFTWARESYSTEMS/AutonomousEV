// The platform's footer, on every page of the framework.
import Link from "next/link";
import { LINK_EVENTS } from "../analytics";
import { CASE_STUDY, FRAMEWORK, INTERNSHIP, ROUTES } from "../data/framework";
import { SOURCES } from "../data/market";
import css from "../site.module.css";

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
          <p className={css.footerHead}>Framework</p>
          <ul className={css.footerList}>
            <li>
              <Link href={ROUTES.overview}>Overview</Link>
            </li>
            <li>
              <Link href={ROUTES.today}>Today</Link>
            </li>
            <li>
              <Link href={ROUTES.marketing}>Marketing · Weeks 1–4</Link>
            </li>
            <li>
              <Link href={ROUTES.sales}>Sales · Weeks 5–8</Link>
            </li>
            <li>
              <Link href={ROUTES.execution}>Execution · Weeks 9–12</Link>
            </li>
            <li>
              <Link href={ROUTES.caseStudy}>Case Study</Link>
            </li>
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
      <p className={css.footerFine}>Last reviewed {FRAMEWORK.reviewedLabel}. Synthetic examples are fictional and always labelled. Estimates are not guaranteed outcomes.</p>
    </footer>
  );
}
