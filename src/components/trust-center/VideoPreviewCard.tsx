"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import styles from "./VideoPreviewCard.module.css";
import { youtubeNoCookieEmbedUrl, youtubeThumbnailUrl } from "@/lib/trust-center/format";
import { trackEvent } from "@/utils/analytics";
import type { TrustContentItem } from "@/lib/trust-center/types";

export default function VideoPreviewCard({ item }: { item: TrustContentItem & { videoId: string } }) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = item.media?.thumbnail || youtubeThumbnailUrl(item.videoId);

  const handlePlay = () => {
    setPlaying(true);
    trackEvent("youtube_video_loaded", { videoId: item.videoId, title: item.title });
  };

  return (
    <article className={styles.card}>
      <div className={styles.frame}>
        {playing ? (
          <iframe
            className={styles.iframe}
            src={youtubeNoCookieEmbedUrl(item.videoId)}
            title={item.title}
            loading="lazy"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.thumbButton}
            style={{ backgroundImage: `url(${thumbnail})` }}
            onClick={handlePlay}
            aria-label={`Play video: ${item.title}`}
          >
            <span className={styles.playIcon} aria-hidden="true">
              <Play size={22} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className={styles.body}>
        <h4 className={styles.title}>{item.title}</h4>
        {item.summary && <p className={styles.description}>{item.summary}</p>}
      </div>
    </article>
  );
}
