import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SpaceHeader from "../../components/SpaceHeader";
import SpaceFooter from "../../components/SpaceFooter";
import { manrope, inter } from "../../fonts";
import spaceTheme from "../../spaceTheme.module.css";
import space from "../../space.module.css";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import styles from "../academy.module.css";

export interface Crumb {
  label: string;
  href?: string;
}

/** Header, breadcrumb, footer and theme shared by every Academy page. */
export default function AcademyFrame({ crumbs, graph, children }: { crumbs: Crumb[]; graph: object; children: React.ReactNode }) {
  return (
    <div className={`${spaceTheme.theme} ${styles.academy} ${manrope.variable} ${inter.variable}`}>
      <JsonLd data={graph} />
      <a href="#main-content" className={space.skipLink}>
        Skip to content
      </a>
      <SpaceHeader basePath="/space" />
      <main id="main-content" className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight size={13} aria-hidden />}
              </li>
            ))}
          </ol>
        </nav>
        {children}
      </main>
      <SpaceFooter basePath="/space" wide />
    </div>
  );
}
