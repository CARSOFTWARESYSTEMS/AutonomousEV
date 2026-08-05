"use client";

import { useEffect, useMemo, useState } from "react";
import configRaw from "@/data/trust-center/config.json";
import { getAllTrustContentItems } from "@/lib/trust-center/repository";
import TrustHero from "./TrustHero";
import TrustSourceNav from "./TrustSourceNav";
import TrustSection from "./TrustSection";
import ExternalSourceNotice from "./ExternalSourceNotice";
import LastUpdated from "./LastUpdated";
import ReviewSummaryCard from "./ReviewSummaryCard";
import ReviewCard from "./ReviewCard";
import TopmateFeedbackCard from "./TopmateFeedbackCard";
import LinkedInPostGrid from "./LinkedInPostGrid";
import WorkplaceReviewSummary from "./WorkplaceReviewSummary";
import CommunityImpactGrid from "./CommunityImpactGrid";
import YouTubeGallery from "./YouTubeGallery";
import SuccessStoryCard from "./SuccessStoryCard";
import AwardCard from "./AwardCard";
import PartnerCard from "./PartnerCard";
import TrustSearch from "./TrustSearch";
import TrustFAQ from "./TrustFAQ";
import cardStyles from "./Cards.module.css";
import styles from "./TrustCenterContent.module.css";
import { trackEvent } from "@/utils/analytics";
import type { TrustCenterConfig, TrustSource } from "@/lib/trust-center/types";

const config = configRaw as unknown as TrustCenterConfig;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

