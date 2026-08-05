import { ExternalLink } from "lucide-react";
import cardStyles from "./Cards.module.css";
import shared from "./shared.module.css";
import EmptySectionPlaceholder from "./EmptySectionPlaceholder";
import VideoPreviewCard from "./VideoPreviewCard";
import type { TrustContentItem, TrustSourceMeta } from "@/lib/trust-center/types";

interface YouTubeGalleryProps {
  meta: TrustSourceMeta;
  videos: TrustContentItem[];
}

export default function YouTubeGallery({ meta, videos }: YouTubeGalleryProps) {
  const playable = videos.filter(
    (v): v is TrustContentItem & { videoId: string } => Boolean(v.videoId) && v.enabled
  );

  return (
    <div>
      <div className={cardStyles.card} style={{ marginBottom: 32 }}>
        <div className={cardStyles.cardHeader}>
          <h3 className={cardStyles.cardTitle}>iTelematics on YouTube</h3>
        </div>
        <div className={cardStyles.cardFooter}>
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-secondary ${shared.externalLinkBtn}`}
            data-track-event="trust_external_link_clicked"
            data-track-source="youtube"
          >
            Visit YouTube Channel
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      {playable.length === 0 ? (
        <EmptySectionPlaceholder message="Engineering videos and technical sessions will appear here." />
      ) : (
        <div className={cardStyles.cardGrid}>
          {playable.map((video) => (
            <VideoPreviewCard key={video.id} item={video} />
          ))}
        </div>
      )}
    </div>
  );
}
