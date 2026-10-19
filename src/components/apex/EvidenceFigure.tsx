import type { CSSProperties, ReactNode } from "react";
import type { ApexImage } from "@/data/apex/images";
import { ApexPicture } from "./ApexPicture";
import styles from "./apex.module.css";

/** A photograph presented as evidence: framed, numbered and captioned with its audited caption. */
export function EvidenceFigure({
  image,
  sizes,
  aspect,
  label,
  caption,
  priority,
  children,
  className,
}: {
  image: ApexImage;
  sizes: string;
  /** CSS aspect-ratio for a crop, e.g. "4 / 5". Omit to keep the photo's own ratio. */
  aspect?: string;
  label?: string;
  caption?: ReactNode;
  priority?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const mediaStyle: CSSProperties | undefined = aspect ? { aspectRatio: aspect } : undefined;
  return (
    <figure className={`${styles.figure} ${className ?? ""}`}>
      <div className={styles.frame}>
        <div className={styles.figureMedia} style={mediaStyle}>
          <ApexPicture image={image} sizes={sizes} cover={Boolean(aspect)} priority={priority} />
          {children}
        </div>
      </div>
      <figcaption className={styles.figcaption}>
        <span className={styles.figLabel}>{label ?? `Fig. ${image.id}`}</span>
        <span>{caption ?? image.publicCaption}</span>
      </figcaption>
    </figure>
  );
}
