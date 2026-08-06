import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RELATED_ARTICLES } from "@/lib/battery-cybersecurity/data/relatedArticles";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function RelatedArticlesSection() {
  return (
    <section className="section bg-surface" id="related-articles" aria-labelledby="related-articles-heading">
      <div className="container">
        <SectionHeader label="Related Reading" title="Related EV.ENGINEER™ Pages" headingId="related-articles-heading">
          <p>Where this page connects to the rest of the EV.ENGINEER™ site.</p>
        </SectionHeader>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {RELATED_ARTICLES.map((article) => (
            <Link
              key={article.id}
              href={article.href}
              className={pageStyles.navyPanel}
              style={{ padding: "20px", display: "block", textDecoration: "none" }}
              data-track-event="bcs_related_article_click"
              data-track-article={article.id}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{article.title}</h3>
                <ArrowRight size={16} style={{ color: "var(--bcs-cyan)", flexShrink: 0 }} aria-hidden="true" />
              </div>
              <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{article.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
