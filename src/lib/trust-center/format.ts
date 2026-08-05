export function formatDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function isStale(retrievedAt: string | undefined, staleAfterDays: number | undefined): boolean {
  if (!retrievedAt || !staleAfterDays) return false;
  const retrieved = new Date(retrievedAt).getTime();
  if (Number.isNaN(retrieved)) return false;
  const ageDays = (Date.now() - retrieved) / (1000 * 60 * 60 * 24);
  return ageDays > staleAfterDays;
}

/** Accessible rating text, e.g. "4.5 out of 5" — never rely on stars alone. */
export function ratingText(rating: number | undefined, scale: number = 5): string | null {
  if (rating === undefined || rating === null) return null;
  return `${rating} out of ${scale}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeNoCookieEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}