export default function TrustCenterContent() {
  const items = useMemo(() => getAllTrustContentItems(), []);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    trackEvent("trust_center_view");
    const params = new URLSearchParams(window.location.search);
    const sourceParam = params.get("source");
    if (!sourceParam) return;
    // Deferred: lets the initial (unfiltered) paint commit before the
    // URL-derived tab highlight and scroll run, avoiding a same-tick
    // cascading re-render straight out of the mount effect.
    const id = window.requestAnimationFrame(() => {
      setActiveFilter(sourceParam);
      scrollToSection(`trust-source-${sourceParam}`);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const handleFilterSelect = (id: string) => {
    setActiveFilter(id);
    scrollToSection(`trust-source-${id}`);
    const params = new URLSearchParams(window.location.search);
    if (id === "all") params.delete("source");
    else params.set("source", id);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  const handleHeroChip = (source: TrustSource) => handleFilterSelect(source);

  const byType = (type: string) => items.filter((i) => i.type === type && i.enabled);
  const bySource = (source: TrustSource) => items.filter((i) => i.source === source && i.enabled);

  const featured = items.filter((i) => i.featured && i.enabled);
  const googleReviews = bySource("google");
  const topmateReviews = bySource("topmate");
  const linkedinPosts = bySource("linkedin");
  const evSocietyItems = bySource("ev-society");
  const youtubeVideos = bySource("youtube");
  const successStories = byType("case-study");
  const testimonials = byType("testimonial");
  const awards = byType("award");
  const partners = byType("partner");
  const faqs = byType("faq");

  const { settings, sources, hero, filters } = config;

  return (
    <>
      <TrustHero hero={hero} onSelectSourceChip={handleHeroChip} />

      <TrustSourceNav
        filters={filters.map((f) => ({ id: f.id, label: f.label }))}
        activeId={activeFilter}
        onSelect={handleFilterSelect}
      />

      <div className={styles.disclaimerWrap}>
        <div className="container">
          <ExternalSourceNotice>
            Content on this page comes from multiple independent platforms. Each item is labelled with its
            source, verification status and, where available, the date it was last verified. Ratings from
            different platforms are never combined into a single score, and employer/workplace feedback
            (Glassdoor) is kept separate from customer or mentee feedback.
          </ExternalSourceNotice>
        </div>
      </div>

      <TrustSection
        id="trust-source-linkedin"
        heading={sources.linkedin.heading}
        description={sources.linkedin.description}
        badgeLabel={sources.linkedin.badgeLabel}
        isEmpty={linkedinPosts.length === 0}
        displayMode={sources.linkedin.displayMode ?? "content"}
        hideEmptySections={settings.hideEmptySections}
      >
        <LinkedInPostGrid
          items={linkedinPosts}
          mobileMode={settings.defaultMobileEmbedMode === "auto" ? "auto" : "preview"}
          requireConsent={settings.externalContentConsent}
        />
      </TrustSection>

      <TrustSection
        id="trust-source-google"
        heading={sources.google.heading}
        description={sources.google.description}
        badgeLabel={sources.google.badgeLabel}
        isEmpty={false}
        displayMode={sources.google.displayMode ?? "content"}
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={styles.narrowStack}>
          <ReviewSummaryCard meta={sources.google} ctaLabel="Read reviews on Google" />
          {googleReviews.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </div>
      </TrustSection>

      <TrustSection
        id="trust-source-topmate"
        heading={sources.topmate.heading}
        description={sources.topmate.description}
        badgeLabel={sources.topmate.badgeLabel}
        isEmpty={false}
        displayMode={sources.topmate.displayMode ?? "content"}
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={styles.narrowStack}>
          <TopmateFeedbackCard meta={sources.topmate} />
          {topmateReviews.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </div>
      </TrustSection>

      <TrustSection
        id="trust-source-glassdoor"
        heading={sources.glassdoor.heading}
        description={sources.glassdoor.description}
        badgeLabel={sources.glassdoor.badgeLabel}
        isEmpty={false}
        displayMode={sources.glassdoor.displayMode ?? "content"}
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={styles.narrowStack}>
          <WorkplaceReviewSummary meta={sources.glassdoor} />
        </div>
      </TrustSection>

      <TrustSection
        id="trust-source-ev-society"
        heading={sources.evSociety.heading}
        description={sources.evSociety.description}
        badgeLabel={sources.evSociety.badgeLabel}
        isEmpty={evSocietyItems.length === 0}
        displayMode={sources.evSociety.displayMode ?? "content"}
        hideEmptySections={settings.hideEmptySections}
      >
        <CommunityImpactGrid items={evSocietyItems} />
      </TrustSection>

      <TrustSection
        id="trust-source-youtube"
        heading={sources.youtube.heading}
        description={sources.youtube.description}
        badgeLabel={sources.youtube.badgeLabel}
        isEmpty={false}
        displayMode={sources.youtube.displayMode ?? "content"}
        hideEmptySections={settings.hideEmptySections}
      >
        <YouTubeGallery meta={sources.youtube} videos={youtubeVideos} />
      </TrustSection>

      <TrustSection
        id="trust-source-case-study"
        heading="Success Stories"
        description="Outcomes from engineers, interns and mentees who worked with EV.ENGINEER™."
        isEmpty={successStories.length === 0}
        displayMode="content"
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={cardStyles.cardGrid}>
          {successStories.map((item) => (
            <SuccessStoryCard key={item.id} item={item} />
          ))}
        </div>
      </TrustSection>

      <TrustSection
        id="trust-testimonials"
        heading="Customer & Partner Testimonials"
        description="Direct feedback from customers and partners who worked with EV.ENGINEER™."
        isEmpty={testimonials.length === 0}
        displayMode="content"
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={cardStyles.cardGrid}>
          {testimonials.map((item) => (
            <SuccessStoryCard key={item.id} item={item} />
          ))}
        </div>
      </TrustSection>

      <TrustSection
        id="trust-awards"
        heading="Awards & Recognition"
        description="Formal awards and recognition received by EV.ENGINEER™ and its team."
        isEmpty={awards.length === 0}
        displayMode="content"
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={cardStyles.cardGrid}>
          {awards.map((item) => (
            <AwardCard key={item.id} item={item} />
          ))}
        </div>
      </TrustSection>

      <TrustSection
        id="trust-partners"
        heading="Partnerships"
        description="Academic and industry partnerships connected to EV.ENGINEER™."
        isEmpty={partners.length === 0}
        displayMode="content"
        hideEmptySections={settings.hideEmptySections}
      >
        <div className={cardStyles.cardGrid}>
          {partners.map((item) => (
            <PartnerCard key={item.id} item={item} />
          ))}
        </div>
      </TrustSection>

      {featured.length > 0 && (
        <TrustSection
          id="trust-featured"
          heading="Featured Recognition"
          description="A snapshot of the most notable verified feedback and recognition across all sources."
          isEmpty={false}
          displayMode="content"
          hideEmptySections={settings.hideEmptySections}
        >
          <div className={styles.featuredStrip}>
            {featured.slice(0, 4).map((item) => (
              <SuccessStoryCard key={item.id} item={item} />
            ))}
          </div>
        </TrustSection>
      )}

      <TrustSection
        id="trust-search"
        heading="Ask the Trust Center"
        description="Search approved Trust Center content. This is a local keyword search over verified content only — it is not an AI-generated response, and it will say so when there isn't enough verified information to answer."
        isEmpty={false}
        displayMode="content"
        hideEmptySections={settings.hideEmptySections}
      >
        <TrustSearch items={items} />
      </TrustSection>

      <TrustSection
        id="trust-faq"
        heading="Frequently Asked Questions"
        isEmpty={faqs.length === 0}
        displayMode="content"
        hideEmptySections={settings.hideEmptySections}
      >
        <TrustFAQ items={faqs} />
      </TrustSection>

      {settings.showLastUpdated && (
        <div className="container">
          <div className={styles.footerMeta}>
            <LastUpdated date={config.lastUpdated} />
          </div>
        </div>
      )}
    </>
  );
}
