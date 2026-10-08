"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties } from "react";
import { CalendarDays, Maximize2 } from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";
import styles from "./FeaturedGallerySection.module.css";

export type FeaturedPhoto = {
  src: string;
  label: string;
  /** Pixel size of the file, used to reserve the right shape before it loads. */
  width: number;
  height: number;
  /** Shown as a large tile. */
  featured?: boolean;
};

export type FeaturedGallery = {
  sectionName: string;
  layout: string;
  /** ISO date, e.g. "2026-10-07". */
  date: string;
  description: string;
  items: FeaturedPhoto[];
};

/** A section of workshop-gallery.json opts into this layout with `"layout": "featured"`. */
export function isFeaturedGallery(section: { sectionName: string; layout?: string }): section is FeaturedGallery {
  return section.layout === "featured";
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "2026-10-07" -> "07 OCT 2026". Built by hand so the server and the browser always agree. */
function formatEventDate(iso: string) {
  const [year, month, day] = iso.split("-");
  const name = MONTHS[Number(month) - 1];
  return name && day && year ? `${day} ${name} ${year}` : iso;
}

type TileKind = "feature" | "tall" | "standard";

function tileKind(photo: FeaturedPhoto): TileKind {
  if (photo.featured) return "feature";
  return photo.height > photo.width ? "tall" : "standard";
}

// Drawn width of each kind of tile at the stylesheet's breakpoints (four columns
// from 900px, two from 560px, one below; the page container is 1200px wide with
// 24px gutters). A portrait photo covering a two-row tile is drawn a little
// wider than its column.
const SIZES: Record<TileKind, string> = {
  feature: "(min-width: 1200px) 568px, (min-width: 900px) calc(50vw - 32px), calc(100vw - 48px)",
  tall: "(min-width: 1200px) 323px, (min-width: 900px) calc(28vw - 15px), (min-width: 560px) calc(56vw - 24px), calc(100vw - 48px)",
  standard: "(min-width: 1200px) 276px, (min-width: 900px) calc(25vw - 24px), (min-width: 560px) calc(50vw - 30px), calc(100vw - 48px)",
};

/** Event gallery: a heading block, then a featured-photo mosaic that opens a full-screen viewer. */
export default function FeaturedGallerySection({ gallery }: { gallery: FeaturedGallery }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const headingId = useId();
  const photos = gallery.items;
  const eventDate = formatEventDate(gallery.date);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {gallery.sectionName}
        </h2>
        <p className={styles.date}>
          <CalendarDays size={15} aria-hidden="true" />
          <time dateTime={gallery.date}>{eventDate}</time>
        </p>
        <p className={styles.description}>{gallery.description}</p>
      </header>

      <div className={styles.gallery}>
        <ul className={styles.grid} role="list">
          {photos.map((photo, index) => {
            const kind = tileKind(photo);
            return (
              <li
                key={photo.src}
                className={kind === "standard" ? styles.tile : `${styles.tile} ${styles[kind]}`}
                style={{ "--ratio": `${photo.width} / ${photo.height}` } as CSSProperties}
              >
                <button
                  type="button"
                  className={styles.photo}
                  onClick={(e) => {
                    // Safari does not focus a button on click; the viewer hands
                    // focus back to whichever element had it when it opened.
                    e.currentTarget.focus();
                    setOpenIndex(index);
                  }}
                  aria-label={photo.label}
                  aria-haspopup="dialog"
                  data-track-event="gallery_photo_click"
                  data-track-label={photo.label}
                >
                  <Image src={photo.src} alt={photo.label} fill sizes={SIZES[kind]} className={styles.image} />
                  <span className={styles.zoom} aria-hidden="true">
                    <Maximize2 size={16} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {openIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          title={gallery.sectionName}
          subtitle={`${eventDate} · ${gallery.description}`}
        />
      )}
    </section>
  );
}
