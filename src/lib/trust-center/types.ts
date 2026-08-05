/**
 * Shared data model for the Trust Center feature.
 * See docs/trust-center.md for the content-authoring guide.
 */

export type TrustSource =
  | "google"
  | "topmate"
  | "linkedin"
  | "glassdoor"
  | "ev-society"
  | "youtube"
  | "manual"
  | "case-study"
  | "award"
  | "partner";

export type VerificationStatus =
  | "verified"
  | "externally-published"
  | "manually-curated"
  | "pending-verification"
  | "placeholder";

export type TrustContentType =
  | "review"
  | "social-post"
  | "video"
  | "candidate-profile"
  | "case-study"
  | "testimonial"
  | "award"
  | "partner"
  | "faq";

export interface TrustAuthor {
  name?: string;
  role?: string;
  organisation?: string;
  image?: string | null;
  isAnonymous?: boolean;
}

export interface TrustMedia {
  type: "image" | "video" | "iframe";
  src?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export interface TrustSearchMeta {
  indexable: boolean;
  searchableText?: string;
  sourceCitation?: string;
}

export interface TrustContentItem {
  id: string;
  type: TrustContentType;

  title: string;
  summary?: string;
  body?: string;
  approvedExcerpt?: string;

  source: TrustSource;
  sourceLabel: string;
  sourceUrl?: string;
  embedUrl?: string;

  author?: TrustAuthor;

  rating?: number;
  ratingScale?: number;
  publishedAt?: string;
  retrievedAt?: string;

  tags: string[];
  audiences: string[];
  products: string[];
  domains: string[];

  verificationStatus: VerificationStatus;
  consentToRepublish?: boolean;
  featured?: boolean;
  enabled: boolean;

  media?: TrustMedia;

  search?: TrustSearchMeta;

  /** category tag used by candidate/community cards, e.g. "Battery Safety Systems" */
  project?: string;

  /** YouTube video id, required for type "video" items. */
  videoId?: string;
  /** approved excerpt from a video transcript, if transcribed. */
  transcriptPath?: string;
  duration?: string;
}

export interface ReviewSummary {
  source: TrustSource;
  sourceLabel: string;
  sourceUrl: string;
  rating?: number;
  ratingScale?: number;
  reviewCount?: number;
  retrievedAt: string;
  staleAfterDays?: number;
  summary?: string;
}

export interface ReviewQuery {
  limit?: number;
}

export interface ReviewProvider {
  getSummary(): Promise<ReviewSummary | null>;
  getReviews(options?: ReviewQuery): Promise<TrustContentItem[]>;
}

export interface TrustSearchQuery {
  query: string;
  source?: TrustSource;
  audience?: string;
  topic?: string;
  product?: string;
  type?: TrustContentType;
  limit?: number;
}

export interface TrustSearchResult {
  item: TrustContentItem;
  score: number;
  matchedFields: string[];
}

export interface TrustContentRepository {
  getAll(): Promise<TrustContentItem[]>;
  getById(id: string): Promise<TrustContentItem | null>;
  search(query: TrustSearchQuery): Promise<TrustSearchResult[]>;
}

export interface GroundedTrustAnswerCitation {
  contentId: string;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface GroundedTrustAnswer {
  answer: string;
  confidence: "high" | "medium" | "low";
  citations: GroundedTrustAnswerCitation[];
  insufficientEvidence: boolean;
}

export interface TrustAnswerEngine {
  answer(
    question: string,
    evidence: TrustSearchResult[]
  ): Promise<GroundedTrustAnswer>;
}

export interface TrustHeroAction {
  label: string;
  target: string;
}

export interface TrustHeroConfig {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: TrustHeroAction;
  secondaryAction: TrustHeroAction;
  sourceChips?: { label: string; source: TrustSource }[];
}

export interface TrustSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  noindex: boolean;
}

export interface TrustSettingsConfig {
  defaultMobileEmbedMode: "preview" | "auto";
  lazyLoadEmbeds: boolean;
  externalContentConsent: boolean;
  showLastUpdated: boolean;
  showVerificationBadges: boolean;
  hideEmptySections: boolean;
}

export interface TrustSourceMeta {
  enabled: boolean;
  displayMode?: "placeholder" | "hidden" | "content";
  heading: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  badgeLabel: string;
  staleAfterDays?: number;
  lastUpdated?: string;
  /** Manually verified aggregate figures. Omit any field that isn't backed
   * by real, attributable data — never render an invented number. */
  summary?: {
    rating?: number;
    ratingScale?: number;
    reviewCount?: number;
    retrievedAt?: string;
    note?: string;
  };
}

export interface TrustCenterConfig {
  version: string;
  enabled: boolean;
  route: string;
  seo: TrustSeoConfig;
  hero: TrustHeroConfig;
  settings: TrustSettingsConfig;
  sources: Record<
    "google" | "topmate" | "linkedin" | "glassdoor" | "evSociety" | "youtube",
    TrustSourceMeta
  >;
  filters: { id: string; label: string; sources: TrustSource[] }[];
  lastUpdated: string;
}
