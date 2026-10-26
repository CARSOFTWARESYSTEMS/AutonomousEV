import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { CATEGORY_HOME, routeConfigFor } from "@/config/premiumAuthRoutes";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import PremiumLoginCard from "./PremiumLoginCard";
import styles from "./auth.module.css";

// Rendered by a page on the server and handed to <PremiumContent> as its
// preview, so crawlers and signed-out visitors get the same indexable
// overview: the page's own title, description and structured data — the text
// search engines already show for it — plus the topics that structured data
// lists, beside the login card.

export interface PreviewCatalogue {
  title: string;
  items: ReadonlyArray<{ name: string; description: string; href: string }>;
}

/** The topics a page's JSON-LD says it teaches (first node that lists any). */
export function topicsFrom(structuredData: unknown): string[] {
  const root = structuredData as { "@graph"?: unknown } | unknown[] | null;
  const nodes: unknown[] = Array.isArray(root) ? root : Array.isArray(root?.["@graph"]) ? root["@graph"] : [root];
  for (const node of nodes) {
    const teaches = (node as { teaches?: unknown } | null)?.teaches;
    if (!Array.isArray(teaches)) continue;
    const topics = teaches
      .map((t) => (typeof t === "string" ? t : typeof (t as { name?: unknown })?.name === "string" ? (t as { name: string }).name : ""))
      .filter(Boolean);
    if (topics.length) return topics;
  }
  return [];
}

const MAX_TOPICS = 8;

export default function PremiumPreview({
  path,
  title,
  description,
  structuredData,
  topics,
  catalogue,
  header,
}: {
  /** The page's route in src/config/premiumAuthRoutes.ts. */
  path: string;
  /** The page's SEO title; shown up to its first " | ". */
  title: string;
  description: string;
  /** Rendered as JSON-LD, as the full page does, and the default source of `topics`. */
  structuredData?: object;
  topics?: readonly string[];
  catalogue?: PreviewCatalogue;
  /** The section's own header, where the full page has one (keeps its navigation and Login). */
  header?: ReactNode;
}) {
  const route = routeConfigFor(path);
  if (!route) throw new Error(`PremiumPreview: ${path} is not in src/config/premiumAuthRoutes.ts`);
  const home = CATEGORY_HOME[route.category];
  const shown = (topics ?? topicsFrom(structuredData)).slice(0, MAX_TOPICS);
  const heading = title.split(" | ")[0];
  const Landmark = home.family === "space" ? "main" : "section";

  return (
    <div className={styles.preview} data-family={home.family} data-layout={home.family === "space" ? "page" : "section"} data-auth-prompt="off">
      {header}
      {structuredData && <JsonLd data={structuredData} />}
      <Landmark className={styles.previewMain} aria-labelledby="premium-preview-title" id={home.family === "space" ? "main-content" : undefined}>
        <div className={styles.previewIntro}>
          <nav aria-label="Breadcrumb" className={styles.previewCrumbs}>
            <Link href={home.href}>{home.label}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{route.label}</span>
          </nav>
          <h1 id="premium-preview-title" className={styles.previewTitle}>{heading}</h1>
          <p className={styles.previewLead}>{description}</p>
        </div>

        <div className={styles.previewCard}>
          <PremiumLoginCard route={route} heading="h2" />
        </div>

        {shown.length > 0 && (
          <section className={styles.previewSection} aria-labelledby="premium-preview-topics">
            <h2 id="premium-preview-topics" className={styles.previewSectionTitle}>What you’ll explore</h2>
            <ul className={styles.previewTopics}>
              {shown.map((topic) => (
                <li key={topic}>
                  <Check size={15} aria-hidden="true" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {catalogue && (
          <section className={styles.previewSection} aria-labelledby="premium-preview-catalogue">
            <h2 id="premium-preview-catalogue" className={styles.previewSectionTitle}>{catalogue.title}</h2>
            <ul className={styles.previewCatalogue}>
              {catalogue.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.previewItemName}>{item.name}</Link>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Landmark>
    </div>
  );
}
